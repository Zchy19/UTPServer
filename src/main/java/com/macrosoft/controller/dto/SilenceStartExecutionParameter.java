package com.macrosoft.controller.dto;

public class SilenceStartExecutionParameter {
	
	private String executionName;
	private String executedByUserId;
	
	private long projectId;
	private long testsetId;
	
	public String getExecutionName() {
		return executionName;
	}
	public void setExecutionName(String executionName) {
		this.executionName = executionName;
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
	public long getTestsetId() {
		return testsetId;
	}
	public void setTestsetId(long testsetId) {
		this.testsetId = testsetId;
	}
}

