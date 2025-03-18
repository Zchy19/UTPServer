package com.macrosoft.service;

import java.util.Date;
import java.util.List;

import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.composition.ExecutionRequirementTraceInfo;

public interface ExecutionTestCaseResultService {
	public void addExecutionTestCaseResult(ExecutionTestCaseResult p);
	public void updateExecutionTestCaseResult(ExecutionTestCaseResult p);
	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(String executionId);
	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(long projectId, boolean includeDummyRun);
	public ExecutionTestCaseResult getExecutionTestCaseResultById(long id);
	public void updateExecutionTestCaseResult(String executionId, long scriptId, int testResult);
	public void updateExecutionTestCaseResultByStartTime(String executionId, long scriptId, Date startTime,long executionResultId);
	public void updateExecutionTestCaseResultByEndTime(String executionId, long scriptId, Date endTime, long executionResultId);
	public List<ExecutionTestCaseResult> listFinishedExecutionTestCaseResults(String executionId);
	public List<ExecutionRequirementTraceInfo> listExecutionRequirementTraceInfos(String executionId);
	//获取executiontestcaseresult表中所有数据
	public List<ExecutionTestCaseResult> getAllExecutionTestCaseResults();
	//删除executiontestcaseresult表中数据
	public void removeExecutionTestCaseResultByExecutionId(String executionId);
}
