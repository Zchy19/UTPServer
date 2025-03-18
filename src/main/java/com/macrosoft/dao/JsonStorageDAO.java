package com.macrosoft.dao;

import com.macrosoft.model.JsonStorage;

public interface JsonStorageDAO {
	public void addJsonStorage(JsonStorage jsonStorage);
	public void removeJsonStorage(String id);
	public JsonStorage getJsonStorage(String id);
}
