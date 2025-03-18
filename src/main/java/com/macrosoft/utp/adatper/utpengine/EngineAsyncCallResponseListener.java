package com.macrosoft.utp.adatper.utpengine;

import java.util.ArrayList;
import java.util.List;

import com.macrosoft.controller.dto.AnalyzeScriptError;
import com.macrosoft.controller.dto.StartExecutionError;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.Script;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.service.MonitorExecutionModelUtility;
import com.macrosoft.service.MonitoringExecutionService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.utilities.ManualResetEvent;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotDictionary;
import com.macrosoft.utp.adatper.utpengine.dto.LiveAntbotInfo;
import com.macrosoft.utp.adatper.utpengine.dto.ScriptAntbotInfo;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptException;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptFailedReason;
import com.macrosoft.utp.adatper.utpengine.exception.AntbotFailReason;
import com.macrosoft.utp.adatper.utpengine.exception.StartExecutionException;
import com.macrosoftsys.UtpCoreAccessLib.*;

public class EngineAsyncCallResponseListener extends IAsyncCallResponseListener {
	private static final ILogger logger = LoggerFactory.Create(EngineAsyncCallResponseListener.class.getName());
	
	private ScriptService scriptService;
	private MonitoringExecutionService monitoringExecutionService;
	private IUtpEngineAdapter utpEngineAdapter;
	private ExecutionModel executionModel;
	private ManualResetEvent waitHandleForExecution;
	
	public EngineAsyncCallResponseListener(ScriptService scriptService, MonitoringExecutionService monitoringExecutionService, IUtpEngineAdapter utpEngineAdapter, ExecutionModel executionModel, ManualResetEvent waitHandleForExecution) {
		super();
		
		this.scriptService = scriptService;
		this.monitoringExecutionService = monitoringExecutionService;
		this.utpEngineAdapter = utpEngineAdapter;
		this.executionModel = executionModel;
		this.waitHandleForExecution = waitHandleForExecution;
	}

	public void initEngineResponse(BoolInvokeResult initEngineResult, long engineSessionId) {
		try
		{
			boolean result = initEngineResult.getBoolResult();
			logger.info(String.format("engineSessionId: %s, initEngineResponse : %s.", Long.toString(engineSessionId), result));
			if (result)
			{
				this.executionModel.setStatus(ExecutionModel.State_EngineInitialized);
//				this.executionModel.setEngineSessionId(engineSessionId);

				
				
//				ExecutionModelManager.getInstance().SaveExecutionModel(this.executionModel);
			}			
			else
			{
				this.utpEngineAdapter.releaseEngine();
			}
		}
		catch (Exception ex)
		{
			logger.error("initEngineResponse", ex);
		}
		finally
		{
			waitHandleForExecution.set();
		}
	}

	public void configEngineResponse(BoolInvokeResult configEngineResult, long engineSessionId) {
		try
		{
			logger.info(String.format("engineSessionId: %s, configEngineResponse : %s.", Long.toString(engineSessionId), configEngineResult.getBoolResult()));
			if (configEngineResult.getBoolResult())
			{
				this.executionModel.setStatus(ExecutionModel.State_EngineConfigured);
			}
			else
			{
				this.executionModel.setStatus(ExecutionModel.State_ConfigureError);
				this.utpEngineAdapter.releaseEngine();
				
				// update monitor execution status if needs.
				String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
				monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_ConfigureError);
			}
		}
		catch (Exception ex)
		{
			logger.error("configEngineResponse", ex);
		}
		finally
		{
			waitHandleForExecution.set();
		}
	}

	public void analyzeScriptResponse(AnalyzeInvokeResult analyzeInvokeResult, long engineSessionId) {
		try
		{
			logger.info(String.format("engineSessionId: %s, analyzeScriptResponse : %s.", Long.toString(engineSessionId), analyzeInvokeResult.getBoolResult()));
			
			if (analyzeInvokeResult.getBoolResult())
			{
				this.executionModel.setStatus(ExecutionModel.State_ScriptAnalyzed);
			}
			else
			{
				logger.info(String.format("analyzeScript : %s.", AnalyzeScriptException.ErrorMessage));
				AnalyzeScriptFailedReason analyzeScriptFailedReason = new AnalyzeScriptFailedReason();
				analyzeScriptFailedReason.setErrorline(analyzeInvokeResult.getIndex());
				analyzeScriptFailedReason.setScriptId(analyzeInvokeResult.getScriptId());
				analyzeScriptFailedReason.setMessage(analyzeInvokeResult.getErrMsg());
				logger.info(String.format("analysis error message: %s", analyzeInvokeResult.getErrMsg()));

				try
				{
					TenantContext.setTenantId(Long.toString(this.executionModel.getTenantId()));
					Script script = scriptService.getScriptById(this.executionModel.getProjectId(), Long.parseLong(analyzeInvokeResult.getScriptId()));
					analyzeScriptFailedReason.setScriptName(script.getName());
				}
				catch (Exception ex)
				{
					logger.error(String.format("Failed to get script name, which analyze failed.: %s", ex.toString()));
				}
				AnalyzeScriptError analyzeScriptError = new AnalyzeScriptError(analyzeScriptFailedReason);
				analyzeScriptError.setAnalyzeScriptFailedReason(analyzeScriptFailedReason);

				this.executionModel.setAnalyzeScriptError(analyzeScriptError);
				
				this.executionModel.setStatus(ExecutionModel.State_AnalyzeScriptError);
				// ThrowAnalyzeScriptException(analyzeScriptFailedReason);

				this.utpEngineAdapter.releaseEngine();

				// update monitor execution status if needs.
				String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
				monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_AnalyzeScriptError);
			}
		}
		catch (Exception ex)
		{
			logger.error("analyzeScriptResponse", ex);
		}
		finally
		{
			waitHandleForExecution.set();
		}
	}

	public void getAvailableAgentsResponse(ScriptAgentVector scriptAgents, AgentLiveListVector availableAgents, long engineSessionId) {
		try
		{
			logger.info(String.format("engineSessionId: %s, getAvailableAgentsResponse.", Long.toString(engineSessionId)));
			
			List<LiveAntbotDictionary> liveAgentInfoDictionarys = new ArrayList<LiveAntbotDictionary>();
			List<ScriptAntbotInfo> scriptAntbotInfos = new ArrayList<ScriptAntbotInfo>();
			
			for (int i = 0; i < availableAgents.size(); ++i) {
				AgentLiveList agentList = availableAgents.get(i);
				
				LiveAgentVector liveAgents = agentList.getLiveAgents();
				
				List<LiveAntbotInfo> liveAgentInfos = new ArrayList<LiveAntbotInfo>();
				
				for (int j = 0; j < liveAgents.size(); ++j) {
					LiveAgent liveAgent = liveAgents.get(j);
					
					liveAgentInfos.add(new LiveAntbotInfo(liveAgent.getAgentId(), liveAgent.getAgentName(), liveAgent.getAgentType(), liveAgent.getAgentDesc()));

					logger.info(String.format("engineSessionId: %s, liveAgentId: %s, liveAgentName: %s, liveAgentType: %s, liveAgentDesc: %s .", Long.toString(engineSessionId), 
											liveAgent.getAgentId(), liveAgent.getAgentName(), liveAgent.getAgentType(), liveAgent.getAgentDesc()));
					
				}
		
				String testObjectId = "testObjectId";
				if (agentList.getTestObjectId() != null)
				{
					testObjectId = agentList.getTestObjectId();
				}
				LiveAntbotDictionary liveAgentInfoDictionary = new LiveAntbotDictionary(testObjectId, liveAgentInfos);				
				
				liveAgentInfoDictionarys.add(liveAgentInfoDictionary);				

				logger.info(String.format("i: %s, liveAgentInfoDictionarys.length: %s", Integer.toString(i), liveAgentInfoDictionarys.toArray().length));
			}
			
			logger.info(String.format("engineSessionId: %s, liveAgentInfoDictionarys.length: %s", Long.toString(engineSessionId), liveAgentInfoDictionarys.toArray().length));

			for (int j = 0; j < scriptAgents.size(); ++j) {
				ScriptAgent scriptAgent = scriptAgents.get(j);
				String agentType = scriptAgent.getAgentType();

				scriptAntbotInfos.add(new ScriptAntbotInfo(scriptAgent.getAgentName(), scriptAgent.getAgentType()));
				logger.info(String.format("engineSessionId: %s, scriptAgentName: %s, scriptAgentType: %s.", Long.toString(engineSessionId), scriptAgent.getAgentName(), scriptAgent.getAgentType()));
			}
			
			this.executionModel.setLiveAntbotDictionarys(liveAgentInfoDictionarys);
			this.executionModel.setAntbotsDefinedInScript(scriptAntbotInfos);
			
			this.executionModel.setStatus(ExecutionModel.State_WaitingMatchAntbot);

			if (scriptAntbotInfos.size() > 0 && liveAgentInfoDictionarys.size() == 0)
			{
				this.executionModel.setStatus(ExecutionModel.State_AntbotNotFoundError);
				this.utpEngineAdapter.releaseEngine();

				// update monitor execution status if needs.
				String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
				monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_AnalyzeScriptError);
			}
		}
		catch (Exception ex)
		{
			logger.error("getAvailableAgentsResponse", ex);
		}
		finally
		{
			waitHandleForExecution.set();
		}
	}

	public void startExecutionResponse(ExecuteInvokeResult executeInvokeResult, long engineSessionId) {
		try
		{
			logger.info(String.format("engineSessionId: %s, startExecutionResponse : %s.", Long.toString(engineSessionId), executeInvokeResult.getBoolResult()));
			
			if (executeInvokeResult.getBoolResult())
			{
				this.executionModel.setStatus(ExecutionModel.State_Running);
			}
			else
			{
				logger.info(String.format("startExecution : %s.", StartExecutionException.ErrorMessage));
				StartExecutionError startExecutionError = new StartExecutionError();

				for (long i = 0; i < executeInvokeResult.getFailAgentCount(); i++)
				{
					AgentFailReason agentFailReason = new AgentFailReason();
					executeInvokeResult.getAgentFailReason(i, agentFailReason);
					AntbotFailReason reason = new AntbotFailReason(agentFailReason.getAgentName(), agentFailReason.getFailReason());	
					startExecutionError.getAntbotFailedReasons().add(reason);
					
					logger.info(String.format("AntbotFailReason - agentName: %s, failReason : %s", agentFailReason.getAgentName(), agentFailReason.getFailReason()));
				}
				
				this.executionModel.setStartExecutionError(startExecutionError);
				this.executionModel.setStatus(ExecutionModel.State_StartExecutionError);

				this.utpEngineAdapter.updateExecutionStatus(ExecutionStatus.Terminated, ExecutionStatus.TerminatedString);
				this.utpEngineAdapter.endExecutionByStatusLisener(ExecutionStatus.Terminated, ExecutionStatus.TerminatedString);
				this.utpEngineAdapter.endExecutionByProgLisener();
				this.utpEngineAdapter.releaseEngine();
				// update monitor execution status if needs.
				String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
				monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_StartExecutionError);
			}
		}
		catch (Exception ex)
		{
			logger.error("getAvailableAgentsResponse", ex);
		}
		finally
		{
			waitHandleForExecution.set();
		}
	}

	public void finalize() {
		logger.info(String.format("the EngineAsyncCallResponseListener has been finalized."));
	}

}
