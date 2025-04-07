package com.macrosoft.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.ProtocolSignalInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.model.ProtocolSignal;
import com.macrosoft.service.ProtocolSignalService;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.StringUtility;
import com.macrosoft.utilities.SystemUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Controller
public class ProtocolSignalController {

    private static final ILogger logger = LoggerFactory.Create(ProtocolSignalController.class.getName());
    private ProtocolSignalService protocolSignalService;
    @Autowired(required = true)
    // @Qualifier(value = "protocolSignalService")
    public void setProtocolSignalService(ProtocolSignalService protocolSignalService) {
        this.protocolSignalService = protocolSignalService;
    }

    @RequestMapping(value = "/api/protocol/get/{ProtocolSignalId}", method = RequestMethod.GET)
    public @ResponseBody
    ApiResponse<ProtocolSignal> getProtocol(@PathVariable("ProtocolSignalId") String protocolSignalId) {
        try {
            ProtocolSignal result = this.protocolSignalService.getProtocol(protocolSignalId);
            return new ApiResponse<ProtocolSignal>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getProtocolSignal", ex);
            return new ApiResponse<ProtocolSignal>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/protocolSignal/upload", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProtocolSignalInfo> uploadProtocolSignal(
            @RequestParam("dataType") String dataType,
            @RequestParam(value = "protocolType", required = false) String protocolType,
            @RequestParam("file") MultipartFile inputFile) {

        try {
            // 公共校验：文件大小和数量限制
            boolean overMaxProtocolSignalNum = protocolSignalService.isOverMaxProtocolSignalNum(
                    Long.parseLong(TenantContext.getOrgId()),
                    dataType
            );
            if (overMaxProtocolSignalNum) {
                ProtocolSignalInfo protocolSignalInfo = new ProtocolSignalInfo();
                protocolSignalInfo.setMessages("OVER_MAX_PROTOCOLSIGNAL_NUM");
                return new ApiResponse<>(ApiResponse.UnHandleException, protocolSignalInfo);
            }
            if (inputFile.isEmpty()) {
                return new ApiResponse<>(ApiResponse.UnHandleException, null);
            }

            // 根据数据类型路由处理逻辑
            if ("GenericBusFrame".equalsIgnoreCase(dataType)) {
                return handleGenericBusFrameUpload(dataType, inputFile);
            } else if ("SignalProtocol".equalsIgnoreCase(dataType)) {
                return handleSignalProtocolUpload(dataType, protocolType, inputFile);
            } else {
                logger.error("未知数据类型: " + dataType);
                return new ApiResponse<>(ApiResponse.UnHandleException, null);
            }

        } catch (IOException e) {
            logger.error("文件处理失败", e);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        } catch (Exception ex) {
            logger.error("上传协议信号失败", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    // 处理 GenericBusFrame（新逻辑）
    private ApiResponse<ProtocolSignalInfo> handleGenericBusFrameUpload(String dataType, MultipartFile file) throws IOException {
        // 1. 保存文件到临时目录（按ID隔离）
        String id = UUID.randomUUID().toString();
        String protocolSignalFolder = protocolSignalService.resolveProtocolSignalFolderPath();
        String destinationDirPath = protocolSignalFolder + File.separator + id;
        Files.createDirectories(Paths.get(destinationDirPath));

        String destinationFilePath = destinationDirPath + File.separator + file.getOriginalFilename();
        file.transferTo(new File(destinationFilePath));

        // 2. 解析并校验JSON结构
        String content = FileUtility.readLineByLineJava8(destinationFilePath);
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(content);

        if (!rootNode.has("protocolName") || !rootNode.has("protocolType") || !rootNode.has("protocol")) {
            logger.error("GenericBusFrame文件缺少必要字段");
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }

        // 3. 构建ProtocolSignal对象
        ProtocolSignal protocolSignal = new ProtocolSignal();
        protocolSignal.setId(id);
        protocolSignal.setFileName(rootNode.get("protocolName").asText()); // 使用JSON中的protocolName
        protocolSignal.setDataType(dataType);
        protocolSignal.setProtocolType(rootNode.get("protocolType").asText()); // 从JSON提取
        protocolSignal.setBigdata(rootNode.get("protocol").toString()); // 仅存储protocol字段
        protocolSignal.setCreatedAt(new Date());
        protocolSignal.setOrganizationId(Long.parseLong(TenantContext.getOrgId()));

        // 4. 存入数据库
        protocolSignalService.addProtocolSignal(protocolSignal);
        return new ApiResponse<>(ApiResponse.Success, new ProtocolSignalInfo(protocolSignal));
    }

    // 处理 SignalProtocol（旧逻辑）
    private ApiResponse<ProtocolSignalInfo> handleSignalProtocolUpload(
            String dataType,
            String protocolType,
            MultipartFile file) throws IOException {

        // 1. 保存文件（旧版路径结构）
        String id = UUID.randomUUID().toString();
        String destinationFilePath = protocolSignalService.resolveProtocolSignalFolderPath()
                + File.separator + id;
        file.transferTo(new File(destinationFilePath));

        // 2. 直接存储原始内容
        ProtocolSignal protocolSignal = new ProtocolSignal();
        protocolSignal.setId(id);
        protocolSignal.setFileName(file.getOriginalFilename());
        protocolSignal.setDataType(dataType);
        protocolSignal.setProtocolType(protocolType); // 从参数获取
        protocolSignal.setBigdata(FileUtility.readLineByLineJava8(destinationFilePath)); // 完整文件内容
        protocolSignal.setCreatedAt(new Date());
        protocolSignal.setOrganizationId(Long.parseLong(TenantContext.getOrgId()));

        // 3. 存入数据库
        protocolSignalService.addProtocolSignal(protocolSignal);
        return new ApiResponse<>(ApiResponse.Success, new ProtocolSignalInfo(protocolSignal));
    }


    @RequestMapping(value = "/api/protocolSignal/importSignalDefination", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProtocolSignalInfo>importSignalDefination(@RequestParam("file") MultipartFile inputFile) {
        try {
            ProtocolSignalInfo protocolSignal = new ProtocolSignalInfo();
            protocolSignal.setDataType("SignalProtocol");

            ApiResponse<ProtocolSignalInfo> insertProtocol = new ApiResponse<ProtocolSignalInfo>(0,protocolSignal);
            this.protocolSignalService.insertProtocolSignalByProtocolType(protocolSignal,inputFile);
            return insertProtocol;
        } catch (Exception ex) {
            logger.error("uploadProtocolSignal", ex);
            return new ApiResponse<ProtocolSignalInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/importProtocolDefination", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProtocolSignalInfo>importProtocolDefination(@RequestParam("file") MultipartFile inputFile) {
        try {
            ProtocolSignalInfo protocolSignal = new ProtocolSignalInfo();
            protocolSignal.setDataType("GenericBusFrame");
            ApiResponse<ProtocolSignalInfo> insertProtocol = new ApiResponse<ProtocolSignalInfo>(0,protocolSignal);
            this.protocolSignalService.insertProtocolSignalByProtocolType(protocolSignal,inputFile);
            return insertProtocol;
        } catch (Exception ex) {
            logger.error("uploadProtocolSignal", ex);
            return new ApiResponse<ProtocolSignalInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/{dataType}/{protocolType}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalInfosByProtocolType(@PathVariable("dataType") String fileType , @PathVariable("protocolType") String protocolType) {
        try {

            String orgIdPara = TenantContext.getOrgId();
            long orgId = StringUtility.parseLongSafely(orgIdPara).getResult();
            List<ProtocolSignalInfo> ProtocolSignalInfos = protocolSignalService.listProtocolSignalInfosByProtocolType(fileType,protocolType, orgId);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.Success, ProtocolSignalInfos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalInfosByProtocolType", ex);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/{dataType}/{protocolType}/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProtocolSignalInfo>> getProtocolsByProtocolTypeAndProjectId(@PathVariable("dataType") String fileType , @PathVariable("protocolType") String protocolType,@PathVariable("projectId") Integer projectId) {
        try {

            String orgIdPara = TenantContext.getOrgId();
            long orgId = StringUtility.parseLongSafely(orgIdPara).getResult();
            List<ProtocolSignalInfo> ProtocolSignalInfos = protocolSignalService.listProtocolSignalInfosByProtocolTypeAndProjectId(fileType,protocolType, orgId,projectId);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.Success, ProtocolSignalInfos);
        } catch (Exception ex) {
            logger.error("getProtocolsByProtocolTypeAndProjectId", ex);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/public/{dataType}/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalsByProjectIdAndPublic(@PathVariable("dataType") String fileType , @PathVariable("projectId") Integer projectId) {
        try {

            String orgIdPara = TenantContext.getOrgId();
            long orgId = StringUtility.parseLongSafely(orgIdPara).getResult();
            List<ProtocolSignalInfo> ProtocolSignalInfos = protocolSignalService.listProtocolSignalInfosByProjectIdAndPublic(fileType,projectId, orgId);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.Success, ProtocolSignalInfos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalsByProjectIdAndPublic", ex);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/list/{fileType}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalInfos(@PathVariable("fileType") String fileType) {
        try {

            String orgIdPara = TenantContext.getOrgId();
            long orgId = StringUtility.parseLongSafely(orgIdPara).getResult();

            logger.info("/api/protocolSignal/list/" + fileType + ", orgId:" +  orgId);

            List<ProtocolSignalInfo> ProtocolSignalInfos = protocolSignalService.listProtocolSignalInfosByOrg(fileType, orgId);

            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.Success, ProtocolSignalInfos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalInfos", ex);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/list/{fileType}/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalInfos(@PathVariable("fileType") String fileType,
                                                                                      @PathVariable("projectId") String projectId) {
        try {
            List<ProtocolSignalInfo> protocolSignalInfos = protocolSignalService.listProtocolSignalInfos(fileType, projectId);

            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.Success, protocolSignalInfos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalInfos", ex);
            return new ApiResponse<List<ProtocolSignalInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/delete/{id}", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> deleteProtocolSignal(@PathVariable("id") String id) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteProtocolSignal");
            this.protocolSignalService.removeProtocolSignal(id);
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("deleteProtocolSignal", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }

    @RequestMapping(value = "/api/protocolSignal/get/overview/{protocolSignalId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ProtocolSignal> getProtocolSignalWithOverview(@PathVariable("protocolSignalId") String protocolSignalId) {
        try {
            ProtocolSignal result = this.protocolSignalService.resolveProtocolSignalWithOverview(protocolSignalId);
            return new ApiResponse<ProtocolSignal>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getProtocolSignalWithOverview", ex);
            return new ApiResponse<ProtocolSignal>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/protocolSignal/update", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> updateBigdataStorage(@RequestParam("id") String protocolSignalId, @RequestParam("file") MultipartFile inputFile,@RequestParam("protocolType") String protocolType) {

        if (inputFile.isEmpty()) {
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            // Step1: Save uploaded file to temporary folder.
            String originalFilename = inputFile.getOriginalFilename();

            String ProtocolSignalFolder = protocolSignalService.resolveProtocolSignalFolderPath();
            String id =  UUID.randomUUID().toString();
            String destinationFilePath = ProtocolSignalFolder + File.separator + id;
            File destinationFile = new File(destinationFilePath);
            if (!new File(destinationFilePath).exists()) {
                new File(destinationFilePath).mkdir();
            }

            inputFile.transferTo(destinationFile);

            headers.add("File Storage Uploaded Successfully - ", originalFilename);
            logger.info(String.format("File Storage Update Uploaded Successfully - originalFilename: %s, destinationFilePath: %s ", originalFilename, destinationFilePath));
            String content = FileUtility.readLineByLineJava8(destinationFilePath);
            ProtocolSignal protocolSignal = this.protocolSignalService.getProtocol(protocolSignalId);
            protocolSignal.setBigdata(content);
            protocolSignal.setFileName(originalFilename);
            protocolSignal.setProtocolType(protocolType);
            this.protocolSignalService.updateProtocolSignal(protocolSignal);
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("updateBigdataStorage", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }



}
