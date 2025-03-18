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
public class Field implements Serializable{

	private int index;
	private String name;
	private int startBit;
	private int endBit;
	
	public int getIndex() {
		return index;
	}
	public void setIndex(int index) {
		this.index = index;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
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
	
	public boolean isStatus()
	{
		return "status".equalsIgnoreCase(this.name);
	}
	
}
