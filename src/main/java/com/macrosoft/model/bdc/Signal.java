package com.macrosoft.model.bdc;

public class Signal {
	private String name;
	private int startbit;
	private int bitlength;
	private String endianess;
	private float scaling;
	private int offset;
	private float minimum;
	private float maximum;
	private boolean signed;
	private int floating;
	private String units;
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getStartbit() {
		return startbit;
	}
	public void setStartbit(int startbit) {
		this.startbit = startbit;
	}
	public int getBitlength() {
		return bitlength;
	}
	public void setBitlength(int bitlength) {
		this.bitlength = bitlength;
	}
	public String getEndianess() {
		return endianess;
	}
	public void setEndianess(String endianess) {
		this.endianess = endianess;
	}
	public float getScaling() {
		return scaling;
	}
	public void setScaling(float scaling) {
		this.scaling = scaling;
	}
	public int getOffset() {
		return offset;
	}
	public void setOffset(int offset) {
		this.offset = offset;
	}
	public float getMinimum() {
		return minimum;
	}
	public void setMinimum(float minimum) {
		this.minimum = minimum;
	}
	public float getMaximum() {
		return maximum;
	}
	public void setMaximum(float maximum) {
		this.maximum = maximum;
	}
	public boolean isSigned() {
		return signed;
	}
	public void setSigned(boolean signed) {
		this.signed = signed;
	}
	public int getFloating() {
		return floating;
	}
	public void setFloating(int floating) {
		this.floating = floating;
	}
	public String getUnits() {
		return units;
	}
	public void setUnits(String units) {
		this.units = units;
	}
	
	
	
	
	
}
