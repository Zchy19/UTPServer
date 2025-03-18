package com.macrosoft.model;

import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotInfo;

public class SelectAntbotWraper
{
	private LiveAntbotInfo liveAntbotInfo;
	private String scriptAntbotName;
	
	public LiveAntbotInfo getLiveAntbotInfo() {
		return liveAntbotInfo;
	}
	public void setLiveAntbotInfo(LiveAntbotInfo liveAntbotInfo) {
		this.liveAntbotInfo = liveAntbotInfo;
	}
	public String getScriptAntbotName() {
		return scriptAntbotName;
	}
	public void setScriptAntbotName(String scriptAntbotName) {
		this.scriptAntbotName = scriptAntbotName;
	}
}

