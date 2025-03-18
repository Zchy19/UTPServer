package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adatper.utpengine.IUtpEngineAdapter;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.ConfigEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.CreateUtpEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;

public class UtpEngineConfigInterceptionBehavior extends InterceptionBehavior
{
	private static final ILogger logger = LoggerFactory.Create(UtpEngineConfigInterceptionBehavior.class.getName());
	private IUtpEngineAdapter engine;
	private UtpEngineControllerManager utpEngineControllerManager;
	private String executionId;
	
  public UtpEngineConfigInterceptionBehavior(UtpEngineControllerManager utpEngineControllerManager, String executionId, InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
		
		this.utpEngineControllerManager = utpEngineControllerManager;
		this.executionId = executionId;
	}

	@Override
	protected void OnInvoke(ExecutionContext context) throws CreateUtpEngineException, UtpCoreNetworkException, ConfigEngineException, InterruptedException {

		engine = utpEngineControllerManager.GetEngineController(executionId).getEngine();
		
		if (engine == null)
		{
			throw new CreateUtpEngineException();
		}
		
		engine.configEngine(context.getProjectId(), context.getScriptId());
		context.setUtpEngine(engine);
	}
}


