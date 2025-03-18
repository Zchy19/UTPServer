package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.MonitoringTestSet;

public interface MonitoringTestSetDAO {
	public void addMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet);
	public void updateMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet);
	public MonitoringTestSet getMonitoringTestSetById(long projectId, long id);
	public void removeMonitoringTestSet(long projectId, long id);
	public List<MonitoringTestSet> listMonitoringTestSetsByProjectId(long projectId);
}
