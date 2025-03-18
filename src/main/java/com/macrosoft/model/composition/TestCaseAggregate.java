package com.macrosoft.model.composition;

import com.macrosoft.model.Script;
import com.macrosoft.model.TestCase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @Author: Zchy
 * @Description: testcase聚合对象
 * @DateTime: 2025/3/18 10:05
 **/
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TestCaseAggregate {
    private Script script;
    private TestCase testCase;
}
