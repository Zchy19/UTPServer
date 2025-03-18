package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.ScriptGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.RequirementDAO;
import com.macrosoft.dao.ScriptGroupDAO;
import com.macrosoft.model.Project;
import com.macrosoft.model.ScriptGroup;

@Service
public class ScriptGroupServiceImpl implements ScriptGroupService {

	private ProjectDAO projectDAO;
	private ScriptGroupDAO ScriptGroupDAO;
	private RequirementDAO requirementDAO;
	@Autowired
	public void setRequirementDAO(RequirementDAO requirementDAO) {
		this.requirementDAO = requirementDAO;
	}
	@Autowired
	public void setScriptGroupDAO(ScriptGroupDAO scriptGroupDAO) {
		this.ScriptGroupDAO = scriptGroupDAO;
	}
	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}
	
	@Override
	@Transactional
	public ScriptGroup addScriptGroup(long projectId, ScriptGroup scriptGroup) {

		// get next scriptgroupid from project entity.
		Project project = projectDAO.getProjectById(projectId);
		long newScriptGroupId = project.getNextEntityLogicId();
		
		project.setNextEntityLogicId(newScriptGroupId + 1);
		projectDAO.updateProject(project);
		
		scriptGroup.setId(newScriptGroupId);
		scriptGroup.setProjectId(projectId);
		
		// add script group
		return this.ScriptGroupDAO.addScriptGroup(projectId, scriptGroup);
	}

	@Override
	@Transactional
	public void updateScriptGroup(long projectId, ScriptGroup p) {
		this.ScriptGroupDAO.updateScriptGroup(projectId, p);
	}

	@Override
	@Transactional
	public List<ScriptGroup> listScriptGroups(long projectId) {
		return this.ScriptGroupDAO.listScriptGroups(projectId);
	}

	@Override
	@Transactional
	public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId) {
		return this.ScriptGroupDAO.listScriptGroupsInTopLevel(projectId);
	}
	
	@Override
	@Transactional
	public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId) {
		return this.ScriptGroupDAO.listScriptGroupsByParentScriptGroupId(projectId, parentScriptGroupId);
	}

	@Override
	@Transactional
	public ScriptGroup getScriptGroupById(long projectId, long id) {
		return this.ScriptGroupDAO.getScriptGroupById(projectId, id);
	}

	@Override
	@Transactional
	public void removeScriptGroup(long projectId, long id) {
		this.ScriptGroupDAO.removeScriptGroup(projectId, id);
		
		this.requirementDAO.cleanScriptRequirementMapping(projectId);
	}
}
