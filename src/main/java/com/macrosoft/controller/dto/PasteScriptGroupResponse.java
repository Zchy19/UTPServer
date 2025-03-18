package com.macrosoft.controller.dto;

import com.macrosoft.model.ScriptGroup;

public class PasteScriptGroupResponse {

	private String state;
	private ScriptGroup scriptGroup;

	public final static String State_Success = "Success";
	public final static String State_FailedByDestinationIsSubfolder = "FailedByDestinationIsSubfolder";
	public final static String State_FailedByUnknowError = "FailedByUnknowError";
	public final static String State_OverMaxScriptNum = "OVER_MAX_SCRIPT_NUM";
	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public ScriptGroup getScriptGroup() {
		return scriptGroup;
	}

	public void setScriptGroup(ScriptGroup scriptGroup) {
		this.scriptGroup = scriptGroup;
	}
}
