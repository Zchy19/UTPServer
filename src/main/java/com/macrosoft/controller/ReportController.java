package com.macrosoft.controller;

import com.macrosoft.model.*;
import com.macrosoft.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.text.SimpleDateFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.controller.dto.ExecutionTestCaseResultInfo;
import com.macrosoft.controller.dto.QueryQualityReportParameter;
import com.macrosoft.controller.dto.TestReportQueryParameter;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.utilities.MasterDbUtil;
import com.macrosoft.utilities.ParserResult;
import com.macrosoft.utilities.StringUtility;

import java.util.*;

/**
 * Handles requests for the application home page.
 */
@Controller
public class ReportController {

    private static final ILogger logger = LoggerFactory.Create(ReportController.class.getName());

    private ExecutionTestCaseResultService mExecutionTestCaseResultService;
    private ExecutionStatusService mExecutionStatusService;
    private ExecutionResultService mExecutionResultService;
    private RequirementService mRequirementService;
    private ExecutionCheckPointService mExecutionCheckPointService;
    private ScriptService mScriptService;
    @Autowired(required = true)
    
    public void setScriptService(ScriptService scriptService) {
        this.mScriptService = scriptService;
    }


    @Autowired
    
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
    @RequestMapping(value = "/api/query/qualityReport", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<List<ExecutionQualityByDay>> getExecutionQuality(
            @RequestBody QueryQualityReportParameter parameter) {
        logger.info(String.format("QueryQualityReportParameter params: %s", parameter));

        List<ExecutionQualityByDay> qualityByDayList = new ArrayList<ExecutionQualityByDay>();

        Calendar fromDateCalendar = Calendar.getInstance();
        fromDateCalendar.setTime(parameter.getStartFromDate());

        Calendar endDateCalendar = Calendar.getInstance();
        endDateCalendar.setTime(parameter.getEndByDate());
        endDateCalendar.add(Calendar.DATE, +1);

        Calendar currentDateCalendar = Calendar.getInstance();
        currentDateCalendar.setTime(parameter.getStartFromDate());

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");

        while (currentDateCalendar.getTime().before(endDateCalendar.getTime())) {
            ExecutionQualityByDay qualityByDay = new ExecutionQualityByDay();

            qualityByDay.date = currentDateCalendar.getTime();

            qualityByDayList.add(qualityByDay);

            // get next day date
            currentDateCalendar.add(Calendar.DATE, +1);
        }

        try {
            List<ExecutionTestCaseResult> testCaseResultList = mExecutionTestCaseResultService
                    .listExecutionTestCaseResults(parameter.getProjectId(), MasterDbUtil.getInstance().getReportIncludeDummyRun());
            for (ExecutionTestCaseResult testCaseResult : testCaseResultList) {
                for (ExecutionQualityByDay qualityByDay : qualityByDayList) {
                    if (testCaseResult.getStartTime() == null) {
                        continue;
                    }

                    SimpleDateFormat yearSdf = new SimpleDateFormat("yyyy");
                    SimpleDateFormat mmSdf = new SimpleDateFormat("MM");
                    SimpleDateFormat daySdf = new SimpleDateFormat("dd");

                    if (yearSdf.format(qualityByDay.date)
                            .equalsIgnoreCase(yearSdf.format(testCaseResult.getStartTime()))
                            && mmSdf.format(qualityByDay.date)
                            .equalsIgnoreCase(mmSdf.format(testCaseResult.getStartTime()))
                            && daySdf.format(qualityByDay.date)
                            .equalsIgnoreCase(daySdf.format(testCaseResult.getStartTime()))) {
                        // LoggerFacade.info(String.format("testCaseResult
                        // executionid: %s, id: %s, year: %s, month: %s, day:
                        // %s",
                        // testCaseResult.getExecutionId(),
                        // testCaseResult.getId(),
                        // yearSdf.format(qualityByDay.date),
                        // mmSdf.format(qualityByDay.date),
                        // daySdf.format(qualityByDay.date)));

                        if (testCaseResult.getResult() == ExecutionTestCaseResult.Success) {
                            qualityByDay.passedScripts = qualityByDay.passedScripts + 1;
                        } else if (testCaseResult.getResult() == ExecutionTestCaseResult.Fail) {
                            qualityByDay.failedScripts = qualityByDay.failedScripts + 1;
                        } else if (testCaseResult.getResult() == ExecutionTestCaseResult.None) {
                            qualityByDay.unExecutedScripts = qualityByDay.unExecutedScripts + 1;
                        }
                    }
                }
            }

            return new ApiResponse<List<ExecutionQualityByDay>>(ApiResponse.Success, qualityByDayList);
        } catch (Exception ex) {
            logger.error("getExecutionQuality", ex);
            return new ApiResponse<List<ExecutionQualityByDay>>(ApiResponse.UnHandleException, qualityByDayList);
        }
    }

    @RequestMapping(value = "/api/query/testReport/getByCondition", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<List<ExecutionStatusWithResult>> searchTestReport(
            @RequestBody TestReportQueryParameter testReportQueryParameter) {
        try {

            logger.info(String.format("searchTestReport params: %s", testReportQueryParameter));

            List<ExecutionStatusWithResult> validExecutions = new ArrayList<ExecutionStatusWithResult>();

            long domainIdCondition = testReportQueryParameter.getDomainId();
            ParserResult<Long> projectIdFilterCondition = StringUtility
                    .parseLongSafely(testReportQueryParameter.getProjectId());
            ParserResult<Long> testsetIdFilterCondition = StringUtility
                    .parseLongSafely(testReportQueryParameter.getTestsetId());
            String executedByUserIdCondition = testReportQueryParameter.getExecutedByUserId();
            ParserResult<Date> executionTimeStartFromCondition = StringUtility
                    .parseDateSafely(testReportQueryParameter.getExecutionTimeStartFrom());
            ParserResult<Date> executionTimeEndByCondition = StringUtility
                    .parseDateSafely(testReportQueryParameter.getExecutionTimeEndBy());

            List<ExecutionStatusWithResult> statusList = mExecutionStatusService
                    .getCompletedExecutionStatusByProjectId(projectIdFilterCondition.getResult());

            for (ExecutionStatusWithResult executionStatus : statusList) {
                // filter rule: only return testsetId equals condition.
                if (!testReportQueryParameter.getTestsetId().equalsIgnoreCase("")) {
                    if (!(testsetIdFilterCondition.isParserSuccess()
                            && executionStatus.getTestsetId() == testsetIdFilterCondition.getResult())) {
                        continue;
                    }
                }

                // filter rule: only return executedByUserId equals condition.
                if (!testReportQueryParameter.getExecutedByUserId().equalsIgnoreCase("")) {
                    if (executedByUserIdCondition.equalsIgnoreCase("")
                            || !executedByUserIdCondition.equalsIgnoreCase(executionStatus.getExecutedByUserId())) {
                        continue;
                    }
                }

                // filter rule: only return executionTimeStart equals condition.
                if (!testReportQueryParameter.getExecutionTimeStartFrom().equalsIgnoreCase("")) {
                    if (executionStatus.getStartTime() == null) continue;
                    if (!(executionTimeStartFromCondition.isParserSuccess()
                            && executionStatus.getStartTime().after(executionTimeStartFromCondition.getResult()))) {
                        continue;
                    }
                }

                // filter rule: only return executionTimeStart equals condition.
                if (!testReportQueryParameter.getExecutionTimeEndBy().equalsIgnoreCase("")) {
                    if (executionStatus.getEndTime() == null) continue;
                    if (!(executionTimeEndByCondition.isParserSuccess()
                            && executionStatus.getEndTime().before(executionTimeEndByCondition.getResult()))) {
                        continue;
                    }
                }

                validExecutions.add(executionStatus);
            }

            return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.Success, validExecutions);
        } catch (Exception ex) {
            logger.error("searchTestReport", ex);
            return new ApiResponse<List<ExecutionStatusWithResult>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/query/testReport/{executionId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ExecutionReportInfo> getStatisticsByExecution(@PathVariable("executionId") String executionId) {
        try {
            ExecutionReportInfo result = GetExecutionStatisticsReport(executionId, false, true);
            return new ApiResponse<ExecutionReportInfo>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getStatisticsByExecution", ex);
            return new ApiResponse<ExecutionReportInfo>(ApiResponse.UnHandleException, null);
        }
    }
    @RequestMapping(value = "/api/query/testCheckPoint/{executionId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse< Map<String, List<ExecutionCheckPoint>>> getTestCaseCheckPointByExecution(
            @PathVariable("executionId") String executionId) {
        try {
            List<ExecutionCheckPoint> executionCheckPoints = mExecutionCheckPointService.getExecutionCheckPointByExecutionId(executionId);
            //根据executionId获取所有的executiontestcaseresult
            List<ExecutionTestCaseResult> executionTestCaseResultList = mExecutionTestCaseResultService.listExecutionTestCaseResults(executionId);
            //遍历executionTestCaseResultList,定义map
            Map<String, List<ExecutionCheckPoint>> executionTestCaseResultMap = new HashMap<String, List<ExecutionCheckPoint>>();
            for (ExecutionTestCaseResult executionTestCaseResult : executionTestCaseResultList) {
                //获取executionTestCaseResult的id
                long scriptId = executionTestCaseResult.getScriptId();
                //定义一个ExecutionCheckPoint的集合
                List<ExecutionCheckPoint> executionCheckPointList = new ArrayList<ExecutionCheckPoint>();
                //根据scriptId获取executionCheckPoints中所有的testCaseId和scriptId相等的数据,并存入map集合中
                for (ExecutionCheckPoint executionCheckPoint : executionCheckPoints) {
                    if (executionCheckPoint.getTestCaseId() == scriptId) {
                        executionCheckPointList.add(executionCheckPoint);
                    }
                }
                executionTestCaseResultMap.put(executionTestCaseResult.getScriptId() + ":"+executionTestCaseResult.getScriptName(), executionCheckPointList);
            }
            return new ApiResponse<>(ApiResponse.Success, executionTestCaseResultMap);
        } catch (Exception ex) {
            logger.error("getTestCaseCheckPointByExecution", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }
    @RequestMapping(value = "/api/query/testReport/summary/{executionId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ExecutionReportInfo> getSummayStatisticsByExecution(
            @PathVariable("executionId") String executionId) {
        try {
            ExecutionReportInfo result = GetExecutionStatisticsReport(executionId, false, false);
            if (result.executionResultList.size() != 0) {
                for (int i = 0; i < result.executionResultList.size(); i++) {
                    if (result.executionResultList.get(i).getCommandType() == 3) {
                        //获取projectid
                        ExecutionStatus executionStatus = mExecutionStatusService.getExecutionStatusByExecutionId(executionId);
                        long projectId = executionStatus.getProjectId();
                        try {
                            long requirementId = Long.parseLong(result.executionResultList.get(i).getCommand());
                            Requirement requirement = mRequirementService.getRequirementById(projectId, requirementId);
                            if (requirement != null) {
                                result.executionResultList.get(i).setCommand(requirement.getTitle() + "(id:" + requirementId + ")");
                            }
                        }catch (Exception ex){
                            //跳出本次循环
                            continue;
                        }
                    }

                }
            }
            return new ApiResponse<ExecutionReportInfo>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getSummayStatisticsByExecution", ex);
            return new ApiResponse<ExecutionReportInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/query/testReport/summary/finished/{executionId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ExecutionReportInfo> getFinishedSummayStatistics(
            @PathVariable("executionId") String executionId) {
        try {
            ExecutionReportInfo result = GetExecutionStatisticsReport(executionId, true, false);
            return new ApiResponse<ExecutionReportInfo>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getFinishedSummayStatistics", ex);
            return new ApiResponse<ExecutionReportInfo>(ApiResponse.UnHandleException, null);
        }
    }

    private ExecutionReportInfo GetExecutionStatisticsReport(String executionId, boolean onlyFinishedTestCase,
                                                             boolean includeDetails) {
        ExecutionStatus foundExecutionStatus = mExecutionStatusService.getExecutionStatusByExecutionId(executionId);

        if (foundExecutionStatus == null)
            return null;

        ExecutionReportInfo reportInfo = new ExecutionReportInfo();

        if (foundExecutionStatus.getStartTime() != null) {
            reportInfo.executionStartTime = foundExecutionStatus.getStartTime();
        }

        if (foundExecutionStatus.getEndTime() != null) {
            reportInfo.executionEndTime = foundExecutionStatus.getEndTime();
        }

        reportInfo.executionId = executionId;
        reportInfo.executedByUserId = foundExecutionStatus.getExecutedByUserId();
        // reportInfo.executionId = foundExecutionStatus.getExecutionId();
        reportInfo.executionName = foundExecutionStatus.getExecutionName();
        reportInfo.testObject = foundExecutionStatus.getTestObject();
        reportInfo.targetTestsetName = foundExecutionStatus.getTestsetName();
        reportInfo.executionPeriod = getDateDifference(foundExecutionStatus.getStartTime(),
                foundExecutionStatus.getEndTime());

        List<ExecutionTestCaseResult> allExecutionTestCaseResults;

        if (onlyFinishedTestCase) {
            allExecutionTestCaseResults = mExecutionTestCaseResultService
                    .listFinishedExecutionTestCaseResults(executionId);
        } else {
            allExecutionTestCaseResults = mExecutionTestCaseResultService.listExecutionTestCaseResults(executionId);
        }
        reportInfo.executionCheckPoints= mExecutionCheckPointService.getExecutionCheckPointByExecutionId(executionId);

        for (ExecutionTestCaseResult testCaseResult : allExecutionTestCaseResults) {
            ExecutionTestCaseResultInfo testResultInfo = ExecutionTestCaseResultInfo
                    .converterToExecutionTestCaseResultInfo(testCaseResult);

            if (testCaseResult.getResult() == ExecutionTestCaseResult.Success) {
                reportInfo.passedScripts.add(testResultInfo);
            } else if (testCaseResult.getResult() == ExecutionTestCaseResult.Fail) {
                reportInfo.failedScripts.add(testResultInfo);
            } else if (testCaseResult.getResult() == ExecutionTestCaseResult.None) {
                Script scriptByScript = mScriptService.getScriptByScriptId(testCaseResult.getScriptId());
                testCaseResult.setScriptName(scriptByScript.getName());
                testResultInfo = ExecutionTestCaseResultInfo
                        .converterToExecutionTestCaseResultInfo(testCaseResult);
                reportInfo.unExecutedScripts.add(testResultInfo);
            }
        }
        if (includeDetails) {
            List<ExecutionResultInfo> allExecutionResults = mExecutionResultService
                    .listExecutionResultInfosAfterFromId(executionId, 0);
            reportInfo.executionResultList.addAll(allExecutionResults);
        } else {
//            List<ExecutionResultInfo> allExecutionResults = mExecutionResultService
//                    .listExecutionResultSummaryInfosAfterFromId(executionId, 0);
//            reportInfo.executionResultList.addAll(allExecutionResults);
        }

        return reportInfo;
    }

    private String getDateDifference(Date startDate, Date endDate) {

        try {
            // milliseconds
            long different = endDate.getTime() - startDate.getTime();

            logger.info("startDate : " + startDate);
            logger.info("endDate : " + endDate);
            logger.info("different : " + different);

            long secondsInMilli = 1000;
            long minutesInMilli = secondsInMilli * 60;
            long hoursInMilli = minutesInMilli * 60;

            long elapsedHours = different / hoursInMilli;
            different = different % hoursInMilli;

            long elapsedMinutes = different / minutesInMilli;
            different = different % minutesInMilli;

            long elapsedSeconds = different / secondsInMilli;

            return String.format("%d hours : %d minutes : %d seconds%n", elapsedHours, elapsedMinutes, elapsedSeconds);
        } catch (Exception ex) {
            logger.error(ex.toString());
            return "";
        }
    }

    public class ExecutionQualityByDay {
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+8")
        public Date date;
        public int passedScripts;
        public int failedScripts;
        public int unExecutedScripts;
    }

    public class ExecutionReportInfo {
        public String executionId;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+8")
        public Date executionStartTime;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone = "GMT+8")
        public Date executionEndTime;
        public String executionPeriod;
        public String executedByUserId;
        public String targetTestsetName;
        public String executionName;
        public String testObject;

        public List<ExecutionTestCaseResultInfo> passedScripts;
        public List<ExecutionTestCaseResultInfo> failedScripts;
        public List<ExecutionTestCaseResultInfo> unExecutedScripts;

        public List<ExecutionCheckPoint> executionCheckPoints;
        public List<ExecutionResultInfo> executionResultList;

        public ExecutionReportInfo() {
            passedScripts = new ArrayList<ExecutionTestCaseResultInfo>();
            failedScripts = new ArrayList<ExecutionTestCaseResultInfo>();
            unExecutedScripts = new ArrayList<ExecutionTestCaseResultInfo>();
            executionCheckPoints = new ArrayList<ExecutionCheckPoint>();

            executionResultList = new ArrayList<ExecutionResultInfo>();
        }
    }
}
