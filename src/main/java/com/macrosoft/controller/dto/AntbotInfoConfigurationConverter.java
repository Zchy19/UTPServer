package com.macrosoft.controller.dto;

import com.macrosoft.model.AgentConfig;

public class AntbotInfoConfigurationConverter {

	public static AntbotInfoConfiguration ConvertToAntbotConfiguration(AgentConfig agentConfig) {
		AntbotInfoConfiguration configuration = new AntbotInfoConfiguration();
		configuration.setId(agentConfig.getId());
		configuration.setAntbotName(agentConfig.getAgentInstanceName());
		configuration.setAntbotType(agentConfig.getAgentType());
		configuration.setProjectId(agentConfig.getProjectId());
		configuration.setRecordsetId(agentConfig.getRecordsetId());
		configuration.setProtocolSignalId(agentConfig.getProtocolSignalId());
		configuration.setRecordsetName(agentConfig.getRecordsetName());

		return configuration;
	}

	public static AgentConfig ConvertToAgentConfig(AntbotInfoConfiguration configuration) {
		AgentConfig agentConfig = new AgentConfig();
		agentConfig.setId(configuration.getId());
		agentConfig.setAgentInstanceName(configuration.getAntbotName());
		agentConfig.setAgentType(configuration.getAntbotType());
		agentConfig.setProjectId(configuration.getProjectId());
		agentConfig.setRecordsetId(configuration.getRecordsetId());
		agentConfig.setRecordsetName(configuration.getRecordsetName());
		agentConfig.setProtocolSignalId(configuration.getProtocolSignalId());
		return agentConfig;
	}
}
