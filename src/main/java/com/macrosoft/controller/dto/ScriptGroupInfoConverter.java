package com.macrosoft.controller.dto;

import com.macrosoft.model.ScriptGroup;

public class ScriptGroupInfoConverter
{
	public static ScriptGroupInfo ConvertToScriptGroupInfo(ScriptGroup scriptGroup)
	{
		ScriptGroupInfo scriptGroupInfo = new ScriptGroupInfo();
		scriptGroupInfo.setId(scriptGroup.getId());
		scriptGroupInfo.setName(scriptGroup.getName());
		scriptGroupInfo.setDescription(scriptGroup.getDescription());
		scriptGroupInfo.setProjectId(scriptGroup.getProjectId());
		return scriptGroupInfo;
	}
}
