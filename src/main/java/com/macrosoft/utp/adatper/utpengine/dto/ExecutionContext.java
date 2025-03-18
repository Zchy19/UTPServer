package com.macrosoft.utp.adatper.utpengine.dto;

import java.util.List;

import com.macrosoft.utp.adatper.utpengine.IUtpEngineAdapter;


public final class ExecutionContext
{
//	public static String FailedByScriptAnalysis = "FailedByScriptAnalysis";
//	public static String FailedByMultipleAgentsExist = "FailedByMultipleAgentsExist";
//	public static String FailedByExecution = "FailedByExecution";
	public static String Success = "Success";


	private IUtpEngineAdapter utpEngine;
	private String executionId;
	private String executionName;
	private String executedByUserId;
	private String utpCoreIpAddress;
	private long utpCorePort;
	
	private String orgId;
	private String state;
	private boolean isDummyRun = false;
	private String testObject;
	
//	private ExecutionError executionError;

	private List<LiveAntbotDictionary> liveAntbotDictionarys;
	private List<ScriptAntbotInfo> antbotsDefinedInScript;
	

	//public boolean canContinueExecution = true;

	private long projectId;
	private long scriptId;
	private long scriptGroupId;
	private boolean isScriptGroupExecution = false;
	private long testsetId;
	private boolean isTestsetExecution = false;
	private long[] scriptIds;
	private boolean isScriptIdsExecution=false;

	public boolean isScriptIdsExecution() {
		return isScriptIdsExecution;
	}

	public void setScriptIdsExecution(boolean scriptIdsExecution) {
		isScriptIdsExecution = scriptIdsExecution;
	}

	public long[] getScriptIds() {
		return scriptIds;
	}

	public void setScriptIds(long[] scriptIds) {
		this.scriptIds = scriptIds;
	}

	public ExecutionContext()
	{
//		executionError = new ExecutionError();
	}
	
	public ExecutionContext(long scriptId)
	{
		this.scriptId = scriptId;
//		executionError = new ExecutionError();
	}
	public ExecutionContext(long[] scriptIds)
	{
		this.scriptIds = scriptIds;
//		executionError = new ExecutionError();
	}


	public boolean isDummyRun() {
		return isDummyRun;
	}

	public void setDummyRun(boolean isDummyRun) {
		this.isDummyRun = isDummyRun;
	}

	public String getTestObject() {
		return testObject;
	}

	public void setTestObject(String testObject) {
		this.testObject = testObject;
	}

	public String getUtpCoreIpAddress() {
		return utpCoreIpAddress;
	}

	public void setUtpCoreIpAddress(String utpCoreIpAddress) {
		this.utpCoreIpAddress = utpCoreIpAddress;
	}

	public long getUtpCorePort() {
		return utpCorePort;
	}

	public void setUtpCorePort(long utpCorePort) {
		this.utpCorePort = utpCorePort;
	}

	public List<LiveAntbotDictionary> getLiveAntbotDictionarys() {
		return liveAntbotDictionarys;
	}

	public void setLiveAntbotDictionarys(List<LiveAntbotDictionary> liveAntbotDictionarys) {
		this.liveAntbotDictionarys = liveAntbotDictionarys;
	}

	public List<ScriptAntbotInfo> getAntbotsDefinedInScript() {
		return antbotsDefinedInScript;
	}

	public void setAntbotsDefinedInScript(List<ScriptAntbotInfo> antbotsDefinedInScript) {
		this.antbotsDefinedInScript = antbotsDefinedInScript;
	}
/*
	public ExecutionError getExecutionError() {
		return executionError;
	}

	public void setExecutionError(ExecutionError executionError) {
		this.executionError = executionError;
	}
*/	
	public String getExecutionName() {
		return executionName;
	}


	public void setExecutionName(String executionName) {
		this.executionName = executionName;
	}


	public String getExecutedByUserId() {
		return executedByUserId;
	}

	public void setExecutedByUserId(String userLoginId) {
		this.executedByUserId = userLoginId;
	}
	
	public String getExecutionId() {
		return executionId;
	}
	
	
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}


	public boolean getIsTestsetExecution() {
		return isTestsetExecution;
	}


	public void setIsTestsetExecution(boolean isTestsetExecution) {
		this.isTestsetExecution = isTestsetExecution;
	}


	
	public boolean getIsScriptGroupExecution() {
		return isScriptGroupExecution;
	}

	public void setIsScriptGroupExecution(boolean isScriptGroupExecution) {
		this.isScriptGroupExecution = isScriptGroupExecution;
	}
	
	public String getOrgId() {
		return orgId;
	}

	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}

	

	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public IUtpEngineAdapter getUtpEngine()
	{
		return utpEngine;
	}
	
	public void setUtpEngine(IUtpEngineAdapter utpEngine)
	{
		this.utpEngine = utpEngine;
	}
	
	public long getScriptId() {
		return scriptId;
	}
	
	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	
	public long getTestsetId() {
		return testsetId;
	}

	public void setTestsetId(long testsetId) {
		this.testsetId = testsetId;
	}
	
	public long getScriptGroupId() {
		return scriptGroupId;
	}
	
	public void setScriptGroupId(long scriptGroupId) {
		this.scriptGroupId = scriptGroupId;
	}
	
	
	public String getState() {
		return state;
	}
	public void setState(String state) {
		this.state = state;
	}
}