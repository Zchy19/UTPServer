package com.macrosoft.model.composition;

import com.macrosoft.model.RunnableScript;
import com.macrosoft.model.Script;
import lombok.Builder;

/**
 * @Author: Zchy
 * @Description: 可运行脚本聚合对象
 * @DateTime: 2025/3/20 14:46
 **/
@Builder
public class RunnableScriptAggregate {
    private RunnableScript runnableScript;
    private Script script;

    public RunnableScriptAggregate(RunnableScript runnableScript, Script script) {
        this.runnableScript = runnableScript;
        this.script = script;
    }

    public RunnableScript getRunnableScript() {
        return runnableScript;
    }

    public void setRunnableScript(RunnableScript runnableScript) {
        this.runnableScript = runnableScript;
    }

    public Script getScript() {
        return script;
    }

    public void setScript(Script script) {
        this.script = script;
    }
}
