define(
	['jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
		'services/langManager', 'services/viewManager', 'services/systemConfig',
		'services/fileManagerUtility', 'services/utpService', 'services/notificationService', 'komapping',
		'services/selectionManager', 'services/loginManager', 'services/projectManager', 'knockout', 'knockout-postbox', 'services/specialTestService'],
	function ($, app, bootstrap, lang, dtManager, langManager,
		viewManager, systemConfig, fileManagerUtility, utpService, notificationService, komapping,
		selectionManager, loginManager, projectManager, ko, specialTestService) {

		function SpecialTestViewModel() {
			var self = this;
			this.loginManager = loginManager;

			this.selectionManager = selectionManager;
			this.projectManager = projectManager;
			this.viewManager = viewManager;
			this.systemConfig = systemConfig;
			this.scriptsData = null;
			this.currentSpecialTestSet = ko.observable();
			this.specialTestSets = ko.observableArray([]);
			this.showSpecialTestsetResult = ko.observable(false);
			this.isEditMode = ko.observable(false);
			this.scriptName = ko.observable("选择");
			this.sendCommandScriptName = ko.observable("选择");
			this.stopScriptName = ko.observable("选择");
			this.enableAutotestSubScription = null;
			this.specialExecutionDataResult = ko.observableArray([]);
			this.specialTestAuto = ko.observable(-1);

			this.specialTestService = specialTestService;
			this.showNumber = ko.observable(true);

			//定义枚举,用于判断当前脚本模式
			this.specialTestType = ko.observable([
				{ name: "单页面", value: 1 },
				{ name: "多页面", value: 2 }
			])
			this.editingSpecialTestSetConfig = {
				id: ko.observable(0),
				projectId: ko.observable(0),
				name: ko.observable(''),
				description: ko.observable(''),
				scriptId: ko.observable(),
				type: ko.observable(1),
				subpageNumber: ko.observable(),//工位数量
				isParallel: ko.observable(), //运行方式
				autoIntoUserName: ko.observable(''), //自动登录用户名
			};
			this.subpageNumberList = ko.observableArray([
				{ id: 1, name: '1' },
				{ id: 2, name: '2' },
				{ id: 3, name: '3' },
				{ id: 4, name: '4' }
			]);

			this.wayToRun = ko.observableArray([
				{ id: 0, name: '串行' },
				{ id: 1, name: '并行' }
			]);

			this.showNewDropdown = ko.computed(function () {
				// 检查当前类型是否为“多页面”，如果是，则返回true，否则返回false
				return self.editingSpecialTestSetConfig.type() === 2;
			});

			this.initScriptTree = function (data) {
				$('#specialTestScriptTreeview').html('');
				webix.ready(function () {
					self.scriptTree = webix.ui({
						container: "specialTestScriptTreeview",
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
				if (self.currentScriptMode == 'special') {
					self.scriptName(checkedNode.name);
					self.editingSpecialTestSetConfig.scriptId(checkedNode.id);
				}
				$('#specialInsertsendCommandScriptModal').modal('hide');
			};

			this.opensendCommandScriptUI = function (mode) {
				self.currentScriptMode = mode;
				var project = [];
				project.push(JSON.parse(JSON.stringify(self.scriptsData)));
				$('#specialInsertsendCommandScriptModal').modal({ show: true }, { data: project });
			};
			// this.openEditSpecialTestUI = function(mode){
			// 	self.currentScriptMode = mode;
			// 	var treeData = [  
			// 		{ id:1, value:"第一层", open:true, data:[  
			// 			{ id:2, value:"第一层 1" },  
			// 			{ id:3, value:"第一层 2", data:[  
			// 				{ id:4, value:"第一层 1" },  
			// 				{ id:5, value:"第一层 2" }  
			// 			]}  
			// 		]}  
			// 	];
			// 	// var project = [];
			// 	// project.push(JSON.parse(JSON.stringify(self.scriptsData)));
			// 	$('#editSpecialTestTreeModal').modal({ show: true }, {data: treeData});
			// };

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
				utpService.getFlatScriptByProject(self.selectionManager.selectedProject().id, self.getFlatScriptByProjectSuccessFunction, self.getFlatScriptByProjectErrorFunction);
			};

			this.submitSpecialTestSetConfig = function () {
				if (self.editingSpecialTestSetConfig.name() == '') {
					notificationService.showWarn('请输入名称');
					return;
				}
				self.editingSpecialTestSetConfig.projectId(selectionManager.selectedProject().id);
				if (self.specialTestAuto() == 1) {
					self.editingSpecialTestSetConfig.autoIntoUserName($.cookie("userName"));
				} else if (self.specialTestAuto() == 0) {
					self.editingSpecialTestSetConfig.autoIntoUserName('');
				}
				if (self.isEditMode()) {
					updateSpecialTestSetConfig();
				}
				else
					addSpecialTestSetConfig();
			};

			this.enterAddItemMode = function () {
				self.isEditMode(false);
				self.editingSpecialTestSetConfig.id(0);
				self.editingSpecialTestSetConfig.name('');
				self.editingSpecialTestSetConfig.description('');
				self.editingSpecialTestSetConfig.scriptId('');
				self.editingSpecialTestSetConfig.autoIntoUserName('');
				self.editingSpecialTestSetConfig.type(1);
				self.editingSpecialTestSetConfig.isParallel(0);
				self.editingSpecialTestSetConfig.subpageNumber(1);
				self.scriptName("选择脚本");
				self.showSpecialTestsetResult(false);
				self.updateAccord();
			};

			this.enterEditItemMode = function (item) {
				self.isEditMode(true);
				self.editingSpecialTestSetConfig.id(item.id);
				self.editingSpecialTestSetConfig.name(item.name);
				self.editingSpecialTestSetConfig.description(item.description);
				self.editingSpecialTestSetConfig.scriptId(item.scriptId);
				self.editingSpecialTestSetConfig.projectId(item.projectId);
				self.editingSpecialTestSetConfig.type(item.type);
				self.editingSpecialTestSetConfig.isParallel(item.isParallel);
				self.editingSpecialTestSetConfig.subpageNumber(item.subpageNumber);

				if (item.autoIntoUserName == $.cookie("userName")) {
					self.specialTestAuto(1)
				} else {
					self.specialTestAuto(0)
				}
				var script = self.projectManager.getScript(item.scriptId);
				self.scriptName("选择脚本");
				if (script != null)
					self.scriptName(script.value);
				self.showSpecialTestsetResult(false);
				self.updateAccord();
			};

			this.getSpecialTestSetConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					var specialTestSets = data.result;
					loginManager.autoIntoSpecialTest(false);
					var autoId = -1;
					for (var i = 0; i < specialTestSets.length; i++) {
						self.specialTestSets.push(specialTestSets[i]);
						if (specialTestSets[i].autoIntoUserName == $.cookie("userName")) {
							autoId = i;
						}
					}
					if (autoId != -1) {
						loginManager.autoIntoSpecialTest(true);
						self.gotoExecution(self.specialTestSets()[autoId])
					}
				} else
					self.getSpecialTestSetConfigErrorFunction();
			};

			this.getSpecialTestSetConfigErrorFunction = function () {
				notificationService.showError('获取专项测试集失败');
			};

			this.getSpecialTestSetConfig = function () {
				self.specialTestSets.removeAll();
				utpService.getSpecialTestsByProjectId(selectionManager.selectedProject().id, self.getSpecialTestSetConfigSuccessFunction, self.getSpecialTestSetConfigErrorFunction);
			};

			this.addSpecialTestSetConfigErrorFunction = function () {
				notificationService.showError('创建专项测试集失败');
			};

			this.addSpecialTestSetConfigSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.getSpecialTestSetConfig();
					notificationService.showSuccess('创建专项测试集成功');
				}
				else
					self.addSpecialTestSetConfigErrorFunction();
			};

			function addSpecialTestSetConfig() {
				utpService.createSpecialTest(komapping.toJS(self.editingSpecialTestSetConfig), self.addSpecialTestSetConfigSuccessFunction, self.addSpecialTestSetConfigErrorFunction);
			}

			this.updateSpecialTestSetConfigSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					self.getSpecialTestSetConfig();
					notificationService.showSuccess('更新专项测试集成功');
				}
				else
					self.updateSpecialTestSetConfigErrorFunction();
			};

			this.updateSpecialTestSetConfigErrorFunction = function () {
				notificationService.showError('更新专项测试集异常');
			};

			function updateSpecialTestSetConfig() {
				utpService.updateSpecialTest(komapping.toJS(self.editingSpecialTestSetConfig), self.updateSpecialTestSetConfigSuccessFunction, self.updateSpecialTestSetConfigErrorFunction);
			};

			this.deleteCurrentSpecialTestSet = function () {
				utpService.removeSpecialTest(selectionManager.selectedProject().id, self.currentSpecialTestSet().id,
					function (data) {
						if (data != null && data.status === 1 && data.result) {
							self.getSpecialTestSetConfig();
							notificationService.showSuccess('删除专项测试集成功');
						}
						else
							notificationService.showError('删除专项测试集失败');
					},
					function () {
						notificationService.showError('删除专项测试集失败');
					});
			};

			this.remove = function (item) {
				$('#deleteSpecialTestSetModal').modal('show');
				self.currentSpecialTestSet(item);
			};

			this.gotoExecution = function (item) {
				viewManager.selectedSpecialTestsetActiveData = item;
				// projectManager.isMonitoringResult = false
				viewManager.specialTestActivePage('app/viewmodels/specialTestLoad');
			};

			this.initPage = function () {
				webix
					.ready(function () {
						webix
							.ui({
								container: "specialTestSetInfo",
								id: "specialtestsetinfo_accord",
								multi: true,
								view: "accordion",
								minHeight: 700,
								cols: [
									{
										id: "specialTestSetOverAllInfo_control",
										body: {
											view: "htmlform",
											content: "specialTestSetOverAllInfo",
										},
										minHeight: 700,
										minWidth: 600,
										scroll: false
									},
									{
										view: "resizer"
									},
									{
										header: "专项测试集详细信息",
										id: "specialTestSetDetail_control",
										body: {
											view: "htmlform",
											content: "specialTestSetDetail",
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

			// this.selectedSpecialTestsetType = ko.observable();

			// this.specialTestsetTypes = ko.observableArray([
			// 	{id:0, name:"监测并控制", value:0},
			// 	{id:1, name:"仅监测", value:1},
			// 	{id:2, name:"仅控制", value:2}
			// ]);

			// this.selectedSpecialTestsetTypeChanged = function(obj,event){
			// 	self.editingSpecialTestSetConfig.type(self.selectedSpecialTestsetType());
			// }

			this.updateAccord = function () {
				$$('specialTestSetDetail_control').header = self.showSpecialTestsetResult() ? "历史结果" : "监控集详细信息";
				$$('specialTestSetDetail_control').refresh();
				$$('specialTestSetDetail_control').expand();
			};

			this.viewResultDetail = function (item) {
				projectManager.isSpecialingResult = true
				self.viewManager.selectedSpecialExecution(item)
				viewManager.autotestActivePage('app/viewmodels/autotest');
			}

			this.currentExecutionData = ''
			this.viewRemoveResult = function (item) {
				self.currentExecutionData = item
				$('#deleteSpecialExecutionData').modal('show')
			}

			this.confirmRemoveExecutionResult = function () {
				utpService.removeResultByExecutionId(self.currentExecutionData.executionId, function (data) {
					if (data) {
						self.specialExecutionDataResult.remove(self.currentExecutionData)
						notificationService.showSuccess('删除记录成功');
					}
				}, function (error) {
					notificationService.showError('删除记录失败');
				})
				$('#deleteSpecialExecutionData').modal('hide')
			}

			// this.getSpecialingExecutionDataSuccess = function (data) {
			// 	if(data && data.status === 1 && data.result){
			// 		var executionList = data.result
			// 		for(let i = 0; i < executionList.length; i++){
			// 			self.specialExecutionDataResult.unshift(executionList[i])
			// 		}
			// 	}else self.getSpecialingExecutionDataError()
			// }

			// this.getSpecialingExecutionDataError = function (error) {

			// }

			this.viewResult = function (item) {
				// self.specialExecutionDataResult.removeAll()
				viewManager.selectedSpecialTestsetActiveData = item;
				// utpService.getMonitoringExecutionDataByTestSetId(item.id, self.getSpecialingExecutionDataSuccess, self.getSpecialingExecutionDataError)
				self.showSpecialTestsetResult(true);
				self.updateAccord();
			};

			this.specialtestsetContainerAdjust = function () {
				var parent = document.getElementById("autotestinfo").parentNode;
				$$("specialtestsetinfo_accord").define("width", parent.clientWidth);
				$$("specialtestsetinfo_accord").resize();
				$$("specialTestSetDetail_control").define("height", "700");
				$$("specialTestSetDetail_control").resize();
			};

			this.detached = function (view, parent) {
				self.enableAutotestSubScription.off();
			};
			
			this.activate = function () {
				self.enableAutotestSubScription = app.on('enableSpecialTest:event').then(function () {
					self.specialtestsetContainerAdjust();
					self.getSpecialTestSetConfig();
					self.getFlatScriptByProject();
				}, this);
			};

			this.attached = function (view, parent) {
				self.getSpecialTestSetConfig();
				self.getFlatScriptByProject();
				self.initPage();
				self.specialtestsetContainerAdjust();
				$$('specialTestSetDetail_control').collapse();
				$('#specialInsertsendCommandScriptModal').on('shown.bs.modal', function (e) {
					self.initScriptTree(e.relatedTarget.data);
					//	self.getProjectSubScript();						
				});


				// $('#editSpecialTestTreeModal').on('shown.bs.modal', function(e) {
				// 	self.editSpecialTestTree(e.relatedTarget.data);					
				// });
			};
		}
		return new SpecialTestViewModel();
	});
