package com.macrosoft.controller.dto;

public class SubScript {
	
	private long id;
	private long projectId;
	private String name;
	private String description;
	private String parameter;
	private long parentScriptGroupId;
	private String customizedId; 
	private String script;
	
	private String blockyXml;

	public SubScript() {}
	
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getParentScriptGroupId() {
		return parentScriptGroupId;
	}


	public void setParentScriptGroupId(long parentScriptGroupId) {
		this.parentScriptGroupId = parentScriptGroupId;
	}


	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public String getCustomizedId() {
		return customizedId;
	}


	public void setCustomizedId(String customizedId) {
		this.customizedId = customizedId;
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


	public String getScript() {
		return script;
	}


	public void setScript(String script) {
		this.script = script;
	}


	public String getBlockyXml() {
		return blockyXml;
	}


	public void setBlockyXml(String blockyXml) {
		this.blockyXml = blockyXml;
	}


	public String getParameter() {
		return parameter;
	}


	public void setParameter(String parameter) {
		this.parameter = parameter;
	}

	
}

