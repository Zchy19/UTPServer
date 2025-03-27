package com.macrosoft.service;

import com.macrosoft.controller.dto.ProjectFullData;
import com.macrosoft.controller.dto.ProjectScriptGroupsData;
import com.macrosoft.model.Project;
import com.macrosoft.model.ProjectPackage;
import com.macrosoft.model.TestSet;

import java.util.List;

public interface ProjectService {
	public Project addProject(Project p);
	public void updateProject(Project p);
	public List<Project> listProjects(String orgId);
	public Project getProjectById(long id);
	public void removeProject(long id);
	public void setTemplate(long projectId, int templateType);
	public List<Project> listProjectsByTemplateType(long orgId, int templateType);
	public ProjectFullData getProjectFullData(long projectId);
	public ProjectScriptGroupsData getAllScriptGroupData(long projectId);
	public ProjectScriptGroupsData getScriptGroupDataOnlyScript(long projectId);
	public ProjectScriptGroupsData getScriptGroupDataOnlySubScript(long projectId);
	public ProjectScriptGroupsData getScriptGroupDataForRecover(long projectId);
	public Project copyProjectWithinOrg(long sourceProjectId, long orgId);
	public Project copyProjectCrossOrg(long sourceProjectId, long sourceOrgId, long targetOrgId);
	
	public ProjectPackage CollectProjectPackage(long sourceProjectId, long sourceOrgId);
	public Project ImportProjectObject(ProjectPackage projectPackage, long targetOrgId);
	public void ImportProjectPackage(ProjectPackage projectPackage, long targetOrgId);
	
	public ProjectPackage CollectProjectPackageByScriptIds(long sourceProjectId, List<Long> scriptGroupIds, List<Long> scriptIds);
	
	public void updateCustomizedScriptFields(long projectId, String customizedScriptFields);
	
	public void updateCustomizedReqFields(long projectId, String customizedReqFields);

	public List<Project> listProjectByProjectName(long orgId ,String projectName);
	//获取Project表中所有数据
	public List<Project> getAllProjects();
	//根号projectId获取testset的名称
	public List<TestSet> getTestsetsByProjectId(long projectId);
	//是否超过最大项目数
	public boolean isOverMaxProjectNum(long orgId,String modelName,String featureName);

}

