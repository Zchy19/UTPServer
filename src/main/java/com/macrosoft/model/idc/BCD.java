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
public class BCD implements Serializable{

	private int digits;
	private int MSD_Size;
	private int digit_Size;
	private String minva1;
	private String maxva1;
	
	public int getDigits() {
		return digits;
	}
	public void setDigits(int digits) {
		this.digits = digits;
	}
	public int getMSD_Size() {
		return MSD_Size;
	}
	public void setMSD_Size(int mSD_Size) {
		MSD_Size = mSD_Size;
	}
	public int getDigit_Size() {
		return digit_Size;
	}
	public void setDigit_Size(int digit_Size) {
		this.digit_Size = digit_Size;
	}
	public String getMinva1() {
		return minva1;
	}
	public void setMinva1(String minva1) {
		this.minva1 = minva1;
	}
	public String getMaxva1() {
		return maxva1;
	}
	public void setMaxva1(String d) {
		this.maxva1 = d;
	}
}
