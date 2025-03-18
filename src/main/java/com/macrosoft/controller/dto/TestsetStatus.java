package com.macrosoft.controller.dto;

public class TestsetStatus {
	private String testsetName;
	private String status;
	private String checkPointName;
	private int checkFailCount;
	private int checkSuccessCount;
	private String result;

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	public int getCheckExecutedCount() {
		return checkExecutedCount;
	}

	public void setCheckExecutedCount(int checkExecutedCount) {
		this.checkExecutedCount = checkExecutedCount;
	}

	private int checkExecutedCount;

	public int getCheckFailCount() {
		return checkFailCount;
	}

	public void setCheckFailCount(int checkFailCount) {
		this.checkFailCount = checkFailCount;
	}

	public int getCheckSuccessCount() {
		return checkSuccessCount;
	}

	public void setCheckSuccessCount(int checkSuccessCount) {
		this.checkSuccessCount = checkSuccessCount;
	}

	public String getTestsetName() {
		return testsetName;
	}

	public void setTestsetName(String testsetName) {
		this.testsetName = testsetName;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getCheckPointName() {
		return checkPointName;
	}

	public void setCheckPointName(String checkPointName) {
		this.checkPointName = checkPointName;
	}
}
