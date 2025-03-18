package com.macrosoft.model.m1553b;


public class M1553FrameData {

	private String path;
	private String comWord;
	private String datas = "";
	private String status;
	private String rawFrame;
	
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

	public String getDatas() {
		return datas;
	}
	public void setDatas(String datas) {
		this.datas = datas;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getRawFrame() {
		return rawFrame;
	}
	public void setRawFrame(String rawFrame) {
		this.rawFrame = rawFrame;
	}
	
	
}
