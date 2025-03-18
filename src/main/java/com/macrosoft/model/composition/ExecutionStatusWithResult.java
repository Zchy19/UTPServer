package com.macrosoft.model.composition;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.model.ExecutionStatus;

public class ExecutionStatusWithResult {

	private String executionId;
	private String executionName;
	private long testsetId;
	private String testsetName;
	private boolean isDummyRun;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date startTime;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date endTime;

	private String testObject;
	private String status;
	private String result;
	private long projectId;
	private long orgId;
	private String executedByUserId;
	private String engineName;

	public String getEngineName() {
		return engineName;
	}

	public void setEngineName(String engineName) {
		this.engineName = engineName;
	}

	public boolean getIsDummyRun() {
		return isDummyRun;
	}

	public void setIsDummyRun(boolean isDummyRun) {
		this.isDummyRun = isDummyRun;
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
	
	public String getTestsetName() {
		return testsetName;
	}

	public void setTestsetName(String testsetName) {
		this.testsetName = testsetName;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}

	public String getExecutionName() {
		return executionName;
	}

	public void setExecutionName(String executionName) {
		this.executionName = executionName;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}
	
	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public String getExecutedByUserId() {
		return executedByUserId;
	}

	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}

	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public long getOrgId() {
		return orgId;
	}

	public void setOrgId(long orgId) {
		this.orgId = orgId;
	}
	
	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}
	
	public boolean isActive()
	{
		return !(ExecutionStatus.StoppedString.equalsIgnoreCase(this.getStatus())
				|| ExecutionStatus.TerminatedString.equalsIgnoreCase(this.getStatus())
			    || ExecutionStatus.CompletedString.equalsIgnoreCase(this.getStatus()));
	}

	public boolean isRunning()
	{
		return (ExecutionStatus.RunningString.equalsIgnoreCase(this.getStatus()));
	}

	public boolean isPaused()
	{
		return (ExecutionStatus.PausedString.equalsIgnoreCase(this.getStatus()));
	}
}
