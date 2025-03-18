package com.macrosoft.utp.adatper.utpengine.dto;

public class DomainInfo
{
	private String name;
	private String password;
	
	public DomainInfo(String name, String password)
	{
		setName(name);
		setPassword(password);
	}
	
	public String getName()
	{
		return name;
	}
	
	public void setName(String name)
	{
		this.name = name;
	}

	public String getPassword()
	{
		return password;
	}
	
	public void setPassword(String password)
	{
		this.password = password;
	}
}