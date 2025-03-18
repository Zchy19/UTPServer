package com.macrosoft.model.genericbusFrame;

import java.util.ArrayList;
import java.util.List;

public class Message {
	private String name;	
	private StartFlagField startFlagField;
	private EndFlagField endFlagField;
	private CheckSumField checksumField;
	private List<Field> fields = new ArrayList<Field>();
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public StartFlagField getStartFlagField() {
		return startFlagField;
	}
	public void setStartFlagField(StartFlagField startFlagField) {
		this.startFlagField = startFlagField;
	}
	
	public EndFlagField getEndFlagField() {
		return endFlagField;
	}
	public void setEndFlagField(EndFlagField endFlagField) {
		this.endFlagField = endFlagField;
	}
	public List<Field> getFields() {
		return fields;
	}
	public void setFields(List<Field> fields) {
		this.fields = fields;
	}
	public CheckSumField getChecksumField() {
		return checksumField;
	}
	public void setChecksumField(CheckSumField checksumField) {
		this.checksumField = checksumField;
	}
	
}
