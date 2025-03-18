package com.macrosoft.utp.adatper.utpengine.exception;

public class AnalyzeScriptFailedReason
{
	private String message;
	private long errorline;
	private String scriptId;
	private String scriptName;
	
	public String getScriptName() {
		return scriptName;
	}

	public void setScriptName(String scriptName) {
		this.scriptName = scriptName;
	}

	public AnalyzeScriptFailedReason() { }

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