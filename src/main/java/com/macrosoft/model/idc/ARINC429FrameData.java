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

public class ARINC429FrameData extends ARINC429Frame {

	//@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSS]X", timezone="GMT+8")
	//private Date time;

	private boolean isReceiveFrame;
	private String timestamp;
	private String rawFrame;
	
	public ARINC429FrameData()
	{
	}

	public boolean isReceiveFrame() {
		return isReceiveFrame;
	}
	public void setReceiveFrame(boolean isReceiveFrame) {
		this.isReceiveFrame = isReceiveFrame;
	}
	public String getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}
	public String getRawFrame() {
		return rawFrame;
	}
	public void setRawFrame(String rawFrame) {
		this.rawFrame = rawFrame;
	}
}
