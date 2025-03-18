package com.macrosoft.controller.dto;


public class QueryRequirementsPayload
{
	private long projectId;	
	private Long[] requirementIds;
	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	public Long[] getRequirementIds() {
		return requirementIds;
	}
	public void setRequirementIds(Long[] requirementIds) {
		this.requirementIds = requirementIds;
	}		
}
