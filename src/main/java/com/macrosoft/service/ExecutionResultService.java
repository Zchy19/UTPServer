package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.model.composition.PageSummary;

public interface ExecutionResultService {
	public ExecutionResult addExecutionResult(ExecutionResult p);
	public void addExecutionResultList(List<ExecutionResult> results);
	public void updateExecutionResult(ExecutionResult p);
	public List<ExecutionResultInfo> listExecutionResultInfosAfterFromId(String executionId, long beginId);
	public List<ExecutionResultInfo> listMaximumExecutionResultInfosAfterFromId(String executionId, long beginId,int maximum);
	public List<ExecutionResultInfo> listExecutionResultSummaryInfosAfterFromId(String executionId, long beginId);
	public List<ExecutionResultInfo> listExecutionResultDetails(String executionId, long resultBeginId, long resultEndId);
	public List<ExecutionResultInfo> listLatestNumberOfExecutionResultInfos(String executionId, long amount);
	public void sendEmailOfExecutionResult(String tenantId, String executionId, boolean isSendEmail, String emailAddress);
	public PageSummary getExecutionResultInfoPageSummary(String executionId, int rowsPerPage);
	public List<ExecutionResultInfo> listPagedExecutionResultInfos(String executionId, int currentPage, int rowsPerPage);
	//获取executionresult中检查点是否通过的数据
	public String getExecutionResultByCheckPoint(String executionId,int scriptId,String requirementId);
	//获取executionresult表中所有数据
	public List<ExecutionResult> getallExecutionResult();
	//根据的executionid获取executionresult表中数据
	public List<ExecutionResult> getExecutionResultByExecutionId(String executionId);
	//根据executionId获取comdtype为的数据个数
	public int getExecutionResultIntByExecutionIdAndCommandType(String executionId,int commandType);
	//根据executionId,comdtype,result获取的数据个数
	public int getExecutionResultIntByExecutionIdAndCommandTypeAndResult(String executionId,int commandType,int result);

	//根据executionId,parentId获取的数据
	public List<ExecutionResultInfo> listResultByParentId(String executionId,String parentId);

}
