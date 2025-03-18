package com.macrosoft.controller.dto;

import com.macrosoft.model.TestSet;

public class TestsetInfoConverter
{
	public static TestSet ConvertToTestSet(TestsetInfo testsetInfo)
	{
		TestSet testset = new TestSet();
		testset.setId(testsetInfo.getId());
		testset.setName(testsetInfo.getName());
		testset.setEngineName(testsetInfo.getEngineName());
		testset.setProjectId(testsetInfo.getProjectId());
		testset.setDescription(testsetInfo.getDescription());
		testset.setActivate(testsetInfo.getActivate());
		
		return testset;
	}
}
