package com.macrosoft.dao.impl;

import java.util.List;


import com.macrosoft.dao.SubscriptReferenceDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.SubscriptReference;

@Repository
public class SubscriptReferenceDAOImpl implements SubscriptReferenceDAO {
	
	private static final ILogger logger = LoggerFactory.Create(SubscriptReferenceDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addSubscriptReference(long projectId, SubscriptReference subscriptReference) {
		
		Session session = this.sessionFactory.getCurrentSession();
		subscriptReference.setProjectId(projectId);
		session.saveOrUpdate(subscriptReference);
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addSubscriptReference", String.format("projectId:%s, id: %s", projectId, subscriptReference.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<SubscriptReference> listSubscriptReferencesByParentScriptId(long projectId, long parentScriptId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<SubscriptReference> subscriptReferences = session.createQuery("from SubscriptReference where projectId =:projectId and parentScriptId=:parentScriptId")
				.setParameter("parentScriptId", parentScriptId)
				.setParameter("projectId", projectId).list();
		return subscriptReferences;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<SubscriptReference> listSubscriptReferencesBySubscriptId(long projectId, long subscriptId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<SubscriptReference> subscriptReferences = session.createQuery("from SubscriptReference where  projectId =:projectId and subscriptId=:subscriptId")
				.setParameter("subscriptId", subscriptId)
				.setParameter("projectId", projectId).list();
		return subscriptReferences;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<SubscriptReference> listSubscriptReferencesByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<SubscriptReference> subscriptReferences = session.createQuery("from SubscriptReference where  projectId =:projectId ")
				.setParameter("projectId", projectId).list();
		return subscriptReferences;
	}


	@Override
	public void removeSubscriptReference(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from SubscriptReference where projectId = :projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeSubscriptReference", String.format("projectId:%s, id: %s", projectId, id));
	}

	@Override
	public void removeSubscriptReferenceByScriptId(long projectId, long scriptId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from SubscriptReference where projectId = :projectId and parentScriptId=:scriptId  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptId", scriptId);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeSubscriptReferenceByScriptId", String.format("projectId:%s, scriptId: %s", projectId, scriptId));
	}

	@Override
	public void removeSubscriptReferenceBySubScriptId(long projectId, long subscriptId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from SubscriptReference where projectId = :projectId and subscriptId=:subscriptId  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("subscriptId", subscriptId);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeSubscriptReferenceBySubScriptId", String.format("projectId:%s, subscriptId: %s", projectId, subscriptId));
	}
}
