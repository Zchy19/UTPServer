package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.BigData;
import com.macrosoft.model.Recorder;

public interface RecorderService {
	public void addRecorder(Recorder recorder);

	public void addBigData(BigData bigData);
	
	public Recorder getRecorder(String id);
	
	public void deleteRecorder(String id);
	
	public void updateRecorder(Recorder recorder);
	public void updateBigData(BigData bigData);
	
	public List<Recorder> getRecorders(String orgId, String rootType);
	
	public void deleteBigDataByRootId(String rootId);
	public void deleteBigDataByBigDataId(long bigDataId);
	public BigData getBigData(String rootId, String referenceId);
	public List<BigData> getBigDataByRootId(String rootId);
}
