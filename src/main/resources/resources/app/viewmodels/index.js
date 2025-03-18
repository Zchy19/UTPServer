define([ 'knockout', 'jquery', 'durandal/app', 'komapping', 'services/viewManager', 'services/selectionManager', 'services/ursService', 'services/loginManager', 'services/notificationService', 'services/utilityService', 'bootstrap' ],
		function(ko, $, app, komapping, viewManager, selectionManager, ursService, loginManager, notificationService, utilityService) {

	function IndexViewModel() {
		
		var self = this;
		this.loginManager = loginManager;
		this.isAuthenticated = ko.observable(false);
		this.isLoginSucc = ko.observable(false);	
		// signin, signup, reset
		this.currentMode = ko.observable('signin');
		// email, phone
		this.currentApproach = ko.observable('');
		
		this.enableSuccessTip = ko.observable(false);
		this.enableErrorTip = ko.observable(false);
		this.errorMessage = ko.observable('');
		
		this.account = ko.observable('');
		this.password = ko.observable('');
		this.confirmpassword = ko.observable('');
		this.nameOrRespectfully=ko.observable('');
		this.department=ko.observable('');
		this.position1=ko.observable('');
		this.weiBoNumber=ko.observable('');
		
		this.phone = ko.observable('');
		this.smsCode = ko.observable('');
		this.smsCountdown = 180;
		
		this.accountTypes = ko.observableArray([]);
		this.selectedAccountType = ko.observable();		
		
		this.ursService = ursService;
		
		this.suggestionUserName = ko.observable('');
		this.suggestionEmail = ko.observable('');
		this.suggestionContent = ko.observable('');
		this.loginMode = true;
		this.existUserName = ko.observable('');
		this.currentCountDown = ko.observable(60);
		this.inCountDown = ko.observable(false);
		this.xianshi = ko.observable(true);
		

		this.hasInvitationCode=ko.observable(false)
		this.invitationOrgId=ko.observable('')
		this.invitationOrgName=ko.observable('')

		this.hasInvitationCodeChange= function(){
			self.hasInvitationCode(!self.hasInvitationCode())
		}
		this.isChecked= function(){
			if(!self.hasInvitationCode())
			{
				self.invitationOrgId("")
				self.invitationOrgName("")
			}
		}
		
		this.currentSms = {
			id : -1,
			mode : 0,
			area : "086",
			phone : "",
			codeCreated : "",
			active : false,
			token : "",
			code : ""
		};
		this.allFeatures = ko.observableArray([]);
		// this.gotoShell = function () {
		// 	$(document.body).css({
		// 		"overflow-y": "auto",
		// 	});
		// 	if (self.isAuthenticated()) {
		// 		app.setRoot('app/viewmodels/shell');
		// 	}else {
		// 		//等待1000ms
		// 		setTimeout(() => {
		// 			app.setRoot('app/viewmodels/shell');
		// 		}, 500)
		// 	}
		// };
		
		this.clearInformation = function(){
			self.account('');
			self.password('');
			self.confirmpassword('');			
			self.nameOrRespectfully('')
			self.department('');
			self.position1('');
			self.weiBoNumber('');
			self.phone('');
			self.smsCode('');
		};
		
		this.enableEmailApproach = function(){
			$('#phoneApproachLink').css("color","#c0c0c0"); //.addClass(':hover')
			$('#emailApproachLink').css("color","#324784");
			self.currentApproach('email');
			self.clearInformation();
			self.updateSmsMode();
		};
		
		this.enablePhoneApproach = function(){
			$('#phoneApproachLink').css("color","#324784");
			$('#emailApproachLink').css("color","#c0c0c0");
			self.currentApproach('phone');
			self.clearInformation();
			self.updateSmsMode();
		};
		
		this.enableUserInteraction = function(){
			var hasactive = $('#loginArea').hasClass('active');
		    if(hasactive){
		    	$('.loginArea').removeClass('active');
		    	$('.bannerTit').addClass('active');
		    }else{			    	
		    	$('.loginArea').addClass('active');
		        $('.bannerTit').removeClass('active');
		    }
		};
		
		this.enableUserSignin = function(){
			self.xianshi(true);
			this.enableEmailApproach()
			var hasactive = $('#loginArea').hasClass('active');
		    if(hasactive){
		    	if(self.currentMode() == 'signin'){
		    		$('.loginArea').removeClass('active');
			    	$('.bannerTit').addClass('active');
		    	}		    		
		    	else
		    		self.currentMode('signin');
		    }else{
		    	self.currentMode('signin');
		    	$('.loginArea').addClass('active');
		        $('.bannerTit').removeClass('active');
		    }
		    self.clearInformation();
		    self.updateSmsMode();
		};
		
		this.enableUserSignup = function(){
			self.xianshi(false);
			var hasactive = $('#loginArea').hasClass('active');
		    if(hasactive){
		    	if(self.currentMode() == 'signup'){
		    		$('.loginArea').removeClass('active');
			    	$('.bannerTit').addClass('active');
		    	}
		    	else{
		    		self.currentMode('signup');
		    		self.enableEmailApproach();
		    	}
		    }else{
		    	self.currentMode('signup');
		    	self.enableEmailApproach();
		    	$('.loginArea').addClass('active');
		        $('.bannerTit').removeClass('active');
		    }
		    self.clearInformation();
		    self.updateSmsMode();
		};
		
		this.enableclose = function(){	    	
		    	$('.loginArea').removeClass('active');
		        $('.bannerTit').addClass('active');
		};
		this.updateSmsMode = function(){			
			self.currentSms.mode = 0;
			if(self.currentMode() === "signup")
				self.currentSms.mode = 1;
			else if(self.currentMode() === "signin")
				self.currentSms.mode = 2;
			else if(self.currentMode() === "reset")
				self.currentSms.mode = 3;
			self.hideMessage();
		};
		
		this.enableSignup = function(){
			self.currentMode('signup');
			self.clearInformation();
			self.updateSmsMode();
			self.enablePhoneApproach();
		};
		
		this.enableSignin = function(){
			this.enableEmailApproach()
			self.currentMode('signin');
			self.clearInformation();
			self.updateSmsMode();
		};
		
		this.enableReset = function(){
			self.currentMode('reset');
			self.clearInformation();
			self.updateSmsMode();
		};
		
		this.startCountdown = function(){
			self.resetCountdown();
			self.setCountdown();
		};
		
		this.setCountdown = function(){
            if (self.currentCountDown() == 0) {
                self.clearCountdown();
                return;
            } else {
            	var countdown = self.currentCountDown();
                countdown--;
                self.currentCountDown(countdown);
            }
            setTimeout(function() {self.setCountdown() }, 1000);
        };
		
		this.clearCountdown = function(){
			self.currentCountDown(0);
			self.inCountDown(false);
		};
		
		this.resetCountdown = function(){
			self.currentCountDown(self.smsCountdown);
			self.inCountDown(true);
		};
		
		this.getSmsCode = function(){
			if (!utilityService.validatePhone(self.phone())){
				self.showErrorMessage("手机号不正确！");
				return;		
			}
			self.updateSmsMode();
			self.currentSms.phone = self.phone();
			// should start count down here?
		//	self.startCountdown(); // TODO
			self.ursService.smsRequest(self.currentSms.mode, self.currentSms.area, self.currentSms.phone, self.getSmsCodeComplete, self.getSmsCodeError);			
		};
		
		this.getSmsCodeComplete = function(response){
			if(response.result){
				if(response.sms != null){
					self.currentSms = response.sms; // should success tip
					if(response.sms.status == 0){
						// start count down
						self.startCountdown();
					}
					else if(response.sms.status == 1)
						self.showErrorMessage("手机号已经存在！");					
					else if(response.sms.status == 2)
						self.showErrorMessage("手机号不存在！");
					else if(response.sms.status == 3)
						self.showErrorMessage("发送短信过于频繁！");
					else if(response.sms.status == 4)
						self.showErrorMessage("短信息发送异常！");
					else
						self.showErrorMessage("获取验证码失败！");
				}				
	        }
	        else        	
	        	self.showErrorMessage("获取验证码失败！");
		};
		
		this.getSmsCodeError = function(){			
			self.showErrorMessage("获取验证码异常，请稍后重新尝试！！");   	
		};
		this.getConfig=function(featureName){
            var feature=self.allFeatures();
            if(feature != 'undefined' ||feature != null){
                // feature = JSON.parse(feature);
                for(var i = 0; i <feature.length;i++){
                    //比较字符串是否相等,忽略大小写,忽略空格
                    if(feature[i].featureName.replace(/\s/g,"").toLowerCase() == featureName.replace(/\s/g,"").toLowerCase()){
                        return true;
                    }
                }
            }
            return false;
        }
		this.login = function() {
			self.loginManager.allFeatures([]);
			self.hideMessage();
		
			if(self.currentApproach() === "email"){
				if(self.account() === "" || self.password() === ""){
					self.showErrorMessage("账号或密码不能为空！");
					return;				
				}
				if(self.loginManager.isCloud()){
					if (!utilityService.validateEmail(self.account()) && !utilityService.validatePhone(self.account())){
						self.showErrorMessage("邮箱或手机号不正确！");
						return;		
					}
				}
				$.cookie("userAccount",self.account(), { expires: 36500 });
				$.cookie("password",self.password(), { expires: 36500 });
				ursService.getAesKey(function (data){
					self.loginManager.signIn(self.account(), loginManager.aesUtil.encrypt(self.password(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), self.accountSignInCallback);
				}, function (error){

				})

			}else{
				if(self.phone() === "" || self.smsCode() === ""){					
					self.showErrorMessage("手机号或验证码不能为空！");
					return;				
				}
				
				if (!utilityService.validatePhone(self.phone())){
					self.showErrorMessage("手机号不正确！");
					return;
				}
				// TODO self.currentSms.id
				self.loginManager.smsSignIn(self.currentSms.id, self.currentSms.mode, self.currentSms.area, self.phone(), self.smsCode(), self.phoneSignInCallback);
			}
		};
		
		this.loginSuccess = async function () {
			self.isLoginSucc(true);
			$.cookie("loginSucc", self.isLoginSucc());
			self.loginManager.isHint(true);
			// 检查登录状态和连接状态
			if ($.cookie('loginSucc') == "true") {
				await self.gotoShell();
			} 
		};
		
		self.loginManager.isConnect.subscribe(function(newValue) {
			if (!newValue) {
				if(self.loginManager.isQuit()){
					self.isLoginSucc(false);
					$.cookie("loginSucc", false);
					self.terminationLogin(true);
					// self.loginManager.logout();
					selectionManager.clear();
					loginManager.orgsReady(false);
					app.setRoot('app/viewmodels/index');
					if(self.loginManager.isHint()){
						notificationService.showError('登录失败, 超过最大同时登录个数!');

					}
				}
			}
		});
		
		this.gotoShell = async function () {
			// 等待 WebSocket 连接成功
			await self.loginManager.loginHandleWebSocketConnection();
			// 等待 1000ms
			await new Promise(resolve => setTimeout(resolve, 500));
			if (self.loginManager.isConnect()) {
				$(document.body).css({
					"overflow-y": "auto",
				});

				// 确保认证状态更新
				if (self.isAuthenticated()) {
					app.setRoot('app/viewmodels/shell');
				} else {
					// 等待 500ms 再尝试跳转
					await new Promise(resolve => setTimeout(resolve, 500));
					app.setRoot('app/viewmodels/shell');
				}
			}	
			
		};
		this.accountSignInCallback = function(signResult) {
	        if(signResult){
	        	$('.loginArea').addClass('active');		    	
		        $('.bannerTit').removeClass('active');		       
	        //	$('.select_organization').addClass('active');
		        self.loginSuccess();
	        }
	        else
	        	self.showErrorMessage("账号密码不匹配或注册后未激活！");
		};
		
		this.phoneSignInCallback = function(signResult) {
	        if(signResult){
	        	$('.loginArea').addClass('active');		    	
		        $('.bannerTit').removeClass('active');		       
	        //	$('.select_organization').addClass('active');
		        self.loginSuccess();
	        }
	        else
	        	self.showErrorMessage("手机号不存在或验证码错误！");
		};
		
		this.hideMessage = function(){
			self.hideSuccessMessage();
			self.hideErrorMessage();
			self.clearCountdown();
		};	
		
		this.hideSuccessMessage = function(){
			self.enableSuccessTip(false);
		};
		
		this.showErrorMessage = function(message){
			self.errorMessage(message);
			self.enableErrorTip(true);
		};
		
		this.hideErrorMessage = function(){
			self.errorMessage("");
			self.enableErrorTip(false);
		};

		this.guestSignup = function(){
			var nowDate=new Date()
			var y=nowDate.getFullYear()+""
			var m=nowDate.getMonth()+1+""
			var d=nowDate.getDate()+""
			var hh=nowDate.getHours()+""
			var mm=nowDate.getMinutes()+""
			var ss=nowDate.getSeconds()+""
			if(m<10)
				m="0"+m
			if(d<10)
				d="0"+d
			if(hh<10)
				hh="0"+hh
			if(mm<10)
				mm="0"+mm
			if(ss<10)
				ss="0"+ss
			var account ="Guest"+y+m+d+hh+mm+ss+"A"+Math.round(Math.random()*9+1)+"@antestin.com"
			self.ursService.getAesKey(function (data){
				ursService.guestSignup(account, loginManager.aesUtil.encrypt("123456", loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), function (){
					self.account(account)
					self.password("123456")
					self.currentApproach("email")
					self.login()
				},function (){

				})
			}, function (error){

			})
		}


		
		this.signup = function(){
			self.hideMessage();
			if(self.currentApproach() === "email"){
				if(self.account() === "" || self.password() === ""|| self.confirmpassword() === ""){
					self.showErrorMessage("邮箱及密码不能为空！");
					return;				
				}
				//账号后缀为不允许注册(@163.com, @qq.com, @sina.com, @gmail.com, @hotmail.com, @yahoo.com,@126.com)
				if(self.account().toLowerCase().indexOf("@126.com")!= -1||self.account().toLowerCase().indexOf("@163.com")!= -1 || self.account().toLowerCase().indexOf("@qq.com")!= -1 || self.account().toLowerCase().indexOf("@sina.com")!= -1 || self.account().toLowerCase().indexOf("@gmail.com")!= -1 || self.account().toLowerCase().indexOf("@hotmail.com")!= -1 || self.account().toLowerCase().indexOf("@yahoo.com")!= -1){
					self.showErrorMessage("请使用企业邮箱进行注册！");
					return;
				}		
				if(self.nameOrRespectfully() === ""){
					self.showErrorMessage("姓名不能为空！");
					return;				
				}
				if(!utilityService.validatePhone(self.phone())){ 
					self.showErrorMessage("手机号有误,请重新输入！");
					return false; 
				} 

				if(self.weiBoNumber() === ""){
					self.showErrorMessage("企业名称不能为空！");
					return;				
				}	
				if (!utilityService.validateEmail(self.account())){
					self.showErrorMessage("邮箱不正确！");
					return;		
				}				
				
				if(self.password() != self.confirmpassword()){
					self.showErrorMessage("密码不一致！");
					return;
				}
				if(self.hasInvitationCode() && (self.invitationOrgId() != null && self.invitationOrgId() != '' && self.invitationOrgId().length != 0) && (self.invitationOrgName() == null || self.invitationOrgName() == '' || self.invitationOrgName().length == 0)){
					self.showErrorMessage("请输入企业全称");
					return;
				}else if(self.hasInvitationCode() && (self.invitationOrgId() != null || self.invitationOrgId() != '' || self.invitationOrgId().length != 0) && (self.invitationOrgName() != null || self.invitationOrgName() != '' || self.invitationOrgName().length != 0)){
					ursService.varifyOrgByOrgId(self.invitationOrgId, self.invitationOrgName, self.varifyOrgComplete, self.varifyOrgError);
					return;
				}else{
					self.ursService.getAesKey(function (data){
						self.ursService.signup(self.account(),self.phone(),self.weiBoNumber(),self.department(),self.position1(),self.nameOrRespectfully(), loginManager.aesUtil.encrypt(self.password(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), self.invitationOrgId(), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), self.signupComplete, self.signupError);
					}, function (error){

					})
				}


			}
			else{
				if(self.phone() === "" || self.smsCode() === "" || self.password() === "" || self.confirmpassword() === ""){
					self.showErrorMessage("手机号、验证码及密码不能为空！");
					return;
				}

				if (!utilityService.validatePhone(self.phone())){
					self.showErrorMessage("手机号不正确！");
					return;
				}

				if(self.password() != self.confirmpassword()){
					self.showErrorMessage("密码不一致！");
					return;
				}
				if(self.hasInvitationCode() && (self.invitationOrgId() != null && self.invitationOrgId() != '' && self.invitationOrgId().length != 0) && (self.invitationOrgName() == null || self.invitationOrgName() == '' || self.invitationOrgName().length == 0)){
					self.showErrorMessage("请输入企业全称");
					return;
				}
				if(self.hasInvitationCode() && (self.invitationOrgId() != null && self.invitationOrgId() != '' && self.invitationOrgId().length != 0) && (self.invitationOrgName() == null || self.invitationOrgName() == '' || self.invitationOrgName().length == 0)){
					self.showErrorMessage("请输入企业全称");
					return;
				}else if(self.hasInvitationCode() && (self.invitationOrgId() != null || self.invitationOrgId() != '' || self.invitationOrgId().length != 0) && (self.invitationOrgName() != null || self.invitationOrgName() != '' || self.invitationOrgName().length != 0)){
					ursService.varifyOrgByOrgId(self.invitationOrgId, self.invitationOrgName, self.varifyOrgSmsComplete, self.varifyOrgError);
					return;
				}else{
					// TODO self.currentSms.id
					self.ursService.getAesKey(function (data){
						self.ursService.smsSignup(self.currentSms.id, self.currentSms.mode, self.currentSms.area, self.phone(), self.smsCode(), loginManager.aesUtil.encrypt(self.password(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), self.invitationOrgId(), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), self.smsSignupComplete, self.signupError);
					}, function (error){

					})
				}
			}
		}
		
		this.signupComplete = function(response){
			if(response.result){
				$.cookie("promoter", null);
				self.enableSuccessTip(true);
				self.hasInvitationCode(false)
				self.isChecked()
	        }
	        else{	        	
	        	self.showErrorMessage("邮箱已经存在！"); 	  	
	        }	
		};
		
		this.smsSignupComplete = function(response){
			if(response.result){
				$.cookie("promoter", null);
				self.enableSuccessTip(true);
				self.hasInvitationCode(false)
				self.isChecked()
	        }
	        else{	        	
	        	self.showErrorMessage("手机号已存在或验证码输入错误！"); 	  	
	        }	
		};

		this.varifyOrgComplete = function (response){
			if(response.result){
				self.ursService.getAesKey(function (data){
					self.ursService.signup(self.account(),self.phone(),self.weiBoNumber(),self.department(),self.position1(),self.nameOrRespectfully(), loginManager.aesUtil.encrypt(self.password(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), self.invitationOrgId(), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), self.signupComplete, self.signupError);
				}, function (error){

				})
			} else self.showErrorMessage("企业信息不匹配！");
		}
		this.varifyOrgSmsComplete = function (response){
			if(response.result){
				// TODO self.currentSms.id
				self.ursService.getAesKey(function (data){
					self.ursService.smsSignup(self.currentSms.id, self.currentSms.mode, self.currentSms.area, self.phone(), self.smsCode(), loginManager.aesUtil.encrypt(self.password(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), self.invitationOrgId(), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), self.smsSignupComplete, self.signupError);
				}, function (error){

				})			} else self.showErrorMessage("企业信息不匹配！");
		}
		
		this.signupError = function(){
			self.showErrorMessage("注册异常、请稍后重新尝试！");
		};

		this.varifyOrgError = function (){
			self.showErrorMessage("企业验证异常、请稍后重新尝试！");
		}
		
		this.selectOrganization = function() {			
			$.cookie("orgId", self.loginManager.selectedOrg().id);
			$.cookie("orgName", self.loginManager.selectedOrg().name);
			self.loginSuccess();
		};

		this.findPassword = function(){
			self.hideMessage();
			if(self.currentApproach() === "email"){
				if(self.account() === ""){
					self.showErrorMessage("邮箱不能为空！");
					return;				
				}
				
				if(!utilityService.validateEmail(self.account())){
					self.showErrorMessage("邮箱不正确！");
					return;	
				}				
				self.ursService.resetPassword(self.account(), self.findPasswordComplete, self.findPasswordError);
			}
			else{
				if(self.phone() === "" || self.smsCode() === "" || self.password() === "" || self.confirmpassword() === ""){
					self.showErrorMessage("手机号、验证码及密码不能为空！");
					return;				
				}
				
				if(!utilityService.validatePhone(self.phone())){
					self.showErrorMessage("手机号不正确！");
					return;	
				}
				
				if(self.password() != self.confirmpassword()){
					self.showErrorMessage("密码不一致！");
					return;
				}
				// TODO self.currentSms.id
				self.ursService.getAesKey(function (data){
					self.ursService.smsResetPassword(self.currentSms.id, self.currentSms.mode, self.currentSms.area, self.phone(), self.smsCode(), loginManager.aesUtil.encrypt(self.password(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey), self.smsFindPasswordComplete, self.findPasswordError);
				}, function (error){

				})
			}
		};
		
		this.findPasswordComplete = function(response){
			if(response.result){
				self.enableSuccessTip(true);
	        }
	        else{
	        	self.showErrorMessage("密码找回失败，请确认邮箱输入正确！");        	  	
	        }	
		};
		
		this.smsFindPasswordComplete = function(response){
			if(response.result){
				self.enableSuccessTip(true);
	        }
	        else{
	        	self.showErrorMessage("密码找回失败，请确认手机号与验证码输入正确！");        	  	
	        }	
		};
		
		self.findPasswordError = function(){
			self.showErrorMessage("密码找回异常，请稍后重新尝试！"); 	
		};	
		
		self.submitSuggestion = function(){
			self.ursService.submitSuggestion(self.suggestionUserName(), self.suggestionEmail(), self.suggestionContent(),self.submitSuggestionComplete, self.submitSuggestionComplete);
		};
		
		self.clearSuggestion = function(){
			self.suggestionUserName('');
			self.suggestionEmail('');
			self.suggestionContent('');
		};
		
		self.submitSuggestionComplete = function(response){
			self.clearSuggestion();
			$('.subsuggest').removeClass('active');
			$('.subsuggested').addClass('active');
		};
		
		self.restoreSuggestion = function(){
			self.clearSuggestion();
			$('.subsuggest').addClass('active');
			$('.subsuggested').removeClass('active');
		};
		
		self.gotoEmail = function() {
            var uurl = self.account();
            uurl = self.getEmailUrl(uurl);
            if (uurl != "") {
            	window.open("http://"+uurl, "_blank");               
            } else {
                alert("抱歉!未找到对应的邮箱登录地址，请自己登录邮箱查看邮件！");
            }
        };
       
        this.getEmailUrl = function(mail) {
            var subfix = mail.split('@')[1];
            subfix = subfix.toLowerCase();
            if (subfix == '163.com') {
                return 'mail.163.com';
            } else if (subfix == 'vip.163.com') {
                return 'vip.163.com';
            } else if (subfix == '126.com') {
                return 'mail.126.com';
            } else if (subfix == 'qq.com' || subfix == 'vip.qq.com' || subfix == 'foxmail.com') {
                return 'mail.qq.com';
            } else if (subfix == 'gmail.com') {
                return 'mail.google.com';
            } else if (subfix == 'sohu.com') {
                return 'mail.sohu.com';
            } else if (subfix == 'tom.com') {
                return 'mail.tom.com';
            } else if (subfix == 'vip.sina.com') {
                return 'vip.sina.com';
            } else if (subfix == 'sina.com.cn' || subfix == 'sina.com') {
                return 'mail.sina.com.cn';
            } else if (subfix == 'tom.com') {
                return 'mail.tom.com';
            } else if (subfix == 'yahoo.com.cn' || subfix == 'yahoo.cn') {
                return 'mail.cn.yahoo.com';
            } else if (subfix == 'tom.com') {
                return 'mail.tom.com';
            } else if (subfix == 'yeah.net') {
                return 'www.yeah.net';
            } else if (subfix == '21cn.com') {
                return 'mail.21cn.com';
            } else if (subfix == 'hotmail.com') {
                return 'www.hotmail.com';
            } else if (subfix == 'sogou.com') {
                return 'mail.sogou.com';
            } else if (subfix == '188.com') {
                return 'www.188.com';
            } else if (subfix == '139.com') {
                return 'mail.10086.cn';
            } else if (subfix == '189.cn') {
                return 'webmail15.189.cn/webmail';
            } else if (subfix == 'wo.com.cn') {
                return 'mail.wo.com.cn/smsmail';
            } else if (subfix == '139.com') {
                return 'mail.10086.cn';
            } else if (subfix == 'macrosoftsys.com') {
                return 'email.macrosoftsys.com';
            } else {
                return '';
            }
        };
        
        $(window).scroll(function() {
			if($(document).scrollTop()>750){
				$('#fixedright').fadeIn('400');
			}else{
				$('#fixedright').fadeOut('400');
			}
		});

		this.terminationLogin=ko.observable(false)
        this.attached = function(view, parent) {
			if ($.cookie('loginSucc') == "true"){
				self.isAuthenticated(true);
				self.existUserName($.cookie('userName'));
			}
			else
				self.isAuthenticated(false);
			self.enableEmailApproach();
			self.ursService.getConfigByAllFeature("utpclient",function(data){
				self.allFeatures(data.systemConfigs);
				if (self.getConfig('utpclient.auto_login')&&!self.terminationLogin()) {
					self.account($.cookie('userAccount'));
					self.password($.cookie('password'));
					self.currentApproach('email');
					self.login();
				}
			});
		};

		this.activate = function() {
			
			ursService.destroyGuestData(function (data){
				if(data){
					for(var i = 0; i < data.length; i++)
						ursService.destroyGuestDataByOrgId(data[i], function (data){

						}, function (error){

					})
					console.log("已删除"+data.length+"个游客数据")
				}
				// else console.log("无游客过期")

			},function (error){
				console.log(error)
			})
			loginManager.saveKeyToSession()
			$(document.body).css({
	             "overflow-y": "auto",	            
	         });
		};



		/** 滑图 */
		(function (window) {
			const l = 42, // 滑块边长
				r = 9, // 滑块半径
				w = 310, // canvas宽度
				h = 155, // canvas高度
				PI = Math.PI
			const L = l + r * 2 + 3 // 滑块实际边长

			function getRandomNumberByRange (start, end) {
				return Math.round(Math.random() * (end - start) + start);
			}

			function createCanvas (width, height) {
				const canvas = createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				return canvas;
			}

			function createImg (onload) {
				const img = createElement('img');
				img.crossOrigin = "Anonymous";
				img.onload = onload;
				img.onerror = () => {
					img.src = getRandomImg();
				}
				img.src = getRandomImg();
				return img;
			}

			function createElement (tagName, className) {
				const elment = document.createElement(tagName);
				elment.className = className;
				return elment;
			}

			function addClass (tag, className) {
				tag.classList.add(className);
			}

			function removeClass (tag, className) {
				tag.classList.remove(className);
			}

			function getRandomImg () {
				return 'https://picsum.photos/300/150/?image=' + getRandomNumberByRange(0, 1084);
			}

			function draw (ctx, x, y, operation) {
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
				ctx.lineTo(x + l, y);
				ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
				ctx.lineTo(x + l, y + l);
				ctx.lineTo(x, y + l);
				ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
				ctx.lineTo(x, y);
				ctx.lineWidth = 2;
				ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
				ctx.stroke();
				ctx[operation]();
				ctx.globalCompositeOperation = 'overlay';
			}

			function sum (x, y) {
				return x + y;
			}

			function square (x) {
				return x * x;
			}

			class jigsaw {
				constructor ({ el, onSuccess, onFail, onRefresh }) {
					el.style.position = el.style.position || 'relative';
					this.el = el;
					this.onSuccess = onSuccess;
					this.onFail = onFail;
					this.onRefresh = onRefresh;
				}

				init () {
					this.initDOM();
					this.initImg();
					this.bindEvents();
				}

				initDOM () {
					const canvas = createCanvas(w, h); // 画布
					const block = canvas.cloneNode(true); // 滑块
					const sliderContainer = createElement('div', 'sliderContainer');
					const refreshIcon = createElement('div', 'refreshIcon');
					const deleteIcon = createElement('div', 'deleteIcon');
					const IconFather = createElement('div', 'IconFather');
					const sliderMask = createElement('div', 'sliderMask');
					const slider = createElement('div', 'slider');
					const sliderIcon = createElement('span', 'sliderIcon');
					const text = createElement('span', 'sliderText');

					block.className = 'block';
					text.innerHTML = '向右滑动填充拼图';

					const el = this.el;
					el.appendChild(canvas);
					el.appendChild(IconFather);
					IconFather.appendChild(refreshIcon);
					IconFather.appendChild(deleteIcon);
					el.appendChild(block);
					slider.appendChild(sliderIcon);
					sliderMask.appendChild(slider);
					sliderContainer.appendChild(sliderMask);
					sliderContainer.appendChild(text);
					el.appendChild(sliderContainer);

					Object.assign(this, {
						canvas,
						block,
						sliderContainer,
						refreshIcon,
						deleteIcon,
						IconFather,
						slider,
						sliderMask,
						sliderIcon,
						text,
						canvasCtx: canvas.getContext('2d'),
						blockCtx: block.getContext('2d')
					})
				}

				initImg () {
					const img = createImg(() => {
						this.draw();
						this.canvasCtx.drawImage(img, 0, 0, w, h);
						this.blockCtx.drawImage(img, 0, 0, w, h);
						const y = this.y - r * 2 - 1;
						const ImageData = this.blockCtx.getImageData(this.x - 3, y, L, L);
						this.block.width = L;
						this.blockCtx.putImageData(ImageData, 0, y);
					})
					this.img = img;
				}

				draw () {
					// 随机创建滑块的位置
					this.x = getRandomNumberByRange(L + 10, w - (L + 10));
					this.y = getRandomNumberByRange(10 + r * 2, h - (L + 10));
					draw(this.canvasCtx, this.x, this.y, 'fill');
					draw(this.blockCtx, this.x, this.y, 'clip');
				}

				clean () {
					this.canvasCtx.clearRect(0, 0, w, h);
					this.blockCtx.clearRect(0, 0, w, h);
					this.block.width = w;
				}

				bindEvents () {
					this.el.onselectstart = () => false;
					this.deleteIcon.onclick=()=>{
						document.getElementById('captcha-father').remove();
					}
					this.refreshIcon.onclick = () => {
						this.reset();
						typeof this.onRefresh === 'function' && this.onRefresh();
					}

					let originX, originY, trail = [], isMouseDown = false;

					const handleDragStart = function (e) {
						originX = e.clientX || e.touches[0].clientX;
						originY = e.clientY || e.touches[0].clientY;
						isMouseDown = true;
					}

					const handleDragMove = (e) => {
						if (!isMouseDown) return false;
						const eventX = e.clientX || e.touches[0].clientX;
						const eventY = e.clientY || e.touches[0].clientY;
						const moveX = eventX - originX;
						const moveY = eventY - originY;
						if (moveX < 0 || moveX + 38 >= w) return false;
						this.slider.style.left = moveX + 'px';
						const blockLeft = (w - 40 - 20) / (w - 40) * moveX;
						this.block.style.left = blockLeft + 'px';

						addClass(this.sliderContainer, 'sliderContainer_active');
						this.sliderMask.style.width = moveX + 'px';
						trail.push(moveY);
					}

					const handleDragEnd = (e) => {
						if (!isMouseDown) return false;
						isMouseDown = false;
						const eventX = e.clientX || e.changedTouches[0].clientX;
						if (eventX == originX) return false;
						removeClass(this.sliderContainer, 'sliderContainer_active');
						this.trail = trail;
						const { spliced, verified } = this.verify();
						if (spliced) {
							if (verified) {
								addClass(this.sliderContainer, 'sliderContainer_success');
								typeof this.onSuccess === 'function' && this.onSuccess();
							} else {
								addClass(this.sliderContainer, 'sliderContainer_fail');
								this.text.innerHTML = '再试一次';
								this.reset();
							}
						} else {
							addClass(this.sliderContainer, 'sliderContainer_fail');
							typeof this.onFail === 'function' && this.onFail();
							setTimeout(() => {
								this.reset();
							}, 1000)
						}
					}
					this.slider.addEventListener('mousedown', handleDragStart);
					this.slider.addEventListener('touchstart', handleDragStart);
					document.addEventListener('mousemove', handleDragMove);
					document.addEventListener('touchmove', handleDragMove);
					document.addEventListener('mouseup', handleDragEnd);
					document.addEventListener('touchend', handleDragEnd);
				}

				verify () {
					const arr = this.trail; // 拖动时y轴的移动距离
					const average = arr.reduce(sum) / arr.length;
					const deviations = arr.map(x => x - average);
					const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length);
					const left = parseInt(this.block.style.left);
					return {
						spliced: Math.abs(left - this.x) < 10,
						verified: stddev !== 0, // 简单验证下拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
					}
				}

				reset () {
					this.sliderContainer.className = 'sliderContainer';
					this.slider.style.left = 0;
					this.block.style.left = 0;
					this.sliderMask.style.width = 0;
					this.clean();
					this.img.src = getRandomImg();
				}

			}

			window.jigsaw = {
				init: function (opts) {
					return new jigsaw(opts).init();
				}
			}
		}(window))
		this.botValifyInit = function () {
			var div = document.createElement("div"); //创建段落元素
			var div2 = document.createElement("div");
			div.id="captcha";//为该元素添加id
			div2.id = "captcha-father";
			document.body.appendChild(div2);//将元素添加到页面
			document.getElementById('captcha-father').style.display = "block";
			document.getElementById('captcha-father').appendChild(div);
			jigsaw.init({
				el: document.getElementById('captcha'),
				onSuccess: function () {
					setTimeout(function () {
						document.getElementById('captcha-father').remove();
						self.guestSignup();
					},100)
				}
			})
		}

	}
	return new IndexViewModel();
});
