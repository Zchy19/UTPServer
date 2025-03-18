package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.MonitoringTestSetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.MonitoringTestSetDAO;
import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.model.Project;

@Service
public class MonitoringTestSetServiceImpl implements MonitoringTestSetService {
	
	private MonitoringTestSetDAO MonitoringTestSetDAO;
	private ProjectDAO projectDAO;

	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}
	@Autowired
	public void setMonitoringTestSetDAO(MonitoringTestSetDAO MonitoringTestSetDAO) {
		this.MonitoringTestSetDAO = MonitoringTestSetDAO;
	}

	
	@Override
	@Transactional
	public void addMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet) {
		
		// get next testset id from project entity.
		Project project = projectDAO.getProjectById(projectId);
		long newId = project.getNextEntityLogicId();
		
		project.setNextEntityLogicId(newId + 1);
		projectDAO.updateProject(project);
		
		MonitoringTestSet.setId(newId);
		
		this.MonitoringTestSetDAO.addMonitoringTestSet(projectId, MonitoringTestSet);
	}

	@Override
	@Transactional
	public void updateMonitoringTestSet(long projectId, MonitoringTestSet MonitoringTestSet) {
		this.MonitoringTestSetDAO.updateMonitoringTestSet(projectId, MonitoringTestSet);
	}

	@Override
	@Transactional
	public MonitoringTestSet getMonitoringTestSetById(long projectId, long id) {
		return this.MonitoringTestSetDAO.getMonitoringTestSetById(projectId, id);
	}

	@Override
	@Transactional
	public void removeMonitoringTestSet(long projectId, long id) {

		this.MonitoringTestSetDAO.removeMonitoringTestSet(projectId, id);
	}

	@Override
	@Transactional
	public List<MonitoringTestSet> listMonitoringTestSetsByProjectId(long projectId) {
		return this.MonitoringTestSetDAO.listMonitoringTestSetsByProjectId(projectId);
	}

}
