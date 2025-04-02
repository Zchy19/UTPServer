package com.macrosoft.service.impl;

import com.macrosoft.controller.dto.TestCaseMessageInfo;
import com.macrosoft.dao.TestCaseDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptType;
import com.macrosoft.model.TestCase;
import com.macrosoft.model.composition.TestCaseAggregate;
import com.macrosoft.model.composition.TestCaseInfo;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.TestCaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestCaseServiceimpl implements TestCaseService {

    private static final ILogger logger = LoggerFactory.Create(TestCaseServiceimpl.class.getName());

    private TestCaseDAO testCaseDAO;
    private ScriptService scriptService;

    public TestCaseServiceimpl(TestCaseDAO testCaseDAO, ScriptService scriptService) {
        this.testCaseDAO = testCaseDAO;
        this.scriptService = scriptService;
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
    public TestCaseInfo updateTestCase(TestCaseInfo testCaseInfo) {
        try {
            TestCase testCase = TestCase.builder()
                        .id(testCaseInfo.getScriptInfo().getId())
                        .projectId(testCaseInfo.getScriptInfo().getProjectId())
                        .userTestCaseId(testCaseInfo.getUserTestCaseId())
                        .customizedFileds(testCaseInfo.getCustomizedFileds())
                        .build();
            testCaseDAO.updateTestCase(testCase);
            return testCaseInfo;
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

    @Override
    public TestCaseMessageInfo createTestCase(TestCaseAggregate testCaseAggregate) {
        long projectId = testCaseAggregate.getScript().getProjectId();
        boolean isMaxScriptNum = scriptService.isOverMaxScriptNum(projectId, "utpserver", "utpserver.script.count");
        if (isMaxScriptNum) {
            return TestCaseMessageInfo.builder()
                    .message("OVER_MAX_SCRIPT_NUM")
                    .build();
        }
        testCaseAggregate.getScript().setType(ScriptType.TestCaseType);
        Script script = scriptService.addScript(projectId, testCaseAggregate.getScript());
        TestCase testCase = addTestCase(testCaseAggregate.getTestCase());
        return TestCaseMessageInfo.builder()
                .message("CREATE_SUCCESS")
                .testCaseAggregate(TestCaseAggregate.builder()
                        .testCase(testCase)
                        .script(script)
                        .build())
                .build();
    }
}
