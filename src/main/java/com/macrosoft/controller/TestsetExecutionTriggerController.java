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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.macrosoft.controller.dto.TestsetExecutionTriggerUpdateParameter;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.job.TestsetExecutionTriggerMonitor;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.TestsetExecutionTrigger;
import com.macrosoft.service.TestsetExecutionTriggerService;

@Controller
public class TestsetExecutionTriggerController {
	private static final ILogger logger = LoggerFactory.Create(TestsetExecutionTriggerController.class.getName());
	private TestsetExecutionTriggerService mTestsetExecutionTriggerService;
	private TestsetExecutionTriggerMonitor mTestsetExecutionTriggerMonitor;

	@Autowired(required = true)
	
	public void setTestsetExecutionTriggerService(TestsetExecutionTriggerService ps) {
		this.mTestsetExecutionTriggerService = ps;
	}

	@Autowired(required = true)
	
	public void setTestsetExecutionTriggerMonitor(TestsetExecutionTriggerMonitor testsetExecutionTriggerMonitor) {
		this.mTestsetExecutionTriggerMonitor = testsetExecutionTriggerMonitor;
	}

	@RequestMapping(value = "/api/testsetExecutionTrigger/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<TestsetExecutionTrigger> createTestsetExecutionTrigger(@RequestBody TestsetExecutionTrigger testsetExecutionTrigger) {
		try {
			this.mTestsetExecutionTriggerService.addTestsetExecutionTrigger(testsetExecutionTrigger);

			mTestsetExecutionTriggerMonitor.UpdateWithJobSchedule(Long.parseLong(getTenantId()),
					testsetExecutionTrigger);

			return new ApiResponse<TestsetExecutionTrigger>(ApiResponse.Success, testsetExecutionTrigger);
		} catch (Exception ex) {
			logger.error("createTestsetExecutionTrigger", ex);
			return new ApiResponse<TestsetExecutionTrigger>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testsetExecutionTrigger/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> editTestsetExecutionTrigger(
			@RequestBody TestsetExecutionTriggerUpdateParameter parameter) {
		try {
			TrailUtility.Trail(logger,TrailUtility.Trail_Update, "editTestsetExecutionTrigger");
			TestsetExecutionTrigger trigger = this.mTestsetExecutionTriggerService
					.getTestsetExecutionTriggerById(parameter.getProjectId(), parameter.getId());

			trigger.setCrontriggerExpression(parameter.getCrontriggerExpression());
			trigger.setIsEnabled(parameter.getIsEnabled());
			trigger.setStartTime(parameter.getStartTime());
			this.mTestsetExecutionTriggerService.updateTestsetExecutionTrigger(trigger);

			mTestsetExecutionTriggerMonitor.UpdateWithJobSchedule(Long.parseLong(getTenantId()), trigger);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("editTestsetExecutionTrigger", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	@RequestMapping(value = "/api/testsetExecutionTrigger/getByTestsetId/{projectId}/{testsetId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<TestsetExecutionTrigger>> getByTestsetId(@PathVariable("projectId") long projectId,
			@PathVariable("testsetId") long testsetId) {
		try {
			List<TestsetExecutionTrigger> testsetExecutionTriggers = this.mTestsetExecutionTriggerService
					.getTestsetExecutionTriggerByTestsetId(projectId, testsetId);
			return new ApiResponse<List<TestsetExecutionTrigger>>(ApiResponse.Success, testsetExecutionTriggers);
		} catch (Exception ex) {
			logger.error("getByTestsetId", ex);
			return new ApiResponse<List<TestsetExecutionTrigger>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/testsetExecutionTrigger/delete/{projectId}/{testsetExecutionTriggerId}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteTestsetExecutionTrigger(@PathVariable("projectId") long projectId,
			@PathVariable("testsetExecutionTriggerId") long testsetExecutionTriggerId) {
		try {
			TrailUtility.Trail(logger,TrailUtility.Trail_Deletion, "deleteTestsetExecutionTrigger");
			this.mTestsetExecutionTriggerService.removeTestsetExecutionTrigger(projectId, testsetExecutionTriggerId);
			mTestsetExecutionTriggerMonitor.DeleteTriggerFromJobSchedule(Long.parseLong(getTenantId()),
					testsetExecutionTriggerId);

			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteTestsetExecutionTrigger", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

	private String getTenantId() {
		ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		String tenantId = TenantContext.DefaultTenantId;

		if (attr != null && attr.getRequest().getHeader("tenantId") != null) {
			logger.info("ServletRequestAttributes tenantId header :" + attr.getRequest().getHeader("tenantId"));

			tenantId = attr.getRequest().getHeader("tenantId");
		}
		return tenantId;
	}
}
