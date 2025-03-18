package com.macrosoft.controller.dto;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.model.ExecutionTestCaseResult;

public class ExecutionTestCaseResultInfo {
	public String executionId;
	public long scriptId;
	public String scriptName;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	public Date startTime;
	public int result;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	public Date endTime;
	private long executionResultStartId;
	private long executionResultEndId;

	public long getExecutionResultStartId() {
		return executionResultStartId;
	}

	public void setExecutionResultStartId(long executionResultStartId) {
		this.executionResultStartId = executionResultStartId;
	}

	public String getScriptName() {
		return scriptName;
	}

	public void setScriptName(String scriptName) {
		this.scriptName = scriptName;
	}

	public long getExecutionResultEndId() {
		return executionResultEndId;
	}

	public void setExecutionResultEndId(long executionResultEndId) {
		this.executionResultEndId = executionResultEndId;
	}

	public static ExecutionTestCaseResultInfo converterToExecutionTestCaseResultInfo(ExecutionTestCaseResult testcaseResult)
	{
		ExecutionTestCaseResultInfo info = new ExecutionTestCaseResultInfo();
	
		info.executionId = testcaseResult.getExecutionId();
		info.scriptId = testcaseResult.getScriptId();
		info.scriptName = testcaseResult.getScriptName();
		info.startTime = testcaseResult.getStartTime();
		info.endTime = testcaseResult.getEndTime();
		info.result = testcaseResult.getResult();
		info.executionResultStartId = testcaseResult.getExecutionResultStartId();
		info.executionResultEndId = testcaseResult.getExecutionResultEndId();
		/*
		switch (testcaseResult.getResult())
		{
			case ExecutionTestCaseResult.Success :
			{
				info.result = "Pass";
				break;
			}
			case ExecutionTestCaseResult.Fail :
			{
				info.result = "Fail";
				break;
			}
			case ExecutionTestCaseResult.None :
			{
				info.result = "None";
				break;
			}
			default:
			{
				info.result = "Others";
				break;				
			}
		}
		 */
		
		return info;
	}
}
