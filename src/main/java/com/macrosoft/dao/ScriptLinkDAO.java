package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.ScriptLink;

public interface ScriptLinkDAO {
	public void addScriptLink(long projectId, ScriptLink scriptLink);
	public List<ScriptLink> listScriptLinks(long projectId);
	public List<ScriptLink> listScriptLinksByProjectId(long projectId);
	public List<ScriptLink> listScriptLinksByScriptId(long projectId, long scriptId);
	public ScriptLink getScriptLinkById(long projectId, long id);
	public void removeScriptLink(long projectId, long id);
	public void removeScriptLinkByScriptId(long projectId, long scriptId);
	public void removeScriptLinkByTestsetId(long projectId, long testsetId);
	public List<ScriptLink> listScriptLinksByTestsetId(long projectId, long testsetId);
}
