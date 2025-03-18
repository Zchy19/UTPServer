package com.macrosoft.controller;

import java.io.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipOutputStream;

import com.macrosoft.controller.dto.DownloadingInfo;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.*;
import com.macrosoft.service.*;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.SerializationUtility;
import com.macrosoft.utilities.StringUtility;
import com.macrosoft.utilities.SystemUtil;
import com.macrosoft.utp.adatper.utpengine.dto.ScriptInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.macrosoft.model.composition.TestsetData;
import com.macrosoft.controller.dto.TestsetInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;

import static org.checkerframework.checker.units.UnitsTools.s;

@Controller
public class TestSetController {
	private static final ILogger logger = LoggerFactory.Create(TestSetController.class.getName());

	private TestSetService mTestSetService;
	private ScriptLinkService mScriptLinkService;
	private ProtocolSignalService mProtocolSignalService;
	private ExecutionResultService mExecutionResultService;
	private ExecutionStatusService mExecutionStatusService;
	private ExecutionTestCaseResultService mExecutionTestCaseResultService;



	@Autowired(required = true)
	
	public void setScriptLinkService(ScriptLinkService scriptLinkService) {
		this.mScriptLinkService = scriptLinkService;
	}

	@Autowired(required = true)
	
	public void setTestSetService(TestSetService testSetService) {
		this.mTestSetService = testSetService;
	}

	@Autowired(required = true)
	
	public void setScriptlinkService(ScriptLinkService scriptlinkService) {
		this.mScriptLinkService = scriptlinkService;
	}


	@Autowired(required = true)
	
	public void setProtocolSignalService(ProtocolSignalService protocolSignalService) {
		this.mProtocolSignalService = protocolSignalService;
	}
	@Autowired(required = true)
	
	public void setExecutionResultService(ExecutionResultService executionResultService) {
		this.mExecutionResultService = executionResultService;
	}

	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService executionStatusService) {
		this.mExecutionStatusService = executionStatusService;
	}

	@Autowired(required = true)
	
	public void setExecutionTestResultService(ExecutionTestCaseResultService executionTestCaseResultService) {
		this.mExecutionTestCaseResultService = executionTestCaseResultService;
	}

	@RequestMapping(value = "/api/testset/data/{projectId}/{testsetId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<TestsetData> getTestSetDataNew(@PathVariable("projectId") long projectId,
			@PathVariable("testsetId") long testsetId) {
		try {
			TestsetData result = this.mTestSetService.getTestsetDataByTestsetId(projectId, testsetId);
			return new ApiResponse<TestsetData>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getTestSetDataNew", ex);
			return new ApiResponse<TestsetData>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/utpExecutor/exportExecutionIdResultToFile", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> exportExecutionIdResultToFile(@RequestParam("path") String path, @RequestParam("excutionId") String excutionId ) {
		try {
			TestsetPackage testsetPackage = new TestsetPackage();
			//获取ExecutionResult表中excutionId数据
			testsetPackage.executionResults = this.mExecutionResultService.getExecutionResultByExecutionId(excutionId);
			//获取ExecutionStatus表中excutionId数据
			ExecutionStatus executionStatusByExecutionId = this.mExecutionStatusService.getExecutionStatusByExecutionId(excutionId);
			List<ExecutionStatus> executionStatuses = new ArrayList<>();
			executionStatuses.add(executionStatusByExecutionId);
			testsetPackage.executionStatuses = executionStatuses;
			//获取executiontestcaseresult表中excutionId数据
			testsetPackage.executionTestCaseResults = this.mExecutionTestCaseResultService.listExecutionTestCaseResults(excutionId);
			//将4张表数据导出成文件
			SerializationUtility<TestsetPackage> serializer = new SerializationUtility<TestsetPackage>();
			//获取当前时间作为文件名
			String exportedProjectFileName = String.format("%s——%s.uResult",StringUtility.GetFormatedDateTime(executionStatusByExecutionId.getStartTime()), StringUtility.GetFormatedDateTime(executionStatusByExecutionId.getEndTime()));
			exportedProjectFileName = exportedProjectFileName.replace(":", "_");
			exportedProjectFileName = exportedProjectFileName.replace(" ", "_");
			exportedProjectFileName = exportedProjectFileName.replace("-", "_");
			//取出path中双引号
			path = path.replace("\"", "");
			String projectRealPath = GetTestsetRealPath(exportedProjectFileName, path);
			serializer.Serialize(testsetPackage, projectRealPath);
			//获取相对路径
//			String projectRelativePath = GetTestsetRelativePath(exportedProjectFileName);
			return new ApiResponse<String>(ApiResponse.Success, projectRealPath);

		} catch (Exception ex) {
			logger.error("exportDataToFile has exception:" + ex.toString());
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}


//	导出四张表数据,此方法暂时不使用
	@RequestMapping(value = "/api/utpExecutor/exportExecutionResultToFile", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> exportExecutionResultToFile(@RequestBody String path) {

		try {
			TestsetPackage testsetPackage = new TestsetPackage();
			//获取ProtocolSignal表中所有数据,暂时不使用

			//获取ExecutionResult表中所有数据
			testsetPackage.executionResults = this.mExecutionResultService.getallExecutionResult();
			//获取ExecutionStatus表中所有数据
			testsetPackage.executionStatuses = this.mExecutionStatusService.getAllExecutionStatus();
			//获取executiontestcaseresult表中所有数据
			testsetPackage.executionTestCaseResults = this.mExecutionTestCaseResultService.getAllExecutionTestCaseResults();
			//将4张表数据导出成文件
			SerializationUtility<TestsetPackage> serializer = new SerializationUtility<TestsetPackage>();
			//获取当前时间作为文件名
			String exportedProjectFileName = String.format("%s_%s.uResult","testsetPackage", StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			exportedProjectFileName = exportedProjectFileName.replace(":", "_");
			exportedProjectFileName = exportedProjectFileName.replace(" ", "_");
			exportedProjectFileName = exportedProjectFileName.replace("-", "_");
			//取出path中双引号
			path = path.replace("\"", "");
			String projectRealPath = GetTestsetRealPath(exportedProjectFileName, path);
			serializer.Serialize(testsetPackage, projectRealPath);
			//获取相对路径
			String projectRelativePath = GetTestsetRelativePath(exportedProjectFileName);
			return new ApiResponse<String>(ApiResponse.Success, projectRealPath);

		} catch (Exception ex) {
			logger.error("exportDataToFile has exception:" + ex.toString());
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}
	//导入测试集数据
	@RequestMapping(value = "/api/uptExecutor/importExecutionResultFromFile", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> importExecutionResultFromFile(@RequestParam("testsetFile") MultipartFile inputFile, @RequestParam("projectId") long projectId, @RequestParam("testsetId") long testsetId) {
		try {

			if (inputFile.isEmpty()) {
				return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
			}
			HttpHeaders headers = new HttpHeaders();
			String originalFilename = inputFile.getOriginalFilename();
			String tempFolder = SystemUtil.getTempDirectory();
			String id =  UUID.randomUUID().toString();
			String destinationFilePath = tempFolder + File.separator + id;
			File destinationFile = new File(destinationFilePath);
			if (!new File(destinationFilePath).exists()) {
				new File(destinationFilePath).mkdir();
			}
			inputFile.transferTo(destinationFile);
			SerializationUtility<TestsetPackage> serializer = new SerializationUtility<TestsetPackage>();
			TestsetPackage testsetPackage = serializer.Deserialize(destinationFilePath);
			if (testsetPackage == null)
			{
				throw new Exception("Deserialize testset file failed.");
			}
			String executionId = testsetPackage.executionStatuses.get(0).getExecutionId();
			ExecutionStatus executionStatusByExecutionId = this.mExecutionStatusService.getExecutionStatusByExecutionId(executionId);
			headers.add("Import testset Uploaded Successfully - ", originalFilename);
			logger.info(String.format("Import testset Uploaded Successfully - originalFilename: %s, destinationFilePath: %s ", originalFilename, destinationFilePath));
			if (executionStatusByExecutionId != null)
			{
				return new ApiResponse<Boolean>(ApiResponse.Success, false);
			}
						testsetPackage = testsetPackage.Clone();
			this.mTestSetService.importTestSetPackage(testsetPackage, projectId, testsetId);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("importTestsetToFile has exception:" + ex.toString());
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/testset/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<TestSet>> getTestSetsByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<TestSet> result = this.mTestSetService.listTestSetsByProjectId(projectId);
			return new ApiResponse<List<TestSet>>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getTestSetsByProjectId", ex);
			return new ApiResponse<List<TestSet>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testset/{projectId}/{testsetId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<TestSet> getTestSet(@PathVariable("projectId") long projectId,
			@PathVariable("testsetId") long testsetId) {
		try {
			TestSet result = this.mTestSetService.getTestSetById(projectId, testsetId);
			return new ApiResponse<TestSet>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getTestSet", ex);
			return new ApiResponse<TestSet>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testset/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TestSet> createTestSetNew(@RequestBody TestSet testset) {
		try {
			this.mTestSetService.addTestSet(testset.getProjectId(), testset);
			return new ApiResponse<TestSet>(ApiResponse.Success, testset);
		} catch (Exception ex) {
			logger.error("createTestSetNew", ex);
			return new ApiResponse<TestSet>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testset/createWithScriptIds", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TestSet> createTestsetByScriptIds(@RequestBody TestsetInfo testsetInfo) {
		try {
			TestSet testset = this.mTestSetService.createTestsetByScriptIds(testsetInfo);

			String scriptIds = testsetInfo.getScriptIdsWithCommaSeperator();
			String[] scriptIdList = scriptIds.split(",");
			this.mTestSetService.addScriptLinksByScriptIds(testsetInfo.getProjectId(), testset.getId(), scriptIdList);
			return new ApiResponse<TestSet>(ApiResponse.Success, testset);
		} catch (Exception ex) {
			logger.error("createTestsetByScriptIds", ex);
			return new ApiResponse<TestSet>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testset/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TestSet> editTestSetNew(@RequestBody TestSet testset) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editTestSetNew");
			this.mTestSetService.updateTestSet(testset.getProjectId(), testset);
			return new ApiResponse<TestSet>(ApiResponse.Success, testset);
		} catch (Exception ex) {
			logger.error("editTestSetNew", ex);
			return new ApiResponse<TestSet>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testset/delete/{projectId}/{testsetId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteTestSet(@PathVariable("projectId") long projectId,
			@PathVariable("testsetId") long testsetId) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteTestSet");
			this.mTestSetService.removeTestSetById(projectId, testsetId);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("deleteTestSet", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/testset/updateWithScriptIds", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TestSet> UpdateScriptlinksNew(@RequestBody TestsetInfo testsetInfo) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "UpdateScriptlinksNew");
			this.mScriptLinkService.removeScriptLinkByTestsetId(testsetInfo.getProjectId(), testsetInfo.getId());

			TestSet result = this.mTestSetService.updateTestsetByScriptIds(testsetInfo);
			return new ApiResponse<TestSet>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("UpdateScriptlinksNew", ex);
			return new ApiResponse<TestSet>(ApiResponse.UnHandleException, null);
		}
	}
	private String GetTestsetRealPath(String fileName,String path)
	{
		fileName = FileUtility.filterInvalidCharacterFileName(fileName);

		new File(path).mkdir();

		return path + File.separator + fileName;
	}

	private String GetTestsetRelativePath(String fileName)
	{
		fileName = FileUtility.filterInvalidCharacterFileName(fileName);
		return "." + File.separator  + "Testsets" + File.separator + fileName;
	}

}
