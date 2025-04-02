package com.macrosoft.controller;

import com.macrosoft.controller.dto.CheckScriptReferenceResponse;
import com.macrosoft.controller.dto.DeleteScriptResponse;
import com.macrosoft.controller.dto.ScriptGroupAndScriptFlatData;
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
import com.macrosoft.model.composition.TestCaseInfo;
import com.macrosoft.service.ScriptGroupService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.TestCaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 测试用例管理控制器
 * 负责处理测试用例相关的API请求，包括创建、删除、修改、查询等操作
 *
 * @author zou chao
 */
@RestController
@RequestMapping("/api/testcase")
public class TestCaseController {

    private static final ILogger logger = LoggerFactory.Create(TestCaseController.class.getName());

    private final TestCaseService testCaseService;
    private final ScriptService scriptService;
    private final ScriptGroupService scriptGroupService;

    @Autowired
    public TestCaseController(TestCaseService testCaseService, ScriptService scriptService, ScriptGroupService scriptGroupService) {
        this.testCaseService = testCaseService;
        this.scriptService = scriptService;
        this.scriptGroupService = scriptGroupService;
    }

    /**
     * 获取指定测试用例的聚合信息
     * @param projectId 项目ID
     * @param scriptId 脚本ID
     * @return 包含测试用例聚合信息的API响应
     */
    @GetMapping("/{projectId}/{scriptId}")
    public ApiResponse<TestCaseAggregate> getTestCaseInfo(@PathVariable("projectId") long projectId,
                                                          @PathVariable("scriptId") long scriptId) {
        try {
            TestCase testCase = testCaseService.getTestCaseById(projectId, scriptId);
            Script script = scriptService.getScriptById(projectId, scriptId);
            TestCaseAggregate testCaseAggregate = TestCaseAggregate.builder()
                    .testCase(testCase)
                    .script(script)
                    .build();
            return new ApiResponse<>(ApiResponse.Success, testCaseAggregate);
        } catch (Exception ex) {
            logger.error(String.format("getTestCaseInfoById has exception - :%s", ex.toString()));
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 创建新的测试用例
     * @param testCaseAggregate 测试用例聚合对象，包含脚本和测试用例信息
     * @return 包含创建结果的API响应
     */
    @PostMapping("/create")
    public ApiResponse<TestCaseMessageInfo> createTestCase(@RequestBody TestCaseAggregate testCaseAggregate) {
        try {
            TestCaseMessageInfo testCaseMessageInfo = testCaseService.createTestCase(testCaseAggregate);
            return new ApiResponse<>(ApiResponse.Success, testCaseMessageInfo);
        } catch (Exception ex) {
            logger.error("createTestCase", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 删除指定测试用例
     * @param projectId 项目ID
     * @param scriptId 脚本ID
     * @return 包含删除结果的API响应
     */
    @PostMapping("/delete/{projectId}/{scriptId}")
    public ApiResponse<DeleteScriptResponse> deleteTestCase(@PathVariable("projectId") long projectId,
                                                            @PathVariable("scriptId") long scriptId) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteTestCase");
            DeleteScriptResponse result = scriptService.deleteScript(projectId, scriptId);
            testCaseService.removeTestCase(projectId, scriptId);
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("deleteTestCase", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 检查测试用例的引用关系
     * @param projectId 项目ID
     * @param scriptId 脚本ID
     * @return 包含引用检查结果的API响应
     */
    @GetMapping("/reference/{projectId}/{scriptId}")
    public ApiResponse<CheckScriptReferenceResponse> checkScriptReference(@PathVariable("projectId") long projectId,
                                                                          @PathVariable("scriptId") long scriptId) {
        try {
            CheckScriptReferenceResponse result = scriptService.checkScriptReference(projectId, scriptId);
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("checkScriptReference", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 更新测试用例信息
     * @param testCaseInfo 测试用例信息对象
     * @return 包含更新后测试用例信息的API响应
     */
    @PostMapping("/update")
    public ApiResponse<TestCaseInfo> editTestCaseInfo(@RequestBody TestCaseInfo testCaseInfo) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editTestCaseInfo");
            ScriptInfo scriptInfo = scriptService.updateScriptInfo(testCaseInfo.getScriptInfo().getProjectId(),
                    testCaseInfo.getScriptInfo());
            TestCaseInfo result = testCaseService.updateTestCase(testCaseInfo);
            result.setScriptInfo(scriptInfo);
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("editTestCaseInfo", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 重命名测试用例
     * @param testCaseInfo 包含新名称的测试用例信息对象
     * @return 包含重命名后测试用例信息的API响应
     */
    @PostMapping("/rename")
    public ApiResponse<TestCaseInfo> renameTestCaseInfo(@RequestBody TestCaseInfo testCaseInfo) {
        try {
            ScriptInfo scriptInfo = testCaseInfo.getScriptInfo();
            scriptService.renameScript(scriptInfo.getProjectId(), scriptInfo.getId(), scriptInfo.getName());
            return new ApiResponse<>(ApiResponse.Success, testCaseInfo);
        } catch (Exception ex) {
            logger.error("renameTestCaseInfo", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 获取项目下所有测试用例信息
     * @param projectId 项目ID
     * @return 包含测试用例信息列表的API响应
     */
    @GetMapping("/getByProjectId/{projectId}")
    public ApiResponse<List<TestCaseInfo>> getTestCaseInfosByProjectId(@PathVariable("projectId") long projectId) {
        try {
            List<ScriptInfo> scriptInfos = scriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
            List<TestCaseInfo> result = scriptInfos.stream()
                    .map(scriptInfo -> {
                        TestCase testCase = testCaseService.getTestCaseById(projectId, scriptInfo.getId());
                        return testCase != null ? TestCaseInfo.builder()
                                .scriptInfo(scriptInfo)
                                .userTestCaseId(testCase.getUserTestCaseId())
                                .customizedFileds(testCase.getCustomizedFileds())
                                .build() : null;
                    })
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getTestCaseInfosByProjectId", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 获取项目的测试用例和脚本组的平面数据
     * @param projectId 项目ID
     * @return 包含测试用例和脚本组数据的API响应
     */
    @GetMapping("/scriptFlatData/getByProjectId/{projectId}")
    public ApiResponse<ScriptGroupAndScriptFlatData> getScriptFlatData(@PathVariable("projectId") long projectId) {
        try {
            ScriptGroupAndScriptFlatData result = new ScriptGroupAndScriptFlatData();
            result.scripts = scriptService.listScriptInfos(projectId, ScriptType.TestCaseType);
            result.scriptGroups = scriptGroupService.listScriptGroups(projectId);
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("getScriptFlatData", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 复制测试用例到指定脚本组
     * @param projectId 项目ID
     * @param sourceScriptId 源脚本ID
     * @param targetParentScriptGroupId 目标脚本组ID
     * @return 包含复制后脚本信息的API响应
     */
    @PostMapping("/copy/{projectId}/{sourceScriptId}/{targetParentScriptGroupId}")
    public ApiResponse<ScriptInfo> copyScript(@PathVariable("projectId") long projectId,
                                              @PathVariable("sourceScriptId") long sourceScriptId,
                                              @PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
        try {
            boolean isMaxScriptNum = scriptService.isOverMaxScriptNum(projectId, "utpserver", "utpserver.script.count");
            if (isMaxScriptNum) {
                ScriptInfo scriptInfo = new ScriptInfo();
                scriptInfo.setErrorMessages("OVER_MAX_SCRIPT_NUM");
                return new ApiResponse<>(ApiResponse.UnHandleException, scriptInfo);
            }
            Script script = scriptService.copyPasteScript(projectId, sourceScriptId, targetParentScriptGroupId);
            ScriptInfo result = scriptService.getScriptInfoById(projectId, script.getId());
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("copyScript", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 剪切测试用例到指定脚本组
     * @param projectId 项目ID
     * @param sourceScriptId 源脚本ID
     * @param targetParentScriptGroupId 目标脚本组ID
     * @return 包含剪切后脚本信息的API响应
     */
    @PostMapping("/cut/{projectId}/{sourceScriptId}/{targetParentScriptGroupId}")
    public ApiResponse<ScriptInfo> cutScript(@PathVariable("projectId") long projectId,
                                             @PathVariable("sourceScriptId") long sourceScriptId,
                                             @PathVariable("targetParentScriptGroupId") long targetParentScriptGroupId) {
        try {
            ScriptInfo result = scriptService.cutPasteScript(projectId, sourceScriptId, targetParentScriptGroupId);
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("cutScript", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 获取测试用例详细数据
     * @param projectId 项目ID
     * @param scriptId 脚本ID
     * @return 包含测试用例详细数据的API响应
     */
    @GetMapping("/data/{projectId}/{scriptId}")
    public ApiResponse<TestCaseAggregate> getTestCaseData(@PathVariable("projectId") long projectId,
                                                          @PathVariable("scriptId") long scriptId) {
        try {
            Script script = scriptService.getScriptById(projectId, scriptId);
            TestCase testCase = testCaseService.getTestCaseById(projectId, scriptId);
            TestCaseAggregate testCaseAggregate = TestCaseAggregate.builder()
                    .script(script)
                    .testCase(testCase)
                    .build();
            return new ApiResponse<>(ApiResponse.Success, testCaseAggregate);
        } catch (Exception ex) {
            logger.error("getTestCaseData", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 根据脚本ID列表获取多个测试用例数据
     * @param projectId 项目ID
     * @param scriptIds 脚本ID数组
     * @return 包含脚本数据列表的API响应
     */
    @GetMapping("/data/byScriptIds/{projectId}/{scriptIds}")
    public ApiResponse<List<Script>> getScriptsByScriptIds(@PathVariable("projectId") long projectId,
                                                           @PathVariable("scriptIds") Long[] scriptIds) {
        try {
            String sIds = Arrays.stream(scriptIds)
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            List<Script> scripts = scriptService.getScriptsByScriptIds(projectId, sIds, ScriptType.TestCaseType);
            return new ApiResponse<>(ApiResponse.Success, scripts);
        } catch (Exception ex) {
            logger.error("getScriptsByScriptIds", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }

    /**
     * 更新测试用例数据
     * @param testCaseAggregate 包含更新数据的测试用例聚合对象
     * @return 包含更新后测试用例聚合的API响应
     */
    @PostMapping("/data/update")
    public ApiResponse<TestCaseAggregate> editTestCaseData(@RequestBody TestCaseAggregate testCaseAggregate) {
        try {
            TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editTestCaseData");
            testCaseAggregate.getScript().setType(ScriptType.TestCaseType);
            scriptService.updateScript(testCaseAggregate.getScript().getProjectId(), testCaseAggregate.getScript());
            TestCase testCase = testCaseService.updateTestCase(testCaseAggregate.getTestCase());
            TestCaseAggregate result = TestCaseAggregate.builder()
                    .script(testCaseAggregate.getScript())
                    .testCase(testCase)
                    .build();
            return new ApiResponse<>(ApiResponse.Success, result);
        } catch (Exception ex) {
            logger.error("editTestCaseData", ex);
            return new ApiResponse<>(ApiResponse.UnHandleException, null);
        }
    }
}