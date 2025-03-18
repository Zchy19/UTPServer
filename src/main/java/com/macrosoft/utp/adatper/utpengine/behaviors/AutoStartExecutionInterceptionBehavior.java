package com.macrosoft.utp.adatper.utpengine.behaviors;
import com.macrosoft.service.ExecutionModelUtility;
import com.macrosoft.service.ExecutionStatusService;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.SelectAntbotWraper;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineController;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotDictionary;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotInfo;
import com.macrosoft.utp.adatper.utpengine.dto.ScriptAntbotInfo;
import com.macrosoft.utp.adatper.utpengine.exception.StartExecutionException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;


public class AutoStartExecutionInterceptionBehavior extends InterceptionBehavior {
	private static final ILogger logger = LoggerFactory.Create(StartExecutionInterceptionBehavior.class.getName());

	private ExecutionStatusService executionStatusService;
	private UtpEngineControllerManager utpEngineControllerManager;
	
	public AutoStartExecutionInterceptionBehavior(UtpEngineControllerManager utpEngineControllerManager,
			ExecutionStatusService executionStatusService,
			InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);

		this.utpEngineControllerManager = utpEngineControllerManager;
		this.executionStatusService = executionStatusService;
	}

	@Override
	public void OnInvoke(ExecutionContext context) throws UtpCoreNetworkException, StartExecutionException, InterruptedException {
		logger.info(String.format("Auto Start execution begin."));
		String executionId = context.getExecutionId();
		ExecutionModel executioModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		if (!executioModel.getIsAutoRun()){

			return;
		}
		// Step2: check if meet auto execution condition.
		List<ScriptAntbotInfo> antbotInfos  = executioModel.getAntbotsDefinedInScript();
		for (ScriptAntbotInfo antbotInfo : antbotInfos)
		{
			logger.info(String.format("%s Script contains antbotName:%s ", executionId, antbotInfo.getAntbotName()));
		}

		List<LiveAntbotDictionary> liveAntbotDictionaryList = executioModel.getLiveAntbotDictionarys();
		
		String selectedTargetObjectId = null;
		List<SelectAntbotWraper> selectedLiveAntbotInfo = new ArrayList<SelectAntbotWraper>();
		for (LiveAntbotDictionary liveAntbotDictionary : liveAntbotDictionaryList)
		{
			boolean allAntbotFound = true;
			for (ScriptAntbotInfo antbotInfo : antbotInfos)
			{
				boolean foundAntbotCandidator = false;
				List<LiveAntbotInfo> liveAntbotInfos = liveAntbotDictionary.getAntbotInfos();
				for (LiveAntbotInfo liveAntbotInfo : liveAntbotInfos)
				{
					if (antbotInfo.getAntbotName().compareToIgnoreCase(liveAntbotInfo.getAntbotName()) == 0)
					{
						foundAntbotCandidator = true;
						SelectAntbotWraper selectedAntbotWraper = new SelectAntbotWraper();
						selectedAntbotWraper.setLiveAntbotInfo(liveAntbotInfo);
						selectedAntbotWraper.setScriptAntbotName(antbotInfo.getAntbotName());
						selectedLiveAntbotInfo.add(selectedAntbotWraper);
						break;
					}
				}
				
				if (!foundAntbotCandidator)
				{
					allAntbotFound = false;
					selectedLiveAntbotInfo.clear();
					break;
				}
			}
			
			if (allAntbotFound)
			{
				selectedTargetObjectId = liveAntbotDictionary.getTargetObjectId();
				break;
			}
		}
		
		if (selectedTargetObjectId == null || selectedLiveAntbotInfo.size() == 0)
		{
			logger.info(String.format("No avaiable live antbot found for Auto execution: executionId:%s", executionId));
			
			UtpEngineController utpEngineController = utpEngineControllerManager.GetEngineController(executionId);
			if (utpEngineController != null)
			{
				// release engine resource if no available antbot found.
				utpEngineController.tryReleaseEngine();
			}
			
			OnNotFoundMatchedAntbot(executioModel, utpEngineController);
			try {
				//
				throw new Exception( "No avaiable live antbot found for Auto execution: executionId:" + executionId);
			} catch (Exception e) {
				e.printStackTrace();
			}
			return;
		}

		// Step3: start execution
		StartExecutionParameter startExecutionParameter = new StartExecutionParameter();
		startExecutionParameter.setExecutionId(executionId);
		List<SelectedAntbotMapping> selectedAntbotMapping = new ArrayList<SelectedAntbotMapping>();
		for (SelectAntbotWraper selectedAntbotWapper : selectedLiveAntbotInfo)
		{
			SelectedAntbotMapping mapping = new SelectedAntbotMapping();
			mapping.setAntbotInstanceId(selectedAntbotWapper.getLiveAntbotInfo().getAntbotId());
			mapping.setAntbotName(selectedAntbotWapper.getScriptAntbotName());
			selectedAntbotMapping.add(mapping);
		}			
		startExecutionParameter.setSelectedAntbotMapping(selectedAntbotMapping);
		
		logger.info(String.format("startExecution - executionId:%s",startExecutionParameter.getExecutionId()));
		List<SelectedAntbotMapping> mappings = startExecutionParameter.getSelectedAntbotMapping();
		for (int i =0; i < mappings.size(); i++) {
			logger.info(String.format("%s startExecution - selectedAntbotId:%s selectedAntbotName: %s",executionId, mappings.get(i).getAntbotInstanceId(), mappings.get(i).getAntbotName()));			
		}
		
		//ExecutionModelUtility.SetTenantIdInThreadLocalByCache(startExecutionParameter.getExecutionId());		
		
		synchronized (StartExecutionInterceptionBehavior.startExecutionLocker)
		{
			executionStatusService.sp_startExecution(context.getExecutionId(), context.getExecutionName(), context.getTestObject(),  context.getProjectId(), context.getOrgId(), 
												context.getExecutedByUserId(), ExecutionStatus.Starting, context.getTestsetId(), context.isDummyRun(), executioModel.isTemporarySave(),executioModel.getEngineName(),executioModel.getEmailAddress());
		}
		logger.info(String.format("Added execution 'Started' status to database, executionId: %s", context.getExecutionId()));

		for (int i =0; i < selectedAntbotMapping.size(); i++) {
			logger.info(String.format("startExecution - selectedAntbotId:%s selectedAntbotName: %s",selectedAntbotMapping.get(i).getAntbotInstanceId(), selectedAntbotMapping.get(i).getAntbotName()));			
		}		
		
		context.getUtpEngine().startExecution(context.getExecutionId(), selectedAntbotMapping);

		logger.info(String.format("ExecutionId:%s, ExecutionName: %s, ProjectId: %s, OrgId: %s, ExecutedByUserId: %s, ScriptId: %s, isDummyRun: %s ",
					context.getExecutionId(), context.getExecutionName(), context.getProjectId(), context.getOrgId(), 
					context.getExecutedByUserId(), context.getScriptId(), context.isDummyRun()));
			
	}

	public void OnNotFoundMatchedAntbot(ExecutionModel executionModel, UtpEngineController utpEngineController)
	{
		executionModel.setStatus(ExecutionModel.State_AntbotNotFoundError);
		utpEngineController.DestroyEngine();;
	}
}
