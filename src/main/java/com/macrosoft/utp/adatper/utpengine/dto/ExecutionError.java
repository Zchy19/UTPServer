package com.macrosoft.utp.adatper.utpengine.dto;

public class ExecutionError
{
	private String message;
	private long errorline;
	private String scriptId;
	
	public ExecutionError() { }

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public long getErrorline() {
		return errorline;
	}

	public void setErrorline(long errorline) {
		this.errorline = errorline;
	}

	public String getScriptId() {
		return scriptId;
	}

	public void setScriptId(String scriptId) {
		this.scriptId = scriptId;
	}
	
}