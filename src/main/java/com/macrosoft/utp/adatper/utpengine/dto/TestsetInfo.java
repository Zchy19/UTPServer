package com.macrosoft.utp.adatper.utpengine.dto;

import java.util.ArrayList;
import java.util.List;

public class TestsetInfo
{
	private String id;
	private List<ScriptInfo> scriptInfos = new ArrayList<ScriptInfo>();
	
	public TestsetInfo(String id)
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

	public List<ScriptInfo> getScriptInfos()
	{
		return scriptInfos;
	}
	
	public void addScriptInfo(ScriptInfo scriptInfo)
	{
		this.scriptInfos.add(scriptInfo);
	}
	
	
}