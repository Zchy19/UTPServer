package com.macrosoft.service.impl;

import com.macrosoft.controller.dto.PreprocessExecutionParameter;
import com.macrosoft.service.ExecutionModelUtility;
import com.macrosoft.service.ExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;


@Service
public class ExecutionServiceImpl implements ExecutionService {
	private static final ILogger logger = LoggerFactory.Create(ExecutionServiceImpl.class.getName());
	private UtpEngineExecutor utpEngineExecutor;
	
	@Autowired
	public void setUtpEngineExecutor(UtpEngineExecutor utpEngineExecutor){
		this.utpEngineExecutor = utpEngineExecutor;
	}
	
	public UtpEngineExecutor getUtpEngineExecutor()
	{
		return utpEngineExecutor;
	}
	
	@Override
	@Transactional
	public void prepareExecution(String executionId, String  executionName,String testObject, String executedByUserId, long projectId, String scriptId, String orgId, String ipAddress, long port, boolean isDummyRun, boolean sendExecutionResultEmail)
	{
		logger.info(String.format("prepareExecution executionId:%s, executionName:%s, testObject:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",executionId, executionName, testObject, executedByUserId, projectId, scriptId, orgId, ipAddress, port, isDummyRun));

		ExecutionModelUtility.SaveExecutionModelIntoCache(executionId, false, "", executedByUserId);
		
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				if (isDummyRun)
				{
					utpEngineExecutor.DummyRunScript(executionId, executionName, testObject, executedByUserId, projectId, scriptId, orgId, ipAddress, port);
				}
				else
				{
					utpEngineExecutor.PrepareExecutionScript(executionId, executionName, testObject, executedByUserId, projectId, scriptId, orgId, ipAddress, port);
				}
			}
			catch (Exception ex)
			{
				logger.error("prepareExecution Async - " + ex);
			}

		}).start();
	}


	@Override
	@Transactional
	public void prepareAutoExecutionTestset(String executionId,String  executionName, String testObject, String executedByUserId, long projectId,  String testsetId, String orgId, String ipAddress, long port, long recoverSubscriptReferenceId, boolean isSendEmail)
	{
		logger.info(String.format("prepareAutoExecutionTestset executionId:%s  executionName:%s, testObject:%s, projectId: %s, testsetId:%s, orgId: %s, ipaddress: %s, port: %s, recoverSubscriptReferenceId: %s",executionId, executionName, testObject, projectId, testsetId,orgId, ipAddress, port, recoverSubscriptReferenceId));

		ExecutionModelUtility.SaveExecutionModelIntoCache(executionId, isSendEmail, executedByUserId, executedByUserId);

		try
		{
			ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				
			utpEngineExecutor.PrepareExecutionTestset(executionId,executionName, testObject, executedByUserId, projectId, testsetId, orgId, ipAddress, port, recoverSubscriptReferenceId);

		}
		catch (Exception ex)
		{
			logger.error("prepareAutoExecutionTestset Async - " + ex);
		}
	}
	
	
	@Override
	@Transactional
	public void prepareExecutionTestset(String executionId,String  executionName, String testObject, String executedByUserId, long projectId,  String testsetId, String orgId, String ipAddress, long port, long recoverSubscriptReferenceId, boolean isDummyRun, boolean isSendEmail, String emailAddress)
	{
		logger.info(String.format("prepareExecutionTestset executionId:%s  executionName:%s,testObject:%s, projectId: %s, testsetId:%s, orgId: %s, ipaddress: %s, port: %s, recoverSubscriptReferenceId: %s, isDummyRun: %s, isSendEmail:%s, emailAddress:%s",executionId, executionName, testObject, projectId, testsetId,orgId, ipAddress, port, recoverSubscriptReferenceId, isDummyRun, isSendEmail, emailAddress));
		ExecutionModelUtility.SaveExecutionModelIntoCache(executionId, isSendEmail, emailAddress, executedByUserId);

		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				
				if (isDummyRun)
				{
					utpEngineExecutor.DummyRunTestset(executionId,executionName,testObject, executedByUserId, projectId, testsetId, orgId, ipAddress, port, recoverSubscriptReferenceId);
				}
				else
				{
					utpEngineExecutor.PrepareExecutionTestset(executionId,executionName,testObject, executedByUserId, projectId, testsetId, orgId, ipAddress, port, recoverSubscriptReferenceId);
				}
			}
			catch (Exception ex)
			{
				logger.error("prepareExecution Async - " + ex);
			}

		}).start();
	}


	@Override
	@Transactional
	public void prepareExecutionByScripts(PreprocessExecutionParameter payLoad)
	{
		logger.info(String.format("prepareExecutionTestset executionId:%s  executionName:%s,testObject:%s," +
						" projectId: %s, getScriptIds:%s, orgId: %s, ipaddress: %s, port: %s, recoverSubscriptReferenceId: %s," +
						" isDummyRun: %s, isSendEmail:%s, emailAddress:%s",
				payLoad.getExecutionId(),payLoad.getExecutionName(), payLoad.getTestObject(),
				payLoad.getProjectId(), payLoad.getScriptIds(),payLoad.getDomainId(), payLoad.getUtpCoreIpAddress(), payLoad.getUtpCorePort(),payLoad.getRecoverSubscriptReferenceId(),
				payLoad.getIsDummyRun(),payLoad.getIsSendEmail(), payLoad.getEmailAddress()));
			ExecutionModelUtility.SaveExecutionModelIntoCache(payLoad.getExecutionId(), payLoad.getIsSendEmail(), payLoad.getEmailAddress(),payLoad.getExecutedByUserId());
			ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(payLoad.getExecutionId());
			model.setIpAddress(payLoad.getUtpCoreIpAddress());
			model.setPort(payLoad.getUtpCorePort());
			model.setScriptGroupId(payLoad.getScriptGroupId());
			model.setIsAutoRun(payLoad.isAutoRun());
			model.setIsTestcaseCollect(payLoad.isTestcaseCollect());
			model.setIsTestcasePersist(payLoad.isTestcasePersist());
			model.setIsTeststepCollect(payLoad.isTeststepCollect());
			model.setIsTeststepPersist(payLoad.isTeststepPersist());
			model.setIsTestdataCollect(payLoad.isTestdataCollect());
			model.setIsTestdataPersist(payLoad.isTestdataPersist());
			model.setTransformConfig(payLoad.getTransformConfig());
			model.setEngineName(payLoad.getEngineName());
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(payLoad.getExecutionId());

//				if (payLoad.getIsDummyRun())
//				{
//					utpEngineExecutor.DummyRunTestset(payLoad.getExecutionId(),payLoad.getExecutionName(),payLoad.getTestObject(),payLoad.getExecutedByUserId(), payLoad.getProjectId(),payLoad.getScriptGroupId(),String.valueOf(payLoad.getDomainId()),payLoad.getUtpCoreIpAddress(), payLoad.getUtpCorePort(),payLoad.getRecoverSubscriptReferenceId());
//				}
//				else
				{
					utpEngineExecutor.PrepareExecution(payLoad);
				}
			}
			catch (Exception ex)
			{
				logger.error("prepareExecution Async - " + ex);
			}

		}).start();
	}

	@Override
	@Transactional
	public void startAutoExecution(StartExecutionParameter startExecutionParameter)
	{
		try
		{
			ExecutionModelUtility.SetTenantIdInThreadLocalByCache(startExecutionParameter.getExecutionId());
			utpEngineExecutor.StartExecution(startExecutionParameter);
		}
		catch (Exception ex)
		{
			logger.error("startAutoExecution sync - " + ex);
		}
	}

	
	@Override
	@Transactional
	public void startExecution(StartExecutionParameter startExecutionParameter)
	{
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(startExecutionParameter.getExecutionId());
				utpEngineExecutor.StartExecution(startExecutionParameter);
			}
			catch (Exception ex)
			{
				logger.error("startExecution Async - " + ex);
			}

		}).start();
	}

	@Override
	@Transactional
	public void cancelExecution(String executionId)
	{
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				utpEngineExecutor.CancelExecution(executionId);
			}
			catch (Exception ex)
			{
				logger.error("cancelExecution Async - " + ex);
			}

		}).start();
	}

	@Override
	@Transactional
	public void singleStepExecution(String executionId)
	{
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				utpEngineExecutor.SingleStepExecution(executionId);
			}
			catch (Exception ex)
			{
				logger.error("singleStepExecution Async - " + ex);
			}

		}).start();
	}
	
	@Override
	@Transactional
	public void stopExecution(String executionId)
	{
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				utpEngineExecutor.StopExecution(executionId);
			}
			catch (Exception ex)
			{
				logger.error("stopExecution Async - " + ex);
			}

		}).start();
	}

	@Override
	@Transactional
	public void pauseExecution(String executionId)
	{
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				utpEngineExecutor.PauseExecution(executionId);
			}
			catch (Exception ex)
			{
				logger.error("pauseExecution Async - " + ex);
			}

		}).start();		

	}

	@Override
	@Transactional
	public void resumeExecution(String executionId)
	{
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SetTenantIdInThreadLocalByCache(executionId);
				  
				utpEngineExecutor.ResumeExecution(executionId);
			}
			catch (Exception ex)
			{
				logger.error("resumeExecution Async - " + ex);
			}
		}).start();
	}
	
}

