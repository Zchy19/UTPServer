package com.macrosoft.controller.dto;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.model.composition.ScriptInfo;


public class ScriptGroupInfo {
	
	private long id;
	private long projectId;
	private String name;
	private String description;
	private List<ScriptGroupInfo> scriptgroups = new ArrayList<ScriptGroupInfo>();
	private List<ScriptInfo> scripts = new ArrayList<ScriptInfo>();
	private List<ScriptInfo> subscripts = new ArrayList<ScriptInfo>();

	public ScriptGroupInfo() {}
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<ScriptInfo> getScripts() {
		return scripts;
	}

	public void setScripts(List<ScriptInfo> scripts) {
		this.scripts = scripts;
	}
	
	public List<ScriptGroupInfo> getScriptgroups() {
		return scriptgroups;
	}

	public void setScriptgroups(List<ScriptGroupInfo> scriptgroups) {
		this.scriptgroups = scriptgroups;
	}

	public List<ScriptInfo> getSubscripts() {
		return subscripts;
	}

	public void setSubscripts(List<ScriptInfo> subscripts) {
		this.subscripts = subscripts;
	}
	
	
}

