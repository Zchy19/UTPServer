package com.macrosoft.service;

import java.util.Date;
import java.util.List;

import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.composition.ExecutionStatusWithResult;

public interface ExecutionStatusService {

	public List<ExecutionStatusWithResult> getExecutionStatusByProjectId(long projectId);
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetId(long projectId,long testsetId);
	//最新的一条数据
	public ExecutionStatusWithResult getExecutionStatusByTestsetIdAndNew(long projectId,long testsetId);
	public List<ExecutionStatusWithResult> getActiveExecutionStatusByProjectId(long projectId);
	public List<ExecutionStatusWithResult> getCompletedExecutionStatusByProjectId(long projectId);
	public ExecutionStatusWithResult getExecutionStatusWithResultByExecutionId(String executionId);
	public List<ExecutionStatusWithResult> getExecutionStatusBetween(long projectId, Date startTime, Date endTime);
	public void removeExecutionData(String executionId);
	public void updateExecutionStatus(ExecutionStatus p);
	public ExecutionStatus getExecutionStatusByExecutionId(String executionId);
	public List<ExecutionStatusWithResult> getAllActiveExecutionStatus();
	public void sp_startExecution(String executionId, String executionName, String testObject, long projectId,  String orgId, String executedByUserId, int status, long testsetId, boolean isDummyRun,boolean isTemporarySave, String engineName, String informEmail);
	public void sp_cleanDatabase();
	public void terminateAllUnFinishedExecution();
	public void saveExecutionAsTemporarySave(String executionId);
	//获取ExecutionStatus表中所有数据
	public List<ExecutionStatus> getAllExecutionStatus();
	//根据user获取ExecutionStatus表中当天的数据
	public List<ExecutionStatus> getIntraDayExecutionStatusByUserId(String userId);
	//判断是否超出features中当天最大执行个数
	public boolean isExceedMaxExecution(String userId);
	//根据projectId,testsetId,开始日期,结束日期获取execution
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetIdAndTime(long projectId,long testsetId, Date startTime, Date endTime);
	//根据projectId,开始日期,结束日期获取execution
	public List<ExecutionStatusWithResult> getTestsetExecutionStatusWithResultByProjectIdAndTime(long projectId, Date startTime, Date endTime);

}
