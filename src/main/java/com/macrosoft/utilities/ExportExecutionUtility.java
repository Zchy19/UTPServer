package com.macrosoft.utilities;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.service.*;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTbl;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblWidth;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth;

import java.io.FileOutputStream;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

class ExportExecutionScriptData
{
	public ExportExecutionScriptData()
	{
		Steps = new ArrayList<ExportExecutionStepData>();
	}
	
	public String CustomizedId;
	public String ScriptName;
	public String testObject;
	public String scriptStartTime;
	public String scriptEndTime;
	public boolean result;
	
	public List<ExportExecutionStepData> Steps;
}

class ExportExecutionStepData
{
	public String Description;
	public String Input;
	public String Output;
	public String Expected;
	public int Result;
	public String Comment;
	
}

public class ExportExecutionUtility {

	private static final ILogger logger = LoggerFactory.Create(ExportExecutionUtility.class.getName());

	
	public static boolean export(String outputPath, 
								ProjectService projectService,
								ScriptService scriptService,
								ScriptLinkService scriptLinkService,
								ExecutionStatus executionStatus, List<ExecutionResultInfo> executionResults) {
		try {

			// test set information
			String testsetName = executionStatus.getTestsetName();
			String tester = executionStatus.getExecutedByUserId();
			String testObject = executionStatus.getTestObject();
			String executionStartTime = executionStatus.getStartTime().toString();
			String executionEndTime = executionStatus.getEndTime().toString();
			
			long projectId = executionStatus.getProjectId();
			Project project = projectService.getProjectById(projectId);
			
			List<ScriptLink> scriptLinks = scriptLinkService.listScriptLinksByTestsetId(projectId, executionStatus.getTestsetId());
			
			int scriptTestSuccessCount = 0;
			int scriptTestFailCount = 0;
			
			
			List<ExportExecutionScriptData> scriptDatas = new ArrayList<ExportExecutionScriptData>();
			
			long curScriptId = 0;
			
			ExportExecutionScriptData scriptData = new ExportExecutionScriptData();
			
			for (ExecutionResultInfo executionResult : executionResults)
			{
				if (executionResult.getCommandType() == ExecutionResult.CommandType_TestcaseBegin)
				{
					scriptData = new ExportExecutionScriptData();
					scriptDatas.add(scriptData);
					
					if (curScriptId != executionResult.getScriptId())
					{
						curScriptId = executionResult.getScriptId();
						Script script = scriptService.getScriptById(projectId, curScriptId);
						scriptData.ScriptName = script.getName();
						scriptData.scriptStartTime = executionResult.getExecutionTime().toString();	
					}
				}
				if (executionResult.getCommandType() == ExecutionResult.CommandType_SubscriptEnd)
				{
					ExportExecutionStepData stepData = new ExportExecutionStepData();
					ExportExecutionParsedResult parsedResult = ExportExecutionResultParser.parseExecutionResult(executionResult.getAntbotName(), executionResult.getCommand());
					parsedResult.setResult(executionResult.getResult());
					stepData.Description = parsedResult.getParsedCommand();
					stepData.Expected = parsedResult.getExpectedKeyData();
					stepData.Input = parsedResult.getInputKeyData();
					stepData.Output = parsedResult.getOutputKeyData();
					//如果parsedResult.getParsedCommand()包含"调用子脚本"
					if (parsedResult.getParsedCommand().contains("调用子脚本"))
					{
						//parsedResult.getParsedCommand()进行切割,取出()中的内容
						String[] temp = parsedResult.getParsedCommand().split("\\(");
						String scriptParameter = temp[1].split("\\)")[0];
						//则对parsedResult.getParsedCommand()进行切割,取出[]中的内容
						temp = parsedResult.getParsedCommand().split("\\[");
						String scriptId = temp[1].split("]")[0];
						//根据scriptId获取scriptName
						Script script = scriptService.getScriptById(projectId, Long.parseLong(scriptId));
						//判断script是否存在
						if (script != null&&script.getType().equals("subscript")){
							String name = script.getName();
							//拼接
							if (scriptParameter.equals("%s2")){
								scriptParameter = " ";
							}
							stepData.Description = "调用子脚本[" + name + "],参数为:(" + scriptParameter+")";

						}else{
							//跳过此次循环
							continue;
						}
					}
					if (parsedResult.getWrongComment().isEmpty())
					{
						stepData.Comment = executionResult.getErrorMessage();
					}
					else
					{
						stepData.Comment = parsedResult.getWrongComment();
					}


					stepData.Result = executionResult.getResult();
					scriptData.Steps.add(stepData);

				}
				if (executionResult.getCommandType() == ExecutionResult.CommandType_Command)
				{
					ExportExecutionStepData stepData = new ExportExecutionStepData();
					ExportExecutionParsedResult parsedResult = ExportExecutionResultParser.parseExecutionResult(executionResult.getAntbotName(), executionResult.getCommand());
					parsedResult.setResult(executionResult.getResult());
					stepData.Description = parsedResult.getParsedCommand();
					stepData.Expected = parsedResult.getExpectedKeyData();
					stepData.Input = parsedResult.getInputKeyData();
					stepData.Output = parsedResult.getOutputKeyData();	
					
					
					if (parsedResult.getWrongComment().isEmpty())
					{
						stepData.Comment = executionResult.getErrorMessage();						
					}
					else
					{
						stepData.Comment = parsedResult.getWrongComment();		
					}
					
					
					stepData.Result = executionResult.getResult();
					scriptData.Steps.add(stepData);
					
				}
				
				if (executionResult.getCommandType() == ExecutionResult.CommandType_TestcaseEnd)
				{
					scriptData.scriptEndTime = executionResult.getExecutionTime().toString();
					scriptData.result = executionResult.getResult() == 1;
					
					if (scriptData.result)
					{
						scriptTestSuccessCount = scriptTestSuccessCount + 1;
					}
					else
					{
						scriptTestFailCount = scriptTestFailCount + 1;
					}
				}
			}
			
			XWPFDocument document = new XWPFDocument();

			XWPFParagraph paragraph = document.createParagraph();
			paragraph.setAlignment(ParagraphAlignment.CENTER);
			paragraph.setSpacingAfter(0);
			XWPFRun run = paragraph.createRun();
			run.setText(String.format("%s-项目测试报告", project.getName()));
			run.setTextPosition(100);

			WriteTestset(testsetName, tester, testObject, executionStartTime, executionEndTime,
					scriptLinks, scriptTestSuccessCount, scriptTestFailCount, document);

			
			for (ExportExecutionScriptData s : scriptDatas)
			{
				paragraph = document.createParagraph();
				
				XWPFTable table = document.createTable(6 + s.Steps.size(), 7);

				CTTbl tbl = table.getCTTbl();
				CTTblPr pr = tbl.getTblPr();
				CTTblWidth tblWidth = pr.getTblW();
				tblWidth.setW(BigInteger.valueOf(5000));
				tblWidth.setType(STTblWidth.PCT);
				pr.setTblW(tblWidth);

				
				/*
				 * for (int row = 0; row < 3; row++) { for (int col = 0; col < 5;
				 * col++) { table.getRow(row).getCell(col).setText("row " + row +
				 * ", col " + col); } }
				 */
				// using the merge methods
				CreateWordTableMerge.mergeCellHorizontally(table, 0, 0, 6);
				CreateWordTableMerge.mergeCellHorizontally(table, 1, 0, 6);
				CreateWordTableMerge.mergeCellHorizontally(table, 2, 0, 6);
				CreateWordTableMerge.mergeCellHorizontally(table, 3, 0, 6);


				CreateWordTableMerge.mergeCellHorizontally(table, 4, 0, 1);
				CreateWordTableMerge.mergeCellHorizontally(table, 4, 2, 6);
				
				
				table.getRow(0).getCell(0).setText("用例编号 - 用例名称");
				table.getRow(1).getCell(0).setText(String.format("%s - %s", s.CustomizedId, s.ScriptName));

				table.getRow(2).getCell(0).setText("开始时间 - 结束时间");
				table.getRow(3).getCell(0).setText(String.format("%s - %s", s.scriptStartTime, s.scriptEndTime));


				table.getRow(4).getCell(0).setText("执行结果");
				table.getRow(4).getCell(2).setText(s.result ? "成功": "失败");

				table.getRow(5).getCell(0).setText("序号");
				table.getRow(5).getCell(1).setText("步骤描述");
				table.getRow(5).getCell(2).setText("关键输入");
				table.getRow(5).getCell(3).setText("实际输出");
				table.getRow(5).getCell(4).setText("预期值");
				table.getRow(5).getCell(5).setText("结果");
				table.getRow(5).getCell(6).setText("结果备注");
				

				int fixedHeadRowCounter = 6;
				for (int i=0; i< s.Steps.size(); i++)
				{
					ExportExecutionStepData step = s.Steps.get(i);
					int rowIndex = i + fixedHeadRowCounter;
					
					table.getRow(rowIndex).getCell(0).setText(Integer.toString(i+1));
					table.getRow(rowIndex).getCell(1).setText(step.Description);
					table.getRow(rowIndex).getCell(2).setText(step.Input);
					table.getRow(rowIndex).getCell(3).setText(step.Output);
					table.getRow(rowIndex).getCell(4).setText(step.Expected);
					table.getRow(rowIndex).getCell(5).setText(step.Result == 1 ? "成功" : (step.Result == 2? "超时" : "失败"));
					table.getRow(rowIndex).getCell(6).setText(step.Comment);
				}
			}
			
			paragraph = document.createParagraph();

			FileOutputStream out = new FileOutputStream(outputPath);
			document.write(out);
			out.close();

			logger.info(String.format("ExportExecutionUtility export %s to word %s successfully.", executionStatus.getExecutionName(), outputPath));

		} catch (Exception ex) {
			logger.error(String.format("ExportExecutionUtility export %s to word %s failed. execption: %s", executionStatus.getExecutionName(), outputPath, ex));
			return false;
		}

		return true;
	}


	private static XWPFTable WriteTestset(String testsetName, String tester, String testObject,
			String executionStartTime, String executionEndTime, List<ScriptLink> scriptLinks,
			int scriptTestSuccessCount, int scriptTestFailCount, XWPFDocument document) {
		// create table
		XWPFTable table = document.createTable(7, 4);

		CTTbl tbl = table.getCTTbl();
		CTTblPr pr = tbl.getTblPr();
		CTTblWidth tblWidth = pr.getTblW();
		tblWidth.setW(BigInteger.valueOf(5000));
		tblWidth.setType(STTblWidth.PCT);
		pr.setTblW(tblWidth);

		
		/*
		 * for (int row = 0; row < 3; row++) { for (int col = 0; col < 5;
		 * col++) { table.getRow(row).getCell(col).setText("row " + row +
		 * ", col " + col); } }
		 */
		// using the merge methods
		CreateWordTableMerge.mergeCellHorizontally(table, 0, 0, 3);
		CreateWordTableMerge.mergeCellHorizontally(table, 4, 0, 3);

		
		table.getRow(0).getCell(0).setText("测试记录信息");
		
		table.getRow(1).getCell(0).setText("测试集");
		table.getRow(1).getCell(1).setText(testsetName);
		table.getRow(1).getCell(2).setText("测试人员");
		table.getRow(1).getCell(3).setText(tester);

		
		table.getRow(2).getCell(0).setText("被测对象");
		table.getRow(2).getCell(1).setText(testObject);
		table.getRow(2).getCell(2).setText("测试环境");
		//table.getRow(2).getCell(3).setText(testObject);

		table.getRow(3).getCell(0).setText("开始时间");
		table.getRow(3).getCell(1).setText(executionStartTime);
		table.getRow(3).getCell(2).setText("结束时间");
		table.getRow(3).getCell(3).setText(executionEndTime);

		
		
		table.getRow(4).getCell(0).setText("用例结果统计");
		
		table.getRow(5).getCell(0).setText("已执行用例数");
		table.getRow(5).getCell(1).setText(Integer.toString(scriptTestSuccessCount + scriptTestFailCount));
		table.getRow(5).getCell(2).setText("未执行用例数");
		table.getRow(5).getCell(3).setText(Integer.toString(scriptLinks.size() - scriptTestSuccessCount - scriptTestFailCount));

		table.getRow(6).getCell(0).setText("成功用例数");
		table.getRow(6).getCell(1).setText(Integer.toString(scriptTestSuccessCount));
		table.getRow(6).getCell(2).setText("失败用例数");
		table.getRow(6).getCell(3).setText(Integer.toString(scriptTestFailCount));
		return table;
	}
}
