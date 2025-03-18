package com.macrosoft.controller.dto;


public class PreprocessExecutionIcdParameter {

	String executionId;
	private String icdId;
	private String channel;
	private String utpCoreIpAddress;
	private long utpCorePort;
	
	public String getExecutionId() {
		return executionId;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public String getIcdId() {
		return icdId;
	}
	public void setIcdId(String icdId) {
		this.icdId = icdId;
	}
	public String getChannel() {
		return channel;
	}
	public void setChannel(String channel) {
		this.channel = channel;
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
	
	
	
}

