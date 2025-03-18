package com.macrosoft.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="TestsetExecutionTrigger")
public class TestsetExecutionTrigger implements Serializable{

	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	

	@Column(name="testsetId")
	private long testsetId;

	@Column(name="projectId")
	private long projectId;
	
	@Column(name="crontriggerExpression")
	private String crontriggerExpression;

	@Column(name="userName")
	private String userName;

	@Column(name="isEnabled")
	private boolean isEnabled;

	

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone="GMT+8")
	private Date startTime;

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
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


	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public long getTestsetId() {
		return testsetId;
	}


	public void setTestsetId(long testsetId) {
		this.testsetId = testsetId;
	}


	public String getCrontriggerExpression() {
		return crontriggerExpression;
	}


	public void setCrontriggerExpression(String crontriggerExpression) {
		this.crontriggerExpression = crontriggerExpression;
	}


	public boolean getIsEnabled() {
		return isEnabled;
	}


	public void setIsEnabled(boolean isEnabled) {
		this.isEnabled = isEnabled;
	}


	@Override
	public String toString(){
		return "id="+id+", testsetId="+testsetId+", crontriggerExpression="+ crontriggerExpression;
	}
}
