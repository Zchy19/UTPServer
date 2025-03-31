package com.macrosoft.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.master.MasterServiceHolder;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.service.*;
import com.macrosoft.urs.UrsServiceApis;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.SerializationUtility;
import com.macrosoft.utilities.SystemUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Controller
public class ProjectController {
    private static final ILogger logger = LoggerFactory.Create(ProjectController.class.getName());
    private ProjectService mProjectService;
    private ScriptGroupService mScriptGroupService;
    private ExecutionStatusService mExecutionStatusService;
    private SpecialTestService mSpecialTestService;
    private SpecialTestDataService mSpecialTestDataService;

    @Autowired

    public void setSpecialTestDataService(SpecialTestDataService specialTestDataService) {
        this.mSpecialTestDataService = specialTestDataService;
    }

    @Autowired

    public void setSpecialTestService(SpecialTestService specialTestService) {
        this.mSpecialTestService = specialTestService;
    }

    @Autowired
    ServletContext context;
    private ScriptService mScriptService;
    private SubscriptReferenceService subscriptReferenceService;

    @Autowired(required = true)

    public void setProjectService(ProjectService ps) {
        this.mProjectService = ps;
    }

    @Autowired(required = true)

    public void setScriptGroupService(ScriptGroupService scriptGroupService) {
        this.mScriptGroupService = scriptGroupService;
    }

    @Autowired(required = true)

    public void setScriptService(ScriptService scriptService) {
        this.mScriptService = scriptService;
    }


    @Autowired(required = true)

    public void setSubscriptReferenceService(SubscriptReferenceService subscriptReferenceService) {
        this.subscriptReferenceService = subscriptReferenceService;
    }

    @Autowired(required = true)

    public void setExecutionStatusService(ExecutionStatusService ps) {
        this.mExecutionStatusService = ps;
    }


    @RequestMapping(value = "/api/org/projects/{orgId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProjectInfo>> getAllProjectsByOrgId(@PathVariable("orgId") long orgId) {
        try {
            String orgIdValue = Long.toString(orgId);
            List<Project> projects = this.mProjectService.listProjects(orgIdValue);
            List<ProjectInfo> projectInfos = ProjectInfoConverter.ConvertToProjectInfo(projects);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.Success, projectInfos);
        } catch (Exception ex) {
            logger.error("getAllProjectsByOrgId", ex);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/org/projects", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProjectInfo>> getAllProjects() {
        try {

            List<Project> projects = this.mProjectService.getAllProjects();
            List<ProjectInfo> projectInfos = ProjectInfoConverter.ConvertToProjectInfo(projects);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.Success, projectInfos);

        } catch (Exception ex) {
            logger.error("getAllProjects", ex);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/project/create", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProjectInfo> createProject(@RequestBody ProjectInfo projectInfo) {
        try {
            boolean isOverMaxProjectNum = this.mProjectService.isOverMaxProjectNum(projectInfo.getOrganizationId(), "utpserver", "utpserver.project.count");
            if (isOverMaxProjectNum) {
                projectInfo.setErrorMessages("OVER_MAX_PROJECT_NUM");
                return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, projectInfo);
            }
            Project project = ProjectInfoConverter.ConvertToProject(projectInfo);
            this.mProjectService.addProject(project);
            projectInfo.setId(project.getId());
            return new ApiResponse<ProjectInfo>(ApiResponse.Success, projectInfo);
        } catch (Exception ex) {
            logger.error("createProjectNew", ex);
            return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/project/update", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProjectInfo> updateProject(@RequestBody ProjectInfo projectInfo) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateProject");
            Project project = ProjectInfoConverter.ConvertToProject(projectInfo);
            this.mProjectService.updateProject(project);
            return new ApiResponse<ProjectInfo>(ApiResponse.Success, projectInfo);
        } catch (Exception ex) {
            logger.error("editProjectNew", ex);
            return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, null);
        }
    }

    private UrsConfigurationImpl ursConfig;

    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

    @RequestMapping(value = "/api/project/updateProjectTemplateType/{orgId}", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> updateProjectTemplateType(@RequestBody String[] projectNames, @PathVariable("orgId") long orgId) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateProject");
            //urs获取示例example账号的组织id
            long exampleOrgId = getExampleOrgId();
            for (String projectName : projectNames) {
                List<Project> project = this.mProjectService.listProjectByProjectName(orgId, projectName);
                if (project.size() == 1) {
                    //设置模板类型为1,表示是示例模板
                    project.get(0).setOrganizationId(exampleOrgId);
                    project.get(0).setTemplateType(1);
                    this.mProjectService.updateProject(project.get(0));
                } else {
                    return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
                }
            }
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("updateProject", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }


    @RequestMapping(value = "/api/project/customizedScriptFields/update", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> updateProjectCustomizedScriptFields(@RequestBody ProjectCustomizedScriptFields param) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateProjectCustomizedScriptFields");

            this.mProjectService.updateCustomizedScriptFields(param.getProjectId(), param.getCustomizedScriptFields());
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("updateProjectCustomizedScriptFields", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }


    @RequestMapping(value = "/api/project/customizedReqFields/update", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> updateProjectCustomizedReqFields(@RequestBody ProjectCustomizedReqFields param) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "updateProjectCustomizedReqFields");

            this.mProjectService.updateCustomizedReqFields(param.getProjectId(), param.getCustomizedReqFields());
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("updateProjectCustomizedReqFields", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }

    @RequestMapping(value = "/api/project/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ProjectInfo> getProject(@PathVariable("projectId") String projectId) {
        try {
            long projectIdValue = Long.parseLong(projectId);
            Project project = this.mProjectService.getProjectById(projectIdValue);
            ProjectInfo projectInfo = ProjectInfoConverter.ConvertToProjectInfo(project);
            return new ApiResponse<ProjectInfo>(ApiResponse.Success, projectInfo);
        } catch (Exception ex) {
            logger.error("getProjectNew", ex);
            return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/project/getByOrgId/{orgId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProjectInfo>> getByOrgId(@PathVariable("orgId") long orgId) {
        try {
            List<Project> projects = this.mProjectService.listProjects(Long.toString(orgId));
            List<ProjectInfo> projectInfos = ProjectInfoConverter.ConvertToProjectInfo(projects);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.Success, projectInfos);
        } catch (Exception ex) {
            logger.error("getByOrgId", ex);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/project/data/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ProjectFullData> getProjectFullData(@PathVariable("projectId") long projectId) {
        logger.info("getProjectFullData start ...");
        try {
            ProjectFullData projectFullData = this.mProjectService.getProjectFullData(projectId);
            return new ApiResponse<ProjectFullData>(ApiResponse.Success, projectFullData);
        } catch (Exception ex) {
            logger.error("getProjectFullData", ex);
            return new ApiResponse<ProjectFullData>(ApiResponse.UnHandleException, null);
        } finally {
            logger.info("getProjectFullData end ...");
        }
    }

    @RequestMapping(value = "/api/scriptgroup/scriptdata/getByProjectId/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ProjectScriptGroupsData> getScriptGroupDataOnlyScript(
            @PathVariable("projectId") long projectId) {
        try {
            ProjectScriptGroupsData projectScriptGroupsData = this.mProjectService.getScriptGroupDataOnlyScript(projectId);
            return new ApiResponse<ProjectScriptGroupsData>(ApiResponse.Success, projectScriptGroupsData);
        } catch (Exception ex) {
            logger.error(String.format("getScriptGroupDataOnlyScript has exception - :%s", ex.toString()));
            return new ApiResponse<ProjectScriptGroupsData>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/scriptgroup/subscriptdata/getByProjectId/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ProjectScriptGroupsData> getScriptGroupDataOnlySubScript(
            @PathVariable("projectId") long projectId) {
        try {
            ProjectScriptGroupsData projectScriptGroupsData = this.mProjectService.getScriptGroupDataOnlySubScript(projectId);
            return new ApiResponse<ProjectScriptGroupsData>(ApiResponse.Success, projectScriptGroupsData);
        } catch (Exception ex) {
            logger.error("getScriptGroupDataOnlySubScript", ex);
            return new ApiResponse<ProjectScriptGroupsData>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/scriptgroup/recoverdata/getByProjectId/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<ProjectScriptGroupsData> getScriptGroupDataForRecover(
            @PathVariable("projectId") long projectId) {

        try {
            ProjectScriptGroupsData projectScriptGroupsData = this.mProjectService.getScriptGroupDataForRecover(projectId);
            return new ApiResponse<ProjectScriptGroupsData>(ApiResponse.Success, projectScriptGroupsData);
        } catch (Exception ex) {
            logger.error("getScriptGroupDataForRecover", ex);
            return new ApiResponse<ProjectScriptGroupsData>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/project/delete/{projectId}", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> deleteProjectNew(@PathVariable("projectId") long projectId) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteProjectNew");
            //根据projectId删除execution
            List<ExecutionStatusWithResult> executionStatus = this.mExecutionStatusService.getExecutionStatusByProjectId(projectId);
            if (executionStatus != null && executionStatus.size() > 0) {
                for (int i = 0; i < executionStatus.size(); i++) {
                    String executionId = executionStatus.get(i).getExecutionId();
                    this.mExecutionStatusService.removeExecutionData(executionId);
                }
            }
            //根据project查询所有的specialTest
            List<SpecialTest> specialTests = this.mSpecialTestService.listSpecialTestsByProjectId(projectId);
            if (specialTests != null && specialTests.size() > 0) {
                for (int i = 0; i < specialTests.size(); i++) {
                    long specialTestId = specialTests.get(i).getId();
                    this.mSpecialTestDataService.removeSpecialTestDataBySpecialTestId(specialTestId);
                }
            }

            this.mProjectService.removeProject(projectId);
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("deleteProjectNew", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }

    @RequestMapping(value = "/deleteAllProjectBelongOrgId", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<Boolean> deleteAllProjectBelongOrgId(@RequestParam("targetOrgId") int targetOrgId) {
        String orgId = targetOrgId + "";
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteAllProjectBelongOrgId");
            List<Project> projects = this.mProjectService.listProjects(orgId);
            for (Project project :
                    projects) {
                this.mProjectService.removeProject(project.getId());
            }
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("deleteAllProjectBelongOrgId", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }

    }

    @RequestMapping(value = "/api/project/setTemplate/{projectId}/{templateType}", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> setTemplate(@PathVariable("projectId") long projectId,
                                                          @PathVariable("templateType") int templateType) {
        try {
            this.mProjectService.setTemplate(projectId, templateType);
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("setTemplate", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        }
    }

    @RequestMapping(value = "/api/project/templateList/{orgId}/{templateType}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ProjectInfo>> listProjectsByTemplateType(@PathVariable("orgId") long orgId,
                                                                                   @PathVariable("templateType") int templateType) {
        try {
            long tenantId = MasterServiceHolder.getMasterService().resolveTenantId(orgId);
            TenantContext.setTenantId(Long.toString(tenantId));

            List<Project> projects = this.mProjectService.listProjectsByTemplateType(orgId, templateType);
            List<ProjectInfo> projectInfos = ProjectInfoConverter.ConvertToProjectInfo(projects);

            return new ApiResponse<List<ProjectInfo>>(ApiResponse.Success, projectInfos);
        } catch (Exception ex) {
            logger.error("listProjectsByTemplateType", ex);
            return new ApiResponse<List<ProjectInfo>>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/project/copyScriptAcrossProject", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Boolean> copyScriptAcrossProject(@RequestBody CopyScriptAcrossProjectPayload payload) {

        logger.debug(String.format("trace performance : copyScriptAcrossProject begin..., sourceProjectId: %s, targetProjectId : %s, targetScriptGroupId : %s",
                payload.getSourceProjectId(), payload.getTargetProjectId(), payload.getTargetScriptGroupId()));

        try {

            if (payload.getSourceProjectId() == payload.getTargetProjectId()) {
                logger.info("it is not applicable for this api if target project is same as source project.");
                return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
            }

            if (payload.getScriptIds().length == 0) {
                logger.info("copy scripts ids is empty.");
                return new ApiResponse<Boolean>(ApiResponse.Success, true);
            }

            ProjectPackage projectPackage = this.mProjectService.CollectProjectPackageByScriptIds(payload.getSourceProjectId(),
                    Arrays.asList(payload.getScriptGroupIds()),
                    Arrays.asList(payload.getScriptIds()));

            ImportScriptsAcrossProject(projectPackage, payload.getTargetProjectId(), payload.getTargetScriptGroupId());
            return new ApiResponse<Boolean>(ApiResponse.Success, true);
        } catch (Exception ex) {
            logger.error("copyScriptAcrossProject", ex);
            return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
        } finally {
            logger.debug(String.format("trace performance : copyScriptAcrossProject end..., sourceProjectId: %s, targetProjectId : %s, targetScriptGroupId : %s",
                    payload.getSourceProjectId(), payload.getTargetProjectId(), payload.getTargetScriptGroupId()));
        }
    }

    private void ImportScriptsAcrossProject(ProjectPackage projectPackage, long targetProjectId, long targetScriptGroupId) {
        // import scripts.
        logger.info("import scripts");

        HashMap<Long, Long> scriptIdMapping = new HashMap<Long, Long>();
        HashMap<Long, Long> scriptGroupIdMapping = new HashMap<Long, Long>();
        List<ScriptGroup> newScriptGroups = new ArrayList<ScriptGroup>();

        for (ScriptGroup sourceScriptGroup : projectPackage.scriptGroups) {
            long sourceScriptGroupId = sourceScriptGroup.getId();
            sourceScriptGroup.setId(0);
            ScriptGroup newScriptGroup = this.mScriptGroupService.addScriptGroup(targetProjectId, sourceScriptGroup);

            newScriptGroups.add(newScriptGroup);
            logger.info(String.format("add scriptGroup : sourceScriptGroupId: %s, sourceScriptGroupId: %s, targetScriptId : %s, targetScriptGroupId: %s,",
                    sourceScriptGroupId, sourceScriptGroupId, newScriptGroup.getId(), newScriptGroup.getParentScriptGroupId()));

            scriptGroupIdMapping.put(sourceScriptGroupId, newScriptGroup.getId());
        }

        //update parent scriptGroup
        for (ScriptGroup newScriptGroup : newScriptGroups) {
            if (scriptGroupIdMapping.containsKey(newScriptGroup.getParentScriptGroupId())) {
                newScriptGroup.setParentScriptGroupId(scriptGroupIdMapping.get(newScriptGroup.getParentScriptGroupId()));
            } else {
                newScriptGroup.setParentScriptGroupId(targetScriptGroupId);
            }

            this.mScriptGroupService.updateScriptGroup(targetProjectId, newScriptGroup);
        }


        for (Script sourceScript : projectPackage.scripts) {
            long sourceScriptId = sourceScript.getId();
            sourceScript.setId(0);

            if (scriptGroupIdMapping.containsKey(sourceScript.getParentScriptGroupId())) {
                sourceScript.setParentScriptGroupId(scriptGroupIdMapping.get(sourceScript.getParentScriptGroupId()));
            } else {
                sourceScript.setParentScriptGroupId(targetScriptGroupId);
            }

            long sourceScriptGroupId = sourceScript.getParentScriptGroupId();
            Script newScript = this.mScriptService.addScript(targetProjectId, sourceScript);

            logger.info(String.format("add script : sourceScriptId: %s, sourceScriptGroupId: %s, targetScriptId : %s, targetScriptGroupId: %s,",
                    sourceScriptId, sourceScriptGroupId, newScript.getId(), newScript.getParentScriptGroupId()));

            scriptIdMapping.put(sourceScriptId, newScript.getId());
        }

        logger.info("import subscriptReferences");

        for (SubscriptReference sourceSubscriptReference : projectPackage.subscriptReferences) {
            long sourceSubScriptId = sourceSubscriptReference.getSubscriptId();
            long sourceParentScriptId = sourceSubscriptReference.getParentScriptId();
            long newSubscriptId = 0;
            long newParentScriptId = 0;

            if (scriptIdMapping.containsKey(sourceSubscriptReference.getSubscriptId())) {
                newSubscriptId = scriptIdMapping.get(sourceSubscriptReference.getSubscriptId());
            }

            if (scriptIdMapping.containsKey(sourceSubscriptReference.getParentScriptId())) {
                newParentScriptId = scriptIdMapping.get(sourceSubscriptReference.getParentScriptId());
            }

            sourceSubscriptReference.setId(0);
            sourceSubscriptReference.setSubscriptId(newSubscriptId);
            sourceSubscriptReference.setParentScriptId(newParentScriptId);
            this.subscriptReferenceService.addSubscriptReference(targetProjectId, sourceSubscriptReference);


            logger.info(String.format("add SubscriptReference : sourceSubScriptId: %s, sourceParentScriptId: %s, targetSubScriptId: %s, targetParentScriptId: %s,",
                    sourceSubScriptId, sourceParentScriptId, newSubscriptId, newParentScriptId));

        }
    }

    @RequestMapping(value = "/api/project/copy/{sourceProjectId}/{sourceOrgId}/{targetOrgId}", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProjectInfo> copyProject(@PathVariable("sourceProjectId") long sourceProjectId,
                                                              @PathVariable("sourceOrgId") long sourceOrgId, @PathVariable("targetOrgId") long targetOrgId) {

        logger.debug(String.format("trace performance : copyProject begin..., sourceProjectId: %s, sourceOrgId : %s, targetOrgId : %s",
                sourceProjectId, sourceOrgId, targetOrgId));

        try {
            if (sourceOrgId == targetOrgId) {
                Project project = this.mProjectService.copyProjectWithinOrg(sourceProjectId, sourceOrgId);
//				this.mProjectService.copyProjectData(sourceProjectId, project.getId());
                ProjectInfo projectInfo = ProjectInfoConverter.ConvertToProjectInfo(project);
                return new ApiResponse<ProjectInfo>(ApiResponse.Success, projectInfo);
            } else {
                // collect project package from source organization.
                long sourceTenantId = MasterServiceHolder.getMasterService().resolveTenantId(sourceOrgId);
                //设置上下文租户ID
                TenantContext.setTenantId(Long.toString(sourceTenantId));
                ProjectPackage projectPackage = this.mProjectService.CollectProjectPackage(sourceProjectId, sourceOrgId)
                        .Clone();

                // create project in target organization.
                long targetTenantId = MasterServiceHolder.getMasterService().resolveTenantId(targetOrgId);
                TenantContext.setTenantId(Long.toString(targetTenantId));
                Project projectAdded = this.mProjectService.ImportProjectObject(projectPackage, targetOrgId);
                projectPackage.project.setId(projectAdded.getId());

                // import project package into target organization.
                this.mProjectService.ImportProjectPackage(projectPackage, targetOrgId);

                ProjectInfo projectInfo = ProjectInfoConverter.ConvertToProjectInfo(projectPackage.project);

                return new ApiResponse<ProjectInfo>(ApiResponse.Success, projectInfo);
            }
        } catch (Exception ex) {
            logger.error("copyProject", ex);
            ex.printStackTrace();
            return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, null);

        } finally {
            logger.debug(String.format("trace performance : copyProject end..., sourceProjectId: %s, sourceOrgId : %s, targetOrgId : %s",
                    sourceProjectId, sourceOrgId, targetOrgId));
        }
    }

    @RequestMapping(value = "/api/project/copyProjectWithInfo", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ProjectInfo> copyProjectWithInfo(@RequestBody CopyProjectWithNewInfo parameter) {

        logger.debug(String.format("trace performance : copyProjectWithInfo begin..., sourceProjectId: %s, sourceOrgId : %s, targetOrgId : %s",
                parameter.getSourceProjectId(), parameter.getSourceOrgId(), parameter.getTargetOrgId()));

        try {

            boolean isOverMaxProjectNum = this.mProjectService.isOverMaxProjectNum(parameter.getTargetOrgId(), "utpserver", "utpserver.project.count");
            if (isOverMaxProjectNum) {
                ProjectInfo newProjectInfo = new ProjectInfo();
                newProjectInfo.setErrorMessages("OVER_MAX_PROJECT_NUM");
                return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, newProjectInfo);
            }
            ApiResponse<ProjectInfo> newProjectResponse = this.copyProject(parameter.getSourceProjectId(), parameter.getSourceOrgId(),
                    parameter.getTargetOrgId());

            ProjectInfo newProjectInfo = newProjectResponse.getResult();
            if (newProjectInfo != null) {
                newProjectInfo.setName(parameter.getName());
                newProjectInfo.setDescription(parameter.getDescription());
                updateProject(newProjectInfo);
            }

            return newProjectResponse;
        } catch (Exception ex) {
            logger.error("copyProjectWithInfo", ex);
            return new ApiResponse<ProjectInfo>(ApiResponse.UnHandleException, null);
        } finally {
            logger.debug(String.format("trace performance : copyProjectWithInfo end..., sourceProjectId: %s, sourceOrgId : %s, targetOrgId : %s",
                    parameter.getSourceProjectId(), parameter.getSourceOrgId(), parameter.getTargetOrgId()));
        }
    }

    @RequestMapping(value = "/api/getTestsetNamesByProjectName/{orgId}/{projectName}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<TestSet>> getTestsetNamesByProjectName(@PathVariable("orgId") long orgId, @PathVariable("projectName") String projectName) {
        try {
            List<Project> projects = mProjectService.listProjectByProjectName(orgId, projectName);
            if (projects.size() != 1) {
                return new ApiResponse<List<TestSet>>(ApiResponse.UnHandleException, null);
            }
            long projectId = projects.get(0).getId();
            List<TestSet> testsets = mProjectService.getTestsetsByProjectId(projectId);
            return new ApiResponse<List<TestSet>>(ApiResponse.Success, testsets);

        } catch (Exception ex) {
            logger.error("exportProjectToFile", ex);
            return new ApiResponse<List<TestSet>>(ApiResponse.UnHandleException, null);
        }
    }


    @RequestMapping(value = "/api/project/export/{projectId}", method = RequestMethod.GET)
    public void exportProjectToFile(@PathVariable("projectId") long projectId, HttpServletResponse response) {
        try {
            String tenantId = TenantContext.getTenantId();
            ProjectPackage projectPackage = this.mProjectService.CollectProjectPackage(projectId, Long.parseLong(tenantId));

            // 设置响应头
            response.setContentType("application/zip");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + projectPackage.project.getName() + ".zip\"");

            // 创建描述文件内容
            Descript projectDescript = new Descript();
            projectDescript.setProjectName(projectPackage.project.getName());
            projectDescript.setOrganizationId(projectPackage.project.getOrganizationId());
            String[] testsetName = new String[projectPackage.testsets.size()];
            for (int i = 0; i < projectPackage.testsets.size(); i++) {
                testsetName[i] = projectPackage.testsets.get(i).getName();
            }
            projectDescript.setTestSetNames(testsetName);

            // 直接写入响应流
            try (ZipOutputStream zipOut = new ZipOutputStream(response.getOutputStream())) {
                // 添加项目文件到 ZIP（使用 Java 序列化）
                ZipEntry projectEntry = new ZipEntry(projectPackage.project.getName() + ".uProject");
                zipOut.putNextEntry(projectEntry);
                try (ObjectOutputStream objectOut = new ObjectOutputStream(zipOut)) {
                    objectOut.writeObject(projectPackage); // 序列化 ProjectPackage 对象
                }
                zipOut.closeEntry();

                // 添加描述文件到 ZIP（使用 Java 序列化）
                ZipEntry descriptEntry = new ZipEntry("descript.ser");
                zipOut.putNextEntry(descriptEntry);
                try (ObjectOutputStream objectOut = new ObjectOutputStream(zipOut)) {
                    objectOut.writeObject(projectDescript); // 序列化 Descript 对象
                }
                zipOut.closeEntry();

                zipOut.finish(); // 确保所有数据写入
            }

        } catch (Exception ex) {
            logger.error("exportProjectToFile has exception:" + ex.toString());
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Export failed");
            } catch (IOException e) {
                logger.error("Failed to send error response", e);
            }
        }
    }


    @RequestMapping(value = "/api/project/import", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
    public @ResponseBody ApiResponse<String> importProjectToFile(@RequestParam("projectFile") MultipartFile inputFile) {

        try {
            boolean isOverMaxProjectNum = this.mProjectService.isOverMaxProjectNum(Long.parseLong(TenantContext.getOrgId()), "utpserver", "utpserver.project.count");
            if (isOverMaxProjectNum) {
                return new ApiResponse<String>(ApiResponse.UnHandleException, "OVER_MAX_PROJECT_NUM");
            }
            if (inputFile.isEmpty()) {
                return new ApiResponse<String>(ApiResponse.UnHandleException, "EMPTY_FILE");
            }

            HttpHeaders headers = new HttpHeaders();
            // Step1: Save uploaded file to temporary folder.
            String originalFilename = inputFile.getOriginalFilename();

            String tempFolder = SystemUtil.getTempDirectory();
            String id = UUID.randomUUID().toString();
            String destinationFilePath = tempFolder + File.separator + id;
            File destinationFile = new File(destinationFilePath);
            if (!new File(destinationFilePath).exists()) {
                new File(destinationFilePath).mkdir();
            }

            inputFile.transferTo(destinationFile);

            headers.add("Import Project Uploaded Successfully - ", originalFilename);
            logger.info(String.format("Import Project Uploaded Successfully - originalFilename: %s, destinationFilePath: %s ", originalFilename, destinationFilePath));

            //String content = FileUtility.readLineByLineJava8(destinationFilePath);

            String tenantId = TenantContext.getTenantId();

            //获取orgid
            String orgId = TenantContext.getOrgId();

            SerializationUtility<ProjectPackage> serializer = new SerializationUtility<ProjectPackage>();
            ProjectPackage projectPackage = serializer.Deserialize(destinationFilePath);
            if (tenantId.equalsIgnoreCase("0")) {
                tenantId = orgId;
            }

            if (projectPackage == null) {
                throw new Exception("Deserialize project file failed.");
            }
            //判断是否存在同名的项目,如果存在则抛出异常
            List<Project> projects = this.mProjectService.listProjectByProjectName(Long.parseLong(orgId), projectPackage.project.getName());
            if (projects != null && projects.size() > 0) {
                return new ApiResponse<String>(ApiResponse.UnHandleException, "REPETITION_FILE");
            }
            projectPackage = projectPackage.Clone();
            // create project in target organization.
            this.mProjectService.ImportProjectObject(projectPackage, Long.parseLong(tenantId));

            // import project package into target organization.
            this.mProjectService.ImportProjectPackage(projectPackage, Long.parseLong(tenantId));
            //String exportedProjectFileName =  projectPackage.project.getName()  + "_" + StringUtility.GenerateUniqueIdByNow()+ ".project";
            //如果是权限为0的用户,则导入实例项目
            long exampleOrgId = getExampleOrgId();
            //如果exampleOrgId和orgId相等,则更改为实例项目
            if (exampleOrgId == Long.parseLong(orgId)) {
                //定义string[]数组
                String[] testsetName = new String[1];
                //将testsetName[0]赋值为projectPackage.project.getName()
                testsetName[0] = projectPackage.project.getName();
                updateProjectTemplateType(testsetName, exampleOrgId);
            }
            return new ApiResponse<String>(ApiResponse.Success, "SUCCESS");

        } catch (Exception ex) {
            logger.error("importProjectToFile has exception:" + ex.toString());
            return new ApiResponse<String>(ApiResponse.UnHandleException, "FAILED");
        }
    }

    //获取权限为ROLE_TEST的exampleOrgId,
    private long getExampleOrgId() {
        String url = String.format(UrsServiceApis.GetTestAccount, ursConfig.getIpAddress());
        RestTemplate restTemplate = new RestTemplate();
        String utpResponse = restTemplate
                .getForObject(url, String.class, 1);
        //解析utpResponse
        ObjectMapper mapper = new ObjectMapper();
        JsonNode result = null;
        try {
            result = mapper.readTree(utpResponse);
        } catch (IOException e) {
            logger.error("getExampleOrgId has exception:" + e.toString());
            return 0;
        }
        //解析result
        long exampleOrgId = result.get("orgId").asLong();
        return exampleOrgId;
    }


    private String GetProjectRealPath(String folder, String fileName) {
        fileName = FileUtility.filterInvalidCharacterFileName(fileName);
        new File(context.getRealPath("/WEB-INF/projects" + File.separator + folder)).mkdirs();

        return context.getRealPath("/WEB-INF/projects" + File.separator + folder) + File.separator + fileName;
    }

    private String GetProjectRelativePath(String fileName) {
        fileName = FileUtility.filterInvalidCharacterFileName(fileName);
        return "." + File.separator + "projects" + File.separator + fileName;
    }
}
