package com.macrosoft.dao.impl;

import java.util.List;

import com.macrosoft.dao.TestSetDAO;
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
import com.macrosoft.model.TestSet;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.model.composition.TestsetData;

@Repository
public class TestSetDAOImpl implements TestSetDAO {
	
	private static final ILogger logger = LoggerFactory.Create(TestSetDAOImpl.class.getName());
	private SessionFactory sessionFactory;

	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addTestSet(long projectId, TestSet testset) {

		Session session = this.sessionFactory.getCurrentSession();
		testset.setProjectId(projectId);
		session.saveOrUpdate(testset);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addTestSet", String.format("projectId:%s, id: %s", projectId, testset.getId()));
	}

	@Override
	public void updateTestSet(long projectId, TestSet testset) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update TestSet set  TestSet.Name =:name,TestSet.Activate=:activate, TestSet.EngineName =:engineName, TestSet.Description =:description where projectId =:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("name", testset.getName());
		query.setParameter("activate", testset.getActivate());
		query.setParameter("engineName", testset.getEngineName());
		query.setParameter("description", testset.getDescription());
		query.setParameter("projectId", projectId);
		query.setParameter("id", testset.getId());

		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateTestSet", String.format("projectId:%s, id: %s", projectId, testset.getId()));
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<TestSet> listTestSetsByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<TestSet> testsetList = session.createQuery("from TestSet where projectId=:projectId order by Name")
				.setParameter("projectId", projectId).list();
		return testsetList;
	}

	@Override
	public List<TestSet> listTestSetsByTestSetName(long projectId, String testsetName) {
		Session session = this.sessionFactory.getCurrentSession();
		List<TestSet> testsetList = session.createQuery("from TestSet where projectId =:projectId and Name=:Name")
				.setParameter("projectId", projectId)
				.setParameter("Name", testsetName).
				list();
		return testsetList;
	}


	@Override
	public TestSet getTestSetById(long projectId, long id) {
		
		Session session = this.sessionFactory.getCurrentSession();		
		List<TestSet> testsetList = session.createQuery("from TestSet where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id).
				list();
		if (testsetList.size() == 0) return null;
		return testsetList.get(0);
	}

	@Override
	public void removeTestSet(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from TestSet where projectId =:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeTestSet", String.format("projectId:%s, id: %s", projectId, id));
	}

	@Override
	public List<TestSet> findTestsetsByScriptId(long projectId, long scriptId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from TestSet ");
		sqlBuilder.append(" where projectId = :projectId and id in (select testsetId from ScriptLink where projectId = :projectId and scriptId=:scriptId )");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptId", scriptId);
		
		buildQueryTestsetResult(query);
		
		List<TestSet> testsets = query.list();
		return testsets;
	}

	@SuppressWarnings("unchecked")
	@Override
	public TestsetData getTestsetDatasById(long projectId, long id) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from TestSet where projectId = :projectId and  id=:id");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);

		buildQueryTestsetDataResult(query);
		
		List<TestsetData> testsetDataList = query.list();
		if (testsetDataList.isEmpty())
		{
			return null;
		}
		
		TestsetData testsetData = testsetDataList.get(0);
		List<ScriptInfo> scripts = getScriptInfoByTestsetId(projectId, testsetData.getId());
		testsetData.setScripts(scripts);
		
		return testsetData;
	}

	@Override
	public List<TestSet> listTestSetsByProjectIdAndActivate(long projectId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" select * ");
//		根据名称排序
		sqlBuilder.append(" from TestSet where projectId = :projectId and activate = 1 order by name ASC");
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);

		buildQueryTestsetResult(query);

		List<TestSet> testsets = query.list();
		return testsets;
	}

	@Override
	public List<ScriptInfo> getScriptInfoByTestsetId(long projectId, long testsetId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select id,projectId,name,description,parentScriptGroupId,parameter,type, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where projectId = :projectId and id in (select scriptId from ScriptLink where projectId = :projectId and testsetId=:testsetId) ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("testsetId", testsetId);
		buildQueryScriptInfoResult(query);
		
		List<ScriptInfo> scriptInfos = query.list();
		return scriptInfos;
	}
	
	private SQLQuery buildQueryScriptInfoResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(ScriptInfo.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("parentScriptGroupId", StandardBasicTypes.LONG);
		query.addScalar("parameter", StandardBasicTypes.STRING);
		query.addScalar("type", StandardBasicTypes.STRING);
		query.addScalar("isEmpty", StandardBasicTypes.BOOLEAN);
		return query;
	}
	
	private SQLQuery buildQueryTestsetResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(TestSet.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("activate", StandardBasicTypes.INTEGER);
		return query;
	}

	private SQLQuery buildQueryTestsetDataResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(TestsetData.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("engineName", StandardBasicTypes.STRING);
		query.addScalar("activate", StandardBasicTypes.INTEGER);
		return query;
	}
}
