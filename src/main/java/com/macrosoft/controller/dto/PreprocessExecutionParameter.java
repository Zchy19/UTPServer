package com.macrosoft.controller.dto;


public class PreprocessExecutionParameter {
	String executionId;
	String executionName;
	String testObject;
	long projectId;
	long domainId;
	long[] scriptIds;
	String utpCoreIpAddress;
	long utpCorePort;
	long recoverSubscriptReferenceId;
	String executedByUserId;
	boolean isDummyRun;
	boolean isSendEmail;
	boolean isSend;
	private String emailAddress;
	private String scriptGroupId;
	boolean isAutoRun;
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

//	boolean isTeststepsPersistence;
	boolean isMonitordataPersistence;

	public String getScriptGroupId() {
		return scriptGroupId;
	}

	public void setScriptGroupId(String scriptGroupIdId) {
		this.scriptGroupId = scriptGroupIdId;
	}
//
//	public boolean getIsTeststepsPersistence() {
//		return isTeststepsPersistence;
//	}
//
//	public void setIsTeststepsPersistence(boolean isTeststepsPersistence) {
//		this.isTeststepsPersistence = isTeststepsPersistence;
//	}
	public boolean getIsSend() {
		return isSend;
	}
	public void setIsSend(boolean isSend) {
		this.isSend = isSend;
	}

	public boolean isAutoRun() {
		return isAutoRun;
	}
	public void setIsAutoRun(boolean isAutoRun) {
		this.isAutoRun = isAutoRun;
	}

	public boolean getIsMonitordataPersistence() {
		return isMonitordataPersistence;
	}

	public void setIsMonitordataPersistence(boolean isMonitordataPersistence) {
		this.isMonitordataPersistence = isMonitordataPersistence;
	}
	public boolean getIsSendEmail() {
		return isSendEmail;
	}

	public void setIsSendEmail(boolean isSendEmail) {
		this.isSendEmail = isSendEmail;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public long[] getScriptIds() {
		return scriptIds;
	}

	public void setScriptIds(long[] scriptIds) {
		this.scriptIds = scriptIds;
	}

	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	public boolean getIsDummyRun() {
		return isDummyRun;
	}
	public void setIsDummyRun(boolean isDummyRun) {
		this.isDummyRun = isDummyRun;
	}

	public String getExecutionId() {
		return executionId;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public String getExecutionName() {
		return executionName;
	}
	public void setExecutionName(String executionName) {
		this.executionName = executionName;
	}

	public String getTestObject() {
		return testObject;
	}
	public void setTestObject(String testObject) {
		this.testObject = testObject;
	}
	public long getDomainId() {
		return domainId;
	}
	public void setDomainId(long domainId) {
		this.domainId = domainId;
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
	public String getExecutedByUserId() {
		return executedByUserId;
	}
	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}
	public long getRecoverSubscriptReferenceId() {
		return recoverSubscriptReferenceId;
	}
	public void setRecoverSubscriptReferenceId(long recoverSubscriptReferenceId) {
		this.recoverSubscriptReferenceId = recoverSubscriptReferenceId;
	}
	
}

