package com.macrosoft.dao.impl;

import java.util.List;


import com.macrosoft.dao.JsonStorageDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.JsonStorage;

@Repository
public class JsonStorageDAOImpl implements JsonStorageDAO {
	
	private static final ILogger logger = LoggerFactory.Create(JsonStorageDAOImpl.class.getName());
	
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addJsonStorage(JsonStorage jsonStorage) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(jsonStorage);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addJsonStorage", String.format("id: %s", jsonStorage.getId()));
	}

	@Override
	public void removeJsonStorage(String id) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from JsonStorage where id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", id);
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeJsonStorage", String.format("id: %s", id));
	}

	@Override
	public JsonStorage getJsonStorage(String id) {
		Session session = this.sessionFactory.getCurrentSession();		
		List<JsonStorage> jsonStorages = session.createQuery("from JsonStorage where id=:id")
				.setParameter("id", id).
				list();
		if (jsonStorages.size() == 0) return null;
		return jsonStorages.get(0);
		
	}	
}
