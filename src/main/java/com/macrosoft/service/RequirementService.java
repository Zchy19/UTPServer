package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.Requirement;
import com.macrosoft.model.TestCaseRequirementMapping;
import com.macrosoft.model.composition.RequirementScriptTraceInfo;
import com.macrosoft.model.composition.ScriptInfo;

public interface RequirementService {
	public Requirement addRequirement(long projectId, Requirement requirement);
	public void addRequirements(List<Requirement> requirements);
	public void updateRequirement(long projectId, Requirement requirement);
	public void removeRequirement(long projectId, long id);
	public void removeRequirement(long projectId, long id, boolean forceDeleteMapping);
	public List<Requirement> getRequirementByProjectId(long projectId);
	public Requirement getRequirementById(long projectId, long id);
	public List<Requirement> getRequirementByParentId(long projectId, long parentId);
	public List<ScriptInfo> findReferenceOfScriptByRequirementId(long projectId, long requirementId);
	public List<Requirement> findReferenceOfRequirementByScriptId(long projectId, long scriptId);
	public void addScriptRequirementMapping(long projectId, long scriptId, long requirementId);
	public void removeScriptRequirementMapping(long projectId, long requirementId);
	
	public void updateScriptRequirementMapping(long projectId, long scriptId, String requirementIdsWithCommaSeperator);
	public List<TestCaseRequirementMapping> getRequirementMappingByProjectId(long projectId);
	public List<Requirement> getRequirementsByRequirementIds(long projectId, String requirementIds);
	public List<RequirementScriptTraceInfo> listRequirementScriptTraceInfo(long projectId);
	
	public void calculateCoverage(long projectId);
}
