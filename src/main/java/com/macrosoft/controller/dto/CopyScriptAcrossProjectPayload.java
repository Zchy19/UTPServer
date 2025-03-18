package com.macrosoft.controller.dto;


public class CopyScriptAcrossProjectPayload
{
	private long sourceProjectId;	
	private Long[] scriptIds;	
	private Long[] scriptGroupIds;
	private long targetProjectId;
	private long targetScriptGroupId;
	
	public long getSourceProjectId() {
		return sourceProjectId;
	}
	public void setSourceProjectId(long sourceProjectId) {
		this.sourceProjectId = sourceProjectId;
	}
	public Long[] getScriptIds() {
		return scriptIds;
	}
	public void setScriptIds(Long[] scriptIds) {
		this.scriptIds = scriptIds;
	}
	public Long[] getScriptGroupIds() {
		return scriptGroupIds;
	}
	public void setScriptGroupIds(Long[] scriptGroupIds) {
		this.scriptGroupIds = scriptGroupIds;
	}
	public long getTargetProjectId() {
		return targetProjectId;
	}
	public void setTargetProjectId(long targetProjectId) {
		this.targetProjectId = targetProjectId;
	}
	public long getTargetScriptGroupId() {
		return targetScriptGroupId;
	}
	public void setTargetScriptGroupId(long targetScriptGroupId) {
		this.targetScriptGroupId = targetScriptGroupId;
	}

}
