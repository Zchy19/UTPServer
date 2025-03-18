package com.macrosoft.controller.dto;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.macrosoft.controller.RecorderController;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.JsonStorage;

public class JsonStorageInfoConverter
{

	private static final ILogger logger = LoggerFactory.Create(RecorderController.class.getName());
	
	public static JsonStorageInfo ConvertToJsonStorageInfo(JsonStorage jsonStorage)
	{
		JsonStorageInfo jsonStorageInfo = new JsonStorageInfo();
		jsonStorageInfo.setId(jsonStorage.getId());
		jsonStorageInfo.setType(jsonStorage.getType());

		JSONParser parser = new JSONParser();
		Object jsonDataObject;

		try 
		{
			jsonDataObject = parser.parse(jsonStorage.getJsonData());			
			if (jsonDataObject instanceof JSONObject) {
				jsonStorageInfo.setJsonData((JSONObject)jsonDataObject);
			}
		}
		catch (ParseException ex) {
			logger.error("ConvertToJsonStorageInfo parse jsonData failed.");
		}
		
		return jsonStorageInfo;
	}
	
	public static JsonStorage ConvertToJsonStorage(JsonStorageInfo jsonStorageInfo)
	{
		JsonStorage jsonStorage = new JsonStorage();
		jsonStorage.setId(jsonStorageInfo.getId());
		jsonStorage.setType(jsonStorageInfo.getType());

		jsonStorage.setJsonData(jsonStorageInfo.getJsonData().toJSONString());

		return jsonStorage;
	}

}
