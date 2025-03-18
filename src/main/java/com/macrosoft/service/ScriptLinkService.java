package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.ScriptLink;

public interface ScriptLinkService {
	public void addScriptLink(long projectId, ScriptLink p);
	public List<ScriptLink> listScriptLinksByProjectId(long projectId);
	public ScriptLink getScriptLinkById(long projectId,long id);
	public void removeScriptLink(long projectId,long id);
	public void removeScriptLinkByTestsetId(long projectId,long testsetId);
	public List<ScriptLink> listScriptLinksByScriptId(long projectId,long scriptId);
	public List<ScriptLink> listScriptLinksByTestsetId(long projectId,long testsetId);
	
}
