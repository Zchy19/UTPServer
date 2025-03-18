package com.macrosoft.dao.impl;

import java.text.SimpleDateFormat;
import java.util.List;


import com.macrosoft.dao.BigdataStorageDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.SearchBusFrameParameter;

@Repository
public class BigdataStorageDAOImpl implements BigdataStorageDAO {
	
	private static final ILogger logger = LoggerFactory.Create(BigdataStorageDAOImpl.class.getName());

	private static SimpleDateFormat sdf_time = new SimpleDateFormat("yyyy-MM-dd");
	
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addBigdataStorage(BigdataStorage BigdataStorage) {
		Session session = this.sessionFactory.getCurrentSession();
		session.saveOrUpdate(BigdataStorage);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addBigdataStorage", String.format("id: %s", BigdataStorage.getId()));
	}

	@Override
	public void updateBigdataStorage(BigdataStorage BigdataStorage) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update BigdataStorage set bigdata =:bigdata  ");
		sqlBuilder.append(" where id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", BigdataStorage.getId());
		query.setParameter("bigdata", BigdataStorage.getBigdata());
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateBigdataStorage", String.format("id: %s", BigdataStorage.getId()));
	}
	
	@Override
	public void removeBigdataStorage(String id) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from BigdataStorage where id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", id);
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeBigdataStorage", String.format("id: %s", id));
	}
	@Override
	public List<BigdataStorage> getAllBigdataStorage() {


		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select id, executionId,dataType, bigdata, fileName, createdAt, organizationId ");
		sqlBuilder.append(" from BigdataStorage ");


		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		buildQueryBigdataStorageResult(query);


		List<BigdataStorage> bigdataStorages = query.list();

		if (bigdataStorages.size() == 0)
		{
			return null;
		}
		return bigdataStorages;

	}

	@Override
	public List<BigdataStorage> getBigdataStorageByExecutionId(String executionId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select id, executionId,dataType, bigdata, fileName, createdAt, organizationId ");
		sqlBuilder.append(" from BigdataStorage ");
		sqlBuilder.append(" where executionId='" + executionId + "'");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		buildQueryBigdataStorageResult(query);

		List<BigdataStorage> bigdataStorages = query.list();

		if (bigdataStorages.size() == 0)
		{
			return null;
		}
		return bigdataStorages;
	}

	@Override
	public BigdataStorage getBigdataStorage(String id) {

		logger.info(String.format("getBigdataStorage()->id:%s, 000", id));
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select id,executionId,dataType, bigdata, fileName, createdAt, organizationId");
		sqlBuilder.append(" from BigdataStorage ");
		sqlBuilder.append(" where id='" + id + "'");

		logger.info(String.format("getBigdataStorage()->id:%s, 1111", id));
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		buildQueryBigdataStorageResult(query);

		logger.info(String.format("getBigdataStorage()->id:%s, 222", id));
		
		List<BigdataStorage> bigdataStorages = query.list();

		if (bigdataStorages.size() == 0) 
		{
			logger.info(String.format("getBigdataStorage()->id:%s, return null", id));
			return null;
		}
		return bigdataStorages.get(0);
		
	}


	@SuppressWarnings("unchecked")
	@Override
	public List<BigdataStorageInfo> listBigdataStorageInfosByOrg(String dataType, long organizationId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select id, dataType, fileName, createdAt ");
		sqlBuilder.append(" from BigdataStorage ");
		sqlBuilder.append(" where dataType=:dataType and organizationId =:organizationId order by createdAt desc");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("dataType", dataType);
		query.setParameter("organizationId", organizationId);

		buildQueryBigdataStorageInfoResult(query);

		List<BigdataStorageInfo> BigdataStorageInfo = query.list();
		return BigdataStorageInfo;
	}
	

	@SuppressWarnings("unchecked")
	@Override
	public List<BigdataStorageInfo> listBigdataStorageInfos(String dataType, String projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select id, dataType, fileName, createdAt ");
		sqlBuilder.append(" from BigdataStorage ");
		sqlBuilder.append(" where dataType=:dataType ");
		sqlBuilder.append(" and id in (select distinct bigdataStorageId from agentconfig where projectid=:projectId) ");
		sqlBuilder.append(" order by createdAt desc");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("dataType", dataType);
		query.setParameter("projectId", projectId);

		buildQueryBigdataStorageInfoResult(query);

		List<BigdataStorageInfo> BigdataStorageInfo = query.list();
		return BigdataStorageInfo;
	}
	
		


	@SuppressWarnings("unchecked")
	@Override
	public List<BigdataStorage> searchBusFrameStatistics(SearchBusFrameParameter parameter) {

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select id,executionId,dataType, bigdata, fileName, createdAt, organizationId");
		sqlBuilder.append(" from BigdataStorage ");
		sqlBuilder.append(" where dataType='busFrameData' and createdAt > '" + sdf.format(parameter.getStartFromDate()) + "'");
		sqlBuilder.append("  and createdAt < '" + sdf.format(parameter.getEndByDate())+ "' order by createdAt desc");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		buildQueryBigdataStorageResult(query);

		List<BigdataStorage> bigdataStorages = query.list();

		return bigdataStorages;
	}




	private SQLQuery buildQueryBigdataStorageResult(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(BigdataStorage.class));
		query.addScalar("id", StandardBasicTypes.STRING);
		query.addScalar("executionId", StandardBasicTypes.STRING);
		query.addScalar("dataType", StandardBasicTypes.STRING);
		query.addScalar("bigdata", StandardBasicTypes.STRING);
		query.addScalar("fileName", StandardBasicTypes.STRING);
		query.addScalar("createdAt", StandardBasicTypes.TIMESTAMP);
		query.addScalar("organizationId", StandardBasicTypes.LONG);

		
		return query;
	}
	
	private SQLQuery buildQueryBigdataStorageInfoResult(SQLQuery query) {
		query.setResultTransformer(Transformers.aliasToBean(BigdataStorageInfo.class));
		query.addScalar("id", StandardBasicTypes.STRING);
		query.addScalar("dataType", StandardBasicTypes.STRING);
		query.addScalar("fileName", StandardBasicTypes.STRING);
		query.addScalar("createdAt", StandardBasicTypes.TIMESTAMP);
		
		return query;
	}
}
