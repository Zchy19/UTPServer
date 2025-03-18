package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.AgentConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.AgentConfigDAO;
import com.macrosoft.model.AgentConfig;

@Service
public class AgentConfigServiceImpl implements AgentConfigService {
	
	private AgentConfigDAO AgentConfigDAO;

	@Autowired
	public void setAgentConfigDAO(AgentConfigDAO AgentConfigDAO) {
		this.AgentConfigDAO = AgentConfigDAO;
	}
	
	@Override
	@Transactional
	public void addAgentConfig(long projectId, AgentConfig p) {
		p.setId(0);
		this.AgentConfigDAO.addAgentConfig(projectId, p);
	}

	@Override
	@Transactional
	public void updateAgentConfig(long projectId, AgentConfig p) {
		this.AgentConfigDAO.updateAgentConfig(projectId, p);
	}

	@Override
	@Transactional
	public List<AgentConfig> getAgentConfigByName(long projectId, String antbotName) {
		return this.AgentConfigDAO.getAgentConfigByName(projectId, antbotName);
	}

	@Override
	@Transactional
	public List<AgentConfig> getAgentConfigByProjectId(long projectId)
	{
		return this.AgentConfigDAO.getAgentConfigByProjectId(projectId);
	}
	
	@Override
	@Transactional
	public AgentConfig getAgentConfigById(long projectId, long id) {
		return this.AgentConfigDAO.getAgentConfigById(projectId, id);
	}

	@Override
	@Transactional
	public void removeAgentConfig(long projectId, long id) {
		this.AgentConfigDAO.removeAgentConfig(projectId, id);
	}

	@Override
	@Transactional
	public void sp_renameAntbotConfiguration(long projectId, long antbotConfigurationId, String oldAntbotName, String newAntbotName,String newSelectedBigData,String newRecordsetId) {
		this.AgentConfigDAO.sp_renameAntbotConfiguration(projectId,antbotConfigurationId, oldAntbotName, newAntbotName,newSelectedBigData,newRecordsetId);
	}
}
