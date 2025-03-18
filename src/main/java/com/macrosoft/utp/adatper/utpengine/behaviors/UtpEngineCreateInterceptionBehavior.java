package com.macrosoft.utp.adatper.utpengine.behaviors;


import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adatper.utpengine.IUtpEngineAdapter;
import com.macrosoft.utp.adatper.utpengine.UtpEngineController;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;

public class UtpEngineCreateInterceptionBehavior extends InterceptionBehavior
{
	private static final ILogger logger = LoggerFactory.Create(UtpEngineExecutor.class.getName());
	
	private IUtpEngineAdapter engine;
	private UtpEngineControllerManager utpEngineControllerManager;
	private String executionId;
	private String ipAddress;
	private long port;
	private boolean isDummyRun;
	// commented for manually test, will be open before going to live.

	
  public UtpEngineCreateInterceptionBehavior(UtpEngineControllerManager utpEngineControllerManager, String executionId, String ipAddress,  long port, boolean isDummyRun,  InterceptionBehavior nextInterceptionBehavior) {
		super(nextInterceptionBehavior);
		
		this.utpEngineControllerManager = utpEngineControllerManager;
		this.executionId = executionId;
		this.ipAddress = ipAddress;
		this.port = port;
		this.isDummyRun = isDummyRun;
	}

	@Override
	protected void OnInvoke(ExecutionContext context) {

		logger.info("UtpEngineCreateInterceptionBehavior.Invoke() begin.");
		
		UtpEngineController controller = utpEngineControllerManager.CreateEngineController(executionId, context.getProjectId(), ipAddress, port, isDummyRun);
		
		controller.setOrgId(context.getOrgId());
		controller.setExecutedByUserId(context.getExecutedByUserId());
		controller.setExecutionName(context.getExecutionName());
		controller.setTestObject(context.getTestObject());
		controller.setTestsetId(context.getTestsetId());
		controller.setProjectId(context.getProjectId());
		
		
		engine = controller.getEngine();

		context.setUtpEngine(engine);
	}
}


