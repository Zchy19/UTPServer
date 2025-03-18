package com.macrosoft.service.impl;

import java.util.Date;
import java.util.List;

import com.macrosoft.service.ExecutionTestCaseResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.ExecutionTestCaseResultDAO;
import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.composition.ExecutionRequirementTraceInfo;

@Service
public class ExecutionTestCaseResultServiceImpl implements ExecutionTestCaseResultService {
	
	private ExecutionTestCaseResultDAO ExecutionTestCaseResultDAO;
	@Autowired
	public void setExecutionTestCaseResultDAO(ExecutionTestCaseResultDAO ExecutionTestCaseResultDAO) {
		this.ExecutionTestCaseResultDAO = ExecutionTestCaseResultDAO;
	}
	
	@Override
	@Transactional
	public void addExecutionTestCaseResult(ExecutionTestCaseResult p) {
		p.setId(0);
		this.ExecutionTestCaseResultDAO.addExecutionTestCaseResult(p);
	}

	@Override
	@Transactional
	public void updateExecutionTestCaseResult(ExecutionTestCaseResult p) {
		this.ExecutionTestCaseResultDAO.updateExecutionTestCaseResult(p);
	}

	@Override
	@Transactional
	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(String executionId) {
		return this.ExecutionTestCaseResultDAO.listExecutionTestCaseResults(executionId);
	}

	@Override
	@Transactional
	public List<ExecutionTestCaseResult> listExecutionTestCaseResults(long projectId, boolean includeDummyRun) {
		return this.ExecutionTestCaseResultDAO.listExecutionTestCaseResults(projectId, includeDummyRun);
	}
	
	@Override
	@Transactional
	public ExecutionTestCaseResult getExecutionTestCaseResultById(long id) {
		return this.ExecutionTestCaseResultDAO.getExecutionTestCaseResultById(id);
	}

	@Override
	@Transactional
	public void updateExecutionTestCaseResult(String executionId, long scriptId, int testResult) {
		this.ExecutionTestCaseResultDAO.updateExecutionTestCaseResult(executionId, scriptId, testResult);
	}

	@Override
	@Transactional
	public void updateExecutionTestCaseResultByStartTime(String executionId, long scriptId, Date startTime, long executionResultId) {
		this.ExecutionTestCaseResultDAO.updateExecutionTestCaseResultByStartTime(executionId, scriptId, startTime,executionResultId);
	}
	@Override
	@Transactional
	public void updateExecutionTestCaseResultByEndTime(String executionId, long scriptId, Date endTime, long executionResultId) {
		this.ExecutionTestCaseResultDAO.updateExecutionTestCaseResultByEndTime(executionId, scriptId, endTime,executionResultId);
	}

	@Override
	@Transactional
	public List<ExecutionTestCaseResult> listFinishedExecutionTestCaseResults(String executionId) {
		return this.ExecutionTestCaseResultDAO.listFinishedExecutionTestCaseResults(executionId);
	}
	
	@Override
	@Transactional
	public List<ExecutionRequirementTraceInfo> listExecutionRequirementTraceInfos(String executionId){
		return this.ExecutionTestCaseResultDAO.listExecutionRequirementTraceInfos(executionId);
	}

	@Override
	@Transactional
	public List<ExecutionTestCaseResult> getAllExecutionTestCaseResults() {
		return this.ExecutionTestCaseResultDAO.getAllExecutionTestCaseResults();
	}

	@Override
	@Transactional
	public void removeExecutionTestCaseResultByExecutionId(String executionId) {
		this.ExecutionTestCaseResultDAO.removeExecutionTestCaseResultByExecutionId(executionId);
	}
}
