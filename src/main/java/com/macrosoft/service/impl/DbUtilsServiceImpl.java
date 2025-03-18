package com.macrosoft.service.impl;

import com.macrosoft.service.DbUtilsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.DbUtilsDAO;

@Service
public class DbUtilsServiceImpl implements DbUtilsService {
	
	private DbUtilsDAO DbUtilsDAO;

	@Autowired
	public void setDbUtilsDAO(DbUtilsDAO DbUtilsDAO) {
		this.DbUtilsDAO = DbUtilsDAO;
	}
	
	@Override
	@Transactional
	public void CleanDatabase() {
		DbUtilsDAO.truncateDatabase();
	}
}
