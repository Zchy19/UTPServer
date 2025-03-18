package com.macrosoft.model.bdc;

import java.util.ArrayList;
import java.util.List;

public class Message {

	private String name;
	private String id;
	private int dlc;
	private List<Signal> signals;
	
	public Message()
	{
		signals = new ArrayList<Signal>();
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public int getDlc() {
		return dlc;
	}
	public void setDlc(int dlc) {
		this.dlc = dlc;
	}
	public List<Signal> getSignals() {
		return signals;
	}
	public void setSignals(List<Signal> signals) {
		this.signals = signals;
	}
}
