package com.macrosoft.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
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
@Table(name="BigdataStorage")
public class BigdataStorage implements Serializable{


	public static final String CAN_FD = "CANFD";
	public static final String CAN_J1939 = "J1939(CAN)";
	public static final String ARINC429 = "ARINC-429";
	public static final String MIL1553B = "MIL-1553B";
	public static final String MIL1553BAndARINC429 = "MIL-1553B_CUSTOM";
	public static final String GenericBusFrame = "GenericBusFrame";
	public static final String SignalProtocol = "SignalProtocol";
	
	public static final String BusFrameData = "BusFrameData";
	
	@Id
	@Column(name="id")
	private String id;

	@Id
	@Column(name="dataType")
	private String dataType;
	
	@Column(name="fileName")
	private String fileName;
	
	@Column(name="bigdata")
	private String bigdata;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date createdAt;

	@Column(name="organizationId")
	private Long organizationId;

	@Column(name="executionId")
	private String executionId;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getDataType() {
		return dataType;
	}

	public void setDataType(String dataType) {
		this.dataType = dataType;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getBigdata() {
		return bigdata;
	}

	public void setBigdata(String bigdata) {
		this.bigdata = bigdata;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}
	

	public long getOrganizationId() {
		return organizationId;
	}

	public void setOrganizationId(long organizationId) {
		this.organizationId = organizationId;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}

	public BigdataStorage Clone()
	{
		BigdataStorage bigdataStorage = new BigdataStorage();

		bigdataStorage.setId(this.id);
		bigdataStorage.setBigdata(this.bigdata);
		bigdataStorage.setCreatedAt(this.createdAt);
		bigdataStorage.setDataType(this.dataType);
		bigdataStorage.setFileName(this.fileName);
		bigdataStorage.setOrganizationId(this.organizationId);
		bigdataStorage.setExecutionId(this.executionId);
		return bigdataStorage;
	}
}
