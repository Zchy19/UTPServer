package com.macrosoft.utp.adatper.utpengine;

import com.macrosoft.controller.dto.SelectedAntbotMapping;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.*;
import com.macrosoft.model.enums.LogicBlockProject;
import com.macrosoft.service.*;
import com.macrosoft.utilities.ManualResetEvent;
import com.macrosoft.utp.adatper.utpengine.dto.*;
import com.macrosoft.utp.adatper.utpengine.exception.*;
import com.macrosoftsys.UtpCoreAccessLib.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * UTP 引擎适配器实现类，负责与 UTP 引擎交互，管理执行流程、监听器和监控数据。
 * 实现 IUtpEngineAdapter 接口，并通过 Runnable 接口支持异步释放引擎。
 */
public class UtpEngineAdapterImpl implements IUtpEngineAdapter, Runnable {
	private UtpEngine utpEngine;
	private ScriptService scriptService;
	private ProjectService projectService;
	private SubscriptReferenceService subscriptReferenceService;
	private RecoverSubscriptReferenceService recoverSubscriptReferenceService;
	private ScriptGroupService scriptGroupService;
	private AgentConfigService agentConfigService;
	private ExecProgJavaListener progListener;
	private IExecStatusListener execStatusListener;
	private MonitorDataJavaListener dataListener;
	private CommunicationExceptionListerner communicationExceptionListerner;
	private EngineAsyncCallResponseListener engineAsyncCallResponseListener;
	private ExecutionTestCaseResultService executionTestCaseResultService;
	private ExecutionStatusService executionStatusService;
	private ExecutionResultService executionResultService;
	private TestSetService testsetService;
	private ScriptLinkService scriptLinkService;
	private IEngineFinializer engineFinalizer;
	private BigdataStorageService bigdataStorageService;
	private ProtocolSignalService protocolSignalService;
	private MonitoringExecutionService monitoringExecutionService;
	private boolean isReleased = false;
	private String executionId;
	private boolean utpEngineHasException;
	private Date lastActiveTime = new Date();
	private Lock lock = new ReentrantLock();
	private Lock endExecutionLock = new ReentrantLock();
	private List<Long> configuredScriptIds = new ArrayList<>();
	private ExecutionModel executionModel;
	private ManualResetEvent waitHandleForExecution = new ManualResetEvent(false);
	private boolean isExecutionEndedByProgListener = false;
	private boolean isExecutionEndedByStatusListener = false;

	private static final ILogger logger = LoggerFactory.Create(UtpEngineAdapterImpl.class.getName());

	/**
	 * 构造函数，初始化 UTP 引擎适配器并注册相关监听器。
	 *
	 * @param engineFinalizer                    引擎终结器，用于释放引擎资源
	 * @param projectService                    项目服务
	 * @param recoverSubscriptReferenceService  恢复子脚本引用服务
	 * @param subscriptReferenceService         子脚本引用服务
	 * @param scriptService                     脚本服务
	 * @param scriptGroupService                脚本组服务
	 * @param testsetService                    测试集服务
	 * @param scriptLinkService                 脚本链接服务
	 * @param agentConfigService                代理配置服务
	 * @param executionStatusService            执行状态服务
	 * @param executionResultService            执行结果服务
	 * @param executionTestCaseResultService    执行测试用例结果服务
	 * @param bigdataStorageService             大数据存储服务
	 * @param protocolSignalService             协议信号服务
	 * @param monitoringExecutionService        监控执行服务
	 * @param executionId                       执行 ID
	 */
	public UtpEngineAdapterImpl(IEngineFinializer engineFinalizer, ProjectService projectService,
								RecoverSubscriptReferenceService recoverSubscriptReferenceService,
								SubscriptReferenceService subscriptReferenceService,
								ScriptService scriptService, ScriptGroupService scriptGroupService,
								TestSetService testsetService, ScriptLinkService scriptLinkService,
								AgentConfigService agentConfigService, ExecutionStatusService executionStatusService,
								ExecutionResultService executionResultService,
								ExecutionTestCaseResultService executionTestCaseResultService,
								BigdataStorageService bigdataStorageService, ProtocolSignalService protocolSignalService,
								MonitoringExecutionService monitoringExecutionService, String executionId) {
		this.engineFinalizer = engineFinalizer;
		this.projectService = projectService;
		this.subscriptReferenceService = subscriptReferenceService;
		this.executionStatusService = executionStatusService;
		this.executionTestCaseResultService = executionTestCaseResultService;
		this.executionResultService = executionResultService;
		this.scriptService = scriptService;
		this.testsetService = testsetService;
		this.scriptLinkService = scriptLinkService;
		this.scriptGroupService = scriptGroupService;
		this.agentConfigService = agentConfigService;
		this.recoverSubscriptReferenceService = recoverSubscriptReferenceService;
		this.bigdataStorageService = bigdataStorageService;
		this.protocolSignalService = protocolSignalService;
		this.monitoringExecutionService = monitoringExecutionService;
		this.executionId = executionId;

		this.executionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);

		logger.info(String.format("%s create engine begin, tenantId: %s", this.executionId, executionModel.getTenantId()));
		utpEngine = new UtpEngine();
		logger.info(String.format("%s create engine end.", this.executionId));

		// 注册执行进度监听器，仅为特定 UtpEngine 注册一次
		progListener = new ExecProgJavaListener(this, scriptService, executionStatusService, executionResultService,
				executionTestCaseResultService, executionId);
		setExecProgListener(progListener);
		logger.info(String.format("%s set progress listener completed.", this.executionId));

		// 注册执行状态监听器
		execStatusListener = new ExecStatusJavaListener(executionResultService, this, executionStatusService, executionId);
		setExecStatusListener(execStatusListener);
		logger.info(String.format("%s set status listener completed.", this.executionId));

		// 注册监控数据监听器
		dataListener = new MonitorDataJavaListener(executionId, Long.toString(this.getTenantId()));
		setMonitorDataListener(dataListener);

		// 注册通信异常监听器
		communicationExceptionListerner = new CommunicationExceptionListerner(executionId, executionStatusService, this);
		setCommuExceptionListener(communicationExceptionListerner);

		// 注册引擎异步调用响应监听器
		engineAsyncCallResponseListener = new EngineAsyncCallResponseListener(scriptService, monitoringExecutionService,
				this, executionModel, waitHandleForExecution);
		setEngineAsyncCallResponseListener(engineAsyncCallResponseListener);

		logger.info(String.format("set monitor listener completed."));
	}

	/**
	 * 获取当前租户 ID。
	 *
	 * @return 租户 ID
	 */
	public long getTenantId() {
		return executionModel.getTenantId();
	}

	/**
	 * 初始化 UTP 引擎。
	 *
	 * @param utpCoreAddress UTP 核心地址，格式为 "{utpCoreAddress}:{engineName}"
	 * @param utpCorePort    UTP 核心端口
	 * @return 初始化是否成功
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 * @throws InterruptedException    如果线程被中断
	 * @throws InitEngineException     如果引擎初始化失败
	 */
	public boolean initEngine(String utpCoreAddress, long utpCorePort)
			throws UtpCoreNetworkException, InterruptedException, InitEngineException {
		logger.info(String.format("%s initEngine begin. executionId: SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineInitializing);
		boolean result = false;

		// 根据端口决定初始化方式
		if (utpCorePort == 0) {
			// 作为客户端初始化
			result = utpEngine.initEngineAsClient(this.executionModel.getOrgId(), executionModel.getIpAddress());
			if (!result) {
				logger.info(String.format("%s initEngine : %s.", executionId, InitEngineException.ErrorMessage));
				this.EngineInitErrorException();
			}
			logger.info(String.format("initEngineAsClient()-> orgId: %s, ExecutedByUserId:%s, return %s.",
					this.executionModel.getOrgId(), executionModel.getExecutedByUserId(), result));
		} else {
			// 通过指定地址和端口初始化
			result = utpEngine.initEngineReq(utpCoreAddress, utpCorePort);
			if (!result) {
				logger.info(String.format("%s initEngine : %s.", executionId, InitEngineException.ErrorMessage));
				this.EngineInitErrorException();
			}
			// 等待初始化完成
			waitHandleForExecution.waitOne();
		}

		logger.info(String.format("%s initEngine successfully. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		lastActiveTime = new Date();
		return result;
	}

	/**
	 * 执行单步操作。
	 *
	 * @return 是否成功执行
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 */
	public boolean singleStepExecution() throws UtpCoreNetworkException {
		boolean result = utpEngine.singleStepExecution();
		logger.info(String.format("%s singleStepExecution return: %s, SessionId: %s", executionId, result, utpEngine.getEngineSessionId()));
		if (!result) {
			this.ThrowUtpCoreNetworkException();
		}
		return true;
	}

	/**
	 * 释放 UTP 引擎资源。
	 */
	public void releaseEngine() {
		if (isReleased) return;

		try {
			lock.lock();
			if (engineFinalizer != null) {
				logger.info(String.format("%s engineFinalizer release engine. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
				engineFinalizer.ReleaseEngine(this.executionId);
			}
			logger.info(String.format("%s releaseEngine() end. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			logger.info(String.format("%s utpengine.releaseEngine() begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
			utpEngine.releaseEngine();
			logger.info(String.format("%s utpengine.releaseEngine() end. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		} catch (Exception ex) {
			logger.error(String.format("%s releaseEngine has error.", this.executionId));
			logger.error("releaseEngine", ex);
		} finally {
			isReleased = true;
			lock.unlock();
		}
	}

	/**
	 * 由进度监听器通知执行结束。
	 */
	public void endExecutionByProgLisener() {
		isExecutionEndedByProgListener = true;
		logger.info(String.format("%s ProgLisener notified execution end.", this.executionId));
		EndExecutionWhenMeetCondition();
	}

	/**
	 * 由状态监听器通知执行结束，并更新执行状态。
	 *
	 * @param newStatus      新状态码
	 * @param newStatusString 新状态描述
	 */
	public void endExecutionByStatusLisener(int newStatus, String newStatusString) {
		isExecutionEndedByStatusListener = true;

		// 根据状态码更新执行模型状态
		if (ExecutionStatus.Terminated == newStatus) {
			this.executionModel.setPrivate_endExecutionState_In_ExecutionModel(ExecutionModel.State_Terminated);
		} else if (ExecutionStatus.Stopped == newStatus) {
			this.executionModel.setPrivate_endExecutionState_In_ExecutionModel(ExecutionModel.State_Stopped);
		} else if (ExecutionStatus.Completed == newStatus) {
			this.executionModel.setPrivate_endExecutionState_In_ExecutionModel(ExecutionModel.State_Completed);
		}

		this.executionModel.setPrivate_endExecutionDateTime_In_ExecutionStatus(new Date());
		this.executionModel.setPrivate_endExecutionStatus_In_ExecutionStatus(newStatus);

		logger.info(String.format("%s StatusLisener notified %s.", this.executionId, newStatusString));
		EndExecutionWhenMeetCondition();
	}

	/**
	 * 当满足条件时结束执行，异步释放引擎资源。
	 */
	private void EndExecutionWhenMeetCondition() {
		try {
			endExecutionLock.lock();
			// 仅在状态监听器通知后结束执行
			if (!isExecutionEndedByStatusListener) {
				return;
			}
			logger.info(String.format("%s End execution when meet condition.", this.executionId));

			// 启动异步线程释放引擎
			Thread releaseEngineThread = new Thread(this);
			releaseEngineThread.start();
		} catch (Exception ex) {
			logger.error(String.format("%s EndExecutionWhenMeetCondition has error.", this.executionId));
			logger.error("EndExecutionWhenMeetCondition", ex);
		} finally {
			endExecutionLock.unlock();
		}
	}

	/**
	 * 更新执行模型的状态。
	 *
	 * @param status 新状态
	 */
	public void updateExecutionModelStatus(String status) {
		this.executionModel.setStatus(status);
	}

	/**
	 * 更新执行状态并持久化到数据库。
	 *
	 * @param newStatus      新状态码
	 * @param newStatusString 新状态描述
	 */
	public void updateExecutionStatus(int newStatus, String newStatusString) {
		TenantContext.setTenantId(Long.toString(this.getTenantId()));
		ExecutionStatus status = this.executionStatusService.getExecutionStatusByExecutionId(executionId);
		status.setStatus(newStatus);
		if (newStatus == ExecutionStatus.Completed || newStatus == ExecutionStatus.Stopped || newStatus == ExecutionStatus.Terminated) {
			status.setEndTime(new Date());
		}
		this.executionStatusService.updateExecutionStatus(status);
		logger.info(String.format("%s Update execution %s status to database.", this.executionId, newStatusString));
	}

	/**
	 * 配置引擎（已废弃），通过项目 ID 和脚本 ID 配置引擎。
	 *
	 * @param projectId 项目 ID
	 * @param scriptId  脚本 ID
	 * @return 配置是否成功
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 * @throws ConfigEngineException   如果配置失败
	 * @throws InterruptedException    如果线程被中断
	 * @deprecated 请使用其他配置方法
	 */
	@Deprecated
	public boolean configEngine(long projectId, long scriptId)
			throws UtpCoreNetworkException, ConfigEngineException, InterruptedException {
		logger.info(String.format("%s configEngine begin, projectId: %s, scriptId: %s, tenentId: %s",
				this.executionId, projectId, scriptId, executionModel.getTenantId()));
		this.executionModel.setProjectId(projectId);

		Project project = projectService.getProjectById(projectId);
		if (project == null) {
			logger.info("project == null");
		}

		EngineConfiguration config = new EngineConfiguration();

		// 处理监控执行的会话 ID
		String executionId = this.executionId.replaceAll("_stop", "");
		ExecutionModel startExecutionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);
		logger.info(String.format("executionId: %s, isMonitorExecution: %s", this.executionId, startExecutionModel.isMonitorExecution()));

		// 配置代理信息
		List<AgentInfo> agentInfos = getAgentsByProjectId(projectId);
		for (AgentInfo agentInfo : agentInfos) {
			config.addAgent(agentInfo.getType(), agentInfo.getName());
			logger.info(String.format("%s config.addAgent with type: %s with name: %s",
					this.executionId, agentInfo.getType(), agentInfo.getName()));
			config.addAgentConfigItem(agentInfo.getName(), "executionId", startExecutionModel.getExecutionId());

			if (startExecutionModel != null && startExecutionModel.isMonitorExecution()) {
				config.addAgentConfigItem(agentInfo.getName(), "monitorSessionId", startExecutionModel.getExecutionId());
				logger.info(String.format("%s config.addAgent with type: %s with monitorSessionID: %s",
						this.executionId, agentInfo.getType(), this.executionId));
			}

			// 配置记录集
			if (agentInfo.getRecordsetId() != null && !agentInfo.getRecordsetId().trim().isEmpty()) {
				config.addAgentConfigItem(agentInfo.getName(), "recordset", agentInfo.getRecordsetId());
				logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  recordset: %s",
						this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));
			}

			// 配置协议信号
			if (agentInfo.getProtocolSignalId() != null && !agentInfo.getProtocolSignalId().isEmpty()) {
				ProtocolSignal protocolSignal = protocolSignalService.getProtocol(agentInfo.getProtocolSignalId());
				if (protocolSignal == null) {
					logger.info(String.format("ProtocolSignal is null when query ProtocolSignalId: %s", agentInfo.getProtocolSignalId()));
					continue;
				}
				if (protocolSignal.getDataType().trim().equalsIgnoreCase(ProtocolSignal.SignalProtocol)) {
					config.addAgentConfigItem(agentInfo.getName(), "signalConfigTableID", agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  signalConfigTableID: %s",
							this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				} else {
					config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID", agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s",
							this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				}
			}

			// 配置通知处理脚本
			if (agentInfo.HasNotifyHandler()) {
				for (NotifyHandlerInfo notifyHandlerInfo : agentInfo.getNotifyHandlers()) {
					config.addAgentNotifyScript(agentInfo.getName(), notifyHandlerInfo.getNotifyId(), notifyHandlerInfo.getScriptId());
				}
			}
		}

		// 配置脚本
		ConfigureScript(config, projectId, scriptId, false);
		if (startExecutionModel != null && startExecutionModel.isMonitorExecution()) {
			config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
		} else {
			// 配置进度通知类型
			config.addProgNotiType(ExecProgTypeEnum.COMMAND_RESULT);
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_END);
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_END);
			config.addProgNotiType(ExecProgTypeEnum.EXECUTION_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
			config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_END);
		}

		logger.info(String.format("%s config engine begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineConfiguring);
		boolean result = utpEngine.configEngineReq(config);
		if (!result) {
			logger.info(String.format("%s configEngine : %s.", executionId, UtpCoreNetworkException.ErrorMessage));
			this.ThrowUtpCoreNetworkException();
		}

		waitHandleForExecution.waitOne();
		logger.info(String.format("%s config engine success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		return true;
	}

	/**
	 * 配置引擎（已废弃），通过测试集 ID 配置引擎。
	 *
	 * @param projectId                  项目 ID
	 * @param testsetId                 测试集 ID
	 * @param recoverSubscriptReferenceId 恢复子脚本引用 ID
	 * @return 配置是否成功
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 * @throws ConfigEngineException   如果配置失败
	 * @throws InterruptedException    如果线程被中断
	 * @deprecated 请使用其他配置方法
	 */
	@Deprecated
	public boolean configEngineByTestsetId(long projectId, long testsetId, long recoverSubscriptReferenceId)
			throws UtpCoreNetworkException, ConfigEngineException, InterruptedException {
		this.executionModel.setProjectId(projectId);
		logger.info(String.format("%s config engine started from testsetId execution. testsetId :%s, tenentId: %s",
				this.executionId, testsetId, executionModel.getTenantId()));
		EngineConfiguration config = new EngineConfiguration();

		// 配置代理信息
		List<AgentInfo> agentInfos = getAgentsByProjectId(projectId);
		for (AgentInfo agentInfo : agentInfos) {
			config.addAgent(agentInfo.getType(), agentInfo.getName());
			logger.info(String.format("%s config.addAgent with type: %s with name: %s",
					this.executionId, agentInfo.getType(), agentInfo.getName()));
			config.addAgentConfigItem(agentInfo.getName(), "executionId", this.executionId);

			// 配置记录集
			if (agentInfo.getRecordsetId() != null && !agentInfo.getRecordsetId().trim().isEmpty()) {
				config.addAgent(agentInfo.getType(), agentInfo.getName());
				logger.info(String.format("%s config.addAgent with type: %s with name: %s",
						this.executionId, agentInfo.getType(), agentInfo.getName()));
				config.addAgentConfigItem(agentInfo.getName(), "recordset", agentInfo.getRecordsetId());
				logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  recordset: %s",
						this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));
			}

			// 配置协议信号
			if (agentInfo.getProtocolSignalId() != null && !agentInfo.getProtocolSignalId().isEmpty()) {
				ProtocolSignal protocolSignal = protocolSignalService.getProtocol(agentInfo.getProtocolSignalId());
				if (protocolSignal == null) {
					logger.info(String.format("protocolSignal is null when query protocolSignalId: %s", agentInfo.getProtocolSignalId()));
					continue;
				}
				if (protocolSignal.getDataType().trim().equalsIgnoreCase(ProtocolSignal.SignalProtocol)) {
					config.addAgentConfigItem(agentInfo.getName(), "signalConfigTableID", agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  signalConfigTableID: %s",
							this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				} else {
					config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID", agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s",
							this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				}
			}

			// 配置通知处理脚本
			if (agentInfo.HasNotifyHandler()) {
				for (NotifyHandlerInfo notifyHandlerInfo : agentInfo.getNotifyHandlers()) {
					config.addAgentNotifyScript(agentInfo.getName(), notifyHandlerInfo.getNotifyId(), notifyHandlerInfo.getScriptId());
				}
			}
		}

		// 配置测试集脚本
		TestsetInfo testsetInfo = this.getTestsetInfos(projectId, testsetId);
		ScriptContent testsetScriptContent = new ScriptContent();
		for (ScriptInfo scriptInfo : testsetInfo.getScriptInfos()) {
			ScriptCmd cmd = new ScriptCmd();
			cmd.addCmdField("CALL_SCRIPT");
			cmd.addCmdField(scriptInfo.getId());
			testsetScriptContent.addScriptCmd(cmd);
			logger.debug(String.format("%s config testset - SUBSCRIPT id:%s", this.executionId, testsetInfo.getId()));
			ConfigureScript(config, projectId, Long.parseLong(scriptInfo.getId()), false);
		}
		config.addStructuredScript(testsetInfo.getId(), testsetScriptContent);

		// 配置恢复脚本
		if (recoverSubscriptReferenceId > 0) {
			RecoverSubscriptReference recoverSubscript = this.recoverSubscriptReferenceService.getRecoverSubscriptReference(projectId, recoverSubscriptReferenceId);
			if (recoverSubscript != null) {
				logger.info(String.format("%s recoverSubscript recoverSubscriptReferenceId: %s, subscriptId: %s",
						this.executionId, recoverSubscript.getId(), recoverSubscript.getSubscriptId()));
				ConfigureScript(config, 0L, recoverSubscript.getSubscriptId(), true);
				config.addEngineConfigItem("recoverScript", Long.toString(recoverSubscript.getSubscriptId()));
				logger.info(String.format("%s config recoverSubscript completed", this.executionId));
			}
		}

		// 配置进度通知类型
		config.addProgNotiType(ExecProgTypeEnum.COMMAND_RESULT);
		config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_END);
		config.addProgNotiType(ExecProgTypeEnum.TESTCASE_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.TESTCASE_END);
		config.addProgNotiType(ExecProgTypeEnum.EXECUTION_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
		config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_END);

		logger.info(String.format("%s config engine begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineConfiguring);
		boolean result = utpEngine.configEngineReq(config);
		waitHandleForExecution.waitOne();
		if (!result) {
			logger.info(String.format("%s configEngine : %s.", this.executionId, UtpCoreNetworkException.ErrorMessage));
			this.ThrowUtpCoreNetworkException();
		}

		logger.info(String.format("%s config engine success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		return true;
	}

	/**
	 * 通过脚本 ID 数组配置引擎。
	 *
	 * @param projectId                  项目 ID
	 * @param scriptIds                 脚本 ID 数组
	 * @param recoverSubscriptReferenceId 恢复子脚本引用 ID
	 * @return 配置是否成功
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 * @throws ConfigEngineException   如果配置失败
	 * @throws InterruptedException    如果线程被中断
	 */
	public boolean configEngineByScriptIds(long projectId, long[] scriptIds, long recoverSubscriptReferenceId)
			throws UtpCoreNetworkException, ConfigEngineException, InterruptedException {
		this.executionModel.setProjectId(projectId);
		logger.info(String.format("%s config engine started from testsetId execution. scriptIds :%s, tenentId: %s",
				this.executionId, scriptIds, executionModel.getTenantId()));
		EngineConfiguration config = new EngineConfiguration();
		ExecutionModel startExecutionModel = ExecutionModelManager.getInstance().GetExecutionModel(executionId);

		// 获取代理信息，包括公共逻辑库的代理
		List<AgentInfo> agentInfos = getAgentsByProjectId(projectId);
		agentInfos.addAll(getAgentsByProjectId(LogicBlockProject.LOGIC_BLOCK.getId()));
		String execOutputDataExtraID = startExecutionModel.getExecutionId() + "&" + startExecutionModel.getScriptGroupId();
		config.addEngineConfigItem("orgnizationID", String.valueOf(startExecutionModel.getOrgId()));
		config.addEngineConfigItem("executionId", startExecutionModel.getExecutionId());
		if (startExecutionModel.isTestdataCollect()) {
			config.addEngineConfigItem("execOutputDataExtraID", execOutputDataExtraID);
			config.addEngineConfigItem("uploadExecOutputDataFlag", "1");
		}
		config.addEngineConfigItem("transform_config", startExecutionModel.getTransformConfig());

		// 配置代理信息
		for (AgentInfo agentInfo : agentInfos) {
			config.addAgent(agentInfo.getType(), agentInfo.getName());
			logger.info(String.format("%s config.addAgent with type: %s with name: %s",
					this.executionId, agentInfo.getType(), agentInfo.getName()));
			config.addAgentConfigItem(agentInfo.getName(), "executionId", this.executionId);
			if (startExecutionModel.isTestdataCollect()) {
				config.addAgentConfigItem(agentInfo.getName(), "execOutputDataExtraID", execOutputDataExtraID);
				config.addAgentConfigItem(agentInfo.getName(), "uploadExecOutputDataFlag", "1");
			}
			config.addAgentConfigItem(agentInfo.getName(), "transform_config", startExecutionModel.getTransformConfig());

			// 配置记录集
			if (agentInfo.getRecordsetId() != null && !agentInfo.getRecordsetId().trim().isEmpty()) {
				config.addAgent(agentInfo.getType(), agentInfo.getName());
				logger.info(String.format("%s config.addAgent with type: %s with name: %s",
						this.executionId, agentInfo.getType(), agentInfo.getName()));
				config.addAgentConfigItem(agentInfo.getName(), "recordset", agentInfo.getRecordsetId());
				logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  recordset: %s",
						this.executionId, agentInfo.getName(), agentInfo.getRecordsetId()));
			}

			// 配置协议信号
			if (agentInfo.getProtocolSignalId() != null && !agentInfo.getProtocolSignalId().isEmpty()) {
				ProtocolSignal protocolSignal = protocolSignalService.getProtocol(agentInfo.getProtocolSignalId());
				if (protocolSignal == null) {
					logger.info(String.format("protocolSignal is null when query protocolSignalId: %s", agentInfo.getProtocolSignalId()));
					continue;
				}
				if (protocolSignal.getDataType().trim().equalsIgnoreCase(ProtocolSignal.SignalProtocol)) {
					config.addAgentConfigItem(agentInfo.getName(), "signalConfigTableID", agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  signalConfigTableID: %s",
							this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				} else {
					config.addAgentConfigItem(agentInfo.getName(), "busInterfaceDefID", agentInfo.getProtocolSignalId());
					logger.info(String.format("%s config.addAgentConfigItem with agentName: %s  busInterfaceDefID: %s",
							this.executionId, agentInfo.getName(), agentInfo.getProtocolSignalId()));
				}
			}

			// 配置通知处理脚本
			if (agentInfo.HasNotifyHandler()) {
				for (NotifyHandlerInfo notifyHandlerInfo : agentInfo.getNotifyHandlers()) {
					config.addAgentNotifyScript(agentInfo.getName(), notifyHandlerInfo.getNotifyId(), notifyHandlerInfo.getScriptId());
				}
			}
		}

		// 配置测试集脚本
		ScriptContent testsetScriptContent = new ScriptContent();
		TestsetInfo testsetInfo = this.getTestsetInfosByScriptIds(projectId, scriptIds);
		for (long scriptId : scriptIds) {
			ScriptCmd cmd = new ScriptCmd();
			cmd.addCmdField("CALL_SCRIPT");
			cmd.addCmdField(String.valueOf(scriptId));
			testsetScriptContent.addScriptCmd(cmd);
			logger.debug(String.format("%s config scriptIds - SUBSCRIPT id:%s", this.executionId, testsetInfo.getId()));
			ConfigureScript(config, projectId, scriptId, false);
		}
		config.addStructuredScript(testsetInfo.getId(), testsetScriptContent);

		// 配置恢复脚本
		if (recoverSubscriptReferenceId > 0) {
			RecoverSubscriptReference recoverSubscript = this.recoverSubscriptReferenceService.getRecoverSubscriptReference(projectId, recoverSubscriptReferenceId);
			if (recoverSubscript != null) {
				logger.info(String.format("%s recoverSubscript recoverSubscriptReferenceId: %s, subscriptId: %s",
						this.executionId, recoverSubscript.getId(), recoverSubscript.getSubscriptId()));
				ConfigureScript(config, 0L, recoverSubscript.getSubscriptId(), true);
				config.addEngineConfigItem("recoverScript", Long.toString(recoverSubscript.getSubscriptId()));
				logger.info(String.format("%s config recoverSubscript completed", this.executionId));
			}
		}

		// 配置进度通知类型
		if (startExecutionModel.isTestcaseCollect()) {
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.TESTCASE_END);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.CHECKPOINT_END);
		}
		if (startExecutionModel.isTeststepCollect()) {
			config.addProgNotiType(ExecProgTypeEnum.COMMAND_BEGIN);
			config.addProgNotiType(ExecProgTypeEnum.COMMAND_RESULT);
		}
		config.addProgNotiType(ExecProgTypeEnum.EXECUTION_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.EXECUTION_END);
		config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_BEGIN);
		config.addProgNotiType(ExecProgTypeEnum.EXCEPTION_END);

		logger.info(String.format("%s config engine begin. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineConfiguring);
		boolean result = utpEngine.configEngineReq(config);
		waitHandleForExecution.waitOne();
		if (!result) {
			logger.info(String.format("%s configEngine : %s.", this.executionId, UtpCoreNetworkException.ErrorMessage));
			this.ThrowUtpCoreNetworkException();
		}

		logger.info(String.format("%s config engine success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		return true;
	}

	/**
	 * 配置单个脚本。
	 *
	 * @param config     引擎配置对象
	 * @param projectId  项目 ID
	 * @param scriptId   脚本 ID
	 * @param isSubScript 是否为子脚本
	 */
	private void ConfigureScript(EngineConfiguration config, long projectId, long scriptId, boolean isSubScript) {
		ScriptInfo scriptInfo = getScriptInfo(projectId, scriptId);
		if (scriptInfo == null) {
			logger.error(String.format("scriptInfo is null when query scriptId: %s", scriptId));
			return;
		}
		String[] originalCommandStrings = scriptInfo.getCommands();
		ScriptContent scriptContent = new ScriptContent();

		// 解析脚本命令
		for (String commandString : originalCommandStrings) {
			ScriptCmd scriptCmd = new ScriptCmd();
			String[] cmdFields = convertCommandFields(commandString);
			StringBuilder commandTrace = new StringBuilder();

			for (String cmdField : cmdFields) {
				commandTrace.append(cmdField);
				scriptCmd.addCmdField(cmdField);
				// 为测试用例添加脚本 ID
				if (scriptInfo.getIsTestcase() && cmdField.trim().equalsIgnoreCase("TESTCASE_BEGIN")) {
					scriptCmd.addCmdField(Long.toString(scriptId));
					break;
				}
			}

			if (commandTrace.toString().trim().length() > 0) {
				logger.info(commandTrace.toString());
				scriptContent.addScriptCmd(scriptCmd);
			}
		}

		config.addStructuredScript(scriptInfo.getId(), scriptContent);
		configuredScriptIds.add(Long.parseLong(scriptInfo.getId()));

		// 配置子脚本引用
		List<SubscriptReference> childrenReferences = this.subscriptReferenceService.listSubscriptReferencesByParentScriptId(projectId, scriptId);
		logger.info(String.format("%s childrenReferences size: %s", executionId, childrenReferences.size()));
		for (SubscriptReference childReference : childrenReferences) {
			Long referencedSubScriptId = childReference.getSubscriptId();
			if (!configuredScriptIds.contains(referencedSubScriptId)) {
				logger.info(String.format("%s childReference id: %s", this.executionId, childReference.getId()));
				ConfigureScript(config, LogicBlockProject.LOGIC_BLOCK.getId(), childReference.getSubscriptId(), true);
			}
		}
	}

	/**
	 * 转换命令字段。
	 *
	 * @param commandString 原始命令字符串
	 * @return 转换后的命令字段数组
	 */
	private String[] convertCommandFields(String commandString) {
		String[] splitedCommandString = fullSplitString(commandString, ScriptContentParser.CommandSeparator);
		String[] cmdFields = new String[splitedCommandString.length];
		for (int i = 0; i < splitedCommandString.length; i++) {
			if (i == 0) {
				cmdFields[i] = splitedCommandString[i].replace("[[", "").replace("]]", "");
			} else {
				cmdFields[i] = splitedCommandString[i];
			}
		}
		return cmdFields;
	}

	/**
	 * 完整分割字符串，处理末尾分隔符。
	 *
	 * @param value     待分割的字符串
	 * @param separator 分隔符
	 * @return 分割后的字符串数组
	 */
	private String[] fullSplitString(String value, String separator) {
		String[] splitedData = value.split(separator);
		if (value.endsWith(separator)) {
			String[] fullSplitedData = new String[splitedData.length + 1];
			System.arraycopy(splitedData, 0, fullSplitedData, 0, splitedData.length);
			fullSplitedData[splitedData.length] = "";
			return fullSplitedData;
		} else {
			String[] fullSplitedData = new String[splitedData.length];
			System.arraycopy(splitedData, 0, fullSplitedData, 0, splitedData.length);
			return fullSplitedData;
		}
	}

	/**
	 * 分析指定脚本。
	 *
	 * @param projectId 项目 ID
	 * @param scriptId  脚本 ID
	 * @return 分析是否成功
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 * @throws AnalyzeScriptException  如果分析失败
	 * @throws InterruptedException    如果线程被中断
	 */
	public boolean analyzeScript(long projectId, String scriptId)
			throws UtpCoreNetworkException, AnalyzeScriptException, InterruptedException {
		logger.info(String.format("%s analysis script - scriptId: %s, SessionId: %s",
				executionId, scriptId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_AnalyzingScript);
		boolean result = utpEngine.analyzeScriptReq(scriptId);
		if (!result) {
			logger.info(String.format("%s analyzeScript : %s.", executionId, UtpCoreNetworkException.ErrorMessage));
			this.ThrowUtpCoreNetworkException();
		}
		waitHandleForExecution.waitOne();
		logger.info(String.format("%s analyzeScript success. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		return result;
	}

	/**
	 * 启动执行。
	 *
	 * @param executionId           执行 ID
	 * @param selectedAntbotMapping 选中的代理映射列表
	 * @return 执行是否成功启动
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 * @throws StartExecutionException 如果启动执行失败
	 * @throws InterruptedException    如果线程被中断
	 */
	public boolean startExecution(String executionId, List<SelectedAntbotMapping> selectedAntbotMapping)
			throws UtpCoreNetworkException, StartExecutionException, InterruptedException {
		SelectedAgentVector selectedAgents = new SelectedAgentVector();
		for (SelectedAntbotMapping mapping : selectedAntbotMapping) {
			SelectedAgent selectedAgent = new SelectedAgent();
			selectedAgent.setAgentId(mapping.getAntbotInstanceId());
			selectedAgent.setScriptAgentName(mapping.getAntbotName());
			selectedAgents.add(selectedAgent);
		}

		this.executionModel.setStatus(ExecutionModel.State_Starting);
		logger.info(String.format("startExecution : %s, SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		boolean result = utpEngine.startExecutionReq(selectedAgents);
		logger.info(String.format("%s utpEngine.startExecutionReq return %s.", executionId, result));
		if (!result) {
			this.ThrowUtpCoreNetworkException();
		}
		waitHandleForExecution.waitOne();
		return result;
	}

	/**
	 * 停止执行。
	 *
	 * @return 是否成功停止
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 */
	public boolean stopExecution() throws UtpCoreNetworkException {
		boolean result = utpEngine.stopExecution();
		if (!result) {
			logger.info(String.format("%s stopExecution : %s, SessionId: %s",
					executionId, UtpCoreNetworkException.ErrorMessage, utpEngine.getEngineSessionId()));
			this.ThrowUtpCoreNetworkException();
		}
		return true;
	}

	/**
	 * 暂停执行。
	 *
	 * @return 是否成功暂停
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 */
	public boolean pauseExecution() throws UtpCoreNetworkException {
		boolean result = utpEngine.pauseExecution();
		if (!result) {
			logger.info(String.format("%s pauseExecution : %s, SessionId: %s",
					executionId, UtpCoreNetworkException.ErrorMessage, utpEngine.getEngineSessionId()));
			this.ThrowUtpCoreNetworkException();
		}
		return true;
	}

	/**
	 * 恢复执行。
	 *
	 * @return 是否成功恢复
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 */
	public boolean resumeExecution() throws UtpCoreNetworkException {
		boolean result = utpEngine.resumeExecution();
		if (!result) {
			logger.info(String.format("%s resumeExecution : %s, SessionId: %s",
					executionId, UtpCoreNetworkException.ErrorMessage, utpEngine.getEngineSessionId()));
			this.ThrowUtpCoreNetworkException();
		}
		return true;
	}

	/**
	 * 设置监控数据监听器。
	 *
	 * @param listener 监控数据监听器
	 */
	public void setMonitorDataListener(IMonitorDataListener listener) {
		utpEngine.setMonitorDataListener(listener);
	}

	/**
	 * 设置执行进度监听器。
	 *
	 * @param listener 执行进度监听器
	 */
	public void setExecProgListener(IExecProgListener listener) {
		utpEngine.setExecProgListener(listener);
	}

	/**
	 * 设置执行状态监听器。
	 *
	 * @param listener 执行状态监听器
	 */
	public void setExecStatusListener(IExecStatusListener listener) {
		utpEngine.setExecStatusListener(listener);
	}

	/**
	 * 设置通信异常监听器。
	 *
	 * @param listener 通信异常监听器
	 */
	public void setCommuExceptionListener(ICommuExceptionListener listener) {
		utpEngine.setCommuExceptionListener(listener);
	}

	/**
	 * 设置引擎异步调用响应监听器。
	 *
	 * @param listener 异步调用响应监听器
	 */
	public void setEngineAsyncCallResponseListener(EngineAsyncCallResponseListener listener) {
		utpEngine.setAsyncCallResponseListener(listener);
	}

	/**
	 * 获取脚本信息。
	 *
	 * @param projectId 项目 ID
	 * @param scriptId  脚本 ID
	 * @return 脚本信息对象，若未找到则返回 null
	 */
	private ScriptInfo getScriptInfo(long projectId, long scriptId) {
		Script script = scriptService.getScriptById(projectId, scriptId);
		if (script == null) {
			logger.error(String.format("scriptId:%s, projectId: %s, can not find script to export.", scriptId, projectId));
			return null;
		}
		String scriptContent = script.getScript();
		if (scriptContent == null) {
			scriptContent = "";
		}
		String[] commands = scriptContent.split(ScriptContentParser.ScriptLineSeparator);
		logger.info("splicted commands count is : " + commands.length);
		boolean isTestcase = ScriptType.TestCaseType.equals(script.getType()) || ScriptType.RunnableScript.equals(script.getType());
		return new ScriptInfo(Long.toString(scriptId), commands, isTestcase);
	}

	/**
	 * 获取测试集信息。
	 *
	 * @param projectId 项目 ID
	 * @param testsetId 测试集 ID
	 * @return 测试集信息对象
	 */
	private TestsetInfo getTestsetInfos(long projectId, long testsetId) {
		TestsetInfo testsetInfo = new TestsetInfo(String.format("ts_%s", testsetId));
		List<ScriptLink> existingScriptLinks = this.scriptLinkService.listScriptLinksByTestsetId(projectId, testsetId);
		for (ScriptLink scriptLink : existingScriptLinks) {
			testsetInfo.addScriptInfo(this.getScriptInfo(projectId, scriptLink.getScriptId()));
		}
		return testsetInfo;
	}

	/**
	 * 通过脚本 ID 数组获取测试集信息。
	 *
	 * @param projectId 项目 ID
	 * @param scriptIds 脚本 ID 数组
	 * @return 测试集信息对象
	 */
	private TestsetInfo getTestsetInfosByScriptIds(long projectId, long[] scriptIds) {
		TestsetInfo testsetInfo = new TestsetInfo(String.format("ts_%s", scriptIds[0]));
		for (long scriptId : scriptIds) {
			testsetInfo.addScriptInfo(this.getScriptInfo(projectId, scriptId));
		}
		return testsetInfo;
	}

	/**
	 * 获取指定项目的代理信息列表。
	 *
	 * @param projectId 项目 ID
	 * @return 代理信息列表
	 */
	private List<AgentInfo> getAgentsByProjectId(long projectId) {
		List<AgentInfo> agentInfos = new ArrayList<>();
		try {
			List<AgentConfig> agentConfigs = agentConfigService.getAgentConfigByProjectId(projectId);
			for (AgentConfig config : agentConfigs) {
				logger.info(String.format("agent info projectId:%s, agentType:%s, agentInstanceName:%s, recordsetName:%s, ProtocolSignalId:%s",
						projectId, config.getAgentType(), config.getAgentInstanceName(), config.getRecordsetName(), config.getProtocolSignalId()));
				AgentInfo agentInfo = new AgentInfo(config.getAgentType(), config.getAgentInstanceName(),
						config.getRecordsetId(), config.getRecordsetName(), config.getProtocolSignalId());
				agentInfos.add(agentInfo);
			}
			return agentInfos;
		} catch (Exception ex) {
			logger.error(String.format("%s getAgentsByProjectId has error.", this.executionId));
			logger.error("getAgentsByProjectId", ex);
			return new ArrayList<>();
		}
	}

	/**
	 * 获取可用代理列表。
	 *
	 * @param executionContext 执行上下文
	 * @param orgId            组织 ID
	 * @throws InterruptedException    如果线程被中断
	 * @throws UtpCoreNetworkException 如果网络连接失败
	 */
	@Override
	public void getAvailableAgents(ExecutionContext executionContext, String orgId)
			throws InterruptedException, UtpCoreNetworkException {
		if (executionContext.isDummyRun()) {
			this.executionModel.setStatus(ExecutionModel.State_WaitingMatchAntbot);
			return;
		}
		boolean result = utpEngine.getAvailableAgentsReq(orgId);
		logger.info(String.format("%s EngineSessionId: %s, getAvailableAgents return : %s",
				this.executionId, utpEngine.getEngineSessionId(), result));
		if (!result) {
			logger.info(String.format("%s getAvailableAgents : %s.", this.executionId, UtpCoreNetworkException.ErrorMessage));
			this.ThrowUtpCoreNetworkException();
		}
		waitHandleForExecution.waitOne();
	}

	/**
	 * 获取最后活跃时间。
	 *
	 * @return 最后活跃时间
	 */
	@Override
	public Date getLastActiveTime() {
		return lastActiveTime;
	}

	/**
	 * 设置并返回最后活跃时间。
	 *
	 * @return 当前设置的最后活跃时间
	 */
	@Override
	public Date setLastActiveTime() {
		return lastActiveTime = new Date();
	}

	/**
	 * 设置 UTP 引擎异常标志。
	 */
	@Override
	public void setUtpEngineExceptionFlag() {
		utpEngineHasException = true;
	}

	/**
	 * 获取 UTP 引擎是否发生异常。
	 *
	 * @return 是否发生异常
	 */
	@Override
	public boolean getUtpEngineHasException() {
		return utpEngineHasException;
	}

	/**
	 * 处理引擎初始化错误异常。
	 *
	 * @throws InitEngineException 如果引擎初始化失败
	 */
	private void EngineInitErrorException() throws InitEngineException {
		logger.info(String.format("%s EngineInitErrorException. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_EngineInitError);
		String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
		monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_EngineInitError);
		throw new InitEngineException();
	}

	/**
	 * 抛出 UTP 核心网络异常。
	 *
	 * @throws UtpCoreNetworkException 网络连接失败
	 */
	private void ThrowUtpCoreNetworkException() throws UtpCoreNetworkException {
		logger.info(String.format("%s ThrowUtpCoreNetworkException. SessionId: %s", executionId, utpEngine.getEngineSessionId()));
		this.executionModel.setStatus(ExecutionModel.State_UtpCoreNetworkError);
		releaseEngine();
		String monitorExeuctionId = MonitorExecutionModelUtility.resolveMonitorExecutionId(this.executionModel.getExecutionId());
		monitoringExecutionService.updateMonitoringExecutionStatus(monitorExeuctionId, ExecutionModel.State_UtpCoreNetworkError);
		throw new UtpCoreNetworkException();
	}

	/**
	 * 实现 Runnable 接口，异步释放引擎资源。
	 */
	@Override
	public void run() {
		this.releaseEngine();
	}
}