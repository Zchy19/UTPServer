package com.macrosoft.model.m1553ba429;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.model.idc.ARINC429Frame;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class M1553bAndA429FrameData implements Serializable{

	private List<ARINC429Frame> frameDatas;

	private boolean isReceiveFrame;
	private String timestamp;
	private String rawFrame;
	
	
	// M1553b data
	private String path;
	private String comWord;
	private String status;
	
	public M1553bAndA429FrameData()
	{
		frameDatas = new ArrayList<ARINC429Frame>();
	}
	
	public List<ARINC429Frame> getFrameDatas() {
		return frameDatas;
	}

	public void setFrameDatas(List<ARINC429Frame> frameDatas) {
		this.frameDatas = frameDatas;
	}

	public boolean isReceiveFrame() {
		return isReceiveFrame;
	}

	public void setReceiveFrame(boolean isReceiveFrame) {
		this.isReceiveFrame = isReceiveFrame;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public String getComWord() {
		return comWord;
	}

	public void setComWord(String comWord) {
		this.comWord = comWord;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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
