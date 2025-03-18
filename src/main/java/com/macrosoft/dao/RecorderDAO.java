package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.Recorder;

public interface RecorderDAO {
	public void addRecorder(Recorder recorder);

	public void updateRecorder(Recorder recorder);

	public List<Recorder> listRecorders(String orgId, String rootType);

	public Recorder getRecorderById(String id);

	public void removeRecorder(String id);
}
