package com.macrosoft.service;

import com.macrosoft.model.RunnableScript;

public interface RunnableScriptService {
    RunnableScript addRunnableScript(RunnableScript runnableScript);

    RunnableScript updateRunnableScript(RunnableScript runnableScript);

    RunnableScript getRunnableScriptById(long id);

    void removeRunnableScript(long id);
}
