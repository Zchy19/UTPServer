package com.macrosoft.model;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name="TestCaseRequirementMapping")
public class TestCaseRequirementMapping implements Serializable {
	
	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;

	private long scriptId;
	private long requirementId;
	private long projectId;
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public long getScriptId() {
		return scriptId;
	}
	public void setScriptId(long scriptId) {
		this.scriptId = scriptId;
	}
	public long getRequirementId() {
		return requirementId;
	}
	public void setRequirementId(long requirementId) {
		this.requirementId = requirementId;
	}
	public long getProjectId() {
		return projectId;
	}
	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}
	

	public TestCaseRequirementMapping Clone()
	{
		TestCaseRequirementMapping mapping = new TestCaseRequirementMapping();
		mapping.setId(this.id);
		mapping.setScriptId(this.scriptId);
		mapping.setRequirementId(this.requirementId);
		mapping.setProjectId(this.projectId);

		return mapping;
	}
}
