package com.macrosoft.controller.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class QueryQualityReportParameter {
	long projectId;

	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
	Date startFromDate;

	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
	Date endByDate;

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
