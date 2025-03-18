package com.macrosoft.controller.dto;

import java.util.List;

import com.macrosoft.model.TestSet;

public class DeleteScriptResponse {

	private String state;
	private List<TestSet> referencesByTestSet;

	public final static String State_Success = "Success";
	public final static String State_FailedByReference = "FailedByReference";
	public final static String State_UnknowError = "FailedByUnknowError";

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public List<TestSet> getReferencesByTestSet() {
		return referencesByTestSet;
	}

	public void setReferencesByTestSet(List<TestSet> referencesByTestSet) {
		this.referencesByTestSet = referencesByTestSet;
	}

}
