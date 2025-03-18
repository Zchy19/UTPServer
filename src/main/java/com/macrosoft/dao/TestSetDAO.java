package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.TestSet;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.model.composition.TestsetData;

public interface TestSetDAO {
	public void addTestSet(long projectId, TestSet testset);
	public void updateTestSet(long projectId, TestSet testset);
	public TestSet getTestSetById(long projectId, long id);
	public void removeTestSet(long projectId, long id);
	public List<TestSet> listTestSetsByProjectId(long projectId);
	//根据testset名称查询testset
	public List<TestSet> listTestSetsByTestSetName(long projectId, String testsetName);
	public List<TestSet> findTestsetsByScriptId(long projectId, long scriptId);
	public List<ScriptInfo> getScriptInfoByTestsetId(long projectId, long testsetId);
	public TestsetData getTestsetDatasById(long projectId, long id);
	public List<TestSet> listTestSetsByProjectIdAndActivate(long projectId);
}
