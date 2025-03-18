package com.macrosoft.master;

public final class TenantContext {

	public static final String DefaultTenantId = "0";

	private static ThreadLocal<String> OrgIdForGlobalLocalValue = new ThreadLocal<>();
	private static ThreadLocal<String> TenantIdLocalValue = new ThreadLocal<>();
	private static ThreadLocal<String> UserIdLocalValue = new ThreadLocal<>();
	

	public static String getOrgId()
	{
		return OrgIdForGlobalLocalValue.get();
	}

	public static void setOrgId(String orgId)
	{
		OrgIdForGlobalLocalValue.set(orgId);
	}
	
	
	public static String getTenantId()
	{
		return TenantIdLocalValue.get();
	}

	public static void setTenantId(String tenantId)
	{
		TenantIdLocalValue.set(tenantId);
	}
	
	public static String getUserId()
	{
		return UserIdLocalValue.get();
	}

	public static void setUserId(String userId)
	{
		UserIdLocalValue.set(userId);
	}
	
}
