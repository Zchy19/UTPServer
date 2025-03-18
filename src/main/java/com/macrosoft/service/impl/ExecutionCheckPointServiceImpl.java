package com.macrosoft.service.impl;

import com.macrosoft.dao.ExecutionCheckPointDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionCheckPoint;
import com.macrosoft.service.ExecutionCheckPointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;


@Service
public class ExecutionCheckPointServiceImpl implements ExecutionCheckPointService {
	private static final ILogger logger = LoggerFactory.Create(ExecutionCheckPointServiceImpl.class.getName());


	private ExecutionCheckPointDAO executionCheckPointDao;
	@Autowired
	public void setExecutionCheckPointDao(ExecutionCheckPointDAO executionCheckPointDao) {
		this.executionCheckPointDao = executionCheckPointDao;
	}

	@Override
	@Transactional
	public void addExecutionCheckPoint(ExecutionCheckPoint p) {
		this.executionCheckPointDao.addExecutionCheckPoint(p);
	}

	@Override
	@Transactional
	public void updateExecutionCheckPoint(ExecutionCheckPoint p) {
		this.executionCheckPointDao.updateExecutionCheckPoint(p);
	}

	@Override
	@Transactional
	public ExecutionCheckPoint getExecutionCheckPointByExecutionIdAndCheckPointName(String executionId, String checkPointName) {
		return this.executionCheckPointDao.getExecutionCheckPointByExecutionIdAndCheckPointName(executionId, checkPointName);
	}

	@Override
	@Transactional
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTime(long projectId, Date startTime, Date endTime) {
		return this.executionCheckPointDao.getExecutionCheckPointByProjectIdAndTime(projectId,startTime,endTime);
	}

	@Override
	@Transactional
	public List<ExecutionCheckPoint> getExecutionCheckPointByExecutionId(String executionId) {
		return this.executionCheckPointDao.getExecutionCheckPointByExecutionId(executionId);
	}

	@Override
	@Transactional
	public List<ExecutionCheckPoint> getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		return this.executionCheckPointDao.getFailExecutionCheckPointByProjectIdAndTestsetIdAndTime(projectId,testsetId,startTime,endTime);
	}

	@Override
	@Transactional
	public List<ExecutionCheckPoint> getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		return this.executionCheckPointDao.getSuccessExecutionCheckPointByProjectIdAndTestsetIdAndTime(projectId,testsetId,startTime,endTime);
	}

	@Override
	@Transactional
	public List<ExecutionCheckPoint> getExecutionCheckPointByProjectIdAndTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		return this.executionCheckPointDao.getExecutionCheckPointByProjectIdAndTestsetIdAndTime(projectId,testsetId,startTime,endTime);
	}

	@Override
	@Transactional
	public boolean updateManualDecisionLevel(Integer id, Integer level) {
		return this.executionCheckPointDao.updateManualDecisionLevel(id, level);
	}
}

