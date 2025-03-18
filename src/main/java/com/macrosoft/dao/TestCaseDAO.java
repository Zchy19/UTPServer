package com.macrosoft.dao;

import com.macrosoft.model.TestCase;

public interface TestCaseDAO {
    void addTestCase(TestCase testCase);
    void updateTestCase(TestCase testCase);
    TestCase getTestCaseById(long projectId, long id);
    void removeTestCase(long projectId, long id);
}
