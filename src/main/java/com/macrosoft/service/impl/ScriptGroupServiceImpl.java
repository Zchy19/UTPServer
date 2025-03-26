package com.macrosoft.service.impl;

import com.macrosoft.dao.ProjectDAO;
import com.macrosoft.dao.RequirementDAO;
import com.macrosoft.dao.ScriptGroupDAO;
import com.macrosoft.model.Project;
import com.macrosoft.model.ScriptGroup;
import com.macrosoft.service.ScriptGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScriptGroupServiceImpl implements ScriptGroupService {

    private ProjectDAO projectDAO;
    private ScriptGroupDAO scriptGroupDAO;
    private RequirementDAO requirementDAO;

    @Autowired
    public void setRequirementDAO(RequirementDAO requirementDAO) {
        this.requirementDAO = requirementDAO;
    }

    @Autowired
    public void setScriptGroupDAO(ScriptGroupDAO scriptGroupDAO) {
        this.scriptGroupDAO = scriptGroupDAO;
    }

    @Autowired
    public void setProjectDAO(ProjectDAO projectDAO) {
        this.projectDAO = projectDAO;
    }

    @Override
    @Transactional
    public ScriptGroup addScriptGroup(long projectId, ScriptGroup scriptGroup) {

        // get next scriptgroupid from project entity.
        Project project = projectDAO.getProjectById(projectId);
        long newScriptGroupId = project.getNextEntityLogicId();

        project.setNextEntityLogicId(newScriptGroupId + 1);
        projectDAO.updateProject(project);

        scriptGroup.setId(newScriptGroupId);
        scriptGroup.setProjectId(projectId);

        // add script group
        return this.scriptGroupDAO.addScriptGroup(projectId, scriptGroup);
    }

    @Override
    @Transactional
    public void updateScriptGroup(long projectId, ScriptGroup p) {
        this.scriptGroupDAO.updateScriptGroup(projectId, p);
    }

    @Override
    @Transactional
    public List<ScriptGroup> listScriptGroups(long projectId) {
        return this.scriptGroupDAO.listScriptGroups(projectId);
    }

    /*
     * @Description: list script groups by type
     *
     * @author: Zchy
     * @date: 2025/3/20 16:10
     * @param: projectId
     * @param: type
     * @return: java.util.List<com.macrosoft.model.ScriptGroup>
     **/
    @Override
    @Transactional
    public List<ScriptGroup> listScriptGroupsByType(long projectId, String type) {
        return scriptGroupDAO.listScriptGroupsByType(projectId, type);
    }

    @Override
    @Transactional
    public List<ScriptGroup> listScriptGroupsInTopLevel(long projectId) {
        return this.scriptGroupDAO.listScriptGroupsInTopLevel(projectId);
    }

    @Override
    @Transactional
    public List<ScriptGroup> listScriptGroupsByParentScriptGroupId(long projectId, long parentScriptGroupId) {
        return this.scriptGroupDAO.listScriptGroupsByParentScriptGroupId(projectId, parentScriptGroupId);
    }

    @Override
    @Transactional
    public ScriptGroup getScriptGroupById(long projectId, long id) {
        return this.scriptGroupDAO.getScriptGroupById(projectId, id);
    }

    @Override
    @Transactional
    public void removeScriptGroup(long projectId, long id) {
        this.scriptGroupDAO.removeScriptGroup(projectId, id);

        this.requirementDAO.cleanScriptRequirementMapping(projectId);
    }

    /*
    通过脚本组名称添加脚本组
     */
    @Override
    @Transactional
    public long addScriptGroupByPath(String path, long projectId, String type) {
        List<String> pathList = Arrays.stream(path.split("/"))
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        Long parentScriptGroupId = 0L;
        for (String scriptGroupName : pathList) {
            ScriptGroup scriptGroup = scriptGroupDAO.getScriptGroupByName(scriptGroupName, parentScriptGroupId);
            if (scriptGroup != null) {
                parentScriptGroupId = scriptGroup.getId();
                continue;
            }
            scriptGroup = ScriptGroup.builder()
                    .projectId(projectId)
                    .name(scriptGroupName)
                    .type(type)
                    .parentScriptGroupId(parentScriptGroupId)
                    .build();
            ScriptGroup scriptGroupAdded = addScriptGroup(projectId, scriptGroup);
            parentScriptGroupId = scriptGroupAdded.getId();
        }
        return parentScriptGroupId;
    }
}
