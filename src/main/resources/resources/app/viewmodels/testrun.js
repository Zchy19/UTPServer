define(
	['jquery', 'durandal/app', 'knockout', 'lang', 'services/viewManager', 'services/systemConfig',
		'services/loginManager', 'services/utpService', 'services/ursService', 'komapping', 'services/utilityService',
		'services/selectionManager', 'services/executionManager', 'services/cronExpressionValidator',
		'services/projectManager', 'services/notificationService', 'validator', 'datetimepicker', 'bootstrapSwitch', 'services/fileManagerUtility'],
	function ($, app, ko, lang, viewManager, systemConfig, loginManager, utpService, ursService, komapping, utilityService, selectionManager, executionManager, cronExpressionValidator,
		projectManager, notificationService, validator, datetimepicker, bootstrapSwitch, fileManagerUtility) {

		function TestRunViewModel() {
			var self = this;

			this.loginManager = loginManager;
			this.viewManager = viewManager;
			this.systemConfig = systemConfig;
			this.selectionManager = selectionManager;
			this.projectManager = projectManager;
			this.utpService = utpService;
			this.ursService = ursService;
			this.executionManager = executionManager;
			this.fileManagerUtility = fileManagerUtility;
			this.currentTestSet = null;
			this.showEmptyRecordSet = ko.observable(false);
			this.showMaxRecordSet = ko.observable(false);
			this.inEdit = false;

			this.scriptLinks = [];
			this.executionList = ko.observableArray([]);
			this.selectedExecutionId = ko.observable("");
			this.switchExecutionConfirmed = false;
			this.maxSteps = ko.observable(200);

			this.candidateTree = null;
			this.targetTree = null;
			this.candidateTestSet = [];
			this.targetTestSet = [];

			this.testSetRefreshSubScription = null;
			this.testSetAddSubScription = null;
			this.allEngineNames = ko.observableArray([]);

			this.haveId = []; //记录目前在目标树的文件的ID,否则只能判断点击确定提交过的文件
			this.addId = function (id) {
				this.haveId.push(id);
			};
			this.removeId = function (id) {
				var index = this.haveId.indexOf(id);
				if (index !== -1) {
					this.haveId.splice(index, 1);
				}
			};


			this.triggers = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.testsets = komapping.fromJS([], {
				key: function (item) {
					return ko.utils.unwrapObservable(item.id);
				}
			});

			this.gotoExecution = function () {
				viewManager.testenvironmentActivePage('app/viewmodels/execution');
			};

			this.execution = function (data) {
				self.selectionManager.selectedNodeType = "testSet";
				self.selectionManager.selectedNodeId(data.id());
				self.selectionManager.selectedNodeName(data.name())
				self.selectionManager.selectedEngineName(data.engineName())
				self.executionManager.newExecutionFlag(true);
				self.executionManager.switchExecutionConfirmed(false);
				self.gotoExecution();
			};

			this.editingIndicator = ko.observable('');
			this.editingTestSet = {
				id: ko.observable(0),
				description: ko.observable(''),
				activate: ko.observable(1),
				name: ko.observable(''),
				engineName: ko.observable(''),
				projectId: ko.observable(''),
				scripts: []
			};

			this.editingTrigger = {
				id: ko.observable(0),
				startTime: ko.observable(''),
				crontriggerExpression: ko.observable('0 0 1/1 * * ? *'),
				isEnabled: ko.observable(true),
				sampleCronExpression: ko.observable('0 0 1/1 * * ? *')
			};

			//get
			this.getTestSetByProjectSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					var testSetInfo = data.result;
					for (var i = 0; i < testSetInfo.length; i++)
						testSetInfo[i].activeExecutionCount = 0;
					komapping.fromJS(testSetInfo, {}, self.testsets);
					self.utpService.getActiveExecutionByProject($.cookie("lastSelectedProject"),
						self.getActiveExecutionStatus, self.getActiveExecutionByProjectErrorFunction);
				}
				else
					self.getTestSetByProjectErrorFunction();
			};

			this.getTestSetByProjectErrorFunction = function () {
				notificationService.showError('获取测试集失败');
			};

			this.getTestSetByProject = function () {
				self.utpService.getTestSetByProject(self.selectionManager.selectedProject().id, self.getTestSetByProjectSuccessFunction, self.getTestSetByProjectErrorFunction);
			}

			this.getTestSetSuccessFunction = function (data) {
				if (data != null) {
					self.editingTestSet.id(data.id);
					self.editingTestSet.name(data.name);
					self.editingTestSet.description(data.description);
					self.editingTestSet.activate(data.activate);
					self.editingTestSet.engineName(data.engineName);
					self.editingTestSet.projectId(data.projectId);
					self.editingTestSet.scripts = [];
					for (var i = 0; i < data.scripts.length; i++)
						self.editingTestSet.scripts.push(data.scripts[i].id);
				}
				else
					self.getTestSetErrorFunction();
			};

			this.getTestSetErrorFunction = function () {
				notificationService.showError('获取测试集详细信息失败');
			};

			this.dataProcess = function (scripts) {
				self.candidateTestSet = [];
				self.targetTestSet = [];

				// 深拷贝 scripts 数据到两棵树的集合中
				var candidateData = JSON.parse(JSON.stringify(scripts));
				var targetData = JSON.parse(JSON.stringify(scripts));

				self.candidateTestSet.push(candidateData);
				self.targetTestSet.push(targetData);

				// 准备目标集数据：只保留已选择的文件
				if(self.editingTestSet.scripts.length==0){
					self.targetTestSet = [];
				}else{
					prepareTargetData(self.targetTestSet[0], self.editingTestSet.scripts);
				}
			};

			function prepareTargetData(dataSource, candidatedata) {
				if (dataSource == null) return;
				// 只保留已选择的文件
				for (var i = dataSource.data.length - 1; i >= 0; i--) {
					if (dataSource.data[i].type == 'file') {
						if ($.inArray(dataSource.data[i].id, candidatedata) < 0) {
							dataSource.data.splice(i, 1);
						}
					} else {
						// 递归处理子文件夹，并在递归后检查文件夹是否为空，若是则移除
						prepareTargetData(dataSource.data[i], candidatedata);
						if (dataSource.data[i].data.length == 0) {
							dataSource.data.splice(i, 1);
						}
					}
				}

				// 再次遍历检查是否还有空文件夹（作为额外的保险措施，确保没有遗漏）
				for (var i = dataSource.data.length - 1; i >= 0; i--) {
					if (dataSource.data[i].type == 'folder' && dataSource.data[i].data.length == 0) {
						dataSource.data.splice(i, 1);
					}
				}
				return dataSource;
			}

			this.getScriptByProjectSuccessFunction = function (data) {
				if (data != null) {
					//	var scripts = self.projectManager.generateScriptGroups(data);
					var scripts = self.projectManager.generateScriptGroupsFromFlatInfo(data);
					self.projectManager.removeEmptyScriptGroup(scripts.data);
					self.dataProcess(scripts);
				}
				else
					self.getScriptByProjectErrorFunction();
			};

			this.getScriptByProjectErrorFunction = function () {
				notificationService.showError('获取脚本信息失败');
			};

			this.init = function () {
				var getTestSetPromise = new Promise(function (resolve, reject) {
					if (self.inEdit) {
						self.utpService.getTestSetWithScriptIds(self.selectionManager.selectedProject().id, self.currentTestSet.id(), function (data) {
							if (data != null && data.status === 1) {
								self.getTestSetSuccessFunction(data.result);
								resolve();
							}
							else {
								reject();
								self.getTestSetErrorFunction();
							}
						}, function () {
							reject();
							self.getTestSetErrorFunction();
						});
					}
					else
						resolve();
				});


				var getScriptByProjectPromise = new Promise(function (resolve, reject) {
					//	self.utpService.getScriptByProject(self.selectionManager.selectedProject().id, function(data) {
					self.utpService.getFlatScriptByProject(self.selectionManager.selectedProject().id, function (data) {
						if (data != null && data.status === 1) {
							self.getScriptByProjectSuccessFunction(data.result);
							resolve();
						}
						else {
							reject();
							self.getScriptByProjectErrorFunction();
						}
					}, function () {
						reject();
						self.getScriptByProjectErrorFunction();
					});
				});

				Promise.all([getTestSetPromise, getScriptByProjectPromise]).then(
					function (results) {
						self.initTree();
					},
					function (errors) {
					});
			}

			//add		
			this.createTestSetSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					var testset = data.result;
					testset.activeExecutionCount = 0;
					self.testsets.push(komapping.fromJS(testset));
					notificationService.showSuccess('创建测试集成功');
				}
				else
					notificationService.showError('创建测试集失败');
			};

			this.createTestSetErrorFunction = function () {
				notificationService.showError('创建测试集失败');
			};

			this.createTestSet = function () {
				self.editingTestSet.id(-1);
				self.editingTestSet.name("");
				self.editingTestSet.engineName("");
				self.editingTestSet.description("");
				self.editingTestSet.activate(1);
				self.editingTestSet.projectId(self.selectionManager.selectedProject().id);
				self.editingTestSet.scripts = [];
				self.inEdit = false;
				$('#TestSetLoadModal').modal('show');
			};

			//edit
			this.initTree = function () {
				self.showTree();
				self.resetValidator();
			};

			this.addParentNode = function (context) {
				var parentIds = new Array();
				var parentId = context.from.getParentId(context.start);
				if (parentId == 0)
					return;

				while (parentId != self.fileManagerUtility.root) {
					parentIds.unshift(parentId);
					parentId = context.from.getParentId(parentId);
				}
				parentIds.unshift(parentId);
				parentId = 0;
				for (var i = 0; i < parentIds.length; i++) {
					if (!context.to.exists(parentIds[i])) {
						var node = JSON.parse(JSON.stringify(context.from.getItem(parentIds[i])));
						context.to.data.add(node, 0, parentId);
					}
					parentId = parentIds[i];
				}
				context.parent = parentId;
			};

			this.candidateDataSort = function () {
				self.candidateTree.sort("#value#", "asc", "string");
			};

			this.selectedCandidateItem = null;
			this.selectedTargetItem = null;

			// 记录原始父节点信息
			this.candidateToTarget = function () {
				let symbol = true;
				if (self.selectedCandidateItem) {
					if (self.selectedCandidateItem.type == 'file' && self.haveId.indexOf(self.selectedCandidateItem.id) !== -1) {

						symbol = false;
						notificationService.showWarn('该用例在目标测试用例中已存在');


					}
					if (self.selectedCandidateItem.type == 'folder') {
						let folderData = null;
						if (self.selectedCandidateItem.id == 'project') {
							folderData = self.candidateTestSet[0]
						} else {
							folderData = self.traverse(self.candidateTestSet[0], self.selectedCandidateItem.id);
						}

						function allInsert(folderData) { //flag为false表示所有文件都已加入
							let flag = false;
							for (let i = 0; i < folderData.data.length; i++) {
								if (folderData.data[i].type == 'file' && self.haveId.indexOf(folderData.data[i].id) == -1) {
									flag = true;
								} else if (folderData.data[i].type == 'folder') {
									let result = null;
									result = allInsert(folderData.data[i]);
									if (result == true) {
										return flag = true;
									}
								}
							}
							return flag;
						}

						if (!allInsert(folderData)) {
							symbol = false;
							notificationService.showWarn('该文件夹下所有测试用例已全部加入到目标用例中');
						}
					}
					if (symbol) {
						symbol = false;
						var context = {
							from: self.candidateTree,
							to: self.targetTree,
							parent: self.selectedCandidateItem.$parent, // 记录原始父节点
							start: self.selectedCandidateItem.id,
							source: [self.selectedCandidateItem.id],
							target: null
						};

						// 保存原始父节点信息
						var originalParentId = context.parent;

						var selectedItem = context.from.getItem(context.start);
						if (selectedItem.type === 'file') {
							// 仅当选择的是文件类型的节点时，进行添加操作
							if (!context.to.exists(context.start)) {
								var node = JSON.parse(JSON.stringify(context.from.getItem(context.start)));
								node.$originalParent = originalParentId; // 添加原始父节点信息
								context.to.parse(node);
								self.addId(node.id);
							}

							self.candidateDataSort();
						} else if (selectedItem.type === 'folder') {
							// 处理文件夹，包括其所有子文件和子文件夹
							var folderData = self.traverse(self.candidateTestSet[0], selectedItem.id);

							if (selectedItem.id == 'project') {
								folderData = self.candidateTestSet[0];
							}
							if (folderData) {
								function pushToTarget(folderData) {
									for (let i = 0; i < folderData.data.length; i++) {
										if (folderData.data[i].type == 'file') {
											context.to.parse(folderData.data[i]);
											self.addId(folderData.data[i].id);
										} else if (folderData.data[i].type == 'folder') {
											pushToTarget(folderData.data[i]);
										}
									}
								}

								pushToTarget(folderData);
							} else {
								symbol = false;
								notificationService.showWarn('所选文件夹不存在');
							}
						} else {
							symbol = false;
							notificationService.showWarn('暂不支持选择此类型节点');
						}
					}
				} else {
					symbol = false;
					notificationService.showWarn('请选择候选测试用例！');
				}
			};

			this.traverse = function (node, folderId) {
				for (let i = 0; i < node.data.length; i++) {
					if (node.data[i].id == folderId) {
						return node.data[i];
					} else if (node.data[i].type == 'folder') {
						let result = null;
						result = self.traverse(node.data[i], folderId);
						if (result != null) {
							return result;
						}
					} else if (node.data[i].type == 'file') {
						break;
					} else {
						return null;
					}
				}
			}

			this.targetToCandidate = function () {
				if (self.selectedTargetItem) {
					var context = {
						from: self.targetTree,
						to: self.candidateTree,
						start: self.selectedTargetItem.id,
						source: [self.selectedTargetItem.id],
						target: null
					};

					// 从目标树中移除节点
					context.from.remove(context.start);
					self.removeId(context.start);

					self.candidateDataSort();
					self.selectedCandidateItem = null;
					self.selectedTargetItem = null;
				} else {
					notificationService.showWarn('请选择目标测试用例！');
				}
			};

			this.removeAll = function () {
				var context = {
					from: self.targetTree
				};

				// 从目标树中移除节点
				context.from.clearAll();
				self.haveId = [];

				self.candidateDataSort();
			};

			this.onBeforeDrop = function (context, native_event) {
				if (context.from === self.targetTree && context.to === self.targetTree) {
					return true;
				}
				return false; // 如果不是目标树内的拖拽，禁止操作
			};

			this.onAfterDrop = function (context, native_event) {
				if (context.from === self.targetTree && context.to === self.targetTree) {
					context.to.refresh();
				}
				return true;
			};


			this.showTree = function () {
				$('#candidateTestsetTreeview').html('');
				$('#targetTestsetTreeview').html('');
				self.candidateTree = null;
				self.targetTree = null;

				webix.ready(function () {
					function setvalueForItems(items) {
						items.forEach(function (item) {
							if (item.id == 'project') {

							} else {
								item.value = item.value + "(id:" + item.id + ")";
							}
							if (item.data && item.data.length > 0) {
								setvalueForItems(item.data);
							}
						});
					}

					setvalueForItems(self.candidateTestSet);
					setvalueForItems(self.targetTestSet);

					if (self.candidateTree) {
						self.candidateTree.destructor();
					}

					self.candidateTree = webix.ui({
						container: "candidateTestsetTreeview",
						view: "tree",
						data: webix.copy(self.candidateTestSet),
						drag: false,
						select: true,
						allowDrop: function (draggedNode, targetNode, type) {
							return false; // 禁止放置
						}
					});

					webix.extend(self.candidateTree, {
						$dragMark: function (context, ev) {
							if (this.my_marked && this.my_marked != context.target) {
								this.removeCss(this.my_marked, "webix_drag_over");
								this.my_marked = null;
							}
							if (context.target) {
								this.my_marked = context.target;
								this.addCss(context.target, "webix_drag_over");
							}
						}
					}, true);
					//设置悬停时的显示内容
					self.candidateTree.define({
						tooltip: function (obj) {
							return "id:" + obj.id;
						}
					});

					self.candidateTree.attachEvent("onAfterSelect", function (id) {
						self.selectedCandidateItem = self.candidateTree.getItem(id);
					});
					self.candidateDataSort();


					self.targetTree = webix.ui({
						container: "targetTestsetTreeview",
						view: "tree",
						select: true,
						drag: true,
						id: "targetTree",
						data: webix.copy(self.targetTestSet),
						allowDrop: function (draggedNode, targetNode, type) {
							return true; // 允许放置
						},
						ready: function () {
							self.haveId = [];
							if (self.editingTestSet.scripts.length > 0) {
								for (var i = self.editingTestSet.scripts.length - 1; i >= 0; i--) {
									var parentId = self.editingTestSet.scripts[i];
									this.move(parentId, 0, this, { parent: 0 });
								}
								this.remove(self.fileManagerUtility.root);
								self.haveId.push(...self.editingTestSet.scripts);
							}
							
							//设置悬停时的显示内容
							self.targetTree.define({
								tooltip: function (obj) {
									return "id:" + obj.id;
								}
							})
						}
					});

					self.targetTree.define({
						tooltip: function (obj) {
							return obj.value;
						}
					});
					self.targetTree.attachEvent("onAfterDrop", self.onAfterDrop);
					self.targetTree.attachEvent("onAfterSelect", function (id) {
						self.selectedTargetItem = self.targetTree.getItem(id);
					});
					webix.extend(self.targetTree, {
						$dragMark: function (context, ev) {
							if (this.my_marked && this.my_marked != context.target) {
								this.removeCss(this.my_marked, "webix_drag_over");
								this.my_marked = null;
							}
							if (context.target) {
								this.my_marked = context.target;
								this.addCss(context.target, "webix_drag_over");
							}
						}
					}, true);
				});
			}

			this.resetValidator = function () {
				$('#testSetForm').validator().off('submit');
				$('#testSetForm').validator('destroy').validator();
				$('#testSetForm').validator().on('submit', function (e) {
					if (e.isDefaultPrevented()) {
						// handle the invalid form...
					} else {
						e.preventDefault();
						self.submit();
					}
				});
			}

			this.submit = function () {
				var checkedNodes = [], message;
				self.targetTree.data.eachLeaf(0, function (obj) {
					checkedNodes.push(obj)
				});

				if (checkedNodes.length > self.maxSteps()) {
					self.showMaxRecordSet(true);
					return;
				}
				else
					self.showMaxRecordSet(false);

				if (checkedNodes.length > 0) {
					self.showEmptyRecordSet(false);
					var selectedScriptIds = "";
					var selectedScriptNames = "";
					for (var i = 0; i < checkedNodes.length; i++) {
						if (i == 0) {
							selectedScriptIds = checkedNodes[i].id;
							selectedScriptNames = checkedNodes[i].value;
						}
						else {
							selectedScriptIds = selectedScriptIds + "," + checkedNodes[i].id;
							selectedScriptNames = selectedScriptNames + "," + checkedNodes[i].value;
						}
					}

					var scriptObj = {
						projectId: self.selectionManager.selectedProject().id,
						id: self.editingTestSet.id(),
						scriptIdsWithCommaSeperator: selectedScriptIds,
						description: self.editingTestSet.description(),
						activate: self.editingTestSet.activate(),
						name: self.editingTestSet.name(),
						engineName: self.editingTestSet.engineName()
					};

					if (self.inEdit)
						self.utpService.updateTestSetWithScriptIds(scriptObj, self.updateTestSetSuccessFunction, self.updateTestSetErrorFunction);
					else
						self.utpService.createTestSetWithScriptIds(scriptObj, self.createTestSetSuccessFunction, self.createTestSetErrorFunction);
					$('#TestSetLoadModal').modal('hide');
				}
				else {
					self.showEmptyRecordSet(true);
				}
			};

			this.updateTestSetSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					var testSetInfo = data.result;
					for (var i = 0; i < self.testsets().length; i++) {
						if (self.testsets()[i].id() === testSetInfo.id) {
							self.testsets()[i].name(testSetInfo.name);
							self.testsets()[i].description(testSetInfo.description);
							self.testsets()[i].activate(testSetInfo.activate);
							break;
						}
					}
					notificationService.showSuccess('更新测试集成功');
				}
				else
					notificationService.showError('更新测试集失败');
			};

			this.updateTestSetErrorFunction = function () {
				notificationService.showError('更新测试集失败');
			};

			this.enterEditItemMode = function (item) {
				self.currentTestSet = item;
				self.inEdit = true;
				//清空allEngineNames
				self.allEngineNames.removeAll();
				//判断engineName是否为空,不为空就把engineName加入allEngineNames
				if (item.engineName() != null) {
					self.allEngineNames.push({
						engineName: item.engineName()
					});
				}
				self.getEngineAddress();
				$('#TestSetLoadModal').modal('show');
			}
			this.getEngineAddress = function () {
				self.ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager.getAuthorizationKey(), self.getEngineAddressSuccessFunction, self.getEngineAddressErrorFunction);
			}

			this.getEngineAddressSuccessFunction = function (response) {
				if (response && response.result && response.engineStatus) {
					// notificationService.showProgressSuccess('获取执行器地址成功。', 100);
					if (response.engineStatuses && response.engineStatuses.length > 0) {
						//判断是否有重复的engineName
						var isRepeat = false;
						for (var i = 0; i < response.engineStatuses.length; i++) {
							for (var j = 0; j < self.allEngineNames().length; j++) {
								if (response.engineStatuses[i].engineName == self.allEngineNames()[j].engineName) {
									isRepeat = true;
									break;
								}
							}
							if (!isRepeat) {
								self.allEngineNames.push({
									engineName: response.engineStatuses[i].engineName
								});
							}
							isRepeat = false;
						}
					}
				}
				// else {
				// 	self.allEngineNames([]);
				// }
			};
			this.getEngineAddressErrorFunction = function () {
				notificationService.showError('获取执行器地址失败。');
			};

			//导出测试集压缩包
			this.derive = function (item) {
				self.utpService.derivedTestSet(item.projectId(), item.id(), function (data) {
					if (data && data.status === 1 && data.result) {
						var result = data.result;
						var a = document.createElement('a');
						a.download = result.fileName;
						a.href = result.filePath;
						$('body').append(a);
						a.click();
					}
					else
						notificationService.showError('导出测试集失败');
				}, function () {
					notificationService.showError('导出测试集失败');
				});
			}

			//导出测试集结果
			this.selectedFile = null;
			this.loadFromFile = function (file) {
				self.selectedFile = file;
			};
			this.testsetResult = function (item) {
				self.currentTestSet = item;
				self.selectedFile = null;
				//清除选择文件夹的缓存
				$('#testsetInputFile').val('');
				$('#importTestsetModal').modal('show');
			};
			this.importTestsetSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					notificationService.showSuccess('上传测试集结果成功');
					$('#importTestsetModal').modal('hide');
					// self.getOrgProject();
				}
				else
					self.importTestsetErrorFunction(data.status);
			};

			this.importTestsetErrorFunction = function (status) {
				if (status === 1) {
					notificationService.showError('上传测试集结果重复');
				}
				else {
					notificationService.showError('上传测试集结果失败');
				}
			};
			this.submitImportedTestSet = function () {
				var fd = new FormData();
				fd.append('testsetFile', self.selectedFile);
				fd.append('projectId', self.currentTestSet.projectId());
				fd.append('testsetId', self.currentTestSet.id());
				self.utpService.importTestset(fd, self.importTestsetSuccessFunction, self.importTestsetErrorFunction);
			};


			this.cancel = function () {
				$('#TestSetLoadModal').modal('hide');
			};

			// remove
			this.deleteCurrentTestSet = function () {
				self.utpService.deleteTestSet(self.selectionManager.selectedProject().id, self.currentTestSet.id(),
					function (data) {
						if (data && data.status === 1 && data.result == true) {
							self.testsets.mappedRemove({ id: self.currentTestSet.id });
							notificationService.showSuccess('删除测试集成功');
						}
						else
							notificationService.showError('删除测试集失败');
					},
					function () {
						notificationService.showError('删除测试集失败');
					});
			}

			this.remove = function (item) {
				$('#deleteTestSetModal').modal('show');
				self.currentTestSet = item;
			};

			this.viewResult = function (item) {
				self.selectionManager.selectedNodeId(item.id());
				app.trigger('viewTestsetResult:event', item.id(), item.name());
			};

			// switch execution		
			this.selectExecution = function () {
				if (self.selectedExecutionId() == null) {
					notificationService.showError('本次测试已经完成，无法切换');
					self.switchExecutionConfirmed = false;
					self.executionManager.switchExecutionConfirmed(false);
				}
				else {
					self.switchExecutionConfirmed = true;
					self.executionManager.newExecutionFlag(false);
					self.executionManager.switchExecutionConfirmed(true);
					for (var i = 0; i < self.executionList().length; i++) {
						if (self.executionList()[i].executionId === self.selectedExecutionId()) {
							executionManager.currentExecutionStatus = self.executionList()[i].status;
							executionManager.setSelectedExecutionId(self.selectedExecutionId());
							executionManager.selectedEngineName(self.executionList()[i].engineName);
							break;
						}
					}
				}
				$('#selectExecutionModal').modal('hide');
			};

			this.switchActiveExecution = function (item) {
				self.executionList([]);
				self.selectionManager.selectedNodeId(item.id());
				self.switchExecutionConfirmed = false;
				self.currentTestSet = item;
				utpService.getActiveExecutionByProject($.cookie("lastSelectedProject"),
					self.getCompletedExecutionListSuccessFunction, self.getCompletedExecutionListErrorFunction);
			}

			this.getCompletedExecutionListSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.getActiveExecutionStatus(data);
					if (self.executionList().length > 0) {
						$('#selectExecutionModal').modal('show');
						self.selectedExecutionId(self.executionList()[0].executionId);
					}
					else {
						notificationService.showWarn('当前没有正在执行的测试实例.');
					}
				}
				else
					self.getCompletedExecutionListErrorFunction();
			};

			this.getCompletedExecutionListErrorFunction = function () {
				notificationService.showError('获取执行信息失败');
			};

			//get
			this.getActiveExecutionStatus = function (data) {
				if (data != null && data.status === 1) {
					var executionStatusInfo = data.result;
					for (var i = 0; i < self.testsets().length; i++)
						self.testsets()[i].activeExecutionCount(0);

					for (var i = 0; i < executionStatusInfo.length; i++) {
						for (var j = 0; j < self.testsets().length; j++) {
							if (executionStatusInfo[i].testsetId === self.testsets()[j].id()) {
								var currentValue = self.testsets()[j].activeExecutionCount();
								self.testsets()[j].activeExecutionCount(++currentValue);
								break;
							}
						}
						if (self.currentTestSet != null)
							if (self.currentTestSet.id() == executionStatusInfo[i].testsetId)
								self.executionList.push(executionStatusInfo[i]);
					}
				}
			};

			this.getActiveExecutionByProjectErrorFunction = function () { };

			// Trigger
			this.inTriggerList = ko.observable(true);
			this.isEditTrigger = false;
			this.permissionErrorFunction = function () {
				notificationService.showError('该功能无法使用,请安装相应许可！');
			};
			this.enterTriggerSettingMode = function (item) {
				var enable = self.systemConfig.getEnableByFeatureName('utpclient.testset_exec.timer')
				if (!enable) {
					self.permissionErrorFunction();
					return;
				}
				self.inTriggerList(true);
				self.currentTestSet = item;
				$('#TestSetTriggerSettingModal').modal('show');
			}

			this.getTestsetExecutionTriggers = function () {
				utpService.getTestsetExecutionTriggerByTestsetId(self.selectionManager.selectedProject().id, self.currentTestSet.id(), self.getTestsetExecutionTriggerByTestsetIdSuccessFunction,
					self.getTestsetExecutionTriggerByTestsetIdErrorFunction);
			}

			this.getTestsetExecutionTriggerByTestsetIdSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result)
					komapping.fromJS(data.result, {}, self.triggers);
				else
					self.getTestsetExecutionTriggerByTestsetIdErrorFunction();
			};

			this.getTestsetExecutionTriggerByTestsetIdErrorFunction = function () {
				notificationService.showError('获取触发器失败');
			};

			this.selectedTriggerSampleChanged = function (obj, event) {
				if (event.originalEvent) { // user changed
					self.editingTrigger.crontriggerExpression(self.editingTrigger.sampleCronExpression());
				} else { // program changed

				}
			};

			this.closeTriggerDialog = function () {
				$('#TestSetTriggerSettingModal').modal('hide');
			};

			this.createTrigger = function () {
				self.inTriggerList(false);
				self.isEditTrigger = false;
				self.editingTrigger.id(0);
				self.editingTrigger.startTime(utilityService.getNowString());
				self.editingTrigger.crontriggerExpression('');
				self.editingTrigger.isEnabled(true);
				self.editingTrigger.sampleCronExpression('0 0 1/1 * * ? *');
				self.initTrigger(self.editingTrigger.isEnabled());
			};

			this.editTrigger = function (item) {
				self.inTriggerList(false);
				self.isEditTrigger = true;
				self.editingTrigger.id(item.id());
				self.editingTrigger.startTime(item.startTime());
				self.editingTrigger.crontriggerExpression(item.crontriggerExpression());
				self.editingTrigger.isEnabled(item.isEnabled());
				self.editingTrigger.sampleCronExpression('0 0 1/1 * * ? *');
				self.initTrigger(self.editingTrigger.isEnabled());
			}

			this.initTrigger = function (currentState) {
				$('#TriggerState').bootstrapSwitch("state", currentState);
				$('#TriggerState').on('switchChange.bootstrapSwitch', function (event, state) {
					self.editingTrigger.isEnabled(state);
				});
			}

			this.submitTrigger = function () {
				if (self.editingTrigger.crontriggerExpression() && !cronExpressionValidator.laterValidator(self.editingTrigger.crontriggerExpression())) {
					notificationService.showError('Cron表达式不合法');
					return;
				}

				var triggerCreationConfig = {
					projectId: self.selectionManager.selectedProject().id,
					id: self.editingTrigger.id(),
					userName: $.cookie("userName"),
					startTime: self.editingTrigger.startTime(),
					crontriggerExpression: self.editingTrigger.crontriggerExpression(),
					testsetId: self.currentTestSet.id(),
					isEnabled: self.editingTrigger.isEnabled()
				}

				var triggerUpdateConfig = {
					projectId: self.selectionManager.selectedProject().id,
					id: self.editingTrigger.id(),
					userName: $.cookie("userName"),
					startTime: self.editingTrigger.startTime(),
					crontriggerExpression: self.editingTrigger.crontriggerExpression(),
					isEnabled: self.editingTrigger.isEnabled()
				}

				if (self.isEditTrigger) {
					self.utpService.editTestsetExecutionTrigger(triggerUpdateConfig,
						function (data) {
							if (data && data.status === 1 && data.result) {
								self.getTestsetExecutionTriggers();
								notificationService.showSuccess('触发器更新成功');
								self.inTriggerList(true);
							}
							else
								notificationService.showError('触发器更新失败');
						},
						function () {
							notificationService.showError('触发器更新失败');
						});
				}
				else {
					self.utpService.createTestsetExecutionTrigger(triggerCreationConfig,
						function (data) {
							if (data && data.status === 1 && data.result) {
								var trigger = data.result;
								trigger.startTime = utilityService.getNowString();
								self.triggers.push(komapping.fromJS(trigger));
								notificationService.showSuccess('创建触发器成功');
								self.inTriggerList(true);
							}
							else
								notificationService.showError('创建触发器失败');
						},
						function () {
							notificationService.showError('创建触发器失败');
						});
				}
			}

			this.cancelTrigger = function () {
				self.inTriggerList(true);
			}

			this.removeTrigger = function (item) {
				self.utpService.deleteTestsetExecutionTrigger(self.selectionManager.selectedProject().id, item.id(),
					function (data) {
						if (data && data.status === 1 && data.result) {
							self.triggers.mappedRemove({ id: item.id });
							notificationService.showSuccess('删除触发器成功');
						}
						else
							notificationService.showError('删除触发器失败');
					},
					function () {
						notificationService.showError('删除触发器失败');
					});
			}

			this.detached = function (view, parent) {
				self.testSetRefreshSubScription.off();
				self.testSetAddSubScription.off();
			};

			this.activate = function () {
				self.getTestSetByProject();
				self.testSetRefreshSubScription = app.on('testSetRefresh:event').then(function () { self.getTestSetByProject(); }, this);
				self.testSetAddSubScription = app.on('testSetAdd:event').then(function () { self.createTestSet(); }, this);
			};

			this.attached = function (view, parent) {
				$('.form_datetime').datetimepicker({
					format: 'yyyy-mm-dd hh:ii:ss',
					autoclose: true,
					todayBtn: true,
				});

				$('#TestSetLoadModal').on('show.bs.modal', function () {
					self.showEmptyRecordSet(false);
					self.showMaxRecordSet(false);
				});

				$('#TestSetLoadModal').on('shown.bs.modal', function () {
					self.allEngineNames.removeAll();
					self.getEngineAddress();
					self.init();
				});

				$('#TestSetTriggerSettingModal').on('shown.bs.modal', function () {
					// must use shown.bs.modal here, not show.bs.modal
					self.getTestsetExecutionTriggers();
				});

				$('#selectExecutionModal').on('hidden.bs.modal', function () {
					if (self.switchExecutionConfirmed)
						self.gotoExecution();
				});
			};
		}
		return new TestRunViewModel();
	});