package com.macrosoft.model;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="TestSet")
public class TestSet implements Serializable{

	@Id
	@Column(name="id")
	private long id;
	
	@Id
	@Column(name="projectId")
	private long projectId;
	private String name;
	private String engineName;
	private String description;
	private Integer activate;

	public Integer getActivate() {
		return activate;
	}

	public void setActivate(Integer activate) {
		this.activate = activate;
	}

	public String getEngineName() {
		return engineName;
	}

	public void setEngineName(String engineName) {
		this.engineName = engineName;
	}

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
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public TestSet Clone()
	{
		TestSet testset = new TestSet();
		testset.setId(this.id);
		testset.setDescription(this.description);
		testset.setName(this.name);
		testset.setEngineName(this.engineName);
		testset.setProjectId(this.projectId);
		testset.setActivate(this.activate);
		return testset;
	}
	
	@Override
	public String toString(){
		return "id="+id+", name="+name+", description="+description;
	}
}
