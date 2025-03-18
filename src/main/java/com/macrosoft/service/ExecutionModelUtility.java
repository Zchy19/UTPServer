package com.macrosoft.service;

import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;

public class ExecutionModelUtility
{
	public static void SaveExecutionModelIntoCache(String executionId, boolean isSendEmail, String emailAddress, String executedByUserId)
	{
		SaveExecutionModelIntoCache(executionId, isSendEmail, emailAddress, executedByUserId, false);
	}

	public static void SaveExecutionModelIntoCache(String executionId, boolean isSendEmail, String emailAddress, String executedByUserId, boolean isMonitorExecution)
	{
		long tenantId = Long.parseLong(TenantContext.getTenantId());
		ExecutionModel executionModel = new ExecutionModel();
		executionModel.setExecutionId(executionId);
		executionModel.setTenantId(tenantId);
		executionModel.setOrgId(Long.parseLong(TenantContext.getOrgId()));
		executionModel.setIsSendEmail(isSendEmail);
		executionModel.setEmailAddress(emailAddress);
		executionModel.setExecutedByUserId(executedByUserId);
		executionModel.setMonitorExecution(isMonitorExecution);
		ExecutionModelManager.getInstance().SaveExecutionModel(executionModel);
	}
	
	public static  void SetTenantIdInThreadLocalByCache(String executionId)
	{
		ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		
		TenantContext.setTenantId(Long.toString(model.getTenantId()));
	}

/*	
	public static String GetExecutionIdBySessionId(long engineSessionId)
	{
		ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModelBySessionId(engineSessionId);
		
		if (model == null) return "";
		
		return model.getExecutionId();		
	}
*/

}

