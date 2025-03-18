package com.macrosoft.logging;

import com.macrosoft.master.TenantContext;

public class TrailUtility {

	public final static String Trail_Creation = "Creation";
	public final static String Trail_Deletion = "Deletion";
	public final static String Trail_Update = "Update";

	public static void Trail(ILogger logger, String category, String operationName) {
		String tenantId = TenantContext.getTenantId();
		String userId = TenantContext.getUserId();

		logger.info(String.format("Trail - %s , operation: %s , tenantId: %s, userId: %s", 
									category, operationName, tenantId, userId));
	}

	public static void Trail(ILogger logger, String category, String operationName, String additionalInfo) {
		String tenantId = TenantContext.getTenantId();
		String userId = TenantContext.getUserId();

		logger.info(String.format("Trail - %s , operation: %s , tenantId: %s, userId: %s, %s", 
									category, operationName, tenantId, userId, additionalInfo));
	}
}
