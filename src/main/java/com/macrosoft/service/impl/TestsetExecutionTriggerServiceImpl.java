package com.macrosoft.service.impl;

import com.macrosoft.dao.TestsetExecutionTriggerDAO;
import com.macrosoft.model.TestsetExecutionTrigger;
import com.macrosoft.service.TestsetExecutionTriggerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TestsetExecutionTriggerServiceImpl implements TestsetExecutionTriggerService {
	
	private TestsetExecutionTriggerDAO TestsetExecutionTriggerDAO;
	@Autowired
	public void setTestsetExecutionTriggerDAO(TestsetExecutionTriggerDAO TestsetExecutionTriggerDAO) {
		this.TestsetExecutionTriggerDAO = TestsetExecutionTriggerDAO;
	}
	
	@Override
	@Transactional
	public void addTestsetExecutionTrigger(TestsetExecutionTrigger p) {
		p.setId(0);
		this.TestsetExecutionTriggerDAO.addTestsetExecutionTrigger(p);
	}

	@Override
	@Transactional
	public void updateTestsetExecutionTrigger(TestsetExecutionTrigger p) {
		this.TestsetExecutionTriggerDAO.updateTestsetExecutionTrigger(p);
	}

	@Override
	@Transactional
	public TestsetExecutionTrigger getTestsetExecutionTriggerById(long projectId, long id) {
		return this.TestsetExecutionTriggerDAO.getTestsetExecutionTriggerById(projectId, id);
	}

	@Override
	@Transactional
	public List<TestsetExecutionTrigger> getTestsetExecutionTriggerByTestsetId(long projectId, long testsetId) {
		return this.TestsetExecutionTriggerDAO.getTestsetExecutionTriggerByTestsetId(projectId, testsetId);
	}

	@Override
	@Transactional
	public void removeTestsetExecutionTrigger(long projectId, long id) {
		this.TestsetExecutionTriggerDAO.removeTestsetExecutionTrigger(projectId, id);
	}

	@Override
	@Transactional
	public List<TestsetExecutionTrigger> listTestsetExecutionTrigger() {
		return this.TestsetExecutionTriggerDAO.listTestsetExecutionTrigger();
	}
}
