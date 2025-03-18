define([ 'knockout', 'jquery', 'services/ursService', 'jsencrypt', 'crypto/crypto-js' ], function(ko, $, ursService, jsencrypt, crypto) {
		function loginManager() {
			// default use email.
			var self = this;
			var assignedAuthorizationKey = "";
			this.ursService = ursService;
			this.signInCallback = null;
			this.selectedOrg = ko.observable();
			this.orgs = ko.observableArray([]);
			this.orgsReady = ko.observable(false);			
			this.account = "";
			this.allFeatures = ko.observableArray([]);
			this.guestCheck = ko.observable(false)
			this.isCloud = ko.observable(config.utpConfig.isCloud)
			this.haveBeenLogout = true;
			this.rsaPublicKey = config.utpConfig.rsaPublicKey

			this.autoIntoProject=ko.observable(false);
			this.autoIntoSpecialTest=ko.observable(false);

			this.isTestAccount = function(){			
				var isTestAccount = $.cookie("isTestAccount");
				return isTestAccount === 'true' ? true : false;
			}
			
			this.getTestAccountOrgId = function(){				
				return $.cookie("testAccountOrgId");
			}
			
			this.getAuthorizationKey = function() {
				if ($.cookie("authorizationKey") != undefined && $.cookie("authorizationKey") != "") {
						return $.cookie("authorizationKey");
				}
				return "";
			};

			this.getUserName = function() {
				if ($.cookie("userName") != undefined && $.cookie("userName") != "") {
					return $.cookie("userName");
				}
				return "";
			};

			this.getOrganization = function() {
				if ($.cookie("orgId") != undefined && $.cookie("orgId") != "") {
					return $.cookie("orgId");
				}
				return "";
			};

			this.signIn = function(account, password, ciphertextAesKey, callback) {
				self.signInCallback = callback;
				self.account = account;
				self.ursService.getAuthorizationKey(account,
							password, ciphertextAesKey, self.signInSuccessFunction,
							self.errorFunction);				
			};
			
			this.smsSignIn = function(id, mode, area, phone, code, callback) {
				self.signInCallback = callback;
				self.account = phone;			
				self.ursService.smsAuthorization(id, mode, area, phone, code, self.signInSuccessFunction,
							self.errorFunction);				
			};
			
			this.signInSuccessFunction = function(response) {
				if(response.result)
					self.userLoginCallback(response.authorizationKey, response.user);
				else
					self.signInCallback(false);
			};			
			
			this.getUserSuccessFunction = function(response) {
				if(response && response.result){
					if(response.user != null && response.user.organization > 0)										
						self.ursService.getOrganizationById(response.user.organization, self.getOrganizationSuccessFunction, self.errorFunction);								
					else
						self.signInCallback(false);
				}
				else
					self.signInCallback(false);				
			};

			this.errorFunction = function(response) {
				self.signInCallback(false);
			};
			
			this.isTestAccountSuccessFunction = function(response){
				if(response && response.result){
					$.cookie("isTestAccount", response.testAccount);
					$.cookie("testAccountOrgId", response.orgId);
				}
				else
					self.isTestAccountErrorFunction();
			};
			
			this.isTestAccountErrorFunction = function(response){
				$.cookie("isTestAccount", false);
				$.cookie("testAccountOrgId", null);
			};
			
			this.userLoginCallback = function(authorizationKey, user) {
				if (authorizationKey == undefined
						|| authorizationKey == null
						|| authorizationKey == "") {
					$.cookie("authorizationKey", "");
					self.signInCallback(false);
				} else {
					var encodedAuthrizationKey = encodeURIComponent(authorizationKey);
					$.cookie("authorizationKey", encodedAuthrizationKey, { expires: 36500 });
					$.cookie("userName", self.account, { expires: 36500 });
					$.cookie("userID", user.id, { expires: 36500 });
					$.cookie("userEmail", user.email, { expires: 36500 });
					$.cookie("mainAccountType", user.mainAccountType, { expires: 36500 });
					$.cookie("isGuest", user.guest, { expires: 36500 });
					self.ursService.getUser(user.id,
							self.getUserSuccessFunction, self.errorFunction);
					
					self.ursService.isTestAccount(user.id,
							self.isTestAccountSuccessFunction, self.isTestAccountErrorFunction);
					/*
					var orgs = self.ursService.getOrganizationList($
							.cookie("userName"), $
							.cookie("authorizationKey"),
							self.getOrganizationListSuccessFunction,
							self.getOrganizationListErrorFunction);
					*/
				}
			};
			this.getConfigByModule=function(userAccount,moduleName){
				self.ursService.getConfigByModule(userAccount,moduleName,self.getConfigByModuleSuccessFunction,self.getConfigByModuleErrorFunction);
			}
			self.getConfigByModuleSuccessFunction=function(response){
				if (response && response.result) {
					// $.cookie("feature", encodeURIComponent(JSON.stringify(response.systemConfigs)));
					//清空之前的数据
					self.allFeatures.removeAll();
					self.allFeatures.push.apply(self.allFeatures, response.systemConfigs);
					// self.allFeatures(response.systemConfigs);
				} else {
					 self.signInCallback(false);}
			}
			this.getConfigByModuleErrorFunction=function(response){
				self.signInCallback(false);
			}
			this.getOrganizationSuccessFunction = function(response) {
				if(response && response.result){
					if(response.organization){
						$.cookie("orgId", response.organization.id);
						$.cookie("orgName", response.organization.name);
						self.getConfigByModule($.cookie("userName"),"utpclient");
						// $.cookie("orgFeature", encodeURIComponent(response.organization.feature));
						self.orgsReady(true);
						self.signInCallback(true);
					}
					else
						self.signInCallback(false);
				}				
				else				
					self.signInCallback(false);							
			};
			
			this.getOrganizationListSuccessFunction = function(orgs) {
					// id,name
				for (var i = 0; i < orgs.length; i++) {
					self.orgs.push({
						id : orgs[i].id,
						name : orgs[i].name
					});
					if (i == 0 && ($.cookie("orgId") == undefined || $.cookie("orgId") == "")) {
						$.cookie("orgId", orgs[0].id);
						$.cookie("orgName", orgs[0].name);
					}
				}
				self.orgsReady(true);
				self.signInCallback(true);
			};

			this.getOrganizationListErrorFunction = function() {};

			this.saveKeyToSession = function (){
				if(sessionStorage.getItem("RsaPubKey") == null || sessionStorage.getItem("RsaPriKey") == null || sessionStorage.getItem("AesKey") == null){
					sessionStorage.removeItem("RsaPubKey")
					sessionStorage.removeItem("RsaPriKey")
					sessionStorage.removeItem("AesKey")
					var RsaKeyPair = self.rsaUtil.genKeyPair()
					var AesKey = self.aesUtil.genKey()
					sessionStorage.setItem("RsaPubKey", self.aesUtil.encrypt(RsaKeyPair.publicKey, AesKey))
						sessionStorage.setItem("RsaPriKey", self.aesUtil.encrypt(RsaKeyPair.privateKey, AesKey))
					sessionStorage.setItem("AesKey", self.mix(AesKey))
				}else self.rsaUtil.genKeyPair()
			}

			this.aesUtil = {
				//获取key
				genKey : function (length = 16) {
					let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
					let str = "";
					for (let i = 0; i < length; i++) {
						str  = str + random.charAt(Math.random() * random.length)
					}
					return str;
				},

				//加密
				encrypt : function (plaintext,key) {
					if (plaintext instanceof Object) {
						//JSON.stringify
						plaintext = JSON.stringify(plaintext)
					}
					let encrypted = crypto.AES.encrypt(crypto.enc.Utf8.parse(plaintext), crypto.enc.Utf8.parse(key), {mode:crypto.mode.ECB,padding: crypto.pad.Pkcs7});
					return encrypted.toString();
				},

				//解密
				decrypt : function (ciphertext,key) {
					let decrypt = crypto.AES.decrypt(ciphertext, crypto.enc.Utf8.parse(key), {mode:crypto.mode.ECB,padding: crypto.pad.Pkcs7});
					let decString = crypto.enc.Utf8.stringify(decrypt).toString();
					if(decString.charAt(0) === "{" || decString.charAt(0) === "[" ){
						//JSON.parse
						decString = JSON.parse(decString);
					}
					return decString;
				}
			}

			this.rsaUtil = {
				//RSA 位数，这里要跟后端对应
				bits : 2048,

				//当前JSEncrypted对象
				thisKeyPair: {},

				//生成密钥对(公钥和私钥)
				genKeyPair: function (bits = self.rsaUtil.bits) {
					let genKeyPair = {};
					self.rsaUtil.thisKeyPair = new jsencrypt({default_key_size: bits});

					//获取私钥
					genKeyPair.privateKey = self.rsaUtil.thisKeyPair.getPrivateKey();

					//获取公钥
					genKeyPair.publicKey = self.rsaUtil.thisKeyPair.getPublicKey();

					return genKeyPair;
				},

				//公钥加密
				encrypt: function (plaintext, publicKey) {
					if (plaintext instanceof Object) {
						//1、JSON.stringify
						plaintext = JSON.stringify(plaintext)
					}
					publicKey && self.rsaUtil.thisKeyPair.setPublicKey(publicKey);
					return self.rsaUtil.thisKeyPair.encrypt(JSON.stringify(plaintext));
				},

				//私钥解密
				decrypt: function (ciphertext, privateKey) {
					privateKey && self.rsaUtil.thisKeyPair.setPrivateKey(privateKey);
					let decString = self.rsaUtil.thisKeyPair.decrypt(ciphertext);
					if(decString.charAt(0) === "{" || decString.charAt(0) === "[" ){
						//JSON.parse
						decString = JSON.parse(decString);
					}
					return decString;
				}
			}

			this.mix = function (k){
				let random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for (let i = 0; i < 4; i++) {
					k  = random.charAt(Math.random() * random.length) + k
				}
				for (let i = 0; i < 4; i++) {
					k  = k + random.charAt(Math.random() * random.length)
				}
				return k
			}
			this.isConnect =ko.observable(false);
			this.loginWebsocketAddress = ko.observable();
			this.loginHandleWebSocketConnection = async function () {
				  // 断开之前的连接
				if (self.loginWebsocketData) {
					self.loginWebsocketData.close();
				}
				try {
					
					let address = config.ursConfig.ursAddr.replace("http", "ws");
					var webAddress = address + "/UrsClientWebSocket?"+ $.cookie('userName');
					self.loginWebsocketAddress(webAddress);
					await self.loginWebsocket();
				} catch (error) {
					console.log("连接错误");
					self.isConnect(false);
					self.isQuit(true);
				}
			}
			this.isQuit = ko.observable(false);
			this.loginWebsocketData="";
			this.loginWebsocket = function () {
				return new Promise((resolve, reject) => {
					self.loginWebsocketData = new WebSocket(self.loginWebsocketAddress());
					// 定义WebSocket事件处理函数
					self.loginWebsocketData.onopen = function (evt) {
						console.log("连接已建立");
						self.isConnect(true);
						self.isQuit(false);
						resolve(self.isConnect()); // 使用resolve来解决Promise
					};
					self.loginWebsocketData.onclose = function (evt) {
						console.log("连接已关闭");
						self.isConnect(false);
						reject(self.isConnect()); // 使用reject来拒绝Promise
					};
					self.loginWebsocketData.onmessage = function (evt) {
						console.log("收到消息: " + evt.data);
						if(evt.data === "连接数超过限制"){
							self.isQuit(true);
							self.isConnect(false);
						}
					
					};
					self.loginWebsocketData.onerror = function (evt) {
						self.isConnect(false);
						self.isQuit(true);
						reject(self.isConnect()); // 使用reject来拒绝Promise
					};
				});
			};
			this.isHint=ko.observable(true);
			this.logout = function() {
				self.isHint(false);
				if(self.loginWebsocketData){
					self.isQuit(true);
					self.loginWebsocketData.close();
				}
				$.cookie("authorizationKey", "");
				$.cookie("orgId", -1);
				$.cookie("orgName", "");
				// $.cookie("userName","")
				self.haveBeenLogout = true;
				self.guestCheck(false)
				self.orgs([]);
				self.selectedOrg('');
				self.allFeatures([]);
			};
		}
		return new loginManager();
	})
