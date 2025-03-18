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

import com.macrosoft.controller.dto.PasteScriptGroupResponse;
import com.macrosoft.controller.dto.ScriptGroupAndScriptFlatData;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.TestSet;
import com.macrosoft.service.ScriptGroupService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.TestSetService;

@Controller
public class ScriptGroupController {
	private static final ILogger logger = LoggerFactory.Create(ScriptGroupController.class.getName());

	private ScriptGroupService mScriptGroupService;
	private ScriptService mScriptService;
	private TestSetService mTestSetService;

	@Autowired(required = true)
	
	public void setScriptGroupService(ScriptGroupService scriptGroupService) {
		this.mScriptGroupService = scriptGroupService;
	}

	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.mScriptService = scriptService;
	}

	@Autowired(required = true)
	
	public void y(TestSetService testsetService) {
		this.mTestSetService = testsetService;
	}
	
	@RequestMapping(value = "/api/project/getProjectFlatData/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ScriptGroupAndScriptFlatData> getProjectFlatData(@PathVariable("projectId") long projectId) {
		try {
			ScriptGroupAndScriptFlatData projectFlatData = new ScriptGroupAndScriptFlatData();
			projectFlatData.scriptGroups = this.mScriptGroupService.listScriptGroups(projectId);
			projectFlatData.scripts = this.mScriptService.listScriptInfos(projectId);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.Success, projectFlatData);
		} catch (Exception ex) {
			logger.error("getProjectFlatData", ex);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/project/getProjectFullFlatData/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ProjectFullFlatData> getProjectFullFlatData(@PathVariable("projectId") long projectId) {
		try {
			ProjectFullFlatData projectFlatData = new ProjectFullFlatData();
			projectFlatData.scriptGroups = this.mScriptGroupService.listScriptGroups(projectId);
			projectFlatData.scripts = this.mScriptService.listScriptInfos(projectId);
			projectFlatData.testsets = this.mTestSetService.listTestSetsByProjectId(projectId);
			return new ApiResponse<ProjectFullFlatData>(ApiResponse.Success, projectFlatData);
		} catch (Exception ex) {
			logger.error("getProjectFullFlatData", ex);
			return new ApiResponse<ProjectFullFlatData>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/scriptgroup/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptGroup> createScriptGroupNew(@RequestBody ScriptGroup scriptGroup) {
		try {
			this.mScriptGroupService.addScriptGroup(scriptGroup.getProjectId(), scriptGroup);
			return new ApiResponse<ScriptGroup>(ApiResponse.Success, scriptGroup);
		} catch (Exception ex) {
			logger.error("createScriptGroupNew", ex);
			return new ApiResponse<ScriptGroup>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/scriptgroup/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptGroup> editScriptGroupNew(@RequestBody ScriptGroup scriptGroup) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptGroupNew");
			this.mScriptGroupService.updateScriptGroup(scriptGroup.getProjectId(), scriptGroup);
			return new ApiResponse<ScriptGroup>(ApiResponse.Success, scriptGroup);
		} catch (Exception ex) {
			logger.error("editScriptGroupNew", ex);
			return new ApiResponse<ScriptGroup>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/script/forceDelete/{projectId}/{scriptId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> forceDeleteScript(@PathVariable("projectId") long projectId,
			@PathVariable("scriptId") long scriptId) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "forceDeleteScript()->projectId:" + projectId + " scriptId:" + scriptId);
			this.mScriptService.forceDeleteScript(projectId, scriptId);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("forceDeleteScriptGroup", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, true);
		}
	}

	@RequestMapping(value = "/api/scriptgroup/forceDelete/{projectId}/{scriptgroupId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> forceDeleteScriptGroup(@PathVariable("projectId") long projectId,
			@PathVariable("scriptgroupId") long scriptgroupId) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "forceDeleteScriptGroup()->projectId:" + projectId + " scriptgroupId:" + scriptgroupId);
			
			forceRemoveScriptGroupHierarchy(projectId, scriptgroupId);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("forceDeleteScriptGroup", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, true);
		}
	}


	@RequestMapping(value = "/api/scriptgroup/delete/{projectId}/{scriptgroupId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteScriptGroupNew(@PathVariable("projectId") long projectId,
			@PathVariable("scriptgroupId") long scriptgroupId) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteScriptGroupNew");
			List<ScriptInfo> containScripts = this.mScriptService.listScriptInfosByParentScriptGroupId(projectId,
					scriptgroupId);
			if (!containScripts.isEmpty())
				return new ApiResponse<Boolean>(ApiResponse.Success, false);

			List<ScriptGroup> containScriptGroups = this.mScriptGroupService
					.listScriptGroupsByParentScriptGroupId(projectId, scriptgroupId);
			if (!containScriptGroups.isEmpty())
				return new ApiResponse<Boolean>(ApiResponse.Success, false);

			removeScriptGroupHierarchy(projectId, scriptgroupId);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteScriptGroupNew", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, true);
		}
	}

	@RequestMapping(value = "/api/scriptgroup/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ScriptGroup>> getScriptGroupByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<ScriptGroup> result = this.mScriptGroupService.listScriptGroups(projectId);
			return new ApiResponse<List<ScriptGroup>>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptGroupByProjectId", ex);
			return new ApiResponse<List<ScriptGroup>>(ApiResponse.UnHandleException, null);
		}
	}
	
	@RequestMapping(value = "/api/scriptgroup/{projectId}/{scriptgroupId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ScriptGroup> getScriptGroup(@PathVariable("projectId") long projectId,
			@PathVariable("scriptgroupId") long scriptgroupId) {
		try {
			ScriptGroup result = this.mScriptGroupService.getScriptGroupById(projectId, scriptgroupId);
			return new ApiResponse<ScriptGroup>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptGroup", ex);
			return new ApiResponse<ScriptGroup>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/scriptgroup/copy/{projectId}/{sourceScriptGroupId}/{targetParentScriptGroupId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<PasteScriptGroupResponse> copyScriptGroup(@PathVariable("projectId") long projectId,
			@PathVariable("sourceScriptGroupId") long sourceScriptGroupId,
			@PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {

		PasteScriptGroupResponse result = new PasteScriptGroupResponse();
		try {
			boolean isMaxScriptNum = this.mScriptService.isOverMaxScriptNum(projectId, "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				result.setState(PasteScriptGroupResponse.State_OverMaxScriptNum);
				return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.UnHandleException, result);
			}
			ScriptGroup sourceScriptGroup = this.mScriptGroupService.getScriptGroupById(projectId, sourceScriptGroupId);

			// if (sourceScriptGroup.getParentScriptGroupId() ==
			// targetParentScriptGroupId) return sourceScriptGroup;

			boolean destinationIsSubfolder = checkDestinationIsSubfolder(projectId, sourceScriptGroup,
					targetParentScriptGroupId);
			if (destinationIsSubfolder) {
				result.setState(PasteScriptGroupResponse.State_FailedByDestinationIsSubfolder);
				return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.Success, result);
			}
			ScriptGroup scriptGroup = copyScriptGroupHierarchy(projectId, sourceScriptGroup, targetParentScriptGroupId);
			result.setScriptGroup(scriptGroup);
			result.setState(PasteScriptGroupResponse.State_Success);
			return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("copyScriptGroup", ex);
			result.setState(PasteScriptGroupResponse.State_FailedByUnknowError);
			return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/scriptgroup/cut/{projectId}/{sourceScriptGroupId}/{targetParentScriptGroupId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<PasteScriptGroupResponse> cutScriptGroup(@PathVariable("projectId") long projectId,
			@PathVariable("sourceScriptGroupId") long sourceScriptGroupId,
			@PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {

		PasteScriptGroupResponse result = new PasteScriptGroupResponse();

		try {
			ScriptGroup scriptGroup = this.mScriptGroupService.getScriptGroupById(projectId, sourceScriptGroupId);
			if (scriptGroup.getParentScriptGroupId() == targetParentScriptGroupId) {
				result.setScriptGroup(scriptGroup);
				result.setState(PasteScriptGroupResponse.State_Success);

				return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.Success, result);
			}

			boolean destinationIsSubfolder = checkDestinationIsSubfolder(projectId, scriptGroup,
					targetParentScriptGroupId);
			if (destinationIsSubfolder) {
				result.setState(PasteScriptGroupResponse.State_FailedByDestinationIsSubfolder);
				return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.Success, result);
			}

			scriptGroup.setParentScriptGroupId(targetParentScriptGroupId);
			this.mScriptGroupService.updateScriptGroup(projectId, scriptGroup);

			result.setScriptGroup(scriptGroup);
			result.setState(PasteScriptGroupResponse.State_Success);
			return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("cutScriptGroup", ex);
			result.setState(PasteScriptGroupResponse.State_FailedByUnknowError);
			return new ApiResponse<PasteScriptGroupResponse>(ApiResponse.UnHandleException, null);
		}
	}

	private boolean checkDestinationIsSubfolder(long projectId, ScriptGroup sourceScriptGroup,
			long targetParentScriptGroupId) {
		if (targetParentScriptGroupId == 0) {
			// if root project node as target, return false;
			return false;
		}

		ScriptGroup targetParentScriptGroup = this.mScriptGroupService.getScriptGroupById(projectId,
				targetParentScriptGroupId);

		logger.info(String.format("Comparing sourceScriptGroup id :%s, targetParentScriptGroupId: %s",
				sourceScriptGroup.getId(), targetParentScriptGroup.getId()));

		if (targetParentScriptGroup.getId() == sourceScriptGroup.getId()) {
			return true;
		}

		while (targetParentScriptGroup.getParentScriptGroupId() > 0) {
			targetParentScriptGroup = this.mScriptGroupService.getScriptGroupById(projectId,
					targetParentScriptGroup.getParentScriptGroupId());

			logger.info(String.format("Comparing scriptGroup :%s", targetParentScriptGroup.getName()));

			if (targetParentScriptGroup.getId() == sourceScriptGroup.getId()) {
				return true;
			}
		}

		return false;
	}

	private ScriptGroup copyScriptGroupHierarchy(long projectId, ScriptGroup sourceScriptGroup,
			long targetParentScriptGroupId) {
		List<ScriptGroup> targetScriptGroupChildren;
		if (targetParentScriptGroupId == 0) {
			targetScriptGroupChildren = this.mScriptGroupService.listScriptGroups(sourceScriptGroup.getProjectId());
		} else {
			targetScriptGroupChildren = this.mScriptGroupService.listScriptGroupsByParentScriptGroupId(projectId,
					targetParentScriptGroupId);
		}

		boolean foundSameNameInTargetScriptGroupChildren = false;
		for (ScriptGroup scriptGroup : targetScriptGroupChildren) {
			if (scriptGroup.getName().compareToIgnoreCase(sourceScriptGroup.getName()) == 0) {
				foundSameNameInTargetScriptGroupChildren = true;
				break;
			}
		}

		ScriptGroup newSciptGroup = new ScriptGroup();
		String newScriptGroupName = sourceScriptGroup.getName();
		if (foundSameNameInTargetScriptGroupChildren) {
			newScriptGroupName = newScriptGroupName + "_Copy";
		}

		newSciptGroup.setName(newScriptGroupName);
		newSciptGroup.setProjectId(sourceScriptGroup.getProjectId());
		newSciptGroup.setDescription(sourceScriptGroup.getDescription());
		newSciptGroup.setParentScriptGroupId(targetParentScriptGroupId);
		this.mScriptGroupService.addScriptGroup(projectId, newSciptGroup);

		List<Script> scripts = this.mScriptService.listScriptsByParentScriptGroupId(projectId,
				sourceScriptGroup.getId());

		for (Script script : scripts) {
			copyScript(script, newSciptGroup.getId());
		}

		List<ScriptGroup> scriptGroupChildren = this.mScriptGroupService.listScriptGroupsByParentScriptGroupId(projectId,
				sourceScriptGroup.getId());
		for (ScriptGroup scriptGroupChild : scriptGroupChildren) {
			copyScriptGroupHierarchy(projectId, scriptGroupChild, newSciptGroup.getId());
		}

		return newSciptGroup;
	}

	private void copyScript(Script sourceScript, long targetPatientScriptGroupId) {
		Script newScript = new Script();
		newScript.setName(sourceScript.getName());
		newScript.setBlockyXml(sourceScript.getBlockyXml());
		newScript.setDescription(sourceScript.getDescription());
		newScript.setParameter(sourceScript.getParameter());
		newScript.setParentScriptGroupId(targetPatientScriptGroupId);
		newScript.setProjectId(sourceScript.getProjectId());
		newScript.setScript(sourceScript.getScript());
		newScript.setType(sourceScript.getType());

		this.mScriptService.addScript(sourceScript.getProjectId(), newScript);
	}

	private void removeScriptGroupHierarchy(long projectId, long currentScriptGroupId) {
		this.mScriptService.removeScriptsUnderScriptGroup(projectId, currentScriptGroupId);
		List<ScriptGroup> childScripgroups = this.mScriptGroupService.listScriptGroupsByParentScriptGroupId(projectId,
				currentScriptGroupId);

		for (ScriptGroup scriptGroup : childScripgroups) {
			removeScriptGroupHierarchy(projectId, scriptGroup.getId());
		}

		this.mScriptGroupService.removeScriptGroup(projectId, currentScriptGroupId);
	}

	private void forceRemoveScriptGroupHierarchy(long projectId, long currentScriptGroupId) {
		this.mScriptService.forceDeleteScriptUnderScriptGroup(projectId, currentScriptGroupId);
		List<ScriptGroup> childScripgroups = this.mScriptGroupService.listScriptGroupsByParentScriptGroupId(projectId,
				currentScriptGroupId);

		for (ScriptGroup scriptGroup : childScripgroups) {
			forceRemoveScriptGroupHierarchy(projectId, scriptGroup.getId());
		}

		this.mScriptGroupService.removeScriptGroup(projectId, currentScriptGroupId);
	}
	
	public class ProjectFullFlatData {

		public List<ScriptGroup> scriptGroups;
		public List<ScriptInfo> scripts;
		public List<TestSet> testsets;

		public ProjectFullFlatData() {
			scriptGroups = new ArrayList<ScriptGroup>();
			scripts = new ArrayList<ScriptInfo>();
			testsets = new ArrayList<TestSet>();
		}
	}
	
}
