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
@Table(name="ScriptLink")
public class ScriptLink implements Serializable{

	@Id
	@Column(name="id")
	private long id;
	@Id
	@Column(name="projectId")
	private long projectId;
	private String name;
	@Id
	@Column(name="testsetId")
	private long testsetId;
	private long scriptId;
	
	public long getTestSetId() {
		return testsetId;
	}

	public void setTestSetId(long testsetId) {
		this.testsetId = testsetId;
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
	
	public long getScriptId() {
		return scriptId;
	}

	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}


	public ScriptLink Clone()
	{
		ScriptLink newScriptLink = new ScriptLink();
		newScriptLink.setId(this.id);
		newScriptLink.setDescription(this.description);		
		newScriptLink.setName(this.name);
		newScriptLink.setProjectId(this.projectId);
		newScriptLink.setScriptId(this.scriptId);
		newScriptLink.setTestSetId(this.testsetId);
		
		return newScriptLink;
	}
	
	
	@Override
	public String toString(){
		return "id="+id+", name="+name+", parentScriptGroupId="+testsetId;
	}
}
