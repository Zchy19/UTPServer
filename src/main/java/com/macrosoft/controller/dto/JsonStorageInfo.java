package com.macrosoft.controller.dto;

import org.json.simple.JSONObject;

public class JsonStorageInfo {

	private String id;
	private String type;
	private JSONObject jsonData;
	
	public JsonStorageInfo() {
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public JSONObject getJsonData() {
		return jsonData;
	}

	public void setJsonData(JSONObject jsonData) {
		this.jsonData = jsonData;
	}
}
