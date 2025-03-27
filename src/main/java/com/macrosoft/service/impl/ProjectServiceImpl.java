package com.macrosoft.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.dao.*;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.model.composition.TestsetData;
import com.macrosoft.service.ProjectService;
import com.macrosoft.utilities.FeaturesUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Predicate;

@Service
public class ProjectServiceImpl implements ProjectService {
	private static final ILogger logger = LoggerFactory.Create(ProjectServiceImpl.class.getName());
	private ProjectDAO ProjectDAO;
	private RequirementDAO RequirementDAO;
	private ScriptGroupDAO ScriptGroupDAO;
	private ScriptDAO ScriptDAO;
	private TestSetDAO TestSetDAO;
	private AgentConfigDAO AgentConfigDAO;
	private BigDataDAO BigDataDAO;
	private RecorderDAO RecorderDAO;
	private ProtocolSignalDAO ProtocolSignalDAO;
	private RecoverSubscriptReferenceDAO RecoverSubscriptReferenceDAO;
	private ScriptLinkDAO ScriptLinkDAO;
	private SubscriptReferenceDAO SubscriptReferenceDAO;
	private MessageTemplateDAO MessageTemplateDAO;
	private MonitoringTestSetDAO monitoringTestSetDAO;
	private SpecialTestDAO specialTestDAO;

	@Autowired
	public void setProjectDAO(ProjectDAO ProjectDAO) {
		this.ProjectDAO = ProjectDAO;
	}

	@Autowired
	public void setRequirementDAO(RequirementDAO requirementDAO) {
		this.RequirementDAO = requirementDAO;
	}

	@Autowired
	public void setScriptGroupDAO(ScriptGroupDAO scriptGroupDAO) {
		this.ScriptGroupDAO = scriptGroupDAO;
	}

	@Autowired
	public void setScriptDAO(ScriptDAO ScriptDAO) {
		this.ScriptDAO = ScriptDAO;
	}

	@Autowired
	public void setAgentConfigDAO(AgentConfigDAO AgentConfigDAO) {
		this.AgentConfigDAO = AgentConfigDAO;
	}
	private UrsConfigurationImpl ursConfig;
	@Autowired
	public void setUrsConfig(UrsConfigurationImpl ursConfig) {
		this.ursConfig = ursConfig;
	}

	@Autowired
	public void setMessageTemplateDAO(MessageTemplateDAO MessageTemplateDAO) {
		this.MessageTemplateDAO = MessageTemplateDAO;
	}
	@Autowired
	public void setSubscriptReferenceDAO(SubscriptReferenceDAO SubscriptReferenceDAO) {
		this.SubscriptReferenceDAO = SubscriptReferenceDAO;
	}

	@Autowired
	public void setRecoverSubscriptReferenceDAO(RecoverSubscriptReferenceDAO RecoverSubscriptReferenceDAO) {
		this.RecoverSubscriptReferenceDAO = RecoverSubscriptReferenceDAO;
	}
	@Autowired
	public void setTestSetDAO(TestSetDAO TestSetDAO) {
		this.TestSetDAO = TestSetDAO;
	}
	@Autowired
	public void setMonitoringTestSetDAO(MonitoringTestSetDAO monitoringTestSetDAO) {
		this.monitoringTestSetDAO = monitoringTestSetDAO;
	}
	@Autowired
    public void setSpecialTestDAO(SpecialTestDAO specialTestDAO) {
		this.specialTestDAO = specialTestDAO;
	}
	@Autowired
	public void setScriptLinkDAO(ScriptLinkDAO ScriptLinkDAO) {
		this.ScriptLinkDAO = ScriptLinkDAO;
	}

	@Autowired
	public void setRecorderDAO(RecorderDAO RecorderDAO) {
		this.RecorderDAO = RecorderDAO;
	}

	@Autowired
	public void setProtocolSignalDAO(ProtocolSignalDAO ProtocolSignalDAO) {
		this.ProtocolSignalDAO = ProtocolSignalDAO;
	}
	@Autowired
	public void setBigDataDAO(BigDataDAO BigDataDAO) {
		this.BigDataDAO = BigDataDAO;
	}

	@Override
	@Transactional
	public Project addProject(Project p) {
		UUID uuid = UUID.randomUUID();
		int newProjectId = Math.abs(uuid.hashCode());
		p.setId(newProjectId);
		this.ProjectDAO.addProjectWithDefalutScriptGroup(p);
		return p;
	}

	@Override
	@Transactional
	public void updateProject(Project p) {
		this.ProjectDAO.updateProject(p);
	}

	@Override
	@Transactional
	public List<Project> listProjects(String orgId) {
		return this.ProjectDAO.listProjects(orgId);
	}
	
	@Override
	@Transactional
	public List<Project> listProjectsByTemplateType(long orgId, int templateType) {
		return this.ProjectDAO.listProjectsByTemplateType(orgId, templateType);
	}

	/*
	* 根据projectName查询项目*/
	@Override
	@Transactional
	public List<Project> listProjectByProjectName(long orgId, String projectName) {
		return this.ProjectDAO.listProjectByProjectName(orgId, projectName);
	}

	//查询所有项目
	@Override
	@Transactional
	public List<Project> getAllProjects() {
		return this.ProjectDAO.getAllProjects();
	}

	//根据项目id查询测试集
	@Override
	@Transactional
	public List<TestSet> getTestsetsByProjectId(long projectId) {
		return this.TestSetDAO.listTestSetsByProjectId(projectId);
	}

	@Override
	@Transactional
	public boolean isOverMaxProjectNum(long orgId, String modelName, String featureName) {
		//获取所有的utpserverFeatures
		JsonNode utpserverFeatures = FeaturesUtility.GetFeaturesByModule(ursConfig.getIpAddress(),modelName);
		//默认为2
		int count=2;
		if(utpserverFeatures != null) {
			//获取配置文件中的值
			String configValue = FeaturesUtility.GetConfigValueByFeatureName(utpserverFeatures, featureName);
			if (configValue != null && !configValue.trim().isEmpty()&& !configValue.equalsIgnoreCase("null")) {
				try {
					count = Integer.parseInt(configValue);
				} catch (Exception e) {
					// 处理转换失败的情况，这里可以选择记录日志或忽略异常
					logger.error("isOverMaxProjectNum配置configValue值转换失败，使用默认值2,configValue:" + configValue, e);
				}
			}
		}
		if (count !=-1) {
			List<Project> projects = listProjects(String.valueOf(orgId));
			if (projects.size() >= count) {
				return true;
			}
		}
		return false;
	}

	@Override
	@Transactional
	public Project getProjectById(long id) {
		return this.ProjectDAO.getProjectById(id);
	}

	@Override
	@Transactional
	public void removeProject(long id) {
		this.ProjectDAO.removeProject(id);
	}

	@Override
	@Transactional
	public void setTemplate(long projectId, int templateType) {
		Project project = this.ProjectDAO.getProjectById(projectId);
		project.setTemplateType(templateType);
		this.ProjectDAO.updateProject(project);
	}

	@Override
	@Transactional
	public ProjectFullData getProjectFullData(long projectId) {

		Project project = this.ProjectDAO.getProjectById(projectId);
		if (project == null)
		{
			return new ProjectFullData();
		}

		ProjectFullData projectFullData = ProjectInfoConverter.ConvertToProjectFullData(project);
		fillProjectFullData(projectFullData);

		return projectFullData;
	}

	@Override
	@Transactional
	public ProjectScriptGroupsData getAllScriptGroupData(long projectId) {
		Project project = this.ProjectDAO.getProjectById(projectId);
		if (project == null)
		{
			return new ProjectScriptGroupsData();
		}

		ProjectScriptGroupsData projectScriptGroupsData = new ProjectScriptGroupsData();
		List<ScriptGroupInfo> scriptGroupInfos = buildScriptGroupHierarchy(project.getId(), true, true, false);
		projectScriptGroupsData.setScriptgroups(scriptGroupInfos);
		return projectScriptGroupsData;
	}
	

	@Override
	@Transactional
	public ProjectScriptGroupsData getScriptGroupDataOnlyScript(long projectId) {
		Project project = this.ProjectDAO.getProjectById(projectId);
		if (project == null)
		{
			return new ProjectScriptGroupsData();
		}

		ProjectScriptGroupsData projectScriptGroupsData = new ProjectScriptGroupsData();
		List<ScriptGroupInfo> scriptGroupInfos = buildScriptGroupHierarchy(project.getId(), true, false, false);
		
		projectScriptGroupsData.setScriptgroups(scriptGroupInfos);
		return projectScriptGroupsData;
	}

	@Override
	@Transactional
	public ProjectScriptGroupsData getScriptGroupDataOnlySubScript(long projectId) {
		Project project = this.ProjectDAO.getProjectById(projectId);
		if (project == null)
		{
			return new ProjectScriptGroupsData();
		}

		ProjectScriptGroupsData projectScriptGroupsData = new ProjectScriptGroupsData();
		List<ScriptGroupInfo> scriptGroupInfos = buildScriptGroupHierarchy(project.getId(), false, true, false);
		
		projectScriptGroupsData.setScriptgroups(scriptGroupInfos);
		return projectScriptGroupsData;
	}


	@Override
	@Transactional
	public void updateCustomizedScriptFields(long projectId, String customizedScriptFields)
	{
		this.ProjectDAO.updateCustomizedScriptFields(projectId, customizedScriptFields);
	}

	@Override
	@Transactional
	public void updateCustomizedReqFields(long projectId, String customizedReqFields)
	{
		this.ProjectDAO.updateCustomizedReqFields(projectId, customizedReqFields);
	}



	@Override
	@Transactional
	public ProjectScriptGroupsData getScriptGroupDataForRecover(long projectId) {

		Project project = this.ProjectDAO.getProjectById(projectId);
		if (project == null)
		{
			return new ProjectScriptGroupsData();
		}

		ProjectScriptGroupsData projectScriptGroupsData = new ProjectScriptGroupsData();
		List<ScriptGroupInfo> scriptGroupInfos = buildScriptGroupHierarchy(project.getId(), false, true, true);
		
		projectScriptGroupsData.setScriptgroups(scriptGroupInfos);
		return projectScriptGroupsData;
	}

	private void fillProjectFullData(ProjectFullData project) {
		
		// fill scriptgroup list with hierarchy.
		List<ScriptGroupInfo> scriptGroupInfos = buildScriptGroupHierarchy(project.getId(), true, true, false);		
		project.setScriptgroups(scriptGroupInfos);
		

		// fill testset list with hierarchy.
		List<TestSet> testsetsInProject = this.TestSetDAO.listTestSetsByProjectId(project.getId());
		for (TestSet testSet : testsetsInProject)
		{
			TestsetData testsetData =  this.TestSetDAO.getTestsetDatasById(testSet.getProjectId(), testSet.getId());
			project.getTestsets().add(testsetData);
		}
	}

	
	
	@Override
	@Transactional
	public ProjectPackage CollectProjectPackageByScriptIds(long sourceProjectId, List<Long> scriptGroupIds, List<Long> scriptIds)
	{
		ProjectPackage projectPackage = new ProjectPackage();
		// compose new project.
		projectPackage.project = this.ProjectDAO.getProjectById(sourceProjectId);
		
		List<Script> scriptResults = new ArrayList<Script>();
		List<ScriptGroup> scriptGroupResults = new ArrayList<ScriptGroup>();
		
		// compose script.
		for (long scriptId : scriptIds)
		{
			collectScriptAndChildrenCore(sourceProjectId, scriptId, scriptResults);
		}
		
		for (long scriptGroupId : scriptGroupIds)
		{
			ScriptGroup existedScriptGroup = this.ScriptGroupDAO.getScriptGroupById(sourceProjectId, scriptGroupId);
			if (existedScriptGroup == null) continue;
			scriptGroupResults.add(existedScriptGroup);
		}
		
		
		projectPackage.scriptGroups = scriptGroupResults;
		projectPackage.scripts = scriptResults;
		
		List<SubscriptReference> subscriptReferenceResult = new ArrayList<SubscriptReference>();
		// compose SubScriptReference.
		for (Script script : projectPackage.scripts)
		{
			if (ScriptType.SubScriptType.compareToIgnoreCase(script.getType()) !=0) continue;
				
			List<SubscriptReference> subscriptReferences = this.SubscriptReferenceDAO.listSubscriptReferencesBySubscriptId(sourceProjectId, script.getId());
			
			subscriptReferenceResult.addAll(subscriptReferences);
		}
		
		projectPackage.subscriptReferences = subscriptReferenceResult;
		
		return projectPackage;
	}	



	
	private void collectScriptAndChildrenCore(long projectId, long scriptId, List<Script> scriptResults)
	{
		Script existedScript = this.ScriptDAO.getScriptById(projectId, scriptId);

		if (existedScript == null) return;
		

		scriptResults.add(existedScript);
		
		List<SubscriptReference> subscriptReferences = this.SubscriptReferenceDAO.listSubscriptReferencesByParentScriptId(projectId, scriptId);
		for (SubscriptReference reference : subscriptReferences)
		{
			collectScriptAndChildrenCore(projectId, reference.getSubscriptId(), scriptResults);
		}
	}
	
	@Override
	@Transactional
	public ProjectPackage CollectProjectPackage(long sourceProjectId, long sourceOrgId)
	{
		ProjectPackage projectPackage = new ProjectPackage();
		// compose new project.
		projectPackage.project = this.ProjectDAO.getProjectById(sourceProjectId);
		
		// compose requirements.
		projectPackage.requirements = this.RequirementDAO.getRequirementByProjectId(sourceProjectId);

		// compose testCaseRequirementMapping.
		projectPackage.testCaseRequirementMapping = this.RequirementDAO.getRequirementMappingByProjectId(sourceProjectId);
		
		// compose agent configs.
		projectPackage.agentConfigs = this.AgentConfigDAO.getAgentConfigByProjectId(sourceProjectId);

		// compose scriptgroups.		
		projectPackage.scriptGroups = this.ScriptGroupDAO.listScriptGroups(sourceProjectId);
		
		// compose script.
		projectPackage.scripts = this.ScriptDAO.listScriptsByProjectId(sourceProjectId);
		
		// compose SubScriptReference.
		projectPackage.subscriptReferences = this.SubscriptReferenceDAO.listSubscriptReferencesByProjectId(sourceProjectId);
		
		// compose RecoverSubscriptReference.
		projectPackage.recoverSubscriptReference = this.RecoverSubscriptReferenceDAO.listRecoverSubscriptReference(sourceProjectId);
		
		// compose testset
		projectPackage.testsets = this.TestSetDAO.listTestSetsByProjectId(sourceProjectId);
		
		// compose scriptlink
		projectPackage.scriptLinks = this.ScriptLinkDAO.listScriptLinks(sourceProjectId);
		
		
		// compose Record & Bigdata
		List<String> recordsetIds = new ArrayList<String>();
		List<String> messageTemplateIds = new ArrayList<String>();
		List<String> protocolSignalIds = new ArrayList<String>();
		projectPackage.recorders = new ArrayList<Recorder>();
		projectPackage.bigDatas = new ArrayList<BigData>();
		projectPackage.messageTemplates = new ArrayList<MessageTemplate>();
		
		
		for (AgentConfig agentConfig : projectPackage.agentConfigs)
		{
			String recordsetId = agentConfig.getRecordsetId();
			recordsetIds.add(recordsetId);
			
			String protocolSignalId = agentConfig.getProtocolSignalId();
			if (protocolSignalId != null && protocolSignalId != "")
			{
				boolean contained = false;
				for (String storageId :protocolSignalIds)
				{
					if (storageId.equalsIgnoreCase(protocolSignalId))
					{
						contained = true;
						break;
					}
				}
				
				if (!contained)
				{
					protocolSignalIds.add(protocolSignalId);
				}
			}
		}
		
		for (String recordsetId : recordsetIds)
		{
			Recorder record = this.RecorderDAO.getRecorderById(recordsetId);
			if (record != null)
			{
				projectPackage.recorders.add(record);
			}
			
			List<BigData> bigDatasOfRecord = this.BigDataDAO.getBigDataByRootId(recordsetId);
			for (BigData data : bigDatasOfRecord)
			{
				projectPackage.bigDatas.add(data);
			}
		}

		projectPackage.protocolSignals = new ArrayList<>();
		
		for (String protocolSignalId : protocolSignalIds)
		{
			logger.info("export messageTemplate for protocolSignalId : " + protocolSignalId);
			
			ProtocolSignal protocolSignal = this.ProtocolSignalDAO.getProtocolSignal(protocolSignalId);
			if (protocolSignal == null) 
			{
				logger.info("can not find : protocolSignalId : " + protocolSignalId);
				continue;
			}
			
			projectPackage.protocolSignals.add(protocolSignal);
			logger.info("collected protocolSignalId : " + protocolSignalId);

			
			List<MessageTemplate> messageTemplates = this.MessageTemplateDAO.listActiveMessageTemplates(protocolSignalId);
			for (MessageTemplate mt : messageTemplates)
			{
				projectPackage.messageTemplates.add(mt);

				logger.info("export messageTemplate id : " + mt.getId() + "mesagageName:" + mt.getMessageName());
			}
		}
		
		// compose MonitoringTestset
		projectPackage.monitortingTestsets = this.monitoringTestSetDAO.listMonitoringTestSetsByProjectId(sourceProjectId);
		//compose specialTest
		projectPackage.specialTests = this.specialTestDAO.listSpecialTestsByProjectId(sourceProjectId);
		
		return projectPackage;
	}

	@Override
	@Transactional
	public Project ImportProjectObject(ProjectPackage projectPackage, long targetOrgId)
	{
		projectPackage.project.setOrganizationId(targetOrgId);
		projectPackage.project.setTemplateType(Project.TemplateType_Default);
		UUID uuid = UUID.randomUUID();
		int newProjectId = Math.abs(uuid.hashCode());
		projectPackage.project.setId(newProjectId);
		return this.ProjectDAO.addProject(projectPackage.project);
	}

	@Override
	@Transactional
	public void ImportProjectPackage(ProjectPackage projectPackage, long targetOrgId)
	{
		long targetProjectId = projectPackage.project.getId();

		// import requirements.
		for (Requirement editingRequriement : projectPackage.requirements)
		{
			editingRequriement.setProjectId(targetProjectId);
			this.RequirementDAO.addRequirement(targetProjectId, editingRequriement);
		}
		logger.info("import requriements");

		// import requirements.
		for (TestCaseRequirementMapping editingMapping : projectPackage.testCaseRequirementMapping)
		{
			editingMapping.setProjectId(targetProjectId);
			this.RequirementDAO.addScriptRequirementMapping(targetProjectId, editingMapping.getScriptId(), editingMapping.getRequirementId());
		}
		logger.info("import script requriement mapping");

/*
		// import agent configs.
		for (AgentConfig editingAgentConfig : projectPackage.agentConfigs)
		{
			editingAgentConfig.setProjectId(targetProjectId);
			this.AgentConfigDAO.addAgentConfig(targetProjectId, editingAgentConfig);
		}
		logger.info("import agent configs");
*/		
		HashMap<String, String> recorderIdMapping = new HashMap<String, String>();
		HashMap<String, String> protocolSignalIdMapping = new HashMap<String, String>();
		
		for (ProtocolSignal protocolSignal : projectPackage.protocolSignals)
		{
			String newProtocolSignalId;
			if (protocolSignalIdMapping.containsKey(protocolSignal.getId()))
			{
				newProtocolSignalId = protocolSignalIdMapping.get(protocolSignal.getId());
			}
			else
			{
				newProtocolSignalId = UUID.randomUUID().toString();
				protocolSignalIdMapping.put(protocolSignal.getId(), newProtocolSignalId);
			}
			
			logger.info(String.format("original protocolSignalId : %s, new  protocolSignalId:%s", protocolSignal.getId(), newProtocolSignalId));
		}
		
		// import agent configs.
		for (AgentConfig editingAgentConfig : projectPackage.agentConfigs)
		{
			String newRecorderId="";
			String currentRecorderId = editingAgentConfig.getRecordsetId();
			if (currentRecorderId != null && !currentRecorderId.isEmpty())
			{
				if (recorderIdMapping.containsKey(editingAgentConfig.getRecordsetId()))
				{
					newRecorderId = recorderIdMapping.get(editingAgentConfig.getRecordsetId());
				}
				else
				{
					newRecorderId = UUID.randomUUID().toString();
					recorderIdMapping.put(editingAgentConfig.getRecordsetId(), newRecorderId);
				}
			}
			
			String newProtocolSignalId = "";
			String currentProtocolSignalId = editingAgentConfig.getProtocolSignalId();
			if (currentProtocolSignalId != null && !currentProtocolSignalId.isEmpty())
			{
				if (protocolSignalIdMapping.containsKey(editingAgentConfig.getProtocolSignalId()))
				{
					newProtocolSignalId = protocolSignalIdMapping.get(editingAgentConfig.getProtocolSignalId());
				}
				else
				{
					newProtocolSignalId = UUID.randomUUID().toString();
					protocolSignalIdMapping.put(editingAgentConfig.getProtocolSignalId(), newProtocolSignalId);
				}
			}
			
			editingAgentConfig.setProjectId(targetProjectId);
			editingAgentConfig.setRecordsetId(newRecorderId);
			editingAgentConfig.setProtocolSignalId(newProtocolSignalId);

			this.AgentConfigDAO.addAgentConfig(targetProjectId, editingAgentConfig);
		}
		logger.info("import agent configs");
		
		// import scriptgroups.
		for (ScriptGroup editingScriptGroup : projectPackage.scriptGroups)
		{
			editingScriptGroup.setProjectId(targetProjectId);
			this.ScriptGroupDAO.addScriptGroup(targetProjectId, editingScriptGroup);
		}

		logger.info("import scriptgroups");
		// import scripts.
		for (Script editingScript : projectPackage.scripts)
		{
			editingScript.setProjectId(targetProjectId);
			this.ScriptDAO.addScript(targetProjectId, editingScript);
		}

		logger.info("import scripts");
		// import SubScriptReference
		for (SubscriptReference editingReference : projectPackage.subscriptReferences)
		{
			editingReference.setId(0);
			editingReference.setProjectId(targetProjectId);
			this.SubscriptReferenceDAO.addSubscriptReference(targetProjectId, editingReference);
		}

		logger.info("import SubScriptReference");
		// import RecoverSubscriptReference
		for (RecoverSubscriptReference editingReference : projectPackage.recoverSubscriptReference)
		{
			editingReference.setProjectId(targetProjectId);
			this.RecoverSubscriptReferenceDAO.addRecoverSubscriptReference(targetProjectId, editingReference);
		}

		logger.info("import RecoverSubscriptReference");
		// import testset
		for (TestSet editingTestset : projectPackage.testsets)
		{
			editingTestset.setProjectId(targetProjectId);
			this.TestSetDAO.addTestSet(targetProjectId, editingTestset);
		}

		logger.info("import testset");
		// import scriptlink
		for (ScriptLink editingScriptLink : projectPackage.scriptLinks)
		{
			editingScriptLink.setProjectId(targetProjectId);
			logger.info(String.format("editingScriptLink, id: %s, projectId: %s",editingScriptLink.getId(), editingScriptLink.getProjectId()  ));
			this.ScriptLinkDAO.addScriptLink(targetProjectId, editingScriptLink);
		}

		logger.info("import record");
		// import record & bigdata
		for (Recorder editingRecorder : projectPackage.recorders)
		{
			String originalRecorderSetId = editingRecorder.getId();
			String newRecorderSetId = "";
			if (recorderIdMapping.containsKey(editingRecorder.getId()))
			{
				newRecorderSetId = recorderIdMapping.get(editingRecorder.getId());
				editingRecorder.setId(newRecorderSetId);
			}

			editingRecorder.setOrgId(Long.toString(targetOrgId));
			//修改为当前时间
			editingRecorder.setLastUpdatedTime(new Date());
			this.RecorderDAO.addRecorder(editingRecorder);
			logger.info(String.format("addRecorder, id: %s, orgId: %s, name: %s",editingRecorder.getId(), editingRecorder.getOrgId(), editingRecorder.getName()));			

			
			for (BigData bigData : projectPackage.bigDatas)
			{
				if (originalRecorderSetId.compareToIgnoreCase(bigData.getRootId()) == 0)
				{
					bigData.setRootId(newRecorderSetId);

					BigData data = this.BigDataDAO.getBigData(bigData.getRootId(), bigData.getReferenceId());
					if (data == null)
					{
						this.BigDataDAO.addBigData(bigData);
						logger.info("import bigData, rootId:" + newRecorderSetId);
					}
				}
			}
			
		}

		logger.info("import protocolSignals");

		
		for (ProtocolSignal protocolSignal :  projectPackage.protocolSignals)
		{
			logger.info("id:" + protocolSignal.getId() + " filename:" + protocolSignal.getFileName());
			
			//ProtocolSignal storage = this.ProtocolSignalDAO.getProtocolSignal(protocolSignal.getId());
			//if (storage != null) continue;

			//logger.info("can not find protocolSignal with id:" + protocolSignal.getId());
			//logger.info("bigdata:" + protocolSignal.getBigdata() + " datatype:" + protocolSignal.getDataType());
			//logger.info("createdAt:" + protocolSignal.getCreatedAt() );
			
			String newProtocolSignalId = protocolSignalIdMapping.get(protocolSignal.getId());
			ProtocolSignal storage = new ProtocolSignal();
			storage.setId(newProtocolSignalId);
			storage.setFileName(protocolSignal.getFileName());
			storage.setDataType(protocolSignal.getDataType());
			storage.setBigdata(protocolSignal.getBigdata());
			storage.setCreatedAt(new Date(new Date().getTime()));
			storage.setOrganizationId(targetOrgId);
			this.ProtocolSignalDAO.addProtocolSignal(storage);
			logger.info("import protocolSignal, id:" + protocolSignal.getId() + " filename:" + protocolSignal.getFileName());
		}

		logger.info("import messageTemplates");

		for (MessageTemplate messageTemplate : projectPackage.messageTemplates)
		{
			MessageTemplate mt = this.MessageTemplateDAO.getMessageTemplate(messageTemplate.getProtocolId(), messageTemplate.getMessageName(), messageTemplate.getTemplateName());
			if (mt != null) continue;

			logger.info("id:" + messageTemplate.getId() + " templateName:" + messageTemplate.getTemplateName());
			mt = messageTemplate.Clone();			
			
			mt.setId(0);
			this.MessageTemplateDAO.addMessageTemplate(mt);
			logger.info("import messageTemplates, id:" + mt.getId() + " templateName:" + messageTemplate.getTemplateName());
		}
		

		// import MonitoringTestset
		for (MonitoringTestSet monitortingTestset : projectPackage.monitortingTestsets)
		{
			monitortingTestset.setProjectId(targetProjectId);
			this.monitoringTestSetDAO.addMonitoringTestSet(targetProjectId, monitortingTestset);
		}
		//import SpecialTest
		for (SpecialTest specialTest : projectPackage.specialTests)
		{
			specialTest.setProjectId(targetProjectId);
			this.specialTestDAO.addSpecialTest(targetProjectId, specialTest);
		}

		logger.info("import testset completed");
	}

	@Transactional
	public Project copyProjectWithinOrg(long sourceProjectId, long orgId) {
		
		// copy project content.
		Project sourceProject = this.ProjectDAO.getProjectById(sourceProjectId);
		
		// if (sourceProject.getTemplateType() == Project.NoneTemplateType) return;

		Project newProject = sourceProject.Clone();
		newProject.setId(0);
		newProject.setOrganizationId(orgId);
		newProject.setName(sourceProject.getName() + "_Copy");
		newProject.setTemplateType(Project.TemplateType_Default);
		Project project = this.addProject(newProject);

		// copy scriptgroup, script hierarchy, and script content.
		this.ProjectDAO.copyProjectData(sourceProjectId, project.getId());

		return project;
	}
	
	private List<ScriptGroupInfo> buildScriptGroupHierarchy(long projectId, boolean includeScript, boolean includeSubScript, boolean excludeSubScriptHasParameter) {

		List<ScriptGroupInfo> targetScriptGroups = new ArrayList<ScriptGroupInfo>();
		List<ScriptGroup> scriptGroupsInTopLevel = this.ScriptGroupDAO.listScriptGroupsInTopLevel(projectId);
		List<ScriptGroup> allScriptGroupCandidates = this.ScriptGroupDAO.listScriptGroups(projectId);
		List<ScriptInfo> allScriptInfoCandidates = this.ScriptDAO.listScriptInfos(projectId);

		for (ScriptGroup scriptGroup : scriptGroupsInTopLevel)
		{
			ScriptGroupInfo scriptGroupInfo = ScriptGroupInfoConverter.ConvertToScriptGroupInfo(scriptGroup);
			targetScriptGroups.add(scriptGroupInfo);
			buildChildScripGroupHierarchy(projectId, scriptGroup.getId(), scriptGroupInfo, 
					includeScript, includeSubScript, excludeSubScriptHasParameter,
					allScriptGroupCandidates, allScriptInfoCandidates);
		}
		return targetScriptGroups;
	}
	
	
	
	private void buildChildScripGroupHierarchy(long projectId, long parentScriptGroupId, ScriptGroupInfo scriptGroupInfo, 
			boolean includeScript, boolean includeSubScript, boolean excludeSubScriptHasParameter,
			List<ScriptGroup> allScriptGroupCandidates, List<ScriptInfo> allScriptCandidates) {
		
		//List<ScriptGroup> allScriptGroups = this.ScriptGroupDAO.listScriptGroupsByParentScriptGroupId(projectId, parentScriptGroupId);
		List<ScriptGroup> allScriptGroups = this.filterScriptGroups(allScriptGroupCandidates, c -> c.getParentScriptGroupId() == parentScriptGroupId);
	
		// LoggerFacade.info(String.format("buildChildScripGroupNew parentScriptGroupId- :%s", parentScriptGroupId));
		
		//List<ScriptInfo> allScriptInfos = this.ScriptDAO.listScriptInfosByParentScriptGroupId(projectId, parentScriptGroupId);
		List<ScriptInfo> allScriptInfos = this.filterScriptInfos(allScriptCandidates, c -> c.getParentScriptGroupId() == parentScriptGroupId);

		for (ScriptInfo script : allScriptInfos)
		{
				if (includeSubScript && ScriptType.SubScriptType.compareToIgnoreCase(script.getType()) == 0)
				{
					if (excludeSubScriptHasParameter && (script.getParameter() != null && script.getParameter().length() > 2))
					{
						continue;
					}
					scriptGroupInfo.getSubscripts().add(script);
				}
				
				if (includeScript && ScriptType.TestCaseType.compareToIgnoreCase(script.getType()) == 0)
				{				
					scriptGroupInfo.getScripts().add(script);
				}
			
		}
		
		for (ScriptGroup scriptGroup : allScriptGroups)
		{
			ScriptGroupInfo scriptGroupInfoChild = ScriptGroupInfoConverter.ConvertToScriptGroupInfo(scriptGroup);
				
			buildChildScripGroupHierarchy(projectId, scriptGroup.getId(), scriptGroupInfoChild, 
					includeScript, includeSubScript, excludeSubScriptHasParameter,
					allScriptGroupCandidates, allScriptCandidates);

			scriptGroupInfo.getScriptgroups().add(scriptGroupInfoChild);
		}
	}
	
    public ArrayList<ScriptGroup> filterScriptGroups(List<ScriptGroup> allScriptGroupCandidates, Predicate<ScriptGroup> scriptGroupPredicate) {
        ArrayList<ScriptGroup> toReturn = new ArrayList<>();
        for (ScriptGroup c : allScriptGroupCandidates
                            .stream()
                            .filter(scriptGroupPredicate)
                            .toArray(ScriptGroup[]::new)) {
            toReturn.add(c);
        }
        return toReturn;
    }

    public ArrayList<ScriptInfo> filterScriptInfos(List<ScriptInfo> allScriptInfoCandidates, Predicate<ScriptInfo> scriptInfoPredicate) {
        ArrayList<ScriptInfo> toReturn = new ArrayList<>();
        for (ScriptInfo c : allScriptInfoCandidates
                            .stream()
                            .filter(scriptInfoPredicate)
                            .toArray(ScriptInfo[]::new)) {
            toReturn.add(c);
        }
        return toReturn;
    }
  
	@Override
	public Project copyProjectCrossOrg(long sourceProjectId, long sourceOrgId, long targetOrgId) {
		// TODO Auto-generated method stub
		return null;
	}
}
