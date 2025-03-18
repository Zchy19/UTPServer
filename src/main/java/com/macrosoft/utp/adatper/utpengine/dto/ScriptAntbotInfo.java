package com.macrosoft.utp.adatper.utpengine.dto;

public class ScriptAntbotInfo
{
	private String antbotName;
	private String antbotType;
	
	public ScriptAntbotInfo(String antbotName, String agentType)
	{
		this.antbotName = antbotName;
		this.antbotType = agentType;
	}

	public String getAntbotName() {
		return antbotName;
	}

	public void setAntbotName(String antbotName) {
		this.antbotName = antbotName;
	}

	public String getAntbotType() {
		return antbotType;
	}

	public void setAntbotType(String antbotType) {
		this.antbotType = antbotType;
	}
}