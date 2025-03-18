package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;


public class PauseExecutionInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(PauseExecutionInterceptionBehavior.class.getName());
	public PauseExecutionInterceptionBehavior(InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
	}

	@Override
	public void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException {
		boolean result = context.getUtpEngine().pauseExecution();
		logger.info(String.format("Call uptengine Pause returns %s.", result));
	}
}
