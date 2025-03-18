package com.macrosoft.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.dto.JsonStorageInfo;
import com.macrosoft.controller.dto.JsonStorageInfoConverter;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.JsonStorage;
import com.macrosoft.service.JsonStorageService;

@Controller
public class JsonStorageController {
	private static final ILogger logger = LoggerFactory.Create(JsonStorageController.class.getName());
	private JsonStorageService jsonStorageService;

	@Autowired(required = true)
	
	public void setJsonStorageService(JsonStorageService jsonStorageService) {
		this.jsonStorageService = jsonStorageService;
	}
 
	//Content-Type:application/json
	@RequestMapping(value = "/api/jsonStorage/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> createJsonStorage(@RequestBody JsonStorageInfo jsonStorageInfo) {
		try {
			JsonStorage jsonStorage = JsonStorageInfoConverter.ConvertToJsonStorage(jsonStorageInfo);
			this.jsonStorageService.addJsonStorage(jsonStorage);
			
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("createJsonStorage", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}
	
   
	@RequestMapping(value = "/api/jsonStorage/get/{id}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<JsonStorageInfo> getJsonStorageById(@PathVariable("id") String id) {

		logger.info(String.format("getJsonStorageById id: %s", id));

		try {
			JsonStorage jsonStorage = this.jsonStorageService.getJsonStorage(id);
			JsonStorageInfo jsonStorageInfo = JsonStorageInfoConverter.ConvertToJsonStorageInfo(jsonStorage);	
			return new ApiResponse<JsonStorageInfo>(ApiResponse.Success, jsonStorageInfo);
		} catch (Exception ex) {
			logger.error("getJsonStorageById", ex);
			return new ApiResponse<JsonStorageInfo>(ApiResponse.UnHandleException, null);
		}
			
	}
}
