package com.macrosoft.controller.dto;

import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptType;

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

	public static Script ConvertToScript(SubScriptInfo subscriptInfo) {
		Script script = new Script();
		script.setId(subscriptInfo.getId());
		script.setName(subscriptInfo.getName());
		script.setDescription(subscriptInfo.getDescription());
		script.setParentScriptGroupId(subscriptInfo.getParentScriptGroupId());
		script.setProjectId(subscriptInfo.getProjectId());
		script.setType(ScriptType.SubScriptType);
		script.setBlockyXml("");
		return script;
	}

	public static SubScript ConvertToSubScript(Script script) {
		SubScript subscript = new SubScript();
		subscript.setId(script.getId());
		subscript.setName(script.getName());
		subscript.setDescription(script.getDescription());
		subscript.setProjectId(script.getProjectId());
		subscript.setParameter(script.getParameter());
		subscript.setBlockyXml(script.getBlockyXml());
		subscript.setScript(script.getScript());
		subscript.setParentScriptGroupId(script.getParentScriptGroupId());
		return subscript;
	}

	public static Script ConvertToScript(SubScript subscript) {
		Script script = new Script();
		script.setId(subscript.getId());
		script.setName(subscript.getName());
		script.setType(ScriptType.SubScriptType);
		script.setDescription(subscript.getDescription());
		script.setParentScriptGroupId(subscript.getParentScriptGroupId());
		script.setProjectId(subscript.getProjectId());
		script.setParameter(subscript.getParameter());
		script.setBlockyXml(subscript.getBlockyXml());
		script.setScript(subscript.getScript());
		return script;
	}

}
