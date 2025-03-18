package com.macrosoft.model.composition;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.model.composition.ScriptInfo;

public class TestsetData {
	private long id;
	private long projectId;
	private String name;
	private String description;
	private String engineName;
	private Integer activate;

	public Integer getActivate() {
		return activate;
	}

	public void setActivate(Integer activate) {
		this.activate = activate;
	}

	public String getEngineName() {
		return engineName;
	}

	public void setEngineName(String engineName) {
		this.engineName = engineName;
	}

	private List<ScriptInfo> scripts = new ArrayList<ScriptInfo>();
	
	public List<ScriptInfo> getScripts() {
		return scripts;
	}

	public void setScripts(List<ScriptInfo> scripts) {
		this.scripts = scripts;
	}

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
}
