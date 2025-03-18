package com.macrosoft.dao.impl;

import com.macrosoft.dao.DbUtilsDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

@Repository
public class DbUtilsDAOImpl implements DbUtilsDAO {

	private static final ILogger logger = LoggerFactory.Create(DbUtilsDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void truncateDatabase() {
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery query = session.createSQLQuery("CALL cleanDatabase()");
		query.executeUpdate();
		logger.info("Clean database successfully.");
	}
}
