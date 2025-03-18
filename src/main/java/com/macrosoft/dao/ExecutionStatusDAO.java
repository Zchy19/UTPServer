package com.macrosoft.dao;

import java.util.Date;
import java.util.List;

import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import org.springframework.transaction.annotation.Transactional;

public interface ExecutionStatusDAO {
	public void addExecutionStatus(ExecutionStatus executionStatus);

	public void updateExecutionStatus(ExecutionStatus executionStatus);

	public ExecutionStatus getExecutionStatusByExecutionId(String executionId);

	public ExecutionStatusWithResult getExecutionStatusByTestsetIdAndNew(long projectId,long testsetId);

	public ExecutionStatusWithResult getExecutionStatusWithResultByExecutionId(String executionId);

	public List<ExecutionStatusWithResult> getAllActiveExecutionStatus();

	public List<ExecutionStatusWithResult> getExecutionStatusByProjectId(long projectId);
	
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetId(long projectId,long testsetId);

	public List<ExecutionStatusWithResult> getActiveExecutionStatusByProjectId(long projectId);

	public List<ExecutionStatusWithResult> getCompletedExecutionStatusByProjectId(long projectId);

	public void sp_startExecution(String executionId, String executionName,String testObject, long projectId, String orgId,
			String executedByUserId, int status, long testsetId, boolean isDummyRun,boolean isTemporaryExecution,String engineName, String informEmail);

	public void sp_cleanDatabase();
	
	public void removeExecutionData(String executionId);

	public void saveExecutionAsTemporarySave(String executionId);
	public List<ExecutionStatusWithResult> getExecutionStatusBetween(long projectId, Date startTime, Date endTime);

	public void terminateAllUnFinishedExecution();
	//获取ExecutionStatus表中所有数据
	public List<ExecutionStatus> getAllExecutionStatus();
	//根据user获取ExecutionStatus表中当天的数据
	public List<ExecutionStatus> getIntraDayExecutionStatusByUserId(String userId);

	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);

	public List<ExecutionStatusWithResult> getTestsetExecutionStatusWithResultByProjectIdAndTime(long projectId, Date startTime, Date endTime);
}
