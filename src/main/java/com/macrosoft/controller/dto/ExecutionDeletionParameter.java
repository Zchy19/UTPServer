package com.macrosoft.controller.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class ExecutionDeletionParameter {
	long projectId;
	long testsetId;


	@JsonFormat(pattern = "yyyy-MM-dd", timezone="GMT+8")
	Date startFromDate;

	@JsonFormat(pattern = "yyyy-MM-dd", timezone="GMT+8")
	Date endByDate;

	public long getTestsetId() {
		return testsetId;
	}

	public void setTestsetId(long testsetId) {
		this.testsetId = testsetId;
	}

	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public Date getStartFromDate() {
		return startFromDate;
	}

	public void setStartFromDate(Date startFromDate) {
		this.startFromDate = startFromDate;
	}

	public Date getEndByDate() {
		return endByDate;
	}

	public void setEndByDate(Date endByDate) {
		this.endByDate = endByDate;
	}
	
	
}

