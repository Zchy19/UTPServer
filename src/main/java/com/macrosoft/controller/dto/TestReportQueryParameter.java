package com.macrosoft.controller.dto;


public class TestReportQueryParameter {
	private long domainId;
	private String projectId;
	private String testsetId;
	private String executedByUserId;
	private String executionTimeStartFrom;
	private String executionTimeEndBy;
	
	public long getDomainId() {
		return domainId;
	}
	public void setDomainId(long domainId) {
		this.domainId = domainId;
	}
	public String getProjectId() {
		return projectId;
	}
	public void setProjectId(String projectId) {
		this.projectId = projectId;
	}
	
	public String getTestsetId() {
		return testsetId;
	}
	public void setTestsetId(String testsetId) {
		this.testsetId = testsetId;
	}
	public String getExecutedByUserId() {
		return executedByUserId;
	}
	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}
	public String getExecutionTimeStartFrom() {
		return executionTimeStartFrom;
	}
	public void setExecutionTimeStartFrom(String executionTimeStartFrom) {
		this.executionTimeStartFrom = executionTimeStartFrom;
	}
	public String getExecutionTimeEndBy() {
		return executionTimeEndBy;
	}
	public void setExecutionTimeEndBy(String executionTimeEndBy) {
		this.executionTimeEndBy = executionTimeEndBy;
	}
	
	
}

