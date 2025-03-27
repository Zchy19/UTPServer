define(['jquery', 'durandal/plugins/http', 'komapping', 'services/executionManager', 'services/projectManager', 'services/protocolService', 'services/loginManager', 'services/selectionManager', 'services/viewManager', 'services/systemConfig',
	'services/ursService', 'services/utpService', 'services/cmdConvertService', 'services/notificationService', 'services/utilityService', 'jsoneditor', 'blockUI', 'bootstrapSwitch', 'knockout', 'knockout-sortable', 'knockstrap'],
	function ($, $http, komapping, executionManager, projectManager, protocolService, loginManager, selectionManager, viewManager, systemConfig, ursService, utpService, cmdConvertService, notificationService, utilityService, JSONEditor, blockUI, bootstrapSwitch, ko, sortable, knockstrap) {

		function VerificationViewModel() {
			var self = this;
			this.selectionManager = selectionManager;
			this.viewManager = viewManager;
			this.systemConfig = systemConfig;
			this.pressureTestSummaryChart = null;
			this.projectManager = projectManager;
			this.lastestCaseNode = null;
			this.lastResultId = 0;
			this.lastExecutionDataId = 0;
			this.executionCallbackRegisted = false;
			this.executionId = 0;
			this.resultRetrieveBegin = false;
			this.executeState = ko.observable(executionManager.notStarted);
			this.executeStateNotification = ko.observable('');
			this.busyPropInfo = ko.observable('');
			this.errorPropInfo = ko.observable('');
			this.runResultPropInfo = ko.observable('');
			this.executionName = ko.observable('');
			this.selectedProject = ko.observable();
			this.cmdConvertService = cmdConvertService;
			this.availableAgents = ko.observableArray([]);
			this.targetObjectCandidates = ko.observableArray([]);
			this.selectTargetObjectId = ko.observable();
			this.targetEngineCandidates = ko.observableArray([]);
			this.selectTargetEngineId = ko.observable();
			this.triggerStop = false;
			this.testResult = ko.observableArray([]);
			this.deactive = false;
			this.dummyVerification = ko.observable(false);
			this.isGoback = ko.observable(false);
			this.selectResultStep = null;
			this.preExecutionStatusFetchingCount = 3;
			this.popoverTemplate = ko.observable('bitTablePopoverTemplate');
			this.showGoBack = ko.observable(false);
			this.commandCount = ko.observable(0);
			this.commandCountFailed = ko.observable(0);
			
			// return
			this.goback = function () {
				$('#verificationDynamicTargetObjectsModal').modal('hide');
				$('#verificationDynamicAgentsModal').modal('hide');
				$('#inputVerificationModal').modal('hide');
				$('.modal-backdrop').remove();
				self.isGoback(true);
				//关闭websocket链接
				if (self.resultStepWebsocket) {
					self.resultStepWebsocket.close();
				}
				self.testResult([]);
				if (self.selectionManager.verificationSource === 'testcase') {
					self.projectManager.useBackupScripts = true;
					self.viewManager.testcaseActivePage('app/viewmodels/testcase');
				}
				if (self.selectionManager.verificationSource === 'runablescript') {
					self.projectManager.useBackupScripts = true;
					self.viewManager.runablescriptActivePage('app/viewmodels/runablescript');
				}
				if (self.selectionManager.verificationSource === 'playground')
					self.viewManager.testcaseActivePage('app/viewmodels/playground');
				if (self.selectionManager.verificationSource === 'playground_comsc')
					self.viewManager.commonscriptActivePage('app/viewmodels/playground_comsc');
				if (self.selectionManager.verificationSource === 'playground_runsc')
					self.viewManager.runablescriptActivePage('app/viewmodels/playground_runsc');
			}

			// agent selection
			this.getSelectTargetObject = function () {
				if (self.selectTargetObjectId() == "" || self.selectTargetObjectId() == undefined)
					return false;
				self.availableAgents([]);
				var selectTargetObjectCandidate = null;
				for (var i = 0; i < self.targetObjectCandidates().length; i++) {
					if (self.targetObjectCandidates()[i].targetObjectId() === self.selectTargetObjectId()) {
						selectTargetObjectCandidate = komapping.toJS(self.targetObjectCandidates()[i]);
						break;
					}
				}

				if (selectTargetObjectCandidate != null) {
					var initialTables = [];
					for (var i = 0; i < selectTargetObjectCandidate.agentsDefinedInScript.length; i++) {
						var antbotName = selectTargetObjectCandidate.agentsDefinedInScript[i].antbotName;
						var antbotType = selectTargetObjectCandidate.agentsDefinedInScript[i].antbotType;
						var agents = [];
						for (var j = 0; j < selectTargetObjectCandidate.candidateAgents.length; j++) {
							if (antbotName == selectTargetObjectCandidate.candidateAgents[j].antbotName && antbotType == selectTargetObjectCandidate.candidateAgents[j].antbotType) {
								agents.push(selectTargetObjectCandidate.candidateAgents[j]);
								break;
							}
						}
						initialTables.push({ antbotName: antbotName, antbotType: antbotType, antbots: agents }); // add antbotType
					}

					availableAgents = selectTargetObjectCandidate.agentInfos;
					komapping.fromJS(initialTables, {}, self.tables);
					for (var i = 0; i < self.tables().length; i++)
						self.tables()[i].antbots.antbotType = self.tables()[i].antbotType();
					komapping.fromJS(availableAgents, {}, self.availableAgents);
				}
			}

			this.tables = ko.observableArray([]);
			this.availableAgents = ko.observableArray([]);
			this.maximumAgents = 1;

			this.isTableFull = function (parent) {
				return parent().length < self.maximumAgents;
			};

			this.antbotTypeMatch = function (param) {
				if (param.item.antbotType() != param.targetParent.antbotType)
					param.cancelDrop = true;
			};

			this.confirmTargetObject = function () {
				$('#verificationDynamicTargetObjectsModal').modal('hide');
				self.getSelectTargetObject();
				$('#verificationDynamicAgentsModal').modal('show');
			}

			this.targetObjectSelectionDone = ko.computed(function () {
				if (self.selectTargetObjectId() == "" || self.selectTargetObjectId() == undefined)
					return false;
				return true;
			});

			this.agentSelection = function (liveAntbotDictionarys, antbotsDefinedInScript) {
				var targetAgents = [];
				var targetObjectCandidates = [];
				for (var i = 0; i < liveAntbotDictionarys.length; i++) {
					//	if(liveAgentInfoDictionarys[i].agentInfos.length >= agentsDefinedInScript.length)
					{
						for (var k = 0; k < antbotsDefinedInScript.length; k++) {
							antbotsDefinedInScript[k].found = false;
						}

						var agentInfos = liveAntbotDictionarys[i].antbotInfos.concat();
						var j = agentInfos.length;
						targetAgents = [];
						while (j--) {
							for (var k = 0; k < antbotsDefinedInScript.length; k++) {
								if (!antbotsDefinedInScript[k].found && (agentInfos[j].antbotName == antbotsDefinedInScript[k].antbotName && agentInfos[j].antbotType === antbotsDefinedInScript[k].antbotType)) {
									targetAgents.push(agentInfos[j]);
									antbotsDefinedInScript[k].found = true;
									agentInfos.splice(j, 1);
									break;
								}
							}
						}

						var targetObjectCandidate = $.extend(true, {}, liveAntbotDictionarys[i]);
						targetObjectCandidate.agentInfos = agentInfos;
						targetObjectCandidate.candidateAgents = targetAgents;
						targetObjectCandidate.agentsDefinedInScript = antbotsDefinedInScript;
						targetObjectCandidate.conditionMeet = antbotsDefinedInScript.length == targetAgents.length
						targetObjectCandidates.push(targetObjectCandidate);
					}
				}
				return targetObjectCandidates;
			}

			// prepare execution
			this.prepareExecutionSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.triggerStop = true;
					self.preExecutionStatusFetchingCount = 3;
					setTimeout(
						function () {
							$.blockUI(utilityService.template);
							self.showGoBack(true);
							self.getPreExecutionStatus();

						}, 1000);
				}
				else {
					self.prepareExecutionErrorFunction(data.result);
				}
			};

			this.prepareExecutionErrorFunction = function (msg) {
				if (msg.indexOf("ExceedMaxExecutionCount") !== -1) {
					notificationService.showError('执行已超过每日最大次数限制,请安装相应许可');
				} else if(msg.indexOf("NoSubscriptExists") !== -1){
					//将msg使用||分割
					var msgarray = msg.split("||")
					notificationService.showError("脚本(id:"+msgarray[1]+")调用包含不存在脚本,请检查脚本(id:"+msgarray[2]+")是否存在");
				}else if(msg.indexOf("ScriptCallLoop") !== -1){
					//将msg使用||-分割，取最后一个值
					msg = msg.split("||-").pop();
					notificationService.showError("循环调用脚本,请检查脚本(id:"+msg+")");
				}else{
					notificationService.showError('验证准备失败。');
				}
				self.goback();
			};
			this.websocketExcutionresultAddress = ko.observable('');
			this.websocketExecutiondataAddress=ko.observable('');	
			this.transformConfig = JSON.parse(JSON.stringify(cmdConvertService.transformConfig));
			this.transformConfigData=[
			{
				"dataType": "executiondata",
				"transparentData": "entrepotSaveDatabase"
			},
			{
				"dataType": "excutionresult",
				"transparentData": "entrepotSaveDatabase"
			}]
			this.resultStepWebsocket = null;
			this.executionDataWebsocket = null;
			//定义一个值
			this.closeExecutionDataType=0;
			this.openExecutionDataType=0;
			this.executionDataConnectWebsocket = function () {
				let isConnected = false; // 添加一个标志来表示连接状态
				return new Promise((resolve, reject) => {
					self.executionDataWebsocket = new WebSocket(self.websocketExecutiondataAddress());
					// 定义WebSocket事件处理函数
					self.executionDataWebsocket.onopen = function (evt) {
						console.log("连接已建立");
						// 根据id解析数据
						//创建连接后构建数据图表
						// self.protocolExecutionStepView();
						//循环遍历controlCmdInfoType
						for (let i = 0; i < self.controlCmdInfoType.length; i++) {
							if (self.controlCmdInfoType[i] === "timeBasedValue") {
								self.initializeVerificationDataResultDataVisible(true);
								self.verificationDataResultDataVisible(true);
								//变化曲线
								self.initGraphs();
							}
							if (self.controlCmdInfoType[i] === "currentValue") {
								self.initializeVerificationTestExecutionDataVisible(true);
								//当前值
								self.verificationTestExecutionDataVisible(true);
							}
							if (self.controlCmdInfoType[i] === "frameList") {
								//结构化消息
								self.initializeVerificationProtocolDataVisible(true);
								self.verificationProtocolDataVisible(true);
								self.initProtocolTable();
							}
							if(self.controlCmdInfoType[i] === "MONITOR_GROUP"){
								//监控组数据
								self.initializeVerificationMonitorGroupDataVisible(true);
								self.verificationMonitorGroupDataVisible(true);
								self.initWebsocketGroupFrameList(self.curControlCmdInfoArray);
							}
						}
						isConnected = true; // 连接成功时更新标志
						resolve(isConnected); // 使用resolve来解决Promise
						
					};
					self.executionDataWebsocket.onclose = function (evt) {
						isConnected = false; // 连接关闭时更新标志
						if(self.executionEnd()){
							self.pullData("数据拉取已完成 ");
						}
						reject(isConnected); // 使用reject来拒绝Promise
					};
					self.executionDataWebsocket.onmessage = function (evt) {
						let data=JSON.parse(evt.data)
						// console.log("收到消息: " + evt.data);
						if(data.uploadStatus==0){
							self.websocketFrameListData(data);
						}else if(data.uploadStatus==1){
							self.openExecutionDataType++;
						}else if(data.uploadStatus==2){
							self.pullData("数据拉取已完成 ");
							self.closeExecutionDataType++;
							if(self.closeExecutionDataType==self.openExecutionDataType){
								self.executionDataWebsocket.close();
							}
						}
					};
					self.executionDataWebsocket.onerror = function (evt) {
						isConnected = false; // 连接失败时更新标志
						reject(isConnected); // 使用reject来拒绝Promise
					};
				});
			};

		
			this.messageQueue = []; // 消息队列
			this.executionResultStepConnectWebsocket = function () {
				let isConnected = false; // 添加一个标志来表示连接状态
				let isProcessing = false; // 标志是否正在处理消息
			
				async function processQueue() {
					if (!isConnected && self.messageQueue.length === 0) {
						return; // 如果未连接且消息队列为空，则停止处理
					}
			
					if (!isProcessing && self.messageQueue.length > 0) {
						isProcessing = true;
						let evt = self.messageQueue.shift();
						let data = JSON.parse(evt.data);
						let tempData = cmdConvertService.executionResultStepListWebsocket(data);
						await self.getExecutionResultSuccessFunction(tempData);
						// 等待3ms
						await new Promise(resolve => setTimeout(resolve, 3));
						isProcessing = false;
					}
					requestAnimationFrame(processQueue); // 使用 requestAnimationFrame 将处理分散到多个帧中
				}
			
				return new Promise((resolve, reject) => {
					self.resultStepWebsocket = new WebSocket(self.websocketExcutionresultAddress());
					// 定义WebSocket事件处理函数
					self.resultStepWebsocket.onopen = function (evt) {
						console.log("连接已建立");
						self.initializeExecutionInfoVisible(true);
						self.executionInfoVisible(true);
						isConnected = true; // 连接成功时更新标志
						self.messageQueue = []; // 清空消息队列
						isProcessing = false;
						resolve(isConnected); // 使用resolve来解决Promise
						processQueue(); // 处理队列中的消息
					};
					self.resultStepWebsocket.onclose = function (evt) {
						console.log("连接已关闭");
						self.messageQueue = []; // 清空消息队列
						isProcessing = false;
						isConnected = false; // 连接关闭时更新标志
						self.pullData("数据拉取已完成 ");
						reject(isConnected); // 使用reject来拒绝Promise
					};
					self.resultStepWebsocket.onmessage = function (evt) {
						// console.log("收到消息: " + evt.data);
						if (self.messageQueue.length < 1000) {
							self.messageQueue.push(evt);
						} 
					};
					self.resultStepWebsocket.onerror = function (evt) {
						isConnected = false; // 连接失败时更新标志
						reject(isConnected); // 使用reject来拒绝Promise
					};
				});
			};
			this.excutionresultHandleWebSocketConnection = async function () {
				try {
					let protocol = window.location.protocol;
					let host = window.location.hostname;
					let port = window.location.port || (protocol === 'https:' ? '443' : '80');
					let pathname = window.location.pathname;
					let address = protocol + "//" + host + ":" + port + pathname;
					address = address.replace("http", "ws");
					var webAddress = address + "UtpClientWebSocket?key=" + self.executionId + "+excutionresult";
					let isConnected = await self.executionResultStepConnectWebsocket();
					if (!isConnected) {
						// 连接失败后尝试备用地址
						self.websocketExcutionresultAddress(webAddress);
						self.transformConfig[0].dataTypes = [];
						self.transformConfig[1].dataTypes = self.transformConfigData;
						await self.executionResultStepConnectWebsocket();
					}
				} catch (error) {
					self.websocketExcutionresultAddress(webAddress);
					self.transformConfig[0].dataTypes = [];
					self.transformConfig[1].dataTypes = self.transformConfigData;
					await self.executionResultStepConnectWebsocket();
				}
			}
			this.excutionDataHandleWebSocketConnection = async function () {
				try {
					// 主连接失败的操作
					let protocol = window.location.protocol;
					let host = window.location.hostname;
					let port = window.location.port || (protocol === 'https:' ? '443' : '80');
					let pathname = window.location.pathname;
					let address = protocol + "//" + host + ":" + port + pathname;
					address = address.replace("http", "ws");
					var webAddress = address + "UtpClientWebSocket?key=" + self.executionId + "+executiondata";
					let isConnected = await self.executionDataConnectWebsocket();
					if (!isConnected) {
						// 连接失败后尝试备用地址
						self.websocketExecutiondataAddress(webAddress);
						self.transformConfig[0].dataTypes = [];
						self.transformConfig[1].dataTypes = self.transformConfigData;
						await self.executionDataConnectWebsocket();
					}
				} catch (error) {
					self.websocketExecutiondataAddress(webAddress);
					self.transformConfig[0].dataTypes = [];
					self.transformConfig[1].dataTypes = self.transformConfigData;
					await self.executionDataConnectWebsocket();
				}
			}
			this.prepareExecutionScript =async function (engineStatus) {
				await self.getScript();
				self.lastResultId = 0;
				self.transformConfig[0].dataTypes = self.transformConfigData;
				self.websocketExcutionresultAddress("ws://" + engineStatus.websocketAddress + "?key=" + self.executionId + "+excutionresult");
				await self.excutionresultHandleWebSocketConnection();
				self.websocketExecutiondataAddress("ws://" + engineStatus.websocketAddress + "?key=" + self.executionId + "+executiondata");
				await self.excutionDataHandleWebSocketConnection();
				var obj = {
					executionId: self.executionId,
					executionName: 'latest try execution',
					executedByUserId: $.cookie("userName"),
					domainId: loginManager.getOrganization(),
					utpCoreIpAddress: engineStatus.utpIpAddress,
					utpCorePort: engineStatus.utpPort,
					engineName: engineStatus.engineName,
					isDummyRun: self.dummyVerification(),
					// scriptId : self.selectionManager.selectedNodeId(),
					scriptIds: [self.selectionManager.selectedNodeId()],
					scriptGroupId: "0",
					testObject: "",
					projectId: self.selectionManager.selectedProject().id,
					isSendEmail: false,
					isTestcaseCollect: true,
					isTestcasePersist: false,
					isTeststepCollect: true,
					isTeststepPersist: false,
					isTestdataCollect: true,
					isTestdataPersist: false,
					transformConfig:JSON.stringify(self.transformConfig)
				}
				utpService.prepareExecutionScripts(obj, self.prepareExecutionSuccessFunction, self.prepareExecutionErrorFunction);
			};

			this.cancelTargetEngine = function () {
				$('#verificationDynamicTargetEngineModal').modal('hide');
				$('.modal-backdrop').remove();
				self.goback();
			};

			this.confirmTargetEngine = function () {
				var selectTargetEngineStatus = null;
				for (var i = 0; i < self.targetEngineCandidates().length; i++) {
					if (self.targetEngineCandidates()[i].id === self.selectTargetEngineId()) {
						selectTargetEngineStatus = komapping.toJS(self.targetEngineCandidates()[i]);
						break;
					}
				}
				if (selectTargetEngineStatus) {
					$('#verificationDynamicTargetEngineModal').modal('hide');
					$('.modal-backdrop').remove();
					self.engineStatus = selectTargetEngineStatus;
					self.prepareExecutionScript(selectTargetEngineStatus);
				}
				else
					notificationService.showWarn("请选择执行器");
			};
			this.engineStatus = null;

			// get engine address
			this.getEngineAddressSuccessFunction = function (response) {
				if (response && response.result && response.engineStatus) {
					// notificationService.showProgressSuccess('获取执行器地址成功。', 50);
					self.availableAgents([]);
					if (response.engineStatuses && response.engineStatuses.length > 1) {
						for (var i = 0; i < response.engineStatuses.length; i++) {
							if (response.engineStatuses[i].shareMode == 0) {
								response.engineStatuses[i].property = "全局共享";
								response.engineStatuses[i].describe = "所有团队共享使用，多人同时执行测试，多节点分布式测试";
							}
							if (response.engineStatuses[i].shareMode == 1) {
								response.engineStatuses[i].property = "团队共享";
								response.engineStatuses[i].describe = "团队共享使用，多人同时执行测试，毫秒级实时性测试";
							}
							if (response.engineStatuses[i].shareMode == 2) {
								response.engineStatuses[i].property = "个人独用";
								response.engineStatuses[i].describe = "仅限所登录的账号执行测试，毫秒级实时性测试";
							}
						}
						self.targetEngineCandidates(response.engineStatuses);
						self.selectTargetEngineId(response.engineStatuses[0].id);
						$('#verificationDynamicTargetEngineModal').modal('show');
					}
					else {
						self.engineStatus = response.engineStatus;
						self.prepareExecutionScript(response.engineStatus);
					}

				}
				else {
					if (response.returnMessage) {
						notificationService.showError(response.returnMessage);
						self.goback();
					}
					else {
						notificationService.showError("获取执行器地址失败");
					}
				}
			};

			this.getEngineAddressErrorFunction = function () {
				notificationService.showError('获取执行器地址失败。');
				self.goback();
			};

			this.prepareExecution = function () {
				self.testResult([]);
				protocolService.bigDataMapping.clear();
				self.executeState(executionManager.notStarted);
				self.executeStateNotification('');
				// notificationService.showProgressSuccess('探测可用的执行器...', 0);
				ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager.getAuthorizationKey(),
					self.getEngineAddressSuccessFunction, self.getEngineAddressErrorFunction);
			};

			this.canStartExecution = ko.computed(function () {
				for (var i = 0; i < self.tables().length; i++) {
					if (self.tables()[i].antbots().length === 0)
						return false;
				}
				return true;
			});

			this.refreshExecutionStatus = function () {
				if (self.triggerStop ||
					(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork ||
						self.executeState() == executionManager.throwException || self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming ||
						self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
					))
					self.getExecutionStatus();
			};

			this.antbotMatched = function (liveAntbotDictionarys, antbotsDefinedInScript) {
				self.targetObjectCandidates([]);
				self.selectTargetObjectId("");
				self.tables([]);

				if (self.dummyVerification()) {
					notificationService.showSuccess("脚本分析成功，启动模拟执行。");
					self.startExecution();
					return;
				}

				if (antbotsDefinedInScript == null || antbotsDefinedInScript.length == 0) {
					notificationService.showSuccess("脚本分析成功，启动模拟执行。");
					self.startExecution();
					return;
				}

				var targetObjectCandidates = self.agentSelection(liveAntbotDictionarys, antbotsDefinedInScript);
				komapping.fromJS(targetObjectCandidates, {}, self.targetObjectCandidates);

				if (self.targetObjectCandidates().length > 0) {
					notificationService.showSuccess('脚本分析成功,探测到测试机器人');
					if (self.targetObjectCandidates().length === 1) {
						self.selectTargetObjectId(self.targetObjectCandidates()[0].targetObjectId());
						self.getSelectTargetObject();
						//隐藏选择机器人的模态框,机器人名称匹配则直接执行
						// if(self.canStartExecution()){
						// 	self.startExecution();
						// }else{
						// 	var str="";
						// 	var agentsDefinedInScripts=self.targetObjectCandidates()[0].agentsDefinedInScript()
						// 	for(var i=0;i<agentsDefinedInScripts.length;i++){
						// 		if(!agentsDefinedInScripts[i].found()){
						// 			str+=agentsDefinedInScripts[i].antbotName()+",";
						// 		}
						// 	}
						// 	if (str.length > 0) {
						// 		str = str.slice(0, -1);
						// 	}
						// 	notificationService.showError('机器人名称匹配失败('+str+'),已取消执行');
						// 	self.cancelVerification();
						// }
						if (self.canStartExecution()) {
							self.startExecution();
						} else {
							utpService.removeExecutionTestCaseResultByExecutionId(self.executionId, function (data) {
								if (data && data.status === 1) {
									$('#verificationDynamicAgentsModal').modal('show');
									self.cancelAfterExecution();
								}
							}, function (error) {
								self.cancelAfterExecution();
							});
						}
					}
					else
						$('#verificationDynamicTargetObjectsModal').modal('show');
				}
				else
					notificationService.showWarn('脚本分析成功，测试机器人不存在, 无法进行真实环境验证。', 100);
			};
			//执行后取消
			this.cancelAfterExecution = function () {
				var executionId = { executionId: self.executionId };
				utpService.cancelExecution(executionId, function (data) {
					if (data && data.status === 1 && data.result) {
						// notificationService.showError('机器人名称匹配失败,已取消验证');
						return
					}
					else {
						self.goback();
					}
				}, function (error) {
					self.goback();
				});
			};

			this.getPreExecutionStatusErrorFunction = function () {
				self.executeState(executionManager.throwException);
				self.preExecutionStatusFetchingCount--;
				if (self.preExecutionStatusFetchingCount > 0)
					self.getPreExecutionStatus();
				else {
					$.unblockUI();
					notificationService.showError('获取验证状态失败,如需继续尝试，请重新开始!');
				}
			}

			this.getAntbotname = function (agentsDefinedInScripts) {
				let str = "";
				// var agentsDefinedInScripts = self.targetObjectCandidates()[0].agentsDefinedInScript()
				for (let i = 0; i < agentsDefinedInScripts.length; i++) {
					str += agentsDefinedInScripts[i].antbotName + ",";
				}
				if (str.length > 0) {
					str = str.slice(0, -1);
				}
				return str;
			}

			this.getPreExecutionStatus = function () {
				utpService.getExecutionModel(self.executionId,
					function (data) {
						if (data && data.status === 1) {
							var result = data.result;
							if (result.status != undefined) {
								if (self.executeState() != result.status) {
									if (result.status == executionManager.engineInitializing) {
										self.executeStateNotification('引擎初始化中...');
									}
									else if (result.status == executionManager.engineInitialized) {
										self.executeStateNotification('引擎初始化完成...');
									}
									else if (result.status == executionManager.engineConfiguring) {
										self.executeStateNotification('引擎配置中...');
									}
									else if (result.status == executionManager.engineConfigured) {
										self.executeStateNotification('引擎配置完成...');
									}
									else if (result.status == executionManager.analyzingScript) {
										self.executeStateNotification('脚本分析中...');
									}
									else if (result.status == executionManager.scriptAnalyzed) {
										self.executeStateNotification('脚本分析完成...');
									}
									else if (result.status == executionManager.waitingMatchAntbot) {
										if (!self.isStartExecution()) {
											self.executeStateNotification('antbot匹配中...');
											self.antbotMatched(result.liveAntbotDictionarys, result.antbotsDefinedInScript);
										}
										else {
											self.startExecution();
										}
									} else if (result.status == executionManager.engineInitError) {
										var errorMessage = "暂无可用执行器，请确认执行器是否登录或已有测试在执行中。"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.utpCoreNetworkError) {
										var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.analyzeScriptError) {
										var errorMessage = "分析脚本错误:脚本名称: " + result.analyzeScriptError.analyzeScriptFailedReason.scriptName + ",系统ID：" + result.analyzeScriptError.analyzeScriptFailedReason.scriptId + "，行号：" + result.analyzeScriptError.analyzeScriptFailedReason.errorline + "，错误信息：" + result.analyzeScriptError.analyzeScriptFailedReason.message;
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.unknownError) {
										var errorMessage = "未知错误，请联系客服。"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.configureError) {
										var errorMessage = "引擎配置错误"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.AntbotNotFoundError) {
										var antbotNames = self.getAntbotname(result.antbotsDefinedInScript);
										var errorMessage = "测试执行器中没有找到对应的测试机器人(" + antbotNames + ")";
										notificationService.showError(errorMessage);
									}
								}
								if (result.status == executionManager.unknownError || result.status == executionManager.configureError
									|| result.status == executionManager.AntbotNotFoundError || result.status == executionManager.analyzeScriptError
									|| result.status == executionManager.utpCoreNetworkError || result.status == executionManager.engineInitError || result.status == executionManager.waitingMatchAntbot) {
									$.unblockUI();
									self.triggerStop = false;
								}
								if (result.status == executionManager.AntbotNotFoundError || result.status == executionManager.analyzeScriptError
									|| result.status == executionManager.utpCoreNetworkError || result.status == executionManager.engineInitError || result.status == executionManager.unknownError
									|| result.status == executionManager.configureError) {
									self.goback();
									return;
								}
								self.executeState(result.status);
							}

							if (self.deactive) {
								//消除页面转圈圈
								$.unblockUI();
								//释放引擎
								// self.cancelAfterExecution();
								return;
							}

							if (self.triggerStop)
								setTimeout(
									function () {
										self.getPreExecutionStatus();
									}, 1000);
						}
						else
							self.getPreExecutionStatusErrorFunction();
					},
					self.getPreExecutionStatusErrorFunction
				);

			}
			this.getExecutionStatus = function () {
				utpService.getExecutionModel(self.executionId,
					function (data) {
						if (data && data.status === 1) {
							var result = data.result;
							self.commandCount(result.commandCount);
							self.commandCountFailed(result.commandCountFailed);
							if (result.status != undefined) {
								if (self.executeState() != result.status) {
									if (result.status == executionManager.starting) {
										self.executeStateNotification('验证启动中...');
									}
									else if (result.status == executionManager.running) {
										self.executeStateNotification('验证执行中...');
									}
									else if (result.status == executionManager.pausing) {
										self.executeStateNotification('验证暂停中...');
									}
									else if (result.status == executionManager.paused) {
										self.executeStateNotification('验证已暂停。');
										notificationService.showSuccess('验证已暂停。');
									}
									else if (result.status == executionManager.resuming) {
										self.executeStateNotification('验证重启中...');
									}
									else if (result.status == executionManager.stopping) {
										self.executeStateNotification('验证停止中...');
									}
									else if (result.status == executionManager.stopped) {
										self.executeStateNotification('验证已停止。');
										notificationService.showSuccess('验证已停止。');
									}
									else if (result.status == executionManager.completed) {
										self.executeStateNotification('验证已完成。');
										notificationService.showSuccess('验证已完成。');
									}
									else if (result.status == executionManager.exceptionHandling) {
										self.executeStateNotification('异常处理中...');
									}
									else if (result.status == executionManager.reconnectingNetwork) {
										self.executeStateNotification('网络重连中...');
									}
									else if (result.status == executionManager.terminated) {
										self.executeStateNotification('验证已终止。');
										notificationService.showSuccess('验证已终止。');
									}
									else if (result.status == executionManager.startExecutionError) {
										var errorMessage = "";
										for (var i = 0; i < result.startExecutionError.antbotFailedReasons.length; i++)
											errorMessage = errorMessage + "测试机器人名称:" + result.startExecutionError.antbotFailedReasons[i].antbotName + ", 失败原因:" + result.startExecutionError.antbotFailedReasons[i].failedReason + "<br />"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.utpCoreNetworkError) {
										var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.unknownError) {
										var errorMessage = "未知错误。"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.configureError) {
										var errorMessage = "引擎配置错误。"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.AntbotNotFoundError) {
										var errorMessage = "测试机器人未找到。"
										notificationService.showError(errorMessage);
									}
								}
								if (result.status == executionManager.unknownError || result.status == executionManager.configureError
									|| result.status == executionManager.AntbotNotFoundError || result.status == executionManager.startExecutionError
									|| result.status == executionManager.utpCoreNetworkError || result.status == executionManager.terminated
									|| result.status == executionManager.completed || result.status == executionManager.stopped)
									self.triggerStop = false;
								if (result.status == executionManager.startExecutionError || result.status == executionManager.AntbotNotFoundError
									|| result.status == executionManager.utpCoreNetworkError || result.status == executionManager.unknownError
									|| result.status == executionManager.configureError) {
									self.goback();
									return;
								}

								self.executeState(result.status);
							}
							// self.getExecutionResult();
							// self.getIdMaxExecutionDataResult();
							if (self.deactive) {
								//消除页面转圈圈
								$.unblockUI();
								//释放引擎
								// self.cancelAfterExecution();
								return;
							}

							if (self.triggerStop ||
								(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork ||
									self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming ||
									self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
								))
								setTimeout(
									function () {
										self.getExecutionStatus();
									}, 1000);
						}
						else {
							self.executeState(executionManager.throwException);
							self.executeStateNotification('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
							notificationService.showError('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
						}
					},
					function () {
						self.executeState(executionManager.throwException);
						self.executeStateNotification('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
						notificationService.showError('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
					}
				);
			}
			this.breakWebSocket = function(){
				if(self.resultStepWebsocket){
					self.resultStepWebsocket.close();
				}
				if(self.executionDataWebsocket){
					self.executionDataWebsocket.close();
				}
			};
			this.startExecutionScript = async function () {
				self.breakWebSocket();
				self.transformConfig[0].dataTypes = self.transformConfigData;
				self.websocketExcutionresultAddress("ws://" + self.engineStatus.websocketAddress + "?key=" + self.executionId + "+excutionresult");
				await self.excutionresultHandleWebSocketConnection();
				self.websocketExecutiondataAddress("ws://" + self.engineStatus.websocketAddress + "?key=" + self.executionId + "+executiondata");
				await self.excutionDataHandleWebSocketConnection();
				var obj = {
					executionId: self.executionId,
					executionName: 'latest try execution',
					executedByUserId: $.cookie("userName"),
					domainId: loginManager.getOrganization(),
					utpCoreIpAddress: self.engineStatus.utpIpAddress,
					utpCorePort: self.engineStatus.utpPort,
					engineName: self.engineStatus.engineName,
					isDummyRun: self.dummyVerification(),
					// scriptId : self.selectionManager.selectedNodeId(),
					scriptIds: [self.selectionManager.selectedNodeId()],
					scriptGroupId: "0",
					testObject: "",
					projectId: self.selectionManager.selectedProject().id,
					isSendEmail: false,
					isTestcaseCollect: true,
					isTestcasePersist: false,
					isTeststepCollect: true,
					isTeststepPersist: false,
					isTestdataCollect: true,
					isTestdataPersist: false,
					transformConfig:JSON.stringify(self.transformConfig)
				}
				utpService.prepareExecutionScripts(obj, self.startExecutionScriptSuccessFunction, self.prepareExecutionErrorFunction);
			};
			this.isStartExecution = ko.observable(false);
			this.startExecutionScriptSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.triggerStop = true;
					self.isStartExecution(true);
					self.executeState(executionManager.notStarted);
					self.preExecutionStatusFetchingCount = 3;
					setTimeout(
						function () {
							$.blockUI(utilityService.template);
							self.getPreExecutionStatus();
						}, 1000);
				}
				else {
					self.prepareExecutionErrorFunction(data.result);
				}
			};


			this.startExecution = function () {
				self.isStartExecution(false);
				$('#verificationDynamicAgentsModal').modal('hide');
				self.isGoback(false);
				var selectedAntbotMapping = [];
				for (var i = 0; i < self.tables().length; i++) {
					var mapping = {
						antbotName: self.tables()[i].antbotName(),
						antbotInstanceId: self.tables()[i].antbots()[0].antbotId()
					}
					selectedAntbotMapping.push(mapping);
				}

				var executionObj = {
					executionId: self.executionId,
					selectedAntbotMapping: selectedAntbotMapping
				};
				utpService.startExecution(executionObj,
					function (data) {
						if (data && data.status === 1) {
							if (data.result) {
								self.lastResultId = 0;
								self.lastExecutionDataId = 0;
								self.pullData("正在拉取数据");
								self.resultRetrieveBegin = false;
								self.lastestCaseNode = null;
								self.getExecutionStatus();
								notificationService.showSuccess('启动验证发送成功。');
							}
							else
								notificationService.showError('启动验证失败。');
						}
						else
							notificationService.showError('启动验证失败。');
					},
					function () {
						notificationService.showError('启动验证失败。');
					}
				);
			};

			this.canShowVerification = ko.computed(function () {
				return (self.executeState() != executionManager.notStarted && self.executeState() != executionManager.starting);
			});

			this.canShowControlButton = ko.computed(function () {
				return (self.executeState() != executionManager.notStarted && self.executeState() != executionManager.starting &&
					self.executeState() != executionManager.completed && self.executeState() != executionManager.stopped &&
					self.executeState() != executionManager.terminated);

			});

			// pause execution
			this.canPause = ko.computed(function () {
				return (self.executeState() == executionManager.running || self.executeState() == executionManager.resuming ||
					self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork);
			});

			this.pauseExecution = function () {
				var executionId = { executionId: self.executionId };
				utpService.pauseExecution(executionId,
					function (data) {
						if (data && data.status === 1 && data.result)
							notificationService.showSuccess('暂停验证命令发送成功。');
						else
							notificationService.showError('暂停验证命令发送失败。');
					},
					function () {
						notificationService.showError('暂停验证命令发送失败。');
					}
				);
			};

			// resume execution
			this.canResume = ko.computed(function () {
				return (self.executeState() == executionManager.paused || self.executeState() == executionManager.pausing);
			});

			this.resumeExecution = function () {
				var executionId = { executionId: self.executionId };
				utpService.resumeExecution(executionId,
					function (data) {
						if (data && data.status === 1 && data.result) {
							notificationService.showSuccess('重启验证命令发送成功。');
							self.getExecutionStatus();
						}
						else
							notificationService.showError('重启验证命令发送失败。');
					},
					function () {
						notificationService.showError('重启验证命令发送失败。');
					}
				);
			};

			this.singleStepExecution = function () {
				var executionId = { executionId: self.executionId };
				utpService.singleStepExecution(executionId,
					function (data) {
						if (data && data.status === 1 && data.result) {
							notificationService.showSuccess('单步验证命令发送成功。');
							self.getExecutionStatus();
						}
						else
							notificationService.showError('单步验证命令发送失败。');
					},
					function () {
						notificationService.showError('单步验证命令发送失败。');
					}
				);
			};

			// stop execution
			this.canStop = ko.computed(function () {
				return (self.executeState() == executionManager.pausing || self.executeState() == executionManager.paused ||
					self.executeState() == executionManager.running || self.executeState() == executionManager.resuming ||
					self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork);
			});

			this.stopExecution = function () {
				var executionId = { executionId: self.executionId };
				utpService.stopExecution(executionId,
					function (data) {
						if (data && data.status === 1 && data.result) {
							self.triggerStop = data.result;
							notificationService.showSuccess('停止验证命令发送成功。');
							self.getExecutionStatus();
						}
						else
							notificationService.showError('停止验证命令发送失败。');
					},
					function () {
						notificationService.showError('停止验证命令发送失败。');
					}
				);
			};

			//折线图
			this.initGraphs = function () {
				var flex = {
					id: 'verificationInitGraphsExecutionDataCols',
					cols: []

				};
				webix.ui({
					container: "verificationDataResultId",
					id: 'verificationExecutionData',
					rows: [
						{ body: flex, height: 400 },
						{
							template: "Status: all data is saved",
							height: 30
						}
					]
				});
				self.isLoadLineExecutionData(true);
				// self.getIdMaxExecutionDataResult();
				// self.scanScript(viewManager.selectedMonitorTestsetActiveData)
			}


			this.initProtocolTable = function () {
				var flex = {
					id: 'verificationExecutionDataCols',
					cols: []

				};
				webix.ui({
					container: "verificationProtocolExecutionStepId",
					id: 'verificationProtocolExecutionStepData',
					rows: [
						{ body: flex, height: 800 },
						{
							template: "Status: all data is saved",
							height: 30
						}
					]
				});
				self.isFrameListData(true);
				// self.getIdMaxExecutionDataResult();
				// self.scanScript(viewManager.selectedMonitorTestsetActiveData)
			}
		
			this.initializeVerificationTestExecutionDataVisible=ko.observable(false);
			this.initializeVerificationDataResultDataVisible=ko.observable(false);
			this.initializeVerificationProtocolDataVisible=ko.observable(false);
			this.initializeVerificationMessageDataVisible=ko.observable(false);
			this.initializeVerificationMonitorGroupDataVisible=ko.observable(false);
			this.initializeExecutionInfoVisible=ko.observable(false);
			this.allVerificationDataTypeFalse=function(){
				self.initializeVerificationTestExecutionDataVisible(false);
				self.initializeVerificationDataResultDataVisible(false);
				self.initializeVerificationProtocolDataVisible(false);
				self.initializeVerificationMessageDataVisible(false);
				self.initializeVerificationMonitorGroupDataVisible(false);
				self.initializeExecutionInfoVisible(false);
			}

			this.verificationProtocolDataVisible = ko.observable(true);
			this.executionInfoVisible = ko.observable(true);
			this.verificationTestExecutionDataVisible = ko.observable(true);
			this.verificationDataResultDataVisible = ko.observable(true);
			this.verificationMessageDataVisible = ko.observable(true);
			this.verificationMonitorGroupDataVisible=ko.observable(true);
			this.messageDataView = function () {
				self.verificationMessageDataVisible(true);
				self.executionInfoVisible(false);
				self.verificationTestExecutionDataVisible(false);
				self.verificationDataResultDataVisible(false);
				self.verificationProtocolDataVisible(false);
				self.verificationMonitorGroupDataVisible(false);
			}
			this.monitorGroupDataView = function () {
				self.verificationMonitorGroupDataVisible(true);
				self.verificationMessageDataVisible(false);
				self.executionInfoVisible(false);
				self.verificationTestExecutionDataVisible(false);
				self.verificationDataResultDataVisible(false);
				self.verificationProtocolDataVisible(false);
			}
			this.executionDataView = function () {
				self.verificationMonitorGroupDataVisible(false);
				self.verificationMessageDataVisible(false);
				self.executionInfoVisible(false);
				self.verificationTestExecutionDataVisible(true);
				self.verificationDataResultDataVisible(false);
				self.verificationProtocolDataVisible(false);
			}
			this.executionDataResultView = function () {
				self.verificationMonitorGroupDataVisible(false);
				self.verificationMessageDataVisible(false);
				self.executionInfoVisible(false);
				self.verificationTestExecutionDataVisible(false);
				self.verificationDataResultDataVisible(true);
				self.verificationProtocolDataVisible(false);
				// var myChart = self.executionDataMapping.get("timeBasedValue");
				// if ((myChart == null || myChart == undefined) && self.allWaveInfo().length > 0) {
				// 	self.initGraphs();
				// }
			}
			this.protocolExecutionStepView = function () {
				self.verificationMonitorGroupDataVisible(false);
				self.verificationMessageDataVisible(false);
				self.executionInfoVisible(false);
				self.verificationTestExecutionDataVisible(false);
				self.verificationDataResultDataVisible(false);
				self.verificationProtocolDataVisible(true);
				// var myChart = self.executionDataMapping.get("frameList");
				// if ((myChart == null || myChart == undefined) && self.allFrameListInfo().length > 0) {
				// 	self.initProtocolTable();
				// }
			}
			this.executionStepsView = function () {
				self.executionInfoVisible(true);
				self.verificationTestExecutionDataVisible(false);
				self.verificationProtocolDataVisible(false);
				self.verificationDataResultDataVisible(false);
				self.verificationMessageDataVisible(false);
				self.verificationMonitorGroupDataVisible(false);
			}
			this.executionView = function () {
				self.executionInfoVisible(self.initializeExecutionInfoVisible());
				self.verificationTestExecutionDataVisible(self.initializeVerificationTestExecutionDataVisible());
				self.verificationProtocolDataVisible(self.initializeVerificationProtocolDataVisible());
				self.verificationDataResultDataVisible(self.initializeVerificationDataResultDataVisible());
				self.verificationMessageDataVisible(self.initializeVerificationMessageDataVisible());
				self.verificationMonitorGroupDataVisible(self.initializeVerificationMonitorGroupDataVisible());
			}
			this.initDiagramTemplate = function (data) {
				var dataResult = [
					{
						VarName: "",
						VarType: "timeBasedValue",
						data:
						{
							xAxisUnit: "ms",
							xAxisStep: null,
							data: []

						}
					},
					{
						executionId: '',
						VarName: '',
						VarType: "frameList",
						protocolId: '',
						data: [],
						monitorSessionId: '',
						executionDate: '',
						executionStatus: ''
					}
				]
				let index = dataResult.findIndex(rs => rs.VarType === data.varType)
				if (index != -1) {
					dataResult[index].VarName = data.varName
					return dataResult[index]
				}
				return null
			}
			this.executionDataArr = ko.observable({
				frameList: [],
				wave: []
			})
			this.initDataTrendDiagram = function (dataResult) {
				for (var i = 0; i < dataResult.frameList.length; i++) {
					var charts = null;
					if (dataResult.frameList[i].VarType === 'frameList') {
						charts = self.initFrameList(dataResult.frameList[i]);
					}
				}
				//清空pRightSelectIdArr
				self.pRightSelectIdArr = [];
				for (var i = 0; i < dataResult.wave.length; i++) {
					if (i == 0) {
						var dataview = {
							margin: 10, padding: 10, type: "wide",
							view: "dataview",
							id: "verficationFlexlayout",
							gravity: 3
						}
						$$("verificationInitGraphsExecutionDataCols").addView(dataview, 2);
					}
					var charts = null;
					if (dataResult.wave[i].VarType === 'timeBasedValue')
						charts = self.initMultiWave(dataResult.wave[i]);
				}
			};
			this.bgcStyle = function (x) {
				if (x % 2 == 0)
					return "#f4f4f4"
				return "#fff"
			}

			this.clearRepeatElement = function (elementId) {
				var clearRepeat = document.getElementById(elementId)
				if (clearRepeat)
					clearRepeat.parentNode.removeChild(clearRepeat);
				return
			}
			//初始化表格
			this.initFrameList = function (config) {
				var varName = config.VarName;
				var data = [];

				const myView = webix.$$(varName);
				if (myView) {
					self.clearRepeatElement(myView.$view.id);
				}
				var tableView = {
					view: "datatable",
					fixedRowHeight: false,
					id: varName, select: true,
					resizeColumn: true,
					height: 400,
					gravity: 2,
					columns: [{
						id: "verificationMessage",
						header: "消息名称",
						fillspace: 2,
						template: function (obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj.message || "") + "</div>";
						}
					},
					{
						id: "verificationDataSource", header: "机器人名称", fillspace: 2,
						
						template: function (obj) {
							if (obj.dataSource == "engine") {
								obj.dataSource = " ";
							}
							return "<div style='text-align: center; width: 100%;'>" + (obj.dataSource || "") + "</div>";
						}
					},
					{
						id: "verificationReceiveFrame", header: "方向", fillspace: 2,
						template: function (obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj.receiveFrame || "") + "</div>";
						}
					},
					{
						id: "verificationrawFrame", header: "消息帧", fillspace: 2, template: function (obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj.rawFrame || "") + "</div>";
						}
					},
					{
						id: "verificationTimestamp", header: "时间",
						fillspace: 2,
						template: function (obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj.timestamp || "") + "</div>";
						}
					},
					{
						id: "", header: "字段信息", fillspace: 2,
						template: function (item) {
							return "<div style='text-align: center; width: 100%;'><span class='webix_icon fas fa-search-plus fieldInfo' style='display: inline-block; vertical-align: middle; cursor: pointer;'></span></div>";
						}
					}],
					data: { data: data },
					onClick: {
						"fieldInfo": function (event, cell, target) {
							var item = $$(varName).getItem(cell);
							if (item == null)
								return;
							self.showExecutionGenericDetail(item);
						}
					}
				};
				$$("verificationExecutionDataCols").addView(tableView, 0);
				self.executionDataMapping.set(varName, tableView);
				return tableView;
			};
			//新增
			this.showExecutionGenericDetail = function (item) {
				var index = 0;
				self.currentBigDataFrameConfig = {
					fieldValues: '',
					protocolId: item.protocolId,
					messageName: item.message,
					index: index,
				};
				self.disableExecutionGenericDetailInfo();
				self.currentBigDataFrameConfig.fieldValues = item.fieldValues;
				self.genericRawFrame(item.rawFrame);
				self.showFormatGenericDetail(item.protocolId, item.message, self.currentBigDataFrameConfig.fieldValues, item.fieldSizes);
			};

			this.disableExecutionGenericDetailInfo = function () {
				self.genericErrorFrameData(false);
				self.genericRawFrame("");
				$('#verificationReportConfigView').html('');
			};
			this.executionDataMapping = new Map();
			this.initMultiWave = function (config) {
				var charts = [];
				var executionDataVarName = config.VarType;
				var p = document.createElement('div');
				p.setAttribute('id', executionDataVarName + '_chart');
				var bgColor = self.bgcStyle(config.id)
				p.setAttribute('style', 'width: 100%; height: 400px; border: 1px solid #e3e3e3; float: left;padding-top: 30px;background-color: ' + bgColor);
				$$("verficationFlexlayout").getNode().append(p);
				charts.push({
					id: executionDataVarName + "_control",
					body: {
						view: "htmlform",
						content: executionDataVarName + '_chart',
					},
					minWidth: 300,
					height: 400
				});
				var dom = document.getElementById(executionDataVarName + '_chart');
				var myChart = echarts.init(dom);
				var option = {
					title: {
						text: '',
						textStyle: {
							fontWeight: 'normal',
						},
						left: '10%',
						top: 'top'
					},
					xAxis: {
						type: 'value',
						// type: 'category',
						name: 'x'
						// data: []
					},
					yAxis: {
						type: 'value',
						name: 'y'
						// axisLabel: {
						// 	formatter: '{value}'
						// },
					},
					series: [],
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							animation: false
						}
					},
					axisPointer: {
						link: [
							{
								xAxisIndex: 'all'
							}
						]
					},
					legend: {
						data: []
					},
				};

				if (option && typeof option === "object")
					myChart.setOption(option, true);
				self.executionDataMapping.set(executionDataVarName, myChart);
				return charts;
			};
			this.setFrameData = function (config, clear) {
				var varName = config.VarName;
				var frameListView = $$(varName)
				var myTable = self.executionDataMapping.get(varName);
				if (myTable == null || myTable == undefined) return;
				if (clear) {
					frameListView.clearAll();
					frameListView.refresh();
					// return
				}
				if (config.data != null && config.data.length > 0) {
					for (let j = 0; j < config.data.length; j++)
						frameListView.add(config.data[j], 0)
					var total = frameListView.count();
					if (total > 1000) {
						//只展示最新的1000条数据
						for (var i = 1000; i < total; i++) {
							frameListView.remove(frameListView.getLastId());//getLastId
						}

					}
					frameListView.refresh();
				}
			};

			this.setMultipleSeriesData = function (config, clear) {
				var executionDataVarName = config.VarType;
				var myChart = self.executionDataMapping.get(executionDataVarName);
				if (myChart == null || myChart == undefined) return;
				var option = myChart.getOption();
				if (clear) {
					option.series = []
					option.legend.data = []
					var seriesOptions = {
						name: '',
						data: [],
						type: 'line',
						smooth: true
					}
					seriesOptions.name = config.VarName;
					option.series.push(seriesOptions)
					option.legend[0].data.push(seriesOptions.name)
					myChart.setOption(option);
					// return
				}
				option.xAxis[0].name = config.data.xAxisUnit != null && config.data.xAxisUnit.length > 0 ? "(" + config.data.xAxisUnit + ")" : 'x';
				//保留并做修改

				if (option.legend[0].data.indexOf(config.VarName) == -1) {
					option.legend[0].data.push(config.VarName)
					option.series.push({
						name: config.VarName,
						data: [],
						type: 'line',
						smooth: true
					})
				}

				for (var j = 0; j < option.series.length; j++) {
					if (option.series[j].name == config.VarName) {
						option.series[j].data = option.series[j].data.concat(config.data.data);
						if (option.series[j].data.length > 1000) {
							option.series[j].data = option.series[j].data.slice(-1000);
						}
					}
				}
				myChart.setOption(option);
				if (true) {
					var slideOption = {
						dataZoom: [
							{
								show: true,
								realtime: true,
								startValue: 0,
								endValue: 30,
							}
						],
						toolbox: {
							feature: {
								dataZoom: {
									yAxisIndex: 'none'
								},
								restore: {},
								saveAsImage: {}
							}
						},
					}
					myChart.setOption(slideOption);
				}
			}

			this.getProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result)
					protocolService.addProtocol(data.result);
				else
					self.getProtocolErrorFunction();
			};

			this.getProtocolErrorFunction = function () {
				//notificationService.showError('获取数据失败。');
			};

			this.getProtocol = function (protocolId) {
				var protocol = protocolService.getProtocol(protocolId);
				if (protocol === null || protocol == undefined)
						utpService.getProtocol(protocolId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
			};
			//数据config [{monitorGroupName: t,monitorGroupData: [12,32]},monitorGroupName: y,monitorGroupData: [55,32]}]
	
			this.initWebsocketGroupFrameList = function (config) {
				var container = document.getElementById("verificationTableDataId");
				container.innerHTML = ""; // 清空容器内容

				// 添加下载按钮
				var buttonContainer = document.createElement("div");
				buttonContainer.style.textAlign = "right"; // 使按钮容器居右显示
				buttonContainer.style.marginBottom = "20px"; // 添加下边距
				//下载全部报表,暂时关闭,需要时打开即可
				// var downloadButton = document.createElement("button");
				// downloadButton.className = "btn btn-success btn-sm"; // 添加按钮样式
				// downloadButton.innerText = "下载报表";
				// downloadButton.onclick = function () {
				// 	self.downloadReport(config);
				// };

				// buttonContainer.appendChild(downloadButton);
				container.appendChild(buttonContainer);

				config.forEach(function (group, groupIndex) {
					// 创建一个新的 div 作为表单容器
					var formContainer = document.createElement("div");
					formContainer.id = "verificationTableDataId" + group.monitorGroupName;
					formContainer.style.marginBottom = "60px"; // 添加表单间距
			
					// 创建标题元素
					var title = document.createElement("h3");
					title.innerText = "监控数据组:" + group.monitorGroupName;
					title.style.textAlign = "center"; // 标题居中显示
					// title.style.marginTop = "20px";
					formContainer.appendChild(title);
			
					container.appendChild(formContainer);
			
					// 根据 monitorGroupData 动态生成列
					var columns = [
						{
							id: "index", // 序号列
							header: { text: "序号", css: { 'text-align': 'center' } },
							fillspace: 1,
							template: function (obj) {
								return obj["序号"] || ""; // 显示时间数据
							},
							css: { 'text-align': 'center' }
						}
					].concat(group.monitorGroupData.map(function (signal, signalIndex) {
						return {
							id: signalIndex, // 为每个列分配一个唯一的id
							header: { text: signal, css: { 'text-align': 'center' } }, // 使用信号作为列头，并居中显示
							fillspace: 1, // 让每一列填充相等的空间
							template: function (obj) {
								return obj[signal] || ""; // 显示对应信号的数据
							},
							css: { 'text-align': 'center' } // 使行数据居中显示
						};
					})).concat([
						{
							id: "time", // 时间列
							header: { text: "时间", css: { 'text-align': 'center' } },
							fillspace: 1,
							template: function (obj) {
								return obj["时间"] || ""; // 显示时间数据
							},
							css: { 'text-align': 'center' }
						}
					]);
			
					// 配置 datatable
					var grid = {
						view: "datatable",
						container: formContainer.id, // 使用动态生成的容器ID
						id: "vTableDataId" + group.monitorGroupName, // 每个表单有唯一的ID
						autoheight: true,
						border: 1,
						columns: columns, // 动态生成的列配置
						data: [], // 绑定数据
						scrollX: false, // 隐藏水平滚动条
						scrollY: "auto", // 启用垂直滚动条
						css: "my-cell"
					};
			
					// 渲染 datatable
					webix.ui(grid);
				});
			};
			this.setTableData = function (config) {
				if (config != null && config.length > 0) {
					config.forEach(function (group, groupIndex) {
						var frameListView = $$("vTableDataId" + group.monitorGroupName);
						if (frameListView) {
							//获取frameListView的列
							var columns = frameListView.config.columns;
							var obj = {};

							// 获取最后一行的序号
							var lastId = frameListView.getFirstId();
							var lastIndex = lastId ? frameListView.getItem(lastId).序号 : 0;

							// 设置序号列的数据
							obj["序号"] = lastIndex + 1;

							for (let j = 0; j < group.monitorGroupData.length - 1; j++) {
								obj[columns[j + 1].header[0].text] = group.monitorGroupData[j];
							}
							// 设置时间列的数据
							obj["时间"] = group.monitorGroupData[group.monitorGroupData.length - 1];
							frameListView.add(obj, 0);
							var total = frameListView.count();
							if (total > 1000) {
								// 只展示最新的1000条数据
								frameListView.remove(frameListView.getLastId());
							}
							frameListView.refresh();
							// 添加下载按钮
							var downloadButtonId = "downloadButton" + group.monitorGroupName;
							if (!document.getElementById(downloadButtonId)) {
								var downloadButton = document.createElement("button");
								downloadButton.id = downloadButtonId;
								downloadButton.className = "btn btn-success btn-sm";
								downloadButton.innerText = "下载报表";
								downloadButton.onclick = function () {
									self.downloadTableData(group.monitorGroupName, frameListView);
								};
								frameListView.$view.parentNode.insertBefore(downloadButton, frameListView.$view);
							}
						}
					});
				}
			};

			this.downloadTableData = function (monitorGroupName, frameListView) {
				var csvContent = "\uFEFF"; // 添加 BOM
				csvContent += "监控数据组:" + monitorGroupName + "\n";
				csvContent += "序号," + frameListView.config.columns
					.filter(col => col.header[0].text !== "序号" && col.header[0].text !== "时间")
					.map(col => col.header[0].text).join(",") + ",时间\n";
				frameListView.data.each(function (item) {
					var row = item["序号"] + ",";
					frameListView.config.columns.forEach(function (col) {
						if (col.header[0].text !== "序号" && col.header[0].text !== "时间") {
							row += (item[col.header[0].text] || "") + ",";
						}
					});
					row += item["时间"] || "";
					csvContent += row + "\n";
				});
				csvContent += "\n";

				var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", monitorGroupName + ".csv");
				document.body.appendChild(link); // Required for FF

				link.click();
				document.body.removeChild(link);
			}
			this.downloadReport = function (config) {
				var csvContent = "data:text/csv;charset=utf-8,";
				config.forEach(function (group) {
					csvContent += "监控数据组:" + group.monitorGroupName + "\n";
					csvContent += "序号," + group.monitorGroupData.join(",") + ",时间\n";
					var frameListView = $$("vTableDataId" + group.monitorGroupName);
					if (frameListView) {
						frameListView.data.each(function (item) {
							var row = item["序号"] + ",";
							group.monitorGroupData.forEach(function (signal) {
								row += (item[signal] || "") + ",";
							});
							row += item["时间"] || "";
							csvContent += row + "\n";
						});
					}
					csvContent += "\n";
				});
			
				var encodedUri = encodeURI(csvContent);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "report.csv");
				document.body.appendChild(link); // Required for FF
			
				link.click();
				document.body.removeChild(link);
			};
			//定义标记使用去加载datatable
			this.getScript = function () {
				return new Promise((resolve, reject) => {
					utpService.getFullScript(
						selectionManager.selectedProject().id,
						self.selectionManager.selectedNodeId(),
						(data) => {
							if (data && data.status === 1 && data.result) {
								self.currentScript = data.result;
								if (self.currentScript.script != null && self.currentScript.script != '') {
									// 解析脚本,获取加载模块
									self.controlCmdInfoType = self.cmdConvertService.commandDataAnalysis(self.currentScript.script);
									// 解析组数据
									self.curControlCmdInfoArray = self.cmdConvertService.groupcommandDataAnalysis(self.currentScript.script);
									resolve(data);
								} else {
									self.getScriptErrorFunction();
									reject(new Error('Script is empty'));
								}
							} else {
								self.getScriptErrorFunction();
								reject(new Error('Invalid data status'));
							}
						},
						(error) => {
							self.getScriptErrorFunction();
							reject(error);
						}
					);
				});
			};
			
			this.curControlCmdInfoArray = [];
			this.controlCmdInfoType = [];
			this.currentScript = null;
			this.getScriptErrorFunction = function () {
				notificationService.showError('获取用例信息失败');
			};

			this.monitorDataArr = ko.observable({
				frameList: [],
				wave: []
			})
			//使用webscokcet处理结构化数据
			this.websocketFrameListData = function (data) {
				var isFrameListFirst = false;
				var resultJsonData = JSON.parse(data.dataContent);
				if (data.dataType == "rawCommuDataList") {
					processRawCommuDataList();
				} else if (data.dataType == "frameList") {
					processFrameList();
				} else if (data.dataType == "monitorVar") {
					processMonitorVar();
				}

				function processMonitorGroup(result) {
					//循环
					let objArray = [];
					let varValues = result.varValues;
					 //循环
					let monitorGroupName = result.varName;
					for (var j = 0; j < varValues.length; j++) {
						let temp = {
							monitorGroupName: monitorGroupName,
							monitorGroupData: JSON.parse(varValues[j])
						}
						objArray.push(temp);
					}
					self.setTableData(objArray);
				};
				
				function processRawCommuDataList() {
					resultJsonData.forEach(rawCommuDataListTempData => {
						var tempgeneralData = {
							time: rawCommuDataListTempData[0],
							antbotName: data.dataSource,
							direction: rawCommuDataListTempData[1] == "R" ? "接收" : "发送",
							data: rawCommuDataListTempData[2]
						};
						var rawCommuDataListNode = komapping.fromJS(tempgeneralData, { 'observe': ["result"] });
						self.verificationGeneralData.push(rawCommuDataListNode);
						if (self.verificationGeneralData().length > 1000) {
							self.verificationGeneralData.shift();
						}
					});
				}

				function processFrameList() {
					var temp = { varType: data.dataType, varName: data.dataType };
					self.executionDataArr = { frameList: [], wave: [] };
					var tempData = self.initDiagramTemplate(temp);
					self.executionDataArr.frameList.push(tempData);
					var index = self.executionDataArr.frameList.findIndex(md => md.varName === tempData.VarName);
					if (index == -1) index = 0;

					var frameListInfo = self.executionDataArr.frameList[index];
					frameListInfo.data = [];
					self.getProtocol(resultJsonData.protocolId);
					frameListInfo.protocolId = resultJsonData.protocolId;
					frameListInfo.executionId = self.executionId;

					resultJsonData.frameList.forEach(frameListData => {
						frameListInfo.data.push({
							dataSource: data.dataSource,
							protocolId: resultJsonData.protocolId,
							timestamp: frameListData.timestamp,
							message: frameListData.message,
							receiveFrame: frameListData.receiveFrame ? "接收" : "发送",
							rawFrame: frameListData.rawFrame,
							fieldValues: frameListData.fieldValues,
							fieldSizes: frameListData.fieldSizes
						});
					});

					if (self.isFrameListData()) {
						var temp = { varType: frameListInfo.VarType, varName: frameListInfo.VarName };
						self.executionDataArr = { frameList: [], wave: [] };
						tempData = self.initDiagramTemplate(temp);
						self.executionDataArr.frameList.push(tempData);
						self.isFrameListData(false);
						isFrameListFirst = true;
						self.initDataTrendDiagram(self.executionDataArr);
					}

					if (isFrameListFirst) {
						self.setFrameData(frameListInfo, true);
						isFrameListFirst = false;
					} else {
						let myTable = self.executionDataMapping.get(frameListInfo.VarName);
						if (myTable) {
							self.setFrameData(frameListInfo, false);
						}
					}
				}

				function processMonitorVar() {
					resultJsonData.forEach(result => {
						var varName = result.varName;
						if(result.varType == "IndividualChange"||result.varType == "OverallChange"){
							processMonitorGroup(result);
						}else if (result.varType == "currentValue") {
							var lastValue = result.varValue;
							var dataResultObject = { varName: varName, varValue: lastValue };
							var node = komapping.fromJS(dataResultObject, { 'observe': ["result"] });
							var isExist = false;
							for (var j = 0; j < self.verificationDataResult().length; j++) {
								if (self.verificationDataResult()[j].varName == varName) {
									self.verificationDataResult.splice(j, 1, node);
									isExist = true;
									break;
								}
							}
							if (!isExist) {
								self.verificationDataResult.push(node);
							}
						} else if (result.varType == "timeBasedValue") {
							var isWaveFirst = false;
							var varValues = result.varValues;
							var temp = { varType: result.varType, varName: varName };
							self.executionDataArr = { frameList: [], wave: [] };
							var tempData = self.initDiagramTemplate(temp);
							self.executionDataArr.wave.push(tempData);
							var index = self.executionDataArr.wave.findIndex(md => md.validatorarName === tempData.VarName);
							if (index == -1) index = 0;

							var waveData = self.executionDataArr.wave[index];
							varValues.forEach(value => {
								var x = value[0];
								var y = Number(value[1]);
								var tempArr = [];
								var isExist = false;
								if (self.nameAndTime().length == 0) {
									self.nameAndTime().push({ name: varName, time: x });
									tempArr.push(x, y);
									waveData.data.data.push(tempArr);
								} else {
									for (var n = 0; n < self.nameAndTime().length; n++) {
										if (self.nameAndTime()[n].name == waveData.VarName) {
											self.nameAndTime()[n].time += x;
											tempArr.push(self.nameAndTime()[n].time, y);
											waveData.data.data.push(tempArr);
											isExist = true;
											break;
										}
									}
									if (!isExist) {
										self.nameAndTime().push({ name: varName, time: x });
										tempArr.push(x, y);
										waveData.data.data.push(tempArr);
									}
								}
							});

							if (self.isLoadLineExecutionData()) {
								var temp = { varType: waveData.VarType, varName: waveData.VarName };
								self.executionDataArr = { frameList: [], wave: [] };
								tempData = self.initDiagramTemplate(temp);
								self.executionDataArr.wave.push(tempData);
								self.isLoadLineExecutionData(false);
								isWaveFirst = true;
								self.initDataTrendDiagram(self.executionDataArr);
							}

							if (isWaveFirst) {
								self.setMultipleSeriesData(waveData, true);
								isWaveFirst = false;
							} else {
								let myChart = self.executionDataMapping.get("timeBasedValue");
								if (myChart) {
									self.setMultipleSeriesData(waveData, false);
								}
							}
						}
					});
				}
			}

			this.verificationDataResult = ko.observableArray([]);
			//定义数组存放rawCommuDataList数据
			this.verificationGeneralData = ko.observableArray([]);
			//定义数组存放实时表数据
			this.allFrameListInfo = ko.observableArray([]);
			this.allWaveInfo = ko.observableArray([]);
			//定义是否加载折线图
			this.isLoadLineExecutionData = ko.observable(false);
			this.isFrameListData = ko.observable(false);
			//定义一个数组,记录name和时间和
			this.nameAndTime = ko.observableArray([]);
			this.listExecutionDataResultSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					var results = data.result;
					var listExecutionDataResultId = self.lastExecutionDataId;
					if (listExecutionDataResultId == 0) {
						self.verificationDataResult.removeAll();
						self.allFrameListInfo.removeAll();
						self.verificationGeneralData.removeAll();
						self.allWaveInfo.removeAll();
					}

					var isFrameListFirst = false;
					var isWaveFirst = false;
					if (results.length > 0 && results[results.length - 1].id > listExecutionDataResultId)
						self.lastExecutionDataId = results[results.length - 1].id;
					for (var i = 0; i < results.length; i++) {
						if (results[i].id <= listExecutionDataResultId)
							continue;
						var resultData = results[i].jsonData;
						// 将字符串转换为json对象
						var resultJsonData = JSON.parse(resultData);

						//rawCommuDataList类型
						if (results[i].type == "rawCommuDataList") {
							//将data数据转换为json对象
							//对data进行遍历
							for (var h = 0; h < resultJsonData.length; h++) {
								let rawCommuDataListTempData = resultJsonData[h];
								var tempgeneralData = new Object();
								tempgeneralData.time = rawCommuDataListTempData[0];
								tempgeneralData.antbotName = results[i].dataSource;
								tempgeneralData.direction = rawCommuDataListTempData[1] == "R" ? "接收" : "发送";
								tempgeneralData.data = rawCommuDataListTempData[2];
								//遍历executionDataResult数组	
								var rawCommuDataListMapping = { 'observe': ["result"] };
								var rawCommuDataListNode = komapping.fromJS(tempgeneralData, rawCommuDataListMapping);
								self.verificationGeneralData.push(rawCommuDataListNode);
								if (self.verificationGeneralData().length > 1000) {
									//删除大于1000的数据
									self.verificationGeneralData.shift();
								}
							}
						} else if (results[i].type == "frameList") {
							var temp = {
								varType: results[i].type,
								varName: results[i].type,
							}
							self.executionDataArr = {
								frameList: [],
								wave: []
							}
							tempData = self.initDiagramTemplate(temp)
							self.executionDataArr.frameList.push(tempData)
							index = self.executionDataArr.frameList.findIndex(md => md.varName === tempData.VarName)
							if (index == -1) {
								index = 0;
							}
							var frameListInfo = self.executionDataArr.frameList[index];
							frameListInfo.data = [];
							self.getProtocol(resultJsonData.protocolId);
							self.executionDataArr.frameList[index].protocolId = resultJsonData.protocolId;
							self.executionDataArr.frameList[index].executionId = results[i].executionId;
							for (let n = 0; n < resultJsonData.frameList.length; n++) {
								var frameListData = resultJsonData.frameList[n];
								var dataTemp = {
									dataSource: results[i].dataSource,
									protocolId: resultJsonData.protocolId,
									timestamp: frameListData.timestamp,
									message: frameListData.message,
									receiveFrame: frameListData.receiveFrame ? "接收" : "发送",
									rawFrame: frameListData.rawFrame,
									fieldValues: frameListData.fieldValues,
									fieldSizes: frameListData.fieldSizes
								}
								frameListInfo.data.push(dataTemp)
							}
							//将所有数据存入allFrameListInfo数组
							self.allFrameListInfo.push(frameListInfo);
						} else if (results[i].type == "monitorVar") {
							//对resultJsonData进行for循环遍历
							for (var k = 0; k < resultJsonData.length; k++) {
								//将resultJsonData的每一个对象转换为json字符串
								var varName = resultJsonData[k].varName;
								if (resultJsonData[k].varType == "currentValue") {
									//取出varValues数组中的最后一个值
									var lastValue = resultJsonData[k].varValue;
									var dataResultObject = new Object();
									dataResultObject.varName = varName;
									dataResultObject.varValue = lastValue;
									//遍历executionDataResult数组	
									var mapping = { 'observe': ["result"] };
									var node = komapping.fromJS(dataResultObject, mapping);
									//是否存在
									var isExist = false;
									for (var j = 0; j < self.verificationDataResult().length; j++) {
										if (self.verificationDataResult()[j].varName == varName) {
											//删除原来的对象
											// self.verificationDataResult.splice(j, 1);
											self.verificationDataResult.splice(j, 1, node);
											isExist = true;
											break;
										}
									}
									if (!isExist) {
										self.verificationDataResult.push(node);
									}
								}
								if (resultJsonData[k].varType == "timeBasedValue") {
									//
									var varValues = resultJsonData[k].varValues;
									//当lineExecutionDataName数组长度为1时,则将varName赋值给self.selectLineExecutionDataName
									var temp = {
										varType: resultJsonData[k].varType,
										varName: varName,
									}
									self.executionDataArr = {
										frameList: [],
										wave: []
									}
									tempData = self.initDiagramTemplate(temp)
									self.executionDataArr.wave.push(tempData)
									index = self.executionDataArr.wave.findIndex(md => md.validatorarName === tempData.VarName)
									if (index == -1) {
										index = 0;
									}
									//对varValues数组进行遍历
									var waveData = self.executionDataArr.wave[index];
									for (var m = 0; m < varValues.length; m++) {
										//将varValues数组中的每一个值转换为json对象
										var x = varValues[m][0];
										var y = Number(varValues[m][1]);
										//定义一个标记
										var isExist = false;
										//定义一个临时数组,装x,y的坐标值
										var tempArr = [];
										if (self.nameAndTime().length == 0) {
											// self.nameAndTime = {
											// 	data: []
											// }
											self.nameAndTime().push({
												name: varName,
												time: x
											})
											//将x,y的坐标值装入tempArr数组
											tempArr.push(x);
											tempArr.push(y);
											waveData.data.data.push(tempArr);
											//清空tempArr数组
											tempArr = [];
										} else {
											//遍历nameAndTime数组,将nameAndTime数组中的name和time相加
											for (var n = 0; n < self.nameAndTime().length; n++) {
												//定义一个temp数组,将yAxisData数组中的值赋值给temp数组
												if (self.nameAndTime()[n].name == waveData.VarName) {
													self.nameAndTime()[n].time += x;
													// waveData.data.xAxisData.push(self.nameAndTime.data[n].time);
													tempArr.push(self.nameAndTime()[n].time);
													tempArr.push(y);
													waveData.data.data.push(tempArr);
													//清空tempArr数组
													tempArr = [];
													isExist = true;
													break;

												}
											}
											if (!isExist) {
												self.nameAndTime().push({
													name: varName,
													time: x
												})
												tempArr.push(x);
												tempArr.push(y);
												waveData.data.data.push(tempArr);
												//清空tempArr数组
												tempArr = [];
											}
										}
									}
									//将所有数据存入数组
									self.allWaveInfo.push(waveData);
								}
							}
						}
					}
					if (self.allWaveInfo().length > 0) {
						//如果allWaveInfo数组长度大于1000,则将数组中前1000条数据移除
						if (self.allWaveInfo().length > 1000) {
							self.allWaveInfo.shift();
						}
						// 创建一个数组来保存需要移除的元素的索引
						// var indicesToRemove = [];
						for (let m = 0; m < self.allWaveInfo().length; m++) {
							if (self.isLoadLineExecutionData()) {
								var temp = {
									varType: self.allWaveInfo()[m].VarType,
									varName: self.allWaveInfo()[m].VarName,
								};
								self.executionDataArr = {
									frameList: [],
									wave: []
								};
								tempData = self.initDiagramTemplate(temp);
								self.executionDataArr.wave.push(tempData);
								self.isLoadLineExecutionData(false);
								isWaveFirst = true;
								self.initDataTrendDiagram(self.executionDataArr);
							}
							if (isWaveFirst) {
								self.setMultipleSeriesData(self.allWaveInfo()[m], true);
								// indicesToRemove.push(m);
								isWaveFirst = false;
							} else {
								let myChart = self.executionDataMapping.get("timeBasedValue");
								if (myChart == null || myChart == undefined) {
									// 如果没有对应的图表，可以选择跳过或者记录错误
									continue;
								} else {
									self.setMultipleSeriesData(self.allWaveInfo()[m], false);
									// indicesToRemove.push(m);
								}
							}
						}
						let myChart = self.executionDataMapping.get("timeBasedValue");
						if (isWaveFirst || myChart != undefined) {
							self.allWaveInfo.removeAll();
						}
						// for (let j = 0; j < indicesToRemove.length; j++) {
						// 	self.allWaveInfo().splice(indicesToRemove[j], 1);
						// }

					}
					if (self.allFrameListInfo().length > 0) {
						//如果allFrameListInfo数组长度大于1000,则将数组中前1000条数据移除
						if (self.allFrameListInfo().length > 1000) {
							self.allFrameListInfo.shift();
						}
						// let frameListIndicesToRemove = [];
						for (let i = 0; i < self.allFrameListInfo().length; i++) {
							if (self.isFrameListData()) {
								var temp = {
									varType: self.allFrameListInfo()[i].VarType,
									varName: self.allFrameListInfo()[i].VarName,
								};
								self.executionDataArr = {
									frameList: [],
									wave: []
								};
								tempData = self.initDiagramTemplate(temp);
								self.executionDataArr.frameList.push(tempData);
								self.isFrameListData(false);
								isFrameListFirst = true;
								self.initDataTrendDiagram(self.executionDataArr);
							}
							if (isFrameListFirst) {
								self.setFrameData(self.allFrameListInfo()[i], true);
								// frameListIndicesToRemove.push(i);
								isFrameListFirst = false;
							} else {
								let myTable = self.executionDataMapping.get(self.allFrameListInfo()[i].VarName);
								if (myTable == null || myTable == undefined) {
									// 如果没有对应的表格，可以选择跳过或者记录错误
									continue;
								} else {
									self.setFrameData(self.allFrameListInfo()[i], false);
									// frameListIndicesToRemove.push(i);
								}
							}
						}
						let myTable = self.executionDataMapping.get("frameList");
						if (isFrameListFirst || myTable != undefined) {
							self.allFrameListInfo.removeAll();
						}

						// for (let j = 0; j < frameListIndicesToRemove.length; j++) {
						// 	self.allFrameListInfo().splice(frameListIndicesToRemove[j], 1);
						// }
					}
					// if (data.result.length >= 100) {
					// 	self.getIdMaxExecutionDataResult();
					// }
					// if (!self.isGoback() && (data.result.length >= 2) && ((self.executeState() == executionManager.completed) || (self.executeState() == executionManager.paused)
					// 	|| (self.executeState() == executionManager.terminated) || (self.executeState() == executionManager.stopped))) {
					// 	self.pullData("拉取数据中。。。")
					// 	setTimeout(
					// 		function(){
					// 	self.getIdMaxExecutionDataResult();
					// 	}, 1000);
					// } else if(data.result.length < 2&&self.executionEnd()){
					// 	self.pullData("数据拉取已完成 ");
					// }
					if(results.length>0&&results[results.length - 1].uploadStatus==1){
						self.pullData("数据拉取已完成 ");
					}else if(!self.isGoback() && ((results.length==0&&!self.executionEnd())||(results.length>0&&results[results.length - 1].uploadStatus==0))){
						self.pullData("数据拉取中。。。");
						setTimeout(
							function(){
						self.getIdMaxExecutionDataResult();
						}, 1000);
					}
				}
			};
			this.testcaseTreeData = ko.observableArray([]);
			// get execution result
			this.currentNode = ko.observable(0);
			this.executionEnd = ko.observable(false);
			this.isShowExecuteStatus = ko.observable(true);
			// get execution result
			this.getExecutionResultSuccessFunction =async function(data) {
				if (data && data.status === 1 && data.result) {
					var resultItems = data.result;
					// var currentLastResultId = self.lastResultId;
					// if (resultItems.length > 0 && resultItems[resultItems.length - 1].resultId > self.lastResultId)
					// 	self.lastResultId = resultItems[resultItems.length - 1].resultId;
			
					var updateNodes = function(index) {
						if (index >= resultItems.length) {
							self.resultRetrieveBegin = false;
							if ((!self.isGoback() && (resultItems.length >= 100 || !self.executionEnd())) && executionManager.newExecutionFlag() &&
								!(self.executeState() == executionManager.unknownError || self.executeState() == executionManager.configureError ||
									self.executeState() == executionManager.AntbotNotFoundError || self.executeState() == executionManager.startExecutionError ||
									self.executeState() == executionManager.utpCoreNetworkError || self.executeState() == executionManager.terminated ||
									self.executeState() == executionManager.completed || self.executeState() == executionManager.stopped)) {
								self.pullData("拉取数据中。。。");
								// self.getExecutionResult();
							} else if (resultItems.length < 100 && self.executionEnd()) {
								self.pullData("数据拉取已完成 ");
							}
							return;
						}
			
						var data = resultItems[index];
						// if (data.id <= currentLastResultId) {
						// 	requestAnimationFrame(() => updateNodes(index + 1));
						// 	return;
						// }
			
						switch (data.commandType) {
							case cmdConvertService.commandType.executionEnd:
								handleExecutionEnd();
								// self.lastResultId = 0;
								self.executionEnd(true);
								break;
							case cmdConvertService.commandType.subscriptBegin:
								handleSubscriptBegin(data);
								break;
							case cmdConvertService.commandType.subscriptEnd:
								handleSubscriptEnd(data);
								break;
							case cmdConvertService.commandType.executionCommand:
								handleExecutionCommand(data);
								break;
						}
						checkAndUpdateResult(self.currentNode());
						requestAnimationFrame(() => updateNodes(index + 1));
					};
			
					var handleSubscriptBegin = function (data) {
						if (data.parentId == "-1") {
							var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
							var testcase = {
								name: step.stepName,
								id: data.indexId,
								parentId: data.parentId,
								agentName: "",
								result: -1,
								errorMessage: data.errorMessage,
								isParent: true,
								icon: step.stepType == "subScript" ? 'webix_fmanager_icon fm-file-text' : 'webix_fmanager_icon fm-file',
								executionTime: data.executionTime
							};
							var node = self.treeTable.addNodes("verificationTestcaseTree", {
								// parentIndex: 0,
								index: -1,
								data: testcase
							});
							self.currentNode(node[0].LAY_DATA_INDEX);
							self.lastestCaseNode = testcase;
							self.subscriptBeginLastTestset = node[0];
						}
						if (data.parentId != "-1" && self.subscriptBeginLastTestset != null) {
							let lastMysqlIndexId = self.subscriptBeginLastTestset.id;
							let currentMysqlParentId = data.parentId;
							//根据currentMysqlParentId获取节点是否存在
							let obj = self.treeTable.getNodeById('verificationTestcaseTree', currentMysqlParentId);
							if (obj) {
								var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
								var testcase = {
									name: step.stepName,
									id: data.indexId,
									parentId: data.parentId,
									agentName: "",
									result: -1,
									errorMessage: data.errorMessage,
									isParent: true,
									icon: step.stepType == "subScript" ? 'webix_fmanager_icon fm-file-text' : 'webix_fmanager_icon fm-file',
									executionTime: data.executionTime
								};
								var node = self.treeTable.addNodes("verificationTestcaseTree", {
									parentIndex: obj.data.LAY_DATA_INDEX,
									index: -1,
									data: testcase
								});
								self.currentNode(node[0].LAY_DATA_INDEX);
								self.lastestCaseNode = testcase;
								self.subscriptBeginLastTestset = node[0];
							} else {
								if (lastMysqlIndexId != currentMysqlParentId) {
									let arr = currentMysqlParentId.split("-");
									let lastIndexId = self.subscriptBeginLastTestset.LAY_DATA_INDEX;
									let lastArr = lastIndexId.split("-");
									if (arr.length <= lastArr.length) {
										for (let i = 0; i <= lastArr.length - arr.length; i++) {
											let last = lastArr.join("-");
											self.treeTable.updateNode('verificationTestcaseTree', last, { result: 2 });
											self.treeTable.expandNode('verificationTestcaseTree', { index: last, expandFlag: false });
											lastArr.pop();
										}
										let lastStr = lastArr.join("-");
										self.currentNode(lastStr);
									}
								}
								// 更新父节点下所有子节点的 result 值为 -1 的为 2
								var parentNode = self.treeTable.getNodeDataByIndex('verificationTestcaseTree', self.currentNode());
								if (parentNode && parentNode.children) {
									parentNode.children.forEach(child => {
										if (child.result === -1) {
											self.treeTable.updateNode('verificationTestcaseTree', child.LAY_DATA_INDEX, { result: 2 });
										}
									});
								}

							}

						}
					};
			
					var handleSubscriptEnd = function(data) {
						var obj = self.treeTable.getNodeById('verificationTestcaseTree', data.indexId);
						if (obj) {
							var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
							self.treeTable.updateNode('verificationTestcaseTree', self.currentNode(), {
								executionTime: self.lastestCaseNode.executionTime + " - " + data.executionTime,
								result: data.result,
								errorMessage: data.errorMessage
							});
							var currentData = self.treeTable.getNodeDataByIndex('verificationTestcaseTree', self.currentNode());
							self.treeTable.expandNode('verificationTestcaseTree', { index: self.currentNode(), expandFlag: false });
							self.currentNode(currentData.LAY_PARENT_INDEX);
						}
					};
			
					var handleExecutionCommand = function (data) {
						if (data.parentId != "-1" && self.subscriptBeginLastTestset != null) {
							let currentMysqlParentId = data.parentId;
							let obj = self.treeTable.getNodeById('verificationTestcaseTree', currentMysqlParentId);
							if (obj) {
								self.currentNode(obj.data.LAY_DATA_INDEX);
								var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
								var testcase = {
									name: step.stepName,
									result: data.result,
									errorMessage: data.errorMessage,
									executionTime: data.executionTime,
									id: data.indexId,
									existBigData: step.existBigData,
									bigDataId: step.bigDataId,
									parentId: data.parentId,
									agentName: data.antbotName == "__SYSDEV__" || data.antbotName == "__EXTDEV__" ? "" : data.antbotName,
									name: data.antbotName == "__SYSDEV__" || data.antbotName == "__EXTDEV__" ? step.stepName : "[" + data.antbotName + "]  " + step.stepName
								};
								if (testcase.existBigData && testcase.bigDataId)
									self.getJsonStorageData(testcase);
								var node = self.treeTable.addNodes("verificationTestcaseTree", {
									parentIndex: self.currentNode(),
									index: -1,
									data: testcase
								});

								var parentNode = self.treeTable.getNodeDataByIndex('verificationTestcaseTree', self.currentNode());
								if (parentNode.children && parentNode.children.length > 50) {
									var excessNodes = parentNode.children.length - 50;
									for (var i = 0; i < excessNodes; i++) {
										self.treeTable.removeNode('verificationTestcaseTree', parentNode.children[i].LAY_DATA_INDEX);
									}
								}
							}

						}
					};
			
					var checkAndUpdateResult = function(nodeIndex) {
						var nodeData = self.treeTable.getNodeDataByIndex('verificationTestcaseTree', nodeIndex);
						if (nodeData && nodeData.result == 2) {
							var currentNodeIndex = nodeIndex;
							while (currentNodeIndex) {
								self.treeTable.updateNode('verificationTestcaseTree', currentNodeIndex, { result: 2 });
								var currentNodeData = self.treeTable.getNodeDataByIndex('verificationTestcaseTree', currentNodeIndex);
								currentNodeIndex = currentNodeData ? currentNodeData.LAY_PARENT_INDEX : null;
							}
						}
					};
					var handleExecutionEnd = function() {
						if (self.subscriptBeginLastTestset != null&&self.subscriptBeginLastTestset.result==-1) {
							let  lastIndexId= self.subscriptBeginLastTestset.LAY_DATA_INDEX;
							//修改当前节点的result值为2
							self.treeTable.updateNode('verificationTestcaseTree', lastIndexId, { result: 2 });
							checkAndUpdateResult(lastIndexId);
						}
						//断开
						self.resultStepWebsocket.close();
					}
			
					requestAnimationFrame(() => updateNodes(0));
				} else {
					self.getExecutionResultErrorFunction();
				}
			};
			this.pullData = ko.observable('');
			this.getExecutionResultErrorFunction = function () {
				self.resultRetrieveBegin = false;
				notificationService.showError('获取验证结果失败。');
			};

			this.getExecutionResult = function () {
				if (!self.resultRetrieveBegin) {
					self.resultRetrieveBegin = true;
					var maximum = 100;
					// utpService.getExecutionResult(self.executionId, self.lastResultId, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
					utpService.getMaximumExecutionResult(self.executionId, self.lastResultId, maximum, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
				}

			};

			this.getIdMaxExecutionDataResult = function () {
				let maximum = 2;
				utpService.listExecutionDataResult(self.executionId, self.lastExecutionDataId, maximum, self.listExecutionDataResultSuccessFunction, self.getIdMaxExecutionDataResultErrorFunction);
			};


			this.cancelVerification = function () {
				var executionId = { executionId: self.executionId };
				utpService.cancelExecution(executionId, function (data) {
					if (data && data.status === 1 && data.result) {
						// notificationService.showError('机器人名称匹配失败,已取消验证');
						return
					}
					else {
						notificationService.showError('取消验证失败');
					}
				}, function (error) {
					notificationService.showError('取消验证失败');
				});
				$('#verificationDynamicTargetObjectsModal').modal('hide');
				$('#verificationDynamicAgentsModal').modal('hide');
				$('#inputVerificationModal').modal('hide');
				$('.modal-backdrop').remove();
				self.goback();
			};

			this.initVerificationConfig = function (dummyVerification) {
				$('#dummyVerificationConfig').bootstrapSwitch("state", dummyVerification);
				$('#dummyVerificationConfig').on('switchChange.bootstrapSwitch', function (event, state) {
					self.dummyVerification(state);
				});
			}

			this.initDetailData = function (executionResultList, isSummary) {
				return cmdConvertService.executionResultLocalization(executionResultList, isSummary);
			}

			this.testcaseWithBigDataProcess = function (bigData) {
				if (bigData && bigData.type.includes("image/")) {
					var domId = '#' + bigData.id;
					if ($(domId)) {
						$(domId).popover({
							placement: "right",
							html: true,
							trigger: 'hover',
							content: "<img src = '" + bigData.data + "' onload='if(this.width > 300) this.width=300'/>"
						});
					}
				}
			};

			this.viewBigData = function (item) {
				var bigData = protocolService.getBigData(item.bigDataId);
				if (bigData) {
					self.currentBigDataConfig = {
						bigDataId: item.bigDataId
					};
					if (bigData.type.includes("video/")) {
						var base64String = bigData.data;
						var videoElement = $('#verificationBigDataVideoModal').find('video')[0];
						videoElement.src = base64String;
						videoElement.controls = true;
						videoElement.autoplay = true;
						$('#verificationBigDataVideoModal').modal('show');
					} else if (bigData.type.includes("image/")) {
						//将base64String转换为图片
						var img = new Image();
						img.src = bigData.data;
						//点击查看,弹出模态框显示图片,而不是新打开一个页面
						$('#verificationBigDataImgModal').modal('show');
						$('#verificationBigDataImgModal').on('shown.bs.modal', function () {
							$('#verificationBigDataImgModal').find('img').attr('src', img.src);
						});
					} else if (bigData.type == protocolService.bigDataType.audio) {
						var audio = new Audio();
						audio.src = bigData.data;
						audio.controls = true;
						audio.autoplay = true;
						$('#verificationBigDataAudioModal').modal('show');
						$('#verificationBigDataAudioModal').on('shown.bs.modal', function () {
							$('#verificationBigDataAudioModal').find('audio').attr('src', audio.src);
						});
					} else if (bigData.type == protocolService.bigDataType.paralAllRunSummary) {
						komapping.fromJS(bigData.data.succRunTimeArry, {}, self.pressureTestSummaryData);
						self.pressureTestSummary.succCount(bigData.data.succCount);
						self.pressureTestSummary.failCount(bigData.data.failCount);
						self.pressureTestSummary.result(bigData.data.result);
						self.pressureTestSummary.startTime(bigData.data.startTime);
						self.pressureTestSummary.endTime(bigData.data.endTime);
						$('#verificationPressureTestSummaryModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.paralScriptRunDetailInfo) {
						komapping.fromJS(bigData.data.commandResultList, {}, self.pressureTestDetailData);
						self.pressureTestDetail.runId(bigData.data.runID);
						self.pressureTestDetail.result(bigData.data.result);
						self.pressureTestDetail.startTime(bigData.data.startTime);
						self.pressureTestDetail.endTime(bigData.data.endTime);
						$('#verificationPressureTestDetailModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.paralAllFailRunDetailInfo) {
						komapping.fromJS(bigData.data, {}, self.pressureTestFailDetailData);
						self.failDetailEnabled(false);
						$('#verificationPressureTestFailDetailReportModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.paralCmdsStatisRunTimes) {
						komapping.fromJS(bigData.data, {}, self.pressureTestCmdsStatisRunTimes);
						$('#verificationPressureTestCmdRunTimesReportModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.J1939) {
						komapping.fromJS(bigData.data.canFrameDataList, {}, self.frameDataList);
						$('#verificationFrameDataModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.ARINC429) {
						for (var i = 0; i < bigData.data.frameDataList.length; i++)
							bigData.data.frameDataList[i].id = i;
						komapping.fromJS(bigData.data.frameDataList, {}, self.arinc429FrameDataList);
						self.arincDetailEnabled(false);
						$('#verificationFrameARINC429DataModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.MIL1553B) {
						for (var i = 0; i < bigData.data.frameDataList.length; i++)
							bigData.data.frameDataList[i].id = i;
						komapping.fromJS(bigData.data.frameDataList, {}, self.mil1553BFrameDataList);
						self.mil1553BDetailEnabled(false);
						$('#verificationFrameMIL1553BDataModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.MIL1553BCUSTOM) {
						for (var i = 0; i < bigData.data.frameDataList.length; i++)
							bigData.data.frameDataList[i].id = i;
						komapping.fromJS(bigData.data.frameDataList, {}, self.mil1553BCustomFrameDataList);
						self.mil1553BCustomDetailEnabled(false);
						$('#verificationFrameMIL1553BCustomDataModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.genericBusFrame) {
						self.currentBigDataConfig.protocolId = bigData.data.busInterfaceDefID;
						var genericFrameDataList = protocolService.bigDataAnalysis(bigData.data.busInterfaceDefID, bigData.data.genericBusFrameDatas);
						komapping.fromJS(genericFrameDataList, {}, self.genericFrameDataList);
						self.genericDetailEnabled(false);
						$('#verificationFrameGenericDataModal').modal('show');
					} else if (bigData.type == protocolService.bigDataType.generalBusMessagesToDiff) {
						self.currentBigDataConfig.protocolId = bigData.data.busInterfaceDefID;
						var messageName = bigData.data.messageName;
						if (bigData.data.fieldValues1 && bigData.data.fieldValues2) {
							var fields = protocolService.bigDataFieldAnalysis(bigData.data.busInterfaceDefID, messageName, bigData.data.fieldValues1);
							var jsonLeft = null;
							var jsonRight = null;
							if (fields) {
								jsonLeft = JSON.parse(fields);
							}
							var fields = protocolService.bigDataFieldAnalysis(bigData.data.busInterfaceDefID, messageName, bigData.data.fieldValues2);

							if (fields) {
								jsonRight = JSON.parse(fields);
							}
							if (jsonLeft && jsonRight) {
								$('#protocolCompareModal').modal({ show: true }, { data: { jsonLeft, jsonRight } });
							}
						}
					} else if (bigData.type == protocolService.bigDataType.generalJsonTable) {
						self.generalJsonHead([]);
						self.generalJsonData([]);
						self.currentBigDataConfig.protocolId = bigData.id;
						var generalJsonHead = bigData.data.head;

						var generalJsonData = [];
						for (var e = 0; e < bigData.data.data.length; e++) {
							var lineVal = ko.observable([]);
							//数组bigData.data.data第一列加上倒序序号
							if (generalJsonHead[0] != "序号") {
								bigData.data.data[e].unshift(bigData.data.data.length - e)
							}
							komapping.fromJS(bigData.data.data[e], [], lineVal);
							generalJsonData.push(lineVal);
						}
						//数组第一列加上序号
						if (generalJsonHead[0] != "序号") {
							generalJsonHead.unshift("序号");
						}
						komapping.fromJS(generalJsonHead, [], self.generalJsonHead);
						komapping.fromJS(generalJsonData, [], self.generalJsonData);
						$('#generalJsonDataModal').modal('show');
					} else {
						self.generalRawData(bigData.data);
						$('#verificationGeneralRawDataModal').modal('show');
					}
				}
			};

			this.getJsonStorageDataSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					var bigData = protocolService.addBigData(data.result);
					if (bigData)
						self.testcaseWithBigDataProcess(bigData);
				}
				else
					self.getJsonStorageDataFunction();
			};

			this.getJsonStorageDataFunction = function () {
				notificationService.showError('获取数据失败。');
			};

			this.getJsonStorageData = function (item) {
				if (item.existBigData && item.bigDataId) {
					var bigData = protocolService.getBigData(item.bigDataId);
					if (bigData) {
						self.testcaseWithBigDataProcess(bigData);
						return;
					}
					utpService.getOverviewBigDataById(item.bigDataId, self.getJsonStorageDataSuccessFunction, self.getJsonStorageDataFunction);
				}
			};

			this.initBigData = function (executionResultList) {
				if (executionResultList != null) {
					for (var i = 0; i < executionResultList.length; i++) {
						self.getJsonStorageData(executionResultList[i]);
					}
				}
			};

			this.pressureTestSummaryData = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});
			this.pressureTestSummary = {
				succCount: ko.observable(0),
				failCount: ko.observable(0),
				result: ko.observable(''),
				startTime: ko.observable(''),
				endTime: ko.observable('')
			};
			this.pressureTestDetailData = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});
			this.pressureTestDetail = {
				runId: ko.observable(0),
				result: ko.observable(''),
				startTime: ko.observable(''),
				endTime: ko.observable('')
			};

			this.pressureTestCmdRunTimes = [];

			this.pressureTestCmdRunTimesDetail = {
				antbot: ko.observable(''),
				command: ko.observable(''),
				parameter: ko.observable('')
			};

			this.pressureTestCmdsStatisRunTimes = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.pressureTestFailDetailData = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.frameDataList = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.failDetailEnabled = ko.observable(false);

			this.disableFailDetailInfo = function () {
				self.failDetailEnabled(false);
			};

			this.enalbeFailDetailInfo = function (item) {
				komapping.fromJS(item.commandResultList(), {}, self.pressureTestDetailData);
				self.pressureTestDetail.runId(item.runID());
				self.pressureTestDetail.result(item.result());
				self.pressureTestDetail.startTime(item.startTime());
				self.pressureTestDetail.endTime(item.endTime());
				self.failDetailEnabled(true);
			};

			// ARINC429
			this.arinc429FrameDataList = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.arincDetailEnabled = ko.observable(false);

			this.disableARINC429DetailInfo = function () {
				self.arincDetailEnabled(false);
			};

			this.showARINC429Detail = function (item) {
				self.currentARINC429Record.time(item.time());
				self.currentARINC429Record.labelIndex(item.labelIndex(0));
				self.currentARINC429Record.labelName(item.labelName());
				self.currentARINC429Record.encodedString(item.encodedString());
				self.currentARINC429Record.fields(item.fields());
				self.currentARINC429Record.decodedBits(item.decodedBits());
				self.currentARINC429Record.units(item.units());
				self.currentARINC429Record.ssmValue(item.ssmValue());
				self.arincDetailEnabled(true);
			}

			this.currentARINC429Record = {
				time: ko.observable(''),
				labelIndex: ko.observable(''),
				labelName: ko.observable(''),
				encodedString: ko.observable(''),
				fields: ko.observable([]),
				decodedBits: ko.observable(''),
				units: ko.observable(''),
				ssmValue: ko.observable('')
			};

			// MIL1553B
			this.mil1553BFrameDataList = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.mil1553BDetailEnabled = ko.observable(false);

			this.disableMIL1553BDetailInfo = function () {
				self.mil1553BDetailEnabled(false);
			};

			this.showMIL1553BDetail = function (item) {
				self.currentMIL1553BRecord.path(item.path());
				self.currentMIL1553BRecord.comWord(item.comWord());
				self.currentMIL1553BRecord.datas(item.datas());
				self.currentMIL1553BRecord.status(item.status());
				self.currentMIL1553BRecord.rawFrame(item.rawFrame());
				self.mil1553BDetailEnabled(true);
			}

			this.currentMIL1553BRecord = {
				path: ko.observable(''),
				comWord: ko.observable(''),
				datas: ko.observable(''),
				status: ko.observable(''),
				rawFrame: ko.observable('')
			};

			// MIL1553BCUSTOM
			this.mil1553BCustomFrameDataList = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.mil1553BCustomDetailEnabled = ko.observable(false);

			this.disableMIL1553BCustomDetailInfo = function () {
				self.mil1553BCustomDetailEnabled(false);
			};

			this.showMIL1553BCustomDetail = function (item) {
				var unmapped = komapping.toJS(item.frameDatas);
				self.currentMIL1553BCustomRecord.frameDatas(unmapped);
				self.mil1553BCustomDetailEnabled(true);
			};

			this.currentMIL1553BCustomRecord = {
				frameDatas: ko.observable([])
			};

			// Generic Frame
			this.genericFrameDataList = ko.observable([]);
			this.generalJsonData = ko.observable([]);
			this.generalJsonHead = ko.observable([]);
			this.genericDetailEnabled = ko.observable(false);

			this.genericRawFrame = ko.observable('');
			this.generalRawData = ko.observable('');
			this.currentBigDataFrameConfig = null;
			this.messageTemplateName = ko.observable('');
			this.genericErrorFrameData = ko.observable(false);
			this.genericRecordContent = ko.observable('');

			this.createMessageTemplateSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result)
					notificationService.showSuccess('创建消息模板成功！');
				else if (data.errorMessage)
					notificationService.showError(data.errorMessage);
				else
					self.createMessageTemplateErrorFunction();
			};

			this.createMessageTemplateErrorFunction = function () {
				notificationService.showError('创建消息模板失败！');
			};

			this.createMessageType = function () {
				if (self.messageTemplateName() === '') {
					notificationService.showError('消息模板名称不能为空');
					return;
				}
				var messageTypeObj = {
					id: 0,
					protocolId: self.currentBigDataFrameConfig.protocolId,
					messageName: self.currentBigDataFrameConfig.messageName,
					templateName: self.messageTemplateName(),
					fieldValues: self.currentBigDataFrameConfig.fieldValues
				}
				utpService.createMessageTemplate(messageTypeObj, self.createMessageTemplateSuccessFunction, self.createMessageTemplateErrorFunction);
			};

			this.disableGenericDetailInfo = function () {
				self.genericErrorFrameData(false);
				self.genericDetailEnabled(false);
				self.messageTemplateName('');
				self.genericRawFrame("");
				$('#verificationReportConfigView').html('');
			};

			this.displayReportConfig = function (protocolId, messageName, genericRecordContent, fieldValues, fieldSizes) {
				$('#verificationFrameGenericDataModal').modal('show')
				self.messageTemplateName('');
				const container = document.getElementById('verificationReportConfigView');
				const options = {
					mode: 'view',
					modes: ['text', 'view'],
					name: messageName,
					dragarea: false,
					enableSort: false,
					enableTransform: false,
					enableExtract: false,
					colorPicker: false,
					language: 'zh-CN',
					onEditable: function (node) {
						if (!node.path) {
							// In modes code and text, node is empty: no path, field, or value
							// returning false makes the text area read-only
							return false;
						}
					},
					onEvent: function (node, event) {
						if (event.type === "click") {
							var path = JSON.parse(JSON.stringify(node.path));
							var interval = protocolService.getFieldValueInterval(protocolId, messageName, path, fieldValues, fieldSizes);
							if (interval) {
								var rawFrame = self.genericRawFrame();
								rawFrame = rawFrame.replace("<div style='color:#FF0000';>", "").replace("</div>", "");
								var start = interval.start / 4;
								var end = interval.end / 4;
								rawFrame = rawFrame.slice(0, start) + "<div style='color:#FF0000';>" + rawFrame.slice(start, end) + "</div>" + rawFrame.slice(end);
								self.genericRawFrame(rawFrame);
							}
							console.log(interval);
						}
					}
				}
				self.editor = new JSONEditor(container, options, genericRecordContent);
			};

			this.getFieldStorageDataSuccessFunction = function (data) {
				if (data && data.status === 1) {
					result = JSON.parse(data.result);
					var fieldValues = result.fieldValues;
					var fieldSizes = result.fieldSizes;
					var rawFrame = result.rawFrame;
					self.genericRawFrame(rawFrame);
					if (self.currentBigDataFrameConfig) {
						var bigData = protocolService.getBigData(self.currentBigDataFrameConfig.bigDataId);
						if (bigData) {
							var messageName = bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].message;
							bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].fieldValues = fieldValues;
							bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].rawFrame = rawFrame;
							self.currentBigDataFrameConfig.fieldValues = fieldValues;
							protocolService.updateBigData(self.currentBigDataFrameConfig.bigDataId, bigData);
							self.showFormatGenericDetail(bigData.data.busInterfaceDefID, messageName, fieldValues, fieldSizes);
						}
					}
				}
				else
					self.getFieldStorageDataErrorFunction();
			};

			this.getFieldStorageDataErrorFunction = function () {
				notificationService.showError('获取字段数据失败！');
			};

			this.showFormatGenericDetail = function (busInterfaceDefID, messageName, fieldValues, fieldSizes) {
				var fields = protocolService.bigDataFieldAnalysis(busInterfaceDefID, messageName, fieldValues);
				if (fields) {
					self.genericRecordContent(JSON.parse(fields));
					self.genericErrorFrameData(false);
					self.displayReportConfig(busInterfaceDefID, messageName, self.genericRecordContent(), fieldValues, fieldSizes);
				}
				else {
					self.genericRecordContent(fieldValues);
					self.genericErrorFrameData(true);
					notificationService.showError("不满足协议定义,不能解析详细字段!");
				}
				self.genericDetailEnabled(true);
			};

			this.showGenericDetail = function (item, event) {
				var context = ko.contextFor(event.target);
				var index = context.$index();
				self.currentBigDataFrameConfig = {
					bigDataId: self.currentBigDataConfig.bigDataId,
					fieldValues: '',
					protocolId: self.currentBigDataConfig.protocolId,
					messageName: item.frameData.message(),
					index: index
				};
				self.disableGenericDetailInfo();
					// if(item.frameData.fields().length === 0 || item.rawFrame() == undefined || item.rawFrame() == ''){
					utpService.getIndexBigDataById(self.currentBigDataFrameConfig.bigDataId, self.currentBigDataFrameConfig.index, self.getFieldStorageDataSuccessFunction, self.getFieldStorageDataErrorFunction);
					// 	return;
					// }
					// self.genericRawFrame(item.rawFrame());
					// self.currentBigDataFrameConfig.fieldValues = item.frameData.fieldValues();
					// self.showFormatGenericDetail(self.currentBigDataConfig.protocolId, item.frameData.message(), self.currentBigDataFrameConfig.fieldValues);
				};

			this.showProtocolCompare = function (jsonLeft, jsonRight) {
				self.viewManager.protocolCompareActiveData({ jsonLeft, jsonRight });
				self.viewManager.protocolCompareActivePage('app/viewmodels/protocolCompare');
			};

			this.currentBigDataConfig = null;

			this.getDetailExecutionResultSuccessFunction = function (executionResultList) {
				if (data && data.status === 1) {
					var executionResultList = data.result;
					if (executionResultList != null) {
						var expectedResultList = self.initDetailData(executionResultList, false);
						self.initBigData(expectedResultList);
						$$("verificationHistory_tabview").addView({
							header: self.selectResultStep.stepName, close: true,
							body: {
								view: "datatable",
								css: "webix_header_border",
								id: self.selectResultStep.id,
								template: "#title#",
								columns: [
									{
										id: "step",
										header: "测试序号",
										fillspace: 2
									},
									{
										id: "stepName",
										header: "测试步骤",
										fillspace: 5,
										template: function (data) {
											if (data.existBigData && data.bigDataId) {
												return "<div><a href='#' class='bigData'>" + data.stepName + "</a></div>";
											}
											else
												return "<div><span>" + data.stepName + "</span></div>";
										},
										tooltip: function (obj, common) {
											var column = common.column.id;
											if (obj.existBigData && obj.bigDataId) {
												var bigData = protocolService.getBigData(obj.bigDataId);
												if (bigData && bigData.type.includes("image/"))
													return "<img src = '" + bigData.data + "' οnlοad='if(this.width > 300) this.width=300'/>";
											}
											return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" + obj[column] + "</span>";
										}
									},
									{
										id: "result",
										header: ["测试结果", {
											content: "selectFilter", compare: self.testResultCompare, options: [
												{ "value": "成功", "id": cmdConvertService.testResult.pass },
												{ "value": "失败", "id": cmdConvertService.testResult.failed },
												{ "value": "超时", "id": cmdConvertService.testResult.timeOut },
												{ "value": "其它", "id": cmdConvertService.testResult.other }
											]
										}],
										fillspace: 2,
										template: function (data) {
											if (data.result == cmdConvertService.testResult.pass)
												return "<div style='background-color: green'><span>成功</span></div>";
											else if (data.result == cmdConvertService.testResult.failed)
												return "<div style='background-color: red'><span>" + (data.errorMessage == null || data.errorMessage == "" ? "失败" : data.errorMessage) + "</span></div>";
											else if (data.result == cmdConvertService.testResult.timeOut)
												return "<div style='background-color: yellow'><span>超时</span></div>";
											else if (data.result == cmdConvertService.testResult.other)
												return "<div><span>其它</span></div>";
										},
										tooltip: function (obj, common) {
											var column = common.column.id;
											if (obj[column] == cmdConvertService.testResult.pass)
												return "成功";
											else if (obj[column] == cmdConvertService.testResult.failed)
												return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" + (obj['errorMessage'] == null || obj['errorMessage'] == "" ? "失败" : obj['errorMessage']) + "</span>";
											else if (obj[column] == cmdConvertService.testResult.timeOut)
												return "超时";
											else if (obj[column] == cmdConvertService.testResult.other)
												return "其它";
										}
									},
									{ id: "time", header: "执行时间", fillspace: 4 }
								],
								onClick: {
									bigData: function (ev, id) {
										var item = $$($$("verificationHistory_tabview").getValue()).getItem(id);
										if (item == null)
											return;
										self.viewBigData(item);
										return;
									}
								},
								tooltip: true,
								fixedRowHeight: false,
								rowLineHeight: 25,
								rowHeight: 25,
								data: expectedResultList,
								select: true,
								on: {
									onresize: webix.once(function () {
										this.adjustRowHeight("stepName", true);
									}),
									onAfterLoad: function () {
										if (!this.count())
											this.showOverlay("数据不存在");
									}
								}
							}
						});
						$.unblockUI();
					}
					else
						self.getDetailExecutionResultErrorFunction();
				}
				else
					self.getDetailExecutionResultErrorFunction();
			};

			this.getDetailExecutionResultErrorFunction = function () {
				$.unblockUI();
				notificationService.showError('获取详细信息失败');
			};

			this.getDetailExecutionResult = function (start, end) {
				// self.getDetailExecutionResultSuccessFunction(null);
				$.blockUI(utilityService.template);
				utpService.getDetailExecutionResult(self.executionId, start, end, self.getDetailExecutionResultSuccessFunction, self.getDetailExecutionResultErrorFunction);
			};

			this.stepTypeCompare = function (value, filter, config) {
				var type = config.type.toString().toLowerCase();
				filter = filter.toString().toLowerCase();
				return type == filter;
			}

			this.testResultCompare = function (value, filter, config) {
				var result = config.result.toString().toLowerCase();
				filter = filter.toString().toLowerCase();
				return result == filter;
			}

			this.initTable = function () {
				webix.ready(function () {
					webix.ui({
						container: "verificationHistoryDetailInfo",
						id: "verificationHistory_tabview",
						width: 0,
						view: "tabview",
						cells: [
							{
								header: "测试用例/检查点 结果",
								id: "main",
								body: {
									view: "datatable",
									css: "webix_header_border",
									id: "list1",
									template: "#title#",
									columns: [
										{
											id: "step",
											header: ["测试类型", {
												content: "selectFilter", compare: self.stepTypeCompare, options: [
													{ "value": "测试用例", "id": "TestCase" },
													{ "value": "检查点", "id": "Checkpoint" }
												]
											}],
											fillspace: 3
										},
										{
											id: "stepName",
											header: "测试名称",
											fillspace: 8,
											tooltip: function (obj, common) {
												var column = common.column.id;
												return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" + obj[column] + "</span>";
											}
										},
										{
											id: "result",
											header: ["测试结果", {
												content: "selectFilter", compare: self.testResultCompare, options: [
													{ "value": "成功", "id": cmdConvertService.testResult.pass },
													{ "value": "失败", "id": cmdConvertService.testResult.failed },
													{ "value": "超时", "id": cmdConvertService.testResult.timeOut },
													{ "value": "未完成", "id": cmdConvertService.testResult.unCompleted },
													{ "value": "其它", "id": cmdConvertService.testResult.other }
												]
											}],
											fillspace: 3,
											template: function (data) {
												if (data.result == cmdConvertService.testResult.pass)
													return "<div style='background-color: green'><span>成功</span></div>";
												else if (data.result == cmdConvertService.testResult.failed)
													return "<div style='background-color: red'><span>" + (data.errorMessage == null || data.errorMessage == "" ? "失败" : data.errorMessage) + "</span></div>";
												else if (data.result == cmdConvertService.testResult.timeOut)
													return "<div style='background-color: yellow'><span>超时</span></div>";
												else if (data.result == cmdConvertService.testResult.unCompleted)
													return "<div style='background-color: yellow'><span>未完成</span></div>";
												else if (data.result == cmdConvertService.testResult.other)
													return "<div><span>其它</span></div>";
											},
											tooltip: function (obj, common) {
												var column = common.column.id;
												if (obj[column] == cmdConvertService.testResult.pass)
													return "成功";
												else if (obj[column] == cmdConvertService.testResult.failed)
													return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" + (obj['errorMessage'] == null || obj['errorMessage'] == "" ? "失败" : obj['errorMessage']) + "</span>";
												else if (obj[column] == cmdConvertService.testResult.timeOut)
													return "超时";
												else if (obj[column] == cmdConvertService.testResult.other)
													return "其它";
											}
										},
										{ id: "time", header: "执行时间", fillspace: 6 },
										{
											id: "", header: "", fillspace: 1,
											template: function (item) {
												return "<span class='webix_icon fas fa-search-plus' style='cursor: pointer;'></span>"
											}
										}
									],
									tooltip: true,
									fixedRowHeight: false,
									rowLineHeight: 25,
									rowHeight: 25,
									data: self.gridData,
									select: true,
									onClick: {
										"fa-search-plus": function (ev, id) {
											var item = $$('list1').getItem(id);
											if (item == null)
												return;
											self.selectResultStep = item;
											if (!$$(item.id)) {
												self.getDetailExecutionResult(item.begin, item.end);
											}
											else
												$$(item.id).show(false, false);
										}
									},
									on: {
										onAfterLoad: function () {
											if (!this.count())
												this.showOverlay("数据不存在");
										},
										onresize: webix.once(function () {
											this.adjustRowHeight("stepName", true);
										}),
									}
								}
							}
						]
					});
				});
			}

			this.fetchHistoryResultSuccessFunction = function (data) {
				//data ={"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","executionStartTime":"2019-06-16 09:00","executionEndTime":"2019-06-16 09:01","executionPeriod":"0 hours : 0 minutes : 39 seconds\r\n","executedByUserId":"test@macrosoftsys.com","targetTestsetName":"测试集1","executionName":"test","passedScripts":[],"failedScripts":[{"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","scriptId":769,"scriptName":"smoke test","startTime":"2019-06-16 09:01","result":"Fail"}],"unExecutedScripts":[],"executionResultList":[{"resultId":505496,"scriptId":769,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution TestCase Begin","executionTime":"2019-06-16 09:00:30","command":"smoke test","result":"Pass","errorMessage":null},{"resultId":505498,"scriptId":769,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution TestCase End","executionTime":"2019-06-16 09:01:06","command":"smoke test","result":"Fail","errorMessage":null},{"resultId":505499,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Exception Begin","executionTime":"2019-06-16 09:01:06","command":null,"result":"Pass","errorMessage":null},{"resultId":505500,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Exception End","executionTime":"2019-06-16 09:01:07","command":null,"result":"Pass","errorMessage":null},{"resultId":505501,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution End","executionTime":"2019-06-16 09:01:07","command":null,"result":"Pass","errorMessage":null}]};
				if (data && data.status === 1 && data != null && data.result) {
					var executionResultList = data.result;
					self.gridData = self.initDetailData(executionResultList, true);
					$('#verificationHistoryResultModal').modal('show');
				}
				else
					notificationService.showError('获取报表失败');
				$.unblockUI();
			};

			this.fetchHistoryResultErrorFunction = function (error) {
				$.unblockUI();
				notificationService.showError('获取历史数据失败');
			};

			this.fetchHistoryResult = function () {
				$.blockUI(utilityService.template);
				utpService.getFinishedSummaryExecutionResult(self.executionId, self.fetchHistoryResultSuccessFunction, self.fetchHistoryResultErrorFunction);
			}

			this.activate = function () { };

			this.drawPressureTestSummaryChart = function (seriesData) {
				var min = max = seriesData()[0].millionSeconds();
				for (var i = 1; i < seriesData().length; i++) {
					if (seriesData()[i].millionSeconds() > max)
						max = seriesData()[i].millionSeconds();
					if (seriesData()[i].millionSeconds() < min)
						min = seriesData()[i].millionSeconds();
				}
				self.pressureTestSummaryChart.hideLoading();
				self.chartOptions = {
					title: {
						text: '并发实例执行时间',
						subtext: self.pressureTestSummary.startTime() + " 到 " + self.pressureTestSummary.endTime(),
					},
					tooltip: {
						trigger: 'axis',
						axisPointer: { // 坐标轴指示器，坐标轴触发有效
							type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
						},
						formatter: function (params) {
							return utilityService.formatMilliSecondToHourMinSecond(params[0].value)
						}
					},
					legend: {
						data: []
					},
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					toolbox: {
						feature: {
							saveAsImage: {}
						}
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						data: seriesData().map(function (item) {
							return item.runID();
						}),
						axisLabel: {
							formatter: function (value, index) {
								return "运行" + (index + 1) + "\n" + value;
							}
						}
					},
					yAxis: {
						type: 'value',
						min: (min - 1000) < 0 ? 0 : (min - 1000),
						max: max + 1000,
						axisLabel: {
							formatter: function (value, index) {
								return utilityService.formatMilliSecondToHourMinSecond(value);
							}
						}
					},
					series: []
				};
				if (self.chartOptions && typeof self.chartOptions === "object") {
					var successTestCaseSeries = {
						name: '成功',
						type: 'line',
						stack: '耗时',
						data: seriesData().map(function (item) {
							return item.millionSeconds();
						})
					};
					self.chartOptions.series.push(successTestCaseSeries);
					self.chartOptions.legend.data = ["成功"];
					self.pressureTestSummaryChart.setOption(self.chartOptions, true);
				}
			};

			this.pressureTestGraphViewState = ko.observable(true);
			this.initPressureTestViewState = function (currentState) {
				$('#verificationPressureTestViewState').bootstrapSwitch("state", currentState);
				$('#verificationPressureTestViewState').on('switchChange.bootstrapSwitch', function (event, state) {
					self.pressureTestGraphViewState(state);
				});
			}


			this.treeTable = null;

			this.verificationTestResultData = function () {
				layui.use(function () {
					self.treeTable = layui.treeTable;
					// 渲染
					var inst = self.treeTable.render({
						elem: '#verificationTestcaseTree',
						data: self.testcaseTreeData(), // 此处为静态模拟数据，实际使用时需换成真实接口
						tree: {
						},
						height: '601px',
						toolbar: '#TPL-treeTable-demo',
						cols: [[
							{ field: 'name', title: '', width: "55%", fixed: 'left' ,templet: function(d){
								if(d.existBigData && d.bigDataId){
									return "<span>" + d.name + "</span> <a class='layui-btn layui-btn-primary layui-btn-xs' lay-event='detail'>查看</a>";
								}
								else
									return "<span>" + d.name + "</span>";
							}},
							{ field: 'result', title: '结果', width: "10%", sort: true, templet: function(d) {
								if (d.result === 1) {
									return '<span style="color: green;">成功</span>';
								} else if (d.result === 0) {
									return '<span style="color: red;">失败</span>';
								} else if (d.result === -1) {
									return '<span style="color: orange;">获取数据中</span>';
								} else {
									return '<span>未知</span>';
								}
							}},
							{ field: 'executionTime', title: '时间', width: "15%" },
							{ field: 'errorMessage', title: '备注', width: "20%" },
						]],
						page: true,
					});
					self.treeTable.on('tool('+ inst.config.id +')', function (obj) {
						var layEvent = obj.event;
						var trData = obj.data;
						if (layEvent === "detail") {
							self.viewBigData(trData);
						} 
					  });
				});
			}


			this.detached = function () {
				self.deactive = true;
				self.breakWebSocket();
			};

			// The data-binding shall happen after DOM element be attached.
			this.attached = function (view, parent) {
				self.allVerificationDataTypeFalse();
				self.executionEnd(false);
				self.verificationTestResultData();
				self.commandCount(0);
				self.commandCountFailed(0);
				self.showGoBack(false);
				self.testResult([]);
				self.deactive = false;
				self.executionView();
				self.verificationDataResult([]);
				self.nameAndTime = ko.observable([]);
				self.executionDataMapping.clear();
				self.executeState(executionManager.notStarted);
				self.executionId = executionManager.getExecutionId();
				$('#protocolCompareModal').on('shown.bs.modal', function (e) {
					self.showProtocolCompare(e.relatedTarget.data.jsonLeft, e.relatedTarget.data.jsonRight);
				});
				$('#verificationHistoryResultModal').on('shown.bs.modal', function () {
					$.blockUI(utilityService.template);
					setTimeout(function () {
						$('#verificationHistoryDetailInfo').html('');
						self.initTable();
						$.unblockUI();
					}, 500);
				});

				// $('#inputVerificationModal').on('shown.bs.modal', function() {
				// 	self.initVerificationConfig(self.dummyVerification());
				// 	$('#inputVerificationForm').on('submit', function (e) {
				// 		  if (e.isDefaultPrevented()) {
				// 		    // handle the invalid form...
				// 		  } else {
				// 			  e.preventDefault();
				// 			  $('#inputVerificationModal').modal('hide');
				// 			  $('.modal-backdrop').remove();
				// 			  self.prepareExecution();
				// 		  }
				// 		});		
				// });
				// $('#inputVerificationModal').modal('show');
				self.prepareExecution();
				$('#verificationPressureTestSummaryModal').on('shown.bs.modal', function () {
					setTimeout(function () {
						$('#verificationPressureTestSummaryChart').html('');
						self.initPressureTestViewState(true);
						var dom = document.getElementById('verificationPressureTestSummaryChart');
						self.pressureTestSummaryChart = echarts.init(dom);
						self.pressureTestSummaryChart.showLoading({
							text: "数据正在努力加载..."
						});
						self.drawPressureTestSummaryChart(self.pressureTestSummaryData);
					}, 500);
				});
				$('#verificationPressureTestSummaryModal').on('hidden.bs.modal', function () {
					if (self.pressureTestSummaryChart) {
						self.pressureTestSummaryChart.clear();
						self.pressureTestSummaryChart.dispose();
					}
				});
			};
		}
		return new VerificationViewModel();
	});
