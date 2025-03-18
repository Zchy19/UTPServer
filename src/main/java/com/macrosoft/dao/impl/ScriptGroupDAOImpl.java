package com.macrosoft.dao.impl;

import java.util.List;


import com.macrosoft.dao.ScriptGroupDAO;
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
import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.composition.ScriptInfo;

@Repository
public class ScriptGroupDAOImpl implements ScriptGroupDAO {
	
	private static final ILogger logger = LoggerFactory.Create(ScriptGroupDAOImpl.class.getName());
	private SessionFactory sessionFactory;

	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public ScriptGroup addScriptGroup(long projectId, ScriptGroup scriptGroup) {
		Session session = this.sessionFactory.getCurrentSession();
	
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into scriptgroup (id, ProjectId, Name, Description, ParentScriptGroupId)  ");
		sqlBuilder.append(" values (:newScriptGroupId, :projectId, :name, :description, :parentScriptGroupid) ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("newScriptGroupId", scriptGroup.getId());
		query.setParameter("projectId", projectId);
		query.setParameter("name", scriptGroup.getName());
		query.setParameter("description", scriptGroup.getDescription());
		query.setParameter("parentScriptGroupid", scriptGroup.getParentScriptGroupId());
		query.executeUpdate();


		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addScriptGroup", String.format("projectId:%s, id: %s", projectId, scriptGroup.getId()));

		return scriptGroup;
	}

	@Override
	public void updateScriptGroup(long projectId, ScriptGroup scriptGroup) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update scriptgroup set name =:name, description=:description, parentScriptGroupid =:parentScriptGroupid  ");
		sqlBuilder.append(" where projectId=:projectId and id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("name", scriptGroup.getName());
		query.setParameter("description", scriptGroup.getDescription());
		query.setParameter("parentScriptGroupid", scriptGroup.getParentScriptGroupId());
		query.setParameter("projectId", scriptGroup.getProjectId());
		query.setParameter("id", scriptGroup.getId());
		query.executeUpdate();
	}


	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroups(long projectId) {
		
		logger.debug(String.format("trace performance : listScriptGroups begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroupList = session.createQuery("from ScriptGroup where ProjectId = :ProjectId").setParameter("ProjectId", projectId).list();

		logger.debug(String.format("trace performance : listScriptGroups end..., projectId: %s", projectId));

		return scriptGroupList;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId) {
		
		logger.debug(String.format("trace performance : listScriptGroupsInTopLevel begin..., projectId: %s", projectId));

		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroupList = session.createQuery("from ScriptGroup where ProjectId = :ProjectId and parentScriptGroupId = 0").setParameter("ProjectId", projectId).list();

		logger.debug(String.format("trace performance : listScriptGroupsInTopLevel end..., projectId: %s", projectId));

		return scriptGroupList;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<ScriptGroup> scriptGroupList = session.createQuery("from ScriptGroup where projectId =:projectId and ParentScriptGroupId = :ParentScriptGroupId and ParentScriptGroupId > 0")
				.setParameter("projectId", projectId)
				.setParameter("ParentScriptGroupId", parentScriptGroupId).list();
		return scriptGroupList;
	}

	@Override
	public ScriptGroup getScriptGroupById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();		

		List<ScriptGroup> scriptGroups = session.createQuery("from ScriptGroup where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id).list();
			
		if (scriptGroups.size() == 0) return null;	
		
		return scriptGroups.get(0);
	}

	@Override
	public void removeScriptGroup(long projectId, long id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from scriptgroup where projectId=:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeScriptGroup", String.format("projectId:%s, id: %s", projectId, id));
	}


	
	@Override
	public List<ScriptInfo> findAllReferenceOfSubScriptByScript(long projectId, long scriptGroupId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select s.id, s.name ");
		sqlBuilder.append(" from script s ");
		sqlBuilder.append(" left join SubscriptReference r on r.subscriptId = s.id ");
		sqlBuilder.append(" where s.projectId =:projectId and r.projectId =:projectId and s.type='subscript' and s.ParentScriptGroupId = :scriptGroupId and r.subscriptId is not null ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptGroupId", scriptGroupId);
		
		buildQueryScriptInfoResult(query);
		
		List<ScriptInfo> scriptInfos = query.list();
		return scriptInfos;
	}

	@Override
	public List<ScriptInfo> findAllReferenceOfSubScriptByRecoverScript(long projectId, long scriptGroupId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select s.id, s.name ");
		sqlBuilder.append(" from script s ");
		sqlBuilder.append(" left join RecoverSubscriptReference r on r.subscriptId = s.id ");
		sqlBuilder.append(" where s.projectId =:projectId and r.projectId =:projectId and s.type='subscript' and s.ParentScriptGroupId  = :scriptGroupId and r.subscriptId is not null ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptGroupId", scriptGroupId);
		
		buildQueryScriptInfoResult(query);
		
		List<ScriptInfo> scriptInfos = query.list();
		return scriptInfos;
	}

	@Override
	public List<ScriptInfo> findAllScriptReferencedByTestset(long projectId, long scriptGroupId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select s.id, s.name ");
		sqlBuilder.append(" from script s ");
		sqlBuilder.append(" left join ScriptLink ts on s.id = ts.scriptId ");
		sqlBuilder.append(" where s.projectId =:projectId and ts.projectId =:projectId and s.type='testcase' and s.ParentScriptGroupId  = @scriptgroupid and ts.scriptId is not null ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("scriptGroupId", scriptGroupId);
		
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
}
