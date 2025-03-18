package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.ExecutionModelUtility;
import com.macrosoft.service.MonitoringExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.controller.dto.MonitorExecutionStartParameter;
import com.macrosoft.dao.MonitoringExecutionDAO;
import com.macrosoft.dao.MonitoringTestSetDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.MonitoringExecution;
import com.macrosoft.model.MonitoringExecutionDetail;
import com.macrosoft.model.MonitoringTestSet;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;


@Service
public class MonitoringExecutionServiceImpl implements MonitoringExecutionService {
	private static final ILogger logger = LoggerFactory.Create(MonitoringExecutionServiceImpl.class.getName());
	private UtpEngineExecutor utpEngineExecutor;
	private MonitoringTestSetDAO MonitoringTestSetDAO;
	private MonitoringExecutionDAO monitoringExecutionDAO;
	
	@Qualifier(value="utpEngineExecutor")
	@Autowired
	public void setUtpEngineExecutor(UtpEngineExecutor utpEngineExecutor){
		this.utpEngineExecutor = utpEngineExecutor;
	}
	
	public UtpEngineExecutor getUtpEngineExecutor()
	{
		return utpEngineExecutor;
	}
	@Autowired
	public void setMonitoringTestSetDAO(MonitoringTestSetDAO monitoringTestSetDAO) {
		this.MonitoringTestSetDAO = monitoringTestSetDAO;
	}
	@Autowired
	public void setMonitoringExecutionDAO(MonitoringExecutionDAO monitoringExecutionDAO) {
		this.monitoringExecutionDAO = monitoringExecutionDAO;
	}

	
	
	@Override
	@Transactional
	public void startExecution(MonitorExecutionStartParameter startParameter) {

		MonitoringTestSet monitoringTestSet = this.MonitoringTestSetDAO.getMonitoringTestSetById(startParameter.getProjectId(), startParameter.getMonitoringTestSetId());
		String orgId = TenantContext.getOrgId();
		String executedByUserId = startParameter.getExecutedByUserId();
		String executionId = startParameter.getExecutionId();

		logger.info(String.format("startMonitorExecution executionId:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",executionId,  executedByUserId, startParameter.getProjectId(), monitoringTestSet.getStartScriptId(), orgId, startParameter.getIpAddress(), startParameter.getPort(), false));

		ExecutionModelUtility.SaveExecutionModelIntoCache(executionId, false, "", executedByUserId, true);
		

		ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		model.setIpAddress(startParameter.getIpAddress());
		model.setPort(startParameter.getPort());
		this.utpEngineExecutor.StartMonitorExecution(executionId, startParameter.getExecutedByUserId(), startParameter.getProjectId(), Long.toString(monitoringTestSet.getStartScriptId()), orgId, startParameter.getIpAddress(), startParameter.getPort(),startParameter.isTemporaryExecution());
		
		logger.info(String.format("startMonitorExecution executionId:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",executionId,  executedByUserId, startParameter.getProjectId(), monitoringTestSet.getStartScriptId(), orgId, startParameter.getIpAddress(), startParameter.getPort(), false));
	
/*
 * 
		MonitoringExecution monitoringExecution = this.monitoringExecutionDAO.getMonitoringExecutionById(executionId);
		monitoringExecution.setMonitorDataJson(monitorDataListData);
		this.monitoringExecutionDAO.updateMonitoringExecution(monitoringExecution);
		
		new Thread(() -> {
			try
			{
				ExecutionModelUtility.SaveExecutionModelIntoCache(executionId, false, "", executedByUserId);

				ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
				model.setMonitorTestSet(monitoringTestSet);
				model.setIpAddress(startParameter.getIpAddress());
				model.setPort(startParameter.getPort());
				utpEngineExecutor.MonitorExecutionScript(executionId, startParameter.getExecutedByUserId(), startParameter.getProjectId(), Long.toString(monitoringTestSet.getMonitorScriptId()), orgId, startParameter.getIpAddress(), startParameter.getPort());
			}
			catch (Exception ex)
			{
				logger.error("MonitorExecution - " + ex);
			}

		}).start();
*/
	}

	@Override
	@Transactional
	public void SendCommandExecution(MonitorExecutionStartParameter startParameter)
	{
		MonitoringTestSet monitoringTestSet = this.MonitoringTestSetDAO.getMonitoringTestSetById(startParameter.getProjectId(), startParameter.getMonitoringTestSetId());
		String orgId = TenantContext.getOrgId();
		String executedByUserId = startParameter.getExecutedByUserId();
		String executionId = startParameter.getExecutionId();

		logger.info(String.format("sendCommandExecution executionId:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",executionId,  executedByUserId, startParameter.getProjectId(), monitoringTestSet.getStartScriptId(), orgId, startParameter.getIpAddress(), startParameter.getPort(), false));

		ExecutionModelUtility.SaveExecutionModelIntoCache(executionId, false, "", executedByUserId, false);
		
		this.utpEngineExecutor.StartMonitorExecution(executionId, startParameter.getExecutedByUserId(), startParameter.getProjectId(), Long.toString(monitoringTestSet.getSendCommandScriptId()), orgId, startParameter.getIpAddress(), startParameter.getPort(),startParameter.isTemporaryExecution());
		
		logger.info(String.format("sendCommandExecution executionId:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",executionId,  executedByUserId, startParameter.getProjectId(), monitoringTestSet.getStartScriptId(), orgId, startParameter.getIpAddress(), startParameter.getPort(), false));
	
	}

	@Override
	@Transactional
	public void stopExecution(String executionId) {

		//utpEngineExecutor.StopExecution(executionId);

		ExecutionModel model = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		if (model == null) return;
		
		MonitoringExecution monitorExecution = this.monitoringExecutionDAO.getMonitoringExecutionById(executionId);
		if (monitorExecution == null) return;
		
		long monitorTestSetId = monitorExecution.getMonitoringTestSetId();
		
		MonitoringTestSet monitoringTestSet = this.MonitoringTestSetDAO.getMonitoringTestSetById(model.getProjectId(), monitorTestSetId);
		
		String orgId = TenantContext.getOrgId();
		String executedByUserId = model.getExecutedByUserId();
		String stopExecutionId = String.format("%s_stop", executionId);

		logger.info(String.format("stopMonitorExecution executionId:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",stopExecutionId,  executedByUserId, monitoringTestSet.getProjectId(), monitoringTestSet.getStartScriptId(), orgId, model.getIpAddress(), model.getPort(), false));

		ExecutionModelUtility.SaveExecutionModelIntoCache(stopExecutionId, false, "", executedByUserId, true);
		
		this.utpEngineExecutor.StopMonitorExecution(stopExecutionId, "", monitoringTestSet.getProjectId(), Long.toString(monitoringTestSet.getStopScriptId()), orgId, model.getIpAddress(), model.getPort());

		logger.info(String.format("startMonitorExecution executionId:%s, executedByUserId:%s, projectId: %s, scriptId:%s orgId: %s, ipaddress: %s, port: %s, isDummyRun: %s",executionId,  executedByUserId, monitoringTestSet.getProjectId(), monitoringTestSet.getStartScriptId(), orgId, model.getIpAddress(), model.getPort(), false));

	}

	@Override
	@Transactional
	public void updateMonitoringExecutionStatus(String executionId, String status)
	{
		monitoringExecutionDAO.updateMonitoringExecutionStatus(executionId, status);	
	}

	@Override
	@Transactional
	public List<MonitoringExecution> getMonitoringExecutionData(long testSetId) {
		return monitoringExecutionDAO.getMonitoringExecutionDataByTestSetId(testSetId);
	}

	@Override
	@Transactional
	public void deleteMonitoringExecution(String executionId) {
		monitoringExecutionDAO.removeMonitoringExecution(executionId);
	}

	@Override
	@Transactional
	public List<MonitoringExecutionDetail> getMonitoringExecutionDetails(String executionId, String monitorDataName, long resultIdAsStartPoint) {

		return monitoringExecutionDAO.listMonitoringExecutionDetails(executionId, monitorDataName, resultIdAsStartPoint);
	}

	@Override
	@Transactional
	public List<MonitoringExecutionDetail> getMonitoringExecutionDetails(String executionId, long resultIdAsStartPoint) {

		return monitoringExecutionDAO.listMonitoringExecutionDetails(executionId, resultIdAsStartPoint);
	}
	@Override
	@Transactional
	public void addMonitoringExecution(MonitoringExecution monitorExecution)
	{
		monitoringExecutionDAO.addMonitoringExecution(monitorExecution);	
	}

	@Override
	@Transactional
	public void updateMonitoringExecution(MonitoringExecution monitoringExecution)
	{
		monitoringExecutionDAO.updateMonitoringExecution(monitoringExecution);	
	}
	
	@Override
	@Transactional
	public MonitoringExecution getMonitoringExecution(String executionId)
	{
		return monitoringExecutionDAO.getMonitoringExecutionById(executionId);		
	}
	
	@Override
	@Transactional
	public MonitoringExecutionDetail addMonitoringExecutionDetails(MonitoringExecutionDetail detail) {
		
/*		String executionId = ExecutionModelUtility.GetExecutionIdBySessionId(detail.getMonitorSessionId());
		String realExecutionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(executionId);
		
		detail.setExecutionId(realExecutionId);
*/		
		monitoringExecutionDAO.addMonitoringExecutionDetail(detail);

		return detail;
	}
}
