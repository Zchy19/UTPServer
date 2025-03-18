package com.macrosoft.model.bdc;


public class CanFrameData {

	private boolean isReceiveFrame;
	private String timestamp;
	private String rawFrame;
	private MessageInfo frameData;
	
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
	
	public MessageInfo getFrameData() {
		return frameData;
	}
	public void setFrameData(MessageInfo frameData) {
		this.frameData = frameData;
	}
}
