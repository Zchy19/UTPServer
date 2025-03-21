package com.macrosoft.model.composition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author: Zchy
 * @Description: 测试用例信息实体
 * @DateTime: 2025/3/18 16:56
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestCaseInfo {
    private ScriptInfo scriptInfo;
    private Integer userTestCaseId;
    private String customizedFileds;
}
