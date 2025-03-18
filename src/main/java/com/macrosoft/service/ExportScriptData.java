package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.Requirement;
import com.macrosoft.model.Script;

public class ExportScriptData {

	private Script script;
	private List<Requirement> refRequirements;
	private List<ExportExecutionParsedResult> parsedCommands;
	public Script getScript() {
		return script;
	}
	public void setScript(Script script) {
		this.script = script;
	}
	public List<Requirement> getRefRequirements() {
		return refRequirements;
	}
	public void setRefRequirements(List<Requirement> refRequirements) {
		this.refRequirements = refRequirements;
	}
	public List<ExportExecutionParsedResult> getParsedCommands() {
		return parsedCommands;
	}
	public void setParsedCommands(List<ExportExecutionParsedResult> parsedCommands) {
		this.parsedCommands = parsedCommands;
	}
}
