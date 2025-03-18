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
public class RtCom implements Serializable{

	private List<Field> dataFields = new ArrayList<Field>();
	
	public List<Field> getDataFields() {
		return dataFields;
	}
	public void setDataFields(List<Field> dataFields) {
		this.dataFields = dataFields;
	}
}
