package com.macrosoft.controller;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.service.*;
import com.macrosoft.urs.IpAddress;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Handles requests for the application home page.
 */
@Controller
public class ExecutionController {

	private static final ILogger logger = LoggerFactory.Create(ExecutionController.class.getName());

	private ExecutionService mExecutionService;
	private ProjectService mProjectService;
	private TestSetService mTestSetService;
	private ExecutionTestCaseResultService mExecutionTestCaseResultService;
	private ScriptLinkService mScriptLinkService;
	private ExecutionStatusService mExecutionStatusService;
	private UrsConfigurationImpl ursConfig;
	private ExecutionTestCaseResultService executionTestCaseResultService;
	private UtpEngineControllerManager utpEngineControllerManager;
	private MonitoringExecutionService monitoringExecutionService;
	private ExecutionResultService mExecutionResultService;
	private ScriptService mScriptService;

	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.mScriptService = scriptService;
	}

	@Autowired(required = true)
	
	public void setMonitoringExecutionService(MonitoringExecutionService monitoringExecutionService){
		this.monitoringExecutionService = monitoringExecutionService;
	}

	@Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

	@Autowired(required = true)
	
	public void setProjectService(ExecutionTestCaseResultService executionTestCaseResultService) {
		this.executionTestCaseResultService = executionTestCaseResultService;
	}

	public void setUtpEngineControllerManager(UtpEngineControllerManager ps){
		this.utpEngineControllerManager = ps;
	}

	
	@Autowired(required = true)
	
	public void setAgentConfigService(ExecutionService ps) {
		this.mExecutionService = ps;
	}

	@Autowired(required = true)
	
	public void setProjectService(ProjectService ps) {
		this.mProjectService = ps;
	}

	
	@Autowired(required = true)
	
	public void setTestSetService(TestSetService testSetService) {
		this.mTestSetService = testSetService;
	}

	@Autowired(required = true)
	
	public void setScriptLinkService(ScriptLinkService scriptLinkService) {
		this.mScriptLinkService = scriptLinkService;
	}

	@Autowired(required = true)
	
	public void setExecutionTestResultService(ExecutionTestCaseResultService executionTestCaseResultService) {
		this.mExecutionTestCaseResultService = executionTestCaseResultService;
	}

	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService ps) {
		this.mExecutionStatusService = ps;
	}

	@Autowired(required = true)
	
	public void setExecutionResultService(ExecutionResultService executionResultService) {
		this.mExecutionResultService = executionResultService;
	}
	@RequestMapping(value = "/api/execution/getExecutionModel/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ExecutionModel> getExecutionModel(
			@PathVariable("executionId") String executionId) {
		try {
			//获取个数
			int commandCount = this.mExecutionResultService.getExecutionResultIntByExecutionIdAndCommandType(executionId,ExecutionResult.CommandType_Command);
			int testcaseEndCount = this.mExecutionResultService.getExecutionResultIntByExecutionIdAndCommandType(executionId,ExecutionResult.CommandType_TestcaseEnd);
			int commandCountFailed = this.mExecutionResultService.getExecutionResultIntByExecutionIdAndCommandTypeAndResult(executionId, ExecutionResult.CommandType_Command, ExecutionResult.Fail);
			int testcaseEndCountFailed = this.mExecutionResultService.getExecutionResultIntByExecutionIdAndCommandTypeAndResult(executionId, ExecutionResult.CommandType_TestcaseEnd, ExecutionResult.Fail);
			ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
			model.setCommandCount(commandCount);
			model.setTestcaseEndCount(testcaseEndCount);
			model.setCommandCountFailed(commandCountFailed);
			model.setTestcaseEndCountFailed(testcaseEndCountFailed);
			return new ApiResponse<ExecutionModel>(ApiResponse.Success, model);
		} catch (Exception ex) {
			logger.error("getExecutionStatusNew", ex);
			return new ApiResponse<ExecutionModel>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/utility/createGuid", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<String> createGuid () {
		try {
			return new ApiResponse<String>(ApiResponse.Success, UUID.randomUUID().toString());
		} catch (Exception ex) {
			logger.error("createGuid", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, "");
		}
	}
	
	//icd页面已废弃,此接口暂时不用
	@RequestMapping(value = "/api/execution/icd", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> icdExecution(
			@RequestBody PreprocessExecutionIcdParameter payLoad) {
		try {
			String executionId = payLoad.getExecutionId();
			// temporary use executionName to keep icd, use executedByUserId to keep channel.
			String executionName = payLoad.getIcdId();
			String executedByUserId = payLoad.getChannel();
			long scriptId = -100;
			long projectId = -100;
			long orgId = 1;
			String ipAddress = payLoad.getUtpCoreIpAddress();
			long port = payLoad.getUtpCorePort();
			boolean isDummyRun = false;
			String testObject = "";
			logger.info(String.format(
					"prepare icd Execution executionId:%s,executionName:%s, testObject:%s, executedByUserId:%s, scriptId:%s, orgId: %s,ipAddress: %s, port: %s, isDummyRun: %s",
					executionId, executionName, testObject, executedByUserId, scriptId, orgId, ipAddress, port, isDummyRun));
			mExecutionService.prepareExecution(executionId, executionName, testObject, executedByUserId,
					projectId, Long.toString(scriptId), Long.toString(orgId), ipAddress, port, isDummyRun, false);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
	@RequestMapping(value = "/api/execution/preprocess/scripts", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> prepareExecution(
			@RequestBody PreprocessExecutionParameter payLoad) {
		try {
			boolean exceedMaxExecution = mExecutionStatusService.isExceedMaxExecution(payLoad.getExecutedByUserId());
			if(exceedMaxExecution){
				return new ApiResponse<>(ApiResponse.UnHandleException, "ExceedMaxExecutionCount");
			}
			//判断调用的脚本是否存在循环调用
			//循环遍历playLoad.getScriptIds()中的所有脚本，判断是否存在循环调用
			for(int i=0;i<payLoad.getScriptIds().length;i++){
				ScriptCheckResult scriptCheckResult = mScriptService.isAllSubScriptExist(payLoad.getProjectId(), payLoad.getScriptIds()[i]);
				if(scriptCheckResult.hasIssue()){
					long scriptId = scriptCheckResult.getScriptId();
					if (scriptId > 0){
						return new ApiResponse<>(ApiResponse.UnHandleException, "NoSubscriptExists||"+scriptCheckResult.getReferencingScriptId()+"||"+scriptId);
					}else if (scriptId<0){
						return new ApiResponse<>(ApiResponse.UnHandleException, "ScriptCallLoop||"+payLoad.getScriptIds()[i]+"||"+scriptId);
					}
				}
			}
			String executionId = payLoad.getExecutionId();
			String executionName = payLoad.getExecutionName();
			String testObject = payLoad.getTestObject();
			String executedByUserId = payLoad.getExecutedByUserId();
			long[] scriptIds = payLoad.getScriptIds();
			long orgId = payLoad.getDomainId();
			String ipAddress = payLoad.getUtpCoreIpAddress();
			long port = payLoad.getUtpCorePort();
			long recoverSubscriptReferenceId = payLoad.getRecoverSubscriptReferenceId();
			boolean isDummyRun = payLoad.getIsDummyRun();
			boolean isSendEmail = payLoad.getIsSendEmail();
			String emailAddress = payLoad.getEmailAddress();
			boolean testcaseCollect = payLoad.isTestcaseCollect();
			logger.info(String.format(
					"prepareExecution executionId:%s executionName:%s, testObject:%s, testsetId:%s orgId: %s,ipAddress: %s, port: %s, recoverSubscriptReferenceId: %s, isDummyRun: %s, isSendEmail: %s, emailAddress",
					executionId, executionName, testObject, scriptIds, orgId, ipAddress, port, recoverSubscriptReferenceId,
					isDummyRun, isSendEmail, emailAddress));
			//对long数组遍历
			if (testcaseCollect){
				for (int i = 0; i < scriptIds.length; i++) {
					long scriptId = scriptIds[i];
					ExecutionTestCaseResult testCaseResult = new ExecutionTestCaseResult();
					testCaseResult.setExecutionId(executionId);
					testCaseResult.setResult(ExecutionTestCaseResult.None);
					testCaseResult.setScriptId(scriptId);
					testCaseResult.setExecutedByUserId(executedByUserId);
					mExecutionTestCaseResultService.addExecutionTestCaseResult(testCaseResult);
				}
			}
			mExecutionService.prepareExecutionByScripts(payLoad);
			return new ApiResponse<>(ApiResponse.Success, "Prepare execution success");
		} catch (Exception ex) {
			logger.error("prepareExecution", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, "Prepare execution failed");
		}
	}


	@RequestMapping(value = "/api/execution/preprocess/script", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> prepareScriptExecution(
			@RequestBody PreprocessExecutionScriptParameter payLoad) {
		try {
			String executionId = payLoad.getExecutionId();
			String executionName = payLoad.getExecutionName();
			String executedByUserId = payLoad.getExecutedByUserId();
			long scriptId = payLoad.getScriptId();
			long projectId = payLoad.getProjectId();
			long orgId = payLoad.getDomainId();
			String ipAddress = payLoad.getUtpCoreIpAddress();
			long port = payLoad.getUtpCorePort();
			boolean isDummyRun = payLoad.getIsDummyRun();
			String testObject = payLoad.getTestObject();
			logger.info(String.format(
					"prepareExecution executionId:%s,executionName:%s, testObject:%s, executedByUserId:%s, scriptId:%s, orgId: %s,ipAddress: %s, port: %s, isDummyRun: %s",
					executionId, executionName, testObject, executedByUserId, scriptId, orgId, ipAddress, port, isDummyRun));
			mExecutionService.prepareExecution(executionId, executionName, testObject, executedByUserId,
					projectId, Long.toString(scriptId), Long.toString(orgId), ipAddress, port, isDummyRun, false);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/execution/preprocess/testset", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> prepareExecutionTestSet(
			@RequestBody PreprocessExecutionTestsetParameter payLoad) {
		ExtendedPreprocessExecutionTestsetParameter param = new ExtendedPreprocessExecutionTestsetParameter(payLoad);
		param.setSendEmail(true);
		param.setEmailAddress(payLoad.getExecutedByUserId());
		return this.prepareExecutionTestSetWithEmail(param);
	}

	@RequestMapping(value = "/api/execution/preprocess/testsetWithEmail", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> prepareExecutionTestSetWithEmail(
			@RequestBody ExtendedPreprocessExecutionTestsetParameter payLoad) {
		try {

			long projectId = payLoad.getProjectId();
			String executionId = payLoad.getExecutionId();
			String executionName = payLoad.getExecutionName();
			String testObject = payLoad.getTestObject();
			String executedByUserId = payLoad.getExecutedByUserId();
			long testsetId = payLoad.getTestsetId();
			long orgId = payLoad.getDomainId();
			String ipAddress = payLoad.getUtpCoreIpAddress();
			long port = payLoad.getUtpCorePort();
			long recoverSubscriptReferenceId = payLoad.getRecoverSubscriptReferenceId();
			boolean isDummyRun = payLoad.getIsDummyRun();
			boolean isSendEmail = payLoad.isSendEmail();
			String emailAddress = payLoad.getEmailAddress();
			
			logger.info(String.format(
					"prepareExecution executionId:%s executionName:%s, testObject:%s, testsetId:%s orgId: %s,ipAddress: %s, port: %s, recoverSubscriptReferenceId: %s, isDummyRun: %s, isSendEmail: %s, emailAddress",
					executionId, executionName, testObject, testsetId, orgId, ipAddress, port, recoverSubscriptReferenceId,
					isDummyRun, isSendEmail, emailAddress));

			List<ScriptLink> scriptLinks = mScriptLinkService.listScriptLinksByTestsetId(projectId, testsetId);

			TestSet testset = mTestSetService.getTestSetById(projectId, testsetId);

			for (ScriptLink scriptLink : scriptLinks) {
				ExecutionTestCaseResult testCaseResult = new ExecutionTestCaseResult();
				testCaseResult.setExecutionId(executionId);
				testCaseResult.setResult(ExecutionTestCaseResult.None);
				testCaseResult.setScriptId(scriptLink.getScriptId());
				testCaseResult.setExecutedByUserId(executedByUserId);
				mExecutionTestCaseResultService.addExecutionTestCaseResult(testCaseResult);
			}

			mExecutionService.prepareExecutionTestset(executionId, executionName, testObject,
					executedByUserId, testset.getProjectId(), Long.toString(testsetId), Long.toString(orgId), ipAddress,
					port, recoverSubscriptReferenceId, isDummyRun, isSendEmail, emailAddress);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/execution/getSilenceExecutionUrl/{projectId}/{testsetId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<String> getSilenceExecutionUrl(
			@PathVariable("projectId") long projectId, @PathVariable("testsetId") long testsetId) {
		try {
		
			return new ApiResponse<String>(ApiResponse.Success, String.format("/api/execution/silenceStart/%s/%s", projectId, testsetId));
		} catch (Exception ex) {
			return new ApiResponse<String>(ApiResponse.UnHandleException, "");
		}
	}
	@RequestMapping(value = "/api/execution/silenceStart/{userAccount}/{projectName}/{testsetName}", method = RequestMethod.GET)
		public @ResponseBody ApiResponse<SilenceStartResponse> silenceStartExecution(
			@PathVariable("projectName") String projectName, @PathVariable("testsetName") String testsetName, @PathVariable("userAccount") String userAccount) {
		SilenceStartResponse silenceStartResponse = new SilenceStartResponse();
		silenceStartResponse.result = false;
		silenceStartResponse.setSilenceStartMessage("执行失败");
		silenceStartResponse.setExecutionId(" ");
		try {
			logger.info(String.format("silenceStartExecution - projectName: %s, testsetId: %s, userAccount:%s" , projectName, testsetName,userAccount));
			long orgId =Long.parseLong(TenantContext.getOrgId());
			List<Project> projects = this.mProjectService.listProjectByProjectName(orgId,projectName);
			if (projects == null || projects.size() == 0  ) {
				logger.info(String.format(" System can not find the project."));
				silenceStartResponse.setSilenceStartMessage("项目名称不存在");
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
			}
			if (projects.size() > 1) {
				logger.info(String.format("There are multiple project names "));
				silenceStartResponse.setSilenceStartMessage("存在相同的项目名称,请保证项目名称不重复!");
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
			}
			Project project = projects.get(0);
			logger.info(String.format("Project: %s，org:%s", project,project.getOrganizationId()));

			List<TestSet> testsets = this.mTestSetService.listTestSetsByTestSetName(project.getId(), testsetName);
			if (testsets == null || testsets.size() == 0) {
				logger.info(String.format(" System can not find the testset."));
				silenceStartResponse.setSilenceStartMessage("测试集名称不存在");
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
			}
			if (testsets.size() > 1) {
				logger.info(String.format("There are multiple testset names "));
				silenceStartResponse.setSilenceStartMessage("存在相同的测试集名称");
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
			}
			TestSet testset =testsets.get(0);
			logger.info(String.format("TestSet: %s", testset));
        	if (testset == null)
        	{
        		logger.info(String.format(" System can not find the testset."));
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
        	}
			logger.info(String.format("orgId: %s", orgId));
			UtpEngineControllerManager utpEngineControllerManager = new UtpEngineControllerManager();
			//获取所有执行器IP和port和engineName
			List<IpAddress> engineStatuses = utpEngineControllerManager.getUrsEngineStatuses(ursConfig.getIpAddress(),orgId, userAccount);
			logger.info(String.format("Urs request engineStatuses: %s", engineStatuses));
			if (engineStatuses == null || engineStatuses.size() == 0)
			{
				logger.info(String.format("Urs ip address returns result : false"));
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
			}
			//匹配获取的ip和port
			IpAddress engine = utpEngineControllerManager.MatchedEngine(engineStatuses, testset.getEngineName());
			if (engine == null)
			{
				logger.info(String.format("ipAddress or port is empty"));
				return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
			}
			String ipAddress = engine.getIpAddress();
			long port = engine.getPort();


        	// Step1: pre-process to execute testset.
        	String executionId = UUID.randomUUID().toString();
			String executionName = "Silence Execution";
			String executedByUserId = "";
			logger.info(String.format("prepareExecution executionId:%s executionName:%s, projectId: %s, testsetId:%s orgId: %s,ipAddress: %s, port: %s",executionId, executionName, project.getId(), testset.getId(),orgId, ipAddress, port));
			List<ScriptLink> scriptLinks = this.mScriptLinkService.listScriptLinksByTestsetId(project.getId(), testset.getId());
			List<ScriptLink> scriptLinksForTestSet = new ArrayList<ScriptLink>();
			for (ScriptLink scriptLink : scriptLinks)
			{
				scriptLinksForTestSet.add(scriptLink);
			}
			PreprocessExecutionParameter startParameter = new PreprocessExecutionParameter();

			//定义一个long[]数组
			long[] scriptIds = new long[scriptLinksForTestSet.size()];
			for (int i = 0; i < scriptLinksForTestSet.size(); i++) {
				ExecutionTestCaseResult testCaseResult = new ExecutionTestCaseResult();
				testCaseResult.setExecutionId(executionId);
				testCaseResult.setResult(ExecutionTestCaseResult.None);
				testCaseResult.setScriptId(scriptLinksForTestSet.get(i).getScriptId());
				testCaseResult.setExecutedByUserId(executedByUserId);
				//将scriptLink.getScriptId()添加到scriptIds中
				scriptIds[i] = scriptLinksForTestSet.get(i).getScriptId();
				executionTestCaseResultService.addExecutionTestCaseResult(testCaseResult);
			}
			startParameter.setIsDummyRun(false);
			startParameter.setExecutionId(executionId);
			startParameter.setExecutionName(executionName);
			startParameter.setTestObject("");
			startParameter.setProjectId(project.getId());
			startParameter.setDomainId(project.getOrganizationId());
			startParameter.setScriptGroupId(String.valueOf(testset.getId()));
			startParameter.setUtpCoreIpAddress(ipAddress);
			startParameter.setUtpCorePort(port);
			startParameter.setScriptIds(scriptIds);
			startParameter.setIsMonitordataPersistence(false);
//			startParameter.setIsTeststepsPersistence(true);
			startParameter.setIsSend(false);
			startParameter.setIsSendEmail(true);
			startParameter.setEmailAddress(userAccount);
			startParameter.setExecutedByUserId(userAccount);
			startParameter.setRecoverSubscriptReferenceId(0);
			startParameter.setIsAutoRun(true);
			startParameter.setIsTestcaseCollect(true);
			startParameter.setIsTestcasePersist(true);
			startParameter.setIsTeststepCollect(true);
			startParameter.setIsTeststepPersist(true);
			startParameter.setIsTestdataCollect(true);
			startParameter.setIsTestdataPersist(true);
			startParameter.setEngineName(testset.getEngineName());
			startParameter.setTransformConfig("[{\"commuPath\":\"server\",\"dataTypes\":[]},{\"commuPath\":\"client\",\"dataTypes\":[{\"dataType\":\"executiondata\",\"transparentData\":\"NoEntrepotSaveDatabase\"},{\"dataType\":\"excutionresult\",\"transparentData\":\"NoEntrepotSaveDatabase\"}]}]");
			this.mExecutionService.prepareExecutionByScripts(startParameter);

			silenceStartResponse.executionId = executionId;
			silenceStartResponse.silenceStartMessage = "执行成功";
			silenceStartResponse.result=true;
			return new ApiResponse<SilenceStartResponse>(ApiResponse.Success, silenceStartResponse);

		} catch (Exception ex) {
			logger.error("startExecution", ex);
			return new ApiResponse<SilenceStartResponse>(ApiResponse.UnHandleException, silenceStartResponse);
		}
	}

	
	@RequestMapping(value = "/api/execution/start", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> startExecution(
			@RequestBody StartExecutionParameter startExecutionParameter) {
		StartExecutionResultInfo startExecutionResultInfo = new StartExecutionResultInfo();

		try {
			logger.info(String.format("startExecution - executionId:%s", startExecutionParameter.getExecutionId()));

			// if the execution has started, system shall never start it again.
			ExecutionStatusWithResult executionStatus = mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(startExecutionParameter.getExecutionId());
			if (executionStatus != null) {
				throw new Exception();
			}

			mExecutionService.startExecution(startExecutionParameter);

			startExecutionResultInfo.setState(ExecutionContext.Success);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/execution/cancel", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> cancelExecution(@RequestBody ExecutionKeyInfo executionKeyInfo) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();

		try {
			logger.info(String.format("cancelExecution - executionId:%s", executionKeyInfo.getExecutionId()));
			mExecutionService.cancelExecution(executionKeyInfo.getExecutionId());
			resultInfo.setResult(true);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("cancelExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
	@RequestMapping(value = "/api/execution/removeExecutionTestCaseResultByExecutionId", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> removeExecutionTestCaseResultByExecutionId(@RequestBody String executionId) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();
		try {
			logger.info(String.format("removeExecutionTestCaseResultByExecutionId - executionId:%s", executionId));
			//去除字符串中引号
			executionId = executionId.replace("\"", "");
			mExecutionTestCaseResultService.removeExecutionTestCaseResultByExecutionId(executionId);
			resultInfo.setResult(true);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("removeExecutionTestCaseResultByExecutionId", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}


	@RequestMapping(value = "/api/execution/stop", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> stopExecution(@RequestBody ExecutionKeyInfo executionKeyInfo) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();

		try {
			logger.info(String.format("stopExecution - executionId:%s", executionKeyInfo.getExecutionId()));

			ExecutionStatusWithResult executionStatus = mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(executionKeyInfo.getExecutionId());
			if (executionStatus.isActive()) {
				mExecutionService.stopExecution(executionKeyInfo.getExecutionId());
				resultInfo.setResult(true);
			}
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("stopExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/execution/singleStep", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> singleStepExecution(@RequestBody ExecutionKeyInfo executionKeyInfo) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();

		try {
			logger.info(String.format("singleStepExecution - executionId:%s", executionKeyInfo.getExecutionId()));

			ExecutionStatusWithResult executionStatus = mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(executionKeyInfo.getExecutionId());
			if (executionStatus.isActive()) {
				mExecutionService.singleStepExecution(executionKeyInfo.getExecutionId());
				resultInfo.setResult(true);
			}
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("singleStepExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/execution/pause", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> pauseExecution(@RequestBody ExecutionKeyInfo executionKeyInfo) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();

		try {
			logger.info(String.format("pauseExecution - executionId:%s", executionKeyInfo.getExecutionId()));

			ExecutionStatusWithResult executionStatus = mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(executionKeyInfo.getExecutionId());
			if (executionStatus.isRunning()) {
				mExecutionService.pauseExecution(executionKeyInfo.getExecutionId());
				resultInfo.setResult(true);
			} else {
				logger.info(String.format("pauseExecution when status is :%s", executionStatus.getStatus()));
			}
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("pauseExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/execution/resume", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> resumeExecution(@RequestBody ExecutionKeyInfo executionKeyInfo) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();

		try {
			logger.info(String.format("resumeExecution - executionId:%s", executionKeyInfo.getExecutionId()));
			ExecutionStatusWithResult executionStatus = mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(executionKeyInfo.getExecutionId());
			if (executionStatus.isPaused()) {
				mExecutionService.resumeExecution(executionKeyInfo.getExecutionId());
				resultInfo.setResult(true);
			} else {
				logger.info(String.format("resumeExecution when status is :%s", executionStatus.getStatus()));
			}
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("resumeExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	public class SilenceStartResponse{
		public String executionId;
		public String silenceStartMessage;
		public Boolean result;

		public String getSilenceStartMessage() {
			return silenceStartMessage;
		}

		public void setSilenceStartMessage(String silenceStartMessage) {
			this.silenceStartMessage = silenceStartMessage;
		}

		public String getExecutionId() {
			return executionId;
		}

		public void setExecutionId(String executionId) {
			this.executionId = executionId;
		}
	}
	
	public class StartExecutionParams {
		public String executionId;
		public String[] selectedAgentIds;

		public String getExecutionId() {
			return executionId;
		}

		public void setExecutionId(String executionId) {
			this.executionId = executionId;
		}

		public String[] getSelectedAgentIds() {
			return selectedAgentIds;
		}

		public void setSelectedAgentIds(String[] selectedAgentIds) {
			this.selectedAgentIds = selectedAgentIds;
		}
	}
}
