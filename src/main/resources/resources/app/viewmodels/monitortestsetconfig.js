define(['jquery', 'durandal/plugins/http', 'komapping', 'services/executionManager', 'services/projectManager', 'services/protocolService', 'services/loginManager', 'services/selectionManager', 'services/viewManager',
	'services/utpService', 'services/ursService', 'services/cmdConvertService', 'services/notificationService', 'services/utilityService', 'jsoneditor', 'blockUI', 'bootstrapSwitch', 'knockout', 'knockout-sortable', 'knockstrap', 'lodash'],
	function ($, $http, komapping, executionManager, projectManager, protocolService, loginManager, selectionManager, viewManager, utpService, ursService, cmdConvertService, notificationService, utilityService, JSONEditor, blockUI, bootstrapSwitch, ko, sortable, knockstrap, _) {

		function MonitorTestSetConfigViewModel() {
			var self = this;
			this.selectionManager = selectionManager;
			this.viewManager = viewManager;
			this.pressureTestSummaryChart = null;
			this.projectManager = projectManager;
			this.utpService = utpService;
			this.protocolService = protocolService;
			this.cmdConvertService = cmdConvertService;

			this.editingMonitorTestSetConfig = {
				id: ko.observable(0),
				projectId: ko.observable(self.selectionManager.selectedProject().id),
				name: ko.observable('默认监控集'),
				description: ko.observable(''),
				type: ko.observable(''),
				startScriptId: ko.observable(),
				sendCommandScriptId: ko.observable(),
				stopScriptId: ko.observable(),
				antBot: ko.observable(),
				monitorConfig: ko.observable('')
			};

			// 辅助方法：设置 monitorConfig 属性
			this.setMonitorConfig = function (key, value) {
				let config = self.getMonitorConfig();
				config[key] = value;
				self.editingMonitorTestSetConfig.monitorConfig(JSON.stringify(config));
			};

			// 辅助方法：获取 monitorConfig 属性
			this.getMonitorConfig = function () {
				let config = self.editingMonitorTestSetConfig.monitorConfig();
				return config ? JSON.parse(config) : {};
			};

			this.monitorTestSetActionGroups = ko.observableArray([]);
			this.selectedMonitorTestSetActionGroup = ko.observable(); // 选中的测试行为

			this.saveFlag = ko.observable(false); // 保存配置标记
			this.monitorRange = ko.observableArray([]); // 监控范围字段
			this.selectedMonitorRange = ko.observable();
			this.showMonitorRange = ko.observable(false); // 是否显示监控范围选择

			this.configMessageFiled = ko.observable(false);
			this.messageName = ko.observable('消息名');
			this.fieldName = ko.observable('字段名');

			this.isEditMode = ko.observable(false);

			this.filteredAntbotTypes = ko.observableArray([]);// 符合要求的tool_type
			this.filteredAntbots = ko.observableArray([]); // 符合tool_type的机器人

			this.selectedMonitorTestSetAntbotChanged = function () {
				// 清空原有监控范围
				self.monitorRange.removeAll();
				self.configMessageFiled(false);
				let selectedAntbotName = self.editingMonitorTestSetConfig.antBot();

				let selectedAntbot = self.projectManager.agentsConfigData().find(
					item => item.antbotName === selectedAntbotName
				);
				// 检查是否找到Antbot
				if (!selectedAntbot) {
					self.monitorTestSetActionGroups([]); // 清空动作组
					self.selectedMonitorTestSetActionGroup(null); // 重置选中项
					return;
				}

				let targetAntbot = self.projectManager.showAntbotTypes().find(
					item => item.name === selectedAntbot.antbotType
				);

				if (targetAntbot.preDefinedCmdSeqs) {
					let cmdSeqs;
					try {
						cmdSeqs = JSON.parse(targetAntbot.preDefinedCmdSeqs);
					} catch (e) {
						console.error("解析preDefinedCmdSeqs失败:", e);
						return;
					}
					self.monitorTestSetActionGroups(cmdSeqs); // 替换整个数组
				}
			};

			this.selectedMonitorTestSettActionGroupChanged = function () {
				let actionGroup = self.selectedMonitorTestSetActionGroup()
				if (actionGroup.type == 'BusDataAcquisition' || actionGroup.type == 'MsgFieldAcquisition'
					|| actionGroup.type == 'OneAiSignalAcquisition' || actionGroup.type == 'FixAiSignalsAcquisition' || actionGroup.type == 'TempAiSignalsAcquisition'
				) {
					self.editingMonitorTestSetConfig.type(1);
				} else if (actionGroup.type == 'DataTransmit' || actionGroup.type == 'OneAoSignalExcitation' || actionGroup.type == 'GroupAoSignalExcitation') {
					self.editingMonitorTestSetConfig.type(2);
				}

				if (self.selectedMonitorTestSetActionGroup().group === '消息字段采集') {
					self.configMessageFiled(true);
				} else {
					self.configMessageFiled(false);
				}
			};

			this.removeConfig = function () {
				console.log("执行成功")
			};

			this.saveMonitorSetConfig = async function () {

				if (self.editingMonitorTestSetConfig.antBot() == null) {
					notificationService.showError('请选择机器人');
					return;
				}

				//生成脚本
				let scriptCreated = await self.generateMonitorScript(self.editingMonitorTestSetConfig);

				if (!scriptCreated) { // 脚本创建失败
					notificationService.showError('保存配置错误,请联系客服');
					return;
				}

				self.viewManager.selectedMonitorTestsetActiveData = ko.toJS(self.editingMonitorTestSetConfig); // 执行的监控测试集对象
				self.refreshPages()
				notificationService.showSuccess('保存配置成功');
				self.saveFlag(true);
			}

			this.selectedMonitorTestSet = null;
			this.showDetail = function () {
				self.viewManager.monitorTestsetControlActivePage('');
				self.viewManager.monitorTestsetRunActivePage('');
				if (self.projectManager.isMonitoringResult) {
					self.viewManager.monitorTestsetControlActivePage('');
					self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
				} else {
					if (self.selectedMonitorTestSet.type === 0) {
						self.viewManager.monitorTestsetControlActivePage('app/viewmodels/monitortestsetcontrol');
						self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
					} else if (self.selectedMonitorTestSet.type === 1) {
						self.viewManager.monitorTestsetControlActivePage('');
						self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
					} else if (self.selectedMonitorTestSet.type === 2) {
						self.viewManager.monitorTestsetControlActivePage('app/viewmodels/monitortestsetcontrol');
						self.viewManager.monitorTestsetRunActivePage('');
					}
				}
			}

			// 新增公共方法：强制刷新页面逻辑
			this.refreshPages = function () {
				self.selectedMonitorTestSet = self.viewManager.selectedMonitorTestsetActiveData;
				self.showDetail();
			};

			// 脚本自动生成
			this.generateMonitorScript = async function () {
				const antbotName = self.editingMonitorTestSetConfig.antBot()

				const startScript = {
					id: self.isEditMode() ? self.editingMonitorTestSetConfig.startScriptId() : 0,
					projectId: self.selectionManager.selectedProject().id,
					name: antbotName + '-startScript',
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'testcase'
				};

				const runningScript = {
					id: self.isEditMode() ? self.editingMonitorTestSetConfig.sendCommandScriptId() : 0,
					projectId: self.selectionManager.selectedProject().id,
					name: antbotName + '-runningScript',
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'testcase'
				};

				const stopScript = {
					id: self.isEditMode() ? self.editingMonitorTestSetConfig.stopScriptId() : 0,
					projectId: self.selectionManager.selectedProject().id,
					name: antbotName + '-stopScript',
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'testcase'
				};
				let actionGroup = self.selectedMonitorTestSetActionGroup()
				actionGroup.actions.forEach(action => {
					switch (action.name) {
						case '开始采集':
							startScript.name = antbotName + action.name;
							startScript.script = self.createScript(action.cmdSeqs);
							break;
						case '停止采集':
							stopScript.name = antbotName + action.name;
							stopScript.script = self.createScript(action.cmdSeqs);
							break;
						default:
							runningScript.name = antbotName + action.name;
							runningScript.script = self.createScript(action.cmdSeqs);
							break;
					}
				});
				try {
					const startScriptId = await self.createScriptPromise(startScript); // 等待创建完成
					self.editingMonitorTestSetConfig.startScriptId(startScriptId); // 设置ID

					const stopScriptId = await self.createScriptPromise(stopScript); // 等待创建完成
					self.editingMonitorTestSetConfig.stopScriptId(stopScriptId); // 设置ID


					const runningScriptId = await self.createScriptPromise(runningScript); // 等待创建完成
					self.editingMonitorTestSetConfig.sendCommandScriptId(runningScriptId); // 设置ID
					self.isEditMode(true);
					return true;
				} catch (error) {
					console.error('脚本创建失败:', error);
					notificationService.showError('脚本创建失败，请重试');
					return false; // 失败时返回false
				}
			};

			// 辅助函数：生成脚本script中的内容
			this.createScript = function (cmdSeqs) {
				let antBot = "[[" + self.editingMonitorTestSetConfig.antBot() + "]]";
				let finalScript = [];

				// 变量替换映射表（可根据需要扩展）
				const VARIABLE_MAP = {
					'%ANTBOT_NAME%': antBot,
					'%MSG_NAME%': self.messageName(),
					'%FIELD_NAME%': self.fieldName(),
					'%MSG_FIELDS_VALUE%': '{}',
					'%MSG_NAME%%FIELD_NAME%': 'speed',

					'%CHANNEL_NAME%': 'channelName',
					'%GROUP_NAME%': 'groupName',
					'%SIGNAL_ARRAY%': 'signalArray',

				};

				cmdSeqs.forEach(seq => {
					const processedParams = seq.Params.map(param => {
						if (typeof param === 'string') {
							return Object.keys(VARIABLE_MAP).reduce((acc, cur) =>
								acc.replace(new RegExp(cur, 'g'), VARIABLE_MAP[cur]),
								param
							);
						}
						return param;
					});

					// 特殊处理的命令映射表
					const SPECIAL_COMMANDS = {
						'StartMonitorBus': (antBot, cmdName, params) => `${antBot}\`\`\`${cmdName}\`\`\`bus`,
						'StopMonitorBus': (antBot, cmdName, params) => `${antBot}\`\`\`${cmdName}\`\`\`bus`,
						'SendMessageByUserInput': (antBot, cmdName, params) => `${antBot}\`\`\`${cmdName} \`\`\`controlDataName\`\`\`${params[1]}`
					};

					// 构建命令段
					let commandString;
					if (SPECIAL_COMMANDS[seq.CmdName]) {
						// 如果是特殊命令，使用特殊处理逻辑
						commandString = SPECIAL_COMMANDS[seq.CmdName](antBot, seq.CmdName, processedParams);
					} else {
						// 普通命令的处理逻辑
						const commandSegments = [antBot, seq.CmdName];
						if (processedParams.length > 0) {
							if (['OpenChannel', 'CloseChannel'].includes(seq.CmdName)) {
								commandSegments.push(...processedParams.map(p => p.toString()));
							} else if (seq.Params[0] === '%ANTBOT_NAME%') {
								commandSegments.push(...processedParams.slice(1));
							} else {
								commandSegments.push(...processedParams.map(p => p.toString()));
							}
						}
						commandString = commandSegments.join('```');
					}

					// 将生成的命令字符串加入最终脚本
					finalScript.push(commandString);
				});

				finalScript.unshift("TESTCASE_BEGIN");
				finalScript.push("TESTCASE_END");
				let finalString = finalScript.join("óò");
				return finalString;
			};

			// 辅助函数：创建脚本并返回 Promise
			this.createScriptPromise = function (script) {
				return new Promise((resolve, reject) => {
					if (self.isEditMode()) {
						utpService.updateFullScript(
							script,
							(data) => {
								if (data && data.status === 1) {
									resolve(data.result.id); // 解析时返回脚本ID
								} else {
									reject(new Error('脚本创建失败'));
								}
							},
							(error) => {
								reject(error); // 处理错误
							}
						);
					} else {
						utpService.createScript(
							script,
							(data) => {
								if (data && data.status === 1) {
									resolve(data.result.id); // 解析时返回脚本ID
								} else {
									reject(new Error('脚本创建失败'));
								}
							},
							(error) => {
								reject(error); // 处理错误
							}
						);
					}
				});
			}

			this.protocol = null;
			this.editMessageField = function () {
				let selectedAntbotName = self.editingMonitorTestSetConfig.antBot(); // 获取选中的名称
				let selectedAntbot = self.projectManager.agentsConfigData().find(
					item => item.antbotName === selectedAntbotName
				);
				protocolSignalId = selectedAntbot.protocolSignalId;

				utpService.getProtocol(selectedAntbot.protocolSignalId,
					function (data) {
						if (data && data.status === 1 && data.result) {
							self.protocol = JSON.parse(data.result.bigdata);
							var root = {
								id: self.protocol.protocolName,
								value: self.protocol.protocolName,
								data: []
							};
							if (self.protocol.messages == undefined || self.protocol.messages == null || self.protocol.messages.length == 0) {
								notificationService.showWarn('协议文件中不存在消息定义，请确认协议文件是否正确!');
								return;
							}
							for (var i = 0; i < self.protocol.messages.length; i++) {
								var id = self.protocol.messages[i].messageName;
								self.protocol.messages[i].id = id ? id : i;
								var equiNode = {
									id: id ? id : i,
									value: self.protocol.messages[i].messageName,
									data: []
								}
								root.data.push(equiNode);
							}
						}
						$('#messageFieldSettingModal').modal({ show: true }, { data: root });
					},
					function () {
						notificationService.showError('获取协议文件失败');
					});
			};

			this.genericProtocolName = ko.observable();
			this.messageTemplates = ko.observableArray([]);
			this.selectedMessageTemplate = ko.observable();
			this.exceptionCheck = ko.observable(false);
			this.selectedMessage = null;

			this.genericFrameInfo = {
				protocolId: "",
				id: "",
				fields: [],
				conditions: []
			};
			this.clearMonitorProtocolConfigView = function () {
				$('#MonitorProtocolConfigView').html('');
			};

			this.initGenericProtocolTree = function (data) {
				$('#monitorProtocolTreeview').html('');
				self.exceptionCheck(false);
				self.selectedMessageTemplate(undefined);
				self.messageTemplates([]);
				self.clearMonitorProtocolConfigView();
				self.genericProtocolName(data.value);
				webix.ready(function () {
					self.genericProtocolTree = webix.ui({
						container: "monitorProtocolTreeview",
						view: "tree",
						type: "lineTree",
						select: true,
						template: "{common.icon()}&nbsp;#value#",
						data: data,
						ready: function () {
							this.closeAll();
						}
					});

					self.genericProtocolTree.attachEvent("onItemClick", function (id, e, node) {
						if (true) {
							self.exceptionCheck(false);
							for (var i = 0; i < self.protocol.messages.length; i++) {
								if (self.protocol.messages[i].id === id) {
									self.selectedMessage = JSON.parse(JSON.stringify(self.protocol.messages[i]));
									self.selectedMessage.fieldValues = null;
									self.initProtocolConfigView(self.selectedMessage, true, true);
									break;
								}
							}
						}
					});
				});
			};

			this.protocolConfigViewModeChange = function (state) {
				if (state)
					self.initProtocolConfigView(self.selectedMessage, true, false);
				else
					self.initProtocolConfigView(self.selectedMessage, false, true);
			};

			this.onlySelection = ko.observable(false);
			this.initProtocolConfigView = function (message, keepAllFields, needSchemaCheck) {
				self.clearMonitorProtocolConfigView();
				self.onlySelection(false);
				self.messageName(message.messageName);
				self.setMonitorConfig('message', message.messageName)
				var currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting;
				var multipleSelection = true;
				var options = self.protocolService.protocolOptionInit(self.protocol, message, currentProtocolMode, multipleSelection, keepAllFields, needSchemaCheck, message.fieldValues);
				const container = document.getElementById('MonitorProtocolConfigView');
				var obj = self.protocolService.editedProtocolConfig;
				self.editor = new JSONEditor(container, options, obj);
				self.protocolService.editor = self.editor;
			};

			this.setMessageFiled = function () {
				if (protocolService.changeMap.size !== 1) {
					notificationService.showError('请选择一个消息字段作为监控字段');
					return;
				}

				const changeMap = protocolService.changeMap;
				for (const [key, value] of changeMap) {
					if (value === 0) {
						try {
							const keyArray = JSON.parse(key);
							const targetKey = keyArray[0];
							self.fieldName(targetKey);
							self.setMonitorConfig('field', targetKey)
							break;
						} catch (error) {
							console.error('解析key时出错:', error);
						}
					}
				}

				$('#messageFieldSettingModal').modal('hide');
			};

			this.selectedMonitorTestsetAntbotTypeChanged = function () {
				const selectedValue = self.editingMonitorTestSetConfig.antBot();

				const targetAntbotTypes = self.filteredAntbotTypes().filter(antbot =>
					antbot.extraDataConfig === selectedValue
				);

				if (targetAntbotTypes.length === 0) {
					self.filteredAntbots([]);
					return;
				}

				self.inputAntbot('');
				self.outputAntbot('');
				self.monitorRange([]);
				self.showMonitorRange(false);
				self.selectedMonitorRange('');
			};

			this.getMonitorToolType = function () {
				// 获取Antbot类型数组
				const antbotTypes = self.projectManager.showAntbotTypes();

				// 检查是否为有效数组
				if (!Array.isArray(antbotTypes)) {
					console.error('showAntbotTypes()未返回有效数组');
					return []; // 或根据需求抛出异常
				}

				// 使用filter方法筛选符合条件的元素
				const filteredAntbotTypes = antbotTypes.filter(antbot => {
					if (typeof antbot.extraDataConfig !== 'number') {
						return false;
					}
					return [2, 3].includes(antbot.extraDataConfig);
				});

				const targetNames = filteredAntbotTypes.map(antbot => antbot.name);
				const filteredAgents = projectManager.agentsConfigData().filter(agent =>
					targetNames.includes(agent.antbotType)
				);

				self.filteredAntbots(filteredAgents); // 获取可进行监控的机器人
				self.filteredAntbotTypes(filteredAntbotTypes);
			}

			this.closeConfigModal = function () {
				$('#monitorConfigModal').modal('hide');
				self.editingMonitorTestSetConfig.name('默认监控集');
				self.editingMonitorTestSetConfig.description('');
			}
			// 新增监控集
			this.addNewMonitorSet = function () {
				self.isEditMode(false);
				$('#monitorConfigModal').modal('show');
			}

			this.sureAddNewMonitorSet = function () {
				if (self.editingMonitorTestSetConfig.name() == null) {
					notificationService.showError("请输入监控集名称");
					return;
				}

				self.utpService.createMonitoringTestSet(komapping.toJS(self.editingMonitorTestSetConfig), self.addMonitorTestSetConfigSuccessFunction, self.addMonitorTestSetConfigErrorFunction);
				$('#monitorConfigModal').modal('hide');
			}

			this.addMonitorTestSetConfigErrorFunction = function () {
				notificationService.showError('保存监测测试集失败');
			};

			this.addMonitorTestSetConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.getMonitorTestSetConfig();
					self.editingMonitorTestSetConfig.id(data.result.id)
					notificationService.showSuccess('保存监测测试集成功');
				}
				else
					self.addMonitorTestSetConfigErrorFunction();
			};

			// 更新监控集

			this.updateNewMonitorSet = function () {
				self.isEditMode(true);
				$('#monitorConfigModal').modal('show');
			}

			this.sureUpdateNewMonitorSet = function () {
				if (self.editingMonitorTestSetConfig.name() == null) {
					notificationService.showError("请输入监控集名称");
					return;
				}

				self.utpService.updateMonitoringTestSet(komapping.toJS(self.editingMonitorTestSetConfig), self.updateMonitorTestSetConfigSuccessFunction, self.updateMonitorTestSetConfigErrorFunction);
				$('#monitorConfigModal').modal('hide');
			}

			this.updateMonitorTestSetConfigSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					self.getMonitorTestSetConfig();
					notificationService.showSuccess('更新监测测试集成功');
				}
				else
					self.updateMonitorTestSetConfigErrorFunction();
			};

			this.updateMonitorTestSetConfigErrorFunction = function () {
				notificationService.showError('更新监测测试集异常');
			};

			// 读取已有监控集
			this.monitorTestSets = ko.observableArray([]);
			this.getMonitorTestSetConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var monitorTestSets = data.result;
					for (var i = 0; i < monitorTestSets.length; i++) {
						self.monitorTestSets.push(monitorTestSets[i]);
					}

					self.refreshModalTable();
				}
				else
					self.getMonitorTestSetConfigErrorFunction();
			};

			this.getMonitorTestSetConfigErrorFunction = function () {
				notificationService.showError('获取监测测试集失败');
			};

			this.getMonitorTestSetConfig = function () {
				self.monitorTestSets.removeAll();
				utpService.getMonitoringTestSetByProjectId(selectionManager.selectedProject().id, self.getMonitorTestSetConfigSuccessFunction, self.getMonitorTestSetConfigErrorFunction);
			};

			this.enterMonitorContext = function () {
				$('#monitorContext').modal('show');
			}

			this.activate = function () { };

			this.detached = function () {

			};

			this.currentMonitorTestSet = ko.observable();
			this.deleteCurrentMonitorTestSet = function () {
				let startScriptId = self.currentMonitorTestSet().startScriptId;
				let sendCommandScriptId = self.currentMonitorTestSet().sendCommandScriptId;
				let stopScriptId = self.currentMonitorTestSet().stopScriptId;
				let projectId = selectionManager.selectedProject().id;

				// 用于存储删除操作的结果
				let deleteResults = {
					startScript: { success: true, message: '' },
					sendCommandScript: { success: true, message: '' },
					stopScript: { success: true, message: '' },
					monitoringTestSet: { success: true, message: '' }
				};

				// 用于计数已完成的操作
				let operationsCompleted = 0;
				let totalOperations = 4; // 总操作数（3个脚本 + 1个监控测试集）

				// 检查脚本 ID 是否为 0，如果不是 0，则执行删除操作
				function deleteScriptIfExist(scriptId, scriptType, callback) {
					if (scriptId !== 0) {
						utpService.deleteScript(projectId, scriptId, function (data) {
							if (data != null && data.status === 1 && data.result) {
								deleteResults[scriptType].success = true;
								deleteResults[scriptType].message = `删除${scriptType}成功`;
							} else {
								deleteResults[scriptType].success = false;
								deleteResults[scriptType].message = `删除${scriptType}失败`;
							}
							callback();
						}, function () {
							deleteResults[scriptType].success = false;
							deleteResults[scriptType].message = `删除${scriptType}失败`;
							callback();
						});
					} else {
						deleteResults[scriptType].success = true;
						deleteResults[scriptType].message = `${scriptType}不存在，跳过删除`;
						callback();
					}
				}

				// 删除启动脚本
				deleteScriptIfExist(startScriptId, 'startScript', function () {
					operationsCompleted++;
					checkIfAllOperationsCompleted();
				});

				// 删除执行脚本
				deleteScriptIfExist(sendCommandScriptId, 'sendCommandScript', function () {
					operationsCompleted++;
					checkIfAllOperationsCompleted();
				});

				// 删除停止脚本
				deleteScriptIfExist(stopScriptId, 'stopScript', function () {
					operationsCompleted++;
					checkIfAllOperationsCompleted();
				});

				// 删除监控测试集
				utpService.removeMonitoringTestSet(projectId, self.currentMonitorTestSet().id, function (data) {
					if (data != null && data.status === 1 && data.result) {
						deleteResults.monitoringTestSet.success = true;
						deleteResults.monitoringTestSet.message = '删除监控测试集成功';
					} else {
						deleteResults.monitoringTestSet.success = false;
						deleteResults.monitoringTestSet.message = '删除监控测试集失败';
					}
					operationsCompleted++;
					checkIfAllOperationsCompleted();
				}, function () {
					deleteResults.monitoringTestSet.success = false;
					deleteResults.monitoringTestSet.message = '删除监控测试集失败';
					operationsCompleted++;
					checkIfAllOperationsCompleted();
				});

				// 检查所有操作是否完成
				function checkIfAllOperationsCompleted() {
					if (operationsCompleted === totalOperations) {
						// 所有操作完成，显示最终结果
						let allSuccess = true;
						let messages = [];

						for (let key in deleteResults) {
							if (!deleteResults[key].success) {
								allSuccess = false;
							}
							messages.push(deleteResults[key].message);
						}

						if (allSuccess) {
							notificationService.showSuccess('所有删除操作成功完成');
						} else {
							notificationService.showError('部分删除操作失败：\n' + messages.join('\n'));
						}

						self.getMonitorTestSetConfig(); // 重新获取数据
					}
				}
			};

			this.refreshModalTable = function () {
				// 清空旧数据
				$('#monitorContext tbody').empty();

				// 遍历监控集数据并动态生成表格行
				ko.utils.arrayForEach(self.monitorTestSets(), function (config) {
					const row = $('<tr>');

					// 名称列
					$('<td>').append(
						$('<small>').append(
							$('<label>').text(config.name)
						)
					).appendTo(row);

					// 描述列
					$('<td>').append(
						$('<small>').append(
							$('<label>').text(config.description)
						)
					).appendTo(row);

					// 类型列
					const typeText = config.type === 0 ? "监测并控制" :
						config.type === 1 ? "仅监测" :
							config.type === 2 ? "仅控制" : "";
					$('<td>').append(
						$('<small>').append(
							$('<label>').text(typeText)
						)
					).appendTo(row);

					// 操作列
					const actionTd = $('<td>').append(
						$('<small>').append(
							// 编辑按钮
							$('<button>')
								.addClass('btn btn-primary btn-sm')
								.attr('title', '编辑监控测试集')
								.append($('<i>').addClass('glyphicon glyphicon-edit'))
								.click(function (e) {
									e.preventDefault();
									// 直接更新每个 ko.observable 属性的值
									self.editingMonitorTestSetConfig.id(config.id || 0);
									self.editingMonitorTestSetConfig.projectId(config.projectId || 0);
									self.editingMonitorTestSetConfig.name(config.name || '默认监控集');
									self.editingMonitorTestSetConfig.description(config.description || '');
									self.editingMonitorTestSetConfig.type(config.type || '');
									self.editingMonitorTestSetConfig.startScriptId(config.startScriptId || 0);
									self.editingMonitorTestSetConfig.sendCommandScriptId(config.sendCommandScriptId || 0);
									self.editingMonitorTestSetConfig.stopScriptId(config.stopScriptId || 0);
									let currentAntbot = self.editingMonitorTestSetConfig.antBot();
									if (currentAntbot != config.antBot) {
										self.editingMonitorTestSetConfig.antBot(config.antBot || '');
										self.selectedMonitorTestSetAntbotChanged();
									}
									self.editingMonitorTestSetConfig.monitorConfig(config.monitorConfig || {});
									if (self.getMonitorConfig().group) {
										const actionGroups = self.monitorTestSetActionGroups().filter(action =>
											action.group === self.getMonitorConfig().group
										);
										self.selectedMonitorTestSetActionGroup(actionGroups[0]);
										self.selectedMonitorTestSettActionGroupChanged();
									}
									if (self.getMonitorConfig().message) {
										self.messageName(self.getMonitorConfig().message);
									}
									if (self.getMonitorConfig().field) {
										self.fieldName(self.getMonitorConfig().field);
									}
									self.isEditMode(true);
									self.viewManager.selectedMonitorTestsetActiveData = ko.toJS(self.editingMonitorTestSetConfig);
									self.refreshPages();
									$('#monitorContext').modal('hide');
								}),
							" ",
							// 删除按钮
							$('<button>')
								.addClass('btn btn-danger btn-sm')
								.attr('title', '删除监控测试集')
								.append($('<i>').addClass('glyphicon glyphicon-trash'))
								.click(function (e) {
									e.preventDefault();
									$('#deleteMonitorTestSetModal').modal('show');
									self.currentMonitorTestSet(config);
								})
						)
					);
					actionTd.appendTo(row);

					// 将行插入表格
					$('#monitorContext tbody').append(row);
				});
			};

			this.attached = function (view, parent) {
				// 获取可以进行监控的tooltype
				self.getMonitorToolType();
				self.getMonitorTestSetConfig();

				// 绑定保存当前配置按钮
				$('#saveConfigBtn').click(function () {
					self.saveMonitorSetConfig();
				});

				// 绑定监控集信息设置模态框的按钮
				$('#monitorConfigModal').on('show.bs.modal', function () {
					// 初始化表单数据
					$('#simpleMessageId').val(self.editingMonitorTestSetConfig.name());
					$('#simpleMessageDescription').val(self.editingMonitorTestSetConfig.description());

					// 根据 isEditMode 的值显示或隐藏按钮
					if (self.isEditMode()) {
						$('#saveNewMonitorSetBtn').hide();
						$('#updateNewMonitorSetBtn').show();
					} else {
						$('#saveNewMonitorSetBtn').show();
						$('#updateNewMonitorSetBtn').hide();
					}
				});

				// 修改保存按钮的点击事件
				$('#saveNewMonitorSetBtn').click(function () {
					var name = $('#simpleMessageId').val();
					var description = $('#simpleMessageDescription').val();
					if (!self.saveFlag()) {
						notificationService.showError("请先保存配置");
						return;
					}
					if (!name) {
						notificationService.showError("请输入监控集名称");
						return;
					}
					// 同步输入框的值到observable属性
					self.editingMonitorTestSetConfig.name(name);
					self.editingMonitorTestSetConfig.description(description);
					self.setMonitorConfig('group', self.selectedMonitorTestSetActionGroup().group);
					self.utpService.createMonitoringTestSet(
						komapping.toJS(self.editingMonitorTestSetConfig),
						self.addMonitorTestSetConfigSuccessFunction,
						self.addMonitorTestSetConfigErrorFunction
					);
					self.saveFlag(false);
					$('#monitorConfigModal').modal('hide');
				});

				// 修改更新按钮的点击事件
				$('#updateNewMonitorSetBtn').click(function () {
					var name = $('#simpleMessageId').val();
					if (!self.saveFlag()) {
						notificationService.showError("请先保存配置");
						return;
					}
					var description = $('#simpleMessageDescription').val();
					if (!name) {
						notificationService.showError("请输入监控集名称");
						return;
					}
					// 同步输入框的值到observable属性
					self.editingMonitorTestSetConfig.name(name);
					self.editingMonitorTestSetConfig.description(description);
					self.setMonitorConfig('group', self.selectedMonitorTestSetActionGroup().group);
					self.utpService.updateMonitoringTestSet(
						komapping.toJS(self.editingMonitorTestSetConfig),
						self.updateMonitorTestSetConfigSuccessFunction,
						self.updateMonitorTestSetConfigErrorFunction
					);
					self.saveFlag(false);
					$('#monitorConfigModal').modal('hide');
				});

				// 绑定取消按钮
				$('#cancelConfigModalBtn').click(function () {
					self.closeConfigModal();
				});

				// 绑定消息字段选择设置模态框的按钮
				$('#messageFieldSettingModal').on('shown.bs.modal', function (e) {
					self.initGenericProtocolTree(e.relatedTarget.data);
					if (!ko.dataFor(document.getElementById('messageFieldSettingModal'))) {
						ko.applyBindings(viewModel, document.getElementById('messageFieldSettingModal'));
					}
				});

				$('#setMessageFieldBtn').click(function () {
					self.setMessageFiled();
				});


				// 绑定监控集目录模态框显示事件
				$('#monitorContext').on('show.bs.modal', function () {
					self.refreshModalTable();
				});

				// 绑定关闭按钮事件（示例）
				$('#monitorContext .modal-footer button').click(function () {
					$('#monitorContext').modal('hide');
				});

				$('#deleteMonitorTestSetModal').on('click', '.btn-outline:eq(1)', function () { // 确保选择正确的"是"按钮
					self.deleteCurrentMonitorTestSet();
				});
			};
		}
		return new MonitorTestSetConfigViewModel();
	});
