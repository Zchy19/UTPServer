package com.macrosoft.controller;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.service.RunnableScriptService;
import com.macrosoft.service.ScriptService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author: Zchy
 * @Description: 运行脚本controller层
 * @DateTime: 2025/3/20 14:41
 **/
@RestController
@RequestMapping("/api/runnablescript")
public class RunnableScriptController {
    private static final ILogger logger = LoggerFactory.Create(TestCaseController.class.getName());

    private RunnableScriptService runnableScriptService;
    private ScriptService scriptService;

    public RunnableScriptController(RunnableScriptService runnableScriptService, ScriptService scriptService) {
        this.runnableScriptService = runnableScriptService;
        this.scriptService = scriptService;
    }

//    @GetMapping(value = "/{projectId}/{scriptId}")
//    public ApiResponse<RunnableScriptAggregate> getRunnableScriptById(@PathVariable("projectId") long projectId,
//                                                                @PathVariable("scriptId") long scriptId) {
//        try {
//            RunnableScript runnableScriptById = runnableScriptService.getRunnableScriptById(projectId, scriptId);
//            Script script = scriptService.getScriptById(projectId, scriptId);
//            RunnableScriptAggregate runnableScriptAggregate = RunnableScriptAggregate.builder()
//                    .runnableScript(runnableScriptById)
//                    .script(script)
//                    .build();
//            return new ApiResponse<RunnableScriptAggregate>(ApiResponse.Success, runnableScriptAggregate);
//        } catch (Exception ex) {
//            logger.error(String.format("getRunnableScriptById has exception - :%s", ex.toString()));
//            return new ApiResponse<RunnableScriptAggregate>(ApiResponse.UnHandleException, null);
//        }
//    }
//
//    @RequestMapping(value = "/api/testcase/create", method = RequestMethod.POST)
//    public @ResponseBody ApiResponse<TestCaseMessageInfo> createTestCase(@RequestBody TestCaseAggregate testCaseAggregate) {
//        try {
//            boolean isMaxScriptNum = this.scriptService.isOverMaxScriptNum(testCaseAggregate.getScript().getProjectId(), "utpserver", "utpserver.script.count");
//            if (isMaxScriptNum) {
//                TestCaseMessageInfo testCaseMessageInfo = TestCaseMessageInfo.builder()
//                        .message("OVER_MAX_SCRIPT_NUM")
//                        .build();
//                return new ApiResponse<TestCaseMessageInfo>(ApiResponse.UnHandleException, testCaseMessageInfo);
//            }
//            testCaseAggregate.getScript().setType(ScriptType.TestCaseType);
//            Script script = this.scriptService.addScript(testCaseAggregate.getScript().getProjectId(), testCaseAggregate.getScript());
//            TestCase testCase = testCaseService.addTestCase(testCaseAggregate.getTestCase());
//            TestCaseMessageInfo testCaseMessageInfo = TestCaseMessageInfo.builder()
//                    .message("CREATE_SUCCESS")
//                    .testCaseAggregate(TestCaseAggregate.builder()
//                            .testCase(testCase)
//                            .script(script)
//                            .build())
//                    .build();
//            return new ApiResponse<TestCaseMessageInfo>(ApiResponse.Success,testCaseMessageInfo);
//        } catch (Exception ex) {
//            logger.error("createScriptInfo", ex);
//            return new ApiResponse<TestCaseMessageInfo>(ApiResponse.UnHandleException, null);
//        }
//    }
}
