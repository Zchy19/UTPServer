define(['durandal/app', 'knockout', 'jquery', 'komapping', 'services/viewManager', 'services/reportService','services/systemConfig', 'services/notificationService', 'AdminLTE' ], function(
		app, ko, $, komapping, viewManager, reportService,systemConfig, notificationService, AdminLTE) {

	function TestEnvironmentViewModel() {
		var self = this;
		this.viewManager = viewManager;
		this.reportService = reportService;
		this.systemConfig = systemConfig;
		this.viewTestsetResultSubScription = null;
		// this.currentDetailInfoMode = 
		this.showTestsetResult = ko.observable(true);		

		this.initPage = function() {
			webix
			.ready(function() {				
				webix
						.ui({
							container : "testsetEnvironment",
							id : "testsetEnvironment_accord",
							multi : true,
							view : "accordion",
							minHeight : 700,
							cols : [
									{
										id: "testset_control",
										body : {
											view:"htmlform",														    
										    content: "testsetInfo",
										},
										minHeight : 700,
										minWidth : 600,
										scroll : false
									},
									{
										view : "resizer"
									},
									{
										header : "详情",
										id: "environmentInfo_control",
										body : {
											view:"htmlform",														    
										    content: "environmentInfo",
										},
										width : 700,
										minWidth : 700,
										minHeight : 700,
										scroll : false
									}
							]});
			});
			self.viewManager.testrunActivePage('app/viewmodels/testrun');
			self.viewManager.exceptionrecoverActivePage('app/viewmodels/exceptionrecover');
			self.viewManager.executionReportActiveData({pageId: 'FromExecution'});
			self.viewManager.executionReportActivePage('app/viewmodels/executionreport');
		}		
		
		this.showExceptionRecover = function(){			
			self.viewManager.exceptionrecoverActivePage('app/viewmodels/exceptionrecover');
			self.showTestsetResult(false);			
			$$('environmentInfo_control').header = self.showTestsetResult() ? "测试结果" : "异常恢复管理";
			$$('environmentInfo_control').refresh();
			$$('environmentInfo_control').expand();
		};
		
		this.showExecutionReport = function(testsetId, testsetName){
			self.viewManager.executionReportActiveData({testsetId:testsetId, testsetName:testsetName, pageId: 'FromExecution'});
			self.viewManager.executionReportActivePage('app/viewmodels/executionreport');
			
			self.showTestsetResult(true);			
			$$('environmentInfo_control').header = self.showTestsetResult() ? "测试结果" : "异常恢复管理";
			$$('environmentInfo_control').refresh();
			$$('environmentInfo_control').expand();
		};
		
		this.refreshTestSet = function(){
			app.trigger('testSetRefresh:event');
		};
		
		this.addTestSet = function(){
			app.trigger('testSetAdd:event');
		};
		
		this.testEnvironmentContainerAdjust = function(){
			var	parent = document.getElementById("testEnvironmentinfo").parentNode;				
			$$("testsetEnvironment_accord").define("width", parent.clientWidth);
			$$("testsetEnvironment_accord").resize();
			$$("environmentInfo_control").define("height", "700");						
			$$("environmentInfo_control").resize();
		};
		
		this.attached = function(view, parent) {			
			self.initPage();
			self.testEnvironmentContainerAdjust();
			$$('environmentInfo_control').collapse();
		};
		
		this.activate = function() {
			self.viewTestsetResultSubScription = app.on('viewTestsetResult:event').then(function(testsetId, testsetName) {
				self.showExecutionReport(testsetId, testsetName);}, this);
			self.enableTestsetSubScription = app.on('enableTestset:event').then(function(){
				self.testEnvironmentContainerAdjust();
			}, this);
		};
		
		this.detached = function(){
			self.viewTestsetResultSubScription.off();
			self.viewManager.executionReportActivePage('');
			self.viewManager.testrunActivePage('');
			self.viewManager.exceptionrecoverActivePage('');
		}		
	}
	return new TestEnvironmentViewModel();
});
