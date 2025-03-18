package com.macrosoft.model.idc;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class Equipment implements Serializable{

	private String index;
	private String name;
	private List<Label> labels = new ArrayList<Label>();
	
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
	public List<Label> getLabels() {
		return labels;
	}
	public void setLabels(List<Label> labels) {
		this.labels = labels;
	}
}
