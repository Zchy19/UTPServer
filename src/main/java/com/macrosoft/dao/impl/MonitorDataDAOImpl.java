package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.MonitorDataDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MonitorData;

@Repository
public class MonitorDataDAOImpl implements MonitorDataDAO {

	private static final ILogger logger = LoggerFactory.Create(MonitorDataDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void addMonitorData(MonitorData monitorData) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(monitorData);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addMonitorData", String.format("id: %s", monitorData.getId()));
	}

	@Override
	public List<MonitorData> getMonitorDataByExecutionId(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();

		List<MonitorData> monitorDatas = session.createQuery("from MonitorData where executionId = :executionId")
				.setParameter("executionId", executionId).list();
		return monitorDatas;
	}

	@Override
	public List<MonitorData> getMonitorDatasAfterFromId(String executionId, long beginId) {
		
		logger.debug(String.format("trace performance : getExecutionResultInfosAfterFromId begin..., executionId: %s", executionId));
		
		Session session = this.sessionFactory.getCurrentSession();
		List<MonitorData> monitorDatas = session.createQuery("from MonitorData where executionId = :executionId and id > " + beginId)
				.setParameter("executionId", executionId).list();

		logger.debug("trace performance : getExecutionResultInfosAfterFromId end...");

		return monitorDatas;
	}

	@Override
	public void removeMonitorDataByExecutionId(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" delete from MonitorData where executionId=:executionId  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeMonitorDataByExecutionId", String.format("executionId: %s", executionId));
	}
}
