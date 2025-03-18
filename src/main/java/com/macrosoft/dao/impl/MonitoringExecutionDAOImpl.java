package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.MonitoringExecutionDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MonitoringExecution;
import com.macrosoft.model.MonitoringExecutionDetail;

@Repository
public class MonitoringExecutionDAOImpl implements MonitoringExecutionDAO {
	
	private static final ILogger logger = LoggerFactory.Create(TestSetDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addMonitoringExecution(MonitoringExecution monitoringExecution) {

		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(monitoringExecution);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addMonitoringExecution", String.format("executionId:%s, id: %s", monitoringExecution.getExecutionId(), monitoringExecution.getId()));
	}


	
	@Override
	public void updateMonitoringExecutionStatus(String executionId, String status) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update MonitoringExecution set ExecutionStatus =:status  ");
		sqlBuilder.append("  where executionId =:executionId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("status", status);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateMonitoringExecutionStatus", String.format("executionId:%s", executionId));
	}

	
	@Override
	public void updateMonitoringExecution(MonitoringExecution monitoringExecution) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update MonitoringExecution  set StartTime =:startTime, StopTime =:stopTime  ");
		sqlBuilder.append("  where executionId =:executionId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", monitoringExecution.getExecutionId());
		query.setParameter("startTime", monitoringExecution.getStartTime());
		query.setParameter("stopTime", monitoringExecution.getStopTime());
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateMonitoringExecution", String.format("executionId:%s", monitoringExecution.getExecutionId()));
	}

	
	@Override
	public MonitoringExecution getMonitoringExecutionById(String executionId) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from MonitoringExecution ");
		sqlBuilder.append(" where executionId = :executionId ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(MonitoringExecution.class);
		query.setParameter("executionId", executionId);
		
		List<MonitoringExecution> list = query.list();
		if (list.isEmpty()) return null;
		
		return list.get(0);
	}

	@Override
	public void removeMonitoringExecution(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from MonitoringExecution where executionId =:executionId ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.executeUpdate();

		sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from MonitoringExecutionDetail where executionId =:executionId ");
		
		query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeMonitoringExecution", String.format("executionId:%s", executionId));
	}
 

	@Override
	public void addMonitoringExecutionDetail(MonitoringExecutionDetail monitoringExecutionDetail) {

		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(monitoringExecutionDetail);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addMonitoringExecutionDetail", String.format("executionId:%s, id: %s", monitoringExecutionDetail.getExecutionId(), monitoringExecutionDetail.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<MonitoringExecutionDetail> listMonitoringExecutionDetails(String executionId, String monitorDataName, long resultIdAsStartPoint) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from MonitoringExecutionDetail ");
		sqlBuilder.append(" where executionId = :executionId ");
		sqlBuilder.append(" and monitorDataName = :monitorDataName and id > " + resultIdAsStartPoint);
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(MonitoringExecutionDetail.class);
		query.setParameter("executionId", executionId);
		query.setParameter("monitorDataName", monitorDataName);
		
		List<MonitoringExecutionDetail> list = query.list();
		return list;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<MonitoringExecutionDetail> listMonitoringExecutionDetails(String executionId, long resultIdAsStartPoint) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from MonitoringExecutionDetail ");
		sqlBuilder.append(" where executionId = :executionId ");
		sqlBuilder.append(" and  id > " + resultIdAsStartPoint);
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(MonitoringExecutionDetail.class);
		query.setParameter("executionId", executionId);
		
		List<MonitoringExecutionDetail> list = query.list();
		return list;
	}

	@Override
	public List<MonitoringExecution> getMonitoringExecutionDataByTestSetId(long testSetId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from MonitoringExecution ");
		sqlBuilder.append(" where MonitoringTestSetId = :testSetId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.addEntity(MonitoringExecution.class);
		query.setParameter("testSetId", testSetId);

		List<MonitoringExecution> list = query.list();
		if (list.isEmpty()) return null;

		return list;
	}


}
