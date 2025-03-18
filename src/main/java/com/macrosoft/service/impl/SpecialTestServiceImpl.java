package com.macrosoft.service.impl;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.SpecialTestDAO;
import com.macrosoft.model.Project;
import com.macrosoft.model.SpecialTest;
import com.macrosoft.service.SpecialTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SpecialTestServiceImpl implements SpecialTestService {
	private ProjectDAO projectDAO;
	private SpecialTestDAO specialTestDAO;
	@Autowired
	public void setSpecialTestDAO(SpecialTestDAO specialTestDAO) {
		this.specialTestDAO = specialTestDAO;
	}
	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}


	
	@Override
	@Transactional
	public void addSpecialTest(long projectId, SpecialTest specialTest) {
		
		// get next testset id from project entity.
		Project project = projectDAO.getProjectById(projectId);
		long newId = project.getNextEntityLogicId();
		project.setNextEntityLogicId(newId + 1);
		projectDAO.updateProject(project);
		this.specialTestDAO.addSpecialTest(projectId, specialTest);
	}


	@Override
	@Transactional
	public void updateSpecialTest(long projectId, SpecialTest specialTest) {
		this.specialTestDAO.updateSpecialTest(projectId, specialTest);
	}

	@Override
	@Transactional
	public void removeSpecialTest(long projectId, long id) {

		this.specialTestDAO.removeSpecialTest(projectId, id);
	}

	@Override
	@Transactional
	public SpecialTest getSpecialTestById(long projectId, long id) {
		return this.specialTestDAO.getSpecialTestById(projectId, id);
	}

	@Override
	@Transactional
	public List<SpecialTest> listSpecialTestsByProjectId(long projectId) {
		return this.specialTestDAO.listSpecialTestsByProjectId(projectId);
	}

}
