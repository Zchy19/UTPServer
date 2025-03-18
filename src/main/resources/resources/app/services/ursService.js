define([ 'knockout', 'jquery', 'jquerycookie', 'durandal/plugins/http','komapping', 'services/ajaxService', 'services/config'],
		function(ko, $, JCookie, $http, komapping, ajaxService) {
	
	function ursService() {
	    var self = this;
	    var ursUrlPrefix = config.ursConfig.ursAddr;//"http://localhost:6600";
		// default use email.		
		
	    this.signup = function(username,phone,weiBoNumber,department,position1,nameOrRespectfully,password, orgId, ciphertextAesKey, successFunction, errorFunction){
	    	var queryObj = new Object();
	    	queryObj.mainAccountType = 1; // default type: email
	    	queryObj.email = username;
	    	queryObj.password = password;
	    	
		queryObj.department=department;
	
		queryObj.position=position1;
		queryObj.nameOrRespectfully=nameOrRespectfully;

			
	    	queryObj.invitationID = -1;
	    	queryObj.name = username;	    	
	    	queryObj.qqNumber = null;
	    	queryObj.wechatNumber = null;
	    	queryObj.weiBoNumber = weiBoNumber;
	    	queryObj.phoneNumber = phone;
	    	queryObj.id = -1;
	    	queryObj.organization=orgId;
			queryObj.ciphertextKey = ciphertextAesKey;
	    	ajaxService.AjaxPost(queryObj, ursUrlPrefix + "/api/User/Registration", successFunction, errorFunction);
	    	
	    	/*
	    	{
		    	"invitationID":-1,
		    	"mainAccountType":1,
		    	"name":"",
		    	"email":"test@126.com",
		    	"password":"111111",
		    	"qqNumber":"",
		    	"wechatNumber":"",
		    	"weiBoNumber":"",
		    	"phoneNumber":"",
		    	"id":-1
	    	}
	    	*/
	    }
	    
	    this.getAccountTypeList = function(successFunction, errorFunction) {   	
	        ajaxService.AjaxGet(ursUrlPrefix + "/api/AccountType/GetAccountTypeList", successFunction, errorFunction);
	    };

	   // callback will called as : callback.call(authorizationKey);
	    this.getAuthorizationKey = function (account, password, ciphertextAesKey, successFunction, errorFunction) {
	    	var accountObj = new Object();
	    	accountObj.account = account;
	    	accountObj.password = password;			
	    	accountObj.ciphertextKey = ciphertextAesKey;
			accountObj.tag = "isCiphertext"
			ajaxService.AjaxPost(accountObj, ursUrlPrefix + "/api/User/UnifiedAuthorization", successFunction, errorFunction);
		};
		
		//return ["Org1", "Org2", "Org3"];
		this.getOrganizationList = function (userName, authorizationKey, successFunction, errorFunction) {			
			var authorizationKeyObj = new Object();
			authorizationKeyObj.AuthorizationKey = authorizationKey;
			ajaxService.AjaxGetWithData(authorizationKeyObj, ursUrlPrefix + "/api/Organization/GetUserOrganizationList", successFunction, errorFunction);			
		};
		
		this.getUser = function(userID, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.UserID = userID;
			ajaxService.AjaxGetWithData(queryObj, ursUrlPrefix + "/api/User", successFunction, errorFunction);
		};

		this.getUserByOrganization = function(organizationId, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.OrganizationID = organizationId;
			ajaxService.AjaxGetWithData(queryObj, ursUrlPrefix + "/api/Organization/GetUserList", successFunction, errorFunction);
		};
		
		this.getOrganizationById = function (organizationId, successFunction, errorFunction) {			
			var queryObj = new Object();
			queryObj.OrganizationID = organizationId;
			ajaxService.AjaxGetWithData(queryObj, ursUrlPrefix + "/api/Organization", successFunction, errorFunction);			
		};
		
		this.getEngineAddress = function (orgId, userAccount, authorizationKey, successFunction, errorFunction) {
			var authorizationObj = new Object();
			authorizationObj.AuthorizationKey = authorizationKey;
			authorizationObj.OrganizationID = orgId;
			authorizationObj.UserAccount = userAccount;
			ajaxService.AjaxGetWithData(authorizationObj, ursUrlPrefix + "/api/Tool/Engine/GetUtpEngine", successFunction, errorFunction);
		};
		
		this.getEngine = function (engineAddress, utpPort, successFunction, errorFunction) {			
			var query = new Object();
			query.Address = engineAddress;
			query.UTPPort = utpPort;			
			ajaxService.AjaxGetWithData(query, ursUrlPrefix + "/api/Tool/Engine/GetEngine", successFunction, errorFunction);			
		};
		this.getEngineByEngineName = function (userAccount,engineName, successFunction, errorFunction) {
			var query = new Object();
			query.userAccount = userAccount;
			query.engineName = engineName;
			ajaxService.AjaxGetWithData(query, ursUrlPrefix + "/api/Tool/Engine/GetEngineByEngineName", successFunction, errorFunction);
		}
		this.getConfigByModule=function(userAccount,moduleName,successFunction,errorFunction){
			var query=new Object()
			query.userAccount=userAccount
			query.moduleName=moduleName
			ajaxService.AjaxGetWithDataNoBlock(query, ursUrlPrefix + "/api/SystemConfig/GetUserFeaturesByModule", successFunction, errorFunction);
		}
		this.getConfigByAllFeature=function(moduleName,successFunction,errorFunction){
			var query=new Object()
			query.moduleName=moduleName
			ajaxService.AjaxGetWithDataNoBlock(query, ursUrlPrefix + "/api/SystemConfig/GetFeaturesByModule", successFunction, errorFunction);
		}
		this.setEngineConfig = function (config, successFunction, errorFunction) {
			ajaxService.AjaxPost(config, ursUrlPrefix + "/api/Tool/SetEngineConfig", successFunction, errorFunction);			
		};

		this.saveOrderInfo = function(orgId,userId,orderInfo,toolTypeInfo,toolTypeInfoList,purchaseByList,successFunction,errorFunction){
			var query=new Object()
			query.contractID=orderInfo.orderId
			if(!purchaseByList){
				query.title="one payment"
				query.payments= [{
					unitPrice:orderInfo.totalAmount,
					count:toolTypeInfo.count,
					description:toolTypeInfo.antbotType,
					isInUse:toolTypeInfo.isInUse,
					toolTypeID:toolTypeInfo.toolTypeID,
					discount:toolTypeInfo.discount,
					strEnd:orderInfo.newValidity
				}]
			}
			else{
				query.title="more payment"
				query.payments = []
				for(var i = 0; i < toolTypeInfoList.length; i++){
					var temp = {}
					temp.unitPrice = toolTypeInfoList[i].unitPrice
					temp.count = toolTypeInfoList[i].count
					temp.description = toolTypeInfoList[i].description
					temp.isInUse = toolTypeInfoList[i].isInUse
					temp.toolTypeID = toolTypeInfoList[i].toolTypeID
					temp.discount = toolTypeInfoList[i].discount
					temp.strEnd = toolTypeInfoList[i].newValidity
					query.payments.push(temp)
				}

			}
			query.organizationID=Number(orgId)
			query.creatorID=Number(userId)
			query.strBegin=orderInfo.nowTime
			query.strEnd=orderInfo.newValidity
			query.description="PAYMENT"
			ajaxService.AjaxPost(komapping.toJS(query),ursUrlPrefix + "/api/Contract/Registration",successFunction,errorFunction);
		}

		this.getAgentTypeValidity = function(orgId, authorizationKey, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.OrganizationID = orgId;
			queryObj.AuthorizationKey = authorizationKey;
			ajaxService.AjaxGetWithData(queryObj, ursUrlPrefix + "/api/Contract/GetAntbotValidity", successFunction, errorFunction);
		}
		
		this.getAgentTypeList = function (orgId, authorizationKey, successFunction, errorFunction) {

			var queryObj = new Object();
			queryObj.OrganizationID = orgId;
			queryObj.AuthorizationKey = authorizationKey;
			ajaxService.AjaxGetWithData(queryObj, ursUrlPrefix + "/api/Tool/Agent/GetOrganizationAgentTypeList", successFunction, errorFunction);
			//var getCmd = ursUrlPrefix + '/api/Tool/Agent/GetOrganizationAgentTypeList?OrganizationID=' + orgId + '&AuthorizationKey=' + authorizationKey;
			//$http.get(ursUrlPrefix + '/api/Tool/Agent/GetOrganizationAgentTypeList?OrganizationID=' + orgId + '&AuthorizationKey=' + authorizationKey)			
			//ajaxService.AjaxPost(["AntBot_GUI"], ursUrlPrefix + "/api/Tool/Agent/GetAgentCmdUserLang", successFunction, errorFunction);			
		};
		this.getAllAgentType = function(orgId, authorizationKey, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.OrganizationID = orgId;
			queryObj.AuthorizationKey = authorizationKey;
			ajaxService.AjaxGetWithData(queryObj,ursUrlPrefix + "/api/ToolType/GetAllAgentTypes", successFunction, errorFunction);
		}

		this.getEngineCmdList = function (successFunction, errorFunction) {
			ajaxService.AjaxGet(ursUrlPrefix + "/api/Tool/Agent/GetEngineCmdUserLang", successFunction, errorFunction);
		};
		
		this.resetPassword = function(email, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.email = email;
			ajaxService.AjaxPost(queryObj, ursUrlPrefix + "/api/User/ResetPasswordRequest/Email", successFunction, errorFunction);
		};
		
		this.submitSuggestion = function(userName, email, suggestion, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.id = 0;
			queryObj.email = email;
			queryObj.userName = userName;
			queryObj.suggestion = suggestion;
			queryObj.createDate = new Date();
			ajaxService.AjaxPost(queryObj, ursUrlPrefix + "/api/Suggestion/Registration", successFunction, errorFunction);
		};
		
		this.updatePwd = function(userID, originalPwd, pwd, ciphertextAesKey, successFunction, errorFunction){
			var queryObj = new Object();
			queryObj.userID = userID;
			queryObj.originalPassword = originalPwd;
			queryObj.password = pwd;
			queryObj.ciphertextKey = ciphertextAesKey;
			ajaxService.AjaxPost(queryObj, ursUrlPrefix + "/api/User/UpdatePassword", successFunction, errorFunction);
		};
		
		this.updateUser = function (user, successFunction, errorFunction) {
			ajaxService.AjaxPost(user, ursUrlPrefix + "/api/User/Updating", successFunction, errorFunction);			
		};
		
		this.smsRequest = function(mode, area, phone, successFunction, errorFunction){
			var request = {
				mode: mode,
				area: area,
				phone: phone
			};
			ajaxService.AjaxPost(request, ursUrlPrefix + "/api/User/Sms/Request", successFunction, errorFunction);
		};
		
		this.smsVerify = function(request, successFunction, errorFunction){
			ajaxService.AjaxPost(request, ursUrlPrefix + "/api/User/Sms/Verify", successFunction, errorFunction);
		};
		
		this.smsAuthorization = function(id, mode, area, phone, code, successFunction, errorFunction){
			var request = {
					id :id, mode: mode, area:area, phone:phone, code:code
			};
			ajaxService.AjaxPost(request, ursUrlPrefix + "/api/User/Sms/Authorization", successFunction, errorFunction);
		};
		
		this.smsResetPassword = function(id, mode, area, phone, code, password, ciphertextAesKey, successFunction, errorFunction){
			var request = {
					id :id, mode: mode, area:area, phone:phone, code:code, password:password, ciphertextKey:ciphertextAesKey
			};
			ajaxService.AjaxPost(request, ursUrlPrefix + "/api/User/Sms/ResetPassword", successFunction, errorFunction);
		};
		
		this.smsSignup = function(id, mode, area, phone, code, password, orgId, ciphertextAesKey, successFunction, errorFunction){
			var request = {
					id :id, mode: mode, area:area, phone:phone, code:code, password:password, orgId:orgId, ciphertextKey:ciphertextAesKey
				};
			ajaxService.AjaxPost(request, ursUrlPrefix + "/api/User/Sms/RegistrationWithActivation", successFunction, errorFunction);
		};
		
		this.isTestAccount = function(userId, successFunction, errorFunction){
			var query = new Object();
			query.UserID = userId;				
			ajaxService.AjaxGetWithData(query, ursUrlPrefix + "/api/Organization/IsTestAccount", successFunction, errorFunction);
	    };

		this.toPay = function(transactionNo,subject,totalAmount){
			// var api="./aliPay/" + transactionNo + "/" + subject + "/" + totalAmount;
			// ajaxService.AjaxGet(api, successFunction, errorFunction);
			var strTotalAmount=totalAmount+""
			var beforeDecimalPoint=strTotalAmount.split(".")[0]
			var afterDecimalPoint=strTotalAmount.split(".")[1]
			if (afterDecimalPoint == undefined)
				afterDecimalPoint="00"
			window.location.href=(ursUrlPrefix+"/api/pay/aliPay/" + transactionNo + "/" + subject + "/" + beforeDecimalPoint + "/" +afterDecimalPoint)
		}

		this.varifyOrgByOrgId = function (orgId, orgName, successFunction, errorFunction){
			var query = new Object()
			query.orgId=orgId
			query.orgName=orgName
			ajaxService.AjaxGetWithData(query, ursUrlPrefix + "/api/Organization/VarifyOrganizationByOrgId", successFunction, errorFunction);
		}
		// 获取许可
		this.getLicense = function (successFunction, errorFunction){
			ajaxService.AjaxGet(ursUrlPrefix+"/api/User/GetPermission", successFunction, errorFunction);
		}
		this.guestSignup = function(account, password, ciphertextAesKey, successFunction, errorFunction){
			var query = new Object()
			query.mainAccountType = 1; // default type: email
			query.email = account;
			query.password = password;

			query.invitationID = -1;
			query.name = account.split("@")[0];
			query.qqNumber = null;
			query.wechatNumber = null;
			query.weiBoNumber = null;
			query.phoneNumber = null;
			query.department = '游客';
			query.position = '游客';
			query.nameOrRespectfully = '游客';
			query.id = -1;
			query.organization = 0;
			query.ciphertextKey = ciphertextAesKey;
			ajaxService.AjaxPost(query, ursUrlPrefix + "/api/User/GuestSignup", successFunction, errorFunction);
		}
		this.destroyGuestData = function (successFunction, errorFunction){
			ajaxService.AjaxGet(ursUrlPrefix+"/api/User/DestroyGuestData", successFunction, errorFunction);
		}
		this.destroyGuestDataByOrgId = function(targetOrgId, successFunction, errorFunction){
			var api = "./deleteAllProjectBelongOrgId";
			var queryObj = new Object();
			queryObj.targetOrgId = targetOrgId+"";
			ajaxService.AjaxGetWithData(queryObj, api, successFunction, errorFunction);
		}
		this.getAesKey = function (successFunction, errorFunction){
			var query = new Object()
			query.rsaPublicKey = sessionStorage.getItem("RsaPubKey")
			query.aesKey = sessionStorage.getItem("AesKey")
			ajaxService.AjaxPost(query, ursUrlPrefix + "/api/User/getAesKey", successFunction, errorFunction);
		}
	}
	return new ursService();
})

/*
 ==========================================================================================
	public static final String USER_GETACCOUNTTYPELIST ="/api/User/GetAccountTypeList";
	
	Request: http://root:portnumber/api/User/GetAccountTypeList
	Response:
	[ 
		{"AccountTypeID": "XXXX", "AccountTypeName": "QQ"},
		{"AccountTypeID": "XXXX", "AccountTypeName": "Email"}		
	]
==========================================================================================
 * 
 ##########################################################################################	 
	public static final String USER_AUTHORIZATION ="/api/User/Authorization";
	
	Request: http://root:portnumber/api/User/Authorization 
	{
	"AccountTypeID": "Email", //QQ, WeChat...
	"UserID": "sdfsfsf@126.com", // QQ number, WeChat number
	"Password": "XXXX"	
	}
	Response:
	{
	"AuthorizationKey": "XXXX"	
	}
==========================================================================================
 
 *
 ##########################################################################################
	public static final String ORGANIZATION_GETORGANIZATIONLIST = "/api/Organization/GetOrganizationList/{TargetUserID}{AuthorizationKey}";
	
	Request: http://root:portnumber/api/Organization/GetOrganizationList?TargetUserID="GUID"&AuthorizationKey="GUID"
	Response: 
	{
	"Updated":true,
	"OrganizationList" : [ "XXXX", "XXXX", "XXXX" ]
	}
##########################################################################################

##########################################################################################
	public static final String ENGINE_GETENGINEADDRESS="/api/Tool/Engine/GetEngineAddress/{OrganizationID}{AuthorizationKey}"; // or more one domainID
	
	Request: http://root:portnumber/api/Tool/Engine/GetEngineAddress?OrganizationID="GUID"&AuthorizationKey="GUID"
	Response: 
	{    "IPAddress": "XXXX" }
##########################################################################################

##########################################################################################
	public static final String AGENT_GETAGENTTYPELIST ="/api/Tool/Agent/GetAgentTypeList/{OrganizationID}{AuthorizationKey}"; 
	
	Request: http://root:portnumber/api/Tool/Agent/GetAgentTypeList?OrganizationID="GUID"&AuthorizationKey="GUID"
	Or
	Request: http://root:portnumber/api/Tool/Agent/GetAgentTypeList?ToolDynamicID="GUID"
	Response: 
{
    "Updated": true,
    "AgentTypeList": [
        {
            "Name": "AgentType1",
            "Commands": [
                {
                    "CmdName": "Cmd1",
                    "Params": [
                        "Param1",
                        "Param2",
                        "^Param3"
                    ],
                    "DefTime": "5000"
                },
                {
                    "CmdName": "Cmd2",
                    "Params": [
                        "Param1",
                        "Param2"
                    ],
                    "DefTime": "3000"
                }
            ],
            "Notifications": [
                "Notification_ID_1",
                "Notification_ID_2",
                "Notification_ID_3"
            ]
        },
        {
            "Name": "AgentType2",
            "Commands": [
                {
                    "CmdName": "Cmd1",
                    "Params": [
                        "Param1",
                        "^Param2",
                        "Param3"
                    ],
                    "DefTime": "5000"
                },
                {
                    "CmdName": "Cmd2",
                    "Params": [
                        "Param1",
                        "Param2"
                    ],
                    "DefTime": "3000"
                }
            ],
            "Notifications": [
                "Notification_ID_1",
                "Notification_ID_2",
                "Notification_ID_3"
            ]
        }
    ]
}
##########################################################################################
 
 */