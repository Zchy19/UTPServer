package com.macrosoft.model.genericbusFrame;

import java.util.ArrayList;
import java.util.List;

public class MessageInfo {

	private String message;
	private CommandFieldInfo commandField;
	private List<FieldInfo> fields;
	
	public MessageInfo()
	{
		fields = new ArrayList<FieldInfo>();
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
	
	public CommandFieldInfo getCommandField() {
		return commandField;
	}

	public void setCommandField(CommandFieldInfo commandField) {
		this.commandField = commandField;
	}

	public List<FieldInfo> getFields() {
		return fields;
	}

	public void setFields(List<FieldInfo> fields) {
		this.fields = fields;
	}	
}
