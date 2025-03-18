package com.macrosoft.service;

import java.util.List;

import com.macrosoft.controller.dto.MonitorExecutionStartParameter;
import com.macrosoft.model.MonitoringExecution;
import com.macrosoft.model.MonitoringExecutionDetail;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;

public interface MonitoringExecutionService {

	public UtpEngineExecutor getUtpEngineExecutor();
	
	public void startExecution(MonitorExecutionStartParameter startParameter);
	
	public void SendCommandExecution(MonitorExecutionStartParameter startParameter);
	
	public void stopExecution(String executionId);

	public List<MonitoringExecutionDetail> getMonitoringExecutionDetails(String executionId, String monitorDataName, long resultIdAsStartPoint);
	
	public List<MonitoringExecutionDetail> getMonitoringExecutionDetails(String executionId, long resultIdAsStartPoint);
	
	public void addMonitoringExecution(MonitoringExecution monitorExecution);
	public MonitoringExecution getMonitoringExecution(String executionId);
	
	public MonitoringExecutionDetail addMonitoringExecutionDetails(MonitoringExecutionDetail detail);
	
	public void updateMonitoringExecutionStatus(String executionId, String status);

	public List<MonitoringExecution> getMonitoringExecutionData(long testSetId);
	public void deleteMonitoringExecution(String executionId);

	public void updateMonitoringExecution(MonitoringExecution monitoringExecution);
}
