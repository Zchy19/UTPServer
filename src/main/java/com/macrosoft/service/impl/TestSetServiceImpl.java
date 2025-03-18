package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.dao.*;
import com.macrosoft.model.*;
import com.macrosoft.service.TestSetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.controller.dto.TestsetInfo;
import com.macrosoft.controller.dto.TestsetInfoConverter;
import com.macrosoft.model.composition.TestsetData;

@Service
public class TestSetServiceImpl implements TestSetService {
	
	private TestSetDAO TestSetDAO;
	private ScriptLinkDAO ScriptLinkDAO;
	private ScriptDAO ScriptDAO;
	private ProjectDAO projectDAO;
	private BigdataStorageDAO bigdataStorageDAO;
	private ProtocolSignalDAO protocolSignalDAO;
	private ExecutionResultDAO executionResultDAO;
	private ExecutionStatusDAO executionStatusDAO;
	private ExecutionTestCaseResultDAO executionTestCaseResultDAO;
	@Autowired
	public void setScriptLinkDAO(ScriptLinkDAO scriptLinkDAO) {
		this.ScriptLinkDAO = scriptLinkDAO;
	}
	@Autowired
	public void setProjectDAO(ProjectDAO projectDAO) {
		this.projectDAO = projectDAO;
	}
	@Autowired
	public void setTestSetDAO(TestSetDAO TestSetDAO) {
		this.TestSetDAO = TestSetDAO;
	}
	@Autowired
	public void setScriptDAO(ScriptDAO ScriptDAO) {
		this.ScriptDAO = ScriptDAO;
	}
	@Autowired
	public void setBigdataStorageDAO(BigdataStorageDAO bigdataStorageDAO) {
		this.bigdataStorageDAO= bigdataStorageDAO;
	}
	@Autowired
	public void setProtocolSignalDAO(ProtocolSignalDAO protocolSignalDAO) {
		this.protocolSignalDAO = protocolSignalDAO;
	}
	@Autowired
	public void setExecutionResultDAO(ExecutionResultDAO executionResultDAO) {
		this.executionResultDAO = executionResultDAO;
	}
	@Autowired
	public void setExecutionStatusDAO(ExecutionStatusDAO executionStatusDAO) {
		this.executionStatusDAO = executionStatusDAO;
	}
	@Autowired
	public void setExecutionTestCaseResultDAO(ExecutionTestCaseResultDAO executionTestCaseResultDAO) {
		this.executionTestCaseResultDAO = executionTestCaseResultDAO;
	}


	@Override
	@Transactional
	public void addTestSet(long projectId, TestSet testset) {
		
		// get next testset id from project entity.
		Project project = projectDAO.getProjectById(projectId);
		long newTestsetId = project.getNextEntityLogicId();
		
		project.setNextEntityLogicId(newTestsetId + 1);
		projectDAO.updateProject(project);
		
		testset.setId(newTestsetId);
		

		this.TestSetDAO.addTestSet(projectId,testset);
	}

	@Override
	@Transactional
	public void updateTestSet(long projectId, TestSet p) {
		this.TestSetDAO.updateTestSet(projectId,p);
	}


	@Override
	@Transactional
	public TestsetData getTestsetDataByTestsetId(long projectId, long testsetId) {
		return this.TestSetDAO.getTestsetDatasById(projectId,testsetId);
	}
	
	
	@Override
	@Transactional
	public List<TestSet> listTestSetsByProjectId(long projectId) {
		return this.TestSetDAO.listTestSetsByProjectId(projectId);
	}

	/*
	* 根据Testset名称查TestSets*/
	@Override
	@Transactional
	public List<TestSet> listTestSetsByTestSetName(long projectId, String testsetName) {
		return this.TestSetDAO.listTestSetsByTestSetName(projectId,testsetName);
	}

	@Override
	@Transactional
	public TestSet getTestSetById(long projectId, long id) {
		return this.TestSetDAO.getTestSetById(projectId, id);
	}

	@Override
	@Transactional
	public void removeTestSetById(long projectId, long id) {

		this.ScriptLinkDAO.removeScriptLinkByTestsetId(projectId, id);
		this.TestSetDAO.removeTestSet(projectId, id);
	}


	@Override
	@Transactional
	public TestSet createTestsetByScriptIds(TestsetInfo testsetInfo) {
		TestSet testset = TestsetInfoConverter.ConvertToTestSet(testsetInfo);
	
		this.addTestSet(testset.getProjectId(), testset);

		return testset;	
	}

	@Override
	@Transactional
	public TestSet updateTestsetByScriptIds(TestsetInfo testsetInfo) {
		TestSet testset = TestsetInfoConverter.ConvertToTestSet(testsetInfo);
		this.TestSetDAO.updateTestSet(testsetInfo.getProjectId(), testset);
		
		String scriptIds = testsetInfo.getScriptIdsWithCommaSeperator();
		String[] scriptIdList = scriptIds.split(",");
		
		this.addScriptLinksByScriptIds(testsetInfo.getProjectId(), testsetInfo.getId(), scriptIdList);
		
		return testset;
	}

	@Override
	@Transactional
	public void addScriptLinksByScriptIds(long projectId, long testsetId, String[] scriptIdList) {

		for (int i = 0; i < scriptIdList.length; i++)
		{
			Script script = this.ScriptDAO.getScriptById(projectId, Long.parseLong(scriptIdList[i]));
			if (script == null) continue;
			
			// get next scriptLink id from project entity.
			Project project = projectDAO.getProjectById(projectId);
			long newScriptLinkId = project.getNextEntityLogicId();
			
			project.setNextEntityLogicId(newScriptLinkId + 1);
			projectDAO.updateProject(project);
			
			ScriptLink scriptLink = new ScriptLink();
			scriptLink.setScriptId(script.getId());
			scriptLink.setName(script.getName());
			scriptLink.setProjectId(script.getProjectId());
			scriptLink.setDescription(script.getDescription());
			scriptLink.setTestSetId(testsetId);
			
			scriptLink.setId(newScriptLinkId);
			this.ScriptLinkDAO.addScriptLink(projectId, scriptLink);
		}
	}

	// 从TestsetPackage导入测试结果
	@Override
	@Transactional
	public void importTestSetPackage(TestsetPackage testsetPackage,long projectId,long testsetId) {
		//导入bigdataStoreage表内容
		if (testsetPackage.protocolSignals != null){
			for (ProtocolSignal protocolSignal : testsetPackage.protocolSignals)
			{
				this.protocolSignalDAO.addProtocolSignal(protocolSignal);
			}
		}
		//导入executionresult表内容
		for (ExecutionResult executionResult : testsetPackage.executionResults)
		{
			this.executionResultDAO.addExecutionResult(executionResult);
		}
		//导入executionStatus表内容
		for (ExecutionStatus executionStatus : testsetPackage.executionStatuses)
		{
			executionStatus.setProjectId(projectId);
			executionStatus.setTestsetId(Math.toIntExact(testsetId));
			this.executionStatusDAO.addExecutionStatus(executionStatus);
		}
		//导入executionTestCaseResult表内容
		for (ExecutionTestCaseResult executionTestCaseResult : testsetPackage.executionTestCaseResults)
		{
			this.executionTestCaseResultDAO.addExecutionTestCaseResult(executionTestCaseResult);
		}


	}

	@Override
	@Transactional
	public List<TestSet> listTestSetsByProjectIdAndActivate(long projectId) {
		return this.TestSetDAO.listTestSetsByProjectIdAndActivate(projectId);
	}


}
