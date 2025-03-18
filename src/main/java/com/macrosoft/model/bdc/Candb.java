package com.macrosoft.model.bdc;

import java.util.ArrayList;
import java.util.List;

public class Candb {

	private String fileName;
	private List<Message> messages;
	
	public Candb()
	{
		messages = new ArrayList<Message>();
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public List<Message> getMessages() {
		return messages;
	}

	public void setMessages(List<Message> messages) {
		this.messages = messages;
	}
	
	
	
}
