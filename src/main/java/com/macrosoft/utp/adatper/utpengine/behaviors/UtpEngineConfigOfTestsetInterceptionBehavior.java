package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.utp.adatper.utpengine.IUtpEngineAdapter;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.ConfigEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.CreateUtpEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;


public class UtpEngineConfigOfTestsetInterceptionBehavior extends InterceptionBehavior
{
	private IUtpEngineAdapter engine;
	private UtpEngineControllerManager utpEngineControllerManager;
	private String executionId;
	private long recoverSubscriptReferenceId;

	  public UtpEngineConfigOfTestsetInterceptionBehavior(UtpEngineControllerManager utpEngineControllerManager, String executionId, long recoverSubscriptReferenceId, InterceptionBehavior nextInterceptionBehavior) {
			super(nextInterceptionBehavior);
			
			this.utpEngineControllerManager = utpEngineControllerManager;
			this.executionId = executionId;
			this.recoverSubscriptReferenceId = recoverSubscriptReferenceId;
		}

		@Override
		protected void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException, ConfigEngineException, CreateUtpEngineException, InterruptedException {

			engine = utpEngineControllerManager.GetEngineController(executionId).getEngine();

			if (engine == null)
			{
				throw new CreateUtpEngineException();
			}
			
			boolean result = engine.configEngineByTestsetId(context.getProjectId(), context.getTestsetId(), recoverSubscriptReferenceId);
			
			context.setUtpEngine(engine);
		}
}

