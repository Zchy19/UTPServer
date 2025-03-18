package com.macrosoft.controller.dto;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.model.Project;

public class ProjectInfoConverter
{
	public static List<ProjectInfo> ConvertToProjectInfo(List<Project> projects)
	{
		List<ProjectInfo> projectInfos = new ArrayList<ProjectInfo>();
		
		for (Project project : projects)
		{
			ProjectInfo projectInfo = ConvertToProjectInfo(project);
			projectInfos.add(projectInfo);
		}
		return projectInfos;
	}
	
	
	public static ProjectInfo ConvertToProjectInfo(Project project)
	{
		ProjectInfo projectInfo = new ProjectInfo();
		projectInfo.setId(project.getId());
		projectInfo.setName(project.getName());
		projectInfo.setDescription(project.getDescription());
		projectInfo.setOrganizationId(project.getOrganizationId());
		projectInfo.setDefaultRecoverSubscriptId(project.getDefaultRecoverSubscriptId());
		projectInfo.setTemplateType(project.getTemplateType());
		projectInfo.setTargetObjectDescription(project.getTargetObjectDescription());
		projectInfo.setRequirementManageType(project.getRequirementManageType());
		projectInfo.setCustomizedReqFields(project.getCustomizedReqFields());
		projectInfo.setCustomizedScriptFields(project.getCustomizedScriptFields());
		projectInfo.setAutoIntoUser(project.getAutoIntoUser());
		return projectInfo;
	}
	
	public static Project ConvertToProject(ProjectInfo projectInfo)
	{
		Project project = new Project();
		project.setId(projectInfo.getId());
		project.setName(projectInfo.getName());
		project.setDescription(projectInfo.getDescription());
		project.setOrganizationId(projectInfo.getOrganizationId());
		project.setDefaultRecoverSubscriptId(projectInfo.getDefaultRecoverSubscriptId());
		project.setTemplateType(projectInfo.getTemplateType());
		project.setTargetObjectDescription(projectInfo.getTargetObjectDescription());
		project.setRequirementManageType(projectInfo.getRequirementManageType());
		project.setAutoIntoUser(projectInfo.getAutoIntoUser());
		//project.setCustomizedReqFields(projectInfo.getCustomizedReqFields());
		//project.setCustomizedScriptFields(projectInfo.getCustomizedScriptFields());
		
		return project;
	}
	

	public static ProjectFullData ConvertToProjectFullData(Project project)
	{
		ProjectFullData projectInfo = new ProjectFullData();
		projectInfo.setId(project.getId());
		projectInfo.setName(project.getName());
		projectInfo.setDescription(project.getDescription());
		projectInfo.setOrganizationId(project.getOrganizationId());
		projectInfo.setTargetObjectDescription(project.getTargetObjectDescription());
		projectInfo.setRequirementManageType(project.getRequirementManageType());
		return projectInfo;
	}
}
