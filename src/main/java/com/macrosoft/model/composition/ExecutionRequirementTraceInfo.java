package com.macrosoft.model.composition;

public class ExecutionRequirementTraceInfo {

	private String executionId;
	private long scriptId;
	private String customizedScriptId;	
	private String scriptName;
	
	private long requirementId;
	private String customizedRequirementId;	
	private String requirementTitle;
	private String result;
	private	String requirementResult;

	public String getRequirementResult() {
		return requirementResult;
	}

	public void setRequirementResult(String requirementResult) {
		this.requirementResult = requirementResult;
	}

	public String getExecutionId() {
		return executionId;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public long getScriptId() {
		return scriptId;
	}
	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	public String getCustomizedScriptId() {
		return customizedScriptId;
	}
	public void setCustomizedScriptId(String customizedScriptId) {
		this.customizedScriptId = customizedScriptId;
	}
	public String getScriptName() {
		return scriptName;
	}
	public void setScriptName(String scriptName) {
		this.scriptName = scriptName;
	}
	public long getRequirementId() {
		return requirementId;
	}
	public void setRequirementId(long requirementId) {
		this.requirementId = requirementId;
	}
	public String getCustomizedRequirementId() {
		return customizedRequirementId;
	}
	public void setCustomizedRequirementId(String customizedRequirementId) {
		this.customizedRequirementId = customizedRequirementId;
	}
	public String getRequirementTitle() {
		return requirementTitle;
	}
	public void setRequirementTitle(String requirementTitle) {
		this.requirementTitle = requirementTitle;
	}
	public String getResult() {
		return result;
	}
	public void setResult(String result) {
		this.result = result;
	}
	
	
	
}
