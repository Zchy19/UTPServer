define(['jquery', 'notify'], function($) {

	function notificationService() {
		var self = this;
		this.notify = null;
		this.successIcon = 'glyphicon glyphicon-ok-circle';
		this.errorIcon = 'glyphicon glyphicon-alerts';
		this.infoIcon = 'glyphicon glyphicon-info-sign';
		this.warnIcon = 'glyphicon glyphicon-warning-sign';
		
		this.showSuccess = function(message){
			$.notify({message: message, icon : self.successIcon},{type: 'success', z_index:1051, placement: {from: "bottom", align: "center"}});
		};
		
		this.showError = function(message){
			$.notify({icon : self.errorIcon, message: message},{type: 'danger', z_index:1051, placement: {from: "bottom",align: "center"}, mouse_over : 'pause', newest_on_top: false});
		};
		
		this.showInfo = function(message){
			$.notify({icon : self.infoIcon, message: message},{type: 'info', z_index:1051, placement: {from: "bottom",align: "center"}, mouse_over : 'pause', newest_on_top: false});
		};
		
		this.showWarn = function(message){
			$.notify({icon : self.warnIcon, message: message},{type: 'warning', z_index:1051, placement: {from: "bottom", align: "center"}, mouse_over : 'pause', newest_on_top: false});
		};

		this.showWarnFromTop = function(message){
			$.notify({icon : self.warnIcon, message: message},{type: 'warning', z_index:1051, placement: {from: "top", align: "center"}, mouse_over : 'pause', newest_on_top: false});
		};
		
		function showProgressbar(message, type, icon, progress){
			if(self.notify === null || self.notify === undefined)
				self.notify = $.notify({icon : icon, message: message}, {
					type : type,					
					allow_dismiss: true,
					showProgressbar: true,
					progress : progress,
					timer : 20000,
					placement: {from: "bottom", align: "center"},
					onClosed : function() {
						self.notify = null;
		            },
				});
			else{
				self.notify.update('type', type);
				self.notify.update('icon', icon);
				self.notify.update('message', message);
				self.notify.update('progress', progress);
			}
		}
		
		function hideProgressbar(){
			if(self.notify === null || self.notify === undefined)
				return;
			self.notify.close();
		}
		
		this.showProgressInfo = function(message, progress){
			showProgressbar(message, 'info', self.infoIcon, progress);
		};
		
		this.showProgressSuccess = function(message, progress){
			showProgressbar(message, 'success', self.successIcon, progress);
		};
		
		this.showProgressError = function(message, progress){
			showProgressbar(message, 'danger', self.errorIcon, progress);
		};

		this.showProgressWarn = function(message, progress){
			showProgressbar(message, 'warning', self.warnIcon, progress);
		};
		
		this.hideProgress = function(){
			hideProgressbar();
		}
	}
	return new notificationService();
})