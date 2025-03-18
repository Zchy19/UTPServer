package com.macrosoft.dao;

import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.ProtocolSignalInfo;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.ProtocolSignal;

import java.util.List;

public interface ProtocolSignalDAO {

    public ProtocolSignal getProtocolSignal(String id);

    public void addProtocolSignal(ProtocolSignal protocolSignal);

    public List<ProtocolSignalInfo> listProtocolSignalInfosByOrg(String dataType, long organizationId);

    public List<ProtocolSignalInfo> listProtocolSignalInfos(String dataType, String projectId);

    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolType(String dataType, String protocolType, long organizationId);

    public void removeProtocolSignal(String id);

    public void updateProtocolSignal(ProtocolSignal protocolSignal);

    public List<ProtocolSignalInfo> listProtocolSignalInfosByProjectIdAndPublic(String dataType, Integer projectId, long organizationId);

    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolTypeAndProjectId(String dataType, String protocolType, long organizationId, Integer projectId);

    public void insertProtocolSignalByProtocolType(ProtocolSignalInfo protocolSignalInfo);
}
