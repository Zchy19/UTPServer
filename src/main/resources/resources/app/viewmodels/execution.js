define(['jquery', 'durandal/app', 'komapping', 'services/executionManager', 'services/loginManager',
	'services/selectionManager', 'services/viewManager', 'services/systemConfig',
	'services/projectManager', 'services/protocolService', 'services/ursService', 'services/utpService',
	'services/cmdConvertService', 'services/notificationService',
	'services/utilityService', 'jsoneditor', 'blockUI', 'knockout', 'bootstrapSwitch', 'knockout-sortable',
	'knockstrap', 'datatables.net-js', 'datatables.net',
	'datatables.net-bs',
	'datatables.net-buttons',
	'datatables.net-buttons-html5',
	'datatables.net-buttons-flash',
	'datatables.net-buttons-print'
],
function($, app, komapping, executionManager, loginManager, selectionManager, viewManager, systemConfig,
	projectManager, protocolService, ursService, utpService, cmdConvertService, notificationService,
	utilityService, JSONEditor, blockUI,
	ko, bootstrapSwitch, sortable, knockstrap) {

	function ExecutionViewModel() {
		var self = this;
		this.selectionManager = selectionManager;
		this.viewManager = viewManager;
		this.systemConfig = systemConfig;
		this.pressureTestSummaryChart = null;
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
		this.executionEmail = ko.observable('');
		this.selectedProject = ko.observable();
		this.dummyExecution = ko.observable(false);
		this.sendEmail = ko.observable(false);
		this.testObject = ko.observable('');
		this.availableAgents = ko.observableArray([]);
		this.targetObjectCandidates = ko.observableArray([]);
		this.selectTargetObjectId = ko.observable();
		this.targetEngineCandidates = ko.observableArray([]);
		this.selectTargetEngineId = ko.observable();
		this.executionDataResult = ko.observableArray([]);
		this.testResult = ko.observableArray([]);
		this.isHistoryExecution = false;
		this.deactive = false;
		this.triggerStop = false;
		this.exceptionRecovers = ko.observableArray([]);
		this.selectedExceptionRecover = ko.observable();
		this.selectResultStep = null;
		this.isGoback = ko.observable(false);
		this.preExecutionStatusFetchingCount = 3;
		this.popoverTemplate = ko.observable('bitTablePopoverTemplate');
		this.showGoBack = ko.observable(false);
		this.commandCount = ko.observable(0);
		this.testcaseEndCount = ko.observable(0);
		this.commandCountFailed = ko.observable(0);
		this.testcaseEndCountFailed = ko.observable(0);
		this.saveData = ko.observable(1);
		this.initPage = function() {
			webix
				.ready(function() {
					webix
						.ui({
							container: "testResultInfo",
							id: "execution_accord",
							multi: true,
							view: "accordion",
							minHeight: 700,
							cols: [{
									id: "executionInfo_control",
									body: {
										view: "htmlform",
										content: "executionInfo",
									},
									minHeight: 700,
									minWidth: 600,
									scroll: false
								},
								{
									view: "resizer"
								},
								{
									header: "指标数据",
									id: "monitorInfo_control",
									body: {
										view: "htmlform",
										content: "monitorInfo",
									},
									width: 700,
									minWidth: 700,
									minHeight: 700,
									scroll: false
								}
							]
						});
				});
			self.viewManager.monitorresultActivePage('app/viewmodels/monitorresult');
		};

		this.getExceptionRecoversSuccessFunction = function(data) {
			self.exceptionRecovers.removeAll();
			if (data && data.status === 1) {
				var exceptionRecovers = data.result;
				if (exceptionRecovers && exceptionRecovers.length > 0) {
					for (var i = 0; i < exceptionRecovers.length; i++) {
						self.exceptionRecovers.push(exceptionRecovers[i]);
						if (exceptionRecovers[i].isDefault)
							self.selectedExceptionRecover(exceptionRecovers[i]);
					}
				}
			}
		};

		this.getExceptionRecoversErrorFunction = function() {
			self.exceptionRecovers.removeAll();
		};

		this.getExceptionRecovers = function() {
			utpService.getExceptionRecoverByProjectId(self.selectionManager.selectedProject().id,
				self.getExceptionRecoversSuccessFunction, self.getExceptionRecoversErrorFunction);
		};

		// return
		this.goback = function() {
			$('#dynamicTargetEngineModal').modal('hide');
			$('#inputExecutionNameModal').modal('hide');
			$('#dynamicAgentsModal').modal('hide');
			$('#dynamicTargetObjectsModal').modal('hide');
			$('.modal-backdrop').remove();
			self.isGoback(true);
			self.viewManager.testenvironmentActivePage('app/viewmodels/testenvironment');
		};

		// agent selection
		this.getSelectTargetObject = function() {
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
						if (antbotName == selectTargetObjectCandidate.candidateAgents[j].antbotName &&
							antbotType == selectTargetObjectCandidate.candidateAgents[j].antbotType) {
							agents.push(selectTargetObjectCandidate.candidateAgents[j]);
							break;
						}
					}
					initialTables.push({
						antbotName: antbotName,
						antbotType: antbotType,
						antbots: agents
					}); // add antbotType
				}

				availableAgents = selectTargetObjectCandidate.agentInfos;
				komapping.fromJS(initialTables, {}, self.tables);
				for (var i = 0; i < self.tables().length; i++)
					self.tables()[i].antbots.antbotType = self.tables()[i].antbotType();
				komapping.fromJS(availableAgents, {}, self.availableAgents);
			}
		};

		this.tables = ko.observableArray([]);
		this.availableAgents = ko.observableArray([]);
		this.maximumAgents = 1;

		this.isTableFull = function(parent) {
			return parent().length < self.maximumAgents;
		};

		this.antbotTypeMatch = function(param) {
			if (param.item.antbotType() != param.targetParent.antbotType)
				param.cancelDrop = true;
		};

		this.confirmTargetObject = function() {
			$('#dynamicTargetObjectsModal').modal('hide');
			self.getSelectTargetObject();
			$('#dynamicAgentsModal').modal('show');
		};

		this.targetObjectSelectionDone = ko.computed(function() {
			if (self.selectTargetObjectId() == "" || self.selectTargetObjectId() == undefined) {
				return false;
			}
			return true;
		});

		this.agentSelection = function(liveAntbotDictionarys, antbotsDefinedInScript) {
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
							if (!antbotsDefinedInScript[k].found && (agentInfos[j].antbotName ==
									antbotsDefinedInScript[k].antbotName && agentInfos[j].antbotType ===
									antbotsDefinedInScript[k].antbotType)) {
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
					targetObjectCandidate.conditionMeet = antbotsDefinedInScript.length == targetAgents
						.length
					targetObjectCandidates.push(targetObjectCandidate);
				}
			}
			return targetObjectCandidates;
		};

		// prepare execution
		this.prepareExecutionSuccessFunction = function(data) {
			if (data && data.status === 1) {
				self.triggerStop = true;
				self.preExecutionStatusFetchingCount = 3;
				setTimeout(
					function() {
						$.blockUI(utilityService.template);
						self.showGoBack(true);
						self.getPreExecutionStatus();
					}, 1000);
			} else {
				self.prepareExecutionErrorFunction(data.result);
			}
		};

		this.prepareExecutionErrorFunction = function(msg) {
			if (msg.indexOf("ExceedMaxExecutionCount") !== -1) {
				notificationService.showError('执行已超过每日最大次数限制,请安装相应许可');
			} else if (msg.indexOf("NoSubscriptExists") !== -1) {
				//将msg使用||分割
				var msgarray = msg.split("||")
				notificationService.showError("脚本(id:" + msgarray[1] + ")中含有不存在脚本,请检查脚本(id:" + msgarray[2] +
					")是否存在");
			} else if (msg.indexOf("ScriptCallLoop") !== -1) {
				//将msg使用||-分割，取最后一个值
				msg = msg.split("||-").pop();
				notificationService.showError("循环调用脚本,请检查脚本(id:" + msg + ")");
			} else {
				notificationService.showError('测试集准备失败。');
			}
			self.goback();
		};
		this.websocketExcutionresultAddress = ko.observable('');
		this.websocketExecutiondataAddress = ko.observable('');
		this.transformConfig = JSON.parse(JSON.stringify(cmdConvertService.transformConfig));
		this.getTransformConfigData = function(saveType) {
			const configData = {
				noEntrepotSave: [{
						"dataType": "executiondata",
						"transparentData": "NoEntrepotSaveDatabase"
					},
					{
						"dataType": "excutionresult",
						"transparentData": "NoEntrepotSaveDatabase"
					}
				],
				entrepotSave: [{
						"dataType": "executiondata",
						"transparentData": "entrepotSaveDatabase"
					},
					{
						"dataType": "excutionresult",
						"transparentData": "entrepotSaveDatabase"
					}
				],
				entrepotNoSave: [{
						"dataType": "executiondata",
						"transparentData": "entrepotNoSaveDatabase"
					},
					{
						"dataType": "excutionresult",
						"transparentData": "entrepotNoSaveDatabase"
					}
				]
			};
			return configData[saveType];
		}
		this.resultStepWebsocket = null;
		this.executionDataWebsocket = null;
		//定义一个值
		this.closeExecutionDataType = 0;
		this.openExecutionDataType = 0;
		this.executionInitialize = function() {
			self.initializeExecutionInfoVisible(true);
			self.executionInfoVisible(true);
			for (let i = 0; i < self.controlCmdInfoType.length; i++) {
				if (self.controlCmdInfoType[i] === "timeBasedValue") {
					self.initializeDataResultDataVisible(true);
					self.dataResultDataVisible(true);
					//变化曲线
					self.initGraphs();
				}
				if (self.controlCmdInfoType[i] === "currentValue") {
					self.initializeTestExecutionDataVisible(true);
					//当前值
					self.testExecutionDataVisible(true);
				}
				if (self.controlCmdInfoType[i] === "frameList") {
					//结构化消息
					self.initializeProtocolDataVisible(true);
					self.protocolDataVisible(true);
					self.initProtocolTable();
				}
				if (self.controlCmdInfoType[i] === "MONITOR_GROUP") {
					//监控组数据
					self.initializeMonitorGroupDataVisible(true);
					self.monitorGroupDataVisible(true);
					self.initWebsocketGroupFrameList(self.curControlCmdInfoArray);
				}
			}
		}
		this.resultStepWebsocket = null;
		this.executionDataWebsocket = null;
		this.executionDataConnectWebsocket = function() {
			let isConnected = false; // 添加一个标志来表示连接状态
			return new Promise((resolve, reject) => {
				self.executionDataWebsocket = new WebSocket(self.websocketExecutiondataAddress());
		
				// 定义WebSocket事件处理函数
				self.executionDataWebsocket.onopen = function(evt) {
					console.log("WebSocket executionData 连接已建立");
					// 根据类别加载图表
					self.executionInitialize();
					isConnected = true; // 连接成功时更新标志
					resolve(isConnected); // 使用resolve来解决Promise
				};
		
				self.executionDataWebsocket.onclose = function(evt) {
					const closeTime = new Date().toLocaleTimeString(); // 获取当前时间
					console.log(`WebSocket executionData 连接已关闭，状态码：${evt.code}，原因：${evt.reason}, 时间: ${closeTime}`);
					isConnected = false; // 连接关闭时更新标志
					if (self.executionEnd()) {
						self.pullData("数据拉取已完成 ");
					}
					reject(isConnected); // 使用reject来拒绝Promise
				};
		
				self.executionDataWebsocket.onmessage = function(evt) {
					let data = JSON.parse(evt.data);
					// console.log("收到消息: ", data); // 确保消息被正确打印
					if (data.uploadStatus == 0) {
						self.websocketFrameListData(data);
					} else if (data.uploadStatus == 1) {
						self.openExecutionDataType++;
					} else if (data.uploadStatus == 2) {
						self.pullData("数据拉取已完成 ");
						self.closeExecutionDataType++;
						if (self.closeExecutionDataType == self.openExecutionDataType) {
							self.executionDataWebsocket.close();
						}
					}
				};
		
				self.executionDataWebsocket.onerror = function(evt) {
					console.error("WebSocket executionData 发生错误：", evt);
					isConnected = false; // 连接失败时更新标志
					reject(isConnected); // 使用reject来拒绝Promise
				};
			});
		};

		this.messageQueue = []; // 消息队列
		this.testFlag = true;
		this.executionResultStepConnectWebsocket = function() {
			let isConnected = false;
			let isProcessing = false;

			async function processQueue() {
				if (!isConnected && self.messageQueue.length === 0) {
					return;
				}

				if (!isProcessing && self.messageQueue.length > 0) {
					isProcessing = true;
					let evt = self.messageQueue.shift();
					let data = JSON.parse(evt.data);
					let tempData = cmdConvertService.executionResultStepListWebsocket(data);
					if (executionManager.switchExecutionConfirmed()) {
						await self.getMidwayExecutionResult(tempData);
					} else {
						await self.getExecutionResultSuccessFunction(tempData);
					}
					await new Promise(resolve => setTimeout(resolve, 3));
					isProcessing = false;
				}
				requestAnimationFrame(processQueue);
			}

			return new Promise((resolve, reject) => {
				self.resultStepWebsocket = new WebSocket(self.websocketExcutionresultAddress());
				self.resultStepWebsocket.onopen = function(evt) {
					console.log("WebSocket executionResult 连接已建立");
					self.initializeExecutionInfoVisible(true);
					self.executionInfoVisible(true);
					isConnected = true;
					self.testFlag = true;
					self.messageQueue = [];
					isProcessing = false;
					resolve(isConnected);
					processQueue();
				};
				self.resultStepWebsocket.onclose = function(evt) {
					const closeTime = new Date().toLocaleTimeString(); // 获取当前时间
					console.log(`WebSocket executionResult 连接已关闭，状态码：${evt.code}，原因：${evt.reason}, 时间: ${closeTime}`);
					console.log("消息数组长度:" + self.messageQueue.length);
					self.messageQueue = [];
					isProcessing = false;
					isConnected = false;
					self.testFlag = false;
					self.pullData("数据拉取已完成 ");
					reject(isConnected);
					if(self.executeStateNotification() == '测试执行中...'){
						console.log("连接关闭，尝试重连...");
						setTimeout(() => self.executionResultStepConnectWebsocket(), 5000);
					}
				};
				self.resultStepWebsocket.onmessage = function(evt) {
					if (self.messageQueue.length < 500) {
						self.messageQueue.push(evt);
					}
				};
				self.resultStepWebsocket.onerror = function(evt) {
					isConnected = false;
					reject(isConnected);
				};
			});
		};
		this.excutionresultHandleWebSocketConnection = async function() {
			try {
				let protocol = window.location.protocol;
				let host = window.location.hostname;
				let port = window.location.port || (protocol === 'https:' ? '443' : '80');
				let pathname = window.location.pathname;
				let address = protocol + "//" + host + ":" + port + pathname;
				address = address.replace("http", "ws");
				var webAddress = address + "UtpClientWebSocket?key=" + self.executionId +
					"+excutionresult";
				let isConnected = await self.executionResultStepConnectWebsocket();
				if (!isConnected) {
					// 连接失败后尝试备用地址
					self.websocketExcutionresultAddress(webAddress);
					self.transformConfig[0].dataTypes = [];
					if (self.saveData() == 1) {
						self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotSave');
					} else {
						self.transformConfig[1].dataTypes = self.getTransformConfigData(
							'entrepotNoSave');
					}
					await self.executionResultStepConnectWebsocket();
				}
			} catch (error) {
				self.websocketExcutionresultAddress(webAddress);
				self.transformConfig[0].dataTypes = [];
				if (self.saveData() == 1) {
					self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotSave');
				} else {
					self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotNoSave');
				}
				await self.executionResultStepConnectWebsocket();
			}
		}
		this.excutionDataHandleWebSocketConnection = async function() {
			try {
				// 主连接失败的操作
				let protocol = window.location.protocol;
				let host = window.location.hostname;
				let port = window.location.port || (protocol === 'https:' ? '443' : '80');
				let pathname = window.location.pathname;
				let address = protocol + "//" + host + ":" + port + pathname;
				address = address.replace("http", "ws");
				var webAddress = address + "UtpClientWebSocket?key=" + self.executionId +
					"+executiondata";
				let isConnected = await self.executionDataConnectWebsocket();
				if (!isConnected) {
					// 连接失败后尝试备用地址
					self.websocketExecutiondataAddress(webAddress);
					self.transformConfig[0].dataTypes = [];
					if (self.saveData() == 1) {
						self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotSave');
					} else {
						self.transformConfig[1].dataTypes = self.getTransformConfigData(
							'entrepotNoSave');
					}
					await self.executionDataConnectWebsocket();
				}
			} catch (error) {
				self.websocketExecutiondataAddress(webAddress);
				self.transformConfig[0].dataTypes = [];
				if (self.saveData() == 1) {
					self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotSave');
				} else {
					self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotNoSave');
				}
				await self.executionDataConnectWebsocket();
			}
		}



		//创建一个scriptIds数组
		this.scriptIds = ko.observableArray([]);
		this.scripts = function() {
			//清空scriptIds数组
			self.curControlCmdInfoArray = [];
			self.controlCmdInfoType = [];
			self.scriptIds([]);
			utpService.getTestSetWithScriptIds(self.selectionManager.selectedProject().id, self
				.selectionManager.selectedNodeId(),
				function(data) {
					if (data != null && data.status === 1) {
						var scripts = data.result.scripts;
						for (var i = 0; i < scripts.length; i++) {
							self.scriptIds.push(scripts[i].id);
						}
						self.getScript();
					} else {
						notificationService.showError('获取测试集失败。');
					}
				})
		};

		this.getScript = async function() {
			if (self.scriptIds().length > 0) {
				// 遍历scriptIds数组
				const promises = self.scriptIds().map(scriptId => {
					return new Promise((resolve, reject) => {
						utpService.getFullScript(selectionManager.selectedProject().id,
							scriptId,
							function(data) {
								self.getScriptSuccessFunction(data);
								resolve();
							},
							function(error) {
								self.getScriptErrorFunction(error);
								reject(error);
							});
					});
				});

				// 等待所有脚本获取完成
				await Promise.all(promises);
				self.executionInitialize();
			}
		};
		this.curControlCmdInfoArray = [];
		this.currentScript = null;
		this.controlCmdInfoType = [];
		this.getScriptSuccessFunction = function(data) {
			if (data && data.status === 1 && data.result) {
				self.currentScript = data.result;
				if (self.currentScript.script != null && self.currentScript.script != '') {
					let tempControlCmdInfoTypes = cmdConvertService.commandDataAnalysis(self.currentScript
						.script);
					//将tempControlCmdInfoTypes数组中的元素添加到controlCmdInfoType数组中,controlCmdInfoType中已有的不添加
					for (let i = 0; i < tempControlCmdInfoTypes.length; i++) {
						let isExist = false;
						for (let j = 0; j < self.controlCmdInfoType.length; j++) {
							if (tempControlCmdInfoTypes[i] === self.controlCmdInfoType[j]) {
								isExist = true;
								break;
							}
						}
						if (!isExist) {
							self.controlCmdInfoType.push(tempControlCmdInfoTypes[i]);
						}
					}
					let tempCurControlCmdInfoArray = cmdConvertService.groupcommandDataAnalysis(self
						.currentScript.script);
					//将tempCurControlCmdInfoArray数组中的元素添加到curControlCmdInfoArray数组中,curControlCmdInfoArray中已有的不添加
					for (let i = 0; i < tempCurControlCmdInfoArray.length; i++) {
						let isExist = false;
						for (let j = 0; j < self.curControlCmdInfoArray.length; j++) {
							if (tempCurControlCmdInfoArray[i] === self.curControlCmdInfoArray[j]) {
								isExist = true;
								break;
							}
						}
						if (!isExist) {
							self.curControlCmdInfoArray.push(tempCurControlCmdInfoArray[i]);
						}
					}

				}
			} else
				self.getScriptErrorFunction();
		};



		this.getScriptErrorFunction = function() {
			notificationService.showError('获取脚本信息失败');
		};
		this.getEngineByEngineName = function() {
			ursService.getEngineByEngineName($.cookie("userName"), executionManager.selectedEngineName(),
				self.getEngineByEngineNameSuccessFunction, self.getEngineByEngineNameErrorFunction);
		}
		this.getEngineByEngineNameSuccessFunction = function(response) {
			if (response && response.result && response.engineStatus) {
				self.engineStatus = response.engineStatus;
				self.executionId = executionManager.selectedExecutionId;
				self.connectWebsocketExcution();
			} else {
				if (response.returnMessage) {
					notificationService.showError(response.returnMessage);
					self.goback();
				} else
					notificationService.showError("获取执行器地址失败");
			}
		};
		this.connectWebsocketExcution = async function() {
			self.transformConfig[0].dataTypes = self.getTransformConfigData('noEntrepotSave');
			if (self.saveData() == 1) {
				self.transformConfig[1].dataTypes = self.getTransformConfigData('noEntrepotSave');
			}
			self.websocketExcutionresultAddress("ws://" + self.engineStatus.websocketAddress + "?key=" +
				self.executionId + "+excutionresult");
			await self.excutionresultHandleWebSocketConnection();
			self.websocketExecutiondataAddress("ws://" + self.engineStatus.websocketAddress + "?key=" +
				self.executionId + "+executiondata");
			await self.excutionDataHandleWebSocketConnection();
		}
		this.prepareExecutionTestSet = async function(engineStatus) {
			self.lastResultId = 0;
			await self.connectWebsocketExcution();
			if (!self.sendEmail()) {
				self.executionEmail('');
			}
			var obj = {
				projectId: selectionManager.selectedProject().id,
				executionId: self.executionId,
				executionName: self.executionName(),
				executedByUserId: $.cookie("userName"),
				domainId: loginManager.getOrganization(),
				// testsetId : self.selectionManager.selectedNodeId(),
				scriptGroupId: self.selectionManager.selectedNodeId(),
				// isTeststepsPersistence:true,
				scriptIds: self.scriptIds(),
				utpCoreIpAddress: engineStatus.utpIpAddress,
				utpCorePort: engineStatus.utpPort,
				engineName: engineStatus.engineName,
				isDummyRun: self.dummyExecution(),
				emailAddress: self.executionEmail(),
				isSendEmail: self.sendEmail(),
				testObject: self.testObject(),
				isTestcaseCollect: true,
				isTestcasePersist: true,
				isTeststepCollect: true,
				isTeststepPersist: true,
				isTestdataCollect: true,
				isTestdataPersist: true,
				transformConfig: JSON.stringify(self.transformConfig),
				recoverSubscriptReferenceId: (self.selectedExceptionRecover() == undefined || self
						.selectedExceptionRecover() == null) ? 0 : self.selectedExceptionRecover()
					.id
			}
			if (self.scriptIds().length == 0) {
				notificationService.showError('请选择脚本');
				// $('#inputExecutionNameModal').modal('hide');
				// $('#dynamicAgentsModal').modal('hide');	
				// $('#dynamicTargetObjectsModal').modal('hide');
				// $('.modal-backdrop').remove();
				self.goback();
				return;
			}
			// utpService.prepareExecutionTestSetWithEmail(obj, self.prepareExecutionSuccessFunction, self.prepareExecutionErrorFunction);
			utpService.prepareExecutionScripts(obj, self.prepareExecutionSuccessFunction, self
				.prepareExecutionErrorFunction);
		};

		this.cancelTargetEngine = function() {
			// $('#dynamicTargetEngineModal').modal('hide');
			// $('.modal-backdrop').remove();
			self.goback();
		};

		this.confirmTargetEngine = function() {
			var selectTargetEngineStatus = null;
			for (var i = 0; i < self.targetEngineCandidates().length; i++) {
				if (self.targetEngineCandidates()[i].id === self.selectTargetEngineId()) {
					selectTargetEngineStatus = komapping.toJS(self.targetEngineCandidates()[i]);
					break;
				}
			}
			if (selectTargetEngineStatus) {
				$('#dynamicTargetEngineModal').modal('hide');
				$('.modal-backdrop').remove();
				self.engineStatus = selectTargetEngineStatus;
				self.prepareExecutionTestSet(selectTargetEngineStatus);

			} else
				notificationService.showWarn("请选择执行器");
		};

		// get engine address
		this.getEngineAddressSuccessFunction = function(response) {
			if (response && response.result && response.engineStatus) {
				// notificationService.showProgressSuccess('获取执行器地址成功。', 50);
				self.availableAgents([]);
				var selectedEngName = self.selectionManager.selectedEngineName();
				//判断selectedEngineName是否为空
				if (response.engineStatuses && response.engineStatuses.length > 1) {
					for (var i = 0; i < response.engineStatuses.length; i++) {
						if (response.engineStatuses[i].engineName == selectedEngName) {
							self.prepareExecutionTestSet(response.engineStatuses[i]);
							return;
						}
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
					$('#dynamicTargetEngineModal').modal('show');
				} else {
					// if (selectedEngName == response.engineStatus.engineName) {
					self.engineStatus = response.engineStatus;
					self.prepareExecutionTestSet(response.engineStatus);
					// } else {
					// 	notificationService.showError('执行器和选择的执行器不匹配,请重新选择');
					// 	self.goback();
					// }

				}
			} else {
				if (response.returnMessage) {
					notificationService.showError(response.returnMessage);
					self.goback();
				} else
					notificationService.showError("获取执行器地址失败");
			}
		};

		this.getEngineAddressErrorFunction = function() {
			notificationService.showError('获取执行器地址失败。');
			self.goback();
		};

		this.prepareExecution = function() {
			self.testResult([]);
			self.currentNode(0);
			self.currentStepNumber = 1;
			self.executionDataResult([]);
			// self.lineExecutionDataName([]);		
			protocolService.bigDataMapping.clear();
			self.executeState(executionManager.notStarted);
			self.executeStateNotification('');
			// notificationService.showProgressSuccess('探测可用的执行器实例...', 0);
			ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager
				.getAuthorizationKey(),
				self.getEngineAddressSuccessFunction, self.getEngineAddressErrorFunction);
		};

		this.canStartExecution = ko.computed(function() {
			for (var i = 0; i < self.tables().length; i++) {
				if (self.tables()[i].antbots().length === 0) {
					return false;
					break;
				}
			}
			return true;
		});

		this.refreshExecutionStatus = function() {
			if (self.triggerStop ||
				(self.executeState() == executionManager.exceptionHandling || self.executeState() ==
					executionManager.reconnectingNetwork ||
					self.executeState() == executionManager.throwException || self.executeState() ==
					executionManager.stopping || self.executeState() == executionManager.resuming ||
					self.executeState() == executionManager.pausing || self.executeState() ==
					executionManager.running || self.executeState() == executionManager.starting
				))
				self.getExecutionStatus();
		};
		this.antbotMatched = function(liveAntbotDictionarys, antbotsDefinedInScript) {
			self.targetObjectCandidates([]);
			self.selectTargetObjectId("");
			self.tables([]);

			if (self.dummyExecution()) {
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
				notificationService.showSuccess('脚本分析成功，探测到测试机器人.');
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
					// 	self.cancelExecution();
					// }
					if (self.canStartExecution()) {
						self.startExecution();
					} else {
						utpService.removeExecutionTestCaseResultByExecutionId(self.executionId, function(
							data) {
							if (data && data.status === 1) {
								$('#dynamicAgentsModal').modal('show');
								self.cancelAfterExecution();
							}
						}, function(error) {
							self.cancelAfterExecution();
						});
					}
				} else
					$('#dynamicTargetObjectsModal').modal('show');
			} else
				notificationService.showWarn('脚本分析成功，测试机器人不存在, 无法进行真实环境执行。', 100);
		};
		//执行后取消
		this.cancelAfterExecution = function() {
			var executionId = {
				executionId: self.executionId
			};
			utpService.cancelExecution(executionId, function(data) {
				if (data && data.status === 1 && data.result) {
					// notificationService.showError('机器人名称匹配失败,已取消验证');
					return
				} else {
					// $('#inputExecutionNameModal').modal('hide');
					// $('#dynamicAgentsModal').modal('hide');	
					// $('#dynamicTargetObjectsModal').modal('hide');
					// $('.modal-backdrop').remove();
					self.goback();
				}
			}, function(error) {
				// $('#inputExecutionNameModal').modal('hide');
				// $('#dynamicAgentsModal').modal('hide');	
				// $('#dynamicTargetObjectsModal').modal('hide');
				// $('.modal-backdrop').remove();
				self.goback();
			});
		};


		this.getPreExecutionStatusErrorFunction = function() {
			self.executeState(executionManager.throwException);
			self.preExecutionStatusFetchingCount--;
			if (self.preExecutionStatusFetchingCount > 0)
				self.getPreExecutionStatus();
			else {
				$.unblockUI();
				notificationService.showError('获取执行状态失败,如需继续尝试，请重新开始!');
			}
		};
		this.getAntbotname = function(agentsDefinedInScripts) {
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
		this.getPreExecutionStatus = function() {
			utpService.getExecutionModel(self.executionId,
				function(data) {
					if (data && data.status === 1) {
						var result = data.result;
						if (result.status != undefined) {
							if (self.executeState() != result.status) {
								if (result.status == executionManager.engineInitializing) {
									self.executeStateNotification('引擎初始化中...');
								} else if (result.status == executionManager.engineInitialized) {
									self.executeStateNotification('引擎初始化完成...');
								} else if (result.status == executionManager.engineConfiguring) {
									self.executeStateNotification('引擎配置中...');
								} else if (result.status == executionManager.engineConfigured) {
									self.executeStateNotification('引擎配置完成...');
								} else if (result.status == executionManager.analyzingScript) {
									self.executeStateNotification('脚本分析中...');
								} else if (result.status == executionManager.scriptAnalyzed) {
									self.executeStateNotification('脚本分析完成...');
								} else if (result.status == executionManager.waitingMatchAntbot) {
									if (!self.isStartExecution()) {
										self.executeStateNotification('测试机器人匹配中...');
										self.antbotMatched(result.liveAntbotDictionarys, result
											.antbotsDefinedInScript);
									} else {
										self.startExecution();
									}
								} else if (result.status == executionManager.engineInitError) {
									var errorMessage = "暂无可用执行器，请确认执行器是否登录或已有测试在执行中。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.utpCoreNetworkError) {
									var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.analyzeScriptError) {
									var errorMessage = "分析脚本错误, 脚本名称: " + result.analyzeScriptError
										.analyzeScriptFailedReason.scriptName + ",系统ID：" + result
										.analyzeScriptError.analyzeScriptFailedReason.scriptId +
										"，行号：" + result.analyzeScriptError.analyzeScriptFailedReason
										.errorline + "，错误信息：" + result.analyzeScriptError
										.analyzeScriptFailedReason.message;
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.unknownError) {
									var errorMessage = "未知错误。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.configureError) {
									var errorMessage = "引擎配置错误。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.AntbotNotFoundError) {
									var antbotNames = self.getAntbotname(result.antbotsDefinedInScript);
									var errorMessage = "测试执行器中没有找到对应的测试机器人(" + antbotNames + ")";
									notificationService.showError(errorMessage);
								}
							}
							if (result.status == executionManager.unknownError || result.status ==
								executionManager.configureError ||
								result.status == executionManager.AntbotNotFoundError || result
								.status == executionManager.analyzeScriptError ||
								result.status == executionManager.utpCoreNetworkError || result
								.status == executionManager.engineInitError || result.status ==
								executionManager.waitingMatchAntbot) {
								$.unblockUI();
								self.triggerStop = false;
							}
							if (result.status == executionManager.AntbotNotFoundError || result
								.status == executionManager.analyzeScriptError ||
								result.status == executionManager.utpCoreNetworkError || result
								.status == executionManager.engineInitError || result.status ==
								executionManager.unknownError ||
								result.status == executionManager.configureError) {
								self.goback();
								return;
							}
							self.executeState(result.status);
						}

						if (self.deactive) {
							//消除页面转圈圈
							$.unblockUI();
							return;
						}

						if (self.triggerStop)
							setTimeout(
								function() {
									self.getPreExecutionStatus();
								}, 1000);
					} else
						self.getPreExecutionStatusErrorFunction();
				},
				self.getPreExecutionStatusErrorFunction
			);
		};
		this.isTestClosure = ko.observable(false);
		this.getExecutionStatus = function() {
			utpService.getExecutionModel(self.executionId,
				function(data) {
					if (data && data.status === 1) {
						var result = data.result;
						self.commandCount(result.commandCount);
						self.commandCountFailed(result.commandCountFailed);
						self.testcaseEndCountFailed(result.testcaseEndCountFailed);
						self.testcaseEndCount(result.testcaseEndCount);
						if (result.status != undefined) {
							if (self.executeState() != result.status) {
								if (result.status == executionManager.starting) {
									self.executeStateNotification('测试启动中...');
								} else if (result.status == executionManager.running) {
									self.executeStateNotification('测试执行中...');
								} else if (result.status == executionManager.pausing) {
									self.executeStateNotification('测试暂停中...');
								} else if (result.status == executionManager.paused) {
									self.executeStateNotification('测试已暂停。');
									notificationService.showSuccess('测试已暂停。');
								} else if (result.status == executionManager.resuming) {
									self.executeStateNotification('测试重启中...');
								} else if (result.status == executionManager.stopping) {
									self.executeStateNotification('测试停止中...');
								} else if (result.status == executionManager.stopped) {
									self.executeStateNotification('测试已停止。');
									notificationService.showSuccess('测试已停止。');
								} else if (result.status == executionManager.completed) {
									self.executeStateNotification('测试已完成。');
									notificationService.showSuccess('测试已完成。');
								} else if (result.status == executionManager.exceptionHandling) {
									self.executeStateNotification('异常处理中...');
								} else if (result.status == executionManager.reconnectingNetwork) {
									self.executeStateNotification('网络重连中...');
								} else if (result.status == executionManager.terminated) {
									self.executeStateNotification('测试已终止。');
									notificationService.showSuccess('测试已终止。');
								} else if (result.status == executionManager.startExecutionError) {
									var errorMessage = "";
									for (var i = 0; i < result.startExecutionError.antbotFailedReasons
										.length; i++)
										errorMessage = errorMessage + "antbotName:" + result
										.startExecutionError.antbotFailedReasons[i].antbotName +
										", 失败原因:" + result.startExecutionError.antbotFailedReasons[i]
										.failedReason + "<br />"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.utpCoreNetworkError) {
									var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.unknownError) {
									var errorMessage = "未知错误。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.configureError) {
									var errorMessage = "引擎配置错误。"
									notificationService.showError(errorMessage);
								} else if (result.status == executionManager.AntbotNotFoundError) {
									var errorMessage = "测试机器人未找到。"
									notificationService.showError(errorMessage);
								}
							}

							if (result.status == executionManager.unknownError || result.status ==
								executionManager.configureError ||
								result.status == executionManager.AntbotNotFoundError || result
								.status == executionManager.startExecutionError ||
								result.status == executionManager.utpCoreNetworkError || result
								.status == executionManager.terminated ||
								result.status == executionManager.completed || result.status ==
								executionManager.stopped)
								self.triggerStop = false;
							if (result.status == executionManager.startExecutionError || result
								.status == executionManager.AntbotNotFoundError ||
								result.status == executionManager.utpCoreNetworkError || result
								.status == executionManager.unknownError ||
								result.status == executionManager.configureError) {
								self.goback();
								return;
							}
							self.executeState(result.status);
						}

						// self.getExecutionResult();
						// self.getIdMaxExecutionDataResult();
						self.getMonitorData();

						if (self.deactive) {
							//消除页面转圈圈
							$.unblockUI();
							return;
						}

						if (self.triggerStop ||
							(self.executeState() == executionManager.exceptionHandling || self
								.executeState() == executionManager.reconnectingNetwork ||
								self.executeState() == executionManager.stopping || self
							.executeState() == executionManager.resuming || self.executeState() ==
								executionManager.pausing ||
								self.executeState() == executionManager.running || self
							.executeState() == executionManager.starting
							))
							setTimeout(
								function() {
									self.getExecutionStatus();
								}, 1000);
					} else {
						self.executeState(executionManager.throwException);
						self.executeStateNotification('获取执行状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
						notificationService.showError('获取执行状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
					}
				},
				function() {
					self.executeState(executionManager.throwException);
					self.executeStateNotification('获取执行状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
					notificationService.showError('获取执行状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
				}
			);
		};
		this.engineStatus = null;
		this.breakWebSocket = function() {
			if (self.resultStepWebsocket) {
				self.resultStepWebsocket.close();
			}
			if (self.executionDataWebsocket) {
				self.executionDataWebsocket.close();
			}
		};
		this.startExecutionScript = async function() {
			self.breakWebSocket();
			self.lastResultId = 0;
			await self.connectWebsocketExcution();
			if (!self.sendEmail()) {
				self.executionEmail('');
			}
			var obj = {
				projectId: selectionManager.selectedProject().id,
				executionId: self.executionId,
				executionName: self.executionName(),
				executedByUserId: $.cookie("userName"),
				domainId: loginManager.getOrganization(),
				// testsetId : self.selectionManager.selectedNodeId(),
				scriptGroupId: self.selectionManager.selectedNodeId(),
				// isTeststepsPersistence:true,
				scriptIds: self.scriptIds(),
				utpCoreIpAddress: self.engineStatus.utpIpAddress,
				utpCorePort: self.engineStatus.utpPort,
				engineName: self.engineStatus.engineName,
				isDummyRun: self.dummyExecution(),
				emailAddress: self.executionEmail(),
				isSendEmail: self.sendEmail(),
				testObject: self.testObject(),
				isTestcaseCollect: true,
				isTestcasePersist: true,
				isTeststepCollect: true,
				isTeststepPersist: true,
				isTestdataCollect: true,
				isTestdataPersist: true,
				transformConfig: JSON.stringify(self.transformConfig),
				recoverSubscriptReferenceId: (self.selectedExceptionRecover() == undefined || self
						.selectedExceptionRecover() == null) ? 0 : self.selectedExceptionRecover()
					.id
			}
			utpService.prepareExecutionScripts(obj, self.startExecutionScriptSuccessFunction, self
				.prepareExecutionErrorFunction);
		};
		this.isStartExecution = ko.observable(false);
		this.startExecutionScriptSuccessFunction = function(data) {
			if (data && data.status === 1) {
				self.triggerStop = true;
				self.isStartExecution(true);
				self.executeState(executionManager.notStarted);
				self.preExecutionStatusFetchingCount = 3;
				setTimeout(
					function() {
						$.blockUI(utilityService.template);
						self.getPreExecutionStatus();
					}, 1000);
			} else {
				self.prepareExecutionErrorFunction(data.result);
			}
		};


		this.startExecution = function() {
			self.isStartExecution(false);
			$('#dynamicAgentsModal').modal('hide');
			self.isShowExecuteStatus(true);
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

			notificationService.showSuccess('启动执行...');
			utpService.startExecution(executionObj,
				function(data) {
					if (data && data.status === 1) {
						if (data.result) {
							self.lastResultId = 0;
							self.lastExecutionDataId = 0;
							// self.lastMonitorId = 0;
							self.pullData("正在拉取数据")
							self.resultRetrieveBegin = false;
							self.lastestCaseNode = null;
							self.subscriptBeginLastTestset = null;
							self.getExecutionStatus();
							notificationService.showSuccess('启动命令发送成功。');
						} else
							notificationService.showError('启动执行失败。');
					} else
						notificationService.showError('启动执行失败。');
				},
				function() {
					notificationService.showError('启动执行失败。');
				}
			);
		};

		this.canShowExecution = ko.computed(function() {
			return (self.executeState() != executionManager.notStarted && self.executeState() !=
				executionManager.starting);
		});

		this.canShowControlButton = ko.computed(function() {
			return (self.executeState() != executionManager.notStarted && self.executeState() !=
				executionManager.starting &&
				self.executeState() != executionManager.completed && self.executeState() !=
				executionManager.stopped &&
				self.executeState() != executionManager.terminated);
		});

		// pause execution
		this.canPause = ko.computed(function() {
			return (self.executeState() == executionManager.running || self.executeState() ==
				executionManager.resuming ||
				self.executeState() == executionManager.exceptionHandling || self.executeState() ==
				executionManager.reconnectingNetwork);
		});

		this.pauseExecution = function() {
			var executionId = {
				executionId: self.executionId
			};
			utpService.pauseExecution(executionId,
				function(data) {
					if (data && data.status === 1 && data.result)
						notificationService.showSuccess('暂停测试命令发送成功。');
					else
						notificationService.showError('暂停执行失败。');
				},
				function() {
					notificationService.showError('暂停执行失败。');
				}
			);
		};

		// resume execution
		this.canResume = ko.computed(function() {
			return (self.executeState() == executionManager.paused || self.executeState() ==
				executionManager.pausing);
		});

		this.resumeExecution = function() {
			var executionId = {
				executionId: self.executionId
			};
			utpService.resumeExecution(executionId,
				function(data) {
					if (data && data.status === 1 && data.result) {
						notificationService.showSuccess('重启测试命令发送成功。');
						self.getExecutionStatus();
					} else
						notificationService.showError('重启执行失败。');
				},
				function() {
					notificationService.showError('重启执行失败。');
				}
			);
		};

		// stop execution
		this.canStop = ko.computed(function() {
			console.log(self.executeState());
			return (self.executeState() == executionManager.pausing || self.executeState() ==
				executionManager.paused ||
				self.executeState() == executionManager.running || self.executeState() ==
				executionManager.resuming ||
				self.executeState() == executionManager.exceptionHandling || self.executeState() ==
				executionManager.reconnectingNetwork);
		});

		this.stopExecution = function() {
			var executionId = {
				executionId: self.executionId
			};
			utpService.stopExecution(executionId,
				function(data) {
					if (data && data.status === 1) {
						self.triggerStop = data.result;
						if (data.result) {
							notificationService.showSuccess('停止测试命令发送成功。');
							self.getExecutionStatus();
						} else
							notificationService.showError('停止执行失败。');
					} else
						notificationService.showError('停止执行失败。');
				},
				function() {
					notificationService.showError('停止执行失败。');
				}
			);
		};
		//折线图
		this.initGraphs = function() {
			$('#executionDataResultId').empty();
			var flex = {
				id: 'initGraphsExecutionDataCols',
				cols: []

			};
			webix.ui({
				container: "executionDataResultId",
				id: 'executionData',
				rows: [{
						body: flex,
						height: 400
					},
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


		this.initProtocolTable = function() {
			$('#protocolExecutionStepId').empty();
			var flex = {
				id: 'executionDataCols',
				cols: []

			};
			webix.ui({
				container: "protocolExecutionStepId",
				id: 'protocolExecutionStepData',
				rows: [{
						body: flex,
						height: 800
					},
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
		this.initializeTestExecutionDataVisible = ko.observable(false);
		this.initializeDataResultDataVisible = ko.observable(false);
		this.initializeProtocolDataVisible = ko.observable(false);
		this.initializeMessageDataVisible = ko.observable(false);
		this.initializeMonitorGroupDataVisible = ko.observable(false);
		this.initializeExecutionInfoVisible = ko.observable(false);
		this.allDataTypeFalse = function() {
			self.initializeTestExecutionDataVisible(false);
			self.initializeDataResultDataVisible(false);
			self.initializeProtocolDataVisible(false);
			self.initializeMessageDataVisible(false);
			self.initializeMonitorGroupDataVisible(false);
			self.initializeExecutionInfoVisible(false);
		}
		this.protocolDataVisible = ko.observable(true);
		this.executionInfoVisible = ko.observable(true);
		this.testExecutionDataVisible = ko.observable(true);
		this.dataResultDataVisible = ko.observable(true);
		this.messageDataVisible = ko.observable(true);
		this.monitorGroupDataVisible = ko.observable(true);
		this.messageDataView = function() {
			// if(self.messageDataVisible()){
			// 	return;
			// }
			self.messageDataVisible(true);
			self.executionInfoVisible(false);
			self.testExecutionDataVisible(false);
			self.dataResultDataVisible(false);
			self.protocolDataVisible(false);
			self.monitorGroupDataVisible(false);
			// if(self.lastExecutionDataId==0){
			// 	self.getIdMaxExecutionDataResult();
			// }
		}
		this.monitorGroupDataView = function() {
			self.monitorGroupDataVisible(true);
			self.messageDataVisible(false);
			self.executionInfoVisible(false);
			self.testExecutionDataVisible(false);
			self.dataResultDataVisible(false);
			self.protocolDataVisible(false);
		}
		this.executionDataView = function() {
			// if (self.testExecutionDataVisible()) {
			// 	return;
			// }
			self.monitorGroupDataVisible(false);
			self.messageDataVisible(false);
			self.executionInfoVisible(false);
			self.testExecutionDataVisible(true);
			self.dataResultDataVisible(false);
			self.protocolDataVisible(false);
			// if (self.lastExecutionDataId == 0) {
			// 	self.getIdMaxExecutionDataResult();
			// }
		}
		this.executionDataResultView = function() {
			// if(self.dataResultDataVisible()){
			// 	return;
			// }
			self.monitorGroupDataVisible(false);
			self.messageDataVisible(false);
			self.executionInfoVisible(false);
			self.testExecutionDataVisible(false);
			self.dataResultDataVisible(true);
			self.protocolDataVisible(false);
			// if(self.lastExecutionDataId==0){
			// 	self.getIdMaxExecutionDataResult();
			// }
			// var myChart = self.executionDataMapping.get("timeBasedValue");
			// if ((myChart == null || myChart == undefined)&&self.allWaveInfo().length > 0) {
			// 	self.initGraphs();
			// }
		}
		this.protocolExecutionStepView = function() {
			// if(self.protocolDataVisible()){
			// 	return;
			// }
			self.monitorGroupDataVisible(false);
			self.messageDataVisible(false);
			self.executionInfoVisible(false);
			self.testExecutionDataVisible(false);
			self.dataResultDataVisible(false);
			self.protocolDataVisible(true);
			// if(self.lastExecutionDataId==0){
			// 	self.getIdMaxExecutionDataResult();

			// }
			// var myChart = self.executionDataMapping.get("frameList");
			// if ((myChart == null || myChart == undefined)&&self.allFrameListInfo().length > 0) {
			// 	self.initProtocolTable();
			// }
		}
		this.executionStepsView = function() {
			self.monitorGroupDataVisible(false);
			self.executionInfoVisible(true);
			self.testExecutionDataVisible(false);
			self.protocolDataVisible(false);
			self.dataResultDataVisible(false);
			self.messageDataVisible(false);
		}
		this.executionView = function() {
			self.executionInfoVisible(self.initializeExecutionInfoVisible());
			self.testExecutionDataVisible(self.initializeTestExecutionDataVisible());
			self.protocolDataVisible(self.initializeProtocolDataVisible());
			self.dataResultDataVisible(self.initializeDataResultDataVisible());
			self.messageDataVisible(self.initializeMessageDataVisible());
			self.monitorGroupDataVisible(self.initializeMonitorGroupDataVisible());
		}
		this.initDiagramTemplate = function(data) {
			var dataResult = [{
					VarName: "",
					VarType: "timeBasedValue",
					data: {
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
		this.initDataTrendDiagram = function(dataResult) {
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
						margin: 10,
						padding: 10,
						type: "wide",
						view: "dataview",
						id: "executionFlexlayout",
						gravity: 3
					}
					$$("initGraphsExecutionDataCols").addView(dataview, 2);
				}
				var charts = null;
				if (dataResult.wave[i].VarType === 'timeBasedValue')
					charts = self.initMultiWave(dataResult.wave[i]);
			}
		};
		this.bgcStyle = function(x) {
			if (x % 2 == 0)
				return "#f4f4f4"
			return "#fff"
		}

		this.clearRepeatElement = function(elementId) {
			var clearRepeat = document.getElementById(elementId)
			if (clearRepeat)
				clearRepeat.parentNode.removeChild(clearRepeat);
			return
		}
		//初始化表格
		this.initFrameList = function(config) {
			var varName = config.VarName;
			var data = [];

			const myView = webix.$$(varName);
			if (myView) {
				self.clearRepeatElement(myView.$view.id);
			}
			var tableView = {
				view: "datatable",
				fixedRowHeight: false,
				id: varName,
				select: true,
				resizeColumn: true,
				height: 400,
				gravity: 2,
				columns: [{
						id: "executionMessage",
						header: "消息名称",
						fillspace: 2,
						template: function(obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj
								.message || "") + "</div>";
						}
					},
					{
						id: "executionDataSource",
						header: "机器人名称",
						fillspace: 2,
						// 排序报错,暂时关闭
						// sort: {
						// 	compare: function(a, b) {
						// 		// 自定义排序逻辑
						// 		return a.dataSource.localeCompare(b.dataSource);
						// 	}
						// },
						template: function(obj) {
							if (obj.dataSource == "engine") {
								obj.dataSource = " ";
							}
							return "<div style='text-align: center; width: 100%;'>" + (obj
								.dataSource || "") + "</div>";
						}
					},
					{
						id: "executionReceiveFrame",
						header: "方向",
						fillspace: 2,
						template: function(obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj
								.receiveFrame || "") + "</div>";
						}
					},
					{
						id: "executionTimestamp",
						header: "时间",
						fillspace: 2,
						template: function(obj) {
							return "<div style='text-align: center; width: 100%;'>" + (obj
								.timestamp || "") + "</div>";
						}
					},
					{
						id: "",
						header: "字段信息",
						fillspace: 2,
						template: function(item) {
							return "<div style='text-align: center; width: 100%;'><span class='webix_icon fas fa-search-plus fieldInfo' style='display: inline-block; vertical-align: middle; cursor: pointer;'></span></div>";
						}
					}
				],
				data: {
					data: data
				},
				onClick: {
					"fieldInfo": function(event, cell, target) {
						var item = $$(varName).getItem(cell);
						if (item == null)
							return;
						self.showExecutionGenericDetail(item);
					}
				}
			};
			$$("executionDataCols").addView(tableView, 0);
			self.executionDataMapping.set(varName, tableView);
			return tableView;
		};
		//新增
		this.showExecutionGenericDetail = function(item) {
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
			self.showFormatGenericDetail(item.protocolId, item.message, self.currentBigDataFrameConfig
				.fieldValues, item.fieldSizes);
		};

		this.disableExecutionGenericDetailInfo = function() {
			self.genericErrorFrameData(false);
			self.genericRawFrame("");
			$('#executionReportConfigView').html('');
		};

		this.executionDataMapping = new Map();
		this.initMultiWave = function(config) {
			var charts = [];
			var executionDataVarName = config.VarType;
			var p = document.createElement('div');
			p.setAttribute('id', executionDataVarName + '_chart');
			var bgColor = self.bgcStyle(config.id)
			p.setAttribute('style',
				'width: 100%; height: 400px; border: 1px solid #e3e3e3; float: left;padding-top: 30px;background-color: ' +
				bgColor);
			$$("executionFlexlayout").getNode().append(p);
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
					link: [{
						xAxisIndex: 'all'
					}]
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
		this.setFrameData = function(config, clear) {
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
						frameListView.remove(frameListView.getLastId()); //getLastId
					}
				}
				frameListView.refresh();
			}
		};

		this.setMultipleSeriesData = function(config, clear) {
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
			option.xAxis[0].name = config.data.xAxisUnit != null && config.data.xAxisUnit.length > 0 ? "(" +
				config.data.xAxisUnit + ")" : 'x';
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
					dataZoom: [{
						show: true,
						realtime: true,
						startValue: 0,
						endValue: 30,
					}],
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

		this.getProtocolSuccessFunction = function(data) {
			if (data && data.status === 1 && data.result)
				protocolService.addProtocol(data.result);
			else
				self.getProtocolErrorFunction();
		};

		this.getProtocolErrorFunction = function() {
			//notificationService.showError('获取数据失败。');
		};

		this.getProtocol = function(protocolId) {
			var protocol = protocolService.getProtocol(protocolId);
			if (protocol === null || protocol == undefined)
				utpService.getProtocol(protocolId, self.getProtocolSuccessFunction, self
					.getProtocolErrorFunction);
		};
		this.downloadReport = function(config) {
			var csvContent = "data:text/csv;charset=utf-8,";
			config.forEach(function(group) {
				csvContent += "监控数据组:" + group.monitorGroupName + "\n";
				csvContent += "序号," + group.monitorGroupData.join(",") + ",时间\n";
				var frameListView = $$("eTableDataId" + group.monitorGroupName);
				if (frameListView) {
					frameListView.data.each(function(item) {
						var row = item["序号"] + ",";
						group.monitorGroupData.forEach(function(signal) {
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
		//数据config [{monitorGroupName: t,monitorGroupData: [12,32]},monitorGroupName: y,monitorGroupData: [55,32]}]
		this.initWebsocketGroupFrameList = function(config) {
			var container = document.getElementById("tableDataId");
			container.innerHTML = ""; // 清空容器内容

			// 添加下载按钮
			var buttonContainer = document.createElement("div");
			buttonContainer.style.textAlign = "right"; // 使按钮容器居右显示
			buttonContainer.style.marginBottom = "20px"; // 添加下边距

			//下载全部报表,暂时关闭,需要时打开即可
			// var downloadButton = document.createElement("button");
			// downloadButton.className = "btn btn-success btn-sm"; // 添加按钮样式
			// downloadButton.innerText = "下载全部报表";
			// downloadButton.onclick = function () {
			// 	self.downloadReport(config);
			// };

			// buttonContainer.appendChild(downloadButton);
			container.appendChild(buttonContainer);

			config.forEach(function(group, groupIndex) {
				// 创建一个新的 div 作为表单容器
				var formContainer = document.createElement("div");
				formContainer.id = "tableDataId" + group.monitorGroupName;
				formContainer.style.marginBottom = "60px"; // 添加表单间距

				// 创建标题元素
				var title = document.createElement("h3");
				title.innerText = "监控数据组:" + group.monitorGroupName;
				title.style.textAlign = "center"; // 标题居中显示
				// title.style.marginTop = "20px";
				formContainer.appendChild(title);

				container.appendChild(formContainer);

				// 根据 monitorGroupData 动态生成列
				var columns = [{
					id: "index", // 序号列
					header: {
						text: "序号",
						css: {
							'text-align': 'center'
						}
					},
					fillspace: 1,
					template: function(obj) {
						return obj["序号"] || ""; // 显示时间数据
					},
					css: {
						'text-align': 'center'
					}
				}].concat(group.monitorGroupData.map(function(signal, signalIndex) {
					return {
						id: signalIndex, // 为每个列分配一个唯一的id
						header: {
							text: signal,
							css: {
								'text-align': 'center'
							}
						}, // 使用信号作为列头，并居中显示
						fillspace: 1, // 让每一列填充相等的空间
						template: function(obj) {
							return obj[signal] || ""; // 显示对应信号的数据
						},
						css: {
							'text-align': 'center'
						} // 使行数据居中显示
					};
				})).concat([{
					id: "time", // 时间列
					header: {
						text: "时间",
						css: {
							'text-align': 'center'
						}
					},
					fillspace: 1,
					template: function(obj) {
						return obj["时间"] || ""; // 显示时间数据
					},
					css: {
						'text-align': 'center'
					}
				}]);

				// 配置 datatable
				var grid = {
					view: "datatable",
					container: formContainer.id, // 使用动态生成的容器ID
					id: "eTableDataId" + group.monitorGroupName, // 每个表单有唯一的ID
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
		this.setTableData = function(config) {
			if (config != null && config.length > 0) {
				config.forEach(function(group, groupIndex) {
					var frameListView = $$("eTableDataId" + group.monitorGroupName);
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
							downloadButton.onclick = function() {
								self.downloadTableData(group.monitorGroupName, frameListView);
							};
							frameListView.$view.parentNode.insertBefore(downloadButton,
								frameListView.$view);
						}
					}
				});
			}
		};

		this.downloadTableData = function(monitorGroupName, frameListView) {
			var csvContent = "\uFEFF"; // 添加 BOM
			csvContent += "监控数据组:" + monitorGroupName + "\n";
			csvContent += "序号," + frameListView.config.columns
				.filter(col => col.header[0].text !== "序号" && col.header[0].text !== "时间")
				.map(col => col.header[0].text).join(",") + ",时间\n";
			frameListView.data.each(function(item) {
				var row = item["序号"] + ",";
				frameListView.config.columns.forEach(function(col) {
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
		//使用webscokcet处理结构化数据
		this.websocketFrameListData = function(data) {
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
				// //循环
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
					var rawCommuDataListNode = komapping.fromJS(tempgeneralData, {
						'observe': ["result"]
					});
					self.generalData.push(rawCommuDataListNode);
					if (self.generalData().length > 1000) {
						self.generalData.shift();
					}
				});
			}

			function processFrameList() {
				var temp = {
					varType: data.dataType,
					varName: data.dataType
				};
				self.executionDataArr = {
					frameList: [],
					wave: []
				};
				var tempData = self.initDiagramTemplate(temp);
				self.executionDataArr.frameList.push(tempData);
				var index = self.executionDataArr.frameList.findIndex(md => md.varName === tempData
				.VarName);
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
					var temp = {
						varType: frameListInfo.VarType,
						varName: frameListInfo.VarName
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
					if (result.varType == "IndividualChange" || result.varType == "OverallChange") {
						processMonitorGroup(result);
					} else if (result.varType == "currentValue") {
						var lastValue = result.varValue;
						var dataResultObject = {
							varName: varName,
							varValue: lastValue
						};
						var node = komapping.fromJS(dataResultObject, {
							'observe': ["result"]
						});
						var isExist = false;
						for (var j = 0; j < self.executionDataResult().length; j++) {
							if (self.executionDataResult()[j].varName == varName) {
								self.executionDataResult.splice(j, 1, node);
								isExist = true;
								break;
							}
						}
						if (!isExist) {
							self.executionDataResult.push(node);
						}
					} else if (result.varType == "timeBasedValue") {
						var isWaveFirst = false;
						var varValues = result.varValues;
						var temp = {
							varType: result.varType,
							varName: varName
						};
						self.executionDataArr = {
							frameList: [],
							wave: []
						};
						var tempData = self.initDiagramTemplate(temp);
						self.executionDataArr.wave.push(tempData);
						var index = self.executionDataArr.wave.findIndex(md => md
							.validatorarName === tempData.VarName);
						if (index == -1) index = 0;

						var waveData = self.executionDataArr.wave[index];
						varValues.forEach(value => {
							var x = value[0];
							var y = Number(value[1]);
							var tempArr = [];
							var isExist = false;
							if (self.nameAndTime().length == 0) {
								self.nameAndTime().push({
									name: varName,
									time: x
								});
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
									self.nameAndTime().push({
										name: varName,
										time: x
									});
									tempArr.push(x, y);
									waveData.data.data.push(tempArr);
								}
							}
						});

						if (self.isLoadLineExecutionData()) {
							var temp = {
								varType: waveData.VarType,
								varName: waveData.VarName
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






		//定义数组存放rawCommuDataList数据
		this.generalData = ko.observableArray([]);
		//定义数组存放实时表数据
		this.allFrameListInfo = ko.observableArray([]);
		this.allWaveInfo = ko.observableArray([]);
		//定义是否加载折线图
		this.isLoadLineExecutionData = ko.observable(false);
		this.isFrameListData = ko.observable(false);
		//定义一个数组,记录name和时间和
		this.nameAndTime = ko.observableArray([]);
		this.listExecutionDataResultSuccessFunction = function(data) {
			if (data && data.status === 1 && data.result) {
				var results = data.result;
				var listExecutionDataResultId = self.lastExecutionDataId;
				if (listExecutionDataResultId == 0) {
					self.executionDataResult.removeAll();
					self.allFrameListInfo.removeAll();
					self.generalData.removeAll();
					self.allWaveInfo.removeAll();
				}

				var isFrameListFirst = false;
				var isWaveFirst = false;
				if (results.length > 0 && results[results.length - 1].id > listExecutionDataResultId)
					self.lastExecutionDataId = results[results.length - 1].id;
				for (var i = 0; i < results.length; i++) {
					if (results[i].uploadStatus == 1) {
						self.openExecutionDataType++;
					} else if (results[i].uploadStatus == 2) {
						self.closeExecutionDataType++;
					}
					if (results[i].id <= listExecutionDataResultId || results[i].uploadStatus == 1 ||
						results[i].uploadStatus == 2)
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
							var rawCommuDataListMapping = {
								'observe': ["result"]
							};
							var rawCommuDataListNode = komapping.fromJS(tempgeneralData,
								rawCommuDataListMapping);
							self.generalData.push(rawCommuDataListNode);
							if (self.generalData().length > 1000) {
								//删除大于1000的数据
								self.generalData.shift();
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
						index = self.executionDataArr.frameList.findIndex(md => md.varName === tempData
							.VarName)
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
								var mapping = {
									'observe': ["result"]
								};
								var node = komapping.fromJS(dataResultObject, mapping);
								//是否存在
								var isExist = false;
								for (var j = 0; j < self.executionDataResult().length; j++) {
									if (self.executionDataResult()[j].varName == varName) {
										//删除原来的对象
										// self.executionDataResult.splice(j, 1);
										self.executionDataResult.splice(j, 1, node);
										isExist = true;
										break;
									}
								}
								if (!isExist) {
									self.executionDataResult.push(node);
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
								index = self.executionDataArr.wave.findIndex(md => md.validatorarName ===
									tempData.VarName)
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
					if (self.allWaveInfo().length > 10) {
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
					if (self.allFrameListInfo().length > 10) {
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
				if (self.closeExecutionDataType == self.openExecutionDataType) {
					self.pullData("数据拉取已完成 ");
				} else if (!self.isGoback() && ((results.length == 0 && !self.executionEnd()) || self
						.closeExecutionDataType != self.openExecutionDataType)) {
					self.pullData("数据拉取中。。。");
					setTimeout(
						function() {
							self.getIdMaxExecutionDataResult();
						}, 1000);
				}
			}
		};



		this.testcaseTreeAsyncData = ko.observableArray([]);
		this.testcaseTreeAsyncDataFunction = function(data) {
			self.testcaseTreeAsyncData.removeAll();
			if (data && data.status === 1 && data.result) {
				var resultItems = data.result;
				for (var i = 0; i < resultItems.length; i++) {
					var data = resultItems[i];
					if (data.commandType == cmdConvertService.commandType.subscriptBegin) {
						var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
						var testcase = new Object();
						testcase.name = step.stepName;
						testcase.id = data.indexId;
						testcase.parentId = data.parentId;
						testcase.agentName = "";
						testcase.result = -1;
						testcase.children = [];
						testcase.isParent = true;
						testcase.errorMessage = data.errorMessage;
						if (step.stepType == "subScript") {
							testcase.icon = 'webix_fmanager_icon fm-file-text';
							testcase.name = step.stepName;
						} else if (step.stepType == "script") {
							testcase.icon = 'webix_fmanager_icon fm-file';
							testcase.name = step.stepName;
						}
						testcase.executionTime = data.executionTime;
						self.lastestCaseNode = testcase;
						self.testcaseTreeAsyncData.push(testcase);
					} else if (data.commandType == cmdConvertService.commandType.subscriptEnd) {
						//在testcaseTreeAsyncData里根据indexId找到,并修改testcaseTreeAsyncData中的数据
						var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
						var testcase = new Object();
						if (step.stepType == "subScript") {
							testcase.icon = 'webix_fmanager_icon fm-file-text';
							testcase.name = step.stepName;
						} else if (step.stepType == "script") {
							testcase.icon = 'webix_fmanager_icon fm-file';
							testcase.name = step.stepName;
						}
						for (var j = 0; j < self.testcaseTreeAsyncData().length; j++) {
							if (self.testcaseTreeAsyncData()[j].id == data.indexId) {
								self.testcaseTreeAsyncData()[j].result = data.result;
								self.testcaseTreeAsyncData()[j].name = testcase.name;
								self.testcaseTreeAsyncData()[j].errorMessage = data.errorMessage;
								self.testcaseTreeAsyncData()[j].executionTime = self
								.testcaseTreeAsyncData()[j].executionTime + " - " + data.executionTime;
								break;
							}
						}
					} else if (data.commandType == cmdConvertService.commandType.executionCommand) {
						var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
						var testcase = new Object();
						testcase.name = step.stepName;
						testcase.result = data.result;
						testcase.children = [];
						testcase.errorMessage = data.errorMessage;
						testcase.executionTime = data.executionTime;
						testcase.id = data.indexId;
						testcase.existBigData = step.existBigData;
						testcase.bigDataId = step.bigDataId;

						if (data.antbotName == "__SYSDEV__" || data.antbotName == "__EXTDEV__") {
							testcase.agentName = "";
						} else {
							testcase.agentName = data.antbotName;
							testcase.name = "[" + data.antbotName + "]  " + step.stepName;
						}
						if (testcase.existBigData && testcase.bigDataId)
							self.getJsonStorageData(testcase);
						self.testcaseTreeAsyncData.push(testcase);
					}

				}
				// self.treeTable.reloadAsyncNode('testcaseTree', 0); 

			} else
				self.getExecutionResultErrorFunction();
		};




		// this.testcaseTreeData=ko.observableArray([]);
		this.currentStepNumber = 1;
		// get execution result
		this.subscriptBeginLastTestset = null;
		this.currentNode = ko.observable(0);
		this.executionEnd = ko.observable(false);
		this.getExecutionResultSuccessFunction = async function(data) {
			if (data && data.status === 1 && data.result) {
				var resultItems = data.result;
				if (self.isHistoryExecution) {
					var currentLastResultId = self.lastResultId;
					if (resultItems.length > 0 && resultItems[resultItems.length - 1].resultId > self
						.lastResultId)
						self.lastResultId = resultItems[resultItems.length - 1].resultId;
				}

				var updateNodes = function(index) {
					if (index >= resultItems.length) {
						self.resultRetrieveBegin = false;
						if ((!self.isGoback() && (resultItems.length >= 100 || !self
							.executionEnd())) && executionManager.newExecutionFlag() &&
							!(self.executeState() == executionManager.unknownError || self
								.executeState() == executionManager.configureError ||
								self.executeState() == executionManager.AntbotNotFoundError || self
								.executeState() == executionManager.startExecutionError ||
								self.executeState() == executionManager.utpCoreNetworkError || self
								.executeState() == executionManager.terminated ||
								self.executeState() == executionManager.completed || self
								.executeState() == executionManager.stopped)) {
							self.pullData("拉取数据中。。。");
							// self.getExecutionResult();
						} else if (resultItems.length < 100 && self.executionEnd()) {
							self.pullData("数据拉取已完成");
						}
						return;
					}

					var data = resultItems[index];
					if (self.isHistoryExecution) {
						if (data.id <= currentLastResultId) {
							requestAnimationFrame(() => updateNodes(index + 1));
							return;
						}
					}

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

				var handleSubscriptBegin = function(data) {
					if (data.parentId == "-1") {
						var step = cmdConvertService.getcmdUserLanguage(data.command, data
							.antbotName);
						var testcase = {
							name: step.stepName,
							id: data.indexId,
							parentId: data.parentId,
							agentName: "",
							result: -1,
							errorMessage: data.errorMessage,
							isParent: true,
							icon: step.stepType == "subScript" ?
								'webix_fmanager_icon fm-file-text' :
								'webix_fmanager_icon fm-file',
							executionTime: data.executionTime
						};
						var node = self.treeTable.addNodes("testcaseTree", {
							parentIndex: 0,
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
						let obj = self.treeTable.getNodeById('testcaseTree', currentMysqlParentId);
						if (obj) {
							var step = cmdConvertService.getcmdUserLanguage(data.command, data
								.antbotName);
							var testcase = {
								name: step.stepName,
								id: data.indexId,
								parentId: data.parentId,
								agentName: "",
								result: -1,
								errorMessage: data.errorMessage,
								isParent: true,
								icon: step.stepType == "subScript" ?
									'webix_fmanager_icon fm-file-text' :
									'webix_fmanager_icon fm-file',
								executionTime: data.executionTime
							};
							var node = self.treeTable.addNodes("testcaseTree", {
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
										self.treeTable.updateNode('testcaseTree', last, {
											result: 2
										});
										self.treeTable.expandNode('testcaseTree', {
											index: last,
											expandFlag: false
										});
										lastArr.pop();
									}
									let lastStr = lastArr.join("-");
									self.currentNode(lastStr);
								}
							}
							// 更新父节点下所有子节点的 result 值为 -1 的为 2
							var parentNode = self.treeTable.getNodeDataByIndex('testcaseTree', self
								.currentNode());
							if (parentNode && parentNode.children) {
								parentNode.children.forEach(child => {
									if (child.result === -1) {
										self.treeTable.updateNode('testcaseTree', child
											.LAY_DATA_INDEX, {
												result: 2
											});
									}
								});
							}

						}

					}
				};


				var handleSubscriptEnd = function(data) {
					var obj = self.treeTable.getNodeById('testcaseTree', data.indexId);
					if (obj) {
						var step = cmdConvertService.getcmdUserLanguage(data.command, data
							.antbotName);
						self.treeTable.updateNode('testcaseTree', self.currentNode(), {
							executionTime: self.lastestCaseNode.executionTime + " - " + data
								.executionTime,
							result: data.result,
							errorMessage: data.errorMessage
						});
						var currentData = self.treeTable.getNodeDataByIndex('testcaseTree', self
							.currentNode());
						self.treeTable.expandNode('testcaseTree', {
							index: self.currentNode(),
							expandFlag: false
						});
						self.currentNode(currentData.LAY_PARENT_INDEX);
					}
				};

				var handleExecutionCommand = function(data) {
					if (data.parentId != "-1" && self.subscriptBeginLastTestset != null) {
						let currentMysqlParentId = data.parentId;
						let obj = self.treeTable.getNodeById('testcaseTree', currentMysqlParentId);
						if (obj) {
							self.currentNode(obj.data.LAY_DATA_INDEX);
							var step = cmdConvertService.getcmdUserLanguage(data.command, data
								.antbotName);
							var testcase = {
								name: step.stepName,
								result: data.result,
								errorMessage: data.errorMessage,
								executionTime: data.executionTime,
								id: data.indexId,
								existBigData: step.existBigData,
								bigDataId: step.bigDataId,
								parentId: data.parentId,
								agentName: data.antbotName == "__SYSDEV__" || data.antbotName ==
									"__EXTDEV__" ? "" : data.antbotName,
								name: data.antbotName == "__SYSDEV__" || data.antbotName ==
									"__EXTDEV__" ? step.stepName : "[" + data.antbotName +
									"]  " + step.stepName
							};
							if (testcase.existBigData && testcase.bigDataId)
								self.getJsonStorageData(testcase);
							var node = self.treeTable.addNodes("testcaseTree", {
								parentIndex: self.currentNode(),
								index: -1,
								data: testcase
							});

							var parentNode = self.treeTable.getNodeDataByIndex('testcaseTree', self
								.currentNode());
							if (parentNode.children && parentNode.children.length > 50) {
								var excessNodes = parentNode.children.length - 50;
								for (var i = 0; i < excessNodes; i++) {
									self.treeTable.removeNode('testcaseTree', parentNode.children[i]
										.LAY_DATA_INDEX);
								}
							}
						}

					}
				};

				var checkAndUpdateResult = function(nodeIndex) {
					var nodeData = self.treeTable.getNodeDataByIndex('testcaseTree', nodeIndex);
					if (nodeData && nodeData.result == 2) {
						var currentNodeIndex = nodeIndex;
						while (currentNodeIndex) {
							self.treeTable.updateNode('testcaseTree', currentNodeIndex, {
								result: 2
							});
							var currentNodeData = self.treeTable.getNodeDataByIndex('testcaseTree',
								currentNodeIndex);
							currentNodeIndex = currentNodeData ? currentNodeData.LAY_PARENT_INDEX :
								null;
						}
					}
				};
				var handleExecutionEnd = function() {
					if (self.subscriptBeginLastTestset != null && self.subscriptBeginLastTestset
						.result == -1) {
						let lastIndexId = self.subscriptBeginLastTestset.LAY_DATA_INDEX;
						//修改当前节点的result值为2
						self.treeTable.updateNode('testcaseTree', lastIndexId, {
							result: 2
						});
						checkAndUpdateResult(lastIndexId);

					}
				}

				requestAnimationFrame(() => updateNodes(0));
			} else {
				self.getExecutionResultErrorFunction();
			}
		};



		// this.currentStepNumber = 0;
		// get execution result
		this.getMidwayExecutionResult = async function(data) {
			if (data && data.status === 1 && data.result) {
				var resultItems = data.result;
				// var currentLastResultId = self.lastResultId;
				// if(resultItems.length > 0 && resultItems[resultItems.length - 1].resultId > self.lastResultId)
				// 	self.lastResultId = resultItems[resultItems.length - 1].resultId;
				self.executionEnd(false);
				for (var i = 0; i < resultItems.length; i++) {
					// skip intermediate result call						
					var data = resultItems[i];
					// if(data.id <= currentLastResultId)
					// 	continue;						

					if (data.commandType == cmdConvertService.commandType.executionEnd) {
						self.executionEnd(true);
					} else if (data.commandType == cmdConvertService.commandType.testCaseBegin) {
						self.currentStepNumber = 1;
						var testcase = new Object();
						testcase.type = "testcase";
						testcase.step = data.command;
						testcase.agentName = "";
						testcase.result = -1;
						testcase.errorMessage = data.errorMessage;
						testcase.executionTime = data.executionTime;
						testcase.stepNumber = "测试用例";
						var mapping = {
							'observe': ["result"]
						};
						var node = komapping.fromJS(testcase, mapping);
						self.testResult.push(node);
						self.lastestCaseNode = node;
					} else if (data.commandType == cmdConvertService.commandType.checkPointBegin || data
						.commandType == cmdConvertService.commandType.checkPointEnd) {
						var testcase = new Object();
						testcase.type = "checkpoint";
						testcase.step = data.commandType == cmdConvertService.commandType
							.checkPointBegin ? " 开始" : " 结束";
						testcase.agentName = "";
						testcase.result = data.result;
						testcase.errorMessage = data.errorMessage;
						testcase.executionTime = data.executionTime;
						testcase.stepNumber = "检查点：" + data.command;
						var mapping = {
							'observe': ["result"]
						};
						var node = komapping.fromJS(testcase, mapping);
						self.testResult.push(node);
					} else if (data.commandType == cmdConvertService.commandType.testCaseEnd) {
						if (self.lastestCaseNode != null) {
							self.lastestCaseNode.result = data.result;
							self.lastestCaseNode.errorMessage = data.errorMessage;
							self.lastestCaseNode.executionTime = self.lastestCaseNode.executionTime +
								" - " + data.executionTime;
						}
					} else if (data.commandType == cmdConvertService.commandType.exceptionBegin) {
						self.currentStepNumber = 1;
						var testcase = new Object();
						testcase.type = "testcase";
						testcase.step = data.command;
						testcase.agentName = "";
						testcase.result = -1;
						testcase.errorMessage = data.errorMessage;
						testcase.executionTime = data.executionTime;
						testcase.stepNumber = "异常恢复";
						var mapping = {
							'observe': ["result"]
						};
						var node = komapping.fromJS(testcase, mapping);
						self.testResult.push(node);
						self.lastestCaseNode = node;
					} else if (data.commandType == cmdConvertService.commandType.exceptionEnd) {
						if (self.lastestCaseNode) {
							self.lastestCaseNode.result(data.result);
							self.lastestCaseNode.errorMessage = data.errorMessage;
							self.lastestCaseNode.executionTime = self.lastestCaseNode.executionTime +
								" - " + data.executionTime;
						}
					} else if (data.commandType == cmdConvertService.commandType.executionCommand) {
						var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
						var testcase = new Object();
						testcase.type = "command";
						testcase.step = step.stepName;
						testcase.existBigData = step.existBigData;
						testcase.bigDataId = step.bigDataId;
						testcase.result = data.result;
						testcase.errorMessage = data.errorMessage;
						testcase.executionTime = data.executionTime;
						testcase.stepNumber = self.currentStepNumber++;

						if (data.antbotName == "__SYSDEV__" || data.antbotName == "__EXTDEV__")
							testcase.agentName = "";
						else
							testcase.agentName = data.antbotName;

						var mapping = {
							'observe': ["result"]
						};
						var node = komapping.fromJS(testcase, mapping);
						if (testcase.existBigData && testcase.bigDataId)
							self.getJsonStorageData(testcase);
						self.testResult.push(node);
					}
					if (self.testResult().length > cmdConvertService.maxReuslt)
						self.testResult.shift();
					$('#executionSteps').scrollTop($('#executionSteps')[0].scrollHeight);
				}
				self.resultRetrieveBegin = false; // should after the setting of lastResulteId
				if ((!self.isGoback() && (resultItems.length >= 100 || !self.executionEnd())) &&
					!(self.executeState() == executionManager.unknownError || self.executeState() ==
						executionManager.configureError ||
						self.executeState() == executionManager.AntbotNotFoundError || self
						.executeState() == executionManager.startExecutionError ||
						self.executeState() == executionManager.utpCoreNetworkError || self
						.executeState() == executionManager.terminated ||
						self.executeState() == executionManager.completed || self.executeState() ==
						executionManager.stopped)) {
					self.pullData("拉取数据中。。。");
					// self.getExecutionResult();
				} else if (resultItems.length < 100 && self.executionEnd()) {
					self.pullData("数据拉取已完成");
				}
			} else
				self.getExecutionResultErrorFunction();
		};






		this.pullData = ko.observable('拉取数据中。。。');
		this.getExecutionResultErrorFunction = function() {
			self.resultRetrieveBegin = false;
			notificationService.showError('获取执行结果失败。');
		};

		this.getExecutionResult = function() {
			if (!self.resultRetrieveBegin) {
				self.resultRetrieveBegin = true;
				var maximum = 100;
				// utpService.getExecutionResult(self.executionId, self.lastResultId, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
				utpService.getMaximumExecutionResult(self.executionId, self.lastResultId, maximum, self
					.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
			}
		};
		this.getIdMaxExecutionDataResult = function() {
			let maximum = 2;
			utpService.listExecutionDataResult(self.executionId, self.lastExecutionDataId, maximum, self
				.listExecutionDataResultSuccessFunction, self.getIdMaxExecutionDataResultErrorFunction);
		};

		this.getMonitorData = function() {
			app.trigger('updateMonitorResult:event', self.executionId);
		};

		this.testcaseWithBigDataProcess = function(bigData) {
			if (bigData && bigData.type.includes("image/")) {
				var domId = '#' + bigData.id;
				if ($(domId)) {
					$(domId).popover({
						placement: "bottom",
						html: true,
						trigger: 'hover',
						content: "<img src = '" + bigData.data +
							"' οnlοad='if(this.width > 300) this.width=300'/>"
					});
				}
			}
		};

		this.viewBigData = function(item) {
			var bigData = protocolService.getBigData(item.bigDataId);
			if (bigData) {
				self.currentBigDataConfig = {
					bigDataId: item.bigDataId
				};
				if (bigData.type.includes("video/")) {
					var base64String = bigData.data;
					var videoElement = $('#executionBigDataVideoModal').find('video')[0];
					videoElement.src = base64String;
					videoElement.controls = true;
					videoElement.autoplay = true;
					$('#executionBigDataVideoModal').modal('show');
				} else if (bigData.type.includes("image/")) {
					var base64String = bigData.data;
					//将base64String转换为图片
					var img = new Image();
					img.src = base64String;
					//点击,弹出模态框显示图片,而不是新打开一个页面
					$('#executionBigDataImgModal').modal('show');
					$('#executionBigDataImgModal').on('shown.bs.modal', function() {
						$('#executionBigDataImgModal').find('img').attr('src', img.src);
					});
				} else if (bigData.type.includes("audio/")) {
					var audio = new Audio();
					audio.src = bigData.data;
					audio.controls = true;
					audio.autoplay = true;
					$('#executionBigDataAudioModal').modal('show');
					$('#executionBigDataAudioModal').on('shown.bs.modal', function() {
						$('#executionBigDataAudioModal').find('audio').attr('src', audio.src);
					});
				} else if (bigData.type == protocolService.bigDataType.paralAllRunSummary) {
					komapping.fromJS(bigData.data.succRunTimeArry, {}, self.pressureTestSummaryData);
					self.pressureTestSummary.succCount(bigData.data.succCount);
					self.pressureTestSummary.failCount(bigData.data.failCount);
					self.pressureTestSummary.result(bigData.data.result);
					self.pressureTestSummary.startTime(bigData.data.startTime);
					self.pressureTestSummary.endTime(bigData.data.endTime);
					$('#executionPressureTestSummaryModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.paralScriptRunDetailInfo) {
					komapping.fromJS(bigData.data.commandResultList, {}, self.pressureTestDetailData);
					self.pressureTestDetail.runId(bigData.data.runID);
					self.pressureTestDetail.result(bigData.data.result);
					self.pressureTestDetail.startTime(bigData.data.startTime);
					self.pressureTestDetail.endTime(bigData.data.endTime);
					$('#executionPressureTestDetailModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.paralAllFailRunDetailInfo) {
					komapping.fromJS(bigData.data, {}, self.pressureTestFailDetailData);
					self.failDetailEnabled(false);
					$('#executionPressureTestFailDetailReportModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.paralCmdsStatisRunTimes) {
					komapping.fromJS(bigData.data, {}, self.pressureTestCmdsStatisRunTimes);
					$('#executionPressureTestCmdRunTimesReportModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.J1939) {
					komapping.fromJS(bigData.data.canFrameDataList, {}, self.frameDataList);
					$('#executionFrameDataModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.ARINC429) {
					for (var i = 0; i < bigData.data.frameDataList.length; i++)
						bigData.data.frameDataList[i].id = i;
					komapping.fromJS(bigData.data.frameDataList, {}, self.arinc429FrameDataList);
					self.arincDetailEnabled(false);
					$('#executionFrameARINC429DataModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.MIL1553B) {
					for (var i = 0; i < bigData.data.frameDataList.length; i++)
						bigData.data.frameDataList[i].id = i;
					komapping.fromJS(bigData.data.frameDataList, {}, self.mil1553BFrameDataList);
					self.mil1553BDetailEnabled(false);
					$('#executionFrameMIL1553BDataModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.MIL1553BCUSTOM) {
					for (var i = 0; i < bigData.data.frameDataList.length; i++)
						bigData.data.frameDataList[i].id = i;
					komapping.fromJS(bigData.data.frameDataList, {}, self.mil1553BCustomFrameDataList);
					self.mil1553BCustomDetailEnabled(false);
					$('#executionFrameMIL1553BCustomDataModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.genericBusFrame) {
					self.currentBigDataConfig.protocolId = bigData.data.busInterfaceDefID;
					var genericFrameDataList = protocolService.bigDataAnalysis(bigData.data
						.busInterfaceDefID, bigData.data.genericBusFrameDatas);
					komapping.fromJS(genericFrameDataList, {}, self.genericFrameDataList);
					self.genericDetailEnabled(false);
					$('#executionFrameGenericDataModal').modal('show');
				} else if (bigData.type == protocolService.bigDataType.generalBusMessagesToDiff) {
					self.currentBigDataConfig.protocolId = bigData.data.busInterfaceDefID;
					var messageName = bigData.data.messageName;
					if (bigData.data.fieldValues1 && bigData.data.fieldValues2) {
						var fields = protocolService.bigDataFieldAnalysis(bigData.data.busInterfaceDefID,
							messageName, bigData.data.fieldValues1);
						var jsonLeft = null;
						var jsonRight = null;
						if (fields) {
							jsonLeft = JSON.parse(fields);
						}
						var fields = protocolService.bigDataFieldAnalysis(bigData.data.busInterfaceDefID,
							messageName, bigData.data.fieldValues2);

						if (fields) {
							jsonRight = JSON.parse(fields);
						}
						if (jsonLeft && jsonRight) {
							$('#protocolCompareModal').modal({
								show: true
							}, {
								data: {
									jsonLeft,
									jsonRight
								}
							});
						}
					}
				} else if (bigData.type == protocolService.bigDataType.generalJsonTable) {
					self.executionGeneralJsonHead([]);
					self.executionGeneralJsonData([]);
					self.currentBigDataConfig.protocolId = bigData.id;
					var executionGeneralJsonHead = bigData.data.head;
					var executionGeneralJsonData = [];
					for (var e = 0; e < bigData.data.data.length; e++) {
						var lineVal = ko.observable([]);
						//数组bigData.data.data第一列加上倒序序号
						if (executionGeneralJsonHead[0] != "序号") {
							bigData.data.data[e].unshift(bigData.data.data.length - e)
						}
						komapping.fromJS(bigData.data.data[e], [], lineVal);
						executionGeneralJsonData.push(lineVal);
					}
					//数组第一列加上序号
					if (executionGeneralJsonHead[0] != "序号") {
						executionGeneralJsonHead.unshift("序号");
					}
					komapping.fromJS(executionGeneralJsonHead, [], self.executionGeneralJsonHead);
					komapping.fromJS(executionGeneralJsonData, [], self.executionGeneralJsonData);
					$('#executionGeneralJsonDataModal').modal('show');
				} else {
					self.generalRawData(bigData.data);
					$('#executionGeneralRawDataModal').modal('show');
				}
			}
		};

		this.getJsonStorageDataSuccessFunction = function(data) {
			if (data && data.status === 1 && data.result) {
				var bigData = protocolService.addBigData(data.result);
				if (bigData)
					self.testcaseWithBigDataProcess(bigData);
			} else
				self.getJsonStorageDataErrorFunction();
		};

		this.getJsonStorageDataErrorFunction = function() {
			notificationService.showError('获取数据失败。');
		};

		this.getJsonStorageData = function(item) {
			if (item.existBigData && item.bigDataId) {
				var bigData = protocolService.getBigData(item.bigDataId);
				if (bigData) {
					self.testcaseWithBigDataProcess(bigData);
					return;
				}
				utpService.getOverviewBigDataById(item.bigDataId, self.getJsonStorageDataSuccessFunction,
					self.getJsonStorageDataErrorFunction);
			}
		};

		this.initBigData = function(executionResultList) {
			if (executionResultList != null) {
				for (var i = 0; i < executionResultList.length; i++) {
					self.getJsonStorageData(executionResultList[i]);
				}
			}
		};

		// report				
		this.canShowReportButton = ko.computed(function() {
			//return (self.executeState() == executionManager.completed || self.executeState() == executionManager.terminated || self.executeState() == executionManager.stopped);
			//暂时不显示报表按钮
			return false;
		});

		this.myChart = null;
		this.chartOptions = {};
		this.gridData = [];
		this.pieData = {};

		this.initDetailData = function(executionResultList, isSummary) {
			return cmdConvertService.executionResultLocalization(executionResultList, isSummary);
		};

		this.pressureTestSummaryData = komapping.fromJS([], {
			key: function(item) {
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
			key: function(item) {
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
			key: function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});

		this.pressureTestFailDetailData = komapping.fromJS([], {
			key: function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});

		this.frameDataList = komapping.fromJS([], {
			key: function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});

		this.failDetailEnabled = ko.observable(false);

		this.disableFailDetailInfo = function() {
			self.failDetailEnabled(false);
		};

		this.enalbeFailDetailInfo = function(item) {
			komapping.fromJS(item.commandResultList(), {}, self.pressureTestDetailData);
			self.pressureTestDetail.runId(item.runID());
			self.pressureTestDetail.result(item.result());
			self.pressureTestDetail.startTime(item.startTime());
			self.pressureTestDetail.endTime(item.endTime());
			self.failDetailEnabled(true);
		};

		// ARINC429
		this.arinc429FrameDataList = komapping.fromJS([], {
			key: function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});

		this.arincDetailEnabled = ko.observable(false);

		this.disableARINC429DetailInfo = function() {
			self.arincDetailEnabled(false);
		};

		this.showARINC429Detail = function(item) {
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
			key: function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});

		this.mil1553BDetailEnabled = ko.observable(false);

		this.disableMIL1553BDetailInfo = function() {
			self.mil1553BDetailEnabled(false);
		};

		this.showMIL1553BDetail = function(item) {
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
			key: function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});

		this.mil1553BCustomDetailEnabled = ko.observable(false);

		this.disableMIL1553BCustomDetailInfo = function() {
			self.mil1553BCustomDetailEnabled(false);
		};

		this.showMIL1553BCustomDetail = function(item) {
			var unmapped = komapping.toJS(item.frameDatas);
			self.currentMIL1553BCustomRecord.frameDatas(unmapped);
			self.mil1553BCustomDetailEnabled(true);
		};

		this.currentMIL1553BCustomRecord = {
			frameDatas: ko.observable([])
		};

		// Generic Frame				
		this.genericFrameDataList = ko.observable([]);
		this.genericDetailEnabled = ko.observable(false);
		this.executionGeneralJsonData = ko.observable([]);
		this.executionGeneralJsonHead = ko.observable([]);

		this.genericRawFrame = ko.observable('');
		this.generalRawData = ko.observable('');
		this.currentBigDataFrameConfig = null;
		this.messageTemplateName = ko.observable('');
		this.genericErrorFrameData = ko.observable(false);
		this.genericRecordContent = ko.observable('');

		this.createMessageTemplateSuccessFunction = function(data) {
			if (data && data.status === 1 && data.result)
				notificationService.showSuccess('创建消息模板成功！');
			else if (data.errorMessage)
				notificationService.showError(data.errorMessage);
			else
				self.createMessageTemplateErrorFunction();
		};

		this.createMessageTemplateErrorFunction = function() {
			notificationService.showError('创建消息模板失败！');
		};

		this.createMessageType = function() {
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
			utpService.createMessageTemplate(messageTypeObj, self.createMessageTemplateSuccessFunction, self
				.createMessageTemplateErrorFunction);
		};

		this.disableGenericDetailInfo = function() {
			self.genericErrorFrameData(false);
			self.genericDetailEnabled(false);
			self.messageTemplateName('');
			self.genericRawFrame("");
			$('#executionReportConfigView').html('');
		};

		this.displayReportConfig = function(protocolId, messageName, genericRecordContent, fieldValues,
			fieldSizes) {
			$('#executionFrameGenericDataModal').modal('show')
			self.messageTemplateName('');
			const container = document.getElementById('executionReportConfigView');
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
				onEditable: function(node) {
					if (!node.path) {
						// In modes code and text, node is empty: no path, field, or value
						// returning false makes the text area read-only
						return false;
					}
				},
				onEvent: function(node, event) {
					if (event.type === "click") {
						var path = JSON.parse(JSON.stringify(node.path));
						var interval = protocolService.getFieldValueInterval(protocolId,
							messageName, path, fieldValues, fieldSizes);
						if (interval) {
							var rawFrame = self.genericRawFrame();
							rawFrame = rawFrame.replace("<div style='color:#FF0000';>", "").replace(
								"</div>", "");
							var start = interval.start / 4;
							var end = interval.end / 4;
							rawFrame = rawFrame.slice(0, start) + "<div style='color:#FF0000';>" +
								rawFrame.slice(start, end) + "</div>" + rawFrame.slice(end);
							self.genericRawFrame(rawFrame);
						}
						console.log(interval);
					}
				}
			}
			self.editor = new JSONEditor(container, options, genericRecordContent);
		};

		this.getFieldStorageDataSuccessFunction = function(data) {
			if (data && data.status === 1) {
				result = JSON.parse(data.result);
				var fieldValues = result.fieldValues;
				var fieldSizes = result.fieldSizes;
				var rawFrame = result.rawFrame;
				self.genericRawFrame(rawFrame);
				if (self.currentBigDataFrameConfig) {
					var bigData = protocolService.getBigData(self.currentBigDataFrameConfig.bigDataId);
					if (bigData) {
						var messageName = bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig
							.index].message;
						bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index]
							.fieldValues = fieldValues;
						bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].rawFrame =
							rawFrame;
						self.currentBigDataFrameConfig.fieldValues = fieldValues;
						self.showFormatGenericDetail(bigData.data.busInterfaceDefID, messageName,
							fieldValues, fieldSizes);
					}
				}
			} else
				self.getFieldStorageDataErrorFunction();
		};

		this.getFieldStorageDataErrorFunction = function() {
			notificationService.showError('获取字段数据失败！');
		};

		this.showFormatGenericDetail = function(busInterfaceDefID, messageName, fieldValues, fieldSizes) {
			var fields = protocolService.bigDataFieldAnalysis(busInterfaceDefID, messageName, fieldValues);
			if (fields) {
				self.genericRecordContent(JSON.parse(fields));
				self.genericErrorFrameData(false);
				self.displayReportConfig(busInterfaceDefID, messageName, self.genericRecordContent(),
					fieldValues, fieldSizes);
			} else {
				self.genericRecordContent(fieldValues);
				self.genericErrorFrameData(true);
				notificationService.showError("不满足协议定义,不能解析详细字段!");
			}
			self.genericDetailEnabled(true);
		};

		this.showGenericDetail = function(item, event) {
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
			if (item.frameData.fields().length === 0 || item.rawFrame() == null || item.rawFrame() ==
				undefined || item.rawFrame() == '') {
				utpService.getIndexBigDataById(self.currentBigDataFrameConfig.bigDataId, self
					.currentBigDataFrameConfig.index, self.getFieldStorageDataSuccessFunction, self
					.getFieldStorageDataErrorFunction);
				return;
			}
			self.currentBigDataFrameConfig.fieldValues = item.frameData.fieldValues();
			self.genericRawFrame(item.rawFrame());
			self.showFormatGenericDetail(self.currentBigDataConfig.protocolId, item.frameData.message(),
				self.currentBigDataFrameConfig.fieldValues);
		};

		this.showProtocolCompare = function(jsonLeft, jsonRight) {
			self.viewManager.protocolCompareActiveData({
				jsonLeft,
				jsonRight
			});
			self.viewManager.protocolCompareActivePage('app/viewmodels/protocolCompare');
		};

		this.currentBigDataConfig = null;

		this.getDetailExecutionResultSuccessFunction = function(data) {
			if (data && data.status === 1) {
				var executionResultList = data.result;
				if (executionResultList != null) {
					var expectedResultList = self.initDetailData(executionResultList, false);
					self.initBigData(expectedResultList);
					$$("execution_tabview").addView({
						header: self.selectResultStep.stepName,
						close: true,
						body: {
							view: "datatable",
							css: "webix_header_border",
							id: self.selectResultStep.id,
							template: "#title#",
							columns: [{
									id: "step",
									header: "测试序号",
									fillspace: 2
								},
								{
									id: "stepName",
									header: "测试步骤",
									fillspace: 5,
									template: function(data) {
										if (data.existBigData && data.bigDataId) {
											return "<div><a href='#' class='bigData'>" +
												data.stepName + "</a></div>";
										} else
											return "<div><span>" + data.stepName +
												"</span></div>";
									},
									tooltip: function(obj, common) {
										var column = common.column.id;
										if (obj.existBigData && obj.bigDataId) {
											var bigData = protocolService.getBigData(obj
												.bigDataId);
											if (bigData && bigData.type.includes("image/"))
												return "<img src = '" + bigData.data +
													"' οnlοad='if(this.width > 300) this.width=300'/>";
										}
										return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" +
											obj[column] + "</span>";
									}
								},
								{
									id: "result",
									header: ["测试结果", {
										content: "selectFilter",
										compare: self.testResultCompare,
										options: [{
												"value": "成功",
												"id": cmdConvertService.testResult
													.pass
											},
											{
												"value": "失败",
												"id": cmdConvertService.testResult
													.failed
											},
											{
												"value": "超时",
												"id": cmdConvertService.testResult
													.timeOut
											},
											{
												"value": "其它",
												"id": cmdConvertService.testResult
													.other
											}
										]
									}],
									fillspace: 2,
									template: function(data) {
										if (data.result == cmdConvertService.testResult
											.pass)
											return "<div style='background-color: green'><span>成功</span></div>";
										else if (data.result == cmdConvertService.testResult
											.failed)
											return "<div style='background-color: red'><span>" +
												(data.errorMessage == null || data
													.errorMessage == "" ? "失败" : data
													.errorMessage) + "</span></div>";
										else if (data.result == cmdConvertService.testResult
											.timeOut)
											return "<div style='background-color: yellow'><span>超时</span></div>";
										else if (data.result == cmdConvertService.testResult
											.other)
											return "<div><span>其它</span></div>";
									},
									tooltip: function(obj, common) {
										var column = common.column.id;
										if (obj[column] == cmdConvertService.testResult
											.pass)
											return "成功";
										else if (obj[column] == cmdConvertService.testResult
											.failed)
											return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" +
												(obj['errorMessage'] == null || obj[
													'errorMessage'] == "" ? "失败" : obj[
													'errorMessage']) + "</span>";
										else if (obj[column] == cmdConvertService.testResult
											.timeOut)
											return "超时";
										else if (obj[column] == cmdConvertService.testResult
											.other)
											return "其它";
									}
								},
								{
									id: "time",
									header: "执行时间",
									fillspace: 4
								}
							],
							onClick: {
								bigData: function(ev, id) {
									var item = $$($$("execution_tabview").getValue()).getItem(
										id);
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
								onresize: webix.once(function() {
									this.adjustRowHeight("stepName", true);
								}),
								onAfterLoad: function() {
									if (!this.count())
										this.showOverlay("数据不存在");
								}
							}
						}
					});
					$.unblockUI();
				} else
					self.getDetailExecutionResultErrorFunction();
			} else
				self.getDetailExecutionResultErrorFunction();
		};

		this.getDetailExecutionResultErrorFunction = function() {
			$.unblockUI();
			notificationService.showError('获取报表失败');
		};

		this.getDetailExecutionResult = function(start, end) {
			$.blockUI(utilityService.template);
			utpService.getDetailExecutionResult(self.executionId, start, end, self
				.getDetailExecutionResultSuccessFunction, self.getDetailExecutionResultErrorFunction);
		};

		this.stepTypeCompare = function(value, filter, config) {
			var type = config.type.toString().toLowerCase();
			filter = filter.toString().toLowerCase();
			return type == filter;
		};

		this.testResultCompare = function(value, filter, config) {
			var result = config.result.toString().toLowerCase();
			filter = filter.toString().toLowerCase();
			return result == filter;
		};

		this.initTable = function() {
			webix.ready(function() {
				webix.ui({
					container: "executionDetailInfo",
					id: "execution_tabview",
					width: 0,
					view: "tabview",
					cells: [{
						header: "测试用例/检查点 结果",
						id: "main",
						body: {
							view: "datatable",
							css: "webix_header_border",
							id: "list1",
							template: "#title#",
							columns: [{
									id: "step",
									header: ["测试类型", {
										content: "selectFilter",
										compare: self.stepTypeCompare,
										options: [{
												"value": "测试用例",
												"id": "TestCase"
											},
											{
												"value": "测试点",
												"id": "Checkpoint"
											}
										]
									}],
									fillspace: 3
								},
								{
									id: "stepName",
									header: "测试名称",
									fillspace: 8,
									tooltip: function(obj, common) {
										var column = common.column.id;
										return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" +
											obj[column] + "</span>";
									}
								},
								{
									id: "result",
									header: ["测试结果", {
										content: "selectFilter",
										compare: self.testResultCompare,
										options: [{
												"value": "成功",
												"id": cmdConvertService
													.testResult.pass
											},
											{
												"value": "失败",
												"id": cmdConvertService
													.testResult
													.failed
											},
											{
												"value": "超时",
												"id": cmdConvertService
													.testResult
													.timeOut
											},
											{
												"value": "未完成",
												"id": cmdConvertService
													.testResult
													.unCompleted
											},
											{
												"value": "其它",
												"id": cmdConvertService
													.testResult
													.other
											}
										]
									}],
									fillspace: 3,
									template: function(data) {
										if (data.result == cmdConvertService
											.testResult.pass)
											return "<div style='background-color: green'><span>成功</span></div>";
										else if (data.result ==
											cmdConvertService.testResult
											.failed)
											return "<div style='background-color: red'><span>" +
												(data.errorMessage ==
													null || data
													.errorMessage == "" ?
													"失败" : data.errorMessage
													) + "</span></div>";
										else if (data.result ==
											cmdConvertService.testResult
											.timeOut)
											return "<div style='background-color: yellow'><span>超时</span></div>";
										else if (data.result ==
											cmdConvertService.testResult
											.unCompleted)
											return "<div style='background-color: yellow'><span>未完成</span></div>";
										else if (data.result ==
											cmdConvertService.testResult
											.other)
											return "<div><span>其它</span></div>";
									},
									tooltip: function(obj, common) {
										var column = common.column.id;
										if (obj[column] == cmdConvertService
											.testResult.pass)
											return "成功";
										else if (obj[column] ==
											cmdConvertService.testResult
											.failed)
											return "<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>" +
												(obj['errorMessage'] ==
													null || obj[
														'errorMessage'] ==
													"" ? "失败" : obj[
														'errorMessage']) +
												"</span>";
										else if (obj[column] ==
											cmdConvertService.testResult
											.timeOut)
											return "超时";
										else if (obj[column] ==
											cmdConvertService.testResult
											.other)
											return "其它";
									}
								},
								{
									id: "time",
									header: "执行时间",
									fillspace: 6
								},
								{
									id: "",
									header: "",
									fillspace: 1,
									template: function(item) {
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
								"fa-search-plus": function(ev, id) {
									var item = $$('list1').getItem(id);
									if (item == null)
										return;
									self.selectResultStep = item;
									if (!$$(item.id)) {
										self.getDetailExecutionResult(item
											.begin, item.end);
									} else
										$$(item.id).show(false, false);
								}
							},
							on: {
								onresize: webix.once(function() {
									this.adjustRowHeight("stepName", true);
								}),
								onAfterLoad: function() {
									if (!this.count())
										this.showOverlay("数据不存在");
								},
							}
						}
					}]
				});
			});
		};

		this.initChart = function() {
			var dom = document.getElementById("testrunReferrals");
			self.myChart = echarts.init(dom);
			var data = self.pieData;
			if (data == null) {
				document.getElementById("testrunReferrals").innerText = "数据不存在！";
				return;
			}

			var legendData = [];
			var seriesData = [];
			var name = '成功';
			legendData.push(name);
			if (data.passedScripts.length > 0) {
				seriesData.push({
					name: name,
					value: data.passedScripts.length,
					itemStyle: {
						normal: {
							color: 'green',
						}
					}
				});
			}
			name = '失败';
			legendData.push(name);

			if (data.failedScripts.length > 0) {
				seriesData.push({
					name: name,
					value: data.failedScripts.length,
					itemStyle: {
						normal: {
							color: 'red',
						}
					}
				});
			}
			name = '未执行';
			legendData.push(name);
			if (data.unExecutedScripts.length > 0) {
				seriesData.push({
					name: name,
					value: data.unExecutedScripts.length,
					itemStyle: {
						normal: {
							color: 'yellow',
						}
					}
				});
			}

			if (seriesData.length == 0) {
				document.getElementById("referrals").innerText = "数据不存在！";
				return;
			}

			self.chartOptions = null;
			self.chartOptions = {
				title: {
					text: data.targetTestsetName + '：' + data.executionName + '（' + data
						.executedByUserId + '）',
					subtext: data.executionStartTime + ' - ' + data.executionEndTime,
					left: 'center'
				},
				tooltip: {
					trigger: 'item',
					formatter: "{b} : {c} ({d}%)"
				},
				legend: {
					bottom: 10,
					left: 'center',
					data: legendData,
				},
				toolbox: {
					feature: {
						saveAsImage: {}
					}
				},
				series: [{
					name: '种类',
					type: 'pie',
					radius: '55%',
					center: ['40%', '50%'],
					data: seriesData,
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}]
			};
			if (self.chartOptions && typeof self.chartOptions === "object")
				self.myChart.setOption(self.chartOptions, true);
		};

		this.cancelExecution = function() {
			var executionId = {
				executionId: self.executionId
			};
			utpService.cancelExecution(executionId,
				function(data) {
					if (data && data.status === 1 && data.result)
						return;
					else
						notificationService.showError('取消执行失败');

				},
				function(error) {
					notificationService.showError('取消执行失败');
				});
			// $('#inputExecutionNameModal').modal('hide');
			// $('#dynamicAgentsModal').modal('hide');	
			// $('#dynamicTargetObjectsModal').modal('hide');
			// $('.modal-backdrop').remove();
			self.goback();
		};

		this.generateOnlineReport = function(expectedResultList, data) {
			self.gridData = expectedResultList;
			self.pieData = data;
			$('#testrunResultModal').modal('show');
		};

		this.fetchSummaryReportDataSuccessFunction = function(data) {
			if (data != null && data.status === 1) {
				var expectedResultList = self.initDetailData(data.result.executionResultList, true);
				self.generateOnlineReport(expectedResultList, data.result);
			} else
				notificationService.showError('获取数据失败');
			$.unblockUI();
		};

		this.fetchSummaryReportDataErrorFunction = function(error) {
			$.unblockUI();
			notificationService.showError('获取数据失败');
		};

		this.showReport = function(item) {
			$.blockUI(utilityService.template);
			utpService.getStatisticsSummaryReport(item.executionId, self
				.fetchSummaryReportDataSuccessFunction, self.fetchSummaryReportDataErrorFunction);
		};

		this.showHistoryReport = function() {
			$.blockUI(utilityService.template);
			utpService.getFinishedSummaryExecutionResult(self.executionId, self
				.fetchSummaryReportDataSuccessFunction, self.fetchSummaryReportDataErrorFunction);
		};
		this.isShowExecuteStatus = ko.observable(true);
		this.listResultByParentIdSuccessFunction = function(data) {
			if (data && data.status === 1 && data.result) {
				self.isShowExecuteStatus(true);
				self.isGoback(false);
				self.lastResultId = 0;
				self.getExecutionResultSuccessFunction(data);
				if (executionManager.isHistory()) {
					executionManager.isHistory(false);
					self.isShowExecuteStatus(false);
					self.lastExecutionDataId = 0;
					self.executeStateNotification('历史记录');
					self.getIdMaxExecutionDataResult();
				} else {
					self.getExecutionStatus();
					// self.getIdMaxExecutionDataResult();
				}
			} else
				self.listResultByParentIdErrorFunction();
		};

		this.listResultByParentIdErrorFunction = function() {
			notificationService.showError('获取数据失败');
		};

		this.parentId = -1;
		this.getlistResultByParentIdExecutionResult = function() {
			self.lastResultId = 0;
			self.resultRetrieveBegin = true;
			utpService.listResultByParentId(self.executionId, self.parentId, self
				.listResultByParentIdSuccessFunction, self.listResultByParentIdErrorFunction)
			// utpService.getLatestDetailExecutionResult(self.executionId, cmdConvertService.maxReuslt, self.getLatestDetailExecutionResultSuccessFunction, self.getLatestDetailExecutionResultErrorFunction);
		};

		//switch execution
		this.switchExecution = function() {
			self.parentId = -1;
			self.executeState(executionManager.excutionSwitching);
			self.executeStateNotification('执行切换中');
			self.getlistResultByParentIdExecutionResult();
		};

		this.initExecutionConfig = function() {
			//关闭模拟执行,打开时,需把html文件里同时打开
			// $('#dummyExecutionConfig').bootstrapSwitch("state", self.dummyExecution());
			// $('#dummyExecutionConfig').on('switchChange.bootstrapSwitch', function (event, state) {
			// 	self.dummyExecution(state);   
			// });					
			$('#sendEmailConfig').bootstrapSwitch("state", self.sendEmail());
			$('#sendEmailConfig').on('switchChange.bootstrapSwitch', function(event, state) {
				self.sendEmail(state);
			});

			if ($.cookie("userEmail") && utilityService.validateEmail($.cookie("userEmail"))) {
				self.executionEmail($.cookie("userEmail"));
			}
		};
		this.switchExecutionConfirmed = ko.observable(false);
		this.newExecutionFlag = ko.observable(false);
		// The data-binding shall happen after DOM element be attached.
		this.attached = function(view, parent) {
			// self.initPage();
			self.allDataTypeFalse();
			self.saveData(1);
			self.switchExecutionConfirmed(false);
			self.treeTable = null;
			if (executionManager.switchExecutionConfirmed()) {
				self.switchExecutionConfirmed(true);
				self.getEngineByEngineName();
				self.getExecutionStatus();
				self.isGoback(false);
			} else {
				if (executionManager.newExecutionFlag()) {
					self.testResultData();
				} else {
					self.testResultAsyncTreeData();
				}
			}
			self.scripts();
			self.currentNode(0);
			self.currentStepNumber = 1;
			self.executionEnd(false);
			self.commandCount(0);
			self.testcaseEndCount(0);
			self.commandCountFailed(0);
			self.testcaseEndCountFailed(0);
			self.showGoBack(false);
			self.testResult([]);
			self.executionDataResult([]);
			// self.lineExecutionDataName([]);
			self.executionView();
			self.executeState(executionManager.notStarted);
			self.deactive = false;
			self.nameAndTime = ko.observable([]);
			self.executionDataMapping.clear();

			self.executionId = executionManager.getExecutionId();
			self.newExecutionFlag(executionManager.newExecutionFlag());


			if (executionManager.newExecutionFlag()) {
				$('#protocolCompareModal').on('shown.bs.modal', function(e) {
					self.showProtocolCompare(e.relatedTarget.data.jsonLeft, e.relatedTarget.data
						.jsonRight);
				});
				$('#inputExecutionNameModal').on('shown.bs.modal', function() {
					$('#inputExecutionForm').validator().off('submit');
					$('#inputExecutionForm').validator('destroy').validator();
					self.initExecutionConfig();
					$('#inputExecutionForm').validator().on('submit', function(e) {
						if (e.isDefaultPrevented()) {
							// handle the invalid form...
						} else {
							e.preventDefault();
							if (self.sendEmail()) {
								if (self.executionEmail() == '' || !utilityService
									.validateEmail(self.executionEmail())) {
									notificationService.showWarn("邮箱为空或邮箱不合法！");
									return;
								}
							}
							$('#inputExecutionNameModal').modal('hide');
							$('.modal-backdrop').remove();
							self.prepareExecution();
						}
					});
				});
				self.getExceptionRecovers();
				var name = self.selectionManager.selectedNodeName() + "_" + new Date().format(
					"yyyy-MM-dd_hh:mm:ss");;
				self.executionName(name);
				self.isHistoryExecution = false;
				$('#inputExecutionNameModal').modal('show');
			} else {
				self.showGoBack(true);
				if (!executionManager.switchExecutionConfirmed()) {
					self.isHistoryExecution = true;
					self.switchExecution();
				}
			}

			$('#testrunResultModal').on('shown.bs.modal', function() {
				$('#executionDetailInfo').html('');
				if (self.canShowReportButton())
					self.initChart();
				self.initTable();
			});
			$('#testrunResultModal').on('hidden.bs.modal', function() {
				if (self.myChart) {
					self.myChart.clear();
					self.myChart.dispose();
				}
			});
			$('#executionPressureTestSummaryModal').on('shown.bs.modal', function() {
				setTimeout(function() {
					$('#executionPressureTestSummaryChart').html('');
					self.initPressureTestViewState(true);
					var dom = document.getElementById('executionPressureTestSummaryChart');
					self.pressureTestSummaryChart = echarts.init(dom);
					self.pressureTestSummaryChart.showLoading({
						text: "数据正在努力加载..."
					});
					self.drawPressureTestSummaryChart(self.pressureTestSummaryData);
				}, 500);
			});
			$('#executionPressureTestSummaryModal').on('hidden.bs.modal', function() {
				if (self.pressureTestSummaryChart) {
					self.pressureTestSummaryChart.clear();
					self.pressureTestSummaryChart.dispose();
				}
			});

		};

		this.treeTable = null;

		this.testResultAsyncTreeData = function() {
			self.treeTable = null;
			layui.use(function() {
				self.treeTable = layui.treeTable;
				// 渲染
				var inst = self.treeTable.render({
					elem: '#testcaseTree',
					data: [],
					tree: {
						enable: true,
						async: {
							enable: true,
							format: function(trData, options, callback) {
								self.parentId = trData.id;
								utpService.listResultByParentId(self.executionId, self
									.parentId,
									function(data) {
										if (data && data.status === 1 && data
											.result) {
											self.testcaseTreeAsyncDataFunction(
											data);
											callback(self.testcaseTreeAsyncData());
										}
									});

							}
						}
					},
					height: '601px',
					toolbar: '#TPL-treeTable-demo',
					cols: [
						[{
								field: 'name',
								title: '',
								width: "55%",
								fixed: 'left',
								templet: function(d) {
									if (d.existBigData && d.bigDataId) {
										return "<span>" + d.name +
											"</span> <a class='layui-btn layui-btn-primary layui-btn-xs' lay-event='detail'>查看</a>";
									} else
										return "<span>" + d.name + "</span>";
								}
							},
							{
								field: 'result',
								title: '结果',
								width: "10%",
								sort: true,
								templet: function(d) {
									if (d.result === 1) {
										return '<span style="color: green;">成功</span>';
									} else if (d.result === 0) {
										return '<span style="color: red;">失败</span>';
									} else if (d.result === -1) {
										return '<span style="color: orange;">获取数据中</span>';
									} else {
										return '<span>未知</span>';
									}
								}
							},
							{
								field: 'executionTime',
								title: '时间',
								width: "15%"
							},
							{
								field: 'errorMessage',
								title: '备注',
								width: "20%"
							},
						]
					],
					page: true,
				});
				self.treeTable.on('tool(' + inst.config.id + ')', function(obj) {
					var layEvent = obj.event;
					var trData = obj.data;
					if (layEvent === "detail") {
						self.viewBigData(trData);
					}
				});
			});
		}

		this.testResultData = function() {
			layui.use(function() {
				self.treeTable = layui.treeTable;
				// 渲染
				var inst = self.treeTable.render({
					elem: '#testcaseTree',
					data: [],
					tree: {},
					height: '601px',
					toolbar: '#TPL-treeTable-demo',
					cols: [
						[{
								field: 'name',
								title: '',
								width: "55%",
								fixed: 'left',
								templet: function(d) {
									if (d.existBigData && d.bigDataId) {
										return "<span>" + d.name +
											"</span> <a class='layui-btn layui-btn-primary layui-btn-xs' lay-event='detail'>查看</a>";
									} else
										return "<span>" + d.name + "</span>";
								}
							},
							{
								field: 'result',
								title: '结果',
								width: "10%",
								sort: true,
								templet: function(d) {
									if (d.result === 1) {
										return '<span style="color: green;">成功</span>';
									} else if (d.result === 0) {
										return '<span style="color: red;">失败</span>';
									} else if (d.result === -1) {
										return '<span style="color: orange;">执行中</span>';
									} else {
										return '<span>未知</span>';
									}
								}
							},
							{
								field: 'executionTime',
								title: '时间',
								width: "15%"
							},
							{
								field: 'errorMessage',
								title: '备注',
								width: "20%"
							},
						]
					],
					page: true,
				});
				self.treeTable.on('tool(' + inst.config.id + ')', function(obj) {
					var layEvent = obj.event;
					var trData = obj.data;
					if (layEvent === "detail") {
						self.viewBigData(trData);
					}
				});
			});
		}


		this.deactivate = function() {};

		this.drawPressureTestSummaryChart = function(seriesData) {
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
					subtext: self.pressureTestSummary.startTime() + " 到 " + self.pressureTestSummary
						.endTime(),
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: { // 坐标轴指示器，坐标轴触发有效
						type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
					},
					formatter: function(params) {
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
					data: seriesData().map(function(item) {
						return item.runID();
					}),
					axisLabel: {
						formatter: function(value, index) {
							return "运行" + (index + 1) + "\n" + value;
						}
					}
				},
				yAxis: {
					type: 'value',
					min: (min - 1000) < 0 ? 0 : (min - 1000),
					max: max + 1000,
					axisLabel: {
						formatter: function(value, index) {
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
					data: seriesData().map(function(item) {
						return item.millionSeconds();
					})
				};
				self.chartOptions.series.push(successTestCaseSeries);
				self.chartOptions.legend.data = ["成功"];
				self.pressureTestSummaryChart.setOption(self.chartOptions, true);
			}
		};

		this.pressureTestGraphViewState = ko.observable(true);
		this.initPressureTestViewState = function(currentState) {
			$('#executionPressureTestViewState').bootstrapSwitch("state", currentState);
			$('#executionPressureTestViewState').on('switchChange.bootstrapSwitch', function(event, state) {
				self.pressureTestGraphViewState(state);
			});
		}

		this.detached = function(view, parent) {
			self.deactive = true;
			self.breakWebSocket();

		};
	}
	return new ExecutionViewModel();
});