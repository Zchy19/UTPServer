package com.macrosoft.service;

import com.macrosoft.controller.dto.*;
import com.macrosoft.model.Script;
import com.macrosoft.model.composition.ScriptInfo;

import java.util.List;

public interface ScriptService {
	public Script addScript(long projectId, Script script);
	public Script updateScript(long projectId, Script script);
	public Script getScriptById(long projectId, long id);

	public ScriptInfo getScriptInfoById(long projectId, long id);
	public List<ScriptInfo> listScriptInfos(long projectId, String type);
	public List<ScriptInfo> listScriptInfos(long projectId);
	public List<ScriptInfo> listScriptInfosByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public List<Script> listScriptsByParentScriptGroupId(long projectId, long parentScriptGroupId);
	public ScriptInfo updateScriptInfo(long projectId, ScriptInfo scriptInfo);
	public Script updateScriptInfo(long projectId, Script script);
	public ScriptInfo cutPasteScript(long projectId, long sourceScriptId, long targetParentScriptGroupId);
	public Script copyPasteScript(long projectId, long sourceScriptId, long targetParentScriptGroupId);
	public DeleteScriptResponse deleteScript(long projectId, long scriptId);
	public void forceDeleteScript(long projectId, long scriptId);
	public void forceDeleteScriptUnderScriptGroup(long projectId, long scriptGroupId);
	public CheckScriptReferenceResponse checkScriptReference(long projectId, long scriptId);
	public DeleteSubscriptResponse deleteSubScript(long projectId, long subscriptId);
	public CheckSubscriptReferenceResponse checkSubScriptReference(long projectId, long subscriptId) ;
	public void renameScript(long projectId, long scriptId, String newName);
	public TransitToSubScriptResponse transitToSubscript(long projectId, long scriptId);
	public TransitToScriptResponse transitToScript(long projectId, long scriptId);
	public List<ScriptInfo> getExceptionRecoverCandidates(long projectId);
	public void removeScriptsUnderScriptGroup(long projectId, long scriptGroupId);
	public List<Script> getScriptsByScriptIds(long projectId, String scriptIds, String type);
	////是否超过最大脚本数
	public boolean isOverMaxScriptNum(long projectId,String modelName,String featureName);
	//根据脚本id获取脚本信息
	public Script getScriptByScriptId(long scriptId);
	//修改
	public boolean updateSubScript();
	public void updateScript();
	//根据projectId和scriptId判断关联脚本是否都存在
	public ScriptCheckResult isAllSubScriptExist(long projectId, long scriptId);
}
