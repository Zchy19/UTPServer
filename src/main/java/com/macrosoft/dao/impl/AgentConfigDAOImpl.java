package com.macrosoft.dao.impl;

import java.util.List;


import com.macrosoft.dao.AgentConfigDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.AgentConfig;
import com.macrosoft.model.Project;

@Repository
public class AgentConfigDAOImpl implements AgentConfigDAO {
	
	private static final ILogger logger = LoggerFactory.Create(AgentConfigDAOImpl.class.getName());
	
	private SessionFactory sessionFactory;
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}

	@Override
	public void addAgentConfig(long projectId, AgentConfig agentConfig) {

		Session session = this.sessionFactory.getCurrentSession();
		List<Project> projects = session.createQuery("from Project where id=:projectId").setParameter("projectId", projectId).list();

		Project currentProject = projects.get(0);
		
		long newEntityId = currentProject.getNextEntityLogicId();
		agentConfig.setId(newEntityId);
		agentConfig.setProjectId(projectId);
		
		session.saveOrUpdate(agentConfig);
		
		// update project next script id.
		currentProject.setNextEntityLogicId(newEntityId + 1);
		session.update(currentProject);

		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addAgentConfig", String.format("projectId:%s, id: %s", projectId, agentConfig.getId()));
	}

	@Override
	public void updateAgentConfig(long projectId, AgentConfig agentConfig) {
		Session session = this.sessionFactory.getCurrentSession();
		session.update(agentConfig);
		logger.info("AgentConfig updated successfully, AgentConfig Details="+agentConfig);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<AgentConfig> getAgentConfigByName(long projectId, String antbotName) {
		Session session = this.sessionFactory.getCurrentSession();
		List<AgentConfig> agentConfigs = session.createQuery("from AgentConfig where ProjectId = :projectId and AgentInstanceName = :agentInstanceName").setParameter("projectId", projectId).setParameter("agentInstanceName", antbotName).list();
		return agentConfigs;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<AgentConfig> getAgentConfigByProjectId(long projectId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<AgentConfig> agentConfigs = session.createQuery("from AgentConfig where ProjectId = :projectId").setParameter("projectId", projectId).list();
		return agentConfigs;
	}
	
	
	@Override
	public AgentConfig getAgentConfigById(long projectId, long id) {
		Session session = this.sessionFactory.getCurrentSession();		
		List<AgentConfig> agentConfigs = session.createQuery("from AgentConfig where projectId =:projectId and id=:id")
				.setParameter("projectId", projectId)
				.setParameter("id", id).
				list();
		if (agentConfigs.size() == 0) return null;
		return agentConfigs.get(0);
	}

	@Override
	public void removeAgentConfig(long projectId, long id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from agentconfig where projectId=:projectId and id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("projectId", projectId);
		query.setParameter("id", id);
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeAgentConfig", String.format("projectId:%s, id: %s", projectId, id));
	}
	
	@Override
	public void sp_renameAntbotConfiguration(long projectId, long antbotConfigurationId, String oldAntbotName, String newAntbotName, String newSelectedBigData,String newRecordsetId)
	{
		Session session = this.sessionFactory.getCurrentSession();
		SQLQuery sqlQuery = session.createSQLQuery("CALL sp_renameAntbotConfiguration(:p_projectId,:antbotConfigurationId,:oldAntbotName,:newAntbotName,:newSelectedBigData,:newRecordsetId)");
		sqlQuery.setParameter("p_projectId", projectId);
		sqlQuery.setParameter("antbotConfigurationId", antbotConfigurationId);
		sqlQuery.setParameter("oldAntbotName", oldAntbotName);
		sqlQuery.setParameter("newAntbotName", newAntbotName);
		sqlQuery.setParameter("newSelectedBigData", newSelectedBigData);
		sqlQuery.setParameter("newRecordsetId", newRecordsetId);

		sqlQuery.executeUpdate();
		
		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "sp_renameAntbotConfiguration", 
				String.format("projectId:%s, antbotConfigurationId: %s, oldAntbotName: %s, newAntbotName: %s ", projectId, antbotConfigurationId, oldAntbotName, newAntbotName));
	}	
}
