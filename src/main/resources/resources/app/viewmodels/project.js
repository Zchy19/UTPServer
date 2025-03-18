define([ 'knockout', 'jquery', 'bootstrap', 'komapping', 'services/viewManager', 'services/systemConfig', 'services/projectManager',	'services/loginManager', 'services/selectionManager',
	'services/utpService', 'services/ursService','services/protocolService','services/cmdConvertService','services/notificationService', 'services/notificationService', 'validator', 'bootstrapSwitch'],
		function(ko, $, bootstrap, komapping, viewManager,systemConfig, projectManager, loginManager, selectionManager, utpService, ursService,protocolService, cmdConvertService, notificationService, notificationService, validator, bootstrapSwitch) {

			function ProjectViewModel() {
				var self = this;				
				
				this.selectionManager = selectionManager;
				this.projectManager = projectManager;
				this.loginManager = loginManager;
				this.viewManager = viewManager;
				this.systemConfig = systemConfig;
				this.utpService = utpService;
				this.ursService = ursService;
				this.inEdit = ko.observable(false);
				this.currentProject = ko.observable('');				
				this.projectTemplates = [];
				this.candidateProjectName = ko.observable('');
				this.projectName = ko.observable('');
				this.candidateProjectDescription = ko.observable('');
				this.projectDescription = ko.observable('');
				this.projectAutoIntoUser=ko.observable('');
				this.projectAutoIntoUsers=ko.observableArray([]);
				this.projectTargetObjectDescription = ko.observable('');
				this.isProjectTemplate = ko.observable(false);
				this.fromEmpty = ko.observable(true);
				// this.isDisabled = ko.observable(false);
				
				// this.readWriteAccessPermission=function(){
				// 	//获取feature
				// 	var isReadonly=self.systemConfig.getConfig('utpclient.project.readonlymode')
				// 	if(isReadonly){
				// 		self.isDisabled(true);
				// 	}
				// }

				//获取组织下所有账号
				this.getOrgUsers = function(){
					self.ursService.getUserByOrganization(loginManager.getOrganization(), function(data){
						if(data != null && data.result){
							self.projectAutoIntoUsers(data.users);
						}
						else
							notificationService.showError('获取组织用户失败');
					}, function(error){
						notificationService.showError('获取组织用户失败');
					});
				}
				this.systemTemplates = komapping.fromJS([], {
					key : function(item) {
						return ko.utils.unwrapObservable(item.id);
					}
				});
				this.gotoWorkbench = function(){
					self.viewManager.activePage('app/viewmodels/workbench');
					self.projectManager.backupScripts = null;
				};
				
				this.loadSelectedProjectFail = function(){
					notificationService.showError('加载项目失败');	
				};
				
				this.addTemplateToMyProject = function(item){
					var projectInfo = {
						sourceProjectId : item.id,
						targetOrgId : parseInt(loginManager.getOrganization()),
						sourceOrgId : item.organizationId,
						name : item.name,
						description : item.description
					};
					self.utpService.copyProjectWithInfo(projectInfo, self.createProjectSuccessFunction, self.createProjectErrorFunction);
				}
				
				this.getTemplate = function(){
					if(loginManager.getTestAccountOrgId() != null){
						self.systemTemplates([]);
						self.utpService.getProjectTemplates(loginManager.getTestAccountOrgId(), self.projectManager.systemTemplate,
								function(data){
									if(data != null && data.status === 1 && data.result)
										komapping.fromJS(data.result, {}, self.systemTemplates);
									else
										notificationService.showError('获取系统项目模板失败');
								}, 
								function(error){
									notificationService.showError('获取系统项目模板失败');
								});
					}
				}
				
				//
				this.getProjectTemplates = function(){					
					self.projectTemplates = [];		
					
					var getCustomerTemplate = new Promise(function(resolve, reject) {
						self.utpService.getProjectTemplates(loginManager.getOrganization(), self.projectManager.customerTemplate,
								function(data){
									if(data && data.status === 1)
										resolve(data.result);
									else
										reject('获取自定义项目模板失败');
								}, 
								function(error){
									reject('获取自定义项目模板失败');
								});
					});
					
					// 2. get angent config
					var getSystemTemplate = new Promise(function(resolve, reject) {				
						if(loginManager.getTestAccountOrgId() != null){
							self.systemTemplates([]);
							self.utpService.getProjectTemplates(loginManager.getTestAccountOrgId(), self.projectManager.systemTemplate,
									function(data){
										if(data && data.status === 1)
											resolve(data.result);
										else
											reject('获取系统项目模板失败');
									}, 
									function(error){
										reject('获取系统项目模板失败');
									});
						}
						else
							resolve([]);
					});
					
					Promise.all([getCustomerTemplate, getSystemTemplate]).then(
		                    function(results) {
		                    	if(results != null && results != undefined){
		                    		if(results[0] != null && results[0] != undefined){
		                    			for(var i=0; i<results[0].length;i++){
											self.projectTemplates.push(results[0][i]);
										}
		                    		}
		                    		if(results[1] != null && results[1] != undefined){
		                    			komapping.fromJS(results[1], {}, self.systemTemplates);
		                    			for(var i=0; i<results[1].length;i++){
											self.projectTemplates.push(results[1][i]);
										}
		                    		}
		                    		self.initProjectTemplateList();
		                    	}
		                    	else{		                    		
		                    		notificationService.showWarn('项目模板不存在！');
		                    		$('#startFromEmpty').bootstrapSwitch("state", true);
		                    	}
		                    },
		                    function(errors) {
		                    	notificationService.showError('获取项目模板失败！');
		                    	$('#startFromEmpty').bootstrapSwitch("state", true);
		                    });
					
				}
				
				this.getOrgProject = function(){
					self.projectManager.getProjects(loginManager.getOrganization(), 
							function() { notificationService.showSuccess('加载项目成功');}, 
							function(){ notificationService.showError('加载项目失败'); });
				}
				
				// view				
				this.loadSelectedProject = function(item) {
					self.selectionManager.selectedProject(item);
					$.cookie("lastSelectedProject", self.selectionManager.selectedProject().id);					
					self.projectManager.loadProjectSuccessFunction = self.gotoWorkbench;
					self.projectManager.loadProjectErrorFunction = self.loadSelectedProjectFail;
					self.projectManager.loadProjectConfig();
				};
				
				// create				
				this.createProjectSuccessFunction = function(data){					
					if(data && data.status === 1 && data.result != null){
						self.projectManager.projects.unshift(data.result);
						//对selectedPorts进行遍历
						if (self.optionCreateProject() == "基于向导创建项目"&& self.step() == 2) {
							let selectedPorts = self.selectedPorts();
							//创建agentConfigs数组
							let agentConfigs = [];
							for (let i = 0; i < selectedPorts.length; i++) {
								let port = selectedPorts[i];
								let agentConfig = {
									antbotName: port.portName,
									antbotType: port.toolType.name,
									id: 0,
									projectId: data.result.id,
									protocolSignalId: port.protocolData.id,
									recordsetId: "",
									recordsetName: ""
								};
								agentConfigs.push(komapping.toJS(agentConfig));

							}
							utpService.createAgentConfigs(agentConfigs, self.addAgentConfigSuccessFunction, self.addAgentConfigErrorFunction);
						}
						notificationService.showSuccess('创建项目成功');
					}else if(data && data.status === 0 && data.result != null){
						self.createProjectErrorFunction(data.result.errorMessages);
					}else{
						self.createProjectErrorFunction();
					}
				};
				this.createProjectErrorFunction = function(errorMessages){
					if (errorMessages === "OVER_MAX_PROJECT_NUM") {
						notificationService.showError('创建项目失败，项目数量超过最大限制,请安装对应的许可文件!');
					}else{
						notificationService.showError('创建项目失败');
					}
				};
				
				this.submitProjectFromTemplate = function(item){				
					var projectInfo = {
						sourceProjectId : item.id,
						targetOrgId : parseInt(loginManager.getOrganization()),
						sourceOrgId : item.organizationId,
						name : self.candidateProjectName(),
						description : self.candidateProjectDescription()
						
					};
					self.utpService.copyProjectWithInfo(projectInfo, self.createProjectSuccessFunction, self.createProjectErrorFunction);					
				};
				
				this.canCreateProject = ko.computed(function() {
					return (self.projectName() != '' && self.projectTargetObjectDescription() != '' && self.projectDescription() != '' );
				});

				//新建项目和机器人模块
				
				this.getProtocolTypeData = function(protocolType){
					utpService.getBigDataByType(null, protocolType, self.getProtocolTypesDataSuccessFunction, self.getProtocolTypesDataErrorFunction);
				};

				this.allProtocolType = ko.observableArray([]); //数据类型数组
				this.selectedProtocolType = ko.observable(); // 选中的数据类型

				// 类型变化,将选择的协议重置
				this.selectedProtocolType.subscribe(function(newValue) {
					// 每当第一个下拉框的值变化时，重置第二个下拉框的值
					self.availableConfig(); // 重置第二个下拉框的选中值
				});

				//筛选数据,类型一致
				this.filteredAvailableConfigs = ko.observableArray([1]);
				this.updateAvailableConfigs = function() {
					var selectedType = self.selectedProtocolType();
					if(selectedType == undefined || selectedType == null){
						return self.filteredAvailableConfigs(self.availableConfigs());
					}else if (selectedType) {
						// self.filteredAvailableConfigs.removeAll();
						var filteredConfigs = ko.utils.arrayFilter(self.availableConfigs(), function(item) {
							// if(item.protocolType == null){
							// 	item.protocolType = "未知类型";
							// }
							return item.protocolType === selectedType;
						});
						self.filteredAvailableConfigs(filteredConfigs);
					}else{
						self.filteredAvailableConfigs.removeAll();
						self.filteredAvailableConfigs([1]);
					}
				};

				this.getProtocolTypesDataSuccessFunction = function(data){
					if(data && data.status === 1){
						var availableConfigs = data.result;
						self.availableConfigs.removeAll();
						self.allProtocolType.removeAll();
						for (var i = 0; i < availableConfigs.length; i++){
							self.availableConfigs.push(availableConfigs[i]);
							if (!self.allProtocolType().includes(availableConfigs[i].protocolType) && availableConfigs[i].protocolType!= null) {
								self.allProtocolType.push(availableConfigs[i].protocolType);
							}
						}
						self.filteredAvailableConfigs(self.availableConfigs()); // 初始显示所有配置项
					}
					else
						self.getProtocolTypesDataErrorFunction();
				};
				this.getProtocolTypesDataErrorFunction = function(){
					notificationService.showError('获取协议类型失败');
				};
				//定义当前的模态框是那种配置类型
				this.currentConfigType = ko.observable();
				//显示配置数据模态框
				this.showConfigModal = function(port) {
					self.selectedConfig(port);
					//根据不同的配置类型，显示不同的配置界面
					switch (port.toolType.extraDataConfig) {
						case 3:
							//当前显示的是那种配置类型
							self.currentConfigType('SignalProtocol')
							self.getProtocolTypeData("SignalProtocol")
							break;
						case 2:
							//当前显示的是那种配置类型
							self.currentConfigType('GenericBusFrame')
							self.getProtocolTypeData("GenericBusFrame")
							break;
						case 0:
							//当前显示的是那种配置类型
							notificationService.showWarn('当前类型暂不支持配置协议');
							return;
					}
					$('#configModal').modal('show');
				};
				this.availableConfigs = ko.observableArray([]);
				this.availableConfig = ko.observable();
				this.selectedConfig = ko.observable();
				this.saveConfig = function() {
					var selectedPort = ko.utils.arrayFirst(self.selectedPorts(), function(port) {
						return port.id === self.selectedConfig().id;
					});
					if (selectedPort) {
						const index = self.selectedPorts.indexOf(selectedPort);
						selectedPort.protocolData = self.availableConfig();
						//将selectedPort替换self.selectedPorts()中的数据
						if (index !== -1) {
							//移除原来的数据
							self.selectedPorts.splice(index, 1);
							//添加新数据
							self.selectedPorts.splice(index, 0, selectedPort);
						}
					}
					$('#configModal').modal('hide');
				};
				//跳转协议界面
				this.gotoProtocolOrsignalProtocol = function () {
					if (self.currentConfigType() === 'SignalProtocol') {
						var enable = self.systemConfig.getEnableByFeatureName('utpclient.signal_mgr')
						if (!enable) {
							self.permissionErrorFunction();
							return;
						}
						$('#signalProtocolConfigModal').modal('show')
					}
					else if(self.currentConfigType() === 'GenericBusFrame'){
						var enable = self.systemConfig.getEnableByFeatureName('utpclient.proto_mgr')
						if (!enable) {
							self.permissionErrorFunction();
							return;
						}
						$('#protocolConfigModal').modal('show')
					}
				}
				//重新刷新数据
				this.refreshConfig = function () {
					if (self.currentConfigType() === 'SignalProtocol') {
						self.getProtocolTypeData("SignalProtocol")
					}
					else if(self.currentConfigType() === 'GenericBusFrame'){
						self.getProtocolTypeData("GenericBusFrame")
					}
				}
				
			
				this.step=ko.observable(1);
				this.showPreviousStep=function(){
					if(self.step()!=1){
						self.step(self.step()-1);
					}
				}
				this.showNextStep=function(){
					if(self.step()==1){
						//判断projectName是否为空
						if(self.projectName()==''){
							notificationService.showError('项目名称不能为空！');
							return;
						}
					}
					self.step(self.step()+1);
					self.projectTreeData();
				}
				this.optionCreateProject = ko.observable('创建空白项目');
				this.selectedPorts = ko.observableArray([]);
				this.addSelectedPorts = function() {
					// 添加逻辑
					if(self.projectTreeItem){
						var selectedPortTemp = {
							id: self.selectedPorts().length > 0 ? self.selectedPorts()[self.selectedPorts().length - 1].id + 1 : 1,
							portType: self.projectTreeItem.value,
							portName: "",
							protocolData: "",
							toolType: self.projectTreeItem.toolType,
							isButtonDisabled:ko.observable(true)
						};
						//判断self.projectTreeItem是否有tooltype属性
						if(!self.projectTreeItem.toolType){
							notificationService.showError('请选择详细的被测接口类型')
							return;
						}
						// if(self.projectTreeItem.toolType.extraDataConfig==0){
						// 	selectedPortTemp.isButtonDisabled=true;
						// }
						self.selectedPorts.push(selectedPortTemp);
					}
					else
						notificationService.showWarn('请选择被测接口类型！');
				};
				this.selectedToolType = function (data) {
					// 判断self.selectedPorts是否有id相同的数据
					for (var i = 0; i < self.selectedPorts().length; i++) {
						if (self.selectedPorts()[i].id == data.id) {
							// //将data.toolType赋值给self.selectedPorts()[i].toolType
							// self.selectedPorts()[i].toolType = data.toolType;
							if (data.toolType.extraDataConfig == 0 && data.toolType.name == self.selectedPorts()[i].toolType.name) {
								self.selectedPorts()[i].isButtonDisabled(true)
							} else {
								self.selectedPorts()[i].isButtonDisabled(false);
							}
						}
					}
				};
				
				this.removeInterface = function(item) {
					self.selectedPorts.remove(item);
				};
				this.projectTree = null;
				this.projectTreeItem = null;

				//构造树状图
				this.projectTreeShow = function(data) {
					$('#projectTreeView').html('');
					self.projectTree = null;
					webix.ready(function(){
						self.projectTree = webix.ui({
							container: "projectTreeView",
							view: "tree",
							select: true,
							drag: true,
							id: "projectTree",
							scroll: "xy",
							data: data,
							dataType: "json",
							ready: function(){
								// 确保组件完全加载后再绑定事件
								this.attachEvent("onAfterSelect", function(id){
									self.projectTreeItem = self.projectTree.getItem(id);
								});
							}
						});
					});
				};

				this.antbotClassification= ko.observableArray([]);
				// 构造树状图需要的数据模型
				this.projectTreeData=function(){
					//获取tooltype
					self.antbotClassification.removeAll();
					var allAgentTypeList=cmdConvertService.agentCmdList;
					if(allAgentTypeList != null && allAgentTypeList != ""){
						var temp={};
						var isNull=false;
						for (var i=0;i<allAgentTypeList.length;i++){
							// self.antbotTypes.push(allAgentTypeList[i])									
							if((allAgentTypeList[i].classification == null || allAgentTypeList[i].classification == 'null' || allAgentTypeList[i].classification == "") && self.antbotClassification().findIndex(t => t.type === "未分类") == -1){
								isNull = true
							}
							else if(allAgentTypeList[i].classification != null && allAgentTypeList[i].classification != 'null' && allAgentTypeList[i].classification != "" && self.antbotClassification().findIndex(t => t.type === allAgentTypeList[i].classification) == -1) {				
								//获取分类值
								var classification1=allAgentTypeList[i].classification;
								//判断是否是多个分类
								if(classification1.indexOf(";")!=-1){
									var arr=classification1.split(';');
									for (var j=0;j<arr.length;j++){
										if(self.antbotClassification().findIndex(t => t.type === arr[j]) == -1){
										temp = {type: arr[j]}
										self.antbotClassification.push(temp);}
									}
								}else{
									temp = {
										type: allAgentTypeList[i].classification
									}
									self.antbotClassification.push(temp)
								}
							}											
						}
						if(isNull){
							var temp = {
									type: "未分类"
								}
							self.antbotClassification.push(temp)
						}		
					}

					//遍历antbotClassification,生成一级目录
					var data = [];
					for (var i=0;i<self.antbotClassification().length;i++){
						var temp = {
							id: i+1,
							value: self.antbotClassification()[i].type,
							open: false,
							data: []
						};
						data.push(temp);
					}
					//生成根目
					//遍历data,判断allAgentTypeList中的分类是否相同,如果相同就加入data.data
					for (var i=0;i<data.length;i++){
						for (var j=0;j<allAgentTypeList.length;j++){
							var classification=allAgentTypeList[j].classification;
								//判断是否是多个分类
								if(classification.indexOf(";")!=-1){
									var arr=classification.split(';');
									for (var k=0;k<arr.length;k++){
										if(data[i].value == arr[k]){
											//判断value值是否已有相同的
											var isExist=false;
											for (var m=0;m<data[i].data.length;m++){
												if(data[i].data[m].value == allAgentTypeList[j].interfaceType){
													isExist=true;
													data[i].data[m].toolType.push(allAgentTypeList[j]);
													break;
												}
											}
											if(!isExist){
												var temp = {
													id: i+1+"_"+j+1,
													value: allAgentTypeList[j].interfaceType,
													open: false,
													toolType: []
												};
												temp.toolType.push(allAgentTypeList[j]);
												data[i].data.push(temp);
											}
										
										}
									}
								}else{
									if(data[i].value ==classification){
										var isOneExist=false;
										for (var m=0;m<data[i].data.length;m++){
											if(data[i].data[m].value == allAgentTypeList[j].interfaceType){
												isOneExist=true;
												data[i].data[m].toolType.push(allAgentTypeList[j]);
												break;
											}
										}
										if(!isOneExist){
											var temp = {
												id: i+1+"_"+j+1,
												value: allAgentTypeList[j].interfaceType,
												open: false,
												toolType: []
											};
											temp.toolType.push(allAgentTypeList[j]);
											data[i].data.push(temp);
										}
									}
									if(data[i].value == "未分类" && (classification ==""|| classification == null )){
										var isNullExist=false;
										for (var m=0;m<data[i].data.length;m++){
											if(data[i].data[m].value == allAgentTypeList[j].interfaceType){
												isNullExist=true;
												data[i].data[m].toolType.push(allAgentTypeList[j]);
												break;
											}
										}
										if(!isNullExist){
											var temp = {
												id: i+1+"_"+(j+1),
												value: allAgentTypeList[j].interfaceType,
												open: false,
												toolType: allAgentTypeList[j]
											};
											data[i].data.push(temp);
										}
									}
								
								}
						}
					}
					self.projectTreeShow(data);
				}

				//优化后的代码,构造树状图需要的数据模型
				// this.antbotClassification = ko.observableArray([]);
				// this.projectTreeData = function() {
				// 	self.antbotClassification.removeAll();
				// 	const allAgentTypeList = cmdConvertService.agentCmdList;
				// 	const classificationSet = new Set();
				// 	const unclassifiedCount = allAgentTypeList.reduce((count, item) => {
				// 		const classification = item.classification;
				// 		if (!classification || classification === 'null' || classification === '') {
				// 			count++; // 计数未分类的项
				// 		} else {
				// 			classification.split(';').forEach(cls => classificationSet.add(cls.trim()));
				// 		}
				// 		return count;
				// 	}, 0);
				
				// 	if (unclassifiedCount > 0) {
				// 		self.antbotClassification.push({ type: "未分类" });
				// 	}
				// 	classificationSet.forEach(classification => {
				// 		self.antbotClassification.push({ type: classification });
				// 	});
				// 	// 构造树状图数据模型
				// 	const data = self.antbotClassification().map((item, index) => {
				// 		let items = [];
				// 		allAgentTypeList.forEach(agentType => {
				// 			const classification = agentType.classification;
				// 			if (classification === item.type || (classification && classification.split(';').includes(item.type))) {
				// 				items.push({
				// 					id: `_${index}_${allAgentTypeList.indexOf(agentType)}`,
				// 					value: agentType.interfaceType,
				// 					open: false,
				// 					toolType: agentType
				// 				});
				// 			}
				// 		});
				// 		// 处理未分类的数据
				// 		if (item.type === "未分类") {
				// 			items = allAgentTypeList.filter(agentType => {
				// 				return !agentType.classification || agentType.classification === 'null' || agentType.classification === '';
				// 			}).map(agentType => {
				// 				return {
				// 					id: `_${self.antbotClassification.indexOf(item)}_${allAgentTypeList.indexOf(agentType)}`,
				// 					value: agentType.interfaceType,
				// 					open: false,
				// 					toolType: agentType
				// 				};
				// 			});
				// 		}
				// 		return {
				// 			id: index + 1,
				// 			value: item.type,
				// 			open: false,
				// 			data: items
				// 		};
				// 	});
				
				// 	self.projectTreeShow(data);
				// };
				this.clearProjectData= function() {
					self.optionCreateProject("创建空白项目");
					self.step(1);
					self.selectedConfig('');
					self.selectedPorts.removeAll();
				};

				this.createProject = function() {
					self.clearProjectData();
					self.projectName('');
					self.projectDescription('');
					self.projectTargetObjectDescription('');
					self.candidateProjectName('');
					self.candidateProjectDescription('');
					self.projectAutoIntoUser('');
					self.inEdit(false);
					//项目只读,暂时关闭
					// self.isDisabled(false);
					self.isProjectTemplate(false);
					self.fromEmpty(true);
					$('#projectConfigModal').modal('show');
				};
				
				this.createOneProject = function() {
					if(self.optionCreateProject()=="创建空白项目"){
						$('#projectConfigModal').modal('hide');
						var projectObj = {
							id : 0,					
							name : self.projectName(),
							description : self.projectDescription(),
							organizationId : loginManager.getOrganization(),
							autoIntoUser : self.projectAutoIntoUser(),
							targetObjectDescription : self.projectTargetObjectDescription(),
							templateType : self.isProjectTemplate() ? (loginManager.isTestAccount() ? self.projectManager.systemTemplate : self.projectManager.customerTemplate) : self.projectManager.defaultProject
						};	
						self.utpService.createProject(projectObj, self.createProjectSuccessFunction, self.createProjectErrorFunction);
					}else if(self.optionCreateProject()=="基于向导创建项目"){
						var selectedPorts = self.selectedPorts();
						var antbotNameMap = new Map();
						for (var i = 0; i < selectedPorts.length; i++) {
							var port = selectedPorts[i];
							var name = port.portName;
							if(port.toolType==null){
								notificationService.showError("请选择测试机器人类型");
								return;
							}
						
							// 判断机器人名称是否填写
							if (name === "") {
								notificationService.showError("机器人名称不能为空");
								return;
							}
							// 判断机器人名称是否重复
							if (antbotNameMap.has(name)) {
								notificationService.showError("机器人名称重复");
								return;
							}
							antbotNameMap.set(name, true); // 将名称存入 Map
							// 获取机器人协议
							if (!port.isButtonDisabled() && port.protocolData === "") {
								notificationService.showError("请选择配置数据");
								return;
							}
						}
						$('#projectConfigModal').modal('hide');
						var projectObj = {
							id : 0,					
							name : self.projectName(),
							description : self.projectName(),
							organizationId : loginManager.getOrganization(),
							autoIntoUser : self.projectAutoIntoUser(),
							targetObjectDescription : self.projectTargetObjectDescription(),
							templateType : self.isProjectTemplate() ? (loginManager.isTestAccount() ? self.projectManager.systemTemplate : self.projectManager.customerTemplate) : self.projectManager.defaultProject
						};	
						self.utpService.createProject(projectObj, self.createProjectSuccessFunction, self.createProjectErrorFunction);
					}
					$('#projectConfigModal').modal('hide');
				};

				this.addAgentConfigSuccessFunction = function(data){
					if(data && data.status === 1){
						var configInfos = data.result;
						//遍历
						for (var i = 0; i < configInfos.length; i++) {
							var configInfo = configInfos[i].result;
							if (configInfo.result != 'Success'){
								notificationService.showError(configInfo.antbotName+'创建失败,请进入项目后重新创建');
							}
						}
					}
					else
						notificationService.showError('创建测试机器人异常,请进入项目后重新创建');			
				};			
				this.addAgentConfigErrorFunction = function(){
					notificationService.showError('创建测试机器人失败,请进入项目后重新创建');
				};
				// remove				
				this.deleteProjectSuccessFunction = function(data){
					if(data && data.status === 1 && data.result){
						self.projectManager.projects.remove(self.currentProject());
						notificationService.showSuccess('删除项目成功');						
					}
					else
						self.deleteProjectErrorFunction();
				};
				
				this.deleteProjectErrorFunction = function(){					
					notificationService.showError('删除项目失败');
				};
				
				this.deleteProject = function(item) {
					$('#deleteProjectModal').modal('show');
					self.currentProject(item);						
				};
				
				this.deleteCurrentProject = function(){
					self.utpService.deleteProject(self.currentProject().id, self.deleteProjectSuccessFunction, self.deleteProjectErrorFunction);	
				};
				
				//import
				this.selectedFile = null;
				this.loadFromFile = function(file) {
					self.selectedFile = file;
		       	};
			   	this.permissionErrorFunction = function(){
				notificationService.showError('该功能无法使用,请安装相应许可！');
				};
				
				this.importProject = function(){
					self.selectedFile = null;
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.project.import')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					$('#importProjectModal').modal('show');
				};
				
				this.importProjectSuccessFunction = function(data){
					if(data && data.status === 1 && data.result==="SUCCESS"){
						notificationService.showSuccess('上传项目成功');	
						$('#importProjectModal').modal('hide');
						self.getOrgProject();
					}
					else
						self.importProjectErrorFunction(data.result);
				};
				
				this.importProjectErrorFunction = function (data) {
					if (data === "REPETITION_FILE") {
						notificationService.showError('上传项目失败，项目名称已存在,请修改原项目名称后重新上传');
					} else if (data === "OVER_MAX_PROJECT_NUM") {
						notificationService.showError('上传项目失败，项目数量超过最大限制,请安装对应的许可文件!');
					} else {
						notificationService.showError('上传项目失败');
					}
				};
				
				this.submitImportedProject = function(){
					var fd= new FormData();
			        fd.append('projectFile', self.selectedFile);	       	
					utpService.importProject(fd, self.importProjectSuccessFunction, self.importProjectErrorFunction);	
				};
				
				// export				
				this.exportProjectSuccessFunction = function(data){
					if(data != null){
						try {
							var filename = self.currentProject().name + ".zip";
							var blob = new Blob([data], { type: 'application/zip' });
				
							if (navigator.msSaveBlob) { // IE 10+
								navigator.msSaveBlob(blob, filename);
							} else {
								var link = document.createElement('a');
								var url = window.URL.createObjectURL(blob);
								link.href = url;
								link.download = filename;
								document.body.appendChild(link);
								link.click();
								document.body.removeChild(link);
								window.URL.revokeObjectURL(url); // 释放 URL 对象
							}
							notificationService.showSuccess('项目导出成功，正在下载...');
						} catch (error) {
							notificationService.showError('导出项目失败：处理下载数据时出错');
							console.error("Error during download processing:", error);
						}
					}
					else
						notificationService.showError('导出项目失败');
					$.unblockUI();
				};
				
				this.exportProjectErrorFunction = function(){					
					notificationService.showError('导出项目失败');
				};
				
				this.exportProject = function(item){
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.project.export')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					self.currentProject(item);
					self.utpService.exportProject(item.id, self.exportProjectSuccessFunction, self.exportProjectErrorFunction);	
				};
				
				// edit				
				this.updateProjectSuccessFunction = function(data){
					if(data != null && data.status === 1 && data.result){
						var i=0;
						for(i=0; i<self.projectManager.projects().length;i++){
							if(self.projectManager.projects()[i].id === data.result.id){
								self.projectManager.projects.splice(i, 1, data.result);
								break;
							}
						}
						notificationService.showSuccess('更新项目成功');							
					}
					else
						self.updateProjectErrorFunction();
				};
				
				this.configProject = function(item) {
					self.clearProjectData();
					self.currentProject(item);					
					self.projectName(item.name);
					self.projectTargetObjectDescription(item.targetObjectDescription);
					self.projectDescription(item.description);
					self.projectAutoIntoUser(item.autoIntoUser);
					self.inEdit(true);
					//项目只读,暂时关闭
					// self.readWriteAccessPermission();
					self.fromEmpty(true);
					if(item.templateType == self.projectManager.systemTemplate || item.templateType == self.projectManager.customerTemplate)
						self.isProjectTemplate(true);
					else 
						self.isProjectTemplate(false);
						
					$('#projectConfigModal').modal('show');
				};
				
				this.updateProjectErrorFunction = function(){
					notificationService.showError('更新项目失败');
				};
				
				this.updateProject = function() {	
					self.currentProject().name = self.projectName();
					self.currentProject().targetObjectDescription = self.projectTargetObjectDescription();
					self.currentProject().description = self.projectDescription();
					self.currentProject().autoIntoUser = self.projectAutoIntoUser();
					self.currentProject().templateType = self.isProjectTemplate() ? (loginManager.isTestAccount() ? self.projectManager.systemTemplate : self.projectManager.customerTemplate) : self.projectManager.defaultProject;
					self.utpService.updateProject(komapping.toJS(self.currentProject()), self.updateProjectSuccessFunction, self.updateProjectErrorFunction);
					 $('#projectConfigModal').modal('hide');
				};
				
				this.submitProjectConfig = function(){
					if(self.inEdit())
						self.updateProject();
					else
						self.createOneProject();						
				};
				
				this.initProjectTemplate = function(isTemplate, fromEmpty){
					$('#asProjectTemplate').bootstrapSwitch("state", isTemplate);
					$('#asProjectTemplate').on('switchChange.bootstrapSwitch', function (event, state) {
						self.isProjectTemplate(state);   
			        });
					$('#asProjectTemplateSwitch').bootstrapSwitch("state", isTemplate);
					$('#asProjectTemplateSwitch').on('switchChange.bootstrapSwitch', function (event, state) {
						self.isProjectTemplate(state);   
			        });
					
					$('#startFromEmpty').bootstrapSwitch("state", fromEmpty);
					$('#startFromEmpty').on('switchChange.bootstrapSwitch', function (event, state) {
						self.fromEmpty(state);
						self.resetValidator();						
						if(!state){
							self.candidateProjectName('');
                    		self.candidateProjectDescription('');
                    		self.getProjectTemplates();
						}							
			        });
				}

				this.resetValidator = function(){
					$('#configProjectForm').validator().off('submit');
					$('#configProjectForm').validator('destroy').validator();
					$('#configProjectForm').validator().on('submit', function (e) {
						var result = $('#configProjectForm').validator().data('bs.validator').hasErrors();
						  if (e.isDefaultPrevented()) {
						    // handle the invalid form...
						  } else {
							  e.preventDefault();
							//   $('#projectConfigModal').modal('hide');
							  $('.modal-backdrop').remove();							  
							  self.submitProjectConfig();								  
						  }
					});
					
					$('#configProjectFromTemplateForm').validator().off('submit');
					$('#configProjectFromTemplateForm').validator('destroy').validator();
					$('#configProjectFromTemplateForm').validator().on('submit', function (e) {
						var result = $('#configProjectFromTemplateForm').validator().data('bs.validator').hasErrors();
						  if (e.isDefaultPrevented()) {
						    // handle the invalid form...
						  } else {
							  e.preventDefault();
							  var item = $$("unitlist").getSelectedItem();
								if((item!= null || item != undefined) && self.candidateProjectName() != "" && self.candidateProjectDescription() != ""){
									$('#projectConfigModal').modal('hide');
									$('.modal-backdrop').remove();
									self.submitProjectFromTemplate(item);
								}							
								else{
									notificationService.showWarn('信息不全，请填写完整');
								}							  
						  }
					});
				}
				
				
				// template init
				this.initProjectTemplateList = function(){
					$('#projectTemplate').html('');
					self.projectTemplateList = null;					
					webix.ready(function(){
						self.projectTemplateList = webix.ui({
					        container:"projectTemplate",
					        width: 550,
					        height:300,
					        rows:[
					            {
					                height:30,
					                view:"toolbar",
					                elements:[
					                    {view:"search", id:"unitlist_input",label:"",css:"fltr", placeholder:"项目名称", labelWidth:300}
					                ]
					            },
					            {
					                view:"unitlist",
					                id:"unitlist",
					                uniteBy:function(obj){
					                    return obj.templateType == self.projectManager.systemTemplate ? "系统模板":"用户模板";
					                },
					                template:"#name# - #targetObjectDescription# <div style='padding-left:18px'> #description# </div>",
					                type:{
					                    height:60
					                },
					                select:true,
					                on: {
					                    onSelectChange:function (ids) {
					                    	var item = this.getItem(ids[0]);
					                    	if(item == undefined || item == null){
					                    		self.candidateProjectName('');
					                    		self.candidateProjectDescription('');
					                    	}
					                    	else{
					                    		self.candidateProjectName(item.name);
					                    		self.candidateProjectDescription(item.targetObjectDescription);
					                    	}                    
					                    }
					                },					               
					                scheme:{
					                    $sort:{
					                        by:"templateType",
					                        dir:"asc"
					                    }
					                },
					                data: JSON.parse(JSON.stringify(self.projectTemplates))
					            }
					        ]
					    });
						
						$$("unitlist_input").attachEvent("onTimedKeyPress",function(){
					        var value = this.getValue().toLowerCase();
					        $$("unitlist").filter(function(obj){
					            return obj.name.toLowerCase().indexOf(value)==0;
					        })
					    });
					});					
				};
				
				// function				
				this.attached = function(view, parent) {
					// self.viewManager.protocolActivePage('app/viewmodels/protocol');
					self.getTemplate();
					self.getOrgUsers();
					$('#projectConfigModal').on('shown.bs.modal', function() {
						self.initProjectTemplate(self.isProjectTemplate(), self.fromEmpty());
						self.resetValidator();
					});
					
					$('#projectConfigModal').on('hide.bs.modal', function (e) {
						$('#asProjectTemplate').bootstrapSwitch('destroy');
						$('#asProjectTemplateSwitch').bootstrapSwitch('destroy');
						
						$('#startFromEmpty').bootstrapSwitch('destroy');
					});

					$('#importProjectModal').on('shown.bs.modal', function() {
						var file = document.getElementById("projectInputFile");
						file.value = "";
					});
					loginManager.autoIntoProject(false);
					//获取项目列表
					for (var i = 0; i < self.projectManager.projects().length; i++) {
						if (self.projectManager.projects()[i].autoIntoUser == $.cookie("userName")) {
							loginManager.autoIntoProject(true);
							self.loadSelectedProject(self.projectManager.projects()[i]);
							break;
						}
					}
				};

				this.activate = function() {
					
				};
			}
		return new ProjectViewModel();
});
