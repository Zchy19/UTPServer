package com.macrosoft.service;

import com.macrosoft.model.MonitoringTestSet;

import java.util.List;

public interface MonitoringTestSetService {
	public void addMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet);
	public void updateMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet);
	public MonitoringTestSet getMonitoringTestSetById(long projectId, long id);
	public void removeMonitoringTestSet(long projectId, long id);
	public List<MonitoringTestSet> listMonitoringTestSetsByProjectId(long projectId);

}
