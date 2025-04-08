package com.macrosoft.dao.impl;

import com.macrosoft.dao.MonitoringTestSetDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MonitoringTestSet;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MonitoringTestSetDAOImpl implements MonitoringTestSetDAO {

	private static final ILogger logger = LoggerFactory.Create(MonitoringTestSetDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addMonitoringTestSet(long projectId, MonitoringTestSet monitoringTestSet) {
		Session session = this.sessionFactory.getCurrentSession();
		monitoringTestSet.setProjectId(projectId);
		session.saveOrUpdate(monitoringTestSet);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addMonitoringTestSet", String.format("projectId:%s, id: %s", projectId, monitoringTestSet.getId()));
	}

	@Override
	public void updateMonitoringTestSet(long projectId, MonitoringTestSet monitoringTestSet) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" update MonitoringTestSet set Name =:name, Description =:description, ");
		sqlBuilder.append(" startScriptId =:startScriptId, sendCommandScriptId =:sendCommandScriptId, stopScriptId =:stopScriptId, type =:type, antBot =:antBot ");
		sqlBuilder.append(" where projectId =:projectId and id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", monitoringTestSet.getId());
		query.setParameter("projectId", monitoringTestSet.getProjectId());
		query.setParameter("name", monitoringTestSet.getName());
		query.setParameter("description", monitoringTestSet.getDescription());
		query.setParameter("startScriptId", monitoringTestSet.getStartScriptId());
		query.setParameter("sendCommandScriptId", monitoringTestSet.getSendCommandScriptId());
		query.setParameter("stopScriptId", monitoringTestSet.getStopScriptId());
		query.setParameter("type", monitoringTestSet.getType());
		query.setParameter("antBot", monitoringTestSet.getAntBot());
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateMonitoringTestSet", String.format("projectId:%s, id: %s", projectId, monitoringTestSet.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<MonitoringTestSet> listMonitoringTestSetsByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from MonitoringTestSet ");
		sqlBuilder.append(" where projectId = :projectId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(MonitoringTestSet.class);
		query.setParameter("projectId", projectId);

		List<MonitoringTestSet> list = query.list();
		return list;
	}

	@Override
	public MonitoringTestSet getMonitoringTestSetById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		List<MonitoringTestSet> list = session.createQuery("from MonitoringTestSet where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id)
				.list();
		if (list.size() == 0) return null;
		return list.get(0);
	}

	@Override
	public void removeMonitoringTestSet(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from MonitoringTestSet where projectId =:projectId and id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeMonitoringTestSet", String.format("projectId:%s, id: %s", projectId, id));
	}
}