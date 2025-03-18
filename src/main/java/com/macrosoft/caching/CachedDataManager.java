package com.macrosoft.caching;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.MonitorData;

public class CachedDataManager {

	private static final ILogger logger = LoggerFactory.Create(CachedDataManager.class.getName());

	private static ConcurrentHashMap<String, CachedData> mCachedData = new ConcurrentHashMap<String, CachedData>();
	
	public static List<ExecutionResult> getCachedExecutionResultList(String tenantId) {
		try {
			CachedData cachedData = ResolveCachedData(tenantId);
			
			List<ExecutionResult> executionResults = cachedData.getExecutionResults();
			
			
			if (executionResults.size() > 0) {
				logger.info("getCachedExecutionResultList tenantId : " + tenantId + "cached count is :" + executionResults.size());
			}
			
			return executionResults;
		} catch (Exception ex) {
			logger.error("getCachedExecutionResultList", ex);
			return new ArrayList<ExecutionResult>();
		}
	}

	public static boolean RemoveExecutionResult(String tenantId, ExecutionResult executionResult) {
		try {
			CachedData cachedData = ResolveCachedData(tenantId);
			
			cachedData.RemoveExecutionResult(executionResult);
			
			logger.info("RemoveExecutionResult()" + "tenantId:" + tenantId);
			return true;
		} catch (Exception ex) {
			logger.error("RemoveExecutionResult", ex);
			return false;
		}
	}

	public static boolean AddExecutionResult(String tenantId, ExecutionResult executionResult) {
		try {
			CachedData cachedData = ResolveCachedData(tenantId);
			
			cachedData.AddExecutionResult(executionResult);
			
			logger.info("AddExecutionResult tenantId : " + tenantId + "cached count is :" + cachedData.getExecutionResults().size());
			
			return true;
		} catch (Exception ex) {
			logger.error("AddExecutionResult", ex);
			return false;
		}
	}


	public static List<MonitorData> getCachedMonitorDataList(String tenantId) {
		try {
			CachedData cachedData = ResolveCachedData(tenantId);
			
			List<MonitorData> monitorDatas = cachedData.getMonitorDatas();
			
			if (monitorDatas.size() > 0) {
				logger.info("getCachedMonitorDataList tenantId : " + tenantId + "cached count is :" + monitorDatas.size());
			}
			
			return monitorDatas;
		} catch (Exception ex) {
			logger.error("getCachedMonitorDataList", ex);
			return new ArrayList<MonitorData>();
		}
	}

	public static boolean RemoveMonitorData(String tenantId, MonitorData monitorData) {
		try {
			CachedData cachedData = ResolveCachedData(tenantId);
			cachedData.RemoveMonitorData(monitorData);
			return true;
		} catch (Exception ex) {
			logger.error("RemoveMonitorData", ex);
			return false;
		}
	}

	public static boolean AddMonitorData(String tenantId, MonitorData monitorData) {
		
		try {
			CachedData cachedData = ResolveCachedData(tenantId);
			cachedData.AddMonitorData(monitorData);

			logger.info("AddMonitorData tenantId : " + tenantId + "cached count is :" + cachedData.getMonitorDatas().size());
			
			return true;
		} catch (Exception ex) {
			logger.error("AddMonitorData", ex);
			return false;
		}
	}
	
	private static CachedData ResolveCachedData(String tenantId)
	{
		if (!mCachedData.containsKey(tenantId))
		{
			mCachedData.put(tenantId, new CachedData());
		}
		
		CachedData cachedData = mCachedData.get(tenantId);
		return cachedData;
	}

}
