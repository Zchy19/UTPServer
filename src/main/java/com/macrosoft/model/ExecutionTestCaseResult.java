package com.macrosoft.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="ExecutionTestCaseResult")
public class ExecutionTestCaseResult implements Serializable{

	public static final int None = -1;
	public static final int Fail = 0;
	public static final int Success = 1;
	
	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private String executionId;
	private long scriptId;
	private String scriptName;
	
	public long getScriptId() {
		return scriptId;
	}

	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}

	public String getScriptName() {
		return scriptName;
	}

	public void setScriptName(String scriptName) {
		this.scriptName = scriptName;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
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

	private int result;
	public int getResult() {
		return result;
	}

	public void setResult(int result) {
		this.result = result;
	}
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date startTime;
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date endTime;
	private String executedByUserId;

	private Long executionResultEndId;
	private Long executionResultStartId;

	public Long getExecutionResultEndId() {
		return executionResultEndId;
	}

	public void setExecutionResultEndId(Long executionResultEndId) {
		this.executionResultEndId = executionResultEndId;
	}

	public Long getExecutionResultStartId() {
		return executionResultStartId;
	}

	public void setExecutionResultStartId(Long executionResultStartId) {
		this.executionResultStartId = executionResultStartId;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	@Override
	public String toString(){
		return "id="+id+", executionId="+executionId;
	}


	public ExecutionTestCaseResult Clone(){
		ExecutionTestCaseResult result = new ExecutionTestCaseResult();
		result.setExecutionId(this.getExecutionId());
		result.setExecutedByUserId(this.getExecutedByUserId());
		result.setStartTime(this.getStartTime());
		result.setEndTime(this.getEndTime());
		result.setResult(this.getResult());
		result.setScriptId(this.getScriptId());
		result.setScriptName(this.getScriptName());
		result.setExecutionResultEndId(this.getExecutionResultEndId());
		result.setExecutionResultStartId(this.getExecutionResultStartId());
		return result;
	}
}
