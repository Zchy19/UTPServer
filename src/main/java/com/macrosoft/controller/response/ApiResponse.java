package com.macrosoft.controller.response;

public class ApiResponse<T> {

	public static final int Success = 1;
	public static final int UnHandleException = 0;

	protected int status;
	protected T result;

	public ApiResponse(int status, T result)
	{
		this.status = status;
		this.result = result;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}
	
	public T getResult() {
		return result;
	}
	public void setResult(T result) {
		this.result = result;
	}
}