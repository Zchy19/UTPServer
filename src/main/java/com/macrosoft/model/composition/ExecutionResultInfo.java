package com.macrosoft.model.composition;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

public class ExecutionResultInfo {
	private long resultId;
	private long scriptId;

	private String executionId;
	private String antbotName;
	private int commandType;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date executionTime;
	
	private String command;
	private int result;
	private String errorMessage;
	private String parentId;
	private String indexId;

	public String getParentId() {
		return parentId;
	}

	public void setParentId(String parentId) {
		this.parentId = parentId;
	}

	public String getIndexId() {
		return indexId;
	}

	public void setIndexId(String indexId) {
		this.indexId = indexId;
	}

	public long getScriptId() {
		return scriptId;
	}
	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	public long getResultId() {
		return resultId;
	}
	public void setResultId(long resultId) {
		this.resultId = resultId;
	}
	protected String getExecutionId() {
		return executionId;
	}
	protected void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public String getAntbotName() {
		return antbotName;
	}
	public void setAntbotName(String antbotName) {
		this.antbotName = antbotName;
	}
	public int getCommandType() {
		return commandType;
	}
	public void setCommandType(int commandType) {
		this.commandType = commandType;
	}
	public Date getExecutionTime() {
		return executionTime;
	}
	public void setExecutionTime(Date executionTime) {
		this.executionTime = executionTime;
	}
	public String getCommand() {
		return command;
	}
	public void setCommand(String command) {
		this.command = command;
	}
	public int getResult() {
		return result;
	}
	public void setResult(int result) {
		this.result = result;
	}
	public String getErrorMessage() {
		return errorMessage;
	}
	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}

}
