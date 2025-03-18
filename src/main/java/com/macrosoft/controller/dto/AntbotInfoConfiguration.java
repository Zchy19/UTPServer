package com.macrosoft.controller.dto;

public class AntbotInfoConfiguration {

	private long id;
	private long projectId;
	private String antbotType;
	private String antbotName;
	private String recordsetId;
	private String recordsetName;
	private String protocolSignalId;
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
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
