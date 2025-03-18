package com.macrosoft.utp.adatper.utpengine.exception;

public class AntbotFailReason
{
	private String antbotName;
	private String failedReason;
	
	public AntbotFailReason() {}
	public AntbotFailReason(String antbotName, String failedReason)
	{
		this.antbotName = antbotName;
		this.failedReason = failedReason;
	}
	
	public String getAntbotName() {
		return antbotName;
	}
	public void setAntbotName(String antbotName) {
		this.antbotName = antbotName;
	}
	public String getFailedReason() {
		return failedReason;
	}
	public void setFailedReason(String failedReason) {
		this.failedReason = failedReason;
	}
	
}