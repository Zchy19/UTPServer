package com.macrosoft.model;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.ArrayList;
import java.util.List;

public class ProjectPackage implements java.io.Serializable {
	private static final long serialVersionUID = -4188139671606316334L;

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

	// 自定义反序列化，兼容旧项目文件
	private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
		in.defaultReadObject(); // 默认反序列化当前字段

		// 1. 处理 testCaseRequirementMapping 的字段名变更
		if (testCaseRequirementMapping == null) {
			try {
				ObjectInputStream.GetField fields = in.readFields();
				@SuppressWarnings("unchecked")
				List<TestCaseRequirementMapping> oldMapping =
						(List<TestCaseRequirementMapping>) fields.get("scriptRequirementMapping", null);
				if (oldMapping != null) {
					testCaseRequirementMapping = oldMapping;
				} else {
					testCaseRequirementMapping = new ArrayList<>();
				}
			} catch (Exception e) {
				testCaseRequirementMapping = new ArrayList<>();
			}
		}

		// 2. 处理 scripts 列表中 Script 对象的字段变更
		if (scripts != null) {
			for (Script script : scripts) {
				// 如果 Script 类也有自定义反序列化，这里无需重复处理
				// 但如果 Script 未自定义 readObject，则需要手动调整字段
				// 假设 Script 未自定义，我们可以在此检查并设置默认值
				try {
					// 通过反射或假设 Script 有 getter/setter 处理
					if (script.getRwattribute() == null) {
						script.setRwattribute(null); // 新字段默认值
					}
					if (script.getDeclaredAntbots() == null) {
						script.setDeclaredAntbots(null); // 新字段默认值
					}
					if (script.getType() == "subscript") {
						script.setType("usrlogicblock");
					}
				} catch (Exception e) {
					// 如果字段访问失败，忽略或记录日志
				}
			}
		}

		// 3. 处理 project 的 Id 自增移除（假设 Project 类未自定义 readObject）
		if (project != null) {
			// 如果旧版本的 Id 是自增生成的，而新版本需要手动设置，可以在此检查
			// 这里假设无需特别处理，因为数据库已插入 Id=0 的记录
		}

		// 4. 处理 scriptGroups 的 Type 字段（假设 ScriptGroup 未自定义 readObject）
		if (scriptGroups != null) {
			for (ScriptGroup group : scriptGroups) {
				try {
					if (group.getType() == null) {
						group.setType("testcase"); // 设置默认值，与数据库一致
					}
				} catch (Exception e) {
					// 如果字段访问失败，忽略或记录日志
				}
			}
		}
	}

	// Clone 方法保持不变
	public ProjectPackage Clone() {
		ProjectPackage projectPackage = new ProjectPackage();

		projectPackage.project = this.project.Clone();
		projectPackage.project.setId(0);

		projectPackage.requirements = new ArrayList<Requirement>();
		for (Requirement requirement : this.requirements) {
			projectPackage.requirements.add(requirement.Clone());
		}

		projectPackage.testCaseRequirementMapping = new ArrayList<TestCaseRequirementMapping>();
		for (TestCaseRequirementMapping mapping : this.testCaseRequirementMapping) {
			projectPackage.testCaseRequirementMapping.add(mapping.Clone());
		}

		projectPackage.scriptGroups = new ArrayList<ScriptGroup>();
		for (ScriptGroup scriptGroup : this.scriptGroups) {
			projectPackage.scriptGroups.add(scriptGroup.Clone());
		}

		projectPackage.scripts = new ArrayList<Script>();
		for (Script script : this.scripts) {
			projectPackage.scripts.add(script.Clone());
		}

		projectPackage.agentConfigs = new ArrayList<AgentConfig>();
		for (AgentConfig agentConfig : this.agentConfigs) {
			projectPackage.agentConfigs.add(agentConfig.Clone());
		}

		projectPackage.messageTemplates = new ArrayList<MessageTemplate>();
		for (MessageTemplate messageTemplate : this.messageTemplates) {
			projectPackage.messageTemplates.add(messageTemplate.Clone());
		}

		projectPackage.subscriptReferences = new ArrayList<SubscriptReference>();
		for (SubscriptReference subscriptReference : this.subscriptReferences) {
			SubscriptReference reference = subscriptReference.Clone();
			reference.setId(0);
			projectPackage.subscriptReferences.add(reference);
		}

		projectPackage.recoverSubscriptReference = new ArrayList<RecoverSubscriptReference>();
		for (RecoverSubscriptReference recoverSubscriptReference : this.recoverSubscriptReference) {
			projectPackage.recoverSubscriptReference.add(recoverSubscriptReference.Clone());
		}

		projectPackage.testsets = new ArrayList<TestSet>();
		for (TestSet testset : this.testsets) {
			projectPackage.testsets.add(testset.Clone());
		}

		projectPackage.monitortingTestsets = new ArrayList<MonitoringTestSet>();
		for (MonitoringTestSet monitoringTestset : this.monitortingTestsets) {
			projectPackage.monitortingTestsets.add(monitoringTestset.Clone());
		}
		projectPackage.specialTests = new ArrayList<SpecialTest>();
		for (SpecialTest specialTest : this.specialTests) {
			specialTest.setId(0);
			projectPackage.specialTests.add(specialTest.Clone());
		}

		projectPackage.scriptLinks = new ArrayList<ScriptLink>();
		for (ScriptLink scriptLink : this.scriptLinks) {
			projectPackage.scriptLinks.add(scriptLink.Clone());
		}

		projectPackage.recorders = new ArrayList<Recorder>();
		for (Recorder recorder : this.recorders) {
			projectPackage.recorders.add(recorder.Clone());
		}

		projectPackage.protocolSignals = new ArrayList<ProtocolSignal>();
		for (ProtocolSignal protocolSignal : this.protocolSignals) {
			projectPackage.protocolSignals.add(protocolSignal.Clone());
		}

		projectPackage.bigDatas = new ArrayList<BigData>();
		for (BigData bigData : this.bigDatas) {
			BigData newbigData = bigData.Clone();
			newbigData.setId(0);
			projectPackage.bigDatas.add(newbigData);
		}

		return projectPackage;
	}
}