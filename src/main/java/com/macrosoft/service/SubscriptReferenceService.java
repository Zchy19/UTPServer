package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.SubscriptReference;

public interface SubscriptReferenceService {
	
	public void addSubscriptReference(long projectId, SubscriptReference subscriptReference);
	
	public List<SubscriptReference> listSubscriptReferencesByParentScriptId(long projectId, long parentScriptId);
	public List<SubscriptReference> listSubscriptReferencesBySubscriptId(long projectId, long subscriptId);
	
	public void removeSubscriptReference(long projectId, long id);

	public void removeSubscriptReferenceByScriptId(long projectId, long scriptId);

	public void removeSubscriptReferenceBySubScriptId(long projectId, long subscriptId);
}
