define([ 'knockout', 'jquery', 'durandal/app', 'komapping', 'services/viewManager', 'services/selectionManager', 'services/ursService', 'services/loginManager', 'bootstrap' ], 
		function(ko, $, app, komapping, viewManager, selectionManager, ursService, loginManager) {

	function LoginViewModel() {
		
		var self = this;		
		this.loginManager = loginManager;
		this.isAuthenticated = ko.observable(false);
		this.isLoginSucc = ko.observable(false);
		this.userName = ko.observable('');
		this.password = ko.observable('');
		this.showLoginFailed = ko.observable(false);
		this.accountTypes = ko.observableArray([]);
		this.selectedAccountType = ko.observable();
		
		this.signIn = function() {
			self.loginManager.signIn(self
							.userName(), self.password(), this.signInCallback);
		};

		this.signInCallback = function(signResult) {
			self.isAuthenticated(signResult);
			self.showLoginFailed(!signResult);
		};		
		
		this.selectOrganization = function() {
			self.isLoginSucc(true);
			$.cookie("orgId", self.loginManager.selectedOrg().id);
			$.cookie("orgName", self.loginManager.selectedOrg().name);
			$.cookie("loginSucc", self.isLoginSucc());			
			if ($.cookie('loginSucc') == "true") {
				app.setRoot('app/viewmodels/shell');
			}
		};

		this.attached = function(view, parent) {};

		this.activate = function() {
			if ($.cookie('loginSucc') == "true"){
				this.isAuthenticated(true);
			}
			else{
				this.isAuthenticated(false);
			}
			
			/*
			ursService.getAccountTypeList(self.getAccountTypeListSuccessFunction, self.getAccountTypeListErrorFunction);			
			*/
		};
		
		/*
		this.getAccountTypeListSuccessFunction = function(data){
			if (data) {
				var accountTypes = data;
				for (var i = 0; i < accountTypes.length; i++) {
					self.accountTypes.push(accountTypes[i]);
				}
			}
		};
		
		this.getAccountTypeListErrorFunction = function(){}
		*/
	}
	return new LoginViewModel();
});
