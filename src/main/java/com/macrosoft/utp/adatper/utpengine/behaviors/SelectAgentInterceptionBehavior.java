package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptException;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptFailedReason;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;

public class SelectAgentInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(SelectAgentInterceptionBehavior.class.getName());
	public SelectAgentInterceptionBehavior(InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);

	}

	@Override
	protected void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException, InterruptedException, AnalyzeScriptException {
		
		ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(context.getExecutionId());
		
		if (executionModel == null) return;
		
		if (ExecutionModel.State_AnalyzeScriptError.compareToIgnoreCase(executionModel.getStatus()) == 0) 
		{			
			AnalyzeScriptFailedReason reason = new AnalyzeScriptFailedReason();
			reason.setMessage(executionModel.getAnalyzeScriptError().getAnalyzeScriptFailedReason().getMessage());
			throw new AnalyzeScriptException(reason);	
		}
		
		logger.info(String.format("%s Start select agents.", context.getExecutionId()));
		
		context.getUtpEngine().getAvailableAgents(context, String.valueOf(context.getOrgId()));
		
		logger.info(String.format("%s getAvailableAgents completed.", context.getExecutionId()));

		
		// * disable to release engine when system not found available Antbot.
		// * reason is as following:
		// * 1. script could not contain any antbot 
		//*  2. script contain at least one antbot, but system can not detect any live available antbot.
/*		if (context.getLiveAntbotDictionarys().isEmpty())
		{
			IUtpEngineAdapter engine = context.getUtpEngine();
			if (engine != null)
			{
				// release engine resource if no available antbot found.
				engine.releaseEngine();
			}
		}
*/
	}
}
