package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.BigData;

public interface BigDataDAO {
	public void addBigData(BigData bigdata);
	public void updateBigData(BigData bigdata);
	public List<BigData> getBigDataByRootId(String rootId);
	public BigData getBigDataById(long id);
	public BigData getBigData(String rootId, String referenceId);
	public void removeBigData(long id);
	public void removeBigDataByRootId(String rootId);
}
