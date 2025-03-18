package com.macrosoft.model.idc;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

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
public class Label implements Serializable{

	private String index;
	private String name;
	private double minTxInterval;
	private double maxTxInterval;
	private List<Field> fields = new ArrayList<Field>();
	
	public String getIndex() {
		return index;
	}
	public void setIndex(String index) {
		this.index = index;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public double getMinTxInterval() {
		return minTxInterval;
	}
	public void setMinTxInterval(double minTxInterval) {
		this.minTxInterval = minTxInterval;
	}
	public double getMaxTxInterval() {
		return maxTxInterval;
	}
	public void setMaxTxInterval(float maxTxInterval) {
		this.maxTxInterval = maxTxInterval;
	}
	public List<Field> getFields() {
		return fields;
	}
	public void setFields(List<Field> fields) {
		this.fields = fields;
	}
	
	
}
