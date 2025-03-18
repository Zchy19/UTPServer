package com.macrosoft.model.idc;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */

public class ARINC429Frame implements Serializable{

	private String labelIndex;
	private String labelName;
	private String encodedString;
	private String decodedBits;
	private List<ARINC429FrameFieldData> fields;
	private String ssmValue;
	
	public ARINC429Frame()
	{
		fields = new ArrayList<ARINC429FrameFieldData>();
	}

	public String getLabelIndex() {
		return labelIndex;
	}
	public void setLabelIndex(String labelIndex) {
		this.labelIndex = labelIndex;
	}
	public String getLabelName() {
		return labelName;
	}
	public void setLabelName(String labelName) {
		this.labelName = labelName;
	}
	public String getEncodedString() {
		return encodedString;
	}
	public void setEncodedString(String encodedString) {
		this.encodedString = encodedString;
	}
	public String getDecodedBits() {
		return decodedBits;
	}
	public void setDecodedBits(String decodedBits) {
		this.decodedBits = decodedBits;
	}

	public List<ARINC429FrameFieldData> getFields() {
		return fields;
	}

	public void setFields(List<ARINC429FrameFieldData> fields) {
		this.fields = fields;
	}

	public String getSsmValue() {
		return ssmValue;
	}
	public void setSsmValue(String ssmValue) {
		this.ssmValue = ssmValue;
	}
}
