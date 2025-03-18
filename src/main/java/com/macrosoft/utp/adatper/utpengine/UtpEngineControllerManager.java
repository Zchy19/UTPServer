package com.macrosoft.utp.adatper.utpengine;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.service.*;
import com.macrosoft.urs.IpAddress;
import com.macrosoft.urs.UrsServiceApis;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utp.adapter.UtpAdapterFactoryManager;
import com.macrosoft.utp.adatper.utpengine.exception.InitEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;
import org.springframework.web.client.RestTemplate;


@Component
public class UtpEngineControllerManager implements ApplicationListener<ContextRefreshedEvent>, IEngineFinializer 
{
	private static final ILogger logger = LoggerFactory.Create(UtpEngineControllerManager.class.getName());
	private CopyOnWriteArrayList<UtpEngineController> engineControllers = new CopyOnWriteArrayList<UtpEngineController>();
	
	private UtpAdapterFactoryManager utpAdapterFactoryManager;
	private ExecutionResultService executionResultService;
	private MonitorDataService monitorDataService;
	private Timer releaseEngineTimer = new Timer();
	private ReleaseEngineTask releaseEngineTask;
	private Timer savingExecutionResultTimer = new Timer();
	private SavingCachingDataTask savingExecutionResultTask;

	private ExecutionTestCaseResultService executionTestCaseResultService;
	private ExecutionStatusService executionStatusService;  
	private BigdataStorageService bigdataStorageService;
	private ProtocolSignalService protocolSignalService;
	private MonitoringExecutionService monitoringExecutionService;

	@Autowired
	public void setMonitoringExecutionService(MonitoringExecutionService monitoringExecutionService){
		this.monitoringExecutionService = monitoringExecutionService;
	}
	
	@Autowired
	public void setUtpAdapterFactoryManager(UtpAdapterFactoryManager utpAdapterFactoryManager){
		this.utpAdapterFactoryManager = utpAdapterFactoryManager;
	}


	@Autowired
	public void setExecutionStatusService(ExecutionStatusService executionStatusService){
		this.executionStatusService = executionStatusService;
	}

	@Autowired
	public void setMonitorDataService(MonitorDataService monitorDataService){
		this.monitorDataService = monitorDataService;
	}
	
	@Autowired
	public void setExecutionResultService(ExecutionResultService executionResultService){
		this.executionResultService = executionResultService;
	}

	@Autowired
	public void setExecutionTestCaseResultService(ExecutionTestCaseResultService executionTestCaseResultService){
		this.executionTestCaseResultService = executionTestCaseResultService;
	}

	@Autowired
	public void setBigdataStorageService(BigdataStorageService bigdataStorageService){
		this.bigdataStorageService = bigdataStorageService;
	}
	@Autowired
	public void setProtocolSignalService(ProtocolSignalService protocolSignalService){
		this.protocolSignalService = protocolSignalService;
	}
	
	
	public UtpEngineControllerManager()
	{
	}

	@Override
	public void onApplicationEvent(ContextRefreshedEvent event) {
		try {
			  ApplicationContext context = event.getApplicationContext();
			  logger.info(String.format(" UtpEngineControllerManager : getDisplayName: %s, getApplicationName: %s, getId: %s", context.getDisplayName(), context.getApplicationName(), context.getId()));
			  if (this.releaseEngineTask==null) {
			    	
				  logger.info(String.format("UtpEngineControllerManager created "));
				 this.releaseEngineTask = new ReleaseEngineTask(this);
				 releaseEngineTimer.scheduleAtFixedRate(releaseEngineTask, 0, 1000*60*20);
				 
				 this.savingExecutionResultTask = new SavingCachingDataTask(executionResultService, monitorDataService);
				 savingExecutionResultTimer.scheduleAtFixedRate(savingExecutionResultTask, 1000 * 5, 1000*3);
				 
			  }
		} catch (Exception ex) {
			logger.error("UtpEngineControllerManager.onApplicationEvent", ex);
		}
	}

	//从urs获取所有执行器
	public List<IpAddress> getUrsEngineStatuses(String UrsIpaddress, Long orgId, String userAccount)
	{
		List<IpAddress> IpAddressList = new ArrayList<>();
		String url = String.format(UrsServiceApis.GetUTPEngine, UrsIpaddress, orgId,userAccount) ;
		logger.info(String.format("Urs request url: %s", url));
		RestTemplate restTemplate = new RestTemplate();
		String utpResponse = restTemplate
				.getForObject(url, String.class,3);
		//解析返回的json
		JSONObject utpCoreAddressResponse = new JSONObject(utpResponse);
		logger.info(String.format("Urs request utpCoreAddressResponse: %s", utpCoreAddressResponse));
		//取出值
		JSONArray engineStatuses = utpCoreAddressResponse.getJSONArray("engineStatuses");
		logger.info(String.format("Urs request engineStatuses: %s", engineStatuses));
		for (int i = 0; i < engineStatuses.length(); i++) {
			//获取数组中的第i个json对象
			JSONObject engine = engineStatuses.getJSONObject(i);
			//获取json对象中的engineName值
			String ipAddress = (String) engine.get("utpIpAddress");
			Long port = engine.getLong("utpPort");
			String engineName = engine.getString("engineName");
			//存入ArrayList
			IpAddress tempIpAddress = new IpAddress(ipAddress,port,engineName);
			IpAddressList.add(tempIpAddress);
		}
		return IpAddressList;
	}

	//自动匹配执行器
	public IpAddress MatchedEngine (List<IpAddress> engineStatuses , String testSetEngineName){
		for (int i = 0; i < engineStatuses.size(); i++) {
			//获取数组中的第i个json对象
			IpAddress engine = engineStatuses.get(i);
			logger.info(String.format("i:%s,engine: %s ,engine: %s,testSetengineName: %s", i,engine,engine.engineName,testSetEngineName));
			//获取json对象中的engineName值
			if (engine.engineName.equals(testSetEngineName)) {
				String ipAddress = engine.getIpAddress();
				Long port = engine.getPort();
				logger.info(String.format("utpIpAddress: %s ,utpPort: %s", ipAddress,port));
				return new IpAddress(ipAddress,port,engine.engineName);
			}
		}
		return null;
	}



	public UtpEngineController CreateEngineController(String executionId, long projectId, String ipAddress, long port, boolean isDummyRun)
	{
        try {

        	// if found engineController, just return it.
        	for (UtpEngineController c : engineControllers)
        	{
        		if (c.getExecutionId().equalsIgnoreCase(executionId))
        		{
//        			return c;
					//从缓存中移除
					engineControllers.remove(c);
        		}
        	}

        	// else create engineController
    		UtpEngineController controller = CreateEngineControllerCore(executionId, projectId, ipAddress, port, isDummyRun);
    		engineControllers.add(controller);
        	
        	logger.info("CreateEngineController successfully");
        	return controller;
        } catch (Exception ex) {
        	logger.error("CreateEngineController", ex);
        	return null;
        }
	}

	public UtpEngineController GetEngineController(String executionId)
	{

        try {
        	for (UtpEngineController c : engineControllers)
        	{
        		if (c.getExecutionId().equalsIgnoreCase(executionId))
        		{
        			return c;
        		}
        	}
        	
        	return null;
        } catch (Exception ex) {
	       	logger.error("GetEngineController", ex);
	       	return null;
        }
	}

	public void tryReleaseUtpEngine()
	{
		logger.info(String.format("tryReleaseUtpEngine by timer."));
        try {
        	CopyOnWriteArrayList<UtpEngineController> controllers = engineControllers;
        	
        	for (UtpEngineController controller : controllers)
        	{
        		if (controller == null) {
        			continue;
        		}
        		
        		logger.info(String.format("tryReleaseUtpEngine, executionId : %s.", controller.getExecutionId()));
      		   
        		ExecutionModelManager.getInstance().TryReleaseObsoleteModel();

        		if (controller.tryReleaseEngine()) {
        			logger.info(String.format("executionId : %s ReleaseUtpEngine completed.", controller.getExecutionId()));
        		}
        	}
        } catch (Exception ex) {
	       	logger.error("tryReleaseUtpEngine", ex);
        }
	}
	
	private UtpEngineController CreateEngineControllerCore(String executionId, long projectId, String ipAddress, long port, boolean isDummyRun) throws UtpCoreNetworkException, InitEngineException, InterruptedException
	{
		UtpEngineController controller = new UtpEngineController(executionId, projectId, isDummyRun, executionStatusService);
		IUtpEngineAdapter utpEngine = utpAdapterFactoryManager.GetUtpAdatperFactory().createUtpEngineAdapter(this, executionStatusService, executionResultService, executionTestCaseResultService, bigdataStorageService,protocolSignalService,monitoringExecutionService, executionId);
		
		if (utpEngine.initEngine(ipAddress, port))
		{
			logger.info(String.format("init engine scuccess."));
			controller.setEngine(utpEngine);
		}
		
		return controller;
	}


	@Override
	public void ReleaseEngine(String executionId) {
	       try {
	        	for (UtpEngineController c : engineControllers)
	        	{
	        		if (c.getExecutionId().equalsIgnoreCase(executionId))
	        		{
		        		logger.info(String.format("tryReleaseUtpEngine, executionId : %s.", executionId));
		      		   
		        		c.setEngine(null);
		        		
		        		logger.info(String.format("executionId : %s ReleaseUtpEngine completed", executionId));	        		
	        			engineControllers.remove(executionId);
	        		}
	        	}
	        } catch (Exception ex) {
		       	logger.error("ReleaseEngine", ex);
	        }
	}

}


class ReleaseEngineTask extends TimerTask {

	UtpEngineControllerManager engineControllerManager = null;

	public ReleaseEngineTask(UtpEngineControllerManager engineControllerManager) {
		this.engineControllerManager = engineControllerManager;
	}

	@Override
	public void run() {
		engineControllerManager.tryReleaseUtpEngine();
	}
}

