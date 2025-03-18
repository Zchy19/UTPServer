package com.macrosoft.utp.adatper.utpengine.dto;

import java.util.ArrayList;
import java.util.List;

public class ScriptGroupInfo
{
	private String id;
	private List<String> commands = new ArrayList<String>();
	private List<ScriptInfo> scriptInfos = new ArrayList<ScriptInfo>();
	
	public ScriptGroupInfo(String id)
	{
		setId(id);
	}
	
	public String getId()
	{
		return id;
	}
	
	public void setId(String id)
	{
		this.id = id;
	}

	public List<String> getCommands()
	{
		return commands;
	}
	
	public void addCommand(String command)
	{
		this.commands.add(command);
	}

	public List<ScriptInfo> getScriptInfos()
	{
		return scriptInfos;
	}
	
	public void addScriptInfo(ScriptInfo scriptInfo)
	{
		this.scriptInfos.add(scriptInfo);
	}
	
	
}