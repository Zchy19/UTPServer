define(['jquery', 'durandal/plugins/http', 'komapping', 'services/executionManager', 'services/projectManager', 'services/protocolService', 'services/loginManager', 'services/selectionManager', 'services/viewManager',
	'services/utpService', 'services/ursService', 'services/cmdConvertService', 'services/notificationService', 'services/utilityService', 'jsoneditor', 'blockUI', 'bootstrapSwitch', 'knockout', 'knockout-sortable', 'knockstrap', 'lodash'],
	function ($, $http, komapping, executionManager, projectManager, protocolService, loginManager, selectionManager, viewManager, utpService, ursService, cmdConvertService, notificationService, utilityService, JSONEditor, blockUI, bootstrapSwitch, ko, sortable, knockstrap, _) {

		function MonitorTestSetControlViewModel() {
			var self = this;
			this.selectionManager = selectionManager;
			this.viewManager = viewManager;
			this.pressureTestSummaryChart = null;
			this.projectManager = projectManager;
			this.utpService = utpService;
			this.protocolService = protocolService;
			this.cmdConvertService = cmdConvertService;
			this.genericProtocolName = ko.observable('协议帧内容配置');
			this.exceptionCheck = ko.observable(false);
			this.onlySelection = ko.observable(false);
			this.protocolFieldsconfig = ko.observableArray([]);
			this.genericCommandField = ko.observable('');
			this.currentScript = null;
			this.selectedMonitorTestSet = null;
			this.selectedMonitorTestSetName = ko.observable('');
			this.genericFrameInfo = {
				protocolId: "",
				id: "",
				fields: [],
				conditions: []
			};
			this.currentGenericFrameMessageName = "";
			this.selectedMessage = null;
			this.protocol = null;
			this.checkedCommandNodes = [];
			this.curControlCmdInfoArray = null;
			this.monitorControlData = ko.observableArray([]);
			this.selectedControlCmdInfo = null;
			this.protocol = null;
			this.containControlData = ko.observable(false);
			//隐藏保存按钮，需要显示时删除monitorControlSaveHide，网页更换containControlData绑定
			this.monitorControlSaveHide = ko.observable(false);
			this.displaySignal = ko.observable(false);
			this.displayGroupsSignals = ko.observable(false);
			this.canPage = ko.observable(false);
			this.targetEngineCandidates = ko.observableArray([]);
			this.selectTargetEngineId = ko.observable();
			this.engineStatus = null;
			this.cancelTargetEngine = function () {
				$('#monitorTestControlDynamicTargetEngineModal').modal('hide');
				$('.modal-backdrop').remove();
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
					$('#monitorTestControlDynamicTargetEngineModal').modal('hide');
					$('.modal-backdrop').remove();
					self.engineStatus = selectTargetEngineStatus;
					self.viewManager.selectedMonitorTestsetActiveEngine = selectTargetEngineStatus;
					self.sendCommand();
				}
				else
					notificationService.showWarn("请选择执行器");
			};

			this.getEngineAddressSuccessFunction = function (response) {
				if (response && response.result && response.engineStatus) {
					// notificationService.showProgressSuccess('获取执行器地址成功。', 100);
					if (response.engineStatuses && response.engineStatuses.length > 1) {
						for (var i = 0; i < response.engineStatuses.length; i++) {
							if(response.engineStatuses[i].shareMode == 0){
								response.engineStatuses[i].property= "全局共享";
								response.engineStatuses[i].describe="所有团队共享使用，多人同时执行测试，多节点分布式测试";
							}
							if(response.engineStatuses[i].shareMode == 1){
								response.engineStatuses[i].property= "团队共享";
								response.engineStatuses[i].describe="团队共享使用，多人同时执行测试，毫秒级实时性测试";
							}
							if(response.engineStatuses[i].shareMode == 2){
								response.engineStatuses[i].property= "个人独用";
								response.engineStatuses[i].describe="仅限所登录的账号执行测试，毫秒级实时性测试";
							}
						}
						self.targetEngineCandidates(response.engineStatuses);
						self.selectTargetEngineId(response.engineStatuses[0].id);
						$('#monitorTestControlDynamicTargetEngineModal').modal('show');
					}
					else {
						self.viewManager.selectedMonitorTestsetActiveEngine = response.engineStatus;
						self.engineStatus = response.engineStatus;
						self.sendCommand();
					}
				}
				else {
					if (response.returnMessage)
						self.getEngineAddressErrorFunction(response.returnMessage);
					else
						self.getEngineAddressErrorFunction("获取执行器地址失败");
				}
			};

			this.getEngineAddressErrorFunction = function (msg) {
				notificationService.showError(msg);
			};

			this.prepareExecution = function () {
				if (self.saveOneMonitorControlDataToScript()) {
				// TODO
				// notificationService.showProgressSuccess('探测可用的执行器实例...', 0);
				ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager.getAuthorizationKey(), self.getEngineAddressSuccessFunction, self.getEngineAddressErrorFunction);
				}
			};
			this.triggerStop = false;
			this.sendMonitoringExecutionCommandSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.triggerStop = true;	
					notificationService.showSuccess('正在准备发送数据...')	
					self.getExecutionStatus();
					// notificationService.showSuccess('发送控制数据成功！');
				}else{
					self.sendMonitoringExecutionCommandErrorFunction(data.result);
				}
			};

			this.sendMonitoringExecutionCommandErrorFunction = function (msg) {
				if(msg=="ExceedMaxExecutionCount"){
					notificationService.showError('执行已超过每日最大次数限制,请安装相应许可');
				}else{
					notificationService.showError('发送控制数据失败！');
				}
			};
			this.executeState = ko.observable(executionManager.notStarted);
			this.getExecutionStatus = function () {
				self.utpService.getExecutionModel(self.executionId,
					function (data) {
						if (data && data.status === 1) {
							var result = data.result;
							if (result.status != undefined) {
								if (self.executeState() != result.status) {
									if (result.status == executionManager.starting) {
										notificationService.showSuccess('发送数据启动中...');
									}
									else if (result.status == executionManager.running) {
										// notificationService.showSuccess('发送数据执行中...');
									}
									else if (result.status == executionManager.stopped) {
										notificationService.showSuccess('发送数据已停止。');
									}
									else if (result.status == executionManager.completed) {
										notificationService.showSuccess('发送数据成功！');
									}
									else if (result.status == executionManager.terminated) {
										notificationService.showSuccess('发送数据已终止。');
									}
									else if (result.status == executionManager.startExecutionError) {
										var errorMessage = "";
										for (var i = 0; i < result.startExecutionError.antbotFailedReasons.length; i++)
											errorMessage = errorMessage + "antbotName:" + result.startExecutionError.antbotFailedReasons[i].antbotName + ", 失败原因:" + result.startExecutionError.antbotFailedReasons[i].failedReason + "<br />"
										notificationService.showError(errorMessage);
									}
									else if (result.status == executionManager.utpCoreNetworkError) {
										var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
										notificationService.showError(errorMessage);
									}else if(result.status == executionManager.engineInitError){
										var errorMessage = "暂无可用执行器，请确认执行器是否登录或已有测试在执行中。"
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
								if (result.status == executionManager.unknownError || result.status == executionManager.configureError || result.status == executionManager.engineInitError
									|| result.status == executionManager.startExecutionError || result.status == executionManager.utpCoreNetworkError ||
									result.status == executionManager.terminated || result.status == executionManager.AntbotNotFoundError|| result.status == executionManager.completed || result.status == executionManager.stopped) {
									self.triggerStop = false;
								}
								self.executeState(result.status);
							} else {
								notificationService.showError('数据获取异常');
								return
							}
							if ( self.triggerStop ||
								(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork ||
									self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming ||
									self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
								))
								setTimeout(
									function () {
										self.getExecutionStatus();
									}, 500);
						}
						else {
							self.executeState(executionManager.throwException);
							notificationService.showError('获取验证状态失败!');
						}
					},
					function () {
						self.executeState(executionManager.throwException);
						notificationService.showError('获取验证状态失败!');
					}
				);
			}		
			this.executionId=0;
			this.sendCommand = function () {
				var engineStatus = self.viewManager.selectedMonitorTestsetActiveEngine;
				if (engineStatus == null) {
					notificationService.showError('执行器不存在！');
					return;
				}
				self.executionId = executionManager.getGuid();
				var transformConfig = JSON.parse(JSON.stringify(cmdConvertService.transformConfig));
				var obj = {
					scriptGroupId:self.viewManager.selectedMonitorTestsetActiveData.id,
					executionId: self.executionId,
					scriptIds: [self.viewManager.selectedMonitorTestsetActiveData.sendCommandScriptId],
					projectId: self.selectionManager.selectedProject().id,
					utpCoreIpAddress: engineStatus.utpIpAddress,
					utpCorePort: engineStatus.utpPort,
					executedByUserId: $.cookie("userName"),
					isSendEmail:false,
					isTestcaseCollect:true,
					isTestcasePersist:false,
					isTeststepCollect:true,
					isTeststepPersist:false,
					isTestdataCollect:true,
					isTestdataPersist:true,
					isAutoRun:true,
					isSend:true,
					isMonitordataPersistence:true,
					domainId:loginManager.getOrganization(),
					transformConfig:JSON.stringify(transformConfig)
				}
				self.utpService.sendMonitoringExecutionCommand(obj, self.sendMonitoringExecutionCommandSuccessFunction, self.sendMonitoringExecutionCommandErrorFunction);
			};

			this.showMonitorControlData = function () {
				if (self.selectedControlCmdInfo == null)
					return;
				if(self.selectedControlCmdInfo.controlDataType=="InputMessage"){
					if (cmdConvertService.needBigDataConfig(self.selectedControlCmdInfo.agent.antbotType)) {
						self.utpService.getProtocol(self.selectedControlCmdInfo.agent.protocolSignalId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
					}
					self.genericProtocolProcess();
				}
				//单信号数据或者信号组数据
				if (self.selectedControlCmdInfo.controlDataType == "SignalGroup"||self.selectedControlCmdInfo.controlDataType == "Signal"||self.selectedControlCmdInfo.controlDataType == "TmpSignalGroup") {
					if (cmdConvertService.signalNeedBigDataConfig(self.selectedControlCmdInfo.agent.antbotType)) {
						self.utpService.getProtocol(self.selectedControlCmdInfo.agent.protocolSignalId, self.signalGetProtocolSuccessFunction, self.getProtocolErrorFunction);
					}
				}				
			};
			//单信号协议数据解析
			this.signalGetProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					// self.protocolService.addProtocol(data.result);
					self.protocol = JSON.parse(data.result.bigdata);
					//遍历协议中的信号
					var signalTemp=[];
					for (var i = 0; i < self.protocol.signalMappingTable.length; i++) {
						//将协议中的logicName取出来
						signalTemp.push(self.protocol.signalMappingTable[i].logicName);
					}
					//判断是单信号还是信号组
					if (self.selectedControlCmdInfo.controlDataType == "Signal") {
						self.singleChannelPage({ data: signalTemp, value: self.selectedControlCmdInfo.controlDataType });
					}
					if (self.selectedControlCmdInfo.controlDataType == "SignalGroup") {
						self.groupSingleChannelPage({ data: signalTemp, value: self.selectedControlCmdInfo.controlDataType });
					}
					if (self.selectedControlCmdInfo.controlDataType == "TmpSignalGroup") {
						self.groupSingleChannelPage({ data: signalTemp, value: self.selectedControlCmdInfo.controlDataType });
					}
				}
				else
					self.getProtocolErrorFunction();
			};
			this.getProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.protocolService.addProtocol(data.result);
					self.protocol = JSON.parse(data.result.bigdata);
					self.genericFrameInfo.protocolId = data.result.id;
					self.genericProtocolProcess();
				}
				else
					self.getProtocolErrorFunction();
			};

			this.getProtocolErrorFunction = function () {
				notificationService.showError('获取协议文件失败');
			};

			this.updateScriptSuccessFunction = function (data) {
				if (data && data.status === 1) {
					notificationService.showSuccess('更新脚本成功');
				}
				else
					self.updateScriptErrorFunction();
			};

			this.updateScriptErrorFunction = function () {
				notificationService.showError('更新脚本失败');
			};

			this.composeCmd = function (originalCmd, paramInfo) {
				var cmdSegments = originalCmd.split(cmdConvertService.PARA_SEPARATOR);
				cmdSegments[2 + paramInfo.cmdIndex] = paramInfo.value;
				return cmdSegments.join(cmdConvertService.PARA_SEPARATOR);
			};
			this.saveScript = function (paramValue) {
				if(self.selectedControlCmdInfo == null)
					return;
				var commandItemList = self.currentScript.script.split(cmdConvertService.CMD_SEPARATOR);
				
				if(self.selectedControlCmdInfo.cmdIndex >= commandItemList.length)
					return;
				var updateCmdArray = [{"cmdIndex":self.selectedControlCmdInfo.cmdIndex, "updateParams":[{"index":self.selectedControlCmdInfo.updateParamsInfo[0], "value":paramValue}]}];
				self.utpService.updateFullScript(cmdConvertService.publicSaveScript(self.currentScript, updateCmdArray),self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
			};
			//树数据逻辑部分封装
			this.inputMessageTree=function(){

				self.genericFrameInfo.fields = [];
				self.genericFrameInfo.conditions = [];
				if (self.protocolNeedFieldSetting() && self.protocolNeedConditionSetting()) {
					// TODO, this condition should not exist
				}
				else if (self.protocolNeedFieldSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.fields.push({
									path: path,
									value: currrntValue
								});
							}
						});
					}
					else
						return;
				}
				else if (self.protocolNeedConditionSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.conditions.push({
									path: path,
									condition: currrntValue
								});
							}
						});
					}
					else
						return;
				}
				else if (self.protocolNeedFieldValueSetting() && self.protocolNeedFieldConditionSetting()) {

				}
				else if (self.protocolNeedFieldValueSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.fields.push({
									path: path,
									value: currrntValue,
								});
							}
						});
					}
					else
						return;
				}
				else if (self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.fields.push({
									path: path,
									value: currrntValue
								});
							}
						});
					}
					else
						return;
				}
				else if (self.protocolNeedFieldConditionSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.conditions.push({
									path: path,
									condition: currrntValue
								});
							}
						});
					}
					else
						return;
				}
				return true;
			} 
			//保存数据
			this.saveOneMonitorControlDataToScript = function () {
				if(self.selectedControlCmdInfo== null){return;}
				if(self.saveMonitorControlDataToScript(self.selectedControlCmdInfo.controlDataType)){
					return true;
				};
				return false;
			}
			this.saveMonitorControlDataToScript = function (monitorControlDataType) {

				if (monitorControlDataType == "InputMessage") {
					if (self.protocolService.validatorErrors.length > 0) {
						notificationService.showError('请输入合法数据');
						return;
					}
					if (self.inputMessageTree()) {
						var paramValue = "";
						if (self.protocolNeedConditionSetting() || self.protocolNeedFieldSetting()) {
							paramValue = self.composeFieldGroupSetting();
							self.saveScript(paramValue);
						} else if (self.protocolNeedFieldConditionSetting() || self.protocolNeedFieldValueSetting() || self.protocolNeedMessageNameSetting() || self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting()) {
							paramValue = self.composeFieldSetting();
							self.saveScript(paramValue);
						}
					} 
					else {
						return;
					}
				}
				else if (monitorControlDataType == "SignalGroup") {
					//信号组
					let tempgroup = {}
					document.querySelectorAll('#inputBox label').forEach((item, index) => {
						tempgroup[item.innerText] = document.querySelectorAll('#inputBox input')[index].value
					})
					if (JSON.stringify(tempgroup) === '{}') {
						notificationService.showError('请添加数据');
						return;
					}
					self.groupSaveSignalSet(tempgroup);
				}
				else if (monitorControlDataType == "TmpSignalGroup") {
					//临时信号组的数据
					let TmpSignalName=[];
					let TmpSignalvalue=[];
					document.querySelectorAll('#inputBox label').forEach((item, index) => {
						TmpSignalName.push(item.innerText)
						TmpSignalvalue.push(document.querySelectorAll('#inputBox input')[index].value)
					})
					//判断值是否为空
					if (JSON.stringify(TmpSignalvalue) === '[]') {
						notificationService.showError('请添加数据');
						return;
					}
					//判断TmpSignalvalule每个值是否为数字类型或者是否为空
					for (let i = 0; i < TmpSignalvalue.length; i++) {
						if (isNaN(TmpSignalvalue[i])) {
							notificationService.showError('请输入数字');
							return;
						}
						if (TmpSignalvalue[i] == '') {
							notificationService.showError('请输入数据');
							return;
						}
					}
					self.TmpgroupSaveSignalSet(TmpSignalName,TmpSignalvalue);
				}
				else if (monitorControlDataType == "Signal") {
					//单信号
					var channelNameValue = document.querySelector('#signalSelectivity').value;
					var signalValue = document.querySelector('#inputSignal').value;
					//判断signlvalue是否为int或者double类型或者为空
					if (signalValue == '') {
						notificationService.showError('请输入数据');
						return;
					}
					if (isNaN(signalValue)) {
						notificationService.showError('请输入数字');
						return;
					}
					self.monoSaveScript(channelNameValue, signalValue);
				}
				return true;
			};
			//临时信号组保存数据
			this.TmpgroupSaveSignalSet = function (TmpSignalName,TmpSignalvalue) {
				if (self.selectedControlCmdInfo == null)
					return;
				var commandItemList = self.currentScript.script.split(cmdConvertService.CMD_SEPARATOR);
				if (self.selectedControlCmdInfo.cmdIndex >= commandItemList.length)
					return;
				var updateCmdArray = [{ "cmdIndex": self.selectedControlCmdInfo.cmdIndex, "updateParams": [{ "index": self.selectedControlCmdInfo.updateParamsInfo[0], "value": JSON.stringify(TmpSignalName) }, { "index": self.selectedControlCmdInfo.updateParamsInfo[1], "value": JSON.stringify(TmpSignalvalue) }] }];
				self.utpService.updateFullScript(cmdConvertService.publicSaveScript(self.currentScript, updateCmdArray), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);

			};

			//信号组保存数据
			this.signalSetList = ko.observableArray([]);
			this.groupSaveSignalSet = function (tempgroup) {
				if (self.selectedControlCmdInfo == null)
					return;
				var commandItemList = self.currentScript.script.split(cmdConvertService.CMD_SEPARATOR);
				self.signalSetList.removeAll();
				for (var key in tempgroup) {
					var signalSet = {};
					signalSet.channelName = key;
					signalSet.channelValue = tempgroup[key];
					self.signalSetList.push(signalSet);
				}
				if (self.selectedControlCmdInfo.cmdIndex >= commandItemList.length)
					return;
				var updateCmdArray = [{ "cmdIndex": self.selectedControlCmdInfo.cmdIndex, "updateParams": [{ "index": self.selectedControlCmdInfo.updateParamsInfo[0], "value": JSON.stringify(self.signalSetList()) }] }];
				self.utpService.updateFullScript(cmdConvertService.publicSaveScript(self.currentScript, updateCmdArray), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);

			};

			// 单信号保存数据
			this.monoSaveScript = function (NameValue, signalValue) {
				if (self.selectedControlCmdInfo == null)
					return;
				var commandItemList = self.currentScript.script.split(cmdConvertService.CMD_SEPARATOR);

				if (self.selectedControlCmdInfo.cmdIndex >= commandItemList.length)
					return;
				var updateCmdArray = [{ "cmdIndex": self.selectedControlCmdInfo.cmdIndex, "updateParams": [{ "index": self.selectedControlCmdInfo.updateParamsInfo[0], "value": NameValue }, { "index": self.selectedControlCmdInfo.updateParamsInfo[1], "value": signalValue }] }];
				self.utpService.updateFullScript(cmdConvertService.publicSaveScript(self.currentScript, updateCmdArray), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
			};

			this.composeFieldGroupSetting = function () {
				if(self.selectedControlCmdInfo == null || self.selectedControlCmdInfo.updateParamsInfo.length != 1)
					return;
				var assistInputType = self.selectedControlCmdInfo.updateParamsInfo[0].assistInputType;
				var jsonValue = "";
				if (assistInputType) {
					if (assistInputType === 'messageFiledsConditionJson') {
						 jsonValue = JSON.stringify({
							messageName: self.currentGenericFrameMessageName,
							config: self.genericFrameInfo.conditions
						});
					}
					else if (assistInputType === 'messageFiledsValueJson') {
							jsonValue = JSON.stringify({
							messageName: self.currentGenericFrameMessageName,
							messageTemplate: null,
							config: self.genericFrameInfo.fields
						});
					}
				}
				return jsonValue;
			};

			this.composeFieldSetting = function () {
				
				if(self.selectedControlCmdInfo == null || self.selectedControlCmdInfo.updateParamsInfo.length != 1)
					return;
				var assistInputType = self.selectedControlCmdInfo.updateParamsInfo[0].assistInputType;
				
				var messageName = self.currentGenericFrameMessageName;
				var path = "";
				var value = "";
				var condition = "";
				if (self.protocolNeedFieldConditionSetting()) {
					path = self.genericFrameInfo.conditions[0].path;
					condition = self.genericFrameInfo.conditions[0].condition;
				}
				else if (self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSelectionSetting()) {
					path = self.genericFrameInfo.fields[0].path;
					value = self.genericFrameInfo.fields[0].value;
				}
				else if (self.protocolNeedMultipleFieldSelectionSetting()) {
					path = [];
					for (var i = 0; i < self.genericFrameInfo.fields.length; i++)
						path.push(self.genericFrameInfo.fields[i].path);
				}
				var jsonValue = "";
				if (assistInputType) {
					if (assistInputType) {
						if (assistInputType === 'messageName') {
							jsonValue = messageName;
						}
						else if (assistInputType === 'fieldLocator') {
							jsonValue = JSON.stringify(path);
						}
						else if (assistInputType === 'multiFieldLocator') {
							jsonValue = JSON.stringify(path);
						}
						else if (assistInputType === 'fieldValue') {
							jsonValue = JSON.stringify({
								messageName: messageName,
								messageTemplate: null,
								path, value
							})
						}
						else if (assistInputType === 'fieldCondition') {
							jsonValue = JSON.stringify({ messageName: self.currentGenericFrameMessageName, path, condition });
						}
					}
				}
				return jsonValue;
			};

			this.clearProtocolConfigView = function () {
				$('#monitorTestsetProtocolConfigView').html('');
			};

			this.initProtocolConfigView = function (message, keepAllFields, needSchemaCheck) {
				self.clearProtocolConfigView();
				self.onlySelection(false);
				var currentProtocolMode = self.protocolService.protocolModeEnum.valueSelectionSetting
				if (self.protocolNeedFieldSetting() && self.protocolNeedConditionSetting() || self.protocolNeedFieldValueSetting() && self.protocolNeedFieldConditionSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.valueConditionSetting;
				}
				else if (self.protocolNeedFieldSetting() || self.protocolNeedFieldValueSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting;
				}
				else if (self.protocolNeedFieldConditionSetting() || self.protocolNeedConditionSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.conditionSetting;
				}
				else if (self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() || self.protocolNeedMessageNameSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.fieldSelection;
					self.onlySelection(true);
				}
				var multipleSelection = false;
				if (self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting() || self.protocolNeedMultipleFieldSelectionSetting())
					multipleSelection = true;
				var options = self.protocolService.protocolOptionInit(self.protocol, message, currentProtocolMode, multipleSelection, keepAllFields, needSchemaCheck, message.fieldValues);
				const container = document.getElementById('monitorTestsetProtocolConfigView');
				var obj = self.protocolService.editedProtocolConfig;
				self.editor = new JSONEditor(container, options, obj);
				self.protocolService.editor = self.editor;
			};

			this.protocolConfigViewModeChange = function (state) {
				if (state)
					self.initProtocolConfigView(self.selectedMessage, true, false);
				else
					self.initProtocolConfigView(self.selectedMessage, false, true);
			};
			this.genericProtocolProcessfalse = function () {
				self.protocolNeedConditionSetting(false);
				self.protocolNeedFieldSetting(false);
				self.protocolNeedMessageNameSetting(false);
				self.protocolNeedFieldSelectionSetting(false);
				self.protocolNeedMultipleFieldSelectionSetting(false);
				self.protocolNeedFieldValueSetting(false);
				self.protocolNeedFieldConditionSetting(false);
			}
			// 单信号显示
			this.singleChannelPage = function (temp) {
				self.genericProtocolProcessfalse();
				self.canPage(false);
				self.exceptionCheck(false);
				self.clearProtocolConfigView();
				self.protocolFieldsconfig.removeAll();
				self.genericProtocolName('');
				self.displayGroupsSignals(false);
				self.displaySignal(true);
				let optionList = temp.data;
				document.querySelector('#signalSelectivity').innerHTML = optionList.map(item => `<option value="${item}">${item}</option>`).join('')
			};
			//信号组显示
			this.groupRepetition = ko.observableArray([]);
			this.groupSingleChannelPage = function (temp) {
				self.genericProtocolProcessfalse();
				self.canPage(false);
				self.exceptionCheck(false);
				self.displaySignal(false);
				self.displayGroupsSignals(true);
				self.clearProtocolConfigView();
				self.protocolFieldsconfig.removeAll();
				self.genericProtocolName('');
				let optionList = temp.data;
				document.querySelector('#groupSignalSelectivity').innerHTML = optionList.map(item => `<option value="${item}">${item}</option>`).join('')
				document.querySelector('#add').onclick = function () {
					let value = document.querySelector('#groupSignalSelectivity').value
					if (value == '' || self.groupRepetition().includes(value)) return
					self.groupRepetition.push(value)
					var node = document.createElement("div");
					node.innerHTML = `<div><small style="font-size: 150%;">通道:</small>&nbsp;<label style="font-size: 150%;">${value}</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<small style="font-size: 150%;">值:</small>&nbsp;<input type="text"> <button class="btn btn-danger">删除</button></div>`
					document.querySelector('#inputBox').appendChild(node)
				}
				document.querySelector('#inputBox').onclick = function (e) {
					if (e.target.nodeName == 'BUTTON') {
						//获取值
						let value = e.target.parentNode.querySelector('label').innerText
						e.target.parentNode.remove()
						self.groupRepetition.remove(value);
					}
				}
			}
			this.initGenericProtocolTree = function (data) {
				$('#monitorTestsetProtocolTreeview').html('');
				self.displaySignal(false);
				self.displayGroupsSignals(false);
				self.canPage(true);
				self.exceptionCheck(false);
				self.clearProtocolConfigView();
				self.protocolFieldsconfig.removeAll();
				self.genericProtocolName(data.value);
				webix.ready(function(){						
					self.genericProtocolTree = webix.ui({
						container:"monitorTestsetProtocolTreeview",
						view:"tree",
						type:"lineTree",
						select:true,
						template:"{common.icon()}&nbsp;#value#",
						data : data,
						ready:function(){
							this.closeAll();
							this.sort("value", "asc", "string");
						}
					});

					self.genericProtocolTree.attachEvent("onItemClick", function(id, e, node) {
						if(self.protocolNeedConditionSetting() || self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() || 
							self.protocolNeedFieldConditionSetting() || self.protocolNeedMessageNameSetting() ||
							self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSetting()){
								self.exceptionCheck(false);
								self.protocolFieldsconfig.removeAll();
								self.currentGenericFrameMessageName = "";
								for(var i = 0; i < self.protocol.messages.length; i++){
									if(self.protocol.messages[i].id === id){
										self.selectedMessage = JSON.parse(JSON.stringify(self.protocol.messages[i]));
										self.currentGenericFrameMessageName = self.selectedMessage.messageName;								
										self.genericFrameInfo.id = self.selectedMessage.id;
										self.selectedMessage.fieldValues = null;
										self.genericCommandField(self.selectedMessage.messageName);											
										self.initProtocolConfigView(self.selectedMessage, true, false);
										if(self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSetting()){
										}
										break;
									}
								}
							$('#monitorTestsetExceptionCheckConfig').bootstrapSwitch("state", false);
							$('#monitorTestsetExceptionCheckConfig').on('switchChange.bootstrapSwitch', function (event, state) {
								self.protocolConfigViewModeChange(state);
							});
						}
					});
				});
			};

			this.protocolNeedConditionSetting = ko.observable(false);
			this.protocolNeedFieldSetting = ko.observable(false);
			this.protocolNeedMessageNameSetting = ko.observable(false);
			this.protocolNeedFieldSelectionSetting = ko.observable(false);
			this.protocolNeedMultipleFieldSelectionSetting = ko.observable(false);
			this.protocolNeedFieldValueSetting = ko.observable(false);
			this.protocolNeedFieldConditionSetting = ko.observable(false);

			this.genericProtocolProcess = function () {
				self.protocolNeedConditionSetting(false);
				self.protocolNeedFieldSetting(false);
				self.protocolNeedMessageNameSetting(false);
				self.protocolNeedFieldSelectionSetting(false);
				self.protocolNeedMultipleFieldSelectionSetting(false);
				self.protocolNeedFieldValueSetting(false);
				self.protocolNeedFieldConditionSetting(false);

				if(self.selectedControlCmdInfo == null || self.selectedControlCmdInfo.updateParamsInfo.length != 1)
					return;
				var assistInputType = self.selectedControlCmdInfo.updateParamsInfo[0].assistInputType;
				
				if (assistInputType) {
					if (assistInputType === 'messageFiledsValueJson')
						self.protocolNeedFieldSetting(true);
					else if (assistInputType === 'messageFiledsConditionJson')
						self.protocolNeedConditionSetting(true);
					else if (assistInputType === 'messageName')
						self.protocolNeedMessageNameSetting(true);
					else if (assistInputType === 'fieldLocator')
						self.protocolNeedFieldSelectionSetting(true);
					else if (assistInputType === 'multiFieldLocator')
						self.protocolNeedMultipleFieldSelectionSetting(true);
					else if (assistInputType === 'fieldValue')
						self.protocolNeedFieldValueSetting(true);
					else if (assistInputType === 'fieldCondition')
						self.protocolNeedFieldConditionSetting(true);
				}
				if (self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting() || self.protocolNeedMessageNameSetting() ||
					self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() ||
					self.protocolNeedFieldValueSetting() || self.protocolNeedFieldConditionSetting())
					self.genericProtocolFieldSettingProcess();
			};

			this.genericProtocolFieldSettingProcess = function () {
				if (self.protocol==null){
					return;
				}
				var protocol = self.protocol;
				var root = {
					id: protocol.protocolName,
					value: protocol.protocolName,
					data: []
				};

				for (var i = 0; i < protocol.messages.length; i++) {
					var id = protocol.messages[i].messageName;
					protocol.messages[i].id = id ? id : i;
					var equiNode = {
						id: id ? id : i,
						value: protocol.messages[i].messageName,
						data: []
					}
					root.data.push(equiNode);
				}
				self.initGenericProtocolTree(root);
			};

			this.monitorControlDataChanged = function (obj, event) {
				if (self.selectedControlCmdInfo == undefined)
					return;

				if (event.originalEvent)// user changed
					self.showMonitorControlData();
				else { // program changed

				}
			};

			this.getScriptSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.currentScript = data.result;
					if (self.currentScript.script != null && self.currentScript.script != '') {
						self.curControlCmdInfoArray = cmdConvertService.agentControlDataCmdAnalysis(self.currentScript.script);
						if (self.curControlCmdInfoArray == null || self.curControlCmdInfoArray.length == 0) {
								self.containControlData(false);
								notificationService.showError('该脚本不存在控制量，请重新设定！');
								return;							
						}
						else {
							self.monitorControlData.removeAll();
							for(let i = 0; i < self.curControlCmdInfoArray.length; i++){
								self.monitorControlData.push({
									name: self.curControlCmdInfoArray[i].controlDataName,
									value: self.curControlCmdInfoArray[i]
								});	
							}
							//加载项目时，清空信号组数组
							self.groupRepetition.removeAll();
							self.containControlData(true);
							self.selectedControlCmdInfo = self.monitorControlData()[0].value;
							self.showMonitorControlData();
						}
					}
				}
				else
					self.getScriptErrorFunction();
			};

			this.getScriptErrorFunction = function () {
				notificationService.showError('获取脚本信息失败');
			};

			this.getScript = function () {
				if (self.viewManager.selectedMonitorTestsetActiveData && self.viewManager.selectedMonitorTestsetActiveData.sendCommandScriptId) {
					self.utpService.getFullScript(selectionManager.selectedProject().id, self.viewManager.selectedMonitorTestsetActiveData.sendCommandScriptId, self.getScriptSuccessFunction, self.getScriptErrorFunction);
				}
			};

			this.activate = function () { };

			this.detached = function () {

			};

			// The data-binding shall happen after DOM element be attached.
			this.attached = function (view, parent) {
				self.selectedMonitorTestSet = self.viewManager.selectedMonitorTestsetActiveData;
				self.selectedMonitorTestSetName(self.viewManager.selectedMonitorTestsetActiveData.name);
				self.getScript();
			};
		}
		return new MonitorTestSetControlViewModel();
	});
