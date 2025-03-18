package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.BigDataDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.BigData;

@Repository
public class BigDataDAOImpl implements BigDataDAO {

	private static final ILogger logger = LoggerFactory.Create(BigDataDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void addBigData(BigData bigdata) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(bigdata);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addBigData", String.format("id: %s", bigdata.getId()));
	}

	@Override
	public void updateBigData(BigData bigdata) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(bigdata);

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateBigData", String.format("id: %s", bigdata.getId()));
	}

	@Override
	public BigData getBigDataById(long id) {
		Session session = this.sessionFactory.getCurrentSession();
		BigData p = (BigData) session.load(BigData.class, new Long(id));

		return p;
	}

	@Override
	public BigData getBigData(String rootId, String referenceId) {
		Session session = this.sessionFactory.getCurrentSession();

		List<BigData> bigDatas = session
				.createQuery("from BigData where rootId = :rootId and referenceId = :referenceId")
				.setParameter("rootId", rootId).setParameter("referenceId", referenceId).list();

		if (bigDatas.size() == 0)
			return null;
		return bigDatas.get(0);
	}

	@Override
	public List<BigData> getBigDataByRootId(String rootId) {
		Session session = this.sessionFactory.getCurrentSession();

		List<BigData> bigDatas = session.createQuery("from BigData where rootId = :rootId")
				.setParameter("rootId", rootId).list();
		return bigDatas;
	}

	@Override
	public void removeBigData(long id) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from bigdata where id=:id  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeBigData", String.format("id: %s", id));
	}

	@Override
	public void removeBigDataByRootId(String rootId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from bigdata where rootId=:rootId  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("rootId", rootId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeBigDataByRootId", String.format("rootId: %s", rootId));
	}
}
