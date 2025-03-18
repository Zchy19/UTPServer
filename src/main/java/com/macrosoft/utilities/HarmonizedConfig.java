package com.macrosoft.utilities;

public class HarmonizedConfig {
	
	private String mysqlExePath;
	private String restoreTemplatePath;
	private String dbUserName;
	private String dbPassword;
	private String cachingPath;
	
	public String getMysqlExePath() {
		return mysqlExePath;
	}
	public void setMysqlExePath(String mysqlExePath) {
		this.mysqlExePath = mysqlExePath;
	}
	public String getRestoreTemplatePath() {
		return restoreTemplatePath;
	}
	public void setRestoreTemplatePath(String restoreTemplatePath) {
		this.restoreTemplatePath = restoreTemplatePath;
	}
	public String getDbUserName() {
		return dbUserName;
	}
	public void setDbUserName(String dbUserName) {
		this.dbUserName = dbUserName;
	}
	public String getDbPassword() {
		return dbPassword;
	}
	public void setDbPassword(String dbPassword) {
		this.dbPassword = dbPassword;
	}
	
	public String getCachingPath() {
		return cachingPath;
	}
	public void setCachingPath(String cachingPath) {
		this.cachingPath = cachingPath;
	}
}
