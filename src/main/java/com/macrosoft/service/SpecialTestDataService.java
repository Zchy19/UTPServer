package com.macrosoft.service;

import com.macrosoft.model.SpecialTest;
import com.macrosoft.model.SpecialTestData;

import java.util.List;

public interface SpecialTestDataService {
	public List<SpecialTestData>listSpecialTestDatasBySpecialTestId(long specialTestId);
	public void addSpecialTestData(SpecialTestData specialTestData);
	public void updateSpecialTestData(SpecialTestData specialTestData);
	public void removeSpecialTestData(long id);
	public void removeSpecialTestDataBySpecialTestId(long specialTestId);
	public List<SpecialTestData>listDaySpecialTestDatesBySpecialTestId(long specialTestId);
}
