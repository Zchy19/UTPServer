define(
	['jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
		'services/langManager', 'services/utilityService',
		'services/utpService', 'services/systemConfig', 'services/selectionManager', 'services/cmdConvertService', 'services/notificationService', 'komapping',
		'services/executionManager',
		'services/projectManager', 'services/protocolService', 'knockout', 'validator', 'jsoneditor', 'lodash', 'knockout-postbox'],
	function ($, app, bootstrap, lang, dtManager, langManager, utilityService,
		utpService, systemConfig, selectionManager, cmdConvertService, notificationService, komapping,
		executionManager, projectManager, protocolService, ko, validator, JSONEditor, _) {

		function ProtocolViewModel() {
			var self = this;
			this.projectManager = projectManager;
			this.utpService = utpService;
			this.systemConfig = systemConfig;
			this.selectionManager = selectionManager;

			this.protocols = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});
			this.selectedFile = null;
			this.currentProtocol = null;
			this.currentProtocolContent = '';
			this.selectedProtocolType = ko.observable();
			this.protocolType = ko.observable();
			this.selectedProtocolName = ko.observable('');
			this.selectedTargetProject = undefined;
			this.protocolTypes = ko.observableArray([]);
			this.isEditMode = ko.observable(false);
			this.viewProtocolMode = '';
			//编码选项
			this.protocolOptions = ko.observableArray([
				{ text: "小端", value: true },
				{ text: "大端", value: false }
			]);
			//简单模式crc校验算法选择
			this.algorithmChooose = ko.observable(false);
			this.crcAlgorithm = ['CRC4_ITU', 'CRC5_EPC', 'CRC5_ITU', 'CRC5_USB', 'CRC6_ITU', 'CRC7_MMC', 'CRC8', 'CRC8_ITU', 'CRC8_ROHC', 'CRC8_MAXIM', 'CRC8_MD',
				'CRC16_IBM', 'CRC16_MAXIM', 'CRC16_USB', 'CRC16_MODBUS', 'CRC16_CCITT', 'CRC16_CCITT_FALSE', 'CRC16_X25', 'CRC16_XMODEM',
				'CRC16_DNP', 'CRC32', 'CRC32_MPEG2'];
			this.selectedCrcAlgorithm = ko.observable(self.crcAlgorithm[0]);
			this.isDataBlock = ko.observable(false);
			this.setInfo = ko.observableArray([]); // 存放表格设置信息
			this.pattern = ko.observable('simpleAndAdvanced'); // 协议编辑模式
			this.popOrAdd = true; // 判断是编辑协议还是新增协议
			this.firstCreateTable = false;


			this.onProjectSelected = function (obj, event) {
				self.getProtocols(protocolService.dataType.GENERICBUSFRAME);
			};

			this.getProtocolsSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var protocols = data.result;
					komapping.fromJS(protocols, {}, self.protocols);
					self.prepareProtocolType(data);
				}
				else
					self.getProtocolsErrorFunction();
			};

			this.getProtocolsErrorFunction = function () {
				notificationService.showError('获取协议失败');
			};

			this.getProtocols = function (protocolType) {
				var project = self.selectionManager.selectedProject();
				if (project == null) {
					var projectId = null;
					if (self.selectedTargetProject != undefined && self.selectedTargetProject != null)
						projectId = self.selectedTargetProject.id
					self.utpService.getBigDataByType(projectId, protocolType, self.getProtocolsSuccessFunction, self.getProtocolsErrorFunction);
				} else {
					//如果所在页面在项目里,则获取项目下的协议
					self.utpService.getProtocolSignalsByProjectIdAndPublic(protocolType, project.id, self.getProtocolsSuccessFunction, self.getProtocolsErrorFunction);
				}

			};
			this.getProtocolsByProtocolType = function (protocolType) {
				self.utpService.getProtocolSignalByProtocolType(protocolService.dataType.GENERICBUSFRAME, protocolType, self.getProtocolsByProtocolTypeOrProjectIdSuccessFunction, self.getProtocolsErrorFunction)
			};

			this.getProtocolsByProtocolTypeOrProjectIdSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var protocols = data.result;
					komapping.fromJS(protocols, {}, self.protocols);
				}
				else
					self.getProtocolsErrorFunction();
			};

			this.submitProtocol = function () {
				self.firstCreateTable = true;
				self.addProtocol();
			};

			this.cancelMessageTemplate = function () {
				$('#messageTemplateModal').modal('hide');
			};

			this.cancelProtocol = function () {
				var element = document.getElementById('fieldsTable');
				if (element) {
					element.parentNode.removeChild(element);
				};
				self.currentPageIndex = 0;
				self.currentPageData = [];
				self.allPagesData = [];
				self.totalPages.removeAll();
				self.protocolTypeName('');
				$('#protocolEditModal').modal('hide');
			};

			this.importProtocolConfirm = function () {
				self.importProtocol();
			};

			this.cancelImportProtocol = function () {
				self.protocolTypeName('');
				$('#protocolImportModal').modal('hide');
			};

			this.enterImportProtocolMode = function () {
				self.selectedFile = null;
				self.protocolTypeName('');
				$('#protocolImportModal').modal('show');
			};

			this.enterAddItemMode = function () {
				self.popOrAdd = false;
				JSON.message = [];
				//self.pageNumbers();//更新页面数量
				self.currentPageIndex = 0;
				self.allPagesData = [];
				self.currentPageData = [];
				if (self.pattern() == 'advanced') { // 许可只有高级模式
					self.protocolPattern(false);
				} else {
					self.protocolPattern(true);
				}
				self.rotocolTypeName = '';
				self.selectedFile = null;
				self.currentProtocolContent = { "littleEndian": false, "messages": [{ "messageName": "消息名", "fields": [] }], "messageAttributeTable": [], "bitsTypeDefineTable": [], "structTypeDefineTable": [], "enumTypeDefineTable": [], "algorithmDefineTable": [] };
				self.selectedProtocolName('');
				self.isEditMode(false);
				self.totalPages.removeAll(); // 清除之前的页码
				self.totalPages.push(1);
				self.currentPage(1);
				self.protocolTypeName('');
				self.setInfo([]); // 清除之前的设置信息
				self.selectedMessageDirection('sendAndReceive')
				self.selectedMessageIdExistence('no')
				self.setMessageId('')
				self.uniqueMessageID('false')
				$('#protocolEditModal').modal('show');
			};

			this.loadFromFile = function (file) {
				self.selectedFile = file;
				/*
				var reader = new FileReader();
				reader.readAsText(file, "UTF-8");
				reader.onload = function(evt){
					var fileString = evt.target.result;
					self.editor.setText(fileString);
				}
				*/
			};

			this.addProtocolErrorFunction = function (result) {
				if (result != null && result != "") {
					var message = result.messages;
					if (message === "OVER_MAX_PROTOCOLSIGNAL_NUM") {
						notificationService.showError('新增协议数量超过最大限制,请安装对应的许可文件');
					}
				} else {
					notificationService.showError('增加协议失败');
				}
			};

			this.importProtocolErrorFunction = function () {
				notificationService.showError('上传协议失败');
			};

			this.addProtocolSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var configInfo = data.result;
					// self.protocols.unshift(configInfo);
					self.refreshProtocols();
					notificationService.showSuccess('添加协议成功！');
				}
				else {
					self.addProtocolErrorFunction(data.result);
				}
			};

			this.importProtocolSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var configInfo = data.result;
					notificationService.showSuccess('上传协议成功！');
					self.refreshProtocols();
				}
				else {
					self.addProtocolErrorFunction(data.result);
				}
			};

			this.importProtocol = async function () {
				// 基础校验
				if (self.selectedFile === null) {
					notificationService.showError('请选择协议文件！');
					return;
				}
				if (!self.selectedFile.name.endsWith('.uProto')) {
					notificationService.showError('协议文件类型错误,请重新选择文件！');
					return;
				}

				try {
					// 读取并解析文件内容
					const fileContent = await new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = (e) => resolve(e.target.result);
						reader.onerror = (e) => reject(new Error("文件读取失败"));
						reader.readAsText(self.selectedFile);
					});

					const protocolData = JSON.parse(fileContent);

					// 校验必要字段
					const requiredFields = ['protocolName', 'protocolType', 'protocol'];
					const missingFields = requiredFields.filter(field => !(field in protocolData));

					if (missingFields.length > 0) {
						notificationService.showError(`暂不支持当前协议文件类型`);
						return;
					}

					// 校验协议类型
					if (protocolData.protocolType !== 'UserDefinedProtocol') {
						notificationService.showError('仅支持导入用户自定义协议（UserDefinedProtocol）');
						return;
					}

					// 构造表单数据
					const fd = new FormData();
					fd.append('dataType', protocolService.dataType.GENERICBUSFRAME);
					fd.append('file', self.selectedFile);
					fd.append('protocolType', protocolData.protocolType); // 使用文件中的协议类型

					// 提交数据
					utpService.addBigData(
						fd,
						self.importProtocolSuccessFunction,
						self.importProtocolErrorFunction
					);

					self.protocolTypeName('');

				} catch (error) {
					console.error('协议导入失败:', error);
					notificationService.showError(`协议文件校验失败`);
				}
			};
			this.protocolTypeName = ko.observable('');
			this.addProtocol = function () {
				// if(self.selectedProtocolType() === null){
				// 	notificationService.showError('请选择协议类型！');
				// 	return;
				// }

				if (self.selectedProtocolName() === '') {
					notificationService.showError('请输入协议名称！');
					return;
				}
				if (self.protocolTypeName() === undefined) {
					notificationService.showError('请选择协议类型！');
					return;
				}
				if (self.validatorErrors.length > 0) {
					notificationService.showError('请输入合法数据');
					return;
				}

				if (self.protocolPattern()) {
					if (!self.savePageData()) {
						return;
					}
					let complete = self.complete();
					complete.littleEndian = self.littleEndian();
					var simpleProtocol = JSON.stringify(complete);
					if (simpleProtocol == "false") {
						return false;
					}
					const blob = new Blob([simpleProtocol], { type: 'application/json;charset=utf-8' });
					self.selectedFile = new File([blob], self.selectedProtocolName() + '.uProto', { type: "application/json;charset=utf-8" });
				} else {
					const blob = new Blob([self.editor.getText()], { type: 'application/json;charset=utf-8' });
					self.selectedFile = new File([blob], self.selectedProtocolName() + '.uProto', { type: "application/json;charset=utf-8" });
				}



				if (self.selectedFile === null) {
					notificationService.showError('请选择协议文件！');
					return;
				}
				var fd = new FormData();
				fd.append('dataType', protocolService.dataType.GENERICBUSFRAME);
				fd.append('file', self.selectedFile);
				if (self.protocolTypeName() == '自定义(Custom Protocol)') {
					fd.append('protocolType', 'UserDefinedProtocol');
				} else {
					fd.append('protocolType', self.protocolTypeName());
				}
				utpService.addBigData(fd, self.addProtocolSuccessFunction, self.addProtocolErrorFunction);
				self.protocolTypeName('');
			};

			this.isComplexProtocol = ko.observable(false); // 判断是否为复杂协议
			this.simpleSchemaData = function () {
				//定一个标记为true
				var flag = true;
				//清空self.allPagesData
				self.allPagesData = [];
				self.allPagesDirection = [];
				//遍历self.currentProtocolContent.messages数组
				for (var i = 0; i < self.currentProtocolContent.messages.length; i++) {
					var message = self.currentProtocolContent.messages[i];
					var direction = self.currentProtocolContent.messageAttributeTable?.[i];
					self.allPagesDirection.push(direction);
					//遍历message.fields数组
					for (var j = 0; j < message.fields.length; j++) {
						var field = message.fields[j];
						//判断field.type是否类型是否为标记字段，长度字段,无符号整数，有符号整数，变长数据,CRC校验，Checksum校验，LRC校验, 数据块
						if (!(field.type === 'flag' || field.type === 'dataLength' || field.type === 'vardata' || field.type === 'crc' || field.type === 'checksum' || field.type === 'lrc' || field.type === 'integer' || field.type === 'uinteger' || field.type === 'datablock')) {
							flag = false;
							break;
						}
					}
					if (direction != null && direction != undefined) {
						for (let k = 0; k < direction.attributes.length; k++) {
							let directionName = direction.attributes[k];
							if (!(directionName.name === 'receiveFlag' || directionName.name === 'sendFlag' || directionName.name === 'messageID')) {
								flag = false;
								break;
							}
						}
					}
					if (flag) {
						var messageData = {
							name: message.messageName,
							fields: message.fields,
						}
						self.allPagesData.push(messageData);
						// 根据属性名查找对应的值（注意大小写匹配）
						// const receiveFlag = direction?.attributes?.find(attr => attr.name === 'receiveFlag')?.value ?? '1';
						// const sendFlag = direction?.attributes?.find(attr => attr.name === 'sendFlag')?.value ?? '1';

						// // 简化判断条件（建议显式转换为数字）
						// if (+receiveFlag === 1 && +sendFlag === 1) {
						// 	self.allPagesDirection.push('sendAndReceive');
						// } else if (+receiveFlag === 0 && +sendFlag === 1) {
						// 	self.allPagesDirection.push('send');
						// } else if (+receiveFlag === 1 && +sendFlag === 0) {
						// 	self.allPagesDirection.push('receive');
						// }

						self.isComplexProtocol(false);
						if (self.pattern() == 'advanced') { // 许可只有高级模式
							self.protocolPattern(false);
						} else {
							self.protocolPattern(true);
						}
					} else {
						self.allPagesData = [];
						//终止循环
						self.protocolPattern(false);

						//提示不能转为简单模式
						// notificationService.showError('该协议为复杂协议,不能转为简单模式编辑');
						self.isComplexProtocol(true);
						break;
					}
				}
			}
			this.getProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					protocolService.addProtocol(data.result);

					// 解析协议数据
					const parsedData = JSON.parse(data.result.bigdata);

					// 根据协议结构动态获取内容
					let targetContent = parsedData; // 默认使用完整协议数据
					if (parsedData.protocol) {
						targetContent = parsedData.protocol; // 当存在protocol字段时使用嵌套内容
					}
					// 模式分支处理
					if (self.viewProtocolMode === 'editProtocol') {
						self.currentProtocolContent = targetContent;
						self.simpleSchemaData();
						self.pageNumbers();
						self.setInfo([]);
						$('#protocolEditModal').modal('show');
					}
					else if (self.viewProtocolMode === 'viewMessageTemplate') {
						// 兼容处理两种数据结构
						const messages = targetContent.messages || parsedData.messages;

						self.currentProtocolContent = targetContent;
						self.messages(messages);

						if (messages && messages.length > 0) {
							self.selectedMessage(messages[0]);
							self.getAllMessageTemplate(messages[0].messageName);
						}

						$('#messageTemplateModal').modal('show');
					}
				}
			};

			this.getProtocolErrorFunction = function () {
				notificationService.showError('获取协议文件失败');
			};

			this.exportProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					var blob = new Blob([data.result.bigdata]);
					var a = document.createElement("a");
					a.download = data.result.fileName;
					a.href = URL.createObjectURL(blob);
					$("body").append(a);
					a.click();
				}
				else
					notificationService.showError('导出项目失败');
			};

			this.exportProtocolErrorFunction = function () {
				notificationService.showError('导出协议文件失败');
			};

			this.exportProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					try {
						// 解析原始协议数据
						const rawData = JSON.parse(data.result.bigdata);

						// 构建新格式协议对象
						const newProtocolFormat = {
							protocolName: self.selectedProtocolName() || "未命名协议",
							protocolType: "UserDefinedProtocol",
							protocol: {
								...rawData, // 保留所有原始字段
							}
						};

						// 转换为JSON字符串并创建Blob
						const blob = new Blob([JSON.stringify(newProtocolFormat, null, 2)], {
							type: "application/json"
						});

						// 生成文件名
						const fileName = `${newProtocolFormat.protocolName}.uProto`;

						// 创建下载链接
						const a = document.createElement("a");
						a.download = fileName;
						a.href = URL.createObjectURL(blob);
						a.style.display = "none";

						document.body.appendChild(a);
						a.click();
						document.body.removeChild(a);
						URL.revokeObjectURL(a.href);
					} catch (error) {
						console.error("协议格式转换失败:", error);
						notificationService.showError('协议文件生成失败');
					}
				} else {
					notificationService.showError('导出项目失败');
				}
			};

			this.exportProtocol = function (item) {
				self.utpService.getProtocol(
					item.id(),
					self.exportProtocolSuccessFunction,
					self.exportProtocolErrorFunction
				);

				// 处理协议名称
				const rawFileName = item.fileName();
				self.selectedProtocolName(
					rawFileName.includes(".")
						? rawFileName.slice(0, rawFileName.indexOf("."))
						: rawFileName
				);

				self.currentProtocol = item;
				self.isEditMode(true);
			};

			this.editProtocol = function (item) {
				self.protocolPattern(true);
				self.viewProtocolMode = 'editProtocol';
				self.utpService.getProtocol(item.id(), self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
				if (item.dataType() == "GenericBusFrame") {
					self.protocolTypes.removeAll();
					for (let i = 0; i < protocolService.protocolTypes.length; i++) {
						self.protocolTypes.push(protocolService.protocolTypes[i]);
					}
				}

				if (item.dataType() == "SignalProtocol") {
					self.protocolTypes.removeAll();
					for (let i = 0; i < protocolService.protocolTypes.length; i++) {
						self.protocolTypes.push(protocolService.signalprotocolTypes[i]);
					}
				}

				if (item.fileName().indexOf(".") >= 0)
					self.selectedProtocolName(item.fileName().slice(0, item.fileName().indexOf(".")));
				else
					self.selectedProtocolName(item.fileName());
				if (item.protocolType() == 'UserDefinedProtocol') {
					self.protocolTypeName('自定义(Custom Protocol)');
				} else {
					self.protocolTypeName(item.protocolType());
				}
				self.currentProtocol = item;
				self.isEditMode(true);
			};

			this.updateProtocolErrorFunction = function () {
				notificationService.showError('协议更新失败');
			};

			this.updateProtocolSuccessFunction = function (data) {
				if (data && data.status === 1) {
					notificationService.showSuccess('协议更新成功');
					self.refreshProtocols();
					self.utpService.getProtocol(self.currentProtocol.id(), self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
				}
				else
					self.updateProtocolErrorFunction();
			};

			this.updateProtocol = function () {
				self.firstCreateTable = true;
				if (self.selectedProtocolName() === '') {
					notificationService.showError('请输入协议名称！');
					return;
				}
				if (self.protocolTypeName() === undefined) {
					notificationService.showError('请选择协议类型！');
					return;
				}
				if (self.validatorErrors.length > 0) {
					notificationService.showError('请输入合法数据');
					return;
				}

				if (self.protocolPattern()) {
					if (!self.savePageData()) {
						return;
					}
					let complete = self.complete();
					complete.littleEndian = self.littleEndian();
					var simpleProtocol = JSON.stringify(complete);
					if (simpleProtocol == "false") {
						return false;
					}
					const blob = new Blob([simpleProtocol], { type: 'application/json;charset=utf-8' });
					self.selectedFile = new File([blob], self.selectedProtocolName() + '.uProto', { type: "application/json;charset=utf-8" });
				} else {
					if (self.validatorErrors.length > 0) {
						notificationService.showError('请输入合法数据');
						return;
					}
					const blob = new Blob([self.editor.getText()], { type: 'application/json;charset=utf-8' });
					self.selectedFile = new File([blob], self.selectedProtocolName() + '.uProto', { type: "application/json;charset=utf-8" });
				}
				if (self.selectedFile === null) {
					notificationService.showError('请选择协议文件！');
					return;
				}
				var fd = new FormData();
				fd.append('id', self.currentProtocol.id());
				fd.append('file', self.selectedFile);
				if (self.protocolTypeName() == '自定义(Custom Protocol)') {
					fd.append('protocolType', 'UserDefinedProtocol');
				} else {
					fd.append('protocolType', self.protocolTypeName());
				}
				utpService.updateBigData(fd, self.updateProtocolSuccessFunction, self.updateProtocolErrorFunction);
				self.protocolTypeName('');
			};

			this.deleteCurrentProtocol = function () {
				self.clearRemoveNotification();
				utpService.deleteBigData(self.currentProtocol.id(),
					function (data) {
						if (data != null && data.status === 1 && data.result) {
							self.protocols.remove(self.currentProtocol);
							notificationService.showSuccess('删除协议成功！');
							// 检查并重置协议类型
							self.checkAndResetProtocolType();
						}
						else
							notificationService.showError('删除协议失败');
					},
					function () {
						notificationService.showError('删除协议失败');
					});
			};

			// 检查并重置协议类型
			this.checkAndResetProtocolType = function () {
				var hasItems = false;
				ko.utils.arrayForEach(self.protocolTypes(), function (protocolType) {
					var count = ko.utils.arrayFilter(self.protocols(), function (item) {
						return item.protocolType() === protocolType.name;
					}).length;
					if (count > 0) {
						hasItems = true;
						return;
					}
				});
				if (!hasItems) {
					// 如果没有任何类型的元素存在，则重置protocolType
					self.protocolType(null);
				}
			};

			this.genericProtocolName = ko.observable('协议帧内容配置');

			this.clearRemoveNotification = function () {
				$('#deleteProtocolModal').modal('hide');
			};

			this.remove = function (item) {
				$('#deleteProtocolModal').modal('show');
				self.currentProtocol = item;
			};
			this.getProtocolsByProtocolTypeAndProjectId = function (protocolType, projectId) {
				self.utpService.getProtocolsByProtocolTypeAndProjectId(protocolService.dataType.GENERICBUSFRAME, protocolType, projectId, self.getProtocolsByProtocolTypeOrProjectIdSuccessFunction, self.getProtocolsErrorFunction)
			}
			this.protocolTypeChanged = function (obj, event) {
				if (self.protocolType() == undefined) {
					self.getProtocols(protocolService.dataType.GENERICBUSFRAME);
					return;
				}
				if (event.originalEvent) {
					var project = self.selectionManager.selectedProject();
					if (project == null) {
						if (self.selectedTargetProject != undefined && self.selectedTargetProject != null) {
							var projectId = self.selectedTargetProject.id
							self.getProtocolsByProtocolTypeAndProjectId(self.protocolType(), projectId);
						} else {
							self.getProtocolsByProtocolType(self.protocolType());
						}
					}
					else {
						self.getProtocolsByProtocolTypeAndProjectId(self.protocolType(), project.id);
					}

				}
				else { // program changed

				}
			};

			this.genericBusFrame = ko.observableArray([]);
			this.haveProtocolTypes = ko.observableArray([]);
			this.prepareProtocolType = function (data) {
				self.protocolTypes.removeAll();
				self.genericBusFrame.removeAll();
				var keys = Object.getOwnPropertyNames(protocolService.dataType);
				var values = Object.keys(protocolService.dataType).map(function (e) { return protocolService.dataType[e] });
				for (var i = 0; i < values.length; i++) {
					self.genericBusFrame.push({
						name: values[i],
						value: values[i],
					})
				}

				if (keys == "GENERICBUSFRAME") {
					self.protocolTypes.removeAll();
					self.haveProtocolTypes.removeAll();
					for (var i = 0; i < data.result.length; i++) {
						if (!self.haveProtocolTypes().includes(data.result[i].protocolType)) {
							self.haveProtocolTypes.push(data.result[i].protocolType);
						}
					}
					for (let i = 0; i < protocolService.protocolTypes.length; i++) {
						self.protocolTypes.push(protocolService.protocolTypes[i]);
					}
				}

				self.selectedProtocolType(self.genericBusFrame()[0]);
				if (self.selectedProtocolName === '')
					self.selectedProtocolName(self.selectedProtocolType().name);
			};

			this.refreshProtocols = function () {
				self.getProtocols(protocolService.dataType.GENERICBUSFRAME);
				$('#protocolImportModal').modal('hide');
				$('#protocolEditModal').modal('hide');
				self.viewProtocolMode = '';
			};

			this.selectedMessage = ko.observable();
			this.messages = ko.observable([]);
			this.messageTemplates = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});
			this.getAllMessageTemplateSuccessFunction = function (data) {
				if (data && data.status) {
					var messageTemplates = data.result;
					$('#messageTemplateDetailView').html('');
					komapping.fromJS(messageTemplates, {}, self.messageTemplates);
				}
				else
					self.getAllMessageTemplateErrorFunction();
			};

			this.getAllMessageTemplateErrorFunction = function () {
				notificationService.showError('获取消息模板失败');
			};

			this.getAllMessageTemplate = function (messageName) {
				utpService.getAllMessageTemplate(self.currentProtocol.id(), messageName, self.getAllMessageTemplateSuccessFunction, self.getAllMessageTemplateErrorFunction);
			};

			this.messageChanged = function (obj, event) {
				if (self.selectedMessage() == undefined) {
					return;
				}
				if (event.originalEvent)// user changed
					self.getAllMessageTemplate(self.selectedMessage().messageName);
				else { // program changed

				}
			};

			this.showMessageTemplateDetail = function (item) {
				$('#messageTemplateDetailView').html('');
				var fields = protocolService.bigDataFieldAnalysis(item.protocolId(), item.messageName(), item.fieldValues());
				if (fields) {
					var genericRecordContent = JSON.parse(fields);
					const container = document.getElementById('messageTemplateDetailView');
					const options = {
						mode: 'view',
						modes: ['text', 'view'],
						name: item.messageName(),
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
						}
					}
					self.editor = new JSONEditor(container, options, genericRecordContent);
				}
			};

			this.viewMessageTemplate = function (item) {
				self.viewProtocolMode = 'viewMessageTemplate';
				$('#messageTemplateDetailView').html('');
				self.utpService.getProtocol(item.id(), self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
				self.currentProtocol = item;
			};

			this.deleteMessageTemplateSuccessFunction = function (data) {
				if (data && data.status) {
					$('#messageTemplateDetailView').html('');
					self.messageTemplates.remove(self.currentSelectedMessageTemplate);
					notificationService.showSuccess('删除消息模板成功');
				}
				else
					self.deleteMessageTemplateErrorFunction();
			};

			this.deleteMessageTemplateErrorFunction = function () {
				notificationService.showError('删除消息模板失败');
			};

			this.currentSelectedMessageTemplate = null;

			this.deleteMessageTemplate = function (item) {
				self.currentSelectedMessageTemplate = item;
				utpService.deleteMessageTemplate(item.id(), self.deleteMessageTemplateSuccessFunction, self.deleteMessageTemplateErrorFunction);
			};

			this.activate = function () {
				// self.prepareProtocolType();
				self.getProtocols(protocolService.dataType.GENERICBUSFRAME);
				self.selectedFile = null;
			};

			this.editor = null;
			this.currentSelectNode = null;
			this.editedProtocolConfig = null;

			this.detached = function (view, parent) {
				//清除数据
				self.protocols.removeAll();
			};
			this.validatorErrors = [];
			this.currentSchema = null;
			this.getMessageId = function (message) {
				var fields = message.fields;
				if (fields == null)
					return '';
				var id = '';
				for (var i = 0; i < fields.length; i++) {
					var field = fields[i];
					if (field.isId)
						id = id + field.value;
				}
				return id;
			};

			this.messageAttributeTableCheck = function (allJson) {
				var messageNames = [];
				var messageAttributeTablemessageNames = [];
				var errors = [];
				for (var i = 0; i < allJson.messages.length; i++) {
					var messageName = allJson.messages[i].messageName;
					messageNames.push(messageName);
				}
				for (var j = 0; j < allJson.messageAttributeTable.length; j++) {
					var messageName = allJson.messageAttributeTable[j].messageName;
					if (messageName != '') {
						messageAttributeTablemessageNames.push(messageName);
					}
				}
				//如果messageAttributeTable的名称不在messages中，则报错
				for (var i = 0; i < messageAttributeTablemessageNames.length; i++) {
					if (messageNames.indexOf(messageAttributeTablemessageNames[i]) == -1) {
						var path = ['messageAttributeTable'];
						path.push(i);
						path.push('messageName');
						errors.push(path);
					}
				}
				return errors;

			}
			this.protocolIdCheck = function (messages) {
				var messageIds = [];
				var errors = [];
				for (var i = 0; i < messages.length; i++) {
					var message = messages[i];
					var messageId = self.getMessageId(message);
					messageIds.push(messageId);
				}
				for (var i = 0; i < messageIds.length - 1; i++) {
					for (var j = i + 1; j < messageIds.length; j++) {
						if (messageIds[i] != '' && messageIds[i] === messageIds[j]) {
							var path = ['messages'];
							var duplicatePath = JSON.parse(JSON.stringify(path));
							path.push(i);
							errors.push(path);
							duplicatePath.push(j);
							errors.push(duplicatePath);
						}
					}
				}
				return errors;
			};
			this.enumNameCheck = function (enumTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < enumTypeDefineTable.length - 1; i++) {
					for (var j = i + 1; j < enumTypeDefineTable.length; j++) {
						if (enumTypeDefineTable[i].typeName === enumTypeDefineTable[j].typeName) {
							var path = ['enumTypeDefineTable'];
							path.push(i);
							path.push('typeName');
							var duplicatePath = ['enumTypeDefineTable'];
							duplicatePath.push(j);
							duplicatePath.push('typeName');
							errors.push(path);
							errors.push(duplicatePath);
						}
					}
				}
				return errors;
			};
			this.enumFieldNameCheck = function (enumTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < enumTypeDefineTable.length; i++) {
					var enumType = enumTypeDefineTable[i];
					for (var j = 0; j < enumType.fields.length - 1; j++) {
						for (var k = j + 1; k < enumType.fields.length; k++) {
							if (enumType.fields[j].name === enumType.fields[k].name) {
								var path = ['enumTypeDefineTable'];
								path.push(i);
								path.push('fields');
								var duplicatePath = JSON.parse(JSON.stringify(path));
								path.push(j);
								errors.push(path);
								duplicatePath.push(k);
								errors.push(duplicatePath);
							}
						}
					}
				}
				return errors;
			};
			this.messageNameCheck = function (messages) {
				var errors = [];
				for (var i = 0; i < messages.length - 1; i++) {
					for (var j = i + 1; j < messages.length; j++) {
						if (messages[i].messageName === messages[j].messageName) {
							var path = ['messages']; path.push(i); path.push('messageName');
							var duplicatePath = ['messages'];
							duplicatePath.push(j); duplicatePath.push('messageName');
							errors.push(path);
							errors.push(duplicatePath);
						}
					}
				}
				return errors;
			};
			//消息中的字段选择枚举时，default值是否在枚举中
			this.messageEnumerationCheck = function (allJson) {
				var messages = allJson.messages;
				var enumTypeDefineTable = allJson.enumTypeDefineTable;
				var errors = [];
				var flag = false;
				for (var i = 0; i < messages.length; i++) {
					var message = messages[i];
					for (var j = 0; j < message.fields.length; j++) {
						var field = message.fields[j];
						//遍历enumTypeDefineTable，查找typeName是否与field.enumName相同
						if (field.enumName) {
							var enumName = field.enumName;
							for (var k = 0; k < enumTypeDefineTable.length; k++) {
								if (enumName === enumTypeDefineTable[k].typeName) {
									//判断default是否在enums中
									var enums = enumTypeDefineTable[k].fields;
									//遍历
									for (var l = 0; l < enums.length; l++) {
										if (field.default.toString() === enums[l].value) {
											flag = true;
											break;
										}
									}
								}
							}
							if (!flag) {
								var path = ['messages']; path.push(i); path.push('fields');
								path.push(j);
								path.push('default');
								errors.push(path);
							}
						}
					}
				}
				return errors;
			};
			// bit中的字段选择枚举时，default值是否在枚举中
			this.bitEnumerationCheck = function (allJson) {
				var bitsTypeDefineTable = allJson.bitsTypeDefineTable;
				var enumTypeDefineTable = allJson.enumTypeDefineTable;
				var errors = [];
				var flag = false;
				for (var i = 0; i < bitsTypeDefineTable.length; i++) {
					var bit = bitsTypeDefineTable[i];
					for (var j = 0; j < bit.fields.length; j++) {
						var field = bit.fields[j];
						//遍历enumTypeDefineTable，查找typeName是否与field.enumName相同
						if (field.enumName) {
							var enumName = field.enumName;
							for (var k = 0; k < enumTypeDefineTable.length; k++) {
								if (enumName === enumTypeDefineTable[k].typeName) {
									//判断default是否在enums中
									var enums = enumTypeDefineTable[k].fields;
									//遍历
									for (var l = 0; l < enums.length; l++) {
										if (field.default === enums[l].value) {
											flag = true;
											break;
										}
									}
								}
							}
							if (!flag) {
								var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
								path.push(j);
								path.push('default');
								errors.push(path);
							}
						}
					}

				}
				return errors;

			}
			// 对增加的消息数量进行限制,功能不完善,能判断但是实际还是添加字段了
			// this.messageNumCheck = function(messages){
			// 	var messagesMaxCount = 5;
			// 	var  featureConfigValues= self.systemConfig.getConfigValuesByFeatureName('utpclient.protocol.msg.max_count')
			// 	if (featureConfigValues!=null) {
			// 		var configValuesObj = JSON.parse(featureConfigValues);
			// 		messagesMaxCount = configValuesObj;
			// 	}
			// 	if(messagesMaxCount==-1&&messages.length > messagesMaxCount){
			// 		notificationService.showError('消息数量超过最大限制,请安装相应许可！');
			// 		return false;
			// 	}
			// 	return true;
			// }

			this.messageFieldNameCheck = function (messages) {
				var errors = [];
				for (var i = 0; i < messages.length; i++) {
					var message = messages[i];
					for (var j = 0; j < message.fields.length - 1; j++) {
						for (var k = j + 1; k < message.fields.length; k++) {
							if (message.fields[j].name === message.fields[k].name) {
								var path = ['messages']; path.push(i); path.push('fields');
								var duplicatePath = JSON.parse(JSON.stringify(path));
								path.push(j);
								errors.push(path);
								duplicatePath.push(k);
								errors.push(duplicatePath);
							}
						}
					}
				}
				return errors;
			};

			this.bitTypeNameCheck = function (bitsTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < bitsTypeDefineTable.length - 1; i++) {
					for (var j = i + 1; j < bitsTypeDefineTable.length; j++) {
						if (bitsTypeDefineTable[i].typeName === bitsTypeDefineTable[j].typeName) {
							var path = ['bitsTypeDefineTable']; path.push(i); path.push('typeName');
							var duplicatePath = ['bitsTypeDefineTable'];
							duplicatePath.push(j); duplicatePath.push('typeName');
							errors.push(path);
							errors.push(duplicatePath);
						}
					}
				}
				return errors;
			};

			this.bitFieldNameCheck = function (bitsTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < bitsTypeDefineTable.length; i++) {
					var bit = bitsTypeDefineTable[i];
					if (bit == null || bit == "") {
						return errors;
					}
					for (var j = 0; j < bit.fields.length - 1; j++) {
						for (var k = j + 1; k < bit.fields.length; k++) {
							if (bit.fields[j].name === bit.fields[k].name) {
								var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
								var duplicatePath = JSON.parse(JSON.stringify(path));
								path.push(j);
								errors.push(path);
								duplicatePath.push(k);
								errors.push(duplicatePath);
							}
						}
					}
				}
				return errors;
			};

			this.bitFieldLengthCheck = function (bitsTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < bitsTypeDefineTable.length; i++) {
					var bit = bitsTypeDefineTable[i];
					if (bit.fields == null || bit.fields == "") {
						return errors;
					}
					for (var j = 0; j < bit.fields.length; j++) {
						var field = bit.fields[j];
						if (field.minimum && field.minimum.length != field.bitLength) {
							var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
							path.push(j);
							path.push('minimum');
							errors.push(path);
						}
						if (field.maximum && field.maximum.length != field.bitLength) {
							var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
							path.push(j);
							path.push('maximum');
							errors.push(path);
						}
						if (field.default && field.default.length != field.bitLength) {
							var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
							path.push(j);
							path.push('default');
							errors.push(path);
						}
					}
				}
				return errors;
			};
			this.enumvalueCheck = function (enumTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < enumTypeDefineTable.length; i++) {
					var enums = enumTypeDefineTable[i];
					if (enums.fields == null || enums.fields == "") {
						return errors;
					}
					for (var j = 0; j < enums.fields.length; j++) {
						var field = enums.fields[j];
						if (field.value) {
							var pattern = /^(0[xX])?[\da-fA-F]+$|^(\-)?\d+(\.\d+)?$/;
							if (!pattern.test(field.value)) {
								var path = ['enumTypeDefineTable'];
								path.push(i);
								path.push('fields');
								path.push(j);
								path.push('value');
								errors.push(path);
							}
						}
					}
				}
				return errors;
			};

			this.structTypeNameCheck = function (structTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < structTypeDefineTable.length - 1; i++) {
					for (var j = i + 1; j < structTypeDefineTable.length; j++) {
						if (structTypeDefineTable[i].typeName === structTypeDefineTable[j].typeName) {
							var path = ['structTypeDefineTable']; path.push(i); path.push('typeName');
							var duplicatePath = ['structTypeDefineTable'];
							duplicatePath.push(j); duplicatePath.push('typeName');
							errors.push(path);
							errors.push(duplicatePath);
						}
					}
				}
				return errors;
			};

			this.structFieldNameCheck = function (structTypeDefineTable) {
				var errors = [];
				for (var i = 0; i < structTypeDefineTable.length; i++) {
					var struct = structTypeDefineTable[i];
					for (var j = 0; j < struct.fields.length - 1; j++) {
						for (var k = j + 1; k < struct.fields.length; k++) {
							if (struct.fields[j].name === struct.fields[k].name) {
								var path = ['structTypeDefineTable']; path.push(i); path.push('fields');
								var duplicatePath = JSON.parse(JSON.stringify(path));
								path.push(j);
								errors.push(path);
								duplicatePath.push(k);
								errors.push(duplicatePath);
							}
						}
					}
				}
				return errors;
			};

			this.algorithmTypeNameCheck = function (algorithmDefineTable) {
				var errors = [];
				for (var i = 0; i < algorithmDefineTable.length - 1; i++) {
					for (var j = i + 1; j < algorithmDefineTable.length; j++) {
						if (algorithmDefineTable[i].name === algorithmDefineTable[j].name) {
							var path = ['algorithmDefineTable']; path.push(i); path.push('name');
							var duplicatePath = ['algorithmDefineTable'];
							duplicatePath.push(j); duplicatePath.push('name');
							errors.push(path);
							errors.push(duplicatePath);
						}
					}
				}
				return errors;
			};

			this.algorithmParamNameCheck = function (algorithmDefineTable) {
				var errors = [];
				for (var i = 0; i < algorithmDefineTable.length; i++) {
					var algorithm = algorithmDefineTable[i];
					if (algorithm.params != undefined && algorithm.params != null) {
						for (var j = 0; j < algorithm.params.length - 1; j++) {
							for (var k = j + 1; k < algorithm.params.length; k++) {
								if (algorithm.params[j].name === algorithm.params[k].name) {
									var path = ['algorithmDefineTable']; path.push(i); path.push('params');
									var duplicatePath = JSON.parse(JSON.stringify(path));
									path.push(j);
									errors.push(path);
									duplicatePath.push(k);
									errors.push(duplicatePath);
								}
							}
						}
					}
				}
				return errors;
			};

			this.getPaths = function (obj, parentKey) {
				var result;
				if (_.isArray(obj)) {
					var idx = 0;
					result = _.flatMap(obj, function (obj) {
						return self.getPaths(obj, (parentKey || '') + '[' + idx++ + ']');
					});
				}
				else if (_.isPlainObject(obj)) {
					result = _.flatMap(_.keys(obj), function (key) {
						return _.map(self.getPaths(obj[key], key), function (subkey) {
							return (parentKey ? parentKey + '.' : '') + subkey;
						});
					});
				}
				else {
					result = [];
				}
				return _.concat(result, parentKey || []);
			};
			// 简易模式
			this.protocolPattern = ko.observable(false); // 是否为简易编辑模式
			this.initProtocolConfig = function () {

				$('#protocolPatternConfig').bootstrapSwitch('state', self.protocolPattern());
				$('#protocolPatternConfig').on('switchChange.bootstrapSwitch', function (event, state) {
					self.protocolPattern(state);
				});

				// 根据许可设置开关的禁用状态
				if (self.pattern() != 'simpleAndAdvanced') {
					$('#protocolPatternConfig').bootstrapSwitch('disabled', true);
				} else {
					$('#protocolPatternConfig').bootstrapSwitch('disabled', false);
				}

				if (self.protocolPattern() && self.pattern() != 'advanced') {
					// 简单协议且未禁用简易模式
					$('#protocolPatternConfig').bootstrapSwitch('state', true);
				} else {
					$('#protocolPatternConfig').bootstrapSwitch('state', false);
					if (self.isComplexProtocol()) { // 复杂协议
						//关闭此model
						if (self.pattern() == 'simple') {
							notificationService.showError('当前协议为复杂协议,不支持简单模式编辑,请联系客服升级平台!');
							self.cancelProtocol();
						}
						else {
							$('#protocolPatternConfig').bootstrapSwitch('disabled', true);
						}
					} else {
						$('#protocolPatternConfig').bootstrapSwitch('disabled', true);
					}
				}
				// 检查条件，如果满足，则自动切换到简易模式
				// if (self.systemConfig.getConfig('utpclient.proto_mgr.complex_protocol_edit')) {
				// 	if (self.protocolPattern()) {
				// 		self.protocolPattern(true);
				// 		$('#protocolPatternConfig').bootstrapSwitch('state', true);
				// 	} else {
				// 		$('#protocolPatternConfig').bootstrapSwitch('state', false);
				// 		//关闭此model
				// 		notificationService.showError('当前协议为复杂协议,暂不支持,请联系客服升级平台!');
				// 		self.cancelProtocol();
				// 	}
				// } else {
				// 	if (self.protocolPattern()) {
				// 		self.protocolPattern(true);
				// 		$('#protocolPatternConfig').bootstrapSwitch('state', true);
				// 	}
				// }
			};

			this.currentPageIndex = 0;
			this.currentPageData = [];
			this.currentPageDirection = [];
			this.allPagesData = [];
			this.allPagesDirection = [];
			//判断数组中的name是否重复
			this.createTable = function createTable() {
				var tableContainer = document.getElementById('tableContainer');
				tableContainer.innerHTML = '<table class="table table-bordered">' +
					'<thead>' +
					'<tr>' +
					'<th style="width: 7%">编号</th>' +
					'<th style="width: 26%">名称</th>' +
					'<th style="width: 19%;">类型</th>' +
					'<th style="width: 10%;">字节数</th>' +
					'<th style="width: 27%;">默认值</th>' +
					'<th>操作</th>' +
					'</tr>' +
					'</thead>' +
					'<tbody id="fieldsTable"></tbody>' +
					'</table>';
				document.getElementById('simpleMessageName').value = ''; // 清空消息名称输入框
				self.selectedMessageDirection('sendAndReceive');// 清空消息方向下拉框
				self.addField(); // 添加一个初始字段行
			}
			this.loadExistingData = function loadExistingData() {
				if (self.allPagesData.length > 0) {
					self.currentPageIndex = 0; // 设置当前页面索引为第一页
					self.populateTable(self.allPagesData[self.currentPageIndex], self.allPagesDirection[self.currentPageIndex]); // 加载第一页的数据

				}
			}

			this.fromField = ko.observable();
			this.toField = ko.observable();

			this.dataBlocklength = ko.observable(1); // 数据块长度的最大字节
			this.dataBlockLen = ko.observable();//	数据块长度的值
			this.dataBlockDefault = ko.observable(); // 数据块默认值
			this.dataBlockLengthName = ko.observable('数据块长度'); // 数据块长度的名称
			this.dataName = ko.observable('数据块'); // 数据块的名称
			this.fieldValues = ko.observableArray([]);
			this.configNumber = 0;
			this.addField = function addField() {
				var table = document.getElementById('fieldsTable');
				var row = table.insertRow(-1);
				var currentRowCount = table.rows.length - 1; // 获取当前行数
				var fieldNumber = currentRowCount === 0 ? 0 : currentRowCount;
				row.id = fieldNumber - 1;

				if (fieldNumber < self.setInfo().length) {
					self.setInfo()[fieldNumber] = null;
				} else {
					self.setInfo().push(null);
				}
				// 插入编号
				row.insertCell(0).innerHTML = fieldNumber;

				// 插入字段名称输入框
				row.insertCell(1).innerHTML = '<input type="text" class="form-control" placeholder="字段名称">';

				// 插入字段类型选择框
				var selectFieldType = document.createElement('select');
				selectFieldType.className = 'form-control';
				self.fieldTypes.forEach(function (type) {
					var option = document.createElement('option');
					option.value = type;
					option.textContent = type;
					selectFieldType.appendChild(option);
				});
				var cellFieldType = row.insertCell(2);
				cellFieldType.appendChild(selectFieldType);

				// 插入字段大小选择框
				var selectFieldSize = document.createElement('select');
				selectFieldSize.className = 'form-control';
				[1, 2, 4, 8].forEach(function (size) {
					var option = document.createElement('option');
					option.value = size;
					option.textContent = size;
					selectFieldSize.appendChild(option);
				});
				var cellFieldSize = row.insertCell(3);
				cellFieldSize.appendChild(selectFieldSize);

				// 插入默认值输入框
				var defaultInput = document.createElement('input');
				defaultInput.type = 'text';
				defaultInput.className = 'form-control';
				defaultInput.placeholder = '默认值';
				var cellDefaultValue = row.insertCell(4);
				cellDefaultValue.appendChild(defaultInput);

				// 插入操作按钮
				var cell = row.insertCell(5);

				// 创建配置按钮
				var configButton = document.createElement('button');
				configButton.className = 'btn btn-sm btn-primary';
				configButton.textContent = '设置';
				configButton.type = 'button';
				configButton.style.display = 'none';
				configButton.onclick = function (event) {
					event.preventDefault();
					self.configNumber = fieldNumber;
					self.fieldValues.removeAll(); // 清空旧值
					var rows = document.querySelectorAll('#fieldsTable tr');
					rows.forEach(function (row) {
						var fieldInput = row.cells[1].querySelector('input');
						if (fieldInput) {
							self.fieldValues.push(fieldInput.value.trim());
						}
					}.bind(this));
					var typeName = row.cells[2].querySelector('select').value;
					if (typeName === 'CRC校验') {
						self.algorithmChooose(true);
					} else {
						self.algorithmChooose(false);
					}
					if (selectFieldType.value === '数据块') {
						self.isDataBlock(true);
						if (self.setInfo()[fieldNumber] === null) {
							self.dataBlocklength('');
							self.dataBlockLen('');
							self.dataBlockDefault('');
							self.dataBlockLengthName('数据块长度');
							self.dataName('数据块');
						}
						else {
							self.dataBlocklength(self.setInfo()[fieldNumber].dataLen.bitLength / 8);
							self.dataBlockLen(self.setInfo()[fieldNumber].dataLen.default);
							self.dataBlockDefault(self.setInfo()[fieldNumber].data.default);
						}
					} else {
						self.isDataBlock(false);
						if (self.setInfo()[fieldNumber] === null) {
							self.fromField('');
							self.toField('');
							self.selectedCrcAlgorithm('');
						}
						else {
							self.fromField(self.setInfo()[fieldNumber].fromField);
							self.toField(self.setInfo()[fieldNumber].toField);
							self.selectedCrcAlgorithm(self.setInfo()[fieldNumber].crcAlgorithm);
						}

					}
					// 显示配置模态框
					$('#proConfigModal').modal('show');
				}
				// 创建删除按钮
				var deleteButton = document.createElement('button');
				deleteButton.className = 'btn btn-sm btn-danger';
				deleteButton.textContent = '删除';
				deleteButton.onclick = function () { self.removeField(row.rowIndex); self.setInfo().splice(row.rowIndex, 1); };

				// 创建按钮容器
				var buttonContainer = document.createElement('div');
				buttonContainer.style.display = 'flex';
				buttonContainer.appendChild(deleteButton);
				buttonContainer.appendChild(configButton);

				// 将按钮容器添加到单元格中
				cell.appendChild(buttonContainer);

				// 添加选择事件监听器
				selectFieldType.onchange = function () {
					if (selectFieldType.value === '数据块') {
						configButton.style.display = 'inline-block'; // 显示设置按钮
						defaultInput.style.display = 'none'; //隐藏默认值输入框
						self.algorithmChooose(false); // 关闭算法选择框
						selectFieldSize.style.display = 'none'; // 隐藏字节选择框
						self.isDataBlock(true);
						if (self.setInfo()[currentRowCount] === null) { // 重置设置信息
							self.setInfo()[currentRowCount] = {
								dataLen: {
									name: '数据块长度',
									bitLength: 1,
									default: ''
								},
								data: {
									name: '数据块',
									default: ''
								}
							}
						}
					} else if (selectFieldType.value === '长度字段' || selectFieldType.value === 'Checksum校验' || selectFieldType.value === 'LRC校验') {
						configButton.style.display = 'inline-block';
						if (selectFieldType.value === '长度字段') {
							defaultInput.style.display = 'none';
						} else {
							defaultInput.style.display = 'inline-block';
						}
						defaultInput.placeholder = '请输入十六进制校验码';
						self.algorithmChooose(false);
						selectFieldSize.style.display = 'inline-block';
						self.isDataBlock(false);
						if (self.setInfo()[currentRowCount] === null) {
							self.setInfo()[currentRowCount] = {
								fromField: '',
								toField: ''
							}
						}
					} else if (selectFieldType.value === 'CRC校验') {
						configButton.style.display = 'inline-block';
						defaultInput.style.display = 'inline-block';
						defaultInput.placeholder = '请输入十六进制校验码';
						self.algorithmChooose(true);
						selectFieldSize.style.display = 'inline-block';
						self.isDataBlock(false);
						if (self.setInfo()[currentRowCount] === null) {
							self.setInfo()[currentRowCount] = {
								fromField: '',
								toField: '',
								crcAlgorithm: self.crcAlgorithm[0]
							}
						}
					} else if (selectFieldType.value === '变长数据') {
						configButton.style.display = 'none';
						defaultInput.style.display = 'inline-block';
						defaultInput.placeholder = '默认值';
						self.algorithmChooose(false);
						selectFieldSize.style.display = 'none';
						self.isDataBlock(false);
					} else {
						configButton.style.display = 'none';
						defaultInput.style.display = 'inline-block';
						defaultInput.placeholder = '默认值';
						self.algorithmChooose(false);
						selectFieldSize.style.display = 'inline-block';
						self.isDataBlock(false);
					}
				};

				if (self.popOrAdd && !self.firstCreateTable) {
					self.savePageData();
					self.populateTable(self.allPagesData[self.currentPageIndex], self.allPagesDirection[self.currentPageIndex]);
				}
				self.firstCreateTable = false;
			};

			this.saveConfig = function () {
				if (self.isDataBlock()) {
					self.setInfo()[self.configNumber] = {
						dataLen: {
							name: self.dataBlockLengthName(),
							bitLength: self.dataBlocklength(),
							default: self.dataBlockLen(),
						},
						data: {
							name: self.dataName(),
							default: self.dataBlockDefault(),
						}
					};
				} else {
					self.setInfo()[self.configNumber] = {
						fromField: self.fromField(),
						toField: self.toField(),
						crcAlgorithm: self.selectedCrcAlgorithm(),
					};
				}

				self.fromField();
				self.toField();
				self.selectedCrcAlgorithm(self.crcAlgorithm[0]);
				self.dataBlocklength(1);
				self.dataBlockLen();
				self.dataBlockDefault();
				$('#proConfigModal').modal('hide');
			};

			this.closeModal = function () {
				self.fromField();
				self.toField();
				self.selectedCrcAlgorithm(self.crcAlgorithm[0]);
				self.dataBlocklength(1);
				self.dataBlockLen();
				self.dataBlockDefault();
				$('#proConfigModal').modal('hide');
			}
			this.removeField = function removeField(rowIndex) {
				var table = document.getElementById('fieldsTable');
				if (table.rows.length >= rowIndex) {
					table.deleteRow(rowIndex - 1);
					self.updateFieldNumbers();
				}
			};

			this.updateFieldNumbers = function updateFieldNumbers() {
				var table = document.getElementById('fieldsTable');
				for (var i = 0; i < table.rows.length; i++) {
					table.rows[i].cells[0].innerHTML = i; // 更新编号
					table.rows[i].id = i; // 更新行ID
				}
			}
			// 页码数组，用于foreach遍历
			this.totalPages = ko.observableArray();
			this.currentPage = ko.observable();

			this.pageNumbers = function pageNumbers() {
				self.totalPages([]);
				self.currentPage(1);
				var count = self.allPagesData.length;
				for (let i = 1; i < count + 1; i++) {
					self.totalPages.push(i);
				}
				return {
					totalPages: self.totalPages,
					printPageNumber: self.printPageNumber,
				};
			};

			this.printPageNumber = function (printPage) {
				if (!self.savePageData()) { // 保存跳转前的页面数据
					return;
				}
				self.currentPage(printPage);
				self.currentPageIndex = printPage - 1;
				self.populateTable(self.allPagesData[self.currentPageIndex], self.allPagesDirection[self.currentPageIndex]);
				self.selectedMessageDirection(self.allPagesDirection[self.currentPageIndex]);
				// self.savePageData();
			};
			this.removeNewPage = function removeNewPage() {
				if (self.allPagesData.length == 1) {
					notificationService.showError('当前只有一页,不可删除');
				} else {
					if (self.currentPageIndex == self.allPagesData.length - 1) {
						//最后一页
						self.allPagesData.splice(self.currentPageIndex, 1);
						self.currentPageIndex = self.allPagesData.length - 1;
					} else {
						//不是最后一页
						self.allPagesData.splice(self.currentPageIndex, 1);
					}
					self.populateTable(self.allPagesData[self.currentPageIndex], self.allPagesDirection[self.currentPageIndex]);
				}
				self.pageNumbers();//更新页面数量
				self.currentPage(self.currentPageIndex + 1);
			}

			this.createNewPage = function createNewPage() {
				if (!self.savePageData()) {
					return;
				}
				self.firstCreateTable = true;
				self.createTable(); // 创建新的空白页
				self.currentPageIndex = self.allPagesData.length; // 更新当前页面索引为新创建的页面索引
				self.allPagesData.push({ name: '', fields: [] }); // 添加一个空的页面数据
				self.totalPages.removeAll();
				self.pageNumbers();
				self.currentPage(self.currentPageIndex + 1);
			};

			this.savePageData = function savePageData() {
				self.saveMessageConfig();
				var simpleMessageName = document.getElementById('simpleMessageName').value.trim();
				var messageDirection = self.selectedMessageDirection();
				var fields = [];
				var nameExists = false;
				var fieldNames = new Set();

				// 获取所有行
				var rows = document.querySelectorAll('#fieldsTable tr');
				for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
					var row = rows[rowIndex];
					var inputs = row.querySelectorAll('input');
					var nameInput = inputs[0];
					var selects = row.querySelectorAll('select');
					var typeSelect = selects[0];
					var sizeSelect = selects[1];
					var defaultInput = inputs[1];
					if (nameInput && typeSelect && sizeSelect) {
						var fieldName = nameInput.value.trim();
						if (fieldName === '' && self.firstCreateTable) {
							notificationService.showError('字段名称不能为空！');
							return false;
						}
						if (fieldNames.has(fieldName) && self.firstCreateTable) {
							notificationService.showError('字段名称不能重复，请修改编号为' + rowIndex + '的字段名称！');
							return false;
						}
						//判断defalue是否为数字
						if (defaultInput.value.trim() !== '' && isNaN(defaultInput.value.trim()) && self.firstCreateTable) {
							notificationService.showError('默认值必须为数字，请修改编号为' + rowIndex + '的默认值！');
							return false;
						}

						if (selects[0].value.trim() === '数据块' && self.firstCreateTable) {
							let dalen = parseInt(self.setInfo()[rowIndex].dataLen.bitLength, 10);
							dalen = dalen * 8;
							let dataLen = self.setInfo()[rowIndex].dataLen.default;
							if (dataLen === '') {
								notificationService.showError('数据块长度不能为空！请检查编号为' + rowIndex + '的设置中的内容！');
								return false;
							}
							if (dataLen > Math.pow(2, dalen) || dataLen < 0) {
								notificationService.showError('数据块长度超出范围！请检查编号为' + rowIndex + '的设置中的内容！');
								return false;
							}
						}

						fieldNames.add(fieldName);
						if (typeSelect.value === "长度字段") {
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								size: parseInt(sizeSelect.value, 10),
								fromField: self.setInfo()[rowIndex].fromField,
								toField: self.setInfo()[rowIndex].toField
							});
						} else if (typeSelect.value === "变长数据") {
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								default: defaultInput.value.trim(),
							});
						} else if (typeSelect.value === "标记字段") {
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								size: parseInt(sizeSelect.value, 10),
								value: defaultInput.value.trim().startsWith("0x") ? defaultInput.value.trim() : parseInt(defaultInput.value.trim()),
							});
						} else if (typeSelect.value === "Checksum校验" || typeSelect.value === "LRC校验") {
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								size: parseInt(sizeSelect.value, 10),
								value: defaultInput.value.trim().startsWith("0x") ? defaultInput.value.trim() : parseInt(defaultInput.value.trim()),
								fromField: self.setInfo()[rowIndex].fromField,
								toField: self.setInfo()[rowIndex].toField
							});
						} else if (typeSelect.value === "CRC校验") {
							// console.log(self.setInfo()[rowIndex])
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								size: parseInt(sizeSelect.value, 10),
								value: defaultInput.value.trim().startsWith("0x") ? defaultInput.value.trim() : parseInt(defaultInput.value.trim()),
								fromField: self.setInfo()[rowIndex].fromField,
								toField: self.setInfo()[rowIndex].toField,
								crcAlgorithm: self.setInfo()[rowIndex].crcAlgorithm
							});
						} else if (typeSelect.value === "数据块") {
							let dalen = parseInt(self.setInfo()[rowIndex]?.dataLen.bitLength, 10);
							dalen = dalen * 8;
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								dataLen: {
									type: 'uinteger',
									name: self.setInfo()[rowIndex].dataLen.name,
									bitLength: dalen,
									minimum: 0,
									maximum: Math.pow(2, dalen) - 1,
									default: self.setInfo()[rowIndex].dataLen.default
								},
								data: {
									type: 'rawdata',
									name: self.setInfo()[rowIndex].data.name,
									default: self.setInfo()[rowIndex].data.default == '' ? 0 : self.setInfo()[rowIndex].data.default
								}
							});
						} else {
							fields.push({
								name: nameInput.value.trim(),
								type: typeSelect.value,
								size: parseInt(sizeSelect.value, 10),
								default: defaultInput.value.trim().startsWith("0x") ? defaultInput.value.trim() : parseInt(defaultInput.value.trim())
							});
						}
					}
				}
				//判断消息名称是否为空
				if (simpleMessageName === '') {
					notificationService.showError('消息名称不能为空！');
					return false;
				}

				if (messageDirection === '') {
					notificationService.showError('消息方向不能为空！');
					return false;
				}

				// 检查名称是否重复
				for (var i = 0; i < self.allPagesData.length; i++) {
					if (i !== self.currentPageIndex && self.allPagesData[i].name === simpleMessageName) {
						nameExists = true;
						break;
					}
				}

				if (nameExists) {
					notificationService.showError('消息名称重复！');
					return false;
				}

				self.currentPageData = {
					name: simpleMessageName,
					fields: fields
				};

				// let atteibutes = []
				// if (self.selectedMessageDirection() === 'send') {
				// 	atteibutes = [
				// 		{ name: "receiveFlag", value: "0" },
				// 		{ name: "sendFlag", value: "1" }
				// 	]
				// } else if (self.selectedMessageDirection() === 'receive') {
				// 	atteibutes = [
				// 		{ name: "receiveFlag", value: "1" },
				// 		{ name: "sendFlag", value: "0" }
				// 	]
				// } else {
				// 	atteibutes = [
				// 		{ name: "receiveFlag", value: "1" },
				// 		{ name: "sendFlag", value: "1" }
				// 	]
				// }

				// if (self.selectedMessageIdExistence() == 'yes') {
				// 	let a = {
				// 		name: 'messageID',
				// 		value: self.setMessageId(),
				// 		unique: self.uniqueMessageID()
				// 	}
				// 	atteibutes.unshift(a);
				// }
				// self.currentPageDirection = {
				// 	messageName: simpleMessageName,
				// 	attributes: atteibutes
				// }
				self.allPagesData[self.currentPageIndex] = self.currentPageData;
				self.allPagesDirection[self.currentPageIndex].messageName = self.currentPageData.name;

				self.selectedMessageDirection('sendAndReceive')
				self.selectedMessageIdExistence('no')
				self.setMessageId('')
				self.uniqueMessageID('false')
				return true;
			};

			// this.updatePageButtons=function updatePageButtons() {
			//     // 根据当前页面索引更新按钮的显示状态
			//     document.getElementById('prevPageBtn').style.display = self.currentPageIndex() > 0 ? 'block' : 'none';
			// }
			this.fieldTypes = protocolService.fieldTypes;
			this.populateTable = function populateTable(pageData, direction) {
				self.popOrAdd = true;
				document.getElementById('simpleMessageName').value = pageData.name;

				if (direction) { // 使用松散相等匹配数字和字符串
					// 根据属性名查找对应的值（注意大小写匹配）
					const receiveFlag = direction.attributes?.find(attr => attr.name === 'receiveFlag')?.value ?? '1';
					const sendFlag = direction.attributes?.find(attr => attr.name === 'sendFlag')?.value ?? '1';

					// 简化判断条件（建议显式转换为数字）
					if (+receiveFlag === 1 && +sendFlag === 1) {
						self.selectedMessageDirection('sendAndReceive');
					} else if (+receiveFlag === 0 && +sendFlag === 1) {
						self.selectedMessageDirection('send');
					} else if (+receiveFlag === 1 && +sendFlag === 0) {
						self.selectedMessageDirection('receive');
					}

					if (direction.attributes.find(attr => attr.name === 'messageID')) {
						let a = direction.attributes.find(attr => attr.name === 'messageID')
						self.selectedMessageIdExistence('yes')
						self.setMessageId(a.value)
						self.uniqueMessageID(a.unique)
					} else {
						self.selectedMessageIdExistence('no')
						self.setMessageId('')
						self.uniqueMessageID('false')
					}
				} else {
					self.selectedMessageDirection('sendAndReceive');
					self.selectedMessageIdExistence('no')
				}
				var fieldsTable = document.getElementById('fieldsTable');
				fieldsTable.innerHTML = ''; // 清空现有字段行

				pageData.fields.forEach((field, index) => {
					var row = fieldsTable.insertRow(-1);
					row.id = index;
					row.insertCell(0).innerHTML = index;
					row.insertCell(1).innerHTML = '<input type="text" class="form-control" value="' + field.name + '">';

					var selectFieldType = document.createElement('select');
					selectFieldType.className = 'form-control';

					// 创建配置按钮
					var configButton = document.createElement('button');
					configButton.className = 'btn btn-sm btn-primary';
					configButton.textContent = '设置';
					configButton.type = 'button'; // 明确设置按钮类型为 button
					configButton.style.display = 'none'; // 初始状态下隐藏设置按钮

					configButton.dataset.fromField = '';
					configButton.dataset.toField = '';
					configButton.dataset.selectedCrcAlgorithm = '';

					if (field.type === 'datablock') {
						self.setInfo()[index] = {
							dataLen: {
								name: field.dataLen.name,
								bitLength: field.dataLen.bitLength,
								default: field.dataLen.default
							},
							data: {
								name: field.data.name,
								default: field.data.default
							}
						}
					} else if (field.type === 'dataLength' || field.type === 'checksum' || field.type === 'lrc' || field.type === 'crc') {
						self.setInfo()[index] = {
							fromField: field.fromField,
							toField: field.toField,
							crcAlgorithm: field.crcAlgorithm
						}
					}

					configButton.onclick = function (event) {
						event.preventDefault();
						self.configNumber = index;
						var rows = document.querySelectorAll('#fieldsTable tr');
						self.fieldValues.removeAll(); // 清空旧值
						rows.forEach(function (row) {
							var fieldInput = row.cells[1].querySelector('input');
							if (fieldInput) {
								self.fieldValues.push(fieldInput.value.trim());
							}
						}.bind(this));
						var typeName = row.cells[2].querySelector('select').value;
						if (typeName === 'CRC校验') {
							self.algorithmChooose(true);
						} else {
							self.algorithmChooose(false);
						}
						if (selectFieldType.value === '数据块') {
							self.isDataBlock(true);
							if (self.setInfo()[index] === null) {
								self.dataBlocklength('');
								self.dataBlockLen('');
								self.dataBlockDefault('');
								self.dataBlockLengthName('数据块长度');
								self.dataName('数据块');
							}
							else {
								self.dataBlocklength(self.setInfo()[index].dataLen.bitLength / 8);
								self.dataBlockLen(self.setInfo()[index].dataLen.default);
								self.dataBlockDefault(self.setInfo()[index].data.default);
								self.dataBlockLengthName(self.setInfo()[index].dataLen.name);
								self.dataName(self.setInfo()[index].data.name);
							}

						} else {
							self.isDataBlock(false);
							if (self.setInfo()[index] === null) {
								self.fromField('');
								self.toField('');
								self.selectedCrcAlgorithm('');
							}
							else {
								self.fromField(self.setInfo()[index].fromField);
								self.toField(self.setInfo()[index].toField);
								self.selectedCrcAlgorithm(self.setInfo()[index].crcAlgorithm);
							}
						}
						// 显示配置模态框
						$('#proConfigModal').modal('show');
					}.bind(this);

					self.fieldTypes.forEach(function (type) {
						var option = document.createElement('option');
						option.value = type;
						option.textContent = type;
						let typeName = '';
						switch (type) {
							case "标记字段":
								typeName = "flag";
								break;
							case "长度字段":
								typeName = "dataLength";
								break;
							case "CRC校验":
								typeName = "crc";
								break;
							case "无符号整数":
								typeName = "uinteger";
								break;
							case "有符号整数":
								typeName = "integer";
								break;
							case "变长数据":
								typeName = "vardata";
								break;
							case "Checksum校验":
								typeName = "checksum";
								break;
							case "LRC校验":
								typeName = "lrc";
							case "数据块":
								typeName = "datablock";
								break;
						}
						if (type === field.type || typeName === field.type) {
							option.selected = true;
						}
						option.typeName = typeName; // 将 typeName 添加到 option 元素中
						selectFieldType.appendChild(option);
					});

					// 添加选择事件监听器
					selectFieldType.onchange = function () {
						if (selectFieldType.value === '数据块') {
							configButton.style.display = 'inline-block'; // 显示设置按钮
							defaultInput.style.display = 'none'; //隐藏默认值输入框
							self.algorithmChooose(false); // 关闭算法选择框
							selectFieldSize.style.display = 'none'; // 隐藏字节选择框
							self.isDataBlock(true);
							if (self.setInfo()[index] === null) { // 重置设置信息
								self.setInfo()[index] = {
									dataLen: {
										name: '数据块长度',
										bitLength: 1,
										default: ''
									},
									data: {
										name: '数据块',
										default: ''
									}
								}
							}
						} else if (selectFieldType.value === '长度字段' || selectFieldType.value === 'Checksum校验' || selectFieldType.value === 'LRC校验') {
							configButton.style.display = 'inline-block';
							defaultInput.style.display = 'inline-block';
							if (selectFieldType.value === '长度字段') {
								defaultInput.style.display = 'none';
							} else {
								defaultInput.style.display = 'inline-block';
							}
							defaultInput.placeholder = '请输入十六进制校验码';
							self.algorithmChooose(false);
							selectFieldSize.style.display = 'inline-block';
							self.isDataBlock(false);
							if (self.setInfo()[index] === null) {
								self.setInfo()[index] = {
									fromField: '',
									toField: ''
								}
							}
						} else if (selectFieldType.value === 'CRC校验') {
							configButton.style.display = 'inline-block';
							defaultInput.style.display = 'inline-block';
							defaultInput.placeholder = '请输入十六进制校验码';
							self.algorithmChooose(true);
							selectFieldSize.style.display = 'inline-block';
							self.isDataBlock(false);
							if (self.setInfo()[index] === null) {
								self.setInfo()[index] = {
									fromField: '',
									toField: '',
									crcAlgorithm: self.crcAlgorithm[0]
								}
							}
						} else if (selectFieldType.value === '变长数据') {
							configButton.style.display = 'none';
							defaultInput.style.display = 'inline-block';
							defaultInput.placeholder = '默认值';
							self.algorithmChooose(false);
							selectFieldSize.style.display = 'none';
							self.isDataBlock(false);
						} else {
							configButton.style.display = 'none';
							defaultInput.style.display = 'inline-block';
							defaultInput.placeholder = '请输入默认值';
							self.algorithmChooose(false);
							selectFieldSize.style.display = 'inline-block';
							self.isDataBlock(false);
						}
					};

					var cellFieldType = row.insertCell(2);
					cellFieldType.appendChild(selectFieldType);

					// 第三列设置为下拉框
					var selectFieldSize = document.createElement('select');
					selectFieldSize.className = 'form-control';
					[1, 2, 4, 8].forEach(function (size) {
						var option = document.createElement('option');
						option.value = size;
						option.textContent = size;
						if (size === field.size || size === field.bitLength / 8) {
							option.selected = true;
						}
						selectFieldSize.appendChild(option);
					});
					var cellFieldSize = row.insertCell(3);
					cellFieldSize.appendChild(selectFieldSize);

					// 判断 field 有没有 default 属性
					var cellDefaultValue = row.insertCell(4);
					var defaultInput = document.createElement('input');
					defaultInput.type = 'text';
					defaultInput.className = 'form-control';
					// 根据 field.default 或 field.value 设置默认值
					if (field.default === undefined) {
						defaultInput.value = field.value || '';
					} else {
						defaultInput.value = field.default;
					}

					cellDefaultValue.appendChild(defaultInput);
					var cell = row.insertCell(5);

					// 创建一个容器元素来包裹两个按钮
					var buttonContainer = document.createElement('div');
					buttonContainer.style.display = 'flex'; // 使用 Flexbox 布局使按钮在同一行

					// 添加删除按钮到容器中
					var deleteButton = document.createElement('button');
					deleteButton.className = 'btn btn-sm btn-danger';
					deleteButton.textContent = '删除';
					deleteButton.type = 'button'; // 明确设置按钮类型为 button
					deleteButton.onclick = function (event) {
						event.preventDefault();

						// 同步当前表格的修改到pageData.fields
						var rows = document.querySelectorAll('#fieldsTable tr');
						rows.forEach(function (row, rowIndex) {
							var cells = row.cells;
							var fieldInput = cells[1].querySelector('input');
							var typeSelect = cells[2].querySelector('select');
							var sizeSelect = cells[3].querySelector('select');
							var defaultInput = cells[4].querySelector('input');

							var currentField = pageData.fields[rowIndex];
							if (currentField) {
								currentField.name = fieldInput.value.trim();

								// 转换类型名称（例如将中文转换为英文标识）
								let typeValue = typeSelect.value;
								let typeName = '';
								switch (typeValue) {
									case '数据块': typeName = 'datablock'; break;
									case '长度字段': typeName = 'dataLength'; break;
									case 'CRC校验': typeName = 'crc'; break;
									case 'Checksum校验': typeName = 'checksum'; break;
									case 'LRC校验': typeName = 'lrc'; break;
									case '无符号整数': typeName = 'uinteger'; break;
									case '有符号整数': typeName = 'integer'; break;
									case '变长数据': typeName = 'vardata'; break;
									default: typeName = typeValue.toLowerCase();
								}
								currentField.type = typeName;

								// 更新字段大小/长度
								if (typeName === 'datablock') {
									// 数据块的长度在配置中处理，此处无需更新
								} else if (typeName === 'vardata') {
									// 变长数据无固定大小
									delete currentField.size;
								} else {
									currentField.size = parseInt(sizeSelect.value) || 0;
								}

								// 更新默认值
								if (['crc', 'checksum', 'lrc', 'dataLength'].includes(typeName)) {
									currentField.value = defaultInput.value; // 校验字段可能用value
								} else {
									currentField.default = defaultInput.value;
								}
							}
						});

						// 执行删除操作
						self.removeField(index);
						pageData.fields.splice(index, 1);
						self.setInfo().splice(index, 1);
						self.populateTable(pageData, direction);
					};
					buttonContainer.appendChild(deleteButton);
					// 添加配置按钮到容器中
					buttonContainer.appendChild(configButton);

					// 将容器添加到单元格中
					cell.appendChild(buttonContainer);

					// 检查初始值，以决定是否显示“设置按钮”
					if (field.type === '长度字段' || field.type === 'dataLength' || field.type === '数据块' || field.type === 'datablock') {
						configButton.style.display = 'inline-block'; // 显示设置按钮
						self.algorithmChooose(false);
						defaultInput.style.display = 'none';
					} else if (field.type === 'CRC校验' || field.type === 'Checksum校验' || field.type === 'LRC校验' || field.type === 'dataLength' || field.type === 'crc' || field.type === 'checksum' || field.type === 'lrc') {
						configButton.style.display = 'inline-block'; // 显示设置按钮
						if (selectFieldType.value === 'CRC校验') {
							self.algorithmChooose(true);
							self.selectedCrcAlgorithm(field.crcAlgorithm);
						}
						defaultInput.placeholder = '请输入十六进制校验码';
					} else {
						configButton.style.display = 'none'; // 隐藏设置按钮
						self.algorithmChooose(false);
						defaultInput.style.display = 'inline-block';
					}

					if (field.type === '变长数据' || field.type === 'vardata' || field.type === '数据块' || field.type === 'datablock') {
						selectFieldSize.style.display = 'none';
					} else {
						selectFieldSize.style.display = 'inline-block';
					}
				});
			}
			this.getTemplateValue = function getTemplateValue(fieldType, fieldName, fieldSize, fieldDefault, pageNumber, listNumber) {
				var getTemplate = protocolService.getTemplate();
				//遍历
				for (var i = 0; i < getTemplate.length; i++) {
					var currentData = getTemplate[i];
					if (currentData.text === fieldType) {
						var value = currentData.value;
						value.name = fieldName;
						value.bitLength = fieldSize;
						//判断是否有default属性
						if (value.default === undefined) {
							value.default = fieldDefault;
						} else {
							value.default = fieldDefault;
						}
						// 暂时关闭fieldSize
						if (fieldType === "有符号整数") {
							switch (fieldSize / 8) {
								case 1:
									value.minimum = -128;
									value.maximum = 127;
									break;
								case 2:
									value.minimum = -32768;
									value.maximum = 32767;
									break;
								case 4:
									value.minimum = -2147483648;
									value.maximum = 2147483647;
									break;
								case 8:
									value.minimum = -9223372036854775808;
									value.maximum = 9223372036854775807;
									break;
							}

							if (value.default < value.minimum || value.default > value.maximum) {
								notificationService.showError('第' + pageNumber + '页编号为' + (listNumber - 1) + '的字段范围错误');
								return false;
							}
						} else if (fieldType !== "变长数据" && fieldType !== "长度字段") {
							switch (fieldSize / 8) {
								case 1:
									value.minimum = "0";
									value.maximum = "0xff";
									break;
								case 2:
									value.minimum = "0";
									value.maximum = "0xffff";
									break;
								case 4:
									value.minimum = "0";
									value.maximum = "0xffffffff";
									break;
								case 8:
									value.minimum = "0";
									value.maximum = "0xffffffffffffffff";
									break;
							}
							if (typeof value === "string" && value.toLowerCase().startsWith("0x")) {
								// 如果是十六进制字符串，按十六进制解析
								let defaultValue = parseInt(value.default, 16);
								let minimumValue = parseInt(value.minimum, 16);
								let maximumValue = parseInt(value.maximum, 16);
								if (defaultValue < minimumValue || defaultValue > maximumValue) {
									notificationService.showError('第' + pageNumber + '页编号为' + (listNumber - 1) + '的字段范围错误');
									return false;
								}
							} else {
								// 否则按十进制解析
								if (value.default < value.minimum || value.default > value.maximum) {
									notificationService.showError('第' + pageNumber + '页编号为' + (listNumber - 1) + '的字段范围错误');
									return false;
								}
							}
						}
						return value;
					}
				}
			}
			this.complete = function complete() {
				//定义一个协议
				let simpleProtocol = protocolService.protocolTemplate;
				if (self.isEditMode()) {
					simpleProtocol = self.currentProtocolContent;
				}

				simpleProtocol.messages = [];
				simpleProtocol.messageAttributeTable = [];
				//遍历allPagesData的内容
				//获取getTemplate内容

				for (let i = 0; i < self.allPagesData.length; i++) {
					let currentData = self.allPagesData[i];
					//获取name
					let fields = currentData.fields;

					let message = {
						messageName: currentData.name,
						fields: []
					};
					for (let j = 0; j < fields.length; j++) {
						let fieldName = fields[j].name;

						let fieldType = fields[j].type;
						switch (fieldType) {
							case "flag":
								fieldType = "标记字段";
								break;
							case "dataLength":
								fieldType = "长度字段";
								break;
							case "vardata":
								fieldType = "变长数据";
								break;
							case "uinteger":
								fieldType = "无符号整数";
								break;
							case "integer":
								fieldType = "有符号整数";
								break;
							case "checksum":
								fieldType = "Checksum校验";
								break;
							case "lrc":
								fieldType = "LRC校验";
								break;
							case "crc":
								fieldType = "CRC校验";
								break;
							case "datablock":
								fieldType = "数据块";
								break;
						}

						let fieldSize = null;
						if (fields[j].size) {
							fieldSize = fields[j].size * 8;
						}
						if (fields[j].bitLength) {
							fieldSize = fields[j].bitLength;
						}

						let fieldResult = 0;
						if (fields[j].default) {
							fieldResult = fields[j].default;
						}
						if (fields[j].value) {
							fieldResult = fields[j].value;
						}
						let pageNumber = i + 1;
						let listNumber = j + 1;
						let value = self.getTemplateValue(fieldType, fieldName, fieldSize, fieldResult, pageNumber, listNumber);
						if (fieldType == "长度字段") {
							value.fromField = fields[j].fromField;
							value.toField = fields[j].toField;
							delete value.default;
							delete value.value;
						}
						if (fieldType == "LRC校验" || fieldType == "Checksum校验") {
							value.fromField = fields[j].fromField;
							value.toField = fields[j].toField;
						}
						if (fieldType == "CRC校验") {
							value.fromField = fields[j].fromField;
							value.toField = fields[j].toField;
							value.crcAlgorithm = fields[j].crcAlgorithm;
						}
						if (fieldType == "变长数据") {
							delete value.bitLength;
						}
						if (fieldType == "数据块") {
							delete value.bitLength;
							delete value.default;
							value.dataLen = fields[j].dataLen;
							value.data = fields[j].data;
						}

						if (fieldType == "标记字段" || fieldType == "CRC校验" || fieldType == "LRC校验" || fieldType == "Checksum校验") {
							if (fieldType == "标记字段" || fieldType == "CRC校验" || fieldType == "LRC校验" || fieldType == "Checksum校验") {
								if (!String(value.default).startsWith("0x")) {
									value.value = "0x" + value.default.toString(16);
								} else {
									value.value = value.default;
								}
								delete value.default;
								delete value.maximum;
								delete value.minimum;
							}

						}

						if (value == false) {
							simpleProtocol = false;
							return false
						} else {
							message.fields.push(value);
						}
					}
					simpleProtocol.messages.push(message);

					let directionValue = self.allPagesDirection?.[i]; // 获取数组中第i个元素的值
					// let attributes = [];

					// // 根据directionValue的值设置不同的标志位
					// if (directionValue === 'receive') {
					// 	attributes = [
					// 		{ name: "receiveFlag", value: "1" },
					// 		{ name: "sendFlag", value: "0" }
					// 	];
					// } else if (directionValue === 'send') {
					// 	attributes = [
					// 		{ name: "receiveFlag", value: "0" },
					// 		{ name: "sendFlag", value: "1" }
					// 	];
					// } else {
					// 	// 如果是sendAndReceive或者没有值，则两个标志位都为1
					// 	attributes = [
					// 		{ name: "receiveFlag", value: "1" },
					// 		{ name: "sendFlag", value: "1" }
					// 	];
					// }

					// let direction = {
					// 	messageName: currentData.name,
					// 	attributes: directionValue
					// };
					if (directionValue != null && directionValue != undefined) {
						simpleProtocol.messageAttributeTable.push(directionValue);
					}
				}
				return simpleProtocol;
			}

			this.selectedMessageDirection = ko.observable();
			this.selectedMessageIdExistence = ko.observable('no');
			this.setMessageId = ko.observable(); // 消息ID
			this.uniqueMessageID = ko.observable('false');// 消息是否唯一
			this.isDataBlock = ko.observable(false);

			this.messageAttributeSet = function () {
				let messageName = document.getElementById('simpleMessageName').value.trim();
				if(messageName == "" || messageName == null || messageName == undefined){
					notificationService.showError("请先定义消息名称,再设置消息属性");
				}
				$('#messageAttributeModal').modal('show');
			};

			this.closeMessageConfig = function () {
				let direction = self.allPagesDirection[self.currentPageIndex]
				if (direction) { // 使用松散相等匹配数字和字符串
					// 根据属性名查找对应的值（注意大小写匹配）
					const receiveFlag = direction?.attributes?.find(attr => attr.name === 'receiveFlag')?.value ?? '1';
					const sendFlag = direction?.attributes?.find(attr => attr.name === 'sendFlag')?.value ?? '1';

					// 简化判断条件（建议显式转换为数字）
					if (+receiveFlag === 1 && +sendFlag === 1) {
						self.selectedMessageDirection('sendAndReceive');
					} else if (+receiveFlag === 0 && +sendFlag === 1) {
						self.selectedMessageDirection('send');
					} else if (+receiveFlag === 1 && +sendFlag === 0) {
						self.selectedMessageDirection('receive');
					}

					if (direction.attributes.find(attr => attr.name === 'messageID')) {
						let a = direction.attributes.find(attr => attr.name === 'messageID')
						self.selectedMessageIdExistence('yes')
						self.setMessageId(a.value)
						self.uniqueMessageID(a.unique)
					} else {
						self.selectedMessageIdExistence('no')
						self.setMessageId('')
						self.uniqueMessageID('false')
					}
				} else {
					self.selectedMessageDirection('sendAndReceive')
					self.selectedMessageIdExistence('no')
					self.setMessageId('')
					self.uniqueMessageID('false')
				}
				$('#messageAttributeModal').modal('hide');
			};

			this.saveMessageConfig = function () {
				let atteibutes = []
				if (self.selectedMessageDirection() === 'send') {
					atteibutes = [
						{ name: "receiveFlag", value: "0" },
						{ name: "sendFlag", value: "1" }
					]
				} else if (self.selectedMessageDirection() === 'receive') {
					atteibutes = [
						{ name: "receiveFlag", value: "1" },
						{ name: "sendFlag", value: "0" }
					]
				} else {
					atteibutes = [
						{ name: "receiveFlag", value: "1" },
						{ name: "sendFlag", value: "1" }
					]
				}

				if (self.selectedMessageIdExistence() == 'yes') {
					let a = {
						name: 'messageID',
						value: self.setMessageId(),
						unique: self.uniqueMessageID()
					}
					atteibutes.unshift(a);
				}
				self.currentPageDirection = {
					messageName: document.getElementById('simpleMessageName').value.trim(),
					attributes: atteibutes
				}
				self.allPagesDirection[self.currentPageIndex] = self.currentPageDirection;
				$('#messageAttributeModal').modal('hide');
			};

			this.attached = function (view, parent) {
				// 根据许可获取协议编辑模式;若未设置则默认两种模式都开启
				var patternConfig = self.systemConfig.getValueByFeatureName('utpclient.proto_mgr.pattern');
				if (patternConfig && patternConfig.value && patternConfig.value.trim() !== "") {
					self.pattern(patternConfig.value);
				} else {
					self.pattern("simpleAndAdvanced");
				}

				$('#protocolImportModal').on('shown.bs.modal', function () {
					var file = document.getElementById("icdInputFile");
					file.value = "";
					$('#protocolImportForm').validator().off('submit');
					$('#protocolImportForm').validator('destroy').validator();
					$('#protocolImportForm').validator().on('submit', function (e) {
						if (e.isDefaultPrevented()) {
							// handle the invalid form...
						} else {
							e.preventDefault();
							self.importProtocolConfirm();
						}
					});
				});

				$('#protocolEditModal').on('shown.bs.modal', function () {
					self.initProtocolConfig(self.protocolPattern());
					self.firstCreateTable = true;
					self.createTable();
					self.loadExistingData();
					$('#protocolEditor').html('');
					self.validatorErrors = [];
					self.currentSchema = self.getSchema(self.currentProtocolContent);

					const container = document.getElementById('protocolEditor');
					self.editedProtocolConfig = self.currentProtocolContent;
					const options = {
						mode: 'tree',
						modes: ['text', 'tree'], // 'code', 'form', 'view', 'preview'
						templates: protocolService.getTemplate(),
						dragarea: false,
						enableSort: false,
						enableTransform: false,
						enableExtract: false,
						colorPicker: false,
						name: 'protocol',
						language: 'zh-CN',
						schema: self.currentSchema,
						onValidationError: function (errors) {
							self.validatorErrors = errors;
						},
						onChangeJSON: function (json) {
							// if(!self.messageNumCheck(json.messages)){
							// 	return;
							// };
							if ((self.currentSelectNode && self.currentSelectNode.path[0] === 'messages' || self.currentSelectNode && self.currentSelectNode.path[0] === 'structTypeDefineTable') && self.currentSelectNode.path[self.currentSelectNode.path.length - 1] === 'elem') {
								var newNode = _.get(json, self.currentSelectNode.path);
								json = _.set(json, self.currentSelectNode.path, newNode.elem);
								self.editor.update(json); //editor.set(newObj)
								self.currentSelectNode.expanded = true;
								self.editor.refresh();
							}
							if (self.currentSelectNode && self.currentSelectNode.path[0] === 'messages' && (self.currentSelectNode.path[self.currentSelectNode.path.length - 1] === "fields" || self.currentSelectNode.path[self.currentSelectNode.path.length - 2] === "fields")) {
								var fields = json.messages[self.currentSelectNode.path[1]].fields;
								//关闭自动排序功能
								// for(var i = 0; i < fields.length;i++){
								// 	if(fields[i].type === "startFlag"){
								// 		if(i > 0){
								// 			var temp = fields[i];
								// 			fields.splice(i, 1);
								// 			fields.unshift(temp);
								// 			break;
								// 		}
								// 	}
								// }
								// for(var i = 0; i < fields.length;i++){
								// 	if(fields[i].type === "endFlag"){
								// 		if(i < fields.length - 1){
								// 			var temp = fields[i];
								// 			fields.splice(i, 1);
								// 			fields.push(temp);
								// 			break;
								// 		}
								// 	}
								// }
								// for(var i = 0; i < fields.length;i++){
								// 	if(fields[i].type === "dataLength"){
								// 		if(i > 1){
								// 			var temp = fields[i];
								// 			fields.splice(i, 1);
								// 			var startField = fields[0];
								// 			fields.splice(0, 1);
								// 			fields.unshift(temp);
								// 			fields.unshift(startField);
								// 			break;
								// 		}
								// 	}
								// }
								/*
								for(var i = 0; i < fields.length;i++){
									if(fields[i].type === "checksum" || fields[i].type === "parity" || fields[i].type === "crc"){
										if(i < fields.length - 2){
											var temp = fields[i];
											fields.splice(i, 1);
											var endField = fields[fields.length - 1];
											fields.splice(fields.length - 1, 1);
											fields.push(temp);
											fields.push(endField);
											break;
										}
									}
								}
								*/
								json.messages[self.currentSelectNode.path[1]].fields = fields;
							}

							self.currentSchema = self.getSchema(json);
							self.editor.setSchema(self.currentSchema);
							self.editor.update(json); //editor.set(newObj)
							self.editor.refresh();
							self.editedProtocolConfig = json;

						},
						onValidate: function (json) {
							self.littleEndian(json.littleEndian);
							var errors = [];
							var paths = self.getPaths(json);
							if (json.isASCII) {
								return;
							}

							for (var i = 0; i < paths.length; i++) {
								var pathArray = paths[i].replace(/\[/g, ".").replace(/\]/g, "").split('.');

								//判断massage层是否有isASCII
								var pathisASCIIArray = paths[i].split('.');
								var message = _.get(json, pathisASCIIArray[0]);
								if (message.isASCII) {
									continue;
								}

								if (pathArray[pathArray.length - 1] === 'type') {
									var type = _.get(json, pathArray);
									//判断fields层是否有isASCII
									var isASCIIArray = [];
									for (let i = 0; i < pathArray.length - 1; i++) {
										isASCIIArray.push(pathArray[i]);
									}
									isASCIIArray.push('isASCII')
									var isASCII = _.get(json, isASCIIArray);
									if (isASCII) {
										continue;
									}

									if (type === 'startFlag' || type === 'flag' || type === 'endFlag') {
										var fieldPath = JSON.parse(JSON.stringify(pathArray));
										fieldPath[fieldPath.length - 1] = 'value';
										var fieldValue = '' + _.get(json, fieldPath);
										regex = new RegExp("^(0x[A-Fa-f0-9]+|\\d+)$");
										if (!regex.test(fieldValue.trim())) {
											errors.push({
												path: fieldPath,
												message: "should be a number"
											});
										}

										var bitLengthPath = JSON.parse(JSON.stringify(pathArray));
										bitLengthPath[bitLengthPath.length - 1] = 'bitLength';
										var bitLength = _.get(json, bitLengthPath);
										if (!((bitLength instanceof Number) || (typeof bitLength === 'number'))) {
											errors.push({
												path: bitLengthPath,
												message: "should be integer"
											});
										} else {
											let minimum = 0;
											let maximum = 0;
											maximum = Math.pow(2, bitLength) - 1;
											if (fieldValue < minimum || fieldValue > maximum) {
												errors.push({
													path: fieldPath,
													message: "should be between " + minimum + " and " + maximum
												});
											}
										}
									}
									if (type === 'checksum' || type === 'crc' || type === 'lrc') {
										var fieldPath = JSON.parse(JSON.stringify(pathArray));
										fieldPath[fieldPath.length - 1] = 'value';
										var fieldValue = '' + _.get(json, fieldPath);
										regex = new RegExp("^0x[A-Fa-f0-9]+$");
										if (!regex.test(fieldValue.trim())) {
											errors.push({
												path: fieldPath,
												message: "should be a hexadecimal number"
											});
										}

										var bitLengthPath = JSON.parse(JSON.stringify(pathArray));
										bitLengthPath[bitLengthPath.length - 1] = 'bitLength';
										var bitLength = _.get(json, bitLengthPath);
										if (!((bitLength instanceof Number) || (typeof bitLength === 'number'))) {
											errors.push({
												path: bitLengthPath,
												message: "should be integer"
											});
										} else {
											let minimum = 0;
											let maximum = 0;
											maximum = Math.pow(2, bitLength) - 1;
											if (fieldValue < minimum || fieldValue > maximum) {
												errors.push({
													path: fieldPath,
													message: "should be between 0x" + minimum.toString(16) + " and 0x" + maximum.toString(16)
												});
											}
										}
									}
									if (type === 'integer' || type === 'phyQuant') {
										var bitLengthPath = JSON.parse(JSON.stringify(pathArray));
										bitLengthPath[bitLengthPath.length - 1] = 'bitLength';
										var bitLength = _.get(json, bitLengthPath);
										if (!((bitLength instanceof Number) || (typeof bitLength === 'number'))) {
											errors.push({
												path: bitLengthPath,
												message: "should be integer"
											});
										}

										let fminimum = -Math.pow(2, bitLength - 1);
										let fmaximum = Math.pow(2, bitLength - 1) - 1;

										var miniumPath = JSON.parse(JSON.stringify(pathArray));
										miniumPath[miniumPath.length - 1] = 'minimum';
										var minimum = _.get(json, miniumPath);
										if (!((minimum instanceof Number) || (typeof minimum === 'number'))) {
											errors.push({
												path: miniumPath,
												message: "should be number"
											});
										}
										if (minimum > fmaximum || minimum < fminimum) {
											errors.push({
												path: miniumPath,
												message: "should be between " + fminimum + " and " + fmaximum
											});
										}

										var maximumPath = JSON.parse(JSON.stringify(pathArray));
										maximumPath[miniumPath.length - 1] = 'maximum';
										var maximum = _.get(json, maximumPath);
										if (!((maximum instanceof Number) || (typeof maximum === 'number'))) {
											errors.push({
												path: maximumPath,
												message: "should be number"
											});
										}
										if (maximum > fmaximum || maximum < fminimum) {
											errors.push({
												path: maximumPath,
												message: "should be between " + fminimum + " and " + fmaximum
											});
										}

										var defaultPath = JSON.parse(JSON.stringify(pathArray));
										defaultPath[defaultPath.length - 1] = 'default';
										var defaultValue = _.get(json, defaultPath);
										if (!((defaultValue instanceof Number) || (typeof defaultValue === 'number'))) {
											errors.push({
												path: defaultPath,
												message: "should be number"
											});
										}

										if (defaultValue > fmaximum || defaultValue < fminimum) {
											errors.push({
												path: defaultPath,
												message: "should be between " + fminimum + " and " + fmaximum
											});
										}
									}
									if (type === 'uinteger') {
										var bitLengthPath = JSON.parse(JSON.stringify(pathArray));
										bitLengthPath[bitLengthPath.length - 1] = 'bitLength';
										var bitLength = _.get(json, bitLengthPath);
										if (!((bitLength instanceof Number) || (typeof bitLength === 'number'))) {
											errors.push({
												path: bitLengthPath,
												message: "should be integer"
											});
										}


										let fminimum = 0;
										let fmaximum = Math.pow(2, bitLength) - 1;

										var miniumPath = JSON.parse(JSON.stringify(pathArray));
										miniumPath[miniumPath.length - 1] = 'minimum';
										var minimum = _.get(json, miniumPath);

										if (isNaN(utilityService.getInteger(minimum)))
											errors.push({
												path: miniumPath,
												message: "should be number"
											});
										if (minimum > fmaximum || minimum < fminimum) {
											errors.push({
												path: miniumPath,
												message: "should be between 0x" + fminimum.toString(16) + " and 0x" + fmaximum.toString(16)
											});
										}


										var maximumPath = JSON.parse(JSON.stringify(pathArray));
										maximumPath[miniumPath.length - 1] = 'maximum';
										var maximum = _.get(json, maximumPath);

										if (isNaN(utilityService.getInteger(maximum)))
											errors.push({
												path: maximumPath,
												message: "should be number"
											});
										if (maximum > fmaximum || maximum < fminimum) {
											errors.push({
												path: maximumPath,
												message: "should be between 0x" + fminimum.toString(16) + " and 0x" + fmaximum.toString(16)
											});
										}

										var defaultPath = JSON.parse(JSON.stringify(pathArray));
										defaultPath[defaultPath.length - 1] = 'default';
										var defaultValue = _.get(json, defaultPath);

										if (defaultValue > fmaximum || defaultValue < fminimum) {
											errors.push({
												path: defaultPath,
												message: "should be between " + fminimum + " and " + fmaximum
											});
										}

										if (isNaN(utilityService.getInteger(defaultValue)))
											errors.push({
												path: defaultPath,
												message: "should be number"
											});
									}
									if (type === 'parity') {
										var bitLengthPath = JSON.parse(JSON.stringify(pathArray));
										bitLengthPath[bitLengthPath.length - 1] = 'bitLength';
										var bitLength = _.get(json, bitLengthPath);
										if (!((bitLength instanceof Number) || (typeof bitLength === 'number'))) {
											errors.push({
												path: bitLengthPath,
												message: "should be integer"
											});
										}

										var parityPath = JSON.parse(JSON.stringify(pathArray));
										parityPath[parityPath.length - 1] = 'value';
										var parityValue = '' + _.get(json, parityPath);
										if (parityValue === '' || (parityValue != '1' && parityValue != '0')) {
											errors.push({
												path: parityPath,
												message: "should be one bit binary"
											});
										}
									}
								}
							}
							/*
							var idErrors = self.protocolIdCheck(json.messages);						
							for (var i = 0; i < idErrors.length; i++) {
								errors.push({
									path: idErrors[i],
									message:
									  "消息Id重复"
								});
							}
							*/
							if (json.messages != undefined && json.messages != null) {
								var nameError = self.messageNameCheck(json.messages);
								for (var i = 0; i < nameError.length; i++) {
									errors.push({
										path: nameError[i],
										message:
											"消息名称重复"
									});
								}
								var messageEnumError = self.messageEnumerationCheck(json);
								for (var i = 0; i < messageEnumError.length; i++) {
									errors.push({
										path: messageEnumError[i],
										message:
											"消息枚举默认值与定义枚举名称不匹配"
									});
								}

								var fieldErrors = self.messageFieldNameCheck(json.messages);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"消息字段名称重复"
									});
								}
							}

							if (json.enumTypeDefineTable != undefined && json.enumTypeDefineTable != null) {
								var fieldErrors = self.enumNameCheck(json.enumTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"枚举类型名称重复"
									});
								}

								var fieldErrors = self.enumFieldNameCheck(json.enumTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"枚举字段名称重复"
									});
								}
								var fieldErrors = self.enumvalueCheck(json.enumTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"数据不合法"
									});
								}
							}

							if (json.bitsTypeDefineTable != undefined && json.bitsTypeDefineTable != null) {
								var fieldErrors = self.bitTypeNameCheck(json.bitsTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"位定义类型名称重复"
									});
								}
								var fieldErrors = self.bitEnumerationCheck(json);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"位字段枚举默认值与定义枚举名称不匹配"
									});
								}


								var fieldErrors = self.bitFieldNameCheck(json.bitsTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"位字段名称重复"
									});
								}

								var fieldErrors = self.bitFieldLengthCheck(json.bitsTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"位字段长度不匹配"
									});
								}
							}
							if (json.messageAttributeTable != undefined && json.messageAttributeTable != null) {
								var idErrors = self.messageAttributeTableCheck(json);
								for (var i = 0; i < idErrors.length; i++) {
									errors.push({
										path: idErrors[i],
										message:
											"消息字段名称与messages的消息字段名称不匹配"
									});
								}
							}

							if (json.structTypeDefineTable != undefined && json.structTypeDefineTable != null) {
								var fieldErrors = self.structTypeNameCheck(json.structTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"结构体类型名称重复"
									});
								}

								var fieldErrors = self.structFieldNameCheck(json.structTypeDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"结构体字段名称重复"
									});
								}
							}
							if (json.algorithmDefineTable != undefined && json.algorithmDefineTable != null) {
								var fieldErrors = self.algorithmTypeNameCheck(json.algorithmDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"算法定义类型名称重复"
									});
								}

								var fieldErrors = self.algorithmParamNameCheck(json.algorithmDefineTable);
								for (var i = 0; i < fieldErrors.length; i++) {
									errors.push({
										path: fieldErrors[i],
										message:
											"算法参数名称重复"
									});
								}
							}
							return errors;
						},
						onEvent: function (node, event) {
							if (event.type === "click") {
								if (node) {
									// editor.setSelection(node);
								}
								self.currentSelectNode = node;
							}
						},
						onEditable: function (node) {
							if (node.path) {
								if (node.field && node.field === 'type') {
									return false;
								}
							}
							return {
								field: false,
								value: true
							};
						},
						onCreateMenu(items, node) {
							self.currentSelectNode = node;
							if (node.path) {
								var fieldValue = _.get(self.editedProtocolConfig, node.path);
								// remove type menu
								for (var i = items.length - 1; i >= 0; i--) {
									if ((items[i].text === '类型' || items[i].text === 'Type') || items[i].type === 'separator') {
										items.splice(i, 1);
									}
									if (node.path[0] === "messages") {
										if ((node.path[node.path.length - 1] === "fields" || node.path[node.path.length - 2] === "fields")) {
											/*
											var submenu = items[i].submenu;
											if(submenu){
												var fields = self.editedProtocolConfig.messages[node.path[1]].fields;
												var checkMethodExisted = false;
												for(var f = 0; f < fields.length; f++)
													if(fields[f].type === 'checksum' || fields[f].type === 'parity' || fields[f].type === 'crc'){
														checkMethodExisted = true;
														break;
													}
												if(checkMethodExisted){
													for(var j = submenu.length - 1; j >= 0; j--){
														if(submenu[j].text === '循环冗余校验码' || submenu[j].text === '校验和' || submenu[j].text === '奇偶校验位')
															submenu.splice(j,1);
													}
												}
											}
											*/
											if (fieldValue.type === 'startFlag' || fieldValue.type === 'endFlag' || fieldValue.type === 'dataLength' || fieldValue.type === 'checksum' || fieldValue.type === 'parity' || fieldValue.type === 'crc' || fieldValue.type === 'lrc') {
												if (items[i].text === '复制' || items[i].text === 'Duplicate')
													items.splice(i, 1);
											}
											/*
											if(fieldValue.type === 'checksum' || fieldValue.type === 'parity' || fieldValue.type === 'crc'){
												if((items[i].text === '追加' || items[i].text === 'Append'))
													items.splice(i,1);
											}
											*/
										}
									}
								}

								if (node.path.length === 1 && node.type === 'single') {
									if (node.field === node.path[0] && (node.path[0] === 'bitsTypeDefineTable' || node.path[0] === 'messageAttributeTable' || node.path[0] === 'structTypeDefineTable' || node.path[0] === 'enumTypeDefineTable' || node.path[0] === 'algorithmDefineTable' ||
										node.path[0] === 'protocolVersion' || node.path[0] === 'protocolName' || node.path[0] === 'littleEndian' ||
										node.path[0] === 'protocolDescription' || node.path[0] === 'templateVersion' || node.path[0] === 'messages'))
										return [];
								}
								if (isNaN(node.path[node.path.length - 1]) && node.type != 'append') {
									// only enable remove array elem
									for (var i = items.length - 1; i >= 0; i--) {
										if ((items[i].text === '移除' || items[i].text === 'Remove') || (items[i].text === '追加' || items[i].text === 'Append') || (items[i].text === '插入' || items[i].text === 'Insert')) {
											items.splice(i, 1);
										}
									}
								}
								else {
									for (var i = items.length - 1; i >= 0; i--) {
										if ((items[i].text === '追加' || items[i].text === 'Append') || (items[i].text === '插入' || items[i].text === 'Insert')) {
											var submenu = items[i].submenu;
											if (items[i].submenu && items[i].submenu.length > 0) {
												for (var j = submenu.length - 1; j >= 0; j--) {
													if ((submenu[j].text === '自动' || submenu[j].text === 'Auto') ||
														(submenu[j].title != 'Insert a array' && (submenu[j].text === '数组' || submenu[j].text === 'Array')) ||
														(submenu[j].text === '对象' || submenu[j].text === 'Object') || (submenu[j].text === '字符串' || submenu[j].text === 'String'))
														submenu.splice(j, 1);
												}
											}
											if (node.path[0] === 'algorithmDefineTable') {
												if (node.path[node.path.length - 1] === "params" || node.path[node.path.length - 2] === "params") {
													return [];
												}
												else {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '比例算法' && submenu[j].text != '线性算法' && submenu[j].text != '自定义算法')
															submenu.splice(j, 1);
													}
												}
											}
											if (node.path[0] === 'structTypeDefineTable') {
												if (node.path[node.path.length - 1] === "fields" || node.path[node.path.length - 2] === "fields" || (node.path[node.path.length - 1] === "elem")) {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text === '比例算法' || submenu[j].text === '线性算法' || submenu[j].text === '自定义算法' || submenu[j].text === '消息属性' || submenu[j].text === '发送标记' ||
															submenu[j].text === '消息' || submenu[j].text === '位串定义' || submenu[j].text === '位字段' || submenu[j].text === '消息ID' || submenu[j].text === '接收标记' ||
															submenu[j].text === '枚举定义' || submenu[j].text === '枚举字段' || submenu[j].text === '结构定义')
															submenu.splice(j, 1);
													}
												}
												else {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '结构定义')
															submenu.splice(j, 1);
													}
												}
											}
											if (node.path[0] === 'bitsTypeDefineTable') {
												if (node.path[node.path.length - 1] === "fields" || node.path[node.path.length - 2] === "fields") {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '位字段')
															submenu.splice(j, 1);
													}
												}
												else {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '位串定义')
															submenu.splice(j, 1);
													}
												}
											}
											if (node.path[0] === 'messageAttributeTable') {
												if (node.path[node.path.length - 1] === "attributes" || node.path[node.path.length - 2] === "attributes") {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '消息ID' && submenu[j].text != '接收标记' && submenu[j].text != '发送标记')
															submenu.splice(j, 1);
													}
												}
												else {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '消息属性')
															submenu.splice(j, 1);
													}
												}
											}
											if (node.path[0] === 'enumTypeDefineTable') {
												if (node.path[node.path.length - 1] === "fields" || node.path[node.path.length - 2] === "fields") {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '枚举字段')
															submenu.splice(j, 1);
													}
												}
												else {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '枚举定义')
															submenu.splice(j, 1);
													}
												}
											}
											if (node.path[0] === "messages") {
												if ((node.path[node.path.length - 1] === "fields" || node.path[node.path.length - 2] === "fields") || (node.path[node.path.length - 1] === "elem")) {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text === '比例算法' || submenu[j].text === '线性算法' || submenu[j].text === '自定义算法' ||
															submenu[j].text === '消息' || submenu[j].text === '位串定义' || submenu[j].text === '位字段' || submenu[j].text === '结构定义' ||
															submenu[j].text === '枚举定义' || submenu[j].text === '枚举字段' || submenu[j].text === '消息ID' || submenu[j].text === '接收标记' || submenu[j].text === '发送标记' || submenu[j].text === '消息属性')
															submenu.splice(j, 1);
													}
												}
												else {
													for (var j = submenu.length - 1; j >= 0; j--) {
														if (submenu[j].text != '消息')
															submenu.splice(j, 1);
													}
												}
											}
										}
									}
								}
								// // 找到 "插入" 菜单项
								// const insertItem = items.find(item => item.text === '插入');
								// if (!insertItem || !insertItem.submenu) {
								// 	return items;
								// }

								// // 分组 "插入" 菜单项的子菜单项
								// const groupedSubItems = {};
								// insertItem.submenu.forEach(subItem => {
								// 	if (!groupedSubItems[subItem.className]) {
								// 		groupedSubItems[subItem.className] = [];
								// 	}
								// 	groupedSubItems[subItem.className].push(subItem);
								// });

								// // 将分组转换为包含分组和子菜单项的数组结构
								// const groupedInsertSubmenu = Object.keys(groupedSubItems).map(className => ({
								// 	text: className.charAt(0).toUpperCase() + className.slice(1),
								// 	className: className,
								// 	submenu: groupedSubItems[className]
								// }));

								// // 移除重复的分组
								// const uniqueGroupedInsertSubmenu = [];
								// const seenClassNames = new Set();
								// groupedInsertSubmenu.forEach(group => {
								// 	if (!seenClassNames.has(group.className)) {
								// 		uniqueGroupedInsertSubmenu.push(group);
								// 		seenClassNames.add(group.className);
								// 	}
								// });

								// // 更新 "插入" 菜单项的子菜单
								// insertItem.submenu = uniqueGroupedInsertSubmenu;



								// return items;
							}
							return items;
						}
					}

					self.editor = new JSONEditor(container, options, self.currentProtocolContent);
					// const json = editor.get()
					// editor.set(json)
					// alert(JSON.stringify(json, null, 2))

					// 添加订阅器
					self.littleEndian.subscribe(function (newValue) {
						if (self.editedProtocolConfig) {
							self.editedProtocolConfig.littleEndian = newValue;
							self.editor.update(self.editedProtocolConfig);
						}
					});
				});
				$("#protocolImportModal").on('hidden.bs.modal', function (event) {
					if ($('.modal:visible').length) //check if any modal is open
					{
						$('body').addClass('modal-open');//add class to body
					}
				});
				$("#protocolEditModal").on('hidden.bs.modal', function (event) {
					if ($('.modal:visible').length) //check if any modal is open
					{
						$('body').addClass('modal-open');//add class to body
					}
				});
				$("#messageTemplateModal").on('hidden.bs.modal', function (event) {
					if ($('.modal:visible').length) //check if any modal is open
					{
						$('body').addClass('modal-open');//add class to body
					}
				});
				$("#deleteProtocolModal").on('hidden.bs.modal', function (event) {
					if ($('.modal:visible').length) //check if any modal is open
					{
						$('body').addClass('modal-open');//add class to body
					}
				});
			};

			this.getFieldSchema = function (field, structTableNames, bitTableNames, algorithmTalbeNames, enumNames) {
				var properties = {};
				if (field.type === 'startFlag' || field.type === 'dataLength' || field.type === 'checksum' || field.type === 'endFlag' || field.type === 'lrc') {
					// properties.bitLength = { type: "integer" };
					//	properties.value = {type : ["number", "string"], pattern: "^0x[A-Fa-f0-9]+$"};
					properties.isId = { type: "boolean", default: true }
				}
				if (field.type === 'parity') {
					properties.odd = { type: "boolean", default: true };
					// properties.bitLength = { type: "integer" };
					//	properties.value = {type : ["string"], pattern: "^[01]+$"};
				}
				if (field.type === 'crc') {
					// properties.bitLength = { type: "integer" };
					//	properties.value = {type : ["number", "string"], pattern: "^0x[A-Fa-f0-9]+$"};
					properties.crcAlgorithm = {
						enum: self.crcAlgorithm
					};
					properties.crcAlgorithm.value = self.selectedCrcAlgorithm();
				}
				if (field.type === 'integer') {
					//	properties.minimum = {type : "number"};
					//	properties.maximum = {type : "number"};
					//	properties.default = {type : "number"};
					// properties.bitLength = { type: "integer" };
					properties.enumName = { title: "enum", type: "string" };
					if (enumNames && enumNames.length > 1)
						properties.enumName.enum = enumNames;
					else
						field.enumName = '';
				}
				if (field.type === 'uinteger') {
					//	properties.minimum = {type : ["number", "string"], pattern: "^0x[A-Fa-f0-9]+$"};
					//	properties.maximum = {type : ["number", "string"], pattern: "^0x[A-Fa-f0-9]+$"};
					//	properties.default = {type : ["number", "string"], pattern: "^0x[A-Fa-f0-9]+$"};
					// properties.bitLength = { type: "integer" };
					if (field.enumName != undefined) {
						properties.enumName = { title: "enum", type: "string" };
					}
					if (field.enumName != undefined) {
						if (enumNames && enumNames.length > 1) {
							properties.enumName.enum = enumNames;
						} else {
							field.enumName = '';
						}
					}
				}
				if (field.type === 'phyQuant') {
					//	properties.minimum = {type : "number"};
					//	properties.maximum = {type : "number"};
					//	properties.default = {type : "number"};
					properties.precision = { type: "integer" };
					properties.algorithmName = { title: "algorithm", type: "string" };
					properties.signal = { type: "boolean", default: true }
					if (algorithmTalbeNames && algorithmTalbeNames.length > 1)
						properties.algorithmName.enum = algorithmTalbeNames;
					else
						field.algorithmName = '';
				}
				if (field.type === 'double' || field.type === 'float') {
					//	properties.minimum = {type : "number"};
					//	properties.maximum = {type : "number"};
					//	properties.default = {type : "number"};
					properties.precision = { type: "integer" };
				}
				if (field.type === 'struct') {
					properties.structType = { title: "struct", not: { type: "null" } };
					if (structTableNames && structTableNames.length > 0)
						properties.structType.enum = structTableNames;
					else
						field.structType = null;
				}

				if (field.type === 'bits') {
					properties.bitsType = { title: "bit", type: "string" };
					if (bitTableNames && bitTableNames.length > 0)
						properties.bitsType.enum = bitTableNames;
					else
						field.bitsType = null;
				}

				if (field.type === 'array') {
					properties.elemCount = { type: "number" };
					if (field.elem) {
						properties.elem = {
							type: "object",
							properties: self.getFieldSchema(field.elem, structTableNames, bitTableNames, algorithmTalbeNames, enumNames)
						}
					}
				}
				if (field.type === 'varray') {
					if (field.count) {
						properties.count = {
							type: "object",
							properties: self.getFieldSchema(field.count, structTableNames, bitTableNames, algorithmTalbeNames)
						}
					}
					if (field.elem) {
						properties.elem = {
							type: "object",
							properties: self.getFieldSchema(field.elem, structTableNames, bitTableNames, algorithmTalbeNames, enumNames)
						}
					}
				}
				if (field.type === 'datablock') {
					if (field.dataLen) {
						properties.dataLen = {
							type: "object",
							properties: self.getFieldSchema(field.dataLen, structTableNames, bitTableNames, algorithmTalbeNames)
						}
					}
				}
				return properties;
			};

			this.getComplexFieldsSchema = function (complexFields, structTableNames, bitTableNames, algorithmTalbeNames, enumNames) {
				var properties = {}
				for (var i = 0; i < complexFields.length; i++) {
					var complexField = complexFields[i];
					for (var j = 0; j < complexField.fields.length; j++) {
						var field = complexField.fields[j];
						properties = _.merge(self.getFieldSchema(field, structTableNames, bitTableNames, algorithmTalbeNames, enumNames), properties);
					}
				}
				var complexFieldProperties = {
					type: "array",
					items: {
						type: "object",
						properties: {
							fields: {
								type: "array",
								items: {
									type: "object",
									properties: properties
								}
							}
						}
					}
				}
				return complexFieldProperties;
			};

			this.littleEndian = ko.observable(false);
			this.getSchema = function (protocol) {
				self.littleEndian(false);
				var schemaObj = {
					title: "protocol",
					description: "protocol",
					type: "object",
					properties: {
						littleEndian: {
							type: "boolean",
							default: self.littleEndian()
						}
					}
				};

				var messageAttributeTable = protocol.messageAttributeTable;
				var algorithmDefineTable = protocol.algorithmDefineTable;
				var bitsTypeDefineTable = protocol.bitsTypeDefineTable;
				var structTypeDefineTable = protocol.structTypeDefineTable;
				var enumTypeDefineTable = protocol.enumTypeDefineTable;
				var structTableNames = [];
				var messageNames = [];
				var bitTableNames = [];
				var algorithmTalbeNames = [''];
				var enumNames = [''];
				if (bitsTypeDefineTable)
					for (var i = 0; i < bitsTypeDefineTable.length; i++)
						bitTableNames.push(bitsTypeDefineTable[i].typeName);
				if (messageAttributeTable)
					for (var i = 0; i < messageAttributeTable.length; i++)
						messageNames.push(messageAttributeTable[i].typeName);
				if (structTypeDefineTable)
					for (var i = 0; i < structTypeDefineTable.length; i++)
						structTableNames.push(structTypeDefineTable[i].typeName);

				if (algorithmDefineTable)
					for (var i = 0; i < algorithmDefineTable.length; i++)
						algorithmTalbeNames.push(algorithmDefineTable[i].name);

				if (enumTypeDefineTable)
					for (var i = 0; i < enumTypeDefineTable.length; i++)
						enumNames.push(enumTypeDefineTable[i].typeName);

				if (bitsTypeDefineTable && bitsTypeDefineTable.length > 0) {
					schemaObj.properties.bitsTypeDefineTable = {
						type: "array",
						items: {
							type: "object",
							properties: {
								fields: {
									type: "array",
									items: {
										type: "object",
										properties: {
											bitLength: { type: "integer", minimum: 1 },
											default: { type: "string", pattern: "^[01]+$" },
											minimum: { type: "string", pattern: "^[01]+$" },
											maximum: { type: "string", pattern: "^[01]+$" },
											enumName: { title: "enum", type: "string", enum: enumNames }
										}
									}
								}
							}
						}
					}
				}

				if (messageAttributeTable && messageAttributeTable.length > 0) {
					schemaObj.properties.messageAttributeTable = {
						type: "array",
						items: {
							type: "object",
							properties: {
								fields: {
									type: "array",
									items: {
										type: "object",
										properties: {
											value: { type: "string" }
										}
									}
								}
							}
						}
					}
				}

				if (structTypeDefineTable) {
					schemaObj.properties.structTypeDefineTable = self.getComplexFieldsSchema(protocol.structTypeDefineTable, structTableNames, bitTableNames, algorithmTalbeNames, enumNames);
				}

				if (algorithmDefineTable) {
					schemaObj.properties.algorithmDefineTable = {
						type: "array",
						items: {
							type: "object",
							properties: {
								params: {
									type: "array",
									items: {
										type: "object",
										properties: {
											value: { type: "number" }
										}
									}
								}
							}
						}
					};
				}

				if (protocol.messages) {
					schemaObj.properties.messages = self.getComplexFieldsSchema(protocol.messages, structTableNames, bitTableNames, algorithmTalbeNames, enumNames);
				}
				return schemaObj;
			};
		}
		return new ProtocolViewModel();
	});
