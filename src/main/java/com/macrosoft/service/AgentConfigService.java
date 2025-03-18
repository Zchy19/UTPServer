package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.AgentConfig;

public interface AgentConfigService {
	public void addAgentConfig(long projectId, AgentConfig p);
	public void updateAgentConfig(long projectId, AgentConfig p);
	public List<AgentConfig> getAgentConfigByName(long projectId, String antbotName);
	public List<AgentConfig> getAgentConfigByProjectId(long projectId);
	public AgentConfig getAgentConfigById(long projectId, long id);
	public void removeAgentConfig(long projectId, long id);
	public void sp_renameAntbotConfiguration(long projectId, long antbotConfigurationId, String oldAntbotName, String newAntbotName,String newSelectedBigData,String newRecordsetId);
	
}
