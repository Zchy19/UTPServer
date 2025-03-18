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
@Table(name="ExecutionResult")
public class ExecutionResult implements Serializable{

	public static final int Fail = 0;	
	public static final int Success = 1;
	public static final int Timeout = 2;
	public static final int Other = 3;

/*	
	public static final String TestCaseBegin = "Execution TestCase Begin";
	public static final String TestCaseEnd = "Execution TestCase End";
	public static final String CheckPointBegin = "Execution CheckPoint Begin";
	public static final String CheckPointEnd = "Execution CheckPoint End";
	public static final String ExecutionCommand = "Execution Command";
*/	
	public static final int CommandType_ExecutionBegin = 1;
	public static final int CommandType_TestcaseBegin = 2;
	public static final int CommandType_CheckPointBegin = 3;
	public static final int CommandType_SubscriptBegin = 4;
	public static final int CommandType_Command = 5;
	public static final int CommandType_SubscriptEnd = 6;
	public static final int CommandType_CheckPointEnd = 7;
	public static final int CommandType_TestcaseEnd = 8;
	public static final int CommandType_ExecutionEnd = 9;
	
	public static final int CommandType_ExceptionBegin = -1;
	public static final int CommandType_ExceptionEnd = -2;
	
	
	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	private String agentInstanceName;
	private int commandType;
	private long scriptId;
	private String indexId;
	private String parentId;

	public String getIndexId() {
		return indexId;
	}

	public void setIndexId(String indexId) {
		this.indexId = indexId;
	}

	public String getParentId() {
		return parentId;
	}

	public void setParentId(String parentId) {
		this.parentId = parentId;
	}

	public int getCommandType() {
		return commandType;
	}

	public void setCommandType(int commandType) {
		this.commandType = commandType;
	}
	
	private String executionId;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
	private Date executionTime;
	
	public Date getExecutionTime() {
		return executionTime;
	}

	public void setExecutionTime(Date executionTime) {
		this.executionTime = executionTime;
	}

	public String getAgentInstanceName() {
		return agentInstanceName;
	}
	
	public long getScriptId() {
		return scriptId;
	}

	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}

	public void setAgentInstanceName(String agentInstanceName) {
		this.agentInstanceName = agentInstanceName;
	}

	public String getExecutionId() {
		return executionId;
	}

	public void setExecutionId(String executionId) {
		this.executionId = executionId;
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

	public int getResult() {
		return result;
	}

	public void setResult(int result) {
		this.result = result;
	}

	public String getExceptionMessage() {
		return exceptionMessage;
	}

	public void setExceptionMessage(String exceptionMessage) {
		this.exceptionMessage = exceptionMessage;
	}




	private String command;
	private int result;
	private String exceptionMessage;
	
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	
	@Override
	public String toString(){
		return "id="+id+", executionId="+executionId+", command="+command;
	}


	public ExecutionResult Clone() {
		ExecutionResult result = new ExecutionResult();
		result.setAgentInstanceName(this.agentInstanceName);
		result.setCommand(this.command);
		result.setCommandType(this.commandType);
		result.setExecutionId(this.executionId);
		result.setExecutionTime(this.executionTime);
		result.setExceptionMessage(this.exceptionMessage);
		result.setResult(this.result);
		result.setScriptId(this.scriptId);
		result.setParentId(this.parentId);
		result.setIndexId(this.indexId);
		return result;
	}
}
