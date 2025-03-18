package com.macrosoft.service;

import com.macrosoft.model.TestCase;

public interface TestCaseService{
    public TestCase addTestCase(TestCase testCase);

    public TestCase updateTestCase(TestCase testCase);

    public void removeTestCase(long projectId, long id);

    public TestCase getTestCaseById(long projectId, long id);
}
