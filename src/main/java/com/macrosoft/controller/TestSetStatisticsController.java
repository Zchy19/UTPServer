package com.macrosoft.controller;

import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionCheckPoint;
import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.Script;
import com.macrosoft.model.TestSet;
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
public class TestSetStatisticsController {

    private static final ILogger logger = LoggerFactory.Create(TestSetStatisticsController.class.getName());

    private ExecutionTestCaseResultService mExecutionTestCaseResultService;
    private ExecutionStatusService mExecutionStatusService;
    private ExecutionResultService mExecutionResultService;
    private RequirementService mRequirementService;
    private ScriptService mScriptService;
    private ExecutionCheckPointService mExecutionCheckPointService;
    private TestSetService mTestSetService;

    @Autowired(required = true)
    
    public void setTestSetService(TestSetService testSetService) {
        this.mTestSetService = testSetService;
    }


    @Autowired(required = true)
    
    public void setScriptService(ScriptService scriptService) {
        this.mScriptService = scriptService;
    }


    @Autowired(required = true)
    
    public void setExecutionCheckPointService(ExecutionCheckPointService executionCheckPointService) {
        this.mExecutionCheckPointService = executionCheckPointService;
    }

    @Autowired(required = true)
    
    public void setExecutionTestResultService(ExecutionTestCaseResultService executionTestCaseResultService) {
        this.mExecutionTestCaseResultService = executionTestCaseResultService;
    }

    @Autowired(required = true)
    
    public void setExecutionStatusDAO(ExecutionStatusService executionStatusService) {
        this.mExecutionStatusService = executionStatusService;
    }

    @Autowired(required = true)
    
    public void setExecutionResultDAO(ExecutionResultService executionResultService) {
        this.mExecutionResultService = executionResultService;
    }

    @Autowired(required = true)
    
    public void setAgentConfigService(RequirementService requirementService) {
        this.mRequirementService = requirementService;
    }

    @RequestMapping(value = "/api/testSetStatisticsController/getExecutionStatusByTestsetIdAndTime", method = RequestMethod.POST)
    public @ResponseBody
    ApiResponse<List<ExecutionStatusWithResult>> getExecutionStatusByTestsetIdAndTime(@RequestBody ExecutionDeletionParameter parameter) {
        List<ExecutionStatusWithResult> executionStatuses = new ArrayList<ExecutionStatusWithResult>();
        List<TestSetStatisticsInfo> TestSetStatisticsInfos = new ArrayList<TestSetStatisticsInfo>();
        try {
            executionStatuses = this.mExecutionStatusService.getExecutionStatusByTestsetIdAndTime(parameter.getProjectId(), parameter.getTestsetId(), parameter.getStartFromDate(), parameter.getEndByDate());
            //获取测试集中结果为success的execution占比
            return new ApiResponse<>(ApiResponse.Success, executionStatuses);
        } catch (Exception ex) {
            logger.error("getExecutionStatusByTestsetIdAndTimedays", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/testSetStatisticsController/statisticsTestsetDurationByProjectId", method = RequestMethod.POST)
    public @ResponseBody
    ApiResponse<List<TestSetStatisticsInfo>> statisticsTestsetDurationByProjectId(@RequestBody ExecutionDeletionParameter parameter) {
        List<TestSetStatisticsInfo> testSetStatisticsInfos = new ArrayList<TestSetStatisticsInfo>();
        try {
            //根据projectId和时间段获取所有测试集执行结果
            List<ExecutionStatusWithResult> executionStatuses = this.mExecutionStatusService.getTestsetExecutionStatusWithResultByProjectIdAndTime(parameter.getProjectId(), parameter.getStartFromDate(), parameter.getEndByDate());
            Map<Long, TestSetStatisticsInfo> testSetMap = new HashMap<>();
            for (ExecutionStatusWithResult executionStatus : executionStatuses) {
                // 获取开始时间和结束时间，并进行非空检查
                Date startTime = executionStatus.getStartTime();
                Date endTime = executionStatus.getEndTime();
                if (startTime == null || endTime == null) {
                    // 如果开始时间或结束时间为null，跳过当前循环
                    continue;
                }
                long testsetId = executionStatus.getTestsetId();
                long duration = (endTime.getTime() - startTime.getTime()) / 1000;
                // 判断该测试集是否已经统计过
                TestSetStatisticsInfo testSetStatisticsInfo = testSetMap.get(testsetId);
                if (testSetStatisticsInfo != null) {
                    // 已存在，直接更新总执行时间
                    testSetStatisticsInfo.setSumTime(testSetStatisticsInfo.getSumTime() + duration);
                } else {
                    TestSet testSet = this.mTestSetService.getTestSetById(parameter.getProjectId(), testsetId);
                    //判断测试集是否存在
                    if (testSet == null) {
                        continue;
                    }
                    //判断该测试集是否被激活
                    Integer activate = testSet.getActivate();
                    if (activate == 0) {
                        continue;
                    }
                    //根据testsetId和projectId获取时间内的checkpoint等于0的个数
                    List<ExecutionCheckPoint> failExecutionCheckPoints = this.mExecutionCheckPointService.getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(parameter.getProjectId(), testsetId, parameter.getStartFromDate(), parameter.getEndByDate());
                    List<ExecutionCheckPoint> successExecutionCheckPoint = this.mExecutionCheckPointService.getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(parameter.getProjectId(), testsetId, parameter.getStartFromDate(), parameter.getEndByDate());
                    //不存在，创建新的TestSetStatisticsInfo对象并加入到List和Map中
                    testSetStatisticsInfo = new TestSetStatisticsInfo();
                    testSetStatisticsInfo.setTestsetId(testsetId);
                    testSetStatisticsInfo.setSumFailCheckPointCount(failExecutionCheckPoints.size());
                    testSetStatisticsInfo.setSumSuccessCheckPointCount(successExecutionCheckPoint.size());
                    testSetStatisticsInfo.setTestsetName(executionStatus.getTestsetName());
                    testSetStatisticsInfo.setSumTime(duration);
                    testSetStatisticsInfos.add(testSetStatisticsInfo);
                    testSetMap.put(testsetId, testSetStatisticsInfo);
                }
            }
            //testSetStatisticsInfos根据name进行降序排序
            testSetStatisticsInfos.sort(Comparator.comparing(TestSetStatisticsInfo::getTestsetName));
            return new ApiResponse<>(ApiResponse.Success, testSetStatisticsInfos);
        } catch (Exception ex) {
            logger.error("statisticsTestsetDurationByProjectId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }

    }

    @RequestMapping(value = "/api/testSetStatisticsController/statisticsTestsetCheckPointByProjectId", method = RequestMethod.POST)
    public @ResponseBody
    ApiResponse<List<TestSetStatisticsInfo>> statisticsTestsetCheckPointByProjectId(@RequestBody ExecutionDeletionParameter parameter) {
        List<TestSetStatisticsInfo> testSetStatisticsInfos = new ArrayList<TestSetStatisticsInfo>();
        try {
            //根据projectId和时间段获取所有测试集执行结果
            List<ExecutionStatusWithResult> executionStatuses = this.mExecutionStatusService.getTestsetExecutionStatusWithResultByProjectIdAndTime(parameter.getProjectId(), parameter.getStartFromDate(), parameter.getEndByDate());
            Map<Long, TestSetStatisticsInfo> testSetMap = new HashMap<>();
            for (ExecutionStatusWithResult executionStatus : executionStatuses) {
                long testsetId = executionStatus.getTestsetId();
                // 判断该测试集是否已经统计过
                TestSetStatisticsInfo testSetStatisticsInfo = testSetMap.get(testsetId);
                if (testSetStatisticsInfo == null) {
                    TestSet testSet = this.mTestSetService.getTestSetById(parameter.getProjectId(), testsetId);
                    //判断测试集是否存在
                    if (testSet == null) {
                        continue;
                    }
                    //判断该测试集是否被激活
                    Integer activate = testSet.getActivate();
                    if (activate == 0) {
                        continue;
                    }
                    testSetStatisticsInfo = new TestSetStatisticsInfo();
                    testSetStatisticsInfo.setSumManualDecisionLevel0(0);
                    testSetStatisticsInfo.setSumManualDecisionLevel1(0);
                    testSetStatisticsInfo.setSumManualDecisionLevel2(0);
                    testSetStatisticsInfo.setSumManualDecisionLevel3(0);
                    testSetStatisticsInfo.setSumManualDecisionLevel4(0);
                    testSetStatisticsInfo.setSumManualDecisionLevel5(0);
                    //根据testsetId和projectId获取时间内的checkpoint等于0的个数
                    List<ExecutionCheckPoint> failExecutionCheckPoints = this.mExecutionCheckPointService.getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(parameter.getProjectId(), testsetId, parameter.getStartFromDate(), parameter.getEndByDate());
                    List<ExecutionCheckPoint> successExecutionCheckPoint = this.mExecutionCheckPointService.getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(parameter.getProjectId(), testsetId, parameter.getStartFromDate(), parameter.getEndByDate());
                    //不存在，创建新的TestSetStatisticsInfo对象并加入到List和Map中
                    //遍历failExecutionCheckPoints,获取失败的checkpoint失败等级
                    for (ExecutionCheckPoint failExecutionCheckPoint : failExecutionCheckPoints) {
                        int manualDecisionLevel = failExecutionCheckPoint.getManualDecisionLevel();
                        switch (manualDecisionLevel) {
                            case 0:
                                testSetStatisticsInfo.setSumManualDecisionLevel0(testSetStatisticsInfo.getSumManualDecisionLevel0() + 1);
                                break;
                            case 1:
                                testSetStatisticsInfo.setSumManualDecisionLevel1(testSetStatisticsInfo.getSumManualDecisionLevel1() + 1);
                                break;
                            case 2:
                                testSetStatisticsInfo.setSumManualDecisionLevel2(testSetStatisticsInfo.getSumManualDecisionLevel2() + 1);
                                break;
                            case 3:
                                testSetStatisticsInfo.setSumManualDecisionLevel3(testSetStatisticsInfo.getSumManualDecisionLevel3() + 1);
                                break;
                            case 4:
                                testSetStatisticsInfo.setSumManualDecisionLevel4(testSetStatisticsInfo.getSumManualDecisionLevel4() + 1);
                                break;
                            case 5:
                                testSetStatisticsInfo.setSumManualDecisionLevel5(testSetStatisticsInfo.getSumManualDecisionLevel5() + 1);
                                break;
                            default:
                                break;
                        }

                    }
                    testSetStatisticsInfo.setTestsetId(testsetId);
                    testSetStatisticsInfo.setSumFailCheckPointCount(failExecutionCheckPoints.size());
                    testSetStatisticsInfo.setSumSuccessCheckPointCount(successExecutionCheckPoint.size());
                    testSetStatisticsInfo.setTestsetName(executionStatus.getTestsetName());
                    testSetStatisticsInfos.add(testSetStatisticsInfo);
                    testSetMap.put(testsetId, testSetStatisticsInfo);
                }
            }
            //testSetStatisticsInfos根据name进行降序排序
            testSetStatisticsInfos.sort(Comparator.comparing(TestSetStatisticsInfo::getTestsetName));
            return new ApiResponse<>(ApiResponse.Success, testSetStatisticsInfos);
        } catch (Exception ex) {
            logger.error("statisticsTestsetDurationByProjectId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }

    }

    @RequestMapping(value = "/api/testSetStatisticsController/statisticsManualDecisionLevelByProjectIdAndTestsetId", method = RequestMethod.POST)
    public @ResponseBody
    ApiResponse<Map<String, TestSetStatisticsInfo>> statisticsManualDecisionLevelByProjectIdAndTestsetId(@RequestBody ExecutionDeletionParameter parameter) {
        try {
            //定义一个map用于存放checkPointName和duration
            Map<String, TestSetStatisticsInfo> checkPointNameAndDurations = new HashMap<>();
            List<ExecutionCheckPoint> executionCheckPoints = this.mExecutionCheckPointService.getExecutionCheckPointByProjectIdAndTestsetIdAndTime(parameter.getProjectId(), parameter.getTestsetId(), parameter.getStartFromDate(), parameter.getEndByDate());
            for (ExecutionCheckPoint executionCheckPoint : executionCheckPoints) {
                //获取时间
                String checkPointName = executionCheckPoint.getCheckPointName();
                // 判断该测试集是否已经统计过
                TestSetStatisticsInfo testSetStatisticsInfo = checkPointNameAndDurations.get(checkPointName);
                if (testSetStatisticsInfo != null) {
                    if (executionCheckPoint.getResult() == 1) {
                        testSetStatisticsInfo.setSumSuccessCheckPointCount(testSetStatisticsInfo.getSumSuccessCheckPointCount() + 1);
                    } else if (executionCheckPoint.getResult() == 0) {
                        testSetStatisticsInfo.setSumFailCheckPointCount(testSetStatisticsInfo.getSumFailCheckPointCount() + 1);
                        //根据checkpoint的失败等级进行统计
                        int manualDecisionLevel = executionCheckPoint.getManualDecisionLevel();
                        switch (manualDecisionLevel) {
                            case 0:
                                testSetStatisticsInfo.setSumManualDecisionLevel0(testSetStatisticsInfo.getSumManualDecisionLevel0() + 1);
                                break;
                            case 1:
                                testSetStatisticsInfo.setSumManualDecisionLevel1(testSetStatisticsInfo.getSumManualDecisionLevel1() + 1);
                                break;
                            case 2:
                                testSetStatisticsInfo.setSumManualDecisionLevel2(testSetStatisticsInfo.getSumManualDecisionLevel2() + 1);
                                break;
                            case 3:
                                testSetStatisticsInfo.setSumManualDecisionLevel3(testSetStatisticsInfo.getSumManualDecisionLevel3() + 1);
                                break;
                            case 4:
                                testSetStatisticsInfo.setSumManualDecisionLevel4(testSetStatisticsInfo.getSumManualDecisionLevel4() + 1);
                                break;
                            case 5:
                                testSetStatisticsInfo.setSumManualDecisionLevel5(testSetStatisticsInfo.getSumManualDecisionLevel5() + 1);
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    // 不存在，创建新的TestSetStatisticsInfo对象并加入到List和Map中
                    testSetStatisticsInfo = new TestSetStatisticsInfo();
                    testSetStatisticsInfo.setCheckPointName(checkPointName);
                    if (executionCheckPoint.getResult() == 1) {
                        testSetStatisticsInfo.setSumSuccessCheckPointCount(1);
                        testSetStatisticsInfo.setSumFailCheckPointCount(0);
                    } else if (executionCheckPoint.getResult() == 0) {
                        testSetStatisticsInfo.setSumFailCheckPointCount(1);
                        testSetStatisticsInfo.setSumSuccessCheckPointCount(0);
                        //根据checkpoint的失败等级进行统计
                        int manualDecisionLevel = executionCheckPoint.getManualDecisionLevel();

                        switch (manualDecisionLevel) {
                            case 0:
                                testSetStatisticsInfo.setSumManualDecisionLevel0(1);
                                break;
                            case 1:
                                testSetStatisticsInfo.setSumManualDecisionLevel1(1);
                                break;
                            case 2:
                                testSetStatisticsInfo.setSumManualDecisionLevel2(1);
                                break;
                            case 3:
                                testSetStatisticsInfo.setSumManualDecisionLevel3(1);
                                break;
                            case 4:
                                testSetStatisticsInfo.setSumManualDecisionLevel4(1);
                                break;
                            case 5:
                                testSetStatisticsInfo.setSumManualDecisionLevel5(1);
                                break;
                            default:
                                break;
                        }

                    }
                    checkPointNameAndDurations.put(checkPointName, testSetStatisticsInfo);
                }

            }

            return new ApiResponse<>(ApiResponse.Success, checkPointNameAndDurations);
        } catch (Exception ex) {
            logger.error("statisticsManualDecisionLevelByProjectIdAndTestsetId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testSetStatisticsController/statisticsTimeByProjectIdAndTestsetId", method = RequestMethod.POST)
    public @ResponseBody
    ApiResponse<Map<String, TestSetStatisticsInfo>> statisticsTimeByProjectIdAndTestsetId(@RequestBody ExecutionDeletionParameter parameter) {
        try {
            //定义一个map用于存放checkPointName和duration
            Map<String, TestSetStatisticsInfo> checkPointNameAndDurations = new HashMap<>();
            List<ExecutionCheckPoint> executionCheckPoints = this.mExecutionCheckPointService.getExecutionCheckPointByProjectIdAndTestsetIdAndTime(parameter.getProjectId(), parameter.getTestsetId(), parameter.getStartFromDate(), parameter.getEndByDate());
            for (ExecutionCheckPoint executionCheckPoint : executionCheckPoints) {
                //获取时间
                Date startTime = executionCheckPoint.getStartTime();
                Date endTime = executionCheckPoint.getEndTime();
                if (startTime == null || endTime == null) {
                    // 如果开始时间或结束时间为null，跳过当前循环
                    continue;
                }
                long duration = (endTime.getTime() - startTime.getTime()) / 1000;
                String checkPointName = executionCheckPoint.getCheckPointName();
                // 判断该测试集是否已经统计过
                TestSetStatisticsInfo testSetStatisticsInfo = checkPointNameAndDurations.get(checkPointName);
                if (testSetStatisticsInfo != null) {
                    // 已存在，直接更新总执行时间
                    testSetStatisticsInfo.setSumTime(testSetStatisticsInfo.getSumTime() + duration);
                    if (executionCheckPoint.getResult() == 1) {
                        testSetStatisticsInfo.setSumSuccessCheckPointCount(testSetStatisticsInfo.getSumSuccessCheckPointCount() + 1);
                    } else if (executionCheckPoint.getResult() == 0) {
                        testSetStatisticsInfo.setSumFailCheckPointCount(testSetStatisticsInfo.getSumFailCheckPointCount() + 1);
                    }
                } else {
                    // 不存在，创建新的TestSetStatisticsInfo对象并加入到List和Map中
                    testSetStatisticsInfo = new TestSetStatisticsInfo();
                    testSetStatisticsInfo.setCheckPointName(checkPointName);
                    testSetStatisticsInfo.setSumTime(duration);
                    if (executionCheckPoint.getResult() == 1) {
                        testSetStatisticsInfo.setSumSuccessCheckPointCount(1);
                        testSetStatisticsInfo.setSumFailCheckPointCount(0);
                    } else if (executionCheckPoint.getResult() == 0) {
                        testSetStatisticsInfo.setSumFailCheckPointCount(1);
                        testSetStatisticsInfo.setSumSuccessCheckPointCount(0);
                    }
                    checkPointNameAndDurations.put(checkPointName, testSetStatisticsInfo);
                }

            }

            return new ApiResponse<>(ApiResponse.Success, checkPointNameAndDurations);
        } catch (Exception ex) {
            logger.error("statisticsTimeByProjectIdAndTestsetId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/testSetStatisticsController/statisticsTestsetsNumberByProjectIdAndTime", method = RequestMethod.POST)
    public @ResponseBody
    ApiResponse<Map<Date, List<TestSetStatisticsInfo>>> statisticsTestsetsNumberByProjectIdAndTime(@RequestBody ExecutionDeletionParameter parameter) {
        try {
            Date startDate = new Date(parameter.getStartFromDate().getTime());
            Date endDate = new Date(parameter.getEndByDate().getTime());
            Map<Date, List<TestSetStatisticsInfo>> timeTestSetMap = new HashMap<>();
            while (startDate.compareTo(endDate) < 0) {
                Date nextDay = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
                List<ExecutionStatusWithResult> executionStatuses = this.mExecutionStatusService.getTestsetExecutionStatusWithResultByProjectIdAndTime(parameter.getProjectId(), startDate, nextDay);
                Map<Long, TestSetStatisticsInfo> testSetMap = new HashMap<>();
                for (ExecutionStatusWithResult executionStatus : executionStatuses) {
                    long testsetId = executionStatus.getTestsetId();
                    TestSetStatisticsInfo testSetStatisticsInfo = testSetMap.computeIfAbsent(testsetId, id -> {
                        TestSetStatisticsInfo info = new TestSetStatisticsInfo();
                        info.setTestsetId(id);
                        info.setTestsetName(executionStatus.getTestsetName());
                        info.setSumSuccessCount(0);
                        info.setSumTestsetCount(0);
                        return info;
                    });
                    if (executionStatus.getResult().equals("Success")) {
                        testSetStatisticsInfo.setSumSuccessCount(testSetStatisticsInfo.getSumSuccessCount() + 1);
                    }
                    testSetStatisticsInfo.setSumTestsetCount(testSetStatisticsInfo.getSumTestsetCount() + 1);
                }
//                timeTestSetMap.put(startDate, new ArrayList<>(testSetMap.values()));
                timeTestSetMap.put(nextDay, new ArrayList<>(testSetMap.values()));
                Collections.sort(timeTestSetMap.get(nextDay), Comparator.comparing(TestSetStatisticsInfo::getTestsetId));
                startDate = nextDay;
            }
            //判断测试集列表是否为空，如果为空则返回空列表
//            if (timeTestSetMap.get(startDate) != null) {
//                Collections.sort(timeTestSetMap.get(startDate), Comparator.comparing(TestSetStatisticsInfo::getTestsetId));
//            }
            return new ApiResponse<>(ApiResponse.Success, timeTestSetMap);
        } catch (Exception ex) {
            logger.error("statisticsTestsetsNumberByProjectIdAndTime", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testSetStatisticsController/statisticsExecutionByExecutionId/{executionId}", method = RequestMethod.GET)
    public @ResponseBody
    ApiResponse<List<ExecutionTestCaseResult>> statisticsExecutionByExecutionId(
            @PathVariable("executionId") String executionId) {
        logger.info("statisticsExecutionByExecutionId: " + executionId);

        try {
            List<ExecutionTestCaseResult> executionTestCaseResults = this.mExecutionTestCaseResultService.listExecutionTestCaseResults(executionId);
            //遍历查询结果等于-1的ExecutionTestCaseResult
            for (ExecutionTestCaseResult executionTestCaseResult : executionTestCaseResults) {
                if (executionTestCaseResult.getResult() == -1) {
                    //根据scriptId查询对应的脚本信息
                    Script script = this.mScriptService.getScriptByScriptId(executionTestCaseResult.getScriptId());
                    //将scriptName设置到executionTestCaseResult中
                    executionTestCaseResult.setScriptName(script.getName());
                }
            }
            return new ApiResponse<>(ApiResponse.Success, executionTestCaseResults);
        } catch (Exception ex) {
            logger.error("statisticsExecutionByExecutionId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

}
