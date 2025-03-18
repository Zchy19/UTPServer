package com.macrosoft.service;

import com.macrosoft.controller.dto.PreprocessExecutionParameter;
import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;

public interface ExecutionService {

	public UtpEngineExecutor getUtpEngineExecutor();
	
	public void prepareExecution(String executionId, String  executionName,String testObject,String executedByUserId, long projectId, String scriptId, String orgId, String ipAddress, long port, boolean isDummyRun, boolean sendExecutionResultEmail);
	public void prepareExecutionTestset(String executionId,String  executionName,String testObject,String executedByUserId, long projectId, String testsetId, String orgId, String ipAddress, long port, long recoverSubscriptReferenceId, boolean isDummyRun, boolean sendExecutionResultEmail, String emailAddress);

	public void prepareExecutionByScripts(PreprocessExecutionParameter payLoad);

	public void prepareAutoExecutionTestset(String executionId,String  executionName,String testObject, String executedByUserId, long projectId,  String testsetId, String orgId, String ipAddress, long port, long recoverSubscriptReferenceId,boolean isSendEmail);

	public void startExecution(StartExecutionParameter startExecutionParameter);

	public void startAutoExecution(StartExecutionParameter startExecutionParameter);
	public void singleStepExecution(String executionId);
	
	public void stopExecution(String executionId);
	public void pauseExecution(String executionId);
	public void resumeExecution(String executionId);
	public void cancelExecution(String executionId);
}
