package com.macrosoft.controller;

import com.macrosoft.controller.dto.CheckScriptReferenceResponse;
import com.macrosoft.controller.dto.DeleteScriptResponse;
import com.macrosoft.controller.dto.TestCaseMessageInfo;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptType;
import com.macrosoft.model.TestCase;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.model.composition.TestCaseAggregate;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.TestCaseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TestCaseController {

    private static final ILogger logger = LoggerFactory.Create(TestCaseController.class.getName());

    private TestCaseService testCaseService;
    private ScriptService scriptService;

    public TestCaseController(TestCaseService testCaseService, ScriptService scriptService) {
        this.testCaseService = testCaseService;
        this.scriptService = scriptService;
    }

    @RequestMapping(value = "/api/testcase/{projectId}/{scriptId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<TestCaseAggregate> getTestCaseInfo(@PathVariable("projectId") long projectId,
                                                                        @PathVariable("scriptId") long scriptId) {
        try {
            TestCase testCase = testCaseService.getTestCaseById(projectId, scriptId);
            Script script = scriptService.getScriptById(projectId, scriptId);
            TestCaseAggregate testCaseAggregate = TestCaseAggregate.builder()
                    .testCase(testCase)
                    .script(script)
                    .build();
            return new ApiResponse<TestCaseAggregate>(ApiResponse.Success, testCaseAggregate);
        } catch (Exception ex) {
            logger.error(String.format("getTestCaseInfoById has exception - :%s", ex.toString()));
            return new ApiResponse<TestCaseAggregate>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testcase/create", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<TestCaseMessageInfo> createTestCase(@RequestBody TestCaseAggregate testCaseAggregate) {
        try {
            boolean isMaxScriptNum = this.scriptService.isOverMaxScriptNum(testCaseAggregate.getScript().getProjectId(), "utpserver", "utpserver.script.count");
            if (isMaxScriptNum) {
                TestCaseMessageInfo testCaseMessageInfo = TestCaseMessageInfo.builder()
                        .message("OVER_MAX_SCRIPT_NUM")
                        .build();
                return new ApiResponse<TestCaseMessageInfo>(ApiResponse.UnHandleException, testCaseMessageInfo);
            }
            testCaseAggregate.getScript().setType(ScriptType.TestCaseType);
            Script script = this.scriptService.addScript(testCaseAggregate.getScript().getProjectId(), testCaseAggregate.getScript());
            TestCase testCase = testCaseService.addTestCase(testCaseAggregate.getTestCase());
            TestCaseMessageInfo testCaseMessageInfo = TestCaseMessageInfo.builder()
                    .message("CREATE_SUCCESS")
                    .testCaseAggregate(TestCaseAggregate.builder()
                            .testCase(testCase)
                            .script(script)
                            .build())
                    .build();
            return new ApiResponse<TestCaseMessageInfo>(ApiResponse.Success,testCaseMessageInfo);
        } catch (Exception ex) {
            logger.error("createScriptInfo", ex);
            return new ApiResponse<TestCaseMessageInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testcase/delete/{projectId}/{scriptId}", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<DeleteScriptResponse> deleteTestCase(@PathVariable("projectId") long projectId,
                                                                        @PathVariable("scriptId") long scriptId) {

        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteTestCase");
            DeleteScriptResponse result = this.scriptService.deleteScript(projectId, scriptId);
            testCaseService.removeTestCase(projectId, scriptId);
            return new ApiResponse<DeleteScriptResponse>(ApiResponse.Success,result);
        } catch (Exception ex) {
            logger.error("deleteScript", ex);
            return new ApiResponse<DeleteScriptResponse>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testcase/reference/{projectId}/{scriptId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<CheckScriptReferenceResponse> checkScriptReference(@PathVariable("projectId") long projectId,
                                                                                        @PathVariable("scriptId") long scriptId) {

        try {
            CheckScriptReferenceResponse result = this.scriptService.checkScriptReference(projectId, scriptId);
            return new ApiResponse<CheckScriptReferenceResponse>(ApiResponse.Success,result);
        } catch (Exception ex) {
            logger.error("checkScriptReference", ex);
            return new ApiResponse<CheckScriptReferenceResponse>(ApiResponse.UnHandleException, null);
        }
    }

    //todo 返回对象有问题
    @RequestMapping(value = "/api/testcase/update", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<Script> editTestCaseInfo(@RequestBody TestCaseAggregate testCaseAggregate) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editScriptInfo");

            Script script = testCaseAggregate.getScript();
            TestCase testCase = testCaseAggregate.getTestCase();

            Script result = this.scriptService.updateScriptInfo(script.getProjectId(), script);
            testCaseService.updateTestCase(testCaseAggregate.getTestCase());
            return new ApiResponse<Script>(ApiResponse.Success,result);

        } catch (Exception ex) {
            logger.error("editScriptInfo", ex);
            return new ApiResponse<Script>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testcase/rename", method = RequestMethod.POST)
    public @ResponseBody ApiResponse<ScriptInfo> renameScriptInfo(@RequestBody ScriptInfo scriptInfo) {
        try {
            this.scriptService.renameScript(scriptInfo.getProjectId(), scriptInfo.getId(), scriptInfo.getName());
            ScriptInfo result = this.scriptService.getScriptInfoById(scriptInfo.getProjectId(), scriptInfo.getId());
            return new ApiResponse<ScriptInfo>(ApiResponse.Success,result);
        } catch (Exception ex) {
            logger.error("renameScriptInfo", ex);
            return new ApiResponse<ScriptInfo>(ApiResponse.UnHandleException, null);
        }
    }

    @RequestMapping(value = "/api/testcase/getByProjectId/{projectId}", method = RequestMethod.GET)
    public @ResponseBody ApiResponse<List<ScriptInfo>> getScriptInfosByProjectId(@PathVariable("projectId") long projectId) {
        try {
            List<ScriptInfo> result = this.mScriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
            return new ApiResponse<List<ScriptInfo>>(ApiResponse.Success,result);

        } catch (Exception ex) {
            logger.error("getScriptInfosByProjectId", ex);
            return new ApiResponse<List<ScriptInfo>>(ApiResponse.UnHandleException, null);
        }
    }


}
