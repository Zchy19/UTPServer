package com.macrosoft.utp.adatper.utpengine.dto;

public class NotifyHandlerInfo
{
	private String notifyId;
	private String scriptId;

	public NotifyHandlerInfo(String notifyId, String scriptId)
	{
		setNotifyId(notifyId);
		setScriptId(scriptId);
	}
	
	public String getNotifyId()
	{
		return notifyId;
	}
	
	public void setNotifyId(String notifyId)
	{
		this.notifyId = notifyId;
	}

	public String getScriptId()
	{
		return scriptId;
	}
	
	public void setScriptId(String scriptId)
	{
		this.scriptId = scriptId;
	}
}