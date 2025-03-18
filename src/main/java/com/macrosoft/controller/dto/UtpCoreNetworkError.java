package com.macrosoft.controller.dto;

public class UtpCoreNetworkError {
	private String errorMessage;

	public UtpCoreNetworkError() {}
	
	public UtpCoreNetworkError(String errorMessage) {
		this.errorMessage = errorMessage;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

}

