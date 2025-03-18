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

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.service.MonitoringTestSetService;
import com.macrosoft.service.ScriptLinkService;

@Controller
public class MonitoringTestSetController {
	private static final ILogger logger = LoggerFactory.Create(MonitoringTestSetController.class.getName());

	private MonitoringTestSetService mMonitoringTestSetService;


	@Autowired(required = true)
	
	public void setMonitoringTestSetService(MonitoringTestSetService MonitoringTestSetService) {
		this.mMonitoringTestSetService = MonitoringTestSetService;
	}

	@RequestMapping(value = "/api/monitoringTestSet/getByProjectId/{projectId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MonitoringTestSet>> getMonitoringTestSetsByProjectId(@PathVariable("projectId") long projectId) {
		try {
			List<MonitoringTestSet> result = this.mMonitoringTestSetService.listMonitoringTestSetsByProjectId(projectId);
			return new ApiResponse<List<MonitoringTestSet>>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getMonitoringTestSetsByProjectId", ex);
			return new ApiResponse<List<MonitoringTestSet>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/monitoringTestSet/{projectId}/{id}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<MonitoringTestSet> getMonitoringTestSet(@PathVariable("projectId") long projectId,
			@PathVariable("id") long id) {
		try {
			MonitoringTestSet result = this.mMonitoringTestSetService.getMonitoringTestSetById(projectId, id);
			return new ApiResponse<MonitoringTestSet>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getMonitoringTestSet", ex);
			return new ApiResponse<MonitoringTestSet>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/monitoringTestSet/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<MonitoringTestSet> createMonitoringTestSetNew(@RequestBody MonitoringTestSet MonitoringTestSet) {
		try {
			this.mMonitoringTestSetService.addMonitoringTestSet(MonitoringTestSet.getProjectId(), MonitoringTestSet);
			return new ApiResponse<MonitoringTestSet>(ApiResponse.Success, MonitoringTestSet);
		} catch (Exception ex) {
			logger.error("createMonitoringTestSetNew", ex);
			return new ApiResponse<MonitoringTestSet>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/monitoringTestSet/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<MonitoringTestSet> editMonitoringTestSetNew(@RequestBody MonitoringTestSet MonitoringTestSet) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editMonitoringTestSetNew");
			this.mMonitoringTestSetService.updateMonitoringTestSet(MonitoringTestSet.getProjectId(), MonitoringTestSet);
			return new ApiResponse<MonitoringTestSet>(ApiResponse.Success, MonitoringTestSet);
		} catch (Exception ex) {
			logger.error("editMonitoringTestSetNew", ex);
			return new ApiResponse<MonitoringTestSet>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/monitoringTestSet/delete/{projectId}/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteMonitoringTestSet(@PathVariable("projectId") long projectId,
			@PathVariable("id") long id) {

		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteMonitoringTestSet");
			this.mMonitoringTestSetService.removeMonitoringTestSet(projectId, id);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("deleteMonitoringTestSet", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
}
