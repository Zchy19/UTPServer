package com.macrosoft.controller;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.model.enums.ScriptGroupType;
import com.macrosoft.service.*;
import com.macrosoft.urs.UrsServiceApis;
import com.macrosoft.utilities.ExportTestCaseUtility;
import com.macrosoft.utilities.StringUtility;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.ServletContext;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * 脚本管理控制器
 * 处理与脚本相关的所有API请求，包括创建、删除、修改、查询等操作
 */
@RestController
@RequestMapping("/api/script")
public class ScriptController {
	private static final ILogger logger = LoggerFactory.Create(ScriptController.class.getName());

	private ProjectService projectService;
	private ScriptService scriptService;
	private ScriptGroupService scriptGroupService;
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
		this.scriptGroupService = scriptGroupService;
	}

	@Autowired(required = true)

	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}

	@Autowired(required = true)

	public void setProjectService(ProjectService ps) {
		this.projectService = ps;
	}

	@Autowired(required = true)

	public void setAgentConfigService(RequirementService requirementService) {
		this.mRequirementService = requirementService;
	}

	@Autowired
	private ServletContext context;

	/**
	 * 获取指定脚本的信息
	 * @param projectId 项目ID
	 * @param scriptId 脚本ID
	 * @return 包含脚本信息的API响应
	 */
	@GetMapping("/{projectId}/{scriptId}")
	public ApiResponse<ScriptInfo> getScriptInfo(@PathVariable("projectId") long projectId,
												 @PathVariable("scriptId") long scriptId) {
		// 方法实现保持不变
		try {
			ScriptInfo result = this.scriptService.getScriptInfoById(projectId, scriptId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error(String.format("getScriptInfoById has exception - :%s", ex.toString()));
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 创建新的脚本
	 * @param script 脚本对象，包含脚本的基本信息
	 * @return 包含创建结果的API响应
	 */
	@PostMapping("/create")
	public ApiResponse<ScriptMessageInfo> createScriptInfo(@RequestBody Script script) {
		// 方法实现保持不变
		try {
			boolean isMaxScriptNum = this.scriptService.isOverMaxScriptNum(script.getProjectId(), "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				ScriptMessageInfo scriptInfo = new ScriptMessageInfo();
				scriptInfo.setErrorMessages("OVER_MAX_SCRIPT_NUM");
				return new ApiResponse<>(ApiResponse.UnHandleException, scriptInfo);
			}
			Script result = this.scriptService.addScript(script.getProjectId(), script);
			ScriptMessageInfo scriptMessageInfo = new ScriptMessageInfo(result);
			return new ApiResponse<>(ApiResponse.Success, scriptMessageInfo);
		} catch (Exception ex) {
			logger.error("createScriptInfo", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 删除指定脚本
	 * @param projectId 项目ID
	 * @param scriptId 脚本ID
	 * @return 包含删除结果的API响应
	 */
	@PostMapping("/delete/{projectId}/{scriptId}")
	public ApiResponse<DeleteScriptResponse> deleteScript(@PathVariable("projectId") long projectId,
														  @PathVariable("scriptId") long scriptId) {
		// 方法实现保持不变
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteScript");
			DeleteScriptResponse result = this.scriptService.deleteScript(projectId, scriptId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("deleteScript", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 强制删除指定脚本
	 * @param projectId 项目ID
	 * @param scriptId 脚本ID
	 * @return 包含删除是否成功的API响应
	 */
	@PostMapping("/forceDelete/{projectId}/{scriptId}")
	public ApiResponse<Boolean> forceDeleteScript(@PathVariable("projectId") long projectId,
												  @PathVariable("scriptId") long scriptId) {
		// 方法实现保持不变
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "forceDeleteScript()->projectId:" + projectId + " scriptId:" + scriptId);
			this.scriptService.forceDeleteScript(projectId, scriptId);
			return new ApiResponse<>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("forceDeleteScriptGroup", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, true);
		}
	}

	/**
	 * 检查脚本引用关系
	 * @param projectId 项目ID
	 * @param scriptId 脚本ID
	 * @return 包含引用检查结果的API响应
	 */
	@GetMapping("/reference/{projectId}/{scriptId}")
	public ApiResponse<CheckScriptReferenceResponse> checkScriptReference(@PathVariable("projectId") long projectId,
																		  @PathVariable("scriptId") long scriptId) {
		// 方法实现保持不变
		try {
			CheckScriptReferenceResponse result = this.scriptService.checkScriptReference(projectId, scriptId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("checkScriptReference", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 更新脚本信息
	 * @param scriptInfo 脚本信息对象
	 * @return 包含更新后脚本信息的API响应
	 */
	@PostMapping("/update")
	public ApiResponse<ScriptInfo> editScriptInfo(@RequestBody ScriptInfo scriptInfo) {
		// 方法实现保持不变
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptInfo");
			ScriptInfo result = this.scriptService.updateScriptInfo(scriptInfo.getProjectId(), scriptInfo);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("editScriptInfo", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 重命名脚本
	 * @param scriptInfo 包含新名称的脚本信息对象
	 * @return 包含重命名后脚本信息的API响应
	 */
	@PostMapping("/rename")
	public ApiResponse<ScriptInfo> renameScriptInfo(@RequestBody ScriptInfo scriptInfo) {
		// 方法实现保持不变
		try {
			this.scriptService.renameScript(scriptInfo.getProjectId(), scriptInfo.getId(), scriptInfo.getName());
			ScriptInfo result = this.scriptService.getScriptInfoById(scriptInfo.getProjectId(), scriptInfo.getId());
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("renameScriptInfo", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 将脚本转换为子脚本
	 * @param scriptIdentifier 脚本标识对象
	 * @return 包含转换结果的API响应
	 */
	@PostMapping("/transitToSubscript")
	public ApiResponse<TransitToSubScriptResponse> transitToSubscript(@RequestBody ScriptIdentifier scriptIdentifier) {
		// 方法实现保持不变
		try {
			TransitToSubScriptResponse result = this.scriptService.transitToSubscript(scriptIdentifier.getProjectId(), scriptIdentifier.getScriptId());
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("transitToSubscript", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 将子脚本转换为普通脚本
	 * @param scriptIdentifier 子脚本标识对象
	 * @return 包含转换结果的API响应
	 */
	@PostMapping("/transitToScript")
	public ApiResponse<TransitToScriptResponse> transitToScript(@RequestBody SubScriptIdentifier scriptIdentifier) {
		// 方法实现保持不变
		try {
			TransitToScriptResponse result = this.scriptService.transitToScript(scriptIdentifier.getProjectId(), scriptIdentifier.getSubscriptId());
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("transitToScript", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 获取项目下所有脚本信息
	 * @param projectId 项目ID
	 * @return 包含脚本信息列表的API响应
	 */
	@GetMapping("/getByProjectId/{projectId}")
	public ApiResponse<List<ScriptInfo>> getScriptInfosByProjectId(@PathVariable("projectId") long projectId) {
		// 方法实现保持不变
		try {
			List<ScriptInfo> result = this.scriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptInfosByProjectId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 获取项目的脚本和脚本组的平面数据
	 * @param projectId 项目ID
	 * @return 包含脚本和脚本组数据的API响应
	 */
	@GetMapping("/scriptFlatData/getByProjectId/{projectId}")
	public ApiResponse<ScriptGroupAndScriptFlatData> getScriptFlatData(@PathVariable("projectId") long projectId) {
		// 方法实现保持不变
		try {
			ScriptGroupAndScriptFlatData result = new ScriptGroupAndScriptFlatData();
			if(projectId == 0L) {
				result.scripts = this.scriptService.listScriptInfos(projectId, ScriptType.UsrLogicBlock);
				result.scripts.addAll(this.scriptService.listScriptInfos(projectId, ScriptType.SysLogicBlock));
				result.scriptGroups = this.scriptGroupService.listScriptGroups(projectId);
			} else {
				result.scripts = this.scriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
				result.scripts.addAll(this.scriptService.listScriptInfos(projectId, ScriptType.SubScriptType));
				result.scriptGroups = this.scriptGroupService.listScriptGroups(projectId);
			}
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptFlatData", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 复制脚本到指定脚本组
	 * @param projectId 项目ID
	 * @param sourceScriptId 源脚本ID
	 * @param targetParentScriptGroupId 目标脚本组ID
	 * @return 包含复制后脚本信息的API响应
	 */
	@PostMapping("/copy/{projectId}/{sourceScriptId}/{targetParentScriptGroupId}")
	public ApiResponse<ScriptInfo> copyScript(@PathVariable("projectId") long projectId,
											  @PathVariable("sourceScriptId") long sourceScriptId,
											  @PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
		// 方法实现保持不变
		try {
			boolean isMaxScriptNum = this.scriptService.isOverMaxScriptNum(projectId, "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				ScriptInfo scriptInfo = new ScriptInfo();
				scriptInfo.setErrorMessages("OVER_MAX_SCRIPT_NUM");
				return new ApiResponse<>(ApiResponse.UnHandleException, scriptInfo);
			}
			Script script = this.scriptService.copyPasteScript(projectId, sourceScriptId, targetParentScriptGroupId);
			ScriptInfo result = this.scriptService.getScriptInfoById(projectId, script.getId());
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("copyScript", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 剪切脚本到指定脚本组
	 * @param projectId 项目ID
	 * @param sourceScriptId 源脚本ID
	 * @param targetParentScriptGroupId 目标脚本组ID
	 * @return 包含剪切后脚本信息的API响应
	 */
	@PostMapping("/cut/{projectId}/{sourceScriptId}/{targetParentScriptGroupId}")
	public ApiResponse<ScriptInfo> cutScript(@PathVariable("projectId") long projectId,
											 @PathVariable("sourceScriptId") long sourceScriptId,
											 @PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
		// 方法实现保持不变
		try {
			ScriptInfo result = this.scriptService.cutPasteScript(projectId, sourceScriptId, targetParentScriptGroupId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("cutScript", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 获取脚本详细数据
	 * @param projectId 项目ID
	 * @param scriptId 脚本ID
	 * @return 包含脚本详细数据的API响应
	 */
	@GetMapping("/data/{projectId}/{scriptId}")
	public ApiResponse<Script> getScriptData(@PathVariable("projectId") long projectId,
											 @PathVariable("scriptId") long scriptId) {
		// 方法实现保持不变
		try {
			Script result = this.scriptService.getScriptById(projectId, scriptId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptData", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 根据脚本ID列表获取多个脚本数据
	 * @param projectId 项目ID
	 * @param scriptIds 脚本ID数组
	 * @return 包含脚本数据列表的API响应
	 */
	@GetMapping("/data/byScriptIds/{projectId}/{scriptIds}")
	public ApiResponse<List<Script>> getScriptsByScriptIds(@PathVariable("projectId") long projectId,
														   @PathVariable("scriptIds") Long[] scriptIds) {
		// 方法实现保持不变
		try {
			String sIds = String.join(",", Arrays.stream(scriptIds).map(String::valueOf).toArray(String[]::new));
			List<Script> scripts = this.scriptService.getScriptsByScriptIds(projectId, sIds, ScriptType.TestCaseType);
			return new ApiResponse<>(ApiResponse.Success, scripts);
		} catch (Exception ex) {
			logger.error("getScriptsByScriptIds", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 更新脚本数据
	 * @param script 包含更新数据的脚本对象
	 * @return 包含更新后脚本的API响应
	 */
	@PostMapping("/data/update")
	public ApiResponse<Script> editScriptData(@RequestBody Script script) {
		// 方法实现保持不变
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptData");
			String type = script.getType();
			script.setType(type);
			this.scriptService.updateScript(script.getProjectId(), script);
			return new ApiResponse<>(ApiResponse.Success, script);
		} catch (Exception ex) {
			logger.error("editScriptData", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 导出脚本组到Word文档
	 * @param projectId 项目ID
	 * @param scriptGroupId 脚本组ID
	 * @return 包含下载信息的API响应
	 */
	@GetMapping("/scriptGroup/export/{projectId}/{scriptGroupId}")
	public ApiResponse<DownloadingInfo> exportScriptGroupToWord(@PathVariable("projectId") long projectId,
																@PathVariable("scriptGroupId") long scriptGroupId) {
		// 方法实现保持不变
		try {
			String unitName = "";
			if (scriptGroupId != 0) {
				ScriptGroup scriptGroup = this.scriptGroupService.getScriptGroupById(projectId, scriptGroupId);
				if (scriptGroup == null) {
					logger.info(String.format("scriptGroup:%s, projectId: %s, can not find scriptGroup to export.", scriptGroup, projectId));
					return new ApiResponse<>(ApiResponse.UnHandleException, null);
				}
				unitName = scriptGroup.getName();
			} else {
				Project project = this.projectService.getProjectById(projectId);
				if (project != null) {
					unitName = project.getName();
				}
			}
			prepareCommandDefinition(projectId);
			List<ScriptInfo> collectedScripts = new ArrayList<>();
			collectScriptsByScriptGroupId(projectId, scriptGroupId, collectedScripts);
			List<ExportScriptData> exportScriptDatas = new ArrayList<>();
			for (ScriptInfo scriptInfo : collectedScripts) {
				Script script = this.scriptService.getScriptById(projectId, scriptInfo.getId());
				if (script == null) continue;
				ExportScriptData exportScriptData = getExportScriptData(projectId, script);
				if (exportScriptData == null) continue;
				exportScriptDatas.add(exportScriptData);
			}
			String fileName = String.format("ScriptGroup_%s_%s.docx", unitName, StringUtility.GetFormatedDateTime(new Date()));
			fileName = fileName.replace(":", "_").replace(" ", "_").replace("-", "_");
			File destinationFile = new File(ReportUtility.GetDownloadPath(context, fileName));
			ReportUtility.CreateFolderIfNotExist(context);
			boolean result = ExportTestCaseUtility.exportScript(destinationFile.getAbsolutePath(), exportScriptDatas);
			if (!result) {
				return new ApiResponse<>(ApiResponse.UnHandleException, null);
			}
			DownloadingInfo info = new DownloadingInfo();
			info.setFileName(fileName);
			info.setFilePath(ReportUtility.GetStaticDownloadPath(fileName));
			return new ApiResponse<>(ApiResponse.Success, info);
		} catch (Exception ex) {
			logger.error(String.format("exportScriptToWord has exception - :%s", ex.toString()));
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 导出单个脚本到Word文档
	 * @param projectId 项目ID
	 * @param scriptId 脚本ID
	 * @return 包含下载信息的API响应
	 */
	@GetMapping("/export/{projectId}/{scriptId}")
	public ApiResponse<DownloadingInfo> exportScriptToWord(@PathVariable("projectId") long projectId,
														   @PathVariable("scriptId") long scriptId) {
		// 方法实现保持不变
		try {
			Script script = this.scriptService.getScriptById(projectId, scriptId);
			if (script == null) {
				logger.info(String.format("scriptId:%s, projectId: %s, can not find script to export.", scriptId, projectId));
				return new ApiResponse<>(ApiResponse.UnHandleException, null);
			}
			prepareCommandDefinition(script.getProjectId());
			ExportScriptData exportScriptData = getExportScriptData(projectId, script);
			String fileName = String.format("Script_%s_%s.docx", script.getName(), StringUtility.GetFormatedDateTime(new Date()));
			fileName = fileName.replace(":", "_").replace(" ", "_").replace("-", "_");
			File destinationFile = new File(ReportUtility.GetDownloadPath(context, fileName));
			ReportUtility.CreateFolderIfNotExist(context);
			boolean result = ExportTestCaseUtility.exportScript(destinationFile.getAbsolutePath(), exportScriptData);
			if (!result) {
				return new ApiResponse<>(ApiResponse.UnHandleException, null);
			}
			DownloadingInfo info = new DownloadingInfo();
			info.setFileName(fileName);
			info.setFilePath(ReportUtility.GetStaticDownloadPath(fileName));
			return new ApiResponse<>(ApiResponse.Success, info);
		} catch (Exception ex) {
			logger.error(String.format("exportScriptToWord has exception - :%s", ex.toString()));
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 更新子脚本类型（用于版本升级兼容）
	 * @return 包含更新是否成功的API响应
	 */
	@GetMapping("/updateSubScript")
	public ApiResponse<Boolean> updateSubScript() {
		// 方法实现保持不变
		try {
			boolean b = this.scriptService.updateSubScript();
			logger.info("updateSubScript - " + b);
			this.scriptService.updateScript();
			return new ApiResponse<>(ApiResponse.Success, b);
		} catch (Exception ex) {
			logger.error(String.format("updateSubScript - :%s", ex.toString()));
			return new ApiResponse<>(ApiResponse.UnHandleException, false);
		}
	}

	/**
	 * 递归收集脚本组下的所有脚本
	 * @param projectId 项目ID
	 * @param scriptGroupId 脚本组ID
	 * @param collectedScripts 收集到的脚本列表
	 */
	private void collectScriptsByScriptGroupId(long projectId, long scriptGroupId, List<ScriptInfo> collectedScripts) {
		// 方法实现保持不变
		List<ScriptInfo> scriptInfos = this.scriptService.listScriptInfosByParentScriptGroupId(projectId, scriptGroupId);
		collectedScripts.addAll(scriptInfos);
		for (ScriptInfo scriptInfo : scriptInfos) {
			logger.info(String.format("collectScriptsByScriptGroupId()->script - id:%s, name:%s.", scriptInfo.getId(), scriptInfo.getName()));
		}
		List<ScriptGroup> scriptGroups = (scriptGroupId == 0)
				? this.scriptGroupService.listScriptGroupsInTopLevel(projectId)
				: this.scriptGroupService.listScriptGroupsByParentScriptGroupId(projectId, scriptGroupId);

		for (ScriptGroup scriptGroup : scriptGroups) {
			logger.info(String.format("collectScriptsByScriptGroupId()-> group - id:%s, name:%s.", scriptGroup.getId(), scriptGroup.getName()));
			collectScriptsByScriptGroupId(projectId, scriptGroup.getId(), collectedScripts);
		}
	}

	/**
	 * 准备命令定义数据，用于脚本导出
	 * @param projectId 项目ID
	 */
	private void prepareCommandDefinition(long projectId) {
		// 方法实现保持不变
		String getAllAgentTypeListUrl = String.format(UrsServiceApis.GetAllAgentTypeList, ursConfig.getIpAddress());
		RestTemplate restTemplate = new RestTemplate();
		JSONObject agentTypeListJson = restTemplate.getForObject(getAllAgentTypeListUrl, JSONObject.class, 2);
		List<AgentConfig> agentConfigs = this.mAgentConfigService.getAgentConfigByProjectId(projectId);
		ExportExecutionResultParser.setAgentInstances(agentConfigs);
		ExportExecutionResultParser.setAgentTypeDefinitions(agentTypeListJson);
		logger.info(String.format("setAgentTypeDefinitions() completed."));
		String getEngineCmdsUrl = String.format(UrsServiceApis.GetEngineCmds, ursConfig.getIpAddress());
		ArrayList getEngineCmdsJson = restTemplate.getForObject(getEngineCmdsUrl, ArrayList.class, 2);
		ExportExecutionResultParser.setEngineCmds(getEngineCmdsJson);
		logger.info(String.format("setEngineCmds() completed."));
	}

	/**
	 * 获取脚本的导出数据
	 * @param projectId 项目ID
	 * @param script 脚本对象
	 * @return 包含脚本导出数据的对象
	 */
	private ExportScriptData getExportScriptData(long projectId, Script script) {
		// 方法实现保持不变
		List<ExportExecutionParsedResult> parsedResult = ExportExecutionResultParser.parseScript(script.getScript());
		List<Requirement> requirements = mRequirementService.findReferenceOfRequirementByScriptId(projectId, script.getId());
		ExportScriptData scriptData = new ExportScriptData();
		scriptData.setParsedCommands(parsedResult);
		scriptData.setScript(script);
		scriptData.setRefRequirements(requirements);
		return scriptData;
	}

	/*
	导入公共逻辑脚本
	 */
	@PostMapping("/importgloballogicblock")
	private ApiResponse<Boolean> importGlobalLogicBlock(@RequestBody LogicBlockInfo logicBlockInfo) {
		try {
			LogicBlockContent content = logicBlockInfo.getContent();
			// 0为公共逻辑项目的项目id
			long scriptGroupId = scriptGroupService.addScriptGroupByPath(logicBlockInfo.getPath(), 0L, ScriptGroupType.LogicBlock.getType());
			Script script = Script.builder()
					.id(0L)
					.projectId(0L)
					.name(logicBlockInfo.getName())
					.type(ScriptType.SysLogicBlock)
					.parameter(content.getParameter())
					.description(logicBlockInfo.getDescription())
					.script(content.getScript())
					.blockyXml(content.getBlockyXml())
					.parentScriptGroupId(scriptGroupId)
					.declaredAntbots(content.getDeclaredAntbots())
					.rwattribute(content.getRwattribute())
					.build();
			Script scriptAdded = scriptService.addScript(0L, script);
			return new ApiResponse<>(ApiResponse.Success, true);
		} catch (Exception e) {
			return new ApiResponse<>(ApiResponse.UnHandleException, false);
		}
	}
}