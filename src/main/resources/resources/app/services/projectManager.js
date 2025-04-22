define(['jquery','knockout','services/selectionManager','services/utpService', 'services/loginManager','services/ursService', 'services/fileManagerUtility'],
		function($, ko, selectionManager, utpService, loginManager, ursService, fileManagerUtility) {
	function projectManager() {
		var self = this;
		
		this.defaultProject = 0;
    	this.systemTemplate = 1;
    	this.customerTemplate = 2;
		
		this.utpService = utpService;
		this.loginManager = loginManager;
		this.selectionManager = selectionManager;
		this.fileManagerUtility = fileManagerUtility;

		this.projects = ko.observableArray([]);
		this.agentsConfigData = ko.observableArray([]); //antbotName
		this.comagentsConfigData = ko.observableArray([]); //公共逻辑库下的机器人
		this.projectConfigData = null;
		this.testCaseGroupManager = null;
		this.runableScriptGroupManager = null;		
		this.scriptGroupManager = null;
		
		this.currentTestCaseOpenFolders = [];
		this.currentRequirementOpenFolders = [];
		this.currentTestCasePath = "";
		this.currentRequirementPath = "";
		this.subScriptMapping = new Map();
		
        this.loadProjectSuccessFunction = null;
		this.loadProjectErrorFunction = null;       
		this.loadProjectConfigCallback = null;
		this.loadAgentConfigCallback = null;
		
		this.backupTestCase = null;
		this.useBackupTestCase = false;
		this.backupScripts = null;
		this.useBackupScripts = false;
		this.backupCommonScripts = null;
		this.useBackupCommonScripts = false;
		this.previousEditedScript = null;
		
		this.requirementManager = null;
		this.RequirementGroupMode = "requirementgroup";
		this.RequirementMode = "requirement";
		this.CheckPointMode = "checkpoint";
		this.requirementScriptMapping = new Map();
		this.scriptRequirementMapping = new Map();
		this.agentTypeValidityList= [];

		this.isMonitoringResult = false

		//projects
		this.getProjectSuccessFunction = function(projects){
			self.projects([]);
			if (projects != null) {
				for (var i = 0; i < projects.length; i++){
						if(projects[i].id != 0){
						self.projects.push(projects[i]);
					}
				}
			}
		}
		
		this.getProjectErrorFunction = function(error){
			console.log("Load projects fail: " + error);
		}
		
		this.getProjects = function(organization, successCallback, errorCallback){			
			self.utpService.getOrgProject(organization, 
					function(data){
						if(data != null && data.status === 1){
							self.getProjectSuccessFunction(data.result);
							if(successCallback != null)
								successCallback.call(data.result);
						}
						else{
							self.getProjectErrorFunction("");
							if(errorCallback != null)
								errorCallback.call("");
						}
					}, 
					function(error){
						self.getProjectErrorFunction(error);
						if(errorCallback != null)
							errorCallback.call(error);
					});
		}
		
		this.getProjectRequirementCustomizedFieldMapping = function(projectId){
			for(var i=0; i < self.projects().length; i++){
				if(self.projects()[i].id === projectId){
					return self.projects()[i].customizedReqFields;
				}
			}
			return null;
		}

		this.setProjectRequirementCustomizedFieldMapping = function(projectId, customizedField){
			var project = null;
			for(var i=0; i < self.projects().length; i++){
				if(self.projects()[i].id === projectId){
					project = self.projects()[i];
					break;
				}
			}
			if(project)
				project.customizedReqFields = customizedField;
		}

		this.getProjectScriptCustomizedFieldMapping = function(projectId){
			for(var i=0; i < self.projects().length; i++){
				if(self.projects()[i].id === projectId){
					return self.projects()[i].customizedScriptFields
				}
			}
			return null;
		}

		this.setProjectScriptCustomizedFieldMapping = function(projectId, customizedField){
			var project = null;
			for(var i=0; i < self.projects().length; i++){
				if(self.projects()[i].id === projectId){
					project = self.projects()[i];
					break;
				}
			}
			if(project)
				project.customizedScriptFields = customizedField;
		}

		// subscript name id mapping
		this.getSubScript = function(id){
			var scriptId = parseInt(id);
			var subScript = self.subScriptMapping.get(scriptId);	       
	        return subScript;
		}
		this.getTestcase= function(id){
			var scriptId = parseInt(id);
			var testcase = self.testcaseMapping.get(scriptId);	       
	        return testcase;
		}

		this.getRunableScriptData= function(id){
			var scriptId = parseInt(id);
			var RunableScript = self.runablescripMapping.get(scriptId);	       
	        return RunableScript;
		}

		this.recorverAgentName = function(agentName){
			var regex = /\[{2}(.+)(\]{2})$/gm;
			var matchList = regex.exec(agentName);
			if(matchList == null)
				return agentName;
			return matchList[1];
		};
        // agent type
		this.getAgentType = function(antbotName){
			antbotName = self.recorverAgentName(antbotName);	
			if(self.agentsConfigData() === null || self.agentsConfigData().length === 0)
				return null;
			
			for(var i=0;i<self.agentsConfigData().length;i++){
				if(self.agentsConfigData()[i].antbotName === antbotName)
					return self.agentsConfigData()[i].antbotType;								
			}
			return null;
		}

		this.getFullAgentType = function(antbotName){
			if(self.agentsConfigData() === null || self.agentsConfigData().length === 0)
				return null;
			
			for(var i=0;i<self.agentsConfigData().length;i++){
				if(self.agentsConfigData()[i].antbotName === antbotName)
					return self.agentsConfigData()[i];								
			}
			return null;
		}

		this.loadAgentTypeValidity = function(organization, authorizationKey){
			ursService.getAgentTypeValidity(organization, authorizationKey, self.loadAgentTypeValiditySuccessFunction, self.loadResourcesErrorFunction);
			ursService.getAllAgentType(organization,authorizationKey,self.loadAllAgentTypeSuccessFunction, self.loadAllAgentTypeErrorFunction);
		
		}
		//获取所有的机器人类型
		this.showAntbotTypes = ko.observableArray([]);
		this.loadAllAgentTypeSuccessFunction = function(allAgentTypeList){
			if(allAgentTypeList != null && allAgentTypeList != ""){
				self.showAntbotTypes.removeAll();
				for (var i=0;i<allAgentTypeList.toolTypes.length;i++){
					self.showAntbotTypes.push(allAgentTypeList.toolTypes[i])																			
				}		
			}
		}
		this.loadAllAgentTypeErrorFunction = function(response){
			console.log("error")
		}

		this.loadAgentTypeValiditySuccessFunction = function(agentTypeValidityList){
			if(agentTypeValidityList != null && agentTypeValidityList != ""){
				self.agentTypeValidityList = agentTypeValidityList;
			}
		}

		this.getAgentConfigByProjectSuccessFunction = function(data){
			if (data && data.status === 1) {
				var nowDate = new Date();
				var y = nowDate.getFullYear()
				var m = nowDate.getMonth()+1
				var d = nowDate.getDate()
				for(var i=0;i<data.result.length;i++){
					for(var j=0;j<self.agentTypeValidityList.length;j++){
						if(data.result[i].antbotType==self.agentTypeValidityList[j].agentName){
							data.result[i].agentValidity=self.agentTypeValidityList[j].agentEnd;
							break;
						}else data.result[i].agentValidity="Error";
					}
					//如果tool-type中有该机器人类型,日期设置为--，否则设置为Error
					if(data.result[i].agentValidity=="Error"){
						for(var k = 0; k < self.showAntbotTypes().length; k++) {
							if(data.result[i].antbotType==self.showAntbotTypes()[k].name){
								data.result[i].agentValidity=" - - ";
								break;
							}else data.result[i].agentValidity="Error";
						}
					}
					var tempValidity = data.result[i].agentValidity;
					if(tempValidity != 'Error'){
						var arr=tempValidity.split('-')
						var vy = arr[0]
						var vm = arr[1]
						var vd = arr[2]
						if(Number(vy)-Number(y)==0 && Number(vm)-Number(m) == 0 && (Number(vd)-Number(d) <= 10 && Number(vd)-Number(d) >= 0)){
							data.result[i].isDue = true
							data.result[i].isOverDue = false
						}else if(Number(vy)-Number(y) < 0 || (Number(vy)-Number(y)==0 && Number(vm)-Number(m) < 0) || (Number(vy)-Number(y)==0 && Number(vm)-Number(m) == 0 && Number(vd)-Number(d) < 0) ){
							data.result[i].isDue = true
							data.result[i].isOverDue = true
						}
						else {
							data.result[i].isDue = false
							data.result[i].isOverDue = false
						}
					}else {
						data.result[i].isDue = true
						data.result[i].isOverDue = true
					}
				}

				for (var i = 0; i < data.result.length; i++) {
					if(data.result[i].projectId == 0){
						self.comagentsConfigData.push(data.result[i]);
					}else{
						self.agentsConfigData.push(data.result[i]);
					}
				}
			}
		
			if (typeof self.loadAgentConfigCallback === "function"){
				self.loadAgentConfigCallback();
				self.loadAgentConfigCallback = null;
			}
		};
		
		this.getAgentConfigByProjectErrorFunction = function(){};
		
		this.updateAgentConfigFromServer = function(projectID) {
			self.agentConfigDataclear();
			self.utpService.getAgentConfigByProject(projectID, self.getAgentConfigByProjectSuccessFunction, self.getAgentConfigByProjectErrorFunction);
		};
		
		this.agentConfigDataclear = function()	{
			self.agentsConfigData([]);
		};

		this.updateComAgentConfigFromServer = function(projectID) {
			self.comAgentConfigDataclear();
			self.utpService.getAgentConfigByProject(projectID, self.getAgentConfigByProjectSuccessFunction, self.getAgentConfigByProjectErrorFunction);
		};

		this.comAgentConfigDataclear = function()	{
			self.comagentsConfigData([]);
		};

		this.testcaseMappingClear = function(){
			self.testcaseMapping = new Map();
		};

		this.runablescriptMappingClear = function(){
			self.runablescripMapping = new Map();
		};
		
		this.subScriptMappingClear = function(){
			self.subScriptMapping = new Map();
		};
	
		this.projectConfigDataClear = function(){
			self.projectConfigData = null;					
			self.requirementScriptMapping.clear();
			self.scriptRequirementMapping.clear();
		};

		this.getTestCaseGroups = function(){
			var scriptGroups = [];
			scriptGroups.push(self.testCaseGroupManager.data.pull[fileManagerUtility.root]);
			var stack = [];
			stack.push(self.testCaseGroupManager.data.pull[fileManagerUtility.root]);
			while (stack.length > 0) {
				var node = stack.pop();
				if (node != null) {
					node.data = [];
					var branches = self.testCaseGroupManager.data.getBranch(node.id);
					for (var i = 0; i < branches.length; i++) {
						node.data.push(branches[i]);
						stack.push(branches[i]);
					}
				}
			}			
			return scriptGroups;
		};

		this.getRunableScriptGroups = function(){
			var scriptGroups = [];
			scriptGroups.push(self.runableScriptGroupManager.data.pull[fileManagerUtility.root]);
			var stack = [];
			stack.push(self.runableScriptGroupManager.data.pull[fileManagerUtility.root]);
			while (stack.length > 0) {
				var node = stack.pop();
				if (node != null) {
					node.data = [];
					var branches = self.runableScriptGroupManager.data.getBranch(node.id);
					for (var i = 0; i < branches.length; i++) {
						node.data.push(branches[i]);
						stack.push(branches[i]);
					}
				}
			}			
			return scriptGroups;
		};
		
		this.getScriptGroups = function(){
			var scriptGroups = [];
			scriptGroups.push(self.scriptGroupManager.data.pull[fileManagerUtility.root]);
			var stack = [];
			stack.push(self.scriptGroupManager.data.pull[fileManagerUtility.root]);
			while (stack.length > 0) {
				var node = stack.pop();
				if (node != null) {
					node.data = [];
					var branches = self.scriptGroupManager.data.getBranch(node.id);
					for (var i = 0; i < branches.length; i++) {
						node.data.push(branches[i]);
						stack.push(branches[i]);
					}
				}
			}			
			return scriptGroups;
		};
		
		this.getRequirements = function(){
			var requirements = [];
			requirements.push(self.requirementManager.data.pull[fileManagerUtility.root]);
			var stack = [];
			stack.push(self.requirementManager.data.pull[fileManagerUtility.root]);
			while (stack.length > 0) {
				var node = stack.pop();
				if (node != null) {
					node.data = [];
					var branches = self.requirementManager.data.getBranch(node.id);
					for (var i = 0; i < branches.length; i++) {
						node.data.push(branches[i]);
						stack.push(branches[i]);
					}
				}
			}			
			return requirements;
		};

		this.setTestCaseGroupManager = function(manager){
			self.testCaseGroupManager = manager;
		};
		
		this.getTestCasePath = function(scriptId){
			if(self.testCaseGroupManager)
				return self.testCaseGroupManager.getPathNames(scriptId);
			else
				return [];
		};
		
		this.getTestCase = function(scriptId){
			if(self.testCaseGroupManager)
				return self.testCaseGroupManager.getItem(scriptId);
			else
				return null;
		};

		this.setRunableScriptGroupManager = function(manager){
			self.runableScriptGroupManager = manager;
		};
		
		this.getRunableScriptPath = function(scriptId){
			if(self.runableScriptGroupManager)
				return self.runableScriptGroupManager.getPathNames(scriptId);
			else
				return [];
		};
		
		this.getRunableScript = function(scriptId){
			if(self.runableScriptGroupManager)
				return self.runablescriptGroupManager.getItem(scriptId);
			else
				return null;
		};
		
		this.setScriptGroupManager = function(manager){
			self.scriptGroupManager = manager;
		};
		
		this.getScriptPath = function(scriptId){
			if(self.scriptGroupManager)
				return self.scriptGroupManager.getPathNames(scriptId);
			else
				return [];
		};
		
		this.getScript = function(scriptId){
			if(self.scriptGroupManager)
				return self.scriptGroupManager.getItem(scriptId);
			else
				return null;
		};
		
		this.getScriptReferenceOfRequirement = function (requirmentId){			
			 var scripts = self.requirementScriptMapping.get(requirmentId);
			 var scriptPaths = [];
		     if (scripts) {
		    	 scripts.forEach(function(scriptId) {
		    		 var nodes = self.getScriptPath(scriptId);
					 var item = self.getScript(scriptId);
		    		 var path = [];
		    		 nodes.forEach(function(node){
		    			 path.push(node.value);
		    		 });
		    		 scriptPaths.push(item.id + "(" + (item.customizedId == null ? '' : item.customizedId) +"):" + path.join(" > "));
		          });
		     }
		     return scriptPaths;
		};
		
		this.setRequirementManager = function(manager){
			self.requirementManager = manager;
		};
		
		this.getRequirementPath = function(requirementId){
			if(self.requirementManager)
				return self.requirementManager.getPathNames(requirementId);
			else
				return [];
		};
		
		this.getRequirement = function(requirementId){
			if(self.requirementManager)
				return self.requirementManager.getItem(requirementId);
			else
				return null;
		};
		
		this.getRequirementReferenceOfScript = function (scriptId){
			var requirements = self.scriptRequirementMapping.get(scriptId);
			 var requirementPaths = [];
		     if (requirements) {
		    	 requirements.forEach(function(requirementId){
		    		 var nodes = self.getRequirementPath(requirementId);
					 var item = self.getRequirement(requirementId);
		    		 var path = [];
		    		 nodes.forEach(function(node){
		    			 path.push(node.value);
		    		 });
		    		 requirementPaths.push(item.id + "(" + item.customizedId +"):" + path.join(" > "));
		          });
		     }
		     return requirementPaths;
		};
		
		this.scriptGroupsConvert = function(parent){
			if(parent === null)
				return [];
			
			var folder = {
					id: parent.id, //parent.scriptGroupLogicId
					customizedId: "",
					customizedFields: '',
					value: parent.name,
					description : parent.description,
					type:"folder", 
					date: new Date(2014,2,10,16,10),					
					dataType: "scriptGroup", // later remove				
					open : false,
					data : []
			};
			
			if(self.currentTestCaseOpenFolders != null){
				if($.inArray(parent.id, self.currentTestCaseOpenFolders) >= 0)
					folder.open = true;
			}
			
			var i=0;
			for(i = 0; i < parent.scripts.length; i++){
				var scriptType = 'file';
				var dataType = parent.scripts[i].type;
				if(parent.scripts[i].type == undefined)			
					dataType = 'testcase';				
				
				var file = {
						id: parent.scripts[i].id,
						customizedId: parent.scripts[i].customizedId,
						value: parent.scripts[i].name,
						description: parent.scripts[i].description, 
						parentScriptGroupId: parent.id,   // in future will be removed
						type: scriptType, 
						date: new Date(2014,2,10,16,10),
						dataType: dataType
				};				
				folder.data.push(file);
				if(dataType == 'testcase'){
					self.testcaseMapping.set(file.id, file);
				}
				if(dataType == 'runablescript'){
					self.runablescripMapping.set(file.id, file);
				}
			}
			
			for(i = 0; i < parent.subscripts.length; i++){
				var scriptType = 'text';
				var dataType = parent.subscripts[i].type;
				if(parent.subscripts[i].type == undefined)			
					dataType = 'usrlogicblock';				
				
				var file = {
						id: parent.subscripts[i].id,
						customizedId: parent.scripts[i].customizedId,
						value: parent.subscripts[i].name,
						description: parent.subscripts[i].description, 
						parentScriptGroupId: parent.id, // parent.id,  // in future will be removed
						type: scriptType, 
						date: new Date(2014,2,10,16,10),
						dataType: dataType,
						parameter : parent.subscripts[i].parameter, 
				};				
				folder.data.push(file);
				self.subScriptMapping.set(file.id, file);
			}
			
			for(i = 0; i < parent.scriptgroups.length; i++){
				var childScriptGroup = self.scriptGroupsConvert(parent.scriptgroups[i]);
				childScriptGroup.parentScriptGroupId = parent.id; //parent.parentScriptGroupId
				folder.data.push(childScriptGroup);
			}
			
			return folder;
		};
		
		this.removeEmptyScriptGroup = function(scripts){
			if(scripts != null){
				for(var i = scripts.length - 1; i >= 0; i--){										
					if(scripts[i].dataType == 'scriptGroup')
						if(scripts[i].data != null && scripts[i].data.length > 0){
							self.removeEmptyScriptGroup(scripts[i].data);
							if(scripts[i].data.length == 0)
								scripts.splice(i, 1);
						}								
						else
							scripts.splice(i, 1);
				}
			}
		};
		
		this.getnerateTargetProjectScriptGroupsFromFlatInfo = function(project, data){
			var scriptGroupMapping = new Map();
			var scriptParentMapping = new Map();
			var scriptGroups = {
				id: self.fileManagerUtility.root, 
				value: project,
				open: false,
				type: "folder", 
				date:  new Date(2014,2,10,16,10),
				data : []
			};
			
			scriptGroupMapping.set(0, scriptGroups);
			
			for(var i = 0; i < data.scriptGroups.length; i++){
				var parent = data.scriptGroups[i];
				if(parent === null || parent == undefined)
					continue;			
				var folder = {
					id: parent.id, //parent.scriptGroupLogicId
					customizedId: '',
					value: parent.name,
					description : parent.description,
					type:"folder", 
					date: new Date(2014,2,10,16,10),					
					dataType: "scriptGroup", // later remove				
					open : false,
					data : []
				};				
				scriptGroupMapping.set(folder.id, folder);
				scriptParentMapping.set(folder.id, parent.parentScriptGroupId);
			}
			
			scriptGroupMapping.forEach(function(value, key){
				var parentId = scriptParentMapping.get(value.id);
				if(parentId != null && parentId != undefined){
					var node = scriptGroupMapping.get(parentId);
					if(node != null && node != undefined)
		　　　　　　　　　　	node.data.push(value);
				}
	　　　　	});
			
			for(var i = 0; i < data.scripts.length; i++){
				var script = data.scripts[i];
				if(script === null || script == undefined)
					continue;
				
				var parent = scriptGroupMapping.get(script.parentScriptGroupId);
				if(parent === null || parent == undefined)
					continue;
				
				var dataType = script.type;
				var scriptType = '';
				
				if(script.type === "testcase" || script.type === "runablescript"){
					scriptType = 'file';
					if(script.type == undefined)
						dataType = 'testcase';
				}
				else if(script.type === "usrlogicblock" || script.type === "syslogicblock"){
					scriptType = 'text';					
					if(script.type == undefined)			
						dataType = 'usrlogicblock';	
				}
				
				var file = {
						id: script.id,
						customizedId: script.customizedId,
						value: script.name,
						description: script.description, 
						parentScriptGroupId: parent.id,   // in future will be removed
						type: scriptType, 
						date: new Date(2014,2,10,16,10),
						dataType: dataType
				};
				
				if(script.type === "usrlogicblock" || script.type === "syslogicblock")
					file.parameter = script.parameter;
				parent.data.push(file);
			}			
			return scriptGroups;
		};
		this.testcaseMapping = new Map();
		this.runablescripMapping = new Map();

		this.generateScriptGroupsFromFlatInfo = function(data){
			var scriptGroupMapping = new Map();
			var scriptParentMapping = new Map();
			var scriptGroups = {
				id: self.fileManagerUtility.root, 
				value: self.selectionManager.selectedProject().name,
				open: false,
				type: "folder", 
				date:  new Date(2014,2,10,16,10),
				data : []
			};
			
			scriptGroupMapping.set(0, scriptGroups);
			
			for(var i = 0; i < data.scriptGroups.length; i++){
				var parent = data.scriptGroups[i];
				if(parent === null || parent == undefined)
					continue;			
				var folder = {
					id: parent.id, //parent.scriptGroupLogicId
					customizedId: '',
					value: parent.name,
					description : parent.description,
					type:"folder", 
					date: new Date(2014,2,10,16,10),					
					dataType: "scriptGroup", // later remove				
					open : false,
					data : []
				};
				
				if(self.currentTestCaseOpenFolders != null){
					if($.inArray(parent.id, self.currentTestCaseOpenFolders) >= 0)
						folder.open = true;
				}
				scriptGroupMapping.set(folder.id, folder);
				scriptParentMapping.set(folder.id, parent.parentScriptGroupId);
			}
			
			scriptGroupMapping.forEach(function(value, key){
				var parentId = scriptParentMapping.get(value.id);
				if(parentId != null && parentId != undefined){
					var node = scriptGroupMapping.get(parentId);
					if(node != null && node != undefined)
						node.data.push(value);
				}
				});
			
			for(var i = 0; i < data.scripts.length; i++){
				var script = data.scripts[i];
				if(script === null || script == undefined)
					continue;
				
				var parent = scriptGroupMapping.get(script.parentScriptGroupId);
				if(parent === null || parent == undefined)
					continue;
				
				var dataType = script.type;
				var scriptType = '';
				
				if(script.type === "testcase" || script.type === "runablescript"){
					scriptType = 'file';
					if(script.type == undefined)
						dataType = 'testcase';
				}
				else if(script.type === "usrlogicblock" || script.type === "syslogicblock"){
					scriptType = 'text';					
					if(script.type == undefined)			
						dataType = 'usrlogicblock';	
				}
				
				var file = {
						id: script.id,
						customizedId: script.customizedId,
						value: script.name,
						description: script.description, 
						parentScriptGroupId: parent.id,   // in future will be removed
						type: scriptType, 
						date: new Date(2014,2,10,16,10),
						dataType: dataType
				};
				
				if(script.type === "usrlogicblock" || script.type === "syslogicblock"){
					file.parameter = script.parameter;
					self.subScriptMapping.set(file.id, file);
				}
				if(script.type === "testcase"){
					self.testcaseMapping.set(file.id, file);
				}
				if(script.type === "runablescript"){
					self.runablescripMapping.set(file.id, file);
				}
				parent.data.push(file);
			}			
			return scriptGroups;
		};
		
		this.generateSubScriptGroupsFromFlatInfo = function(data) {
			var scriptGroupMapping = new Map();
			var scriptParentMapping = new Map();
			
			// 创建两个根分组文件夹
			var group0Folder = {
				id: -1, // 唯一ID，避免冲突
				value: '公共逻辑',
				type: 'folder',
				open: false,
				date: new Date(2014, 2, 10, 16, 10),
				dataType: "scriptGroup",
				data: []
			};
			
			var groupOtherFolder = {
				id: -2,
				value: '当前项目',
				type: 'folder',
				open: false,
				date: new Date(2014, 2, 10, 16, 10),
				dataType: "scriptGroup", // later remove
				data: []
			};
			
			// 注册根文件夹
			scriptGroupMapping.set(group0Folder.id, group0Folder);
			scriptGroupMapping.set(groupOtherFolder.id, groupOtherFolder);
			
			// 处理 scriptGroups，生成唯一键避免ID冲突
			for (var i = 0; i < data.scriptGroups.length; i++) {
				var group = data.scriptGroups[i];
				if (!group) continue;
				
				var groupUniqueKey = group.id + '_' + group.projectId; // 唯一键
				var folder = {
					id: groupUniqueKey,
					customizedId: '',
					value: group.name,
					description: group.description,
					type: "folder",
					date: new Date(2014, 2, 10, 16, 10),
					dataType: "scriptGroup",
					open: false,
					data: []
				};
				
				if (self.currentTestCaseOpenFolders && $.inArray(group.id, self.currentTestCaseOpenFolders) >= 0) {
					folder.open = true;
				}
				
				scriptGroupMapping.set(groupUniqueKey, folder);
				
				// 确定父节点ID
				var parentId;
				if (group.parentScriptGroupId === 0) {
					// 根目录下，根据projectId分配
					parentId = group.projectId === 0 ? group0Folder.id : groupOtherFolder.id;
				} else {
					// 父节点唯一键由父ID和当前projectId组成（假设父节点在同一项目）
					parentId = group.parentScriptGroupId + '_' + group.projectId;
				}
				scriptParentMapping.set(groupUniqueKey, parentId);
			}
			
			// 构建层级结构
			scriptGroupMapping.forEach(function(value, key) {
				if (key === group0Folder.id || key === groupOtherFolder.id) return; // 跳过根节点
				
				var parentId = scriptParentMapping.get(key);
				if (parentId != null) {
					var parent = scriptGroupMapping.get(parentId);
					if (parent) {
						parent.data.push(value);
					}
				}
			});
			
			// 处理 scripts，正确查找父节点
			for (var i = 0; i < data.scripts.length; i++) {
				var script = data.scripts[i];
				if (!script) continue;
				
				// 构造父节点的唯一键
				var parentUniqueKey = script.parentScriptGroupId + '_' + script.projectId;
				var parent = scriptGroupMapping.get(parentUniqueKey);
				if (!parent) continue;
				
				var scriptType = '';
				var dataType = script.type;
				
				if (script.type === "testcase" || script.type === "runablescript") {
					scriptType = 'file';
					dataType = script.type || 'testcase';
				} else if (script.type === "usrlogicblock" || script.type === "syslogicblock") {
					scriptType = 'text';
					dataType = script.type || 'usrlogicblock';
				}
				
				var file = {
					id: script.id,
					customizedId: script.customizedId,
					value: script.name,
					description: script.description,
					parentScriptGroupId: parent.id,
					type: scriptType,
					date: new Date(2014, 2, 10, 16, 10),
					dataType: dataType
				};
				
				// 其他属性处理...
				parent.data.push(file);
			}
			
			// 返回结构
			return {
				id: self.fileManagerUtility.root,
				value: self.selectionManager.selectedProject().name,
				open: false,
				type: "folder",
				date: new Date(2014, 2, 10, 16, 10),
				data: [group0Folder, groupOtherFolder]
			};
		};
		this.generateScriptGroups = function(data){			
			var scriptGroups = {
					id: self.fileManagerUtility.root, 
					value: self.selectionManager.selectedProject().name,
					open: false,
					type: "folder", 
					date:  new Date(2014,2,10,16,10),
					data : []
			};
			
			for(var i = 0; i < data.scriptgroups.length; i++){
				var node = self.scriptGroupsConvert(data.scriptgroups[i]);					
				scriptGroups.data.push(node);				
			}
			return scriptGroups;
		};
		
		this.generateRequirement = function(requirements){
			var requirementGroupMapping = new Map();
			var requirementParentMapping = new Map();
			var requirementGroups = {
				id: self.fileManagerUtility.root,
				customizedId: '',
				value: self.selectionManager.selectedProject().name,
				open: false,
				type: "folder", 
				date:  new Date(2014,2,10,16,10),
				data : [],
				customizedFields:''
			};
			
			requirementGroupMapping.set(0, requirementGroups);
			
			for(var i = 0; i < requirements.length; i++){
				if(requirements[i] === null || requirements[i] == undefined)
					continue;
				
				if(requirements[i].leaf)
					continue;
				
				var folder = {
					id: requirements[i].id, //parent.scriptGroupLogicId
					customizedId: requirements[i].customizedId,
					customizedFields: requirements[i].customizedFields ? requirements[i].customizedFields : '',
					value: requirements[i].title,
					description : requirements[i].description,
					coverage:requirements[i].coverage ?  requirements[i].coverage : '',
					comment : requirements[i].comment,
					leaf:requirements[i].leaf,
					type:"folder", 
					date: new Date(2014,2,10,16,10),					
					dataType: self.RequirementGroupMode,			
					open : false,
					data : []
				};
				
				if(self.currentRequirementOpenFolders != null){
					if($.inArray(requirements[i].id, self.currentRequirementOpenFolders) >= 0)
						folder.open = true;
				}
				requirementGroupMapping.set(folder.id, folder);
				requirementParentMapping.set(folder.id, requirements[i].parentId);
			}
			
			requirementGroupMapping.forEach(function(value, key){
				var parentId = requirementParentMapping.get(value.id);
				if(parentId != null && parentId != undefined){
					var node = requirementGroupMapping.get(parentId);
					if(node != null && node != undefined)
		　　　　　　　　　　	node.data.push(value);
				}
	　　　　	});
			
			for(var i = 0; i < requirements.length; i++){				
				if(requirements[i] === null || requirements[i] == undefined)
					continue;
				
				if(!requirements[i].leaf)
					continue;
				
				var parent = requirementGroupMapping.get(requirements[i].parentId);
				if(parent === null || parent == undefined)
					continue;
				
				var dataType = requirements[i].type;
				var scriptType = '';
				
				if(requirements[i].type === self.RequirementMode){
					scriptType = 'file';
					if(requirements[i].type == undefined)
						dataType = self.RequirementMode;
				}
				else if(requirements[i].type === self.CheckPointMode){
					scriptType = 'text';					
					if(requirements[i].type == undefined)			
						dataType = self.CheckPointMode;	
				}
				
				var file = {
						id: requirements[i].id,
						customizedId: requirements[i].customizedId,
						customizedFields: requirements[i].customizedFields ? requirements[i].customizedFields : '',
						value: requirements[i].title,
						description: requirements[i].description,
						coverage:requirements[i].coverage ?  requirements[i].coverage : '',
						comment : requirements[i].comment,
						leaf:requirements[i].leaf,
						parentScriptGroupId: parent.id,   // in future will be removed
						type: scriptType, 
						date: new Date(2014,2,10,16,10),
						dataType: dataType
				};				
				
				parent.data.push(file);
			}			
			return requirementGroups;
		};
		
		this.deleteRequirement = function(requirementId){
			var scripts = self.requirementScriptMapping.get(requirementId);
			if(scripts)
				for(var i = 0; i < scripts.length;i++){
					var requirements = self.scriptRequirementMapping.get(scripts[i]);
					var index = requirements.indexOf(requirementId);
					if (index >= 0)
						requirements.splice(index, 1);
					self.scriptRequirementMapping.get(scripts[i], requirements);
				}
			
			self.requirementScriptMapping.delete(requirementId);
		};
		
		this.updateScriptRequirementMapping = function(scriptId, requirementIds){			
			var requirements = self.scriptRequirementMapping.get(scriptId);
			self.scriptRequirementMapping.set(scriptId, requirementIds);
			
			if (requirements){
				for(var i=0; i < requirements.length;i++){
					var scripts = self.requirementScriptMapping.get(requirements[i]);
					if(scripts){
						var index = scripts.indexOf(scriptId);
						if (index >= 0)
							scripts.splice(index, 1);
						self.requirementScriptMapping.set(requirements[i], scripts);
					}
				}
			}
			
			for(var i=0; i < requirementIds.length;i++){
				var scripts = self.requirementScriptMapping.get(requirementIds[i]);
				if (scripts === undefined ||scripts === null)
					scripts = [scriptId];
				else
					scripts.push(scriptId);
				self.requirementScriptMapping.set(requirementIds[i], scripts);
			}
		};
		
		this.getRequirementMappingSuccessFunction = function(data){
			if (data && data.status === 1) {
				var mapping = data.result;
				for(var i = 0; i < mapping.length;i++){
					var scripts = self.requirementScriptMapping.get(mapping[i].requirementId);
				    if (scripts === undefined ||scripts === null)
				    	scripts = [];
				    scripts.push(mapping[i].scriptId);
				    self.requirementScriptMapping.set(mapping[i].requirementId, scripts);
				    
				    var requirements = self.scriptRequirementMapping.get(mapping[i].scriptId);
				    if (requirements === undefined ||requirements === null)
				    	requirements = [];
				    requirements.push(mapping[i].requirementId);
				    self.scriptRequirementMapping.set(mapping[i].scriptId, requirements);
				}
			}
		};


		this.loadProjectConfig = function() {
			if (self.selectionManager.selectedProject() == undefined || self.selectionManager.selectedProject() == ''){
				if (typeof self.loadProjectErrorFunction === "function"){
					self.loadProjectErrorFunction();
					self.loadProjectErrorFunction = null;
				}
				return;			
			}
			
			// 1. get project mapping of requirement and script
			var getRequirementMappingPromise = new Promise(function(resolve, reject) {
				self.projectConfigDataClear();
				self.utpService.getRequirementMappingByProjectId(self.selectionManager.selectedProject().id.toString(), function(data) {
					self.getRequirementMappingSuccessFunction(data);
					resolve();
				}, function() {
					reject();
				});
				
			});
			
			// 2. get angent config
			var updateAgentConfigPromise = new Promise(function(resolve, reject) {
				self.agentConfigDataclear();
				self.utpService.getAgentConfigByProject(self.selectionManager.selectedProject().id, function(data) {
					self.getAgentConfigByProjectSuccessFunction(data);
					resolve();
				}, function() {
					reject();
				});
			});
			
			Promise.all([getRequirementMappingPromise, updateAgentConfigPromise]).then(
                    function(results) {
                    	if (typeof self.loadProjectSuccessFunction === "function"){
        					self.loadProjectSuccessFunction();
        					self.loadProjectSuccessFunction = null;
        				}
                    },
                    function(errors) {
                    	if (typeof self.loadProjectErrorFunction === "function"){
        					self.loadProjectErrorFunction();
        					self.loadProjectErrorFunction = null;
        				}
                    });
		};
	}
	return new projectManager();
})
