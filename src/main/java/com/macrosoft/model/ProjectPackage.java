package com.macrosoft.model;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;


public class ProjectPackage implements java.io.Serializable
{
	private static final long serialVersionUID = -4188139671606316334L; // 确保这个值在所有版本中一致

	public Project project;
	public List<Requirement> requirements;
	public List<TestCaseRequirementMapping> testCaseRequirementMapping;
	public List<ScriptGroup> scriptGroups;
	public List<Script> scripts;
	public List<AgentConfig> agentConfigs;
	public List<SubscriptReference> subscriptReferences;
	public List<RecoverSubscriptReference> recoverSubscriptReference;
	public List<Recorder> recorders;
	public List<ProtocolSignal> protocolSignals;
	public List<BigData> bigDatas;
	public List<TestSet> testsets;
	public List<ScriptLink> scriptLinks;
	public List<MessageTemplate> messageTemplates;
	public List<MonitoringTestSet> monitortingTestsets;
	public List<SpecialTest> specialTests;

	// 自定义序列化
	private void writeObject(ObjectOutputStream out) throws IOException {
		out.defaultWriteObject(); // 默认序列化当前字段
	}

	// 自定义反序列化
	private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
		in.defaultReadObject(); // 默认反序列化当前字段
		// 如果 testCaseRequirementMapping 为空，尝试从旧字段名 scriptRequirementMapping 读取
		if (testCaseRequirementMapping == null) {
			try {
				ObjectInputStream.GetField fields = in.readFields();
				@SuppressWarnings("unchecked")
				List<TestCaseRequirementMapping> oldMapping =
						(List<TestCaseRequirementMapping>) fields.get("scriptRequirementMapping", null);
				if (oldMapping != null) {
					testCaseRequirementMapping = oldMapping; // 直接赋值给新字段
				}
			} catch (Exception e) {
				// 忽略异常，保持默认行为
				testCaseRequirementMapping = new ArrayList<>(); // 如果出错，初始化为空列表
			}
		}
	}

	public ProjectPackage Clone()
	{
		ProjectPackage projectPackage = new ProjectPackage();
		
		projectPackage.project = this.project.Clone();
		projectPackage.project.setId(0);
		

		projectPackage.requirements = new ArrayList<Requirement>();
		for (Requirement requirement : this.requirements)
		{
			projectPackage.requirements.add(requirement.Clone());
		}

		projectPackage.testCaseRequirementMapping = new ArrayList<TestCaseRequirementMapping>();
		for (TestCaseRequirementMapping mapping : this.testCaseRequirementMapping)
		{
			projectPackage.testCaseRequirementMapping.add(mapping.Clone());
		}
		
		projectPackage.scriptGroups = new ArrayList<ScriptGroup>();
		for (ScriptGroup scriptGroup : this.scriptGroups)
		{
			projectPackage.scriptGroups.add(scriptGroup.Clone());
		}

		
		projectPackage.scripts = new ArrayList<Script>();
		for (Script script : this.scripts)
		{
			projectPackage.scripts.add(script.Clone());
		}

		projectPackage.agentConfigs = new ArrayList<AgentConfig>();
		for (AgentConfig agentConfig : this.agentConfigs)
		{
			projectPackage.agentConfigs.add(agentConfig.Clone());
		}
		
		projectPackage.messageTemplates = new ArrayList<MessageTemplate>();
		for (MessageTemplate messageTemplate : this.messageTemplates)
		{
			projectPackage.messageTemplates.add(messageTemplate.Clone());
		}
		

		projectPackage.subscriptReferences = new ArrayList<SubscriptReference>();
		for (SubscriptReference subscriptReference : this.subscriptReferences)
		{
			SubscriptReference reference = subscriptReference.Clone();
			reference.setId(0);
			projectPackage.subscriptReferences.add(reference);
		}

		projectPackage.recoverSubscriptReference = new ArrayList<RecoverSubscriptReference>();
		for (RecoverSubscriptReference recoverSubscriptReference : this.recoverSubscriptReference)
		{
			projectPackage.recoverSubscriptReference.add(recoverSubscriptReference.Clone());
		}

		projectPackage.testsets = new ArrayList<TestSet>();
		for (TestSet testset : this.testsets)
		{
			projectPackage.testsets.add(testset.Clone());
		}
		
		projectPackage.monitortingTestsets = new ArrayList<MonitoringTestSet>();
		for (MonitoringTestSet monitoringTestset : this.monitortingTestsets)
		{
			projectPackage.monitortingTestsets.add(monitoringTestset.Clone());
		}
		projectPackage.specialTests = new ArrayList<SpecialTest>();

		for (SpecialTest specialTest : this.specialTests)
		{
			specialTest.setId(0);
			projectPackage.specialTests.add(specialTest.Clone());
		}
		
		projectPackage.scriptLinks = new ArrayList<ScriptLink>();
		for (ScriptLink scriptLink : this.scriptLinks)
		{
			projectPackage.scriptLinks.add(scriptLink.Clone());
		}

		projectPackage.recorders = new ArrayList<Recorder>();
		for (Recorder recorder : this.recorders)
		{
			projectPackage.recorders.add(recorder.Clone());
		}

		projectPackage.protocolSignals = new ArrayList<ProtocolSignal>();
		for (ProtocolSignal ProtocolSignal : this.protocolSignals)
		{
			projectPackage.protocolSignals.add(ProtocolSignal.Clone());
		}

		projectPackage.bigDatas = new ArrayList<BigData>();
		for (BigData bigData : this.bigDatas)
		{
			BigData newbigData = bigData.Clone();
			newbigData.setId(0);
			projectPackage.bigDatas.add(newbigData);
		}

		
		return projectPackage;
	}
}
