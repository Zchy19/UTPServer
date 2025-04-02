package com.macrosoft.service;

import com.macrosoft.controller.dto.TestCaseMessageInfo;
import com.macrosoft.model.TestCase;
import com.macrosoft.model.composition.TestCaseAggregate;
import com.macrosoft.model.composition.TestCaseInfo;

public interface TestCaseService{
    public TestCase addTestCase(TestCase testCase);

    public TestCase updateTestCase(TestCase testCase);

    public TestCaseInfo updateTestCase(TestCaseInfo testCaseInfo);

    public void removeTestCase(long projectId, long id);

    public TestCase getTestCaseById(long projectId, long id);

    public TestCaseMessageInfo createTestCase(TestCaseAggregate testCaseAggregate);
}
