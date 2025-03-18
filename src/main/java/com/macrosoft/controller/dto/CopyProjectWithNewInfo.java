package com.macrosoft.controller.dto;

public class CopyProjectWithNewInfo
{
	private int sourceProjectId;
	private int targetOrgId;
	private int sourceOrgId;
	private String name;
	private String description;
	
	public int getSourceProjectId() {
		return sourceProjectId;
	}
	public void setSourceProjectId(int sourceProjectId) {
		this.sourceProjectId = sourceProjectId;
	}
	public int getTargetOrgId() {
		return targetOrgId;
	}
	public void setTargetOrgId(int targetOrgId) {
		this.targetOrgId = targetOrgId;
	}
	
	public int getSourceOrgId() {
		return sourceOrgId;
	}
	public void setSourceOrgId(int sourceOrgId) {
		this.sourceOrgId = sourceOrgId;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
}
