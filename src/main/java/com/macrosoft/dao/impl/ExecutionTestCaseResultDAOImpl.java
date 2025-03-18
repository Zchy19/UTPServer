package com.macrosoft.dao.impl;

import java.util.Date;
import java.util.List;

import com.macrosoft.dao.ExecutionTestCaseResultDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.composition.ExecutionRequirementTraceInfo;

@Repository
public class ExecutionTestCaseResultDAOImpl implements ExecutionTestCaseResultDAO {

	private static final ILogger logger = LoggerFactory.Create(ExecutionTestCaseResultDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void addExecutionTestCaseResult(ExecutionTestCaseResult executionTestCaseResult) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(executionTestCaseResult);
	}

	@Override
	public void updateExecutionTestCaseResult(ExecutionTestCaseResult executionTestCaseResult) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(executionTestCaseResult);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from executiontestcaseresult r ");
		sqlBuilder.append(" where r.executionId = :executionId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);

		buildQueryExecutionTestCaseResult(query);

		List<ExecutionTestCaseResult> executionTestResultList = query.list();
		return executionTestResultList;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionTestCaseResult> listFinishedExecutionTestCaseResults(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from executiontestcaseresult r ");
		sqlBuilder.append(" where r.executionId = :executionId and result>=0 ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);

		buildQueryExecutionTestCaseResult(query);

		List<ExecutionTestCaseResult> executionTestResultList = query.list();
		return executionTestResultList;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(long projectId, boolean includeDummyRun) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from executiontestcaseresult r ");
		sqlBuilder.append(" where r.scriptid in ( select s.id from script s where s.projectid = :projectId) ");
		sqlBuilder.append("  and r.executionid in ( select executionid from executionstatus st where st.projectid = :projectId and st.testsetid > 0  ");

		if (!includeDummyRun)
		{
			sqlBuilder.append(" and isDummyRun=0 ");
		}
		
		sqlBuilder.append("  ) ");

		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		buildQueryExecutionTestCaseResult(query);

		List<ExecutionTestCaseResult> executionTestResultList = query.list();
		return executionTestResultList;
	}


	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionRequirementTraceInfo> listExecutionRequirementTraceInfos(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from traceexecutionrequirement t ");
		sqlBuilder.append(" where t.executionId = :executionId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);

		buildQueryExecutionRequirementTraceInfo(query);

		return query.list();
	}




	@Override
	public ExecutionTestCaseResult getExecutionTestCaseResultById(long id) {

		Session session = this.sessionFactory.getCurrentSession();
		List<ExecutionTestCaseResult> testCaseResults = session.createQuery("from ExecutionTestCaseResult where id=:id").setParameter("id", id).list();

		if (testCaseResults.size() == 0) return null;
		return testCaseResults.get(0);
	}

	@Override
	public void updateExecutionTestCaseResult(String executionId, long scriptId, int testResult) {
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session
				.createSQLQuery("CALL sp_execution_onTestCaseExecuted(:executionId,:scriptId,:testResult)");
		sqlQuery.setParameter("executionId", executionId);
		sqlQuery.setParameter("scriptId", scriptId);
		sqlQuery.setParameter("testResult", testResult);
		sqlQuery.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateExecutionTestCaseResult", String.format("executionId: %s", executionId));
	}

	//获取ExecutionTestCaseResult表中所有数据
	@Override
	public List<ExecutionTestCaseResult> getAllExecutionTestCaseResults() {
		Session session = this.sessionFactory.getCurrentSession();
		List<ExecutionTestCaseResult> testCaseResults = session.createQuery("from ExecutionTestCaseResult").list();
		if (testCaseResults.size() == 0) return null;
		return testCaseResults;
	}

	@Override
	public void removeExecutionTestCaseResultByExecutionId(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery("delete from executiontestcaseresult where executionId = :executionId");
		sqlQuery.setParameter("executionId", executionId);
		sqlQuery.executeUpdate();
	}

	@Override
	public void updateExecutionTestCaseResultByStartTime(String executionId, long scriptId, Date startTime,long	executionResultStartId) {
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session
				.createSQLQuery("update executiontestcaseresult set startTime = :startTime,executionResultStartId=:executionResultStartId where executionId = :executionId and scriptId = :scriptId");
		sqlQuery.setParameter("executionId", executionId);
		sqlQuery.setParameter("scriptId", scriptId);
		sqlQuery.setParameter("startTime", startTime);
		sqlQuery.setParameter("executionResultStartId", executionResultStartId);
		sqlQuery.executeUpdate();
	}
	@Override
	public void updateExecutionTestCaseResultByEndTime(String executionId, long scriptId, Date endTime,long	executionResultEndId) {
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session
				.createSQLQuery("update executiontestcaseresult set endTime = :endTime,executionResultEndId=:executionResultEndId where executionId = :executionId and scriptId = :scriptId");
		sqlQuery.setParameter("executionId", executionId);
		sqlQuery.setParameter("scriptId", scriptId);
		sqlQuery.setParameter("endTime", endTime);
		sqlQuery.setParameter("executionResultEndId", executionResultEndId);
		sqlQuery.executeUpdate();
	}

	private SQLQuery buildQueryExecutionTestCaseResult(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionTestCaseResult.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("scriptId", StandardBasicTypes.LONG);
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("scriptName", StandardBasicTypes.STRING);
		query.addScalar("result", StandardBasicTypes.INTEGER);
		query.addScalar("startTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("endTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("executedByUserId", StandardBasicTypes.STRING);
		query.addScalar("executionResultStartId", StandardBasicTypes.LONG);
		query.addScalar("executionResultEndId", StandardBasicTypes.LONG);

		return query;
	}
	

	private SQLQuery buildQueryExecutionRequirementTraceInfo(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionRequirementTraceInfo.class));
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("scriptId", StandardBasicTypes.LONG);
		query.addScalar("customizedScriptId", StandardBasicTypes.STRING);
		query.addScalar("scriptName", StandardBasicTypes.STRING);
		
		query.addScalar("requirementId", StandardBasicTypes.LONG);
		query.addScalar("customizedRequirementId", StandardBasicTypes.STRING);
		query.addScalar("requirementTitle", StandardBasicTypes.STRING);
		query.addScalar("result", StandardBasicTypes.STRING);

		return query;
	}
	
	
}
