package com.macrosoft.utp.adatper.utpengine;

import java.util.Date;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.service.ExecutionStatusService;


public class UtpEngineController {
	private static final ILogger logger = LoggerFactory.Create(UtpEngineController.class.getName());
	private boolean isDeactive = false;	
	private String orgId;
	private String executedByUserId;
	private IUtpEngineAdapter engine;
	private boolean isDummyRun;
	private ExecutionStatusService executionStatusService;
	private String executionId;
	private String executionName;
	private String testObject;
	private long testsetId;
	private long projectId;

	
	public UtpEngineController(String executionId, long projectId, boolean isDummyRun, ExecutionStatusService executionStatusService) {
		this.executionId = executionId;
		this.isDummyRun = isDummyRun;
		this.projectId = projectId;
		this.executionStatusService = executionStatusService;
	}
	
	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public long getTestsetId() {
		return testsetId;
	}

	public void setTestsetId(long testsetId) {
		this.testsetId = testsetId;
	}

	public String getTestObject() {
		return testObject;
	}

	public void setTestObject(String testObject) {
		this.testObject = testObject;
	}

	public boolean isDummyRun() {
		return isDummyRun;
	}

	public void setDummyRun(boolean isDummyRun) {
		this.isDummyRun = isDummyRun;
	}

	public String getExecutionId() {
		return executionId;
	}
	public String getExecutionName() {
		return executionName;
	}

	public void setExecutionName(String executionName) {
		this.executionName = executionName;
	}
	
	 public String getOrgId() {
		return orgId;
	}

	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}

	public String getExecutedByUserId() {
		return executedByUserId;
	}

	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}
	 
	
	public IUtpEngineAdapter getEngine() {
		return engine;
	}

	public void setEngine(IUtpEngineAdapter engine) {
		this.engine = engine;
	}


	public boolean tryReleaseEngine() {

		if (engine == null) return true;
		
		TenantContext.setTenantId(Long.toString(this.engine.getTenantId()));

		if (this.engine.getUtpEngineHasException())
		{
			logger.info("tryReleaseEngine enter, this engine exception flag is:" + this.engine.getUtpEngineHasException() + ", tenantId:" + TenantContext.getTenantId());
		
			// if active time of engine has elapsed longer than 30 minutes, then destroy engine
			DestroyEngine();
			return true;
		}
		
		Date dNow = new Date();
		
		//milliseconds
		long different = dNow.getTime() - this.engine.getLastActiveTime().getTime();
		
		long secondsInMilli = 1000;
		long minutesInMilli = secondsInMilli * 60;

		long elapsedMinutes = different / minutesInMilli;

		logger.debug(String.format("tryReleaseEngine %s elapsedMinutes is: %s", this.executionId , elapsedMinutes));
		
		int MaxWaitingTimeOfEngine = 60 * 12; // minutes

		//暂时关闭, ExecProgJavaListener中没有再上传this.engine.getLastActiveTime().getTime();,所以暂时关闭
//		if (elapsedMinutes > MaxWaitingTimeOfEngine)
//		{
//			logger.info(String.format("tryReleaseEngine %s elapsedMinutes is: %s", this.executionId , elapsedMinutes));
//
//			// if active time of engine has elapsed longer than 30 minutes, then destroy engine
//			DestroyEngine();
//			return true;
//		}
				
		return false;

	}

	private void terminateExecutionStatus()
	{
		ExecutionStatus status = this.executionStatusService.getExecutionStatusByExecutionId(executionId);
		if (status == null) return;
		
		status.setStatus(ExecutionStatus.Terminated);
		status.setEndTime(new Date(new Date().getTime()));
		this.executionStatusService.updateExecutionStatus(status);
		logger.info(String.format("execution %s be terminated by watch dog when timeout or exception.", executionId));
	}

	public void DestroyEngine() {
		terminateExecutionStatus();
		engine.releaseEngine();
	}
	
	public void finalize()
	{
		logger.info(String.format("the utpEngineController of  %s has been finalized.", executionId));
	}
}