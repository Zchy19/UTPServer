package com.macrosoft.utp.adatper.utpengine.dto;

import java.util.List;

public class LiveAntbotDictionary
{
	private String targetObjectId;
	private List<LiveAntbotInfo> antbotInfos;
	
	public LiveAntbotDictionary(String targetObjectId, List<LiveAntbotInfo> agentInfos) {
		super();
		this.targetObjectId = targetObjectId;
		this.antbotInfos = agentInfos;
	}

	public String getTargetObjectId() {
		return targetObjectId;
	}
	public void setTargetObjectId(String targetObjectId) {
		this.targetObjectId = targetObjectId;
	}

	public List<LiveAntbotInfo> getAntbotInfos() {
		return antbotInfos;
	}

	public void setAntbotInfos(List<LiveAntbotInfo> antbotInfos) {
		this.antbotInfos = antbotInfos;
	}

	public String toString() {
		 String result = "";
		 result = String.format("targetObjectId: %s with %s live agent(s)", this.targetObjectId, this.antbotInfos.size());
		 for (LiveAntbotInfo agentInfo : this.antbotInfos)
		 {
			 result = result + "instance:" + agentInfo.antbotDescription;
		 }
		
		 return result;
		 
		}
}