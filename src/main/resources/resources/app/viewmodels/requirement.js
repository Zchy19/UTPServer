define(
		[ 'jquery', 'durandal/system', 'durandal/app', 'lang', 'knockout', 'blockUI',
				'services/loginManager', 'services/projectManager',
				'services/executionManager', 'services/viewManager','services/systemConfig', 
				'services/fileManagerUtility', 'services/selectionManager',
				'services/utpService', 'services/notificationService',
				'services/cmdConvertService', 'services/utilityService', 'services/excelReader' ],
		function($, system, app, lang, ko, blockUI, loginManager, projectManager,
				executionManager, viewManager, systemConfig, fileManagerUtility,
				selectionManager, utpService, notificationService,
				cmdConvertService, utilityService, excelReader) {

			function RequirementViewModel() {
				var self = this;
				self.viewManager = viewManager;
				self.systemConfig = systemConfig;
				self.projectManager = projectManager;
				self.selectionManager = selectionManager;
				self.utpService = utpService;
				self.executionManager = executionManager;
				self.requirements = [];
				self.initFinish = false;
				self.reload = true;
				self.selectedItem = null;
				self.sourceId = "";				
				self.copyOrCut = true; // true: copy, false, cut
				self.targetId = "";
				self.currentScriptReferenceOfRequirement = [];
				self.selectRequirementExportType = ko.observable('0');
				self.exportNodes = [];
				
				this.treeAdjust = function() {
					// $$("req_fm").data.sort("value","asc", self.localeCompare);
					$$("req_fm").$$("table").sort("#value#", "asc", "string");
					$$("req_fm").$$("table").markSorting("value", "asc");
					$$("req_fm").$$("table").attachEvent(
							"onAfterSort",
							function(by, dir, as) {
								$$("req_fm").$$("tree").sort("#" + by + "#", dir,
										as);
							});
					$$("req_fm").$$("tree").closeAll();

					if (self.projectManager.currentRequirementOpenFolders != null
							&& self.projectManager.currentRequirementOpenFolders.length > 1) {
						$$("req_fm")
								.$$("tree")
								.open(
										self.projectManager.currentRequirementOpenFolders[self.projectManager.currentRequirementOpenFolders.length - 2],
										true);
						$$("req_fm")
								.$$("tree")
								.select(
										self.projectManager.currentRequirementOpenFolders[self.projectManager.currentRequirementOpenFolders.length - 1]);
					} else {
						$$("req_fm").$$("tree").open(fileManagerUtility.root);
						$$("req_fm").$$("tree").select(fileManagerUtility.root);
					}
				};
				
				this.refreshFileManager = function(data) {
					if (data != null) {
						$$("req_fm").clearAll();
						self.initFinish = false;
						$$("req_fm").parse(data);
						self.treeAdjust();
					}
				};
				
				this.calculateRequirementCoverageSuccessFunction = function(data) {
					if (!(data && data.status === 1 && data.result))
						self.calculateRequirementCoverageErrorFunction();
				};
				
				this.calculateRequirementCoverageErrorFunction = function(){
					console.log('计算覆盖率失败');
				};
				
				this.calculateRequirementCoverage = function(){
					self.utpService.calculateRequirementCoverage(self.selectionManager.selectedProject().id,
							self.calculateRequirementCoverageSuccessFunction,
							self.calculateRequirementCoverageErrorFunction);
					self.getRequirementByProject();
				};
				
				// create folder
				this.createRequirementGroupSuccessFunction = function(data) {
					if (data && data.status === 1) {
						var retNewRequirementGroup = data.result;
						if (retNewRequirementGroup != null) {
							if (retNewRequirementGroup.parentId == 0)
								retNewRequirementGroup.parentId = fileManagerUtility.root;

							$$("req_fm").add({
								id : retNewRequirementGroup.id,
								value : retNewRequirementGroup.title,
								customizedId: retNewRequirementGroup.customizedId,
								date : new Date(),
								type : "folder",
								leaf:retNewRequirementGroup.leaf,
								customizedFields: retNewRequirementGroup.customizedFields,
								dataType : retNewRequirementGroup.type,								
								description: retNewRequirementGroup.description,								
								comment : retNewRequirementGroup.comment
							}, 0, retNewRequirementGroup.parentId);
							$$("req_fm").refreshCursor();
							self.treeAdjust();
							notificationService.showSuccess('创建需求组成功');
							self.calculateRequirementCoverage();
						} else
							self.createRequirementGroupErrorFunction();
					} else
						self.createRequirementGroupErrorFunction();
				};

				this.createRequirementGroupErrorFunction = function() {
					notificationService.showError('创建需求组失败');
				};

				this.createRequirementGroup = function(parentId) {
					var defNewRequirementGroup = {
						id : 0,
						customizedId: '',
						projectId : self.selectionManager.selectedProject().id,
						parentId : parentId,
						description : '',
						leaf: false,
						title : '新建需求组',
						comment: '',
						customizedFields: '',
						type : self.projectManager.RequirementGroupMode
					};
					self.utpService.createRequirement(defNewRequirementGroup,
							self.createRequirementGroupSuccessFunction,
							self.createRequirementGroupErrorFunction);
				};
				
				this.createRequirementSuccessFunction = function(data) {
					if (data && data.status === 1) {
						var retNewRequirement = data.result;
						if (retNewRequirement != null) {
							if (retNewRequirement.parentId == 0)
								retNewRequirement.parentId = fileManagerUtility.root;
							
							$$("req_fm").add({
								id : retNewRequirement.id,
								customizedId: retNewRequirement.customizedId,
								value : retNewRequirement.title,
								date : new Date(),
								type : "file",
								leaf:retNewRequirement.leaf,
								customizedFields: retNewRequirement.customizedFields,	
								dataType : retNewRequirement.type,						
								description: retNewRequirement.description,								
								comment : retNewRequirement.comment
							}, 0, retNewRequirement.parentId);
							$$("req_fm").refreshCursor();
							self.treeAdjust();
							notificationService.showSuccess('创建需求成功');
							self.calculateRequirementCoverage();
						} else
							self.createRequirementErrorFunction();
					} else
						self.createRequirementErrorFunction();
				};

				this.createRequirementErrorFunction = function() {
					notificationService.showError('创建需求失败');
				};				
				
				this.createRequirement = function(parentId) {
					var defNewRequirement = {
						id : 0,
						customizedId: '',
						projectId : self.selectionManager.selectedProject().id,
						parentId : parentId,
						description : '',
						title : '新建需求',
						leaf: true,
						comment: '',
						customizedFields: '',
						type : self.projectManager.RequirementMode
					};
					self.utpService.createRequirement(defNewRequirement,
							self.createRequirementSuccessFunction,
							self.createRequirementErrorFunction);
				};
				
				this.createCheckPointSuccessFunction = function(data) {
					if (data && data.status === 1) {
						var retNewCheckPoint = data.result;
						if (retNewCheckPoint != null) {
							if (retNewCheckPoint.parentId == 0)
								retNewCheckPoint.parentId = fileManagerUtility.root;
							
							$$("req_fm").add({
								id : retNewCheckPoint.id,
								customizedId: retNewCheckPoint.customizedId,
								value : retNewCheckPoint.title,
								date : new Date(),
								type : "text",
								dataType : retNewCheckPoint.type,
								leaf: retNewCheckPoint.leaf,
								customizedFields: retNewCheckPoint.customizedFields,
								description: retNewCheckPoint.description,								
								comment : retNewCheckPoint.comment
							}, 0, retNewCheckPoint.parentId);
							$$("req_fm").refreshCursor();
							self.treeAdjust();
							notificationService.showSuccess('创建检查点成功');
							self.calculateRequirementCoverage();
						} else
							self.createCheckPointErrorFunction();
					} else
						self.createCheckPointErrorFunction();
				};

				this.createCheckPointErrorFunction = function() {
					notificationService.showError('创建检查点失败');
				};
				
				this.createCheckPoint = function(parentId) {
					var defNewCheckPoint = {
							id : 0,
							customizedId: '',
							projectId : self.selectionManager.selectedProject().id,
							parentId : parentId,
							description : '',
							title : '新建检查点',
							leaf: true,
							customizedFields: '',
							comment: '',
							type : self.projectManager.CheckPointMode
						};
						self.utpService.createRequirement(defNewCheckPoint,
								self.createCheckPointSuccessFunction,
								self.createCheckPointErrorFunction);
				};
				
				// sync
				this.syncRequirementSuccessFunction = function(data) {
					if (data && data.status === 1 && data.result) {
						notificationService.showSuccess('上传成功');
						self.calculateRequirementCoverage();
					} 
					else
						self.syncRequirementErrorFunction();
				};

				this.syncRequirementErrorFunction = function() {
					$.unblockUI();					
					notificationService.showError('上传失败');
				};
				
				this.syncRequirement = function(requirements){
					if(requirements == null || requirements.length == 0){
						notificationService.showWarn('数据为空或格式不正确！');
						return;
					}						
					$.blockUI(utilityService.template);
					self.utpService.syncRequirement(requirements,
							self.syncRequirementSuccessFunction,
							self.syncRequirementErrorFunction);
				};
					
				// edit				
				this.editRequirement = function(requirement) {
					var item = $$("req_fm").getItem(self.selectedItem.id);
					item.customizedId = requirement.customizedId,
					item.description = requirement.description;
					item.comment = requirement.comment;
					item.dataType = requirement.type;
					item.value = requirement.title;
					item.leaf = requirement.leaf;
					item.customizedFields = requirement.customizedFields; // TODO
					item.type = requirement.leaf ? (requirement.type == self.projectManager.CheckPointMode ? "text" : "file") : "folder";
					$$("req_fm").renameFile(self.selectedItem.id, requirement.title);
					self.treeAdjust();
					$$("req_fm").refreshCursor();
					$$('requirementForm').setValues(
							{
								id : requirement.id,
								customizedId : requirement.customizedId,
								projectId : requirement.projectId,
								parentId : requirement.parentId,
								description : requirement.description,
								title : requirement.title,
								comment: requirement.comment,
								leaf: requirement.leaf, // TODO
								type : requirement.type
							}
					);
					self.initRequirementCustomizedFieldValueControl(item.customizedFields);
				}
				
				this.updateRequirementSuccessFunction = function(data) {
					if (data && data.status === 1) {
						var requirement = data.result;
						self.editRequirement(requirement);						
						notificationService.showSuccess('更新成功');
					} else
						self.updateRequirementErrorFunction();
				};

				this.updateRequirementErrorFunction = function() {					
					notificationService.showError('更新失败');
				};

				this.updateRequirement = function(requirement) {
					var reqObj = JSON.parse(JSON.stringify(requirement));
					var candidateCustomizedFields = $$("req_customizedField").serialize();
					var customizedFields = [];
					if(candidateCustomizedFields.length > 0){
						for(var i = 0; i < candidateCustomizedFields.length; i++){
							if(candidateCustomizedFields[i].value != '')
								customizedFields.push({
									name: candidateCustomizedFields[i].name,
									value: candidateCustomizedFields[i].value
								})
						}
					}
					reqObj.customizedFields = JSON.stringify(customizedFields);
					self.utpService.updateRequirement(reqObj, self.updateRequirementSuccessFunction, self.updateRequirementErrorFunction);
				};
				
				// delete
				this.deleteTargetRequirement = function() {
					if (self.selectedItem.type === "file")
						self.deleteRequirement(self.selectedItem.id, false);
					else if (self.selectedItem.type === "text")
						self.deleteCheckpoint(self.selectedItem.id, false);
					else if (self.selectedItem.type === "folder")
						self.deleteRequirementGroup(self.selectedItem.id);
				};

				this.deleteTargetRequirementWithMaping = function(){
					if (self.selectedItem.type === "file")
						self.deleteRequirement(self.selectedItem.id, true);
					else if (self.selectedItem.type === "text")
						self.deleteCheckpoint(self.selectedItem.id, true);
					else if (self.selectedItem.type === "folder")
						self.deleteRequirementGroup(self.selectedItem.id);
				}
				
				// delete folder
				this.deleteRequirementGroupSuccessFunction = function(data) {
					if (data && data.status === 1 && data.result) {
						var parentId = $$("req_fm").getParentId(self.selectedItem.id);
						$$("req_fm").deleteFile(self.selectedItem.id);
						$$("req_fm").setPath(parentId);
						self.treeAdjust();
						$$("req_fm").refreshCursor();
						notificationService.showSuccess('删除需求组成功');
						$$('req_form').collapse();
						self.calculateRequirementCoverage();
					} else
						self.deleteRequirementGroupErrorFunction();
				};

				this.deleteRequirementGroupErrorFunction = function() {
					notificationService.showError('删除需求组失败');
				};

				this.deleteRequirementGroup = function(id) {
					self.utpService.deleteRequirement(self.selectionManager
							.selectedProject().id, id,
							self.deleteRequirementGroupSuccessFunction,
							self.deleteRequirementGroupErrorFunction);
				};

				// delete requirement
				this.deleteRequirementSuccessFunction = function(data) {					
					if (data && data.status === 1 && data.result) {
						$$("req_fm").deleteFile(self.selectedItem.id);
						self.treeAdjust();
						$$("req_fm").refreshCursor();
						self.projectManager.deleteRequirement(self.selectedItem.id);
						notificationService.showSuccess('删除需求成功');
						$$('req_form').collapse();
						self.calculateRequirementCoverage();
					} else
						self.deleteRequirementErrorFunction();
				};

				this.deleteRequirementErrorFunction = function() {
					notificationService.showError('删除需求失败！');
				};

				this.deleteRequirement = function(id, withMapping) {
					if(withMapping)
						self.utpService.deleteRequirementWithMapping(self.selectionManager
								.selectedProject().id, id,
								self.deleteRequirementSuccessFunction,
								self.deleteRequirementErrorFunction);
					else
						self.utpService.deleteRequirement(self.selectionManager
								.selectedProject().id, id,
								self.deleteRequirementSuccessFunction,
								self.deleteRequirementErrorFunction);
				};

				// delete checkpoint
				this.deleteCheckpointSuccessFunction = function(data) {					
					if (data && data.status === 1) {
						$$("req_fm").deleteFile(self.selectedItem.id);
						self.treeAdjust();
						$$("req_fm").refreshCursor();						
						self.projectManager.deleteRequirement(self.selectedItem.id);						
						notificationService.showSuccess('删除检查点成功！');
						$$('req_form').collapse();
						self.calculateRequirementCoverage();
					} else
						self.deleteCheckpointErrorFunction();
				};

				this.deleteCheckpointErrorFunction = function() {
					notificationService.showError('删除检查点失败');
				};

				this.deleteCheckpoint = function(id, withMapping) {
					if(withMapping)
						self.utpService.deleteRequirementWithMapping(self.selectionManager
								.selectedProject().id, id,
								self.deleteCheckpointSuccessFunction,
								self.deleteCheckpointErrorFunction);
					else
						self.utpService.deleteRequirement(self.selectionManager
								.selectedProject().id, id,
								self.deleteCheckpointSuccessFunction,
								self.deleteCheckpointErrorFunction);
				};
				
				// move requirement
				this.moveRequirementSuccessFunction = function(data) {
					if (data && data.status === 1) {
						var result = data.result;
						if (result.state === 'Success') {
							if (!self.copyOrCut)
								$$("req_fm").moveFile(self.sourceId, self.targetId);								
							$$("req_fm").refreshCursor();
							self.treeAdjust();
							notificationService.showSuccess('粘贴成功');
							$.unblockUI();
							self.calculateRequirementCoverage();
						} else if(result.state === 'FailedByDestinationIsSubfolder')
							self.moveScriptGroupErrorFunction("粘贴目标不合法");
						else 
							self.moveScriptGroupErrorFunction();
					} else
						self.moveScriptGroupErrorFunction();
				};

				this.moveRequirementErrorFunction = function(errorMessage) {
					$.unblockUI();
					if(errorMessage)
						notificationService.showError(errorMessage);
					else
						notificationService.showError('粘贴失败');
				};

				this.moveRequirement = function(sourceId, targetId, copyOrCut) {
					if (copyOrCut) {
						$.blockUI(utilityService.template);
						self.utpService.copyRequirement(self.selectionManager
								.selectedProject().id, sourceId, targetId,
								self.moveRequirementSuccessFunction,
								self.moveRequirementErrorFunction);
					} else
						self.utpService.cutRequirement(self.selectionManager
								.selectedProject().id, sourceId, targetId,
								self.moveRequirementSuccessFunction,
								self.moveRequirementErrorFunction);
				};
				
				// get all requirements
				this.getRequirementByProjectSuccessFunction = function(data) {					
					if (data != null && data.status === 1 && data.result != null) {						
						var requirements = self.projectManager
								.generateRequirement(data.result);
						var root = [];
						root.push(requirements);
						self.refreshFileManager(root);
					} else
						self.getRequirementByProjectErrorFunction();
				};

				this.getRequirementByProjectErrorFunction = function() {
					notificationService.showError('获取项目需求信息失败');
				};

				this.getRequirementByProject = function() {					
					self.utpService.getRequirementByProjectId(
							self.selectionManager.selectedProject().id,
							self.getRequirementByProjectSuccessFunction,
							self.getRequirementByProjectErrorFunction);
				};
				
				self.exportData = null;
				self.excelReport = {
					"conditions" : [],
					"styles" : [],
					"spans" : [],
					"ranges" : [],
					"sizes" : [],
					"table" : {
						"frozenColumns" : 0,
						"frozenRows" : 0,
						"gridlines" : 1,
						"headers" : 1
					},
					"data" : [],
					"locked" : [],
					"editors" : [],
					"filters" : [],
					"formats" : [],
					"comments" : []
				}
				
				this.confirmRequirementExportConfig = function(){
					if(self.selectRequirementExportType() === '1')
						self.exportRequirement(self.exportNodes, true);
					else
						self.exportRequirement(self.exportNodes, false);
				}
				
				self.spreadSheet = null;			
				this.exportRequirement = function(nodes, withTestCaseMapping) {					
					if (nodes == null && nodes.length == 0) {
						notificationService.showInfo('暂无信息!');
						return;
					}
					self.exportData = new Map();
					self.excelReport.data = [ [ 1, 1, "id", "" ],[1, 2, "pid", ""],[ 1, 3, "customizedId", "" ],
							[ 1, 4, "path", "" ], [ 1, 5, "title", "" ], [ 1, 6, "type", "" ], 
							[ 1, 7, "description", "" ], [ 1, 8, "comment", "" ] ];
					if(withTestCaseMapping)
						self.excelReport.data.push([1, 9, "testcaseMapping", ""])
					var requirementIdList = [];
					nodes.map(function(node) {
						self.exportData.set(node.id, node);
						requirementIdList.push(node.id);
					});
					if (requirementIdList.length > 0) {
						$.blockUI(utilityService.template);
						
						self.utpService.getRequirementsByRequirementIds(
								self.selectionManager.selectedProject().id,
								requirementIdList, function(data) {
									if (data && data.status === 1 && data.result){										
										data.result.map(function(node) {
											var currentNode = self.exportData.get(node.id);
											if (currentNode) {
												currentNode.description = node.description;
												currentNode.title = node.title;
												currentNode.comment = node.comment;
												currentNode.customizedId = node.customizedId,
												self.exportData.set(node.id,currentNode);
											}
										});
										var i = 1;
										self.exportData.forEach(function(value, key, map) {
											self.excelReport.data.push([++i,1,value.id,"" ]);
											self.excelReport.data.push([i,2,value.parentId,"" ]);
											self.excelReport.data.push([i,3,value.customizedId,"" ]);
											self.excelReport.data.push([i,4,value.path,"" ]);
											self.excelReport.data.push([i,5,value.title,"" ]);											
											self.excelReport.data.push([i,6,value.type == "checkpoint" ? "检查点": value.type == "requirementgroup" ? "需求组" : "需求" ]);
											self.excelReport.data.push([i,7,value.description,"" ]);
											self.excelReport.data.push([i,8,value.comment,"" ]);
											if(withTestCaseMapping){
												var testcaseMapping = self.projectManager.getScriptReferenceOfRequirement(value.id);
												if(testcaseMapping)
													self.excelReport.data.push([i,9,testcaseMapping,"" ]);
												else
													self.excelReport.data.push([i,9,"","" ]);
											}
										});
										if (self.spreadSheet)
											self.spreadSheet.destructor();
										self.spreadSheet = webix.ui({
											id : "excelReport",
											view : "spreadsheet",
											data : self.excelReport,
											columnCount : withTestCaseMapping ? 9 : 8,
										    rowCount :  i
										});
										webix.toExcel("excelReport",
														{
															filename : self.selectionManager.selectedProject().name
														});
										self.spreadSheet.destructor();
										self.spreadSheet = null;
										$.unblockUI();
									}										
									else
										notificationService.showError('获取项目需求信息失败');
									$.unblockUI();
								}, function(error) {
									$.unblockUI();
									notificationService.showError('获取项目需求信息失败');
						});
					}
				}
				
				this.initManager = function() {
					webix.ready(function() {
						// fileManagerUtility.requirementConfigInit();
						webix.protoUI({
							name:"dataview_edit"
						}, webix.EditAbility, webix.ui.dataview);

								webix.ui({
											container : "requirement_div",
											id:"req_accord",
											multi : true,
											view : "accordion",	
											minHeight : 800,
											cols : [
													{
														view : "filemanager",
														id : "req_fm",
														minHeight : 800,
														minWidth : 800,
														collapsed:false,
														on : {
															"onViewInit" : function(name,config) {
																if (name === 'search') {
																	config.placeholder = "查找ID/测试用例ID/名称";
																} else if (name == "table") {
																	var columns = config.columns;
																	columns.splice(3,1);
																	columns.splice(1,1);
																	for (var i = 0; i < columns.length; i++)
																		columns[i].header = {
																			text : columns[i].header,
																			css : {"text-align" : "left"}
																		};
																	var descriptionColumn = {
																		id : "description",
																		header : {
																			text : "描述",
																			css : {"text-align" : "left"}
																		},
																		fillspace : 6,
																		sort : "string",
																		template : function(obj,common) {
																			if (obj.description == undefined || obj.description == null)
																				return "";
																			return obj.description;
																		}
																	};
																	var idColumn = {
																		id : "id",
																		header : {
																			text : "ID",
																			css : {"text-align" : "left"}
																		},
																		fillspace : 1,
																		sort : "int",
																		template : function(obj,common) {
																			if (obj.id == undefined || obj.id == null)
																				return "";
																			return obj.id;
																		}
																	};
																	var customizedIdColumn = {
																			id : "customizedId",
																			header : {
																				text : "测试用例ID",
																				css : {"text-align" : "left"}
																			},
																			fillspace : 1,
																			sort : "string",
																			template : function(obj,common) {
																				if (obj.customizedId == undefined || obj.customizedId == null)
																					return "";
																				return obj.customizedId;
																			}
																		};
																	var coverageColumn = {
																			id : "coverage",
																			header : {
																				text : "覆盖情况",
																				css : {"text-align" : "left"}
																			},
																			fillspace : 1,
																			sort : "string",
																			template : function(obj,common) {
																				if (obj.coverage == undefined || obj.coverage == null) // obj.type != 'folder'
																					return "";
																				if (obj.dataType == 'requirement'&&obj.coverage == "0.00%")
																						return "未覆盖";
																				if (obj.dataType == 'requirement'&&obj.coverage == "100.00%")
																						return "已覆盖";
																				return obj.coverage;
																			}
																		};
																	columns.splice(1,0,customizedIdColumn);
																	columns.splice(2,0,coverageColumn);
																	columns.splice(3,0,descriptionColumn);
																	columns.splice(0,0,idColumn);
																}																
																if (name == "table" || name == "files")
																	config.select = true;																
																if (name == "table" || name == "tree" || name == "files")
																	config.drag = false;
															},

															"onSubViewCreate" : function(view, item) {
																view.parse(item.outlets);
																view.config.id = "test";
															},

															"onBeforeFileUpload" : function(config) {
																if(config.type != 'xlsx' && config.type != 'xls'){
																	notificationService.showWarn('请上传excel文件！');
																	return false;
																}
																
																if(config.size > 10485760){
																	notificationService.showWarn('上传文件应该小于10MB！');
																	return false;
																}
																
																excelReader.getData(self.selectionManager
																		.selectedProject().id, config.file, self.syncRequirement);
																return false;
															},
															"onBeforeAdd" : function(id, item) {
																return true;
															},
															"onBeforeCreateFolder" : function(parentId) {
																if (parentId === fileManagerUtility.root)
																	parentId = "";
																self.createRequirementGroup(parentId);
																$$("req_fm").getMenu().hide();
																return false;
															},
															"onBeforeDeleteFile" : function(id) {
																var item = $$("req_fm").getItem(id);
																item.id = id;
																/*																
																if (item.type === "folder" && $$("req_fm").getFirstChildId(item.id) != null)
																	notificationService.showError('需求用例组不为空，不允许删除！');
																*/
																self.selectedItem = item;
																var data = self.projectManager.getScriptReferenceOfRequirement(item.id);
																if(data.length === 0)
																	$('#deleteRequirementModal').modal('show');
																else
																	$('#deleteRequirementWithMappingModal').modal('show');
																$$("req_fm").getMenu().hide();
																return false;
															},
															"onBeforeMarkCopy" : function(id) {
																var item = $$("req_fm").getItem(id);
																self.copyOrCut = true;
																self.sourceId = id;
																return true;
															},
															"onBeforeMarkCut" : function(id) {
																var item = $$("req_fm").getItem(id);																
																self.copyOrCut = false;
																self.sourceId = id;
																return true;
															},
															"onBeforePasteFile" : function(targetId) {
																if (self.sourceId == "") {
																	$$("req_fm").getMenu().hide();
																	return false;
																}
																var candidateTargetId = targetId;
																while (candidateTargetId != fileManagerUtility.root && self.sourceId != candidateTargetId)
																	candidateTargetId = $$("req_fm").getParentId(candidateTargetId);

																if (self.sourceId == candidateTargetId) {
																	$$("req_fm").getMenu().hide();
																	return false;
																}

																if (targetId === fileManagerUtility.root)
																	targetId = 0;
																self.targetId = targetId;																
																self.moveRequirement(self.sourceId, self.targetId, self.copyOrCut);
																$$("req_fm").getMenu().hide();
																return false;
															},
															"onHistoryChange" : function(path, ids,cursor) {
																if (self.initFinish) {
																	self.projectManager.currentRequirementPath = path;
																	self.projectManager.currentRequirementOpenFolders = $$("req_fm").getPath();
																}
																return true;
															},

															"onAfterLoad" : function() {
																$$("req_fm").setPath(self.projectManager.currentRequirementPath);
																self.initFinish = true;
															},

															"onAfterShowTree" : function() {
																$$("req_fm").setPath(self.projectManager.currentRequirementPath);
																self.initFinish = true;
															},
															"onBeforeEditFile": function(id){
																var item = $$("req_fm").getItem(id);																
																if (item.type === "folder" && item.id === fileManagerUtility.root)
																	return false;
																
																self.selectedItem = item;
																$$('requirementForm').setValues(
																		{
																			id : item.id,
																			customizedId: item.customizedId,
																			projectId : self.selectionManager.selectedProject().id,
																			parentId : item.$parent,
																			description : item.description,
																			title : item.value,
																			comment: item.comment,
																			leaf: item.leaf, // TODO
																			type : item.dataType
																		}
																);
																//if(item.dataType == self.projectManager.RequirementGroupMode)
																if(item.type === "folder")	
																	$$("req_type").hide();
																else
																	$$("req_type").show();
																$$('req_form').expand();																
																$$("req_fm").getMenu().hide();
																self.initRequirementCustomizedFieldValueControl(item.customizedFields);
																return false;
															},
															"onItemSelect" : function(id){
																var item = $$("req_fm").getItem(id);
																if (item.type === "folder" && item.id === fileManagerUtility.root)
																	return false;																
																self.selectedItem = item;
																$$('requirementForm').setValues(
																		{
																			id : item.id,
																			customizedId: item.customizedId,
																			projectId : self.selectionManager.selectedProject().id,
																			parentId : item.$parent,
																			description : item.description,
																			title : item.value,
																			comment: item.comment,
																			leaf: item.leaf, // TODO
																			type : item.dataType
																		}
																);
																self.initRequirementCustomizedFieldValueControl(item.customizedFields);
																if(item.type === "folder"){
																	$$("req_type").hide();										
																	$$("req_script_form").hide();
																}
																else{
																	$$("req_type").show();										
																	$$("req_script_form").show();
																	var data = self.projectManager.getScriptReferenceOfRequirement(item.id);
																	$$("req_script").clearAll();
																	$$("req_script").parse(data);
																	$$("req_script").refresh();																	
																}
																return true;
															},
															"onItemClick" : function(id, e, node) {
																if(id === 'configCustomizedField'){
																	$('#requirementCustomizedFieldModal').modal({ show: true });
																	$$("req_fm").getMenu().hide();
																}
																if (id === "refresh"){
																	self.calculateRequirementCoverage();
																	$$("req_fm").getMenu().hide();
																}
																if (id === "createRequirement") {
																	var parent = $$("req_fm").getCurrentFolder();
																	if (parent === fileManagerUtility.root)
																		parent = "";
																	self.createRequirement(parent);
																	$$("req_fm").getMenu().hide();
																}																
																if (id === "createCheckpoint") {
																	var parent = $$("req_fm").getCurrentFolder();
																	if (parent === fileManagerUtility.root)
																		parent = "";
																	self.createCheckPoint(parent);
																	$$("req_fm").getMenu().hide();
																}
																if (id === "export") {
																	var id = $$("req_fm").getActive();
																	var item = $$("req_fm").getItem(id);
																	var nodes = [];
																	if (item.type === "file" || item.type === "text") {
																		var parentId = $$("req_fm").getCurrentFolder();
																		var pathNames = $$("req_fm").getPathNames(parentId).map(
																						function(elem) {
																							return elem.value;
																						}).join("/");
																		var node = {
																			id : id,
																			name : item.value,
																			path : pathNames + "/",
																			type : item.dataType,
																			parentId: item.$parent
																		};
																		nodes.push(node);
																	} else if (item.type === "folder") {
																		if (item.id != fileManagerUtility.root){
																			var parentId = $$("req_fm").getCurrentFolder();
																			var pathNames = $$("req_fm").getPathNames(parentId).map(
																							function(elem) {
																								return elem.value;
																							}).join("/");
																			var node = {
																				id : id,
																				name : item.value,
																				path : pathNames + "/",
																				type : item.dataType,
																				parentId: item.$parent
																			};
																			nodes.push(node);
																		}																
																		$$("req_fm").data.eachSubItem(id,
																						function(obj) {
																							var parentId = $$("req_fm").getParentId(obj.id);
																							var pathNames = $$("req_fm").getPathNames(parentId).map(
																											function(elem) {
																												return elem.value;
																											}).join("/");
																							var node = {
																								id : obj.id,
																								name : obj.value,
																								path : pathNames + "/",
																								type : obj.dataType,
																								parentId: obj.$parent
																							};
																							nodes.push(node);
																						});
																	}
																	self.exportNodes = nodes;
																	$$("req_fm").getMenu().hide();
																	$('#exportRequirementConfigModal').modal('show');
																}
																return true;
															}
														},
														
														ready : function() {
															var actions = this.getMenu();
															// actions.remove("upload");
															
															var createItem = actions.getItem("create");
															createItem.value = "新建需求组";															
															var uploadItem = actions.getItem("upload");
															uploadItem.value = "导入";
															if (!self.systemConfig.getConfig("utpclient.testcase_mgr.import")) {
																actions.remove("upload");
															}
															actions.add(
																			{
																				id : "createRequirement",
																				icon : "fm-file",
																				value : "新建需求"
																			}, 5);
															// 关闭新建检查点,开启时打开注释即可
															// actions.add(
															// 				{
															// 					id : "createCheckpoint",
															// 					icon : "fm-file-text",
															// 					value : "新建检查点"
															// 				}, 6);
															actions.add({$template : "Separator"}, 9);
															actions.add({		id : "export",
																				icon : "webix_fmanager_icon fa-download",
																				value : "导出"
																			}, 13);
															actions.add(
																			{
																				id : "refresh",
																				icon : "webix_fmanager_icon fa-refresh",
																				value : "刷新"
																			}, 14);
															if (self.systemConfig.getConfig("utpclient.testcase_mgr.customize_field")) {
																actions.add(
																	{
																		id: "configCustomizedField",
																		icon: "webix_fmanager_icon fa-tag",
																		value: "自定义字段"
																	}, 15);
															}
															self.treeAdjust();
															$$('req_form').collapse();
														},
														menuFilter : function(obj) {
															var actions = $$("req_fm").getMenu();															
															var dataId = actions.getContext().id;
															if (dataId === undefined) {
																if (obj.id === "export")
																	return false;
																var parent = $$("req_fm").getCurrentFolder();
																if (parent === fileManagerUtility.root) {
																	if (obj.id === "createRequirement"
																			|| obj.id === "createCheckpoint"
																			|| obj.id === "remove"
																			|| obj.id === "edit"
																			|| obj.id === "cut"
																			|| obj.id === "copy")
																		return false;
																	if ((self.sourceType == "file" || self.sourceType == "text")
																			&& obj.id === "paste")
																		return false;
																}
															} else {
																var item = $$("req_fm").getItem(dataId);																
																if (item.type === "file") {
																	if (obj.id === "createRequirement"
																			|| obj.id === "createCheckpoint"
																			|| obj.id === "create")
																		return false;
																}
																if (item.type === "text") {
																	if (obj.id === "createRequirement"
																			|| obj.id === "createCheckpoint"
																			|| obj.id === "create")
																		return false;
																}
																if (dataId === fileManagerUtility.root) {
																	if (obj.id === "createRequirement"
																			|| obj.id === "createCheckpoint"
																			|| obj.id === "remove"
																			|| obj.id === "edit"
																			|| obj.id === "cut"
																			|| obj.id === "copy")
																		return false;
																	// not allowed requirement and checkpoint under root directly
																	if ((self.sourceType == "file" || self.sourceType == "text")
																			&& obj.id === "paste")
																		return false;
																}
															}
															return true;
														}
													}, {
														view : "resizer"
													}, {
														header : "详细信息",
														id : "req_form",
														body:{
															view: "layout",
															rows: [
																{
																	view:"form",
																	id : "requirementForm",
																	scroll:false, 
																	autoheight:true,
																	autowidth:true, 
																	elements:[
																		{ view:"text", id:"req_title", name:"title", value:'', label:"标题" },
																		{ view:"text", id:"req_customizedId", name:"customizedId", value:'', label:"ID" },
																		{ view:"textarea", id:"req_description", name:"description", height:80, label:"描述"},
																		{ view:"textarea", id:"req_comment", name:"comment", height:80, label:"备注"},
																		// 关闭检查点,需要时把后面添加到下列options即可 { value:"检查点", id:self.projectManager.CheckPointMode }
																		{ view:"radio", id:"req_type", name:"type", label:"类型", options:[{ value:"需求", id: self.projectManager.RequirementMode }] },
																		{
																			view:"datatable",
																			id:"req_customizedField",
																			label:"自定义字段",
																			tooltip:function(obj){
																				return "<span style='display:inline-block;max-width:300px;word-wrap:break-word;white-space:normal;'>" + obj.value + "</span>";
																			},
																			columns:[
																				{ id:"name", header:"自定义字段名", css:"rank", width:150},
																				{ id:"value", editor:"text", header:"值（双击编辑）", width:300},
																			],
																			on:{
																				onCollectValues:function(id, req){
																					if (req.values[0].value == "")
																						req.values[0].value = "Select something";
																				}
																			},
																			editable:true,
																			editaction:"dblclick",
																			autoheight:true,
																			autowidth:true,

																		},
																		{ view:"button", id:"req_update_button", value: "更新", width:100, align:"right", css:"webix_primary",
																			click:function(){
																				values = JSON.parse(JSON.stringify($$('requirementForm').getValues(), null, 2));
																				if(!values.id || !values.projectId){
																					notificationService.showError('请选择元素后编辑');
																					return;
																				}
																					
																				var form = this.getParentView();
																				if (form.validate()){
																					if (values.parentId === fileManagerUtility.root)
																						values.parentId = 0;																			
																					self.updateRequirement(values);
																				}
																				else
																					notificationService.showError('标题不能为空');
																			}
																		}
																	],
																	rules:{
																		"title":webix.rules.isNotEmpty
																	}
																},
																{
																	view:"layout",
																	type:"line",																	
																	id : "req_script_form",
																	rows:[
																		{ template:"<span style='text-align:center;'>关联的测试用例</span>", 
																		  type:"header"},																		
																		{
																			view:"list",
																			tooltip:function(obj){
																				return "<span style='display:inline-block;max-width:300;word-wrap:break-word;white-space:normal;'>" + obj.value + "</span>";
																		    },
																			id : "req_script",
																			data:[]
																		}]
																}
															]
														},																																						
														width : 500,
														minWidth : 500,
														minHeight : 600,
														scroll : true
													} ]
										});
								
								self.projectManager.setRequirementManager($$("req_fm"));
								$$("requirementForm").elements["title"].attachEvent("onChange", function(newv, oldv){
								//	webix.message("Value changed from: "+oldv+" to: "+newv);
								});
								
								$$("req_fm").$$("files").define({
									tooltip : function(obj) {
										if(obj.coverage) // obj.type == 'folder'
											return obj.value + ' ' + obj.coverage;
										return obj.value;
									}
								});
								
								$$("req_fm").$$("table").define({
									tooltip : function(obj, common) {
										var column = common.column.id;
										if (column == "type") {
											if (obj[column] == 'folder')
												return "需求组";
											if (obj[column] == 'text')
												return "检查点";
											if (obj[column] == 'file')
												return "需求";
										}
										else if(column == "location"){
											var parents = $$("req_fm").getPathNames(obj.id);
											var path = [];
											parents.slice(1, parents.length - 1).forEach(function(parent){
								    			 path.push(parent.value);
								    		 })	
											return path.join("/");
										}
										else if(column == 'coverage'){
											if(obj['coverage']) // column.type == 'folder'
												return obj['coverage'];
											else
												return '';
										}
										if(obj[column] == null || obj[column] == undefined)
											return '';
										return obj[column];
									}
								});

								$$("req_fm").$$("tree").define({
									tooltip : function(obj) {
										if(obj.coverage) // obj.type == 'folder' 
											return obj.value + ' ' + obj.coverage;
										return obj.value;
									}									
								});

								$$("req_fm").$$("tree").attachEvent("onItemClick", function(id, e, node){
									var item = $$("req_fm").getItem(id);									
									if (item.type === "folder" && item.id === fileManagerUtility.root)
										return true;																
									self.selectedItem = item;
									$$('requirementForm').setValues(
											{
												id : item.id,
												customizedId:item.customizedId,
												projectId : self.selectionManager.selectedProject().id,
												parentId : item.$parent,
												description : item.description,
												title : item.value,
												comment: item.comment,
												leaf: item.leaf,
												type : item.dataType
											}
									);
									if(item.type === "folder"){
										$$("req_type").hide();										
										$$("req_script_form").hide();
									}
									else{										
										$$("req_type").show();										
										$$("req_script_form").show();
										var data = self.projectManager.getScriptReferenceOfRequirement(item.id);
										$$("req_script").clearAll();
										$$("req_script").parse(data);
										$$("req_script").refresh();
									}
									self.initRequirementCustomizedFieldValueControl(item.customizedFields);
									return true;
								});
								
								$$("req_fm").getSearchData = function(id, value) {
									var found = [];
									this.data.each(function(obj) {
														var text = this.config.templateName(obj);
														var id = obj.id + '';														
														if (text.toLowerCase().indexOf(value.toLowerCase()) >= 0 || id.toLowerCase().indexOf(value.toLowerCase()) >= 0)
															found.push(webix.copy(obj));
														if(obj.customizedId && obj.customizedId.toLowerCase().indexOf(value.toLowerCase()) >= 0)
															found.push(webix.copy(obj));
													}, this, true, id);
									return found;
								}
							});
				}

				this.reqContainerAdjust = function(){
					var	parent = document.getElementById("requirementinfo").parentNode;				
					$$("req_accord").define("width", parent.clientWidth);
					$$("req_accord").resize();
					$$("req_fm").define("height", "800");
					$$("req_fm").getMenu().refresh();
					$$("req_fm").refresh();
					$$("req_fm").resize();
				};
				
				this.initRequirementCustomizedFieldValueControl = function(customizedFields){
					var candidateCustomizedFieldValue = self.initRequirementCustomizedFieldValue(customizedFields);
					if(candidateCustomizedFieldValue.length > 0){
						$$("req_customizedField").show();
						$$("req_customizedField").clearAll();
						$$("req_customizedField").parse(candidateCustomizedFieldValue);
					}
				};

				this.initRequirementCustomizedFieldValue = function(requirementCustomizedFieldValue){
					self.getCustomizedFields();
					var candidateValue = []
					try{
						candidateValue = JSON.parse(requirementCustomizedFieldValue)
					}
					catch(e){
						candidateValue = []
					}
					if(self.customizedFields){
						for(var i = 0; i < self.customizedFields.length; i++){
							var exist = false;
							for(var j = 0; j < candidateValue.length; j++){
								if(self.customizedFields[i] === candidateValue[j].name){
									exist = true;
									break;
								}
							}
							if(!exist)
								candidateValue.push({name: self.customizedFields[i], value:''})
						}
					}
					return candidateValue;
				};

				this.updateRequirementCustomizedFieldsSuccessFunction = function(data){			
					if(data && data.status === 1){
						$('#requirementCustomizedFieldModal').modal('hide');
						self.projectManager.setProjectRequirementCustomizedFieldMapping(selectionManager.selectedProject().id, JSON.stringify(self.updatedCustomizedFields));
						var candidateCustomizedFields = $$("req_customizedField").serialize();
						self.initRequirementCustomizedFieldValueControl(candidateCustomizedFields);
						notificationService.showSuccess('更新自定义字段协议成功');
					}
					else
						self.updateRequirementCustomizedFieldsErrorFunction();
				};
				
				this.updateRequirementCustomizedFieldsErrorFunction = function(){
					notificationService.showError('更新自定义字段协议失败');
				};
				
				this.updateRequirementCustomizedFields = function(){
					var customizedFields = []
					for (var i = 0; i < self.updatedCustomizedFields.length; i++)
							customizedFields.push(self.updatedCustomizedFields[i]);
					var customizedFieldsConfig = JSON.stringify(customizedFields);
					utpService.updateRequirementCustomizedFields(selectionManager.selectedProject().id, customizedFieldsConfig, self.updateRequirementCustomizedFieldsSuccessFunction, self.updateRequirementCustomizedFieldsErrorFunction);
				};

				this.getCustomizedFields = function(){
					var customizedFields = self.projectManager.getProjectRequirementCustomizedFieldMapping(selectionManager.selectedProject().id);
					try{
						if(customizedFields === '')
							customizedFields = [];
						else
							customizedFields = JSON.parse(customizedFields);
						
					}
					catch(e){
						customizedFields = [];
					}
					self.customizedFields = customizedFields;
					// self.customizedFields = ['111','222','333']; // TODO
				};

				this.customizedFields = [];
				this.updatedCustomizedFields = [];
				this.customizedFieldContainer = ko.observable();
				this.customizedFieldChanged = function(fields){
					self.updatedCustomizedFields = fields;
				};
				this.setCustomizedField = function(customizedFields){
					system.acquire("app/viewmodels/customizedfield").then(function (customizedField) {
						v = "app/views/customizedfield.html";
						vm = new customizedField(self.customizedFieldChanged);
						self.customizedFieldContainer({ model:vm, activationData: {pageId: 'Requuirement', customizedFields} });
					});
				};

				this.activate = function(data) {
					self.reload = true;
					if (data != null && data.reload != null)
						self.reload = data.reload;					
					self.enableRequirementSubScription = app.on('enableRequirement:event').then(function() {
						fileManagerUtility.requirementConfigInit();
						self.calculateRequirementCoverage();
						self.reqContainerAdjust();
						$$("req_fm").refreshCursor();
					});					
				};

				this.attached = function(view, parent) {
					$('#exportRequirementConfigModal').on('shown.bs.modal', function(e) {
						self.selectRequirementExportType('0');
					});

					$('#requirementCustomizedFieldModal').on('shown.bs.modal', function(e) {
						self.getCustomizedFields();
						self.setCustomizedField(self.customizedFields);
					}); 

					self.initManager();
					self.calculateRequirementCoverage();
					self.reqContainerAdjust();
				};

				this.detached = function(){
					self.enableRequirementSubScription.off();			
				};
			};
			return new RequirementViewModel();
		});