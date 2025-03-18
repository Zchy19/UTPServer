package com.macrosoft.service.impl;

import java.util.List;


import com.macrosoft.service.SubscriptReferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.SubscriptReferenceDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.SubscriptReference;

@Service
public class SubscriptReferenceServiceImpl implements SubscriptReferenceService {
	
	private static final ILogger logger = LoggerFactory.Create(SubscriptReferenceServiceImpl.class.getName());
	private SubscriptReferenceDAO subscriptReferenceDAO;
	@Autowired
	public void setSubscriptReferenceDAO(SubscriptReferenceDAO subscriptReferenceDAO) {
		this.subscriptReferenceDAO = subscriptReferenceDAO;
	}

	@Override
	@Transactional
	public void addSubscriptReference(long projectId, SubscriptReference subscriptReference) {
		
		subscriptReferenceDAO.addSubscriptReference(projectId, subscriptReference);
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public List<SubscriptReference> listSubscriptReferencesByParentScriptId(long projectId, long parentScriptId) {
		return subscriptReferenceDAO.listSubscriptReferencesByParentScriptId(projectId, parentScriptId);
	}

	@SuppressWarnings("unchecked")
	@Override
	@Transactional
	public List<SubscriptReference> listSubscriptReferencesBySubscriptId(long projectId, long subscriptId) {
		return subscriptReferenceDAO.listSubscriptReferencesBySubscriptId(projectId, subscriptId);
	}



	@Override
	@Transactional
	public void removeSubscriptReference(long projectId, long id) {
		subscriptReferenceDAO.removeSubscriptReference(projectId, id);
	}

	@Override
	@Transactional
	public void removeSubscriptReferenceByScriptId(long projectId, long scriptId) {

		subscriptReferenceDAO.removeSubscriptReferenceByScriptId(projectId, scriptId);
	}

	@Override
	@Transactional
	public void removeSubscriptReferenceBySubScriptId(long projectId, long subscriptId) {
		subscriptReferenceDAO.removeSubscriptReferenceBySubScriptId(projectId, subscriptId);
	}
}
