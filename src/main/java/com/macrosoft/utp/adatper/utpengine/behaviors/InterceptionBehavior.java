package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptException;
import com.macrosoft.utp.adatper.utpengine.exception.ConfigEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.CreateUtpEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.StartExecutionException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;

public abstract class InterceptionBehavior
{
    private InterceptionBehavior nextInterceptionBehavior;

    protected InterceptionBehavior(InterceptionBehavior nextInterceptionBehavior)
    {
        this.nextInterceptionBehavior = nextInterceptionBehavior;
    }

    protected InterceptionBehavior getNextInterceptionBehavior()
    {
        return nextInterceptionBehavior;
    }

    public void Invoke(ExecutionContext context) throws CreateUtpEngineException, UtpCoreNetworkException, ConfigEngineException, StartExecutionException, AnalyzeScriptException, InterruptedException
    {
    	OnInvoke(context);
    	
    	if (nextInterceptionBehavior != null)
    	{
    		nextInterceptionBehavior.Invoke(context);
    	}
    }
    protected abstract void OnInvoke(ExecutionContext context) throws CreateUtpEngineException, UtpCoreNetworkException, ConfigEngineException, StartExecutionException, AnalyzeScriptException, InterruptedException;
}
