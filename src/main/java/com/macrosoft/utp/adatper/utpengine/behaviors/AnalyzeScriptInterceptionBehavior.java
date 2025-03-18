package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptException;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptFailedReason;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;

public class AnalyzeScriptInterceptionBehavior extends InterceptionBehavior
{
	private static final ILogger logger = LoggerFactory.Create(AnalyzeScriptInterceptionBehavior.class.getName());
	public AnalyzeScriptInterceptionBehavior(InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
	}

	@Override
	protected void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException, AnalyzeScriptException, InterruptedException {

		ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(context.getExecutionId());
		
		if (executionModel == null) return;
		
		if (ExecutionModel.State_ConfigureError.compareToIgnoreCase(executionModel.getStatus()) == 0) 
		{			
			AnalyzeScriptFailedReason reason = new AnalyzeScriptFailedReason();
			reason.setMessage("config failed.");
			throw new AnalyzeScriptException(reason);	
		}
		
		logger.info(String.format("Start analysis script."));
		
		String analysisScriptRootId;
		if (context.getIsScriptGroupExecution()) {
			// the root id must be consistency with script id which be configured before.
			analysisScriptRootId = String.format("sg_%s", Long.toString(context.getScriptGroupId()));
		}
		else if (context.getIsTestsetExecution()||context.isScriptIdsExecution()) {
			// the root id must be consistency with script id which be configured before.
			analysisScriptRootId = String.format("ts_%s", Long.toString(context.getScriptIds()[0]));
		}
		else {
			analysisScriptRootId = String.format("%s", Long.toString(context.getScriptIds()[0]));
		}
		
		logger.info(String.format("analysisScriptRootId : %s",  analysisScriptRootId));
		context.getUtpEngine().analyzeScript(context.getProjectId(), analysisScriptRootId);


	}
}
