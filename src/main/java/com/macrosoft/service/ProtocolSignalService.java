package com.macrosoft.service;


import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.ProtocolSignalInfo;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.ProtocolSignal;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProtocolSignalService {
    public void addProtocolSignal(ProtocolSignal protocolSignal);
    public void updateProtocolSignal(ProtocolSignal protocolSignal);
    public ProtocolSignal getProtocol(String id);
    public String resolveProtocolSignalFolderPath();
    public List<ProtocolSignalInfo> listProtocolSignalInfosByOrg(String fileType, long organizationId);
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolType(String dataType, String protocolType,long organizationId);
    public List<ProtocolSignalInfo> listProtocolSignalInfos(String dataType, String projectId);
    public void removeProtocolSignal(String id);
    public ProtocolSignal resolveProtocolSignalWithOverview(String id);
    public boolean isOverMaxProtocolSignalNum(long orgId,String dataType);

    //根据projectId和公共的protocolSignal获取
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProjectIdAndPublic(String dataType, Integer projectId, long organizationId);
    //projectId
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolTypeAndProjectId(String dataType, String protocolType,long organizationId,Integer projectId);

    public void insertProtocolSignalByProtocolType(ProtocolSignalInfo protocolSignalInfo, MultipartFile inputFile);

    public List<ProtocolSignal> parseDbcFile(String filePath);
}
