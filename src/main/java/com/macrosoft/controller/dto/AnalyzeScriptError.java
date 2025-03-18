package com.macrosoft.controller.dto;

import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptFailedReason;

public class AnalyzeScriptError {

	private AnalyzeScriptFailedReason analyzeScriptFailedReason;

	public AnalyzeScriptError(AnalyzeScriptFailedReason analyzeScriptFailedReason) {

		this.analyzeScriptFailedReason = analyzeScriptFailedReason;
	}

	public AnalyzeScriptFailedReason getAnalyzeScriptFailedReason() {
		return analyzeScriptFailedReason;
	}

	public void setAnalyzeScriptFailedReason(AnalyzeScriptFailedReason analyzeScriptFailedReason) {
		this.analyzeScriptFailedReason = analyzeScriptFailedReason;
	}
}
