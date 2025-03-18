package com.macrosoft.controller.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class ProjectSpecialTestInfo {
	private String projectName;
	private String status;
	private String result;
	private Integer executedTotal;

	public Integer getExecutedTotal() {
		return executedTotal;
	}

	public void setExecutedTotal(Integer executedTotal) {
		this.executedTotal = executedTotal;
	}

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date startTime;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date endTime;

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public String getProjectName() {
		return projectName;
	}

	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}
}
