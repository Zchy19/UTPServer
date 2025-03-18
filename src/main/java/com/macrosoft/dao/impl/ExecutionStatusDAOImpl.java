package com.macrosoft.dao.impl;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import com.macrosoft.dao.ExecutionStatusDAO;
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
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.utilities.MasterDbUtil;

@Repository
public class ExecutionStatusDAOImpl implements ExecutionStatusDAO {

	private static final ILogger logger = LoggerFactory.Create(ExecutionStatusDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void addExecutionStatus(ExecutionStatus executionStatus) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(executionStatus);
	}

	@Override
	public void updateExecutionStatus(ExecutionStatus executionStatus) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(executionStatus);

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateExecutionStatus", String.format("id: %s", executionStatus.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionStatusWithResult> getActiveExecutionStatusByProjectId(long projectId) {

		logger.debug(String.format("trace performance : getActiveExecutionStatusByProjectId begin..., projectId: %s", projectId));
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName,engineName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId=:projectId and testsetId >0  and isDummyRun=0 and (status != 'Terminated' and status != 'Stopped' and status != 'Completed')  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug(String.format("trace performance : getActiveExecutionStatusByProjectId end..."));
		
		return executionStatusWithResults;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionStatusWithResult> getAllActiveExecutionStatus() {

		logger.debug("trace performance : getAllActiveExecutionStatus begin...");

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName,engineName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where testsetId >0  and isDummyRun=0 and (status != 'Terminated' and status != 'Stopped' and status != 'Completed')  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug("trace performance : getAllActiveExecutionStatus end...");

		return executionStatusWithResults;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ExecutionStatusWithResult> getCompletedExecutionStatusByProjectId(long projectId) {

		logger.debug(String.format("trace performance : getCompletedExecutionStatusByProjectId begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName,engineName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId=:projectId and isDummyRun=0 and (status = 'Terminated' or status = 'Stopped' or status = 'Completed') and  testsetId >0  ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug("trace performance : getCompletedExecutionStatusByProjectId end...");

		return executionStatusWithResults;
	}

	@SuppressWarnings("unchecked")
	@Override
	public ExecutionStatus getExecutionStatusByExecutionId(String executionId) {

		logger.debug(String.format("trace performance : getExecutionStatusByExecutionId begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		List<ExecutionStatus> executionStatusList = session
				.createQuery("from ExecutionStatus where executionId = :executionId")
				.setParameter("executionId", executionId).list();

		logger.debug("trace performance : getExecutionStatusByExecutionId end...");

		if (executionStatusList.isEmpty()) {
			return null;
		}
		return executionStatusList.get(0);
	}

	@Override
	public ExecutionStatusWithResult getExecutionStatusByTestsetIdAndNew(long projectId, long testsetId) {

		logger.debug(String.format("trace performance : getExecutionStatusByTestsetIdAndNew begin..., projectId: %s, testsetId: %s", projectId, testsetId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select id,executionId, executionName,engineName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId=:projectId and testsetId=:testsetId ");
		sqlBuilder.append(" AND DATE(startTime) = CURDATE() ");
		sqlBuilder.append("order by id desc "); // 按照id降序排序
		sqlBuilder.append("limit 1");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug("trace performance : getExecutionStatusByTestsetIdAndNew end...");

		if (executionStatusWithResults.isEmpty()) {
			return null;
		}
		return executionStatusWithResults.get(0);
	}

	@SuppressWarnings("unchecked")
	@Override
	public ExecutionStatusWithResult getExecutionStatusWithResultByExecutionId(String executionId) {
		logger.debug(String.format("trace performance : getExecutionStatusWithResultByExecutionId begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName,engineName,testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where executionId=:executionId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug("trace performance : getExecutionStatusWithResultByExecutionId end...");

		if (executionStatusWithResults.isEmpty()) {
			return null;
		}
		return executionStatusWithResults.get(0);
	}

	@Override
	public void sp_startExecution(String executionId, String executionName, String testObject, long projectId, String orgId,
			String executedByUserId, int status, long testsetId, boolean isDummyRun,boolean isTemporaryExecution,String engineName, String informEmail) {
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery(
				"CALL sp_execution_startExecution(:executionId,:executionName, :testObject, :projectId, :orgId,:executedByUserId,:status,:testsetId, :isDummyRun,:isTemporaryExecution,:engineName,:informEmail)");
		sqlQuery.setParameter("executionId", executionId);
		sqlQuery.setParameter("executionName", executionName);
		sqlQuery.setParameter("testObject", testObject);
		sqlQuery.setParameter("projectId", projectId);
		sqlQuery.setParameter("orgId", orgId);
		sqlQuery.setParameter("executedByUserId", executedByUserId);
		sqlQuery.setParameter("status", status);
		sqlQuery.setParameter("testsetId", testsetId);
		sqlQuery.setParameter("isDummyRun", isDummyRun);
		sqlQuery.setParameter("isTemporaryExecution", isTemporaryExecution);
		sqlQuery.setParameter("engineName", engineName);
		sqlQuery.setParameter("informEmail", informEmail);
		sqlQuery.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "sp_startExecution", String.format("executionId: %s", executionId));
	}

	@Override
	public void sp_cleanDatabase()
	{
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery("CALL cleanDatabase()");
		sqlQuery.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "sp_cleanDatabase", String.format("sp_cleanDatabase called."));
	}
	

	@Override
	public List<ExecutionStatusWithResult> getExecutionStatusByProjectId(long projectId) {

		logger.debug(String.format("trace performance : getExecutionStatusByProjectId begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select executionId, executionName,engineName, testObject,  testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId=:projectId and  testsetId >0  and isDummyRun=0 ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug("trace performance : getExecutionStatusByProjectId end...");

		return executionStatusWithResults;
	}

	@Override
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetId(long projectId,long testsetId)
	{
		
		logger.debug(String.format("trace performance : getExecutionStatusByTestsetId begin..., testsetId: %s", testsetId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(
				" select executionId, executionName,engineName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId=:projectId and testsetId=:testsetId and  testsetId >0 ");


		if (!MasterDbUtil.getInstance().getReportIncludeDummyRun())
		{
			sqlBuilder.append(" and isDummyRun=0 ");			
		}		
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);

		buildQueryExecutionStatusWithResult(query);

		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();

		logger.debug("trace performance : getExecutionStatusByTestsetId end...");

		return executionStatusWithResults;
	}

	@Override
	public void terminateAllUnFinishedExecution() {
		
		logger.info("terminateAllUnFinishedExecution execution start.");

		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery(String.format(
				"update executionstatus set status = %s where (status != %s) &&  (status != %s) && (status != %s) ",
				ExecutionStatus.Terminated, ExecutionStatus.Stopped, ExecutionStatus.Terminated,
				ExecutionStatus.Completed));
		sqlQuery.executeUpdate();

		logger.info("terminateAllUnFinishedExecution run successfully.");
	}


	@Override
	public void saveExecutionAsTemporarySave(String executionId) {

		logger.info("saveExecutionAsTemporarySave execution start.");
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("update executionstatus set isTemporaryExecution = 1 ");
		sqlBuilder.append(" where executionId =:executionId");
		//执行sql
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.executeUpdate();
		logger.info("saveExecutionAsTemporarySave run successfully.");
	}

	@Override
	public void removeExecutionData(String executionId) {

		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_execution_deleteExecution(:p_executionId)");
		sqlQuery.setParameter("p_executionId", executionId);
		sqlQuery.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeExecutionData", String.format("executionId: %s", executionId));
	}

	@Override
	public List<ExecutionStatusWithResult> getExecutionStatusBetween(long projectId, Date startTime, Date endTime) {
		
		logger.info(String.format("trace performance : getExecutionStatusBetween begin..., projectId: %s", projectId));
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");

		String startTimeStr = sdf.format(startTime);
		String endTimeStr = sdf.format(endTime);

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName,engineName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId =:projectId and startTime >:startTime and  endTime <:endTime");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("startTime", startTimeStr);
		query.setParameter("endTime", endTimeStr);

		buildQueryExecutionStatusWithResult(query);

		logger.info(String.format("trace performance : getExecutionStatusBetween end..."));
		
		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();
		return executionStatusWithResults;
	}

	//获取ExecutionStatus表所有数据
	@Override
	public List<ExecutionStatus> getAllExecutionStatus() {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName, testObject, testsetId, testsetName,isDummyRun, isTemporaryExecution,status,projectId,orgId,startTime,endTime,executedByUserId");
		sqlBuilder.append(" from executionstatus");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		buildQueryExecutionStatus(query);
		List<ExecutionStatus> executionStatus = query.list();
		if (executionStatus.size()==0)
		{
			return null;
		}
		return executionStatus;
	}

	@Override
	public List<ExecutionStatus> getIntraDayExecutionStatusByUserId(String userId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
		// 获取当前日期的开始时间（当天00:00:00）
		LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
		// 如果需要转换为Date类型，可以这样做
		Date startTime = Date.from(todayStart.atZone(ZoneId.systemDefault()).toInstant());
		String startTimeStr = sdf.format(startTime);
		sqlBuilder.append(" select executionId, executionName, testObject, testsetId, testsetName,isDummyRun, isTemporaryExecution,status,projectId,orgId,startTime,endTime,executedByUserId");
		sqlBuilder.append(" from executionstatus");
		sqlBuilder.append(" where executedByUserId =:userId and startTime >=:startTime");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("userId", userId);
		query.setParameter("startTime", startTimeStr);
		buildQueryExecutionStatus(query);
		List<ExecutionStatus> executionStatus = query.list();
		return executionStatus;
	}

	@Override
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		logger.info(String.format("trace performance : getExecutionStatusByTestsetIdAndTime begin..., projectId: %s, testsetId: %s", projectId, testsetId));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
		String startTimeStr = sdf.format(startTime);
		String endTimeStr = sdf.format(endTime);
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId,engineName, result ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId =:projectId and testsetId =:testsetId and startTime >:startTime and  startTime <:endTime");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);
		query.setParameter("startTime", startTimeStr);
		query.setParameter("endTime", endTimeStr);
		buildQueryExecutionStatusWithResult(query);
		logger.info(String.format("trace performance : getExecutionStatusByTestsetIdAndTime end..."));
		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();
		return executionStatusWithResults;
	}

	@Override
	public List<ExecutionStatusWithResult> getTestsetExecutionStatusWithResultByProjectIdAndTime(long projectId, Date startTime, Date endTime) {
		logger.info(String.format("trace performance : getTestsetExecutionStatusWithResultByProjectIdAndTime begin..., projectId: %s", projectId));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
		String startTimeStr = sdf.format(startTime);
		String endTimeStr = sdf.format(endTime);
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select executionId, executionName, testObject, testsetId, testsetName,startTime, endTime, status, projectId, orgId, executedByUserId, result,engineName ");
		sqlBuilder.append(" from executionstatuswithresult s ");
		sqlBuilder.append(" where projectId =:projectId and startTime >:startTime and  startTime <:endTime and testsetId >0");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("startTime", startTimeStr);
		query.setParameter("endTime", endTimeStr);
		buildQueryExecutionStatusWithResult(query);
		logger.info(String.format("trace performance : getTestsetExecutionStatusWithResultByProjectIdAndTime end..."));
		List<ExecutionStatusWithResult> executionStatusWithResults = query.list();
		return executionStatusWithResults;
	}

	private SQLQuery buildQueryExecutionStatus(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionStatus.class));
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("executionName", StandardBasicTypes.STRING);
		query.addScalar("testObject", StandardBasicTypes.STRING);
		query.addScalar("testsetId", StandardBasicTypes.STRING);
		query.addScalar("testsetName", StandardBasicTypes.STRING);
		query.addScalar("isDummyRun", StandardBasicTypes.BOOLEAN);
		query.addScalar("isTemporaryExecution", StandardBasicTypes.BOOLEAN);
		query.addScalar("status", StandardBasicTypes.INTEGER);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("orgId", StandardBasicTypes.STRING);
		query.addScalar("startTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("endTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("executedByUserId", StandardBasicTypes.STRING);
		query.addScalar("engineName", StandardBasicTypes.STRING);
		query.addScalar("informEmail", StandardBasicTypes.STRING);
		return query;
	}

	private SQLQuery buildQueryExecutionStatusWithResult(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionStatusWithResult.class));
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("executionName", StandardBasicTypes.STRING);
		query.addScalar("testObject", StandardBasicTypes.STRING);
		query.addScalar("testsetId", StandardBasicTypes.LONG);
		query.addScalar("testsetName", StandardBasicTypes.STRING);
		query.addScalar("startTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("endTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("status", StandardBasicTypes.STRING);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("orgId", StandardBasicTypes.LONG);
		query.addScalar("executedByUserId", StandardBasicTypes.STRING);
		query.addScalar("result", StandardBasicTypes.STRING);
		query.addScalar("engineName", StandardBasicTypes.STRING);

		return query;
	}
}
