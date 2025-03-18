package com.macrosoft.controller.dto;


public class UpdateAntbotResultInfo {
	
	private String result;
	private long antbotId;
	private String antbotName;
	private String protocolSignalId;
	private String newRecordsetId;

	public String getNewRecordsetId() {
		return newRecordsetId;
	}

	public void setNewRecordsetId(String newRecordsetId) {
		this.newRecordsetId = newRecordsetId;
	}

	public String getProtocolSignalId() {
		return protocolSignalId;
	}

	public void setProtocolSignalId(String protocolSignalId) {
		this.protocolSignalId = protocolSignalId;
	}
	public String getResult() {
		return result;
	}
	public void setResult(String result) {
		this.result = result;
	}
	public long getAntbotId() {
		return antbotId;
	}
	public void setAntbotId(long antbotId) {
		this.antbotId = antbotId;
	}
	public String getAntbotName() {
		return antbotName;
	}
	public void setAntbotName(String antbotName) {
		this.antbotName = antbotName;
	}

}
