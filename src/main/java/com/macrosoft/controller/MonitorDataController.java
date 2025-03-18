package com.macrosoft.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.MonitorData;
import com.macrosoft.service.MonitorDataService;

@Controller
public class MonitorDataController {
	private static final ILogger logger = LoggerFactory.Create(MonitorDataController.class.getName());

	private MonitorDataService monitorDataService;

	@Autowired(required = true)
	
	public void setMonitorDataService(MonitorDataService monitorDataService) {
		this.monitorDataService = monitorDataService;
	}

	@RequestMapping(value = "/api/query/monitorData/{executionId}/{idAsStartPoint}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MonitorData>> getExecutionResults(@PathVariable("executionId") String executionId,
			@PathVariable("idAsStartPoint") long idAsStartPoint) {
		try {
			List<MonitorData> foundMonitorDatas = this.monitorDataService.getMonitorDatasAfterFromId(executionId, idAsStartPoint);
			return new ApiResponse<List<MonitorData>>(ApiResponse.Success, foundMonitorDatas);
		} catch (Exception ex) {
			logger.error("getExecutionResults", ex);
			return new ApiResponse<List<MonitorData>>(ApiResponse.UnHandleException, null);
		}
	}
}
