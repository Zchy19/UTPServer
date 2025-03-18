package com.macrosoft.controller.dto;


public class CreateAntbotResultInfo {
	
	private String result;
	private long anotbotId;
	private String antbotType;	
	private String antbotName;
	private String recordsetId;
	private String recordsetName;
	private String protocolSignalId;
	
	public String getResult() {
		return result;
	}
	public void setResult(String result) {
		this.result = result;
	}
	
	public long getAntbotId() {
		return anotbotId;
	}
	public void setAntbotId(long anotbotId) {
		this.anotbotId = anotbotId;
	}
	public String getAntbotType() {
		return antbotType;
	}
	public void setAntbotType(String antbotType) {
		this.antbotType = antbotType;
	}
	public String getAntbotName() {
		return antbotName;
	}
	public void setAntbotName(String antbotName) {
		this.antbotName = antbotName;
	}
	public String getRecordsetId() {
		return recordsetId;
	}
	public void setRecordsetId(String recordsetId) {
		this.recordsetId = recordsetId;
	}
	public String getRecordsetName() {
		return recordsetName;
	}
	public void setRecordsetName(String recordsetName) {
		this.recordsetName = recordsetName;
	}
	public String getProtocolSignalId() {
		return protocolSignalId;
	}

	public void setProtocolSignalId(String protocolSignalId) {
		this.protocolSignalId = protocolSignalId;
	}
}
