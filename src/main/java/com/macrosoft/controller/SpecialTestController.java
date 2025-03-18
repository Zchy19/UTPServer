package com.macrosoft.controller;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.SpecialTest;
import com.macrosoft.service.SpecialTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
public class SpecialTestController {
	private static final ILogger logger = LoggerFactory.Create(SpecialTestController.class.getName());

	private SpecialTestService mSpecialTestService;
	@Autowired(required = true)
	
	public void setSpecialTestService(SpecialTestService specialTestService) {
		this.mSpecialTestService = specialTestService;
	}



	@RequestMapping(value = "/api/specialTest/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<SpecialTest>> getSpecialTestsByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<SpecialTest> result = this.mSpecialTestService.listSpecialTestsByProjectId(projectId);
			return new ApiResponse<List<SpecialTest>>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getSpecialTestsByProjectId", ex);
			return new ApiResponse<List<SpecialTest>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/specialTest/{projectId}/{id}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<SpecialTest> getSpecialTest(@PathVariable("projectId") long projectId,
			@PathVariable("id") long id) {
		try {
			SpecialTest result = this.mSpecialTestService.getSpecialTestById(projectId, id);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getSpecialTest", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/specialTest/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<SpecialTest> createSpecialTestNew(@RequestBody SpecialTest specialTest) {
		try {
			this.mSpecialTestService.addSpecialTest(specialTest.getProjectId(), specialTest);
			return new ApiResponse<>(ApiResponse.Success, specialTest);
		} catch (Exception ex) {
			logger.error("createSpecialTestNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/specialTest/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<SpecialTest> editSpecialTestNew(@RequestBody SpecialTest specialTest) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editMonitoringTestSetNew");
			this.mSpecialTestService.updateSpecialTest(specialTest.getProjectId(), specialTest);
			return new ApiResponse<>(ApiResponse.Success, specialTest);
		} catch (Exception ex) {
			logger.error("editMonitoringTestSetNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/specialTest/delete/{projectId}/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteSpecialTest(@PathVariable("projectId") long projectId,
			@PathVariable("id") long id) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteSpecialTest");
			this.mSpecialTestService.removeSpecialTest(projectId, id);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("deleteSpecialTest", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
}
