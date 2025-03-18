package com.macrosoft.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.dto.ReportDownloadingInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.Script;
import com.macrosoft.model.TestsetExecutionTrigger;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.service.ExecutionResultService;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.utilities.StringUtility;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileOutputStream;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@Controller
public class TraceExecutionReportController {

	private static final Logger logger = LoggerFactory.getLogger(TraceExecutionReportController.class.getName());

	private ScriptService scriptService;
	private ExecutionStatusService executionStatusService;
	private ExecutionResultService executionResultService;

	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}
	
	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService executionStatusService) {
		this.executionStatusService = executionStatusService;
	}

	@Autowired(required = true)
	
	public void setExecutionResultService(ExecutionResultService executionResultService) {
		this.executionResultService = executionResultService;
	}

	@Autowired
	ServletContext context;


	@RequestMapping(value = "/api/trace/executionReport/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ReportDownloadingInfo> createExecutionReport(
													HttpServletRequest request, 
													HttpServletResponse response, 
													@PathVariable("executionId") String executionId) {
		
		try {

			//String fileName = writeReport("0", "e142f322-1a5a-0a74-aaec-9656fa831c38");
			
			String tenantId = TenantContext.getTenantId();
			String fileName = writeReport(tenantId, executionId);
			
			//ReportUtility.downloadReport(context, request, response, fileName);
			
			ReportDownloadingInfo info = new ReportDownloadingInfo();
			info.setFileName(fileName);
			info.setReportPath(ReportUtility.GetStaticReportPath(fileName));
			return new ApiResponse<ReportDownloadingInfo>(ApiResponse.Success, info);
			
		} catch (Exception ex) {
			logger.error("createExecutionReport has exception:" + ex.toString());
			return new ApiResponse<ReportDownloadingInfo>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * Generates an execution report for a given organization and execution ID.
	 *
	 * @param orgId the ID of the organization
	 * @param executionId the ID of the execution
	 * @return the name of the generated report file
	 */
	private String writeReport(String orgId, String executionId)
	{
		try
		{
			Workbook workbook = new XSSFWorkbook();

			/*
			if(fileName.endsWith("xlsx")){
				workbook = new XSSFWorkbook();
			}else if(fileName.endsWith("xls")){
				workbook = new HSSFWorkbook();
			}else{
				return;
				// throw new Exception("invalid file name, should be xls or xlsx");
			}
			*/
			
			TenantContext.setTenantId(orgId);
			
			ExecutionStatus executionStatus = executionStatusService.getExecutionStatusByExecutionId(executionId);
			
			List<ExecutionResultInfo> executionResults = executionResultService.listExecutionResultInfosAfterFromId(executionId, 0);
		
			String fileName = String.format("ExecutionReport_%s_%s.xlsx", executionStatus.getExecutionName(), StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			fileName = fileName.replace(":", "_");
			fileName = fileName.replace(" ", "_");
			fileName = fileName.replace("-", "_");
			
			File destinationFile = new File(ReportUtility.GetReportPath(context, fileName));
			
			ReportUtility.CreateFolderIfNotExist(context);
			

			Sheet sheet = workbook.createSheet("测试执行结果报表");
			
			Font font = workbook.createFont();
			font.setFontHeightInPoints((short)10);
		    font.setFontName("Arial");
		    font.setColor(IndexedColors.WHITE.getIndex());
		    font.setItalic(false);
		    font.setBoldweight((short)10);
		    
		    
			int rowIndex = 0;
			Row row = sheet.createRow(rowIndex++);
			Cell cell = row.createCell(0);
			cell.setCellValue("测试集名称:");

			cell = row.createCell(1);
			cell.setCellValue(executionStatus.getTestsetName());

			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell.setCellValue("测试执行名称:");

			cell = row.createCell(1);
			cell.setCellValue(executionStatus.getExecutionName());

			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell.setCellValue("被测对象:");
			
			cell = row.createCell(1);
			cell.setCellValue(executionStatus.getTestObject());
			
			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell.setCellValue("测试人员:");

			cell = row.createCell(1);
			cell.setCellValue(executionStatus.getExecutedByUserId());
						
			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell = row.createCell(1);
			
			
			row = sheet.createRow(rowIndex++);

			cell = row.createCell(0);
			cell.setCellValue("测试用例Id");
			
			cell = row.createCell(1);
			cell.setCellValue("测试用例名称");

			cell = row.createCell(2);
			cell.setCellValue("执行步骤");

			cell = row.createCell(3);
			cell.setCellValue("执行结果");

			cell = row.createCell(4);
			cell.setCellValue("执行时间");

			cell = row.createCell(5);
			cell.setCellValue("测试用例执行区间");

			
			Cell testcaseTimeSpanCell = null;
			String testcaseStartTime = "";
			//String testcaseEndTime;
			int sequenceNo = 0;

			for (int i= 0; i<executionResults.size(); i++ )
			{
				ExecutionResultInfo result = executionResults.get(i);

				if (result.getCommandType() == ExecutionResult.CommandType_ExceptionBegin
						|| result.getCommandType() == ExecutionResult.CommandType_ExceptionEnd)
					continue;

				if (result.getCommandType() == ExecutionResult.CommandType_TestcaseBegin)
				{
					row = sheet.createRow(rowIndex++);

					Script script = scriptService.getScriptById(executionStatus.getProjectId(), result.getScriptId());
					if (script != null)
					{
						//todo CustomizedId字段转移到testcase表中
						//row.createCell(0).setCellValue(script.getCustomizedId());
					}

					row.createCell(1).setCellValue(result.getCommand());
					row.createCell(2).setCellValue(result.getCommand());

					row.createCell(3).setCellValue(getCommandResultString(result.getResult()));
					row.createCell(4).setCellValue(StringUtility.GetFormatedDateTime(result.getExecutionTime()));

					testcaseStartTime = StringUtility.GetFormatedDateTime(result.getExecutionTime()) + " - ";
					testcaseTimeSpanCell = row.createCell(5);
					testcaseTimeSpanCell.setCellValue(testcaseStartTime);

				}

				if (result.getCommandType() == ExecutionResult.CommandType_Command
					|| result.getCommandType() == ExecutionResult.CommandType_CheckPointBegin
					|| result.getCommandType() == ExecutionResult.CommandType_CheckPointEnd)
				{
					row = sheet.createRow(rowIndex++);
					row.createCell(1).setCellValue(sequenceNo++);
					row.createCell(2).setCellValue(result.getCommand());

					row.createCell(3).setCellValue(getCommandResultString(result.getResult()));
					row.createCell(4).setCellValue(StringUtility.GetFormatedDateTime(result.getExecutionTime()));
				}

				if (result.getCommandType() == ExecutionResult.CommandType_TestcaseEnd)
				{
					if(testcaseTimeSpanCell != null)
					{
						String testcaseTimeSpan = testcaseStartTime + StringUtility.GetFormatedDateTime(result.getExecutionTime());
						testcaseTimeSpanCell.setCellValue(testcaseTimeSpan);

						testcaseTimeSpanCell = null;
					}
				}

			}

			//lets write the excel data to file now
			FileOutputStream fos = new FileOutputStream(destinationFile);
			workbook.write(fos);
			fos.close();
			logger.info(fileName + " written successfully");
			return fileName;
		}
		catch (Exception ex)
		{
			logger.error("writeExecutionReport has exception:" + ex.toString());
			return "";
		}
	}
	
	private String getCommandResultString(int result)
	{
		String resultString = "";
		switch (result)
		{
			case ExecutionResult.Success:
				resultString = "成功";
				break;

			case ExecutionResult.Fail:
				resultString = "失败";
				break;
			case ExecutionResult.Timeout:
				resultString = "超时";
				break;
			case ExecutionResult.Other:
				resultString = "其他";
				break;
		}
		
		return resultString;
	}
}

