package com.macrosoft.controller;

import com.macrosoft.controller.dto.PasteScriptGroupResponse;
import com.macrosoft.controller.dto.ScriptGroupAndScriptFlatData;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.ScriptType;
import com.macrosoft.model.TestSet;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.model.enums.ScriptGroupType;
import com.macrosoft.service.ScriptGroupService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.TestSetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 脚本组管理控制器
 * 处理与脚本组相关的所有API请求，包括创建、删除、修改、查询等操作
 */
@RestController
@RequestMapping("/api")
public class ScriptGroupController {
	private static final ILogger logger = LoggerFactory.Create(ScriptGroupController.class.getName());

	private ScriptGroupService scriptGroupService;
	private ScriptService scriptService;
	private TestSetService testSetService;

	@Autowired(required = true)
	public void setScriptGroupService(ScriptGroupService scriptGroupService) {
		this.scriptGroupService = scriptGroupService;
	}

	@Autowired(required = true)
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}

	@Autowired(required = true)
	public void setTestSetService(TestSetService testSetService) {
		this.testSetService = testSetService;
	}

	/**
	 * 获取项目的平面数据（脚本组和脚本）
	 * @param projectId 项目ID
	 * @param type 数据类型
	 * @return 包含脚本组和脚本信息的API响应
	 */
	@GetMapping("/project/getProjectFlatData/{projectId}/{type}")
	public ApiResponse<ScriptGroupAndScriptFlatData> getProjectFlatData(@PathVariable("projectId") long projectId,
																		@PathVariable("type") String type) {
		try {
			ScriptGroupAndScriptFlatData projectFlatData = new ScriptGroupAndScriptFlatData();
			projectFlatData.scriptGroups = this.scriptGroupService.listScriptGroupsByType(projectId, type);
			projectFlatData.scriptGroups.addAll(this.scriptGroupService.listScriptGroupsByType(projectId, ScriptGroupType.LogicBlock.getType()));
			if(Objects.equals(type, "logicblock")) {
				projectFlatData.scripts = this.scriptService.listScriptInfos(projectId, ScriptType.SysLogicBlock);
				projectFlatData.scripts.addAll(this.scriptService.listScriptInfos(projectId, ScriptType.UsrLogicBlock));
				return new ApiResponse<>(ApiResponse.Success, projectFlatData);
			}
			projectFlatData.scripts = this.scriptService.listScriptInfos(projectId, type);
			projectFlatData.scripts.addAll(this.scriptService.listScriptInfos(projectId, ScriptType.UsrLogicBlock));
			return new ApiResponse<>(ApiResponse.Success, projectFlatData);
		} catch (Exception ex) {
			logger.error("getProjectFlatData", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 获取项目的完整平面数据（脚本组、脚本和测试集）
	 * @param projectId 项目ID
	 * @return 包含脚本组、脚本和测试集信息的API响应
	 */
	@GetMapping("/project/getProjectFullFlatData/{projectId}")
	public ApiResponse<ProjectFullFlatData> getProjectFullFlatData(@PathVariable("projectId") long projectId) {
		try {
			ProjectFullFlatData projectFlatData = new ProjectFullFlatData();
			projectFlatData.scriptGroups = this.scriptGroupService.listScriptGroups(projectId);
			projectFlatData.scripts = this.scriptService.listScriptInfos(projectId);
			projectFlatData.testsets = this.testSetService.listTestSetsByProjectId(projectId);
			return new ApiResponse<>(ApiResponse.Success, projectFlatData);
		} catch (Exception ex) {
			logger.error("getProjectFullFlatData", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 创建新的脚本组
	 * @param scriptGroup 脚本组对象
	 * @return 包含创建的脚本组的API响应
	 */
	@PostMapping("/scriptgroup/create")
	public ApiResponse<ScriptGroup> createScriptGroupNew(@RequestBody ScriptGroup scriptGroup) {
		try {
			this.scriptGroupService.addScriptGroup(scriptGroup.getProjectId(), scriptGroup);
			return new ApiResponse<>(ApiResponse.Success, scriptGroup);
		} catch (Exception ex) {
			logger.error("createScriptGroupNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 更新脚本组信息
	 * @param scriptGroup 包含更新信息的脚本组对象
	 * @return 包含更新后脚本组的API响应
	 */
	@PostMapping("/scriptgroup/update")
	public ApiResponse<ScriptGroup> editScriptGroupNew(@RequestBody ScriptGroup scriptGroup) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptGroupNew");
			this.scriptGroupService.updateScriptGroup(scriptGroup.getProjectId(), scriptGroup);
			return new ApiResponse<>(ApiResponse.Success, scriptGroup);
		} catch (Exception ex) {
			logger.error("editScriptGroupNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 强制删除脚本组及其所有子内容
	 * @param projectId 项目ID
	 * @param scriptgroupId 脚本组ID
	 * @return 包含删除是否成功的API响应
	 */
	@PostMapping("/scriptgroup/forceDelete/{projectId}/{scriptgroupId}")
	public ApiResponse<Boolean> forceDeleteScriptGroup(@PathVariable("projectId") long projectId,
													   @PathVariable("scriptgroupId") long scriptgroupId) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion,
					"forceDeleteScriptGroup()->projectId:" + projectId + " scriptgroupId:" + scriptgroupId);
			forceRemoveScriptGroupHierarchy(projectId, scriptgroupId);
			return new ApiResponse<>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("forceDeleteScriptGroup", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, true);
		}
	}

	/**
	 * 删除脚本组（仅当脚本组为空时）
	 * @param projectId 项目ID
	 * @param scriptgroupId 脚本组ID
	 * @return 包含删除是否成功的API响应（如果包含子内容则返回false）
	 */
	@PostMapping("/scriptgroup/delete/{projectId}/{scriptgroupId}")
	public ApiResponse<Boolean> deleteScriptGroupNew(@PathVariable("projectId") long projectId,
													 @PathVariable("scriptgroupId") long scriptgroupId) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteScriptGroupNew");
			List<ScriptInfo> containScripts = this.scriptService.listScriptInfosByParentScriptGroupId(projectId, scriptgroupId);
			if (!containScripts.isEmpty()) {
				return new ApiResponse<>(ApiResponse.Success, false);
			}

			List<ScriptGroup> containScriptGroups = this.scriptGroupService
					.listScriptGroupsByParentScriptGroupId(projectId, scriptgroupId);
			if (!containScriptGroups.isEmpty()) {
				return new ApiResponse<>(ApiResponse.Success, false);
			}

			removeScriptGroupHierarchy(projectId, scriptgroupId);
			return new ApiResponse<>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteScriptGroupNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, true);
		}
	}

	/**
	 * 获取项目下的脚本组列表
	 * @param projectId 项目ID
	 * @return 包含脚本组列表的API响应
	 */
	@GetMapping("/scriptgroup/getByProjectId/{projectId}/{type}")
	public ApiResponse<List<ScriptGroup>> getScriptGroupByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<ScriptGroup> result = this.scriptGroupService.listScriptGroups(projectId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptGroupByProjectId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 获取指定脚本组信息
	 * @param projectId 项目ID
	 * @param scriptgroupId 脚本组ID
	 * @return 包含脚本组信息的API响应
	 */
	@GetMapping("/scriptgroup/{projectId}/{scriptgroupId}")
	public ApiResponse<ScriptGroup> getScriptGroup(@PathVariable("projectId") long projectId,
												   @PathVariable("scriptgroupId") long scriptgroupId) {
		try {
			ScriptGroup result = this.scriptGroupService.getScriptGroupById(projectId, scriptgroupId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptGroup", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 复制脚本组到目标位置
	 * @param projectId 项目ID
	 * @param sourceScriptGroupId 源脚本组ID
	 * @param targetParentScriptGroupId 目标父脚本组ID
	 * @return 包含复制结果的API响应
	 */
	@PostMapping("/scriptgroup/copy/{projectId}/{sourceScriptGroupId}/{targetParentScriptGroupId}")
	public ApiResponse<PasteScriptGroupResponse> copyScriptGroup(@PathVariable("projectId") long projectId,
																 @PathVariable("sourceScriptGroupId") long sourceScriptGroupId,
																 @PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
		PasteScriptGroupResponse result = new PasteScriptGroupResponse();
		try {
			boolean isMaxScriptNum = this.scriptService.isOverMaxScriptNum(projectId, "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				result.setState(PasteScriptGroupResponse.State_OverMaxScriptNum);
				return new ApiResponse<>(ApiResponse.UnHandleException, result);
			}
			ScriptGroup sourceScriptGroup = this.scriptGroupService.getScriptGroupById(projectId, sourceScriptGroupId);
			boolean destinationIsSubfolder = checkDestinationIsSubfolder(projectId, sourceScriptGroup, targetParentScriptGroupId);
			if (destinationIsSubfolder) {
				result.setState(PasteScriptGroupResponse.State_FailedByDestinationIsSubfolder);
				return new ApiResponse<>(ApiResponse.Success, result);
			}
			ScriptGroup scriptGroup = copyScriptGroupHierarchy(projectId, sourceScriptGroup, targetParentScriptGroupId);
			result.setScriptGroup(scriptGroup);
			result.setState(PasteScriptGroupResponse.State_Success);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("copyScriptGroup", ex);
			result.setState(PasteScriptGroupResponse.State_FailedByUnknowError);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 剪切脚本组到目标位置
	 * @param projectId 项目ID
	 * @param sourceScriptGroupId 源脚本组ID
	 * @param targetParentScriptGroupId 目标父脚本组ID
	 * @return 包含剪切结果的API响应
	 */
	@PostMapping("/scriptgroup/cut/{projectId}/{sourceScriptGroupId}/{targetParentScriptGroupId}")
	public ApiResponse<PasteScriptGroupResponse> cutScriptGroup(@PathVariable("projectId") long projectId,
																@PathVariable("sourceScriptGroupId") long sourceScriptGroupId,
																@PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
		PasteScriptGroupResponse result = new PasteScriptGroupResponse();
		try {
			ScriptGroup scriptGroup = this.scriptGroupService.getScriptGroupById(projectId, sourceScriptGroupId);
			if (scriptGroup.getParentScriptGroupId() == targetParentScriptGroupId) {
				result.setScriptGroup(scriptGroup);
				result.setState(PasteScriptGroupResponse.State_Success);
				return new ApiResponse<>(ApiResponse.Success, result);
			}
			boolean destinationIsSubfolder = checkDestinationIsSubfolder(projectId, scriptGroup, targetParentScriptGroupId);
			if (destinationIsSubfolder) {
				result.setState(PasteScriptGroupResponse.State_FailedByDestinationIsSubfolder);
				return new ApiResponse<>(ApiResponse.Success, result);
			}
			scriptGroup.setParentScriptGroupId(targetParentScriptGroupId);
			this.scriptGroupService.updateScriptGroup(projectId, scriptGroup);
			result.setScriptGroup(scriptGroup);
			result.setState(PasteScriptGroupResponse.State_Success);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("cutScriptGroup", ex);
			result.setState(PasteScriptGroupResponse.State_FailedByUnknowError);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	/**
	 * 检查目标位置是否为源脚本组的子文件夹
	 * @param projectId 项目ID
	 * @param sourceScriptGroup 源脚本组
	 * @param targetParentScriptGroupId 目标父脚本组ID
	 * @return 是否为子文件夹
	 */
	private boolean checkDestinationIsSubfolder(long projectId, ScriptGroup sourceScriptGroup,
												long targetParentScriptGroupId) {
		if (targetParentScriptGroupId == 0) {
			return false;
		}
		ScriptGroup targetParentScriptGroup = this.scriptGroupService.getScriptGroupById(projectId, targetParentScriptGroupId);
		logger.info(String.format("Comparing sourceScriptGroup id :%s, targetParentScriptGroupId: %s",
				sourceScriptGroup.getId(), targetParentScriptGroup.getId()));
		if (targetParentScriptGroup.getId() == sourceScriptGroup.getId()) {
			return true;
		}
		while (targetParentScriptGroup.getParentScriptGroupId() > 0) {
			targetParentScriptGroup = this.scriptGroupService.getScriptGroupById(projectId,
					targetParentScriptGroup.getParentScriptGroupId());
			logger.info(String.format("Comparing scriptGroup :%s", targetParentScriptGroup.getName()));
			if (targetParentScriptGroup.getId() == sourceScriptGroup.getId()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 递归复制脚本组及其层级结构
	 * @param projectId 项目ID
	 * @param sourceScriptGroup 源脚本组
	 * @param targetParentScriptGroupId 目标父脚本组ID
	 * @return 新创建的脚本组
	 */
	private ScriptGroup copyScriptGroupHierarchy(long projectId, ScriptGroup sourceScriptGroup,
												 long targetParentScriptGroupId) {
		List<ScriptGroup> targetScriptGroupChildren = (targetParentScriptGroupId == 0) ?
				this.scriptGroupService.listScriptGroups(sourceScriptGroup.getProjectId()) :
				this.scriptGroupService.listScriptGroupsByParentScriptGroupId(projectId, targetParentScriptGroupId);

		boolean foundSameNameInTargetScriptGroupChildren = targetScriptGroupChildren.stream()
				.anyMatch(sg -> sg.getName().compareToIgnoreCase(sourceScriptGroup.getName()) == 0);

		ScriptGroup newScriptGroup = new ScriptGroup();
		String newScriptGroupName = foundSameNameInTargetScriptGroupChildren ?
				sourceScriptGroup.getName() + "_Copy" : sourceScriptGroup.getName();

		newScriptGroup.setName(newScriptGroupName);
		newScriptGroup.setProjectId(sourceScriptGroup.getProjectId());
		newScriptGroup.setDescription(sourceScriptGroup.getDescription());
		newScriptGroup.setParentScriptGroupId(targetParentScriptGroupId);
		newScriptGroup.setType(sourceScriptGroup.getType());
		this.scriptGroupService.addScriptGroup(projectId, newScriptGroup);

		List<Script> scripts = this.scriptService.listScriptsByParentScriptGroupId(projectId, sourceScriptGroup.getId());
		scripts.forEach(script -> copyScript(script, newScriptGroup.getId()));

		List<ScriptGroup> scriptGroupChildren = this.scriptGroupService
				.listScriptGroupsByParentScriptGroupId(projectId, sourceScriptGroup.getId());
		scriptGroupChildren.forEach(child -> copyScriptGroupHierarchy(projectId, child, newScriptGroup.getId()));

		return newScriptGroup;
	}

	/**
	 * 复制单个脚本到指定脚本组
	 * @param sourceScript 源脚本
	 * @param targetParentScriptGroupId 目标脚本组ID
	 */
	private void copyScript(Script sourceScript, long targetParentScriptGroupId) {
		Script newScript = new Script();
		newScript.setName(sourceScript.getName());
		newScript.setBlockyXml(sourceScript.getBlockyXml());
		newScript.setDescription(sourceScript.getDescription());
		newScript.setParameter(sourceScript.getParameter());
		newScript.setParentScriptGroupId(targetParentScriptGroupId);
		newScript.setProjectId(sourceScript.getProjectId());
		newScript.setScript(sourceScript.getScript());
		newScript.setType(sourceScript.getType());
		this.scriptService.addScript(sourceScript.getProjectId(), newScript);
	}

	/**
	 * 递归删除脚本组及其层级结构
	 * @param projectId 项目ID
	 * @param currentScriptGroupId 当前脚本组ID
	 */
	private void removeScriptGroupHierarchy(long projectId, long currentScriptGroupId) {
		this.scriptService.removeScriptsUnderScriptGroup(projectId, currentScriptGroupId);
		List<ScriptGroup> childScriptGroups = this.scriptGroupService
				.listScriptGroupsByParentScriptGroupId(projectId, currentScriptGroupId);
		childScriptGroups.forEach(scriptGroup -> removeScriptGroupHierarchy(projectId, scriptGroup.getId()));
		this.scriptGroupService.removeScriptGroup(projectId, currentScriptGroupId);
	}

	/**
	 * 强制递归删除脚本组及其层级结构
	 * @param projectId 项目ID
	 * @param currentScriptGroupId 当前脚本组ID
	 */
	private void forceRemoveScriptGroupHierarchy(long projectId, long currentScriptGroupId) {
		this.scriptService.forceDeleteScriptUnderScriptGroup(projectId, currentScriptGroupId);
		List<ScriptGroup> childScriptGroups = this.scriptGroupService
				.listScriptGroupsByParentScriptGroupId(projectId, currentScriptGroupId);
		childScriptGroups.forEach(scriptGroup -> forceRemoveScriptGroupHierarchy(projectId, scriptGroup.getId()));
		this.scriptGroupService.removeScriptGroup(projectId, currentScriptGroupId);
	}

	/**
	 * 项目完整平面数据类
	 * 包含脚本组、脚本和测试集的集合
	 */
	public static class ProjectFullFlatData {
		public List<ScriptGroup> scriptGroups;
		public List<ScriptInfo> scripts;
		public List<TestSet> testsets;

		public ProjectFullFlatData() {
			scriptGroups = new ArrayList<>();
			scripts = new ArrayList<>();
			testsets = new ArrayList<>();
		}
	}
}