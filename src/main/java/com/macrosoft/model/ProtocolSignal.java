package com.macrosoft.model;


import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name="protocol_signal_table")
public class ProtocolSignal implements Serializable {

    public static final String CAN_FD = "CANFD";
    public static final String CAN_J1939 = "J1939(CAN)";
    public static final String ARINC429 = "ARINC-429";
    public static final String MIL1553B = "MIL-1553B";
    public static final String MIL1553BAndARINC429 = "MIL-1553B_CUSTOM";
    public static final String GenericBusFrame = "GenericBusFrame";
    public static final String SignalProtocol = "SignalProtocol";

    public static final String BusFrameData = "BusFrameData";

    @Id
    @Column(name="id")
    private String id;

    @Id
    @Column(name="dataType")
    private String dataType;

    @Column(name="fileName")
    private String fileName;

    @Column(name="bigdata")
    private String bigdata;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
    private Date createdAt;

    @Column(name="organizationId")
    private Long organizationId;

    @Column(name="protocolType")
    private String protocolType;

    @Column(name="projectId")
    private Integer projectId;

//    @Column(name="executionId")
//    private String executionId;

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

    public String getBigdata() {
        return bigdata;
    }

    public void setBigdata(String bigdata) {
        this.bigdata = bigdata;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }


    public long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(long organizationId) {
        this.organizationId = organizationId;
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

    public ProtocolSignal Clone()
    {
        ProtocolSignal protocolSignal = new ProtocolSignal();

        protocolSignal.setId(this.id);
        protocolSignal.setBigdata(this.bigdata);
        protocolSignal.setCreatedAt(this.createdAt);
        protocolSignal.setDataType(this.dataType);
        protocolSignal.setFileName(this.fileName);
        protocolSignal.setOrganizationId(this.organizationId);
        protocolSignal.setProjectId(this.projectId);
        protocolSignal.setProtocolType(this.protocolType);
        return protocolSignal;
    }
}
