package com.macrosoft.service.impl;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.ReportUtility;
import com.macrosoft.model.AgentConfig;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.service.*;
import com.macrosoft.urs.UrsServiceApis;
import com.macrosoft.utilities.ExportExecutionUtility;
import com.macrosoft.utilities.StringUtility;
import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.ServletContext;
import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Service
public class ExportToWordServiceImpl implements ExportToWordService {

    private ProjectService mProjectService;
    private ScriptService mScriptService;
    private ScriptLinkService mScriptLinkService;
    private AgentConfigService mAgentConfigService;
    private UrsConfigurationImpl ursConfig;

    private ExecutionStatusService mExecutionStatusService;
    private ExecutionResultService mExecutionResultService;

    @Autowired
    ServletContext context;

    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

    @Autowired(required = true)
    public void setAgentConfigService(AgentConfigService ps) {
        this.mAgentConfigService = ps;
    }

    @Autowired(required = true)
    public void setProjectService(ProjectService ps) {
        this.mProjectService = ps;
    }

    @Autowired(required = true)
    public void setScriptService(ScriptService scriptService) {
        this.mScriptService = scriptService;
    }

    @Autowired(required = true)
    public void setScriptLinkService(ScriptLinkService scriptLinkService) {
        this.mScriptLinkService = scriptLinkService;
    }

    @Autowired(required = true)
    public void setExecutionResultService(ExecutionResultService executionResultService) {
        this.mExecutionResultService = executionResultService;
    }

    @Autowired(required = true)
    public void setExecutionStatusService(ExecutionStatusService ps) {
        this.mExecutionStatusService = ps;
    }


    public String exportToWord(String executionId) {
        try {
            ExecutionStatus status = this.mExecutionStatusService.getExecutionStatusByExecutionId(executionId);
            if (status == null || status.getTestsetId() == null) {
                return null;
            }
            String getAllAgentTypeListUrl = String.format(UrsServiceApis.GetAllAgentTypeList, ursConfig.getIpAddress());

            RestTemplate restTemplate = new RestTemplate();
            JSONObject agentTypeListJson = restTemplate.getForObject(getAllAgentTypeListUrl, JSONObject.class, 2);
            List<AgentConfig> agentConfigs = this.mAgentConfigService.getAgentConfigByProjectId(status.getProjectId());
            ExportExecutionResultParser.setAgentInstances(agentConfigs);
            ExportExecutionResultParser.setAgentTypeDefinitions(agentTypeListJson);
            restTemplate = new RestTemplate();
            String getEngineCmdsUrl = String.format(UrsServiceApis.GetEngineCmds, ursConfig.getIpAddress());
            ArrayList getEngineCmdsJson = restTemplate.getForObject(getEngineCmdsUrl, ArrayList.class, 2);
            ExportExecutionResultParser.setEngineCmds(getEngineCmdsJson);
            String fileName = String.format("Execution_%s_%s.docx", status.getExecutionName(), StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
            fileName = fileName.replace(":", "_");
            fileName = fileName.replace(" ", "_");
            fileName = fileName.replace("-", "_");

            File destinationFile = new File(ReportUtility.GetDownloadPath(context, fileName));
            ReportUtility.CreateFolderIfNotExist(context);
            List<ExecutionResultInfo> resultInfo = this.mExecutionResultService.listExecutionResultInfosAfterFromId(executionId, 0);
            //对resultinfo进行遍历,获取字段indexId值,将indexId字符串中包含一个"-"的保存下来,其他的去除
            for (Iterator<ExecutionResultInfo> iterator = resultInfo.iterator(); iterator.hasNext();) {
                ExecutionResultInfo executionResultInfo = iterator.next();
                String indexId = executionResultInfo.getIndexId();
                // 先检查是否包含"-"
                if (indexId != null &&indexId.contains("-")) {
                    // 由于已经知道包含"-"，可以直接检查分割后的数组长度
                    String[] parts = indexId.split("-");
                    if (parts.length != 2) {
                        iterator.remove(); // 使用迭代器的remove方法来移除元素
                    }
                }
            }
            boolean result = ExportExecutionUtility.export(destinationFile.getAbsolutePath(),
                    this.mProjectService, this.mScriptService, this.mScriptLinkService,
                    status, resultInfo);
            //绝对路径
            String absolutePath = destinationFile.toString();
            return absolutePath;
        } catch (Exception ex) {
            return null;
        }
    }
    public static String fileName(String absolutePath) {
        //获取文件的绝对路径
        String fileName = absolutePath.substring(absolutePath.lastIndexOf("\\") + 1);
        return fileName;
    }

}
