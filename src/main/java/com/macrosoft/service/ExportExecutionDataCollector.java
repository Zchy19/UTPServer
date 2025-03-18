package com.macrosoft.service;

import java.util.HashMap;

public class ExportExecutionDataCollector {
	private String commandFormat;
	private HashMap<Integer, String> inputKeyDataIndex = new HashMap<Integer, String>();
	private HashMap<Integer, String> outputKeyDataIndex = new HashMap<Integer, String>();
	private HashMap<Integer, String> expectedKeyDataIndex = new HashMap<Integer, String>();

	private int result;
	
	public String getCommandFormat() {
		return commandFormat;
	}
	public void setCommandFormat(String commandFormat) {
		this.commandFormat = commandFormat;
	}
	
	public HashMap<Integer, String> getInputKeyDataIndex() {
		return inputKeyDataIndex;
	}
	public HashMap<Integer, String> getOutputKeyDataIndex() {
		return outputKeyDataIndex;
	}
	public HashMap<Integer, String> getExpectedKeyDataIndex() {
		return expectedKeyDataIndex;
	}
	public int getResult() {
		return result;
	}
	public void setResult(int result) {
		this.result = result;
	}
	
	
}
