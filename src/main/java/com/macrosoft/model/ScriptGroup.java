package com.macrosoft.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="ScriptGroup")
public class ScriptGroup implements Serializable{

	@Id
	@Column(name="id")
	private long id;
	@Id
	@Column(name="projectId")
	private long projectId;
	private String name;
	private long parentScriptGroupId;
	
	public long getParentScriptGroupId() {
		return parentScriptGroupId;
	}

	public void setParentScriptGroupId(long parentScriptGroupId) {
		this.parentScriptGroupId = parentScriptGroupId;
	}

	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}


	private String description;
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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

	public ScriptGroup Clone()
	{
		ScriptGroup newScriptGroup = new ScriptGroup();
		newScriptGroup.setId(this.id);
		newScriptGroup.setDescription(this.description);
		newScriptGroup.setName(this.name);
		newScriptGroup.setParentScriptGroupId(this.parentScriptGroupId);
		newScriptGroup.setProjectId(this.projectId);
		return newScriptGroup;
	}
	
	@Override
	public String toString(){
		return "id="+id+", name="+name+", parentScriptGroupId="+parentScriptGroupId;
	}
}
