package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.ScriptLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.ScriptLinkDAO;
import com.macrosoft.model.Project;
import com.macrosoft.model.ScriptLink;

@Service
public class ScriptLinkServiceImpl implements ScriptLinkService {

	private ScriptLinkDAO ScriptLinkDAO;
	private ProjectDAO projectDAO;

	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}
	@Autowired
	public void setScriptLinkDAO(ScriptLinkDAO scriptLinkDAO) {
		this.ScriptLinkDAO = scriptLinkDAO;
	}
	
	@Override
	@Transactional
	public void addScriptLink(long projectId, ScriptLink scriptLink) {
		
		// get next scriptLink id from project entity.
		Project project = projectDAO.getProjectById(projectId);
		long newScriptLinkId = project.getNextEntityLogicId();
		
		project.setNextEntityLogicId(newScriptLinkId + 1);
		projectDAO.updateProject(project);
		
		scriptLink.setId(newScriptLinkId);
		

		this.ScriptLinkDAO.addScriptLink(projectId, scriptLink);
	}

	@Override
	@Transactional
	public List<ScriptLink> listScriptLinksByProjectId(long projectId) {
		return this.ScriptLinkDAO.listScriptLinksByProjectId(projectId);
	}

	@Override
	@Transactional
	public List<ScriptLink> listScriptLinksByTestsetId(long projectId, long testsetId) {
		return this.ScriptLinkDAO.listScriptLinksByTestsetId(projectId, testsetId);
	}
	
	@Override
	@Transactional
	public ScriptLink getScriptLinkById(long projectId, long id) {
		return this.ScriptLinkDAO.getScriptLinkById(projectId, id);
	}

	@Override
	@Transactional
	public void removeScriptLink(long projectId, long id) {
		this.ScriptLinkDAO.removeScriptLink(projectId, id);
	}


	@Override
	@Transactional
	public List<ScriptLink> listScriptLinksByScriptId(long projectId, long scriptId) {
		return this.ScriptLinkDAO.listScriptLinksByScriptId(projectId, scriptId);
	}

	@Override
	@Transactional
	public void removeScriptLinkByTestsetId(long projectId, long testsetId) {
		this.ScriptLinkDAO.removeScriptLinkByTestsetId(projectId, testsetId);		
	}
}
