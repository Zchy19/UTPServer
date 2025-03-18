package com.macrosoft.service;


public class ExportExecutionParsedResult {
	
	private String parsedCommand;
	private String inputKeyData = "";
	private String outputKeyData= "";
	private String expectedKeyData= "";
	private int result;
	private String wrongComment = "";
	
	public ExportExecutionParsedResult() {}
	
	public ExportExecutionParsedResult(String command) 
	{ 
		this.parsedCommand = command;
	}
	
	public String getParsedCommand() {
		return parsedCommand;
	}
	public void setParsedCommand(String parsedCommand) {
		this.parsedCommand = parsedCommand;
	}
	public String getInputKeyData() {
		return inputKeyData;
	}
	public void setInputKeyData(String inputKeyData) {
		this.inputKeyData = inputKeyData;
	}
	public String getOutputKeyData() {
		return outputKeyData;
	}
	public void setOutputKeyData(String outputKeyData) {
		this.outputKeyData = outputKeyData;
	}
	public String getExpectedKeyData() {
		return expectedKeyData;
	}
	public void setExpectedKeyData(String expectedKeyData) {
		this.expectedKeyData = expectedKeyData;
	}

	public int getResult() {
		return result;
	}

	public void setResult(int result) {
		this.result = result;
	}

	public String getWrongComment() {
		return wrongComment;
	}

	public void setWrongComment(String wrongComment) {
		this.wrongComment = wrongComment;
	}

	
	
	
	
}
