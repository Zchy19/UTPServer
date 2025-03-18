package com.macrosoft.controller.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrosoft.model.ProtocolSignal;

import java.util.Date;

public class ProtocolSignalInfo {
    private String id;
    private String dataType;
    private String fileName;
    private String protocolType;
    private Integer projectId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
    private Date createdAt;

    private String messages;

    public String getMessages() {
        return messages;
    }

    public void setMessages(String messages) {
        this.messages = messages;
    }

    public ProtocolSignalInfo() {
    }

    public ProtocolSignalInfo(ProtocolSignal protocolSignal)
    {
        this.id = protocolSignal.getId();
        this.dataType = protocolSignal.getDataType();
        this.fileName = protocolSignal.getFileName();
        this.createdAt = protocolSignal.getCreatedAt();
        this.protocolType = protocolSignal.getProtocolType();
        this.projectId = protocolSignal.getProjectId();

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public String getProtocolType() {
        return protocolType;
    }

    public void setProtocolType(String protocolType) {
        this.protocolType = protocolType;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public void setProjectId(Integer projectId) {
        this.projectId = projectId;
    }
}
