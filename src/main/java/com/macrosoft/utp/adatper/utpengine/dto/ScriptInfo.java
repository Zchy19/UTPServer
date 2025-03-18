package com.macrosoft.utp.adatper.utpengine.dto;

public class ScriptInfo
{
	private String id;
	private String[] commands;
	private boolean isTestcase;
	
	public ScriptInfo(String id, String[] commands, boolean isTestcase)
	{
		setId(id);
		setCommands(commands);
		setIsTestcase(isTestcase);
	}
	
	public String getId()
	{
		return id;
	}
	
	public boolean getIsTestcase() {
		return isTestcase;
	}

	public void setIsTestcase(boolean isTestcase) {
		this.isTestcase = isTestcase;
	}

	public void setId(String id)
	{
		this.id = id;
	}

	public String[] getCommands()
	{
		return commands;
	}
	
	public void setCommands(String[] commands)
	{
		this.commands = commands;
	}
}