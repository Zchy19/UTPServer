package com.macrosoft.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * @description testcase
 * @author Zou Chao
 * @date 2025-03-18
 */
@Entity
@Data
@Table(name="TestCase")
@Builder
@AllArgsConstructor
public class TestCase implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    /**
    * 脚本ID，主键，用于唯一标识每个测试脚本
    */
    @Column(name="id")
    private Long id;

    /**
    * 项目ID，主键，与脚本关联的项目编号
    */
    @Column(name="projectId")
    private Long projectId;

    /**
    * 用户测试用例ID，关联到用户的测试用例编号，可为空
    */
    @Column(name="userTestCaseId")
    private Integer userTestCaseId;

    /**
    * 自定义字段，存储额外的自定义信息，最长255字符
    */
    @Column(name="customizedFileds")
    private String customizedFileds;

    public TestCase() {
    }

}