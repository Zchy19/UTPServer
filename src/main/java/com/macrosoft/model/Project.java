package com.macrosoft.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="Project")
public class Project implements Serializable{

	public static final int TemplateType_Default = 0;
	
	@Id
	@Column(name="id")
	private long id;
	private long organizationId;
	private String targetObjectDescription;
	private long defaultRecoverSubscriptId;
	private String name;
	private String description;
	private long nextEntityLogicId;
	private int templateType;
	private long nextRequirementId;
	private String requirementManageType;
	private String customizedReqFields;
	private String customizedScriptFields;
	private String autoIntoUser;

	public String getAutoIntoUser() {
		return autoIntoUser;
	}

	public void setAutoIntoUser(String autoIntoUser) {
		this.autoIntoUser = autoIntoUser;
	}

	public String getTargetObjectDescription() {
		return targetObjectDescription;
	}

	public void setTargetObjectDescription(String targetObjectDescription) {
		this.targetObjectDescription = targetObjectDescription;
	}

	public long getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(long organizationId) {
		this.organizationId = organizationId;
	}


	public long getDefaultRecoverSubscriptId() {
		return defaultRecoverSubscriptId;
	}

	public void setDefaultRecoverSubscriptId(long defaultRecoverSubscriptId) {
		this.defaultRecoverSubscriptId = defaultRecoverSubscriptId;
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
	
	public long getNextEntityLogicId() {
		return nextEntityLogicId;
	}

	public void setNextEntityLogicId(long nextEntityLogicId) {
		this.nextEntityLogicId = nextEntityLogicId;
	}

	public long getNextRequirementId() {
		return nextRequirementId;
	}

	public void setNextRequirementId(long nextRequirementId) {
		this.nextRequirementId = nextRequirementId;
	}

	public int getTemplateType() {
		return templateType;
	}

	public void setTemplateType(int templateType) {
		this.templateType = templateType;
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

	public Project Clone()
	{
		Project newProject = new Project();
		newProject.setId(this.id);
		newProject.setOrganizationId(this.organizationId);
		newProject.setName(this.name);
		newProject.setDescription(this.description);
		newProject.setTargetObjectDescription(this.targetObjectDescription);
		newProject.setDefaultRecoverSubscriptId(this.defaultRecoverSubscriptId);
		newProject.setTemplateType(this.templateType);
		newProject.setNextEntityLogicId(this.nextEntityLogicId);
		newProject.setNextRequirementId(this.nextRequirementId);
		newProject.setRequirementManageType(this.requirementManageType);
		newProject.setCustomizedReqFields(this.customizedReqFields);
		newProject.setCustomizedScriptFields(this.customizedScriptFields);
//		newProject.setAutoIntoUser(this.autoIntoUser);
		return newProject;
	}
	
	@Override
	public String toString(){
		return "id="+id+", name="+name+", description="+description;
	}
}
