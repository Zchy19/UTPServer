package com.macrosoft.controller;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.service.*;
import com.macrosoft.urs.IpAddress;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import org.hibernate.SQLQuery;
import org.hibernate.transform.Transformers;
import org.hibernate.type.StandardBasicTypes;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Handles requests for the application home page.
 */
@Controller
public class ExecutionDataController {

	private static final ILogger logger = LoggerFactory.Create(ExecutionDataController.class.getName());
	private ExecutionDataService executionDataService;
	@Autowired(required = true)
	
	public void setExecutionDataService(ExecutionDataService executionDataService){
		this.executionDataService = executionDataService;
	}
	//添加
	@RequestMapping(value = "/api/executionData/add", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> addExecutionData(@RequestBody ExecutionData executionData){
		try {
			this.executionDataService.addExecutionData(executionData);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("createScriptInfo", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}

	}
	//自定义添加
	@RequestMapping(value = "/api/executionData/upload", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> uploadExecutionData(@RequestBody ExecutionDataInfo executionDataInfo){
		try {
			String execOutputDataExtraID = executionDataInfo.getExecOutputDataExtraID();
			ExecutionData executionData = new ExecutionData();
			//对execOutputDataExtraID以&进行分割
			String[] execOutputDataExtraIDArray = execOutputDataExtraID.split("&");
			executionData.setExecutionId(execOutputDataExtraIDArray[0]);
			executionData.setScriptGroupId(execOutputDataExtraIDArray[1]);
			executionData.setJsonData(executionDataInfo.getDataContent());
			executionData.setType(executionDataInfo.getDataType());
			executionData.setDataSource(executionDataInfo.getDataSource());
			executionData.setUploadStatus(executionDataInfo.getUploadStatus());
			this.executionDataService.addExecutionData(executionData);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);

		} catch (Exception ex) {
			logger.error("createScriptInfo", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}

	}
	//根据executionId查询
	@RequestMapping(value = "/api/executionData/getExecutionDataByExecutionId/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionData>> getExecutionDataByExecutionId(@PathVariable("executionId") String executionId){
		try {
			List<ExecutionData> executionData = this.executionDataService.getExecutionDataByExecutionId(executionId);
			return new ApiResponse<List<ExecutionData>>(ApiResponse.Success, executionData);

		} catch (Exception ex) {
			logger.error("createScriptInfo", ex);
			return new ApiResponse<List<ExecutionData>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/executionData/listExecutionData/{executionId}/{lastResultId}/{maximum}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<ExecutionData>> listExecutionData(@PathVariable("executionId") String executionId, @PathVariable("lastResultId") int lastResultId, @PathVariable("maximum") int maximum) {
		try {
			List<ExecutionData> executionDatas = this.executionDataService.listExecutionData(executionId, lastResultId);
			//如果数据超过maximum条，则只返回最早的maximum条
			if(executionDatas.size() > maximum){
				executionDatas = executionDatas.subList(0, maximum);
			}
			return new ApiResponse<>(ApiResponse.Success, executionDatas);

		} catch (Exception ex) {
			logger.error("createScriptInfo", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}





}
