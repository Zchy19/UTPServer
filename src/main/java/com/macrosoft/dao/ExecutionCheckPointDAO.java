package com.macrosoft.dao;

import com.macrosoft.model.ExecutionCheckPoint;

import java.util.Date;
import java.util.List;

public interface ExecutionCheckPointDAO {
	public void addExecutionCheckPoint(ExecutionCheckPoint executionCheckPoint);
	public void updateExecutionCheckPoint(ExecutionCheckPoint executionCheckPoint);
	public ExecutionCheckPoint getExecutionCheckPointByExecutionIdAndCheckPointName(String executionId , String checkPointName);
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTime(long projectId, Date startTime, Date endTime);

	public List<ExecutionCheckPoint> getExecutionCheckPointByExecutionId(String executionId);
	public List<ExecutionCheckPoint> getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);
	public List<ExecutionCheckPoint> getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);
	public boolean updateManualDecisionLevel(Integer id, Integer level);
}
