package com.macrosoft.model;


import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name="SpecialTest")
public class SpecialTest implements Serializable {
    @Id
    @Column(name="id")
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private long id;

    @Column(name="projectId")
    private long projectId;
    private String name;
    private String description;
    private long scriptId;
    private Integer type;
    private String autoIntoUserName;
    //private byte isParallel;
    private Integer subpageNumber;
    private Integer isParallel;

    public Integer getIsParallel() {
        return isParallel;
    }

    public void setIsParallel(Integer isParallel) {
        this.isParallel = isParallel;
    }

    public String getAutoIntoUserName() {
        return autoIntoUserName;
    }

    public void setAutoIntoUserName(String autoIntoUserName) {
        this.autoIntoUserName = autoIntoUserName;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
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

    public long getScriptId() {
        return scriptId;
    }

    public void setScriptId(long scriptId) {
        this.scriptId = scriptId;
    }



    public Integer getSubpageNumber() {
        return subpageNumber;
    }

    public void setSubpageNumber(Integer subpageNumber) {
        this.subpageNumber = subpageNumber;
    }

    public SpecialTest Clone() {
        SpecialTest specialTest = new SpecialTest();
        specialTest.setId(this.id);
        specialTest.setProjectId(this.projectId);
        specialTest.setName(this.name);
        specialTest.setDescription(this.description);
        specialTest.setScriptId(this.scriptId);
        specialTest.setType(this.type);
        specialTest.setIsParallel(this.isParallel);
        specialTest.setSubpageNumber(this.subpageNumber);

        //specialTest.setAutoIntoUserName(this.autoIntoUserName);
        return specialTest;
    }

    public String toString() {
        return "id="+id+", projectId="+projectId+", name="+name+", description="+description+", scriptId="+scriptId;
    }

}