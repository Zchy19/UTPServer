package com.macrosoft.model.genericbusFrame;

public class Field {
	private String name;
	private String type;
	private int startbit;
	private int bitlength;
	private String minimum;
	private String maximum;
	private String codeType;
	private boolean signed;
	private String units;
	private int precision;
	private float scale;
	private String defaultValue;
	
	public static final String Type_Integer = "integer";
	public static final String Type_Float = "float";
	public static final String Type_Bits = "bits";
	
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
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

	public int getPrecision() {
		return precision;
	}
	public void setPrecision(int precision) {
		this.precision = precision;
	}
	public String getMinimum() {
		return minimum;
	}
	public void setMinimum(String minimum) {
		this.minimum = minimum;
	}
	public String getMaximum() {
		return maximum;
	}
	public void setMaximum(String maximum) {
		this.maximum = maximum;
	}
	public String getCodeType() {
		return codeType;
	}
	public void setCodeType(String codeType) {
		this.codeType = codeType;
	}
	public String getUnits() {
		return units;
	}
	public void setUnits(String units) {
		this.units = units;
	}
	public boolean isSigned() {
		return signed;
	}
	public void setSigned(boolean signed) {
		this.signed = signed;
	}
	public float getScale() {
		return scale;
	}
	public void setScale(float scale) {
		this.scale = scale;
	}
	public String getDefaultValue() {
		return defaultValue;
	}
	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}
	
	
}
