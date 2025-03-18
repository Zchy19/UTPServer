package com.macrosoft.utp.adapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

import com.macrosoft.service.AgentConfigService;
import com.macrosoft.service.MonitoringExecutionService;
import com.macrosoft.service.ProjectService;
import com.macrosoft.service.RecoverSubscriptReferenceService;
import com.macrosoft.service.ScriptGroupService;
import com.macrosoft.service.ScriptLinkService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.service.SubscriptReferenceService;
import com.macrosoft.service.TestSetService;
import org.springframework.stereotype.Component;

@Component
public class UtpAdapterFactoryManager
{
	private IUtpAdapterFactory utpAdapterFactory;
	private ProjectService projectService;
	private RecoverSubscriptReferenceService recoverSubscriptReferenceService;
	private ScriptService scriptService;
	private ScriptGroupService scriptGroupService;
	private AgentConfigService agentConfigService;
	private TestSetService testSetService;
	private ScriptLinkService scriptLinkService;
	private SubscriptReferenceService subscriptReferenceService;
	private MonitoringExecutionService monitoringExecutionService;

	@Autowired
	public void setMonitoringExecutionService(MonitoringExecutionService monitoringExecutionService){
		this.monitoringExecutionService = monitoringExecutionService;
	}

	@Autowired
	public void setScriptService(ScriptService scriptService){
		this.scriptService = scriptService;
	}

	@Autowired
	public void setProjectService(ProjectService projectService){
		this.projectService = projectService;
	}

	@Autowired
	public void setRecoverSubscriptReferenceService(RecoverSubscriptReferenceService recoverSubscriptReferenceService){

		this.recoverSubscriptReferenceService = recoverSubscriptReferenceService;
	}

	@Autowired
	public void setSubscriptReferenceService(SubscriptReferenceService subscriptReferenceService){
		this.subscriptReferenceService = subscriptReferenceService;
	}

	@Autowired
	public void setScriptGroupService(ScriptGroupService scriptGroupService){
		this.scriptGroupService = scriptGroupService;
	}


	@Autowired
	public void setAgentConfigService(AgentConfigService agentConfigService){
		this.agentConfigService = agentConfigService;
	}

	@Autowired
	public void setTestSetService(TestSetService testSetService){
		this.testSetService = testSetService;
	}

	@Autowired
	public void setScriptLinkService(ScriptLinkService scriptLinkService){
		this.scriptLinkService = scriptLinkService;
	}

	public IUtpAdapterFactory GetUtpAdatperFactory() {
		
		if (utpAdapterFactory != null)
		{
			return utpAdapterFactory;
		}
		
		utpAdapterFactory = new UtpAdapterFactoryImpl(projectService, recoverSubscriptReferenceService, subscriptReferenceService, scriptService, scriptGroupService, testSetService, scriptLinkService, agentConfigService, monitoringExecutionService);
		return utpAdapterFactory;
	}
}
