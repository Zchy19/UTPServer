package com.macrosoft.controller.dto;

import java.util.ArrayList;
import java.util.List;

public class ProjectScriptGroupsData {
	
	private List<ScriptGroupInfo> scriptgroups = new ArrayList<ScriptGroupInfo>();

	public ProjectScriptGroupsData() {}
	
	public List<ScriptGroupInfo> getScriptgroups() {
		return scriptgroups;
	}

	public void setScriptgroups(List<ScriptGroupInfo> scriptgroups) {
		this.scriptgroups = scriptgroups;
	}
}

