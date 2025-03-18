package com.macrosoft.controller.dto;

import java.util.Calendar;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.model.BigData;

public class BigDataWithTick {

	private long id;
	private String referenceId;
	private String rootId;
	private String value;
	private long lastUpdateTimeTicks;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date lastUpdateTime;
	

	
	public BigDataWithTick(BigData bigdata)
	{
		this.id = bigdata.getId();

		this.rootId = bigdata.getRootId();
		this.referenceId = bigdata.getReferenceId();
		this.value = bigdata.getValue();
		this.lastUpdateTime = bigdata.getLastUpdateTime();
		
		this.lastUpdateTimeTicks = getTicks(lastUpdateTime.getYear(), lastUpdateTime.getMonth(), lastUpdateTime.getDay(),
				  lastUpdateTime.getHours(), lastUpdateTime.getMinutes(), lastUpdateTime.getSeconds());
	}	
	
	public String getRootId() {
		return rootId;
	}


	public void setRootId(String rootId) {
		this.rootId = rootId;
	}
	
	public long getId() {
		return id;
	}


	public void setId(long id) {
		this.id = id;
	}

	public String getReferenceId() {
		return referenceId;
	}


	public void setReferenceId(String referenceId) {
		this.referenceId = referenceId;
	}

	public String getValue() {
		return value;
	}


	public void setValue(String value) {
		this.value = value;
	}
	
	public Date getLastUpdateTime() {
		return lastUpdateTime;
	}

	@SuppressWarnings("deprecation")
	public void setLastUpdateTime(Date lastUpdateTime) {
		this.lastUpdateTime = lastUpdateTime;
	}

	public long getLastUpdateTimeTicks() {
		return lastUpdateTimeTicks;
	}

	public void setLastUpdateTimeTicks(long lastUpdateTimeTicks) {
		this.lastUpdateTimeTicks = lastUpdateTimeTicks;
	}

	private long getTicks(int year, int month, int day, int hour, int minute, int second )
	{
		Calendar calendar = Calendar.getInstance();
		calendar.clear();
	    calendar.set(year,month,day,hour,minute,second);
	    long milli = calendar.getTimeInMillis();
	    return milli;
	}

}
