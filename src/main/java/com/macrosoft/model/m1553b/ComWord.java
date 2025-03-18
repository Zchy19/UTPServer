package com.macrosoft.model.m1553b;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class ComWord implements Serializable{

	private Field rtField;
	private Field trField;	
	private Field saField;
	private Field countField;
	
	public Field getRtField() {
		return rtField;
	}
	public void setRtField(Field rtField) {
		this.rtField = rtField;
	}
	public Field getTrField() {
		return trField;
	}
	public void setTrField(Field trField) {
		this.trField = trField;
	}
	public Field getSaField() {
		return saField;
	}
	public void setSaField(Field saField) {
		this.saField = saField;
	}
	public Field getCountField() {
		return countField;
	}
	public void setCountField(Field countField) {
		this.countField = countField;
	}
}
