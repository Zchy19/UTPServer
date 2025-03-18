package com.macrosoft.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.ProtocolSignalInfo;
import com.macrosoft.dao.MessageTemplateDAO;
import com.macrosoft.dao.ProtocolSignalDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ProtocolSignal;
import com.macrosoft.service.ProtocolSignalService;
import com.macrosoft.utilities.FeaturesUtility;
import com.macrosoft.utilities.SystemUtil;
import org.apache.commons.io.FileUtils;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import java.io.File;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ProtocolSignalServiceImpl implements ProtocolSignalService {

    @Autowired
    ServletContext context;

    public static final String ProtocolDataType = "GenericBusFrame";

    private static final ILogger logger = LoggerFactory.Create(ProtocolSignalServiceImpl.class.getName());

    private ProtocolSignalDAO protocolSignalDAO;
    private MessageTemplateDAO MessageTemplateDAO;
    @Autowired
    public void setProtocolSignalDAO(ProtocolSignalDAO protocolSignalDAO) {
        this.protocolSignalDAO = protocolSignalDAO;
    }
    @Autowired
    public void setMessageTemplateDAO(MessageTemplateDAO messageTemplateDAO) {
        this.MessageTemplateDAO = messageTemplateDAO;
    }

    private UrsConfigurationImpl ursConfig;

    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

    @Override
    @Transactional
    public void addProtocolSignal(ProtocolSignal protocolSignal) {
        this.protocolSignalDAO.addProtocolSignal(protocolSignal);
    }

    @Override
    @Transactional
    public void updateProtocolSignal(ProtocolSignal protocolSignal) {
        this.protocolSignalDAO.updateProtocolSignal(protocolSignal);
    }


    @Override
    @Transactional
    public ProtocolSignal getProtocol(String id) {
        try {
            ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(id);
            if (protocolSignal == null)
                return null;
            String jsonStr = "";
            if (ProtocolSignal.GenericBusFrame.compareToIgnoreCase(protocolSignal.getDataType()) == 0) {
                jsonStr = protocolSignal.getBigdata();
            } else if (ProtocolSignal.SignalProtocol.compareToIgnoreCase(protocolSignal.getDataType()) == 0) {
                jsonStr = protocolSignal.getBigdata();
            } else {
                return null;
            }
            protocolSignal.setBigdata(jsonStr);
            return protocolSignal;
        } catch (Exception ex) {
            logger.error("ProtocolSignalServiceImpl::getProtocol()", ex);
            return null;
        }
    }

    @Override
    @Transactional
    public String resolveProtocolSignalFolderPath() {
        String uploadedFolder = SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/;
        if (!new File(uploadedFolder).exists()) {
            new File(uploadedFolder).mkdir();
        }

        String icdRepositoryFolder = uploadedFolder + "/BigdataStorage";
        if (!new File(icdRepositoryFolder).exists()) {
            new File(icdRepositoryFolder).mkdir();
        }

        return icdRepositoryFolder;
    }

    @Override
    @Transactional
    public List<ProtocolSignalInfo> listProtocolSignalInfosByOrg(String fileType, long organizationId) {
        return this.protocolSignalDAO.listProtocolSignalInfosByOrg(fileType, organizationId);
    }

    @Override
    @Transactional
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolType(String dataType, String protocolType, long organizationId) {
        return this.protocolSignalDAO.listProtocolSignalInfosByProtocolType(dataType, protocolType, organizationId);
    }

    @Override
    @Transactional
    public List<ProtocolSignalInfo> listProtocolSignalInfos(String fileType, String projectId) {
        return this.protocolSignalDAO.listProtocolSignalInfos(fileType, projectId);
    }

    @Override
    @Transactional
    public void removeProtocolSignal(String id) {

        ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(id);
        if (ProtocolDataType.compareToIgnoreCase(protocolSignal.getDataType()) == 0) {
            this.MessageTemplateDAO.expireMessageTemplate(id);
        }

        this.protocolSignalDAO.removeProtocolSignal(id);
    }

    @Override
    @Transactional
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProjectIdAndPublic(String dataType, Integer projectId, long organizationId) {
        return this.protocolSignalDAO.listProtocolSignalInfosByProjectIdAndPublic(dataType, projectId, organizationId);
    }

    @Override
    @Transactional
    public List<ProtocolSignalInfo> listProtocolSignalInfosByProtocolTypeAndProjectId(String dataType, String protocolType, long organizationId, Integer projectId) {
        return this.protocolSignalDAO.listProtocolSignalInfosByProtocolTypeAndProjectId(dataType, protocolType, organizationId, projectId);
    }


    @Override
    @Transactional
    public ProtocolSignal resolveProtocolSignalWithOverview(String id) {
        try {
            ProtocolSignal protocolSignal = this.protocolSignalDAO.getProtocolSignal(id);
            if (protocolSignal == null) return null;

            if (ProtocolSignal.BusFrameData.compareToIgnoreCase(protocolSignal.getDataType()) != 0) {
                return protocolSignal;
            }
            return null;
        } catch (Exception ex) {
            logger.error("protocolSignalServiceImpl::resolveProtocolSignalWithOverview()", ex);
            return null;
        }
    }

    @Override
    @Transactional
    public boolean isOverMaxProtocolSignalNum(long orgId, String dataType) {
        //获取所有的utpserverFeatures
        JsonNode utpserverFeatures = FeaturesUtility.GetFeaturesByModule(ursConfig.getIpAddress(), "utpserver");
        //默认为10
        int count = 10;
        if (utpserverFeatures != null) {
            //获取配置文件中的值
            String featureName = "";
            if (dataType.equals("GenericBusFrame")) {
                featureName = "utpserver.proto_mgr.proto_count";
            } else if (dataType.equals("SignalProtocol")) {
                featureName = "utpserver.signal_mgr.signaltable_count";
            }
            String configValue = FeaturesUtility.GetConfigValueByFeatureName(utpserverFeatures, featureName);
            if (configValue != null) {
//                count = Integer.parseInt(configValue);
                try {
                    count = Integer.parseInt(configValue);
                } catch (Exception e) {
                    // 处理转换失败的情况，这里可以选择记录日志或忽略异常
                    logger.error("GenericBusFrame或SignalProtocol配置configValue值转换失败，使用默认值10,configValue:" + configValue, e);
                }
            }
        }
        if (count != -1) {
            //获取当前项目的所有协议信号
            List<ProtocolSignalInfo> protocolSignalInfoList = this.protocolSignalDAO.listProtocolSignalInfosByOrg(dataType, orgId);
            if (protocolSignalInfoList.size() >= count) {
                return true;
            }

        }
        return false;
    }

    @Override
    @Transactional
    public void insertProtocolSignalByProtocolType(ProtocolSignalInfo protocolSignalInfo, MultipartFile inputFile) {
        try {
            HttpHeaders headers = new HttpHeaders();
            // 步骤1: 将上传的文件保存到临时文件夹中。
            String originalFilename = inputFile.getOriginalFilename();
            String id = UUID.randomUUID().toString();
            String tempFolder = SystemUtil.getTempDirectory();
            String destinationFilePath = tempFolder + File.separator + id;
            File destinationFile = new File(destinationFilePath);
            if (!new File(destinationFilePath).exists()) {
                new File(destinationFilePath).mkdir();
            }
            inputFile.transferTo(destinationFile);
            //获取文件内容
            String content = FileUtils.readFileToString(destinationFile, "UTF-8");

            //删除文件
            FileUtils.deleteQuietly(destinationFile);
            ObjectMapper mapper = new ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(content);

            protocolSignalInfo.setId(id);
            String fileName = jsonNode.get("protocolName").toString();
            fileName = fileName.replace("\"", "");
            protocolSignalInfo.setFileName(fileName);

            String protocolType = jsonNode.get("protocolType").toString();
            protocolType = protocolType.replace("\"", "");
            protocolSignalInfo.setProtocolType(protocolType);

            String messages = jsonNode.get("protocol").toString();
            protocolSignalInfo.setMessages(messages);

            Date createdAt = new Date();
            protocolSignalInfo.setCreatedAt(createdAt);
            this.protocolSignalDAO.insertProtocolSignalByProtocolType(protocolSignalInfo);
        } catch (Exception ex) {
            logger.error("uploadProtocolSignal", ex);
        }
    }
}
