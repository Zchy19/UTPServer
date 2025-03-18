package com.macrosoft.model.composition;


public class ScriptInfo {
	
	private long id;
	private long projectId;
	private String name;
	private String description;
	private long parentScriptGroupId;
	private String parameter;
	private String type;
	private boolean isEmpty;
	private String errorMessages;
	private String declaredAntbots;
	private String rwattribute;

	public String getRwattribute() {
		return rwattribute;
	}

	public String getDeclaredAntbots() {
		return declaredAntbots;
	}

	public void setDeclaredAntbots(String declaredAntbots) {
		this.declaredAntbots = declaredAntbots;
	}

	public void setRwattribute(String rwattribute) {
		this.rwattribute = rwattribute;
	}

	public String getErrorMessages() {
		return errorMessages;
	}

	public void setErrorMessages(String errorMessages) {
		this.errorMessages = errorMessages;
	}

	public ScriptInfo() {}
	
	
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
	public long getParentScriptGroupId() {
		return parentScriptGroupId;
	}

	public void setParentScriptGroupId(long parentScriptGroupId) {
		this.parentScriptGroupId = parentScriptGroupId;
	}
	
	public String getParameter() {
		return parameter;
	}


	public void setParameter(String parameter) {
		this.parameter = parameter;
	}


	public String getType() {
		return type;
	}


	public void setType(String type) {
		this.type = type;
	}


	public boolean getIsEmpty() {
		return isEmpty;
	}

	public void setIsEmpty(boolean isEmpty) {
		this.isEmpty = isEmpty;
	}


}

