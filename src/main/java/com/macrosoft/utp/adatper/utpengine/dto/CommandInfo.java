package com.macrosoft.utp.adatper.utpengine.dto;

public class CommandInfo
{
	private String name;
	private String[] params;
	private String timeout;

	public CommandInfo(String name, String[] params, String timeout)
	{
		setName(name);
		setParams(params);
		setTimeout(timeout);
	}
	
	public String getName()
	{
		return name;
	}
	
	public void setName(String name)
	{
		this.name = name;
	}

	public String[] getParams()
	{
		return params;
	}
	
	public void setParams(String[] params)
	{
		this.params = params;
	}

	public String getTimeout()
	{
		return timeout;
	}
	
	public void setTimeout(String timeout)
	{
		this.timeout = timeout;
	}
}