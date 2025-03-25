package com.macrosoft.dao.impl;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Project;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

@Repository
public class ProjectDAOImpl implements ProjectDAO {

	private static final ILogger logger = LoggerFactory.Create(ProjectDAOImpl.class.getName());
	private static Lock lock = new ReentrantLock();
	
	private SessionFactory sessionFactory;

	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}


	@Override
	public void addProject(Project project) {
        try {
        	lock.lock();
    		Session session = this.sessionFactory.getCurrentSession();
    		session.saveOrUpdate(project);
    		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addProject", String.format("id: %s", project.getId()));
        } catch (Exception ex) {
        	logger.error("addProject", ex);
        }finally{
            lock.unlock();
        }
	}

	@Override
	public void addProjectWithDefalutScriptGroup(Project project) {
        try {
        	lock.lock();
    		Session session = this.sessionFactory.getCurrentSession();
    		session.saveOrUpdate(project);
    		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_project_onProjectCreated(:projectId)");
    		sqlQuery.setParameter("projectId", project.getId());
    		sqlQuery.executeUpdate();

    		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addProjectWithDefalutScriptGroup", String.format("id: %s", project.getId()));
        } catch (Exception ex) {
        	logger.error("addProjectWithDefalutScriptGroup", ex);
        }finally{
            lock.unlock();
        }
	}
	

	@Override
	public void updateCustomizedScriptFields(long projectId, String customizedScriptFields) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update project set customizedScriptFields=:customizedScriptFields  ");
		sqlBuilder.append(" where id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", projectId);
		query.setParameter("customizedScriptFields", customizedScriptFields);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateCustomizedScriptFields", String.format("id: %s", projectId));
	}
	

	@Override
	public void updateCustomizedReqFields(long projectId, String customizedReqFields) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update project set customizedReqFields=:customizedReqFields  ");
		sqlBuilder.append(" where id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", projectId);
		query.setParameter("customizedReqFields", customizedReqFields);
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateCustomizedReqFields", String.format("id: %s", projectId));
	}

	@Override
	public List<Project> getAllProjects() {
		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projectList = session.createQuery("from Project").list();
		return projectList;
	}


	@Override
	public void updateProject(Project project) {
		Session session = this.sessionFactory.getCurrentSession();

		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" update project set name =:name,organizationId=:organizationId, description=:description, defaultRecoverSubscriptId =:defaultRecoverSubscriptId, targetObjectDescription =:targetObjectDescription, templateType=:templateType,autoIntoUser=:autoIntoUser");
		sqlBuilder.append(" where id=:id ");

		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", project.getId());
		query.setParameter("name", project.getName());
		query.setParameter("organizationId", project.getOrganizationId());
		query.setParameter("description", project.getDescription());
		query.setParameter("defaultRecoverSubscriptId", project.getDefaultRecoverSubscriptId());
		query.setParameter("targetObjectDescription", project.getTargetObjectDescription());
		query.setParameter("templateType", project.getTemplateType());
		query.setParameter("autoIntoUser", project.getAutoIntoUser());
		query.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "updateProject", String.format("id: %s", project.getId()));
	}
	

	@SuppressWarnings("unchecked")
	@Override
	public List<Project> listProjects(String orgId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projects = session.createQuery("from Project where OrganizationId = :OrganizationId order by Name asc").setParameter("OrganizationId", orgId).list();
		return projects;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Project> listProjectsByTemplateType(long orgId, int templateType) {
		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projects = session.createQuery("from Project where OrganizationId = :OrganizationId and templateType = :templateType order by Name ASC")
				.setParameter("OrganizationId", orgId).setParameter("templateType", templateType).list();
		return projects;
	}

	//根据项目名称查询项目
	@Override
	public List<Project> listProjectByProjectName(long orgId, String projectName) {
		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projects = session.createQuery("from Project where OrganizationId = :OrganizationId and Name = :Name")
				.setParameter("OrganizationId", orgId).setParameter("Name", projectName).list();
		return projects;
	}

	@Override
	public Project getProjectById(long id) {
		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projects = session.createQuery("from Project where id=:id").setParameter("id", id).list();

		if (projects.size() == 0) return null;	
		return projects.get(0);
	}

	@Override
	public void removeProject(long id) {

		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_delete_project(:projectId)");
		sqlQuery.setParameter("projectId", id);
		sqlQuery.executeUpdate();

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeProject", String.format("id: %s", id));
	}
	

	@Override
	public void copyProjectData(long sourceProjectId, long targetProjectId) {

		copyRequirementUnderProject(sourceProjectId, targetProjectId);
		
		copyScriptGroupsUnderProject(sourceProjectId, targetProjectId);

		copyScriptsUnderProject(sourceProjectId, targetProjectId);

		copyScriptRequirementMappingUnderProject(sourceProjectId, targetProjectId);
		
		copySubscriptReferenceUnderProject(sourceProjectId, targetProjectId);
		
		copyAntbotsUnderProject(sourceProjectId, targetProjectId);

		copyExceptionRecoversUnderProject(sourceProjectId, targetProjectId);
		
		copyTestsetUnderProject(sourceProjectId, targetProjectId);
		
		copyScriptLinksUnderProject(sourceProjectId, targetProjectId);

		copyMonitoringtestsetUnderProject(sourceProjectId, targetProjectId);

		copySpecialTestUnderProject(sourceProjectId, targetProjectId);
	}

	private void copySpecialTestUnderProject(long sourceProjectId, long targetProjectId){
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" insert into specialtest (Id, ProjectId, Name, Description, ScriptId)  ");
		sqlBuilder.append(" select Id, :targetProjectId, Name, Description, ScriptId  ");
		sqlBuilder.append(" from specialtest where projectId = :sourceProjectId");
		logger.debug("copySpecialTestUnderProject: ="+ sqlBuilder.toString());
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
	}
	private void copyMonitoringtestsetUnderProject(long sourceProjectId, long targetProjectId){
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();
		sqlBuilder.append(" insert into monitoringtestset (Id, ProjectId, Name, Description, StartScriptId, SendCommandScriptId, StopScriptId, Type)  ");
		sqlBuilder.append(" select Id, :targetProjectId, Name, Description, StartScriptId, SendCommandScriptId, StopScriptId, Type  ");
		sqlBuilder.append(" from monitoringtestset where projectId = :sourceProjectId");
		logger.debug("copyMonitoringtestsetUnderProject: ="+ sqlBuilder.toString());
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
	}
	private void copyRequirementUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into requirement (Id, ProjectId, Title, Description, ParentId, Comment, Type, Leaf, CustomizedId)  ");
		sqlBuilder.append(" select Id, :targetProjectId, Title, Description, ParentId, Comment, Type, Leaf, CustomizedId  ");
		sqlBuilder.append(" from requirement where projectId = :sourceProjectId");


		logger.debug("copyRequirementUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}

	private void copyScriptRequirementMappingUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into scriptrequirementmapping (ProjectId, ScriptId, RequirementId )  ");
		sqlBuilder.append(" select :targetProjectId, ScriptId, RequirementId   ");
		sqlBuilder.append(" from scriptrequirementmapping where projectId = :sourceProjectId");

		logger.debug("copyScriptRequirementMappingUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}
	
	private void copySubscriptReferenceUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into subscriptreference (subscriptId, parentScriptId, projectId)  ");
		sqlBuilder.append(" select subscriptId, parentScriptId, :targetProjectId  ");
		sqlBuilder.append(" from subscriptreference where projectId = :sourceProjectId ");


		logger.debug("copySubscriptReferenceUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}
	
	private void copyAntbotsUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into agentconfig (Id, ProjectId, AgentType, AgentInstanceName, recordsetId, recordsetName, protocolSignalId)  ");
		sqlBuilder.append(" select Id, :targetProjectId, AgentType, AgentInstanceName, recordsetId, recordsetName, protocolSignalId  ");
		sqlBuilder.append(" from agentconfig where projectId = :sourceProjectId");


		logger.debug("copyAntbotsUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}

	private void copyExceptionRecoversUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into recoversubscriptreference (Id, ProjectId, name, description, subscriptId)  ");
		sqlBuilder.append(" select Id, :targetProjectId, name, description, subscriptId  ");
		sqlBuilder.append(" from recoversubscriptreference where projectId = :sourceProjectId");


		logger.debug("copyExceptionRecoversUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();		
	}
	
	private void copyScriptGroupsUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into scriptgroup (Id, ProjectId, Name, Description, ParentScriptGroupId)  ");
		sqlBuilder.append(" select id, :targetProjectId, Name, Description, ParentScriptGroupId  ");
		sqlBuilder.append(" from scriptgroup where projectId = :sourceProjectId");


		logger.debug("copyScriptGroupsUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();		
	}
	
	private void copyScriptsUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into script (Id, ProjectId, Name, Description, ParentScriptGroupId, Script, BlockyXml, Parameter, Type,CustomizedId)  ");
		sqlBuilder.append(" select id, :targetProjectId, Name, Description, ParentScriptGroupId, Script, BlockyXml, Parameter, Type, CustomizedId");
		sqlBuilder.append(" from script where projectId = :sourceProjectId");


		logger.debug("copyScriptsUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}

	private void copyTestsetUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into testset (Id, ProjectId, Name, Description)  ");
		sqlBuilder.append(" select id, :targetProjectId, Name, Description  ");
		sqlBuilder.append(" from testset where projectId = :sourceProjectId");


		logger.debug("copyTestsetUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}

	private void copyScriptLinksUnderProject(long sourceProjectId, long targetProjectId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" insert into scriptlink (Id, ProjectId, TestSetId, ScriptId, Name, Description)  ");
		sqlBuilder.append(" select id, :targetProjectId, TestSetId, ScriptId, Name, Description  ");
		sqlBuilder.append(" from scriptlink where projectId = :sourceProjectId");


		logger.debug("copyScriptLinksUnderProject: ="+ sqlBuilder.toString());
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("targetProjectId", targetProjectId);
		query.setParameter("sourceProjectId", sourceProjectId);
		query.executeUpdate();
		
	}
}
