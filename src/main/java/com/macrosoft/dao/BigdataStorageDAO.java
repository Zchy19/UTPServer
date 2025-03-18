package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.SearchBusFrameParameter;

public interface BigdataStorageDAO {
	public void addBigdataStorage(BigdataStorage jsonStorage);
	public void updateBigdataStorage(BigdataStorage BigdataStorage);
	public void removeBigdataStorage(String id);
	public BigdataStorage getBigdataStorage(String id);
	public List<BigdataStorageInfo> listBigdataStorageInfosByOrg(String dataType, long organizationId);
	public List<BigdataStorageInfo> listBigdataStorageInfos(String dataType, String projectId);
	public List<BigdataStorage> searchBusFrameStatistics(SearchBusFrameParameter parameter);
	//获取所有的BigdataStorage数据
	public List<BigdataStorage> getAllBigdataStorage();
	//根据executionId获取BigdataStorage数据
	public List<BigdataStorage> getBigdataStorageByExecutionId(String executionId);
}
