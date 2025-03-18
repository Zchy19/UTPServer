package com.macrosoft.dao;

import com.macrosoft.model.SpecialTest;

import java.util.List;

public interface SpecialTestDAO {
	public void removeSpecialTest(long projectId, long id);
	public void addSpecialTest(long projectId, SpecialTest specialTest);
	public void updateSpecialTest(long projectId, SpecialTest specialTest);

	public SpecialTest getSpecialTestById(long projectId, long id);
	public List<SpecialTest> listSpecialTestsByProjectId(long projectId);
}
