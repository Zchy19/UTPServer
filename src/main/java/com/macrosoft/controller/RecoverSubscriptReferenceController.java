package com.macrosoft.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.dto.RecoverSubscriptReferenceInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.RecoverSubscriptReference;
import com.macrosoft.service.RecoverSubscriptReferenceService;

@Controller
public class RecoverSubscriptReferenceController {
	private static final ILogger logger = LoggerFactory.Create(RecoverSubscriptReferenceController.class.getName());
	private RecoverSubscriptReferenceService mRecoverSubscriptReferenceService;

	@Autowired(required = true)
	
	public void setScriptService(RecoverSubscriptReferenceService recoverSubscriptReferenceService) {
		this.mRecoverSubscriptReferenceService = recoverSubscriptReferenceService;
	}

	@RequestMapping(value = "/api/recoverSubscript/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<RecoverSubscriptReferenceInfo>> getRecoverSubscriptReferences(
			@PathVariable("projectId") long projectId) {

		try {
			List<RecoverSubscriptReferenceInfo> results = this.mRecoverSubscriptReferenceService.listRecoverSubscriptReferenceInfosByProjectId(projectId);
			return new ApiResponse<List<RecoverSubscriptReferenceInfo>>(ApiResponse.Success, results);
		} catch (Exception ex) {
			logger.error("getRecoverSubscriptReferences", ex);
			return new ApiResponse<List<RecoverSubscriptReferenceInfo>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/recoverSubscript/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<RecoverSubscriptReferenceInfo> createRecoverSubscriptReference(
			@RequestBody RecoverSubscriptReferenceInfo refrernceInfo) {

		try {
			RecoverSubscriptReference reference = this.mRecoverSubscriptReferenceService
					.addRecoverSubscriptReference(refrernceInfo.getProjectId(), refrernceInfo);
			RecoverSubscriptReferenceInfo result = this.mRecoverSubscriptReferenceService.getRecoverSubscriptReferenceInfo(refrernceInfo.getProjectId(),
					reference.getId());

			return new ApiResponse<RecoverSubscriptReferenceInfo>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("createRecoverSubscriptReference", ex);
			return new ApiResponse<RecoverSubscriptReferenceInfo>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/recoverSubscript/delete/{projectId}/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteRecoverSubscriptReference(@PathVariable("projectId") long projectId,
			@PathVariable("id") long id) {

		try {

			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteRecoverSubscriptReference");
			this.mRecoverSubscriptReferenceService.removeRecoverSubscriptReference(projectId, id);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteRecoverSubscriptReference", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/recoverSubscript/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<RecoverSubscriptReferenceInfo> updateRecoverSubscriptReference(
			@RequestBody RecoverSubscriptReferenceInfo refrernceInfo) {

		try {
			RecoverSubscriptReference reference = this.mRecoverSubscriptReferenceService
					.updateRecoverSubscriptReference(refrernceInfo.getProjectId(), refrernceInfo);
			RecoverSubscriptReferenceInfo result = this.mRecoverSubscriptReferenceService.getRecoverSubscriptReferenceInfo(refrernceInfo.getProjectId(),
					refrernceInfo.getId());
			return new ApiResponse<RecoverSubscriptReferenceInfo>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("updateRecoverSubscriptReference", ex);
			return new ApiResponse<RecoverSubscriptReferenceInfo>(ApiResponse.UnHandleException, null);
		}
	}
}
