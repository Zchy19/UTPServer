package com.macrosoft.controller.dto;

import com.macrosoft.model.Requirement;

public class PasteRequirementResponse {

	private String state;
	private Requirement requirement;

	public final static String State_Success = "Success";
	public final static String State_FailedByDestinationIsSubfolder = "FailedByDestinationIsSubfolder";
	public final static String State_FailedByUnknowError = "FailedByUnknowError";

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public Requirement getRequirement() {
		return requirement;
	}

	public void setRequirement(Requirement requirement) {
		this.requirement = requirement;
	}

	

}
