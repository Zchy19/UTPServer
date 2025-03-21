package com.macrosoft.service.impl;

import com.macrosoft.dao.RunnableScriptDAO;
import com.macrosoft.model.RunnableScript;
import com.macrosoft.service.RunnableScriptService;
import com.macrosoft.service.ScriptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RunnableScriptServiceimpl implements RunnableScriptService {

    private RunnableScriptDAO runnableScriptDAO;
    private ScriptService scriptService;

    @Autowired
    public void setRunnableScriptDAO(RunnableScriptDAO runnableScriptDAO) {
        this.runnableScriptDAO = runnableScriptDAO;
    }

    @Autowired
    public void setScriptService(ScriptService scriptService) {
        this.scriptService = scriptService;
    }

    @Override
    @Transactional
    public RunnableScript addRunnableScript(RunnableScript runnableScript) {
        runnableScriptDAO.addRunnableScript(runnableScript);
        return runnableScript;
    }

    @Override
    @Transactional
    public RunnableScript updateRunnableScript(RunnableScript runnableScript) {
        runnableScriptDAO.updateRunnableScript(runnableScript);
        return runnableScript;
    }

    @Override
    @Transactional
    public RunnableScript getRunnableScriptById(long projectId, long scriptId) {
        return runnableScriptDAO.getRunnableScriptById(projectId, scriptId);
    }

    @Override
    @Transactional
    public void removeRunnableScript(long id) {
        runnableScriptDAO.removeRunnableScript(id);
    }
}
