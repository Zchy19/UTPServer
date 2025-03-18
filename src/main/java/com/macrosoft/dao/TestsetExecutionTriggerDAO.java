package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.TestsetExecutionTrigger;

public interface TestsetExecutionTriggerDAO {
	public void addTestsetExecutionTrigger(TestsetExecutionTrigger trigger);
	public void updateTestsetExecutionTrigger(TestsetExecutionTrigger p);
	public TestsetExecutionTrigger getTestsetExecutionTriggerById(long projectId, long id);
	public List<TestsetExecutionTrigger> getTestsetExecutionTriggerByTestsetId(long projectId, long testsetId);
	public List<TestsetExecutionTrigger> listTestsetExecutionTrigger();
	public void removeTestsetExecutionTrigger(long projectId, long id);
}
