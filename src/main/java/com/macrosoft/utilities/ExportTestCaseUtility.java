package com.macrosoft.utilities;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.Requirement;
import com.macrosoft.model.Script;
import com.macrosoft.service.ExportExecutionParsedResult;
import com.macrosoft.service.ExportScriptData;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTbl;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblWidth;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth;

import java.io.FileOutputStream;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public class ExportTestCaseUtility {

	private static final ILogger logger = LoggerFactory.Create(ExportTestCaseUtility.class.getName());
	
	public static boolean exportScript(String outputPath, ExportScriptData scriptData) {
		List<ExportScriptData> scriptsData = new ArrayList<ExportScriptData>();
		scriptsData.add(scriptData);
		return exportScript(outputPath, scriptsData);
	}
	
	public static boolean exportScript(String outputPath, List<ExportScriptData> scriptsData) {

		XWPFDocument document = new XWPFDocument();

		try {

			for (int p = 0; p < scriptsData.size(); p++) {
				try {

					Script script = scriptsData.get(p).getScript();
					List<ExportExecutionParsedResult> parsedCommands = scriptsData.get(p).getParsedCommands();
					List<Requirement> refRequirements = scriptsData.get(p).getRefRequirements();

					logger.info(String.format("export script %s start.", script.getName()));

					String testCaseName = script.getName();
					//todo CustomizedId字段转移到testcase表中
					//String customizedId = script.getCustomizedId();
					String description = script.getDescription();

					int tesstcaseStepLength = parsedCommands.size();

					int stepsLineIndex = 5;

					XWPFParagraph paragraph = document.createParagraph();
					paragraph.setAlignment(ParagraphAlignment.CENTER);
					paragraph.setSpacingAfter(0);
					XWPFRun run = paragraph.createRun();
					run.setText(String.format("测试用例-%s", testCaseName));
					run.setTextPosition(100);

					// create table
					XWPFTable table = document.createTable(5 + tesstcaseStepLength, 4);

					CTTbl tbl = table.getCTTbl();
					CTTblPr pr = tbl.getTblPr();
					CTTblWidth tblWidth = pr.getTblW();
					tblWidth.setW(BigInteger.valueOf(5000));
					tblWidth.setType(STTblWidth.PCT);
					pr.setTblW(tblWidth);

					/*
					 * for (int row = 0; row < 3; row++) { for (int col = 0; col < 5; col++) {
					 * table.getRow(row).getCell(col).setText("row " + row + ", col " + col); } }
					 */
					// using the merge methods
					CreateWordTableMerge.mergeCellHorizontally(table, 1, 1, 3);
					CreateWordTableMerge.mergeCellHorizontally(table, 2, 1, 3);
//					CreateWordTableMerge.mergeCellHorizontally(table, 3, 1, 3);
//					CreateWordTableMerge.mergeCellHorizontally(table, 4, 1, 3);
//					CreateWordTableMerge.mergeCellHorizontally(table, 5, 1, 3);

					CreateWordTableMerge.mergeCellHorizontally(table, 3, 0, 3);

					table.getRow(0).getCell(0).setText("测试用例名称");
					table.getRow(0).getCell(1).setText(testCaseName);

					table.getRow(0).getCell(2).setText("标识");
					//table.getRow(0).getCell(3).setText(customizedId);

					table.getRow(1).getCell(0).setText("关联需求");

					String requirements = "";
					for (Requirement req : refRequirements) {
						requirements = requirements
								+ String.format("Req-%s %s; ", req.getCustomizedId(), req.getTitle());
					}
					table.getRow(1).getCell(1).setText(requirements);

					table.getRow(2).getCell(0).setText("测试用例描述");
					table.getRow(2).getCell(1).setText(description);
//
//					table.getRow(3).getCell(0).setText("用例初始化");
//					table.getRow(4).getCell(0).setText("前提和约束");
//					table.getRow(5).getCell(0).setText("测试用例类型");
					table.getRow(3).getCell(0).setText("测试步骤");
					table.getRow(3).getCell(0).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

					table.getRow(4).getCell(0).setText("序号");
					table.getRow(4).getCell(1).setText("步骤描述");
					table.getRow(4).getCell(2).setText("输入值");
					table.getRow(4).getCell(3).setText("预期值");

					for (int i = stepsLineIndex; i < stepsLineIndex + tesstcaseStepLength; i++) {
						int line = i - stepsLineIndex;
						table.getRow(i).getCell(0).setText(String.valueOf(line + 1));
						table.getRow(i).getCell(1).setText(parsedCommands.get(line).getParsedCommand());

						table.getRow(i).getCell(2).setText(parsedCommands.get(line).getInputKeyData());
						table.getRow(i).getCell(3).setText(parsedCommands.get(line).getExpectedKeyData());
					}
					/*
					 * table.getRow(endConditionIndex).getCell(0).setText("测试用例终止条件");
					 * table.getRow(endConditionIndex + 1).getCell(0).setText("测试结果评估标准");
					 * table.getRow(endConditionIndex + 2).getCell(0).setText("设计人员");
					 * table.getRow(endConditionIndex + 3).getCell(0).setText("用例设计审核");
					 * table.getRow(endConditionIndex + 4).getCell(0).setText("用例设计审核人");
					 */
					paragraph = document.createParagraph();

					logger.info(
							String.format("export script %s to word %s successfully.", script.getName(), outputPath));
				} catch (Exception ex) {
					logger.error(String.format("export script to word failed. execption: %s", ex));
					continue;
				}

			}

			FileOutputStream out = new FileOutputStream(outputPath);
			document.write(out);
			out.close();
		} catch (Exception ex) {
			logger.error(String.format("export script to word failed. execption: %s", ex));
			return false;
		}

		return true;
	}
}
