package com.macrosoft.service.impl;

import com.macrosoft.dao.ExecutionDataDAO;
import com.macrosoft.dao.impl.ExecutionDataDAOImpl;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionData;
import com.macrosoft.service.ExecutionDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class ExecutionDataServiceImpl implements ExecutionDataService {
	private static final ILogger logger = LoggerFactory.Create(ExecutionDataServiceImpl.class.getName());
	private ExecutionDataDAO executionDataDao;
	@Autowired
	public void setExecutionDataDao(ExecutionDataDAOImpl executionDataDao) {
		this.executionDataDao = executionDataDao;
	}


	@Override
	@Transactional
	public List<ExecutionData> getExecutionDataByExecutionId(String executionId) {
		return	this.executionDataDao.listExecutionDataByExecutionId(executionId);


	}

	@Override
	@Transactional
	public List<ExecutionData> listExecutionData(String executionId, int lastResultId) {
		return this.executionDataDao.listExecutionData(executionId, lastResultId);
	}

	@Override
	@Transactional
	public void addExecutionData(ExecutionData executionData) {
		if (executionData.getUploadStatus()==null){
			executionData.setUploadStatus(0);
		}
		this.executionDataDao.addExecutionData(executionData);
	}
}

