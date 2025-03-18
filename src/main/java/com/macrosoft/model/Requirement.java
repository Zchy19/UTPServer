package com.macrosoft.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table(name="Requirement")
public class Requirement implements Serializable {
	
	public static final String RequirementManageType_RequirementGroup = "requirementgroup";
	public static final String RequirementManageType_Requirement = "requirement";
	public static final String RequirementManageType_CheckPoint = "checkpoint";
	
	@Id
	@Column(name="id")
	private long id;

	@Id
	@Column(name="projectId")
	private long projectId;
	private String customizedId;
	private String title;
	private String description;
	private long parentId;
	private String comment;
	private String type;
	private boolean leaf;

	@Transient
	private int totalCount;
	@Transient
	private int referenceCount;
	@Transient
	private String coverage;
	
	private static final float DefaultCoveragePercentage = 0.0f;

	private float coveragePercentage = 0.0000f;
	
	private String customizedFields;
	
	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getProjectId() {
		return projectId;
	}

	public void setProjectId(long projectId) {
		this.projectId = projectId;
	}

	public String getCustomizedId() {
		return customizedId;
	}

	public void setCustomizedId(String customizedId) {
		this.customizedId = customizedId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public long getParentId() {
		return parentId;
	}

	public void setParentId(long parentId) {
		this.parentId = parentId;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public boolean getLeaf() {
		return leaf;
	}

	public void setLeaf(boolean leaf) {
		this.leaf = leaf;
	}


	public int getTotalCount() {
		return totalCount;
	}

	public void setTotalCount(int totalCount) {
		this.totalCount = totalCount;
	}

	public int getReferenceCount() {
		return referenceCount;
	}

	public void setReferenceCount(int referenceCount) {
		this.referenceCount = referenceCount;
	}
	
	public float getCoveragePercentage() {
		return coveragePercentage;
	}

	public void setCoveragePercentage(float coveragePercentage) {
		this.coveragePercentage = coveragePercentage;
	}

	public void setCoverage(String coverage) {
		this.coverage = coverage;
	}

	public String getCoverage() {
		return String.format("%.2f", coveragePercentage * 100) + "%";
	}
	
	public String getCustomizedFields() {
		return customizedFields;
	}

	public void setCustomizedFields(String customizedFields) {
		this.customizedFields = customizedFields;
	}
	
	public Requirement Clone()
	{
		Requirement requirement = new Requirement();
		requirement.setId(this.id);
		requirement.setProjectId(this.projectId);
		requirement.setCustomizedId(this.customizedId);
		requirement.setTitle(this.title);
		requirement.setDescription(this.description);
		requirement.setParentId(this.parentId);
		requirement.setComment(this.comment);
		requirement.setType(this.type);
		requirement.setLeaf(this.leaf);
		requirement.setCoveragePercentage(DefaultCoveragePercentage);
		requirement.setCustomizedFields(this.customizedFields);
		return requirement;
	}

	@Override
	public String toString(){
		return "id="+id+", projectId="+ this.projectId +", title="+this.title +", coveragePercentage="+this.coveragePercentage;
	}
}
