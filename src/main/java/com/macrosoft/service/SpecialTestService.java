package com.macrosoft.service;

import com.macrosoft.model.SpecialTest;

import java.util.List;

public interface SpecialTestService {
	public void addSpecialTest(long projectId, SpecialTest specialTest);
	public void updateSpecialTest(long projectId, SpecialTest specialTest);
	public void removeSpecialTest(long projectId, long id);
	public List<SpecialTest> listSpecialTestsByProjectId(long projectId);
	public SpecialTest getSpecialTestById(long projectId, long id);

}
