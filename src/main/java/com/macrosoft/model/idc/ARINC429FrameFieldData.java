package com.macrosoft.model.idc;

import java.io.Serializable;
import java.util.Date;


import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class ARINC429FrameFieldData implements Serializable{

	private String fieldName;
	private String bcdValue;
	private String units;
	
	public String getFieldName() {
		return fieldName;
	}
	public void setFieldName(String fieldName) {
		this.fieldName = fieldName;
	}
	public String getBcdValue() {
		return bcdValue;
	}
	public void setBcdValue(String bcdValue) {
		this.bcdValue = bcdValue;
	}
	public String getUnits() {
		return units;
	}
	public void setUnits(String units) {
		this.units = units;
	}
}
