package com.macrosoft.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.BusFrameSnapshot;
import com.macrosoft.controller.dto.ProjectInfo;
import com.macrosoft.controller.dto.QueryQualityReportParameter;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.controller.response.ApiResponseWithError;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.FieldValueResult;
import com.macrosoft.model.SearchBusFrameParameter;
import com.macrosoft.model.SearchBusFrameStasticParameter;
import com.macrosoft.model.bdc.CanExecutionResult;
import com.macrosoft.model.bdc.Candb;
import com.macrosoft.model.genericbusFrame.InputFrameInfo;
import com.macrosoft.model.idc.ARINC429Frame;
import com.macrosoft.model.idc.ARINC429FrameFieldData;
import com.macrosoft.model.idc.IcdInputFrameInfo;
import com.macrosoft.model.m1553ba429.M1553bA429ExecutionResult;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameComposeInfo;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameData;
import com.macrosoft.service.BigdataStorageService;
import com.macrosoft.service.FieldLocatorInvalidException;
import com.macrosoft.service.bigdataresovler.ARINC429ModelResolver;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.StringUtility;

@Controller
public class BigdataStorageController {
	private static final ILogger logger = LoggerFactory.Create(BigdataStorageController.class.getName());
	private BigdataStorageService bigdataStorageService;

	
	@Autowired(required = true)
	public void setBigdataStorageService(BigdataStorageService bigdataStorageService) {
		this.bigdataStorageService = bigdataStorageService;
	}
	

	@RequestMapping(value = "/api/bigdataStorage/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<BigdataStorageInfo> createBigdataStorage(@RequestBody BigdataStorage bigdataStorage) {

		try {
			String orgId = TenantContext.getOrgId();

			bigdataStorage.setOrganizationId(StringUtility.parseLongSafely(orgId).getResult());
			bigdataStorage.setCreatedAt(new Date(new Date().getTime()));
			this.bigdataStorageService.addBigdataStorage(bigdataStorage);

			BigdataStorageInfo BigdataStorageInfo = new BigdataStorageInfo(bigdataStorage);
			
			return new ApiResponse<BigdataStorageInfo>(ApiResponse.Success, BigdataStorageInfo);
		} catch (Exception ex) {
			logger.error("addBigdataStorage", ex);
			return new ApiResponse<BigdataStorageInfo>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/bigdataStorage/getBigdataStorageByBigdataStorageId/{bigdataStorageId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<BigdataStorage> getBigdataStorageByBigdataStorageId(@PathVariable("bigdataStorageId") String bigdataStorageId){
		try {
			BigdataStorage bigdataStorage = this.bigdataStorageService.getBigdataStorage(bigdataStorageId);
			return new ApiResponse<>(ApiResponse.Success, bigdataStorage);
		} catch (Exception ex) {
			logger.error("getBigdataStorageByBigdataStorageId", ex);
			return new ApiResponse<>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/bigdataStorage/getBigdataStorageByExecutionId/{executionId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<BigdataStorage>> getBigdataStorageByExecutionId(@PathVariable("executionId") String executionId){
		try {
			List<BigdataStorage> bigdataStorages = this.bigdataStorageService.getBigdataStorageByExecutionId(executionId);
			return new ApiResponse<List<BigdataStorage>>(ApiResponse.Success, bigdataStorages);
		} catch (Exception ex) {
			logger.error("getBigdataStorageByExecutionId", ex);
			return new ApiResponse<List<BigdataStorage>>(ApiResponse.UnHandleException, null);
		}
	}
	@RequestMapping(value = "/api/bigdataStorage/dbc/{bigdataStorageId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<Candb> resolveDbcModel(@PathVariable("bigdataStorageId") String bigdataStorageId) {
		try {
			Candb candb = this.bigdataStorageService.getDbcModel(bigdataStorageId);
			return new ApiResponse<Candb>(ApiResponse.Success, candb);
		} catch (Exception ex) {
			logger.error("resolveDbcModel", ex);
			return new ApiResponse<Candb>(ApiResponse.UnHandleException, null);
		}
	}



	@RequestMapping(value = "/api/bigdataStorage/get/{bigdataStorageId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<BigdataStorage> getBigdataStorage(@PathVariable("bigdataStorageId") String bigdataStorageId) {
		try {
			BigdataStorage result = this.bigdataStorageService.resolveProtocolBigdataStorage(bigdataStorageId);
			return new ApiResponse<BigdataStorage>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getBigdataStorage", ex);
			return new ApiResponse<BigdataStorage>(ApiResponse.UnHandleException, null);
		}
	}

//bigdata使用到
	@RequestMapping(value = "/api/bigdataStorage/get/overview/{bigdataStorageId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<BigdataStorage> getBigDataStorageWithOverview(@PathVariable("bigdataStorageId") String bigdataStorageId) {
		try {
			BigdataStorage result = this.bigdataStorageService.resolveProtocolBigdataStorageWithOverview(bigdataStorageId);
			return new ApiResponse<BigdataStorage>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getBigDataStorageWithOverview", ex);
			return new ApiResponse<BigdataStorage>(ApiResponse.UnHandleException, null);
		}
	}
	
	@RequestMapping(value = "/api/bigdataStorage/get/{bigdataStorageId}/{captureType}/{index}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<String> getBigDataStorageWithCapture(@PathVariable("bigdataStorageId") String bigdataStorageId,
																				  @PathVariable("captureType") String captureType,
																				  @PathVariable("index") int index) {
		try {
			String result = this.bigdataStorageService.resolveProtocolBigdataStorage(bigdataStorageId, captureType, index);
			return new ApiResponse<String>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getBigDataStorageWithCapture", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, "");
		}
	}

	@RequestMapping(value = "/api/bigdataStorage/get/busFrame/{bigdataStorageId}/{index}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<String> getBusFrameDataByIndex(@PathVariable("bigdataStorageId") String bigdataStorageId,
																				  @PathVariable("index") int index) {
		try {
			String result = this.bigdataStorageService.resolveProtocolBigdataStorage(bigdataStorageId, "fullFrame", index);
			return new ApiResponse<String>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("getBusFrameDataByIndex", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, "");
		}
	}

	@RequestMapping(value = "/api/bigdataStorage/get/RawFrameAndFieldVaues/{bigdataStorageId}/{index}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<BusFrameSnapshot> resolveBusFrameRawFrameAndFieldVaues(@PathVariable("bigdataStorageId") String bigdataStorageId,
																				  @PathVariable("index") int index) {
		try {
			BusFrameSnapshot result = this.bigdataStorageService.resolveBusFrameRawFrameAndFieldVaues(bigdataStorageId, index);
			return new ApiResponse<BusFrameSnapshot>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("resolveBusFrameRawFrameAndFieldVaues", ex);
			return new ApiResponse<BusFrameSnapshot>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/bigdataStorage/busFrameStatistics", method = RequestMethod.POST)
	public @ResponseBody ApiResponseWithError<List<FieldValueResult>> searchBusFrameStatistics(@RequestBody SearchBusFrameStasticParameter parameter) {
		try {
			List<FieldValueResult> result = this.bigdataStorageService.searchBusFrameStatistics(parameter);
			return new ApiResponseWithError<List<FieldValueResult>>(ApiResponse.Success, result, "");
		} 
		catch (FieldLocatorInvalidException ex) {
			logger.error("searchBusFrameStatistics has FieldLocatorInvalidException:", ex);
			return new ApiResponseWithError<List<FieldValueResult>>(ApiResponse.UnHandleException, null, "FieldLocatorInvalidException");
		}
		catch (Exception ex) {
			logger.error("searchBusFrameStatistics", ex);
			return new ApiResponseWithError<List<FieldValueResult>>(ApiResponse.UnHandleException, null, "UnHandleException");
		}
	}

	@RequestMapping(value = "/api/bigdataStorage/searchBusFrameStatisticsOverview", method = RequestMethod.POST)
	public @ResponseBody ApiResponseWithError<List<BigdataStorage>> searchBusFrameStatisticsOverview(@RequestBody SearchBusFrameParameter parameter) {
		try {
			List<BigdataStorage> result = this.bigdataStorageService.searchBusFrameStatisticsOverview(parameter);
			return new ApiResponseWithError<List<BigdataStorage>>(ApiResponse.Success, result, "");
		}
		catch (Exception ex) {
			logger.error("searchBusFrameStatisticsOverview", ex);
			return new ApiResponseWithError<List<BigdataStorage>>(ApiResponse.UnHandleException, null, "UnHandleException");
		}
	}
	
	@RequestMapping(value = "/api/protocol/a429/composeFrame", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> composeA429Frame(@RequestBody IcdInputFrameInfo icdInputFrameInfo)
	 {
		try {
			String result = bigdataStorageService.composeFrameForA429(icdInputFrameInfo);
			return new ApiResponse<String>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("composeA429Frame", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}
	

	@RequestMapping(value = "/api/protocol/genericBusFrame/composeFrame", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> composeGenericBusFrame(@RequestBody InputFrameInfo inputFrameInfo)
	{
		try {
			String result = bigdataStorageService.composeFrameForGenericBusFrame(inputFrameInfo);
			return new ApiResponse<String>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("composeGenericBusFrame", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/protocol/m1553bCustom/composeFrame", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> composeM1553bAndA429Frame(@RequestBody M1553bAndA429FrameComposeInfo composeInfo)
	 {
		try {
			String result = bigdataStorageService.composeFrameForM1553bAndA429(composeInfo);
			return new ApiResponse<String>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("composeM1553bAndA429Frame", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/test", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<M1553bA429ExecutionResult> test()
	 {
		try {
			M1553bA429ExecutionResult result = new M1553bA429ExecutionResult();
			M1553bAndA429FrameData frameData = new M1553bAndA429FrameData();
			frameData.setComWord("2-R-1-4");
			frameData.setPath("BC to RT");
			frameData.setRawFrame("1024084000C4");
			frameData.setReceiveFrame(true);
			frameData.setStatus("1023");
			frameData.setTimestamp("22:47:53:827");
			
			ARINC429Frame a429Frame = new ARINC429Frame();
			a429Frame.setDecodedBits("00001100100000000000000011101000");
			a429Frame.setEncodedString("0C8000E8");
			a429Frame.setLabelIndex("027");
			a429Frame.setLabelName("TACAN Selected Course");
			a429Frame.setSsmValue("");
			
			ARINC429FrameFieldData fieldData = new ARINC429FrameFieldData();
			fieldData.setBcdValue("123");
			fieldData.setFieldName("Degree");
			fieldData.setUnits("Deg");
			a429Frame.getFields().add(fieldData);
			
			
			frameData.getFrameDatas().add(a429Frame);
			
			
			result.getFrameDataList().add(frameData);
			
			return new ApiResponse<M1553bA429ExecutionResult>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("composeA429Frame", ex);
			return new ApiResponse<M1553bA429ExecutionResult>(ApiResponse.UnHandleException, null);
		}
	}
	
	
}
