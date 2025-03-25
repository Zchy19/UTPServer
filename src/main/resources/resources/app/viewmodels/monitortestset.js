define(
		[ 'jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
				'services/langManager', 'services/viewManager',
				'services/fileManagerUtility', 'services/utpService', 'services/notificationService', 'komapping',
				'services/selectionManager', 'services/projectManager', 'knockout', 'knockout-postbox'],
		function($, app, bootstrap, lang, dtManager, langManager,
				viewManager, fileManagerUtility, utpService, notificationService, komapping,
				selectionManager,  projectManager, ko) {

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

		this.monitorExecutionDataResult = ko.observableArray([]);

		this.editingMonitorTestSetConfig = {
			id : ko.observable(0),
			projectId : ko.observable(0),
			name : ko.observable(''),
			description : ko.observable(''),
			type: ko.observable(''),
			startScriptId : ko.observable(),
			sendCommandScriptId : ko.observable(),
			stopScriptId: ko.observable()
		};

		this.initScriptTree = function(data){
			$('#scriptTreeview').html('');
			webix.ready(function(){					
				self.scriptTree = webix.ui({
					container:"scriptTreeview",
					view:"tree",
					select: true,
					data : data,
					ready:function(){
						this.closeAll();
						this.open(fileManagerUtility.root);
						this.sort("value", "asc", "string");
					}
				});
			});
		}

		this.checkedScriptNodeId = function(scripts, checkedId) {					
			for (var i = 0; i < scripts.length; i++) {
				if(scripts[i].id === checkedId){
					return scripts[i];
				}
			}
			return null;
		}

		this.insertScript = function(){
			var checkedId = self.scriptTree.getSelectedId();
			if(checkedId === fileManagerUtility.root){
				notificationService.showWarn('请选择脚本.');
			}
			checkedId = Number(checkedId);
			var checkedNode = self.checkedScriptNodeId(self.scriptMapping.scripts, checkedId);
			if (checkedNode == null){
				notificationService.showWarn('请选择脚本.');
				return;
			}
				
			if(self.currentScriptMode == 'start'){
				self.startScriptName(checkedNode.name);
				self.editingMonitorTestSetConfig.startScriptId(checkedNode.id);
			}
			if(self.currentScriptMode == 'monitor'){
				self.sendCommandScriptName(checkedNode.name);
				self.editingMonitorTestSetConfig.sendCommandScriptId(checkedNode.id);
			}
			if(self.currentScriptMode == 'stop'){
				self.stopScriptName(checkedNode.name);
				self.editingMonitorTestSetConfig.stopScriptId(checkedNode.id);
			}
			$('#insertsendCommandScriptModal').modal('hide');
		};

		this.opensendCommandScriptUI = function(mode){
			self.currentScriptMode = mode;
			var project = [];
			project.push(JSON.parse(JSON.stringify(self.scriptsData)));
			$('#insertsendCommandScriptModal').modal({ show: true }, {data: project});
		};

		this.getFlatScriptByProjectSuccessFunction = function(data){
			if(data != null && data.status === 1){
				var scripts = self.projectManager.generateScriptGroupsFromFlatInfo(data.result);
				self.projectManager.removeEmptyScriptGroup(scripts.data);
				if(scripts.data == null || scripts.data.length == 0)
					notificationService.showWarn('该项目中不存在子脚本定义，无法引用.');			
				else{
					self.scriptsData = scripts;
					self.scriptMapping = data.result;
				}
			}
			else
				self.getFlatScriptByProjectErrorFunction();
		};

		this.getFlatScriptByProjectErrorFunction = function(data){
			notificationService.showError('获取脚本信息失败');				
		};

		this.getFlatScriptByProject = function(){
			utpService.getFlatScriptByProject(0, self.getFlatScriptByProjectSuccessFunction, self.getFlatScriptByProjectErrorFunction);
		};

		this.submitMonitorTestSetConfig = function() {
			if(self.editingMonitorTestSetConfig.name() == ''){
				notificationService.showWarn('请输入名称');
				return;
			}

			if((self.editingMonitorTestSetConfig.startScriptId() == '' || self.editingMonitorTestSetConfig.startScriptId() == undefined) && (self.selectedMonitorTestsetType() == 1 || self.selectedMonitorTestsetType() == 0)){
				notificationService.showWarn('请选择启动脚本！');
				return;
			}
				
			if((self.editingMonitorTestSetConfig.sendCommandScriptId() == '' || self.editingMonitorTestSetConfig.sendCommandScriptId() == undefined) && (self.selectedMonitorTestsetType() == 2 || self.selectedMonitorTestsetType() == 0)){
				notificationService.showWarn('请选择执行脚本！');
				return;
			}
				
			if((self.editingMonitorTestSetConfig.stopScriptId() == '' || self.editingMonitorTestSetConfig.stopScriptId() == undefined) && (self.selectedMonitorTestsetType() == 1 || self.selectedMonitorTestsetType() == 0)){
				notificationService.showWarn('请选择停止脚本！');
				return;
			}
			self.editingMonitorTestSetConfig.projectId(selectionManager.selectedProject().id);
			if (self.isEditMode()) {
				updateMonitorTestSetConfig();
			} 
			else
				addMonitorTestSetConfig();
		};
		
		this.enterAddItemMode = function() {
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

		this.enterEditItemMode = function(item) {
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
			if(startScript != null)
				self.startScriptName(startScript.value);
				
			var monitorScript = self.projectManager.getScript(item.sendCommandScriptId);
			self.sendCommandScriptName("选择脚本");
			if(monitorScript != null)
				self.sendCommandScriptName(monitorScript.value);
			

			var stopScript = self.projectManager.getScript(item.stopScriptId);
			self.stopScriptName("选择脚本");
			if(stopScript != null)
				self.stopScriptName(stopScript.value);
			self.showMonitorTestsetResult(false);			
			self.updateAccord();
		};
		
		this.getMonitorTestSetConfigSuccessFunction = function(data){
			if(data && data.status === 1){
				var monitorTestSets = data.result;
				for (var i = 0; i < monitorTestSets.length; i++) {
					self.monitorTestSets.push(monitorTestSets[i]);
				}
			}
			else
				self.getMonitorTestSetConfigErrorFunction();
		};
		
		this.getMonitorTestSetConfigErrorFunction = function(){
			notificationService.showError('获取监测测试集失败');
		};
		
		this.getMonitorTestSetConfig = function(){
			self.monitorTestSets.removeAll();
			utpService.getMonitoringTestSetByProjectId(selectionManager.selectedProject().id, self.getMonitorTestSetConfigSuccessFunction, self.getMonitorTestSetConfigErrorFunction);
		};
		
		this.addMonitorTestSetConfigErrorFunction = function(){
			notificationService.showError('创建监测测试集失败');
		};

		this.addMonitorTestSetConfigSuccessFunction = function(data){
			if(data && data.status === 1){
				self.getMonitorTestSetConfig();
				notificationService.showSuccess('创建监测测试集成功');
			}
			else
				self.addMonitorTestSetConfigErrorFunction();	
		};			
		
		function addMonitorTestSetConfig() {
			utpService.createMonitoringTestSet(komapping.toJS(self.editingMonitorTestSetConfig), self.addMonitorTestSetConfigSuccessFunction, self.addMonitorTestSetConfigErrorFunction);					
		}
		
		this.updateMonitorTestSetConfigSuccessFunction = function(data){
			if (data != null && data.status === 1) {
				self.getMonitorTestSetConfig();
        		notificationService.showSuccess('更新监测测试集成功');
			}
			else
				self.updateMonitorTestSetConfigErrorFunction();			
		};
		
		this.updateMonitorTestSetConfigErrorFunction = function(){
			notificationService.showError('更新监测测试集异常');		
		};			
		
		function updateMonitorTestSetConfig() {
			utpService.updateMonitoringTestSet(komapping.toJS(self.editingMonitorTestSetConfig), self.updateMonitorTestSetConfigSuccessFunction, self.updateMonitorTestSetConfigErrorFunction);				
		};
		
		this.deleteCurrentMonitorTestSet = function(){			
			utpService.removeMonitoringTestSet(selectionManager.selectedProject().id, self.currentMonitorTestSet().id, 
					function(data){
						if (data != null && data.status === 1 && data.result) {
							self.getMonitorTestSetConfig();
							notificationService.showSuccess('删除监测测试集成功');
						}
						else
							notificationService.showError('删除监测测试集失败');
					}, 
					function(){
						notificationService.showError('删除监测测试集失败');
					});
		};
		
		this.remove = function(item) {			
			$('#deleteMonitorTestSetModal').modal('show');
			self.currentMonitorTestSet(item);
		};
		
		this.gotoExecution = function(item) {
			viewManager.selectedMonitorTestsetActiveData = item;
			projectManager.isMonitoringResult = false
			viewManager.autotestActivePage('app/viewmodels/autotest');
			utpService.monitorHistoryCheck = false;
		};

		this.initPage = function() {
			webix
			.ready(function() {				
				webix
						.ui({
							container : "monitorTestSetInfo",
							id : "monitortestsetinfo_accord",
							multi : true,
							view : "accordion",
							minHeight : 700,
							cols : [
									{
										id: "monitorTestSetOverAllInfo_control",
										body : {
											view:"htmlform",														    
										    content: "monitorTestSetOverAllInfo",
										},
										minHeight : 700,
										minWidth : 600,
										scroll : false
									},
									{
										view : "resizer"
									},
									{
										header : "监控集详细信息",
										id: "monitorTestSetDetail_control",
										body : {
											view:"htmlform",														    
										    content: "monitorTestSetDetail",
											scroll: true
										},
										width : 700,
										minWidth : 700,
										minHeight : 700,
										scroll : false
									}
							]});
			});
		}

		this.selectedMonitorTestsetType = ko.observable();

		this.monitorTestsetTypes = ko.observableArray([
			{id:0, name:"监测并控制", value:0},
			{id:1, name:"仅监测", value:1},
			{id:2, name:"仅控制", value:2}
		]);

		this.selectedMonitorTestsetTypeChanged = function(obj,event){
			self.editingMonitorTestSetConfig.type(self.selectedMonitorTestsetType());
		}

		this.updateAccord = function(){
			$$('monitorTestSetDetail_control').header = self.showMonitorTestsetResult() ? "历史结果" : "监控集详细信息";
			$$('monitorTestSetDetail_control').refresh();
			$$('monitorTestSetDetail_control').expand();
		};

		this.viewResultDetail = function (item){
			projectManager.isMonitoringResult = true
			self.viewManager.selectedMonitorExecution(item)
			viewManager.autotestActivePage('app/viewmodels/autotest');
			utpService.monitorHistoryCheck = true;
		}

		this.currentExecutionData = ''
		this.viewRemoveResult = function(item){
			self.currentExecutionData = item
			$('#deleteMonitorExecutionData').modal('show')
		}

		this.confirmRemoveExecutionResult = function (){
			utpService.removeResultByExecutionId(self.currentExecutionData.executionId, function (data){
				if(data){
					self.monitorExecutionDataResult.remove(self.currentExecutionData)
					notificationService.showSuccess('删除监测记录成功');
				}
			}, function (error){
				notificationService.showError('删除监测记录失败');
			})
			$('#deleteMonitorExecutionData').modal('hide')
		}

		this.getMonitoringExecutionDataSuccess = function (data) {
			if(data && data.status === 1 && data.result){
				var executionList = data.result
				for(let i = 0; i < executionList.length; i++){
					self.monitorExecutionDataResult.unshift(executionList[i])
				}
			}else self.getMonitoringExecutionDataError()
		}

		this.getMonitoringExecutionDataError = function (error) {

		}

		this.viewResult = function(item){
			self.monitorExecutionDataResult.removeAll()
			viewManager.selectedMonitorTestsetActiveData = item;
			utpService.getMonitoringExecutionDataByTestSetId(item.id, self.getMonitoringExecutionDataSuccess, self.getMonitoringExecutionDataError)
			self.showMonitorTestsetResult(true);			
			self.updateAccord();
		};

		this.monitortestsetContainerAdjust = function(){
			var	parent = document.getElementById("autotestinfo").parentNode;				
			$$("monitortestsetinfo_accord").define("width", parent.clientWidth);
			$$("monitortestsetinfo_accord").resize();
			$$("monitorTestSetDetail_control").define("height", "700");						
			$$("monitorTestSetDetail_control").resize();
		};

		this.detached = function(view, parent){
			self.enableAutotestSubScription.off();
		};
		
		this.activate = function() {
			self.enableAutotestSubScription = app.on('enableAutotest:event').then(function(){
				self.monitortestsetContainerAdjust();
				self.getMonitorTestSetConfig();
				self.getFlatScriptByProject();
			}, this);
		};

		this.attached = function(view, parent) {
			self.initPage();
			self.monitortestsetContainerAdjust();
			$$('monitorTestSetDetail_control').collapse();
			$('#insertsendCommandScriptModal').on('shown.bs.modal', function(e) {
				self.initScriptTree(e.relatedTarget.data);
				//	self.getProjectSubScript();						
			});
		};
	}
	return new MonitorTestSetViewModel();
});
