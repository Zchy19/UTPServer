define(
	['jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
		'services/langManager', 'services/viewManager',
		'services/fileManagerUtility', 'services/utpService', 'services/notificationService', 'komapping',
		'services/selectionManager', 'services/projectManager', 'knockout', 'knockout-postbox'],
	function ($, app, bootstrap, lang, dtManager, langManager,
		viewManager, fileManagerUtility, utpService, notificationService, komapping,
		selectionManager, projectManager, ko) {

		function MonitorTestSetViewModel() {
			var self = this;

			this.selectionManager = selectionManager;
			this.projectManager = projectManager;
			this.viewManager = viewManager;

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
			this.messageName = ko.observable();
			this.fieldName = ko.observable();

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

			this.submitMonitorTestSetConfig = function () {
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
				self.editingMonitorTestSetConfig.projectId(selectionManager.selectedProject().id);
				if (self.isEditMode()) {
					updateMonitorTestSetConfig();
				}
				else {
					let targetAntbot = self.projectManager.showAntbotTypes().find(
						item => item.name === self.editingMonitorTestSetConfig.antBot().antbotType
					);
					console.log(self.selectedMonitorRange());
					self.addMonitorScript(targetAntbot, self.selectedMonitorRange()); // 新增监控脚本的依据
					addMonitorTestSetConfig();
				}
			};

			this.addMonitorScript = function (targetAntbot, monitorType) {
				const antbotName = self.editingMonitorTestSetConfig.antBot().antbotName; // 如 "CAN1"
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
					id: 0,
					projectId: 0,
					name: antbotName + "开始" + monitorType,
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'usrlogicblock'
				};

				const stopScript = {
					id: 0,
					projectId: 0,
					name: antbotName + "开始" + monitorType,
					description: '',
					parentScriptGroupId: 0,
					script: 'TESTCASE_BEGIN',
					blockyXml: '',
					type: 'usrlogicblock'
				};

				// 2. 根据监控类型选择命令组
				let startCmdType, stopCmdType;
				switch (monitorType) {
					case '监控报文':
						startCmdType = 'startBusMonitor';
						stopCmdType = 'stopBusMonitor';
						break;
					case '监控字段':
						startCmdType = 'startMsgFieldMonitor';
						stopCmdType = 'stopMsgFieldMonitor';
						break;
					case '监控报文-字段':
						// 需要生成两组脚本（这里简化处理，实际可能需要更复杂的逻辑）
						startCmdType = ['startBusMonitor', 'startMsgFieldMonitor'];
						stopCmdType = ['stopMsgFieldMonitor', 'stopBusMonitor'];
						break;
				}

				// 3. 生成start脚本
				if (Array.isArray(startCmdType)) {
					startCmdType.forEach(cmdType => {
						const cmdGroup = scriptEdit.find(item => item[cmdType])?.[cmdType] || [];
						self.appendCommandsToScript(startScript, cmdGroup, antbotName);
					});
				} else {
					const cmdGroup = scriptEdit.find(item => item[startCmdType])?.[startCmdType] || [];
					self.appendCommandsToScript(startScript, cmdGroup, antbotName);
				}

				// 4. 生成stop脚本
				if (Array.isArray(stopCmdType)) {
					stopCmdType.forEach(cmdType => {
						const cmdGroup = scriptEdit.find(item => item[cmdType])?.[cmdType] || [];
						self.appendCommandsToScript(stopScript, cmdGroup, antbotName);
					});
				} else {
					const cmdGroup = scriptEdit.find(item => item[stopCmdType])?.[stopCmdType] || [];
					self.appendCommandsToScript(stopScript, cmdGroup, antbotName);
				}

				// 5. 封闭脚本
				startScript.script += 'óòTESTCASE_END';
				stopScript.script += 'óòTESTCASE_END';

				// return { startScript, stopScript };
				console.log(startScript);
				console.log(stopScript);
				if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					var selectedScript = {
						id: self.currentScript.id(),
						customizedId: self.currentScript.customizedId(),
						name: self.currentScript.name(),
						description: self.currentScript.description(),
						projectId: self.currentScript.projectId(),
						parentScriptGroupId: self.currentScript.parentScriptGroupId(),
						script: self.currentScript.script(),
						type: self.currentScript.type(),
						blockyXml: self.currentScript.blockyXml(),
						parameter: JSON.stringify(macro)
					}
					self.utpService.updateFullSubScript(selectedScript, self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
				}
				return true;
			};

			// 辅助函数：向脚本追加命令
			this.appendCommandsToScript = function(scriptObj, commands, antbotName) {
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

			this.editMessageField = function() {
				$('#messageFieldSettingModal').modal('show');
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
				self.selectedMonitorTestsetType(item.type)

				var startScript = self.projectManager.getScript(item.startScriptId);
				self.startScriptName("选择脚本");
				if (startScript != null)
					self.startScriptName(startScript.value);

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
				utpService.removeMonitoringTestSet(selectionManager.selectedProject().id, self.currentMonitorTestSet().id,
					function (data) {
						if (data != null && data.status === 1 && data.result) {
							self.getMonitorTestSetConfig();
							notificationService.showSuccess('删除监测测试集成功');
						}
						else
							notificationService.showError('删除监测测试集失败');
					},
					function () {
						notificationService.showError('删除监测测试集失败');
					});
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

			this.selectedMonitorTestSetAntbotChanged = function (obj, event) {
				// 清空原有监控范围
				self.monitorRange.removeAll();

				// 获取目标Antbot
				let targetAntbot = self.projectManager.showAntbotTypes().find(
					item => item.name === self.editingMonitorTestSetConfig.antBot().antbotType
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

					// 确保cmdSeqs是数组且可遍历
					if (Array.isArray(cmdSeqs)) {
						cmdSeqs.forEach(cmdSeq => {
							const keys = Object.keys(cmdSeq);
							if (keys.includes('startBusMonitor')) hasStartBusMonitor = true;
							if (keys.includes('startMsgFieldMonitor')) hasStartMsgFieldMonitor = true;
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
				}

				// 控制界面显示逻辑
				self.showMonitorRange(self.monitorRange().length > 1);
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

			// this.initGenericProtocolTree = function (data) {
			// 	$('#genericProtocolTreeview').html('');
			// 	self.exceptionCheck(false);
			// 	self.selectedMessageTemplate(undefined);
			// 	self.messageTemplates([]);
			// 	self.clearProtocolConfigView();
			// 	self.protocolFieldsconfig.removeAll();
			// 	self.genericProtocolName(data.value);
			// 	webix.ready(function () {
			// 		self.genericProtocolTree = webix.ui({
			// 			container: "genericProtocolTreeview",
			// 			view: "tree",
			// 			type: "lineTree",
			// 			select: true,
			// 			template: "{common.icon()}&nbsp;#value#",
			// 			data: data,
			// 			ready: function () {
			// 				this.closeAll();
			// 				// this.sort("value", "asc", "string");
			// 			}
			// 		});

			// 		self.genericProtocolTree.attachEvent("onItemClick", function (id, e, node) {
			// 			// var item = this.getItem(id);
			// 			if (self.protocolNeedConditionSetting() || self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() ||
			// 				self.protocolNeedFieldConditionSetting() || self.protocolNeedMessageNameSetting() ||
			// 				self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSetting()) {
			// 				self.exceptionCheck(false);
			// 				self.protocolFieldsconfig.removeAll();
			// 				self.currentGenericFrameMessageName = "";
			// 				for (var i = 0; i < self.protocol.protocol.messages.length; i++) {
			// 					if (self.protocol.protocol.messages[i].id === id) {
			// 						self.selectedMessage = JSON.parse(JSON.stringify(self.protocol.protocol.messages[i]));
			// 						self.currentGenericFrameMessageName = self.selectedMessage.messageName;
			// 						self.genericFrameInfo.id = self.selectedMessage.id;
			// 						self.selectedMessage.fieldValues = null;
			// 						self.genericCommandField(self.selectedMessage.messageName);
			// 						self.initProtocolConfigView(self.selectedMessage, true, true);
			// 						if (self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSetting()) {
			// 							self.getActiveMessageTemplate(self.genericFrameInfo.protocolId, self.selectedMessage.messageName)
			// 						}
			// 						break;
			// 					}
			// 				}
			// 				$('#exceptionCheckConfig').bootstrapSwitch("state", false);
			// 				$('#exceptionCheckConfig').on('switchChange.bootstrapSwitch', function (event, state) {
			// 					self.protocolConfigViewModeChange(state);
			// 				});
			// 			}
			// 		});
			// 	});
			// };

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
				});
			};
		}
		return new MonitorTestSetViewModel();
	});
