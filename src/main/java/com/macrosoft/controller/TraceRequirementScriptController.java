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
import com.macrosoft.model.Project;
import com.macrosoft.model.composition.RequirementScriptTraceInfo;
import com.macrosoft.service.ProjectService;
import com.macrosoft.service.RequirementService;
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
public class TraceRequirementScriptController {

	private static final Logger logger = LoggerFactory.getLogger(TraceRequirementScriptController.class.getName());

	private RequirementService requirementService;
	private ProjectService projectService;
	

	@Autowired(required = true)
	
	public void setRequirementService(RequirementService requirementService) {
		this.requirementService = requirementService;
	}

	@Autowired(required = true)
	
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	@Autowired
	ServletContext context;
	

	@RequestMapping(value = "/api/trace/requirementScript/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ReportDownloadingInfo> createRequirementScriptTrace(HttpServletRequest request, 
															HttpServletResponse response, 
															@PathVariable("projectId") long projectId) {
		try {
			String tenantId = TenantContext.getTenantId();
			String fileName = writeReport(tenantId, projectId);
			
			//ReportUtility.downloadReport(context, request, response, fileName);
			ReportDownloadingInfo info = new ReportDownloadingInfo();
			info.setFileName(fileName);
			info.setReportPath(ReportUtility.GetStaticReportPath(fileName));
			
			return new ApiResponse<ReportDownloadingInfo>(ApiResponse.Success, info);
		} catch (Exception ex) {
			logger.error("createRequirementScriptTrace has exception:" + ex.toString());
			return new ApiResponse<ReportDownloadingInfo>(ApiResponse.UnHandleException, null);
		}
	}

	private String writeReport(String orgId, long projectId)
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
			
			List<RequirementScriptTraceInfo> traceInfos = requirementService.listRequirementScriptTraceInfo(projectId);

			Project project = projectService.getProjectById(projectId);

			String fileName = String.format("RequirementScriptReport_%s_%s.xlsx", project.getName(), StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			fileName = fileName.replace(":", "_");
			fileName = fileName.replace(" ", "_");
			fileName = fileName.replace("-", "_");
			
			File destinationFile = new File(ReportUtility.GetReportPath(context, fileName));
			
			ReportUtility.CreateFolderIfNotExist(context);

			Sheet sheet = workbook.createSheet("需求-测试用例追踪表");

			
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
			cell.setCellValue(project.getName());


			row = sheet.createRow(rowIndex++);
			cell = row.createCell(0);
			cell = row.createCell(1);
			
			
			row = sheet.createRow(rowIndex++);

			cell = row.createCell(0);
			cell.setCellValue("需求Id");
			
			cell = row.createCell(1);
			cell.setCellValue("需求名称");

			cell = row.createCell(2);
			cell.setCellValue("测试用例Id");

			cell = row.createCell(3);
			cell.setCellValue("测试用例名称");


			
			for (int i= 0; i< traceInfos.size(); i++ )
			{
				row = sheet.createRow(rowIndex++);
				RequirementScriptTraceInfo traceInfo = traceInfos.get(i);
				
				if (traceInfo.getCustomizedRequirementId() != null)
				{
					row.createCell(0).setCellValue(traceInfo.getCustomizedRequirementId());
				}

				if (traceInfo.getRequirementTitle() != null)
				{
					row.createCell(1).setCellValue(traceInfo.getRequirementTitle());
				}

				if (traceInfo.getCustomizedScriptId() != null)
				{
					row.createCell(2).setCellValue(traceInfo.getCustomizedScriptId());
				}
				
				if (traceInfo.getScriptName() != null)
				{
					row.createCell(3).setCellValue(traceInfo.getScriptName());
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

