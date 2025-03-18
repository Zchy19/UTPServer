package com.macrosoft.controller.dto;


public class MonitorExecutionStartParameter {

	private String executionId;
	private long monitoringTestSetId;
	private long projectId;
	private String ipAddress;
	private long port;
	private String executedByUserId;

	private boolean isTemporaryExecution;
	
	public String getExecutionId() {
		return executionId;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public long getMonitoringTestSetId() {
		return monitoringTestSetId;
	}
	public void setMonitoringTestSetId(long monitoringTestSetId) {
		this.monitoringTestSetId = monitoringTestSetId;
	}
	public String getIpAddress() {
		return ipAddress;
	}
	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}
	public long getPort() {
		return port;
	}
	public void setPort(long port) {
		this.port = port;
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
	public boolean isTemporaryExecution() {
		return isTemporaryExecution;
	}
	public void setTemporaryExecution(boolean isTemporaryExecution) {
		this.isTemporaryExecution = isTemporaryExecution;
	}
	
	
	
	
}

