package com.macrosoft.utp.adatper.utpengine;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import com.macrosoft.caching.CachedDataManager;
import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.*;
import com.macrosoft.service.*;
import com.macrosoft.utilities.ManualResetEvent;
import com.macrosoft.utp.adatper.utpengine.dto.AgentInfo;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.dto.NotifyHandlerInfo;
import com.macrosoft.utp.adatper.utpengine.dto.ScriptInfo;
import com.macrosoft.utp.adatper.utpengine.dto.TestsetInfo;
import com.macrosoft.utp.adatper.utpengine.exception.*;
import com.macrosoftsys.UtpCoreAccessLib.EngineConfiguration;
import com.macrosoftsys.UtpCoreAccessLib.ExecProgTypeEnum;
import com.macrosoftsys.UtpCoreAccessLib.ICommuExceptionListener;
import com.macrosoftsys.UtpCoreAccessLib.IExecProgListener;
import com.macrosoftsys.UtpCoreAccessLib.IExecStatusListener;
import com.macrosoftsys.UtpCoreAccessLib.IMonitorDataListener;
import com.macrosoftsys.UtpCoreAccessLib.ScriptCmd;
import com.macrosoftsys.UtpCoreAccessLib.ScriptContent;
import com.macrosoftsys.UtpCoreAccessLib.SelectedAgent;
import com.macrosoftsys.UtpCoreAccessLib.SelectedAgentVector;
import com.macrosoftsys.UtpCoreAccessLib.UtpEngine;


public class UtpEngineAdapterImpl implements IUtpEngineAdapter,Runnable
{
	private UtpEngine utpEngine;
	private ScriptService scriptService;
	private ProjectService projectService;
	private SubscriptReferenceService subscriptReferenceService;
	private RecoverSubscriptReferenceService recoverSubscriptReferenceService;
	private ScriptGroupService scriptGroupService;
	private AgentConfigService agentConfigService;
	private ExecProgJavaListener progListener;
	private IExecStatusListener execStatusListener;
	private MonitorDataJavaListener dataListener;
	private CommunicationExceptionListerner communicationExceptionListerner;
	private EngineAsyncCallResponseListener engineAsyncCallResponseListener;
	private ExecutionTestCaseResultService executionTestCaseResultService;
	private ExecutionStatusService executionStatusService;
	private ExecutionResultService executionResultService;
	private TestSetService testsetService;
	private ScriptLinkService scriptLinkService;
	private IEngineFinializer engineFinalizer;
	private BigdataStorageService bigdataStorageService;
	private ProtocolSignalService protocolSignalService;
	private MonitoringExecutionService monitoringExecutionService;	
	private boolean isReleased = false;
	private String executionId;
	private boolean utpEngineHasException;
	private Date lastActiveTime = new Date();
	private Lock lock = new ReentrantLock();
	private Lock endExecutionLock = new ReentrantLock();
	private List<Long> configuredScriptIds = new ArrayList<Long>();
	private ExecutionModel executionModel;
	private ManualResetEvent waitHandleForExecution = new ManualResetEvent(false);
	private boolean isExecutionEndedByProgListener= false;
	private boolean isExecutionEndedByStatusListener = false;

	 
	private static final ILogger logger = LoggerFactory.Create(UtpEngineAdapterImpl.class.getName());
	
	public UtpEngineAdapterImpl(IEngineFinializer engineFinalizer, ProjectService projectService, RecoverSubscriptReferenceService recoverSubscriptReferenceService, 
			SubscriptReferenceService subscriptReferenceService, 
			ScriptService scriptService, ScriptGroupService scriptGroupService, TestSetService testsetService, ScriptLinkService scriptLinkService, 
			AgentConfigService agentConfigService, ExecutionStatusService executionStatusService,
			ExecutionResultService executionResultService, ExecutionTestCaseResultService executionTestCaseResultService, 
			BigdataStorageService bigdataStorageService, ProtocolSignalService protocolSignalService,MonitoringExecutionService monitoringExecutionService, String executionId)
	{
		this.engineFinalizer = engineFinalizer;
		this.projectService = projectService;
		this.subscriptReferenceService = subscriptReferenceService;
		this.executionStatusService = executionStatusService;
		this.executionTestCaseResultService = executionTestCaseResultService;
		this.executionResultService = executionResultService;
		this.scriptService = scriptService;
		this.testsetService =testsetService;
		this.scriptLinkService = scriptLinkService;
		this.scriptGroupService = scriptGroupService;
		this.agentConfigService =agentConfigService;
		this.recoverSubscriptReferenceService = recoverSubscriptReferenceService;
		this.bigdataStorageService = bigdataStorageService;
		this.protocolSignalService = protocolSignalService;
		this.monitoringExecutionService = monitoringExecutionService;
		this.executionId = executionId;
		
		this.executionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		
		logger.info(String.format("%s create engine begin, tenantId: %s", this.executionId, executionModel.getTenantId()));
		utpEngine = new UtpEngine();
		logger.info(String.format("%s create engine end.", this.executionId));
		
		// progress listener only register once for specific UtpEngine.
		  progListener = new ExecProgJavaListener(this, scriptService, executionStatusService, executionResultService, executionTestCaseResultService, executionId);
		  setExecProgListener(progListener);
		  logger.info(String.format("%s set progress listener completed.", this.executionId));

		  execStatusListener = new ExecStatusJavaListener(executionResultService, this, executionStatusService, executionId);
		  setExecStatusListener(execStatusListener);
		  logger.info(String.format("%s set status listener completed.", this.executionId));
		  
		  dataListener = new MonitorDataJavaListener(executionId, Long.toString(this.getTenantId()));
		  setMonitorDataListener(dataListener);

		  communicationExceptionListerner = new CommunicationExceptionListerner(executionId, executionStatusService, this);
		  setCommuExceptionListener(communicationExceptionListerner);
		  
		  engineAsyncCallResponseListener = new EngineAsyncCallResponseListener(scriptService, monitoringExecutionService, this, executionModel, waitHandleForExecution);
		  setEngineAsyncCallResponseListener(engineAsyncCallResponseListener);
		  
		logger.info(String.format("set monitor listener completed."));
	}
	

	  public long getTenantId()
	  {
		  return executionModel.getTenantId();
	  }

	  // utpCoreAddress -> uptCoreAddressFormat ("{utpCoreAddress}:{engineName}"
	  public boolean initEngine(String utpCoreAddress, long utpCorePort) throws UtpCoreNetworkException, InterruptedException, InitEngineException {

		logger.info(String.format("%s initEngine begin. executionId: SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineInitializing);
		boolean result = false;
		if (utpCorePort==0) {
			 result = utpEngine.initEngineAsClient(this.executionModel.getOrgId(), executionModel.getIpAddress());
			if (!result)
			{
				logger.info(String.format("%s initEngine : %s.", executionId, InitEngineException.ErrorMessage));
				this.EngineInitErrorException();
			}
			logger.info(String.format("initEngineAsClient()-> orgId: %s, ExecutedByUserId:%s, return %s.",
					this.executionModel.getOrgId(), executionModel.getExecutedByUserId(), result));
		}
//		if (!result)
		  //短期解决方案
		if (utpCorePort!=0)
		{
			 result = utpEngine.initEngineReq(utpCoreAddress, utpCorePort);
			if (!result)
			{
				logger.info(String.format("%s initEngine : %s.", executionId, InitEngineException.ErrorMessage));
				this.EngineInitErrorException();
			}
			
			waitHandleForExecution.waitOne();			
		}
		else
		{
			waitHandleForExecution.waitOne();				
		}

		logger.info(String.format("%s initEngine successfully. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		
		lastActiveTime = new Date();
		
		return result;
	  }


	  public boolean singleStepExecution() throws UtpCoreNetworkException {
			boolean result = utpEngine.singleStepExecution();

			logger.info(String.format("%s singleStepExecution return: %s, SessionId: %s", executionId, result, utpEngine.getEngineSessionId()));

			if (!result)
			{
				this.ThrowUtpCoreNetworkException();
			}
			
		    return true;		    
	  }
	  
	  public void releaseEngine() {
		  
		  if (isReleased) return;
		  
		  try
		  {
			 lock.lock();

	    	 if (engineFinalizer != null)
	    	 {
		    	 logger.info(String.format("%s engineFinalizer release engine. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
	    		 engineFinalizer.ReleaseEngine(this.executionId);
	    	 }

	    	 logger.info(String.format("%s releaseEngine() end. SessionId: %s", executionId, utpEngine.getEngineSessionId()));

	    	  logger.info(String.format("%s utpengine.releaseEngine() begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
	    	  utpEngine.releaseEngine();
	    	  logger.info(String.format("%s utpengine.releaseEngine() end. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
	  		  
		  }
		  catch (Exception ex)
		  {
			  logger.error(String.format("%s releaseEngine has error.", this.executionId));
			  logger.error("releaseEngine", ex);
		  }
	      finally
	      {
	    	  isReleased = true;
		      //release lock
		      lock.unlock();
	      }
	  }
	  
	  public void endExecutionByProgLisener()
	  {
		  isExecutionEndedByProgListener = true;		  
		  logger.info(String.format("%s ProgLisener notified execution end.", this.executionId));
		  
		  EndExecutionWhenMeetCondition();
	  }

	  public void endExecutionByStatusLisener(int newStatus, String newStatusString)
	  {
		  isExecutionEndedByStatusListener = true;

		  if (ExecutionStatus.Terminated == newStatus)
		  {
			  this.executionModel.setPrivate_endExecutionState_In_ExecutionModel(ExecutionModel.State_Terminated);

		  }
		  else if (ExecutionStatus.Stopped == newStatus)
		  {
			  this.executionModel.setPrivate_endExecutionState_In_ExecutionModel(ExecutionModel.State_Stopped);
		  }
		  else if (ExecutionStatus.Completed == newStatus)
		  {
			  this.executionModel.setPrivate_endExecutionState_In_ExecutionModel(ExecutionModel.State_Completed);
		  }

		  this.executionModel.setPrivate_endExecutionDateTime_In_ExecutionStatus(new Date(new Date().getTime()));
		  this.executionModel.setPrivate_endExecutionStatus_In_ExecutionStatus(newStatus);


		  logger.info(String.format("%s StatusLisener notified %s.", this.executionId, newStatusString));
		  
		  EndExecutionWhenMeetCondition();
	  }

	  private void EndExecutionWhenMeetCondition()
	  {
		  try
		  {
			  endExecutionLock.lock();
//				  if (!isExecutionEndedByStatusListener || !isExecutionEndedByProgListener)

			  if (!isExecutionEndedByStatusListener){
				  return;
			  }
			  
			  logger.info(String.format("%s End execution when meet condition.", this.executionId));

//			  ExecutionResult result = new ExecutionResult();
//			  result.setExecutionId(executionId);
//			  result.setCommandType(ExecutionResult.CommandType_ExecutionEnd);
//			  result.setExecutionTime(new Date(new Date().getTime()));
//			  result.setResult(ExecutionResult.Success);
//
//			  CachedDataManager.AddExecutionResult(Long.toString(this.getTenantId()), result);
			  logger.info(String.format("%s add execution end record in Execution Result.", executionId));

			  Thread releaseEngineThread = new Thread(this);
			  releaseEngineThread.start();
		  }
		  catch (Exception ex)
		  {
			  logger.error(String.format("%s EndExecutionWhenMeetCondition has error.", this.executionId));
			  logger.error("EndExecutionWhenMeetCondition", ex);
		  }
		  finally
		  {
			  endExecutionLock.unlock();
		  }
	  }
	  
	  public void updateExecutionModelStatus(String status)
	  {
		  this.executionModel.setStatus(status);
	  }

		public void updateExecutionStatus(int newStatus, String newStatusString)
		{
			TenantContext.setTenantId(Long.toString(this.getTenantId()));
			  
			ExecutionStatus status = this.executionStatusService.getExecutionStatusByExecutionId(executionId);
			status.setStatus(newStatus);
			if(newStatus == ExecutionStatus.Completed||newStatus == ExecutionStatus.Stopped||newStatus == ExecutionStatus.Terminated)
			{
				status.setEndTime(new Date(new Date().getTime()));
			}
			this.executionStatusService.updateExecutionStatus(status);
			logger.info(String.format("%s Update execution %s status to database.", this.executionId, newStatusString));
		}

		//已不使用
	  public boolean configEngine(long projectId, long scriptId) throws UtpCoreNetworkException, ConfigEngineException, InterruptedException {
		  logger.info(String.format("%s configEngine begin, projectId: %s, scriptId: %s, tenentId: %s", this.executionId, projectId, scriptId, executionModel.getTenantId()));
		  
		  this.executionModel.setProjectId(projectId);
		  
		  Project project = projectService.getProjectById(projectId);
		  if (project == null)
		  {
			  logger.info("project == null");			    
		  }
		  
		  EngineConfiguration config = new EngineConfiguration();
			
		  // resolve startEngineSessionId for monitor service
			String executionId = this.executionId.replaceAll("_stop", "");			
			ExecutionModel startExecutionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);

			logger.info(String.format("executionId: %s, isMonitorExecution: %s ", this.executionId, startExecutionModel.isMonitorExecution()));

			List<AgentInfo> agentInfos = getAgentsByProjectId(projectId);
			for (AgentInfo agentInfo : agentInfos) {

				config.addAgent(agentInfo.getType(), agentInfo.getName());
				
				logger.info(String.format("%s config.addAgent with type: %s with name: %s ", this.executionId, agentInfo.getType(), agentInfo.getName()));
				config.addAgentConfigItem(agentInfo.getName(), "executionId",  startExecutionModel.getExecutionId());

				if (startExecutionModel != null && startExecutionModel.isMonitorExecution())
				{
					//long startEngineSessionId = startExecutionModel.getEngineSessionId();

					// use executionId instead of engineSessionId, which will be filled back for MonitorDetail
					config.addAgentConfigItem(agentInfo.getName(), "monitorSessionId",  startExecutionModel.getExecutionId() /*Long.toString(startEngineSessionId)*/);
					logger.info(String.format("%s config.addAgent with type: %s with monitorSessionID: %s ", this.executionId, agentInfo.getType(), this.executionId));
				}


				if (agentInfo.getRecordsetId()!= null && agentInfo.getRecordsetId().trim().compareToIgnoreCase("") != 0)
				{
					config.addAgentConfigItem(agentInfo.getName(), "recordset",  agentInfo.getRecordsetId());	
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  recordset: %s", this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));
				}
				
				if (agentInfo.getProtocolSignalId() != null && agentInfo.getProtocolSignalId() != "")
				{
					ProtocolSignal protocolSignal = protocolSignalService.getProtocol(agentInfo.getProtocolSignalId());
					if(protocolSignal == null)
					{
						logger.info(String.format("ProtocolSignal is null when query ProtocolSignalId: %s", agentInfo.getProtocolSignalId()));
						continue;
					}

					if (protocolSignal.getDataType().trim().compareToIgnoreCase(ProtocolSignal.SignalProtocol) == 0)
					{
						config.addAgentConfigItem(agentInfo.getName(), "signalConfigTableID",  agentInfo.getProtocolSignalId());
						logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  signalConfigTableID: %s", this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
					}
					else
					{
						config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID",  agentInfo.getProtocolSignalId());
						logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s", this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
					}
				}
				
				
				if (agentInfo.HasNotifyHandler()) {
					for (NotifyHandlerInfo notifyHandlerInfo : agentInfo.getNotifyHandlers()) {
						config.addAgentNotifyScript(agentInfo.getName(), notifyHandlerInfo.getNotifyId(), notifyHandlerInfo.getScriptId());
					}
				}
			}

			ConfigureScript(config, projectId, scriptId, false);
			if (startExecutionModel != null && startExecutionModel.isMonitorExecution())
			{
				// if it is monitor execution,
				config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
			}
			else
			{
				// set progress notification type
				config.addProgNotiType(ExecProgTypeEnum.COMMAND_RESULT);
				config.addProgNotiType(ExecProgTypeEnum.TESTCASE_BEGIN);
				config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_BEGIN);
				config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_END);
				config.addProgNotiType(ExecProgTypeEnum.TESTCASE_END);
				config.addProgNotiType(ExecProgTypeEnum.EXECUTION_BEGIN);
				config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
				config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_BEGIN);
				config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_END);
			}
			

			// set global macros
			// Macro macro = new Macro("TEST_PATH", "c:\\a\\b");
			// config.addGlobalMacro(macro);

	  		logger.info(String.format("%s config engine begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			this.executionModel.setStatus(ExecutionModel.State_EngineConfiguring);
			boolean result = utpEngine.configEngineReq(config);
			if (!result)
			{
				logger.info(String.format("%s configEngine : %s.", executionId, UtpCoreNetworkException.ErrorMessage));
				this.ThrowUtpCoreNetworkException();
			}
			
			waitHandleForExecution.waitOne();
	  		logger.info(String.format("%s config engine success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
	  		 	
			return true;
			
	  }

	  //已不使用
	  public boolean configEngineByTestsetId(long projectId, long testsetId, long recoverSubscriptReferenceId) throws UtpCoreNetworkException, ConfigEngineException, InterruptedException  {
		  
		  this.executionModel.setProjectId(projectId);
		  
			logger.info(String.format("%s config engine started from testsetId execution. testsetId :%s, tenentId: %s", this.executionId, testsetId, executionModel.getTenantId()));
			EngineConfiguration config = new EngineConfiguration(); 

			List<AgentInfo> agentInfos = getAgentsByProjectId(projectId);
			for (AgentInfo agentInfo : agentInfos) {

				config.addAgent(agentInfo.getType(), agentInfo.getName());
				
				logger.info(String.format("%s config.addAgent with type: %s with name: %s ", this.executionId, agentInfo.getType(), agentInfo.getName()));
				config.addAgentConfigItem(agentInfo.getName(), "executionId", this.executionId);

				if (agentInfo.getRecordsetId()!= null && agentInfo.getRecordsetId().trim().compareToIgnoreCase("") != 0)
				{
					config.addAgent(agentInfo.getType(), agentInfo.getName());
					logger.info(String.format("%s config.addAgent with type: %s with name: %s ", this.executionId, agentInfo.getType(), agentInfo.getName()));
					config.addAgentConfigItem(agentInfo.getName(), "recordset",  agentInfo.getRecordsetId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  recordset: %s", this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));
				}
				
				if (agentInfo.getProtocolSignalId() != null && agentInfo.getProtocolSignalId() != "")
				{
//					config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID",  agentInfo.getProtocolSignalId());
//					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s", this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));

					ProtocolSignal protocolSignal = protocolSignalService.getProtocol(agentInfo.getProtocolSignalId());
					if(protocolSignal == null)
					{
						logger.info(String.format("protocolSignal is null when query protocolSignalId: %s", agentInfo.getProtocolSignalId()));
						continue;
					}

					if (protocolSignal.getDataType().trim().compareToIgnoreCase(ProtocolSignal.SignalProtocol) == 0)
					{
						config.addAgentConfigItem(agentInfo.getName(), "signalConfigTableID",  agentInfo.getProtocolSignalId());
						logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  signalConfigTableID: %s", this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
					}
					else
					{
						config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID",  agentInfo.getProtocolSignalId());
						logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s", this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
					}
				}

	
				if (agentInfo.HasNotifyHandler()) { 
					for (NotifyHandlerInfo notifyHandlerInfo : agentInfo.getNotifyHandlers()) {
						config.addAgentNotifyScript(agentInfo.getName(), notifyHandlerInfo.getNotifyId(), notifyHandlerInfo.getScriptId());
					}
				}
			}

			TestsetInfo testsetInfo = this.getTestsetInfos(projectId, testsetId);
			
			ScriptContent testsetScriptContent = new ScriptContent();
			
			for (ScriptInfo scriptInfo : testsetInfo.getScriptInfos())
			{
				// configure script command for test set
				ScriptCmd cmd = new ScriptCmd();
				cmd.addCmdField("CALL_SCRIPT");
				cmd.addCmdField(scriptInfo.getId());
				testsetScriptContent.addScriptCmd(cmd);
				
				logger.debug(String.format("%s config testset - SUBSCRIPT id:%s", this.executionId, testsetInfo.getId()));
				
				// configure each script
				ConfigureScript(config, projectId, Long.parseLong(scriptInfo.getId()), false);
			}

			config.addStructuredScript(testsetInfo.getId(), testsetScriptContent);
	
		
			
			// configure recover script
			//if (recoverSubscriptReferenceId <= 0)
			//{
			//	Project project = this.projectService.getProjectById(projectId);
			//	recoverSubscriptReferenceId = project.getDefaultRecoverSubscriptId();
			//}
			
			if (recoverSubscriptReferenceId > 0)
			{
				RecoverSubscriptReference recoverSubscript = this.recoverSubscriptReferenceService.getRecoverSubscriptReference(projectId, recoverSubscriptReferenceId);
				if (recoverSubscript != null)
				{
					logger.info(String.format("%s recoverSubscript recoverSubscriptReferenceId: %s, subscriptId: %s", this.executionId, recoverSubscript.getId(), recoverSubscript.getSubscriptId()));
					
					ConfigureScript(config, projectId, recoverSubscript.getSubscriptId(), true);
					config.addEngineConfigItem("recoverScript", Long.toString(recoverSubscript.getSubscriptId()));
					logger.info(String.format("%s config recoverSubscript completed", this.executionId));
				}
			}
			
			// set progress notification type
			config.addProgNotiType(ExecProgTypeEnum.COMMAND_RESULT);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_END);
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_END);
			config.addProgNotiType(ExecProgTypeEnum.EXECUTION_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
			config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_END);

			// set global macros
			// Macro macro = new Macro("TEST_PATH", "c:\\a\\b");
			// config.addGlobalMacro(macro);

	  		logger.info(String.format("%s config engine begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			this.executionModel.setStatus(ExecutionModel.State_EngineConfiguring);
			boolean result = utpEngine.configEngineReq(config);
			waitHandleForExecution.waitOne();
			if (!result)
			{
				logger.info(String.format("%s configEngine : %s.", this.executionId, UtpCoreNetworkException.ErrorMessage));
				this.ThrowUtpCoreNetworkException();
			}

			logger.info(String.format("%s config engine success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			return true;
	  }
	public boolean configEngineByScriptIds(long projectId, long[] scriptIds, long recoverSubscriptReferenceId) throws UtpCoreNetworkException, ConfigEngineException, InterruptedException  {

		this.executionModel.setProjectId(projectId);

		logger.info(String.format("%s config engine started from testsetId execution. scriptIds :%s, tenentId: %s", this.executionId, scriptIds, executionModel.getTenantId()));
		EngineConfiguration config = new EngineConfiguration();
		ExecutionModel startExecutionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);

		List<AgentInfo> agentInfos = getAgentsByProjectId(projectId);
		String execOutputDataExtraID=startExecutionModel.getExecutionId()+"&"+startExecutionModel.getScriptGroupId();
		config.addEngineConfigItem("orgnizationID", String.valueOf(startExecutionModel.getOrgId()));
		config.addEngineConfigItem("executionId", startExecutionModel.getExecutionId());
		if (startExecutionModel.isTestdataCollect()){
			config.addEngineConfigItem("execOutputDataExtraID", execOutputDataExtraID);
			config.addEngineConfigItem("uploadExecOutputDataFlag", "1");
		}
		config.addEngineConfigItem( "transform_config",  startExecutionModel.getTransformConfig());
		for (AgentInfo agentInfo : agentInfos) {

			config.addAgent(agentInfo.getType(), agentInfo.getName());
			logger.info(String.format("%s config.addAgent with type: %s with name: %s ", this.executionId, agentInfo.getType(), agentInfo.getName()));
			config.addAgentConfigItem(agentInfo.getName(), "executionId", this.executionId);
			if (startExecutionModel.isTestdataCollect()){
				config.addAgentConfigItem(agentInfo.getName(), "execOutputDataExtraID", execOutputDataExtraID);
				config.addAgentConfigItem(agentInfo.getName(),"uploadExecOutputDataFlag", "1");
			}

			config.addAgentConfigItem(agentInfo.getName(), "transform_config",  startExecutionModel.getTransformConfig());

//			if (startExecutionModel != null && startExecutionModel.isMonitorExecution())
//			{
//				//long startEngineSessionId = startExecutionModel.getEngineSessionId();
//
//				// use executionId instead of engineSessionId, which will be filled back for MonitorDetail
//				config.addAgentConfigItem(agentInfo.getName(), "monitorSessionId",  startExecutionModel.getExecutionId()
//						/*Long.toString(startEngineSessionId)*/);
//				logger.info(String.format("%s config.addAgent with type: %s with monitorSessionID: %s ", this.executionId, agentInfo.getType(), this.executionId));
//			}
			if (agentInfo.getRecordsetId()!= null && agentInfo.getRecordsetId().trim().compareToIgnoreCase("") != 0)
			{
				config.addAgent(agentInfo.getType(), agentInfo.getName());
				logger.info(String.format("%s config.addAgent with type: %s with name: %s ", this.executionId, agentInfo.getType(), agentInfo.getName()));
				config.addAgentConfigItem(agentInfo.getName(), "recordset",  agentInfo.getRecordsetId());
				logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  recordset: %s", this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));
			}

			if (agentInfo.getProtocolSignalId() != null && agentInfo.getProtocolSignalId() != "")
			{
//					config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID",  agentInfo.getProtocolSignalId());
//					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s", this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));

				ProtocolSignal protocolSignal = protocolSignalService.getProtocol(agentInfo.getProtocolSignalId());
				if(protocolSignal == null)
				{
					logger.info(String.format("protocolSignal is null when query protocolSignalId: %s", agentInfo.getProtocolSignalId()));
					continue;
				}

				if (protocolSignal.getDataType().trim().compareToIgnoreCase(ProtocolSignal.SignalProtocol) == 0)
				{
					config.addAgentConfigItem(agentInfo.getName(), "signalConfigTableID",  agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  signalConfigTableID: %s", this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				}
				else
				{
					config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID",  agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s", this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				}
			}


			if (agentInfo.HasNotifyHandler()) {
				for (NotifyHandlerInfo notifyHandlerInfo : agentInfo.getNotifyHandlers()) {
					config.addAgentNotifyScript(agentInfo.getName(), notifyHandlerInfo.getNotifyId(), notifyHandlerInfo.getScriptId());
				}
			}
		}
		ScriptContent testsetScriptContent = new ScriptContent();
		TestsetInfo testsetInfo = this.getTestsetInfosByScriptIds(projectId, scriptIds);
		//对ScriptIds进行遍历
		for (long scriptId : scriptIds)
		{
			// configure script command for test set
			ScriptCmd cmd = new ScriptCmd();
			cmd.addCmdField("CALL_SCRIPT");
			cmd.addCmdField(String.valueOf(scriptId));
			testsetScriptContent.addScriptCmd(cmd);
			logger.debug(String.format("%s config scriptIds - SUBSCRIPT id:%s", this.executionId, testsetInfo.getId()));
			// configure each script
			ConfigureScript(config, projectId, scriptId, false);
		}

		config.addStructuredScript(testsetInfo.getId(), testsetScriptContent);



		// configure recover script
		//if (recoverSubscriptReferenceId <= 0)
		//{
		//	Project project = this.projectService.getProjectById(projectId);
		//	recoverSubscriptReferenceId = project.getDefaultRecoverSubscriptId();
		//}

		if (recoverSubscriptReferenceId > 0)
		{
			RecoverSubscriptReference recoverSubscript = this.recoverSubscriptReferenceService.getRecoverSubscriptReference(projectId, recoverSubscriptReferenceId);
			if (recoverSubscript != null)
			{
				logger.info(String.format("%s recoverSubscript recoverSubscriptReferenceId: %s, subscriptId: %s", this.executionId, recoverSubscript.getId(), recoverSubscript.getSubscriptId()));

				ConfigureScript(config, projectId, recoverSubscript.getSubscriptId(), true);
				config.addEngineConfigItem("recoverScript", Long.toString(recoverSubscript.getSubscriptId()));
				logger.info(String.format("%s config recoverSubscript completed", this.executionId));
			}
		}
		if ( startExecutionModel.isTestcaseCollect())
		{
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_END);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_END);
		}
		if(startExecutionModel.isTeststepCollect()){
			config.addProgNotiType(ExecProgTypeEnum.COMMAND_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.COMMAND_RESULT);
		}
		config.addProgNotiType(ExecProgTypeEnum.EXECUTION_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
		config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_END);

		// set global macros
		// Macro macro = new Macro("TEST_PATH", "c:\\a\\b");
		// config.addGlobalMacro(macro);

		logger.info(String.format("%s config engine begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineConfiguring);
		boolean result = utpEngine.configEngineReq(config);
		waitHandleForExecution.waitOne();
		if (!result)
		{
			logger.info(String.format("%s configEngine : %s.", this.executionId, UtpCoreNetworkException.ErrorMessage));
			this.ThrowUtpCoreNetworkException();
		}

		logger.info(String.format("%s config engine success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		return true;
	}


	private void ConfigureScript(EngineConfiguration config, long projectId,  long scriptId, boolean isSubScript)
	  {
			ScriptInfo scriptInfo = getScriptInfo(projectId, scriptId);
			if (scriptInfo == null)
			{
				logger.error(String.format("scriptInfo is null when query scriptId: %s", scriptId));
				return;
			}
			String[] originalCommandStrings = scriptInfo.getCommands();
			ScriptContent scriptContent = new ScriptContent();			

			
			for (int i =0; i < originalCommandStrings.length; i++) {
				ScriptCmd scriptCmd = new ScriptCmd();
				String[] cmdFields = convertCommandFields(originalCommandStrings[i]);
				String commandTrace = "";

				for(String cmdField : cmdFields)
				{
					commandTrace = commandTrace + cmdField;
					scriptCmd.addCmdField(cmdField);
					
					if (scriptInfo.getIsTestcase() && cmdField.trim().equalsIgnoreCase("TESTCASE_BEGIN"))
					{
						scriptCmd.addCmdField(Long.toString(scriptId));
						break;
					}
				}
				
				if (commandTrace.trim().length() > 0)
				{
					logger.info(commandTrace);					
					scriptContent.addScriptCmd(scriptCmd);
				}
			}

			config.addStructuredScript(scriptInfo.getId(), scriptContent);
			
			configuredScriptIds.add(Long.parseLong(scriptInfo.getId()));

			  List<SubscriptReference> childrenReferences = this.subscriptReferenceService.listSubscriptReferencesByParentScriptId(projectId, scriptId);

			  logger.info(String.format("%s childrenReferences size: %s", executionId, childrenReferences.size()));
			  for (SubscriptReference childReference : childrenReferences)
			  {
				  Long referencedSubScriptId = childReference.getSubscriptId();
				  if (!configuredScriptIds.contains(referencedSubScriptId))
				  {
					  logger.info(String.format("%s childReference id: %s", this.executionId, childReference.getId()));
					  ConfigureScript(config, projectId, childReference.getSubscriptId(), true);
				  }
			  }
	  }
	  
	  private String[] convertCommandFields(String commandString) {
		  
		  String[] splitedCommandString = fullSplitString(commandString, ScriptContentParser.CommandSeparator);
		  String[] cmdFields = new String[splitedCommandString.length];
		  for (int i = 0; i< splitedCommandString.length; i++)
		  {
			  if (i == 0) 
			  {
				  cmdFields[i] = splitedCommandString[i].replace("[[", "").replace("]]", "");
			  }
			  else
			  {
				  cmdFields[i] = splitedCommandString[i];
			  }
		  }
		  
		  return cmdFields;
	  }

	  // if value end with separator, it will return additional empty entry.
	  private String[] fullSplitString(String value, String separator)
	  {
		  String[] splitedData = value.split(separator);
		  if (value.endsWith(separator))
		  {
			  String[] fullSplitedData = new String[splitedData.length + 1];
			  for (int i = 0; i< splitedData.length; i++)
			  {
				  fullSplitedData[i] = splitedData[i];
			  }
			  
			  fullSplitedData[splitedData.length] = "";		
			  return fullSplitedData;	  
		  }
		  else
		  {
			  String[] fullSplitedData = new String[splitedData.length];
			  for (int i = 0; i< splitedData.length; i++)
			  {
				  fullSplitedData[i] = splitedData[i];
			  }

			  return fullSplitedData;
		  }
		  
	  }
	  
	  public boolean analyzeScript(long projectId, String scriptId) throws UtpCoreNetworkException, AnalyzeScriptException, InterruptedException {
		  
		  logger.info(String.format("%s analysis script - scriptId: %s, SessionId: %s ", executionId, scriptId, utpEngine.getEngineSessionId()));
			this.executionModel.setStatus(ExecutionModel.State_AnalyzingScript);
		    boolean result = utpEngine.analyzeScriptReq(scriptId);
			if (!result)
			{
				logger.info(String.format("%s analyzeScript : %s.", executionId, UtpCoreNetworkException.ErrorMessage));
				this.ThrowUtpCoreNetworkException();
			}
			
			waitHandleForExecution.waitOne();
			logger.info(String.format("%s analyzeScript success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));

		    return result;
	  }
	  
	  public boolean startExecution(String executionId, List<SelectedAntbotMapping> selectedAntbotMapping) throws UtpCoreNetworkException, StartExecutionException, InterruptedException {			
		  
		  SelectedAgentVector selectedAgents = new SelectedAgentVector();
		  for (SelectedAntbotMapping mapping : selectedAntbotMapping)
		  {
			  SelectedAgent selectedAgent = new SelectedAgent();
			  selectedAgent.setAgentId(mapping.getAntbotInstanceId());
			  selectedAgent.setScriptAgentName(mapping.getAntbotName());
			  
			  selectedAgents.add(selectedAgent);
		  }

		  this.executionModel.setStatus(ExecutionModel.State_Starting);
		  
		  logger.info(String.format("startExecution : %s, SessionId: %s ",executionId, utpEngine.getEngineSessionId()));
		  
		  boolean result = utpEngine.startExecutionReq(selectedAgents);
		  
		  logger.info(String.format("%s utpEngine.startExecutionReq return %s. ", executionId, result));
		  
		  if (!result)
		  {	
			  this.ThrowUtpCoreNetworkException();
		  }

		  waitHandleForExecution.waitOne();
		  return result;
	  }

	  public boolean stopExecution() throws UtpCoreNetworkException {
			boolean result = utpEngine.stopExecution();
			if (!result)
			{
				logger.info(String.format("%s stopExecution : %s, SessionId: %s", executionId, UtpCoreNetworkException.ErrorMessage, utpEngine.getEngineSessionId()));
				this.ThrowUtpCoreNetworkException();
			}
			
		    return true;
		    
	  }

	  public boolean pauseExecution() throws UtpCoreNetworkException {
			boolean result = utpEngine.pauseExecution();
			if (!result)
			{
				logger.info(String.format("%s pauseExecution : %s, SessionId: %s", executionId, UtpCoreNetworkException.ErrorMessage, utpEngine.getEngineSessionId()));
				this.ThrowUtpCoreNetworkException();
			}
			
		    return true;
	  }

	  public boolean resumeExecution() throws UtpCoreNetworkException {
			boolean result = utpEngine.resumeExecution();
			if (!result)
			{
				logger.info(String.format("%s resumeExecution : %s, SessionId: %s", executionId, UtpCoreNetworkException.ErrorMessage, utpEngine.getEngineSessionId()));
				this.ThrowUtpCoreNetworkException();
			}
			
		    return true;
	  }
	  
	  public void setMonitorDataListener(IMonitorDataListener listener) {
		  utpEngine.setMonitorDataListener(listener);
	  }

	  public void setExecProgListener(IExecProgListener listener) {
		  utpEngine.setExecProgListener(listener);
	  }

	  public void setExecStatusListener(IExecStatusListener listener) {
		  utpEngine.setExecStatusListener(listener);
	  }
	  
	  public void setCommuExceptionListener(ICommuExceptionListener listener) {
		  utpEngine.setCommuExceptionListener(listener);
	  }

	  public void setEngineAsyncCallResponseListener(EngineAsyncCallResponseListener listener) {
		  utpEngine.setAsyncCallResponseListener(listener);
	  }
	  
		private ScriptInfo getScriptInfo(long projectId, long scriptId)
		{

			Script script = scriptService.getScriptById(projectId, scriptId);
			if (script == null)
			{
				logger.error(String.format("scriptId:%s, projectId: %s, can not find script to export.", scriptId, projectId));
				return null;
			}
			String scriptContent = script.getScript();
			if (scriptContent == null)
			{
				scriptContent = "";
			}
			
			String[] commands = scriptContent.split(ScriptContentParser.ScriptLineSeparator);
			//logger.info("script content is : " + scriptContent);
			//logger.info("script separator is : " + ScriptContentParser.ScriptLineSeparator);
			logger.info("splicted commands count is : " + commands.length);


			boolean isTestcase = ScriptType.TestCaseType.equals(script.getType()) || ScriptType.RunnableScript.equals(script.getType());
			
			return new ScriptInfo(Long.toString(scriptId), commands, isTestcase);
		}
		
		private TestsetInfo getTestsetInfos(long projectId, long testsetId)
		{
			TestsetInfo testsetInfo = new TestsetInfo(String.format("ts_%s", testsetId));
			List<ScriptLink> existingScriptLinks = this.scriptLinkService.listScriptLinksByTestsetId(projectId, testsetId);

			for (ScriptLink scriptLink : existingScriptLinks)
			{
				testsetInfo.addScriptInfo(this.getScriptInfo(projectId, scriptLink.getScriptId()));				
			}
			
			return testsetInfo;
		}
		private TestsetInfo getTestsetInfosByScriptIds(long projectId, long[] scriptIds)
		{
			TestsetInfo testsetInfo = new TestsetInfo(String.format("ts_%s", scriptIds[0]));
			//对scriprIds进行遍历
			for (long scriptId : scriptIds) {
				testsetInfo.addScriptInfo(this.getScriptInfo(projectId,scriptId ));
			}
			return testsetInfo;
		}


	private List<AgentInfo> getAgentsByProjectId(long projectId)
		{
			List<AgentInfo> agentInfos = new ArrayList<AgentInfo>();
			try
			{
				List<AgentConfig> agentConfigs = agentConfigService.getAgentConfigByProjectId(projectId);
				for (int i=0; i < agentConfigs.size(); i++) {
					AgentConfig config = agentConfigs.get(i);

					logger.info(String.format("agent info projectId:%s, agentType:%s, agentInstanceName:%s, recordsetName:%s, ProtocolSignalId:%s", projectId, config.getAgentType(), config.getAgentInstanceName(), config.getRecordsetName(), config.getProtocolSignalId()));

					AgentInfo agentInfo = new AgentInfo(config.getAgentType(), config.getAgentInstanceName(), config.getRecordsetId(), config.getRecordsetName(), config.getProtocolSignalId());
					agentInfos.add(agentInfo);
				}
				
				return agentInfos;
			}
			catch (Exception ex)
			{
				logger.error(String.format("%s getAgentsByProjectId has error.", this.executionId));
		       	logger.error("getAgentsByProjectId", ex);
				return new ArrayList<AgentInfo>();
			}
		}
		
		@Override
		public void getAvailableAgents(ExecutionContext executionContext, String orgId) throws InterruptedException, UtpCoreNetworkException {

			if (executionContext.isDummyRun())
			{
				this.executionModel.setStatus(ExecutionModel.State_WaitingMatchAntbot);
				return;
			}
			
			boolean result = utpEngine.getAvailableAgentsReq(orgId);
			logger.info(String.format("%s EngineSessionId: %s, getAvailableAgents return : %s", this.executionId, utpEngine.getEngineSessionId(), result));			

			if (!result)
			{
				logger.info(String.format("%s getAvailableAgents : %s.", this.executionId, UtpCoreNetworkException.ErrorMessage));
				this.ThrowUtpCoreNetworkException();
			}
			
			waitHandleForExecution.waitOne();
		}

		@Override
		public Date getLastActiveTime() {
			return lastActiveTime;
		}

		@Override
		public Date setLastActiveTime() {
			// TODO Auto-generated method stub
			return lastActiveTime = new Date();
		}

		@Override
		public void setUtpEngineExceptionFlag() {
			utpEngineHasException = true;
		}

		@Override
		public boolean getUtpEngineHasException() {
			return utpEngineHasException;
		}

		private void EngineInitErrorException() throws InitEngineException {
			logger.info(String.format("%s EngineInitErrorException. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			this.executionModel.setStatus(ExecutionModel.State_EngineInitError);
//			releaseEngine();
			// update monitor execution status if needs.
			String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
			monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_EngineInitError);
			throw new InitEngineException();
		}


		private void ThrowUtpCoreNetworkException() throws UtpCoreNetworkException
		  {
			  logger.info(String.format("%s ThrowUtpCoreNetworkException. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			  this.executionModel.setStatus(ExecutionModel.State_UtpCoreNetworkError);

			  releaseEngine();

				// update monitor execution status if needs.
				String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
				monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_UtpCoreNetworkError);
			  
			  throw new UtpCoreNetworkException();  
		  }

		@Override
		public void run() {
			// utpengineAdapter implement runable interface to release engine asyncly.
			
			this.releaseEngine();
		}
}
