define(
		[ 'jquery', 'durandal/app', 'lang', 'services/datatableManager',
				'services/langManager', 'services/viewManager', 'services/systemConfig',
				'services/loginManager', 'services/ursService', 'services/cmdConvertService', 'komapping',
				'services/selectionManager', 'services/executionManager',
				'services/projectManager', 'services/notificationService', 'knockout', "knockout-postbox", 'bootstrapSwitch','validator'],
		function($, app, lang, dtManager, langManager,
				viewManager,systemConfig, loginManager, ursService, cmdConvertService, komapping,
				selectionManager, executionManager, projectManager, notificationService, ko, bootstrapSwitch, validator) {

			function ShellViewModel() {
				var self = this;

				this.loginManager = loginManager;
				this.viewManager = viewManager;
				this.systemConfig = systemConfig;
				this.selectionManager = selectionManager;
				this.projectManager = projectManager;

				this.currentProject = ko.observable('');
				this.selectedProject = ko.observable({});
				
				this.busyPropInfo = ko.observable('');
				this.operationPropInfo = ko.observable('');
				this.errorPropInfo = ko.observable('');				
				this.userAccount = $.cookie("userName");
				this.userID = $.cookie("userID");
				this.currrentAccountType = ko.observable('');
				this.basicUserInformationMode = false;

				this.duration=ko.observableArray([
					// {id:1, showDuration:"10天", realDuration:0.33, discount:1.6},
					// {id:2, showDuration:"1个月", realDuration:1, discount:1},
					{id:3, showDuration:"3个月", realDuration:3, discount:1},
					{id:4, showDuration:"6个月",realDuration:6, discount:1},
					{id:5, showDuration:"12个月", realDuration:12, discount:1},
				]);
				this.toolTypeInfoList = ko.observableArray([]);
				this.toolTypeInfoListTotalAmount = ko.observable(0);
				this.purchaseByList = false;

				this.antbotTypes=ko.observableArray([]);
				this.typeAlias=ko.observable();
				this.selectedAntbotType=ko.observable();
				this.isBuy=ko.observable(false);
				this.isChooseType=ko.observable(false);
				this.antbotValidity=ko.observable("");
				this.selectedDurationVal=ko.observable()
				this.toolTypeDiscount = ko.observable()
				this.antbotPrice=ko.observable("0")
				this.allowProtocol=ko.observable(false) 
				this.antbotCount=ko.observable(1)
				this.antbotId=ko.observable()
				this.showDuration=ko.observable("")
				this.orgName = ko.observable()
				this.isGuest = false
				//监控分类值
				this.selectedAntbotTypeClassification = ko.observable();
				//不同的分类存入数组
				this. antbotClassification= ko.observableArray([]);
				//根据不同分类存入结果			
				this.classificationAntbotTypes = ko.observableArray([]);
				//根据分类值,来查询分类并存入classificationAntbotTypes数组			
				this.selectedAntbotTypeClassificationChanged = function(obj, event) {
					self.classificationAntbotTypes.removeAll()		
					for(let i = 0; i < self.antbotTypes().length; i++) {		
						//if (self.selectedAntbotTypeClassification() == self.antbotTypes()[i].classification)
						//	self.classificationAntbotTypes.push(self.antbotTypes()[i])
						if(self.selectedAntbotTypeClassification() == "未分类" && (self.antbotTypes()[i].classification == null || self.antbotTypes()[i].classification == 'null' || self.antbotTypes()[i].classification == '')){
							self.classificationAntbotTypes.push(self.antbotTypes()[i])}
						//获取分类值
						var c1=self.antbotTypes()[i].classification	
							//进行分割
						var arr1=(c1 || "").split(';')
							//var arr1=c1.split(';');
						for(var j=0;j<=arr1.length;j++){
							//判断已分割的值是否与接收值selectedAntbotTypeClassification相同
							if (self.selectedAntbotTypeClassification() == arr1[j]){
								self.classificationAntbotTypes.push(self.antbotTypes()[i])
							}
						}
					}			
				};
				this.guestIsCheck = function (){
					loginManager.guestCheck(true)
					$('#guestWarning').modal('hide')
				}

				this.subtractOne = function(){
					if(self.antbotCount()>1){
						self.antbotCount(Number(self.antbotCount())-1)
					}
					return
				}

				this.addOne = function(){
					self.antbotCount(Number(self.antbotCount())+1)
				}


				this.editingUser = {
						id : ko.observable(-1),
						mainAccountType : ko.observable(1),
						name : ko.observable(''),
						email : ko.observable(''),
						wechatNumber : ko.observable(''),
						weiBoNumber : ko.observable(''),
						phoneNumber : ko.observable(''),
						password : ko.observable(''),
						qqNumber : ko.observable(''),
						department : ko.observable(''),
						position : ko.observable(''),
						nameOrRespectfully : ko.observable(''),

					};
				
				this.editingPwd = {
						originalPwd : ko.observable(''),
						pwd : ko.observable(''),
						confirmedPwd : ko.observable(''),						
				};

				this.orderData={
					orderId:ko.observable(),
					subject:ko.observable(),
					showDuration:ko.observable(""),
					duration:ko.observable(),
					newValidity:ko.observable(),
					nowTime:ko.observable(),
					totalAmount:ko.observable()
				}
				this.toolTypeInfo={
					unitPrice:ko.observable(),
					count:ko.observable(),
					description:ko.observable(),
					toolTypeID:ko.observable(),
					discount:ko.observable(),
					isInUse:true
				}

				this.selectedAntbotTypeChanged = function(obj,event){
					self.antbotValidity(null)
					self.antbotPrice("0")
					if(self.selectedAntbotType()==undefined){
						self.isChooseType(false)
						self.isBuy(false)
						self.antbotPrice("0")
						self.antbotValidity(null)
						self.antbotId(null)
						return
					}
					else self.isChooseType(true)
					for(var i=0;i<self.antbotTypes().length;i++)
						if(self.selectedAntbotType()==self.antbotTypes()[i].name){
							self.antbotPrice(self.antbotTypes()[i].price)
							self.antbotId(self.antbotTypes()[i].id)
							break;
						}
					if(self.antbotValidity()==null )
						self.isBuy(false)
					else self.isBuy(true)
				}

				this.selectedDurationChanged = function(obj,event){
					for(var i=0; i<self.duration().length; i++)
						if(self.selectedDurationVal()==self.duration()[i].realDuration){
							self.showDuration(self.duration()[i].showDuration)
							self.toolTypeDiscount(self.duration()[i].discount)
							break
						}
				}
				
				this.typeAlias=function(selectedAntbotType){
					for(let i = 0; i < self.antbotTypes().length; i++) {
						if(this.antbotTypes()[i].name==selectedAntbotType){
							return this.antbotTypes()[i].alias
						}
					}
				}


				this.addCart = function(){
					var temp = {}
					temp.unitPrice = self.antbotPrice()
					temp.count = self.antbotCount()
					temp.description = self.typeAlias(self.selectedAntbotType())
					temp.toolTypeID = self.antbotId()
					temp.isInUse = true
					temp.discount = self.toolTypeDiscount()
					temp.showDuration = self.showDuration()
					temp.newValidity = self.getDate(self.selectedDurationVal())[1]
					var price=Number(temp.unitPrice)*Number(self.selectedDurationVal())*Number(temp.count*Number(temp.discount))
					temp.price=parseFloat(price.toFixed(2))

					self.toolTypeInfoListTotalAmount(parseFloat((Number(self.toolTypeInfoListTotalAmount())+Number(temp.price)).toFixed(2)))
					self.toolTypeInfoList.push(temp)

				}

				this.confirmToolTypeList = function (){

				}

				this.toolTypeListRemove = function (item){
					self.toolTypeInfoList.remove(item)
					self.toolTypeInfoListTotalAmount(parseFloat((Number(self.toolTypeInfoListTotalAmount())-Number(item.price)).toFixed(2)))
				}
				this.toolTypeListRemoveAll = function (){
					self.toolTypeInfoList.removeAll()
					self.toolTypeInfoListTotalAmount(0)
				}


				this.orderInfoProcess = function(){
					self.orderData.showDuration(self.showDuration())
					self.orderData.nowTime(self.getDate(self.selectedDurationVal())[0])
					self.orderData.newValidity(self.getDate(self.selectedDurationVal())[1])
				}

				this.toolTypeInfoProcess = function (){
					self.toolTypeInfo.description(self.typeAlias(self.selectedAntbotType()))
					self.toolTypeInfo.unitPrice(self.antbotPrice())
					self.toolTypeInfo.toolTypeID(self.antbotId())
					self.toolTypeInfo.count(self.antbotCount())
					self.toolTypeInfo.discount(self.toolTypeDiscount())
					var price=Number(self.antbotPrice())*Number(self.selectedDurationVal())*Number(self.antbotCount()*Number(self.toolTypeInfo.discount()))
					self.orderData.totalAmount(parseFloat(price.toFixed(2)))
					//支付宝界面中文乱码,暂时写成英文
					// self.orderData.subject(self.typeAlias(self.selectedAntbotType()))
					self.orderData.subject('UTP  Test Tools')

				}

				this.getDate = function (duration){
					var timeArr = []
					var nowDate=new Date()
					var y=nowDate.getFullYear()
					var m=nowDate.getMonth()+1
					var d=nowDate.getDate()
					var hh=nowDate.getHours()
					var mm=nowDate.getMinutes()
					var ss=nowDate.getSeconds()
					if(Number(m)<10)
						m='0'+m
					if(Number(d)<10)
						d='0'+d
					if(Number(hh)<10)
						hh='0'+hh
					if(Number(mm)<10)
						mm='0'+mm
					if(Number(ss)<10)
						ss='0'+ss
					timeArr[0]=y+"-"+m+"-"+d+" "+hh+":"+mm+":"+ss
					var bigMonth=[1,3,5,7,8,10,12]
					var littleMonth=[4,6,9,11]
					m=Number(m)
					d=Number(d)
					hh=Number(hh)
					mm=Number(mm)
					ss=Number(ss)
					if(duration>=1){
						y=Number(y)+parseInt((Number(m)+Number(duration))/12)
						m=(Number(m)+Number(duration))%12
						if(m==0){
							m=12
							y=Number(y)-1
						}
						if(d==31){
							for(var i=0; i<littleMonth.length; i++){
								if(littleMonth[i]==m){
									d%=30
									m+=1
									break
								}
							}
						}
						if(m==2 && d>28){
							if((y % 4 == 0 && y % 100 !=0) || y % 400 == 0){
								if(d>29)
									d%=29
							}else
								d%=28
							m+=1
						}
					}else {
						d+=10
						for (var i = 0; i < littleMonth.length; i++)
							if (littleMonth[i] == m && d > 30) {
								d %= 30
								m+=1
								break
							}
						for(var i=0; i<bigMonth.length; i++)
							if(bigMonth[i] == m && d > 31){
								d %= 31
								m+=1
								break
							}
						if(m==2 && d>28){
							if((y % 4 == 0 && y % 100 !=0) || y % 400 == 0){
								if(d>29)
									d%=29
							}else{
								if(d>28) d%=28
							}
							m+=1
						}

						if(m>12){
							m%=12
							y+=1
						}
					}
					if(Number(m)<10)
						m='0'+m
					if(Number(d)<10)
						d='0'+d
					if(Number(hh)<10)
						hh='0'+hh
					if(Number(mm)<10)
						mm='0'+mm
					if(Number(ss)<10)
						ss='0'+ss
					timeArr[1]=y+"-"+m+"-"+d+" "+hh+":"+mm+":"+ss
					return timeArr
				}

				this.showConfirmCartList = function(){
					if(self.isGuest) {
						notificationService.showWarnFromTop("该功能无法对游客开放，请注册！")
						return
					}
					if((self.editingUser.weiBoNumber() != null && self.editingUser.weiBoNumber() != ""
						&& self.editingUser.weiBoNumber().length != 0) && (self.editingUser.nameOrRespectfully() != null && self.editingUser.nameOrRespectfully() != ""
						&& self.editingUser.nameOrRespectfully().length != 0)){
						self.purchaseByList = true;
						self.orderInfoProcess()
						$('#confirmCartList').modal('show')
						return
					}
					notificationService.showWarn('请先完善企业信息')
					self.cancelThePurchase()
					self.userEdit()
				}

				this.showConfirmOrder = function(){
					if(self.isGuest) {
						notificationService.showWarnFromTop("该功能无法对游客开放，请注册！")
						return
					}

					if((self.editingUser.weiBoNumber() != null && self.editingUser.weiBoNumber() != ""
						&& self.editingUser.weiBoNumber().length != 0) && (self.editingUser.nameOrRespectfully() != null && self.editingUser.nameOrRespectfully() != ""
						&& self.editingUser.nameOrRespectfully().length != 0)){
						self.purchaseByList = false;
						self.toolTypeInfoProcess()
						self.orderInfoProcess()
						$('#confirmOrder').modal('show')
						return
					}

					notificationService.showWarn('请先完善企业信息')
					self.cancelThePurchase()
					self.userEdit()
				}

				this.showPurchaseProtocol = function(){
					$('#userPurchaseProtocol').modal('show')
				}
				this.isAllow = function(){
					self.allowProtocol(true)
				}

				this.cancelThePurchase = function(data){
					if(data=="consider"){
						self.toolTypeInfo.description(null)
						self.toolTypeInfo.unitPrice(null)
						self.orderData.showDuration(null)
						self.orderData.duration(null)
						self.toolTypeInfo.count(null)
						self.orderData.newValidity(null)
						self.orderData.nowTime(null)
						self.orderData.totalAmount(null)
						self.allowProtocol(false)
						$('#confirmOrder').modal('hide')
						$('#confirmCartList').modal('hide')
					}
					else{
						self.antbotId(null)
						self.selectedAntbotType(undefined)
						self.showDuration(null)
						self.selectedDurationVal(undefined)
						self.antbotCount(1)
						self.antbotPrice(null)
						self.antbotValidity(null)
						self.isChooseType(false)
						$('#tool-purchase').modal('hide')
					}
				}

				this.toPay = function (){
					var orderId=self.getOrderId()
					self.orderData.orderId(orderId)
					ursService.saveOrderInfo($.cookie("orgId"),$.cookie("userID"),self.orderData,self.toolTypeInfo,self.toolTypeInfoList(),self.purchaseByList,self.saveOrderInfoSuccessFunction,self.saveOrderInfoErrorFunction)
				}

				this.saveOrderInfoSuccessFunction = function(){
					var userName=null
					if(self.editingUser.phoneNumber()!=null && self.editingUser.phoneNumber() != "" && self.editingUser.phoneNumber().length != 0)
						userName=self.editingUser.phoneNumber()
					if(self.editingUser.email()!=null && self.editingUser.email() != "" && self.editingUser.email().length != 0)
						userName=self.editingUser.email()
					var subject = ''
					var totalAmount = 0
					if(self.purchaseByList){
						for(var i = 0; i < self.toolTypeInfoList().length; i++){
							if(i == self.toolTypeInfoList().length - 1){
								subject += self.toolTypeInfoList()[i].description
								break
							}
							subject += self.toolTypeInfoList()[i].description + "+"
							if(i == 5){
								subject += self.toolTypeInfoList()[i].description + " about " + self.toolTypeInfoList().length + "in all"
								break
							}
						}
						totalAmount = self.toolTypeInfoListTotalAmount()
					}
					else{
						subject = self.orderData.subject()
						totalAmount = self.orderData.totalAmount()
					}
					//支付宝界面中文乱码,暂时写成英文
					subject = 'UTP  Test Tools'
					ursService.toPay(self.orderData.orderId(),subject ,totalAmount)
				}
				this.saveOrderInfoErrorFunction = function(){

				}


				this.getOrderId = function(){
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
					var nowDate=y+m+d+hh+mm+ss+"00100"+Math.round(Math.random()*89999998+10000001)
					return nowDate.slice(0,25)
				}

				this.initPwd = function(){
					self.editingPwd.originalPwd('');
					self.editingPwd.pwd('');
					self.editingPwd.confirmedPwd('');
				}
				
				this.logout = function() {
					self.loginManager.logout();
					cmdConvertService.clear();
					selectionManager.clear();
					projectManager.projects([]);
					loginManager.orgsReady(false);
					$.cookie("loginSucc", null);
					$.cookie("userName", "");
					$.cookie("password", "");
					$.cookie("authorizationKey", null);
					$.cookie("orgName", null);
					$.cookie("orgId", null);
					$.cookie("lastSelectedProject", null);					
					app.setRoot('app/viewmodels/index');
				};	
				
				this.userEdit = function(){
					$('#UserEditModal').modal('show');
				}
				
				this.gotomain = function(){
					self.loginManager.isQuit(false);
					self.loginManager.loginWebsocketData.close();
					self.viewManager.testcaseActivePage('');
					app.setRoot('app/viewmodels/index');
				}
				
				this.gotoWorkbench = function(){
					self.viewManager.activePage('app/viewmodels/workbench');
				}
				
				this.gotoProject = function(){
					self.viewManager.activePage('app/viewmodels/project');
				}
				
				this.loadSelectedProjectFail = function(){
					self.gotoProject();
				}
				
				this.getUserSuccessFunction = function(response){
					if(response && response.result && response.user != null && response.user.organization > 0){						
							self.editingUser.id(response.user.id);
							self.editingUser.name(response.user.name);
							self.editingUser.mainAccountType(response.user.mainAccountType.id);
							self.currrentAccountType(response.user.mainAccountType.name);
							self.editingUser.email(response.user.email);
							self.editingUser.wechatNumber(response.user.wechatNumber);
							self.editingUser.weiBoNumber(response.user.weiBoNumber);
							self.editingUser.phoneNumber(response.user.phoneNumber);
							self.editingUser.password(response.user.password);
							self.editingUser.qqNumber(response.user.qqNumber);
							self.editingUser.department(response.user.department);
							self.editingUser.position(response.user.position);
							self.editingUser.nameOrRespectfully(response.user.nameOrRespectfully);
					}
					else
						self.getUserErrorFunction();
				}
				
				this.getUserErrorFunction = function(){
					notificationService.showError('获取用户最新信息失败！');
					self.cancelUserConfig();
				}
				
				this.getUser = function(){					
					ursService.getUser($.cookie("userID"),
							self.getUserSuccessFunction, self.getUserErrorFunction);
				}
				this.permissionErrorFunction = function () {
					notificationService.showError('该功能无法使用,请安装相应许可！');
				};
				this.showTestProtocol = function(){
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.proto_mgr')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					$('#protocolConfigModal').modal('show');
				};
				//关闭模态框
				this.closeProtocolConfigModal = function () {
					$('#protocolConfigModal').modal('hide');
					self.viewManager.protocolActivePage(null);
				};

				this.showTestSignalProtocol = function () {
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.signal_mgr')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					$('#signalProtocolConfigModal').modal('show');
				};
				this.showLicense = function () {
					//发起请求
					ursService.getLicense(function (data){
						if(data && data.result){
							self.licenseId(data.licenseId)
							if(data.licenseType == 1){
								self.licenseTime("永久许可")
							}else {
								if (data.licenseId==''||data.licenseTime==0){
									self.licenseTime("无许可信息")
								}else {
									//将精确到秒的data.licenseTime时间戳转换成时间日期格式
									var time = new Date(data.licenseTime*1000).toLocaleString()
									self.licenseTime(time)
								}

							}
						}else
							notificationService.showError('获取许可失败！');
							return;
					}, function (error){
						notificationService.showError('获取许可失败！');
					})
					$('#licenseModal').modal('show');
				};
				this.licenseId = ko.observable();
				this.licenseTime = ko.observable();
				this.showPurchasePage = function(){
					if(self.loginManager.haveBeenLogout){
						self.toolTypeInfoList.removeAll()
						self.toolTypeInfoListTotalAmount(0)
						self.loginManager.haveBeenLogout = false
					}
					self.getUser();
					$('#tool-purchase').modal('show')
				}

				this.invitationOrgId=ko.observable()
				this.invitationOrgName=ko.observable()
				this.showMembersInvitation = function(){
					if(self.isGuest) {
						notificationService.showWarnFromTop("该功能无法对游客开放，请注册！")
						return
					}
					self.invitationOrgId($.cookie("orgId"))
					self.invitationOrgName($.cookie("orgName"))
					$('#MembersInvitation').modal('show')
				}
				this.enterpriseInfoCopy = function(){
					var aux = document.createElement("input")
					// var content= "企业注册代码:"+$.cookie("orgId")+",企业全称:"+$.cookie("orgName")+",注册链接：https://utpcloud.macrosoftsys.com 苏州宏控软件系统有限公司"
					// aux.setAttribute("value",content)
					// document.body.appendChild(aux)
					// aux.value=content
					aux.select()
					document.execCommand("copy")
					// document.body.removeChild(aux)
					// notificationService.showSuccess("复制成功")
					notificationService.showWarnFromTop("功能暂未完善，请手动复制：选择复制内容，点击此按钮 ")
					// $('#MembersInvitation').modal('hide');
				}

				this.initLastProject = function(){
					self.projectManager.loadAgentTypeValidity(loginManager.getOrganization(),loginManager.getAuthorizationKey())
					self.projectManager.getProjects(loginManager.getOrganization(), 
						function() {
							self.viewManager.featureInit();
							if (self.projectManager.projects().length != 0) {
								var lastSelectedPrjId = $.cookie("lastSelectedProject");
								var selectedPrjMapping = false;
								for (var i = 0; i < self.projectManager.projects().length; i++) {
									if (self.projectManager.projects()[i].id == lastSelectedPrjId) {
										selectionManager.selectedProject(self.projectManager.projects()[i]);
										selectedPrjMapping = true;
										break;
									}
								}
								if(selectedPrjMapping){
									self.projectManager.loadProjectSuccessFunction = self.gotoWorkbench;
									self.projectManager.loadProjectErrorFunction = self.loadSelectedProjectFail;
									self.projectManager.loadProjectConfig();
									return;
								}													
							}
							self.gotoProject();
						}, 
						function(){
							notificationService.showError('加载项目失败');
						});
				};
				
				this.basicInformationUpdate = function(){
					self.basicUserInformationMode = true;
				}
				
				this.pwdInformationUpdate = function(){
					self.basicUserInformationMode = false;
				}
				
				this.submitInformation = function(){
					if(self.isGuest) {
						notificationService.showWarnFromTop("该功能无法对游客开放，请注册！")
						return
					}
					if(self.basicUserInformationMode)
						self.updateUser();
					else
						self.updatePwd();
				}
				
				this.updatePwd = function(){
					if(self.editingPwd.pwd() == ""){
						notificationService.showError('输入密码不能为空！');
						return;
					}						
					if(self.editingPwd.pwd() === self.editingPwd.confirmedPwd()){
						self.cancelUserConfig();
						ursService.getAesKey(function (data){
							ursService.updatePwd(self.userID, loginManager.aesUtil.encrypt(self.editingPwd.originalPwd(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), loginManager.aesUtil.encrypt(self.editingPwd.pwd(), loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20)))), loginManager.rsaUtil.encrypt(loginManager.rsaUtil.decrypt(data.aesKey, loginManager.aesUtil.decrypt(sessionStorage.getItem("RsaPriKey"), sessionStorage.getItem("AesKey").slice(4,20))), loginManager.rsaPublicKey),
								function(data) {
									if (data && data.result == true){
										notificationService.showSuccess('密码更新成功');
									}
									else
										notificationService.showError('密码更新失败！');
								},
								function(error) {
									notificationService.showError('密码更新失败！');
								});
						}, function (error){

						})

					}
					else
						notificationService.showError('输入密码不一致！');
				}
				
				this.updateUser = function(){
					if((self.editingUser.weiBoNumber() != null && self.editingUser.weiBoNumber() != ""
						&& self.editingUser.weiBoNumber().length != 0) && (self.editingUser.nameOrRespectfully() != null && self.editingUser.nameOrRespectfully() != ""
							&& self.editingUser.nameOrRespectfully().length != 0)){
						self.cancelUserConfig();
						ursService.updateUser(komapping.toJS(self.editingUser),
							function(data) {
								if (data && data.result == true)
									notificationService.showSuccess('用户基本信息更新成功');
								else
									notificationService.showError('用户基本信息更新失败！');
							}, function(error) {
								notificationService.showError('用户基本信息更新失败！');
							});
						return
					}
					notificationService.showWarn('请完善企业信息')
				}
				
				this.cancelUserConfig = function() {
					$('#UserEditModal').modal('hide');
				};
				
				this.activate = function() {

					cmdConvertService.loadResources(loginManager.getOrganization(),
							loginManager.getAuthorizationKey());
					ursService.getAllAgentType(loginManager.getOrganization(),
						loginManager.getAuthorizationKey(),self.loadAllAgentTypeSuccessFunction, self.loadAllAgentTypeErrorFunction);
				};

				this.loadAllAgentTypeSuccessFunction = function(allAgentTypeList){
					if(allAgentTypeList != null && allAgentTypeList != ""){
						self.antbotTypes.removeAll();
						var temp={};
						var isNull=false;
						for (var i=0;i<allAgentTypeList.toolTypes.length;i++){
							self.antbotTypes.push(allAgentTypeList.toolTypes[i])									
							if((allAgentTypeList.toolTypes[i].classification == null || allAgentTypeList.toolTypes[i].classification == 'null' || allAgentTypeList.toolTypes[i].classification == "") && self.antbotClassification().findIndex(t => t.type === "未分类") == -1){
								isNull = true
							}
							else if(allAgentTypeList.toolTypes[i].classification != null && allAgentTypeList.toolTypes[i].classification != 'null' && allAgentTypeList.toolTypes[i].classification != "" && self.antbotClassification().findIndex(t => t.type === allAgentTypeList.toolTypes[i].classification) == -1) {				
								//获取分类值
								var classification1=allAgentTypeList.toolTypes[i].classification;

								//判断是否是多个分类
								if(classification1.indexOf(";")!=-1){
									var arr=classification1.split(';');
									for (var j=0;j<arr.length;j++){
										if(self.antbotClassification().findIndex(t => t.type === arr[j]) == -1){
										temp = {type: arr[j]}
										self.antbotClassification.push(temp);}
									}
								}else{
									temp = {
										type: allAgentTypeList.toolTypes[i].classification
									}
									self.antbotClassification.push(temp)
								}
								
							}											
						}
						if(isNull){
							var temp = {
									type: "未分类"
								}
							self.antbotClassification.push(temp)
						}		
					}
				}
				this.loadAllAgentTypeErrorFunction = function(response){
					console.log("error")
				}

				this.attached = function(view, parent) {
					self.isGuest = $.cookie("isGuest")
					self.isGuest = JSON.parse(self.isGuest)
					if(self.isGuest && !loginManager.guestCheck())
						$('#guestWarning').modal('show')
					self.initLastProject();
					$('#UserEditModal').on('shown.bs.modal', function() {
						self.orgName($.cookie('orgName'))
						self.getUser();
						self.initPwd();
					});
					$('#protocolConfigModal').on('shown.bs.modal', function() {
						self.viewManager.protocolActivePage('app/viewmodels/protocol');
					});
					// 信号管理
					$('#signalProtocolConfigModal').on('shown.bs.modal', function() {
						self.viewManager.signalProtocolActivePage('app/viewmodels/signalProtocol');
					});
				};
				
				this.compositionComplete = function(parent, child, settings) {				
					window.lang = new Lang('en');
					window.lang.dynamic('zh',
							'./dist/js/langpack/zh.json');

					// we can change language by following code:
					//window.lang.change('zh');

					window.lang.afterUpdate = function(currentLang, newLang) {
						langManager.currentlang = newLang;
						for ( var key in dtManager.tableDict) {
							dtManager.bindingDataTable(key);
						}
					}
				};
			}
			return new ShellViewModel();
		});
