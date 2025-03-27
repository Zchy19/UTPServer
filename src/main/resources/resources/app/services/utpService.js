define([ 'knockout', 'jquery', 'jquerycookie', 'durandal/plugins/http','komapping', 'services/ajaxService', 'services/systemConfig'],
		function(ko, $, JCookie, $http, komapping, ajaxService, systemConfig) {
	
	function utpService() {
	    var self = this;
		this.protocolType = 'testcase';
		if(systemConfig.getEnableByFeatureName('utpclient.testcase_mgr')){ // 许可配置了用例库
			self.protocolType = 'testcase';
		}else if (systemConfig.getEnableByFeatureName('utpclient.testcase_mgr')){// 许可配置了脚本库
			self.protocolType = 'runablescript';
		}
	    
	    // Org	    
	    this.getOrgProject = function(orgId, successFunction, errorFunction){
	    	var selectOrgProjectApi = "./api/org/projects/" + orgId;
	    	ajaxService.AjaxGet(selectOrgProjectApi, successFunction, errorFunction);	
	    };
	    
	    this.getCompletedExecutionList = function(orgId, projectId, successFunction, errorFunction){
	    	var getExecutionListApi = "./api/query/executionStatus/completed/" + projectId;
	    	ajaxService.AjaxGet(getExecutionListApi, successFunction, errorFunction);
	    };
	    
	    this.getExecutionListByTestset = function(testsetId, projectId, successFunction, errorFunction){
	    	var getExecutionListApi = "./api/query/executionStatus/getByTestsetId/" + projectId + '/' + testsetId;
	    	ajaxService.AjaxGet(getExecutionListApi, successFunction, errorFunction);
	    };
	
	    this.getActiveExecutionList = function(orgId, projectId, successFunction, errorFunction){
	    	var getExecutionListApi = "./api/query/executionStatus/active/" + projectId;
	    	ajaxService.AjaxGet(getExecutionListApi, successFunction, errorFunction);	
	    };
	    
	    // project
	    
		this.getProject = function(projectId, successFunction, errorFunction){
			var getExecutionListApi = "./api/project/" + projectId;
			ajaxService.AjaxGet(getExecutionListApi, successFunction, errorFunction);
		};

	    this.getProjectData = function(projectId, successFunction, errorFunction){
	    	var getProjectApi = "./api/project/data/" + projectId;
	    	ajaxService.AjaxGet(getProjectApi, successFunction, errorFunction);	
	    };
	    
	    this.getProjectFullFlatData = function(projectId, successFunction, errorFunction){
	    	var getProjectApi = "./api/project/getProjectFullFlatData/" + projectId;
	    	ajaxService.AjaxGet(getProjectApi, successFunction, errorFunction);	
	    };
	    
		this.getProjectTemplates = function(orgId, templateType, successFunction, errorFunction){
			var getProjectTemplatesApi = "./api/project/templateList/" + orgId + "/" + templateType;
	    	ajaxService.AjaxGet(getProjectTemplatesApi, successFunction, errorFunction);	
		};
		
		this.getSystemProjectTemplates = function(orgId, successFunction, errorFunction){
			var getSystemProjectTemplatesApi = "./api/project/systemTemplate";
	    	ajaxService.AjaxGet(getSystemProjectTemplatesApi, successFunction, errorFunction);	
		};
		
	    this.createProject = function(projectObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(projectObj, "./api/project/create", successFunction, errorFunction);	
	    };  
	    
	    this.updateProject = function(projectObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(projectObj, "./api/project/update", successFunction, errorFunction);
	    };
	    
	    this.deleteProject = function(projectId, successFunction, errorFunction){
	    	var deleteProjectApi = "./api/project/delete/" + projectId;
	    	ajaxService.AjaxPost(null, deleteProjectApi, successFunction, errorFunction);
	    };
	    
		this.setProjectTemplateType = function(projectId, templateType, successFunction, errorFunction){
			var setProjectTemplateApi = "./api/project/setTemplate/" + projectId + "/" + templateType;
			ajaxService.AjaxPost(null, setProjectTemplateApi, successFunction, errorFunction);
		};
		
		this.copyProject = function(sourceProjectId, sourceOrgId, targetOrgId, successFunction, errorFunction){
			var copyProjectApi = "./api/project/copy/" + sourceProjectId + "/" + sourceOrgId + "/" + targetOrgId;
			ajaxService.AjaxPost(null, copyProjectApi, successFunction, errorFunction);
		};
		
		this.copyProjectWithInfo = function(projectInfo, successFunction, errorFunction){
			ajaxService.AjaxPost(projectInfo, "./api/project/copyProjectWithInfo", successFunction, errorFunction);
		};
	
		// this.exportProject = function(projectId, successFunction, errorFunction){
		// 	var exportProjectApi = "./api/project/export/" + projectId;
	    // 	ajaxService.AjaxGetNoBlock(exportProjectApi, successFunction, errorFunction);
		// };

		this.exportProject = function(projectId, successFunction, errorFunction){
			var exportProjectApi = "./api/project/export/" + projectId;
	    	ajaxService.NativeAjaxGetBlob(exportProjectApi, successFunction, errorFunction);
		};

		
		this.importProject = function(file, successFunction, errorFunction){
			var api = "./api/project/import";
			ajaxService.AjaxPostFile(file, api, successFunction, errorFunction);
		};
		this.importTestset= function(file, successFunction, errorFunction){
			// var api = "./api/project/import";
			var api = "./api/uptExecutor/importExecutionResultFromFile";
			ajaxService.AjaxPostFile(file,api, successFunction, errorFunction);
		};
		// protocol
		this.addBigData = function(file, successFunction, errorFunction){	    	
	    	var api = "./api/protocolSignal/upload";
			ajaxService.AjaxPostFile(file, api, successFunction, errorFunction);
	    };
	    
	    this.updateBigData = function(file, successFunction, errorFunction){	    	
	    	var api = "./api/protocolSignal/update";
			ajaxService.AjaxPostFile(file, api, successFunction, errorFunction);
	    };
	    
	    this.getBigDataByType = function(projectId, fileType, successFunction, errorFunction){
	    	var api = "./api/protocolSignal/list/" + fileType;
			if(projectId)
				api = api + '/' + projectId;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		this.getProtocolSignalsByProjectIdAndPublic = function(fileType, projectId, successFunction, errorFunction){
	    	var api = "./api/protocolSignal/public/" + fileType+ '/' + projectId;;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.getProtocolSignalByProtocolType = function(fileType,protocolType, successFunction, errorFunction){
	    	var api = "./api/protocolSignal/" + fileType + '/' + protocolType;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		this.getProtocolsByProtocolTypeAndProjectId= function(fileType,protocolType,projectId, successFunction, errorFunction){
	    	var api = "./api/protocolSignal/" + fileType + '/' + protocolType+ '/' +projectId;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

	    this.deleteBigData = function(id, successFunction, errorFunction){
	    	var api = "./api/protocolSignal/delete/" + id;
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
		};
	    
		this.analysisBigData = function(bigdataStorageId, successFunction, errorFunction){
	    	var api = "./api/bigdataStorage/dbc/" + bigdataStorageId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		
	    this.getBigDataById = function(bigdataStorageId, successFunction, errorFunction){
	    	var api = "./api/bigdataStorage/get/" + bigdataStorageId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    this.getBigdataStorageByExecutionId = function(executionId, successFunction, errorFunction){
	    	var api = "./api/bigdataStorage/getBigdataStorageByExecutionId/" + executionId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		this.getOverviewBigDataById = function(bigdataStorageId, successFunction, errorFunction){
			var api = "./api/bigdataStorage/get/overview/" + bigdataStorageId;
			ajaxService.AjaxGetNoBlock(api, successFunction, errorFunction);
		};
		this.getOverviewProtocolSignalById = function(protocolSignalId, successFunction, errorFunction){
			var api = "./api/protocolSignal/get/overview/" + protocolSignalId;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
		};

		this.getPartBigDataById = function(bigdataStorageId, captureType, index, successFunction, errorFunction){
	    	var api = "./api/bigdataStorage/get/" + bigdataStorageId + '/' + captureType + '/' + index;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };		

		this.getIndexBigDataById = function(bigdataStorageId, index, successFunction, errorFunction){
	    	var api = "./api/bigdataStorage/get/busFrame/" + bigdataStorageId + '/' + index;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

	    this.getProtocol = function(protocolSignalId, successFunction, errorFunction){
	    	var api = "./api/protocol/get/" + protocolSignalId;
			ajaxService.AjaxGetNoBlock(api, successFunction, errorFunction);
	    };
	    
	    this.composeA429Frame = function(frameInfo, successFunction, errorFunction){
	    	ajaxService.AjaxPost(frameInfo, "./api/protocol/a429/composeFrame", successFunction, errorFunction);
	    };
	    
		this.composeM1553bCustomFrame = function(frameInfo, successFunction, errorFunction){
	    	ajaxService.AjaxPost(frameInfo, "./api/protocol/m1553bCustom/composeFrame", successFunction, errorFunction);
	    };
	    
	    this.composeGenericBusFrame = function(frameInfo, successFunction, errorFunction){
	    	ajaxService.AjaxPost(frameInfo, "./api/protocol/genericBusFrame/composeFrame", successFunction, errorFunction);
	    };
		
		this.busFrameStatistics = function(parameter, successFunction, errorFunction){
			var api = "./api/bigdataStorage/busFrameStatistics";	
			ajaxService.AjaxPostTimeConsumedNoBlock(parameter, api, successFunction, errorFunction);
		};

		this.searchBusFrameStatisticsOverview = function(condition, successFunction, errorFunction){
			// condition = {protocolId, startFromDate, endByDate}
			ajaxService.AjaxPost(condition, "./api/bigdataStorage/searchBusFrameStatisticsOverview", successFunction, errorFunction);
		};

		//message template
		this.getAllMessageTemplate = function(protocolId, messageName, successFunction, errorFunction){
	    	var api = "./api/messgeTemplate/getAll/" + protocolId + '/' + messageName;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.getAllActiveMessageTemplate = function(protocolId, successFunction, errorFunction){
	    	var api = "./api/messgeTemplate/getActive/" + protocolId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.getActiveMessageTemplate = function(protocolId, messageName, successFunction, errorFunction){
	    	var api = "./api/messgeTemplate/getActive/" + protocolId + '/' + messageName;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.getMessageTemplateById = function(id, successFunction, errorFunction){
	    	var api = "./api/messgeTemplate/get/" + id;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.createMessageTemplate = function(messageTemplateObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(messageTemplateObj, "./api/messgeTemplate/create", successFunction, errorFunction);
	    };

		this.updateMessageTemplate = function(messageTemplateObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(messageTemplateObj, "./api/messgeTemplate/update", successFunction, errorFunction);
	    };

		this.deleteMessageTemplate = function(id, successFunction, errorFunction){
	    	var deleteMessageTemplateApi = "./api/messgeTemplate/delete/" + id;
	    	ajaxService.AjaxPost(null, deleteMessageTemplateApi, successFunction, errorFunction);
	    };
	    // script group
	    
	    this.getScriptGroup = function(projectId, scriptGroupId, successFunction, errorFunction){	    	
	    	var selectScriptGroupApi = "./api/scriptgroup/" + projectId + "/" + scriptGroupId;	    	
			ajaxService.AjaxGet(selectScriptGroupApi, successFunction, errorFunction);
	    };
	    
	    this.updateScriptGroup = function(editingScriptGroupObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingScriptGroupObj, "./api/scriptgroup/update", successFunction, errorFunction);
	    };
	    
	    this.createScriptGroup = function(newScriptGroupObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(newScriptGroupObj, "./api/scriptgroup/create", successFunction, errorFunction);	    	
	    };
	    
	    this.deleteScriptGroup = function(projectId, scriptGroupId, successFunction, errorFunction){
	    	var deleteScriptGroupApi = "./api/scriptgroup/delete/" + projectId + "/" + scriptGroupId;
	    	ajaxService.AjaxPost(null, deleteScriptGroupApi, successFunction, errorFunction);
	    };

		this.forceDeleteScriptGroup = function(projectId, scriptGroupId, successFunction, errorFunction){
	    	var deleteScriptGroupApi = "./api/scriptgroup/forceDelete/" + projectId + "/" + scriptGroupId;
	    	ajaxService.AjaxPost(null, deleteScriptGroupApi, successFunction, errorFunction);
	    };
	    
	    this.copyScriptGroup = function(projectId, sourceScriptGroupId, targetParentScriptGroupId, successFunction, errorFunction){
	    	var copyScriptGroupApi = "./api/scriptgroup/copy/" + projectId + "/" + sourceScriptGroupId + "/" + targetParentScriptGroupId;
	    	ajaxService.AjaxPostTimeConsumedNoBlock(null, copyScriptGroupApi, successFunction, errorFunction);
	    };
	    
	    this.cutScriptGroup = function(projectId, sourceScriptGroupId, targetParentScriptGroupId, successFunction, errorFunction){
	    	var cutScriptGroupApi = "./api/scriptgroup/cut/" + projectId + "/" + sourceScriptGroupId + "/" + targetParentScriptGroupId;
	    	ajaxService.AjaxPost(null, cutScriptGroupApi, successFunction, errorFunction);
	    };
	    
	    this.getScriptGroupByProject = function(projectId,type, successFunction, errorFunction){	    	
	    	var selectScriptGroupApi = "./api/scriptgroup/data/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectScriptGroupApi, successFunction, errorFunction);
	    };
	    
	    this.getScriptByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/scriptgroup/scriptdata/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getSubScriptByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectSubScriptApi = "./api/scriptgroup/subscriptdata/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectSubScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getSubScriptWithoutParamByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectSubScriptApi = "./api/scriptgroup/recoverdata/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectSubScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFlatScriptGroupByProject = function(projectId, type, successFunction, errorFunction){	    	
	    	var selectScriptGroupApi = "./api/project/getProjectFlatData/" + projectId +"/" + type;	    	
			ajaxService.AjaxGet(selectScriptGroupApi, successFunction, errorFunction);
	    };

		this.copyScriptAcrossProject = function(configObj, successFunction, errorFunction){
			var api = "./api/project/copyScriptAcrossProject";	    	
			ajaxService.AjaxPost(configObj, api, successFunction, errorFunction);
	    };
	    
	    this.getFlatScriptByProject = function(projectId, successFunction, errorFunction){
	    	var selectScriptApi = "./api/script/scriptFlatData/getByProjectId/" + projectId + "/" + "usrlogicblock";
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFlatSubScriptByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectSubScriptApi = "./api/subscript/subscriptFlatData/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectSubScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFlatSubScriptWithoutParamByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectSubScriptApi = "./api/subscript/subscriptFlatDataWithoutParam/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectSubScriptApi, successFunction, errorFunction);
	    };
	    
	    /*
	    this.getFlatScriptByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/script/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFlatScriptGroupByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectScriptGroupApi = "./api/scriptgroup/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectScriptGroupApi, successFunction, errorFunction);
	    };
	    */
	    
	    // test set
	    this.getTestSetByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectTestSetApi = "./api/testset/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectTestSetApi, successFunction, errorFunction);
	    };
	    
	    this.getTestSet = function(projectId, testSetId, successFunction, errorFunction){	    	
	    	var selectTestSetApi = "./api/testset/" + projectId + "/" + testSetId;	    	
			ajaxService.AjaxGet(selectTestSetApi, successFunction, errorFunction);
	    };
	    
	    this.getTestSetWithScriptIds = function(projectId, testSetId, successFunction, errorFunction){	    	
	    	var selectTestSetApi = "./api/testset/data/" + projectId + "/" + testSetId;	    	
			ajaxService.AjaxGet(selectTestSetApi, successFunction, errorFunction);
	    };
	    
	    this.updateTestSet = function(editingTestSetObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingTestSetObj, "./api/testset/update", successFunction, errorFunction);
	    };
	    
	    this.updateTestSetWithScriptIds = function(editingTestSetObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingTestSetObj, "./api/testset/updateWithScriptIds", successFunction, errorFunction);
	    };
	    
	    this.createTestSet = function(newTestSetObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(newTestSetObj, "./api/testset/create", successFunction, errorFunction);	    	
	    };
	    
	    this.createTestSetWithScriptIds = function(newTestSetObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(newTestSetObj, "./api/testset/createWithScriptIds", successFunction, errorFunction);	    	
	    };	    
	    
	    this.deleteTestSet = function(projectId, testSetId, successFunction, errorFunction){
	    	var deleteTestSetApi = "./api/testset/delete/" + projectId + "/" + testSetId;
	    	ajaxService.AjaxPost(null, deleteTestSetApi, successFunction, errorFunction);
	    };
	    
	    // script
	   	this.getScriptCustomizedFields = function(projectId, successFunction, errorFunction){
			var selectApi = "./api/script/customizedFields/get/" + projectId;
			ajaxService.AjaxGet(selectApi, successFunction, errorFunction);
		};

		this.updateScriptCustomizedFields = function(projectId, customizedScriptFields, successFunction, errorFunction){
			var selectApi = "./api/project/customizedScriptFields/update";
			var obj = {
				projectId,
				customizedScriptFields
			}
			ajaxService.AjaxPost(obj, selectApi, successFunction, errorFunction);
		};

	    this.getScript = function(projectId, scriptId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/script/" + projectId + "/" + scriptId;	    	
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };

		this.getTestCase = function(projectId, scriptId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/testcase/" + projectId + "/" + scriptId;	    	
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFullScript = function(projectId, scriptId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/script/data/" + projectId + "/" + scriptId;
	    	ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);	    	
	    };
	    
	    this.getFullScripts = function(projectId, scriptIds, successFunction, errorFunction, blocked){	    	
	    	var selectScriptApi = "./api/script/data/byScriptIds/" + projectId + "/" + scriptIds;
	    	if(blocked == undefined || blocked == null || blocked == true)
	    		ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    	else
	    		ajaxService.AjaxGetTimeConsumedNoBlock(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.updateScript = function(editingScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingScriptObj, "./api/script/update", successFunction, errorFunction);
	    };

		this.updateTestCase = function(editingScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingScriptObj, "./api/testcase/update", successFunction, errorFunction);
	    };
	
	    this.renameScript = function(editingScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingScriptObj, "./api/script/rename", successFunction, errorFunction);
	    };
	    
	    this.updateFullScript = function(editingScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingScriptObj, "./api/script/data/update", successFunction, errorFunction);
	    };

		this.updateFullTestCase = function(editingScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingScriptObj, "./api/testcase/data/update", successFunction, errorFunction);
	    };
	    
	    this.createScript = function(newScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(newScriptObj, "./api/script/create", successFunction, errorFunction);	    	
	    };

		this.createTestcase = function(newScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(newScriptObj, "./api/testcase/create", successFunction, errorFunction);	    	
	    };
	   
	    this.deleteScript = function(projectId, scriptId, successFunction, errorFunction){
	    	var deleteScriptApi = "./api/script/delete/" + projectId + "/" + scriptId;
	    	ajaxService.AjaxPost(null, deleteScriptApi, successFunction, errorFunction);
	    };

		this.deleteTestCase = function(projectId, scriptId, successFunction, errorFunction){
	    	var deleteScriptApi = "./api/testcase/delete/" + projectId + "/" + scriptId;
	    	ajaxService.AjaxPost(null, deleteScriptApi, successFunction, errorFunction);
	    };
	    
		this.forceDeleteScript = function(projectId, scriptGroupId, successFunction, errorFunction){
	    	var deleteScriptGroupApi = "./api/script/forceDelete/" + projectId + "/" + scriptGroupId;
	    	ajaxService.AjaxPost(null, deleteScriptGroupApi, successFunction, errorFunction);
	    };

	    this.copyScript = function(projectId, sourceScriptId, targetParentScriptGroupId, successFunction, errorFunction){
	    	var copyScriptApi = "./api/script/copy/" + projectId + "/" + sourceScriptId + "/" + targetParentScriptGroupId;
	    	ajaxService.AjaxPost(null, copyScriptApi, successFunction, errorFunction);	    	
	    }

		this.copyTestCase = function(projectId, sourceScriptId, targetParentScriptGroupId, successFunction, errorFunction){
	    	var copyScriptApi = "./api/testcase/copy/" + projectId + "/" + sourceScriptId + "/" + targetParentScriptGroupId;
	    	ajaxService.AjaxPost(null, copyScriptApi, successFunction, errorFunction);	    	
	    }
	    
	    this.cutScript = function(projectId, sourceScriptId, targetParentScriptGroupId, successFunction, errorFunction){
	    	var cutScriptApi = "./api/script/cut/" + projectId + "/" + sourceScriptId + "/" + targetParentScriptGroupId;
	    	ajaxService.AjaxPost(null, cutScriptApi, successFunction, errorFunction);	    	
	    }

		this.cutTestCase = function(projectId, sourceScriptId, targetParentScriptGroupId, successFunction, errorFunction){
	    	var cutScriptApi = "./api/testcase/cut/" + projectId + "/" + sourceScriptId + "/" + targetParentScriptGroupId;
	    	ajaxService.AjaxPost(null, cutScriptApi, successFunction, errorFunction);	    	
	    }
	    
	    this.getReferenceOfScript = function(projectId, scriptId, successFunction, errorFunction){	    	
	    	var api = "./api/script/reference/" + projectId + "/" + scriptId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.getReferenceOfTestCase = function(projectId, scriptId, successFunction, errorFunction){	    	
	    	var api = "./api/testcase/reference/" + projectId + "/" + scriptId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.transitToSubscript = function(scriptObj, successFunction, errorFunction){
			ajaxService.AjaxPost(scriptObj, "./api/script/transitToSubscript", successFunction, errorFunction);	
	    };
	    
	    this.transitToScript = function(subScriptObj, successFunction, errorFunction){
			ajaxService.AjaxPost(subScriptObj, "./api/script/transitToScript", successFunction, errorFunction);	
	    };
	    
		this.exportScript = function(projectId, scriptId , successFunction, errorFunction){
			var api = "./api/script/export/" + projectId + "/" + scriptId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
		};

		this.exportScriptGroup = function(projectId, scriptGroupId , successFunction, errorFunction){
			var api = "./api/scriptGroup/export/" + projectId + "/" + scriptGroupId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
		};
		
	    //sub script
	   
	    this.getSubScript = function(projectId, subScriptId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/subscript/" + projectId + "/" + subScriptId;	    	
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFullSubScript = function(projectId, subScriptId, successFunction, errorFunction){	    	
	    	var selectScriptApi = "./api/subscript/data/" + projectId + "/" + subScriptId;    		
			ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.getFullSubScripts = function(projectId, subScriptIds, successFunction, errorFunction, blocked){
	    	var selectScriptApi = "./api/subscript/data/bySubscriptIds/" + projectId + "/" + subScriptIds;
			if(blocked == undefined || blocked == null || blocked == true)	    		
				ajaxService.AjaxGet(selectScriptApi, successFunction, errorFunction);
	    	else
	    		ajaxService.AjaxGetTimeConsumedNoBlock(selectScriptApi, successFunction, errorFunction);
	    };
	    
	    this.updateSubScript = function(editingSubScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingSubScriptObj, "./api/subscript/update", successFunction, errorFunction);
	    };

	    this.renameSubScript = function(editingSubScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingSubScriptObj, "./api/subscript/rename", successFunction, errorFunction);
	    };
	    
	    this.updateFullSubScript = function(editingSubScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(editingSubScriptObj, "./api/subscript/data/update", successFunction, errorFunction);
	    };
	    
	    this.createSubScript = function(newSubScriptObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(newSubScriptObj, "./api/subscript/create", successFunction, errorFunction);	    	
	    };
	    
	    this.deleteSubScript = function(projectId, subScriptId, successFunction, errorFunction){
	    	var deleteScriptApi = "./api/subscript/delete/" + projectId + "/" + subScriptId;
	    	ajaxService.AjaxPost(null, deleteScriptApi, successFunction, errorFunction);
	    };
	    
	    /*
	    this.getSubScriptForExceptionRecover = function(projectId, successFunction, errorFunction){	    	
	    	var api = "./api/subscript/candidatesForExceptionRecover/" + projectId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    */
	    
	    this.getReferenceOfSubScript = function(projectId, subScriptId, successFunction, errorFunction){	    	
	    	var api = "./api/subscript/reference/" + projectId + "/" + subScriptId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

	    
	    // Test Report
	    this.getTestReportByCondition = function(obj, successFunction, errorFunction){
			var getReportApi = './api/query/testReport/getByCondition';
			ajaxService.AjaxPost(obj, getReportApi, successFunction, errorFunction);	
		};

	    this.getStatisticsReport = function(executionId, successFunction, errorFunction){
	    	var getReportApi = "./api/query/testReport/" + executionId;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	    
	    this.getStatisticsSummaryReport = function(executionId, successFunction, errorFunction){
	    	var getReportApi = "./api/query/testReport/summary/" + executionId;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	        
	    this.getTestCaseCheckPointByExecution = function(executionId, successFunction, errorFunction){
	    	var getReportApi = "./api/query/testCheckPoint/" + executionId;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	    this.getQualityReport = function(projectId, begin, end, successFunction, errorFunction){
	    	var getReportApi = "./api/query/qualityReport";
	    	ajaxService.AjaxPost(
	    			{
	    				"projectId": projectId,
	    				"startFromDate":begin,
	    				"endByDate": end
	    				}, 
	    			getReportApi, successFunction, errorFunction);	
	    };
	    
	    this.getSummaryExecutionResult = function(executionId, resultIdAsStartPoint, successFunction, errorFunction){
	    	var getReportApi = "./api/query/executionResult/summary/" + executionId + "/" + resultIdAsStartPoint;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	    
	    this.getDetailExecutionResult = function(executionId, executionBeginResultId, executionEndResultId, successFunction, errorFunction){
	    	var getReportApi = "./api/query/executionResult/details/" + executionId + "/" + executionBeginResultId + "/" + executionEndResultId;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	    
	    this.getMonitorData = function(executionId, idAsStartPoint, successFunction, errorFunction){
	    	var getReportApi = "./api/query/monitorData/" + executionId + "/" + idAsStartPoint;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	    
	    this.deleteExecutionResultById = function(executionId, successFunction, errorFunction){
	    	var deleteApi = "./api/executionStatus/deleteExecutionById/" + executionId;
	    	ajaxService.AjaxPost(null, deleteApi, successFunction, errorFunction);
	    };
	    
	    this.deleteExecutionResultByPeriod = function(projectId, start, end, successFunction, errorFunction){
	    	var deleteApi = "./api/executionStatus/deleteExecutionByPeriod";
	    	var obj = {
	    			projectId : projectId,
	    			startFromDate: start,
	    			endByDate : end
	    	}
	    	ajaxService.AjaxPost(obj, deleteApi, successFunction, errorFunction);
	    };
		this.getExecutionStatusByTestsetIdAndTime = function(projectId,testsetId ,start, end, successFunction, errorFunction){
	    	var deleteApi = "./api/testSetStatisticsController/getExecutionStatusByTestsetIdAndTime";
	    	var obj = {
	    			projectId : projectId,
					testsetId : testsetId,
	    			startFromDate: start,
	    			endByDate : end
	    	}
	    	ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
	    };

		this.statisticsTestsetDurationByProjectId = function(projectId ,start, end, successFunction, errorFunction){
			var deleteApi = "./api/testSetStatisticsController/statisticsTestsetDurationByProjectId";
			var obj = {
				projectId : projectId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
		};
		this.statisticsTestsetCheckPointByProjectId = function(projectId ,start, end, successFunction, errorFunction){
			var deleteApi = "./api/testSetStatisticsController/statisticsTestsetCheckPointByProjectId";
			var obj = {
				projectId : projectId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
		};
		this.statisticsTimeByProjectIdAndTestsetId= function(projectId ,testsetId, start, end, successFunction, errorFunction){
			var deleteApi = "./api/testSetStatisticsController/statisticsTimeByProjectIdAndTestsetId";
			var obj = {
				projectId : projectId,
				testsetId : testsetId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
		};
		this.statisticsManualDecisionLevelByProjectIdAndTestsetId= function(projectId ,testsetId, start, end, successFunction, errorFunction){
			var deleteApi = "./api/testSetStatisticsController/statisticsManualDecisionLevelByProjectIdAndTestsetId";
			var obj = {
				projectId : projectId,
				testsetId : testsetId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
		};
		this.statisticsTestsetsNumberByProjectIdAndTime = function(projectId ,start, end, successFunction, errorFunction){
			var deleteApi = "./api/testSetStatisticsController/statisticsTestsetsNumberByProjectIdAndTime";
			var obj = {
				projectId : projectId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
		};
		this.getExecutionCheckPointByProjectIdAndTime = function(projectId ,start, end, successFunction, errorFunction){
			var deleteApi = "./api/executionCheckPoint/getExecutionCheckPointByProjectIdAndTime";
			var obj = {
				projectId : projectId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPostNoBlock(obj, deleteApi, successFunction, errorFunction);
		};
		this.statisticsSuccessRateByProjectIdAndTime = function(projectId ,start, end, successFunction, errorFunction){
			var deleteApi = "./api/testSetStatisticsController/statisticsSuccessRateByProjectIdAndTime";
			var obj = {
				projectId : projectId,
				startFromDate: start,
				endByDate : end
			}
			ajaxService.AjaxPost(obj, deleteApi, successFunction, errorFunction);
		};

		this.statisticsExecutionByExecutionId = function(executionId, successFunction, errorFunction){
			var statisticsExecutionByExecutionIdApi = "./api/testSetStatisticsController/statisticsExecutionByExecutionId/" + executionId;
			ajaxService.AjaxGetNoBlock(statisticsExecutionByExecutionIdApi, successFunction, errorFunction);
		};

		this.listResultByParentId = function(executionId, parentId, successFunction, errorFunction){
	    	var getReportApi = "./api/executionResult/getResultByParentId/" + executionId + "/" + parentId;
	    	ajaxService.AjaxGetNoBlock(getReportApi, successFunction, errorFunction);
	    };
		this.getProjectOperationDataByProjectId = function(projectId, successFunction, errorFunction){
	    	var getReportApi = "./api/executionCheckPoint/getProjectOperationDataByProjectId/" + projectId;
	    	ajaxService.AjaxGetNoBlock(getReportApi, successFunction, errorFunction);
	    };
		this.getProjectOperationDataByProjects = function(projectIds, successFunction, errorFunction){
	    	var getReportApi = "./api/getOperationData/" + projectIds;
	    	ajaxService.AjaxGetNoBlock(getReportApi, successFunction, errorFunction);
	    };

		this.updateExecutionCheckpointManualDecisionLevel= function(checkpointId, level, successFunction, errorFunction){
	    	var updateExecutionCheckpointManualDecisionLevelApi = "./api/executionCheckPoint/updateManualDecisionLevel/" + checkpointId + "/" + level;
	    	ajaxService.AjaxGetNoBlock(updateExecutionCheckpointManualDecisionLevelApi, successFunction, errorFunction);
	    }

		this.getLatestDetailExecutionResult = function(executionId, amount, successFunction, errorFunction){
	    	var getReportApi = "./api/query/executionResult/latestNumberOfDetails/" + executionId + "/" + amount;
	    	ajaxService.AjaxGet(getReportApi, successFunction, errorFunction);
	    };
	    
	    this.getFinishedSummaryExecutionResult = function(executionId, successFunction, errorFunction){
	    	var getReportApi = "./api/query/testReport/summary/finished/" + executionId;
	    	ajaxService.AjaxGetTimeConsumedNoBlock(getReportApi, successFunction, errorFunction);
	    };
	    
	    // record	    
	    //TBD
	    this.getRecordsByAgentType = function(queryObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(queryObj, "./rest/record/recordset/getscriptlist", successFunction, errorFunction);	    
	    };
	  //TBD
	    this.getBigdata = function(rootId, recordId, successFunction, errorFunction){
	    	var getBigdataApi = "./rest/record/getbigdata/toolDynId/" + rootId + "/" + recordId;
	    	ajaxService.AjaxGet(getBigdataApi, successFunction, errorFunction);	
	    };
	  //TBD
	    this.getScriptsByAgentType = function(authorizationKey, organizationId, agentTypeName, successFunction, errorFunction){
	    	var getScriptApi = "./rest/record/getrootlist/"	+ authorizationKey + "/" + organizationId + "/" + agentTypeName;
	    	ajaxService.AjaxGet(getScriptApi, successFunction, errorFunction);	
	    };	    
	   
	    // agent config
	    
	    this.getAgentConfig = function(projectId, agentConfigId, successFunction, errorFunction){	    	
	    	var selectAgentConfigApi = "/api/configuration/antbot/" + projectId + '/' + agentConfigId;	    	
			ajaxService.AjaxGet(selectAgentConfigApi, successFunction, errorFunction);
	    };
	    
	    this.getAgentConfigByProject = function(projectId, successFunction, errorFunction){	    	
	    	var selectAgentConfigtApi = "./api/configuration/antbot/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(selectAgentConfigtApi, successFunction, errorFunction);
	    };
		this.getAgentTypeValidity = function(organizationId, successFunction, errorFunction){

		}
	    
	    this.updateAgentConfig = function(agentConfigObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(agentConfigObj, "./api/configuration/antbot/update", successFunction, errorFunction);
	    };
	    
	    this.createAgentConfig = function(agentConfigObj, successFunction, errorFunction){
	    	ajaxService.AjaxPost(agentConfigObj, "./api/configuration/antbot/create", successFunction, errorFunction);	    	
	    };
		this.createAgentConfigs = function(agentConfigObjs, successFunction, errorFunction){
	    	ajaxService.AjaxPost(agentConfigObjs, "./api/configurations/antbot/create", successFunction, errorFunction);	    	
	    };
	    this.deleteAgentConfig = function(projectId, agentConfigId, successFunction, errorFunction){
	    	var deleteAgentConfigApi = "./api/configuration/antbot/delete/" + projectId + '/' + agentConfigId;
	    	ajaxService.AjaxPost(null, deleteAgentConfigApi, successFunction, errorFunction);
	    };	    
	    
	    // execution
	    
	    this.startExecution = function(executionObj, successFunction, errorFunction){
	    	var startExecutionApi = "./api/execution/start";	    		
	    	ajaxService.AjaxPostTimeConsumedNoBlock(executionObj, startExecutionApi, successFunction, errorFunction);
	    };
	    
	    this.cancelExecution = function(executionId, successFunction, errorFunction){	    	
	    	ajaxService.AjaxPost(executionId, "./api/execution/cancel", successFunction, errorFunction);
	    };
		this.removeExecutionTestCaseResultByExecutionId = function(executionId, successFunction, errorFunction){	    	
	    	ajaxService.AjaxPost(executionId, "./api/execution/removeExecutionTestCaseResultByExecutionId", successFunction, errorFunction);
	    };
	    this.pauseExecution = function(executionId, successFunction, errorFunction){	    	
	    	ajaxService.AjaxPost(executionId, "./api/execution/pause", successFunction, errorFunction);
	    };
	    
	    this.resumeExecution = function(executionId, successFunction, errorFunction){	    	
	    	ajaxService.AjaxPost(executionId, "./api/execution/resume", successFunction, errorFunction);
	    };
	   
	    this.singleStepExecution = function(executionId, successFunction, errorFunction){	    	
	    	ajaxService.AjaxPost(executionId, "./api/execution/singleStep", successFunction, errorFunction);
	    };
	    
	    this.stopExecution = function(executionId, successFunction, errorFunction){
	    	ajaxService.AjaxPost(executionId, "./api/execution/stop", successFunction, errorFunction);
	    };
	    
	    this.getExecutionModel = function(executionId, successFunction, errorFunction){	    	
	    	var getExecutionModelApi = "./api/execution/getExecutionModel/" + executionId;	    	
			ajaxService.AjaxGetNoBlock(getExecutionModelApi, successFunction, errorFunction);
	    };
		this.derivedTestSet = function(projectId,testsetId, successFunction, errorFunction){	    	
	    	var derivedTestSetApi = "./api/derivedTestSet/"+projectId + '/' + testsetId;	    	
			ajaxService.AjaxGetNoBlock(derivedTestSetApi, successFunction, errorFunction);
	    };
	    this.prepareExecutionScript = function(obj, successFunction, errorFunction){
	    	var prepareAPI = './api/execution/preprocess/script';
	    	ajaxService.AjaxPostTimeConsumedNoBlock(obj, prepareAPI, successFunction, errorFunction);	     
	    };
	    
	    this.prepareExecutionTestSet = function(obj, successFunction, errorFunction){
	    	var prepareAPI = './api/execution/preprocess/testset';
	    	ajaxService.AjaxPostTimeConsumedNoBlock(obj, prepareAPI, successFunction, errorFunction);	       
	    };
	    
	    this.prepareExecutionTestSetWithEmail = function(obj, successFunction, errorFunction){
	    	var prepareAPI = './api/execution/preprocess/testsetWithEmail';
	    	ajaxService.AjaxPostTimeConsumedNoBlock(obj, prepareAPI, successFunction, errorFunction);
	    };
		this.prepareExecutionScripts = function(obj, successFunction, errorFunction){
	    	var prepareAPI = './api/execution/preprocess/scripts';
	    	ajaxService.AjaxPostTimeConsumedNoBlock(obj, prepareAPI, successFunction, errorFunction);
	    };
	    
		this.getMaximumExecutionResult = function(executionId, lastResultId, maximum,successFunction, errorFunction){
	    	var getResultApi = './api/query/maximumExecutionResult/' + executionId + '/' + lastResultId+ '/'+maximum;
	    	ajaxService.AjaxGetNoBlock(getResultApi, successFunction, errorFunction);
	    };
	    this.getExecutionResult = function(executionId, lastResultId, successFunction, errorFunction){
	    	var getResultApi = './api/query/executionResult/' + executionId + '/' + lastResultId;
	    	ajaxService.AjaxGetNoBlock(getResultApi, successFunction, errorFunction);
	    };
	    this.listExecutionDataResult = function(executionId, lastExecutionDataId,maximum,successFunction, errorFunction){
	    	var getResultApi = './api/executionData/listExecutionData/' + executionId+ '/' + lastExecutionDataId+ '/'+maximum;
	    	ajaxService.AjaxGetNoBlock(getResultApi, successFunction, errorFunction);
	    };
		this.getExecutionDataByExecutionId = function(executionId,successFunction, errorFunction){
	    	var getResultApi = './api/executionData/getExecutionDataByExecutionId/' + executionId;
	    	ajaxService.AjaxGetNoBlock(getResultApi, successFunction, errorFunction);
	    };
		this.getExecutionRequirementTrace = function(executionId, successFunction, errorFunction){
	    	var getResultApi = './api/trace/executionRequirement/' + executionId;
	    	ajaxService.AjaxGetNoBlock(getResultApi, successFunction, errorFunction);
	    };
		
	    this.getExecutionReport = function(executionId, successFunction, errorFunction){
	    	var getResultApi = './api/execution/export/' + executionId;
	    	ajaxService.AjaxGetNoBlock(getResultApi, successFunction, errorFunction);
	    };
	    
	    // execution status
	    this.getExecutionStatus = function(executionId, successFunction, errorFunction){	    	
	    	var getExecutionStatusApi = "./api/query/executionStatus/" + executionId;	    	
			ajaxService.AjaxGetNoBlock(getExecutionStatusApi, successFunction, errorFunction);
	    };
	    
	    this.getExecutionStatusByProject = function(projectId, successFunction, errorFunction){	    	
	    	var getExecutionStatusByProjectApi = "./api/query/executionStatus/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(getExecutionStatusByProjectApi, successFunction, errorFunction);
	    };
	    
	    this.getActiveExecutionByProject = function(projectId, successFunction, errorFunction){	    	
	    	var getActiveExecutionByProjectApi = "./api/query/executionStatus/active/" + projectId;	    	
			ajaxService.AjaxGet(getActiveExecutionByProjectApi, successFunction, errorFunction);
	    };
	    
	    this.getCompletedExecutionByProject = function(projectId, successFunction, errorFunction){	    	
	    	var getCompletedExecutionByProjectApi = "./api/query/executionStatus/completed/" + projectId;	    	
			ajaxService.AjaxGet(getCompletedExecutionByProjectApi, successFunction, errorFunction);
	    };
	    
	    this.getJsonStorage = function(id, successFunction, errorFunction){
	    	var getJsonStorageApi = "./api/jsonStorage/get/" + id;	    	
			ajaxService.AjaxGetNoBlock(getJsonStorageApi, successFunction, errorFunction);
	    };
	    
	    // execution trigger
	    this.createTestsetExecutionTrigger = function(obj, successFunction, errorFunction){
	    	var api = './api/testsetExecutionTrigger/create';
	    	ajaxService.AjaxPost(obj, api, successFunction, errorFunction);	       
	    };
	    
	    this.editTestsetExecutionTrigger = function(obj, successFunction, errorFunction){
	    	var api = './api/testsetExecutionTrigger/update';
	    	ajaxService.AjaxPost(obj, api, successFunction, errorFunction);	       
	    };
	    
	    this.getTestsetExecutionTriggerByTestsetId = function(projectId, testsetId, successFunction, errorFunction){	    	
	    	var api = "./api/testsetExecutionTrigger/getByTestsetId/" + projectId + "/" + testsetId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.deleteTestsetExecutionTrigger = function(projectId, testsetExecutionTriggerId, successFunction, errorFunction){	    	
	    	var api = "./api/testsetExecutionTrigger/delete/" + projectId + "/" + testsetExecutionTriggerId;	    	
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
	    
	    // exception recover
	    
	    this.createExceptionRecover = function(obj, successFunction, errorFunction){
	    	var api = './api/recoverSubscript/create';
	    	ajaxService.AjaxPost(obj, api, successFunction, errorFunction);	       
	    };
	    
	    this.updateExceptionRecover = function(obj, successFunction, errorFunction){
	    	var api = './api/recoverSubscript/update';
	    	ajaxService.AjaxPost(obj, api, successFunction, errorFunction);	       
	    };
	    
	    this.getExceptionRecoverByProjectId = function(projectId, successFunction, errorFunction){	    	
	    	var api = "./api/recoverSubscript/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.deleteExceptionRecover = function(projectId, exceptionRecoverId, successFunction, errorFunction){	    	
	    	var api = "./api/recoverSubscript/delete/" + projectId + "/" + exceptionRecoverId;	    	
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
	    
	    // requirement
		this.getRequirementCustomizedFields = function(projectId, successFunction, errorFunction){
			var selectApi = "./api/requirement/customizedFields/get/" + projectId;
			ajaxService.AjaxGet(selectApi, successFunction, errorFunction);
		};

		this.updateRequirementCustomizedFields = function(projectId, customizedReqFields, successFunction, errorFunction){
			var selectApi = "./api/project/customizedReqFields/update";
			var obj = {
				projectId,
				customizedReqFields
			}
			ajaxService.AjaxPost(obj, selectApi, successFunction, errorFunction);
		};


	    this.getRequirementById = function(projectId, requirementId, successFunction, errorFunction){	    	
	    	var getRequirementByIdApi = "./api/requirement/" + projectId + "/" + requirementId;	    	
			ajaxService.AjaxGet(getRequirementByIdApi, successFunction, errorFunction);
	    };
	    
	    this.getRequirementByProjectId = function(projectId, successFunction, errorFunction){	    	
	    	var getRequirementApi = "./api/requirement/" + projectId;	    	
			ajaxService.AjaxGet(getRequirementApi, successFunction, errorFunction);
	    };
	    
	    this.createRequirement = function(reqObj, successFunction, errorFunction){
	    	var api = './api/requirement/create';
	    	ajaxService.AjaxPost(reqObj, api, successFunction, errorFunction);	       
	    };
	    
	    this.syncRequirement = function(requirements, successFunction, errorFunction){
	    	var api = './api/requirement/sync';
	    	ajaxService.AjaxPostTimeConsumedNoBlock(requirements, api, successFunction, errorFunction);	   
	    };
	    
	    this.updateRequirement = function(reqObj, successFunction, errorFunction){
	    	var api = './api/requirement/update';
	    	ajaxService.AjaxPost(reqObj, api, successFunction, errorFunction);	       
	    };
	    
	    this.deleteRequirement = function(projectId, id, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/delete/" + projectId + "/" + id;	    	
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
	    
	    this.deleteRequirementWithMapping = function(projectId, id, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/deleteWithMapping/" + projectId + "/" + id;	    	
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
	    
	    this.copyRequirement = function(projectId, sourceRequirementId, targetParentRequirementId, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/copy/" + projectId + "/" + sourceRequirementId + "/" + targetParentRequirementId;	    	
			ajaxService.AjaxPostTimeConsumedNoBlock(null, api, successFunction, errorFunction);
	    };
	    
	    this.cutRequirement = function(projectId, sourceRequirementId, targetParentRequirementId, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/cut/" + projectId + "/" + sourceRequirementId + "/" + targetParentRequirementId;	    	
			ajaxService.AjaxPostTimeConsumedNoBlock(null, api, successFunction, errorFunction);
	    };
	    
	    this.findReferenceOfScriptByRequirementId = function(projectId, requirementId, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/findReferenceOfScriptByRequirementId/" + projectId + "/" + requirementId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.findReferenceOfRequirementByScriptId = function(projectId, scriptId, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/findReferenceOfRequirementByScriptId/" + projectId + "/" + scriptId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.updateRequirementScriptMapping = function(requirementScriptMappingInfo, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/updateRequirementScriptMapping";	    	
			ajaxService.AjaxPost(requirementScriptMappingInfo, api, successFunction, errorFunction);
	    };
	    
	    this.getRequirementMappingByProjectId = function(projectId, successFunction, errorFunction){	    	
	    	var api = "./api/requirement/getRequirementMappingByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.getRequirementsByRequirementIds = function(projectId, requirementIds, successFunction, errorFunction){
	    	var api = "./api/requirement/data/byRequirementIds";
	    	var obj = {
	    				'projectId':projectId, 
	    				'requirementIds':requirementIds
	    				};
			ajaxService.AjaxPostTimeConsumedNoBlock(obj, api, successFunction, errorFunction);
	    };
	    
	    this.calculateRequirementCoverage = function(projectId, successFunction, errorFunction){
	    	var api = "./api/requirement/coverage/calculate/" + projectId;	    	
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
	    
	    this.addIcdFile = function(file, successFunction, errorFunction){	    	
	    	var api = "./api/icd/add";	    	
			ajaxService.AjaxPostFile(file, api, successFunction, errorFunction);
	    };
	    
	    this.getIcdFiles = function(successFunction, errorFunction){
	    	var api = "./api/icd/documents";	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
	    
	    this.startIcdAnalysis = function(payload,successFunction, errorFunction){
	    	var api = "./api/execution/icd";	    	
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };
	    
	    this.getIcdResult = function(executionId, resultIdAsStartPoint, successFunction, errorFunction){
	    	var api = "./api/query/executionResult/icd/" + executionId + "/" + resultIdAsStartPoint;	    	
			ajaxService.AjaxGetNoBlock(api, successFunction, errorFunction);
	    };

		// momonitoring test set
		this.createMonitoringTestSet = function(payload,successFunction, errorFunction){
	    	var api = "./api/monitoringTestSet/create";	    	
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };
		this.createSpecialTest = function(payload,successFunction, errorFunction){
	    	var api = "./api/specialTest/create";	    	
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };
		this.createSpecialTestData = function(payload,successFunction, errorFunction){
	    	var api = "./api/specialTestData/create";
			ajaxService.AjaxPostNoBlock(payload, api, successFunction, errorFunction);
	    };
		this.updateMonitoringTestSet = function(payload,successFunction, errorFunction){
	    	var api = "./api/monitoringTestSet/update";	    	
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };
		this.updateSpecialTest = function(payload,successFunction, errorFunction){
	    	var api = "./api/specialTest/update";	    	
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };

		this.removeMonitoringTestSet = function(projectId, id, successFunction, errorFunction){
	    	var api = "./api/monitoringTestSet/delete/" + projectId + "/" + id;
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
		this.removeSpecialTest = function(projectId, id, successFunction, errorFunction){
	    	var api = "./api/specialTest/delete/" + projectId + "/" + id;
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
	    };
		this.getMonitoringTestSetByProjectId = function(projectId, successFunction, errorFunction){	    	
	    	var api = "./api/monitoringTestSet/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		this.getSpecialTestsByProjectId = function(projectId, successFunction, errorFunction){	    	
	    	var api = "./api/specialTest/getByProjectId/" + projectId;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		this.getSpecialTestDatasBySpecialTestId = function(specialTestId, successFunction, errorFunction){	    	
	    	var api = "./api/specialTestData/" + specialTestId;	
			ajaxService.AjaxGetNoBlock(api, successFunction, errorFunction);
	    };
		
		this.getMonitoringTestSet = function(projectId, id, successFunction, errorFunction){	    	
	    	var api = "./api/monitoringTestSet/" + projectId + "/" + id;	    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };
		this.addMonitorExecution=function(monitorExecution,successFunction, errorFunction){
			var api = "./api/monitorExecution/addMonitorExecution";	    	
			ajaxService.AjaxPost(monitorExecution, api, successFunction, errorFunction);
		};
		
		// monitoring execution
		/*
		{
			"executionId": "EFDCCB7B-8FD7-49E0-996C-F5971DD325DB",
			"monitoringTestSetId": 4,
			"projectId": 5,
			"ipAddress": "127.0.0.1",
			"port":80,
			"executedByUserId":"david.zhang@macrosoftsys.com"
		}
		*/
		this.startMonitoringExecution = function(payload,successFunction, errorFunction){
	    	// var api = "./api/monitorExecution/start";
	    	var api = "./api/execution/preprocess/scripts";
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };
		/*
		{
			"executionId": "EFDCCB7B-8FD7-49E0-996C-F5971DD325DB",
			"monitoringTestSetId": 4,
			"projectId": 5,
			"ipAddress": "127.0.0.1",
			"port":80,
			"executedByUserId":"david.zhang@macrosoftsys.com"
		}
		*/
		this.sendMonitoringExecutionCommand = function(payload,successFunction, errorFunction){
	    	// var api = "./api/monitorExecution/sendCommand";
			var api = "./api/execution/preprocess/scripts";
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };

		this.updateMonitorExecution=function(executionId, successFunction, errorFunction){
			var api = "./api/monitorExecution/updateMonitorExecution/" + executionId;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
		};
		this.stopMonitoringExecution = function(payload,successFunction, errorFunction){
	    	// var api = "./api/monitorExecution/stop";
			var api = "./api/execution/preprocess/scripts";
			ajaxService.AjaxPost(payload, api, successFunction, errorFunction);
	    };

		this.getMonitoringExecutionDetailByExecutionId = function(executionId, resultIdAsStartPoint, successFunction, errorFunction){
			var api = "./api/monitorExecution/monitorDetailByExecutionId/" + executionId + "/" + resultIdAsStartPoint;
			ajaxService.AjaxGetNoBlock(api, successFunction, errorFunction);
		};

		this.getMonitoringExecutionDetail = function(executionId, monitorDataName, resultIdAsStartPoint, successFunction, errorFunction){
	    	var api = "./api/monitorExecution/monitorDetail/" + executionId + "/" + monitorDataName + "/" + resultIdAsStartPoint;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		/*
			{
				"status": 1,
				"result": "UtpCoreNetworkError" 
				"ConfigureError","AntbotNotFoundError", "UtpCoreNetworkError",  
				"AnalyzeScriptError", "StartExecutionError"，
				"UnknowError"， "Terminated"， "Completed"
			}
		*/
		this.getMonitoringExecutionStatus = function(executionId, successFunction, errorFunction){	    	
	    	var api = "./api/monitorExecution/getStatus/" + executionId;	
	    };

		/*
		{
			"status": 1,
			"result": [
				{
				"id":9,
				"executionId": "EFDCCB7B-8FD7-49E0-996C-F5971DD325DB",
				”monitorDataName”: "xxx",
				"jsonData": "refer 贤龙邮件",
				"ExecutionDate":"2023-02-23",
				"ExecutionStatus":"", //该字段可能的值为："Start","","Stop"
				}
			]
		}
		*/
		this.getMonitoringExecutionDetailByName = function(executionId, monitorDataName, resultIdAsStartPoint, successFunction, errorFunction){	    	
	    	var api = "./api/monitorExecution/monitorDetail/" + executionId + "/" + monitorDataName + "/" + resultIdAsStartPoint;    	
			ajaxService.AjaxGet(api, successFunction, errorFunction);
	    };

		this.getMonitoringExecutionDataByTestSetId = function (testSetId, successFunction, errorFunction){
			var api = "./api/monitorExecution/monitorExecutionData/" + testSetId;
			ajaxService.AjaxGet(api, successFunction, errorFunction);
		}

		this.removeResultByExecutionId = function (executionId, successFunction, errorFunction){
			var api = "./api/monitorExecution/delete/" + executionId;
			ajaxService.AjaxPost(null, api, successFunction, errorFunction);
		}
	}
	return new utpService();
})