package com.macrosoft.utp.adatper.utpengine.dto;


public class LiveAntbotInfo
{
	public String antbotId;
	public String antbotName;
	public String antbotType;
	public String antbotDescription;

	public LiveAntbotInfo(String antbotId, String antbotName,String antbotType, String antbotDescription) {
		this.antbotId = antbotId;
		this.antbotName = antbotName;
		this.antbotType = antbotType;
		this.antbotDescription = antbotDescription;
	}

	public String getAntbotId() {
		return antbotId;
	}

	public void setAntbotId(String antbotId) {
		this.antbotId = antbotId;
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

	public String getAntbotDescription() {
		return antbotDescription;
	}

	public void setAntbotDescription(String antbotDescription) {
		this.antbotDescription = antbotDescription;
	}
	
	
}