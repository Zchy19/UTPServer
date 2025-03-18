package com.macrosoft.service;

import java.util.List;

import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.BusFrameSnapshot;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.FieldValueResult;
import com.macrosoft.model.SearchBusFrameParameter;
import com.macrosoft.model.SearchBusFrameStasticParameter;
import com.macrosoft.model.bdc.Candb;
import com.macrosoft.model.genericbusFrame.InputFrameInfo;
import com.macrosoft.model.idc.IcdInputFrameInfo;
import com.macrosoft.model.m1553ba429.M1553bAndA429FrameComposeInfo;

public interface BigdataStorageService {
	
	public void addBigdataStorage(BigdataStorage BigdataStorage);
	public void updateBigdataStorage(BigdataStorage BigdataStorage);
	public void removeBigdataStorage(String id);
	public BigdataStorage getBigdataStorage(String id);
	public BigdataStorage getProtocol(String id);
	public BigdataStorage resolveProtocolBigdataStorage(String id);
	
	public BigdataStorage resolveProtocolBigdataStorageWithOverview(String id);
	public String resolveProtocolBigdataStorage(String id, String captureType, int index);
	public BusFrameSnapshot resolveBusFrameRawFrameAndFieldVaues(String id, int index);
	
	
	public String resolveBigdataStorageFolderPath();
	public List<BigdataStorageInfo> listBigdataStorageInfosByOrg(String fileType, long organizationId);
	public List<BigdataStorageInfo> listBigdataStorageInfos(String dataType, String projectId);
	
	public List<FieldValueResult> searchBusFrameStatistics(SearchBusFrameStasticParameter parameter) throws FieldLocatorInvalidException;
	public List<BigdataStorage> searchBusFrameStatisticsOverview(SearchBusFrameParameter parameter);
	
	public Candb getDbcModel(String bigdataStorageId);
	
	public String composeFrameForA429(IcdInputFrameInfo icdInputFrameInfo);
	public String composeFrameForM1553bAndA429(M1553bAndA429FrameComposeInfo composeInfo);
	public String composeFrameForGenericBusFrame(InputFrameInfo inputFrameInfo);

	//获取所有的BigdataStorage数据
	public List<BigdataStorage> getAllBigdataStorage();
	//根据executionId获取BigdataStorage数据
	public List<BigdataStorage> getBigdataStorageByExecutionId(String executionId);
}
