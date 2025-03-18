package com.macrosoft.model.idc;

import java.io.Serializable;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class IcdInputFrameFieldInfo implements Serializable{

	private String fieldName;
	private String bcdValue;
	
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
		
}
