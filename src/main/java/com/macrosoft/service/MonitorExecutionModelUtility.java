package com.macrosoft.service;

public class MonitorExecutionModelUtility
{

//	public final static String StartString = "start";
	public final static String EndString = "end";
/*
	public static String resolveMonitorStartExecutionId(String executionId)
	{
		String id = removeEndString(executionId, StartString);
		id = removeEndString(id, EndString);
		
		return id.concat(StartString);
	}
*/
	public static String resolveMonitorEndExecutionId(String executionId)
	{
		String id = removeEndString(executionId, EndString);
		
		return id.concat(EndString);
	}

	
	public static  String resolveMonitorExecutionId(String executionId)
	{
		String id = removeEndString(executionId, EndString);
		return id;
	}
	
	private static String removeEndString(String str, String endStr) {
	    if (str.endsWith(endStr)) {
	        return str.substring(0, str.length() - endStr.length());
	    } else {
	        return str;
	    }
	}
}

