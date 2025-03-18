package com.macrosoft.utp.adatper.utpengine;

import java.util.Date;


import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoftsys.UtpCoreAccessLib.*;

public class CommunicationExceptionListerner extends ICommuExceptionListener {
	private static final ILogger logger = LoggerFactory.Create(CommunicationExceptionListerner.class.getName());
	private IUtpEngineAdapter utpEngineAdapter;
	private ExecutionStatusService executionStatusService;
	private String executionId;

	public CommunicationExceptionListerner(String executionId, ExecutionStatusService executionStatusService,
			IUtpEngineAdapter utpEngineAdapter) {
		super();
		this.executionId = executionId;
		this.executionStatusService = executionStatusService;
		this.utpEngineAdapter = utpEngineAdapter;
	}

	public void commuExceptionNotify(CommuExceptionType exception, long engineSessionId) {
		try {
			logger.info(String.format("CommuExceptionType is %s, sessionId: %s", exception.toString(), Long.toString(engineSessionId)));
			
			TenantContext.setTenantId(Long.toString(utpEngineAdapter.getTenantId()));
			
			
			this.utpEngineAdapter.setUtpEngineExceptionFlag();

			this.terminateExecutionStatus(executionId);

			logger.info(String.format("setUtpEngineExceptionFlag end"));
		} catch (Exception ex) {
			logger.error("commuExceptionNotify", ex);
		}
	}

	private void terminateExecutionStatus(String executionId) {
		ExecutionStatus status = this.executionStatusService.getExecutionStatusByExecutionId(executionId);
		status.setStatus(ExecutionStatus.Terminated);
		status.setEndTime(new Date(new Date().getTime()));
		this.executionStatusService.updateExecutionStatus(status);
		logger.info(String.format("terminate execution %s because of communication exception.", executionId));
		
		ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		model.setStatus(ExecutionStatus.TerminatedString);
	}
}
