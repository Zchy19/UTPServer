package com.macrosoft.utp.adatper.utpengine.behaviors;


import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;


public class StopExecutionInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(StopExecutionInterceptionBehavior.class.getName());
	public StopExecutionInterceptionBehavior(InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
		
	}

	@Override
	public void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException {

		boolean result = context.getUtpEngine().stopExecution();
		logger.info(String.format("Call uptengine stop returns %s.", result));
	}
}
