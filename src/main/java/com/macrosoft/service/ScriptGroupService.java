package com.macrosoft.service;

import com.macrosoft.model.ScriptGroup;

import java.util.List;

public interface ScriptGroupService {
	public ScriptGroup addScriptGroup(long projectId, ScriptGroup p);
	public void updateScriptGroup(long projectId, ScriptGroup p);
	public List<ScriptGroup> listScriptGroups(long projectId);
	public List<ScriptGroup> listScriptGroupsByType(long projectId, String type);
	public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId);
	public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public ScriptGroup getScriptGroupById(long projectId, long id);
	public void removeScriptGroup(long projectId, long id);


	public long addScriptGroupByPath(String path, long projectId, String type);
}
