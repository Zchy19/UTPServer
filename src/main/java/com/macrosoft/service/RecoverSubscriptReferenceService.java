package com.macrosoft.service;

import java.util.List;

import com.macrosoft.controller.dto.RecoverSubscriptReferenceInfo;
import com.macrosoft.model.RecoverSubscriptReference;

public interface RecoverSubscriptReferenceService {
	public RecoverSubscriptReference addRecoverSubscriptReference(long projectId, RecoverSubscriptReferenceInfo refrernceInfo);
	public RecoverSubscriptReference updateRecoverSubscriptReference(long projectId, RecoverSubscriptReferenceInfo refrernceInfo);
	public RecoverSubscriptReferenceInfo getRecoverSubscriptReferenceInfo(long projectId, long id);
	
	public RecoverSubscriptReference getRecoverSubscriptReference(long projectId, long id);
	public List<RecoverSubscriptReference> listRecoverSubscriptReference(long projectId);
	public List<RecoverSubscriptReference> listRecoverSubscriptBySubscriptId(long projectId, long subscriptId);
	public void removeRecoverSubscriptReference(long projectId, long id);
	public List<RecoverSubscriptReferenceInfo> listRecoverSubscriptReferenceInfosByProjectId(long projectId);
}
