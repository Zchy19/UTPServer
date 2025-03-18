package com.macrosoft.utp.adatper.utpengine.behaviors;

import com.macrosoft.model.ExecutionModel;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.utp.adatper.utpengine.UtpEngineController;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;

public class ExtendedAutoStartExecutionInterceptionBehavior extends AutoStartExecutionInterceptionBehavior
{
	public ExtendedAutoStartExecutionInterceptionBehavior(UtpEngineControllerManager utpEngineControllerManager,
			ExecutionStatusService executionStatusService, InterceptionBehavior nextInterceptionBehavior) {
		super(utpEngineControllerManager, executionStatusService, nextInterceptionBehavior);

	}

	public  void OnNotFoundMatchedAntbot(ExecutionModel executionModel, UtpEngineController utpEngineController)
	{
		executionModel.setStatus(ExecutionModel.State_AntbotNotFoundError);
		utpEngineController.DestroyEngine();;
	}
}
