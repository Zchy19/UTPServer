package com.macrosoft.service;

import com.macrosoft.controller.dto.TestCaseMessageInfo;
import com.macrosoft.model.TestCase;
import com.macrosoft.model.composition.TestCaseAggregate;
import com.macrosoft.model.composition.TestCaseInfo;

public interface TestCaseService {
    TestCase updateTestCase(TestCase testCase);

    TestCaseInfo updateTestCase(TestCaseInfo testCaseInfo);

    void removeTestCase(long projectId, long id);

    TestCase getTestCaseById(long projectId, long id);

    TestCaseMessageInfo createTestCase(TestCaseAggregate testCaseAggregate);
}
