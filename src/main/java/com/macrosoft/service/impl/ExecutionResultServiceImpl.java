package com.macrosoft.service.impl;

import java.util.List;
import java.util.Date;

import com.macrosoft.service.ExecutionResultService;
import com.macrosoft.service.ExportToWordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.ExecutionResultDAO;
import com.macrosoft.dao.ExecutionStatusDAO;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.ExecutionModel;
import com.macrosoft.model.ExecutionResult;
import com.macrosoft.model.ExecutionStatus;
import com.macrosoft.model.composition.ExecutionResultInfo;
import com.macrosoft.model.composition.PageSummary;
import com.macrosoft.utilities.EmailUtil;
import com.macrosoft.utp.adatper.utpengine.ExecutionModelManager;


@Service
public class ExecutionResultServiceImpl implements ExecutionResultService {
	private static final ILogger logger = LoggerFactory.Create(ExecutionResultServiceImpl.class.getName());
	private ExecutionResultDAO executionResultDAO;
	private ExecutionStatusDAO executionStatusDAO;
	private ExportToWordService mExportToWordService;

	@Autowired
	public void setExecutionResultDAO(ExecutionResultDAO executionResultDAO) {
		this.executionResultDAO = executionResultDAO;
	}
	@Autowired
	public void setExecutionStatusDAO(ExecutionStatusDAO executionStatusDAO) {
		this.executionStatusDAO = executionStatusDAO;
	}
	@Autowired(required = true)
	public void setExportToWordService(ExportToWordService es) {
		this.mExportToWordService = es;
	}

	@Override
	@Transactional
	public ExecutionResult addExecutionResult(ExecutionResult executionResult) {
		executionResult.setId(0);
		ExecutionResult execution = this.executionResultDAO.addExecutionResult(executionResult);
		return execution;
//		endExecutionByExecutionResult(executionResult);
	}

	private void endExecutionByExecutionResult(ExecutionResult executionResult)
	{
		if (executionResult.getCommandType() != ExecutionResult.CommandType_ExecutionEnd) return;
		
		String executionId = executionResult.getExecutionId();
		
		ExecutionModel executionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		
		// update execution status in database.
		ExecutionStatus status = this.executionStatusDAO.getExecutionStatusByExecutionId(executionId);
		status.setStatus(executionModel.getPrivate_endExecutionStatus_In_ExecutionStatus());
		status.setEndTime(executionModel.getPrivate_endExecutionDateTime_In_ExecutionStatus());
		this.executionStatusDAO.updateExecutionStatus(status);	

		logger.info(String.format("%s executoion_end has been saved in database, status: %s", executionId, executionModel.getPrivate_endExecutionStatus_In_ExecutionStatus() ));

		// update executionModel
		executionModel.setStatus(executionModel.getPrivate_endExecutionState_In_ExecutionModel());
		logger.info(String.format("%s executoion_end set in ExecutionModel, status: %s", executionId, executionModel.getPrivate_endExecutionState_In_ExecutionModel()));	
	}
	
	@Override
	@Transactional
	public void addExecutionResultList(List<ExecutionResult> results) {
		for (ExecutionResult result : results) {
			result.setId(0);
			this.executionResultDAO.addExecutionResult(result);

			endExecutionByExecutionResult(result);
		}
	}

	@Override
	@Transactional
	public void updateExecutionResult(ExecutionResult p) {
		this.executionResultDAO.updateExecutionResult(p);
	}

	@Override
	@Transactional
	public List<ExecutionResultInfo> listExecutionResultInfosAfterFromId(String executionId, long beginId) {
		return this.executionResultDAO.listExecutionResultInfosAfterFromId(executionId, beginId);
	}

	@Override
	@Transactional
	public List<ExecutionResultInfo> listMaximumExecutionResultInfosAfterFromId(String executionId, long beginId, int maximum) {
		return this.executionResultDAO.listMaximumExecutionResultInfosAfterFromId(executionId, beginId,maximum);
	}

	@Override
	@Transactional
	public List<ExecutionResultInfo> listExecutionResultSummaryInfosAfterFromId(String executionId, long beginId) {
		return this.executionResultDAO.listExecutionResultSummaryInfosAfterFromId(executionId, beginId);
	}

	@Override
	@Transactional
	public List<ExecutionResultInfo> listExecutionResultDetails(String executionId, long resultBeginId,
			long resultEndId) {

		logger.info("Service Transaction: listExecutionResultDetails begin...");
		return this.executionResultDAO.listExecutionResultInfosDetails(executionId, resultBeginId, resultEndId);
	}

	@Override
	@Transactional
	public List<ExecutionResultInfo> listLatestNumberOfExecutionResultInfos(String executionId, long amount) {

		return this.executionResultDAO.listLatestNumberOfExecutionResultInfos(executionId, amount);
	}
	

	@Override
	@Transactional
	public PageSummary getExecutionResultInfoPageSummary(String executionId, int rowsPerPage)
	{
		return this.executionResultDAO.getExecutionResultInfoPageSummary(executionId, rowsPerPage);
	}
	

	@Override
	@Transactional
	public List<ExecutionResultInfo> listPagedExecutionResultInfos(String executionId, int currentPage, int rowsPerPage)
	{
		return this.executionResultDAO.listPagedExecutionResultInfos(executionId, currentPage, rowsPerPage);
	}

	//获取executionresult中检查点的测试结果
	@Override
	@Transactional
	public String getExecutionResultByCheckPoint(String executionId, int scriptId, String requirementId) {

		//定义commandType类型为检查点
		int commandType = 3;
		ExecutionResultInfo ExecutionResultInfo = this.executionResultDAO.getExecutionResultByCheckPoint(executionId, scriptId, requirementId, commandType);
		if (ExecutionResultInfo != null) {
			if(ExecutionResultInfo.getResult()==1) {
				return "通过";
			}
			if (ExecutionResultInfo.getResult()==0) {
				return "未通过";
			}
			if (ExecutionResultInfo.getResult()==2) {
				return "超时";
			}
			return "未知";
		}
		return null;
	}

	//	获取excutionresult所有数据
	@Override
	@Transactional
	public List<ExecutionResult> getallExecutionResult() {
		return this.executionResultDAO.getallExecutionResult();
	}

	@Override
	@Transactional
	public List<ExecutionResult> getExecutionResultByExecutionId(String executionId) {
		return this.executionResultDAO.getExecutionResultByExecutionId(executionId);
	}

	@Override
	@Transactional
	public int getExecutionResultIntByExecutionIdAndCommandType(String executionId, int commandType) {
		return this.executionResultDAO.getExecutionResultIntByExecutionIdAndCommandType(executionId,commandType);
	}

	@Override
	@Transactional
	public int getExecutionResultIntByExecutionIdAndCommandTypeAndResult(String executionId, int commandType, int result) {
		return this.executionResultDAO.getExecutionResultIntByExecutionIdAndCommandTypeAndResult(executionId,commandType,result);
	}

	@Override
	@Transactional
	public List<ExecutionResultInfo> listResultByParentId(String executionId, String parentId) {
		return this.executionResultDAO.listResultByParentId(executionId,parentId);
	}

	@Override
	@Transactional
	public void sendEmailOfExecutionResult(String tenantId, String executionId, boolean isSendEmail, String emailAddress)
	{
		ExecutionStatus executionStatus = executionStatusDAO.getExecutionStatusByExecutionId(executionId);
		// dummy run will not send email.
		if (executionStatus.getIsDummyRun()) return;
		
		// script validation test will not send email.
		if (executionStatus.getTestsetId() == 0) return;
		
		if (!isSendEmail) return;

		//获取执行结果地址
		String absolutePath = mExportToWordService.exportToWord(executionId);
		
		String executedByUserId = executionStatus.getExecutedByUserId();
		String executionName = executionStatus.getExecutionName();
		String testObject = executionStatus.getTestObject();
		String testsetName = executionStatus.getTestsetName();

		Date startTime = executionStatus.getStartTime();
		Date endTime = executionStatus.getEndTime();
		int executionFinalStatus = executionStatus.getStatus();
		String executionFinalString = "";
		
		StringBuilder sb = new StringBuilder();
		sb.append(String.format("测试执行者:%s \n\n", executedByUserId));
		sb.append(String.format("执行实例名称: %s \n\n", executionName));
		sb.append(String.format("被测对象: %s \n\n", testObject));
		sb.append(String.format("测试集名称: %s  \n\n", testsetName));
		sb.append(String.format("测试开始时间: %s  \n\n", startTime));
		sb.append(String.format("测试结束时间: %s  \n\n\n\n", endTime));

		if (executionFinalStatus == ExecutionStatus.Completed)
		{
			executionFinalString = "执行已完成";
		}
		else if (executionFinalStatus == ExecutionStatus.Stopped)
		{
			executionFinalString = "手动停止";
		}
		else if (executionFinalStatus == ExecutionStatus.Terminated)
		{
			executionFinalString = "异常中断";
		}

		sb.append(String.format("最终结果: %s  \n\n", executionFinalString));
		String result = executionStatusDAO.getExecutionStatusWithResultByExecutionId(executionId).getResult();
		String executionResult = "";
		if (result.equals("Success"))
		{
			executionResult = "成功";
			sb.append(String.format("测试结果: 成功  \n\n"));
		}
		else
		{
			executionResult = "失败";
			sb.append(String.format("测试结果: 失败  \n\n"));
		}

		String subject = String.format("测试结果反馈-%s-%s(%s)", executionName, executionFinalString,executionResult);
		logger.info(String.format("sendEmailOfExecutionResult() -> executedByUserId:%s, executionName:%s, testsetName:%s, startTime:%s, endTime:%s " , executedByUserId, executionName, testsetName, startTime, endTime));
		
		boolean sendEmaiResult = EmailUtil.getInstance().sentEmailAttachment(emailAddress, subject, sb.toString(),absolutePath);
		if (sendEmaiResult)
		{
			logger.info(String.format("sendEmailOfExecutionResult() -> executionId:%s send target successfully. " , executionId));			
		}
	}
}
