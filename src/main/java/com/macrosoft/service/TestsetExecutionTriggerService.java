package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.TestsetExecutionTrigger;

public interface TestsetExecutionTriggerService {
	public void addTestsetExecutionTrigger(TestsetExecutionTrigger p);
	public void updateTestsetExecutionTrigger(TestsetExecutionTrigger p);
	public TestsetExecutionTrigger getTestsetExecutionTriggerById(long projectId, long id);
	public List<TestsetExecutionTrigger> getTestsetExecutionTriggerByTestsetId(long projectId, long testsetId);
	public void removeTestsetExecutionTrigger(long projectId, long id);
	public List<TestsetExecutionTrigger> listTestsetExecutionTrigger();
	
}
