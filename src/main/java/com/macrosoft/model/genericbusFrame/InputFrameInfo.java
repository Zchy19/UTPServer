package com.macrosoft.model.genericbusFrame;

import java.io.Serializable;
import java.util.ArrayList;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class InputFrameInfo implements Serializable{

	private String protocolId;
	private String id;
	private ArrayList<InputFrameFieldInfo> fields;
	
	public InputFrameInfo()
	{
		fields = new ArrayList<InputFrameFieldInfo>();
	}
	
	public String getProtocolId() {
		return protocolId;
	}
	public void setProtocolId(String protocolId) {
		this.protocolId = protocolId;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public ArrayList<InputFrameFieldInfo> getFields() {
		return fields;
	}

	public void setFields(ArrayList<InputFrameFieldInfo> fields) {
		this.fields = fields;
	}


	
	
}
