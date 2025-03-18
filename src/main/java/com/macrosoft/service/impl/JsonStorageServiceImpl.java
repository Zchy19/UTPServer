package com.macrosoft.service.impl;

import com.macrosoft.service.JsonStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.JsonStorageDAO;
import com.macrosoft.model.JsonStorage;

@Service
public class JsonStorageServiceImpl implements JsonStorageService {
	
	private JsonStorageDAO JsonStorageDAO;
	@Autowired
	public void setJsonStorageDAO(JsonStorageDAO JsonStorageDAO) {
		this.JsonStorageDAO = JsonStorageDAO;
	}

	@Override
	@Transactional
	public JsonStorage getJsonStorage(String id)
	{
		return this.JsonStorageDAO.getJsonStorage(id);
	}
	
	@Override
	@Transactional
	public void addJsonStorage(JsonStorage jsonStorage) {
		this.JsonStorageDAO.addJsonStorage(jsonStorage);
	}

	@Override
	@Transactional
	public void removeJsonStorage(String id) {
		this.JsonStorageDAO.removeJsonStorage(id);
	}
}
