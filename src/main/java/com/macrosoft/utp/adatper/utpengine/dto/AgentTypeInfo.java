package com.macrosoft.utp.adatper.utpengine.dto;

public class AgentTypeInfo
{
	private String name;
	private CommandInfo[] command;
	private String[] notifyIds;


	public AgentTypeInfo(String name, CommandInfo[] command)
	{
		this(name, command, new String[]{});
	}
	
	public AgentTypeInfo(String name, CommandInfo[] command, String[] notifyIds)
	{
		setName(name);
		setCommand(command);
		setNotifyIds(notifyIds);
	}
	
	public String getName()
	{
		return name;
	}
	
	public void setName(String name)
	{
		this.name = name;
	}

	public CommandInfo[] getCommands()
	{
		return command;
	}
	
	public void setCommand(CommandInfo[] command)
	{
		this.command = command;
	}

	public String[] getNotifyIds()
	{
		return notifyIds;
	}
	
	public void setNotifyIds(String[] notifyIds)
	{
		this.notifyIds = notifyIds;
	}
}