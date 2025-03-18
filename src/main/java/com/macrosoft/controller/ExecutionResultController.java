package com.macrosoft.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletContext;

import com.macrosoft.caching.CachedDataManager;
import com.macrosoft.controller.dto.PreprocessExecutionIcdParameter;
import com.macrosoft.model.*;
import com.macrosoft.service.*;
import com.macrosoft.utilities.ParserResult;
import com.macrosoftsys.UtpCoreAccessLib.ExecProgItem;
import com.macrosoftsys.UtpCoreAccessLib.ExecProgTypeEnum;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.macrosoft.controller.dto.DownloadingInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.model.composition.PageSummary;
import com.macrosoft.model.idc.BCD;
import com.macrosoft.model.idc.Code;
import com.macrosoft.model.idc.CodeField;
import com.macrosoft.model.idc.Equipment;
import com.macrosoft.model.idc.Field;
import com.macrosoft.model.idc.ARINC429FrameData;
import com.macrosoft.model.idc.IcdModel;
import com.macrosoft.model.idc.Label;
import com.macrosoft.utilities.ExportTestCaseUtility;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.StringUtility;
@Controller
public class ExecutionResultController {
	private static final ILogger logger = LoggerFactory.Create(ExecutionResultController.class.getName());

	private ExecutionResultService mExecutionResultService;
	private JsonStorageService mJsonStorageService;
	private IcdDocumentService mIcdDocumentService;
	private ExecutionStatusService mExecutionStatusService;
	private AgentConfigService mAgentConfigService;
	private ScriptService mScriptService;
	private ExecutionCheckPointService mExecutionCheckPointService;
	private ExecutionTestCaseResultService mExecutionTestCaseResultService;

	
	@Autowired
	ServletContext context;

	@Autowired(required = true)
	
	public void setExecutionCheckPointService(ExecutionCheckPointService executionCheckPointService) {
		this.mExecutionCheckPointService = executionCheckPointService;
	}


	@Autowired(required = true)
	
	public void setAgentConfigService(AgentConfigService ps) {
		this.mAgentConfigService = ps;
	}
	

	@Autowired(required = true)
	
	public void setExecutionTestCaseResultService(ExecutionTestCaseResultService executionTestCaseResultService) {
		this.mExecutionTestCaseResultService = executionTestCaseResultService;
	}
	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.mScriptService = scriptService;
	}
	@Autowired(required = true)
	
	public void setExecutionResultService(ExecutionResultService executionResultService) {
		this.mExecutionResultService = executionResultService;
	}

	@Autowired(required = true)
	
	public void setJsonStorageService(JsonStorageService jsonStorageService) {
		this.mJsonStorageService = jsonStorageService;
	}
	
	
	@Autowired(required = true)
	
	public void setIcdDocumentService(IcdDocumentService icdDocumentService) {
		this.mIcdDocumentService = icdDocumentService;
	}

	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService executionStatusService) {
		this.mExecutionStatusService = executionStatusService;
	}
	
	@RequestMapping(value = "/api/query/executionResult/pageSummary/{executionId}/{rowsPerPage}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<PageSummary> getExecutionResultInfoPageSummary(@PathVariable("executionId") String executionId,
			@PathVariable("rowsPerPage") int rowsPerPage) {
		try {
			PageSummary pageSummary = this.mExecutionResultService
					.getExecutionResultInfoPageSummary(executionId, rowsPerPage);
			return new ApiResponse<PageSummary>(ApiResponse.Success, pageSummary);
		} catch (Exception ex) {
			logger.error("getExecutionResultInfoPageSummary", ex);
			return new ApiResponse<PageSummary>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/query/executionResult/pageDetail/{executionId}/{currentPage}/{rowsPerPage}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> listPagedExecutionResultInfos(@PathVariable("executionId") String executionId,
			@PathVariable("currentPage") int currentPage, @PathVariable("rowsPerPage") int rowsPerPage) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService
					.listPagedExecutionResultInfos(executionId, currentPage, rowsPerPage);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.Success, findResults);
		} catch (Exception ex) {
			logger.error("listPagedExecutionResultInfos", ex);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/query/maximumExecutionResult/{executionId}/{resultIdAsStartPoint}/{maximum}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> getMaximumExecutionResults(@PathVariable("executionId") String executionId,
																					@PathVariable("resultIdAsStartPoint") long resultIdAsStartPoint,@PathVariable("maximum") int maximum) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService
					.listMaximumExecutionResultInfosAfterFromId(executionId, resultIdAsStartPoint,maximum);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.Success, findResults);
		} catch (Exception ex) {
			logger.error("getExecutionResults", ex);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/query/executionResult/{executionId}/{resultIdAsStartPoint}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> getExecutionResults(@PathVariable("executionId") String executionId,
			@PathVariable("resultIdAsStartPoint") long resultIdAsStartPoint) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService
					.listExecutionResultInfosAfterFromId(executionId, resultIdAsStartPoint);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.Success, findResults);
		} catch (Exception ex) {
			logger.error("getExecutionResults", ex);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/query/executionResult/summary/{executionId}/{resultIdAsStartPoint}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> getExecutionResultsSummary(
			@PathVariable("executionId") String executionId,
			@PathVariable("resultIdAsStartPoint") long resultIdAsStartPoint) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService
					.listExecutionResultSummaryInfosAfterFromId(executionId, resultIdAsStartPoint);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.Success, findResults);
		} catch (Exception ex) {
			logger.error("getExecutionResultsSummary", ex);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/query/executionResult/details/{executionId}/{resultBeginId}/{resultEndId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> getExecutionResultDetails(
			@PathVariable("executionId") String executionId, @PathVariable("resultBeginId") long resultBeginId,
			@PathVariable("resultEndId") long resultEndId) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService.listExecutionResultDetails(executionId,
					resultBeginId, resultEndId);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.Success, findResults);
		} catch (Exception ex) {
			logger.error("getExecutionResultDetails", ex);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.UnHandleException, null);
		}
	}
	
	
	@RequestMapping(value = "/api/query/executionResult/latestNumberOfDetails/{executionId}/{amount}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> getLatestNumberOfDetails(
			@PathVariable("executionId") String executionId, @PathVariable("amount") long amount) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService
					.listLatestNumberOfExecutionResultInfos(executionId, amount);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.Success, findResults);
		} catch (Exception ex) {
			logger.error("getLatestNumberOfDetails", ex);
			return new ApiResponse<List<ExecutionResultInfo>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/executionResult/getResultByParentId/{executionId}/{parentId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionResultInfo>> listResultByParentId(@PathVariable("executionId") String executionId,@PathVariable("parentId") String parentId) {
		try {
			List<ExecutionResultInfo> findResults = this.mExecutionResultService.listResultByParentId(executionId,parentId);
			return new ApiResponse<>(ApiResponse.Success, findResults);
		}catch (Exception ex) {
			logger.error("getResultByParentId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/executionResult/upload", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> upload(@RequestBody Notification notification) {
		try {
			String executionId = notification.getExecutionID();
			String resultArrary = notification.getResult();

			ExecutionStatus executionStatusByExecutionId = mExecutionStatusService.getExecutionStatusByExecutionId(executionId);
			long projectId = executionStatusByExecutionId.getProjectId();
			String testsetId = String.valueOf(executionStatusByExecutionId.getTestsetId());


			//将string 转换为json
			JSONArray jsonArray = JSONArray.fromObject(resultArrary);
			for (int i = 0; i < jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				Integer progType = jsonObject.getInt("notifType");
				JSONArray notifContent = jsonObject.getJSONArray("notifContent");
				String[] resultData = new String[notifContent.size()];
				for (int k = 0; k < notifContent.size(); k++) {
					//判断是不是字符串
					if (!(notifContent.get(k) instanceof String)){
						resultData[k]=notifContent.get(k).toString();
					}
					resultData[k] = notifContent.getString(k);
				}
				String execution_Date = "";

				if (progType == ExecProgTypeEnum.EXECUTION_BEGIN.swigValue()) {
					//"y-m-d"

					logger.info("Execution progress update: Execution Begin.");
					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommandType(ExecutionResult.CommandType_ExecutionBegin);

					String executionBegin_DateTime = resultData[resultData.length-1]; //2022-04-25 21:27:46:79

					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(executionBegin_DateTime);
					if (dateResult.isParserSuccess())
					{
						execution_Date = executionBegin_DateTime.split(" ")[0];
						result.setExecutionTime(dateResult.getResult());

					}

					logger.info("Execution_Begin at : " + executionBegin_DateTime);

					result.setResult(ExecutionResult.Success);

					this.mExecutionResultService.addExecutionResult(result);


				} else if (progType == ExecProgTypeEnum.COMMAND_RESULT.swigValue()) {

					logger.info("Execution progress update: command result returned.");

					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					if (!resultData[0].isEmpty()){
						result.setScriptId(Long.parseLong(resultData[0]));
					}
					result.setCommandType(ExecutionResult.CommandType_Command);
					result.setAgentInstanceName(resultData[2]);

					String index = resultData[1];
					String parentId="-1";
					//判断index是否含有"-"
					if (index.contains("-"))
					{
						//去除最后一个斜杠和其后面的内容
						parentId = index.substring(0, index.lastIndexOf("-"));
					}

					result.setIndexId(index);
					result.setParentId(parentId);



					String commandValue = resultData[3] + ScriptContentParser.CommandSeparator + resultData[4];
					result.setCommand(commandValue);
					//如果commandValue中包含字符subscript,则将commandType设置为6,否则设置为5
					if (commandValue.contains("CALL_SCRIPT"))
					{
						result.setCommandType(ExecutionResult.CommandType_SubscriptEnd);
					}

					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						result.setExecutionTime(dateResult.getResult());
					}


					//contentJSON.put("params", resultData[2]);

					if ("SUCCESS".equals(resultData[5]))
					{
						result.setResult(ExecutionResult.Success);
					}
					else if ("FAIL".equals(resultData[5]))
					{
						result.setResult(ExecutionResult.Fail);
					}
					else if ("TIMEOUT".equals(resultData[5]))
					{
						result.setResult(ExecutionResult.Timeout);
					}
					else
					{
						result.setResult(ExecutionResult.Other);
					}

					result.setExceptionMessage(resultData[6]);

					this.mExecutionResultService.addExecutionResult(result);

				}else if (progType == ExecProgTypeEnum.CHECKPOINT_BEGIN.swigValue()) {
					logger.info("Execution progress update: checkpoint begin.");
					String checkPointId = resultData[1];
					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommandType(ExecutionResult.CommandType_CheckPointBegin);
					result.setCommand(checkPointId);
					result.setScriptId(Long.parseLong(resultData[0]));
					result.setResult(ExecutionResult.Success);
					String checkPointName = resultData[1];
					ExecutionCheckPoint checkPoint = new ExecutionCheckPoint();
					checkPoint.setCheckPointName(checkPointName);
					checkPoint.setExecutionId(executionId);
					checkPoint.setTestsetId(Integer.parseInt(testsetId));
					checkPoint.setTestCaseId(Integer.parseInt((resultData[0])));
					checkPoint.setProjectId(Math.toIntExact(projectId));
					String time = resultData[resultData.length-1]; //21:27:46:98
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						checkPoint.setStartTime(dateResult.getResult());
						result.setExecutionTime(dateResult.getResult());
					}

					logger.info("Execution_CHECKPOINT_BEGIN at : " + dateTime);

					checkPoint.setResult(ExecutionCheckPoint.None);

					ExecutionResult executionResult = this.mExecutionResultService.addExecutionResult(result);
					checkPoint.setExecutionResultStartId(executionResult.getId());


					this.mExecutionCheckPointService.addExecutionCheckPoint(checkPoint);

				}else if (progType == ExecProgTypeEnum.CHECKPOINT_END.swigValue()) {

					String checkPointName = resultData[1];

					String checkPointId = resultData[1];

					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommand(checkPointId);
					result.setScriptId(Long.parseLong(resultData[0]));
					result.setCommandType(ExecutionResult.CommandType_CheckPointEnd);
					ExecutionCheckPoint checkPoint =mExecutionCheckPointService.getExecutionCheckPointByExecutionIdAndCheckPointName(executionId, checkPointName);
					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						checkPoint.setEndTime(dateResult.getResult());
						result.setExecutionTime(dateResult.getResult());
					}

					logger.info("Execution_CHECKPOINT_END at : " + dateTime);

					if ("success".compareToIgnoreCase(resultData[2]) == 0)
					{
						checkPoint.setResult(ExecutionResult.Success);
						result.setResult(ExecutionResult.Success);
					}
					else
					{
						checkPoint.setResult(ExecutionResult.Fail);
						result.setResult(ExecutionResult.Fail);

					}

					ExecutionResult executionResult = this.mExecutionResultService.addExecutionResult(result);
					checkPoint.setExecutionResultEndId(executionResult.getId());
					this.mExecutionCheckPointService.updateExecutionCheckPoint(checkPoint);

				}else if (progType == ExecProgTypeEnum.EXCEPTION_BEGIN.swigValue()) {
					logger.info("Execution progress update: exception begin.");

					String checkPointId = resultData[0];

					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommandType(ExecutionResult.CommandType_ExceptionBegin);
					result.setCommand(checkPointId);

					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						result.setExecutionTime(dateResult.getResult());
					}

					logger.info("Execution_EXCEPTION_BEGIN at : " + dateTime);

					result.setResult(ExecutionResult.Success);

					this.mExecutionResultService.addExecutionResult(result);


				}else if (progType == ExecProgTypeEnum.EXCEPTION_END.swigValue()) {

					logger.info("Execution progress update: exception end.");
					//LoggerFacade.info("TestEnd returns parameter[0]:" + resultData[0]);
					String checkPointId = resultData[0];
					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommand(checkPointId);
					result.setCommandType(ExecutionResult.CommandType_ExceptionEnd);


					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						result.setExecutionTime(dateResult.getResult());
					}

					logger.info("Execution_EXCEPTION_END at : " + dateTime);
					result.setResult(ExecutionResult.Success);
					this.mExecutionResultService.addExecutionResult(result);

				} else if (progType == ExecProgTypeEnum.TESTCASE_BEGIN.swigValue()) {
					logger.info("Execution progress update: testcase begin.");
					// add executionresult
					Script script = this.mScriptService.getScriptById(executionStatusByExecutionId.getProjectId(), Long.parseLong(resultData[0]));

					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommandType(ExecutionResult.CommandType_TestcaseBegin);
					result.setCommand(script.getName());
					result.setScriptId(Long.parseLong(resultData[0]));

					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						result.setExecutionTime(dateResult.getResult());
					}

					result.setResult(ExecutionResult.Success);

					ExecutionResult executionResult = this.mExecutionResultService.addExecutionResult(result);
					this.mExecutionTestCaseResultService.updateExecutionTestCaseResultByStartTime(executionId, Long.parseLong(resultData[0]),dateResult.getResult(),executionResult.getId());
					logger.info("Execution_TESTCASE_BEGIN at : " + dateTime);

				} else if (progType == ExecProgTypeEnum.TESTCASE_END.swigValue()) {
					Script script = this.mScriptService.getScriptById(executionStatusByExecutionId.getProjectId(), Long.parseLong(resultData[0]));
					// add executionresult
					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommand(script.getName());
					result.setCommandType(ExecutionResult.CommandType_TestcaseEnd);
					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						result.setExecutionTime(dateResult.getResult());
					}
					logger.info("Execution_TESTCASE_END at : " + dateTime);
					result.setScriptId(Long.parseLong(resultData[0]));
					String testcaseResult = resultData[1];
					if ("success".compareToIgnoreCase(testcaseResult) == 0)
					{
						result.setResult(ExecutionResult.Success);
					}else{
						result.setResult(ExecutionResult.Fail);
					}
					ExecutionResult executionResult = this.mExecutionResultService.addExecutionResult(result);
					if ("success".compareToIgnoreCase(testcaseResult) == 0)
					{
						this.mExecutionTestCaseResultService.updateExecutionTestCaseResult(executionId,Long.parseLong(resultData[0]) , ExecutionTestCaseResult.Success);
						this.mExecutionTestCaseResultService.updateExecutionTestCaseResultByEndTime(executionId, Long.parseLong(resultData[0]),dateResult.getResult(),executionResult.getId());
					}else if ("failure".compareToIgnoreCase(testcaseResult) == 0){
						this.mExecutionTestCaseResultService.updateExecutionTestCaseResult(executionId, Long.parseLong(resultData[0]), ExecutionTestCaseResult.Fail);
						this.mExecutionTestCaseResultService.updateExecutionTestCaseResultByEndTime(executionId, Long.parseLong(resultData[0]),dateResult.getResult(),executionResult.getId());
					}else{
						this.mExecutionTestCaseResultService.updateExecutionTestCaseResult(executionId, Long.parseLong(resultData[0]), ExecutionTestCaseResult.None);
						this.mExecutionTestCaseResultService.updateExecutionTestCaseResultByEndTime(executionId, Long.parseLong(resultData[0]),dateResult.getResult(),executionResult.getId());
					}
				}else if (progType == ExecProgTypeEnum.COMMAND_BEGIN.swigValue()) {
					logger.info("Execution progress update: COMMAND_BEGIN .");
					String index = resultData[1];
					String scriptId =resultData[0];

					String parentId="-1";
					//判断index是否含有"-"
					if (index.contains("-"))
					{
						//去除最后一个斜杠和其后面的内容
						parentId = index.substring(0, index.lastIndexOf("-"));
					}
					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommandType(ExecutionResult.CommandType_SubscriptBegin);
					if (!scriptId.isEmpty()){
						result.setScriptId(Long.parseLong(scriptId));
					}

					result.setParentId(parentId);
					result.setIndexId(index);

					result.setAgentInstanceName("__EXTDEV__");
					String commandValue = resultData[3] + ScriptContentParser.CommandSeparator + resultData[4];
					result.setCommand(commandValue);

					String time = resultData[resultData.length-1]; //21:27:46:98
					//判断字符串中是否含有空格
					if (time.contains(" "))
					{
						execution_Date = time.split(" ")[0];
						time = time.split(" ")[1];
					}
					String dateTime = execution_Date + " " + time;
					ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
					if (dateResult.isParserSuccess())
					{
						result.setExecutionTime(dateResult.getResult());
					}

					result.setResult(ExecutionResult.Success);

					this.mExecutionResultService.addExecutionResult(result);

				}
				else if (progType == ExecProgTypeEnum.EXECUTION_END.swigValue()) {

					logger.info("Execution progress update: Execution End.");

					execution_Date = resultData[resultData.length-1];


					logger.info("Execution_end at : " + execution_Date);

//					this.utpEngineAdapter.endExecutionByProgLisener();

					ExecutionResult result = new ExecutionResult();
					result.setExecutionId(executionId);
					result.setCommandType(ExecutionResult.CommandType_ExecutionEnd);
					result.setExecutionTime(new Date(new Date().getTime()));
					result.setResult(ExecutionResult.Success);
					this.mExecutionResultService.addExecutionResult(result);
					//是否发送邮件
					if (executionStatusByExecutionId.getInformEmail() != null && !executionStatusByExecutionId.getInformEmail().isEmpty()) {
						// 发送邮件
						this.mExecutionResultService.sendEmailOfExecutionResult(executionStatusByExecutionId.getOrgId(), executionId, true, executionStatusByExecutionId.getInformEmail());
					}
				}else {
					System.out.println("progType: unkonwn");
					logger.info("Execution progress update: unknown execution happen..");
				}

			}

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}


}
