package com.macrosoft.controller.dto;

public class ProjectInfo {

	private long id;
	private String name;
	private String description;
	private long organizationId;
	private String targetObjectDescription;
	private int templateType;
	private long defaultRecoverSubscriptId;
	private String requirementManageType;
	private String customizedReqFields;
	private String customizedScriptFields;
	private String errorMessages;
	private String autoIntoUser;

	public String getAutoIntoUser() {
		return autoIntoUser;
	}

	public void setAutoIntoUser(String autoIntoUser) {
		this.autoIntoUser = autoIntoUser;
	}

	public String getErrorMessages() {
		return errorMessages;
	}

	public void setErrorMessages(String errorMessages) {
		this.errorMessages = errorMessages;
	}

	public ProjectInfo() {
	}

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

	public long getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(long organizationId) {
		this.organizationId = organizationId;
	}

	public int getTemplateType() {
		return templateType;
	}

	public void setTemplateType(int templateType) {
		this.templateType = templateType;
	}
	
	public long getDefaultRecoverSubscriptId() {
		return defaultRecoverSubscriptId;
	}

	public void setDefaultRecoverSubscriptId(long defaultRecoverSubscriptId) {
		this.defaultRecoverSubscriptId = defaultRecoverSubscriptId;
	}

	public String getTargetObjectDescription() {
		return targetObjectDescription;
	}

	public void setTargetObjectDescription(String targetObjectDescription) {
		this.targetObjectDescription = targetObjectDescription;
	}

	public String getRequirementManageType() {
		return requirementManageType;
	}

	public void setRequirementManageType(String requirementManageType) {
		this.requirementManageType = requirementManageType;
	}

	public String getCustomizedReqFields() {
		return customizedReqFields;
	}

	public void setCustomizedReqFields(String customizedReqFields) {
		this.customizedReqFields = customizedReqFields;
	}

	public String getCustomizedScriptFields() {
		return customizedScriptFields;
	}

	public void setCustomizedScriptFields(String customizedScriptFields) {
		this.customizedScriptFields = customizedScriptFields;
	}

	
	
}
