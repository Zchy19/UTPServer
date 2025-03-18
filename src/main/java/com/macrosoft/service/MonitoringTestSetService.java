package com.macrosoft.service;

import java.util.List;

import com.macrosoft.controller.dto.TestsetInfo;
import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.model.TestSet;
import com.macrosoft.model.composition.TestsetData;

public interface MonitoringTestSetService {
	public void addMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet);
	public void updateMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet);
	public MonitoringTestSet getMonitoringTestSetById(long projectId, long id);
	public void removeMonitoringTestSet(long projectId, long id);
	public List<MonitoringTestSet> listMonitoringTestSetsByProjectId(long projectId);
	
}
