package com.macrosoft.utilities;

public class SystemConfig {
	
	private String utpCoreAccessLibName;
	private String convertorMgrName;
	private String dbcConvertor;

	public String getDbcConvertor() {
		return dbcConvertor;
	}

	public void setDbcConvertor(String dbcConvertor) {
		this.dbcConvertor = dbcConvertor;
	}

	public String getConvertorMgrName() {
		return convertorMgrName;
	}

	public void setConvertorMgrName(String convertorMgrName) {
		this.convertorMgrName = convertorMgrName;
	}

	public String getUtpCoreAccessLibName() {
		return utpCoreAccessLibName;
	}
	public void setUtpCoreAccessLibName(String utpCoreAccessLibName) {
		this.utpCoreAccessLibName = utpCoreAccessLibName;
	}

}
