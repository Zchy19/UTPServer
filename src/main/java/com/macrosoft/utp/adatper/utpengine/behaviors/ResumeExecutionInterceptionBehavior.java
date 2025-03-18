package com.macrosoft.utp.adatper.utpengine.behaviors;


import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;

public class ResumeExecutionInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(ResumeExecutionInterceptionBehavior.class.getName());
	public ResumeExecutionInterceptionBehavior(InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
	}

	@Override
	public void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException {
		boolean result = context.getUtpEngine().resumeExecution();
		logger.info(String.format("Call uptengine Resume returns %s.", result));
	}
}
