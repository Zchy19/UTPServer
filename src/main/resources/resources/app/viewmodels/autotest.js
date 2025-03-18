define(['durandal/app', 'knockout', 'jquery', 'services/loginManager','services/viewManager', 'services/projectManager', 'services/ursService', 'services/notificationService', 'services/selectionManager' ], function(
	app, ko, $, loginManager, viewManager, ursService, projectManager, notificationService, selectionManager) {

function AutoTestViewModel() {
	var self = this;
	this.viewManager = viewManager;
	this.selectionManager = selectionManager;
	this.loginManager = loginManager;
	this.projectManager = projectManager;
	this.selectedMonitorTestSet = null;

	this.goback = function(){
		self.viewManager.autotestActivePage('app/viewmodels/monitortestset');
	}

	this.showDetail = function(){
		if(self.projectManager.isMonitoringResult){
			self.viewManager.monitorTestsetControlActivePage('');
			self.viewManager.monitorTestsetRunActivePage('app/viewmodels/monitortestsetrun');
		}else {
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

	this.attached = function(view, parent) {	
		self.selectedMonitorTestSet = self.viewManager.selectedMonitorTestsetActiveData;
		self.showDetail();
	};
	
	this.activate = function() {
		
	};
	
	this.detached = function(){
		self.viewManager.monitorTestsetControlActivePage('');
		self.viewManager.monitorTestsetRunActivePage('');
	}
}
return new AutoTestViewModel();
});
