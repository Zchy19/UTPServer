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
@Table(name="AgentConfig")
public class AgentConfig implements Serializable{

	@Id
	@Column(name="id")
	private long id;

	@Id
	@Column(name="projectId")
	private long projectId;
	private String agentType;	
	private String agentInstanceName;
	private String recordsetId;
	private String recordsetName;
	private String protocolSignalId;
	
	public AgentConfig()
	{
		this.protocolSignalId = "";
	}
	
	public String getRecordsetId() {
		return recordsetId;
	}

	public void setRecordsetId(String recordsetId) {
		this.recordsetId = recordsetId;
	}

	public String getRecordsetName() {
		return recordsetName;
	}

	public void setRecordsetName(String recordsetName) {
		this.recordsetName = recordsetName;
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
	
	public String getAgentType() {
		return agentType;
	}

	public void setAgentType(String agentType) {
		this.agentType = agentType;
	}

	public String getAgentInstanceName() {
		return agentInstanceName;
	}

	public void setAgentInstanceName(String agentInstanceName) {
		this.agentInstanceName = agentInstanceName;
	}

	public String getProtocolSignalId() {
		return protocolSignalId;
	}

	public void setProtocolSignalId(String protocolSignalId) {
		this.protocolSignalId = protocolSignalId;
	}

	@Override
	public String toString(){
		return "id="+id+", agentType="+agentType+", agentInstanceName="+agentInstanceName;
	}
	
	public AgentConfig Clone()
	{
		AgentConfig newAgentConfig = new AgentConfig();
		newAgentConfig.setId(this.id);
		newAgentConfig.setAgentInstanceName(this.agentInstanceName);
		newAgentConfig.setAgentType(this.agentType);
		newAgentConfig.setProjectId(this.projectId);
		newAgentConfig.setRecordsetId(this.getRecordsetId());
		newAgentConfig.setRecordsetName(this.getRecordsetName());
		newAgentConfig.setProtocolSignalId(this.protocolSignalId);

		return newAgentConfig;
	}
}
