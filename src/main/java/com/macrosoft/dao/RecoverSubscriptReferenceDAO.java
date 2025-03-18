package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.controller.dto.RecoverSubscriptReferenceInfo;
import com.macrosoft.model.RecoverSubscriptReference;

public interface RecoverSubscriptReferenceDAO {
	public void addRecoverSubscriptReference(long projectId, RecoverSubscriptReference reference);

	public void updateRecoverSubscriptReference(long projectId, RecoverSubscriptReference reference);

	public RecoverSubscriptReference getRecoverSubscriptReference(long projectId, long id);

	public List<RecoverSubscriptReference> listRecoverSubscriptReference(long projectId);

	public List<RecoverSubscriptReference> listRecoverSubscriptBySubscriptId(long projectId, long subscriptId);

	public void removeRecoverSubscriptReference(long projectId, long id);

	public List<RecoverSubscriptReference> findReferenceOfRecoverSubscriptBySubscriptId(long projectId, long subscriptId);

	public List<RecoverSubscriptReferenceInfo> listRecoverSubscriptReferenceInfosByProjectId(long projectId);

	public RecoverSubscriptReferenceInfo getRecoverSubscriptReferenceInfo(long projectId, long referenceId);
}
