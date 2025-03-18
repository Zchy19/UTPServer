define(['jquery', 'durandal/plugins/http', 'komapping', 'services/executionManager', 'services/projectManager', 'services/protocolService', 'services/loginManager', 'services/selectionManager', 'services/viewManager',
	'services/utpService', 'services/ursService', 'services/cmdConvertService', 'services/notificationService', 'services/utilityService', 'jsoneditor', 'blockUI', 'bootstrapSwitch', 'knockout', 'knockout-sortable', 'knockstrap', 'lodash', 'services/specialTestService'],
	function ($, $http, komapping, executionManager, projectManager, protocolService, loginManager, selectionManager, viewManager, utpService, ursService, cmdConvertService, notificationService, utilityService, JSONEditor, blockUI, bootstrapSwitch, ko, sortable, knockstrap, _,specialTestService) {

		function SpecialTestOneControlViewModel() {
			var self = this;
			this.selectionManager = selectionManager;
			this.viewManager = viewManager;
			this.pressureTestSummaryChart = null;
			this.projectManager = projectManager;
			this.utpService = utpService;
			this.protocolService = protocolService;
			this.cmdConvertService = cmdConvertService;
			this.selectedSpecialTestOneset = null;
			this.targetEngineCandidates = ko.observableArray([]);
			this.selectTargetEngineId = ko.observable();
			this.engineStatus = null;
			this.executionId = null;
			this.isExecuting = ko.observable(false);
			this.engineName = ko.observable();
			this.allEngineNames = ko.observableArray([]);
			this.specialTestService = specialTestService;

			this.clearAllDate = this.specialTestService.clearALL.subscribe((newValue) => {
				if (newValue === true) {
					self.clearDate();
					self.specialTestService.clearALL(false);
				}
			});

			this.startoneSubscription = this.specialTestService.startone.subscribe((newValue) => {
				if (newValue === true) {
					new Promise((resolve, reject) => {
						try {
							self.prepareExecution();
							resolve();
						} catch (error) {
							console.error("prepareExecution 执行出错:", error);
							reject(error);
						}
					}).then(() => {
						self.specialTestService.startone(false);
					}).catch((error) => {
						console.error("prepareExecution 执行出错:", error);
						self.specialTestService.startone(false);
					});
				}
			});
			
			this.clearDate = function(){
				for (let i = 0; i < self.outputSpecialTestOneControlData().length; i++) {
					for (let j = 0; j < self.outputSpecialTestOneControlData()[i].length; j++) {
						self.outputSpecialTestOneControlData()[i][j].outputValue(null);
					}
				}
			};

			this.prepareExecution = function () {
				// 清除数据
				for (let i = 0; i < self.outputSpecialTestOneControlData().length; i++) {
					for (let j = 0; j < self.outputSpecialTestOneControlData()[i].length; j++) {
						self.outputSpecialTestOneControlData()[i][j].outputValue(null);
					}
				}
				// 设置按钮为不可点击状态
				self.specialTestService.isExecuting(true);
				var engineName = self.engineName();
				if (engineName == null) {
					notificationService.showError('请选择执行器！');
					self.specialTestService.haveEngine(false);
					self.specialTestService.isExecuting(false);
					self.specialTestService.flagone(false);
					return;
				}
				// 遍历 allEngineNames 数组
				for (var i = 0; i < self.allEngineNames().length; i++) {
					var engine = self.allEngineNames()[i];
					if (engine.engineName === engineName) {
						self.engineStatus = engine;
						self.viewManager.selectedMonitorTestsetActiveEngine = engine;
						self.stratExecution();
						break;
					}
				}
			};

			this.stratExecution = function () {
				var engineStatus = self.viewManager.selectedMonitorTestsetActiveEngine;
				if (engineStatus == null) {
					notificationService.showError('执行器不存在！');
					self.specialTestService.isExecuting(false);
					self.specialTestService.flagone(false);
					return;
				}
				self.executionId = executionManager.getGuid();
				var obj = {
					executionId: self.executionId,
					executionName: 'latest try execution',
					executedByUserId: $.cookie("userName"),
					domainId: loginManager.getOrganization(),
					utpCoreIpAddress: self.engineStatus.utpIpAddress,
					utpCorePort: self.engineStatus.utpPort,
					isDummyRun: false,
					scriptIds: [self.selectedSpecialTestOneset.scriptId],
					scriptGroupId: "0",
					testObject: "",
					projectId: self.selectionManager.selectedProject().id,
					isAutoRun: true,
					isSendEmail: false,
					isTestcaseCollect: true,
					isTestcasePersist: false,
					isTeststepCollect: true,
					isTeststepPersist: false,
					isTestdataCollect: true,
					isTestdataPersist: false,
				}
				self.utpService.prepareExecutionScripts(obj, self.startExecutionScriptSuccessFunction, self.prepareExecutionErrorFunction);
			};
			this.isStartExecution = ko.observable(false);
			this.executeState = ko.observable(executionManager.notStarted);
			this.triggerStop = false;
			this.startExecutionScriptSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.triggerStop = true;
					// notificationService.showSuccess('正在准备发送数据...')	
					self.startTime = null;
					self.getExecutionStatus();
					// notificationService.showSuccess('发送控制数据成功！');
				} else {
					self.prepareExecutionErrorFunction(data.result);
				}
			};
			this.prepareExecutionErrorFunction = function (msg) {
				if (msg == "ExceedMaxExecutionCount") {
					notificationService.showError('执行已超过每日最大次数限制,请安装相应许可');
					//设置为可点击
					self.specialTestService.isExecuting(false);
					self.specialTestService.flagone(false);
				} else {
					notificationService.showProgressError('执行准备失败。', 100);
				}
			};
			this.startTime = null;
			this.getExecutionStatus = function () {
				self.utpService.getExecutionModel(self.executionId,
					function (data) {
						if (data && data.status === 1) {
							var result = data.result;
							if (result.status != undefined) {
								if (self.executeState() != result.status) {
									if (result.status == executionManager.starting) {
										// notificationService.showSuccess('发送数据启动中...');
									}
									else if (result.status == executionManager.running) {
										// notificationService.showSuccess('发送数据执行中...');
									}
									else if (result.status == executionManager.stopped) {
										notificationService.showSuccess('发送数据已停止。');
									}
									else if (result.status == executionManager.completed) {
										// notificationService.showSuccess('发送数据成功！');
										self.startTime = result.private_startExecutionDateTime;
										self.getExecutionDataByExecutionId();
									}
									else if (result.status == executionManager.terminated) {
										notificationService.showSuccess('发送数据已终止。');
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									}
									else if (result.status == executionManager.startExecutionError) {
										var errorMessage = "";
										for (var i = 0; i < result.startExecutionError.antbotFailedReasons.length; i++)
											errorMessage = errorMessage + "antbotName:" + result.startExecutionError.antbotFailedReasons[i].antbotName + ", 失败原因:" + result.startExecutionError.antbotFailedReasons[i].failedReason + "<br />"
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									}
									else if (result.status == executionManager.utpCoreNetworkError) {
										var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);

									} else if (result.status == executionManager.engineInitError) {
										var errorMessage = "暂无可用执行器，请确认执行器是否登录或已有测试在执行中。"
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									}
									else if (result.status == executionManager.unknownError) {
										var errorMessage = "未知错误。"
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									}
									else if (result.status == executionManager.configureError) {
										var errorMessage = "引擎配置错误。"
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									}
									else if (result.status == executionManager.AntbotNotFoundError) {
										var errorMessage = "测试机器人未找到。"
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									} else if (result.status == executionManager.analyzeScriptError) {
										var errorMessage = "分析脚本错误, 脚本名称: " + result.analyzeScriptError.analyzeScriptFailedReason.scriptName + ",系统ID：" + result.analyzeScriptError.analyzeScriptFailedReason.scriptId + "，行号：" + result.analyzeScriptError.analyzeScriptFailedReason.errorline + "，错误信息：" + result.analyzeScriptError.analyzeScriptFailedReason.message;
										notificationService.showError(errorMessage);
										self.specialTestService.isExecuting(false);
										self.specialTestService.flagone(false);
									}
								}
								if (result.status == executionManager.analyzeScriptError || result.status == executionManager.unknownError || result.status == executionManager.configureError || result.status == executionManager.engineInitError
									|| result.status == executionManager.startExecutionError || result.status == executionManager.utpCoreNetworkError ||
									result.status == executionManager.terminated || result.status == executionManager.AntbotNotFoundError || result.status == executionManager.completed || result.status == executionManager.stopped) {
									self.triggerStop = false;
								}
								self.executeState(result.status);
							} else {
								notificationService.showError('数据获取异常');
								self.specialTestService.isExecuting(false);
								self.specialTestService.flagone(false);
								return
							}
							if (self.triggerStop ||
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
			this.sumgetExecutionDataByExecutionIdError = 0;
			// 获取当前执行数据并解析
			this.getExecutionDataByExecutionIdSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					if (data.result.length > 0) {
						//获取最后一个执行数据
						var executionDataResult = data.result[data.result.length - 1];
						if (executionDataResult.uploadStatus != 1) {
							self.sumgetExecutionDataByExecutionIdError++;
							if (self.sumgetExecutionDataByExecutionIdError > 10) {
								self.specialTestService.isExecuting(false);
								self.specialTestService.flagone(false);
								notificationService.showError('获取执行数据失败！');
								self.sumgetExecutionDataByExecutionIdError = 0;
								return;
							} else {
								setTimeout(function () {
									self.getExecutionDataByExecutionId();
								}, 1000);
								return;
							}
						}
					}
					self.sumgetExecutionDataByExecutionIdError = 0;
					// 对数组 data.result 进行遍历
					for (let j = 0; j < data.result.length; j++) {
						var executionDataResult = data.result[j];
						var executionDataResultJsonDatas = JSON.parse(executionDataResult.jsonData);
						for (let k = 0; k < executionDataResultJsonDatas.length; k++) {
							var executionDataResultJsonData = executionDataResultJsonDatas[k];
							// 对根据用例解析的数组 outputSpecialTestOneControlData 进行遍历
							for (let i = 0; i < self.outputSpecialTestOneControlData().length; i++) {
								for (let l = 0; l < self.outputSpecialTestOneControlData()[i].length; l++) {
									var outputSpecialTestOneControlData = self.outputSpecialTestOneControlData()[i][l];
									if (outputSpecialTestOneControlData.outputName === executionDataResultJsonData.varName) {
										if (executionDataResultJsonData.varValue == "NILL") {
											outputSpecialTestOneControlData.outputValue(null);
										}
										outputSpecialTestOneControlData.outputValue(executionDataResultJsonData.varValue);
									}
								}
							}
						}
					}
					self.specialTestOneDataAdd();
					self.specialTestService.isExecuting(false);
					self.specialTestService.flagone(false);
				} else {
					self.getExecutionDataByExecutionIdErrorFunction();
				}
			};
			//执行完成后添加数据
			this.specialTestOneDataAdd = function () {
				var data = {
					specialTestId: self.selectedSpecialTestOneset.id,
					jsonData: JSON.stringify(komapping.toJS(self.outputSpecialTestOneControlData())),
					startTime: self.startTime
				}
				self.utpService.createSpecialTestData(data, self.specialTestOneDataAddSuccessFunction, self.specialTestOneDataAddErrorFunction);
			};
			this.specialTestOneDataAddSuccessFunction = function (data) {
				if (data && data.status === 1) {
					// notificationService.showSuccess('添加执行数据成功！');
				} else {
					self.specialTestOneDataAddErrorFunction();
				}
			}
			this.specialTestOneDataAddErrorFunction = function () {
				// notificationService.showError('添加执行数据失败！');
			};
			this.getExecutionDataByExecutionIdErrorFunction = function () {
				self.specialTestService.isExecuting(false);
				self.specialTestService.flagone(false);
				notificationService.showError('获取执行数据失败！');
			};

			this.getExecutionDataByExecutionId = function () {
				self.utpService.getExecutionDataByExecutionId(self.executionId, self.getExecutionDataByExecutionIdSuccessFunction, self.getExecutionDataByExecutionIdErrorFunction);
			}
			this.outputNames = ko.observableArray([]);
			this.outputHistorys = ko.observableArray([]);
			this.getOutputHistoryConfig = function () {
				$('#specialTestOneExecutoryModalLabel').modal('show');
				self.utpService.getSpecialTestDatasBySpecialTestId(self.selectedSpecialTestOneset.id, self.getOutputHistoryConfigSuccessFunction, self.getOutputHistoryConfigErrorFunction);
			}
			this.getOutputHistoryConfigSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					//遍历data.result数组
					var outputHistorys = data.result;
					//清空数组
					self.outputHistorys.removeAll();
					self.outputNames.removeAll();
					for (var i = 0; i < outputHistorys.length; i++) {
						var outputHistory = outputHistorys[i];
						var startTime = outputHistory.startTime;
						var outputHistoryJsonDataArray = JSON.parse(outputHistory.jsonData);
						//对数据outputHistoryJsonData进行遍历
						var jsonData = [];
						for (let j = 0; j < outputHistoryJsonDataArray.length; j++) {
							var outputHistoryJsonDatas = outputHistoryJsonDataArray[j];
							//对数据outputHistoryJsonData进行遍历
							for (var k = 0; k < outputHistoryJsonDatas.length; k++) {
								var outputHistoryJsonData = outputHistoryJsonDatas[k];
								//取出outputHistoryJsonData的
								var varName = outputHistoryJsonData.outputName;
								var varValue = outputHistoryJsonData.outputValue;
								//将varValue存入jsonData
								jsonData.push(varValue);
								if (i == 0) {
									self.outputNames.push(varName);
								}
							}
						}
						if (i == 0) {
							self.outputNames.push("开始时间")
						}
						jsonData.push(startTime);
						self.outputHistorys.push(jsonData);
					}
				} else {
					self.getOutputHistoryConfigErrorFunction();
				}

			};
			this.getOutputHistoryConfigErrorFunction = function () {
				notificationService.showError('获取历史数据失败！');
			}


			this.currentScript = null;
			this.curControlCmdInfoArray = null;
			this.outputSpecialTestOneControlData = ko.observableArray([]);
			this.inputSpecialTestOneControlData = ko.observableArray([]);
			//获取脚本信息
			this.getScriptSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.currentScript = data.result;
					if (self.currentScript.script != null && self.currentScript.script != '') {
						// 解析脚本
						self.curControlCmdInfoArray = self.cmdConvertService.noncommandDataAnalysis(self.currentScript.script);
						if (self.curControlCmdInfoArray == null || self.curControlCmdInfoArray.length == 0) {
							notificationService.showError('该脚本不存在控制量，请重新设定！');
							return;
						} else {
							self.outputSpecialTestOneControlData.removeAll();
							self.inputSpecialTestOneControlData.removeAll();
							let group = [];
							for (let i = 0; i < self.curControlCmdInfoArray.length; i++) {
								// 判断是否存在 monitorDataName
								if (self.curControlCmdInfoArray[i].monitorDataName) {
									group.push({
										outputName: self.curControlCmdInfoArray[i].monitorDataName,
										outputValue: ko.observable()
									});

									// 每四个一组，添加到outputSpecialTestOneControlData
									if (group.length === 4) {
										self.outputSpecialTestOneControlData.push(group);
										group = [];
									}
								}
							}

							// 如果最后一组不足三个，也添加到 outputSpecialTestOneControlData
							if (group.length > 0) {
								self.outputSpecialTestOneControlData.push(group);
							}
						}
					}
				} else {
					self.getScriptErrorFunction();
				}
			};
			this.getScriptErrorFunction = function () {
				notificationService.showError('获取用例信息失败');
			};

			//获取关联用例
			this.getScript = function () {
				if (self.viewManager.selectedSpecialTestsetActiveData && self.viewManager.selectedSpecialTestsetActiveData.scriptId) {
					self.utpService.getFullScript(selectionManager.selectedProject().id, self.viewManager.selectedSpecialTestsetActiveData.scriptId, self.getScriptSuccessFunction, self.getScriptErrorFunction);
				}
			};
			//获取所有的执行器
			this.getExecutionNode = function () {
				// notificationService.showProgressSuccess('探测可用的执行器实例...', 0);
				self.allEngineNames.removeAll();
				ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager.getAuthorizationKey(), self.getExecutionNodeSuccessFunction, self.getExecutionNodeErrorFunction);
			};
			//刷新执行器
			this.refreshExecutionNode = function () {
				self.getExecutionNode();
				// notificationService.showSuccess('刷新执行器成功。');
			}

			//获取所有的执行器成功
			this.getExecutionNodeSuccessFunction = function (response) {
				if (response && response.result && response.engineStatus) {
					// notificationService.showProgressSuccess('获取执行器地址成功。', 100);
					if (response.engineStatuses && response.engineStatuses.length > 0) {
						//筛选执行器名称和专项测试名称一致的执行器
						var engineStatuses = response.engineStatuses;
						var selectedSpecialTestOnesetName = self.selectedSpecialTestOneset.name
						//根据"-""分割，取第一个元素"
						selectedSpecialTestOnesetName = selectedSpecialTestOnesetName.split("-")[0];
						var engineNametemp = ""
						for (let i = 0; i < engineStatuses.length; i++) {
							engineNametemp = engineStatuses[i].engineName.split("-")[0]
							if (engineNametemp === selectedSpecialTestOnesetName) {
								self.allEngineNames.push(engineStatuses[i]);
							}
						}

						// self.allEngineNames(response.engineStatuses);
						//设置默认执行器
						if (self.allEngineNames().length > 0) {
							self.engineName(self.allEngineNames()[0].engineName);
						}
						// self.engineName(self.allEngineNames()[0].engineName);
					}
				} else {
					self.allEngineNames([]);
					if (response.returnMessage)
						self.getExecutionNodeErrorFunction(response.returnMessage);
					else
						self.getExecutionNodeErrorFunction("获取执行器地址失败");
				}
			}
			this.nextAction = function () {
				if (self.allEngineNames().length == 0) {
					notificationService.showError('没有可用的执行器！');
					return;
				}
				// 清空数据
				for (let i = 0; i < self.outputSpecialTestOneControlData().length; i++) {
					for (let j = 0; j < self.outputSpecialTestOneControlData()[i].length; j++) {
						self.outputSpecialTestOneControlData()[i][j].outputValue(null);
					}
				}
				var currentEngineIndex = self.allEngineNames().findIndex(engine => engine.engineName === self.engineName());
				if (currentEngineIndex < self.allEngineNames().length - 1) {
					self.engineName(self.allEngineNames()[currentEngineIndex + 1].engineName);
				} else {
					self.engineName(self.allEngineNames()[0].engineName);
				}
			};

			this.previousAction = function () {
				if (self.allEngineNames().length == 0) {
					notificationService.showError('没有可用的执行器！');
					return;
				}
				// 清空数据
				for (let i = 0; i < self.outputSpecialTestOneControlData().length; i++) {
					for (let j = 0; j < self.outputSpecialTestOneControlData()[i].length; j++) {
						self.outputSpecialTestOneControlData()[i][j].outputValue(null);
					}
				}
				var currentEngineIndex = self.allEngineNames().findIndex(engine => engine.engineName === self.engineName());
				if (currentEngineIndex > 0) {
					self.engineName(self.allEngineNames()[currentEngineIndex - 1].engineName);
				} else {
					self.engineName(self.allEngineNames()[self.allEngineNames().length - 1].engineName);
				}
			};
			this.getExecutionNodeErrorFunction = function (msg) {
				notificationService.showError(msg);
			}

			this.activate = function () {

			};

			this.detached = function () {

			};
			// The data-binding shall happen after DOM element be attached.
			this.attached = function (view, parent) {
				self.specialTestService.isExecuting(false);
				self.specialTestService.flagone(false);
				self.selectedSpecialTestOneset = self.viewManager.selectedSpecialTestsetActiveData;
				//获取脚本信息
				self.getScript();
				//获取所有的执行器
				self.getExecutionNode();
			};
		}
		return new SpecialTestOneControlViewModel();
	});
