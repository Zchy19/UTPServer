define(['durandal/app', 'knockout', 'jquery', 'services/loginManager', 'services/viewManager', 'services/projectManager', 'services/ursService', 'services/notificationService', 'services/selectionManager'], function (
	app, ko, $, loginManager, viewManager, ursService, projectManager, notificationService, selectionManager) {

	function AutoTestViewModel() {
		var self = this;
		this.viewManager = viewManager;
		this.selectionManager = selectionManager;
		this.loginManager = loginManager;
		this.projectManager = projectManager;
		this.selectedMonitorTestSet = null;

		this.goback = function () {
			self.viewManager.autotestActivePage('app/viewmodels/monitortestset');
		}

		this.showDetail = function () {
			self.viewManager.monitorTestsetControlActivePage('');
			self.viewManager.monitorTestsetRunActivePage('');
			if (self.projectManager.isMonitoringResult) {
				self.viewManager.monitorTestsetControlActivePage('');
				self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
			} else {
				if (self.selectedMonitorTestSet.type === 0) {
					self.viewManager.monitorTestsetControlActivePage('app/viewmodels/monitortestsetcontrol');
					self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
				} else if (self.selectedMonitorTestSet.type === 1) {
					self.viewManager.monitorTestsetControlActivePage('');
					self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
				} else if (self.selectedMonitorTestSet.type === 2) {
					self.viewManager.monitorTestsetControlActivePage('app/viewmodels/monitortestsetcontrol');
					self.viewManager.monitorTestsetRunActivePage('');
				}
			}
		}

		// 新增公共方法：强制刷新页面逻辑
		this.refreshPages = function () {
			self.selectedMonitorTestSet = self.viewManager.selectedMonitorTestsetActiveData;
			self.showDetail(); 
		};

		this.attached = function (view, parent) {
			self.viewManager.monitorTestsetConfigActivePage('app/viewmodels/monitortestsetconfig');
			self.refreshPages()
		};

		this.activate = function () {

		};

		this.detached = function () {
			self.viewManager.monitorTestsetControlActivePage('');
			self.viewManager.monitorTestsetRunActivePage('');
		}
	}
	return new AutoTestViewModel();
});
