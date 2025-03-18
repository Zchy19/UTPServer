package com.macrosoft.model;

import java.io.Serializable;
import java.util.Date;

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
@Table(name="Recorder")
public class Recorder implements Serializable{

	private String id;
	private String orgId;
	private String name;
	private String type;
	private Date lastUpdatedTime;
	private String jsonData;

	@Id
	@Column(name="id")
	
	
	public String getId() {
		return id;
	}


	public void setId(String id) {
		this.id = id;
	}

	public String getOrgId() {
		return orgId;
	}


	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}


	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}


	public String getType() {
		return type;
	}


	public void setType(String type) {
		this.type = type;
	}


	public Date getLastUpdatedTime() {
		return lastUpdatedTime;
	}


	public void setLastUpdatedTime(Date lastUpdatedTime) {
		this.lastUpdatedTime = lastUpdatedTime;
	}
	
	public String getJsonData() {
		return jsonData;
	}


	public void setJsonData(String jsonData) {
		this.jsonData = jsonData;
	}

	public Recorder Clone()
	{
		Recorder newRecorder = new Recorder();

		newRecorder.setId(this.id);
		newRecorder.setJsonData(this.jsonData);
		newRecorder.setLastUpdatedTime(this.lastUpdatedTime);
		newRecorder.setName(this.name);
		newRecorder.setOrgId(this.orgId);
		newRecorder.setType(this.type);
		
		return newRecorder;
	}

}
