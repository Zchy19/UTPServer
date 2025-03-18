package com.macrosoft.service;

import com.macrosoft.controller.dto.PreprocessExecutionParameter;
import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.model.ExecutionCheckPoint;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;

import java.util.Date;
import java.util.List;

public interface ExecutionCheckPointService {

	public void addExecutionCheckPoint(ExecutionCheckPoint p);
	public void updateExecutionCheckPoint(ExecutionCheckPoint p);
	public ExecutionCheckPoint getExecutionCheckPointByExecutionIdAndCheckPointName(String executionId , String checkPointName);
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTime(long projectId, Date startTime, Date endTime);
	public List<ExecutionCheckPoint> getExecutionCheckPointByExecutionId(String executionId);
	public List<ExecutionCheckPoint> getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);
	public List<ExecutionCheckPoint> getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime);
	public boolean updateManualDecisionLevel(Integer id, Integer level);
}
