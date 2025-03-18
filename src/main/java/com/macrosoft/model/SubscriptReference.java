package com.macrosoft.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="SubscriptReference")
public class SubscriptReference implements Serializable{

	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private long subscriptId;
	private long parentScriptId;
	private long projectId;
	//private String parameter;
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	
	public long getSubscriptId() {
		return subscriptId;
	}
	public void setSubscriptId(long subscriptId) {
		this.subscriptId = subscriptId;
	}
	
	public long getParentScriptId() {
		return parentScriptId;
	}
	public void setParentScriptId(long parentScriptId) {
		this.parentScriptId = parentScriptId;
	}
	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	

	public SubscriptReference Clone()
	{
		SubscriptReference reference = new SubscriptReference();
		reference.setId(this.id);
		reference.setParentScriptId(this.parentScriptId);
		reference.setProjectId(this.projectId);
		reference.setSubscriptId(this.subscriptId);
		
		return reference;
	}
	
	/*
	public String getParameter() {
		return parameter;
	}
	public void setParameter(String parameter) {
		this.parameter = parameter;
	}
*/
	
}
