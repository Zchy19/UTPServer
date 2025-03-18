package com.macrosoft.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class SearchBusFrameParameter
{
	private String protocolId;
	
	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
	Date startFromDate;

	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
	Date endByDate;


	public String getProtocolId() {
		return protocolId;
	}

	public void setProtocolId(String protocolId) {
		this.protocolId = protocolId;
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

