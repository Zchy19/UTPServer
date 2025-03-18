package com.macrosoft.controller.dto;

import com.macrosoft.model.Script;

public class ScriptMessageInfo extends Script {
    private String errorMessages;
    public ScriptMessageInfo() {
    }
    public ScriptMessageInfo (Script script){
        this.setId(script.getId());
        this.setProjectId(script.getProjectId());
        this.setName(script.getName());
        this.setDescription(script.getDescription());
        this.setParentScriptGroupId(script.getParentScriptGroupId());
        this.setScript(script.getScript());
        this.setBlockyXml(script.getBlockyXml());
        this.setParameter(script.getParameter());
        this.setParameter(script.getParameter());
        this.setType(script.getType());
    }
    public String getErrorMessages() {
        return errorMessages;
    }

    public void setErrorMessages(String errorMessages) {
        this.errorMessages = errorMessages;
    }
}
