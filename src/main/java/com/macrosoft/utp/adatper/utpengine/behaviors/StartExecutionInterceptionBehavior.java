package com.macrosoft.utp.adatper.utpengine.behaviors;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.service.ExecutionStatusService;

import java.util.List;

import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.StartExecutionException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;

public class StartExecutionInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(StartExecutionInterceptionBehavior.class.getName());
	public static Object startExecutionLocker = new Object();
	private List<SelectedAntbotMapping> selectedAntbotMapping;
	private ExecutionStatusService executionStatusService;
	
	public StartExecutionInterceptionBehavior(List<SelectedAntbotMapping> selectedAntbotMapping, ExecutionStatusService executionStatusService,
			InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);

		this.executionStatusService = executionStatusService;
		this.selectedAntbotMapping = selectedAntbotMapping;
	}

	@Override
	public void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException, StartExecutionException, InterruptedException {
		logger.info(String.format("Start execution begin."));

		synchronized (startExecutionLocker)
		{
			ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(context.getExecutionId());
			//if ()
			//this.ExecutionStatusDAO.saveExecutionAsTemporarySave(executionId);

			executionStatusService.sp_startExecution(context.getExecutionId(), context.getExecutionName(), context.getTestObject(),  context.getProjectId(), context.getOrgId(), 
												context.getExecutedByUserId(), ExecutionStatus.Starting, context.getTestsetId(), context.isDummyRun(), executionModel.isTemporarySave(),executionModel.getEngineName(),executionModel.getEmailAddress());

		}


		logger.info(String.format("Added execution 'Started' status to database, executionId: %s", context.getExecutionId()));

		for (int i =0; i < selectedAntbotMapping.size(); i++) {
			logger.info(String.format("startExecution - selectedAntbotId:%s selectedAntbotName: %s",selectedAntbotMapping.get(i).getAntbotInstanceId(), selectedAntbotMapping.get(i).getAntbotName()));			
		}
		
		
		context.getUtpEngine().startExecution(context.getExecutionId(), selectedAntbotMapping);

		logger.info(String.format("ExecutionId:%s, ExecutionName: %s, ProjectId: %s, OrgId: %s, ExecutedByUserId: %s, TestsetId: %s, isDummyRun: %s ",
					context.getExecutionId(), context.getExecutionName(), context.getProjectId(), context.getOrgId(), 
					context.getExecutedByUserId(), context.getTestsetId(), context.isDummyRun()));
			
	}

}
