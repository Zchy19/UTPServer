package com.macrosoft.controller.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.model.BigdataStorage;

public class BigdataStorageInfo {

	private String id;
	private String dataType;
	private String fileName;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date createdAt;
	
	public BigdataStorageInfo() {
	}
	
	public BigdataStorageInfo(BigdataStorage bigdataStorage)
	{
		this.id = bigdataStorage.getId();
		this.dataType = bigdataStorage.getDataType();
		this.fileName = bigdataStorage.getFileName();
		this.createdAt = bigdataStorage.getCreatedAt();
	}

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

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	
}
