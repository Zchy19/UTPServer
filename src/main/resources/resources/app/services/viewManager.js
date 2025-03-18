define(['knockout', 'services/systemConfig'], function (ko, systemConfig) {
	function viewManager() {
		var self = this;
		this.systemConfig = systemConfig;
		this.activePage = ko.observable('');
		this.requirementActivePage = ko.observable('');
		this.testenvironmentActivePage = ko.observable('');
		this.antbotActivePage = ko.observable('');
		this.testcaseActivePage = ko.observable('');
		this.testcaseActiveData = ko.observable('');
		this.testrunActivePage = ko.observable('');
		this.testreportActivePage = ko.observable('');
		this.specialTestActivePage=ko.observable('');
		this.operationActivePage = ko.observable('');
		this.statisticalStateActivePage = ko.observable('');
		this.testRecordingActivePage = ko.observable('');
		this.qualityReportActivePage = ko.observable('');
		this.protocolReportActivePage = ko.observable('');
		this.testsetPieChartReportActivePage = ko.observable('');
		// this.testsetDataTableActivePage = ko.observable('');
		this.testsetHistogramReportActivePage = ko.observable('');
		this.testsetCheckPointHgReportActivePage = ko.observable('');
		this.testsetCheckPointPCReportActivePage = ko.observable('');
		this.testsetElectricReportActivePage = ko.observable('');
		this.testsetElectricReportOneActivePage = ko.observable('');
		this.testsetElectricReportTwoActivePage = ko.observable('');
		this.testsetLineReportActivePage = ko.observable('');
		this.testsetCheckPointActivePage = ko.observable('');
		this.testsetAreaReportActivePage = ko.observable('');
		
		this.protocolHistoryActivePage = ko.observable('');
		this.protocolCompareActivePage = ko.observable('');
		this.protocolCompareActiveData = ko.observable('');
		this.executionReportActivePage = ko.observable('');
		this.executionReportActiveData = ko.observable('');
		this.testReportActiveData = ko.observable('');
		this.exceptionrecoverActivePage = ko.observable('');
		this.monitorresultActivePage = ko.observable('');
		this.protocolActivePage = ko.observable('');
		this.signalProtocolActivePage = ko.observable('');
		this.customizedFieldActivePage = ko.observable('');
		this.autotestActivePage = ko.observable('');
		this.specialTestLoadActivePage = ko.observable('');
		this.monitorTestsetControlActivePage = ko.observable('');
		this.specialTestControlActivePage=ko.observable('');
		this.specialTestFourControlActivePage=ko.observable('');
		this.specialTestThreeControlActivePage=ko.observable('');
		this.specialTestTwoControlActivePage=ko.observable('');
		this.specialTestOneControlActivePage=ko.observable('');
		
		this.monitorTestsetRunActivePage = ko.observable('');
		this.selectedMonitorTestsetActiveData = null;
		this.selectedSpecialTestsetActiveData=null;
		this.selectedMonitorTestsetActiveEngine = null;
		this.selectedMonitorExecution = ko.observable('');
		this.requirementFeatureEnable = ko.observable(false);
		this.testcaseFeatureEnable = ko.observable(false);
		this.testsetFeatureEnable = ko.observable(false);
		this.autotestFeatureEnable = ko.observable(false);
		this.testreportFeatureEnable = ko.observable(false);
		this.specialTestFeatureEnable=ko.observable(false);
		this.operationFeatureEnable = ko.observable(false);
		this.statisticalStateFeatureEnable = ko.observable(false);
		this.testRecordingFeatureEnable = ko.observable(false);
		this.enabledFeature = ko.observable('49%');
		//定义一个数组用于存页面数据
		this.pageData = [];
		this.featureInit = function () {
			//清空页面数据
			self.pageData = [];
			if (self.systemConfig.getConfig('utpclient.requirement_mgr')){
				self.requirementFeatureEnable(true);
				self.pageData.push('utpclient.requirement_mgr')
			}
			if (self.systemConfig.getConfig('utpclient.testcase_mgr')){
				self.testcaseFeatureEnable(true);
				self.pageData.push('utpclient.testcase_mgr')
			}
			if (self.systemConfig.getConfig('utpclient.testset_exec')) {
				self.testsetFeatureEnable(true);
				self.pageData.push('utpclient.testset_exec')
			}
			if (self.systemConfig.getConfig('utpclient.monitor_exec')) {
				self.autotestFeatureEnable(true);
				self.pageData.push('utpclient.monitor_exec')
			}
			if (self.systemConfig.getConfig('utpclient.report_mgr')) {
				self.testreportFeatureEnable(true);
				self.pageData.push('utpclient.report_mgr')
			}
			if (self.systemConfig.getConfig('utpclient.special_mgr')) {
				self.specialTestFeatureEnable(true);
				self.pageData.push('utpclient.special_mgr')
			}
			if (self.systemConfig.getConfig('utpclient.operation_mgr')) {
				self.operationFeatureEnable(true);
				self.pageData.push('utpclient.operation_mgr')
			}
			if (self.systemConfig.getConfig('utpclient.statisticalState_mgr')) {
				self.statisticalStateFeatureEnable(true);
				self.pageData.push('utpclient.statisticalState_mgr')
			}
			if (self.systemConfig.getConfig('utpclient.testRecording_mgr')) {
				self.testRecordingFeatureEnable(true);
				self.pageData.push('utpclient.testRecording_mgr')
			}
			var activeFeatureCount = 0;
			if (self.requirementFeatureEnable())
				activeFeatureCount++;
			if (self.testcaseFeatureEnable())
				activeFeatureCount++;
			if (self.testsetFeatureEnable())
				activeFeatureCount++;
			if (self.autotestFeatureEnable())
				activeFeatureCount++;
			if (self.testreportFeatureEnable())
				activeFeatureCount++;
			if (self.specialTestFeatureEnable())
				activeFeatureCount++;
			if (self.operationFeatureEnable())
				activeFeatureCount++;
			if (self.statisticalStateFeatureEnable())
				activeFeatureCount++;
			if (self.testRecordingFeatureEnable())
				activeFeatureCount++;
			if (activeFeatureCount != 0)
				self.enabledFeature((1 / activeFeatureCount - 0.01).toFixed(2) * 100 + '%');
		};
	}
	return new viewManager();
})