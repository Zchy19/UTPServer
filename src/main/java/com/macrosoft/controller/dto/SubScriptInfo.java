package com.macrosoft.controller.dto;

public class SubScriptInfo {

	private long id;
	private long projectId;
	private String name;
	private String customizedId;
	private String description;
	private long parentScriptGroupId;
	private String parameter;
	private boolean isEmpty;

	public SubScriptInfo() {
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getParentScriptGroupId() {
		return parentScriptGroupId;
	}

	public void setParentScriptGroupId(long parentScriptGroupId) {
		this.parentScriptGroupId = parentScriptGroupId;
	}

	public String getCustomizedId() {
		return customizedId;
	}

	public void setCustomizedId(String customizedId) {
		this.customizedId = customizedId;
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getParameter() {
		return parameter;
	}

	public void setParameter(String parameter) {
		this.parameter = parameter;
	}

	public boolean getIsEmpty() {
		return isEmpty;
	}

	public void setIsEmpty(boolean isEmpty) {
		this.isEmpty = isEmpty;
	}
}
