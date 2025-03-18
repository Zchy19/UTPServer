package com.macrosoft.dao;

import java.util.List;

import org.dom4j.DocumentException;

import com.macrosoft.model.Script;
import com.macrosoft.model.composition.ScriptInfo;

public interface ScriptDAO {
	public Script addScript(long projectId, Script script);
	public void updateScript(long projectId, Script p);
	public Script getScriptById(long projectId, long id);
	public void removeScript(long projectId, long id);
	public void transitToSubscript(long projectId, long scriptId) throws DocumentException;
	public void transitToScript(long projectId, long subScriptId)  throws DocumentException;
	
	public List<ScriptInfo> listScriptInfos(long projectId, String type);
	public List<ScriptInfo> listScriptInfos(long projectId);
	public List<ScriptInfo> listScriptInfosByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public ScriptInfo getScriptInfoById(long projectId, long scriptId);
	public List<ScriptInfo> findReferenceOfSubScriptByScripts(long projectId,long subscriptId);
	public List<ScriptInfo> getExceptionRecoverCandidates(long projectId);
	public List<Script> listScriptsByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public List<Script> listScriptsByProjectId(long projectId);
	public List<Script> getScriptsByScriptIds(long projectId, String scriptIds, String type);
	public Script getScriptByScriptId(long scriptId);
	public List<Script> listSubScripts();
	//替换óòSUBSCRIPT为óòCALL_SCRIPT```
	public void updateScript();

}
