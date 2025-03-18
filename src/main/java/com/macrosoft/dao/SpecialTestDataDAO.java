package com.macrosoft.dao;

import com.macrosoft.model.SpecialTest;
import com.macrosoft.model.SpecialTestData;

import java.util.List;

public interface SpecialTestDataDAO {
	public void removeSpecialTestData(long id);
	public void updateSpecialTestData(SpecialTestData specialTestData);
	public void addSpecialTestData(SpecialTestData specialTestData);
	public List<SpecialTestData> listSpecialTestDatasBySpecialTestId(long specialTestId);
	public void removeSpecialTestDataBySpecialTestId(long specialTestId);
	public List<SpecialTestData> listDaySpecialTestDatesBySpecialTestId(long specialTestId);
}
