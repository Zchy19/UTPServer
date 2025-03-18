package com.macrosoft.controller.dto;

public class TestSetStatisticsInfo {
    private String testsetName;
    private long testsetId;
    private long sumTime;
    private Integer sumTestsetCount;
    private Integer sumSuccessCount;
    private Integer sumFailedCount;
    private String checkPointName;
    private Integer sumFailCheckPointCount;
    private Integer sumSuccessCheckPointCount;

    private Integer sumManualDecisionLevel0=0;
    private Integer sumManualDecisionLevel1=0;
    private Integer sumManualDecisionLevel2=0;
    private Integer sumManualDecisionLevel3=0;
    private Integer sumManualDecisionLevel4=0;
    private Integer sumManualDecisionLevel5=0;

    public Integer getSumManualDecisionLevel0() {
        return sumManualDecisionLevel0;
    }

    public void setSumManualDecisionLevel0(Integer sumManualDecisionLevel0) {
        this.sumManualDecisionLevel0 = sumManualDecisionLevel0;
    }

    public Integer getSumManualDecisionLevel1() {
        return sumManualDecisionLevel1;
    }

    public void setSumManualDecisionLevel1(Integer sumManualDecisionLevel1) {
        this.sumManualDecisionLevel1 = sumManualDecisionLevel1;
    }

    public Integer getSumManualDecisionLevel2() {
        return sumManualDecisionLevel2;
    }

    public void setSumManualDecisionLevel2(Integer sumManualDecisionLevel2) {
        this.sumManualDecisionLevel2 = sumManualDecisionLevel2;
    }

    public Integer getSumManualDecisionLevel3() {
        return sumManualDecisionLevel3;
    }

    public void setSumManualDecisionLevel3(Integer sumManualDecisionLevel3) {
        this.sumManualDecisionLevel3 = sumManualDecisionLevel3;
    }

    public Integer getSumManualDecisionLevel4() {
        return sumManualDecisionLevel4;
    }

    public void setSumManualDecisionLevel4(Integer sumManualDecisionLevel4) {
        this.sumManualDecisionLevel4 = sumManualDecisionLevel4;
    }

    public Integer getSumManualDecisionLevel5() {
        return sumManualDecisionLevel5;
    }

    public void setSumManualDecisionLevel5(Integer sumManualDecisionLevel5) {
        this.sumManualDecisionLevel5 = sumManualDecisionLevel5;
    }

    public String getCheckPointName() {
        return checkPointName;
    }

    public void setCheckPointName(String checkPointName) {
        this.checkPointName = checkPointName;
    }

    public Integer getSumSuccessCheckPointCount() {
        return sumSuccessCheckPointCount;
    }

    public void setSumSuccessCheckPointCount(Integer sumSuccessCheckPointCount) {
        this.sumSuccessCheckPointCount = sumSuccessCheckPointCount;
    }

    public Integer getSumFailCheckPointCount() {
        return sumFailCheckPointCount;
    }

    public void setSumFailCheckPointCount(Integer sumFailCheckPointCount) {
        this.sumFailCheckPointCount = sumFailCheckPointCount;
    }

    public Integer getSumSuccessCount() {
        return sumSuccessCount;
    }

    public void setSumSuccessCount(Integer sumSuccessCount) {
        this.sumSuccessCount = sumSuccessCount;
    }

    public Integer getSumFailedCount() {
        return sumFailedCount;
    }

    public void setSumFailedCount(Integer sumFailedCount) {
        this.sumFailedCount = sumFailedCount;
    }

    public Integer getSumTestsetCount() {
        return sumTestsetCount;
    }

    public void setSumTestsetCount(Integer sumTestsetCount) {
        this.sumTestsetCount = sumTestsetCount;
    }

    public String getTestsetName() {
        return testsetName;
    }

    public void setTestsetName(String testsetName) {
        this.testsetName = testsetName;
    }

    public long getTestsetId() {
        return testsetId;
    }

    public void setTestsetId(long testsetId) {
        this.testsetId = testsetId;
    }

    public long getSumTime() {
        return sumTime;
    }

    public void setSumTime(long sumTime) {
        this.sumTime = sumTime;
    }
}
