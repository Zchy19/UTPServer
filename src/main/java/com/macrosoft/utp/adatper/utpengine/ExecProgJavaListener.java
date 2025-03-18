package com.macrosoft.utp.adatper.utpengine;


import java.text.SimpleDateFormat;
import java.util.Date;

import com.macrosoft.caching.CachedDataManager;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.ExecutionTestCaseResult;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptContentParser;
import com.macrosoft.service.ExecutionResultService;
import com.macrosoft.service.ExecutionStatusService;
import com.macrosoft.service.ExecutionTestCaseResultService;
import com.macrosoft.service.ScriptService;
import com.macrosoft.utilities.ParserResult;
import com.macrosoft.utilities.StringUtility;
import com.macrosoftsys.UtpCoreAccessLib.*;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import org.json.JSONArray;

public class ExecProgJavaListener extends IExecProgListener {
	private IUtpEngineAdapter utpEngineAdapter;
	private ScriptService scriptService;
	private ExecutionTestCaseResultService executionTestCaseResultService;
	private ExecutionStatusService executionStatusService;
	private String executionId;
	private long lastExecutionScriptId = 0;
	private String execution_Date = ""; //"y-m-d"
	private static final ILogger logger = LoggerFactory.Create(ExecProgJavaListener.class.getName());
	
	
	public ExecProgJavaListener(IUtpEngineAdapter utpEngineAdapter, ScriptService scriptService, ExecutionStatusService executionStatusService, 
			ExecutionResultService executionResultService,
			ExecutionTestCaseResultService executionTestCaseResultService, String executionId) {
		super();
		this.utpEngineAdapter = utpEngineAdapter;
		this.scriptService = scriptService;
		this.executionTestCaseResultService = executionTestCaseResultService;
		this.executionStatusService = executionStatusService;
		this.executionId = executionId;
	}
	public void update(ExecProgItem progNotify, long engineSessionId) {
		try
		{
			TenantContext.setTenantId(Long.toString(utpEngineAdapter.getTenantId()));
			
			logger.info(String.format("update progress, tenantId: %s, threadId: %s, sessionId: %s ", TenantContext.getTenantId(), Long.toString(Thread.currentThread().getId()), engineSessionId));
			
			utpEngineAdapter.setLastActiveTime();
			
//		String[] resultData = progNotify.getNotifContent();
//		ExecProgTypeEnum progType = progNotify.getNotifType();

    	//SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		
//
//		if (progType == ExecProgTypeEnum.EXECUTION_BEGIN) {
//			//"y-m-d"
//
//			logger.info("Execution progress update: Execution Begin.");
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommandType(ExecutionResult.CommandType_ExecutionBegin);
//
//			String executionBegin_DateTime = resultData[resultData.length-1]; //2022-04-25 21:27:46:79
//
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(executionBegin_DateTime);
//			if (dateResult.isParserSuccess())
//			{
//				execution_Date = executionBegin_DateTime.split(" ")[0];
//				result.setExecutionTime(dateResult.getResult());
//
//			}
//
//			logger.info("Execution_Begin at : " + executionBegin_DateTime);
//
//			result.setResult(ExecutionResult.Success);
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//		} else if (progType == ExecProgTypeEnum.COMMAND_RESULT) {
//
//			logger.info("Execution progress update: command result returned.");
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setScriptId(lastExecutionScriptId);
//
//			result.setCommandType(ExecutionResult.CommandType_Command);
//			result.setAgentInstanceName(resultData[0]);
//
//			String commandValue = resultData[1] + ScriptContentParser.CommandSeparator + resultData[2];
//			result.setCommand(commandValue);
//
//			//如果commandValue中包含字符subscript,则将commandType设置为6,否则设置为5
//			if (commandValue.contains("CALL_SCRIPT"))
//			{
//				result.setCommandType(ExecutionResult.CommandType_SubscriptEnd);
//			}
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
//
//			logger.info("Execution_Command_Result at : " + dateTime);
//
//
//			//contentJSON.put("params", resultData[2]);
//
//			if ("SUCCESS".equals(resultData[3]))
//			{
//				result.setResult(ExecutionResult.Success);
//			}
//			else if ("FAIL".equals(resultData[3]))
//			{
//				result.setResult(ExecutionResult.Fail);
//			}
//			else if ("TIMEOUT".equals(resultData[3]))
//			{
//				result.setResult(ExecutionResult.Timeout);
//			}
//			else
//			{
//				result.setResult(ExecutionResult.Other);
//			}
//
//			result.setExceptionMessage(resultData[4]);
//
//			logger.info(String.format("Execution command [agentName]: %s , [CommandName]:%s, [params]: %s, [result]: %s[ExceptionMessage]: %s", resultData[0], resultData[1], resultData[2], resultData[3], resultData[4]));
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//		}else if (progType == ExecProgTypeEnum.CHECKPOINT_BEGIN) {
//			logger.info("Execution progress update: checkpoint begin.");
//
//			String checkPointId = resultData[0];
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommandType(ExecutionResult.CommandType_CheckPointBegin);
//			result.setCommand(checkPointId);
//			result.setScriptId(lastExecutionScriptId);
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
//
//			logger.info("Execution_CHECKPOINT_BEGIN at : " + dateTime);
//
//			result.setResult(ExecutionResult.Success);
//
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//		}else if (progType == ExecProgTypeEnum.CHECKPOINT_END) {
//
//			logger.info("Execution progress update: checkpoint end.");
//			logger.info("checkpoint end returns parameter[0]:" + resultData[0]);
//			logger.info("checkpoint end returns parameter[1]:" + resultData[1]);
//
//
//			String checkPointId = resultData[0];
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommand(checkPointId);
//			result.setScriptId(lastExecutionScriptId);
//			result.setCommandType(ExecutionResult.CommandType_CheckPointEnd);
//
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
//
//			logger.info("Execution_CHECKPOINT_END at : " + dateTime);
//
//			if ("success".compareToIgnoreCase(resultData[1]) == 0)
//			{
//				result.setResult(ExecutionResult.Success);
//			}
//			else
//			{
//				result.setResult(ExecutionResult.Fail);
//			}
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//		}else if (progType == ExecProgTypeEnum.EXCEPTION_BEGIN) {
//			logger.info("Execution progress update: exception begin.");
//
//			String checkPointId = resultData[0];
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommandType(ExecutionResult.CommandType_ExceptionBegin);
//			//result.setCommand(checkPointId);
//
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
//
//			logger.info("Execution_EXCEPTION_BEGIN at : " + dateTime);
//
//			result.setResult(ExecutionResult.Success);
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//
//		}else if (progType == ExecProgTypeEnum.EXCEPTION_END) {
//
//			logger.info("Execution progress update: exception end.");
//			//LoggerFacade.info("TestEnd returns parameter[0]:" + resultData[0]);
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			//result.setCommand(checkPointId);
//			result.setCommandType(ExecutionResult.CommandType_ExceptionEnd);
//
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
//
//			logger.info("Execution_EXCEPTION_END at : " + dateTime);
//
//			result.setResult(ExecutionResult.Success);
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//
//		} else if (progType == ExecProgTypeEnum.TESTCASE_BEGIN) {
//			logger.info("Execution progress update: testcase begin.");
//			logger.info("TESTCASE_BEGIN returns parameter[0]:" + resultData[0]);
//
//			ExecutionStatus status = executionStatusService.getExecutionStatusByExecutionId(this.executionId);
//			if (status == null) return;
//
//			// add executionresult
//			lastExecutionScriptId = Long.parseLong(resultData[0]);
//
//			Script script = scriptService.getScriptById(status.getProjectId(), lastExecutionScriptId);
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommandType(ExecutionResult.CommandType_TestcaseBegin);
//			result.setCommand(script.getName());
//			result.setScriptId(lastExecutionScriptId);
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
////			executionTestCaseResultService.updateExecutionTestCaseResultByStartTime(executionId, lastExecutionScriptId,dateResult.getResult());
//			logger.info("Execution_TESTCASE_BEGIN at : " + dateTime);
//
//			result.setResult(ExecutionResult.Success);
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//		} else if (progType == ExecProgTypeEnum.TESTCASE_END) {
//
//			logger.info("Execution progress update: testcase end.");
//			logger.info("TestEnd returns parameter[0]:" + resultData[0]);
//			logger.info("TestEnd returns parameter[1]:" + resultData[1]);
//
//			lastExecutionScriptId = Long.parseLong(resultData[0]);
//
//			ExecutionStatus status = executionStatusService.getExecutionStatusByExecutionId(this.executionId);
//			if (status == null) return;
//
//			Script script = scriptService.getScriptById(status.getProjectId(), lastExecutionScriptId);
//
//			// add executionresult
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommand(script.getName());
//			result.setCommandType(ExecutionResult.CommandType_TestcaseEnd);
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
//
//			logger.info("Execution_TESTCASE_END at : " + dateTime);
//
//			result.setScriptId(lastExecutionScriptId);
//
//			String testcaseResult = resultData[1];
//
//			if ("success".compareToIgnoreCase(testcaseResult) == 0)
//			{
//				result.setResult(ExecutionResult.Success);
//			}
//			else
//			{
//				result.setResult(ExecutionResult.Fail);
//			}
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//			// add executionTestCaseResult
//			//testCaseResult.setScriptId(resultData[0]);
//			if ("success".compareToIgnoreCase(testcaseResult) == 0)
//			{
//				executionTestCaseResultService.updateExecutionTestCaseResult(executionId, lastExecutionScriptId, ExecutionTestCaseResult.Success);
////				executionTestCaseResultService.updateExecutionTestCaseResultByEndTime(executionId, lastExecutionScriptId,dateResult.getResult());
//			}
//			else if ("failure".compareToIgnoreCase(testcaseResult) == 0)
//			{
//				executionTestCaseResultService.updateExecutionTestCaseResult(executionId, lastExecutionScriptId, ExecutionTestCaseResult.Fail);
////				executionTestCaseResultService.updateExecutionTestCaseResultByEndTime(executionId, lastExecutionScriptId,dateResult.getResult());
//			}
//			else
//			{
//				executionTestCaseResultService.updateExecutionTestCaseResult(executionId, lastExecutionScriptId, ExecutionTestCaseResult.None);
////				executionTestCaseResultService.updateExecutionTestCaseResultByEndTime(executionId, lastExecutionScriptId,dateResult.getResult());
//			}
//		}else if (progType == ExecProgTypeEnum.COMMAND_BEGIN) {
//			logger.info("Execution progress update: testcase begin.");
//			logger.info("TESTCASE_BEGIN returns parameter[0]:" + resultData[0]);
//
//			ExecutionStatus status = executionStatusService.getExecutionStatusByExecutionId(this.executionId);
//			if (status == null) return;
//
//			// add executionresult
//
//			ExecutionResult result = new ExecutionResult();
//			result.setExecutionId(executionId);
//			result.setCommandType(ExecutionResult.CommandType_SubscriptBegin);
//			result.setScriptId(lastExecutionScriptId);
//
//			//暂时写死
////			result.setAgentInstanceName(resultData[0]);
//			result.setAgentInstanceName("__EXTDEV__");
//			String commandValue = resultData[1] + ScriptContentParser.CommandSeparator + resultData[2];
//			result.setCommand(commandValue);
//
//			String time = resultData[resultData.length-1]; //21:27:46:98
//			//判断字符串中是否含有空格
//			if (time.contains(" "))
//			{
//				execution_Date = time.split(" ")[0];
//				time = time.split(" ")[1];
//			}
//			String dateTime = execution_Date + " " + time;
//			ParserResult<Date> dateResult = StringUtility.parseDateTimeSafely(dateTime);
//			if (dateResult.isParserSuccess())
//			{
//				result.setExecutionTime(dateResult.getResult());
//			}
////			executionTestCaseResultService.updateExecutionTestCaseResultByStartTime(executionId, lastExecutionScriptId,dateResult.getResult());
//			logger.info("Execution_TESTCASE_BEGIN at : " + dateTime);
//
//			result.setResult(ExecutionResult.Success);
//
//			CachedDataManager.AddExecutionResult(Long.toString(utpEngineAdapter.getTenantId()), result);
//
//		}
//		else if (progType == ExecProgTypeEnum.EXECUTION_END) {
//
//			logger.info("Execution progress update: Execution End.");
//
//			execution_Date = resultData[resultData.length-1];
//
//
//			logger.info("Execution_end at : " + execution_Date);
//
//			this.utpEngineAdapter.endExecutionByProgLisener();
//		}
//		else
//		{
//			System.out.println("progType: unkonwn");
//			logger.info("Execution progress update: unknown execution happen..");
//		}
		
		}
		catch(Exception ex)
		{
			logger.error("Execution has exception happened when update:" + ex.toString());
		}
	}
}
