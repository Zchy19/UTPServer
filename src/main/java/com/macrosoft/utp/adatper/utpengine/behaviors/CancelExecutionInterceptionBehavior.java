package com.macrosoft.utp.adatper.utpengine.behaviors;


import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;


public class CancelExecutionInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(CancelExecutionInterceptionBehavior.class.getName());
	public CancelExecutionInterceptionBehavior(InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
		
	}

	@Override
	public void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException {

		context.getUtpEngine().releaseEngine();
		logger.info("release uptengine by cancel execution.");
	}
}
