package com.macrosoft.job;

import static org.quartz.JobBuilder.newJob;
import static org.quartz.TriggerBuilder.newTrigger;

import java.util.Calendar;
import java.util.Date;
import java.util.Hashtable;
import java.util.List;
import java.util.Set;

import org.quartz.CronScheduleBuilder;
import org.quartz.DateBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

import com.macrosoft.master.TenantContext;
import com.macrosoft.model.TestsetExecutionTrigger;

public class TenantExecutionJobManager {
	private static final ILogger logger = LoggerFactory.Create(TenantExecutionJobManager.class.getName());
	private Scheduler testExecutionScheduler;
	private ITriggerServicesProvider trggerServiceProvider;
	private Hashtable<JobKey, TestsetExecutionTrigger> arrangedExecutionJobs = new Hashtable<JobKey, TestsetExecutionTrigger>();
	private long tenantId;
	
	public TenantExecutionJobManager(long tenantId,ITriggerServicesProvider trggerServiceProvider, Scheduler testExecutionScheduler)
	{
		this.tenantId = tenantId;
		this.trggerServiceProvider = trggerServiceProvider;
		this.testExecutionScheduler = testExecutionScheduler;
	}
	
	public long getTenantId() {
		return tenantId;
	}

	public void setTenantId(long tenantId) {
		this.tenantId = tenantId;
	}
	
	public void ScheduleTriggerFromDBAsync()
	{
        Runnable runnable = () -> {
	        try {

				TenantContext.setTenantId(Long.toString(tenantId));
				
				List<TestsetExecutionTrigger> triggers = trggerServiceProvider.getTestsetExecutionTriggerService().listTestsetExecutionTrigger();

				for (TestsetExecutionTrigger trigger : triggers)
				{
					if (!trigger.getIsEnabled()) continue;
					
					JobDetail jobDetail = CreateAndAddJobIntoSchedule(this.tenantId, trigger);
					
					if (jobDetail == null) continue;
					arrangedExecutionJobs.put(jobDetail.getKey(), trigger);
				}

				logger.info(String.format("Trigger schedule completed for tenantId: : %s", tenantId));
	            
	        } catch(Exception ex) {

	        	logger.error(String.format("LoadFromDatabaseAsync has exception : %s",ex.toString()));
	    		 
	        }
        };

        Thread thread = new Thread(runnable);
        thread.start();
	}

	   public void UpdateWithJobSchedule(long orgId, TestsetExecutionTrigger toBeUpdatedTrigger)
	   {
		   try
		   {

			   
			   Set<JobKey> jobKeys = arrangedExecutionJobs.keySet();

			   // Step1: check if toBeMergedTrigger existed in schedule job list.
			   for (JobKey jobKey : jobKeys)
			   {
				   TestsetExecutionTrigger trigger = arrangedExecutionJobs.get(jobKey);

				   if (trigger.getId() == toBeUpdatedTrigger.getId())
				   {
					   if (!toBeUpdatedTrigger.getIsEnabled())  {
						   testExecutionScheduler.deleteJob(jobKey);
						   return;
					   }

					   testExecutionScheduler.deleteJob(jobKey);
					   JobDetail jobDetail = CreateAndAddJobIntoSchedule(orgId, toBeUpdatedTrigger);
						if (jobDetail == null) continue;
						arrangedExecutionJobs.put(jobDetail.getKey(), toBeUpdatedTrigger);
					   return;
				   }
			   }
			   
			   // Step2: if toBeMergedTrigger not found in schedule job list, add it into schedule.

			   JobDetail jobDetail = CreateAndAddJobIntoSchedule(orgId, toBeUpdatedTrigger);
				if (jobDetail == null) return;
				arrangedExecutionJobs.put(jobDetail.getKey(), toBeUpdatedTrigger);
		   }
		   catch (Exception ex)
		   {
				logger.error("UpdateWithJobSchedule", ex);
		   }
	   }
	   

	   public void DeleteTriggerFromJobSchedule(long toBeRemovedTriggerId)
	   {
		   try
		   {
			   Set<JobKey> jobKeys = arrangedExecutionJobs.keySet();
			   for (JobKey jobKey : jobKeys)
			   {
				   TestsetExecutionTrigger trigger = arrangedExecutionJobs.get(jobKey);

				   if (trigger.getId() == toBeRemovedTriggerId)
				   {
					   testExecutionScheduler.deleteJob(jobKey);
					   return;
				   }
			   }
		   }
		   catch (Exception ex)
		   {
				logger.error("DeleteTriggerFromJobSchedule", ex);
		   }
	   }
	   

	   private JobDetail CreateAndAddJobIntoSchedule(long orgId, TestsetExecutionTrigger testsetExecutionTrigger)
	   {
				final String JobGroup_TestsetExecution = "JobGroup_testsetExecution";
				final String JobName_TestsetExecution = "JobName_testset_trigger_" + orgId + "_" + testsetExecutionTrigger.getId();
				final String TriggerGroup_TestsetExecution = "TriggerGroup_testsetExecution";
				final String TriggerName_TestsetExecution = "TriggerName_testset_trigger_" + testsetExecutionTrigger.getId();
				final String crontriggerExpression = testsetExecutionTrigger.getCrontriggerExpression();
				
				try { 
					Date now = DateBuilder.evenMinuteDate(new Date());

				    JobDataMap jobDataMap = new JobDataMap();
				    jobDataMap.put("triggerObject", testsetExecutionTrigger);
				    
				    TestExectuionJobServicesWraper servicesWraper = new TestExectuionJobServicesWraper();
				    servicesWraper.testSetService = this.trggerServiceProvider.getTestSetService();
				    servicesWraper.projectService = this.trggerServiceProvider.getProjectService();
				    servicesWraper.testsetExecutionTriggerService = this.trggerServiceProvider.getTestsetExecutionTriggerService();
				    servicesWraper.ursConfig = this.trggerServiceProvider.getUrsConfig();
				    servicesWraper.testsetService = this.trggerServiceProvider.getTestsetService();
				    servicesWraper.scriptLinkService = this.trggerServiceProvider.getScriptLinkService();
				    servicesWraper.executionService = this.trggerServiceProvider.getExecutionService();
				    servicesWraper.executionResultService = this.trggerServiceProvider.getExecutionResultService();
				    servicesWraper.executionTestCaseResultService = this.trggerServiceProvider.getExecutionTestCaseResultService();
				    servicesWraper.utpEngineControllerManager = this.trggerServiceProvider.getUtpEngineControllerManager();
				    
				    jobDataMap.put("tenantId", orgId);
				    jobDataMap.put("triggerObject", testsetExecutionTrigger);
				    jobDataMap.put("servicesWraper", servicesWraper);

				    logger.info("jobDataMap prepare completed.");
			    	
				    JobDetail job = newJob(TestsetExecutionJob.class)
				    				.withIdentity(JobName_TestsetExecution, JobGroup_TestsetExecution)
				    				.setJobData(jobDataMap)
				    				.build();

				    logger.info("job create completed.");

			    	Trigger trigger = null;

			    	if (testsetExecutionTrigger.getCrontriggerExpression().compareToIgnoreCase("") == 0)
			    	{
				    	Date dNow = new Date();
						if ((dNow.getTime() - testsetExecutionTrigger.getStartTime().getTime()) >0)
						{	
							return null;
						}
						if ((dNow.getTime() - testsetExecutionTrigger.getStartTime().getTime()) >0)
						{
							
						}
					    trigger = newTrigger()
					    	    .withIdentity(TriggerName_TestsetExecution, TriggerGroup_TestsetExecution)
					    	    .startAt(testsetExecutionTrigger.getStartTime())
					    	    .withSchedule(SimpleScheduleBuilder.simpleSchedule())
					    	    .build();

					    logger.info("create SimpleSchedule trigger, startTime:" + testsetExecutionTrigger.getStartTime());
			    	}
			    	else
			    	{
				    	// if specified start time is before now, reset start time as one minute later than now.
				    	Date startTime = testsetExecutionTrigger.getStartTime();

				    	Date dNow = new Date();
						if ((dNow.getTime() - startTime.getTime()) >0)
						{
					    	Calendar date = Calendar.getInstance();
					    	long t= date.getTimeInMillis();
					    	startTime = new Date(t + (1 * 60000));
						}
						
						
					    trigger = newTrigger()
					    	    .withIdentity(TriggerName_TestsetExecution, TriggerGroup_TestsetExecution)
					    	    .startAt(startTime)
					    	    .withSchedule(CronScheduleBuilder.cronSchedule(testsetExecutionTrigger.getCrontriggerExpression()))
					    	    .build();

					    logger.info("create CronSchedule trigger, startTime:" + startTime);
			    	}
	
			    	logger.info("trigger create completed");
			    	
/*				    
				    Trigger trigger = newTrigger().withIdentity(JobName_TestsetJobExecution, ScheduleGroup_AutoExecution)
				    							  .startAt(runTime)
				    							  .withSchedule(SimpleScheduleBuilder.simpleSchedule()
				    									  		.repeatForever().withIntervalInHours(repeatIntervalInMinutes))
				    							  .build();
*/
				    
				    if (testExecutionScheduler == null)
				    {
				    	logger.info("testExecutionScheduler is null");
				    }
				    
				    testExecutionScheduler.scheduleJob(job, trigger);
				    
				    return job;
				    
				} catch (Exception ex) {

					logger.error("CreateAndAddJobIntoSchedule", ex);
				}
				
		   return null;
	   }
}
