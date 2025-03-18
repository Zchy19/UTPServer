package com.macrosoft.controller.dto;

public class RequirementScriptMappingInfo {

	private long projectId;
	private long scriptId;
	private String requirementIdsWithCommaSeperator;
	
	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	public long getScriptId() {
		return scriptId;
	}
	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	public String getRequirementIdsWithCommaSeperator() {
		return requirementIdsWithCommaSeperator;
	}
	public void setRequirementIdsWithCommaSeperator(String requirementIdsWithCommaSeperator) {
		this.requirementIdsWithCommaSeperator = requirementIdsWithCommaSeperator;
	}


	
}
