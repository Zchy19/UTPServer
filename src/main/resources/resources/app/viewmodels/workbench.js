define(
		[ 'jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
				'services/langManager', 'services/viewManager', 'services/systemConfig', 'services/notificationService',
				'services/loginManager', 'services/cmdConvertService', 'komapping',
				'services/selectionManager', 'services/executionManager',
				'services/projectManager', 'knockout', "knockout-postbox"],
		function($, app, lang, bootstrap, dtManager, langManager,
				viewManager,systemConfig, notificationService, loginManager, cmdConvertService, komapping,
				selectionManager, executionManager, projectManager, ko) {
	function WorkBenchViewModel() {
		var self = this;

		this.loginManager = loginManager;
		this.viewManager = viewManager;
		this.systemConfig = systemConfig;
		this.selectionManager = selectionManager;
		this.projectManager = projectManager;
		this.featureWidth = ko.observable('100%');
		
		this.requirementNumber = ko.observable(0);
		this.testcaseNumber = ko.observable(0);
		this.testsetNumber = ko.observable(0);
		this.autotestNumber = ko.observable(0);
		this.testreportNumber = ko.observable(0);
		this.specialTestInfoNumber=ko.observable(0);
		this.operationInfoNumber=ko.observable(0);
		this.statisticalStateInfoNumber=ko.observable(0);
		this.testRecordingInfoNumber=ko.observable(0);
		this.navigationShow=ko.observable(true);
		this.isNavigationShow=function () {
			this.navigationShow(!this.navigationShow());
		}
		this.initPages = function() {
			self.viewManager.requirementActivePage('app/viewmodels/requirement');
			self.viewManager.testenvironmentActivePage('app/viewmodels/testenvironment');
		//	self.viewManager.testcaseActiveData({reload:true});
			self.viewManager.testcaseActivePage('app/viewmodels/testcase');
			self.viewManager.exceptionrecoverActivePage('app/viewmodels/exceptionrecover');
			self.viewManager.specialTestActivePage('app/viewmodels/specialTest');
			// self.viewManager.operationActivePage('app/viewmodels/operation');
			// self.viewManager.statisticalStateActivePage('app/viewmodels/statisticalState');
			self.viewManager.testRecordingActivePage('app/viewmodels/testRecording');
			self.viewManager.autotestActivePage('app/viewmodels/monitortestset');
		//	self.viewManager.antbotActivePage('app/viewmodels/antbot');
		};				

		this.initTestReportPage = function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.report_mgr')
			if (!enable) {
				self.isButtonTestReportDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonTestReportDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			self.viewManager.testreportActivePage('app/viewmodels/testreport');
			app.trigger('qualityReportRefresh:event');
		//	app.trigger('executionReportRefresh:event');
		}
	
		
		this.enableTestcase = function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.testcase_mgr')
			if (!enable) {
				self.isButtonTestcaseFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonTestcaseFeatureDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			app.trigger('enableTestcase:event');
		};
		this.isButtonTestcaseFeatureDisabled=ko.observable(false);
		this.isButtonTestsetFeatureDisabled = ko.observable(false);
		this.isButtonTestReportDisabled = ko.observable(false);
		this.isButtonRequirementDisabled = ko.observable(false);
		this.isButtonAutotestFeatureDisabled = ko.observable(false);
		this.isButtonSpecialTestFeatureDisabled = ko.observable(false);
		this.isButtonOperationFeatureDisabled = ko.observable(false);
		this.isButtonStatisticalStateFeatureDisabled=ko.observable(false);
		this.isButtonTestRecordingFeatureDisabled = ko.observable(false);


		this.permissionErrorFunction = function(){
			notificationService.showError('该功能无法使用,请安装相应许可！');
		};
		this.enableTestset = function () {
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.testset_exec')
			if (!enable) {
				self.isButtonTestsetFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonTestsetFeatureDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			app.trigger('enableTestset:event');
			
		};
		
		this.enableRequirement= function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.requirement_mgr')
			if (!enable) {
				self.isButtonRequirementDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonRequirementDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			app.trigger('enableRequirement:event');
		};
		
		this.enableAutoTest = function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.monitor_exec')
			if (!enable) {
				self.isButtonAutotestFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonAutotestFeatureDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			app.trigger('enableAutotest:event');
		};
		this.enableSpecialTest=function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.special_mgr')
			if (!enable) {
				self.isButtonSpecialTestFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonSpecialTestFeatureDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			app.trigger('enableSpecialTest:event');
		};
		this.enableOperation=function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.operation_mgr')
			if (!enable) {
				self.isButtonOperationFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonOperationFeatureDisabled(false);
			self.viewManager.statisticalStateActivePage('');
			self.viewManager.operationActivePage('app/viewmodels/operation');
			app.trigger('enableOperation:event');
		};
		this.enableStatisticalState=function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.statisticalState_mgr')
			if (!enable) {
				self.isButtonStatisticalStateFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonStatisticalStateFeatureDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('app/viewmodels/statisticalState');
			app.trigger('enableStatisticalState:event');
		};
		this.enableTestRecording=function(){
			var enable = self.systemConfig.getEnableByFeatureName('utpclient.testRecording_mgr')
			if (!enable) {
				self.isButtonTestRecordingFeatureDisabled(true);
				self.permissionErrorFunction();
				return;
			}
			self.isButtonTestRecordingFeatureDisabled(false);
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			self.viewManager.testRecordingActivePage('app/viewmodels/testRecording');
			app.trigger('enableTestRecording:event');
		};

		this.gotoProject = function(){
			self.selectionManager.clear();
			$.cookie("lastSelectedProject", null); // needed
			self.viewManager.requirementActivePage('');
			self.viewManager.testenvironmentActivePage('');
			self.viewManager.testcaseActivePage('');
			self.viewManager.autotestActivePage('');
			self.viewManager.specialTestActivePage('');
			self.viewManager.operationActivePage('');
			self.viewManager.statisticalStateActivePage('');
			self.viewManager.testRecordingActivePage('');
			self.viewManager.testreportActivePage('');
			self.viewManager.activePage('app/viewmodels/project');
		};
		
		this.resizeWindowSize = function () {			
			if($(window).width() > 992)
				self.featureWidth(viewManager.enabledFeature());
			else
				self.featureWidth('100%');
		};

		var $window = $(window);
		$window.resize(function () {			
			if($(window).width() > 992)
				self.featureWidth(viewManager.enabledFeature());
			else
				self.featureWidth('100%');
		});

	

		//更改里面的值,可确定先加载哪个模块
		this.activeTab = ko.observable('testcaseinfo');
		this.showActiveTab= function () {
			const tabMappings = {
				'utpclient.requirement_mgr': 'requirementinfo',
				'utpclient.testcase_mgr': 'testcaseinfo',
				'utpclient.testset_exec': 'testEnvironmentinfo',
				'utpclient.monitor_exec': 'autotestinfo',
				'utpclient.report_mgr': 'testreportinfo',
				'utpclient.special_mgr': 'specialTestInfo',
				'utpclient.operation_mgr': 'operationInfo',
				'utpclient.statisticalState_mgr': 'statisticalStateInfo',
				'utpclient.testRecording_mgr':'testRecordingInfo'
			};
			if(self.viewManager.pageData.length==1){
				const tabName = tabMappings[self.viewManager.pageData[0]];
				self.activeTab(tabName);
			}else{
				for (var i = 0; i < self.viewManager.pageData.length; i++) {
					var pageData = self.viewManager.pageData[i];
					var featureConfigValues = self.systemConfig.getConfigValuesByFeatureName(pageData);
					if (featureConfigValues != null) {
						var configValuesObj = JSON.parse(featureConfigValues);
						//判断configValuesObj对象中是否含有main属性
						if (configValuesObj.hasOwnProperty('main')) {
							//获取main属性的值
							var mainValueBoole = configValuesObj['main'];
							if (mainValueBoole) {
								// 检查pageData是否存在于映射中，如果存在，则激活对应的选项卡
								const tabName = tabMappings[pageData];
								self.activeTab(tabName);
							}
						}
					}
				}
			}
			
		};


		this.activate = function() {
			// self.loginManager.autoIntoProject(false);
			loginManager.autoIntoProject(false);
			//获取项目列表
			for (var i = 0; i < self.projectManager.projects().length; i++) {
				if (self.projectManager.projects()[i].autoIntoUser == $.cookie("userName")) {
					loginManager.autoIntoProject(true);
					break;
				}
			}
			self.viewManager.featureInit();
			self.showActiveTab();
			var currentNumber = 0;
			if(viewManager.requirementFeatureEnable()){
				self.requirementNumber(++currentNumber);
			}
			if(viewManager.testcaseFeatureEnable()){
				self.testcaseNumber(++currentNumber);
			}
			if(viewManager.testsetFeatureEnable()){
				self.testsetNumber(++currentNumber);
			}
			if(viewManager.autotestFeatureEnable()){
				self.autotestNumber(++currentNumber);
			}
			if(viewManager.specialTestFeatureEnable()){
				self.specialTestInfoNumber(++currentNumber);
			}
			if(viewManager.operationFeatureEnable()){
				self.operationInfoNumber(++currentNumber);
			}
			if(viewManager.statisticalStateFeatureEnable()){
				self.statisticalStateInfoNumber(++currentNumber);
			}
			if(viewManager.testreportFeatureEnable()){
				self.testreportNumber(++currentNumber);
			}
			if(viewManager.testRecordingFeatureEnable()){
				self.testRecordingInfoNumber(++currentNumber);
			}
			
		};
		

		this.attached = function(view, parent) {
			self.initPages();
			self.resizeWindowSize();
			// self.activeTabShow();

			// self.enableSpecialTest();
		};
	}
	return new WorkBenchViewModel();
});
