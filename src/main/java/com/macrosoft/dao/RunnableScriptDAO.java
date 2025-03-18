package com.macrosoft.dao;

import com.macrosoft.model.RunnableScript;

public interface RunnableScriptDAO {
    void addRunnableScript(RunnableScript runnableScript);
    void updateRunnableScript(RunnableScript runnableScript);
    RunnableScript getRunnableScriptById(long id);
    void removeRunnableScript(long id);
}
