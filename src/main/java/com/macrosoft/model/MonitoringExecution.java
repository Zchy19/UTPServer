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
@Table(name="MonitoringExecution")
public class MonitoringExecution implements Serializable{

	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;

	private String executionId;
	private long monitoringTestSetId;
	private long projectId;
	private String monitorDataJson;
	private String executionStatus;
	
//	private String startEngineSessionId;
//	private String stopEngineSessionId;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date startTime;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date stopTime;
	
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

	public long getMonitoringTestSetId() {
		return monitoringTestSetId;
	}

	public void setMonitoringTestSetId(long monitoringTestSetId) {
		this.monitoringTestSetId = monitoringTestSetId;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}

	public String getExecutionStatus() {
		return executionStatus;
	}

	public void setExecutionStatus(String executionStatus) {
		this.executionStatus = executionStatus;
	}

	public String getMonitorDataJson() {
		return monitorDataJson;
	}

	public void setMonitorDataJson(String monitorDataJson) {
		this.monitorDataJson = monitorDataJson;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public Date getStopTime() {
		return stopTime;
	}

	public void setStopTime(Date stopTime) {
		this.stopTime = stopTime;
	}
}
