define(
	['jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
		'services/langManager', 'services/viewManager', 'services/ursService', 'services/systemConfig',
		'services/loginManager', 'services/utpService', 'services/cmdConvertService', 'services/notificationService', 'komapping',
		'services/selectionManager', 'services/executionManager', 'services/protocolService',
		'services/projectManager', 'knockout', 'knockout-postbox', 'validator', 'knockstrap'],
	function ($, app, bootstrap, lang, dtManager, langManager,
		viewManager, ursService, systemConfig, loginManager, utpService, cmdConvertService, notificationService, komapping,
		selectionManager, executionManager, protocolService, projectManager, ko, validator, knockstrap) {

		function RunAntbotViewModel() {
			var self = this;
			this.selectionManager = selectionManager;
			this.projectManager = projectManager;
			this.loginManager = loginManager;
			this.viewManager = viewManager;
			this.protocolService = protocolService;
			this.systemConfig = systemConfig;
			this.antbotTypes = ko.observableArray([]);
			this.antbotClassification = ko.observableArray([]);
			this.classificationAntbotTypes = ko.observableArray([]);
			// Add for configure recordset to agent
			this.recordsetCandidates = ko.observableArray([]);
			this.selectedRecordset = ko.observable();
			this.selectedAntbotType = ko.observable();
			this.selectedUnexpiredAntbotType = ko.observable();
			this.selectedAntbotTypeClassification = ko.observable();
			this.showEmptyRecordSet = ko.observable(false);
			this.previousSelectedRecordset = ko.observable();
			this.currentAntbot = ko.observable();
			this.needRecordSet = ko.observable(false);
			this.needBigData = ko.observable(false);
			this.selectedBigData = ko.observable();
			this.previousSelectedBigData = ko.observable();
			this.runAntbotRefreshSubScription = null;
			this.protocols = ko.observableArray([]);
			this.selectedProtocolType = ko.observable();
			this.protocolTypes = ko.observableArray([]);
			this.needAgentType = ko.observable(false);
			this.antbotValidity = ko.observable("");
			this.signalNeedBigData = ko.observable(false)
			this.isSelectProtocolType = ko.observable(false)
			this.prepareAntbotTypes = function () {
				if (cmdConvertService.agentCmdList.length != 0) {
					self.antbotTypes.removeAll();
					var nowDate = new Date();
					var y = nowDate.getFullYear()
					var m = nowDate.getMonth() + 1
					var d = nowDate.getDate()
					var isNull = false
					for (var i = 0; i < cmdConvertService.agentCmdList.length; i++) {
						var tempValidity = cmdConvertService.agentCmdList[i].antbotValidity;
						if (tempValidity == null || tempValidity == 'null' || tempValidity == "" || tempValidity == undefined || tempValidity == 'undefined') {
							tempValidity = (nowDate.getFullYear() - 1) + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
						}
						var arr = tempValidity.split('-')
						var vy = arr[0]
						var vm = arr[1]
						var vd = arr[2]
						if (Number(vy) - Number(y) < 0 || (Number(vy) - Number(y) == 0 && Number(vm) - Number(m) < 0) || (Number(vy) - Number(y) == 0 && Number(vm) - Number(m) == 0 && Number(vd) - Number(d) < 0)) {
							continue
						}
						self.antbotTypes.push(cmdConvertService.agentCmdList[i]);
						if ((cmdConvertService.agentCmdList[i].classification == null || cmdConvertService.agentCmdList[i].classification == 'null' || cmdConvertService.agentCmdList[i].classification == "") && self.antbotClassification().findIndex(t => t.type === "未分类") == -1) {
							isNull = true
						}
						else if (cmdConvertService.agentCmdList[i].classification != null && cmdConvertService.agentCmdList[i].classification != 'null' && cmdConvertService.agentCmdList[i].classification != "" && self.antbotClassification().findIndex(t => t.type === cmdConvertService.agentCmdList[i].classification) == -1) {
							//获取分类值
							var classification1 = cmdConvertService.agentCmdList[i].classification;
							//判断是否是多个分类
							if (classification1.indexOf(";") != -1) {
								var arr = classification1.split(';');
								for (var j = 0; j < arr.length; j++) {
									if (self.antbotClassification().findIndex(t => t.type === arr[j]) == -1) {
										var temp = { type: arr[j] }
										self.antbotClassification.push(temp);
									}
								}
							} else {
								var temp = { type: cmdConvertService.agentCmdList[i].classification }
								self.antbotClassification.push(temp)
							}
						}
					}
					if (isNull) {
						var temp = {
							type: "未分类"
						}
						self.antbotClassification.push(temp)
					}

					self.needAgentType(true)
				} else {
					self.needAgentType(false)
					//	self.operationPropInfo("没有申请测试机器人,请先申请！");
					//	$('#infoModal').modal('show');
				}
			}

			this.selectedAntbotTypeClassificationChanged = function (obj, event) {
				self.classificationAntbotTypes.removeAll()
				for (let i = 0; i < self.antbotTypes().length; i++) {
					if (self.selectedAntbotTypeClassification() == "未分类" && (self.antbotTypes()[i].classification == null || cmdConvertService.agentCmdList[i].classification == 'null' || self.antbotTypes()[i].classification == ''))
						self.classificationAntbotTypes.push(self.antbotTypes()[i])
					//获取分类值
					var c1 = self.antbotTypes()[i].classification
					//进行分割
					var arr1 = (c1 || "").split(';')
					for (var j = 0; j <= arr1.length; j++) {
						//判断已分割的值是否与接收值selectedAntbotTypeClassification相同
						if (self.selectedAntbotTypeClassification() == arr1[j]) {
							self.classificationAntbotTypes.push(self.antbotTypes()[i])
						}
					}
				}
			};

			this.selectedAntbotTypeChanged = function (obj, event) {
				self.antbotValidity('')
				//cmdConvertService.agentCmdList获取组织下所有机器人包括已过期机器人
				for (var i = 0; i < cmdConvertService.agentCmdList.length; i++) {
					if (cmdConvertService.agentCmdList[i].name == self.selectedAntbotType()) {
						self.antbotValidity(cmdConvertService.agentCmdList[i].antbotValidity);
						break;
					}
				}
				self.showEmptyRecordSet(false);
				self.signalNeedBigData(false);
				self.isSelectProtocolType(false)
				if (self.selectedAntbotType() == undefined)
					return;
				self.needRecordSet(false);
				self.needBigData(false);
				if (cmdConvertService.needRecordSetConfig(self.selectedAntbotType())) {
					self.needRecordSet(true);
					self.getRecordsetList();
				}
				else if (cmdConvertService.needBigDataConfig(self.selectedAntbotType())) {
					self.needBigData(true);
					self.prepareProtocolType();
				}
				else if (cmdConvertService.signalNeedBigDataConfig(self.selectedAntbotType())) {
					self.signalNeedBigData(true);
					self.isSelectProtocolType(true);
					// self.getProtocols('SignalProtocol');
					self.prepareProtocolType();


				}
				/*
				if (event.originalEvent) { // user changed
					
				} else { // program changed
		
				}
				*/
				$('#runAntbotForm').validator('update');
			};


			this.selectedUnexpiredAntbotTypeChanged = function (obj, event) {			
				for (var i = 0; i < self.antbotTypes().length; i++) {
					if (self.antbotTypes()[i].name == self.selectedUnexpiredAntbotType()) {
						self.antbotValidity(self.antbotTypes()[i].antbotValidity);
						break;
					}
				}
				self.showEmptyRecordSet(false);
				self.signalNeedBigData(false);
				self.isSelectProtocolType(false);
				self.addEdit(false);
				// if (self.selectedUnexpiredAntbotType() == undefined)
				// 	return;
				self.needRecordSet(false);
				self.needBigData(false);
				if (cmdConvertService.needRecordSetConfig(self.selectedUnexpiredAntbotType())) {
					self.needRecordSet(true);
					self.getRecordsetList();
				}
				else if (cmdConvertService.needBigDataConfig(self.selectedUnexpiredAntbotType())) {
					self.needBigData(true);
					self.addEdit(true);
					self.prepareProtocolType();
				}
				else if (cmdConvertService.signalNeedBigDataConfig(self.selectedUnexpiredAntbotType())) {
					self.signalNeedBigData(true);
					self.isSelectProtocolType(true);
					// self.getProtocols('SignalProtocol');
					self.prepareProtocolType();

				}
				/*
				if (event.originalEvent) { // user changed
		
				} else { // program changed
		
				}
				*/
				$('#runAntbotForm').validator('update');
			};

			// TBD
			this.getScriptsByAntbotTypeSuccessFunction = function (recordsets) {
				self.recordsetCandidates.removeAll();
				if (recordsets && recordsets.length > 0) {
					self.showEmptyRecordSet(false);
					for (var i = 0; i < recordsets.length; i++)
						self.recordsetCandidates.push(recordsets[i]);
					self.selectedRecordset(self.previousSelectedRecordset());
				}
				else
					self.showEmptyRecordSet(true);
			};

			this.getScriptsByAntbotTypeErrorFunction = function () {
				self.showEmptyRecordSet(true);
			};

			this.getRecordsetList = function () {
				utpService.getScriptsByAgentType(loginManager.getAuthorizationKey(), loginManager.getOrganization(), self.selectedUnexpiredAntbotType(),
					self.getScriptsByAntbotTypeSuccessFunction, self.getScriptsByAntbotTypeErrorFunction);
			};

			this.editingAgentConfig = {
				id: ko.observable(0),
				projectId: ko.observable(0),
				antbotName: ko.observable(''),
				antbotType: ko.observable(''),
				recordsetId: ko.observable(),
				recordsetName: ko.observable(''),
				protocolSignalId: ko.observable('')
			};

			this.typeAlias = ko.observable();
			this.typeAlias = function (foreachantbotType) {
				for (let i = 0; i < self.showAntbotTypes().length; i++) {
					if (self.showAntbotTypes()[i].name == foreachantbotType) {
						return self.showAntbotTypes()[i].alias
					}
				}
			}

			this.submitAgentConfig = function () {
				if (this.editingAgentConfig.id() == 0) {
					if (this.editingAgentConfig.antbotName().length > 0)
						addAgentConfig();
				}
				else
					updateAgentConfig();
				$('#runAntBotEditModal').modal('hide');
				self.addEdit(false);
			};
			this.permissionErrorFunction = function () {
				notificationService.showError('该功能无法使用,请安装相应许可！');
			};
			this.showTestProtocol = function () {
				//获取协议文件
				self.cancelAgentConfig()
				if (self.signalNeedBigData()) {
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.signal_mgr')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					$('#signalProtocolConfigModal').modal('show')
				}
				else {
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.proto_mgr')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					$('#protocolConfigModal').modal('show')
				}
			}

			this.showTool = function () {
				self.cancelAgentConfig()
				$('#tool-purchase').modal('show')
			}

			this.cancelAgentConfig = function () {
				$('#runAntBotEditModal').modal('hide');
				self.addEdit(false);
			};

			this.enterAddItemMode = function () {
				self.editingAgentConfig.id(0);
				self.editingAgentConfig.projectId(selectionManager.selectedProject().id);
				self.editingAgentConfig.antbotType('');
				self.editingAgentConfig.antbotName('');
				self.editingAgentConfig.recordsetId('');
				self.editingAgentConfig.recordsetName('');
				self.editingAgentConfig.protocolSignalId('');

				self.selectedUnexpiredAntbotType('');
				self.selectedUnexpiredAntbotTypeChanged();
				self.selectedProtocolType('');
				self.selectedRecordset('');
				self.previousSelectedRecordset('');
				self.selectedBigData('');
				self.previousSelectedBigData('')
				self.isEditMode(false);
				self.showEmptyRecordSet(false);

				if (!self.isEditMode()) {
					self.needRecordSet(false);
					self.needBigData(false);
					self.signalNeedBigData(false);
					self.selectedAntbotTypeClassification("")
				}
				$('#runAntBotEditModal').modal('show');
			};

			this.enterEditItemMode = function (item) {
				self.editingAgentConfig.id(item.id);
				self.editingAgentConfig.antbotName(item.antbotName);
				self.editingAgentConfig.antbotType(item.antbotType);
				self.editingAgentConfig.recordsetId(item.recordsetId);
				self.editingAgentConfig.recordsetName(item.recordsetName);
				self.editingAgentConfig.protocolSignalId(item.protocolSignalId);
				if (item.protocolSignalId && item.protocolSignalId != '') {
					self.getBigData(item.protocolSignalId);
				}
				self.editingAgentConfig.projectId(item.projectId);

				self.selectedAntbotType(item.antbotType);
				self.selectedAntbotTypeChanged();
				self.selectedRecordset(item.recordsetId);
				self.previousSelectedRecordset(item.recordsetId);
				self.previousSelectedBigData(item.protocolSignalId);
				self.isEditMode(true);
				self.showEmptyRecordSet(false);
				self.enterEdit(true);
				// self.getRecordsetList();
				self.getRecordList();
				self.isAmend(true);
				self.selectedBigData(item)
				//等待100ms后再打开模态框，防止模态框打开时，表单验证未加载完成
				setTimeout(function () {
					$('#runAntBotEditModal').modal('show');
				}, 100)
				// $('#runAntBotEditModal').modal('show');
			};
			//获取record
			this.getRecordList = function () {
				utpService.getScriptsByAgentType(loginManager.getAuthorizationKey(), loginManager.getOrganization(), self.selectedAntbotType(),
					self.getScriptsByAntbotTypeSuccessFunction, self.getScriptsByAntbotTypeErrorFunction);
			};

			this.getBigDataSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {

				}
				else
					self.getBigDataErrorFunction();
			};

			this.getBigDataErrorFunction = function () {
				notificationService.showError('获取协议文件失败');
			};

			this.getBigData = function (protocolSignalId) {
				utpService.getOverviewProtocolSignalById(protocolSignalId, self.getBigDataSuccessFunction, self.getBigDataErrorFunction)
			}

			this.enterEdit = ko.observable(true);


			this.getProtocolsErrorFunction = function () {
				notificationService.showError('获取协议失败');
			};

			this.getAgentConfig = function () {
				self.projectManager.updateAgentConfigFromServer(selectionManager.selectedProject().id);
			};

			this.addAgentConfigErrorFunction = function () {
				notificationService.showError('创建测试机器人失败');
			};

			function getRecordset(selectedRecordsetId) {
				for (var i = 0; i < self.recordsetCandidates().length; i++) {
					if (selectedRecordsetId === self.recordsetCandidates()[i].id)
						return self.recordsetCandidates()[i];
				}
				return null;
			}

			this.addAgentConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var configInfo = data.result;
					if (configInfo.result == 'Success') {
						configInfo.id = configInfo.antbotId;
						configInfo.agentValidity = self.antbotValidity();
						var nowDate = new Date();
						var y = nowDate.getFullYear()
						var m = nowDate.getMonth() + 1
						var d = nowDate.getDate()
						var tempValidity = self.antbotValidity();
						if (tempValidity != 'Error') {
							var arr = tempValidity.split('-')
							var vy = arr[0]
							var vm = arr[1]
							var vd = arr[2]
							if (Number(vy) - Number(y) == 0 && Number(vm) - Number(m) == 0 && (Number(vd) - Number(d) <= 10 && Number(vd) - Number(d) >= 0)) {
								configInfo.isDue = true
								configInfo.isOverDue = false
							} else if (Number(vy) - Number(y) < 0 || (Number(vy) - Number(y) == 0 && Number(vm) - Number(m) < 0) || (Number(vy) - Number(y) == 0 && Number(vm) - Number(m) == 0 && Number(vd) - Number(d) < 0)) {
								configInfo.isDue = true
								configInfo.isOverDue = true
							}
							else {
								configInfo.isDue = false
								configInfo.isOverDue = false
							}
						} else {
							configInfo.isDue = true
							configInfo.isOverDue = true
						}
						self.projectManager.agentsConfigData.unshift(configInfo);
						notificationService.showSuccess('创建测试机器人成功');
					}
					else if (configInfo.result == 'FailedByExistsSameantbotName')
						notificationService.showWarn('测试机器人名称已经存在.');
					else
						self.addAgentConfigErrorFunction();
				}
				else
					notificationService.showError('创建测试机器人异常');
			};

			function addAgentConfig() {
				if (cmdConvertService.needRecordSetConfig(self.selectedUnexpiredAntbotType())) {
					var recordset = getRecordset(self.selectedRecordset());
					if (recordset == null)
						return;

					self.editingAgentConfig.recordsetId(recordset.id);
					self.editingAgentConfig.recordsetName(recordset.name);
				}
				else if (cmdConvertService.needBigDataConfig(self.selectedUnexpiredAntbotType())) {
					if (self.selectedBigData() == undefined || self.selectedBigData() == null) {
						notificationService.showError('请选择协议文件！');
						return;
					}
					self.editingAgentConfig.protocolSignalId(self.selectedBigData());
				}
				else if (cmdConvertService.signalNeedBigDataConfig(self.selectedUnexpiredAntbotType())) {
					if ((self.selectedBigData() == undefined || self.selectedBigData() == null) && !systemConfig.getConfig('utpclient.signal_mgr.antbot_signal_config')) {
						notificationService.showError('请选择协议文件！');
						return;
					}
					self.editingAgentConfig.protocolSignalId(self.selectedBigData());
				}

				self.editingAgentConfig.projectId(selectionManager.selectedProject().id);
				self.editingAgentConfig.antbotType(self.selectedUnexpiredAntbotType());
				utpService.createAgentConfig(komapping.toJS(self.editingAgentConfig), self.addAgentConfigSuccessFunction, self.addAgentConfigErrorFunction);
			}

			this.updateAgentConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var configInfo = data.result;
					if (configInfo.result == 'Success') {
						for (var i = 0; i < self.projectManager.agentsConfigData().length; i++) {
							if (self.projectManager.agentsConfigData()[i].id === configInfo.antbotId) {
								var target = JSON.parse(JSON.stringify(self.projectManager.agentsConfigData()[i]));
								target.antbotName = configInfo.antbotName;
								target.protocolSignalId = configInfo.protocolSignalId;
								target.recordsetId = configInfo.newRecordsetId;
								self.projectManager.agentsConfigData.splice(i, 1, target);
								break;
							}
						}
						notificationService.showSuccess('更新测试机器人成功');
					}
					else if (configInfo.result == 'FailedByExistsSameantbotName')
						notificationService.showWarn('Antbot名称已经存在.');
					else
						notificationService.showError('更新测试机器人失败');
				}
				else
					notificationService.showError('更新测试机器人异常');
			};

			this.updateAgentConfigErrorFunction = function () {
				notificationService.showError('更新测试机器人异常');
			};

			function updateAgentConfig() {
				if (cmdConvertService.needRecordSetConfig(self.selectedAntbotType())) {
					var recordset = getRecordset(self.selectedRecordset());
					if (recordset == null)
						return;

					self.editingAgentConfig.recordsetId(recordset.id);
					self.editingAgentConfig.recordsetName(recordset.name);
				}
				else if (cmdConvertService.needBigDataConfig(self.selectedAntbotType()) || cmdConvertService.signalNeedBigDataConfig(self.selectedAntbotType())) {
					self.editingAgentConfig.protocolSignalId(self.selectedBigData());
				}
				// update agent config
				self.editingAgentConfig.antbotType(self.selectedAntbotType());
				utpService.updateAgentConfig(
					{ id: self.editingAgentConfig.id(), projectId: selectionManager.selectedProject().id, newAntbotName: self.editingAgentConfig.antbotName(), newSelectedBigData: self.editingAgentConfig.protocolSignalId(), newRecordsetId: self.editingAgentConfig.recordsetId() },
					self.updateAgentConfigSuccessFunction, self.updateAgentConfigErrorFunction);
			}

			this.isEditMode = ko.observable(false);
			this.isAmend = ko.observable(false);

			this.deleteCurrentAntbot = function () {
				utpService.deleteAgentConfig(selectionManager.selectedProject().id, self.currentAntbot().id,
					function (data) {
						if (data != null && data.status === 1 && data.result) {
							self.projectManager.agentsConfigData.remove(self.currentAntbot());
							notificationService.showSuccess('删除测试机器人成功');
						}
						else
							notificationService.showError('删除测试机器人失败');
					},
					function () {
						notificationService.showError('删除测试机器人失败');
					});
			}

			this.remove = function (item) {
				$('#runDeleteAntbotModal').modal('show');
				self.currentAntbot(item);
			};

			this.refreshAntbot = function () {
				app.trigger('runAntbotRefresh:event');
			};

			this.addEdit = ko.observable(false)
			this.addAntbot = function () {
				self.isAmend(false);
				self.allProtocolType([]);
				app.trigger('runAntbotAdd:event');
			};

			
			this.protocolTypeChanged = function (obj, event) {
				self.protocols.removeAll();
				if (self.selectedProtocolType() == undefined) {
					for (let i = 0; i < self.availableConfigs().length; i++) {
						self.protocols.push(self.availableConfigs()[i]);
					}
					// self.isSelectProtocolType(false);
				}
				self.isSelectProtocolType(true);
				for (let i = 0; i < self.availableConfigs().length; i++) {
					if (self.availableConfigs()[i].protocolType == self.selectedProtocolType()) {
						self.protocols.push(self.availableConfigs()[i]);
					}
				}
				self.selectedBigData(self.previousSelectedBigData());
				if (event.originalEvent) {// user changed
					self.enterEdit(false);
					// self.getProtocols(self.selectedProtocolType());
				} else { // program changed

				}
			};

			this.prepareProtocolType = function () {
				self.protocolTypes.removeAll();
				if (self.needBigData()) {
					self.getProtocolTypeData("GenericBusFrame");
				}
				if (self.signalNeedBigData()) {
					self.getProtocolTypeData("SignalProtocol");
				}
			};

			this.getProtocolTypeData = function (dataType) {
				utpService.getBigDataByType(null, dataType, self.getProtocolTypesDataSuccessFunction, self.getProtocolTypesDataErrorFunction);
			};

			this.allProtocolType = ko.observableArray([]); //数据类型数组
			this.availableConfigs = ko.observableArray([]);
			this.getProtocolTypesDataSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var availableConfigs = data.result;
					var reselect = self.selectedProtocolType();
					self.availableConfigs.removeAll();
					self.allProtocolType.removeAll();
					for (var i = 0; i < availableConfigs.length; i++) {
						self.availableConfigs.push(availableConfigs[i]);// 全部协议备份
					}
					if (self.needBigData()) {//协议
						for (let i = 0; i < protocolService.protocolTypes.length; i++) {
							self.allProtocolType.push(protocolService.protocolTypes[i]);
						}
					}
					if (self.signalNeedBigData()) {//信号
						self.allProtocolType.push("SignalProtocol");
					}

					self.selectedProtocolType(reselect);

					var protocols = data.result;
					self.protocols.removeAll();
					var standardProtocolType = null;

					if (self.editingAgentConfig.protocolSignalId() != null && self.editingAgentConfig.protocolSignalId() != '') { //点击编辑,筛选出编辑对象的协议或信号id
						for (var i = 0; i < protocols.length; i++) {
							if (protocols[i].id == self.editingAgentConfig.protocolSignalId()) {
								standardProtocolType = protocols[i].protocolType;
							}
						}
					}

					if (standardProtocolType != null) {// 标准类型有值,以标准类型为准
						for (var i = 0; i < protocols.length; i++) {
							if (protocols[i].protocolType == standardProtocolType) {
								self.protocols.push(protocols[i]);
							}
						}
						self.selectedProtocolType(standardProtocolType)
					} else if (self.selectedProtocolType() != undefined){// 标准类型无值,以选择类型为准
						for (var i = 0; i < protocols.length; i++) {
							if (protocols[i].protocolType == self.selectedProtocolType()) {
								self.protocols.push(protocols[i]);
							}
						}
					}else { // 标准类型和选择类型都无值,全部显示
						for (var i = 0; i < protocols.length; i++) {
							self.protocols.push(protocols[i]);
						}
					}
					self.selectedBigData(self.previousSelectedBigData());
				}
				else
					self.getProtocolTypesDataErrorFunction();
			};
			this.getProtocolTypesDataErrorFunction = function () {
				notificationService.showError('获取协议类型失败');
			};

			this.detached = function (view, parent) {
				self.runAntbotRefreshSubScription.off();
				self.runAntbotAddSubScription.off();
			};

			this.activate = function () {
				self.prepareAntbotTypes();
				self.runAntbotRefreshSubScription = app.on('runAntbotRefresh:event').then(function () { self.getAgentConfig(); }, this);
				self.runAntbotAddSubScription = app.on('runAntbotAdd:event').then(function () { self.enterAddItemMode(); }, this);
				ursService.getAllAgentType(loginManager.getOrganization(), loginManager.getAuthorizationKey(), self.loadAllAgentTypeSuccessFunction, self.loadAllAgentTypeErrorFunction);
			};

			//获取所有的机器人类型
			this.showAntbotTypes = ko.observableArray([]);
			this.loadAllAgentTypeSuccessFunction = function (allAgentTypeList) {
				if (allAgentTypeList != null && allAgentTypeList != "") {
					self.showAntbotTypes.removeAll();
					for (var i = 0; i < allAgentTypeList.toolTypes.length; i++) {
						self.showAntbotTypes.push(allAgentTypeList.toolTypes[i])
					}
				}
			}
			this.loadAllAgentTypeErrorFunction = function (response) {
				console.log("error")
			}



			this.attached = function (view, parent) {
				$('#runAntBotEditModal').on('shown.bs.modal', function () {
					$('#runAntbotForm').validator().off('submit');
					$('#runAntbotForm').validator('destroy').validator();
					$('#runAntbotForm').validator().on('submit', function (e) {
						if (e.isDefaultPrevented()) {
							// handle the invalid form...
						} else {
							e.preventDefault();
							self.submitAgentConfig();
						}
					});
				});
			};
		}
		return new RunAntbotViewModel();
	});
