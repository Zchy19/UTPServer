package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.ScriptGroup;

public interface ScriptGroupService {
	public ScriptGroup addScriptGroup(long projectId, ScriptGroup p);
	public void updateScriptGroup(long projectId, ScriptGroup p);
	public List<ScriptGroup> listScriptGroups(long projectId);
	public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId);
	public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public ScriptGroup getScriptGroupById(long projectId, long id);
	public void removeScriptGroup(long projectId, long id);
}
