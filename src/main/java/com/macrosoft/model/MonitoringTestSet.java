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
@Table(name="MonitoringTestSet")
public class MonitoringTestSet implements Serializable{

	@Id
	@Column(name="id")
	private long id;
	
	@Id
	@Column(name="projectId")
	private long projectId;
	private String name;
	private String description;
	private int type;
	private long startScriptId;
	private long sendCommandScriptId;
	private long stopScriptId;
	private String antBot;

	public String getAntBot() {
		return antBot;
	}

	public void setAntBot(String antBot) {
		this.antBot = antBot;
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

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public long getStartScriptId() {
		return startScriptId;
	}

	public void setStartScriptId(long startScriptId) {
		this.startScriptId = startScriptId;
	}

	public long getSendCommandScriptId() {
		return sendCommandScriptId;
	}

	public void setSendCommandScriptId(long sendCommandScriptId) {
		this.sendCommandScriptId = sendCommandScriptId;
	}

	public long getStopScriptId() {
		return stopScriptId;
	}

	public void setStopScriptId(long stopScriptId) {
		this.stopScriptId = stopScriptId;
	}

	public MonitoringTestSet Clone()
	{
		MonitoringTestSet monitoringTestSet = new MonitoringTestSet();
		monitoringTestSet.setId(this.id);
		monitoringTestSet.setDescription(this.description);
		monitoringTestSet.setType(this.type);
		monitoringTestSet.setName(this.name);
		monitoringTestSet.setProjectId(this.projectId);
		monitoringTestSet.setStartScriptId(this.startScriptId);
		monitoringTestSet.setSendCommandScriptId(this.sendCommandScriptId);
		monitoringTestSet.setStopScriptId(this.stopScriptId);
		return monitoringTestSet;
	}
	
	@Override
	public String toString(){
		return "id="+id+", name="+name+", description="+description;
	}
}
