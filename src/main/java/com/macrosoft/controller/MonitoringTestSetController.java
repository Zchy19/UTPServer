package com.macrosoft.controller;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.model.composition.MonitoringTestSetAggregate;
import com.macrosoft.service.MonitoringTestSetService;
import com.macrosoft.service.ScriptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monitoringTestSet")
public class MonitoringTestSetController {
	private static final ILogger logger = LoggerFactory.Create(MonitoringTestSetController.class.getName());

	private MonitoringTestSetService monitoringTestSetService;
	private ScriptService scriptService;

	@Autowired
	public void setMonitoringTestSetService(MonitoringTestSetService monitoringTestSetService) {
		this.monitoringTestSetService = monitoringTestSetService;
	}

	@Autowired
	public void setScriptService(ScriptService scriptService) {
		this.scriptService = scriptService;
	}

	@GetMapping("/getByProjectId/{projectId}")
	public ApiResponse<List<MonitoringTestSet>> getMonitoringTestSetsByProjectId(@PathVariable long projectId) {
		try {
			List<MonitoringTestSet> result = monitoringTestSetService.listMonitoringTestSetsByProjectId(projectId);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getMonitoringTestSetsByProjectId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@GetMapping("/{projectId}/{id}")
	public ApiResponse<MonitoringTestSet> getMonitoringTestSet(@PathVariable long projectId, @PathVariable long id) {
		try {
			MonitoringTestSet result = monitoringTestSetService.getMonitoringTestSetById(projectId, id);
			return new ApiResponse<>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getMonitoringTestSet", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@PostMapping("/create")
	public ApiResponse<MonitoringTestSet> createMonitoringTestSet(@RequestBody MonitoringTestSet monitoringTestSet) {
		try {
			monitoringTestSetService.addMonitoringTestSet(monitoringTestSet.getProjectId(), monitoringTestSet);
			return new ApiResponse<>(ApiResponse.Success, monitoringTestSet);
		} catch (Exception ex) {
			logger.error("createMonitoringTestSet", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@PostMapping("/update")
	public ApiResponse<MonitoringTestSet> updateMonitoringTestSet(@RequestBody MonitoringTestSet monitoringTestSet) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateMonitoringTestSet");
			monitoringTestSetService.updateMonitoringTestSet(monitoringTestSet.getProjectId(), monitoringTestSet);
			return new ApiResponse<>(ApiResponse.Success, monitoringTestSet);
		} catch (Exception ex) {
			logger.error("updateMonitoringTestSet", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}

	@PostMapping("/delete/{projectId}/{id}")
	public ApiResponse<Boolean> deleteMonitoringTestSet(@PathVariable long projectId, @PathVariable long id) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteMonitoringTestSet");
			monitoringTestSetService.removeMonitoringTestSet(projectId, id);
			return new ApiResponse<>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteMonitoringTestSet", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, false);
		}
	}

//	@PostMapping("/create")
//	public ApiResponse<MonitoringTestSet> createMonitoringTestSet(@RequestBody MonitoringTestSetAggregate monitoringTestSetAggregate) {
//		try {
//			monitoringTestSetService.addMonitoringTestSet(monitoringTestSetAggregate.getMonitoringTestSet().getProjectId(), monitoringTestSetAggregate.getMonitoringTestSet());
//			return new ApiResponse<>(ApiResponse.Success, monitoringTestSetAggregate.getMonitoringTestSet());
//		} catch (Exception ex) {
//			logger.error("createMonitoringTestSet", ex);
//			return new ApiResponse<>(ApiResponse.UnHandleException, null);
//		}
//	}
}