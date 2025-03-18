package com.macrosoft.dao.impl;

import java.util.List;


import com.macrosoft.dao.ScriptLinkDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.ScriptLink;

@Repository
public class ScriptLinkDAOImpl implements ScriptLinkDAO {
	
	private static final ILogger logger = LoggerFactory.Create(ScriptLinkDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addScriptLink(long projectId, ScriptLink scriptLink) {
		Session session = this.sessionFactory.getCurrentSession();
		scriptLink.setProjectId(projectId);
		session.saveOrUpdate(scriptLink);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptLink> listScriptLinks(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptLink> scriptLinks = session.createQuery("from ScriptLink where projectId =:projectId")
				.setParameter("projectId", projectId)
				.list();
		return scriptLinks;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptLink> listScriptLinksByScriptId(long projectId, long scriptId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptLink> scriptLinks = session.createQuery("from ScriptLink where projectId =:projectId and scriptId=:scriptId")
				.setParameter("projectId", projectId)
				.setParameter("scriptId", scriptId)				
				.list();
		return scriptLinks;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptLink> listScriptLinksByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptLink> scriptLinks = session.createQuery("from ScriptLink where projectId=:projectId")
				.setParameter("projectId", projectId)
				.list();
		return scriptLinks;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptLink> listScriptLinksByTestsetId(long projectId, long testsetId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptLink> scriptLinks = session.createQuery("from ScriptLink where projectId=:projectId and testsetId=:testsetId")
				.setParameter("projectId", projectId)				
				.setParameter("testsetId", testsetId)				
				.list();
		return scriptLinks;
	}

	@Override
	public ScriptLink getScriptLinkById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();		

		List<ScriptLink> scriptlinks = session.createQuery("from scriptlink where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id).list();			
		if (scriptlinks.size() == 0) return null;			
		return scriptlinks.get(0);
	}

	@Override
	public void removeScriptLink(long projectId, long id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from scriptlink where projectId=:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();
	}
	
	@Override
	public void removeScriptLinkByTestsetId(long projectId, long testsetId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from scriptlink where projectId=:projectId and testsetId=:testsetId  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeScriptLinkByTestsetId", String.format("projectId:%s, testsetId: %s", projectId, testsetId));
	}
	
	@Override
	public void removeScriptLinkByScriptId(long projectId, long scriptId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from scriptlink where projectId=:projectId and scriptId=:scriptId  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptId", scriptId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeScriptLinkByScriptId", String.format("projectId:%s, scriptId: %s", projectId, scriptId));
	}
	
}
