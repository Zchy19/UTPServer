package com.macrosoft.controller.dto;

import java.util.List;

public class StartExecutionParameter {
	String executionId;
	List<SelectedAntbotMapping> selectedAntbotMapping;
	
	public String getExecutionId() {
		return executionId;
	}
	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}
	public List<SelectedAntbotMapping> getSelectedAntbotMapping() {
		return selectedAntbotMapping;
	}
	public void setSelectedAntbotMapping(List<SelectedAntbotMapping> selectedAntbotMapping) {
		this.selectedAntbotMapping = selectedAntbotMapping;
	}
}

