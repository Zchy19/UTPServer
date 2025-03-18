package com.macrosoft.dao;

import com.macrosoft.model.ExecutionData;

import java.util.List;

public interface ExecutionDataDAO {
	public void addExecutionData(ExecutionData executionData);
	public List<ExecutionData> listExecutionDataByExecutionId(String executionId);
	public List<ExecutionData> listExecutionData(String executionId, int lastResultId);
}
