package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.model.composition.PageSummary;

public interface ExecutionResultDAO {
	public ExecutionResult addExecutionResult(ExecutionResult executionResult);
	public void updateExecutionResult(ExecutionResult executionResult);
	public List<ExecutionResultInfo> listExecutionResultInfosAfterFromId(String executionId, long beginId);
	public List<ExecutionResultInfo> listMaximumExecutionResultInfosAfterFromId(String executionId, long beginId, int maximum);
	public List<ExecutionResultInfo> listExecutionResultSummaryInfosAfterFromId(String executionId, long beginId);
	public List<ExecutionResultInfo> listExecutionResultInfosDetails(String executionId, long beginId, long endId);
	public List<ExecutionResultInfo> listLatestNumberOfExecutionResultInfos(String executionId, long amount);
	public PageSummary getExecutionResultInfoPageSummary(String executionId, int rowsPerPage);
	public List<ExecutionResultInfo> listPagedExecutionResultInfos(String executionId, int currentPage, int rowsPerPage);
	//	获取executionresult中检查点是否通过的数据
	public ExecutionResultInfo getExecutionResultByCheckPoint(String executionId,int scriptId,String requirementId,int commandType);
//	获取excutionresult所有数据
	public List<ExecutionResult> getallExecutionResult();
//	根据executionid获取executionresult表中数据
	public List<ExecutionResult> getExecutionResultByExecutionId(String executionId);
	public int getExecutionResultIntByExecutionIdAndCommandType(String executionId,int commandType);
	public int getExecutionResultIntByExecutionIdAndCommandTypeAndResult(String executionId,int commandType,int result);
	public List<ExecutionResultInfo> listResultByParentId(String executionId,String parentId);
}
