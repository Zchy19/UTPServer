package com.macrosoft.service.impl;

import com.macrosoft.dao.TestCaseDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.TestCase;
import com.macrosoft.service.TestCaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestCaseServiceimpl implements TestCaseService {

    private static final ILogger logger = LoggerFactory.Create(TestCaseServiceimpl.class.getName());

    private TestCaseDAO testCaseDAO;

    public TestCaseServiceimpl(TestCaseDAO testCaseDAO) {
        this.testCaseDAO = testCaseDAO;
    }


    @Override
    @Transactional
    public TestCase addTestCase(TestCase testCase) {
        try {
            testCaseDAO.addTestCase(testCase);
            return testCase;
        } catch (Exception e) {
            logger.error("Error adding test case: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public TestCase updateTestCase(TestCase testCase) {
        try {
            testCaseDAO.updateTestCase(testCase);
            return testCase;
        } catch (Exception e) {
            logger.error("Error updating test case: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void removeTestCase(long projectId, long id) {
        try {
            testCaseDAO.removeTestCase(projectId, id);
        } catch (Exception e) {
            logger.error("Error removing test case: " + e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public TestCase getTestCaseById(long projectId, long id) {
        try {
            return testCaseDAO.getTestCaseById(projectId, id);
        } catch (Exception e) {
            logger.error("Error retrieving test case: " + e.getMessage());
            throw e;
        }
    }
}
