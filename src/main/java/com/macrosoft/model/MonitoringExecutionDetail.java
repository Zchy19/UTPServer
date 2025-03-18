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
@Table(name="MonitoringExecutionDetail")
public class MonitoringExecutionDetail implements Serializable{

	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;

	private String executionId;
	private long monitorSessionId;

	private String monitorDataName;
	private String jsonData;
	private String executionDate;
	private String executionStatus;
	
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}


	public long getMonitorSessionId() {
		return monitorSessionId;
	}

	public void setMonitorSessionId(long monitorSessionId) {
		this.monitorSessionId = monitorSessionId;
	}

	public String getMonitorDataName() {
		return monitorDataName;
	}

	public void setMonitorDataName(String monitorDataName) {
		this.monitorDataName = monitorDataName;
	}

	public String getJsonData() {
		return jsonData;
	}

	public void setJsonData(String jsonData) {
		this.jsonData = jsonData;
	}

	public String getExecutionDate() {
		return executionDate;
	}

	public void setExecutionDate(String executionDate) {
		this.executionDate = executionDate;
	}

	public String getExecutionStatus() {
		return executionStatus;
	}

	public void setExecutionStatus(String executionStatus) {
		this.executionStatus = executionStatus;
	}

	
	
}
