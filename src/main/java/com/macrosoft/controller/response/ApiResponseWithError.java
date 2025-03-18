package com.macrosoft.controller.response;

public class ApiResponseWithError<T> extends ApiResponse<T> {

	private String errorMessage;

	public ApiResponseWithError(int status, T result, String errorMessage)
	{
		super(status, result);
		this.errorMessage = errorMessage;
	}

	public String getErrorMessage() {
		return errorMessage;
	}

	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}	
}
