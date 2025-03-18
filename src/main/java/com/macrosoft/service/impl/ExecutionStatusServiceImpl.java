package com.macrosoft.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.macrosoft.configuration.UrsConfigurationImpl;
import com.macrosoft.dao.ExecutionStatusDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.composition.ExecutionStatusWithResult;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.utilities.FeaturesUtility;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PreDestroy;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class ExecutionStatusServiceImpl implements ExecutionStatusService, Runnable {
	private static final ILogger logger = LoggerFactory.Create(ExecutionStatusServiceImpl.class.getName());

	private ExecutionStatusDAO ExecutionStatusDAO;
	private UrsConfigurationImpl ursConfig;
	private final ScheduledExecutorService scheduler;

	@Autowired
	public void setUrsConfig(UrsConfigurationImpl ursConfig) {
		this.ursConfig = ursConfig;
	}

	@Autowired
	public void setExecutionStatusDAO(ExecutionStatusDAO ExecutionStatusDAO) {
		this.ExecutionStatusDAO = ExecutionStatusDAO;
	}
	
	@Override
	public void run() {
	
		try
		{
			logger.info("sp_cleanDatabase::begin.");
	        this.sp_cleanDatabase();
			logger.info("sp_cleanDatabase::end.");  
		}
		catch(Exception ex)
		{
			logger.info("sp_cleanDatabase::got exception:" + ex);  
		}  
	}
	
	public ExecutionStatusServiceImpl()
	{
        scheduler = Executors.newScheduledThreadPool(1);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextMidnight = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
        if (now.isAfter(nextMidnight)) {
            nextMidnight = nextMidnight.plusDays(1);
        }

        long initialDelay = now.until(nextMidnight,  ChronoUnit.SECONDS) * 1000;
        long period = TimeUnit.DAYS.toSeconds(365);
        scheduler.scheduleAtFixedRate(this, initialDelay, period, TimeUnit.SECONDS);
	}

	// 在 Bean 销毁时关闭线程池
	@PreDestroy
	public void shutdownScheduler() {
		if (scheduler != null && !scheduler.isShutdown()) {
			scheduler.shutdown(); // 停止接受新任务并等待现有任务完成
			try {
				if (!scheduler.awaitTermination(10, TimeUnit.SECONDS)) {
					scheduler.shutdownNow(); // 如果超时未关闭，强制关闭
					logger.error("Scheduler did not terminate gracefully, forced shutdown.");
				}
			} catch (InterruptedException e) {
				scheduler.shutdownNow();
				Thread.currentThread().interrupt(); // 恢复中断状态
				logger.error("Error during scheduler shutdown", e);
			}
		}
	}


	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getExecutionStatusByProjectId(long projectId) {
		return this.ExecutionStatusDAO.getExecutionStatusByProjectId(projectId);
	}
	
	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getActiveExecutionStatusByProjectId(long projectId) {
		return this.ExecutionStatusDAO.getActiveExecutionStatusByProjectId(projectId);
	}

	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetId(long projectId, long testsetId)
	{
		return this.ExecutionStatusDAO.getExecutionStatusByTestsetId(projectId, testsetId);
	}
	@Override
	@Transactional
	public ExecutionStatusWithResult getExecutionStatusByTestsetIdAndNew(long projectId, long testsetId)
	{
		return this.ExecutionStatusDAO.getExecutionStatusByTestsetIdAndNew(projectId, testsetId);
	}
	
	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getCompletedExecutionStatusByProjectId(long projectId) {
		return this.ExecutionStatusDAO.getCompletedExecutionStatusByProjectId(projectId);
	}
	
	@Override
	@Transactional
	public ExecutionStatusWithResult getExecutionStatusWithResultByExecutionId(String executionId) {
		return this.ExecutionStatusDAO.getExecutionStatusWithResultByExecutionId(executionId);
	}

	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getExecutionStatusBetween(long projectId, Date startTime, Date endTime) {
		return this.ExecutionStatusDAO.getExecutionStatusBetween(projectId, startTime, endTime);
	}

	@Override
	@Transactional
	public void removeExecutionData(String executionId) {
		this.ExecutionStatusDAO.removeExecutionData(executionId);
	}

	@Override
	@Transactional
	public void sp_startExecution(String executionId, String executionName, String testObject, long projectId, String orgId,
			String executedByUserId, int status, long testsetId, boolean isDummyRun,boolean isTemporaryExecution,String engineName,String informEmail) {

		this.ExecutionStatusDAO.sp_startExecution(executionId, executionName, testObject, projectId, orgId,
				executedByUserId, status, testsetId, isDummyRun,isTemporaryExecution,engineName,informEmail);
//		if (isTemporaryExecution){
//		this.ExecutionStatusDAO.saveExecutionAsTemporarySave(executionId);
//		}
	}


	@Override
	@Transactional
	public void sp_cleanDatabase() {
		this.ExecutionStatusDAO.sp_cleanDatabase();
	}

	@Override
	@Transactional
	public void updateExecutionStatus(ExecutionStatus p) {
		this.ExecutionStatusDAO.updateExecutionStatus(p);
	}

	@Override
	@Transactional
	public ExecutionStatus getExecutionStatusByExecutionId(String executionId) {
		return this.ExecutionStatusDAO.getExecutionStatusByExecutionId(executionId);
	}

	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getAllActiveExecutionStatus() {
		return this.ExecutionStatusDAO.getAllActiveExecutionStatus();
	}

	@Override
	@Transactional
	public void terminateAllUnFinishedExecution()
	{
		this.ExecutionStatusDAO.terminateAllUnFinishedExecution();
	}

	@Override
	@Transactional
	public void saveExecutionAsTemporarySave(String executionId)
	{
		this.ExecutionStatusDAO.saveExecutionAsTemporarySave(executionId);
	}

	//获取ExecutionStatus表中所有数据
	@Override
	@Transactional
	public List<ExecutionStatus> getAllExecutionStatus() {
		return this.ExecutionStatusDAO.getAllExecutionStatus();
	}

	@Override
	@Transactional
	public List<ExecutionStatus> getIntraDayExecutionStatusByUserId(String userId) {
		//获取当天的数据
		return this.ExecutionStatusDAO.getIntraDayExecutionStatusByUserId(userId);
	}

	@Override
	@Transactional
	public boolean isExceedMaxExecution(String userId) {
		//获取所有feature
		int count = 10;
		JsonNode utpserverFeatures = FeaturesUtility.GetFeaturesByModule(ursConfig.getIpAddress(),"utpserver");
		if(utpserverFeatures != null) {
			//获取配置文件中的值
			String configValue = FeaturesUtility.GetConfigValueByFeatureName(utpserverFeatures, "utpserver.execution_times_per_day");
			if (configValue!=null) {
				try {
					count = Integer.parseInt(configValue);
				} catch (Exception e) {
					// 处理转换失败的情况，这里可以选择记录日志或忽略异常
					logger.error("utpserver.execution_times_per_day配置configValue值转换失败，使用默认值10,configValue:" + configValue, e);
				}
			}
		}
		if (count !=-1) {
			//获取当天的数据
			List<ExecutionStatus> list = this.ExecutionStatusDAO.getIntraDayExecutionStatusByUserId(userId);
			if (list.size() >= count) {
				return true;
			}
		}
		return false;
	}

	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getExecutionStatusByTestsetIdAndTime(long projectId, long testsetId, Date startTime, Date endTime) {
		return this.ExecutionStatusDAO.getExecutionStatusByTestsetIdAndTime(projectId, testsetId, startTime, endTime);
	}

	@Override
	@Transactional
	public List<ExecutionStatusWithResult> getTestsetExecutionStatusWithResultByProjectIdAndTime(long projectId, Date startTime, Date endTime) {
		return this.ExecutionStatusDAO.getTestsetExecutionStatusWithResultByProjectIdAndTime(projectId, startTime, endTime);
	}
}
