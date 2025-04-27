package com.macrosoft.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrosoft.controller.dto.ProtocolSignalInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ProtocolSignal;
import com.macrosoft.service.ProtocolSignalService;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.StringUtility;
import com.macrosoftsys.convertorMgr.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 协议信号操作的控制器，负责处理协议信号的获取、上传和删除等操作。
 */
@RestController
@RequestMapping("/api/protocolSignal")
@RequiredArgsConstructor
public class ProtocolSignalController {

    private static final ILogger logger = LoggerFactory.Create(ProtocolSignalController.class.getName());
    private final ProtocolSignalService protocolSignalService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 根据协议信号ID获取协议，从bigdata中提取协议JSON节点。
     *
     * @param protocolSignalId 协议信号的ID。
     * @return 包含协议JSON字符串的ApiResponse，或错误响应。
     */
    @GetMapping("/get/{protocolSignalId}")
    public ApiResponse<String> getProtocol(@PathVariable String protocolSignalId) {
        try {
            ProtocolSignal result = protocolSignalService.getProtocol(protocolSignalId);
            JsonNode jsonNode = objectMapper.readTree(result.getBigdata());
            JsonNode protocolNode = jsonNode.get("protocol");
            if (protocolNode == null) {
                return new ApiResponse<>(ApiResponse.UnHandleException, null);
            }
            return new ApiResponse<>(ApiResponse.Success, objectMapper.writeValueAsString(protocolNode));
        } catch (Exception ex) {
            logger.error("getProtocol", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 上传协议信号文件并保存到系统中。
     *
     * @param dataType     数据类型。
     * @param protocolType 协议类型。
     * @param inputFile    上传的文件。
     * @return 包含ProtocolSignalInfo的ApiResponse，或错误响应。
     */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ApiResponse<ProtocolSignalInfo> uploadProtocolSignal(
            @RequestParam String dataType,
            @RequestParam String protocolType,
            @RequestParam MultipartFile inputFile) {
        try {
            if (protocolSignalService.isOverMaxProtocolSignalNum(Long.parseLong(TenantContext.getOrgId()), dataType)) {
                ProtocolSignalInfo info = new ProtocolSignalInfo();
                info.setMessages("OVER_MAX_PROTOCOLSIGNAL_NUM");
                return new ApiResponse<>(ApiResponse.UnHandleException, info);
            }
            if (inputFile.isEmpty()) {
                return new ApiResponse<>(ApiResponse.UnHandleException, null);
            }

            // 将文件保存到临时文件夹
            String originalFilename = inputFile.getOriginalFilename();
            String folderPath = protocolSignalService.resolveProtocolSignalFolderPath();
            String id = UUID.randomUUID().toString();
            String filePath = folderPath + File.separator + id;
            File destinationFile = new File(filePath);
            destinationFile.getParentFile().mkdirs();
            inputFile.transferTo(destinationFile);

            logger.info(String.format("文件上传成功: %s 到 %s", originalFilename, filePath));

            // 创建并保存协议信号
            ProtocolSignal protocolSignal = new ProtocolSignal();
            protocolSignal.setOrganizationId(StringUtility.parseLongSafely(TenantContext.getOrgId()).getResult());
            protocolSignal.setId(id);
            protocolSignal.setFileName(originalFilename);
            protocolSignal.setDataType(dataType);
            protocolSignal.setProtocolType(protocolType);
            protocolSignal.setBigdata(FileUtility.readLineByLineJava8(filePath));
            protocolSignal.setCreatedAt(new Date());

            protocolSignalService.addProtocolSignal(protocolSignal);
            return new ApiResponse<>(ApiResponse.Success, new ProtocolSignalInfo(protocolSignal));
        } catch (Exception ex) {
            logger.error("uploadProtocolSignal", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 导入信号定义文件并作为协议信号处理。
     *
     * @param inputFile 上传的文件。
     * @return 包含ProtocolSignalInfo的ApiResponse，或错误响应。
     */
    @PostMapping(value = "/importSignalDefination", consumes = "multipart/form-data")
    public ApiResponse<ProtocolSignalInfo> importSignalDefination(@RequestParam MultipartFile inputFile) {
        try {
            ProtocolSignalInfo protocolSignal = new ProtocolSignalInfo();
            protocolSignal.setDataType("SignalProtocol");
            protocolSignalService.insertProtocolSignalByProtocolType(protocolSignal, inputFile);
            return new ApiResponse<>(ApiResponse.Success, protocolSignal);
        } catch (Exception ex) {
            logger.error("importSignalDefination", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 导入协议定义文件并作为协议信号处理。
     *
     * @param inputFile 上传的文件。
     * @return 包含ProtocolSignalInfo的ApiResponse，或错误响应。
     */
    @PostMapping(value = "/importProtocolDefination", consumes = "multipart/form-data")
    public ApiResponse<ProtocolSignalInfo> importProtocolDefination(@RequestParam MultipartFile inputFile) {
        try {
            ProtocolSignalInfo protocolSignal = new ProtocolSignalInfo();
            protocolSignal.setDataType("GenericBusFrame");
            protocolSignalService.insertProtocolSignalByProtocolType(protocolSignal, inputFile);
            return new ApiResponse<>(ApiResponse.Success, protocolSignal);
        } catch (Exception ex) {
            logger.error("importProtocolDefination", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据数据类型和协议类型获取协议信号。
     *
     * @param dataType     数据类型。
     * @param protocolType 协议类型。
     * @return 包含ProtocolSignalInfo列表的ApiResponse，或错误响应。
     */
    @GetMapping("/{dataType}/{protocolType}")
    public ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalInfosByProtocolType(
            @PathVariable String dataType,
            @PathVariable String protocolType) {
        try {
            long orgId = StringUtility.parseLongSafely(TenantContext.getOrgId()).getResult();
            List<ProtocolSignalInfo> infos = protocolSignalService.listProtocolSignalInfosByProtocolType(dataType, protocolType, orgId);
            return new ApiResponse<>(ApiResponse.Success, infos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalInfosByProtocolType", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据数据类型、协议类型和项目ID获取协议信号。
     *
     * @param dataType     数据类型。
     * @param protocolType 协议类型。
     * @param projectId    项目ID。
     * @return 包含ProtocolSignalInfo列表的ApiResponse，或错误响应。
     */
    @GetMapping("/{dataType}/{protocolType}/{projectId}")
    public ApiResponse<List<ProtocolSignalInfo>> getProtocolsByProtocolTypeAndProjectId(
            @PathVariable String dataType,
            @PathVariable String protocolType,
            @PathVariable Integer projectId) {
        try {
            long orgId = StringUtility.parseLongSafely(TenantContext.getOrgId()).getResult();
            List<ProtocolSignalInfo> infos = protocolSignalService.listProtocolSignalInfosByProtocolTypeAndProjectId(dataType, protocolType, orgId, projectId);
            return new ApiResponse<>(ApiResponse.Success, infos);
        } catch (Exception ex) {
            logger.error("getProtocolsByProtocolTypeAndProjectId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据数据类型和项目ID获取公开的协议信号。
     *
     * @param dataType  数据类型。
     * @param projectId 项目ID。
     * @return 包含ProtocolSignalInfo列表的ApiResponse，或错误响应。
     */
    @GetMapping("/public/{dataType}/{projectId}")
    public ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalsByProjectIdAndPublic(
            @PathVariable String dataType,
            @PathVariable Integer projectId) {
        try {
            long orgId = StringUtility.parseLongSafely(TenantContext.getOrgId()).getResult();
            List<ProtocolSignalInfo> infos = protocolSignalService.listProtocolSignalInfosByProjectIdAndPublic(dataType, projectId, orgId);
            return new ApiResponse<>(ApiResponse.Success, infos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalsByProjectIdAndPublic", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据数据类型获取组织内的协议信号。
     *
     * @param fileType 数据类型。
     * @return 包含ProtocolSignalInfo列表的ApiResponse，或错误响应。
     */
    @GetMapping("/list/{fileType}")
    public ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalInfos(@PathVariable String fileType) {
        try {
            long orgId = StringUtility.parseLongSafely(TenantContext.getOrgId()).getResult();
            logger.info(String.format("/api/protocolSignal/list/%s, orgId: %s", fileType, orgId));
            List<ProtocolSignalInfo> infos = protocolSignalService.listProtocolSignalInfosByOrg(fileType, orgId);
            return new ApiResponse<>(ApiResponse.Success, infos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalInfos", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据数据类型和项目ID获取协议信号。
     *
     * @param fileType  数据类型。
     * @param projectId 项目ID。
     * @return 包含ProtocolSignalInfo列表的ApiResponse，或错误响应。
     */
    @GetMapping("/list/{fileType}/{projectId}")
    public ApiResponse<List<ProtocolSignalInfo>> getProtocolSignalInfos(
            @PathVariable String fileType,
            @PathVariable String projectId) {
        try {
            List<ProtocolSignalInfo> infos = protocolSignalService.listProtocolSignalInfos(fileType, projectId);
            return new ApiResponse<>(ApiResponse.Success, infos);
        } catch (Exception ex) {
            logger.error("getProtocolSignalInfos", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据ID删除协议信号。
     *
     * @param id 协议信号的ID。
     * @return 指示删除成功或失败的ApiResponse。
     */
    @PostMapping("/delete/{id}")
    public ApiResponse<Boolean> deleteProtocolSignal(@PathVariable String id) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteProtocolSignal");
            protocolSignalService.removeProtocolSignal(id);
            return new ApiResponse<>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("deleteProtocolSignal", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, false);
        }
    }

    /**
     * 根据ID获取协议信号及其概览。
     *
     * @param protocolSignalId 协议信号的ID。
     * @return 包含ProtocolSignal的ApiResponse，或错误响应。
     */
    @GetMapping("/get-overview/{protocolSignalId}")
    public ApiResponse<ProtocolSignal> getProtocolSignalWithOverview(@PathVariable String protocolSignalId) {
        try {
            ProtocolSignal result = protocolSignalService.resolveProtocolSignalWithOverview(protocolSignalId);
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getProtocolSignalWithOverview", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 使用新文件更新协议信号的bigdata存储。
     *
     * @param id 协议信号的ID。
     * @param inputFile        上传的文件。
     * @param protocolType     协议类型。
     * @return 指示更新成功或失败的ApiResponse。
     */
    @PostMapping(value = "/update", consumes = "multipart/form-data")
    public ApiResponse<Boolean> updateBigdataStorage(
            @RequestParam String id,
            @RequestParam MultipartFile inputFile,
            @RequestParam String protocolType) {
        if (inputFile.isEmpty()) {
            return new ApiResponse<>(ApiResponse.UnHandleException, false);
        }
        try {
            // 将文件保存到临时文件夹
            String originalFilename = inputFile.getOriginalFilename();
            String folderPath = protocolSignalService.resolveProtocolSignalFolderPath();
            String newId = UUID.randomUUID().toString();
            String filePath = folderPath + File.separator + newId;
            File destinationFile = new File(filePath);
            destinationFile.getParentFile().mkdirs();
            inputFile.transferTo(destinationFile);

            logger.info(String.format("文件更新成功: %s 到 %s", originalFilename, filePath));

            // 更新协议信号
            ProtocolSignal protocolSignal = protocolSignalService.getProtocol(id);
            protocolSignal.setBigdata(FileUtility.readLineByLineJava8(filePath));
            protocolSignal.setFileName(originalFilename);
            protocolSignal.setProtocolType(protocolType);
            protocolSignalService.updateProtocolSignal(protocolSignal);
            return new ApiResponse<>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("updateBigdataStorage", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, false);
        }
    }

    /**
     * 导入DBC协议文件并作为协议信号处理。
     *
     * @param dbcFile 上传的DBC文件。
     * @return 包含ProtocolSignalInfo的ApiResponse，或错误响应。
     */
    @PostMapping(value = "/importDbcProtocol", consumes = "multipart/form-data")
    public ApiResponse<List<ProtocolSignalInfo>> importDbcProtocol(@RequestParam MultipartFile dbcFile) {
        if (dbcFile.isEmpty()) {
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
        try {
            // 将文件保存到临时文件夹
            String originalFilename = dbcFile.getOriginalFilename();
            String folderPath = protocolSignalService.resolveProtocolSignalFolderPath();
            String id = UUID.randomUUID().toString();
            String filePath = folderPath + File.separator + id;
            File destinationFile = new File(filePath);
            destinationFile.getParentFile().mkdirs();
            dbcFile.transferTo(destinationFile);

            logger.info(String.format("DBC文件上传成功: %s 到 %s", originalFilename, filePath));

            // 解析DBC文件
            List<ProtocolSignal> protocolSignals = protocolSignalService.parseDbcFile(originalFilename);
            if (protocolSignals.isEmpty()) {
                return new ApiResponse<>(ApiResponse.UnHandleException, null);
            }

            // 保存解析后的协议信号
            List<ProtocolSignalInfo> protocolSignalInfos = new ArrayList<>();
            for (ProtocolSignal protocolSignal : protocolSignals) {
                protocolSignal.setOrganizationId(StringUtility.parseLongSafely(TenantContext.getOrgId()).getResult());
                protocolSignal.setId(UUID.randomUUID().toString());
                protocolSignal.setFileName(originalFilename);
                protocolSignal.setProtocolType("DBC"); // 根据实际情况设置协议类型
                protocolSignal.setCreatedAt(new Date());
                protocolSignalService.addProtocolSignal(protocolSignal);

                // 转换为 ProtocolSignalInfo 并添加到列表
                protocolSignalInfos.add(new ProtocolSignalInfo(protocolSignal));
            }

            // 返回所有保存的协议信号信息
            return new ApiResponse<>(ApiResponse.Success, protocolSignalInfos);
        } catch (Exception ex) {
            logger.error("importDbcProtocol", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 获取支持的协议类型。
     *
     * @return 包含支持协议类型的ApiResponse，或错误响应。
     */
    @GetMapping("/supportedProtocolTypes")
    public ApiResponse<List<String>> getSupportedProtocolTypes() {
        try {
            ConvertorMgr convertorMgr = new ConvertorMgr();
            ExtNameVector extNameVector = new ExtNameVector();

            // 获取支持的协议类型
            convertorMgr.getAllSupportExtNames(ConvertorType.PROTOCOL_CONVERTOR, extNameVector);

            // 将结果转换为列表
            List<String> supportedProtocols = new ArrayList<>();
            for (int i = 0; i < extNameVector.size(); i++) {
                supportedProtocols.add(extNameVector.get(i));
            }

            return new ApiResponse<>(ApiResponse.Success, supportedProtocols);
        } catch (Exception ex) {
            logger.error("getSupportedProtocolTypes", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

}