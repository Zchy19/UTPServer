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
@Table(name="RecoverSubscriptReference")
public class RecoverSubscriptReference implements Serializable{

	@Id
	@Column(name="id")
	private long id;
	
	@Id
	@Column(name="projectId")
	private long projectId;
	
	private String name;
	private String description;
	private long subscriptId;
	
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
	
	public long getSubscriptId() {
		return subscriptId;
	}

	public void setSubscriptId(long subscriptId) {
		this.subscriptId = subscriptId;
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
	
	@Override
	public String toString(){
		return "id="+id+", name="+name;
	}

	public RecoverSubscriptReference Clone()
	{
		RecoverSubscriptReference reference = new RecoverSubscriptReference();
		reference.setDescription(this.description);
		reference.setId(this.id);
		reference.setName(this.name);
		reference.setProjectId(this.projectId);
		reference.setSubscriptId(this.subscriptId);
		
		return reference;
	}
}
