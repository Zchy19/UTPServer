package com.macrosoft.controller.dto;

public class StartExecutionResultInfo {

	private String state;
	
	private UtpCoreNetworkError utpCoreNetworkError;	
	private StartExecutionError startExecutionError;
	
	public UtpCoreNetworkError getUtpCoreNetworkError() {
		return utpCoreNetworkError;
	}
	public void setUtpCoreNetworkError(UtpCoreNetworkError utpCoreNetworkError) {
		this.utpCoreNetworkError = utpCoreNetworkError;
	}
	public StartExecutionError getStartExecutionError() {
		return startExecutionError;
	}
	public void setStartExecutionError(StartExecutionError startExecutionError) {
		this.startExecutionError = startExecutionError;
	}
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
}
