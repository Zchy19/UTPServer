package com.macrosoft.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="ExecutionStatus")
public class ExecutionStatus implements Serializable{

	public static final int Starting = 1;	
	public static final int Running = 10; // 1;
	public static final int Pausing = 2;
	public static final int Paused = 20; //2;
	public static final int Resuming = 3; // 3
	public static final int Stopping = 4;
	public static final int Stopped = 40;
	public static final int ExceptionHandling = 50;
	public static final int ReconnectingNetwork = 60;
//	public static final int StartExecutionError = 80;
	public static final int Terminated = 90;	
	public static final int Completed = 100;

	
	public static final String StartingString = "Starting";	
	public static final String RunningString = "Running"; // 1;
	public static final String PausingString = "Pausing";
	public static final String PausedString = "Paused"; //2;
	public static final String ResumingString = "Resuming"; // 3
	public static final String StoppingString = "Stopping";
	public static final String StoppedString = "Stopped";
	public static final String ExceptionHandlingString = "ExceptionHandling";
	public static final String ReconnectingNetworkString = "ReconnectingNetwork";
	public static final String TerminatedString = "Terminated";	
//	public static final String StartExecutionErrorString = "StartExecutionError";	
	public static final String CompletedString = "Completed";	
	
	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private String executionId;
	private String executionName;
	private Integer testsetId;
	private String testsetName;
	private String testObject;
	private boolean isDummyRun;
	private boolean isTemporaryExecution;
	private String informEmail;
	private String enginename;


	public boolean isDummyRun() {
		return isDummyRun;
	}

	public void setDummyRun(boolean dummyRun) {
		isDummyRun = dummyRun;
	}

	public String getInformEmail() {
		return informEmail;
	}

	public void setInformEmail(String informEmail) {
		this.informEmail = informEmail;
	}

	public boolean getIsTemporaryExecution() {
		return isTemporaryExecution;
	}

	public void setIsTemporaryExecution(boolean isTemporaryExecution) {
		this.isTemporaryExecution = isTemporaryExecution;
	}
	
	public boolean getIsDummyRun() {
		return isDummyRun;
	}

	public void setIsDummyRun(boolean isDummyRun) {
		this.isDummyRun = isDummyRun;
	}

	public Integer getTestsetId() {
		return testsetId;
	}

	public void setTestsetId(Integer testsetId) {
		this.testsetId = testsetId;
	}

	public String getTestObject() {
		return testObject;
	}

	public void setTestObject(String testObject) {
		this.testObject = testObject;
	}

	public String getTestsetName() {
		return testsetName;
	}

	public void setTestsetName(String testsetName) {
		this.testsetName = testsetName;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}

	public String getExecutionName() {
		return executionName;
	}

	public void setExecutionName(String executionName) {
		this.executionName = executionName;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public Date getStartTime() {
		return startTime;
	}

	public void setStartTime(Date startTime) {
		this.startTime = startTime;
	}

	public String getExecutedByUserId() {
		return executedByUserId;
	}

	public void setExecutedByUserId(String executedByUserId) {
		this.executedByUserId = executedByUserId;
	}

	private int status;

	private long projectId;
	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	private String orgId;
	public String getOrgId() {
		return orgId;
	}

	public void setOrgId(String orgId) {
		this.orgId = orgId;
	}
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date startTime;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date endTime;
	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	private String executedByUserId;
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public boolean isTemporaryExecution() {
		return isTemporaryExecution;
	}

	public void setTemporaryExecution(boolean isTemporaryExecution) {
		this.isTemporaryExecution = isTemporaryExecution;
	}


	public String getEnginename() {
		return enginename;
	}

	public void setEnginename(String enginename) {
		this.enginename = enginename;
	}

	@Override
	public String toString(){
		return "id="+id+", executionId="+executionId;
	}


	public ExecutionStatus Clone() {
		ExecutionStatus newExecutionStatus = new ExecutionStatus();
		newExecutionStatus.setExecutionId(this.getExecutionId());
		newExecutionStatus.setExecutionName(this.getExecutionName());
		newExecutionStatus.setTestsetId(this.getTestsetId());
		newExecutionStatus.setTestsetName(this.getTestsetName());
		newExecutionStatus.setTestObject(this.getTestObject());
		newExecutionStatus.setIsDummyRun(this.getIsDummyRun());
		newExecutionStatus.setIsTemporaryExecution(this.isTemporaryExecution());
		newExecutionStatus.setStatus(this.getStatus());
		newExecutionStatus.setStartTime(this.getStartTime());
		newExecutionStatus.setEndTime(this.getEndTime());
		newExecutionStatus.setExecutedByUserId(this.getExecutedByUserId());
		newExecutionStatus.setProjectId(this.getProjectId());
		newExecutionStatus.setOrgId(this.getOrgId());
		newExecutionStatus.setEnginename(this.getEnginename());
		return newExecutionStatus;
	}
}
