package com.macrosoft.controller.dto;

public class ExtendedPreprocessExecutionTestsetParameter extends PreprocessExecutionTestsetParameter
{
	private boolean isSendEmail;
	private String emailAddress;

	public ExtendedPreprocessExecutionTestsetParameter() {}
	
	public ExtendedPreprocessExecutionTestsetParameter(PreprocessExecutionTestsetParameter parameter)
	{
		this.executionId = parameter.getExecutionId();
		
		this.executionName = parameter.getExecutionId();
		this.testObject = parameter.getTestObject();
		this.projectId = parameter.getProjectId();
		this.domainId = parameter.getDomainId();
		this.testsetId = parameter.getTestsetId();
		this.utpCoreIpAddress = parameter.getUtpCoreIpAddress();
		this.utpCorePort = parameter.getUtpCorePort();
		this.recoverSubscriptReferenceId = parameter.getRecoverSubscriptReferenceId();
		this.executedByUserId = parameter.getExecutedByUserId();
		this.isDummyRun = parameter.getIsDummyRun();
		this.utpCorePort = parameter.getUtpCorePort();
	}

	public boolean isSendEmail() {
		return isSendEmail;
	}

	public void setSendEmail(boolean isSendEmail) {
		this.isSendEmail = isSendEmail;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}
}
