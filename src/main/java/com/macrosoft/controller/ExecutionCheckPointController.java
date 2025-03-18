package com.macrosoft.controller;

import com.macrosoft.controller.dto.ExecutionDataInfo;
import com.macrosoft.controller.dto.ExecutionDeletionParameter;
import com.macrosoft.controller.dto.ProjectSpecialTestInfo;
import com.macrosoft.controller.dto.TestsetStatus;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Handles requests for the application home page.
 */
@Controller
public class ExecutionCheckPointController {

	private static final ILogger logger = LoggerFactory.Create(ExecutionCheckPointController.class.getName());

	private ExecutionCheckPointService mExecutionCheckPointService;
	private TestSetService mTestSetService;
	private ExecutionStatusService mExecutionStatusService;
	private SpecialTestService mSpecialTestService;
	private ProjectService mProjectService;
	private SpecialTestDataService mSpecialTestDataService;


	@Autowired(required = true)
	public void setSpecialTestDataService(SpecialTestDataService specialTestDataService) {
		this.mSpecialTestDataService = specialTestDataService;
	}


	@Autowired(required = true)
	
	public void setProjectService(ProjectService ps) {
		this.mProjectService = ps;
	}


	@Autowired(required = true)
	
	public void setExecutionCheckPointService(ExecutionCheckPointService ps)
	{
		this.mExecutionCheckPointService = ps;
	}

	@Autowired(required = true)
	
	public void setTestSetService(TestSetService testSetService) {
		this.mTestSetService = testSetService;
	}

	@Autowired(required = true)
	
	public void setExecutionStatusService(ExecutionStatusService ps)
	{
		this.mExecutionStatusService = ps;
	}

	@Autowired(required = true)
	
	public void setSpecialTestService(SpecialTestService specialTestService) {
		this.mSpecialTestService = specialTestService;
	}

	@RequestMapping(value = "/api/executionCheckPoint/getExecutionCheckPointByProjectIdAndTime", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Map<String, Integer>> getExecutionCheckPointByProjectIdAndTime(@RequestBody ExecutionDeletionParameter parameter){
		try {
			Date startTime = new Date(parameter.getStartFromDate().getTime());
			Date endTime = new Date(parameter.getEndByDate().getTime());
			long projectId = parameter.getProjectId();
			List<ExecutionCheckPoint> executionCheckPoints = this.mExecutionCheckPointService.getExecutionCheckPointByProjectIdAndTime(projectId,startTime,endTime);
			//遍历列表，将CheckPointName存入数组
			//定义一个MAP，key为CheckPointName，value为CheckPointName次数加1
			Map<String, Integer> checkPointCounts = new HashMap<>();
			for(ExecutionCheckPoint executionCheckPoint : executionCheckPoints){
				String checkPointName = executionCheckPoint.getCheckPointName();
				if(checkPointName != null){
					//如果MAP中存在key为checkPointName的值，则将value加1
					//如果MAP中不存在key为checkPointName的值，则将key为checkPointName的值加入MAP，并将value设为1
					checkPointCounts.put(checkPointName, checkPointCounts.getOrDefault(checkPointName, 0) + 1);
				}

			}
			return new ApiResponse<>(ApiResponse.Success, checkPointCounts);

		} catch (Exception ex) {
			logger.error("getExecutionCheckPointByProjectId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/executionCheckPoint/updateManualDecisionLevel/{checkpointId}/{level}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Boolean> updateManualDecisionLevel(@PathVariable("checkpointId") int checkpointId,@PathVariable("level") int level) {

		try {
			boolean b = mExecutionCheckPointService.updateManualDecisionLevel(checkpointId, level);
			return new ApiResponse<>(ApiResponse.Success, b);
		}catch (Exception ex) {
			logger.error("updateManualDecisionLevel", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, false);
		}
	}
	@RequestMapping(value = "/api/executionCheckPoint/getProjectOperationDataByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<TestsetStatus>> getProjectOperationDataByProjectId(
			@PathVariable("projectId") long projectId) {
		try {
			// 获取项目下所有的测试集
			List<TestsetStatus> testsetStatuses = new ArrayList<>();
			List<TestSet> testSets = this.mTestSetService.listTestSetsByProjectIdAndActivate(projectId);
			for (TestSet testSet : testSets) {
				TestsetStatus testsetStatus = new TestsetStatus();
				long testsetId = testSet.getId();
				testsetStatus.setTestsetName(testSet.getName());
				// 获取测试集下的所有测试数据
				ExecutionStatusWithResult executionStatus = this.mExecutionStatusService.getExecutionStatusByTestsetIdAndNew(projectId, testsetId);
				if (executionStatus != null) {
					String executionId = executionStatus.getExecutionId();
					String status = executionStatus.getStatus();
					String executionResult = executionStatus.getResult();
					List<ExecutionCheckPoint> executionCheckPoints = mExecutionCheckPointService.getExecutionCheckPointByExecutionId(executionId);
					int checkPointFail = 0;
					int checkPointSuccess = 0;
					for (ExecutionCheckPoint executionCheckPoint : executionCheckPoints) {
						int result = executionCheckPoint.getResult();
						if (result == 1) {
							checkPointSuccess++;
						} else if (result == 0) {
							checkPointFail++;
						}
					}
					testsetStatus.setResult(executionResult);
					testsetStatus.setCheckFailCount(checkPointFail);
					testsetStatus.setCheckSuccessCount(checkPointSuccess);
					testsetStatus.setCheckExecutedCount(checkPointSuccess + checkPointFail);
					if ("Running".equalsIgnoreCase(status)||"Starting".equalsIgnoreCase(status)||"Paused".equalsIgnoreCase(status)||"Pausing".equalsIgnoreCase(status)||"Resuming".equalsIgnoreCase(status)) {
						testsetStatus.setStatus(status);
						if (!executionCheckPoints.isEmpty()) {
							testsetStatus.setCheckPointName(executionCheckPoints.get(0).getCheckPointName());
						} else {
							testsetStatus.setCheckPointName("");
						}
					} else {
						testsetStatus.setStatus(status);
					}
				} else {
					testsetStatus.setStatus("NotRun");
					testsetStatus.setResult("NotRun");
				}
				testsetStatuses.add(testsetStatus);
			}
			return new ApiResponse<>(ApiResponse.Success, testsetStatuses);
		} catch (Exception ex) {
			logger.error("getProjectOperationDataByProjectId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/getOperationData/{projectIds}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ProjectSpecialTestInfo>> getProjectOperationDataByProjects(
			@PathVariable("projectIds") ArrayList<Integer> projectIdS) {
		try {
			//获取项目下所有的测试集
			List<ProjectSpecialTestInfo> projectSpecialTestes = new ArrayList<>();
			//遍历projectIdS,获取所有的项目
			if (projectIdS.size() > 0) {
				for (int i = 0; i < projectIdS.size(); i++) {
					long projectId = projectIdS.get(i);
					//根据项目Id,获取项目下的所有的specialtest
					List<SpecialTest> specialTests = this.mSpecialTestService.listSpecialTestsByProjectId(projectId);
					if (specialTests.size()==0){
						//跳过
						continue;
					}
					SpecialTest specialTest=specialTests.get(0);
					//获取第一个specialtest
					List<SpecialTestData> specialTestData = mSpecialTestDataService.listDaySpecialTestDatesBySpecialTestId(specialTest.getId());
					//根据项目获取项目名称
					Project project = this.mProjectService.getProjectById(projectId);
					ProjectSpecialTestInfo projectSpecialTestInfo = new ProjectSpecialTestInfo();
					projectSpecialTestInfo.setProjectName(project.getName());
					projectSpecialTestInfo.setExecutedTotal(specialTestData.size());
					// 获取测试集下的所有测试数据
					ExecutionStatusWithResult executionStatus = this.mExecutionStatusService.getExecutionStatusByTestsetIdAndNew(projectId, 0);
					if (executionStatus != null) {
						String status = executionStatus.getStatus();
						String executionResult = executionStatus.getResult();
						projectSpecialTestInfo.setResult(executionResult);
						projectSpecialTestInfo.setStatus(status);
						if ("Running".equalsIgnoreCase(status)||"Starting".equalsIgnoreCase(status)||"Paused".equalsIgnoreCase(status)||"Pausing".equalsIgnoreCase(status)||"Resuming".equalsIgnoreCase(status)) {
							projectSpecialTestInfo.setStatus(status);
							projectSpecialTestInfo.setStartTime(executionStatus.getStartTime());
						} else {
							projectSpecialTestInfo.setStatus(status);
							projectSpecialTestInfo.setStartTime(executionStatus.getStartTime());
							projectSpecialTestInfo.setEndTime(executionStatus.getEndTime());
						}
					} else {
						projectSpecialTestInfo.setStatus("NotRun");
						projectSpecialTestInfo.setResult("NotRun");
					}
					projectSpecialTestes.add(projectSpecialTestInfo);
				}
			}
			return new ApiResponse<>(ApiResponse.Success, projectSpecialTestes);
		} catch (Exception ex) {
			logger.error("getProjectOperationDataByProjects", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}


}
