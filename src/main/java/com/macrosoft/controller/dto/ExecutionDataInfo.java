package com.macrosoft.controller.dto;

public class ExecutionDataInfo {
    private String execOutputDataExtraID;
    private String dataType;
    private String dataContent;
    private String dataSource;
    private Integer uploadStatus;

    public Integer getUploadStatus() {
        return uploadStatus;
    }

    public void setUploadStatus(Integer uploadStatus) {
        this.uploadStatus = uploadStatus;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }

    public String getExecOutputDataExtraID() {
        return execOutputDataExtraID;
    }

    public void setExecOutputDataExtraID(String execOutputDataExtraID) {
        this.execOutputDataExtraID = execOutputDataExtraID;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getDataContent() {
        return dataContent;
    }

    public void setDataContent(String dataContent) {
        this.dataContent = dataContent;
    }
}
