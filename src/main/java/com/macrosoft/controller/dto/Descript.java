package com.macrosoft.controller.dto;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;

public class Descript implements Serializable {
    private String projectName;
    private Long organizationId;
    private String[] testSetNames;

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String[] getTestSetNames() {
        return testSetNames;
    }

    public void setTestSetNames(String[] testSetNames) {
        this.testSetNames = testSetNames;
    }

    @Override
    public String toString() {
        return "Descript{" +
                "projectName='" + projectName + '\'' +
                ", testSetNames=" + Arrays.toString(testSetNames) +
                '}';
    }
}

