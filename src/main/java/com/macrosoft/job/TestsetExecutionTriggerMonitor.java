package com.macrosoft.job;

import java.util.Hashtable;
import java.util.List;
import java.util.Set;

import com.macrosoftsys.convertorMgr.ConvertorMgr;
import com.macrosoftsys.convertorMgr.ConvertorMgrLib;
import com.macrosoftsys.convertorMgr.ConvertorType;
import com.macrosoftsys.convertorMgr.ExtNameVector;
import org.quartz.Scheduler;
import org.quartz.SchedulerFactory;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import com.macrosoft.caching.CacheHelper;
import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.ClientDbConnection;
import com.macrosoft.master.MasterService;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.TestsetExecutionTrigger;
import com.macrosoft.service.ExecutionResultService;
import com.macrosoft.service.ExecutionService;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.service.ExecutionTestCaseResultService;
import com.macrosoft.service.ProjectService;
import com.macrosoft.service.ScriptLinkService;
import com.macrosoft.service.TestSetService;
import com.macrosoft.service.TestsetExecutionTriggerService;
import com.macrosoft.utilities.HarmonizedUtil;
import com.macrosoft.utilities.SystemUtil;
import com.macrosoft.utp.adatper.utpengine.UtpEngineControllerManager;
import com.macrosoftsys.UtpCoreAccessLib.UtpCoreAccessLib;

interface ITriggerServicesProvider
{
	public UrsConfigurationImpl getUrsConfig();
	public TestSetService getTestSetService();
	public ProjectService getProjectService();
	public TestsetExecutionTriggerService getTestsetExecutionTriggerService();
	public ExecutionTestCaseResultService getExecutionTestCaseResultService();
	public ExecutionResultService getExecutionResultService();
	public ScriptLinkService getScriptLinkService();
	public TestSetService getTestsetService();
	public ExecutionService getExecutionService();
	public UtpEngineControllerManager getUtpEngineControllerManager();
	
}

@Component
public class TestsetExecutionTriggerMonitor implements ApplicationListener<ContextRefreshedEvent>, ITriggerServicesProvider {
	private static final ILogger logger = LoggerFactory.Create(TestsetExecutionTriggerMonitor.class.getName());
	private static Hashtable<Long, TenantExecutionJobManager> arrangedJobManagers = new Hashtable<Long, TenantExecutionJobManager>();
	private static Scheduler testExecutionScheduler;

	private UrsConfigurationImpl ursConfig;
	private TestSetService testSetService;
	private ProjectService projectService;
	private TestsetExecutionTriggerService testsetExecutionTriggerService;
	private ExecutionTestCaseResultService executionTestCaseResultService;
	private ExecutionResultService executionResultService;
	private ExecutionStatusService executionStatusService;
	private ScriptLinkService scriptLinkService;
	private TestSetService testsetService;
	private ExecutionService executionService;
	private MasterService masterService;
	
    @Autowired
    public void setTestsetExecutionTriggerService(TestsetExecutionTriggerService testsetExecutionTriggerService) {
        this.testsetExecutionTriggerService = testsetExecutionTriggerService;
    }
    
    @Autowired
    public void setUrsConfig(UrsConfigurationImpl ursConfig) {
        this.ursConfig = ursConfig;
    }

    @Autowired
    public void setTestSetService(TestSetService testSetService) {
        this.testSetService = testSetService;
    }

    @Autowired
    public void setProjectService(ProjectService projectService) {
        this.projectService = projectService;
    }
    
    @Autowired
    public void setScriptLinkService(ScriptLinkService scriptLinkService) {
        this.scriptLinkService = scriptLinkService;
    }


    @Autowired
    public void setExecutionResultService(ExecutionResultService executionResultService) {
        this.executionResultService = executionResultService;
    }

    @Autowired
    public void setExecutionTestCaseResultService(ExecutionTestCaseResultService executionTestCaseResultService) {
        this.executionTestCaseResultService = executionTestCaseResultService;
    }
    
    @Autowired
    public void setExecutionService(ExecutionService executionService) {
        this.executionService = executionService;
    }
    
    @Autowired
    public void setExecutionStatusService(ExecutionStatusService executionStatusService) {
        this.executionStatusService = executionStatusService;
    }

    @Autowired
    public void setMasterService(MasterService masterService) {
        this.masterService = masterService;
    }
    
    
	@Override
	public void onApplicationEvent(ContextRefreshedEvent event) {
		try {
			
			  ApplicationContext context = event.getApplicationContext();
			  if (context instanceof ConfigurableApplicationContext && context == event.getSource() )
			  {
				  
				  logger.info(String.format(" getDisplayName: %s, getApplicationName: %s, getId: %s", context.getDisplayName(), context.getApplicationName(), context.getId()));

				  logger.info(String.format(" Application Started, start to schedule TestsetExecutionTrigger "));
				  

			    	// initialize caching path
			    	CacheHelper.Initialize(HarmonizedUtil.getInstance().config.getCachingPath());
			    	
					// load utpCoreAccessLibCloud once after application loaded.
					try {
						// String archDataModel = System.getProperty("sun.arch.data.model");
						//System.loadLibrary("utpCoreAccessLib" + archDataModel);
						
						String libraryPath = System.getProperty("java.library.path");
						String utpCoreAccessLibname = SystemUtil.getInstance().getUtpCoreAccessLibName();
						String convertorMgrName= SystemUtil.getInstance().getConvertorMgrName();
						String dbcConvertor = SystemUtil.getInstance().getDbcConvertor();

						logger.info(String.format("Try load %s from %s success.", utpCoreAccessLibname, libraryPath));
						
						System.loadLibrary(utpCoreAccessLibname);

						System.loadLibrary(dbcConvertor);
						
						logger.info(String.format("Load %s success.", utpCoreAccessLibname));
						logger.info(String.format("Try load %s from %s success.", convertorMgrName, libraryPath));
						UtpCoreAccessLib.initUtpCoreAccess();

						ConvertorMgrLib.initConvertorMgr();

//						System.loadLibrary(convertorMgrName);

//						logger.info(String.format("Load %s success.", convertorMgrName));
//						ConvertorMgrLib.initConvertorMgr();
//						ConvertorMgr convertorMgr = new ConvertorMgr();
//						convertorMgr.getAllSupportExtNames(ConvertorType.PROTOCOL_CONVERTOR,new ExtNameVector());
					} catch (UnsatisfiedLinkError e) {
						System.err.println("Native code library failed to load. See the chapter on Dynamic Linking Problems in the SWIG Java documentation for help.\n" + e);
	
						logger.error(String.format("Load utpCoreAccessLib fail."));
						logger.error(String.format(e.toString()));
					}
					
					// start job scheduler
					SchedulerFactory sf = new StdSchedulerFactory();

					testExecutionScheduler = sf.getScheduler();
				    
					testExecutionScheduler.start();

			        Runnable runnable = () -> {
				        try {
							// initialize jobs for each organization
							List<ClientDbConnection>  connections = masterService.getClientDbConnections();

							for (ClientDbConnection connection : connections)
							{
								long tenantId = connection.getTenantId();
								terminateAllUnFinishedExecution(tenantId);
								TenantExecutionJobManager newJobManager = new TenantExecutionJobManager(tenantId, this, testExecutionScheduler);
								newJobManager.ScheduleTriggerFromDBAsync();
								arrangedJobManagers.put(tenantId, newJobManager);
							}
				        } catch(Exception ex) {
							logger.info(String.format("initialize jobs for each organization has exception : %s",ex.toString()));
				        }
				        
				        
			        };

			        Thread thread = new Thread(runnable);
			        thread.start();
			  }
		} catch (Exception ex) {
        	logger.error("TestsetExecutionTriggerMonitor.onApplicationEvent", ex);
		}
	}
	
	private void terminateAllUnFinishedExecution(long tenantId)
	{
		try
		{
			logger.info(String.format("terminateAllUnFinishedExecution for tenantId: %s start.", tenantId));
	    	TenantContext.setTenantId(Long.toString(tenantId));
	    	executionStatusService.terminateAllUnFinishedExecution();
		}
		catch(Exception ex)
		{
			logger.error(String.format("terminateAllUnFinishedExecution for tenantId: %s has exception : %s", tenantId, ex.toString()));
		}

    	
	}
	   
	   public void UpdateWithJobSchedule(long orgId, TestsetExecutionTrigger toBeUpdatedTrigger)
	   {
		   try
		   {
			   Long tenantId = this.masterService.resolveTenantId(orgId);

			   logger.info(String.format("UpdateWithJobSchedule resolve tenantId : %s", tenantId));
				
			   Set<Long> tenantIds = arrangedJobManagers.keySet();
			   boolean foundTenantManager = false;
			   
			   for (Long cur_tenantId : tenantIds)
			   {
				   if (cur_tenantId == tenantId)
				   {
					   arrangedJobManagers.get(cur_tenantId).UpdateWithJobSchedule(tenantId, toBeUpdatedTrigger);
					   foundTenantManager = true;
				   }				   
			   }
			   
			   if (!foundTenantManager)
			   {
				   TenantExecutionJobManager newJobManager = new TenantExecutionJobManager(tenantId, this, testExecutionScheduler);
				   newJobManager.UpdateWithJobSchedule(tenantId, toBeUpdatedTrigger);
				   arrangedJobManagers.put(tenantId, newJobManager);
			   }
		   }
		   catch (Exception ex)
		   {
				logger.error("UpdateWithJobSchedule", ex);
		   }
	   }
	   

	   public void DeleteTriggerFromJobSchedule(long orgId, long toBeRemovedTriggerId)
	   {
		   try
		   {
			   Long tenantId = this.masterService.resolveTenantId(orgId);
			   Set<Long> tenantIds = arrangedJobManagers.keySet();
			   
			   for (Long cur_tenantId : tenantIds)
			   {
				   if (cur_tenantId == tenantId)
				   {
					   arrangedJobManagers.get(cur_tenantId).DeleteTriggerFromJobSchedule(toBeRemovedTriggerId);
				   }
			   }
		   }
		   catch (Exception ex)
		   {
				logger.error("DeleteTriggerFromJobSchedule", ex);
		   }
	   }

	@Override
	public UrsConfigurationImpl getUrsConfig() {
		return ursConfig;
	}

	@Override
	public TestSetService getTestSetService() {
		return testSetService;
	}

	@Override
	public ProjectService getProjectService() {
		return projectService;
	}

	@Override
	public TestsetExecutionTriggerService getTestsetExecutionTriggerService() {
		return testsetExecutionTriggerService;
	}

	@Override
	public ExecutionTestCaseResultService getExecutionTestCaseResultService() {
		return executionTestCaseResultService;
	}

	@Override
	public ExecutionResultService getExecutionResultService() {
		return executionResultService;
	}

	@Override
	public ScriptLinkService getScriptLinkService() {
		return scriptLinkService;
	}

	@Override
	public TestSetService getTestsetService() {
		return testsetService;
	}

	@Override
	public ExecutionService getExecutionService() {
		return executionService;
	}
	
	@Override
	public UtpEngineControllerManager getUtpEngineControllerManager() {
		return executionService.getUtpEngineExecutor().getUtpEngineControllerManager();
	}
	
	}

class TestExectuionJobServicesWraper
{
	public UrsConfigurationImpl ursConfig;
	public TestSetService testSetService;
	public ProjectService projectService;
	public TestsetExecutionTriggerService testsetExecutionTriggerService;
	public TestSetService testsetService;
	public ScriptLinkService scriptLinkService; 
	public ExecutionResultService executionResultService; 
	public ExecutionTestCaseResultService executionTestCaseResultService; 
	public ExecutionService executionService;
	public UtpEngineControllerManager utpEngineControllerManager;
	
}



