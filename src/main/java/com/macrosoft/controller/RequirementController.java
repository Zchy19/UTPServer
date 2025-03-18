package com.macrosoft.controller;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.model.TestCaseRequirementMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.dto.PasteRequirementResponse;
import com.macrosoft.controller.dto.PasteScriptGroupResponse;
import com.macrosoft.controller.dto.QueryRequirementsPayload;
import com.macrosoft.controller.dto.RequirementScriptMappingInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Requirement;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.service.RequirementService;

@Controller
public class RequirementController {
	private static final ILogger logger = LoggerFactory.Create(RequirementController.class.getName());
	private RequirementService mRequirementService;


	@Autowired(required = true)
	
	public void setAgentConfigService(RequirementService requirementService) {
		this.mRequirementService = requirementService;
	}

	@RequestMapping(value = "/api/requirement/{projectId}/{id}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Requirement> getRequirementById(
																	@PathVariable("projectId") long projectId,
																	@PathVariable("id") long id) 
	{
		try {
			Requirement requirement = this.mRequirementService.getRequirementById(projectId, id);
			return new ApiResponse<Requirement>(ApiResponse.Success, requirement);
		} catch (Exception ex) {
			logger.error("getRequirementById", ex);
			return new ApiResponse<Requirement>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/requirement/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<Requirement>> getRequirementByProjectId(@PathVariable("projectId") long projectId) {

		try {
			List<Requirement> requirements = this.mRequirementService.getRequirementByProjectId(projectId);
			
			return new ApiResponse<List<Requirement>>(ApiResponse.Success, requirements);
		} catch (Exception ex) {
			logger.error("getRequirementByProjectId", ex);
			return new ApiResponse<List<Requirement>>(ApiResponse.UnHandleException, null);
		}
	}

	
	@RequestMapping(value = "/api/requirement/sync", method = RequestMethod.POST)	
	public @ResponseBody ApiResponse<Boolean> syncRequirement(@RequestBody List<Requirement> requirements) {
		try {
			this.mRequirementService.addRequirements(requirements);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("syncRequirement", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
	
	@RequestMapping(value = "/api/requirement/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Requirement> addRequirement(@RequestBody Requirement requirement) {
		try {

			Requirement createdRequirement = this.mRequirementService.addRequirement(requirement.getProjectId(), requirement);
			return new ApiResponse<Requirement>(ApiResponse.Success, createdRequirement);
		} catch (Exception ex) {
			logger.error("addRequirement", ex);
			return new ApiResponse<Requirement>(ApiResponse.UnHandleException, requirement);
		}
	}

	@RequestMapping(value = "/api/requirement/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Requirement> updateRequirement(@RequestBody Requirement requirement) {

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateRequirement");

		try {

			this.mRequirementService.updateRequirement(requirement.getProjectId(), requirement);
			return new ApiResponse<Requirement>(ApiResponse.Success, requirement);
		} catch (Exception ex) {
			logger.error("updateRequirement", ex);
			return new ApiResponse<Requirement>(ApiResponse.UnHandleException, requirement);
		}
	}

	@RequestMapping(value = "/api/requirement/delete/{projectId}/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> removeRequirement(
																@PathVariable("projectId") long projectId,
																@PathVariable("id") long id) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeRequirement()->projectId:" + projectId + " id:" + id);

			this.forceRemoveRequirementHierarchy(projectId, id);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("removeRequirement", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	private void forceRemoveRequirementHierarchy(long projectId, long requirementId) {

		List<Requirement> childRequirements = this.mRequirementService.getRequirementByParentId(projectId, requirementId);

		for (Requirement req : childRequirements) {
			forceRemoveRequirementHierarchy(projectId, req.getId());
		}

		this.mRequirementService.removeRequirement(projectId, requirementId, true);
	}
	
	
	@RequestMapping(value = "/api/requirement/deleteWithMapping/{projectId}/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> removeRequirementWithMapping(
																@PathVariable("projectId") long projectId,
																@PathVariable("id") long id) {

		try {

			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteWithMapping");
			this.mRequirementService.removeRequirement(projectId, id, true);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteWithMapping", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
	
	@RequestMapping(value = "/api/requirement/findReferenceOfScriptByRequirementId/{projectId}/{requirementId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ScriptInfo>> findReferenceOfScriptByRequirementId(
																							@PathVariable("projectId") long projectId, 
																							@PathVariable("requirementId") long requirementId) {

		try {
			List<ScriptInfo> scriptInfos = this.mRequirementService.findReferenceOfScriptByRequirementId(projectId, requirementId);
			
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.Success, scriptInfos);
		} catch (Exception ex) {
			logger.error("findReferenceOfScriptByRequirementId", ex);
			return new ApiResponse<List<ScriptInfo>>(ApiResponse.UnHandleException, null);
		}
	}
	
	@RequestMapping(value = "/api/requirement/findReferenceOfRequirementByScriptId/{projectId}/{scriptId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<Requirement>> findReferenceOfRequirementByScriptId(
																							@PathVariable("projectId") long projectId, 
																							@PathVariable("scriptId") long scriptId) {

		try {
			List<Requirement> requirements = this.mRequirementService.findReferenceOfRequirementByScriptId(projectId, scriptId);
			
			return new ApiResponse<List<Requirement>>(ApiResponse.Success, requirements);
		} catch (Exception ex) {
			logger.error("findReferenceOfScriptByRequirementId", ex);
			return new ApiResponse<List<Requirement>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/requirement/copy/{projectId}/{sourceRequirementId}/{targetParentRequirementId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<PasteRequirementResponse> copyRequirement(@PathVariable("projectId") long projectId,
			@PathVariable("sourceRequirementId") long sourceRequirementId,
			@PathVariable("targetParentRequirementId") long targetParentRequirementId) {

		PasteRequirementResponse result = new PasteRequirementResponse();
		try {
			boolean targetIsInvalid = checkFolderIsInValid(projectId, sourceRequirementId, targetParentRequirementId);
			
			if (targetIsInvalid) {
				result.setState(PasteScriptGroupResponse.State_FailedByDestinationIsSubfolder);
				return new ApiResponse<PasteRequirementResponse>(ApiResponse.Success, result);
			}

			Requirement sourceRequirement = this.mRequirementService.getRequirementById(projectId, sourceRequirementId);

			Requirement requirement = copyRequirementHierarchy(projectId, sourceRequirement, targetParentRequirementId);
			result.setRequirement(requirement);
			result.setState(PasteScriptGroupResponse.State_Success);
			return new ApiResponse<PasteRequirementResponse>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("copyRequirement", ex);
			result.setState(PasteScriptGroupResponse.State_FailedByUnknowError);
			return new ApiResponse<PasteRequirementResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/requirement/coverage/calculate/{projectId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> calculateCoverage(@PathVariable("projectId") long projectId) {

		try {
			this.mRequirementService.calculateCoverage(projectId);
		
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("calculateCoverage", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	
	@RequestMapping(value = "/api/requirement/updateRequirementScriptMapping", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> UpdateRequirementScriptMapping(@RequestBody RequirementScriptMappingInfo requirementScriptMappingInfo) {

		try {
			
			long projectId = requirementScriptMappingInfo.getProjectId();
			long scriptId = requirementScriptMappingInfo.getScriptId();
			String requirementIdsWithCommaSeperator = requirementScriptMappingInfo.getRequirementIdsWithCommaSeperator();
			
			this.mRequirementService.updateScriptRequirementMapping(projectId, scriptId, requirementIdsWithCommaSeperator);
			 
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("UpdateRequirementScriptMapping", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/requirement/getRequirementMappingByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<TestCaseRequirementMapping>> getRequirementMappingByProjectId(
																							@PathVariable("projectId") long projectId) {

		try {
			List<TestCaseRequirementMapping> mappings = this.mRequirementService.getRequirementMappingByProjectId(projectId);
			
			return new ApiResponse<List<TestCaseRequirementMapping>>(ApiResponse.Success, mappings);
		} catch (Exception ex) {
			logger.error("findReferenceOfScriptByRequirementId", ex);
			return new ApiResponse<List<TestCaseRequirementMapping>>(ApiResponse.UnHandleException, null);
		}
	}
	

	@RequestMapping(value = "/api/requirement/cut/{projectId}/{sourceRequirementId}/{targetParentRequirementId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<PasteRequirementResponse> cutRequirement(@PathVariable("projectId") long projectId,
			@PathVariable("sourceRequirementId") long sourceRequirementId,
			@PathVariable("targetParentRequirementId") long targetParentRequirementId) {

		PasteRequirementResponse result = new PasteRequirementResponse();

		try {
			Requirement requirement = this.mRequirementService.getRequirementById(projectId, sourceRequirementId);
			if (requirement.getParentId() == targetParentRequirementId) {
				result.setRequirement(requirement);
				result.setState(PasteScriptGroupResponse.State_Success);

				return new ApiResponse<PasteRequirementResponse>(ApiResponse.Success, result);
			}
			boolean targetIsInvalid = checkFolderIsInValid(projectId, sourceRequirementId, targetParentRequirementId);

			if (targetIsInvalid) {
				result.setState(PasteScriptGroupResponse.State_FailedByDestinationIsSubfolder);
				return new ApiResponse<PasteRequirementResponse>(ApiResponse.Success, result);
			}

			requirement.setParentId(targetParentRequirementId);
			this.mRequirementService.updateRequirement(projectId, requirement);

			result.setRequirement(requirement);
			result.setState(PasteScriptGroupResponse.State_Success);
			return new ApiResponse<PasteRequirementResponse>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("cutRequirement", ex);
			result.setState(PasteScriptGroupResponse.State_FailedByUnknowError);
			return new ApiResponse<PasteRequirementResponse>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/requirement/data/byRequirementIds", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<List<Requirement>> getRequirementsByRequirementIds(@RequestBody QueryRequirementsPayload queryRequirementsPayload) {
		try {
			// use parameter type to ensure parameter is valid.
			String sIds = "";
			for (Long requirementId : queryRequirementsPayload.getRequirementIds()) {
				if (sIds.isEmpty()) {
					sIds = Long.toString(requirementId);
				} else {
					sIds = sIds + "," + Long.toString(requirementId);
				}
			}
			
			if (sIds.isEmpty())
			{
				return new ApiResponse<List<Requirement>>(ApiResponse.Success, new ArrayList<Requirement>());
			}

			List<Requirement> requirements = this.mRequirementService.getRequirementsByRequirementIds(queryRequirementsPayload.getProjectId(), sIds);
			return new ApiResponse<List<Requirement>>(ApiResponse.Success, requirements);
		} catch (Exception ex) {
			logger.error("getRequirementsByRequirementIds", ex);
			return new ApiResponse<List<Requirement>>(ApiResponse.UnHandleException, null);
		}
	}
	
	
	private boolean checkFolderIsInValid(long projectId, long sourceRequirementId, long targetParentRequirementId) {
		if (targetParentRequirementId == 0) {
			// if root project node as target, return false;
			return false;
		}

		if (sourceRequirementId == targetParentRequirementId) {
			logger.info(String.format("copy paste requirement itself is invalid. sourceRequirementId :%s, targetParentRequirementId: %s", sourceRequirementId, targetParentRequirementId));
			return true;
		}

		Requirement targetParentRequirement = this.mRequirementService.getRequirementById(projectId, targetParentRequirementId);


		while (targetParentRequirement.getParentId() > 0) {
			targetParentRequirement = this.mRequirementService.getRequirementById(projectId, targetParentRequirement.getParentId());

			logger.info(String.format("Comparing Requirement :%s", targetParentRequirement.getTitle()));

			if (targetParentRequirement.getId() == sourceRequirementId) {
				return true;
			}
		}

		return false;
	}

	private Requirement copyRequirementHierarchy(long projectId, Requirement sourceRequirement, long targetParentRequirementId) {
		List<Requirement> targetRequirementChildren;
		if (targetParentRequirementId == 0) {
			targetRequirementChildren = this.mRequirementService.getRequirementByProjectId(sourceRequirement.getProjectId());
		} else {
			targetRequirementChildren = this.mRequirementService.getRequirementByParentId(projectId, targetParentRequirementId);
		}

		boolean foundSameNameInTargetRequirementChildren = false;
		for (Requirement Requirement : targetRequirementChildren) {
			if (Requirement.getTitle().compareToIgnoreCase(sourceRequirement.getTitle()) == 0) {
				foundSameNameInTargetRequirementChildren = true;
				break;
			}
		}

		Requirement newRequirement = new Requirement();
		String newRequirementName = sourceRequirement.getTitle();
		if (foundSameNameInTargetRequirementChildren) {
			newRequirementName = newRequirementName + "_Copy";
		}

		newRequirement.setTitle(newRequirementName);
		newRequirement.setProjectId(sourceRequirement.getProjectId());
		newRequirement.setCustomizedId(sourceRequirement.getCustomizedId());
		newRequirement.setDescription(sourceRequirement.getDescription());
		newRequirement.setParentId(targetParentRequirementId);
		newRequirement.setComment(sourceRequirement.getComment());
		newRequirement.setLeaf(sourceRequirement.getLeaf());
		newRequirement.setType(sourceRequirement.getType());
		this.mRequirementService.addRequirement(projectId, newRequirement);


		List<Requirement> RequirementChildren = this.mRequirementService.getRequirementByParentId(projectId, sourceRequirement.getId());
		for (Requirement RequirementChild : RequirementChildren) {
			copyRequirementHierarchy(projectId, RequirementChild, newRequirement.getId());
		}

		return newRequirement;
	}
	
	
}
