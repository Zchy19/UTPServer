package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.RecorderDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Recorder;

@Repository
public class RecorderDAOImpl implements RecorderDAO {
	
	private static final ILogger logger = LoggerFactory.Create(RecorderDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}


	@Override
	public void addRecorder(Recorder recorder) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(recorder);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addRecorder", String.format("id: %s", recorder.getId()));
	}

	@Override
	public void updateRecorder(Recorder recorder) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(recorder);

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateRecorder", String.format("id: %s", recorder.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Recorder> listRecorders(String orgId, String rootType) {
		
		Session session = this.sessionFactory.getCurrentSession();
		List<Recorder> recorders = session.createQuery("from Recorder where orgId=:orgId and type=:type order by lastUpdatedTime desc")
				.setParameter("orgId", orgId)
				.setParameter("type", rootType)
				.list();
		
		return recorders;
	}

	@Override
	public Recorder getRecorderById(String id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		List<Recorder> recorders = session.createQuery("from Recorder where id=:id")
				.setParameter("id", id).list();
		
		if (recorders.isEmpty()) return null;
		
		return recorders.get(0);
	}

	@Override
	public void removeRecorder(String id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from Recorder where id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", id);
		query.executeUpdate();
		
		removeReferencedBigData(id);

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeRecorder", String.format("id: %s", id));
	}
	
	private void removeReferencedBigData(String rootId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from BigData where rootId=:rootId  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("rootId", rootId);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeReferencedBigData", String.format("rootId: %s", rootId));
	}

}
