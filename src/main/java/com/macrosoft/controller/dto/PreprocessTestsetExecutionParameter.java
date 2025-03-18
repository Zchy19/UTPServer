package com.macrosoft.controller.dto;


public class PreprocessTestsetExecutionParameter {
	String executionId;
	String executionName;
	long testsetId;
	long domainId;
	String utpCoreIpAddress;
	String utpCorePort;
	String executedByUserId;
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

	public long getTestsetId() {
		return testsetId;
	}
	public void setTestsetId(long testsetId) {
		this.testsetId = testsetId;
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
	public String getUtpCorePort() {
		return utpCorePort;
	}
	public void setUtpCorePort(String utpCorePort) {
		this.utpCorePort = utpCorePort;
	}
	public String getExecutedByUserId() {
		return executedByUserId;
	}
	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}
	
}

