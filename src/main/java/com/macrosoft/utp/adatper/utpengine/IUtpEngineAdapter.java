package com.macrosoft.utp.adatper.utpengine;

import java.util.Date;
import java.util.List;


import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.utp.adatper.utpengine.dto.ExecutionContext;
import com.macrosoft.utp.adatper.utpengine.exception.ActiveEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.AnalyzeScriptException;
import com.macrosoft.utp.adatper.utpengine.exception.ConfigEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.InitEngineException;
import com.macrosoft.utp.adatper.utpengine.exception.StartExecutionException;
import com.macrosoft.utp.adatper.utpengine.exception.UtpCoreNetworkException;
import com.macrosoftsys.UtpCoreAccessLib.ICommuExceptionListener;
import com.macrosoftsys.UtpCoreAccessLib.IExecProgListener;
import com.macrosoftsys.UtpCoreAccessLib.IMonitorDataListener;

public interface IUtpEngineAdapter {
	
	Date getLastActiveTime();
	
	Date setLastActiveTime();
	
	public long getTenantId();
	
	void setUtpEngineExceptionFlag();
	
	boolean getUtpEngineHasException();
	
	boolean initEngine(String utpCoreAddress, long utpCorePort) throws UtpCoreNetworkException, InterruptedException, InitEngineException;
	 
	void releaseEngine();
	
	void updateExecutionStatus(int newStatus, String newStatusString);
	
	void updateExecutionModelStatus(String status);
	
	void endExecutionByProgLisener();
	
	void endExecutionByStatusLisener(int newStatus, String newStatusString);
	
//	boolean activateEngine() throws UtpCoreNetworkException, ActiveEngineException;

//	void deactivateEngine();

	boolean configEngine(long projectId, long scriptId) throws UtpCoreNetworkException, ConfigEngineException, InterruptedException;
	
	boolean configEngineByTestsetId(long projectId, long testsetId, long recoverSubscriptReferenceId) throws UtpCoreNetworkException, ConfigEngineException, InterruptedException;

	boolean configEngineByScriptIds(long projectId, long[] scriptIds, long recoverSubscriptReferenceId) throws UtpCoreNetworkException, ConfigEngineException, InterruptedException;

	boolean analyzeScript(long projectId, String scriptId) throws UtpCoreNetworkException, AnalyzeScriptException, InterruptedException;

	void getAvailableAgents(ExecutionContext context, String orgId) throws InterruptedException, UtpCoreNetworkException;

	boolean startExecution(String executionId, List<SelectedAntbotMapping> selectedAntbotMapping) throws UtpCoreNetworkException, StartExecutionException, InterruptedException;
	
	boolean singleStepExecution() throws UtpCoreNetworkException;
	
	boolean stopExecution() throws UtpCoreNetworkException;

	boolean pauseExecution() throws UtpCoreNetworkException;

	boolean resumeExecution() throws UtpCoreNetworkException;

	void setMonitorDataListener(IMonitorDataListener listener);

	void setExecProgListener(IExecProgListener listener);

	void setCommuExceptionListener(ICommuExceptionListener listener);
}
