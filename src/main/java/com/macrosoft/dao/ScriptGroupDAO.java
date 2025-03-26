package com.macrosoft.dao;

import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.composition.ScriptInfo;

import java.util.List;

public interface ScriptGroupDAO {
	public ScriptGroup addScriptGroup(long projectId, ScriptGroup scriptGroup);
	public void updateScriptGroup(long projectId, ScriptGroup scriptGroup);
	public List<ScriptGroup> listScriptGroups(long projectId);
	public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public ScriptGroup getScriptGroupById(long projectId, long id);
	public void removeScriptGroup(long projectId, long id);
	public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId);
	public List<ScriptInfo> findAllReferenceOfSubScriptByRecoverScript(long projectId, long scriptGroupId);
	public List<ScriptInfo> findAllReferenceOfSubScriptByScript(long projectId, long scriptGroupId);
	public List<ScriptInfo> findAllScriptReferencedByTestset(long projectId, long scriptGroupId);
	public List<ScriptGroup> listScriptGroupsByType(long projectId, String type);

	public ScriptGroup getScriptGroupByName(String scriptGroupName, Long parentScriptGroupId);
}
