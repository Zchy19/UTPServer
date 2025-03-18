package com.macrosoft.controller.dto;

import java.util.List;

import com.macrosoft.model.RecoverSubscriptReference;
import com.macrosoft.model.composition.ScriptInfo;

public class TransitToScriptResponse {

	public final static String State_Success = "Success";
	public final static String State_FailedByReference = "FailedByReference";
	public final static String State_FailedByParameterNotEmpty = "FailedByParameterNotEmpty";
	public final static String State_UnknowError = "FailedByUnknowError";

	private String state;
	private List<RecoverSubscriptReference> referencesByRecoverSubscript;
	private List<ScriptInfo> referencesByScript;

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}
	

	
	public List<RecoverSubscriptReference> getReferencesByRecoverSubscript() {
		return referencesByRecoverSubscript;
	}
	public void setReferencesByRecoverSubscript(List<RecoverSubscriptReference> referencesByRecoverSubscript) {
		this.referencesByRecoverSubscript = referencesByRecoverSubscript;
	}
	public List<ScriptInfo> getReferencesByScript() {
		return referencesByScript;
	}
	public void setReferencesByScript(List<ScriptInfo> referencesByScript) {
		this.referencesByScript = referencesByScript;
	}
}

