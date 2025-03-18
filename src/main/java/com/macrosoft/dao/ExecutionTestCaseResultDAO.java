package com.macrosoft.dao;

import java.util.Date;
import java.util.List;

import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.composition.ExecutionRequirementTraceInfo;
import com.macrosoft.model.composition.RequirementScriptTraceInfo;

public interface ExecutionTestCaseResultDAO {
	public void addExecutionTestCaseResult(ExecutionTestCaseResult executionTestCaseResult);

	public void updateExecutionTestCaseResult(ExecutionTestCaseResult executionTestCaseResult);

	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(String executionId);

	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(long projectId, boolean includeDummyRun);

	public ExecutionTestCaseResult getExecutionTestCaseResultById(long id);

	public void updateExecutionTestCaseResult(String executionId, long scriptId, int testResult);

	public List<ExecutionTestCaseResult> listFinishedExecutionTestCaseResults(String executionId);
	
	public List<ExecutionRequirementTraceInfo> listExecutionRequirementTraceInfos(String executionId);

	//获取executiontestcaseresult表中所有数据
	public List<ExecutionTestCaseResult> getAllExecutionTestCaseResults();

//	删除executiontestcaseresult表中数据
	public void removeExecutionTestCaseResultByExecutionId(String executionId);

	public void updateExecutionTestCaseResultByStartTime(String executionId, long scriptId, Date startTime,long executionResultId);

	public void updateExecutionTestCaseResultByEndTime(String executionId, long scriptId, Date endTime, long executionResultId);
}
