package com.macrosoft.controller.dto;

public class TestsetInfo {
	private long id;
	private long projectId;
	private String name;
	private String engineName;
	private String description;
	private String scriptIdsWithCommaSeperator;
	private Integer activate;

	public Integer getActivate() {
		return activate;
	}

	public void setActivate(Integer activate) {
		this.activate = activate;
	}

	public String getEngineName() {
		return engineName;
	}

	public void setEngineName(String engineName) {
		this.engineName = engineName;
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

	public String getScriptIdsWithCommaSeperator() {
		return scriptIdsWithCommaSeperator;
	}

	public void setScriptIdsWithCommaSeperator(String scriptIdsWithCommaSeperator) {
		this.scriptIdsWithCommaSeperator = scriptIdsWithCommaSeperator;
	}
}
