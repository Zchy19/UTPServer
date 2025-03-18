package com.macrosoft.utp.adatper.utpengine;

import java.util.Date;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Map.Entry;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.service.MonitorExecutionModelUtility;
import com.macrosoft.service.impl.ProjectServiceImpl;

public class ExecutionModelManager {

	private static final ILogger logger = LoggerFactory.Create(ProjectServiceImpl.class.getName());
	private Hashtable<String, ExecutionModel> models = new Hashtable<String, ExecutionModel>();
	private static ExecutionModelManager _instance = new ExecutionModelManager();
	
	private ExecutionModelManager() {}
	
	public static ExecutionModelManager getInstance()
	{
		return _instance;
	}

	public ExecutionModel GetExecutionModel(String executionId)
	{
		if (models.containsKey(executionId))
		{
			return models.get(executionId);	
		}
/*
		String startExecutionId = MonitorExecutionModelUtility.resolveMonitorStartExecutionId(executionId);
		if (models.containsKey(startExecutionId))
		{
			return models.get(startExecutionId);	
		}
*/
		String endExecutionId = MonitorExecutionModelUtility.resolveMonitorEndExecutionId(executionId);
		if (models.containsKey(endExecutionId))
		{
			return models.get(endExecutionId);	
		}
		
		logger.info("GetExecutionModel return null, executionId: " + executionId);
		return null;
	}

/*	
	public ExecutionModel GetExecutionModelBySessionId(long engineSessionId)
	{
    	Hashtable<String, ExecutionModel> tempModels = new Hashtable<String, ExecutionModel>(models);
    	
    	Iterator<Entry<String, ExecutionModel>> iterator = tempModels.entrySet().iterator();
    	while(iterator.hasNext()){
    		Entry<String, ExecutionModel> entry = iterator.next();
    		
    		if (entry.getValue() == null) continue;

    		String executionId = entry.getKey();
    		ExecutionModel model = entry.getValue();

    		if (model.getEngineSessionId() == engineSessionId) return model;
    	}
    	
    	return null;
	}
*/	
	public void SaveExecutionModel(ExecutionModel model)
	{
		models.put(model.getExecutionId(), model);
		logger.info("save executionModel, executionId: " + model.getExecutionId());
		
	}
	
	public void RemoveExecutionModel(String executionId)
	{
		if (!models.containsKey(executionId)) return;

		models.remove(executionId);
	}
	
	public void TryReleaseObsoleteModel()
	{
        try {

    		logger.info(String.format("TryReleaseObsoleteModel, remaining models: %s", models.size()));
    		
        	Hashtable<String, ExecutionModel> tempModels = new Hashtable<String, ExecutionModel>(models);
        	
        	Iterator<Entry<String, ExecutionModel>> iterator = tempModels.entrySet().iterator();
        	while(iterator.hasNext()){
        		Entry<String, ExecutionModel> entry = iterator.next();
        		
        		if (entry.getValue() == null) {
            		logger.info(String.format("executionId has not found ExecutionModel %s.", entry.getKey()));
        			iterator.remove();
        			continue;
        		}
        		
        		logger.debug(String.format("tryRelease ExecutionModel, executionId : %s.", entry.getValue().getExecutionId()));
      		   
        		String executionId = entry.getKey();
        		ExecutionModel model = entry.getValue();

        		Date dNow = new Date();
        			
        		//milliseconds
        		long different = dNow.getTime() - model.getPrivate_startExecutionDateTime().getTime();
        			
        		long secondsInMilli = 1000;
        		long minutesInMilli = secondsInMilli * 60;

        		long elapsedMinutes = different / minutesInMilli;

        		logger.debug(String.format("tryRelease ExecutionModel %s elapsedMinutes is: %s", executionId , elapsedMinutes));

        		int MaxWaitingTimeOfExecutionModel = 60 * 24 * 5; // minutes
        		if (elapsedMinutes > MaxWaitingTimeOfExecutionModel)
        		{
        			// if the execution ended model has elapsed longer than 5 days, then remove it.
        			this.RemoveExecutionModel(executionId);
        			logger.info(String.format("Release ExecutionModel %s successfully.", executionId));            			
        		}
        	}        	
        } catch (Exception ex) {
	       	logger.error("TryReleaseObsoleteModel", ex);
        }
	}
	
}
