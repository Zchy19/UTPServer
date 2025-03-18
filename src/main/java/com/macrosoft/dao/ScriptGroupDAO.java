package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.ScriptGroup;
import com.macrosoft.model.composition.ScriptInfo;

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
}
