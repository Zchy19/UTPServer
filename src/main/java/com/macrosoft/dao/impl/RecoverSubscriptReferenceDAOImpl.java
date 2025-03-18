package com.macrosoft.dao.impl;

import java.util.List;


import com.macrosoft.dao.RecoverSubscriptReferenceDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;


import com.macrosoft.controller.dto.RecoverSubscriptReferenceInfo;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Project;
import com.macrosoft.model.RecoverSubscriptReference;

@Repository
public class RecoverSubscriptReferenceDAOImpl implements RecoverSubscriptReferenceDAO {

	private static final ILogger logger = LoggerFactory.Create(RecoverSubscriptReferenceDAOImpl.class.getName());
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}
	
	@Override
	public void addRecoverSubscriptReference(long projectId, RecoverSubscriptReference reference) {

		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projects = session.createQuery("from Project where id=:projectId").setParameter("projectId", projectId).list();

		Project currentProject = projects.get(0);
		
		long newEntityId = currentProject.getNextEntityLogicId();
		reference.setId(newEntityId);
		reference.setProjectId(projectId);
		
		session.saveOrUpdate(reference);
		
		// update project next script id.
		currentProject.setNextEntityLogicId(newEntityId + 1);
		session.update(currentProject);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addRecoverSubscriptReference", String.format("projectId:%s, id: %s", projectId, reference.getId()));
	}


	@Override
	public void updateRecoverSubscriptReference(long projectId, RecoverSubscriptReference reference) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(reference);

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateRecoverSubscriptReference", String.format("projectId:%s, id: %s", projectId, reference.getId()));
	}
	

	@SuppressWarnings("unchecked")
	@Override
	public List<RecoverSubscriptReference> listRecoverSubscriptReference(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<RecoverSubscriptReference> recoverSubscriptReferences = session.createQuery("from RecoverSubscriptReference where projectId=:projectId")
				.setParameter("projectId", projectId).list();
		return recoverSubscriptReferences;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<RecoverSubscriptReference> listRecoverSubscriptBySubscriptId(long projectId, long subscriptId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<RecoverSubscriptReference> recoverSubscriptReferences = session.createQuery("from RecoverSubscriptReference where projectId =:projectId and subscriptId=:subscriptId")
				.setParameter("projectId", projectId)
				.setParameter("subscriptId", subscriptId).list();
		return recoverSubscriptReferences;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public RecoverSubscriptReference getRecoverSubscriptReference(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();
		List<RecoverSubscriptReference> RecoverSubscriptReferences = session.createQuery("from RecoverSubscriptReference where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id).list();
			
		if (RecoverSubscriptReferences.size() == 0) return null;
		return RecoverSubscriptReferences.get(0);
	}
	
	@Override
	public void removeRecoverSubscriptReference(long projectId, long id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from recoversubscriptreference where projectId=:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeRecoverSubscriptReference", String.format("projectId:%s, id: %s", projectId, id));
	}

	@Override
	public List<RecoverSubscriptReference> findReferenceOfRecoverSubscriptBySubscriptId(long projectId, long subscriptId) {

		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select * ");
		sqlBuilder.append(" from RecoverSubscriptReference ");
		sqlBuilder.append(" where subscriptId=:subscriptId and projectId = :projectId");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("subscriptId", subscriptId);
		query.setParameter("projectId", projectId);
		
		buildQueryRecoverSubscriptReferenceResult(query);
		
		List<RecoverSubscriptReference> references = query.list();
		return references;
	}

	@Override
	public List<RecoverSubscriptReferenceInfo> listRecoverSubscriptReferenceInfosByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select r.*, s.name as subscriptName, (r.id = p.defaultRecoverSubscriptId) as isDefault ");
		sqlBuilder.append(" from RecoverSubscriptReference r ");
		sqlBuilder.append(" left join script s on r.subscriptid = s.id and s.projectId = r.projectId");		
		sqlBuilder.append(" left join project p on p.id = r.projectid ");		
		sqlBuilder.append(" where r.projectId =:projectId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		
		buildQueryRecoverSubscriptReferenceInfoResult(query);
		
		List<RecoverSubscriptReferenceInfo> referenceInfos = query.list();
		return referenceInfos;
	}

	@Override
	public RecoverSubscriptReferenceInfo getRecoverSubscriptReferenceInfo(long projectId, long referenceId) {
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" select r.*, s.name as subscriptName, (r.id = p.defaultRecoverSubscriptId) as isDefault ");
		sqlBuilder.append(" from RecoverSubscriptReference r ");
		sqlBuilder.append(" left join script s on r.subscriptid = s.id and r.projectId = s.projectId");		
		sqlBuilder.append(" left join project p on p.id = r.projectid ");		
		sqlBuilder.append(" where r.id =:referenceId ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("referenceId", referenceId);
		
		buildQueryRecoverSubscriptReferenceInfoResult(query);
		
		List<RecoverSubscriptReferenceInfo> referenceInfos = query.list();
		if (referenceInfos.isEmpty())
		{
			return null;
		}
		
		return referenceInfos.get(0);
	}
	
	private SQLQuery buildQueryRecoverSubscriptReferenceInfoResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(RecoverSubscriptReferenceInfo.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("subscriptId", StandardBasicTypes.LONG);
		query.addScalar("subscriptName", StandardBasicTypes.STRING);
		query.addScalar("isDefault", StandardBasicTypes.BOOLEAN);
		return query;
	}
	
	private SQLQuery buildQueryRecoverSubscriptReferenceResult(SQLQuery query)
	{
		query.setResultTransformer(Transformers.aliasToBean(RecoverSubscriptReference.class));
		query.addScalar("id", StandardBasicTypes.LONG);
		query.addScalar("projectId", StandardBasicTypes.LONG);
		query.addScalar("name", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("subscriptId", StandardBasicTypes.LONG);
		return query;
	}
}
