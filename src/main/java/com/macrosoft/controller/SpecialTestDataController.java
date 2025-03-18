package com.macrosoft.controller;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.SpecialTest;
import com.macrosoft.model.SpecialTestData;
import com.macrosoft.service.SpecialTestDataService;
import com.macrosoft.service.SpecialTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class SpecialTestDataController {
	private static final ILogger logger = LoggerFactory.Create(SpecialTestDataController.class.getName());

	private SpecialTestDataService mSpecialTestDataService;
	@Autowired(required = true)
	
	public void setSpecialTestDataService(SpecialTestDataService specialTestDataService) {
		this.mSpecialTestDataService = specialTestDataService;
	}


	@RequestMapping(value = "/api/specialTestData/{specialTestId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<SpecialTestData>> getSpecialTestDatasBySpecialTestId(@PathVariable("specialTestId") long specialTestId) {
		try {
			List<SpecialTestData> result = this.mSpecialTestDataService.listSpecialTestDatasBySpecialTestId(specialTestId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getSpecialTestDatasBySpecialTestId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/specialTestData/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<SpecialTestData> createSpecialTestDataNew(@RequestBody SpecialTestData specialTestData) {
		try {
			this.mSpecialTestDataService.addSpecialTestData(specialTestData);
			return new ApiResponse<>(ApiResponse.Success, specialTestData);
		} catch (Exception ex) {
			logger.error("createSpecialTestDataNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/specialTestData/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<SpecialTestData> editSpecialTestDataNew(@RequestBody SpecialTestData specialTestData) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editSpecialTestDataNew");
			this.mSpecialTestDataService.updateSpecialTestData(specialTestData);
			return new ApiResponse<>(ApiResponse.Success, specialTestData);
		} catch (Exception ex) {
			logger.error("editSpecialTestDataNew", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/specialTestData/delete/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteSpecialTestData(@PathVariable("id") long id) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteSpecialTestData");
			this.mSpecialTestDataService.removeSpecialTestData(id);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("deleteSpecialTestData", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
}
