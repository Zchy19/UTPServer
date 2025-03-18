package com.macrosoft.controller.dto;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.composition.ScriptInfo;

public class ScriptGroupAndScriptFlatData {
	public List<ScriptGroup> scriptGroups;
	public List<ScriptInfo> scripts;

	public ScriptGroupAndScriptFlatData() {
		scriptGroups = new ArrayList<ScriptGroup>();
		scripts = new ArrayList<ScriptInfo>();
	}
}
