package com.macrosoft.controller.dto;

import java.util.List;

import com.macrosoft.model.TestSet;

public class CheckScriptReferenceResponse {

	private List<TestSet> referencesByTestSet;

	public List<TestSet> getReferencesByTestSet() {
		return referencesByTestSet;
	}

	public void setReferencesByTestSet(List<TestSet> referencesByTestSet) {
		this.referencesByTestSet = referencesByTestSet;
	}

}
