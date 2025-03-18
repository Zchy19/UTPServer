package com.macrosoft.model.genericbusFrame;

import java.util.ArrayList;
import java.util.List;

public class MessageTable {
	private String name;
	private String endianess;
	private List<Message> messages = new ArrayList<Message>();
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEndianess() {
		return endianess;
	}
	public void setEndianess(String endianess) {
		this.endianess = endianess;
	}
	public List<Message> getMessages() {
		return messages;
	}
	public void setMessages(List<Message> messages) {
		this.messages = messages;
	}
}
