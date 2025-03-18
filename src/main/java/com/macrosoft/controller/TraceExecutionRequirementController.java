package com.macrosoft.controller;

import com.macrosoft.service.ExecutionResultService;
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
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.Project;
import com.macrosoft.model.composition.ExecutionRequirementTraceInfo;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.service.ExecutionTestCaseResultService;
import com.macrosoft.service.ProjectService;
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
public class TraceExecutionRequirementController {

	private static final Logger logger = LoggerFactory.getLogger(TraceExecutionReportController.class.getName());

	private ProjectService projectService;
	private ExecutionTestCaseResultService executionTestCaseResultService;
	private ExecutionStatusService executionStatusService;
	private ExecutionResultService mExecutionResultService;

	@Autowired(required = true)
	
	public void setExecutionResultService(ExecutionResultService executionResultService) {
		this.mExecutionResultService = executionResultService;
	}

	@Autowired(required = true)
	
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
	
	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService executionStatusService) {
		this.executionStatusService = executionStatusService;
	}
	
	@Autowired(required = true)
	
	public void setProjectService(ExecutionTestCaseResultService executionTestCaseResultService) {
		this.executionTestCaseResultService = executionTestCaseResultService;
	}
	
	@Autowired
	ServletContext context;


	@RequestMapping(value = "/api/trace/executionRequirement/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ReportDownloadingInfo> createExecutionRequirementReport(
																HttpServletRequest request, 
																HttpServletResponse response, 
																@PathVariable("executionId") String executionId) {
		try {

			//String fileName = writeReport("0", "e142f322-1a5a-0a74-aaec-9656fa831c38");
			
			String tenantId = TenantContext.getTenantId();
			String fileName = writeReport(tenantId, executionId);

			//ReportUtility.downloadReport(context, request, response, fileName);

			if (fileName == null || fileName.isEmpty()) {
				return new ApiResponse<ReportDownloadingInfo>(ApiResponse.Success, null);
			}
			ReportDownloadingInfo info = new ReportDownloadingInfo();
			info.setFileName(fileName);
			info.setReportPath(ReportUtility.GetStaticReportPath(fileName));
			
			return new ApiResponse<ReportDownloadingInfo>(ApiResponse.Success, info);
		} catch (Exception ex) {
			logger.error("createExecutionRequirementReport has exception:" + ex.toString());
			return new ApiResponse<ReportDownloadingInfo>(ApiResponse.UnHandleException, null);
		}
	}

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
			
			List<ExecutionRequirementTraceInfo> traceInfos = executionTestCaseResultService.listExecutionRequirementTraceInfos(executionId);
			int getRequirementTitleCount = 0;
			for (int i = 0; i < traceInfos.size(); i++) {
				int scriptId = Math.toIntExact(traceInfos.get(i).getScriptId());
				String requirementId = String.valueOf(traceInfos.get(i).getRequirementId());
				String requirementResult = this.mExecutionResultService.getExecutionResultByCheckPoint(executionId, scriptId, requirementId);
				traceInfos.get(i).setRequirementResult(requirementResult);
				//当所有的测试需求为null时,生成的报告不包含测试需求列
				if (traceInfos.get(i).getRequirementTitle() != null && !traceInfos.get(i).getRequirementTitle().isEmpty() && traceInfos.get(i).getRequirementTitle() != "null") {
					getRequirementTitleCount++;
				}
			}
			ExecutionStatus status = executionStatusService.getExecutionStatusByExecutionId(executionId);

			String projectName = "";
			Project project = projectService.getProjectById(status.getProjectId());
			if (project != null)
			{
				projectName = project.getName();
			}
			
			String fileName = String.format("ExecutionRequirementReport_%s_%s.xlsx", projectName, StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			fileName = fileName.replace(":", "_");
			fileName = fileName.replace(" ", "_");
			fileName = fileName.replace("-", "_");
			
			
			File destinationFile = new File(ReportUtility.GetReportPath(context, fileName));
			
			ReportUtility.CreateFolderIfNotExist(context);

			
			Sheet sheet = workbook.createSheet("测试结果追溯表");
			
			Font font = workbook.createFont();
			font.setFontHeightInPoints((short)10);
		    font.setFontName("Arial");
		    font.setColor(IndexedColors.WHITE.getIndex());
		    font.setItalic(false);
		    font.setBoldweight((short)10);
			int rowIndex = 0;
			Row row = sheet.createRow(rowIndex++);
			Cell cell = row.createCell(0);
			cell.setCellValue("项目名称:");

			cell = row.createCell(1);
			cell.setCellValue(projectName);

			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell.setCellValue("测试集名称:");

			cell = row.createCell(1);
			cell.setCellValue(status.getTestsetName());

			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell.setCellValue("测试执行时间:");

			cell = row.createCell(1);
			cell.setCellValue(status.getStartTime() + " - " + status.getEndTime());

			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell = row.createCell(1);
		    if (getRequirementTitleCount!=0) {
				row = sheet.createRow(rowIndex++);

				cell = row.createCell(0);
				cell.setCellValue("测试需求ID");

				cell = row.createCell(1);
				cell.setCellValue("测试需求名称");

				cell = row.createCell(2);
				cell.setCellValue("是否通过");

				cell = row.createCell(3);
				cell.setCellValue("测试用例Id");

				cell = row.createCell(4);
				cell.setCellValue("测试用例名称");


				cell = row.createCell(5);
				cell.setCellValue("执行结果");


				for (int i = 0; i < traceInfos.size(); i++) {
					row = sheet.createRow(rowIndex++);
					ExecutionRequirementTraceInfo traceInfo = traceInfos.get(i);


					if (traceInfo.getCustomizedRequirementId() != null) {
						row.createCell(0).setCellValue(traceInfo.getCustomizedRequirementId());
					}
					if (traceInfo.getRequirementTitle() != null) {
						row.createCell(1).setCellValue(traceInfo.getRequirementTitle());
					}
					if (traceInfo.getRequirementResult() != null) {
						row.createCell(2).setCellValue(traceInfo.getRequirementResult());
					}

					if (traceInfo.getCustomizedScriptId() != null) {
						row.createCell(3).setCellValue(traceInfo.getCustomizedScriptId());
					}

					if (traceInfo.getScriptName() != null) {
						row.createCell(4).setCellValue(traceInfo.getScriptName());
					}

					if (traceInfo.getResult() != null) {
						row.createCell(5).setCellValue(traceInfo.getResult());
					}
				}
			}
			else {
				row = sheet.createRow(rowIndex++);

				cell = row.createCell(0);
				cell.setCellValue("测试用例Id");

				cell = row.createCell(1);
				cell.setCellValue("测试用例名称");


				cell = row.createCell(2);
				cell.setCellValue("执行结果");


				for (int i = 0; i < traceInfos.size(); i++) {
					row = sheet.createRow(rowIndex++);
					ExecutionRequirementTraceInfo traceInfo = traceInfos.get(i);

					if (traceInfo.getCustomizedScriptId() != null) {
						row.createCell(0).setCellValue(traceInfo.getCustomizedScriptId());
					}

					if (traceInfo.getScriptName() != null) {
						row.createCell(1).setCellValue(traceInfo.getScriptName());
					}

					if (traceInfo.getResult() != null) {
						row.createCell(2).setCellValue(traceInfo.getResult());
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
}

