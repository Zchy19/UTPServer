package com.macrosoft.dao.impl;

import com.macrosoft.dao.ExecutionCheckPointDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.ExecutionCheckPoint;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public class ExecutionCheckPointDAOImpl implements ExecutionCheckPointDAO {


	private static final ILogger logger = LoggerFactory.Create(ExecutionCheckPointDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}


	@Override
	public void addExecutionCheckPoint(ExecutionCheckPoint executionCheckPoint) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(executionCheckPoint);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addExecutionCheckPoint", String.format("executionId:%s, id: %s", executionCheckPoint.getExecutionId(), executionCheckPoint.getId()));
	}

	@Override
	public void updateExecutionCheckPoint(ExecutionCheckPoint executionCheckPoint) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(executionCheckPoint);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "updateExecutionCheckPoint", String.format("executionId:%s, id: %s", executionCheckPoint.getExecutionId(), executionCheckPoint.getId()));

	}

	@Override
	public ExecutionCheckPoint getExecutionCheckPointByExecutionIdAndCheckPointName(String executionId, String checkPointName) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from executioncheckpoint where executionId=:executionId and checkPointName=:checkPointName");
		//根据id降序排序
		sqlBuilder.append(" order by id desc ");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("checkPointName", checkPointName);
		buildQueryCheckPointDAO(query);
		List<ExecutionCheckPoint> list = query.list();
		return list.size() > 0 ? list.get(0) : null;

	}

	@Override
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTime(long projectId, Date startTime, Date endTime){
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from executioncheckpoint where projectId=:projectId and startTime >= :startTime and startTime <= :endTime");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("startTime", startTime);
		query.setParameter("endTime", endTime);
		return buildQueryCheckPointDAO(query).list();
	}

	@Override
	public List<ExecutionCheckPoint> getExecutionCheckPointByExecutionId(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from executioncheckpoint where executionId = :executionId ");
		sqlBuilder.append("order by id desc "); // 按照id降序排序

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);

		List<ExecutionCheckPoint> list = buildQueryCheckPointDAO(query).list();
		return list;
	}

	@Override
	public List<ExecutionCheckPoint> getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from executioncheckpoint where projectId=:projectId and testsetId=:testsetId and startTime >= :startTime and startTime <= :endTime and result = 0");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);
		query.setParameter("startTime", startTime);
		query.setParameter("endTime", endTime);
		return buildQueryCheckPointDAO(query).list();
	}

	@Override
	public List<ExecutionCheckPoint> getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from executioncheckpoint where projectId=:projectId and testsetId=:testsetId and startTime >= :startTime and startTime <= :endTime and result = 1");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);
		query.setParameter("startTime", startTime);
		query.setParameter("endTime", endTime);
		return buildQueryCheckPointDAO(query).list();

	}

	@Override
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from executioncheckpoint where projectId=:projectId and testsetId=:testsetId and startTime >= :startTime and startTime <= :endTime");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);
		query.setParameter("startTime", startTime);
		query.setParameter("endTime", endTime);
		return buildQueryCheckPointDAO(query).list();
	}

	@Override
	public boolean updateManualDecisionLevel(Integer id, Integer level) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("update executioncheckpoint set manualDecisionLevel = :level where id = :id");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("level", level);
		query.setParameter("id", id);
		int result = query.executeUpdate();
		return result > 0;
	}

	private SQLQuery buildQueryCheckPointDAO(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionCheckPoint.class));
		query.addScalar("id", StandardBasicTypes.INTEGER);
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("checkPointName", StandardBasicTypes.STRING);
		query.addScalar("testCaseId", StandardBasicTypes.INTEGER);
		query.addScalar("result", StandardBasicTypes.INTEGER);
		query.addScalar("startTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("endTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("projectId", StandardBasicTypes.INTEGER);
		query.addScalar("testsetId", StandardBasicTypes.INTEGER);
		query.addScalar("executionResultStartId", StandardBasicTypes.LONG);
		query.addScalar("executionResultEndId", StandardBasicTypes.LONG);
		query.addScalar("manualDecisionLevel", StandardBasicTypes.INTEGER);
//		query.addScalar("executedByUserId", StandardBasicTypes.INTEGER);
		return query;
	}


}
