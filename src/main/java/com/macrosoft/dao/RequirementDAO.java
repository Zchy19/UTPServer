package com.macrosoft.dao;

import java.util.List;
import com.macrosoft.model.Requirement;
import com.macrosoft.model.TestCaseRequirementMapping;
import com.macrosoft.model.composition.RequirementScriptTraceInfo;
import com.macrosoft.model.composition.ScriptInfo;

public interface RequirementDAO {
	public Requirement addRequirement(long projectId, Requirement requirement);
	public void updateRequirement(long projectId, Requirement requirement);
	public void updateCoveragePercentage(long projectId, Requirement requirement);
	public void removeRequirement(long projectId, long id);
	public List<Requirement> getRequirementByProjectId(long projectId);
	public Requirement getRequirementById(long projectId, long id);
	public List<Requirement> getRequirementByParentId(long projectId, long parentId);
	
	public void addScriptRequirementMapping(long projectId, long scriptId, long requirementId);
	public void removeScriptRequirementMappingByScriptId(long projectId, long scriptId);
	public void cleanScriptRequirementMapping(long projectId);
	public List<ScriptInfo> findReferenceOfScriptByRequirementId(long projectId, long requirementId);
	public List<Requirement> findReferenceOfRequirementByScriptId(long projectId, long scriptId);
	
	public List<TestCaseRequirementMapping> getRequirementMappingByProjectId(long projectId);
	public List<Requirement> getRequirementsByRequirementIds(long projectId, String requirementIds);

	public List<RequirementScriptTraceInfo> listRequirementScriptTraceInfo(long projectId);
}
