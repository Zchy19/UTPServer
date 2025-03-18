package com.macrosoft.utp.adapter;


import com.macrosoft.service.*;
import com.macrosoft.utp.adatper.utpengine.IUtpEngineAdapter;
import com.macrosoft.utp.adatper.utpengine.UtpEngineAdapterImpl;
import com.macrosoft.utp.adatper.utpengine.IEngineFinializer;

public interface IUtpAdapterFactory
{
	IUtpEngineAdapter createUtpEngineAdapter(IEngineFinializer engineFinializer, ExecutionStatusService executionStatusService, ExecutionResultService executionResultService, ExecutionTestCaseResultService executionTestCaseResultService, BigdataStorageService bigdataStorageService, ProtocolSignalService protocolSignalService, MonitoringExecutionService monitoringExecutionService, String executionId);
}

class UtpAdapterFactoryImpl implements IUtpAdapterFactory {

	private ProjectService projectService;
	private RecoverSubscriptReferenceService recoverSubscriptReferenceService;
	private ScriptService scriptService;
	private ScriptGroupService scriptGroupService;
	private AgentConfigService agentConfigService;
	private ScriptLinkService scriptLinkService;
	private TestSetService testsetService;
	private SubscriptReferenceService subscriptReferenceService;
	private MonitoringExecutionService monitoringExecutionService;

	public UtpAdapterFactoryImpl(ProjectService projectService, RecoverSubscriptReferenceService recoverSubscriptReferenceService, SubscriptReferenceService subscriptReferenceService, 
			ScriptService scriptService, ScriptGroupService scriptGroupService,TestSetService testsetService, ScriptLinkService scriptLinkService, AgentConfigService agentConfigService,
			MonitoringExecutionService monitoringExecutionService)
	{
		this.projectService = projectService;
		this.subscriptReferenceService = subscriptReferenceService;
		this.recoverSubscriptReferenceService = recoverSubscriptReferenceService;
		
		this.scriptService = scriptService;
		this.scriptGroupService = scriptGroupService;
		this.testsetService = testsetService;
		this.scriptLinkService =scriptLinkService;
		this.agentConfigService =agentConfigService;
		this.monitoringExecutionService = monitoringExecutionService; 
	}
	
	@Override
	public IUtpEngineAdapter createUtpEngineAdapter(IEngineFinializer engineFinializer, ExecutionStatusService executionStatusService,ExecutionResultService executionResultService,ExecutionTestCaseResultService executionTestCaseResultService,  BigdataStorageService bigdataStorageService, ProtocolSignalService protocolSignalService, MonitoringExecutionService monitoringExecutionService, String executionId) {

		return new UtpEngineAdapterImpl(engineFinializer, projectService,  recoverSubscriptReferenceService, subscriptReferenceService, scriptService, scriptGroupService, testsetService, scriptLinkService,  agentConfigService, executionStatusService, executionResultService, executionTestCaseResultService, bigdataStorageService,protocolSignalService, monitoringExecutionService, executionId);
	}

}



