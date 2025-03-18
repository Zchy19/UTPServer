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
public class Code implements Serializable{

	private String value;
	private String String;
	
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public String getString() {
		return String;
	}
	public void setString(String string) {
		String = string;
	}
}
