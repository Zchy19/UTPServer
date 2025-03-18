package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.RecoverSubscriptReferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.controller.dto.RecoverSubscriptReferenceInfo;
import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.RecoverSubscriptReferenceDAO;
import com.macrosoft.model.Project;
import com.macrosoft.model.RecoverSubscriptReference;

@Service
public class RecoverSubscriptReferenceServiceImpl implements RecoverSubscriptReferenceService {

	private ProjectDAO ProjectDAO;
	private RecoverSubscriptReferenceDAO RecoverSubscriptReferenceDAO;
	@Autowired
	public void setProjectDAO(ProjectDAO ProjectDAO) {
		this.ProjectDAO = ProjectDAO;
	}
	@Autowired
	public void setRecoverSubscriptReferenceDAO(RecoverSubscriptReferenceDAO recoverSubscriptReferenceDAO) {
		this.RecoverSubscriptReferenceDAO = recoverSubscriptReferenceDAO;
	}
	
	@Override
	@Transactional
	public RecoverSubscriptReferenceInfo getRecoverSubscriptReferenceInfo(long projectId, long id) {
		return this.RecoverSubscriptReferenceDAO.getRecoverSubscriptReferenceInfo(projectId,id);
	}
	
	@Override
	@Transactional
	public RecoverSubscriptReference addRecoverSubscriptReference(long projectId, RecoverSubscriptReferenceInfo refrernceInfo) {
		RecoverSubscriptReference reference = new RecoverSubscriptReference();
		reference.setId(0);
		reference.setName(refrernceInfo.getName());
		reference.setDescription(refrernceInfo.getDescription());
		reference.setProjectId(refrernceInfo.getProjectId());
		reference.setSubscriptId(refrernceInfo.getSubscriptId());

		this.RecoverSubscriptReferenceDAO.addRecoverSubscriptReference(projectId,reference);
		
		if (refrernceInfo.getIsDefault())
		{
			Project project = this.ProjectDAO.getProjectById(reference.getProjectId());
			project.setDefaultRecoverSubscriptId(reference.getId());
			this.ProjectDAO.updateProject(project);
		}
		return reference;
	}

	@Override
	@Transactional
	public RecoverSubscriptReference getRecoverSubscriptReference(long projectId, long id) {
		return this.RecoverSubscriptReferenceDAO.getRecoverSubscriptReference(projectId,id);
	}
	
	@Override
	@Transactional
	public RecoverSubscriptReference updateRecoverSubscriptReference(long projectId, RecoverSubscriptReferenceInfo refrernceInfo) {
		
		RecoverSubscriptReference reference = this.getRecoverSubscriptReference(projectId, refrernceInfo.getId());
		if (reference == null) return null;
		
		reference.setName(refrernceInfo.getName());
		reference.setDescription(refrernceInfo.getDescription());
		reference.setSubscriptId(refrernceInfo.getSubscriptId());

		this.RecoverSubscriptReferenceDAO.updateRecoverSubscriptReference(projectId, reference);
		
		if (refrernceInfo.getIsDefault())
		{
			Project project = this.ProjectDAO.getProjectById(reference.getProjectId());
			project.setDefaultRecoverSubscriptId(reference.getId());
			this.ProjectDAO.updateProject(project);
		}
		else
		{
			Project project = this.ProjectDAO.getProjectById(reference.getProjectId());
			if (project.getDefaultRecoverSubscriptId() == reference.getId())
			{
				project.setDefaultRecoverSubscriptId(0);
				this.ProjectDAO.updateProject(project);
			}
		}
		return reference;
	}
	
	@Override
	@Transactional
	public List<RecoverSubscriptReference> listRecoverSubscriptReference(long projectId) {
		return this.RecoverSubscriptReferenceDAO.listRecoverSubscriptReference(projectId);
	}

	@Override
	@Transactional
	public List<RecoverSubscriptReference> listRecoverSubscriptBySubscriptId(long projectId, long subscriptId) {
		return this.RecoverSubscriptReferenceDAO.listRecoverSubscriptBySubscriptId(projectId, subscriptId);
	}
	
	@Override
	@Transactional
	public void removeRecoverSubscriptReference(long projectId, long id) {

		RecoverSubscriptReference reference = this.RecoverSubscriptReferenceDAO.getRecoverSubscriptReference(projectId, id);	
		if (reference == null) return;
		
		this.RecoverSubscriptReferenceDAO.removeRecoverSubscriptReference(projectId,id);
			
		Project project = this.ProjectDAO.getProjectById(reference.getProjectId());
		if (project.getDefaultRecoverSubscriptId() == id)			
		{
			project.setDefaultRecoverSubscriptId(0);
			this.ProjectDAO.updateProject(project);
		}
		
        return;
	}

	@Override
	@Transactional
	public List<RecoverSubscriptReferenceInfo> listRecoverSubscriptReferenceInfosByProjectId(long projectId) {
		return this.RecoverSubscriptReferenceDAO.listRecoverSubscriptReferenceInfosByProjectId(projectId);
	}
}
