package com.macrosoft.controller.dto;

public class ScriptCheckResult {
    private boolean hasIssue;
    private long scriptId;
    private long referencingScriptId;

    public ScriptCheckResult(boolean hasIssue, long scriptId) {
        this.hasIssue = hasIssue;
        this.scriptId = scriptId;
        this.referencingScriptId = 0;
    }

    public ScriptCheckResult(boolean hasIssue, long scriptId, long referencingScriptId) {
        this.hasIssue = hasIssue;
        this.scriptId = scriptId;
        this.referencingScriptId = referencingScriptId;
    }

    public boolean hasIssue() {
        return hasIssue;
    }

    public long getScriptId() {
        return scriptId;
    }

    public long getReferencingScriptId() {
        return referencingScriptId;
    }

    public void setReferencingScriptId(long referencingScriptId) {
        this.referencingScriptId = referencingScriptId;
    }
}