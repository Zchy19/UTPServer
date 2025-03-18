package com.macrosoft.service;

import java.util.List;

import com.macrosoft.controller.dto.TestsetInfo;
import com.macrosoft.model.Script;
import com.macrosoft.model.TestSet;
import com.macrosoft.model.TestsetPackage;
import com.macrosoft.model.composition.TestsetData;

public interface TestSetService {
	public void addTestSet(long projectId, TestSet p);
	public void updateTestSet(long projectId, TestSet p);
	public TestSet getTestSetById(long projectId, long testsetId);
	public void removeTestSetById(long projectId, long id);
	public List<TestSet> listTestSetsByProjectId(long projectId);
	//根据testset名称查询testset
	public List<TestSet> listTestSetsByTestSetName(long projectId, String testsetName);
	public TestsetData getTestsetDataByTestsetId(long projectId, long testsetId);
	public TestSet createTestsetByScriptIds(TestsetInfo testsetInfo);
	public TestSet updateTestsetByScriptIds(TestsetInfo testsetInfo);
	public void addScriptLinksByScriptIds(long projectId, long testsetId, String[] scriptIdList);
	public void importTestSetPackage(TestsetPackage testsetPackage, long projectId, long testsetId);
	public List<TestSet> listTestSetsByProjectIdAndActivate(long projectId);
}
