package com.macrosoft.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.controller.dto.AnalyzeScriptError;
import com.macrosoft.controller.dto.StartExecutionError;
import com.macrosoft.controller.dto.UtpCoreNetworkError;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotDictionary;
import com.macrosoft.utp.adatper.utpengine.dto.ScriptAntbotInfo;

public class ExecutionModel {
	
	public final static String State_EngineInitializing = "EngineInitializing";
	public final static String State_EngineInitialized = "EngineInitialized";
	public final static String State_EngineInitError = "EngineInitError";
	public final static String State_EngineConfiguring = "EngineConfiguring";
	public final static String State_EngineConfigured = "EngineConfigured";
	public final static String State_ConfigureError = "ConfigureError";
	public final static String State_AnalyzingScript = "AnalyzingScript";
	public final static String State_ScriptAnalyzed = "ScriptAnalyzed";
	public final static String State_WaitingMatchAntbot = "WaitingMatchAntbot";
	public final static String State_AntbotNotFoundError = "AntbotNotFoundError";
	public final static String State_Starting = "Starting";
	public final static String State_Running = "Running";
	public final static String State_Paused = "Paused";
	public final static String State_Stopped = "Stopped";
	public final static String State_ExceptionHandling = "ExceptionHandling";
	public final static String State_ReconnectingNetwork = "ReconnectingNetwork";
	public final static String State_Terminated = "Terminated";
	public final static String State_Completed = "Completed";
	public final static String State_UtpCoreNetworkError = "UtpCoreNetworkError";
	public final static String State_AnalyzeScriptError = "AnalyzeScriptError";
	public final static String State_StartExecutionError = "StartExecutionError";
	public final static String State_UnknowError = "UnknowError";
	
	
	private long tenantId;
	private long orgId;
	private String executionId;
	private String executionName;
	private long projectId;
	private long recoverSubscriptReferenceId;
	private String status;
//	private long engineSessionId;
	private boolean isMonitorExecution;
	private boolean isTemporarySave;


	private UtpCoreNetworkError utpCoreNetworkError;
	private StartExecutionError startExecutionError;
	private AnalyzeScriptError analyzeScriptError;
	
	private List<LiveAntbotDictionary> liveAntbotDictionarys;
	private List<ScriptAntbotInfo> antbotsDefinedInScript;
	
	private String private_endExecutionState_In_ExecutionModel;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date private_endExecutionDateTime_In_ExecutionStatus;
	private int private_endExecutionStatus_In_ExecutionStatus;
	private Date private_startExecutionDateTime;
	private boolean isSendEmail;
	private String emailAddress;
	private String executedByUserId;
	private String ipAddress;
	private long port;
	private boolean isAutoRun;
	private String scriptGroupId;
	//六个标记
	boolean isTestcaseCollect;
	boolean isTestcasePersist;
	boolean isTeststepCollect;
	boolean isTeststepPersist;
	boolean isTestdataCollect;
	boolean isTestdataPersist;
	String transformConfig;
	String engineName;

	public String getEngineName() {
		return engineName;
	}

	public void setEngineName(String engineName) {
		this.engineName = engineName;
	}

	public String getTransformConfig() {
		return transformConfig;
	}

	public void setTransformConfig(String transformConfig) {
		this.transformConfig = transformConfig;
	}

	//命令计数
	private int commandCount;
	private int testcaseEndCount;
	//执行计数
	private int commandCountFailed;
	private int testcaseEndCountFailed;

	public int getCommandCountFailed() {
		return commandCountFailed;
	}

	public void setCommandCountFailed(int commandCountFailed) {
		this.commandCountFailed = commandCountFailed;
	}

	public int getTestcaseEndCountFailed() {
		return testcaseEndCountFailed;
	}

	public void setTestcaseEndCountFailed(int testcaseEndCountFailed) {
		this.testcaseEndCountFailed = testcaseEndCountFailed;
	}

	public int getTestcaseEndCount() {
		return testcaseEndCount;
	}

	public void setTestcaseEndCount(int testcaseEndCount) {
		this.testcaseEndCount = testcaseEndCount;
	}

	public int getCommandCount() {
		return commandCount;
	}

	public void setCommandCount(int commandCount) {
		this.commandCount = commandCount;
	}

	public boolean isTestcaseCollect() {
		return isTestcaseCollect;
	}

	public void setIsTestcaseCollect(boolean isTestcaseCollect) {
		this.isTestcaseCollect = isTestcaseCollect;
	}

	public boolean isTestcasePersist() {
		return isTestcasePersist;
	}

	public void setIsTestcasePersist(boolean isTestcasePersist) {
		this.isTestcasePersist = isTestcasePersist;
	}

	public boolean isTeststepCollect() {
		return isTeststepCollect;
	}

	public void setIsTeststepCollect(boolean isTeststepsCollect) {
		this.isTeststepCollect = isTeststepsCollect;
	}

	public boolean isTeststepPersist() {
		return isTeststepPersist;
	}

	public void setIsTeststepPersist(boolean isTeststepsPersist) {
		this.isTeststepPersist = isTeststepsPersist;
	}

	public boolean isTestdataCollect() {
		return isTestdataCollect;
	}

	public void setIsTestdataCollect(boolean isTestdataCollect) {
		this.isTestdataCollect = isTestdataCollect;
	}

	public boolean isTestdataPersist() {
		return isTestdataPersist;
	}

	public void setIsTestdataPersist(boolean isTestdataPersist) {
		this.isTestdataPersist = isTestdataPersist;
	}

	public boolean isTemporarySave() {
		return isTemporarySave;
	}

	public void setTemporarySave(boolean temporarySave) {
		isTemporarySave = temporarySave;
	}

	public String getScriptGroupId() {
		return scriptGroupId;
	}

	public void setScriptGroupId(String scriptGroupId) {
		this.scriptGroupId = scriptGroupId;
	}

	public ExecutionModel()
	{
		liveAntbotDictionarys = new ArrayList<LiveAntbotDictionary>();
		antbotsDefinedInScript = new ArrayList<ScriptAntbotInfo>();
		
		this.private_startExecutionDateTime = new Date();
	}
	
	public long getTenantId() {
		return tenantId;
	}
	public void setTenantId(long tenantId) {
		this.tenantId = tenantId;
	}
	
	public long getOrgId() {
		return orgId;
	}

	public void setOrgId(long orgId) {
		this.orgId = orgId;
	}

/*
	
	public long getEngineSessionId() {
		return engineSessionId;
	}

	public void setEngineSessionId(long engineSessionId) {
		this.engineSessionId = engineSessionId;
	}
*/	
	public String getIpAddress() {
		return ipAddress;
	}

	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}

	public long getPort() {
		return port;
	}

	public void setPort(long port) {
		this.port = port;
	}

	public String getExecutedByUserId() {
		return executedByUserId;
	}

	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}

	public boolean isMonitorExecution() {
		return isMonitorExecution;
	}

	public void setMonitorExecution(boolean isMonitorExecution) {
		this.isMonitorExecution = isMonitorExecution;
	}

	public String getExecutionId() {
		return executionId;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	public long getRecoverSubscriptReferenceId() {
		return recoverSubscriptReferenceId;
	}
	public void setRecoverSubscriptReferenceId(long recoverSubscriptReferenceId) {
		this.recoverSubscriptReferenceId = recoverSubscriptReferenceId;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}

	public boolean getIsSendEmail() {
		return isSendEmail;
	}

	public void setIsSendEmail(boolean isSendEmail) {
		this.isSendEmail = isSendEmail;
	}

	public  boolean getIsAutoRun() {
		return isAutoRun;
	}
	public void setIsAutoRun(boolean isAutoRun) {
		this.isAutoRun = isAutoRun;
	}
	
	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public UtpCoreNetworkError getUtpCoreNetworkError() {
		return utpCoreNetworkError;
	}

	public void setUtpCoreNetworkError(UtpCoreNetworkError utpCoreNetworkError) {
		this.utpCoreNetworkError = utpCoreNetworkError;
	}

	public AnalyzeScriptError getAnalyzeScriptError() {
		return analyzeScriptError;
	}

	public void setAnalyzeScriptError(AnalyzeScriptError analyzeScriptError) {
		this.analyzeScriptError = analyzeScriptError;
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
	
	public StartExecutionError getStartExecutionError() {
		return startExecutionError;
	}

	public void setStartExecutionError(StartExecutionError startExecutionError) {
		this.startExecutionError = startExecutionError;
	}

	public String getPrivate_endExecutionState_In_ExecutionModel() {
		return private_endExecutionState_In_ExecutionModel;
	}

	public void setPrivate_endExecutionState_In_ExecutionModel(String private_endExecutionState_In_ExecutionModel) {
		this.private_endExecutionState_In_ExecutionModel = private_endExecutionState_In_ExecutionModel;
	}

	public Date getPrivate_endExecutionDateTime_In_ExecutionStatus() {
		return private_endExecutionDateTime_In_ExecutionStatus;
	}

	public void setPrivate_endExecutionDateTime_In_ExecutionStatus(Date private_endExecutionDateTime_In_ExecutionStatus) {
		this.private_endExecutionDateTime_In_ExecutionStatus = private_endExecutionDateTime_In_ExecutionStatus;
	}

	public int getPrivate_endExecutionStatus_In_ExecutionStatus() {
		return private_endExecutionStatus_In_ExecutionStatus;
	}

	public void setPrivate_endExecutionStatus_In_ExecutionStatus(int private_endExecutionStatus_In_ExecutionStatus) {
		this.private_endExecutionStatus_In_ExecutionStatus = private_endExecutionStatus_In_ExecutionStatus;
	}

	public Date getPrivate_startExecutionDateTime() {
		return private_startExecutionDateTime;
	}

	public void setPrivate_startExecutionDateTime(Date private_startExecutionDateTime) {
		this.private_startExecutionDateTime = private_startExecutionDateTime;
	}
	
}


