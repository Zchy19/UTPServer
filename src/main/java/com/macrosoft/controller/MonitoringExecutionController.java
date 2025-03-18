package com.macrosoft.controller;

import com.macrosoft.logging.TrailUtility;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import com.macrosoft.controller.dto.BooleanResultInfo;
import com.macrosoft.controller.dto.ExecutionKeyInfo;
import com.macrosoft.controller.dto.MonitorExecutionStartParameter;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.MonitoringExecution;
import com.macrosoft.model.MonitoringExecutionDetail;
import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.service.MonitoringExecutionService;
import com.macrosoft.service.MonitoringTestSetService;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import java.util.List;
import java.util.UUID;

/**
 * Handles requests for the application home page.
 */
@Controller
public class MonitoringExecutionController {

	private static final ILogger logger = LoggerFactory.Create(MonitoringExecutionController.class.getName());

	private MonitoringExecutionService monitoringExecutionService;
	private MonitoringTestSetService monitoringTestSetService;
	private UtpEngineControllerManager utpEngineControllerManager;

	@Autowired(required = true)
	
	public void setMonitoringExecutionService(MonitoringExecutionService monitoringExecutionService){
		this.monitoringExecutionService = monitoringExecutionService;
	}

	@Autowired(required = true)
	
	public void setUtpEngineControllerManager(UtpEngineControllerManager ps){
		this.utpEngineControllerManager = ps;
	}
	
	@Autowired(required = true)
	
	public void setMonitoringTestSetService(MonitoringTestSetService monitoringTestSetService) {
		this.monitoringTestSetService = monitoringTestSetService;
	}

	@RequestMapping(value = "/api/monitorExecution/start", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> startMonitorExecution(@RequestBody MonitorExecutionStartParameter payLoad) {
		try {
			String executionId = payLoad.getExecutionId();
			String executedByUserId = payLoad.getExecutedByUserId();			
			String ipAddress = payLoad.getIpAddress();
			long port = payLoad.getPort();
			long monitoringTestSetId = payLoad.getMonitoringTestSetId();
			long projectId = payLoad.getProjectId();
			boolean isTemporaryExecution = payLoad.isTemporaryExecution();
			logger.info(String.format(
					"startMonitorExecution executionId:%s,executedByUserId:%s, ipAddress: %s, port: %s, projectId: %s, monitoringTestSetId: %s, isTemporaryExecution: %s",
					executionId, executedByUserId, ipAddress, port, projectId, monitoringTestSetId, isTemporaryExecution));
			
			MonitoringExecution monitorExecution = monitoringExecutionService.getMonitoringExecution(executionId);
			if (monitorExecution == null)
			{
				monitorExecution = new MonitoringExecution();		
				monitorExecution.setExecutionId(executionId);
				monitorExecution.setMonitoringTestSetId(monitoringTestSetId);
				monitorExecution.setProjectId(projectId);
				monitorExecution.setStartTime(DateTime.now().toDate());
				monitoringExecutionService.addMonitoringExecution(monitorExecution);
			}
			monitoringExecutionService.startExecution(payLoad);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("startMonitorExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/monitorExecution/addMonitorExecution", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> addMonitorExecution(@RequestBody MonitoringExecution monitorExecution) {
		try {
			logger.info(String.format("addMonitorExecution MonitorExecution:%s", monitorExecution));
			monitorExecution.setStartTime(DateTime.now().toDate());
			monitoringExecutionService.addMonitoringExecution(monitorExecution);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("addMonitorExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/monitorExecution/updateMonitorExecution/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Boolean> updateMonitorExecution(@PathVariable("executionId") String executionId) {
		try {
			logger.info(String.format("updateMonitorExecution executionId:%s", executionId));
			MonitoringExecution monitorExecution = monitoringExecutionService.getMonitoringExecution(executionId);
			if (monitorExecution != null) {
				monitorExecution.setStopTime(DateTime.now().toDate());
				monitoringExecutionService.updateMonitoringExecution(monitorExecution);
			}
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("updateMonitorExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
		@RequestMapping(value = "/api/monitorExecution/sendCommand", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> sendCommand(@RequestBody MonitorExecutionStartParameter payLoad) {
		try {
			String executionId = payLoad.getExecutionId();
			String executedByUserId = payLoad.getExecutedByUserId();			
			String ipAddress = payLoad.getIpAddress();
			long port = payLoad.getPort();
			long monitoringTestSetId = payLoad.getMonitoringTestSetId();
			long projectId = payLoad.getProjectId();
			logger.info(String.format(
					"startMonitorExecution executionId:%s,executedByUserId:%s, ipAddress: %s, port: %s, projectId: %s, monitoringTestSetId: %s",
					executionId, executedByUserId, ipAddress, port, projectId, monitoringTestSetId));
			
			monitoringExecutionService.SendCommandExecution(payLoad);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("startMonitorExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
	
	@RequestMapping(value = "/api/monitorExecution/stop", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> stopMonitorExecution(@RequestBody ExecutionKeyInfo executionKeyInfo) {
		BooleanResultInfo resultInfo = new BooleanResultInfo();

		try {
			String executionId = executionKeyInfo.getExecutionId();
			logger.info(String.format("stopMonitorExecution - executionId:%s", executionId));

			monitoringExecutionService.stopExecution(executionKeyInfo.getExecutionId());

			MonitoringExecution monitorExecution = monitoringExecutionService.getMonitoringExecution(executionId);
			if (monitorExecution != null)
			{	
				monitorExecution.setStopTime(DateTime.now().toDate());
				monitoringExecutionService.updateMonitoringExecution(monitorExecution);
			}

			resultInfo.setResult(true);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("stopMonitorExecution", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/monitorExecution/getStatus/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<String> getMonitoringExecutionStatus(@PathVariable("executionId") String executionId) {
		try {
			MonitoringExecution execution = this.monitoringExecutionService.getMonitoringExecution(executionId);
			if (execution == null)
			{
				return new ApiResponse<String>(ApiResponse.UnHandleException, null);
			}
			
			return new ApiResponse<String>(ApiResponse.Success, execution.getExecutionStatus());
		} catch (Exception ex) {
			logger.error("getMonitoringExecutionStatus", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/monitorExecution/monitorExecutionData/{testSetId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MonitoringExecution>> getMonitoringExecutionData(@PathVariable("testSetId") long testSetId) {
		try {
			List<MonitoringExecution> executionList = this.monitoringExecutionService.getMonitoringExecutionData(testSetId);
			if (executionList == null)
			{
				return new ApiResponse<List<MonitoringExecution>>(ApiResponse.UnHandleException, null);
			}

			return new ApiResponse<List<MonitoringExecution>>(ApiResponse.Success, executionList);
		} catch (Exception ex) {
			logger.error("getMonitoringExecutionData", ex);
			return new ApiResponse<List<MonitoringExecution>>(ApiResponse.UnHandleException, null);
		}
	}
	
	
	@RequestMapping(value = "/api/monitorExecution/monitorDetail/{executionId}/{monitorDataName}/{resultIdAsStartPoint}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MonitoringExecutionDetail>> getMonitoringExecutionDetails(@PathVariable("executionId") String executionId,
			@PathVariable("monitorDataName") String monitorDataName, @PathVariable("resultIdAsStartPoint") long resultIdAsStartPoint) {
		try {
			List<MonitoringExecutionDetail> details = this.monitoringExecutionService.getMonitoringExecutionDetails(executionId, monitorDataName, resultIdAsStartPoint);
			return new ApiResponse<List<MonitoringExecutionDetail>>(ApiResponse.Success, details);
		} catch (Exception ex) {
			logger.error("geMonitoringExecutionDetails", ex);
			return new ApiResponse<List<MonitoringExecutionDetail>>(ApiResponse.UnHandleException, null);
		}
	}
	

	@RequestMapping(value = "/api/monitorExecution/monitorDetailByExecutionId/{executionId}/{resultIdAsStartPoint}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MonitoringExecutionDetail>> getMonitoringExecutionDetails(
																			@PathVariable("executionId") String executionId,
																			@PathVariable("resultIdAsStartPoint") long resultIdAsStartPoint) {
		try {
			List<MonitoringExecutionDetail> details = this.monitoringExecutionService.getMonitoringExecutionDetails(executionId, resultIdAsStartPoint);
			return new ApiResponse<List<MonitoringExecutionDetail>>(ApiResponse.Success, details);
		} catch (Exception ex) {
			logger.error("getMonitorDetailByExecutionId", ex);
			return new ApiResponse<List<MonitoringExecutionDetail>>(ApiResponse.UnHandleException, null);
		}
	}
	
	@RequestMapping(value = "/api/monitorExecution/monitorDetail/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> addMonitoringExecutionDetails(@RequestBody MonitoringExecutionDetail payload) {
		try {
			MonitoringExecutionDetail result = this.monitoringExecutionService.addMonitoringExecutionDetails(payload);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("addMonitoringExecutionDetails", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/monitorExecution/delete/{executionId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteMonitoringExecution(@PathVariable("executionId") String executionId) {
		try {
			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteMonitoringExecution");
			this.monitoringExecutionService.deleteMonitoringExecution(executionId);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("deleteMonitoringTestSet", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
}
