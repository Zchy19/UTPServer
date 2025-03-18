package com.macrosoft.job;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.macrosoft.controller.dto.PreprocessExecutionParameter;
import com.macrosoft.master.MasterServiceHolder;
import com.macrosoft.urs.IpAddress;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import org.json.JSONArray;
import org.json.JSONObject;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.web.client.RestTemplate;

import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.Project;
import com.macrosoft.model.ScriptLink;
import com.macrosoft.model.SelectAntbotWraper;
import com.macrosoft.model.TestSet;
import com.macrosoft.model.TestsetExecutionTrigger;
import com.macrosoft.urs.UrsServiceApis;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineController;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotDictionary;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotInfo;
import com.macrosoft.utp.adatper.utpengine.dto.ScriptAntbotInfo;

public class TestsetExecutionJob implements Job {
    private static final ILogger logger = LoggerFactory.Create(TestsetExecutionJob.class.getName());

    public void execute(JobExecutionContext context) throws JobExecutionException {

        String executionId = UUID.randomUUID().toString();

        try {
            JobDataMap jobDataMap = context.getJobDetail().getJobDataMap();
            TestsetExecutionTrigger trigger = (TestsetExecutionTrigger) jobDataMap.get("triggerObject");
            TestExectuionJobServicesWraper servicesWraper = (TestExectuionJobServicesWraper) jobDataMap.get("servicesWraper");
            long tenantId = (Long) jobDataMap.get("tenantId");
//            long tenantId = MasterServiceHolder.getMasterService().resolveTenantId(orgId);
            TenantContext.setTenantId(Long.toString(tenantId));
            logger.info(String.format("TestsetExecutionJob executed with triggerId : %s, testsetId: %s, tenantId: %s  ", trigger.getId(), trigger.getTestsetId(), tenantId));
            logger.info(String.format("try get testset..."));
            TestSet testset = servicesWraper.testSetService.getTestSetById(trigger.getProjectId(), trigger.getTestsetId());
            if (testset == null) return;
            logger.info(String.format("try get project..."));
            Project project = servicesWraper.projectService.getProjectById(testset.getProjectId());
            TenantContext.setOrgId(String.valueOf(project.getOrganizationId()));
            if (project == null) return;

            logger.info(String.format("try get urs..."));

            if (servicesWraper.ursConfig == null) {
                logger.info(String.format("ursConfig is null"));
            }
            //获取UTP执行器地址
            List<IpAddress> ursEngineStatuses = servicesWraper.utpEngineControllerManager.getUrsEngineStatuses(servicesWraper.ursConfig.getIpAddress(),project.getOrganizationId(), trigger.getUserName());
            logger.info(String.format("ursEngineStatuses: %s", ursEngineStatuses));
            if (ursEngineStatuses == null || ursEngineStatuses.size() == 0) {
                logger.info(String.format("Urs ip address returns result : false"));
                return;
            }
            //根据engineName匹配执行器
            IpAddress trueEngine = servicesWraper.utpEngineControllerManager.MatchedEngine(ursEngineStatuses, testset.getEngineName());
            logger.info(String.format("ursEngine: %s", trueEngine));
            if (trueEngine == null) {
                logger.info(String.format("ursEngine is null"));
                return;
            }
            Long port = trueEngine.getPort();
            String ipAddress = trueEngine.getIpAddress();

            // Step1: pre-process to execute testset.
            String executionName = "Auto Execution";
            String executedByUserId =trigger.getUserName();
            long projectId = trigger.getProjectId();
            long testsetId = trigger.getTestsetId();
            List<ScriptLink> scriptLinks = servicesWraper.scriptLinkService.listScriptLinksByTestsetId(projectId, testsetId);
            List<ScriptLink> scriptLinksForTestSet = new ArrayList<ScriptLink>();
            for (ScriptLink scriptLink : scriptLinks) {
                scriptLinksForTestSet.add(scriptLink);
            }
            PreprocessExecutionParameter startParameter = new PreprocessExecutionParameter();
            long[] scriptIds = new long[scriptLinksForTestSet.size()];
            for (int i = 0; i < scriptLinksForTestSet.size(); i++) {
                ExecutionTestCaseResult testCaseResult = new ExecutionTestCaseResult();
                testCaseResult.setExecutionId(executionId);
                testCaseResult.setResult(ExecutionTestCaseResult.None);
                testCaseResult.setScriptId(scriptLinksForTestSet.get(i).getScriptId());
                testCaseResult.setExecutedByUserId(executedByUserId);
                //将scriptLink.getScriptId()添加到scriptIds中
                scriptIds[i] = scriptLinksForTestSet.get(i).getScriptId();
                servicesWraper.executionTestCaseResultService.addExecutionTestCaseResult(testCaseResult);
            }
            startParameter.setIsDummyRun(false);
            startParameter.setExecutionId(executionId);
            startParameter.setExecutionName(executionName);
            startParameter.setTestObject("");
            startParameter.setProjectId(project.getId());
            startParameter.setDomainId(project.getOrganizationId());
            startParameter.setScriptGroupId(String.valueOf(testset.getId()));
            startParameter.setUtpCoreIpAddress(ipAddress);
            startParameter.setUtpCorePort(port);
            startParameter.setScriptIds(scriptIds);
            startParameter.setIsMonitordataPersistence(false);
//            startParameter.setIsTeststepsPersistence(true);
            startParameter.setIsSend(false);
            startParameter.setIsSendEmail(true);
            startParameter.setEmailAddress(executedByUserId);
            startParameter.setExecutedByUserId(executedByUserId);
            startParameter.setRecoverSubscriptReferenceId(0);
            startParameter.setIsAutoRun(true);
            startParameter.setIsTestcaseCollect(true);
            startParameter.setIsTestcasePersist(true);
            startParameter.setIsTeststepCollect(true);
            startParameter.setIsTeststepPersist(true);
            startParameter.setIsTestdataCollect(true);
            startParameter.setIsTestdataPersist(true);
            startParameter.setEngineName(testset.getEngineName());
            startParameter.setTransformConfig("[{\"commuPath\":\"server\",\"dataTypes\":[]},{\"commuPath\":\"client\",\"dataTypes\":[{\"dataType\":\"executiondata\",\"transparentData\":\"NoEntrepotSaveDatabase\"},{\"dataType\":\"excutionresult\",\"transparentData\":\"NoEntrepotSaveDatabase\"}]}]");
            servicesWraper.executionService.prepareExecutionByScripts(startParameter);
//            servicesWraper.executionService.prepareAutoExecutionTestset(executionId, executionName, "", executedByUserId, testset.getProjectId(), Long.toString(testsetId), Long.toString(project.getOrganizationId()), ipAddress, port, -1,true);
//
//            ExecutionModel executioModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
//            // Step2: check if meet auto execution condition.
//            List<ScriptAntbotInfo> antbotInfos = executioModel.getAntbotsDefinedInScript();
//            for (ScriptAntbotInfo antbotInfo : antbotInfos) {
//                logger.info(String.format("%s Script contains antbotName:%s ", executionId, antbotInfo.getAntbotName()));
//            }
//            List<LiveAntbotDictionary> liveAntbotDictionaryList = executioModel.getLiveAntbotDictionarys();
//            String selectedTargetObjectId = null;
//            List<SelectAntbotWraper> selectedLiveAntbotInfo = new ArrayList<SelectAntbotWraper>();
//            for (LiveAntbotDictionary liveAntbotDictionary : liveAntbotDictionaryList) {
//                boolean allAntbotFound = true;
//                for (ScriptAntbotInfo antbotInfo : antbotInfos) {
//                    boolean foundAntbotCandidator = false;
//                    List<LiveAntbotInfo> liveAntbotInfos = liveAntbotDictionary.getAntbotInfos();
//                    for (LiveAntbotInfo liveAntbotInfo : liveAntbotInfos) {
//                        if (antbotInfo.getAntbotName().compareToIgnoreCase(liveAntbotInfo.getAntbotName()) == 0) {
//                            foundAntbotCandidator = true;
//                            SelectAntbotWraper selectedAntbotWraper = new SelectAntbotWraper();
//                            selectedAntbotWraper.setLiveAntbotInfo(liveAntbotInfo);
//                            selectedAntbotWraper.setScriptAntbotName(antbotInfo.getAntbotName());
//                            selectedLiveAntbotInfo.add(selectedAntbotWraper);
//                        }
//                    }
//
//                    if (!foundAntbotCandidator) {
//                        allAntbotFound = false;
//                        selectedLiveAntbotInfo.clear();
//                        break;
//                    }
//                }
//
//                if (allAntbotFound) {
//                    selectedTargetObjectId = liveAntbotDictionary.getTargetObjectId();
//                    break;
//                }
//            }
//
//            if (selectedTargetObjectId == null || selectedLiveAntbotInfo.size() == 0) {
//                logger.info(String.format("No avaiable live antbot found for Auto execution: executionId:%s", executionId));
//
//                UtpEngineController utpEngineController = servicesWraper.utpEngineControllerManager.GetEngineController(executionId);
//                if (utpEngineController != null) {
//                    // release engine resource if no available antbot found.
//                    utpEngineController.tryReleaseEngine();
//                }
//                return;
//            }
//
//            // Step3: start execution
//            StartExecutionParameter startExecutionParameter = new StartExecutionParameter();
//            startExecutionParameter.setExecutionId(executionId);
//            List<SelectedAntbotMapping> selectedAntbotMapping = new ArrayList<SelectedAntbotMapping>();
//            for (SelectAntbotWraper selectedAntbotWapper : selectedLiveAntbotInfo) {
//                SelectedAntbotMapping mapping = new SelectedAntbotMapping();
//                mapping.setAntbotInstanceId(selectedAntbotWapper.getLiveAntbotInfo().getAntbotId());
//                mapping.setAntbotName(selectedAntbotWapper.getScriptAntbotName());
//                selectedAntbotMapping.add(mapping);
//            }
//            startExecutionParameter.setSelectedAntbotMapping(selectedAntbotMapping);
//
//            logger.info(String.format("startExecution - executionId:%s", startExecutionParameter.getExecutionId()));
//            List<SelectedAntbotMapping> mappings = startExecutionParameter.getSelectedAntbotMapping();
//            for (int i = 0; i < mappings.size(); i++) {
//                logger.info(String.format("%s startExecution - selectedAntbotId:%s selectedAntbotName: %s", executionId, mappings.get(i).getAntbotInstanceId(), mappings.get(i).getAntbotName()));
//            }
//
//            servicesWraper.executionService.startExecution(startExecutionParameter);
        } catch (Exception ex) {
            logger.error(String.format(" %s TestsetExecutionJob execution has exception happen : %s", executionId, ex.toString()));
        }
    }

}