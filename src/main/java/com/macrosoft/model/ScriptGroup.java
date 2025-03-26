package com.macrosoft.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 *
 * @author david
 */
@Entity
@Table(name = "ScriptGroup")
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScriptGroup implements Serializable {

    @Id
    @Column(name = "id")
    private long id;
    @Id
    @Column(name = "projectId")
    private long projectId;
    private String name;
    private long parentScriptGroupId;
    private String type;
    private String description;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getParentScriptGroupId() {
        return parentScriptGroupId;
    }

    public void setParentScriptGroupId(long parentScriptGroupId) {
        this.parentScriptGroupId = parentScriptGroupId;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public ScriptGroup Clone() {
        ScriptGroup newScriptGroup = new ScriptGroup();
        newScriptGroup.setId(this.id);
        newScriptGroup.setDescription(this.description);
        newScriptGroup.setName(this.name);
        newScriptGroup.setParentScriptGroupId(this.parentScriptGroupId);
        newScriptGroup.setProjectId(this.projectId);
		newScriptGroup.setType(this.type);
        return newScriptGroup;
    }

    @Override
    public String toString() {
        return "id=" + id + ", name=" + name + ", parentScriptGroupId=" + parentScriptGroupId;
    }
}
