package com.macrosoft.model;

import java.io.Serializable;
import java.util.Calendar;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="BigData")
public class BigData implements Serializable{

	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private String referenceId;
	private String rootId;
	private String value;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date lastUpdateTime;
	
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

	public long getTicks() {
		return getTicks(lastUpdateTime.getYear(), lastUpdateTime.getMonth(), lastUpdateTime.getDay(),
				  lastUpdateTime.getHours(), lastUpdateTime.getMinutes(), lastUpdateTime.getSeconds());
	}


	private long getTicks(int year, int month, int day, int hour, int minute, int second )
	{
		Calendar calendar = Calendar.getInstance();
		calendar.clear();
	    calendar.set(year,month,day,hour,minute,second);
	    long milli = calendar.getTimeInMillis();
	    return milli;
	}

	public BigData Clone()
	{
		BigData newBigData = new BigData();
		newBigData.setId(this.id);
		newBigData.setReferenceId(this.referenceId);
		newBigData.setRootId(this.rootId);
		newBigData.setValue(this.value);
		newBigData.setLastUpdateTime(this.lastUpdateTime);

		return newBigData;
	}
}
