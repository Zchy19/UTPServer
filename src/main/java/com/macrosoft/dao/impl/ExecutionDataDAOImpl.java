package com.macrosoft.dao.impl;

import com.macrosoft.dao.ExecutionDataDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.ExecutionData;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ExecutionDataDAOImpl implements ExecutionDataDAO {


	private static final ILogger logger = LoggerFactory.Create(ExecutionDataDAOImpl.class.getName());

	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf) {
		this.sessionFactory = sf;
	}

	@Override
	public void addExecutionData(ExecutionData executionData) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(executionData);
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addExecutionData", String.format("executionId:%s, id: %s", executionData.getExecutionId(), executionData.getId()));
	}


	//获取list<ExecutionData>
	@Override
	public List<ExecutionData> listExecutionDataByExecutionId(String executionId) {
		Session session = this.sessionFactory.getCurrentSession();
		return (List<ExecutionData>) buildQueryExecutionData(session.createSQLQuery("select id, executionId, scriptGroupId, type, jsonData,dataSource,uploadStatus from ExecutionData where executionId = :executionId"))
				.setParameter("executionId", executionId)
				.list();
	}

	@Override
	public List<ExecutionData> listExecutionData(String executionId, int lastResultId) {
		Session session = this.sessionFactory.getCurrentSession();
		return (List<ExecutionData>) buildQueryExecutionData(session.createSQLQuery("select id, executionId, scriptGroupId, type, jsonData,dataSource,uploadStatus from ExecutionData where executionId = :executionId and id > :lastResultId"))
				.setParameter("executionId", executionId)
				.setParameter("lastResultId", lastResultId)
				.list();
	}


	private SQLQuery buildQueryExecutionData(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(ExecutionData.class));
		query.addScalar("id", StandardBasicTypes.INTEGER);
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("scriptGroupId", StandardBasicTypes.STRING);
		query.addScalar("type", StandardBasicTypes.STRING);
		query.addScalar("jsonData", StandardBasicTypes.STRING);
		query.addScalar("dataSource", StandardBasicTypes.STRING);
		query.addScalar("uploadStatus", StandardBasicTypes.INTEGER);
		return query;
	}



}
