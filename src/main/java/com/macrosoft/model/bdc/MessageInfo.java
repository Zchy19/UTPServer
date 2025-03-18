package com.macrosoft.model.bdc;

import java.util.ArrayList;
import java.util.List;

public class MessageInfo {

	private String message;
	private List<SignalInfo> signals;
	
	public MessageInfo()
	{
		signals = new ArrayList<SignalInfo>();
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public List<SignalInfo> getSignals() {
		return signals;
	}

	public void setSignals(List<SignalInfo> signals) {
		this.signals = signals;
	}
	
}
