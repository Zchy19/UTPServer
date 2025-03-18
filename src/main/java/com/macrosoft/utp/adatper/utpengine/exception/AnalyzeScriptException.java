package com.macrosoft.utp.adatper.utpengine.exception;


public class AnalyzeScriptException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Analyze script failed.";
	
	private AnalyzeScriptFailedReason analyzeScriptFailedReason;
	
	public AnalyzeScriptException(AnalyzeScriptFailedReason analyzeScriptFailedReason) {
		super(ErrorMessage);
		
		this.analyzeScriptFailedReason = analyzeScriptFailedReason;
	}

	public AnalyzeScriptFailedReason getAnalyzeScriptFailedReason() {
		return analyzeScriptFailedReason;
	}

	public void setAnalyzeScriptFailedReason(AnalyzeScriptFailedReason analyzeScriptFailedReason) {
		this.analyzeScriptFailedReason = analyzeScriptFailedReason;
	}

	@Override
	public String toString(){
		return ErrorMessage;
	}
}
