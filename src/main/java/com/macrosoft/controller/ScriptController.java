package com.macrosoft.controller;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.service.*;
import com.macrosoft.urs.UrsServiceApis;
import com.macrosoft.utilities.ExportTestCaseUtility;
import com.macrosoft.utilities.StringUtility;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.ServletContext;
import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Controller
public class ScriptController {
	private static final ILogger logger = LoggerFactory.Create(ScriptController.class.getName());
	
	private ProjectService mProjectService;
	private ScriptService mScriptService;
	private ScriptGroupService mScriptGroupService;
	private UrsConfigurationImpl ursConfig;
	private AgentConfigService mAgentConfigService;

	
	private RequirementService mRequirementService;

    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

	@Autowired(required = true)
	
	public void setAgentConfigService(AgentConfigService ps) {
		this.mAgentConfigService = ps;
	}

    
	@Autowired(required = true)
	
	public void setScriptGroupService(ScriptGroupService scriptGroupService) {
		this.mScriptGroupService = scriptGroupService;
	}
	
	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.mScriptService = scriptService;
	}
	
	@Autowired(required = true)
	
	public void setProjectService(ProjectService ps) {
		this.mProjectService = ps;
	}
	
	@Autowired(required = true)
	
	public void setAgentConfigService(RequirementService requirementService) {
		this.mRequirementService = requirementService;
	}
	
	@Autowired
	ServletContext context;

	@RequestMapping(value = "/api/script/{projectId}/{scriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ScriptInfo> getScriptInfo(@PathVariable("projectId") long projectId,
			@PathVariable("scriptId") long scriptId) {
		try {
			ScriptInfo result = this.mScriptService.getScriptInfoById(projectId, scriptId);
			return new ApiResponse<ScriptInfo>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error(String.format("getScriptInfoById has exception - :%s", ex.toString()));
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptMessageInfo> createScriptInfo(@RequestBody Script script) {
		try {
			boolean isMaxScriptNum = this.mScriptService.isOverMaxScriptNum(script.getProjectId(), "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				ScriptMessageInfo scriptInfo = new ScriptMessageInfo();
				scriptInfo.setErrorMessages("OVER_MAX_SCRIPT_NUM");
				return new ApiResponse<ScriptMessageInfo>(ApiResponse.UnHandleException, scriptInfo);
			}
			script.setType(ScriptType.TestCaseType);
			Script result = this.mScriptService.addScript(script.getProjectId(), script);
			ScriptMessageInfo scriptMessageInfo = new ScriptMessageInfo(result);
			return new ApiResponse<ScriptMessageInfo>(ApiResponse.Success,scriptMessageInfo);
			
		} catch (Exception ex) {
			logger.error("createScriptInfo", ex);
			return new ApiResponse<ScriptMessageInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/delete/{projectId}/{scriptId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<DeleteScriptResponse> deleteScript(@PathVariable("projectId") long projectId,
			@PathVariable("scriptId") long scriptId) {

		try {

			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteScript");
			DeleteScriptResponse result = this.mScriptService.deleteScript(projectId, scriptId);
			return new ApiResponse<DeleteScriptResponse>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("deleteScript", ex);
			return new ApiResponse<DeleteScriptResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/reference/{projectId}/{scriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<CheckScriptReferenceResponse> checkScriptReference(@PathVariable("projectId") long projectId,
			@PathVariable("scriptId") long scriptId) {

		try {
			CheckScriptReferenceResponse result = this.mScriptService.checkScriptReference(projectId, scriptId);
			return new ApiResponse<CheckScriptReferenceResponse>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("checkScriptReference", ex);
			return new ApiResponse<CheckScriptReferenceResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptInfo> editScriptInfo(@RequestBody ScriptInfo scriptInfo) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptInfo");
			ScriptInfo result = this.mScriptService.updateScriptInfo(scriptInfo.getProjectId(), scriptInfo);
			return new ApiResponse<ScriptInfo>(ApiResponse.Success,result);

		} catch (Exception ex) {
			logger.error("editScriptInfo", ex);
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/rename", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptInfo> renameScriptInfo(@RequestBody ScriptInfo scriptInfo) {
		try {
			this.mScriptService.renameScript(scriptInfo.getProjectId(), scriptInfo.getId(), scriptInfo.getName());
			ScriptInfo result = this.mScriptService.getScriptInfoById(scriptInfo.getProjectId(), scriptInfo.getId());
			return new ApiResponse<ScriptInfo>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("renameScriptInfo", ex);
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/transitToSubscript", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TransitToSubScriptResponse> transitToSubscript(@RequestBody ScriptIdentifier scriptIdentifier) {
		try {			
			TransitToSubScriptResponse result = this.mScriptService.transitToSubscript(scriptIdentifier.getProjectId(), scriptIdentifier.getScriptId());
			return new ApiResponse<TransitToSubScriptResponse>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("transitToSubscript", ex);
			return new ApiResponse<TransitToSubScriptResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/transitToScript", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TransitToScriptResponse> transitToScript(@RequestBody SubScriptIdentifier scriptIdentifier) {
		try {			
			TransitToScriptResponse result = this.mScriptService.transitToScript(scriptIdentifier.getProjectId(), scriptIdentifier.getSubscriptId());
			return new ApiResponse<TransitToScriptResponse>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("transitToScript", ex);
			return new ApiResponse<TransitToScriptResponse>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/script/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ScriptInfo>> getScriptInfosByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<ScriptInfo> result = this.mScriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.Success,result);

		} catch (Exception ex) {
			logger.error("getScriptInfosByProjectId", ex);
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/scriptFlatData/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ScriptGroupAndScriptFlatData> getScriptFlatData(
			@PathVariable("projectId") long projectId) {
		try {
			ScriptGroupAndScriptFlatData result = new ScriptGroupAndScriptFlatData(); 
			result.scripts = this.mScriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
			result.scriptGroups = this.mScriptGroupService.listScriptGroups(projectId);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptFlatData", ex);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.UnHandleException, null);
		}		
	}
	
	@RequestMapping(value = "/api/script/copy/{projectId}/{sourceScriptId}/{targetParentScriptGroupId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptInfo> copyScript(@PathVariable("projectId") long projectId,
			@PathVariable("sourceScriptId") long sourceScriptId,
			@PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
		try {
			boolean isMaxScriptNum = this.mScriptService.isOverMaxScriptNum(projectId, "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				ScriptInfo scriptInfo = new ScriptInfo();
				scriptInfo.setErrorMessages("OVER_MAX_SCRIPT_NUM");
				return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, scriptInfo);
			}
			Script script = this.mScriptService.copyPasteScript(projectId, sourceScriptId, targetParentScriptGroupId);
			ScriptInfo result = this.mScriptService.getScriptInfoById(projectId, script.getId());
			return new ApiResponse<ScriptInfo>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("copyScript", ex);
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/cut/{projectId}/{sourceScriptId}/{targetParentScriptGroupId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptInfo> cutScript(@PathVariable("projectId") long projectId,
			@PathVariable("sourceScriptId") long sourceScriptId,
			@PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
		try {
			ScriptInfo result = this.mScriptService.cutPasteScript(projectId, sourceScriptId, targetParentScriptGroupId);
			return new ApiResponse<ScriptInfo>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("cutScript", ex);
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/data/{projectId}/{scriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Script> getScriptData(@PathVariable("projectId") long projectId,
			@PathVariable("scriptId") long scriptId) {
		try {
			Script result = this.mScriptService.getScriptById(projectId, scriptId);
			return new ApiResponse<Script>(ApiResponse.Success,result);
		} catch (Exception ex) {
			logger.error("getScriptData", ex);
			return new ApiResponse<Script>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/data/byScriptIds/{projectId}/{scriptIds}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<Script>> getScriptsByScriptIds(@PathVariable("projectId") long projectId,
			@PathVariable("scriptIds") Long[] scriptIds) {
		try {
			// use parameter type to ensure parameter is valid.
			String sIds = "";
			for (Long scriptId : scriptIds) {
				if (sIds.isEmpty()) {
					sIds = Long.toString(scriptId);
				} else {
					sIds = sIds + "," + Long.toString(scriptId);
				}
			}

			List<Script> scripts = this.mScriptService.getScriptsByScriptIds(projectId, sIds, ScriptType.TestCaseType);
			return new ApiResponse<List<Script>>(ApiResponse.Success, scripts);
		} catch (Exception ex) {
			logger.error("getScriptsByScriptIds", ex);
			return new ApiResponse<List<Script>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/script/data/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Script> editScriptData(@RequestBody Script script) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptData");
			script.setType(ScriptType.TestCaseType);
			this.mScriptService.updateScript(script.getProjectId(), script);
			return new ApiResponse<Script>(ApiResponse.Success, script);
		} catch (Exception ex) {
			logger.error("editScriptData", ex);
			return new ApiResponse<Script>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/scriptGroup/export/{projectId}/{scriptGroupId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<DownloadingInfo> exportScriptGroupToWord(@PathVariable("projectId") long projectId,
																 @PathVariable("scriptGroupId") long scriptGroupId) {
		try {
			
			String unitName = "";
			
			if (scriptGroupId != 0)
			{
				ScriptGroup scriptGroup = this.mScriptGroupService.getScriptGroupById(projectId, scriptGroupId);
				if (scriptGroup == null)
				{
					logger.info(String.format("scriptGroup:%s, projectId: %s, can not find scriptGroup to export.", scriptGroup, projectId));
					return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
				}
				
				unitName = scriptGroup.getName();
			}
			else
			{
				Project project = this.mProjectService.getProjectById(projectId);
				if (project != null) {
                    unitName = project.getName();
                }
			}

			prepareCommandDefinition(projectId);
			
			List<ScriptInfo> collectedScripts = new ArrayList<ScriptInfo>();
			
			collectScriptsByScriptGroupId(projectId, scriptGroupId, collectedScripts);
			
			List<ExportScriptData> exportScriptDatas = new ArrayList<ExportScriptData>();
			
			for (ScriptInfo scriptInfo : collectedScripts)
			{
				Script script = this.mScriptService.getScriptById(projectId, scriptInfo.getId());
				if (script == null) {
                    continue;
                }
				
				ExportScriptData exportScriptData = getExportScriptData(projectId, script);
				if (exportScriptData == null) {
                    continue;
                }
				exportScriptDatas.add(exportScriptData);
			}
			
			
			String fileName = String.format("ScriptGroup_%s_%s.docx", unitName, StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			fileName = fileName.replace(":", "_");
			fileName = fileName.replace(" ", "_");
			fileName = fileName.replace("-", "_");
			
			File destinationFile = new File(ReportUtility.GetDownloadPath(context, fileName));
			
			ReportUtility.CreateFolderIfNotExist(context);
		
			boolean result = ExportTestCaseUtility.exportScript(destinationFile.getAbsolutePath(), exportScriptDatas);
			if (!result)
			{
				return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
			}
			
			DownloadingInfo info = new DownloadingInfo();
			info.setFileName(fileName);
			info.setFilePath(ReportUtility.GetStaticDownloadPath(fileName));
			
			return new ApiResponse<DownloadingInfo>(ApiResponse.Success, info);
			
		} catch (Exception ex) {
			logger.error(String.format("exportScriptToWord has exception - :%s", ex.toString()));
			return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
		}
	}
	
	@RequestMapping(value = "/api/script/export/{projectId}/{scriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<DownloadingInfo> exportScriptToWord(@PathVariable("projectId") long projectId,
																 @PathVariable("scriptId") long scriptId) {
		try {
			
			Script script = this.mScriptService.getScriptById(projectId, scriptId);
			if (script == null)
			{
				logger.info(String.format("scriptId:%s, projectId: %s, can not find script to export.", scriptId, projectId));
				return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
			}
			
			prepareCommandDefinition(script.getProjectId());
			
			ExportScriptData exportScriptData = getExportScriptData(projectId, script);
		
			String fileName = String.format("Script_%s_%s.docx", script.getName(), StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			fileName = fileName.replace(":", "_");
			fileName = fileName.replace(" ", "_");
			fileName = fileName.replace("-", "_");
			
			File destinationFile = new File(ReportUtility.GetDownloadPath(context, fileName));
			
			ReportUtility.CreateFolderIfNotExist(context);
		
			boolean result = ExportTestCaseUtility.exportScript(destinationFile.getAbsolutePath(), exportScriptData);
			if (!result)
			{
				return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
			}
			
			DownloadingInfo info = new DownloadingInfo();
			info.setFileName(fileName);
			info.setFilePath(ReportUtility.GetStaticDownloadPath(fileName));
			
			return new ApiResponse<DownloadingInfo>(ApiResponse.Success, info);
			
		} catch (Exception ex) {
			logger.error(String.format("exportScriptToWord has exception - :%s", ex.toString()));
			return new ApiResponse<DownloadingInfo>(ApiResponse.UnHandleException, null);
		}
	}

		//	更新4.5.0版本之前子脚本的脚本类型,外部调用更新子脚本使用
	@RequestMapping(value = "/api/updateSubScript", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Boolean> updateSubScript() {
		try {
			boolean b = this.mScriptService.updateSubScript();
			logger.info("updateSubScript - " + b);
			this.mScriptService.updateScript();
			return  new ApiResponse<>(ApiResponse.Success, b);
		} catch (Exception ex) {
			logger.error(String.format("updateSubScript - :%s", ex.toString()));
			return new ApiResponse<>(ApiResponse.UnHandleException, false);
		}
	}

	
	private void collectScriptsByScriptGroupId(long projectId, long scriptGroupId, List<ScriptInfo> collectedScripts)
	{
		List<ScriptInfo> scriptInfos = this.mScriptService.listScriptInfosByParentScriptGroupId(projectId, scriptGroupId);
		collectedScripts.addAll(scriptInfos);
		for (ScriptInfo scriptInfo : scriptInfos)
		{
			logger.info(String.format("collectScriptsByScriptGroupId()->script - id:%s, name:%s.", scriptInfo.getId(), scriptInfo.getName()));
		}
		
		List<ScriptGroup> scriptGroups = null; 
		if (scriptGroupId == 0)
		{
			scriptGroups = this.mScriptGroupService.listScriptGroupsInTopLevel(projectId);
		}
		else
		{
			scriptGroups = this.mScriptGroupService.listScriptGroupsByParentScriptGroupId(projectId, scriptGroupId);
		}
		
		for (ScriptGroup scriptGroup : scriptGroups)
		{
			logger.info(String.format("collectScriptsByScriptGroupId()-> group - id:%s, name:%s.", scriptGroup.getId(), scriptGroup.getName()));
			collectScriptsByScriptGroupId(projectId, scriptGroup.getId(), collectedScripts);
		}
	}
	
	private void prepareCommandDefinition(long projectId)
	{

		String getAllAgentTypeListUrl = String.format(UrsServiceApis.GetAllAgentTypeList, ursConfig.getIpAddress());
		
    	RestTemplate restTemplate = new RestTemplate();
    	JSONObject agentTypeListJson = restTemplate.getForObject(getAllAgentTypeListUrl, JSONObject.class,2);
    	
		List<AgentConfig> agentConfigs = this.mAgentConfigService.getAgentConfigByProjectId(projectId);
		
		ExportExecutionResultParser.setAgentInstances(agentConfigs);
		ExportExecutionResultParser.setAgentTypeDefinitions(agentTypeListJson);

		logger.info(String.format("setAgentTypeDefinitions() completed."));
		
    	restTemplate = new RestTemplate();
    	String getEngineCmdsUrl = String.format(UrsServiceApis.GetEngineCmds, ursConfig.getIpAddress());
    	ArrayList getEngineCmdsJson = restTemplate.getForObject(getEngineCmdsUrl, ArrayList.class,2);

		ExportExecutionResultParser.setEngineCmds(getEngineCmdsJson);

		logger.info(String.format("setEngineCmds() completed."));
	}
	
	private ExportScriptData getExportScriptData(long projectId, Script script) 
	{
		List<ExportExecutionParsedResult> parsedResult = ExportExecutionResultParser.parseScript(script.getScript());

		List<Requirement> requirements = mRequirementService.findReferenceOfRequirementByScriptId(projectId, script.getId());
		
		ExportScriptData scriptData = new ExportScriptData();
		scriptData.setParsedCommands(parsedResult);
		scriptData.setScript(script);
		scriptData.setRefRequirements(requirements);
		
		return scriptData;
	}
	
}
