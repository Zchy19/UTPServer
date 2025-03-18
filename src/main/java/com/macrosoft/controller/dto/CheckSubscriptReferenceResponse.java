package com.macrosoft.controller.dto;

import java.util.List;

import com.macrosoft.model.RecoverSubscriptReference;
import com.macrosoft.model.composition.ScriptInfo;

public class CheckSubscriptReferenceResponse {
	
	private List<RecoverSubscriptReference> referencesByRecoverSubscript;
	private List<ScriptInfo> referencesByScript;
	
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

