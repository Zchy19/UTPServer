package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.MonitorData;

public interface MonitorDataDAO {
	public void addMonitorData(MonitorData monitorData);
	public List<MonitorData> getMonitorDataByExecutionId(String executionId);

	public List<MonitorData> getMonitorDatasAfterFromId(String executionId, long beginId);
	
	public void removeMonitorDataByExecutionId(String executionId);
	
}
