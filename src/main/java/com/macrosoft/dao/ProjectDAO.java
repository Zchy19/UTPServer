package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.Project;

public interface ProjectDAO {
	public void addProject(Project project);

	public void addProjectWithDefalutScriptGroup(Project project);

	public void updateProject(Project project);

	public List<Project> listProjects(String orgId);

	public Project getProjectById(long id);

	public void removeProject(long id);

	public void copyProjectData(long sourceProjectId, long targetProjectId);

	public List<Project> listProjectsByTemplateType(long orgId, int templateType);

	public List<Project> listProjectByProjectName(long orgId, String projectName);
	
	public void updateCustomizedScriptFields(long projectId, String customizedScriptFields);
	
	public void updateCustomizedReqFields(long projectId, String customizedReqFields);

	public List<Project> getAllProjects();
}
