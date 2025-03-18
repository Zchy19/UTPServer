package com.macrosoft.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.dto.AntbotInfoConfiguration;
import com.macrosoft.controller.dto.AntbotInfoConfigurationConverter;
import com.macrosoft.controller.dto.CreateAntbotResultInfo;
import com.macrosoft.controller.dto.NamedAntbotInfo;
import com.macrosoft.controller.dto.UpdateAntbotResultInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.AgentConfig;
import com.macrosoft.service.AgentConfigService;

@Controller
public class AgentConfigController {
	private static final ILogger logger = LoggerFactory.Create(AgentConfigController.class.getName());

	private AgentConfigService mAgentConfigService;

	private static final String FailedByExistsSameAntbotName = "FailedByExistsSameAntbotName";
	private static final String Success = "Success";

	@Autowired(required = true)
	public void setAgentConfigService(AgentConfigService ps) {
		this.mAgentConfigService = ps;
	}

	@RequestMapping(value = "/api/configuration/antbot/{projectId}/{antbotConfigurationId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<AntbotInfoConfiguration> getAgentConfig(@PathVariable("projectId") long projectId,
			@PathVariable("antbotConfigurationId") long antbotConfigurationId) {
		try {
			AgentConfig agentConfig = this.mAgentConfigService.getAgentConfigById(projectId, antbotConfigurationId);
			if (agentConfig == null)
				return new ApiResponse<AntbotInfoConfiguration>(ApiResponse.Success, null);
			AntbotInfoConfiguration config = AntbotInfoConfigurationConverter.ConvertToAntbotConfiguration(agentConfig);
			return new ApiResponse<AntbotInfoConfiguration>(ApiResponse.Success, config);
		} catch (Exception ex) {
			logger.error("getAgentConfig", ex);
			return new ApiResponse<AntbotInfoConfiguration>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/configuration/antbot/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<AntbotInfoConfiguration>> getAgentConfigsInProject(
			@PathVariable("projectId") long projectId) {

		List<AntbotInfoConfiguration> validAgentConfigs = new ArrayList<AntbotInfoConfiguration>();
		try {
			List<AgentConfig> agentConfigsInProject = this.mAgentConfigService.getAgentConfigByProjectId(projectId);
			for (AgentConfig agentConfig : agentConfigsInProject) {
				validAgentConfigs.add(AntbotInfoConfigurationConverter.ConvertToAntbotConfiguration(agentConfig));
			}
			return new ApiResponse<List<AntbotInfoConfiguration>>(ApiResponse.Success, validAgentConfigs);
		} catch (Exception ex) {
			logger.error("getAgentConfigsInProject", ex);
			return new ApiResponse<List<AntbotInfoConfiguration>>(ApiResponse.UnHandleException, null);
		}
		
	}

	@RequestMapping(value = "/api/configuration/antbot/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<CreateAntbotResultInfo> createAgentConfig(@RequestBody AntbotInfoConfiguration configuration) {

		CreateAntbotResultInfo resultInfo = new CreateAntbotResultInfo();

		try {
			List<AgentConfig> agentConfigs = this.mAgentConfigService.getAgentConfigByName(configuration.getProjectId(),
					configuration.getAntbotName());
			if (!agentConfigs.isEmpty()) {
				resultInfo.setResult(FailedByExistsSameAntbotName);

				return new ApiResponse<CreateAntbotResultInfo>(ApiResponse.Success, resultInfo);
			}

			AgentConfig agentConfig = AntbotInfoConfigurationConverter.ConvertToAgentConfig(configuration);
			this.mAgentConfigService.addAgentConfig(configuration.getProjectId(), agentConfig);
			resultInfo.setAntbotId(agentConfig.getId());
			resultInfo.setAntbotName(agentConfig.getAgentInstanceName());
			resultInfo.setAntbotType(agentConfig.getAgentType());
			resultInfo.setRecordsetName(agentConfig.getRecordsetName());
			resultInfo.setRecordsetId(agentConfig.getRecordsetId());
			resultInfo.setProtocolSignalId(agentConfig.getProtocolSignalId());
			resultInfo.setResult(Success);
			return new ApiResponse<CreateAntbotResultInfo>(ApiResponse.Success, resultInfo);
		} catch (Exception ex) {
			logger.error("createAgentConfig", ex);
			resultInfo.setResult(FailedByExistsSameAntbotName);
			return new ApiResponse<CreateAntbotResultInfo>(ApiResponse.UnHandleException, resultInfo);
		}
	}

	@RequestMapping(value = "/api/configurations/antbot/create", method = RequestMethod.POST)
	public @ResponseBody
	ApiResponse<List<ApiResponse<CreateAntbotResultInfo>>> createAgentConfigs(@RequestBody List<AntbotInfoConfiguration> configurations) {

		try {
			//创建结果集
			List<ApiResponse<CreateAntbotResultInfo>> resultInfo = new ArrayList<ApiResponse<CreateAntbotResultInfo>>();
			//遍历配置信息，逐个创建
			for (AntbotInfoConfiguration configuration : configurations) {
				ApiResponse<CreateAntbotResultInfo> agentConfig = createAgentConfig(configuration);
				resultInfo.add(agentConfig);
			}
			return new ApiResponse<List<ApiResponse<CreateAntbotResultInfo>>>(ApiResponse.Success, resultInfo);
		} catch (Exception ex) {
			logger.error("createAgentConfig", ex);
			return new ApiResponse<List<ApiResponse<CreateAntbotResultInfo>>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/configuration/antbot/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<UpdateAntbotResultInfo> editAgentConfig(@RequestBody NamedAntbotInfo newAntbotInfo) {

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editAgentConfig");

		UpdateAntbotResultInfo resultInfo = new UpdateAntbotResultInfo();

		try {

			AgentConfig agentConfig = this.mAgentConfigService.getAgentConfigById(newAntbotInfo.getProjectId(),
					newAntbotInfo.getId());

			List<AgentConfig> agentConfigs = this.mAgentConfigService.getAgentConfigByName(agentConfig.getProjectId(),
					newAntbotInfo.getNewAntbotName());
			if (!agentConfigs.isEmpty()) {
				for (AgentConfig config : agentConfigs) {
					if(config.getId() != agentConfig.getId()){
						resultInfo.setResult(FailedByExistsSameAntbotName);
						return new ApiResponse<UpdateAntbotResultInfo>(ApiResponse.Success, resultInfo);
					}
				}
			}

			String oldAntbotName = agentConfig.getAgentInstanceName();
			this.mAgentConfigService.sp_renameAntbotConfiguration(newAntbotInfo.getProjectId(), newAntbotInfo.getId(),
					oldAntbotName, newAntbotInfo.getNewAntbotName(),newAntbotInfo.getNewSelectedBigData(), newAntbotInfo.getNewRecordsetId());
			resultInfo.setAntbotId(newAntbotInfo.getId());
			resultInfo.setAntbotName(newAntbotInfo.getNewAntbotName());
			resultInfo.setNewRecordsetId(newAntbotInfo.getNewRecordsetId());
			resultInfo.setProtocolSignalId(newAntbotInfo.getNewSelectedBigData());

			resultInfo.setResult(Success);
			return new ApiResponse<UpdateAntbotResultInfo>(ApiResponse.Success, resultInfo);
		} catch (Exception ex) {
			logger.error("editAgentConfig", ex);
			resultInfo.setResult("UnknownError");
			return new ApiResponse<UpdateAntbotResultInfo>(ApiResponse.UnHandleException, resultInfo);
		}

	}

	@RequestMapping(value = "/api/configuration/antbot/delete/{projectId}/{antbotConfigurationId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteAgentConfig(@PathVariable("projectId") long projectId,
			@PathVariable("antbotConfigurationId") long antbotConfigurationId) {

		try {

			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteAgentConfig");
			this.mAgentConfigService.removeAgentConfig(projectId, antbotConfigurationId);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteAgentConfig", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

}
