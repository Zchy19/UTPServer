package com.macrosoft.controller.dto;

public class NamedAntbotInfo {

	private long id;
	private long projectId;
	private String newAntbotName;
	private String newSelectedBigData;
	private String newRecordsetId;

	public String getNewRecordsetId() {
		return newRecordsetId;
	}

	public void setNewRecordsetId(String newRecordsetId) {
		this.newRecordsetId = newRecordsetId;
	}

	public String getNewSelectedBigData() {
		return newSelectedBigData;
	}

	public void setNewSelectedBigData(String newSelectedBigData) {
		this.newSelectedBigData = newSelectedBigData;
	}

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

	public String getNewAntbotName() {
		return newAntbotName;
	}

	public void setNewAntbotName(String newAntbotName) {
		this.newAntbotName = newAntbotName;
	}
}
