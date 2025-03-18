package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.MonitorData;

public interface MonitorDataService {
	public void addMonitorDataList(List<MonitorData> results);
	public List<MonitorData> getMonitorDataByExecutionId(String executionId);
	public List<MonitorData> getMonitorDatasAfterFromId(String executionId, long beginId);	
	public void removeMonitorDataByExecutionId(String executionId);
}
