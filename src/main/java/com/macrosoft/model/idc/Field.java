package com.macrosoft.model.idc;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class Field implements Serializable{

	private String name;
	private String unit;
	private int startBit;
	private int endBit;
	private CodeField codeField;
	private BCD bcd;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getUnit() {
		return unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	public int getStartBit() {
		return startBit;
	}
	public void setStartBit(int startBit) {
		this.startBit = startBit;
	}
	public int getEndBit() {
		return endBit;
	}
	public void setEndBit(int endBit) {
		this.endBit = endBit;
	}
	public CodeField getCodeField() {
		return codeField;
	}
	public void setCodeField(CodeField codeField) {
		this.codeField = codeField;
	}
	public BCD getBcd() {
		return bcd;
	}
	public void setBcd(BCD bcd) {
		this.bcd = bcd;
	}
	
	
}
