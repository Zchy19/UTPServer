package com.macrosoft.utilities;

public class MasterConfig {
	
	private String url;
	private String username;
	private String password;
	private String reportIncludeDummyRun;
	
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public boolean getReportIncludeDummyRun() {
		boolean result = StringUtility.parseBooleanSafely(reportIncludeDummyRun).getResult();
		return result;
	}
	public void setReportIncludeDummyRun(String reportIncludeDummyRun) {
		this.reportIncludeDummyRun = reportIncludeDummyRun;
	}
	
}
