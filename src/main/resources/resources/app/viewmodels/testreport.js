define(['durandal/app', 'durandal/system', 'knockout', 'jquery', 'komapping', 'services/viewManager', 'services/systemConfig', 'datepicker', 'services/reportService', 'services/notificationService', 'AdminLTE' ], function(
		app, system, ko, $, komapping, viewManager,systemConfig, datepicker, reportService, notificationService, AdminLTE) {

	function TestReportViewModel() {
		var self = this;
		this.viewManager = viewManager;
		this.systemConfig = systemConfig;
		this.reportService = reportService;
		
		this.initQualityReportData = function(){			
		    self.searchCondition.begin(self.reportService.previousDate.getFullYear() + "-" + (self.reportService.previousDate.getMonth()+1) + "-" + self.reportService.previousDate.getDate()); 
		    self.searchCondition.end(self.reportService.nowDate.getFullYear() + "-" + (self.reportService.nowDate.getMonth()+1) + "-" + self.reportService.nowDate.getDate());
		}
		
		this.initPage = function() {			
			self.viewManager.qualityReportActivePage('app/viewmodels/qualityreport');
			self.viewManager.protocolReportActivePage('app/viewmodels/protocolreport');
			self.viewManager.testsetPieChartReportActivePage('app/viewmodels/testsetPieChartReport');
			// self.viewManager.testsetDataTableActivePage('app/viewmodels/testsetDataTable');
			self.viewManager.testsetHistogramReportActivePage('app/viewmodels/testsetHistogramReport');
			self.viewManager.testsetCheckPointHgReportActivePage('app/viewmodels/testsetCheckPointHgReport');
			self.viewManager.testsetCheckPointPCReportActivePage('app/viewmodels/testsetCheckPointPCReport');
			self.viewManager.testsetLineReportActivePage('app/viewmodels/testsetLineReport');
			self.viewManager.testsetElectricReportActivePage('app/viewmodels/testsetElectricReport');
			self.viewManager.testsetElectricReportOneActivePage('app/viewmodels/testsetElectricReportOne');
			self.viewManager.testsetElectricReportTwoActivePage('app/viewmodels/testsetElectricReportTwo');
			self.viewManager.testsetCheckPointActivePage('app/viewmodels/testsetCheckPoint');
			self.viewManager.testsetAreaReportActivePage('app/viewmodels/testsetAreaReport');
			self.viewManager.protocolHistoryActivePage('app/viewmodels/protocolhistory');
			
			system.acquire("app/viewmodels/executionreport").then(function (executionReport) {
				v = "app/views/executionreport.html";
				vm = new executionReport();
				self.workspaceContainer({ model:vm, activationData: {pageId: 'FromTestReport'} });
			});
			
			//self.viewManager.testReportActivePage('app/viewmodels/executionreport');
			//self.viewManager.testReportActiveData({testsetId:7, testsetName:'testsetName'});
		}

		this.searchCondition = {						
			begin : ko.observable(''),
			end : ko.observable(''),								
		};
		
		this.refreshQualityReport = function(){
			app.trigger('qualityReportRefresh:event');
		};
		
		this.createQualityChart = function(){		
			var begin = new Date(self.searchCondition.begin());
			var end = new Date(self.searchCondition.end());
			if(begin > end){
				notificationService.showWarn('开始时间' + self.searchCondition.begin() + '不能晚于结束时间' + self.searchCondition.end());
				return;
			}
			$('#qualityConditionSettingModal').modal('hide');
			app.trigger('qualityConditionSetting:event', self.searchCondition.begin(), self.searchCondition.end());
		};

		this.attached = function(view, parent) {
			$('#searchBeginDate').datepicker({
				format: "yyyy-mm-dd",
			    autoclose: true,
				todayHighlight: true,
				language: "zh-CN"
			    });
			$('#searchEndDate').datepicker({
				format: "yyyy-mm-dd",
			    autoclose: true,
				todayHighlight: true,
				language: "zh-CN"
			    });
			self.initPage();
		};
		this.workspaceContainer = ko.observable();
		this.activate = function() {
			self.initQualityReportData();
		};
		
		this.detached = function(){			
			self.viewManager.qualityReportActivePage('');
			self.viewManager.protocolReportActivePage('');
			self.viewManager.testsetPieChartReportActivePage('');
			// self.viewManager.testsetDataTableActivePage('');
			self.viewManager.testsetHistogramReportActivePage('');
			self.viewManager.testsetCheckPointHgReportActivePage('');
			self.viewManager.testsetCheckPointPCReportActivePage('');
			self.viewManager.testsetElectricReportActivePage('');
			self.viewManager.testsetElectricReportOneActivePage('');
			self.viewManager.testsetElectricReportTwoActivePage('');
			self.viewManager.testsetLineReportActivePage('');
			self.viewManager.testsetCheckPointActivePage('');
			self.viewManager.testsetAreaReportActivePage('');
			self.viewManager.protocolHistoryActivePage('');
			self.viewManager.testReportActivePage("");
		}		
	}
	return new TestReportViewModel();
});
