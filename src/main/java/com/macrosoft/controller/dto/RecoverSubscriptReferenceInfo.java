package com.macrosoft.controller.dto;

public class RecoverSubscriptReferenceInfo {
	private long id;
	private long projectId;
	private String name;
	private long subscriptId;
	private String subscriptName;
	private String description;
	private boolean isDefault;
	
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
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public long getSubscriptId() {
		return subscriptId;
	}
	public void setSubscriptId(long subscriptId) {
		this.subscriptId = subscriptId;
	}
	public String getSubscriptName() {
		return subscriptName;
	}
	public void setSubscriptName(String subscriptName) {
		this.subscriptName = subscriptName;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	
	public boolean getIsDefault() {
		return isDefault;
	}
	public void setIsDefault(boolean isDefault) {
		this.isDefault = isDefault;
	}
	
	
}
