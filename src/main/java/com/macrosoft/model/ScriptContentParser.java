package com.macrosoft.model;

public class ScriptContentParser {
	public final static String ScriptLineSeparator = "óò";
	public final static String CommandSeparator = "```";
	public final static String SUBSCRIPT_Command = "CALL_SCRIPT";
	public final static String GET_SCRIPT_CONTENT_Command = "GET_SCRIPT_CONTENT";
	
	public final static String TESTCASE_BEGIN = "TESTCASE_BEGIN";
	public final static String TESTCASE_END = "TESTCASE_END";
	
	
	public static String[] getCommands(String scriptContent)
	{
		String[] commands = scriptContent.split(ScriptContentParser.ScriptLineSeparator);
		return commands;
	}
}
