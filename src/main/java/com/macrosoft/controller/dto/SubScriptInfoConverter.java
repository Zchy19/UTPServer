package com.macrosoft.controller.dto;

import com.macrosoft.model.Script;

public class SubScriptInfoConverter {
	public static SubScriptInfo ConvertToSubScriptInfo(Script script) {
		SubScriptInfo scriptInfo = new SubScriptInfo();
		scriptInfo.setId(script.getId());
		scriptInfo.setName(script.getName());
		scriptInfo.setDescription(script.getDescription());
		scriptInfo.setProjectId(script.getProjectId());
		scriptInfo.setParameter(script.getParameter());
		scriptInfo.setParentScriptGroupId(script.getParentScriptGroupId());

		if (script.getScript() == null || script.getScript().length() == 0) {
			scriptInfo.setIsEmpty(true);
		}

		return scriptInfo;
	}

}
