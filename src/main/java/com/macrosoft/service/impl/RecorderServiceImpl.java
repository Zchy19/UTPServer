package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.RecorderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.BigDataDAO;
import com.macrosoft.dao.RecorderDAO;
import com.macrosoft.model.BigData;
import com.macrosoft.model.Recorder;

@Service
public class RecorderServiceImpl implements RecorderService {
	
	private RecorderDAO RecorderDAO;
	private BigDataDAO BigDataDAO;
	@Autowired
	public void setRecorderDAO(RecorderDAO RecorderDAO) {
		this.RecorderDAO = RecorderDAO;
	}
	@Autowired
	public void setBigDataDAO(BigDataDAO BigDataDAO) {
		this.BigDataDAO = BigDataDAO;
	}
	

	@Override
	@Transactional
	public void addRecorder(Recorder recorder) {
		this.RecorderDAO.addRecorder(recorder);
	}

	@Override
	@Transactional
	public void addBigData(BigData bigData) {
		this.BigDataDAO.addBigData(bigData);
	}

	
	@Override
	@Transactional
	public Recorder getRecorder(String id) {

		Recorder recorder = this.RecorderDAO.getRecorderById(id);
		return recorder;
	}

	@Override
	@Transactional
	public List<Recorder> getRecorders(String orgId, String rootType) {
		List<Recorder> recorders = this.RecorderDAO.listRecorders(orgId, rootType);
		return recorders;
	}

	@Override
	@Transactional
	public void deleteRecorder(String id) {
		this.RecorderDAO.removeRecorder(id);		
		this.BigDataDAO.removeBigDataByRootId(id);
	}

	@Override
	@Transactional
	public void deleteBigDataByRootId(String rootId) {

		this.BigDataDAO.removeBigDataByRootId(rootId);
	}
	
	@Override
	@Transactional
	public void updateRecorder(Recorder recorder) {
		this.RecorderDAO.updateRecorder(recorder);
	}

	@Override
	@Transactional
	public BigData getBigData(String rootId, String bigDataId) {
		return this.BigDataDAO.getBigData(rootId, bigDataId);
	}

	@Transactional
	public void deleteBigDataByBigDataId(long bigDataId) {
		BigDataDAO.removeBigData(bigDataId);
	}

	@Override
	@Transactional
	public void updateBigData(BigData bigData) {
		BigDataDAO.updateBigData(bigData);
		
	}

	@Override
	@Transactional
	public List<BigData> getBigDataByRootId(String rootId) {
		return BigDataDAO.getBigDataByRootId(rootId);
	}
}
