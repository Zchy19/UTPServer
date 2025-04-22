define(
	[
		'jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
		'services/langManager', 'services/viewManager', 'services/protocolService',
		'services/fileManagerUtility', 'services/utpService', 'services/notificationService', 'komapping',
		'services/selectionManager', 'services/projectManager', 'knockout', 'knockout-postbox', 'jsoneditor', 'lodash',
		'bootstrapSwitch', 'ace/ace', 'ace/ext/language_tools'
	],
	function (
		$, app, bootstrap, lang, dtManager, langManager,
		viewManager, protocolService, fileManagerUtility, utpService, notificationService, komapping,
		selectionManager, projectManager, ko, knockoutPostbox, JSONEditor, _,
		bootstrapSwitch, ace
	) {

		function MonitorTestSetViewModel() {
			var self = this;

			this.selectionManager = selectionManager;
			this.projectManager = projectManager;
			this.viewManager = viewManager;
			this.protocolService = protocolService;
			this.scriptsData = null;
			this.currentMonitorTestSet = ko.observable();
			this.monitorTestSets = ko.observableArray([]);
			this.showMonitorTestsetResult = ko.observable(false);
			this.isEditMode = ko.observable(false);
			this.startScriptName = ko.observable("选择");
			this.sendCommandScriptName = ko.observable("选择");
			this.stopScriptName = ko.observable("选择");
			this.enableAutotestSubScription = null;

			this.monitorRange = ko.observableArray([]); // 监控范围字段
			this.selectedMonitorRange = ko.observable();
			this.showMonitorRange = ko.observable(false); // 是否显示监控范围选择
			this.messageName = ko.observable('消息名');
			this.fieldName = ko.observable('字段名');
			this.monitorExecutionDataResult = ko.observableArray([]);

			this.editingMonitorTestSetConfig = {
				id: ko.observable(0),
				projectId: ko.observable(0),
				name: ko.observable(''),
				description: ko.observable(''),
				type: ko.observable(''),
				startScriptId: ko.observable(),
				sendCommandScriptId: ko.observable(),
				stopScriptId: ko.observable(),
				antBot: ko.observable()
			};

			this.initScriptTree = function (data) {
				$('#scriptTreeview').html('');
				webix.ready(function () {
					self.scriptTree = webix.ui({
						container: "scriptTreeview",
						view: "tree",
						select: true,
						data: data,
						ready: function () {
							this.closeAll();
							this.open(fileManagerUtility.root);
							this.sort("value", "asc", "string");
						}
					});
				});
			}

			this.checkedScriptNodeId = function (scripts, checkedId) {
				for (var i = 0; i < scripts.length; i++) {
					if (scripts[i].id === checkedId) {
						return scripts[i];
					}
				}
				return null;
			}

			this.insertScript = function () {
				var checkedId = self.scriptTree.getSelectedId();
				if (checkedId === fileManagerUtility.root) {
					notificationService.showWarn('请选择脚本.');
				}
				checkedId = Number(checkedId);
				var checkedNode = self.checkedScriptNodeId(self.scriptMapping.scripts, checkedId);
				if (checkedNode == null) {
					notificationService.showWarn('请选择脚本.');
					return;
				}

				if (self.currentScriptMode == 'start') {
					self.startScriptName(checkedNode.name);
					self.editingMonitorTestSetConfig.startScriptId(checkedNode.id);
				}
				if (self.currentScriptMode == 'monitor') {
					self.sendCommandScriptName(checkedNode.name);
					self.editingMonitorTestSetConfig.sendCommandScriptId(checkedNode.id);
				}
				if (self.currentScriptMode == 'stop') {
					self.stopScriptName(checkedNode.name);
					self.editingMonitorTestSetConfig.stopScriptId(checkedNode.id);
				}
				$('#insertsendCommandScriptModal').modal('hide');
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
							break;
						} catch (error) {
							console.error('解析key时出错:', error);
						}
					}
				}

				$('#messageFieldSettingModal').modal('hide');
			};

			this.opensendCommandScriptUI = function (mode) {
				self.currentScriptMode = mode;
				var project = [];
				project.push(JSON.parse(JSON.stringify(self.scriptsData)));
				$('#insertsendCommandScriptModal').modal({ show: true }, { data: project });
			};

			this.getFlatScriptByProjectSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					var scripts = self.projectManager.generateScriptGroupsFromFlatInfo(data.result);
					self.projectManager.removeEmptyScriptGroup(scripts.data);
					if (scripts.data == null || scripts.data.length == 0)
						notificationService.showWarn('该项目中不存在子脚本定义，无法引用.');
					else {
						self.scriptsData = scripts;
						self.scriptMapping = data.result;
					}
				}
				else
					self.getFlatScriptByProjectErrorFunction();
			};

			this.getFlatScriptByProjectErrorFunction = function (data) {
				notificationService.showError('获取脚本信息失败');
			};

			this.getFlatScriptByProject = function () {
				utpService.getFlatScriptByProject(0, self.getFlatScriptByProjectSuccessFunction, self.getFlatScriptByProjectErrorFunction);
			};

			// 提交函数改为 async
			this.submitMonitorTestSetConfig = async function () {
				if (self.editingMonitorTestSetConfig.name() == '') {
					notificationService.showWarn('请输入名称');
					return;
				}

				// if((self.editingMonitorTestSetConfig.startScriptId() == '' || self.editingMonitorTestSetConfig.startScriptId() == undefined) && (self.selectedMonitorTestsetType() == 1 || self.selectedMonitorTestsetType() == 0)){
				// 	notificationService.showWarn('请选择启动脚本！');
				// 	return;
				// }

				// if((self.editingMonitorTestSetConfig.sendCommandScriptId() == '' || self.editingMonitorTestSetConfig.sendCommandScriptId() == undefined) && (self.selectedMonitorTestsetType() == 2 || self.selectedMonitorTestsetType() == 0)){
				// 	notificationService.showWarn('请选择执行脚本！');
				// 	return;
				// }

				// if((self.editingMonitorTestSetConfig.stopScriptId() == '' || self.editingMonitorTestSetConfig.stopScriptId() == undefined) && (self.selectedMonitorTestsetType() == 1 || self.selectedMonitorTestsetType() == 0)){
				// 	notificationService.showWarn('请选择停止脚本！');
				// 	return;
				// }
				if (self.editingMonitorTestSetConfig.antBot() == null) {
					notificationService.showWarn('请选择机器人');
					return;
				}

				self.editingMonitorTestSetConfig.projectId(selectionManager.selectedProject().id);
				let selectedAntbotName = self.editingMonitorTestSetConfig.antBot(); // 获取选中的名称
				let selectedAntbot = self.projectManager.agentsConfigData().find(
					item => item.antbotName === selectedAntbotName
				);
				let targetAntbot = self.projectManager.showAntbotTypes().find(
					item => item.name === selectedAntbot.antbotType // 从完整对象中获取类型
				);
				// 关键修改：使用await等待addMonitorScript完成
				const scriptCreated = await self.addMonitorScript(targetAntbot, self.selectedMonitorRange());
				if (self.isEditMode()) {
					updateMonitorTestSetConfig();
				}
				else {
					if (!scriptCreated) { // 如果脚本创建失败，直接返回
						return;
					}

					addMonitorTestSetConfig();
				}
			};

			// 辅助函数：创建脚本并返回 Promise
			function createScriptPromise(script) {
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
			this.addMonitorScript = async function (targetAntbot, monitorType) {
				if (monitorType == null || monitorType == undefined) {
					notificationService.showError('机器人配置错误,请先检查机器人设置');
				}
				const antbotName = self.editingMonitorTestSetConfig.antBot()
				// 1. 安全获取并处理数据源
				let scriptEdit = ko.unwrap(targetAntbot.preDefinedCmdSeqs); // 解包Knockout Observable

				// 如果数据是字符串，解析为JSON
				if (typeof scriptEdit === 'string') {
					try {
						scriptEdit = JSON.parse(scriptEdit);
					} catch (e) {
						console.error("JSON解析失败:", e);
						return null;
					}
				}

				// 初始化脚本对象
				const startScript = {
					id: self.isEditMode() ? self.editingMonitorTestSetConfig.startScriptId() : 0,
					projectId: self.selectionManager.selectedProject().id,
					name: antbotName + "开始" + monitorType,
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'testcase'
				};

				const runningScript = {
					id: self.isEditMode() ? self.editingMonitorTestSetConfig.sendCommandScriptId() : 0,
					projectId: self.selectionManager.selectedProject().id,
					name: antbotName + "执行脚本",
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'testcase'
				};

				const stopScript = {
					id: self.isEditMode() ? self.editingMonitorTestSetConfig.stopScriptId() : 0,
					projectId: self.selectionManager.selectedProject().id,
					name: antbotName + "停止" + monitorType,
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'testcase'
				};

				if (self.editingMonitorTestSetConfig.type() != 2) {
					if (monitorType == '监控报文') {
						startScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```OpenChannel```1óò[[' + antbotName + ']]```StartMonitorBus```busóòTESTCASE_END'
						stopScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StopMonitorBus```busóò[[' + antbotName + ']]```CloseChannelóòTESTCASE_END'
					} else if (monitorType == '监控字段') {
						startScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```OpenChannel```1óò[[' + antbotName + ']]```StartMonitorField```speed```' + self.messageName() + '```["' + self.fieldName() + '"]óòTESTCASE_END'
						stopScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StopMonitorField```speedóò[[' + antbotName + ']]```CloseChannelóòTESTCASE_END'
					} else if (monitorType == '监控报文-字段') {
						startScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```OpenChannel```1óò[[' + antbotName + ']]```StartMonitorBus```busóò[[' + antbotName + ']]```StartMonitorField```speed```' + self.messageName() + '```["' + self.fieldName() + '"]óòTESTCASE_END'
						stopScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StopMonitorField```speedóò[[' + antbotName + ']]```StopMonitorBus```busóò[[' + antbotName + ']]```CloseChannelóòTESTCASE_END'
					} else if (monitorType == '单通道') {
						startScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StartMonitorChannel```单通道```ai1óòTESTCASE_END'
						stopScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StopMonitorChannel```单通道óòTESTCASE_END'
					} else if (monitorType == '通道组') {
						startScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StartMonitorGroup```通道组```group1óòTESTCASE_END'
						stopScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StopMonitorGroup```通道组óòTESTCASE_END'
					} else if (monitorType == '多通道') {
						startScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```StartMonitorTmpGroup```多通道```groupName```signalArrayóòTESTCASE_END'
						stopScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']```StopMonitorTmpGroup```多通道óòTESTCASE_END'
					}
					// utpService.createScript(startScript,
					// 	function (data) {
					// 		if (data && data.status === 1) {
					// 			self.editingMonitorTestSetConfig.startScriptId(data.result.id);
					// 		}
					// 		else
					// 			self.updateScriptErrorFunction();
					// 	},
					// 	self.createScriptErrorFunction)

					// utpService.createScript(stopScript,
					// 	function (data) {
					// 		if (data && data.status === 1) {
					// 			self.editingMonitorTestSetConfig.stopScriptId(data.result.id);
					// 		}
					// 		else
					// 			self.updateScriptErrorFunction();
					// 	},
					// 	self.createScriptErrorFunction)
				}

				if (self.editingMonitorTestSetConfig.type() != 1) {
					if (monitorType == '监控报文' || monitorType == '监控字段' || monitorType == '监控报文-字段') {
						runningScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```OpenChannel```1óò[[' + antbotName + ']]```SendMessageByUserInput```controlDataName```{"messageName":"message4","messageTemplate":null,"config":[{"path":["Reserve4"],"value":0}]}óò[[' + antbotName + ']]```CloseChannelóòTESTCASE_END'
					} else if (self.hasManualWriteChannel()) {
						runningScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```WriteChannelValueByUserInput```signalData```ch0```1óòTESTCASE_END'
					} else if (self.hasManualWriteTmpGroup()) {
						runningScript.script = 'TESTCASE_BEGINóò[[' + antbotName + ']]```WriteTmpGroupValuesByUserInput```groupSignalDataName```group1```["ch1"]```["3"]óòTESTCASE_END'
					}

					// utpService.createScript(runningScript,
					// 	function (data) {
					// 		if (data && data.status === 1) {
					// 			self.editingMonitorTestSetConfig.sendCommandScriptId(data.result.id);
					// 		}
					// 		else
					// 			self.updateScriptErrorFunction();
					// 	},
					// 	self.createScriptErrorFunction)
				}

				try {
					// 创建启动脚本（如果需要）
					if (self.editingMonitorTestSetConfig.type() !== 2) {
						const startScriptId = await createScriptPromise(startScript); // 等待创建完成
						self.editingMonitorTestSetConfig.startScriptId(startScriptId); // 设置ID

						const stopScriptId = await createScriptPromise(stopScript); // 等待创建完成
						self.editingMonitorTestSetConfig.stopScriptId(stopScriptId); // 设置ID
					}

					// 创建执行脚本（如果需要）
					if (self.editingMonitorTestSetConfig.type() !== 1) {
						const runningScriptId = await createScriptPromise(runningScript); // 等待创建完成
						self.editingMonitorTestSetConfig.sendCommandScriptId(runningScriptId); // 设置ID
					}
					return true;
				} catch (error) {
					console.error('脚本创建失败:', error);
					notificationService.showError('脚本创建失败，请重试');
					return false; // 失败时返回false
				}

				// self.scripts = [startScript, runningScript, stopScript];

				// return true;
			};

			// 辅助函数：向脚本追加命令
			this.appendCommandsToScript = function (scriptObj, commands, antbotName) {
				commands.forEach(cmd => {
					const params = cmd.Params.map(p => {
						if (typeof p === 'string') {
							return p.replace(/%ANTBOT_NAME%/g, 'bus') // 固定替换为bus
								.replace(/%MSG_NAME%/g, 'MSG')
								.replace(/%FIELD_NAME%/g, 'FIELD');
						}
						return p;
					}).join(',');

					scriptObj.script += `óò[[${antbotName}]]\`\`\`${cmd.CmdName}\`\`\`${params}`;
				});
			}

			this.createScriptErrorFunction = function () {
				notificationService.showError('监控集自动生成脚本错误');
			};

			this.protocol = null
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
			this.enterAddItemMode = function () {
				self.isEditMode(false);
				self.editingMonitorTestSetConfig.id(0);
				self.editingMonitorTestSetConfig.name('');
				self.editingMonitorTestSetConfig.description('');
				self.editingMonitorTestSetConfig.startScriptId('');
				self.editingMonitorTestSetConfig.sendCommandScriptId('');
				self.editingMonitorTestSetConfig.stopScriptId('');
				self.editingMonitorTestSetConfig.type('');
				self.selectedMonitorTestsetType('');
				self.startScriptName("选择脚本");
				self.sendCommandScriptName("选择脚本");
				self.stopScriptName("选择脚本");
				self.showMonitorTestsetResult(false);
				self.updateAccord();
				// 手动触发监控范围更新
				if (self.editingMonitorTestSetConfig.antBot()) {
					self.selectedMonitorTestSetAntbotChanged();
				}
			};

			this.enterEditItemMode = function (item) {
				self.isEditMode(true);
				self.editingMonitorTestSetConfig.id(item.id);
				self.editingMonitorTestSetConfig.name(item.name);
				self.editingMonitorTestSetConfig.description(item.description);
				self.editingMonitorTestSetConfig.startScriptId(item.startScriptId);
				self.editingMonitorTestSetConfig.sendCommandScriptId(item.sendCommandScriptId);
				self.editingMonitorTestSetConfig.stopScriptId(item.stopScriptId);
				self.editingMonitorTestSetConfig.projectId(item.projectId);
				self.editingMonitorTestSetConfig.type(item.type);
				self.editingMonitorTestSetConfig.antBot(item.antBot);
				self.selectedMonitorTestsetType(item.type)

				var startScript = self.projectManager.getTestCase(item.startScriptId);
				self.startScriptName("选择脚本");
				if (startScript != null)
					self.startScriptName(startScript.value);
				let name = startScript.value;
				let result = name.replace(/.*开始/, "");
				self.selectedMonitorRange(result)

				var monitorScript = self.projectManager.getScript(item.sendCommandScriptId);
				self.sendCommandScriptName("选择脚本");
				if (monitorScript != null)
					self.sendCommandScriptName(monitorScript.value);


				var stopScript = self.projectManager.getScript(item.stopScriptId);
				self.stopScriptName("选择脚本");
				if (stopScript != null)
					self.stopScriptName(stopScript.value);
				self.showMonitorTestsetResult(false);
				self.updateAccord();
				// 手动触发监控范围更新
				if (self.editingMonitorTestSetConfig.antBot()) {
					self.selectedMonitorTestSetAntbotChanged();
				}
			};

			this.getMonitorTestSetConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var monitorTestSets = data.result;
					for (var i = 0; i < monitorTestSets.length; i++) {
						self.monitorTestSets.push(monitorTestSets[i]);
					}
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

			this.addMonitorTestSetConfigErrorFunction = function () {
				notificationService.showError('创建监测测试集失败');
			};

			this.addMonitorTestSetConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.getMonitorTestSetConfig();
					notificationService.showSuccess('创建监测测试集成功');
				}
				else
					self.addMonitorTestSetConfigErrorFunction();
			};

			// function addMonitorTestSetConfig() {
			// 	utpService.createMonitoringTestSet(komapping.toJS({
			// 		monitoringTestSet: self.editingMonitorTestSetConfig,
			// 		scripts: self.scripts
			// 	}), self.addMonitorTestSetConfigSuccessFunction, self.addMonitorTestSetConfigErrorFunction);
			// }

			function addMonitorTestSetConfig() {
				utpService.createMonitoringTestSet(komapping.toJS(self.editingMonitorTestSetConfig), self.addMonitorTestSetConfigSuccessFunction, self.addMonitorTestSetConfigErrorFunction);
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

			function updateMonitorTestSetConfig() {
				utpService.updateMonitoringTestSet(komapping.toJS(self.editingMonitorTestSetConfig), self.updateMonitorTestSetConfigSuccessFunction, self.updateMonitorTestSetConfigErrorFunction);
			};

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

						self.getMonitorTestSetConfig();
					}
				}
			};

			this.remove = function (item) {
				$('#deleteMonitorTestSetModal').modal('show');
				self.currentMonitorTestSet(item);
			};

			this.gotoExecution = function (item) {
				viewManager.selectedMonitorTestsetActiveData = item;
				projectManager.isMonitoringResult = false
				viewManager.autotestActivePage('app/viewmodels/autotest');
			};

			this.initPage = function () {
				webix
					.ready(function () {
						webix
							.ui({
								container: "monitorTestSetInfo",
								id: "monitortestsetinfo_accord",
								multi: true,
								view: "accordion",
								minHeight: 700,
								cols: [
									{
										id: "monitorTestSetOverAllInfo_control",
										body: {
											view: "htmlform",
											content: "monitorTestSetOverAllInfo",
										},
										minHeight: 700,
										minWidth: 600,
										scroll: false
									},
									{
										view: "resizer"
									},
									{
										header: "监控集详细信息",
										id: "monitorTestSetDetail_control",
										body: {
											view: "htmlform",
											content: "monitorTestSetDetail",
											scroll: true
										},
										width: 700,
										minWidth: 700,
										minHeight: 700,
										scroll: false
									}
								]
							});
					});
			}

			this.selectedMonitorTestsetType = ko.observable();

			this.monitorTestsetTypes = ko.observableArray([
				{ id: 0, name: "监测并控制", value: 0 },
				{ id: 1, name: "仅监测", value: 1 },
				{ id: 2, name: "仅控制", value: 2 }
			]);

			this.selectedMonitorTestsetTypeChanged = function (obj, event) {
				self.editingMonitorTestSetConfig.type(self.selectedMonitorTestsetType());
			}

			this.hasManualWriteChannel = ko.observable(false);
			this.hasManualWriteTmpGroup = ko.observable(false);
			this.selectedMonitorTestSetAntbotChanged = function (obj, event) {
				// 清空原有监控范围
				self.monitorRange.removeAll();

				let selectedAntbotName = self.editingMonitorTestSetConfig.antBot(); // 获取选中的名称
				let selectedAntbot = self.projectManager.agentsConfigData().find(
					item => item.antbotName === selectedAntbotName
				);
				let targetAntbot = self.projectManager.showAntbotTypes().find(
					item => item.name === selectedAntbot.antbotType // 从完整对象中获取类型
				);

				if (targetAntbot.preDefinedCmdSeqs) {
					// 解析JSON字符串为数组
					let cmdSeqs;
					try {
						cmdSeqs = JSON.parse(targetAntbot.preDefinedCmdSeqs);
					} catch (e) {
						console.error("解析preDefinedCmdSeqs失败:", e);
						return;
					}

					// 检查存在的命令类型
					let hasStartBusMonitor = false;
					let hasStartMsgFieldMonitor = false;
					let hasStartChannelMonitor = false; // 新增单通道监控
					let hasStartGroupMonitor = false;   // 新增通道组监控
					let hasStartTmpGroupMonitor = false;// 新增多通道监控
					let hasManualWriteChannel = false;
					let hasManualWriteTmpGroup = false;

					// 确保cmdSeqs是数组且可遍历
					if (Array.isArray(cmdSeqs)) {
						cmdSeqs.forEach(cmdSeq => {
							const keys = Object.keys(cmdSeq);
							if (keys.includes('startBusMonitor')) hasStartBusMonitor = true;
							if (keys.includes('startMsgFieldMonitor')) hasStartMsgFieldMonitor = true;
							if (keys.includes('startChannelMonitor')) hasStartChannelMonitor = true; // 新增
							if (keys.includes('startGroupMonitor')) hasStartGroupMonitor = true;     // 新增
							if (keys.includes('startTmpGroupMonitor')) hasStartTmpGroupMonitor = true; // 新增
							if (keys.includes('manualWriteChannel')) hasManualWriteChannel = true; // 新增
							if (keys.includes('manualWriteTmpGroup')) hasManualWriteTmpGroup = true; // 新增
						});
					}

					// 动态添加监控范围
					if (hasStartBusMonitor) {
						self.monitorRange.push("监控报文");
					}
					if (hasStartMsgFieldMonitor) {
						self.monitorRange.push("监控字段");
					}
					if (hasStartBusMonitor && hasStartMsgFieldMonitor) {
						self.monitorRange.push("监控报文-字段");
					}
					if (hasStartChannelMonitor) {
						self.monitorRange.push("单通道"); // 新增
					}
					if (hasStartGroupMonitor) {
						self.monitorRange.push("通道组"); // 新增
					}
					if (hasStartTmpGroupMonitor) {
						self.monitorRange.push("多通道"); // 新增
					}
					if (hasManualWriteChannel) {
						self.hasManualWriteChannel(true); // 新增
					} else {
						self.hasManualWriteChannel(false);
					}
					if (hasManualWriteTmpGroup) {
						self.hasManualWriteTmpGroup(true); // 新增
					} else {
						self.hasManualWriteTmpGroup(false);
					}
				}

				// 控制界面显示逻辑
				self.showMonitorRange(self.monitorRange().length > 0);
				if (!self.showMonitorRange()) {
					self.selectedMonitorRange(self.monitorRange()[0] || "");
				}
			};

			this.updateAccord = function () {
				$$('monitorTestSetDetail_control').header = self.showMonitorTestsetResult() ? "历史结果" : "监控集详细信息";
				$$('monitorTestSetDetail_control').refresh();
				$$('monitorTestSetDetail_control').expand();
			};

			this.viewResultDetail = function (item) {
				projectManager.isMonitoringResult = true
				self.viewManager.selectedMonitorExecution(item)
				viewManager.autotestActivePage('app/viewmodels/autotest');
			}

			this.currentExecutionData = ''
			this.viewRemoveResult = function (item) {
				self.currentExecutionData = item
				$('#deleteMonitorExecutionData').modal('show')
			}

			this.confirmRemoveExecutionResult = function () {
				utpService.removeResultByExecutionId(self.currentExecutionData.executionId, function (data) {
					if (data) {
						self.monitorExecutionDataResult.remove(self.currentExecutionData)
						notificationService.showSuccess('删除监测记录成功');
					}
				}, function (error) {
					notificationService.showError('删除监测记录失败');
				})
				$('#deleteMonitorExecutionData').modal('hide')
			}

			this.getMonitoringExecutionDataSuccess = function (data) {
				if (data && data.status === 1 && data.result) {
					var executionList = data.result
					for (let i = 0; i < executionList.length; i++) {
						self.monitorExecutionDataResult.unshift(executionList[i])
					}
				} else self.getMonitoringExecutionDataError()
			}

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
				// self.protocolFieldsconfig.removeAll();
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
							// this.sort("value", "asc", "string");
						}
					});

					self.genericProtocolTree.attachEvent("onItemClick", function (id, e, node) {
						// var item = this.getItem(id);
						if (true) {
							self.exceptionCheck(false);
							// self.protocolFieldsconfig.removeAll();
							// self.currentGenericFrameMessageName = "";
							for (var i = 0; i < self.protocol.messages.length; i++) {
								if (self.protocol.messages[i].id === id) {
									self.selectedMessage = JSON.parse(JSON.stringify(self.protocol.messages[i]));
									// self.currentGenericFrameMessageName = self.selectedMessage.messageName;
									// self.genericFrameInfo.id = self.selectedMessage.id;
									self.selectedMessage.fieldValues = null;
									// self.genericCommandField(self.selectedMessage.messageName);
									self.initProtocolConfigView(self.selectedMessage, true, true);
									//self.getActiveMessageTemplate(self.genericFrameInfo.protocolId, self.selectedMessage.messageName)
									break;
								}
							}
							$('#exceptionCheckConfig').bootstrapSwitch("state", false);
							$('#exceptionCheckConfig').on('switchChange.bootstrapSwitch', function (event, state) {
								self.protocolConfigViewModeChange(state);
							});
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
				var currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting;
				var multipleSelection = true;
				var options = self.protocolService.protocolOptionInit(self.protocol, message, currentProtocolMode, multipleSelection, keepAllFields, needSchemaCheck, message.fieldValues);
				const container = document.getElementById('MonitorProtocolConfigView');
				var obj = self.protocolService.editedProtocolConfig;
				self.editor = new JSONEditor(container, options, obj);
				self.protocolService.editor = self.editor;
			};

			this.getMonitoringExecutionDataError = function (error) {

			}

			this.viewResult = function (item) {
				self.monitorExecutionDataResult.removeAll()
				viewManager.selectedMonitorTestsetActiveData = item;
				utpService.getMonitoringExecutionDataByTestSetId(item.id, self.getMonitoringExecutionDataSuccess, self.getMonitoringExecutionDataError)
				self.showMonitorTestsetResult(true);
				self.updateAccord();
			};

			this.monitortestsetContainerAdjust = function () {
				var parent = document.getElementById("autotestinfo").parentNode;
				$$("monitortestsetinfo_accord").define("width", parent.clientWidth);
				$$("monitortestsetinfo_accord").resize();
				$$("monitorTestSetDetail_control").define("height", "700");
				$$("monitorTestSetDetail_control").resize();
			};

			this.detached = function (view, parent) {
				self.enableAutotestSubScription.off();
			};

			this.activate = function () {
				self.enableAutotestSubScription = app.on('enableAutotest:event').then(function () {
					self.monitortestsetContainerAdjust();
					self.getMonitorTestSetConfig();
					self.getFlatScriptByProject();
				}, this);
			};

			this.attached = function (view, parent) {
				self.initPage();
				self.monitortestsetContainerAdjust();
				$$('monitorTestSetDetail_control').collapse();
				$('#insertsendCommandScriptModal').on('shown.bs.modal', function (e) {
					self.initScriptTree(e.relatedTarget.data);
					//	self.getProjectSubScript();						
				});
				$('#messageFieldSettingModal').on('shown.bs.modal', function (e) {
					self.initGenericProtocolTree(e.relatedTarget.data);
					if (!ko.dataFor(document.getElementById('messageFieldSettingModal'))) {
						ko.applyBindings(viewModel, document.getElementById('messageFieldSettingModal'));
					}
				});
				$('#setMessageFieldBtn').click(function () {
					self.setMessageFiled();
				});
			};
		}
		return new MonitorTestSetViewModel();
	});
