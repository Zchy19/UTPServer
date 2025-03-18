package com.macrosoft.service;

import java.util.HashMap;

public final class ExportExecutionResultContext {
	
	private static ThreadLocal<HashMap<String, ExportExecutionDataCollector>> ParsedCommandMapLocalValue = new ThreadLocal<>();
	private static ThreadLocal<HashMap<String, String>> AgentInstanceMapLocalValue = new ThreadLocal<>();
	private static ThreadLocal<HashMap<String, String>> EngineCmdMapLocalValue = new ThreadLocal<>();


	public static HashMap<String, String> getEngineCmdMap()
	{
		return EngineCmdMapLocalValue.get();
	}

	public static void setEngineCmdMap(HashMap<String, String> engineCmdMap)
	{
		EngineCmdMapLocalValue.set(engineCmdMap);
	}

	public static HashMap<String, ExportExecutionDataCollector> getParsedCommandMap()
	{
		return ParsedCommandMapLocalValue.get();
	}

	public static void setParsedCommandMap(HashMap<String, ExportExecutionDataCollector> parsedCommandMap)
	{
		ParsedCommandMapLocalValue.set(parsedCommandMap);
	}
	
	
	public static HashMap<String, String> getAgentInstanceMap()
	{
		return AgentInstanceMapLocalValue.get();
	}

	public static void setAgentInstanceMap(HashMap<String, String> agentInstanceMap)
	{
		AgentInstanceMapLocalValue.set(agentInstanceMap);
	}
}
