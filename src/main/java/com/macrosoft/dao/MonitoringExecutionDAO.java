package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.MonitoringExecution;
import com.macrosoft.model.MonitoringExecutionDetail;

public interface MonitoringExecutionDAO {
	public void addMonitoringExecution(MonitoringExecution monitoringExecution);
	public void updateMonitoringExecutionStatus(String executionId, String status);
	public void updateMonitoringExecution(MonitoringExecution monitoringExecution);
	public MonitoringExecution getMonitoringExecutionById(String executionId);
	public void removeMonitoringExecution(String executionId);

	public void addMonitoringExecutionDetail(MonitoringExecutionDetail monitoringExecutionDetail);	
	public List<MonitoringExecutionDetail> listMonitoringExecutionDetails(String executionId, String monitorDataName, long resultIdAsStartPoint);

	public List<MonitoringExecutionDetail> listMonitoringExecutionDetails(String executionId, long resultIdAsStartPoint);

	public List<MonitoringExecution> getMonitoringExecutionDataByTestSetId(long testSetId);
}
