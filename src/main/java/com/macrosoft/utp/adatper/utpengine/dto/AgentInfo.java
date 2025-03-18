package com.macrosoft.utp.adatper.utpengine.dto;

public class AgentInfo
{
	private String type;
	private String name;
	private String recordsetId;
	private String recordsetName;
	private String protocolSignalId;
	private NotifyHandlerInfo[] notifyHandlers;
	

	public AgentInfo(String type, String name, String recordsetId, String recordsetName, String protocolSignalId)
	{
		this(type, name, recordsetId, recordsetName, protocolSignalId, new NotifyHandlerInfo[] {});
	}

	public AgentInfo(String type, String name, String recordsetId, String recordsetName, String protocolSignalId, NotifyHandlerInfo[] notifyHandlers)
	{
		setType(type);
		setName(name);
		setRecordsetId(recordsetId);
		setRecordsetName(recordsetName);
		if (protocolSignalId == null)
		{
			protocolSignalId ="";
		}
		setProtocolSignalId(protocolSignalId);
		setNotifyHandlers(notifyHandlers);
	}

	public String getRecordsetId() {
		return recordsetId;
	}

	public void setRecordsetId(String recordsetId) {
		this.recordsetId = recordsetId;
	}

	public String getRecordsetName() {
		return recordsetName;
	}

	public String getProtocolSignalId() {
		return protocolSignalId;
	}

	public void setProtocolSignalId(String protocolSignalId) {
		this.protocolSignalId = protocolSignalId;
	}

	public void setRecordsetName(String recordsetName) {
		this.recordsetName = recordsetName;
	}

	public String getType()
	{
		return type;
	}
	
	public void setType(String type)
	{
		this.type = type;
	}
	
	public String getName()
	{
		return name;
	}
	
	public void setName(String name)
	{
		this.name = name;
	}
	
	public boolean HasNotifyHandler()
	{
		return getNotifyHandlers().length > 0;
	}

	public NotifyHandlerInfo[] getNotifyHandlers()
	{
		return notifyHandlers;
	}
	
	public void setNotifyHandlers(NotifyHandlerInfo[] notifyHandlers)
	{
		this.notifyHandlers = notifyHandlers;
	}
}