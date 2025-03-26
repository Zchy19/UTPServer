package com.macrosoft.utp.adatper.utpengine;

import com.macrosoft.caching.CachedDataManager;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.ClientDbConnection;
import com.macrosoft.master.MasterService;
import com.macrosoft.master.MasterServiceHolder;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.MonitorData;
import com.macrosoft.service.ExecutionResultService;
import com.macrosoft.service.MonitorDataService;

import java.util.List;
import java.util.TimerTask;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class SavingCachingDataTask extends TimerTask {
	private static final ILogger logger = LoggerFactory.Create(SavingCachingDataTask.class.getName());
	private static Lock lock = new ReentrantLock();
	ExecutionResultService executionResultService = null;
	MonitorDataService monitorDataService = null;

	public SavingCachingDataTask(ExecutionResultService executionResultService)
	{
		this.executionResultService = executionResultService;
	}
	
	public SavingCachingDataTask(ExecutionResultService executionResultService, MonitorDataService monitorDataService) {
		this.executionResultService = executionResultService;
		this.monitorDataService = monitorDataService;
	}

	public void saveCachedExecutionResultToDatabase()
	{
		saveCacheToDatabase(true);
	}
	
	private void saveCacheToDatabase(boolean saveExecutionResultOnly)
	{		  
	      try {

				 lock.lock();
				 
				// initialize jobs for each organization
	    		MasterService masterService = MasterServiceHolder.getMasterService();
				List<ClientDbConnection> connections = masterService.getClientDbConnections();
				for (ClientDbConnection connection : connections)
				{
					String tenantId = Long.toString(connection.getTenantId());
					TenantContext.setTenantId(tenantId);
					
					// handle cached ExecutionResults
					List<ExecutionResult> cachedExecutionResults = CachedDataManager.getCachedExecutionResultList(tenantId);

					if (cachedExecutionResults.size() > 0)
					{
						executionResultService.addExecutionResultList(cachedExecutionResults);		
						logger.info(String.format("SavingExecutionResultTask() save cached ExecutionResult for tenant %s end.", tenantId));
					}

					for (ExecutionResult executionResult: cachedExecutionResults)
					{
						CachedDataManager.RemoveExecutionResult(tenantId, executionResult);
						if (executionResult.getCommandType() == ExecutionResult.CommandType_ExecutionEnd)
						{
							sendEmailOfExecutionResultAync(tenantId, executionResult.getExecutionId());
						}
					}

					if (!saveExecutionResultOnly)
					{
						// handle cached MornitorData
						List<MonitorData> cachedMonitorDatas = CachedDataManager.getCachedMonitorDataList(tenantId);

						if (cachedMonitorDatas.size() > 0)
						{
							monitorDataService.addMonitorDataList(cachedMonitorDatas);
							logger.info(String.format("saveCacheToDatabase() save cached MonitorData for tenant %s end.", tenantId));
						}

						for (MonitorData monitorData : cachedMonitorDatas)
						{
							CachedDataManager.RemoveMonitorData(tenantId, monitorData);
						}
					}
				}
	      } catch(Exception ex) {
	    	  logger.error(String.format("saveCacheToDatabase run has exception : %s",ex.toString()));
	      }
	      finally
	      {
		      lock.unlock();
	      }
	}
	
	@Override
	public void run() {
		saveCacheToDatabase(false);
	}
	
	private void sendEmailOfExecutionResultAync(String tenantId, String executionId)
	{
		new Thread(() -> {
			try
			{
				logger.info(String.format("sendEmailOfExecutionResultAync() -> tenantId:%s, executionId:%s " , tenantId, executionId));
				TenantContext.setTenantId(tenantId);
				
				ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
				if (model != null)
				{
					executionResultService.sendEmailOfExecutionResult(tenantId, executionId, model.getIsSendEmail(), model.getEmailAddress());
				}
			}
			catch (Exception ex)
			{
				logger.error("sendEmailOfExecutionResultAync() -> has exception:" + ex);
			}
		}).start();
	}
}