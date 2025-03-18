package com.macrosoft.controller.dto;

import com.macrosoft.utp.adatper.utpengine.exception.AntbotFailReason;

import java.util.ArrayList;
import java.util.List;

public class StartExecutionError {
	
	private List<AntbotFailReason> antbotFailedReasons = new ArrayList<AntbotFailReason>();

	public StartExecutionError() {}
	
	public StartExecutionError(List<AntbotFailReason> antbotFailedReasons) {
		this.antbotFailedReasons = antbotFailedReasons;
	}
	
	public List<AntbotFailReason> getAntbotFailedReasons() {
		return antbotFailedReasons;
	}

	public void setAntbotFailedReasons(List<AntbotFailReason> antbotFailedReasons) {
		this.antbotFailedReasons = antbotFailedReasons;
	}
}
