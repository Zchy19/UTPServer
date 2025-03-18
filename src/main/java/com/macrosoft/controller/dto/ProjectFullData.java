package com.macrosoft.controller.dto;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.model.composition.TestsetData;

public class ProjectFullData {
	
	private long id;
	private String name;
	private String description;
	private long organizationId;
	private String targetObjectDescription;
	private String requirementManageType;
	private List<ScriptGroupInfo> scriptgroups = new ArrayList<ScriptGroupInfo>();
	private List<TestsetData> testsets = new ArrayList<TestsetData>();

	public ProjectFullData() {}
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
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

	public String getRequirementManageType() {
		return requirementManageType;
	}

	public void setRequirementManageType(String requirementManageType) {
		this.requirementManageType = requirementManageType;
	}

	public long getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(long organizationId) {
		this.organizationId = organizationId;
	}

	public String getTargetObjectDescription() {
		return targetObjectDescription;
	}

	public void setTargetObjectDescription(String targetObjectDescription) {
		this.targetObjectDescription = targetObjectDescription;
	}

	public List<TestsetData> getTestsets() {
		return testsets;
	}

	public void setTestsets(List<TestsetData> testsets) {
		this.testsets = testsets;
	}

	public List<ScriptGroupInfo> getScriptgroups() {
		return scriptgroups;
	}

	public void setScriptgroups(List<ScriptGroupInfo> scriptgroups) {
		this.scriptgroups = scriptgroups;
	}

	
	
}

