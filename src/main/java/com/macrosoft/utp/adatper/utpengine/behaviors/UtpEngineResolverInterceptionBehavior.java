package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.utp.adatper.utpengine.IUtpEngineAdapter;
import com.macrosoft.utp.adatper.utpengine.UtpEngineController;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;

public class UtpEngineResolverInterceptionBehavior extends InterceptionBehavior
{
	private IUtpEngineAdapter engine;
	private UtpEngineControllerManager utpEngineControllerManager;
	private String executionId;
	
	// commented for manually test, will be open before going to live.

	
  public UtpEngineResolverInterceptionBehavior(UtpEngineControllerManager utpEngineControllerManager, String executionId, InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
		
		this.utpEngineControllerManager = utpEngineControllerManager;
		this.executionId = executionId;
	}

	@Override
	protected void OnInvoke(ExecutionContext context) {

		UtpEngineController controller = utpEngineControllerManager.GetEngineController(executionId);
		
		controller.setOrgId(context.getOrgId());
		controller.setExecutedByUserId(context.getExecutedByUserId());
		controller.setExecutionName(context.getExecutionName());
		controller.setTestsetId(context.getTestsetId());
		
		engine = controller.getEngine();

		context.setUtpEngine(engine);
		context.setDummyRun(controller.isDummyRun());
	}
}


