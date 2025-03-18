package com.macrosoft.controller.dto;

import com.macrosoft.model.composition.TestCaseAggregate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author: Zchy
 * @Description: 测试用例消息
 * @DateTime: 2025/3/18 10:52
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestCaseMessageInfo {
    private String message;
    private TestCaseAggregate testCaseAggregate;

    public TestCaseMessageInfo(TestCaseAggregate testCaseAggregate) {
        this.testCaseAggregate = testCaseAggregate;
    }

}
