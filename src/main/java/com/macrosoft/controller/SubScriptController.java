package com.macrosoft.controller;

import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptType;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.service.ScriptGroupService;
import com.macrosoft.service.ScriptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class SubScriptController {
	private static final ILogger logger = LoggerFactory.Create(SubScriptController.class.getName());
	private ScriptService mScriptService;
	private ScriptGroupService mScriptGroupService;
	
	@Autowired(required = true)
	
	public void setScriptGroupService(ScriptGroupService scriptGroupService) {
		this.mScriptGroupService = scriptGroupService;
	}
	
	@Autowired(required = true)
	
	public void setScriptService(ScriptService scriptService) {
		this.mScriptService = scriptService;
	}

	@RequestMapping(value = "/api/subscript/{projectId}/{subscriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<SubScriptInfo> getSubScript(@PathVariable("projectId") long projectId,
			@PathVariable("subscriptId") long subscriptId) {
		try {
			Script script = this.mScriptService.getScriptById(projectId, subscriptId);
			if (script == null)
				return null;
			SubScriptInfo result = SubScriptInfoConverter.ConvertToSubScriptInfo(script);

			return new ApiResponse<SubScriptInfo>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getSubScript", ex);
			return new ApiResponse<SubScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/data/bySubscriptIds/{projectId}/{subscriptIds}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<Script>> getScriptsByScriptIds(@PathVariable("projectId") long projectId,
			@PathVariable("subscriptIds") Long[] subscriptIds) {
		try {
			// use parameter type to ensure parameter is valid.
			String sIds = "";
			for (Long subscriptId : subscriptIds) {
				if (sIds.isEmpty()) {
					sIds = Long.toString(subscriptId);
				} else {
					sIds = sIds + "," + Long.toString(subscriptId);
				}
			}

			List<Script> scripts = this.mScriptService.getScriptsByScriptIds(projectId, sIds, ScriptType.SysLogicBlock);
			scripts.addAll(this.mScriptService.getScriptsByScriptIds(projectId, sIds, ScriptType.UsrLogicBlock));
			return new ApiResponse<List<Script>>(ApiResponse.Success, scripts);
		} catch (Exception ex) {
			logger.error("getScriptsByScriptIds", ex);
			return new ApiResponse<List<Script>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptMessageInfo> createSubScriptInfo(@RequestBody Script script) {
		try {
			boolean isMaxScriptNum = this.mScriptService.isOverMaxScriptNum(script.getProjectId(), "utpserver", "utpserver.script.count");
			if (isMaxScriptNum) {
				ScriptMessageInfo scriptInfo = new ScriptMessageInfo();
				scriptInfo.setErrorMessages("OVER_MAX_SUBSCRIPT_NUM");
				return new ApiResponse<ScriptMessageInfo>(ApiResponse.UnHandleException, scriptInfo);
			}
			script.setType(ScriptType.UsrLogicBlock);
			Script result = this.mScriptService.addScript(script.getProjectId(), script);
			ScriptMessageInfo scriptMessageInfo = new ScriptMessageInfo(result);
			return new ApiResponse<ScriptMessageInfo>(ApiResponse.Success, scriptMessageInfo);
		} catch (Exception ex) {
			logger.error("createSubScriptInfo", ex);
			return new ApiResponse<ScriptMessageInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/reference/{projectId}/{subscriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<CheckSubscriptReferenceResponse> checkSubScriptReference(
			@PathVariable("projectId") long projectId, @PathVariable("subscriptId") long subscriptId) {

		try {
			CheckSubscriptReferenceResponse result = this.mScriptService.checkSubScriptReference(projectId, subscriptId);
			return new ApiResponse<CheckSubscriptReferenceResponse>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("checkSubScriptReference", ex);
			return new ApiResponse<CheckSubscriptReferenceResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/delete/{projectId}/{subscriptId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<DeleteSubscriptResponse> deleteSubScript(@PathVariable("projectId") long projectId,
			@PathVariable("subscriptId") long subscriptId) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteSubScript");
			DeleteSubscriptResponse result = this.mScriptService.deleteSubScript(projectId, subscriptId);

			return new ApiResponse<DeleteSubscriptResponse>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("deleteSubScript", ex);
			return new ApiResponse<DeleteSubscriptResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptInfo> editSubScriptInfo(@RequestBody ScriptInfo subscriptInfo) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editSubScriptInfo");
			ScriptInfo result = this.mScriptService.updateScriptInfo(subscriptInfo.getProjectId(), subscriptInfo);
			return new ApiResponse<ScriptInfo>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("editSubScriptInfo", ex);
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/rename", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<ScriptInfo> renameSubScriptInfo(@RequestBody ScriptInfo subscriptInfo) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "renameSubScriptInfo");
			this.mScriptService.renameScript(subscriptInfo.getProjectId(), subscriptInfo.getId(),
					subscriptInfo.getName());
			ScriptInfo result =  this.mScriptService.getScriptInfoById(subscriptInfo.getProjectId(), subscriptInfo.getId());
			return new ApiResponse<ScriptInfo>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("renameSubScriptInfo", ex);
			return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ScriptInfo>> getSubScriptInfosByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<ScriptInfo> result = this.mScriptService.listScriptInfos(projectId, ScriptType.UsrLogicBlock);
			result.addAll(this.mScriptService.listScriptInfos(projectId, ScriptType.SysLogicBlock));
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getSubScriptInfosByProjectId", ex);
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/candidatesForExceptionRecover/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ScriptInfo>> getExceptionRecoverCandidates(@PathVariable("projectId") long projectId) {
		try {
			List<ScriptInfo> result = this.mScriptService.getExceptionRecoverCandidates(projectId);
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getExceptionRecoverCandidates", ex);
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/subscriptFlatData/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ScriptGroupAndScriptFlatData> getSubscriptFlatData(
			@PathVariable("projectId") long projectId) {
		try {
			ScriptGroupAndScriptFlatData result = new ScriptGroupAndScriptFlatData(); 
			result.scripts = this.mScriptService.listScriptInfos(projectId, ScriptType.UsrLogicBlock);
			result.scripts.addAll(this.mScriptService.listScriptInfos(projectId, ScriptType.SysLogicBlock));
			result.scriptGroups = this.mScriptGroupService.listScriptGroups(projectId);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getSubscriptFlatData", ex);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.UnHandleException, null);
		}		
	}

	@RequestMapping(value = "/api/subscript/subscriptFlatDataWithoutParam/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<ScriptGroupAndScriptFlatData> getSubscriptFlatDataWithoutParam(
			@PathVariable("projectId") long projectId) {
		try {
			ScriptGroupAndScriptFlatData data = new ScriptGroupAndScriptFlatData();

			data.scripts = this.mScriptService.getExceptionRecoverCandidates(projectId);
			data.scriptGroups = this.mScriptGroupService.listScriptGroups(projectId);
			
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.Success, data);
		} catch (Exception ex) {
			logger.error("getSubscriptFlatData", ex);
			return new ApiResponse<ScriptGroupAndScriptFlatData>(ApiResponse.UnHandleException, null);
		}		
	}
	
	@RequestMapping(value = "/api/subscript/data/{projectId}/{subscriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Script> getScriptData(@PathVariable("projectId") long projectId,
			@PathVariable("subscriptId") long subscriptId) {
		try {
			Script result = this.mScriptService.getScriptById(projectId, subscriptId);
			return new ApiResponse<Script>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getScriptData", ex);
			return new ApiResponse<Script>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/subscript/data/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Script> editSubScriptData(@RequestBody Script subscript) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editSubScriptData");
			subscript.setType(ScriptType.UsrLogicBlock);
			Script result =  this.mScriptService.updateScript(subscript.getProjectId(), subscript);
			return new ApiResponse<Script>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("editSubScriptData", ex);
			return new ApiResponse<Script>(ApiResponse.UnHandleException, null);
		}
	}
}
