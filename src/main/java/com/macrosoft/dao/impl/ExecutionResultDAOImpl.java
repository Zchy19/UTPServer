package com.macrosoft.dao.impl;

import java.util.Comparator;
import java.util.List;

import com.macrosoft.dao.ExecutionResultDAO;
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
import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.composition.CountValue;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.model.composition.PageSummary;

@Repository
public class ExecutionResultDAOImpl implements ExecutionResultDAO {

	private static final ILogger logger = LoggerFactory.Create(ExecutionResultDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public ExecutionResult addExecutionResult(ExecutionResult executionResult) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(executionResult);
		session.flush(); // 确保立即将更改写入数据库
		return executionResult;

	}

	@Override
	public void updateExecutionResult(ExecutionResult executionResult) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(executionResult);
	}

	@Override
	public List<ExecutionResultInfo> listExecutionResultInfosAfterFromId(String executionId, long beginId) {
		
		logger.debug(String.format("trace performance : listExecutionResultInfosAfterFromId begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(" where executionId = :executionId and resultId > " + beginId);
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		buildQueryExecutionResultInfo(query);
		List<ExecutionResultInfo> resultInfos = query.list();

		logger.debug("trace performance : listExecutionResultInfosAfterFromId end...");

		return resultInfos;
	}

	@Override
	public List<ExecutionResultInfo> listMaximumExecutionResultInfosAfterFromId(String executionId, long beginId, int maximum) {
		logger.debug(String.format("trace performance : listMaximumExecutionResultInfosAfterFromId begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(" where executionId = :executionId and resultId > " + beginId +" limit "+maximum);
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		buildQueryExecutionResultInfo(query);
		List<ExecutionResultInfo> resultInfos = query.list();

		logger.debug("trace performance : listMaximumExecutionResultInfosAfterFromId end...");

		return resultInfos;
	}


	@Override
	public List<ExecutionResultInfo> listPagedExecutionResultInfos(String executionId, int currentPage, int rowsPerPage) {
		
		logger.debug(String.format("trace performance : listPagedExecutionResultInfos begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append("  where executionId = :executionId ");
		sqlBuilder.append("  order by resultId");
		sqlBuilder.append("  limit :offset, :rows ");
		
		long offset = (currentPage - 1) * rowsPerPage + 1;
		long rows = rowsPerPage;
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("offset", offset);
		query.setParameter("rows", rows);
		
		buildQueryExecutionResultInfo(query);
		List<ExecutionResultInfo> resultInfos = query.list();
		
		logger.debug("trace performance : listPagedExecutionResultInfos end...");

		return resultInfos;
	}

	@Override
	public ExecutionResultInfo getExecutionResultByCheckPoint(String executionId, int scriptId, String requirementId, int commandType) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(" where executionId = :executionId and scriptId = :scriptId and command =:requirementId and commandType =:commandType ");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("scriptId", scriptId);
		query.setParameter("requirementId", requirementId);
		query.setParameter("commandType", commandType);
		buildQueryExecutionResultInfo(query);
		List list = query.list();
		if (list.size() > 0) {
			return (ExecutionResultInfo) list.get(0);
		} else {
			return null;
		}
	}


	@Override
	public PageSummary getExecutionResultInfoPageSummary(String executionId, int rowsPerPage) {
		
		logger.debug(String.format("trace performance : getExecutionResultInfoPageSummary begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select count(*) counter ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(" where executionId = :executionId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		this.buildQueryCountValue(query);
		List<CountValue> resultInfos = query.list();

		PageSummary pageSummary = new PageSummary();
		
		if (resultInfos.size() == 0 || rowsPerPage<=0)
		{
			pageSummary.setPageCount(0);
			pageSummary.setRowsPerPage(rowsPerPage);
			return pageSummary;
		}

		int counter = resultInfos.get(0).getCounter();
		pageSummary.setRowsPerPage(rowsPerPage);
		
		if ((counter % rowsPerPage) == 0) {
			int pages = counter / rowsPerPage;
			pageSummary.setPageCount(pages);
		} else {
			double pagesWithPrecision = counter / rowsPerPage;
			int pages = (int) Math.floor(pagesWithPrecision);
			pageSummary.setPageCount(pages + 1);
		}
		
		logger.debug("trace performance : getExecutionResultInfoPageSummary end...");

		return pageSummary;
	}
	

	@Override
	public List<ExecutionResultInfo> listExecutionResultSummaryInfosAfterFromId(String executionId, long beginId) {
		
		logger.debug(String.format("trace performance : listExecutionResultSummaryInfosAfterFromId begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(String.format(" where executionId = :executionId and commandType != %s and resultId > %s ", ExecutionResult.CommandType_Command, beginId));

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		buildQueryExecutionResultInfo(query);

		logger.debug("trace performance : listExecutionResultSummaryInfosAfterFromId end...");

		return query.list();
	}

	@Override
	public List<ExecutionResultInfo> listExecutionResultInfosDetails(String executionId, long beginId, long endId) {
		
		logger.debug(String.format("trace performance : listExecutionResultInfosDetails begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(String.format(" where executionId = :executionId and resultId > %s and resultId < %s ",
				beginId, endId));

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		buildQueryExecutionResultInfo(query);

		logger.debug("trace performance : listExecutionResultInfosDetails end...");

		return query.list();
	}

	@Override
	public List<ExecutionResultInfo> listLatestNumberOfExecutionResultInfos(String executionId, long amount) {
		
		logger.debug(String.format("trace performance : listLatestNumberOfExecutionResultInfos begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from ( select * ");
		sqlBuilder.append(" from ExecutionResultInfo ");
		sqlBuilder.append(String.format(
				"  where executionId = :executionId order by resultId desc limit 0, %s ) t order by t.resultId asc ",
				amount));

		logger.debug("sql:" + sqlBuilder.toString());

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		buildQueryExecutionResultInfo(query);

		logger.debug("trace performance : listLatestNumberOfExecutionResultInfos end...");

		return query.list();
	}

	@Override
	public List<ExecutionResult> getallExecutionResult() {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from ExecutionResult");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		buildQueryExecutionResult(query);
		List<ExecutionResult> executionResults = query.list();
		if (executionResults.size() == 0)
		{
			return null;
		}
		return executionResults;
	}

	@Override
	public List<ExecutionResult> getExecutionResultByExecutionId(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from ExecutionResult where executionId = :executionId");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		buildQueryExecutionResult(query);
		List<ExecutionResult> executionResults = query.list();
		if (executionResults.size() == 0)
		{
			return null;
		}
		return executionResults;
	}

	@Override
	public int getExecutionResultIntByExecutionIdAndCommandType(String executionId, int commandType) {

		logger.debug(String.format("trace performance : getExecutionResultIntByExecutionIdAndCommandType begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select count(*) as counter from ExecutionResult where executionId = :executionId and commandType = :commandType");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("commandType", commandType);
		buildQueryCountValue(query);
		List<CountValue> resultInfos = query.list();
		if (resultInfos.size() == 0)
		{
			return 0;
		}

		logger.debug("trace performance : getExecutionResultIntByExecutionIdAndCommandType end...");

		return resultInfos.get(0).getCounter();
	}

	@Override
	public int getExecutionResultIntByExecutionIdAndCommandTypeAndResult(String executionId, int commandType, int result) {

		logger.debug(String.format("trace performance : getExecutionResultIntByExecutionIdAndCommandTypeAndResult begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select count(*) as counter from ExecutionResult where executionId = :executionId and commandType = :commandType and result = :result");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("commandType", commandType);
		query.setParameter("result", result);
		buildQueryCountValue(query);
		List<CountValue> resultInfos = query.list();
		if (resultInfos.size() == 0)
		{
			return 0;
		}

		logger.debug("trace performance : getExecutionResultIntByExecutionIdAndCommandTypeAndResult end...");

		return resultInfos.get(0).getCounter();
	}

	@Override
	public List<ExecutionResultInfo> listResultByParentId(String executionId, String parentId) {
		logger.debug(String.format("trace performance : listResultByParentId begin..., executionId: %s", executionId));

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append("select * from ExecutionResultInfo where executionId = :executionId and parentId = :parentId order by resultId desc");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("executionId", executionId);
		query.setParameter("parentId", parentId);
		buildQueryExecutionResultInfo(query);

		// 获取最新的500条数据
		query.setMaxResults(500);
		List<ExecutionResultInfo> results = query.list();

		// 对结果进行升序排序
		results.sort(Comparator.comparing(ExecutionResultInfo::getResultId));

		// 返回最后50条数据
		int size = results.size();
		if (size > 500) {
			return results.subList(size - 500, size);
		} else {
			return results;
		}
	}
	private SQLQuery buildQueryExecutionResult(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionResult.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("agentInstanceName", StandardBasicTypes.STRING);
		query.addScalar("commandType", StandardBasicTypes.INTEGER);
		query.addScalar("scriptId", StandardBasicTypes.LONG);
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("executionTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("command", StandardBasicTypes.STRING);
		query.addScalar("result", StandardBasicTypes.INTEGER);
		query.addScalar("exceptionMessage", StandardBasicTypes.STRING);
		query.addScalar("indexId", StandardBasicTypes.STRING);
		query.addScalar("parentId", StandardBasicTypes.STRING);

		return query;
	}

	private SQLQuery buildQueryCountValue(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(CountValue.class));
		query.addScalar("counter", StandardBasicTypes.INTEGER);
		return query;
	}

	
	private SQLQuery buildQueryExecutionResultInfo(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionResultInfo.class));
		// query.addScalar("resultId", StandardBasicTypes.LONG);
		query.addScalar("resultId", StandardBasicTypes.LONG);
		query.addScalar("scriptId", StandardBasicTypes.LONG);
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("antbotName", StandardBasicTypes.STRING);
		query.addScalar("commandType", StandardBasicTypes.INTEGER);
		query.addScalar("executionTime", StandardBasicTypes.TIMESTAMP);
		query.addScalar("command", StandardBasicTypes.STRING);
		query.addScalar("result", StandardBasicTypes.INTEGER);
		query.addScalar("errorMessage", StandardBasicTypes.STRING);
		query.addScalar("indexId", StandardBasicTypes.STRING);
		query.addScalar("parentId", StandardBasicTypes.STRING);

		return query;
	}

}
