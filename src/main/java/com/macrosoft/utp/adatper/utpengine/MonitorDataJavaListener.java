package com.macrosoft.utp.adatper.utpengine;

import java.util.Date;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.macrosoft.caching.CachedDataManager;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.MonitorData;
import com.macrosoft.utilities.ParserResult;
import com.macrosoft.utilities.StringUtility;
import com.macrosoftsys.UtpCoreAccessLib.*;

public class MonitorDataJavaListener extends IMonitorDataListener {
	private static final ILogger logger = LoggerFactory.Create(MonitorDataJavaListener.class.getName());
	private String executionId;
	private String tenantId;
	
	public MonitorDataJavaListener(String executionId, String tenantId) {
		super();
		
		this.executionId = executionId;
		this.tenantId = tenantId;
	}

	public void dataChanged(MonitoredData data, long engineSessionId, String timestamp) {
		try
		{
			logger.info(String.format("dataChanged() -> executionId:%s, tenantId:%s, timestamp:%s", executionId, tenantId, timestamp));
			String name = data.getDataName();
			logger.info("name is: " + name);

			//String valueForDataTypeString = "";
			//List<String> valueForDataTypeArray = new ArrayList<String>();

			DataValueItemVector valueItems = data.getDataValue();
			
			String dataType = "";
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("name", name);
			
			MonitorDataTypeEnum type = data.getDataType();
			if (type == MonitorDataTypeEnum.DATATYPTE_STRING)
			{
				logger.info("dataType: string");
				dataType = "string";

				for (int i = 0; i < valueItems.size(); ++i) {
					
					DataValueItem item = valueItems.get(i);
					
					logger.debug("valueItems.get(i) passed.");
					
					try {
						//String valStr = new String(value, "UTF-8");
						//{"name":"voltage","value":"2\u0000"}
						String valStr = item.getValue();

						logger.info(String.format("valStr:%s", valStr));

						jsonObject.put("value", valStr);
					} catch (Exception ex) {
						logger.error("exception for casting" + ex.toString());
					}
				}
			}
			else if (type == MonitorDataTypeEnum.DATATYPTE_ARRAY)
			{
				logger.info("dataType: array");
				dataType = "array";
				
				JSONArray arrayValue = new JSONArray();
				
				
				for (int i = 0; i < valueItems.size(); ++i) {
					DataValueItem item = valueItems.get(i);
					try {

						String valStr = item.getValue();
						logger.info(String.format("valStr:%s", valStr));						
						logger.info(valStr);
						arrayValue.add(valStr);
					} catch (Exception ex) {
						logger.error("exception for casting" + ex.toString());
					}
				}

				jsonObject.put("value", arrayValue);
			}
			else if (type == MonitorDataTypeEnum.DATATYPTE_BINARY)
			{
				logger.info("dataType: binary");
				dataType = "binary";
			}
			else
			{
				dataType = "unkonwn";
				logger.info("dataType: unkonwn");
			}	
			
			MonitorData monitorData = new MonitorData();
			monitorData.setDataType(dataType);
			
			//timestamp format:2022-04-25 21:27:46:79
			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(timestamp);
			if (dateResult.isParserSuccess())
			{
				monitorData.setCreatedTime(dateResult.getResult());
			}
			
			monitorData.setExecutionId(executionId);
			monitorData.setJsonData(jsonObject.toJSONString());
			
			CachedDataManager.AddMonitorData(tenantId, monitorData);
		}
		catch(Exception ex)
		{
			logger.error(String.format("dataChanged() -> has exception:%s", ex.toString()));
		}
	}

	public void finalize() {
		logger.info(String.format("the MonitorDataJavaListener has been finalized."));
	}

}
