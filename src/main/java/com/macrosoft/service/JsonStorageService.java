package com.macrosoft.service;

import com.macrosoft.model.JsonStorage;

public interface JsonStorageService {
	
	public void addJsonStorage(JsonStorage jsonStorage);
	public void removeJsonStorage(String id);
	public JsonStorage getJsonStorage(String id);
}
