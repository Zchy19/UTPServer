package com.macrosoft.controller;

import java.util.*;

import javax.servlet.ServletContext;

import com.macrosoft.model.*;
import com.macrosoft.service.*;
import com.macrosoft.service.impl.ExportToWordServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.DownloadingInfo;
import com.macrosoft.controller.dto.ExecutionDeletionParameter;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.composition.ExecutionStatusWithResult;

@Controller
public class ExecutionStatusController {
	private static final ILogger logger = LoggerFactory.Create(ExecutionStatusController.class.getName());

	private ProjectService mProjectService;
	private ScriptService mScriptService;
	private ScriptLinkService mScriptLinkService;
	private AgentConfigService mAgentConfigService;
	private UrsConfigurationImpl ursConfig;

	private ExecutionStatusService mExecutionStatusService;
	private ExecutionResultService mExecutionResultService;

	private ExportToWordService mExportToWordService;
	private TestSetService mTestSetService;

	@Autowired(required = true)
	
	public void setTestSetService(TestSetService testSetService) {
		this.mTestSetService = testSetService;
	}

	@Autowired(required = true)
	
	public void setExportToWordService(ExportToWordService es) {
		this.mExportToWordService = es;
	}
	
	
	@Autowired
	ServletContext context;

    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

	@Autowired(required = true)
	
	public void setAgentConfigService(AgentConfigService ps) {
		this.mAgentConfigService = ps;
	}

	@Autowired(required = true)
	
	public void setProjectService(ProjectService ps) {
		this.mProjectService = ps;
	}
	
	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.mScriptService = scriptService;
	}

	@Autowired(required = true)
	
	public void setScriptLinkService(ScriptLinkService scriptLinkService) {
		this.mScriptLinkService = scriptLinkService;
	}

	@Autowired(required = true)
	
	public void setExecutionResultService(ExecutionResultService executionResultService) {
		this.mExecutionResultService = executionResultService;
	}
	
	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService ps) {
		this.mExecutionStatusService = ps;
	}

	@RequestMapping(value = "/api/query/executionStatus/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ExecutionStatusWithResult> getExecutionStatusNew(
			@PathVariable("executionId") String executionId) {
		try {
			ExecutionStatusWithResult s = this.mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(executionId);
			return new ApiResponse<ExecutionStatusWithResult>(ApiResponse.Success, s);
		} catch (Exception ex) {
			logger.error("getExecutionStatusNew", ex);
			return new ApiResponse<ExecutionStatusWithResult>(ApiResponse.UnHandleException, null);
		}
	}

	// 根据执行ID获取执行状态
	@RequestMapping(value = "/api/query/executionResult/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Map<String,Boolean>> externalStatus(
			@PathVariable("executionId") String executionId) {
		Map<String,Boolean>  externalStatusMap = new HashMap<String,Boolean> ();
		try {
			ExecutionStatusWithResult s = this.mExecutionStatusService
					.getExecutionStatusWithResultByExecutionId(executionId);
			if(s==null){
				return new ApiResponse<Map<String,Boolean>>(ApiResponse.UnHandleException, externalStatusMap);
			}
			String externalStatus=s.getStatus();
			if (externalStatus.equals(ExecutionStatus.CompletedString)){
				externalStatusMap.put("completed", true);
				if (s.getResult().equals("Success")){
					externalStatusMap.put("result", true);
				}else{
					externalStatusMap.put("result", false);
				}
				return new ApiResponse<Map<String,Boolean>>(ApiResponse.Success, externalStatusMap);
			}
			else if(externalStatus.equals(ExecutionStatus.StoppedString)||externalStatus.equals(ExecutionStatus.TerminatedString)){
				externalStatusMap.put("completed", true);
				externalStatusMap.put("result", false);
				return new ApiResponse<Map<String,Boolean>>(ApiResponse.Success, externalStatusMap);
			}else
			{
				externalStatusMap.put("completed", false);
				externalStatusMap.put("result", false);
				return new ApiResponse<Map<String,Boolean>>(ApiResponse.Success, externalStatusMap);
			}
		} catch (Exception ex) {
			logger.error("externalStatus", ex);
			return new ApiResponse<Map<String,Boolean>>(ApiResponse.UnHandleException, externalStatusMap);
		}
	}


	@RequestMapping(value = "/api/query/executionStatus/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionStatusWithResult>> getExecutionListNew(
			@PathVariable("projectId") long projectId) {
		List<ExecutionStatusWithResult> executionStatuss = new ArrayList<ExecutionStatusWithResult>();
		try {
			executionStatuss = this.mExecutionStatusService.getExecutionStatusByProjectId(projectId);
			sortExecutionStatusWithResult(executionStatuss);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.Success, executionStatuss);
		} catch (Exception ex) {
			logger.error("getExecutionListNew", ex);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/query/executionStatus/getByTestsetName/{projectName}/{testsetName}/{orgId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionStatusWithResult>> getExecutionListByTestset(
			@PathVariable("projectName") String projectName, @PathVariable("testsetName") String testsetName,@PathVariable("orgId") Long orgId) {
		List<ExecutionStatusWithResult> executionStatuss = new ArrayList<ExecutionStatusWithResult>();
		try {
			//根据projectName获取projectId
			List<Project> projects = this.mProjectService.listProjectByProjectName(orgId, projectName);
			if(projects.size() != 1){
				return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
			}
			long projectId = projects.get(0).getId();
			//根据testsetName获取testsetId
			List<TestSet> testSets = this.mTestSetService.listTestSetsByTestSetName(projectId, testsetName);
			if(testSets.size()!= 1){
				return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
			}
			long testsetId = testSets.get(0).getId();
			executionStatuss = this.mExecutionStatusService.getExecutionStatusByTestsetId(projectId, testsetId);
			sortExecutionStatusWithResult(executionStatuss);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.Success, executionStatuss);
		} catch (Exception ex) {
			logger.error("getExecutionListNew", ex);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/query/executionStatus/getByTestsetId/{projectId}/{testsetId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionStatusWithResult>> getExecutionListByTestsetId(
								@PathVariable("projectId") long projectId, @PathVariable("testsetId") long testsetId) {
		List<ExecutionStatusWithResult> executionStatuss = new ArrayList<ExecutionStatusWithResult>();
		try {
			executionStatuss = this.mExecutionStatusService.getExecutionStatusByTestsetId(projectId, testsetId);
			sortExecutionStatusWithResult(executionStatuss);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.Success, executionStatuss);
		} catch (Exception ex) {
			logger.error("getExecutionListNew", ex);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/query/executionStatus/active/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionStatusWithResult>> getActiveExectuionNew(
			@PathVariable("projectId") long projectId) {
		List<ExecutionStatusWithResult> executionStatuss = new ArrayList<ExecutionStatusWithResult>();
		try {
			executionStatuss = this.mExecutionStatusService.getActiveExecutionStatusByProjectId(projectId);
			sortExecutionStatusWithResult(executionStatuss);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.Success, executionStatuss);
		} catch (Exception ex) {
			logger.error("getActiveExectuionNew", ex);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/query/executionStatus/completed/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionStatusWithResult>> getCompletedExectuionNew(
			@PathVariable("projectId") long projectId) {

		List<ExecutionStatusWithResult> executionStatuss = new ArrayList<ExecutionStatusWithResult>();
		try {
			executionStatuss = this.mExecutionStatusService.getCompletedExecutionStatusByProjectId(projectId);
			sortExecutionStatusWithResult(executionStatuss);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.Success, executionStatuss);
		} catch (Exception ex) {
			logger.error("getCompletedExectuionNew", ex);
			return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/executionStatus/deleteExecutionById/{executionId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteExecutionById(@PathVariable("executionId") String executionId) {
		try {
			this.mExecutionStatusService.removeExecutionData(executionId);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteExecutionById", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/executionStatus/deleteExecutionByPeriod", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteExecutionByPeriod(@RequestBody ExecutionDeletionParameter parameter) {
		try {
			List<ExecutionStatusWithResult> list = this.mExecutionStatusService.getExecutionStatusBetween(
					parameter.getProjectId(), parameter.getStartFromDate(), parameter.getEndByDate());
			for (ExecutionStatusWithResult statusResult : list) {
				this.mExecutionStatusService.removeExecutionData(statusResult.getExecutionId());
			}

			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteExecutionByPeriod", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}


	@RequestMapping(value = "/api/execution/export/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<DownloadingInfo> exportExecutionToWord(@PathVariable("executionId") String executionId) {
		try {
			if (executionId == null || executionId.isEmpty())
			{
				logger.info(String.format("it is not a valid testset execution, can not export. executionId: %s ", executionId));
				return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
			}
			String absolutePath= mExportToWordService.exportToWord(executionId);
			if (absolutePath == null || absolutePath.isEmpty())
			{
				logger.info(String.format("it is not a valid testset execution, can not export. executionId: %s ", executionId));
				return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
			}
			String fileName= ExportToWordServiceImpl.fileName(absolutePath);
			DownloadingInfo info = new DownloadingInfo();
			info.setFileName(fileName);
			info.setFilePath(ReportUtility.GetStaticDownloadPath(fileName));
			
			return new ApiResponse<DownloadingInfo>(ApiResponse.Success, info);
			
		} catch (Exception ex) {
			logger.error(String.format("exportExecutionToWord has exception - :%s", ex.toString()));
			return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
		}
	}

	private List<ExecutionStatusWithResult> sortExecutionStatusWithResult(
			List<ExecutionStatusWithResult> executionStatuss) {
		executionStatuss.sort(new Comparator<ExecutionStatusWithResult>() {
			public int compare(ExecutionStatusWithResult n1, ExecutionStatusWithResult n2) {
				if (n1.getStartTime().after(n2.getStartTime())) {
					return -1;
				} else if (n1.getStartTime().before(n2.getStartTime())) {
					return 1;
				} else
					return 0;
			}
		});
		return executionStatuss;
	}
}
