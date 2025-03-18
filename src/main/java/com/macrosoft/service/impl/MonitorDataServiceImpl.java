package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.MonitorDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.MonitorDataDAO;
import com.macrosoft.model.MonitorData;

@Service
public class MonitorDataServiceImpl implements MonitorDataService {
	
	private MonitorDataDAO MonitorDataDAO;
	@Autowired
	public void setMonitorDataDAO(MonitorDataDAO MonitorDataDAO) {
		this.MonitorDataDAO = MonitorDataDAO;
	}
 
	@Override
	@Transactional
	public void addMonitorDataList(List<MonitorData> monitorDatas) {
		for (MonitorData monitorData : monitorDatas) {
			monitorData.setId(0);
			this.MonitorDataDAO.addMonitorData(monitorData);
		}
	}
	
	@Override
	@Transactional
	public List<MonitorData> getMonitorDataByExecutionId(String executionId) {
		return this.MonitorDataDAO.getMonitorDataByExecutionId(executionId);
	}

	@Override
	@Transactional
	public List<MonitorData> getMonitorDatasAfterFromId(String executionId, long beginId)
	{
		return this.MonitorDataDAO.getMonitorDatasAfterFromId(executionId, beginId);
	}

	@Override
	@Transactional
	public void removeMonitorDataByExecutionId(String executionId) {
		this.MonitorDataDAO.removeMonitorDataByExecutionId(executionId);
	}
	
}
