package com.macrosoft.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.controller.dto.*;
import com.macrosoft.dao.*;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.*;
import com.macrosoft.model.composition.ScriptInfo;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.SubscriptReferenceService;
import com.macrosoft.utilities.FeaturesUtility;
import com.macrosoft.utilities.ParserResult;
import com.macrosoft.utilities.StringUtility;
import net.sf.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ScriptServiceImpl implements ScriptService {
    private static final ILogger logger = LoggerFactory.Create(ScriptServiceImpl.class.getName());
    private ProjectDAO projectDAO;
    private ScriptDAO ScriptDAO;
    private RequirementDAO requirementDAO;
    private SubscriptReferenceService subscriptReferenceService;
    private ScriptLinkDAO scriptLinkDAO;
    private TestSetDAO testSetDAO;
    private RecoverSubscriptReferenceDAO recoverSubscriptReferenceDAO;

    @Autowired
    public void setRequirementDAO(RequirementDAO requirementDAO) {
        this.requirementDAO = requirementDAO;
    }
    @Autowired
    public void setScriptDAO(ScriptDAO ScriptDAO) {
        this.ScriptDAO = ScriptDAO;
    }
    @Autowired
    public void setProjectDAO(ProjectDAO projectDAO) {
        this.projectDAO = projectDAO;
    }
    @Autowired
    public void setSubscriptReferenceService(SubscriptReferenceService subscriptReferenceService) {
        this.subscriptReferenceService = subscriptReferenceService;
    }
    @Autowired
    public void setScriptLinkDAO(ScriptLinkDAO scriptLinkDAO) {
        this.scriptLinkDAO = scriptLinkDAO;
    }
    @Autowired
    public void setTestSetDAO(TestSetDAO testSetDAO) {
        this.testSetDAO = testSetDAO;
    }
    @Autowired
    public void setRecoverSubscriptReferenceDAO(RecoverSubscriptReferenceDAO recoverSubscriptReferenceDAO) {
        this.recoverSubscriptReferenceDAO = recoverSubscriptReferenceDAO;
    }

    private UrsConfigurationImpl ursConfig;

    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }


    @Override
    @Transactional
    public Script addScript(long projectId, Script script) {

        // get next scriptid from project entity.
        Project project = projectDAO.getProjectById(projectId);
        long newScriptId = project.getNextEntityLogicId();

        project.setNextEntityLogicId(newScriptId + 1);
        projectDAO.updateProject(project);

        script.setId(newScriptId);

        // add script.
        Script resultScript = this.ScriptDAO.addScript(projectId, script);

        if (resultScript.getScript() == null) return resultScript;

        updateSubscriptReference(projectId, resultScript);
        return resultScript;
    }

    @Override
    @Transactional
    public Script updateScript(long projectId, Script script) {
        ScriptInfo existedScriptInfo = this.ScriptDAO.getScriptInfoById(projectId, script.getId());

        if (existedScriptInfo == null) return null;

        // reassign projectid in case of that project id has omitted to passed in.
        // script.setProjectId(existedScriptInfo.getProjectId());

        this.ScriptDAO.updateScript(projectId, script);
        List<SubscriptReference> references = subscriptReferenceService.listSubscriptReferencesByParentScriptId(projectId, script.getId());
        updateSubscriptReference(projectId, script);
        return script;
    }

    @Override
    @Transactional
    public List<ScriptInfo> listScriptInfosByParentScriptGroupId(long projectId, long parentScriptGroupId) {
        return this.ScriptDAO.listScriptInfosByParentScriptGroupId(projectId, parentScriptGroupId);
    }

    @Override
    @Transactional
    public List<Script> listScriptsByParentScriptGroupId(long projectId, long parentScriptGroupId) {
        return this.ScriptDAO.listScriptsByParentScriptGroupId(projectId, parentScriptGroupId);
    }

    @Override
    @Transactional
    public Script getScriptById(long projectId, long id) {
        return this.ScriptDAO.getScriptById(projectId, id);
    }

    @Override
    @Transactional
    public List<Script> getScriptsByScriptIds(long projectId, String scriptIds, String type) {
        return this.ScriptDAO.getScriptsByScriptIds(projectId, scriptIds, type);
    }

    @Override
    @Transactional
    public boolean isOverMaxScriptNum(long projectId, String modelName, String featureName) {
        JsonNode utpserverFeatures = FeaturesUtility.GetFeaturesByModule(ursConfig.getIpAddress(), modelName);
        //默认为15
        int count = 15;
        if (utpserverFeatures != null) {
            //获取配置文件中的值
            String configValue = FeaturesUtility.GetConfigValueByFeatureName(utpserverFeatures, featureName);
            if (configValue != null) {
                count = Integer.parseInt(configValue);
            }
        }
        if (count != -1) {
            List<ScriptInfo> scriptInfos = listScriptInfos(projectId);
            if (scriptInfos.size() >= count) {
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public boolean updateSubScript() {
        List<Script> subScripts = this.ScriptDAO.listSubScripts();
        for (Script subScript : subScripts) {
            String script = subScript.getScript();
            //判断script是否为空,或者script中是否包含"óòóò"
            if (script == null || script.contains("SUBSCRIPT_BEGIN")) {
                continue;
            }
            String blockyXml = subScript.getBlockyXml();
            String parameter = subScript.getParameter();
            String temp = "SUBSCRIPT_BEGIN```" + subScript.getName();
            if (parameter != null && !parameter.isEmpty()) {
                JSONArray jsonArray = JSONArray.fromObject(parameter);
                for (int i = 0; i < jsonArray.size(); i++) {
                    String param = jsonArray.getString(i);
                    temp += "```" + param;
                    //判断param首字符是不是"^"
                    if (param.startsWith("^")) {
                        //去除"^"
                        script = script.replace("%" + i + "%", param.substring(1));
                    } else {
                        blockyXml=blockyXml.replace("%" + param + "%", param);
                        //将script中的"óòóò"替换为"óòSUBSCRIPT_END"
                        script = script.replace("%" + i + "%", "$" + param);
                    }
                }
            }
            script = temp + script+"SUBSCRIPT_END";
            //将script中的"óòóò"替换为"óòSUBSCRIPT_END"
//            script = script.replace("óòóò", "óòSUBSCRIPT_END");
            subScript.setScript(script);
            subScript.setBlockyXml(blockyXml);
            this.ScriptDAO.updateScript(subScript.getProjectId(), subScript);
        }
        return true;

    }


    @Override
    @Transactional
    public void updateScript() {
        this.ScriptDAO.updateScript();
    }

    @Override
    @Transactional
    public ScriptCheckResult isAllSubScriptExist(long projectId, long scriptId) {
        // 使用一个集合来跟踪已经检查过的脚本 ID
        Set<Long> checkedScripts = new HashSet<>();
        return isAllSubScriptExistHelper(projectId, scriptId, checkedScripts, scriptId); // 传递初始脚本ID作为引用脚本ID
    }

    private ScriptCheckResult isAllSubScriptExistHelper(long projectId, long scriptId, Set<Long> checkedScripts, long referencingScriptId) {
        // 判断用例是否存在
        Script script = this.ScriptDAO.getScriptByScriptId(scriptId);
        if (script == null) return new ScriptCheckResult(true, scriptId, referencingScriptId);
        // 如果脚本 ID 已经在集合中，说明存在循环引用
        if (checkedScripts.contains(scriptId)) return new ScriptCheckResult(true, -scriptId, referencingScriptId); // 使用结果对象表示死循环
        // 将脚本 ID 添加到集合中
        checkedScripts.add(scriptId);
        // 根据 scriptId 获取所有子脚本引用
        List<SubscriptReference> subscriptReferences = this.subscriptReferenceService.listSubscriptReferencesByParentScriptId(projectId, scriptId);
        for (SubscriptReference subscriptReference : subscriptReferences) {
            // 判断子脚本是否存在
            Script subScript = this.ScriptDAO.getScriptById(projectId, subscriptReference.getSubscriptId());
            if (subScript == null) return new ScriptCheckResult(true, subscriptReference.getSubscriptId(), scriptId); // 返回引用不存在脚本的脚本ID
            // 递归判断子脚本的子脚本是否存在
            ScriptCheckResult result = isAllSubScriptExistHelper(projectId, subScript.getId(), checkedScripts, scriptId);
            if (result.hasIssue()) return result;
        }
        // 移除当前脚本 ID，确保后续检查不受影响
        checkedScripts.remove(scriptId);
        return new ScriptCheckResult(false, 0);
    }

    @Override
    @Transactional
    public Script getScriptByScriptId(long scriptId) {
        return this.ScriptDAO.getScriptByScriptId(scriptId);
    }

    @Override
    @Transactional
    public ScriptInfo getScriptInfoById(long projectId, long id) {
        return this.ScriptDAO.getScriptInfoById(projectId, id);
    }

    @Override
    @Transactional
    public ScriptInfo updateScriptInfo(long projectId, ScriptInfo scriptInfo) {
        Script existedScript = this.ScriptDAO.getScriptById(projectId, scriptInfo.getId());

        if (existedScript == null) return null;

        existedScript.setName(scriptInfo.getName());
        existedScript.setDescription(scriptInfo.getDescription());
        existedScript.setProjectId(scriptInfo.getProjectId());
        existedScript.setParentScriptGroupId(scriptInfo.getParentScriptGroupId());
        this.ScriptDAO.updateScript(projectId, existedScript);

        return scriptInfo;
    }

    @Override
    @Transactional
    public Script updateScriptInfo(long projectId, Script script) {
        Script existedScript = this.ScriptDAO.getScriptById(projectId, script.getId());

        if (existedScript == null) return null;

        existedScript.setName(script.getName());
        existedScript.setDescription(script.getDescription());
        existedScript.setProjectId(script.getProjectId());
        existedScript.setParentScriptGroupId(script.getParentScriptGroupId());
        this.ScriptDAO.updateScript(projectId, existedScript);

        return script;
    }

    @Override
    @Transactional
    public void renameScript(long projectId, long scriptId, String newName) {
        Script existedScript = this.ScriptDAO.getScriptById(projectId, scriptId);

        if (existedScript == null) return;

        existedScript.setName(newName);
        this.ScriptDAO.updateScript(projectId, existedScript);
    }


    @Override
    @Transactional
    public TransitToSubScriptResponse transitToSubscript(long projectId, long scriptId) {
        TransitToSubScriptResponse response = new TransitToSubScriptResponse();

        try {
            List<TestSet> referencedByTestsets = testSetDAO.findTestsetsByScriptId(projectId, scriptId);
            response.setReferencesByTestSet(referencedByTestsets);

            if (referencedByTestsets.isEmpty()) {
                this.ScriptDAO.transitToSubscript(projectId, scriptId);
                response.setState(TransitToSubScriptResponse.State_Success);
            } else {
                response.setState(TransitToSubScriptResponse.State_FailedByReference);
            }
        } catch (Exception ex) {
            logger.error("transitToSubscript", ex);
            response.setState(TransitToSubScriptResponse.State_UnknowError);
        }

        return response;
    }

    @Override
    @Transactional
    public TransitToScriptResponse transitToScript(long projectId, long subScriptId) {
        TransitToScriptResponse response = new TransitToScriptResponse();

        try {
            ScriptInfo scriptInfo = this.ScriptDAO.getScriptInfoById(projectId, subScriptId);

            // the parameter could be null , or []
            if (scriptInfo.getParameter() != null && scriptInfo.getParameter().length() > 2) {
                response.setState(TransitToScriptResponse.State_FailedByParameterNotEmpty);
                return response;
            }


            List<ScriptInfo> referencesByScript = this.ScriptDAO.findReferenceOfSubScriptByScripts(projectId, subScriptId);
            response.setReferencesByScript(referencesByScript);

            List<RecoverSubscriptReference> referencesByRecoverSubscript = this.recoverSubscriptReferenceDAO.findReferenceOfRecoverSubscriptBySubscriptId(projectId, subScriptId);
            response.setReferencesByRecoverSubscript(referencesByRecoverSubscript);

            if (referencesByScript.isEmpty() && referencesByRecoverSubscript.isEmpty()) {
                this.ScriptDAO.transitToScript(projectId, subScriptId);
                response.setState(TransitToSubScriptResponse.State_Success);
            } else {
                response.setState(TransitToScriptResponse.State_FailedByReference);
            }
        } catch (Exception ex) {
            logger.error("transitToScript", ex);
            response.setState(TransitToScriptResponse.State_UnknowError);
        }

        return response;
    }

    @Override
    @Transactional
    public List<ScriptInfo> listScriptInfos(long projectId, String type) {
        return this.ScriptDAO.listScriptInfos(projectId, type);
    }

    @Override
    @Transactional
    public List<ScriptInfo> listScriptInfos(long projectId) {
        return this.ScriptDAO.listScriptInfos(projectId);
    }

    @Override
    @Transactional
    public CheckScriptReferenceResponse checkScriptReference(long projectId, long scriptId) {

        CheckScriptReferenceResponse response = new CheckScriptReferenceResponse();

        try {
            List<TestSet> referencesByTestSet = this.testSetDAO.findTestsetsByScriptId(projectId, scriptId);
            response.setReferencesByTestSet(referencesByTestSet);
        } catch (Exception ex) {
            logger.error("checkScriptReference", ex);
        }

        return response;
    }


    @Override
    @Transactional
    public void forceDeleteScript(long projectId, long scriptId) {
        try {
            forceDeleteScriptCore(projectId, scriptId);
        } catch (Exception ex) {
            logger.error("forceDeleteScript", ex);
        }
    }


    @Override
    @Transactional
    public void forceDeleteScriptUnderScriptGroup(long projectId, long scriptGroupId) {
        try {
            List<ScriptInfo> scripts = this.ScriptDAO.listScriptInfosByParentScriptGroupId(projectId, scriptGroupId);
            for (ScriptInfo script : scripts) {
                long scriptId = script.getId();
                forceDeleteScriptCore(projectId, scriptId);
            }
        } catch (Exception ex) {
            logger.error("forceDeleteScriptUnderScriptGroup", ex);
        }
    }

    @Override
    @Transactional
    public DeleteScriptResponse deleteScript(long projectId, long scriptId) {

        DeleteScriptResponse response = new DeleteScriptResponse();

        try {
            List<TestSet> referencesByTestSet = this.testSetDAO.findTestsetsByScriptId(projectId, scriptId);
            response.setReferencesByTestSet(referencesByTestSet);

            if (referencesByTestSet.isEmpty()) {
                this.scriptLinkDAO.removeScriptLinkByScriptId(projectId, scriptId);
                this.subscriptReferenceService.removeSubscriptReferenceByScriptId(projectId, scriptId);
                this.ScriptDAO.removeScript(projectId, scriptId);

                this.requirementDAO.removeScriptRequirementMappingByScriptId(projectId, scriptId);

                response.setState(DeleteScriptResponse.State_Success);
            } else {
                response.setState(DeleteScriptResponse.State_FailedByReference);
            }
        } catch (Exception ex) {
            logger.error("deleteScript", ex);
            response.setState(DeleteScriptResponse.State_UnknowError);
        }

        return response;
    }


    @Override
    @Transactional
    public CheckSubscriptReferenceResponse checkSubScriptReference(long projectId, long subscriptId) {
        CheckSubscriptReferenceResponse response = new CheckSubscriptReferenceResponse();

        try {
            List<ScriptInfo> referencesByScript = this.ScriptDAO.findReferenceOfSubScriptByScripts(projectId, subscriptId);
            response.setReferencesByScript(referencesByScript);

            List<RecoverSubscriptReference> referencesByRecoverSubscript = this.recoverSubscriptReferenceDAO.findReferenceOfRecoverSubscriptBySubscriptId(projectId, subscriptId);
            response.setReferencesByRecoverSubscript(referencesByRecoverSubscript);

        } catch (Exception ex) {
            logger.error("checkSubScriptReference", ex);
        }

        return response;
    }


    @Override
    @Transactional
    public ScriptInfo cutPasteScript(long projectId, long sourceScriptId, long targetParentScriptGroupId) {

        try {
            ScriptInfo sourceScriptInfo = this.ScriptDAO.getScriptInfoById(projectId, sourceScriptId);
            if (sourceScriptInfo.getParentScriptGroupId() == targetParentScriptGroupId) return sourceScriptInfo;

            sourceScriptInfo.setName(GetNewScriptName(projectId, sourceScriptInfo.getName(), targetParentScriptGroupId));

            sourceScriptInfo.setParentScriptGroupId(targetParentScriptGroupId);
            this.updateScriptInfo(projectId, sourceScriptInfo);
            return sourceScriptInfo;
        } catch (Exception ex) {
            logger.error("cutPasteScript", ex);
            return null;
        }
    }

    @Override
    @Transactional
    public DeleteSubscriptResponse deleteSubScript(long projectId, long subscriptId) {

        DeleteSubscriptResponse response = new DeleteSubscriptResponse();

        try {
            List<ScriptInfo> referencesByScript = this.ScriptDAO.findReferenceOfSubScriptByScripts(projectId, subscriptId);
            response.setReferencesByScript(referencesByScript);

            List<RecoverSubscriptReference> referencesByRecoverSubscript =
                    this.recoverSubscriptReferenceDAO.findReferenceOfRecoverSubscriptBySubscriptId(projectId, subscriptId);
            response.setReferencesByRecoverSubscript(referencesByRecoverSubscript);

            if (referencesByScript.isEmpty() && referencesByRecoverSubscript.isEmpty()) {
                this.subscriptReferenceService.removeSubscriptReferenceBySubScriptId(projectId, subscriptId);
                this.ScriptDAO.removeScript(projectId, subscriptId);

                response.setState(DeleteSubscriptResponse.State_Success);
            } else {
                response.setState(DeleteSubscriptResponse.State_FailedByReference);
            }
        } catch (Exception ex) {
            logger.error("deleteSubScript", ex);
            response.setState(DeleteSubscriptResponse.State_UnknowError);
        }

        return response;
    }

    @Override
    @Transactional
    public Script copyPasteScript(long projectId, long sourceScriptId, long targetParentScriptGroupId) {

        try {
            Script sourceScript = this.ScriptDAO.getScriptById(projectId, sourceScriptId);

            String newScriptName = GetNewScriptName(projectId, sourceScript.getName(), targetParentScriptGroupId);

            Script newScript = copyScript(sourceScript, newScriptName, targetParentScriptGroupId);

            return newScript;
        } catch (Exception ex) {
            logger.error("copyPasteScript", ex);
            return null;
        }
    }

    @Override
    @Transactional
    public List<ScriptInfo> getExceptionRecoverCandidates(long projectId) {
        return this.ScriptDAO.getExceptionRecoverCandidates(projectId);
    }

    @Override
    @Transactional
    public void removeScriptsUnderScriptGroup(long projectId, long scriptGroupId) {
        List<ScriptInfo> scripts = this.ScriptDAO.listScriptInfosByParentScriptGroupId(projectId, scriptGroupId);
        for (ScriptInfo script : scripts) {
            if (ScriptType.SubScriptType.compareToIgnoreCase(script.getType()) == 0) {
                this.subscriptReferenceService.removeSubscriptReferenceBySubScriptId(projectId, script.getId());
                this.ScriptDAO.removeScript(projectId, script.getId());
                this.requirementDAO.removeScriptRequirementMappingByScriptId(projectId, script.getId());
            }

            if (ScriptType.TestCaseType.compareToIgnoreCase(script.getType()) == 0) {
                this.scriptLinkDAO.removeScriptLinkByScriptId(projectId, script.getId());
                this.subscriptReferenceService.removeSubscriptReferenceByScriptId(projectId, script.getId());
                this.ScriptDAO.removeScript(projectId, script.getId());
            }
        }
    }

    private void forceDeleteScriptCore(long projectId, long scriptId) {
        this.scriptLinkDAO.removeScriptLinkByScriptId(projectId, scriptId);
        this.requirementDAO.removeScriptRequirementMappingByScriptId(projectId, scriptId);
        this.subscriptReferenceService.removeSubscriptReferenceByScriptId(projectId, scriptId);
        this.ScriptDAO.removeScript(projectId, scriptId);

        this.recoverSubscriptReferenceDAO.removeRecoverSubscriptReference(projectId, scriptId);
    }


    private Script copyScript(Script sourceScript, String newScriptName, long targetParentScriptGroupId) {
        Script newScript = new Script();
        newScript.setName(newScriptName);
        newScript.setBlockyXml(sourceScript.getBlockyXml());
        newScript.setDescription(sourceScript.getDescription());
        newScript.setParameter(sourceScript.getParameter());
        newScript.setParentScriptGroupId(targetParentScriptGroupId);
        newScript.setProjectId(sourceScript.getProjectId());
        newScript.setScript(sourceScript.getScript());
        newScript.setType(sourceScript.getType());

        Script newCreatedScript = this.addScript(sourceScript.getProjectId(), newScript);
        return newCreatedScript;
    }


    private String GetNewScriptName(long projectId, String sourceScriptName, long targetParentScriptGroupId) {
        List<ScriptInfo> targetScriptGroupChildren = this.ScriptDAO.listScriptInfosByParentScriptGroupId(projectId, targetParentScriptGroupId);
        boolean foundSameNameInTargetScriptGroupChildren = false;
        for (ScriptInfo script : targetScriptGroupChildren) {
            if (script.getName().compareToIgnoreCase(sourceScriptName) == 0) {
                foundSameNameInTargetScriptGroupChildren = true;
                break;
            }
        }

        String newScriptName = sourceScriptName;
        if (foundSameNameInTargetScriptGroupChildren) {
            newScriptName = newScriptName + "_Copy";
        }
        return newScriptName;
    }


    private void updateSubscriptReference(long projectId, Script script) {
        if (script.getScript() == null || script.getScript().length() == 0) return;

        String[] commands = ScriptContentParser.getCommands(script.getScript());

        List<SubscriptReference> existingSubscriptReference = subscriptReferenceService.listSubscriptReferencesByParentScriptId(projectId, script.getId());

        logger.info(String.format("existingSubscriptReferences count is %s", existingSubscriptReference.size()));

        List<Long> currentSubscriptIdList = new ArrayList<Long>();

        for (String command : commands) {
            String[] splitedStrings = command.split(ScriptContentParser.CommandSeparator);
            if (splitedStrings.length <= 1) continue;

            if (ScriptContentParser.SUBSCRIPT_Command.compareToIgnoreCase(splitedStrings[0].trim()) != 0
                    && ScriptContentParser.GET_SCRIPT_CONTENT_Command.compareToIgnoreCase(splitedStrings[0].trim()) != 0) {
                continue;
            }

            String subscriptIdString = splitedStrings[1];

            ParserResult<Long> parserResult = StringUtility.parseLongSafely(subscriptIdString);
            if (!parserResult.isParserSuccess()) return;

            long subscriptId = parserResult.getResult();
            currentSubscriptIdList.add(subscriptId);

            if (!foundSubscriptReference(subscriptId, existingSubscriptReference)) {
                SubscriptReference subscriptReference = new SubscriptReference();
                subscriptReference.setParentScriptId(script.getId());
                subscriptReference.setSubscriptId(subscriptId);
                subscriptReferenceService.addSubscriptReference(projectId, subscriptReference);
            }
        }


        DeleteObsoleteSubscriptReference(projectId, currentSubscriptIdList, existingSubscriptReference);
    }

    private boolean foundSubscriptReference(long subscriptId, List<SubscriptReference> existingSubscriptReference) {
        boolean foundInExistsReference = false;
        for (SubscriptReference reference : existingSubscriptReference) {
            if (subscriptId == reference.getSubscriptId()) {
                foundInExistsReference = true;

                break;
            }
        }

        return foundInExistsReference;
    }

    private void DeleteObsoleteSubscriptReference(long projectId, List<Long> currentSubscriptIdList, List<SubscriptReference> existingSubscriptReference) {
        for (SubscriptReference subscriptReference : existingSubscriptReference) {
            boolean foundInList = false;
            for (Long subscriptId : currentSubscriptIdList) {
                if (subscriptId == subscriptReference.getSubscriptId()) {
                    foundInList = true;
                    break;
                }
            }

            if (!foundInList) {
                subscriptReferenceService.removeSubscriptReference(projectId, subscriptReference.getId());
            }
        }
    }
}
