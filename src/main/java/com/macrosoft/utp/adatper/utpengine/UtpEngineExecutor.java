package com.macrosoft.utp.adatper.utpengine;


import java.util.ArrayList;
import java.util.List;

import com.macrosoft.controller.dto.PreprocessExecutionParameter;
import com.macrosoft.utp.adatper.utpengine.behaviors.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptException;
import com.macrosoft.utp.adatper.utpengine.exception.ConfigEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.CreateUtpEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.StartExecutionException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;
import org.springframework.stereotype.Component;

@Component
public class UtpEngineExecutor {
	
	private UtpEngineControllerManager utpEngineControllerManager;
	private ExecutionStatusService executionStatusService;

	private static final ILogger logger = LoggerFactory.Create(UtpEngineExecutor.class.getName());

	@Autowired
	public void setUtpEngineControllerManager(UtpEngineControllerManager ps){
		this.utpEngineControllerManager = ps;
	}

	@Autowired
	public void setExecutionStatusService(ExecutionStatusService executionStatusService){
		this.executionStatusService = executionStatusService;
	}
	
	public UtpEngineControllerManager getUtpEngineControllerManager()
	{
		return utpEngineControllerManager;
	}

	public void DummyRunScript(String executionId, String  executionName,String testObject, String executedByUserId, long projectId,  String scriptId, String orgId, String ipAddress, long port)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(Long.parseLong(scriptId));
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setProjectId(projectId);
			context.setExecutionName(executionName);
			context.setTestObject(testObject);
			context.setExecutedByUserId(executedByUserId);
			context.setDummyRun(true);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, true,
						new UtpEngineConfigInterceptionBehavior(utpEngineControllerManager, executionId,
								new AnalyzeScriptInterceptionBehavior(
										new SelectAgentInterceptionBehavior(null))));

			chainedBehavior.Invoke(context);
			ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
			executionModel.setTemporarySave(true);

			
		} catch (UtpCoreNetworkException ex) {
			logger.error("DummyRunScript-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("DummyRunScript-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("DummyRunScript-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("DummyRunScript-ConfigEngineException", ex);
		} catch (InterruptedException ex) {
			logger.error("DummyRunScript-InterruptedException", ex);	
		} catch (Exception ex) {
			logger.error("DummyRunScript", ex);		
		}
	}
	
	public void PrepareExecutionScript(String executionId, String  executionName, String testObject, String executedByUserId, long projectId,   String scriptId, String orgId, String ipAddress, long port)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(Long.parseLong(scriptId));
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setProjectId(projectId);
			context.setExecutionName(executionName);
			context.setTestObject(testObject);
			context.setExecutedByUserId(executedByUserId);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, false,
						new UtpEngineConfigInterceptionBehavior(utpEngineControllerManager, executionId,
									new AnalyzeScriptInterceptionBehavior(
											new SelectAgentInterceptionBehavior(null))));

			chainedBehavior.Invoke(context);
			ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
			executionModel.setTemporarySave(true);
			
		} catch (UtpCoreNetworkException ex) {
			logger.error("PrepareExecutionScript-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("PrepareExecutionScript-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("PrepareExecutionScript-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("PrepareExecutionScript-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("PrepareExecutionScript-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("PrepareExecutionScript-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("PrepareExecutionScript", ex);		
		}
	}

	public void PrepareExecutionTestset(String executionId, String  executionName,String testObject, String executedByUserId, long projectId, String testsetId, String orgId, String ipAddress, long port, long recoverSubscriptReferenceId)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(0);
			context.setTestsetId(Long.parseLong(testsetId));
			context.setIsTestsetExecution(true);
			context.setProjectId(projectId);
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setExecutionName(executionName);
			context.setTestObject(testObject);
			context.setExecutedByUserId(executedByUserId);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, false,
						new UtpEngineConfigOfTestsetInterceptionBehavior(utpEngineControllerManager, executionId, recoverSubscriptReferenceId,
									new AnalyzeScriptInterceptionBehavior(
											new SelectAgentInterceptionBehavior(null))));
			chainedBehavior.Invoke(context);
		} catch (UtpCoreNetworkException ex) {
			logger.error("PrepareExecutionTestset-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("PrepareExecutionTestset-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("PrepareExecutionTestset-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("PrepareExecutionTestset-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("PrepareExecutionTestset-StartExecutionException", ex);		
		} catch (InterruptedException ex) {
			logger.error("PrepareExecutionTestset-InterruptedException", ex);		
		} catch (Exception ex) {
			logger.error("PrepareExecutionTestset", ex);		
		}
	}

	public void PrepareExecution(PreprocessExecutionParameter payLoad)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(payLoad.getScriptIds());
			context.setExecutionId(payLoad.getExecutionId());
			context.setOrgId(String.valueOf(payLoad.getDomainId()));
			context.setProjectId(payLoad.getProjectId());
			context.setExecutionName(payLoad.getExecutionName());
			context.setTestObject(payLoad.getTestObject());
			context.setExecutedByUserId(payLoad.getExecutedByUserId());
			context.setTestsetId(Long.parseLong(payLoad.getScriptGroupId()));
//			if (payLoad.isTeststepCollect()&& payLoad.isTeststepPersist()){
			context.setIsTestsetExecution(true);

			InterceptionBehavior chainedBehavior
					= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, payLoad.getExecutionId(), payLoad.getUtpCoreIpAddress(), payLoad.getUtpCorePort(), payLoad.getIsDummyRun(),
						new UtpEngineInterceptionBehavior(utpEngineControllerManager, payLoad.getExecutionId(),payLoad.getRecoverSubscriptReferenceId(),
							new AnalyzeScriptInterceptionBehavior(
									new SelectAgentInterceptionBehavior(
											new ExtendedAutoStartExecutionInterceptionBehavior(utpEngineControllerManager, executionStatusService, null)))));


			chainedBehavior.Invoke(context);

			if (!payLoad.isTestcasePersist()||!payLoad.isTeststepPersist()||!payLoad.isTestdataPersist())
			{
				ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(payLoad.getExecutionId());
				executionModel.setTemporarySave(true);
			}


		} catch (UtpCoreNetworkException ex) {
			logger.error("PrepareExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("PrepareExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("PrepareExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("PrepareExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("PrepareExecution-StartExecutionException", ex);
		} catch (InterruptedException ex) {
			logger.error("PrepareExecution-InterruptedException", ex);
		} catch (Exception ex) {
			logger.error("PrepareExecution", ex);
		}
	}

	public void StartMonitorExecution(String executionId, String executedByUserId, long projectId, 
									String scriptId, String orgId, String ipAddress, long port, boolean isTemporaryExecution)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(Long.parseLong(scriptId));
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setProjectId(projectId);
			context.setExecutionName("");
			context.setTestObject("");
			context.setExecutedByUserId(executedByUserId);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, false,
						new UtpEngineConfigInterceptionBehavior(utpEngineControllerManager, executionId,
								new AnalyzeScriptInterceptionBehavior(
										new SelectAgentInterceptionBehavior(
												new ExtendedAutoStartExecutionInterceptionBehavior(utpEngineControllerManager, executionStatusService, null)))));
			

			chainedBehavior.Invoke(context);
			
			if (isTemporaryExecution)
			{
				ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
				executionModel.setTemporarySave(true);
			}
/*			
			ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(context.getExecutionId());
			logger.info("executionModel.getMonitorDataList():" + executionModel.getMonitorDataList());
			return executionModel.getMonitorDataList();
*/
			
		} catch (UtpCoreNetworkException ex) {
			logger.error("StartMonitorExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("StartMonitorExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("StartMonitorExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("StartMonitorExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("StartMonitorExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("StartMonitorExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("StartMonitorExecution", ex);		
		}
	}



	public void SendCommandExecution(String executionId, String executedByUserId, long projectId, String scriptId, String orgId, String ipAddress, long port)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(Long.parseLong(scriptId));
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setProjectId(projectId);
			context.setExecutionName("");
			context.setTestObject("");
			context.setExecutedByUserId(executedByUserId);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, false,
						new UtpEngineConfigInterceptionBehavior(utpEngineControllerManager, executionId,
									new AnalyzeScriptInterceptionBehavior(
											new SelectAgentInterceptionBehavior(
													new AutoStartExecutionInterceptionBehavior(utpEngineControllerManager, executionStatusService, null)))));

			chainedBehavior.Invoke(context);
	
		} catch (UtpCoreNetworkException ex) {
			logger.error("SendCommandExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("SendCommandExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("SendCommandExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("SendCommandExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("SendCommandExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("SendCommandExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("SendCommandExecution-", ex);		
		}
	}


	public void StopMonitorExecution(String executionId, String executedByUserId, long projectId, String scriptId, String orgId, String ipAddress, long port)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(Long.parseLong(scriptId));
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setProjectId(projectId);
			context.setExecutionName("");
			context.setTestObject("");
			context.setExecutedByUserId(executedByUserId);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, false,
						new UtpEngineConfigInterceptionBehavior(utpEngineControllerManager, executionId,
									new AnalyzeScriptInterceptionBehavior(
											new SelectAgentInterceptionBehavior(
													new AutoStartExecutionInterceptionBehavior(utpEngineControllerManager, executionStatusService, null)))));

			chainedBehavior.Invoke(context);
	
		} catch (UtpCoreNetworkException ex) {
			logger.error("StopMonitorExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("StopMonitorExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("StopMonitorExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("StopMonitorExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("StopMonitorExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("StopMonitorExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("StopMonitorExecution-", ex);		
		}
	}
		public void DummyRunTestset(String executionId, String  executionName,String testObject, String executedByUserId, long projectId, String testsetId, String orgId, String ipAddress, long port, long recoverSubscriptReferenceId)
	{
		try
		{
			ExecutionContext context = new ExecutionContext(0);
			context.setTestsetId(Long.parseLong(testsetId));
			context.setProjectId(projectId);
			context.setIsTestsetExecution(true);
			context.setExecutionId(executionId);
			context.setOrgId(orgId);
			context.setExecutionName(executionName);
			context.setTestObject(testObject);
			context.setExecutedByUserId(executedByUserId);
			context.setDummyRun(true);
			
			InterceptionBehavior chainedBehavior 
				= new UtpEngineCreateInterceptionBehavior(utpEngineControllerManager, executionId, ipAddress, port, true,
						new UtpEngineConfigOfTestsetInterceptionBehavior(utpEngineControllerManager, executionId, recoverSubscriptReferenceId,
									new AnalyzeScriptInterceptionBehavior(
											new SelectAgentInterceptionBehavior(null))));

			chainedBehavior.Invoke(context);
		} catch (UtpCoreNetworkException ex) {
			logger.error("DummyRunTestset-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("DummyRunTestset-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("DummyRunTestset-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("DummyRunTestset-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("DummyRunTestset-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("DummyRunTestset-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("DummyRunTestset", ex);		
		}
	}
	
	public void StartExecution(StartExecutionParameter startExecutionParameter)
	{
		try
		{
			InterceptionBehavior chainedBehavior 
				= new UtpEngineResolverInterceptionBehavior(utpEngineControllerManager, startExecutionParameter.getExecutionId(),
									new StartExecutionInterceptionBehavior(startExecutionParameter.getSelectedAntbotMapping(), executionStatusService, null));
		
			UtpEngineController resolveEngineController = utpEngineControllerManager.GetEngineController(startExecutionParameter.getExecutionId());
			
			ExecutionContext context = new ExecutionContext();
			context.setExecutionId(startExecutionParameter.getExecutionId());
			context.setProjectId(resolveEngineController.getProjectId());
			context.setExecutionName(resolveEngineController.getExecutionName());
			context.setTestObject(resolveEngineController.getTestObject());
			context.setOrgId(resolveEngineController.getOrgId());
			context.setExecutedByUserId(resolveEngineController.getExecutedByUserId());
			context.setTestsetId(resolveEngineController.getTestsetId());
			
			chainedBehavior.Invoke(context);
		} catch (UtpCoreNetworkException ex) {
			logger.error("StartExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("StartExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("StartExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("StartExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("StartExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("StartExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("StartExecution", ex);		
		}		

	}

	public void SingleStepExecution(String executionId) throws CreateUtpEngineException, UtpCoreNetworkException, ConfigEngineException, StartExecutionException, AnalyzeScriptException, InterruptedException
	{
		try
		{
			InterceptionBehavior chainedBehavior 
			= new UtpEngineResolverInterceptionBehavior(utpEngineControllerManager, executionId,
								new SingleStepExecutionInterceptionBehavior(null));
		
			ExecutionContext context = new ExecutionContext();
			context.setExecutionId(executionId);
			chainedBehavior.Invoke(context);
		} catch (UtpCoreNetworkException ex) {
			logger.error("SingleStepExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("SingleStepExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("SingleStepExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("SingleStepExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("SingleStepExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("SingleStepExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("SingleStepExecution", ex);		
		}
	}
	
	public void StopExecution(String executionId) throws CreateUtpEngineException, UtpCoreNetworkException, ConfigEngineException, StartExecutionException, AnalyzeScriptException, InterruptedException
	{
		try
		{
			InterceptionBehavior chainedBehavior 
			= new UtpEngineResolverInterceptionBehavior(utpEngineControllerManager, executionId,
								new StopExecutionInterceptionBehavior(null));
		
			ExecutionContext context = new ExecutionContext();
			context.setExecutionId(executionId);
			chainedBehavior.Invoke(context);
		} catch (UtpCoreNetworkException ex) {
			logger.error("StopExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("StopExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("StopExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("StopExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("StopExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("StopExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("StopExecution", ex);		
		}
	}

	public void CancelExecution(String executionId)
	{
		try
		{
			InterceptionBehavior chainedBehavior 
				= new UtpEngineResolverInterceptionBehavior(utpEngineControllerManager, executionId,
									new CancelExecutionInterceptionBehavior(null));
			
			ExecutionContext context = new ExecutionContext();
			context.setExecutionId(executionId);
			chainedBehavior.Invoke(context);
		} catch (UtpCoreNetworkException ex) {
			logger.error("CancelExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("CancelExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("CancelExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("CancelExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("CancelExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("CancelExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("CancelExecution", ex);		
		}
	}
	
	public void PauseExecution(String executionId)
	{
		try
		{
			InterceptionBehavior chainedBehavior 
				= new UtpEngineResolverInterceptionBehavior(utpEngineControllerManager, executionId,
									new PauseExecutionInterceptionBehavior(null));
			
			ExecutionContext context = new ExecutionContext();
			context.setExecutionId(executionId);
			chainedBehavior.Invoke(context);	

		} catch (UtpCoreNetworkException ex) {
			logger.error("PauseExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("PauseExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("PauseExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("PauseExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("PauseExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("PauseExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("PauseExecution", ex);		
		}
	}
	
	public void ResumeExecution(String executionId) throws CreateUtpEngineException, UtpCoreNetworkException, ConfigEngineException, StartExecutionException, AnalyzeScriptException
	{
		try
		{
			InterceptionBehavior chainedBehavior 
				= new UtpEngineResolverInterceptionBehavior(utpEngineControllerManager, executionId,
									new ResumeExecutionInterceptionBehavior(null));
			
			ExecutionContext context = new ExecutionContext();
			context.setExecutionId(executionId);
			chainedBehavior.Invoke(context);	


		} catch (UtpCoreNetworkException ex) {
			logger.error("ResumeExecution-UtpCoreNetworkException", ex);
		} catch (CreateUtpEngineException ex) {
			logger.error("ResumeExecution-CreateUtpEngineException", ex);
		} catch (AnalyzeScriptException ex) {
			logger.error("ResumeExecution-AnalyzeScriptException", ex);
		} catch (ConfigEngineException ex) {
			logger.error("ResumeExecution-ConfigEngineException", ex);
		} catch (StartExecutionException ex) {
			logger.error("ResumeExecution-StartExecutionException", ex);	
		} catch (InterruptedException ex) {
			logger.error("ResumeExecution-InterruptedException", ex);			
		} catch (Exception ex) {
			logger.error("ResumeExecution", ex);		
		}
	}
}
