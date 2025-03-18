package com.macrosoft.utp.adatper.utpengine;


import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.service.ExecutionResultService;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.service.MonitorDataService;
import com.macrosoftsys.UtpCoreAccessLib.*;

public class ExecStatusJavaListener extends IExecStatusListener {
	private IUtpEngineAdapter utpEngineAdapter;
	private ExecutionStatusService executionStatusService;
	private ExecutionResultService executionResultService = null;
	private String executionId;

	
	private static final ILogger logger = LoggerFactory.Create(ExecStatusJavaListener.class.getName());

	public ExecStatusJavaListener(ExecutionResultService executionResultService,
			IUtpEngineAdapter utpEngineAdapter, 
			ExecutionStatusService executionStatusService, String executionId) {

		super();
		this.executionResultService = executionResultService;
		this.utpEngineAdapter = utpEngineAdapter;
		this.executionStatusService = executionStatusService;
		this.executionId = executionId;
	}

	  public void execStatusChanged(ExecStatus newStatus, long engineSessionId) {

		  TenantContext.setTenantId(Long.toString(utpEngineAdapter.getTenantId()));

		  try{
			  logger.info(String.format("update status , tenantId: %s, threadId: %s, executionId: %s, sessionId:%s ", TenantContext.getTenantId(), Long.toString(Thread.currentThread().getId()), executionId, engineSessionId));
					
			  logger.info("Execution status update: " + newStatus.toString());
					
					  if (newStatus == ExecStatus.EXECUTE_STATUS_INIT)
					  {
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Starting, ExecutionStatus.StartingString);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_EXECUTING)
					  {
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Running, ExecutionStatus.RunningString);
						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_Running);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_PAUSING)
					  {
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Pausing, ExecutionStatus.PausingString);						  
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_PAUSED)
					  {
						  new SavingCachingDataTask(executionResultService).saveCachedExecutionResultToDatabase();
						  
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Paused, ExecutionStatus.PausedString);

						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_Paused);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_EXCEPTION_HANDLING)
					  {
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.ExceptionHandling, ExecutionStatus.ExceptionHandlingString);

						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_ExceptionHandling);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_WAITING_NETWORK)
					  {
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.ReconnectingNetwork, ExecutionStatus.ReconnectingNetworkString);

						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_ReconnectingNetwork);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_TERMINATED)
					  {
						  logger.info("Execution status update: EXECUTE_STATUS_TERMINATED");
						  //新加入的代码
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Terminated, ExecutionStatus.TerminatedString);

						  this.utpEngineAdapter.endExecutionByStatusLisener(ExecutionStatus.Terminated, ExecutionStatus.TerminatedString);
						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_Terminated);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_STOPPING)
					  {
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Stopping, ExecutionStatus.StoppingString);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_STOPPED)
					  {

						  logger.info("Execution status update: EXECUTE_STATUS_STOPPED");
							//新加入的代码
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Stopped, ExecutionStatus.StoppedString);
						  this.utpEngineAdapter.endExecutionByStatusLisener(ExecutionStatus.Stopped, ExecutionStatus.StoppedString);
						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_Stopped);
					  }
					  else if (newStatus == ExecStatus.EXECUTE_STATUS_COMPLETED)
					  {
						  logger.info("Execution status update: EXECUTE_STATUS_COMPLETED");
						  this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Completed, ExecutionStatus.CompletedString);
						  this.utpEngineAdapter.endExecutionByStatusLisener(ExecutionStatus.Completed, ExecutionStatus.CompletedString);
						  this.utpEngineAdapter.updateExecutionModelStatus(ExecutionModel.State_Completed);
					  }
					  else
					  {
						  logger.info(String.format("Notified to execution status changed %s", newStatus.toString()));
					  }
				}
				catch(Exception ex)
				{
					logger.info("Execution Status update has exception happened :" + ex.toString());
				}
	  }

		public void finalize()
		{
			logger.info(String.format("the ExecStatusJavaListener of  %s has been finalized.", executionId));
		}
}
