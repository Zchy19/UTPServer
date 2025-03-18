package com.macrosoft.controller.dto;


public class PreprocessExecutionScriptParameter {
	String executionId;
	String executionName;
	long projectId;
	long scriptId;
	long domainId;
	String utpCoreIpAddress;
	long utpCorePort;
	String executedByUserId;
	boolean isDummyRun;
	String testObject;
	
	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	public boolean getIsDummyRun() {
		return isDummyRun;
	}
	public void setIsDummyRun(boolean isDummyRun) {
		this.isDummyRun = isDummyRun;
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
	
	public String getTestObject() {
		return testObject;
	}
	public void setTestObject(String testObject) {
		this.testObject = testObject;
	}
	public long getScriptId() {
		return scriptId;
	}
	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	public long getDomainId() {
		return domainId;
	}
	public void setDomainId(long domainId) {
		this.domainId = domainId;
	}
	public String getUtpCoreIpAddress() {
		return utpCoreIpAddress;
	}
	public void setUtpCoreIpAddress(String utpCoreIpAddress) {
		this.utpCoreIpAddress = utpCoreIpAddress;
	}
	public long getUtpCorePort() {
		return utpCorePort;
	}
	public void setUtpCorePort(long utpCorePort) {
		this.utpCorePort = utpCorePort;
	}
	public String getExecutedByUserId() {
		return executedByUserId;
	}
	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}
	
}

