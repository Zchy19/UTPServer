package com.macrosoft.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name="executioncheckpoint")
public class ExecutionCheckPoint implements Serializable {
    public static final int None = -1;
    public static final int Fail = 0;
    public static final int Success = 1;
    @Id
    @Column(name="id")
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int id;
    private String executionId;
    private int testCaseId;
    private String checkPointName;
    private int result;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
    private Date startTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss:SSS", timezone="GMT+8")
    private Date endTime;
    private int projectId;
    private int testsetId;
    private long executionResultStartId;
    private long executionResultEndId;
    private int manualDecisionLevel;

    public long getExecutionResultStartId() {
        return executionResultStartId;
    }

    public void setExecutionResultStartId(long executionResultStartId) {
        this.executionResultStartId = executionResultStartId;
    }

    public long getExecutionResultEndId() {
        return executionResultEndId;
    }

    public void setExecutionResultEndId(long executionResultEndId) {
        this.executionResultEndId = executionResultEndId;
    }

    public int getManualDecisionLevel() {
        return manualDecisionLevel;
    }

    public void setManualDecisionLevel(int manualDecisionLevel) {
        this.manualDecisionLevel = manualDecisionLevel;
    }

    public int getTestsetId() {
        return testsetId;
    }

    public void setTestsetId(int testsetId) {
        this.testsetId = testsetId;
    }

    public long getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(String executionId) {
        this.executionId = executionId;
    }

    public long getTestCaseId() {
        return testCaseId;
    }

    public void setTestCaseId(int testCaseId) {
        this.testCaseId = testCaseId;
    }

    public String getCheckPointName() {
        return checkPointName;
    }

    public void setCheckPointName(String checkPointName) {
        this.checkPointName = checkPointName;
    }

    public int getResult() {
        return result;
    }

    public void setResult(int result) {
        this.result = result;
    }

    public Date getStartTime() {
        return startTime;
    }

    public void setStartTime(Date startTime) {
        this.startTime = startTime;
    }

    public Date getEndTime() {
        return endTime;
    }

    public void setEndTime(Date endTime) {
        this.endTime = endTime;
    }

    public long getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }
}
