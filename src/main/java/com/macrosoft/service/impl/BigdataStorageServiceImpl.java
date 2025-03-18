package com.macrosoft.service.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

import javax.servlet.ServletContext;

import com.macrosoft.dao.ProtocolSignalDAO;
import com.macrosoft.model.*;
import com.macrosoft.service.BigdataStorageService;
import com.macrosoft.service.FieldLocatorInvalidException;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.BusFrameSnapshot;
import com.macrosoft.dao.BigdataStorageDAO;
import com.macrosoft.dao.MessageTemplateDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.bdc.CanExecutionResult;
import com.macrosoft.model.bdc.CanFrameData;
import com.macrosoft.model.bdc.Candb;
import com.macrosoft.model.bdc.MessageInfo;
import com.macrosoft.model.genericbusFrame.*;
import com.macrosoft.model.idc.ARINC429FrameData;
import com.macrosoft.model.idc.IcdInputFrameInfo;
import com.macrosoft.model.idc.IcdModel;
import com.macrosoft.model.idc.IdcExecutionResult;
import com.macrosoft.model.m1553b.M1553ExecutionResult;
import com.macrosoft.model.m1553b.M1553FrameData;
import com.macrosoft.model.m1553b.M1553bModel;
import com.macrosoft.model.m1553ba429.M1553bA429ExecutionResult;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameComposeInfo;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameData;
import com.macrosoft.service.bigdataresovler.ARINC429ModelResolver;
import com.macrosoft.service.bigdataresovler.GenericBusFrameModelResolver;
import com.macrosoft.service.bigdataresovler.CanJ1939ModelResolver;
import com.macrosoft.service.bigdataresovler.M1533bModelResolver;
import com.macrosoft.service.bigdataresovler.M1553bAndARINC429ModelResolver;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.IcdUtility;
import com.macrosoft.utilities.ParserResult;
import com.macrosoft.utilities.StringUtility;
import com.macrosoft.utilities.SystemUtil;

@Service
public class BigdataStorageServiceImpl implements BigdataStorageService {
	
	@Autowired
	ServletContext context;

	public static final String ProtocolDataType = "GenericBusFrame";
	
	private static final ILogger logger = LoggerFactory.Create(BigdataStorageServiceImpl.class.getName());
	
	private BigdataStorageDAO BigdataStorageDAO;
	private MessageTemplateDAO MessageTemplateDAO;
	private ProtocolSignalDAO protocolSignalDAO;
	@Autowired
	public void setProtocolSignalDAO(ProtocolSignalDAO protocolSignalDAO) {
		this.protocolSignalDAO = protocolSignalDAO;
	}
	@Autowired
	public void setBigdataStorageDAO(BigdataStorageDAO BigdataStorageDAO) {
		this.BigdataStorageDAO = BigdataStorageDAO;
	}
	@Autowired
	public void setMessageTemplateDAO(MessageTemplateDAO messageTemplateDAO) {
		this.MessageTemplateDAO = messageTemplateDAO;
	}
	
	@Override
	@Transactional
	public void addBigdataStorage(BigdataStorage BigdataStorage) {
		this.BigdataStorageDAO.addBigdataStorage(BigdataStorage);
	}

	@Override
	@Transactional
	public void updateBigdataStorage(BigdataStorage BigdataStorage) {
		this.BigdataStorageDAO.updateBigdataStorage(BigdataStorage);
	}

	@Override
	@Transactional
	public List<BigdataStorageInfo> listBigdataStorageInfosByOrg(String fileType, long organizationId)
	{
		return this.BigdataStorageDAO.listBigdataStorageInfosByOrg(fileType, organizationId);
	}

	@Override
	@Transactional
	public List<BigdataStorageInfo> listBigdataStorageInfos(String fileType, String projectId)
	{
		return this.BigdataStorageDAO.listBigdataStorageInfos(fileType, projectId);
	}
	
	@Override
	@Transactional
	public void removeBigdataStorage(String id) {
	
		BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
		if (ProtocolDataType.compareToIgnoreCase(bigdataStorage.getDataType()) == 0)
		{
			this.MessageTemplateDAO.expireMessageTemplate(id);
		}
		
		this.BigdataStorageDAO.removeBigdataStorage(id);
	}

	@Override
	@Transactional
	public List<FieldValueResult> searchBusFrameStatistics(SearchBusFrameStasticParameter parameter) throws FieldLocatorInvalidException
	{
		// validate if fieldLocator is correct
		JSONArray fieldLocaltorJsonArray = StringUtility.toJSONArray(parameter.getFieldLocator());
		if (fieldLocaltorJsonArray == null)
		{
			throw new FieldLocatorInvalidException();			
		}
		

		logger.info("BigdataStorageServiceImpl::searchBusFrameStatistics()-> parameter.FieldLocator" + parameter.getFieldLocator());
		
		List<Integer> fieldLocatorIndexs = new ArrayList<Integer>();
		
		for (int i=0; i<fieldLocaltorJsonArray.size(); i++)
		{
			ParserResult<Integer> result = StringUtility.parseIntegerSafely(fieldLocaltorJsonArray.get(i).toString());
			if (!result.isParserSuccess()) throw new FieldLocatorInvalidException();
			
			fieldLocatorIndexs.add(result.getResult());
		}
		

		logger.info("BigdataStorageServiceImpl::searchBusFrameStatistics()-> pass fieldValidation test.");
		
		// locate field values
		List<FieldValueResult> results = new ArrayList<FieldValueResult>();
		
		List<BigdataStorage> bigdataStorages = this.BigdataStorageDAO.searchBusFrameStatistics(parameter);

		logger.info("BigdataStorageServiceImpl::searchBusFrameStatistics()-> search valid bigdataStorages size :" + bigdataStorages.size());
		
		for (BigdataStorage bigDataStorage : bigdataStorages)
		{
			//logger.info("BigdataStorageServiceImpl::searchBusFrameStatistics()-> parseFieldValues for bigdataStorageId:" + bigDataStorage.getId());
			
			List<FieldValueResult> fieldValues = parseFiledValues(bigDataStorage, parameter, fieldLocatorIndexs);

			if (fieldValues == null) continue;
			
			for (FieldValueResult fieldValue : fieldValues)
			{
				if (fieldValue != null)
				{
					results.add(fieldValue);
				}				
			}
		}
		
		logger.info("BigdataStorageServiceImpl::searchBusFrameStatistics()-> all fieldValueResult have been collected.");
		
		results.sort(Comparator.comparing(FieldValueResult::getTimestamp));
		
		return results;	
	}

	@Override
	@Transactional
	public List<BigdataStorage> searchBusFrameStatisticsOverview(SearchBusFrameParameter parameter)
	{
		try
		{
			List<BigdataStorage> results = new ArrayList<BigdataStorage>();
			
			// locate field values	
			List<BigdataStorage> bigdataStorages = this.BigdataStorageDAO.searchBusFrameStatistics(parameter);

			logger.info("BigdataStorageServiceImpl::searchBusFrameStatisticsOverview()->get bigdataStorages.Size():" + bigdataStorages.size());


			for (BigdataStorage bigDataStorage : bigdataStorages)
			{
				JSONParser parser = new JSONParser();
				JSONObject jsonObjectFromAntbot;

				try
				{
					if (bigDataStorage.getBigdata() == null || "".equalsIgnoreCase(bigDataStorage.getBigdata())) continue;
	
					jsonObjectFromAntbot = (JSONObject) parser.parse(bigDataStorage.getBigdata());
				}
				catch( Exception cEx)
				{
					logger.info("BigdataStorageServiceImpl::searchBusFrameStatisticsOverview()->parse bigdataStorages failed. id:" + bigDataStorage.getId());
					logger.error("BigdataStorageServiceImpl::searchBusFrameStatisticsOverview()->parse bigdataStorages failed", cEx);
					continue;
				}

				String busInterfaceDefID = (String) jsonObjectFromAntbot.get("busInterfaceDefID");

				if (!parameter.getProtocolId().equalsIgnoreCase(busInterfaceDefID)) continue;

				ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(busInterfaceDefID);

				if (protocolSignal == null) continue;

				logger.debug("ProtocolSignalServiceImpl::searchBusFrameStatisticsOverview()->get protocolSignal.Id:" + protocolSignal.getId());
				
				String jsonStr = "";
				if (ProtocolSignal.GenericBusFrame.compareToIgnoreCase(protocolSignal.getDataType()) == 0)
				{
					jsonStr = this.resolveFrameByGenericBusFrame(jsonObjectFromAntbot, "overview", -1);
				}
				
				bigDataStorage.setBigdata(jsonStr);	
				bigDataStorage.setDataType(bigDataStorage.getDataType() + "/" + protocolSignal.getDataType());

				results.add(bigDataStorage);
			}
			
			return results;
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::searchBusFrameStatisticsOverview()", ex);
			return null;
		}
	}
	
	private List<FieldValueResult> parseFiledValues(BigdataStorage bigDataStorage, 
													SearchBusFrameStasticParameter parameter, List<Integer> fieldLocatorIndexs)
	{
		
		List<FieldValueResult> results = new ArrayList<FieldValueResult>();
		try
		{
			JSONObject bigdataJsonObj = StringUtility.toJson(bigDataStorage.getBigdata());
			if (bigdataJsonObj == null) return null;

			if (!parameter.getProtocolId().equalsIgnoreCase(bigdataJsonObj.get("busInterfaceDefID").toString())) return results;
			
			String date = "";
			if (bigdataJsonObj.get("Date") != null)
			{
				date = bigdataJsonObj.get("Date").toString();
			}
			
			
			JSONArray frameDatas = (JSONArray) bigdataJsonObj.get("genericBusFrameDatas");
			
			Iterator<JSONObject> iterator = ((JSONArray) frameDatas).iterator();
			
			while (iterator.hasNext()) {
				Object itemObj = iterator.next();
				if (!(itemObj instanceof JSONObject)) {
					return null;
				}
				JSONObject messageJsonObject = (JSONObject) itemObj;
				String messageName = messageJsonObject.get("message").toString();

				if (!messageName.equalsIgnoreCase(parameter.getMessageName()))
				{
					continue;
				}

				String timeStamp = String.format("%s %s", date, messageJsonObject.get("timestamp").toString());

				String fieldValues = (String) messageJsonObject.get("fieldValues");
				JSONArray fieldValuesJsonArray = StringUtility.toJSONArray(fieldValues);
				
				
				JSONArray targetJsonArrary = fieldValuesJsonArray;
				int locatorIndex =  0;
				
				while (locatorIndex < (fieldLocatorIndexs.size()))
				{
					int locatorData = fieldLocatorIndexs.get(locatorIndex);
					Object targetObject = targetJsonArrary.get(locatorData);
					
					if (locatorIndex == (fieldLocatorIndexs.size() -1))
					{
						FieldValueResult fieldValueResult = new FieldValueResult();

						String fieldValue = "";

						JSONObject targetJsonObject = StringUtility.toJson(targetObject.toString());

						logger.info("targetObject.toString():" + targetObject.toString());
						
						if (targetJsonObject != null)
						{
							if (targetJsonObject.get("value") != null)
							{
								fieldValue = targetJsonObject.get("value").toString();
							}
						}
						else
						{
							fieldValue = targetObject.toString();
						}						
						
						fieldValueResult.setFieldValue(fieldValue);
						fieldValueResult.setTimestamp(timeStamp);
						
						results.add(fieldValueResult);
						
						break;
					}

					locatorIndex = locatorIndex + 1;

					
					
					targetJsonArrary = (JSONArray) targetJsonArrary.get(locatorData);	
				}
			}
		}
		catch (Exception ex)
		{
			logger.error("parseFiledValues", ex);
		}
		
		return results;
	}

	@Override
	@Transactional
	public Candb getDbcModel(String bigdataStorageId)
	{
		try
		{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(bigdataStorageId);
			if (BigdataStorage.CAN_J1939.compareToIgnoreCase(bigdataStorage.getDataType()) != 0)
			{
				return null;
			}
			
			Candb candb = resolveCandb(bigdataStorage);
			return candb;			
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::getDbcModel()", ex);
			return null;
		}
	}
	
	private Candb resolveCandb(BigdataStorage bigdataStorage) throws IOException
	{
		String id =  UUID.randomUUID().toString();
		String tempPath = resolveBigdataStorageFolderPath()  + File.separator  +  id;
		
		FileUtility.writeFileByString(tempPath, bigdataStorage.getBigdata());
		
		Candb candb = CanJ1939ModelResolver.resolve(tempPath);
		
		Files.delete(Paths.get(tempPath));
		return candb;			
	}
	
	@Override
	@Transactional	
	public BigdataStorage getProtocol(String id)
	{
		try
		{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
			if (bigdataStorage == null) return null;
			
			String jsonStr = "";
			if (BigdataStorage.ARINC429.compareToIgnoreCase(bigdataStorage.getDataType()) == 0
					|| BigdataStorage.MIL1553BAndARINC429.compareToIgnoreCase(bigdataStorage.getDataType()) == 0)
			{
				IcdModel icdModel = resolveARINC429Model(bigdataStorage);

				ObjectMapper Obj = new ObjectMapper();  
		        jsonStr = Obj.writeValueAsString(icdModel); 
		        
			}
			else if (BigdataStorage.CAN_J1939.compareToIgnoreCase(bigdataStorage.getDataType()) == 0)
			{
				Candb candb = resolveModelOfCanJ1939(bigdataStorage);
				ObjectMapper Obj = new ObjectMapper();  
		        jsonStr = Obj.writeValueAsString(candb); 
			}
			else if (BigdataStorage.MIL1553B.compareToIgnoreCase(bigdataStorage.getDataType()) == 0)
			{
				M1553bModel m1553bModel = resolveMIL1553B(bigdataStorage);
				ObjectMapper Obj = new ObjectMapper();  
		        jsonStr = Obj.writeValueAsString(m1553bModel); 
			}
			else if (BigdataStorage.GenericBusFrame.compareToIgnoreCase(bigdataStorage.getDataType()) == 0)
			{
				jsonStr = bigdataStorage.getBigdata();
			}
			else if (BigdataStorage.SignalProtocol.compareToIgnoreCase(bigdataStorage.getDataType()) == 0)
			{
				jsonStr = bigdataStorage.getBigdata();
			}
			else
			{
				return null;
			}
			
			
			bigdataStorage.setBigdata(jsonStr);	
			
			return bigdataStorage;
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::getProtocol()", ex);
			return null;
		}
	}
	

	
	@Override
	@Transactional
	public String composeFrameForA429(IcdInputFrameInfo icdInputFrameInfo)
	{	
		try{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(icdInputFrameInfo.getProtocolId());
			if (bigdataStorage == null) return null;
			
			IcdModel icdModel = this.resolveARINC429Model(bigdataStorage );
			
			return ARINC429ModelResolver.composeFrame(icdModel, icdInputFrameInfo);
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveInputFrameForA429()", ex);
			return null;
		}
	}

	@Override
	@Transactional
	public String composeFrameForGenericBusFrame(InputFrameInfo inputFrameInfo)
	{
		try{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(inputFrameInfo.getProtocolId());
			if (bigdataStorage == null) return null;
			
			MessageTable messageTable = this.resolveModelOfGenericBusFrame(bigdataStorage);
			
			return GenericBusFrameModelResolver.composeFrame(messageTable, inputFrameInfo);
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveInputFrameForGenericBusFrame()", ex);
			return null;
		}
	}

	@Override
	@Transactional
	public List<BigdataStorage> getAllBigdataStorage() {
		return this.BigdataStorageDAO.getAllBigdataStorage();
	}

	@Override
	@Transactional
	public List<BigdataStorage> getBigdataStorageByExecutionId(String executionId) {
		return this.BigdataStorageDAO.getBigdataStorageByExecutionId(executionId);
	}

	@Override
	@Transactional
	public String composeFrameForM1553bAndA429(M1553bAndA429FrameComposeInfo composeInfo)
	{	
		try{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(composeInfo.getProtocolId());
			if (bigdataStorage == null) return null;
			
			IcdModel icdModel = this.resolveARINC429Model(bigdataStorage );
			
			return M1553bAndARINC429ModelResolver.composeFrame(icdModel, composeInfo);
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveInputFrameForA429()", ex);
			return null;
		}
	}
	

	
	@Override
	@Transactional
	public BigdataStorage getBigdataStorage(String id)
	{
		try
		{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
			
			return bigdataStorage;
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::parseCanExecutionResult()", ex);
			return null;
		}
	}
	
	@Override
	@Transactional
	public BigdataStorage resolveProtocolBigdataStorage(String id)
	{
		try
		{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
			if (bigdataStorage == null) return null;
			
			if (BigdataStorage.BusFrameData.compareToIgnoreCase(bigdataStorage.getDataType()) != 0)
			{
				return bigdataStorage;
			}

			JSONParser parser = new JSONParser();
			JSONObject jsonObjectFromAntbot = (JSONObject) parser.parse(bigdataStorage.getBigdata());
			String busInterfaceDefID = (String) jsonObjectFromAntbot.get("busInterfaceDefID");
			ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(busInterfaceDefID);

			if (protocolSignal == null) return null;

			String jsonStr = "";
			if (ProtocolSignal.GenericBusFrame.compareToIgnoreCase(protocolSignal.getDataType()) == 0)
			{
				jsonStr = bigdataStorage.getBigdata();
			}
			
			bigdataStorage.setBigdata(jsonStr);	
			bigdataStorage.setDataType(bigdataStorage.getDataType() + "/" + protocolSignal.getDataType());
			
			return bigdataStorage;
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveProtocolBigdataStorage()", ex);
			return null;
		}
	}

	@Override
	@Transactional
	public BigdataStorage resolveProtocolBigdataStorageWithOverview(String id)
	{
		try
		{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
			if (bigdataStorage == null) return null;
			
			if (BigdataStorage.BusFrameData.compareToIgnoreCase(bigdataStorage.getDataType()) != 0)
			{
				return bigdataStorage;
			}

			JSONParser parser = new JSONParser();
			JSONObject jsonObjectFromAntbot = (JSONObject) parser.parse(bigdataStorage.getBigdata());
			String busInterfaceDefID = (String) jsonObjectFromAntbot.get("busInterfaceDefID");
			ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(busInterfaceDefID);
			if (protocolSignal == null) return null;

			String jsonStr = "";
			if (ProtocolSignal.GenericBusFrame.compareToIgnoreCase(protocolSignal.getDataType()) == 0)
			{
				jsonStr = this.resolveFrameByGenericBusFrame(jsonObjectFromAntbot, "overview", -1);
			}
			
			bigdataStorage.setBigdata(jsonStr);	
			bigdataStorage.setDataType(bigdataStorage.getDataType() + "/" + protocolSignal.getDataType());
			
			return bigdataStorage;
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveProtocolBigdataStorageWithOverview()", ex);
			return null;
		}
	}

	@Override
	@Transactional
	public BusFrameSnapshot resolveBusFrameRawFrameAndFieldVaues(String id, int index)
	{
		//resolveFrameByGenericBusFrame
		try
		{
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
			if (bigdataStorage == null) return null;
			
			if (BigdataStorage.BusFrameData.compareToIgnoreCase(bigdataStorage.getDataType()) != 0)
			{
				return null;
			}

			JSONParser parser = new JSONParser();
			JSONObject jsonObjectFromAntbot = (JSONObject) parser.parse(bigdataStorage.getBigdata());
			String busInterfaceDefID = (String) jsonObjectFromAntbot.get("busInterfaceDefID");

			ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(busInterfaceDefID);

			if (protocolSignal == null) return null;

			if (ProtocolSignal.GenericBusFrame.compareToIgnoreCase(protocolSignal.getDataType()) == 0)
			{
				return this.resolveFrameByGenericBusFrame(jsonObjectFromAntbot, index);
			}
			
			return null;
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveProtocolBigdataStorage()", ex);
			return null;
		}		
	}
	
	@Override
	@Transactional
	public String resolveProtocolBigdataStorage(String id, String captureType, int index)
	{
		try
		{
			if ("rawFrameOnly".compareToIgnoreCase(captureType.toLowerCase()) != 0
					&& "fieldValuesOnly".compareToIgnoreCase(captureType.toLowerCase()) != 0
					&& "fullFrame".compareToIgnoreCase(captureType.toLowerCase()) != 0)			
				return "";
					
			BigdataStorage bigdataStorage = this.BigdataStorageDAO.getBigdataStorage(id);
			if (bigdataStorage == null) return null;
			
			if (BigdataStorage.BusFrameData.compareToIgnoreCase(bigdataStorage.getDataType()) != 0)
			{
				return "";
			}

			JSONParser parser = new JSONParser();
			JSONObject jsonObjectFromAntbot = (JSONObject) parser.parse(bigdataStorage.getBigdata());
			String busInterfaceDefID = (String) jsonObjectFromAntbot.get("busInterfaceDefID");

			ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(busInterfaceDefID);
			if (protocolSignal == null) return "";

			if (ProtocolSignal.GenericBusFrame.compareToIgnoreCase(protocolSignal.getDataType()) == 0)
			{
				return this.resolveFrameByGenericBusFrame(jsonObjectFromAntbot, captureType, index);
			}
			
			return "";
		}
		catch (Exception ex)
		{
			logger.error("BigdataStorageServiceImpl::resolveProtocolBigdataStorage()", ex);
			return null;
		}
	}
	
	private String resolveFrameByMIL1553B(BigdataStorage busBigdataStorage, JSONObject jsonObjectFromAntbot) throws IOException
	{
		M1553bModel m1553bModel = this.resolveMIL1553B(busBigdataStorage );
		M1553ExecutionResult result = new M1553ExecutionResult();
		
		JSONArray frameDataList = (JSONArray) jsonObjectFromAntbot.get("frameDataList");
		for (Object frameDataNode : frameDataList) {
			JSONObject frameDataJSON = (JSONObject) frameDataNode;

			M1553FrameData frameData = new M1553FrameData();
			String frameRawData = (String) frameDataJSON.get("frame");

			String based64FrameData = frameRawData;
			logger.info("M1553b ModelResolver::resolveFrameData()::based64 frame data is :" + based64FrameData);
			
			byte[] decodedbytes = Base64.getDecoder().decode(based64FrameData);
			String decodedHexFrameData = IcdUtility.toHexString(decodedbytes);

			frameData = M1533bModelResolver.resolveFrameData(m1553bModel, decodedHexFrameData);
			if (frameData == null) continue;

			frameData.setRawFrame(decodedHexFrameData);

			result.getFrameDataList().add(frameData);
		}
		
		  ObjectMapper Obj = new ObjectMapper();  
          String jsonStr = Obj.writeValueAsString(result); 
          
          return jsonStr;
	}


	private M1553bModel resolveMIL1553B(BigdataStorage bigdataStorage) throws IOException
	{
		String id =  UUID.randomUUID().toString();
		String tempPath = resolveBigdataStorageFolderPath()  + File.separator  +  id;
		
		FileUtility.writeFileByString(tempPath, bigdataStorage.getBigdata());
		
		M1553bModel model = M1533bModelResolver.resolve(tempPath);
		
		Files.delete(Paths.get(tempPath));
		return model;
	}

	private String resolveFrameByM1553bAndARINC429(BigdataStorage busBigdataStorage, JSONObject jsonObjectFromAntbot) throws IOException
	{
		IcdModel icdModel = this.resolveARINC429Model(busBigdataStorage );
		M1553bA429ExecutionResult result = new M1553bA429ExecutionResult();
		
		JSONArray frameDataList = (JSONArray) jsonObjectFromAntbot.get("frameDataList");
		for (Object frameDataNode : frameDataList) {
			JSONObject frameDataJSON = (JSONObject) frameDataNode;

			M1553bAndA429FrameData frameData = new M1553bAndA429FrameData();
			String frameRawData = (String) frameDataJSON.get("frame");

			String based64FrameData = frameRawData;
			logger.info("M1553bAndARINC429 ModelResolver::resolveFrameData()::based64 frame data is :" + based64FrameData);
			
			byte[] decodedbytes = Base64.getDecoder().decode(based64FrameData);
			String decodedHexFrameData = IcdUtility.toHexString(decodedbytes);

			frameData = M1553bAndARINC429ModelResolver.resolveFrameData(icdModel, decodedHexFrameData);
			if (frameData == null) continue;

			frameData.setRawFrame(decodedHexFrameData);
			
			frameData.setTimestamp((String) frameDataJSON.get("timestamp"));
			frameData.setReceiveFrame((boolean) frameDataJSON.get("isReceiveFrame"));
			
			result.getFrameDataList().add(frameData);
		}
		
		  ObjectMapper Obj = new ObjectMapper();  
          String jsonStr = Obj.writeValueAsString(result); 
          
          return jsonStr;
	}
	
	
	private String resolveFrameByARINC429(BigdataStorage busBigdataStorage, JSONObject jsonObjectFromAntbot) throws IOException
	{
		IcdModel icdModel = this.resolveARINC429Model(busBigdataStorage );
		IdcExecutionResult result = new IdcExecutionResult();
		
		JSONArray frameDataList = (JSONArray) jsonObjectFromAntbot.get("frameDataList");
		for (Object frameDataNode : frameDataList) {
			JSONObject frameDataJSON = (JSONObject) frameDataNode;

			ARINC429FrameData frameData = new ARINC429FrameData();
			String frameRawData = (String) frameDataJSON.get("frame");

			String based64FrameData = frameRawData;
			logger.info("ARINC42 ModelResolver::resolveFrameData()::based64 frame data is :" + based64FrameData);
			
			byte[] decodedbytes = Base64.getDecoder().decode(based64FrameData);
			String decodedHexFrameData = IcdUtility.toHexString(decodedbytes);

			frameData = ARINC429ModelResolver.resolveFrameData(icdModel, decodedHexFrameData);
			if (frameData == null) continue;

			frameData.setRawFrame(decodedHexFrameData);
			
			frameData.setTimestamp((String) frameDataJSON.get("timestamp"));
			frameData.setReceiveFrame((boolean) frameDataJSON.get("isReceiveFrame"));
			
			result.getFrameDataList().add(frameData);
		}
		
		  ObjectMapper Obj = new ObjectMapper();  
          String jsonStr = Obj.writeValueAsString(result); 
          
          return jsonStr;
	}
	
	private String resolveFrameByCanJ1939(BigdataStorage busBigdataStorage, JSONObject jsonObjectFromAntbot) throws IOException
	{
		CanExecutionResult result = new CanExecutionResult();
		
		Candb candb = resolveModelOfCanJ1939(busBigdataStorage);
		
		JSONArray frameDataList = (JSONArray) jsonObjectFromAntbot.get("frameDataList");
		for (Object frameDataNode : frameDataList) {
			JSONObject frameDataJSON = (JSONObject) frameDataNode;

			CanFrameData canFrameData = new CanFrameData();
			String frameRawData = (String) frameDataJSON.get("frame");

			String based64FrameData = frameRawData;
			logger.info("BdcModelResolver::resolveFrameData()::based64 frame data is :" + based64FrameData);
			
			byte[] decodedbytes = Base64.getDecoder().decode(based64FrameData);
			String decodedHexFrameData = IcdUtility.toHexString(decodedbytes);

			canFrameData.setRawFrame(decodedHexFrameData);
			
			MessageInfo messageInfo = CanJ1939ModelResolver.resolveFrameData(candb, decodedHexFrameData);
			canFrameData.setFrameData(messageInfo);
			
			canFrameData.setTimestamp((String) frameDataJSON.get("timestamp"));
			canFrameData.setReceiveFrame((boolean) frameDataJSON.get("isReceiveFrame"));
			
			result.getCanFrameDataList().add(canFrameData);
		}
		
		  ObjectMapper Obj = new ObjectMapper();  
          String jsonStr = Obj.writeValueAsString(result); 
          
          return jsonStr;
	}
	
	private Candb resolveModelOfCanJ1939(BigdataStorage bigdataStorage) throws IOException
	{
		String id =  UUID.randomUUID().toString();
		String tempPath = resolveBigdataStorageFolderPath()  + File.separator  +  id;
		
		FileUtility.writeFileByString(tempPath, bigdataStorage.getBigdata());
		
		Candb candb = CanJ1939ModelResolver.resolve(tempPath);
		
		Files.delete(Paths.get(tempPath));
		return candb;			
	}
	

	private BusFrameSnapshot resolveFrameByGenericBusFrame(JSONObject jsonObjectFromAntbot, int index) throws IOException
	{
		JSONArray frameDataList = (JSONArray) jsonObjectFromAntbot.get("genericBusFrameDatas");

		BusFrameSnapshot snapshot = new BusFrameSnapshot();
		
		for (int i=0; i< frameDataList.size(); i++) {
			
			Object frameDataNode = frameDataList.get(i);
			JSONObject frameDataJSON = (JSONObject) frameDataNode;

			if (i == index)
			{
				snapshot.setFieldVaues((String) frameDataJSON.get("fieldValues"));
				snapshot.setRawFrame((String) frameDataJSON.get("rawFrame"));
				return snapshot;
			}
		}
		return snapshot;
	}

	private String resolveFrameByGenericBusFrame(JSONObject jsonObjectFromAntbot, String captureType, int index) throws IOException
	{
		JSONArray frameDataList = (JSONArray) jsonObjectFromAntbot.get("genericBusFrameDatas");
		boolean foundFrameData = false;
		
		for (int i=0; i< frameDataList.size(); i++) {
			
			Object frameDataNode = frameDataList.get(i);
			JSONObject frameDataJSON = (JSONObject) frameDataNode;

			if (i == index)
			{
				foundFrameData = true;
			}
			
			if ("rawFrameOnly".compareToIgnoreCase(captureType.toLowerCase()) == 0 && foundFrameData)
			{
				return (String) frameDataJSON.get("rawFrame");
			}
			else if ("fieldValuesOnly".compareToIgnoreCase(captureType.toLowerCase()) == 0 && foundFrameData)
			{
				return (String) frameDataJSON.get("fieldValues");
			}
			else if ("fullFrame".compareToIgnoreCase(captureType.toLowerCase()) == 0 && foundFrameData)
			{
				return frameDataJSON.toJSONString();
			}
			
			//如果存在rawFrame值
			if (frameDataJSON.containsKey("rawFrame"))
			{
				frameDataJSON.put("rawFrame", frameDataJSON.get("rawFrame"));
			}else {
				frameDataJSON.put("rawFrame", "");
			}
			frameDataJSON.put("fieldValues", "");
		}
		
		if ("overview".compareToIgnoreCase(captureType.toLowerCase()) == 0) 
		{
			return jsonObjectFromAntbot.toJSONString();
		}
		
		return "";
	}
	
	private MessageTable resolveModelOfGenericBusFrame(BigdataStorage bigdataStorage) throws IOException
	{
		String id =  UUID.randomUUID().toString();
		String tempPath = resolveBigdataStorageFolderPath()  + File.separator  +  id;
		
		FileUtility.writeFileByString(tempPath, bigdataStorage.getBigdata());
		
		MessageTable messageTable = GenericBusFrameModelResolver.resolve(tempPath);
		
		Files.delete(Paths.get(tempPath));
		return messageTable;			
	}

	@Override
	@Transactional
	public String resolveBigdataStorageFolderPath()
	{			
		String uploadedFolder = SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/;
		if (!new File(uploadedFolder).exists()) {
			new File(uploadedFolder).mkdir();
		}

		String icdRepositoryFolder = uploadedFolder + "/BigdataStorage";
		if (!new File(icdRepositoryFolder).exists()) {
			new File(icdRepositoryFolder).mkdir();
		}
		
		return icdRepositoryFolder;
	}

	private IcdModel resolveARINC429Model(BigdataStorage bigdataStorage) throws IOException
	{
		String id =  UUID.randomUUID().toString();
		String tempPath = resolveBigdataStorageFolderPath()  + File.separator  +  id;
		
		FileUtility.writeFileByString(tempPath, bigdataStorage.getBigdata());
		
		IcdModel model = ARINC429ModelResolver.resolve(tempPath);
		
		Files.delete(Paths.get(tempPath));
		return model;
	}
}





