package com.macrosoft.urs;

public class UrsServiceApis {

	public final static String GetAllAgentTypeList = "%s/api/Tool/Agent/GetAllAgentTypeList?ToolDynamicID=123";
	
	public final static String GetEngineCmds = "%s/api/Tool/Agent/GetEngineCmdUserLang";
	
	public final static String GetUTPEngineAddress = "%s/api/Tool/Engine/GetUTPEngineAddress?AuthorizationKey=xxx&OrganizationID=%s";

	//新增GetUTPEngine
	public final static String GetUTPEngine = "%s/api/Tool/Engine/GetUtpEngine?AuthorizationKey=xxx&OrganizationID=%s&UserAccount=%s";
	//获取测试用户
	public final static String GetTestAccount = "%s/api/Organization/getTestAccount";
	//根据modleName获取feature
	public final static String GetFeatureByModelName = "%s/api/SystemConfig/GetFeaturesByModule?moduleName=%s";
}
