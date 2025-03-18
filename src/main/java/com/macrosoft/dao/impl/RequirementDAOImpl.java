package com.macrosoft.dao.impl;

import com.macrosoft.dao.RequirementDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Requirement;
import com.macrosoft.model.TestCaseRequirementMapping;
import com.macrosoft.model.composition.RequirementScriptTraceInfo;
import com.macrosoft.model.composition.ScriptInfo;
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
public class RequirementDAOImpl implements RequirementDAO {
	
	private static final ILogger logger = LoggerFactory.Create(RequirementDAOImpl.class.getName());
	
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public Requirement addRequirement(long projectId, Requirement requirement) {

		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into Requirement (id, ProjectId, Title, CustomizedId, Description, ParentId, Comment, Type, leaf, customizedFields)  ");
		sqlBuilder.append(" values (:newRequirementId, :projectId, :title, :customizedId, :description, :parentId, :comment, :type, :leaf, :customizedFields) ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("newRequirementId", requirement.getId());
		query.setParameter("projectId", projectId);
		query.setParameter("title", requirement.getTitle());
		query.setParameter("customizedId", requirement.getCustomizedId());
		query.setParameter("description", requirement.getDescription());
		query.setParameter("parentId", requirement.getParentId());
		query.setParameter("description", requirement.getDescription());
		query.setParameter("comment", requirement.getComment());
		query.setParameter("type", requirement.getType());
		query.setParameter("leaf", requirement.getLeaf());
		query.setParameter("customizedFields", requirement.getCustomizedFields());
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addRequirement", String.format("projectId:%s, id: %s", projectId, requirement.getId()));

		return requirement;
	}


	@Override
	public void updateCoveragePercentage(long projectId, Requirement requirement) {

		logger.info("Requirement updateCoveragePercentage, Requirement Details="+ requirement);
		
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update requirement set CoveragePercentage=:coveragePercentage ");
		sqlBuilder.append(" where projectId=:projectId and id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("coveragePercentage", requirement.getCoveragePercentage());
		query.setParameter("projectId", requirement.getProjectId());
		query.setParameter("id", requirement.getId());
		query.executeUpdate();
	}
	
	@Override
	public void updateRequirement(long projectId, Requirement requirement) {

		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update requirement set title =:title, description=:description, parentId =:parentId, comment =:comment, type =:type, leaf =:leaf, customizedId =:customizedId, CoveragePercentage=:coveragePercentage, customizedFields=:customizedFields  ");
		sqlBuilder.append(" where projectId=:projectId and id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("title", requirement.getTitle());
		query.setParameter("description", requirement.getDescription());
		query.setParameter("parentId", requirement.getParentId());
		query.setParameter("comment", requirement.getComment());
		query.setParameter("type", requirement.getType());
		query.setParameter("leaf", requirement.getLeaf());
		query.setParameter("customizedId", requirement.getCustomizedId());
		query.setParameter("projectId", requirement.getProjectId());
		query.setParameter("coveragePercentage", requirement.getCoveragePercentage());
		query.setParameter("customizedFields", requirement.getCustomizedFields());
		query.setParameter("id", requirement.getId());
		query.executeUpdate();
		

		logger.info("Requirement updated successfully, Requirement Details="+ requirement);		
	}


	@SuppressWarnings("unchecked")
	@Override
	public List<Requirement> getRequirementByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<Requirement> requirements = session.createQuery("from Requirement where ProjectId = :projectId").setParameter("projectId", projectId).list();
		return requirements;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Requirement> getRequirementByParentId(long projectId, long parentId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<Requirement> requirements = session.createQuery("from Requirement where ProjectId = :projectId and parentId = :parentId and parentId > 0")
				.setParameter("projectId", projectId).setParameter("parentId", parentId).list();
		return requirements;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<TestCaseRequirementMapping> getRequirementMappingByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<TestCaseRequirementMapping> mappings = session.createQuery("from TestCaseRequirementMapping where ProjectId = :projectId ")
				.setParameter("projectId", projectId).list();
		return mappings;
	}

	@Override
	public Requirement getRequirementById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();		
		List<Requirement> requirements = session.createQuery("from Requirement where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id).
				list();
		if (requirements.size() == 0) return null;
		return requirements.get(0);
	}

	@Override
	public void removeRequirement(long projectId, long id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from Requirement where projectId=:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();
		
		sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from TestCaseRequirementMapping where projectId=:projectId and RequirementId=:RequirementId  ");
		query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("RequirementId", id);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeRequirement", String.format("projectId:%s, id: %s", projectId, id));
	}

	@Override
	public void addScriptRequirementMapping(long projectId, long scriptId, long requirementId) {

		TestCaseRequirementMapping foundMapping = getScriptRequirementMapping(projectId, scriptId, requirementId);
		if (foundMapping != null) return;
		
		Session session = this.sessionFactory.getCurrentSession();
		
		TestCaseRequirementMapping mapping = new TestCaseRequirementMapping();
		mapping.setProjectId(projectId);
		mapping.setScriptId(scriptId);
		mapping.setRequirementId(requirementId);
		
		session.saveOrUpdate(mapping);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addScriptRequirementMapping", String.format("projectId:%s, id: %s", projectId, mapping.getId()));
	}

	@Override
	public void removeScriptRequirementMappingByScriptId(long projectId, long scriptId) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from TestCaseRequirementMapping where ProjectId=:projectId and scriptId=:scriptId ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptId", scriptId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeScriptRequirementMappingByScriptId", String.format("projectId:%s, scriptId: %s", projectId, scriptId));
	}

	@Override
	public void cleanScriptRequirementMapping(long projectId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from TestCaseRequirementMapping where ProjectId=:projectId and scriptId not IN (SELECT id FROM script WHERE projectId = :projectId) ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "cleanScriptRequirementMapping", String.format("projectId:%s", projectId));
	}

	
	private TestCaseRequirementMapping getScriptRequirementMapping(long projectId, long scriptId, long requirementId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		List<TestCaseRequirementMapping> mappings = session.createQuery("from TestCaseRequirementMapping where ProjectId=:projectId and RequirementId = :requirementId and ScriptId =:scriptId")
				.setParameter("projectId", projectId)
				.setParameter("requirementId", requirementId)
				.setParameter("scriptId", scriptId).list();

		if (mappings.size() == 0) return null;
		
		return mappings.get(0);
	}

	@Override
	public List<Requirement> getRequirementsByRequirementIds(long projectId, String requirementIds) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from Requirement ");
		sqlBuilder.append(" where id in ( ");
		sqlBuilder.append(requirementIds);
		sqlBuilder.append(")  and projectId = " + projectId);
		
		SQLQuery query =  session.createSQLQuery(sqlBuilder.toString());

		buildQueryRequirementResult(query);
		
		return query.list();
	}

	@Override
	public List<Requirement> findReferenceOfRequirementByScriptId(long projectId, long scriptId)
	{
		Session session = this.sessionFactory.getCurrentSession();	
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from Requirement ");
		sqlBuilder.append(" where ProjectId=:projectId and id in (select RequirementId from TestCaseRequirementMapping where scriptId=:scriptId and projectId=:projectId)");
		

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptId", scriptId);
		buildQueryRequirementResult(query);
		
		List<Requirement> requirements = query.list();
		
		return requirements;
	}
	
	
	@Override
	public List<ScriptInfo> findReferenceOfScriptByRequirementId(long projectId, long requirementId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select id, CustomizedId, projectId,name,description,parentScriptGroupId,parameter,type, ((script is null) or (length(script) = 0)) as isEmpty ");
		sqlBuilder.append(" from Script ");
		sqlBuilder.append(" where projectId=:projectId and id in (select ScriptId from TestCaseRequirementMapping where requirementId=:requirementId and projectId=:projectId)");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("requirementId", requirementId);
		query.setParameter("projectId", projectId);
		
		buildQueryScriptInfoResult(query);
		
		List<ScriptInfo> scriptInfos = query.list();
		return scriptInfos;
	}
	
	@Override
	public List<RequirementScriptTraceInfo> listRequirementScriptTraceInfo(long projectId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from tracerequirementscript ");
		sqlBuilder.append(" where projectId=:projectId");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		
		buildQueryRequirementScriptTraceInfo(query);
		
		return query.list();
	}
	private SQLQuery buildQueryScriptInfoResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(ScriptInfo.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("customizedId", StandardBasicTypes.STRING);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("parentScriptGroupId", StandardBasicTypes.LONG);
		query.addScalar("parameter", StandardBasicTypes.STRING);
		query.addScalar("type", StandardBasicTypes.STRING);
		query.addScalar("isEmpty", StandardBasicTypes.BOOLEAN);
		return query;
	}

	private SQLQuery buildQueryRequirementResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(Requirement.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("customizedId", StandardBasicTypes.STRING);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("title", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("parentId", StandardBasicTypes.LONG);
		query.addScalar("comment", StandardBasicTypes.STRING);
		query.addScalar("type", StandardBasicTypes.STRING);
		query.addScalar("leaf", StandardBasicTypes.BOOLEAN);
		query.addScalar("coveragePercentage", StandardBasicTypes.FLOAT);
		return query;
	}
	

	private SQLQuery buildQueryRequirementScriptTraceInfo(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(RequirementScriptTraceInfo.class));
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("requirementId", StandardBasicTypes.LONG);
		query.addScalar("customizedRequirementId", StandardBasicTypes.STRING);
		query.addScalar("requirementTitle", StandardBasicTypes.STRING);
		query.addScalar("scriptId", StandardBasicTypes.LONG);
		query.addScalar("customizedScriptId", StandardBasicTypes.STRING);
		query.addScalar("scriptName", StandardBasicTypes.STRING);
		return query;
	}
}
