package com.macrosoft.controller.dto;

import com.macrosoft.model.composition.TestCaseInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * @Author: Zchy
 * @Description: 测试用例组信息
 * @DateTime: 2025/3/21 11:03
 **/
@NoArgsConstructor
@Data
@Builder
@AllArgsConstructor
public class TestCaseGroupInfo {

    private long id;
    private long projectId;
    private String name;
    private String description;
    private List<TestCaseGroupInfo> testCaseGroupInfos = new ArrayList<>();
    private List<TestCaseInfo> testCaseInfos = new ArrayList<>();
    private List<TestCaseInfo> subTestCaseInfos = new ArrayList<>();

}
