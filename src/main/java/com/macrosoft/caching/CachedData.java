package com.macrosoft.caching;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;

import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.MonitorData;


public class CachedData implements Serializable {

	private ConcurrentLinkedQueue<ExecutionResult> mExecutionResults;
	private ConcurrentLinkedQueue<MonitorData> mMonitorDatas;

	
	public CachedData() {
		this.mExecutionResults = new ConcurrentLinkedQueue<ExecutionResult>();
		this.mMonitorDatas = new ConcurrentLinkedQueue<MonitorData>();
	}

	public List<ExecutionResult> getExecutionResults() {
		return new ArrayList<ExecutionResult>(mExecutionResults);
	}
	
	public void AddExecutionResult(ExecutionResult executionResult)
	{
		if (mExecutionResults.contains(executionResult)) return;
		
		mExecutionResults.add(executionResult);	
	}
	
	public void RemoveExecutionResult(ExecutionResult executionResult)
	{
		if (mExecutionResults.contains(executionResult)) 
		{
			mExecutionResults.remove(executionResult);
		}	
	}
	

	public List<MonitorData> getMonitorDatas() {
		return new ArrayList<MonitorData>(mMonitorDatas);
	}
	
	public void AddMonitorData(MonitorData monitorData)
	{
		if (mMonitorDatas.contains(monitorData)) return;
		
		mMonitorDatas.add(monitorData);	
	}
	
	public void RemoveMonitorData(MonitorData monitorData)
	{
		if (mMonitorDatas.contains(monitorData)) 
		{
			mMonitorDatas.remove(monitorData);
		}	
	}
}
