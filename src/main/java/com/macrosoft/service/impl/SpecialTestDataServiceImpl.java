package com.macrosoft.service.impl;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.SpecialTestDataDAO;
import com.macrosoft.model.SpecialTestData;
import com.macrosoft.service.SpecialTestDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SpecialTestDataServiceImpl implements SpecialTestDataService {
	private ProjectDAO projectDAO;
	private SpecialTestDataDAO specialTestDataDAO;
	@Autowired
	public void setSpecialTestDataDAO(SpecialTestDataDAO specialTestDataDAO) {
		this.specialTestDataDAO = specialTestDataDAO;
	}
	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}


	
	@Override
	@Transactional
	public void addSpecialTestData(SpecialTestData specialTestData) {

		this.specialTestDataDAO.addSpecialTestData(specialTestData);
	}



	@Override
	@Transactional
	public void updateSpecialTestData(SpecialTestData specialTestData) {
		this.specialTestDataDAO.updateSpecialTestData(specialTestData);
	}

	@Override
	@Transactional
	public void removeSpecialTestData(long id) {

		this.specialTestDataDAO.removeSpecialTestData(id);
	}

	@Override
	@Transactional
	public void removeSpecialTestDataBySpecialTestId(long specialTestId) {
		this.specialTestDataDAO.removeSpecialTestDataBySpecialTestId(specialTestId);
	}

	@Override
	@Transactional
	public List<SpecialTestData> listDaySpecialTestDatesBySpecialTestId(long specialTestId) {
		return this.specialTestDataDAO.listDaySpecialTestDatesBySpecialTestId(specialTestId);
	}


	@Override
	@Transactional
	public List<SpecialTestData> listSpecialTestDatasBySpecialTestId(long specialTestId) {
		return this.specialTestDataDAO.listSpecialTestDatasBySpecialTestId(specialTestId);
	}

}
