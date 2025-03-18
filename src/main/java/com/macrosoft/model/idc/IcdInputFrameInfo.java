package com.macrosoft.model.idc;

import java.io.Serializable;
import java.util.ArrayList;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class IcdInputFrameInfo implements Serializable{

	private String protocolId;
	private String lableIndex;	
	private ArrayList<IcdInputFrameFieldInfo> fields;
	private String ssmCode;
	
	public IcdInputFrameInfo()
	{
		fields = new ArrayList<IcdInputFrameFieldInfo>();
	}
	
	public String getProtocolId() {
		return protocolId;
	}
	public void setProtocolId(String protocolId) {
		this.protocolId = protocolId;
	}
	public String getLableIndex() {
		return lableIndex;
	}
	public void setLableIndex(String lableIndex) {
		this.lableIndex = lableIndex;
	}

	
	public ArrayList<IcdInputFrameFieldInfo> getFields() {
		return fields;
	}
	public void setFields(ArrayList<IcdInputFrameFieldInfo> fields) {
		this.fields = fields;
	}
	public String getSsmCode() {
		return ssmCode;
	}
	public void setSsmCode(String ssmCode) {
		this.ssmCode = ssmCode;
	}

	
	
}
