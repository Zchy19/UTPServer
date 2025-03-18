define([ 'knockout', 'jquery', 'durandal/plugins/http','komapping',  'services/executionManager', 'services/projectManager', 'services/loginManager', 'services/selectionManager', 
	'services/viewManager', 'services/ursService', 'services/utpService', 'services/cmdConvertService', 'services/notificationService', 'services/utilityService', 'blockUI', 
	'bootstrapSwitch', 'knockout-sortable'],
		function( ko, $, $http, komapping, executionManager, projectManager, loginManager, selectionManager, viewManager, ursService, utpService, cmdConvertService, notificationService, 
				utilityService, blockUI, bootstrapSwitch, sortable) {
	
			function ProtocolAnalysisViewModel() {
				var self = this;
				this.selectionManager = selectionManager;
				this.viewManager = viewManager;
				this.projectManager = projectManager;
				
				var lastestCaseNode = null;
				var lastResultId = 0;
				var executionCallbackRegisted = false;
				var executionId = 0;
				this.resultRetrieveBegin = false;
				this.executeState = ko.observable(executionManager.notStarted);
				this.executeStateNotification = ko.observable('');
		    	this.busyPropInfo = ko.observable('');
		    	this.errorPropInfo = ko.observable('');
		    	this.runResultPropInfo = ko.observable('');
				this.executionName =  ko.observable('');				
				this.selectedProject = ko.observable();
				this.cmdConvertService = cmdConvertService;
				this.availableAgents =  ko.observableArray([]);
				this.targetObjectCandidates =  ko.observableArray([]);				
				this.selectTargetObjectId = ko.observable();
				this.triggerStop = false;
				this.testResult =  ko.observableArray([]);
				this.deactive = false;
				this.dummyVerification = ko.observable(false);
				this.selectResultStep = null;
				this.preExecutionStatusFetchingCount = 3;
				this.selectedChannel =  ko.observable('channel1');	
				this.selectedIcdId =  ko.observable('');	
				this.channelCandidates =[
					{name: 'channel 1',value: 'channel1'},
					{name: 'channel 2',value: 'channel2'},
					{name: 'channel 3',value: 'channel3'},
					{name: 'channel 4',value: 'channel4'},
					{name: 'channel 5',value: 'channel5'}
				]
				
				this.selectIcd = function(){
					 var selectedId = self.icdTree.getSelectedId();
				     if(selectedId){
				    	 var parentId = self.icdTree.getParentId(selectedId);
				    	 if(parentId == self.rootId){
				    		 self.selectedIcdId(selectedId);
				    		 $('#icdDetailModal').modal('hide');
				    	 }
				    	 else
				    		 notificationService.showInfo('请选择一级节点');
				     }
				     else
				    	 notificationService.showInfo('请选择Icd文件');
				};
				
				this.getSelectTargetObject = function(){				
					if(self.selectTargetObjectId() == "" || self.selectTargetObjectId() == undefined)
						return false;
					
					self.availableAgents([]);
					var selectTargetObjectCandidate = null;
					for (var i=0;i<self.targetObjectCandidates().length;i++) {
						if(self.targetObjectCandidates()[i].targetObjectId() === self.selectTargetObjectId()){
							selectTargetObjectCandidate = komapping.toJS(self.targetObjectCandidates()[i]);				
							break;
						}						
					}					
					
					if(selectTargetObjectCandidate!=null){
						var initialTables = [];
					    for(var i = 0; i < selectTargetObjectCandidate.agentsDefinedInScript.length; i++){
					    	var antbotName = selectTargetObjectCandidate.agentsDefinedInScript[i].antbotName;
					    	var antbotType = selectTargetObjectCandidate.agentsDefinedInScript[i].antbotType;
					    	var agents = [];
					    	for(var j=0;j<selectTargetObjectCandidate.candidateAgents.length;j++){
					    		if(antbotName == selectTargetObjectCandidate.candidateAgents[j].antbotName && antbotType == selectTargetObjectCandidate.candidateAgents[j].antbotType){
					    			agents.push(selectTargetObjectCandidate.candidateAgents[j]);
					    			break;
					    		}					    		
					    	}					    	
					    	initialTables.push({antbotName : antbotName, antbotType: antbotType,  antbots : agents }); // add antbotType
					    }
					   
					    availableAgents = selectTargetObjectCandidate.agentInfos;					
					    komapping.fromJS( initialTables, {}, self.tables );
					    for(var i=0;i<self.tables().length;i++)
					    	self.tables()[i].antbots.antbotType = self.tables()[i].antbotType();
					    komapping.fromJS( availableAgents, {}, self.availableAgents );								 					    
					}					
				};
				
				this.tables = ko.observableArray([]);
				this.availableAgents = ko.observableArray([]);				
				this.maximumAgents = 1;
				
				this.isTableFull = function(parent) {
			        return parent().length < self.maximumAgents;
			    };	
				
			    this.antbotTypeMatch = function(param){
			    	if(param.item.antbotType() != param.targetParent.antbotType)
			    		param.cancelDrop = true;
			    };
			    
				this.confirmTargetObject = function(){
					$('#dynamicTargetObjectsModal').modal('hide');
					self.getSelectTargetObject();
					$('#dynamicAgentsModal').modal('show');
				};
				
				this.targetObjectSelectionDone = ko.computed(function() {
					if(self.selectTargetObjectId() == "" || self.selectTargetObjectId() == undefined){
						return false;
					}					
					return true;
			    });
				
				this.cancelExecution = function(){
		    		var executionId = {executionId : self.executionId};
					utpService.cancelExecution(executionId,  
						function(data){
							if(data && data.status === 1 && data.result)
								return;
							else
								notificationService.showError('取消执行失败');
						
					}, function(error){
						notificationService.showError('取消执行失败');
					});
					$('#dynamicAgentsModal').modal('hide');	
					$('#dynamicTargetObjectsModal').modal('hide');
					$('.modal-backdrop').remove();
		    	};
				
				this.agentSelection = function(liveAntbotDictionarys, antbotsDefinedInScript){					
					var targetAgents = [];					
					var targetObjectCandidates = [];
					
					for(var i=0;i<liveAntbotDictionarys.length;i++){						
					//	if(liveAgentInfoDictionarys[i].agentInfos.length >= agentsDefinedInScript.length)
						{
							for(var k=0;k<antbotsDefinedInScript.length;k++){	
								antbotsDefinedInScript[k].found = false;						
							}
							
							var agentInfos = liveAntbotDictionarys[i].antbotInfos.concat();
							var j = agentInfos.length;
							targetAgents = [];							
							while (j--) {
								for(var k=0; k < antbotsDefinedInScript.length;k++){
									if(!antbotsDefinedInScript[k].found && (agentInfos[j].antbotName == antbotsDefinedInScript[k].antbotName && agentInfos[j].antbotType === antbotsDefinedInScript[k].antbotType)){
										targetAgents.push(agentInfos[j]);
										antbotsDefinedInScript[k].found = true;
										agentInfos.splice(j, 1);
										break;
									}
								}
		                    }
							
							var targetObjectCandidate = $.extend(true, {}, liveAntbotDictionarys[i]);
							targetObjectCandidate.agentInfos = agentInfos;
							targetObjectCandidate.candidateAgents = targetAgents;
							targetObjectCandidate.agentsDefinedInScript = antbotsDefinedInScript;
							targetObjectCandidate.conditionMeet = antbotsDefinedInScript.length == targetAgents.length			
							targetObjectCandidates.push(targetObjectCandidate);
						}
					}
					return targetObjectCandidates;
				};
				
				// prepare execution
				this.prepareExecutionSuccessFunction = function(data){
					if(data && data.status === 1){
						self.triggerStop = true;
						self.preExecutionStatusFetchingCount = 3;
						setTimeout(
							function(){
								$.blockUI(utilityService.template);								
								self.getPreExecutionStatus();
						}, 1000);
					}
					else
						self.prepareExecutionErrorFunction();
				};
				
				this.prepareExecutionErrorFunction = function(){					
					notificationService.showProgressError('验证准备失败。', 100);
				};
				
				this.selectedChanneChanged = function(obj, event){
					
				}
				
				// get engine address
				this.getEngineAddressSuccessFunction = function(response){
					if(response && response.result){
						notificationService.showProgressSuccess('获取执行器地址成功。', 50);
					    var obj = {
							executionId : self.executionId,
							utpCoreIpAddress : response.engineStatus.utpIpAddress,
							utpCorePort : response.engineStatus.utpPort,
							channel: self.selectedChannel(),
							icdId: self.selectedIcdId()
						}
					    utpService.startIcdAnalysis(obj, self.prepareExecutionSuccessFunction, self.prepareExecutionErrorFunction);					
					}
					else{
						if(response.returnMessage)
							notificationService.showError(response.returnMessage);
						else
							notificationService.showError("获取执行器地址失败");
					}
				};
				
				this.getEngineAddressErrorFunction = function(){					
					notificationService.showError('获取执行器地址失败。');
				};
				
				this.prepareExecution = function (){
					if(self.selectedChannel() == null || self.selectedChannel() == "" || self.selectedIcdId() == null || self.selectedIcdId() == ""){
						notificationService.showWarn('Icd与channel不能为空');
						return;
					}
					self.testResult([]);
					self.executionId = executionManager.getExecutionId();
					self.currentRecord.time('');
					self.currentRecord.labelIndex('');
					self.currentRecord.labelName('');
					self.currentRecord.encodedString('');
					self.currentRecord.bcdValue('');
					self.currentRecord.decodedBits('');
					self.currentRecord.units('');
					self.currentRecord.ssmValue('');
					self.executeState(executionManager.notStarted);
					self.executeStateNotification('');
					notificationService.showProgressSuccess('探测可用的执行器...', 0);
					ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager.getAuthorizationKey(),
							self.getEngineAddressSuccessFunction, self.getEngineAddressErrorFunction);					
				};
				
				this.canStartExecution = ko.computed(function() {					
					for(var i=0;i<self.tables().length;i++){
						if(self.tables()[i].antbots().length === 0)
							return false;
					}									
					return true;
			    });
				
				this.refreshExecutionStatus = function(){
					if(self.triggerStop || 
							(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork || 
									self.executeState() == executionManager.throwException || self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming || 
									self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
							))
						self.getExecutionStatus();
				};
				
				this.antbotMatched = function(liveAntbotDictionarys, antbotsDefinedInScript){
					self.targetObjectCandidates([]);
					self.selectTargetObjectId("");
					self.tables([]);
					
					if(antbotsDefinedInScript == null || antbotsDefinedInScript.length == 0){
						notificationService.showProgressSuccess("脚本分析成功，启动模拟执行。", 100);
						self.startExecution();
						return;
					}
					
					var targetObjectCandidates = self.agentSelection(liveAntbotDictionarys, antbotsDefinedInScript);
					komapping.fromJS( targetObjectCandidates, {}, self.targetObjectCandidates );
					
					if(self.targetObjectCandidates().length > 0){
						notificationService.showProgressSuccess('脚本分析成功，探测到测试机器人.', 100);
						if(self.targetObjectCandidates().length === 1){
							self.selectTargetObjectId(self.targetObjectCandidates()[0].targetObjectId());
							self.getSelectTargetObject();
							$('#dynamicAgentsModal').modal('show');								
						}
						else								
							$('#dynamicTargetObjectsModal').modal('show');
					}
					else
						notificationService.showWarn('脚本分析成功，测试机器人不存在, 无法进行真实环境执行。', 100);
				};
				
				this.getPreExecutionStatusErrorFunction = function(){
					self.executeState(executionManager.throwException);
					self.preExecutionStatusFetchingCount--;
					if(self.preExecutionStatusFetchingCount > 0)
						self.getPreExecutionStatus();								
					else{
						$.unblockUI();
						notificationService.showProgressError('获取验证状态失败,如需继续尝试，请重新开始!', 100);
					}
				}
				
				this.getPreExecutionStatus = function(){
					utpService.getExecutionModel(self.executionId, 
							function(data){
								if(data && data.status === 1){
									var result = data.result;
									if (result.status != undefined) {
										if(self.executeState() != result.status){
											if(result.status == executionManager.unknownError || result.status == executionManager.analyzeScriptError 
													|| result.status == executionManager.utpCoreNetworkError || result.status == executionManager.waitingMatchAntbot){
												$.unblockUI();
												self.triggerStop = false;
											}
											if(result.status == executionManager.engineInitializing){
												self.executeStateNotification('引擎初始化中...');
											}
											else if(result.status == executionManager.engineInitialized){
												self.executeStateNotification('引擎初始化完成...');
											}
											else if(result.status == executionManager.engineConfiguring){
												self.executeStateNotification('引擎配置中...');
											}
											else if(result.status == executionManager.engineConfigured){
												self.executeStateNotification('引擎配置完成...');
											}
											else if(result.status == executionManager.analyzingScript){
												self.executeStateNotification('脚本分析中...');
											}
											else if(result.status == executionManager.scriptAnalyzed){
												self.executeStateNotification('脚本分析完成...');
											}
											else if(result.status == executionManager.waitingMatchAntbot){
												self.executeStateNotification('antbot匹配中...');												
												self.antbotMatched(result.liveAntbotDictionarys, result.antbotsDefinedInScript);
											}											
											else if(result.status == executionManager.utpCoreNetworkError){
												var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
												notificationService.showProgressError(errorMessage, 100);
											}
											else if(result.status == executionManager.analyzeScriptError){
												var errorMessage = "分析脚本错误:脚本名称: " + result.analyzeScriptError.analyzeScriptFailedReason.scriptName+",系统ID："+result.analyzeScriptError.analyzeScriptFailedReason.scriptId+ "，行号：" + result.analyzeScriptError.analyzeScriptFailedReason.errorline + "，错误信息：" + result.analyzeScriptError.analyzeScriptFailedReason.message;
												notificationService.showProgressError(errorMessage, 100);
											}									
											else if(result.status == executionManager.unknownError){
												var errorMessage = "未知错误。"
												notificationService.showProgressError(errorMessage, 100);
											}
										}										
										self.executeState(result.status);
									}
									
									if(self.deactive)
										return;
									
									if(self.triggerStop)
										setTimeout(
											function(){
											self.getPreExecutionStatus();
										}, 1000);
								}
								else
									self.getPreExecutionStatusErrorFunction();
							}, 
							self.getPreExecutionStatusErrorFunction
					);
				}
				
				this.getExecutionStatus = function(){					
					utpService.getExecutionModel(self.executionId, 
							function(data){
								if(data && data.status === 1){
									var result = data.result;
									if (result.status != undefined) {
										if(self.executeState() != result.status){											
											if(result.status == executionManager.starting){
												self.executeStateNotification('启动中...');
											}
											else if(result.status == executionManager.running){
												self.executeStateNotification('执行中...');
											}											
											else if(result.status == executionManager.pausing){
												self.executeStateNotification('暂停中...');
											}											
											else if(result.status == executionManager.paused){
												self.executeStateNotification('已暂停。');
												notificationService.showSuccess('已暂停。');
											}											
											else if(result.status == executionManager.resuming){
												self.executeStateNotification('重启中...');
											}											
											else if(result.status == executionManager.stopping){
												self.executeStateNotification('停止中...');
											}											
											else if(result.status == executionManager.stopped){
												self.executeStateNotification('已停止。');
												notificationService.showSuccess('已停止。');
											}											
											else if(result.status == executionManager.completed){
												self.executeStateNotification('已完成。');
												notificationService.showSuccess('已完成。');
											}											
											else if(result.status == executionManager.exceptionHandling){
												self.executeStateNotification('异常处理中...');
											}											
											else if(result.status == executionManager.reconnectingNetwork){
												self.executeStateNotification('网络重连中...');
											}											
											else if(result.status == executionManager.terminated){
												self.executeStateNotification('验证已终止。');
												notificationService.showSuccess('验证已终止。');
											}
											else if(result.status == executionManager.startExecutionError){
												var errorMessage = "";
												for(var i=0;i<result.startExecutionError.antbotFailedReasons.length;i++)					
													errorMessage = errorMessage + "测试机器人:" + result.startExecutionError.antbotFailedReasons[i].antbotName + ", 失败原因:" + result.startExecutionError.antbotFailedReasons[i].failedReason + "<br />"
												notificationService.showError(errorMessage);
											}
											else if (result.status == executionManager.utpCoreNetworkError){
												var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
												notificationService.showError(errorMessage);
											}
											else if(result.status == executionManager.unknownError){
												var errorMessage = "未知错误。"
												notificationService.showProgressError(errorMessage, 100);
											}
										}
										if(result.status == executionManager.unknownError || result.status == executionManager.startExecutionError || result.status == executionManager.utpCoreNetworkError || 
												result.status == executionManager.terminated || result.status == executionManager.completed || result.status == executionManager.stopped)
											self.triggerStop = false;
										self.executeState(result.status);
									}
									self.getExecutionResult();
									
									if(self.deactive)
										return;
									
									if(self.triggerStop || 
											(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork || 
													self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming || 
													self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
											))
										setTimeout(
												function(){
												self.getExecutionStatus();
											}, 1000);
								}
								else{
									self.executeState(executionManager.throwException);
									self.executeStateNotification('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
									notificationService.showError('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');	
								}
							}, 
							function(){							
								self.executeState(executionManager.throwException);
								self.executeStateNotification('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
								notificationService.showError('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');	
							}
					);
				}
				
				this.startExecution = function () {
					$('#dynamicAgentsModal').modal('hide');					
					var selectedAntbotMapping = [];
					for(var i=0;i<self.tables().length;i++){						
						var mapping = {
							antbotName : self.tables()[i].antbotName(),
							antbotInstanceId : self.tables()[i].antbots()[0].antbotId()
						}
						selectedAntbotMapping.push(mapping);
					}
					
					var executionObj = {
						executionId :self.executionId,
						selectedAntbotMapping : selectedAntbotMapping
					};
					
					utpService.startExecution(executionObj, 
							function(data){
								if(data && data.status === 1){									
									if (data.result){									
										self.lastResultId = 0;
										self.resultRetrieveBegin = false;
										self.lastestCaseNode = null;
										self.getExecutionStatus();
										notificationService.showSuccess('启动发送成功。');			
									}							
									else									
										notificationService.showError('启动失败。');		
								}
								else
									notificationService.showError('启动失败。');														
							}, 
							function(){
								notificationService.showError('启动失败。');	
							}
					);
				};
                
				this.canShowControl = ko.computed(function() {					
					return (self.executeState() != executionManager.notStarted && self.executeState() != executionManager.starting && 
							self.executeState() != executionManager.completed  && self.executeState() != executionManager.stopped &&
							self.executeState() != executionManager.terminated);
				
				});
				
				this.canStart = ko.computed(function() {
					return (self.executeState() != executionManager.running && self.executeState() != executionManager.starting && 
							self.executeState() != executionManager.resuming  && self.executeState() != executionManager.exceptionHandling &&
							self.executeState() != executionManager.reconnectingNetwork);
				});
				
				// stop execution
				this.canStop = ko.computed(function() {
					return (self.executeState() == executionManager.pausing || self.executeState() == executionManager.paused || 
							self.executeState() == executionManager.running || self.executeState() == executionManager.resuming ||
							self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork);
				});
				
				this.stopExecution = function () {
					var executionId = {executionId : self.executionId};
					utpService.stopExecution(executionId,  
						function(data){							
							if (data && data.status === 1 && data.result){
								self.triggerStop = data.result;
								notificationService.showSuccess('停止命令发送成功。');								
								self.getExecutionStatus();
							}
							else
								notificationService.showError('停止命令发送失败。');
						},
						function(){
							notificationService.showError('停止命令发送失败。');
						}
					);					
				};
				
				this.currentStepNumber = 0;
				// get execution result
				this.getExecutionResultSuccessFunction = function(data){
					if(data && data.status === 1 && data.result){
						var resultItems = data.result;
						
						var currentLastResultId = self.lastResultId;					
						if(resultItems.length > 0 && resultItems[resultItems.length - 1].resultId > self.lastResultId)
							self.lastResultId = resultItems[resultItems.length - 1].resultId;
						
						self.resultRetrieveBegin = false; // should after the setting of lastResulteId
						
						for (var i = 0; i < resultItems.length; i++) {
							var resultItem = resultItems[i];
							if(resultItem.resultId <= currentLastResultId)
								continue;
							self.testResult.push(resultItem);							
							if(self.testResult().length > cmdConvertService.maxReuslt)
								self.testResult.shift();
							$('#protocolAnalysisSteps').scrollTop($('#protocolAnalysisSteps')[0].scrollHeight);
					    }
					}
					else
						self.getExecutionResultErrorFunction();
				};
				
				this.getExecutionResultErrorFunction = function(){
					self.resultRetrieveBegin = false;
					notificationService.showError('获取结果失败。');	
				};
				
		    	this.getExecutionResult = function () {
		    		if(!self.resultRetrieveBegin){
		    			self.resultRetrieveBegin = true;
			    		utpService.getIcdResult(self.executionId, self.lastResultId, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
		    		}
		    	};
		    	
		    	this.rows = 16;
		    	this.cols = Math.floor( window.innerHeight/20 - 2 );
		    	this.current = null;
		    	this.offset = ko.observable();
		    	this.items = ko.observableArray([]);
		    	this.hexVals = ko.observableArray([]);
		    	this.charVals = ko.observableArray([]);
		    	this.positions = ko.observableArray([]);
		    	
		    	this.toHex = function (number, length) {
		            var s = number.toString(16).toUpperCase();
		            while (s.length < length) {
		                s = '0' + s;
		            }
		            return s;
		        };

		        this.toChar = function(number) {
		            return number <= 32 ? ' ' : String.fromCharCode(number);
		        }
		        
		        this.addIcdFileSuccessFunction = function(response){
					if (response && response.status == 1) {
						notificationService.showSuccess('添加Icd文件成功');
					}
					else
						self.addIcdFileErrorFunction();
				};
				
				this.addIcdFileErrorFunction = function(){
					notificationService.showError('添加Icd文件失败');
				};
		        
		        this.loadFromFile = function(file) {
		        	 var temp = $("#icdInputFile")[0].files[0]
		        	
		        	 var fd= new FormData();
		             fd.append('file', file);
		            	            
		        	utpService.addIcdFile(fd, self.addIcdFileSuccessFunction, self.addIcdFileErrorFunction);
		        };

		        this.loadItems = function() {
		            // var data = self.binary.read(['blob', Math.min(self.rows * self.cols, self.binary.view.byteLength - self.offset())], self.offset());
		            var data = self.binary.read(['blob', self.binary.view.byteLength], 0);
		            var items = [];
		            var positions = [];
		            for (var i in data) {
		                if (typeof data[i] !== 'object' && typeof data[i] !== 'function'){
		                	var obj = {
		                		charVal: self.toChar(data[i]),
		                		hexVal: self.toHex(data[i], 2),
		                		index: i,
		                		selected: false
		                	}
		                	items.push(obj);
		                }
		            }
		            komapping.fromJS(items, {}, self.items);
		            self.cols = self.binary.view.byteLength/self.rows + 1;
		            for (i = 0; i < self.cols; i += 1) {
		            	positions.push( self.toHex(self.offset() + i*16, 8) );
		            }
		            console.log(positions);
		            self.positions(positions);
		        };

		        this.setCurrent = function(item) {
		        	item.selected(true);
		        	if(self.current)
		        		self.current.selected(false);
		        	self.current = item;
		        };

		        var timeout = null;
		        this.rootId = 0;
		        
		        this.getIcdFilesSuccessFunction = function(response){
					if (response && response.status == 1) {
						self.icdFileProcess( response.result)
						notificationService.showSuccess('获取Icd文件成功');
					}
					else
						self.getIcdFilesErrorFunction();
				};
				
				this.getIcdFilesErrorFunction = function(){
					notificationService.showError('获取Icd文件失败');
				};
				
				this.icdFileProcess = function(icd){
					// var icd = [{"id":"e0c914e8-6303-46a9-b7ee-4034db13ce46","name":"AV-A429_EQID_LABEL_DEFN","version":"2.0.2.0","equipments":[{"index":"002","name":"Flight Management Computer (702)","labels":[{"index":"001","name":"Distance to Go","minTxInterval":100.0,"maxTxInterval":200.0,"fields":[{"name":"Distance to Go","unit":"N.M.","startBit":29,"endBit":11,"codeField":{"codes":[{"value":"0","string":"+"},{"value":"1","string":"NO Computed Data"},{"value":"2","string":"Functional Test"},{"value":"3","string":"-"}]},"bcd":{"digits":5,"digit_Size":4,"minva1":0.0,"maxva1":3999.9,"msd_Size":3}}]},{"index":"002","name":"Time to Go","minTxInterval":100.0,"maxTxInterval":200.0,"fields":[{"name":"Time to Go","unit":"Min","startBit":29,"endBit":15,"codeField":null,"bcd":{"digits":4,"digit_Size":4,"minva1":0.0,"maxva1":3999.9,"msd_Size":3}}]},{"index":"003","name":"Cross Track Distance","minTxInterval":100.0,"maxTxInterval":200.0,"fields":[{"name":"Cross Track Distance","unit":"N.M.","startBit":29,"endBit":15,"codeField":null,"bcd":{"digits":4,"digit_Size":4,"minva1":0.0,"maxva1":399.9,"msd_Size":3}}]},{"index":"010","name":"Present Position - Latitude","minTxInterval":250.0,"maxTxInterval":500.0,"fields":[{"name":"Degrees","unit":"Deg","startBit":29,"endBit":21,"codeField":null,"bcd":{"digits":3,"digit_Size":4,"minva1":0.0,"maxva1":180.0,"msd_Size":1}},{"name":"minutes","unit":"'","startBit":20,"endBit":9,"codeField":null,"bcd":{"digits":3,"digit_Size":4,"minva1":0.0,"maxva1":180.0,"msd_Size":4}}]}]}]}];
					var root = {
						value: "ICD List",
						data: []
					};
					for(var k=0;k<icd.length;k++){
						if(icd[k] == null || icd[k].id == null || icd[k].id == "")
							continue;
						var icdNode = {
							id: icd[k].id,
							value: icd[k].name + "(" + icd[k].version + ")",
							data: []
						}
						for(var i = 0; i< icd[k].equipments.length;i++){
							var equiNode = {
								id: 'EQUIE' + icd[k].equipments[i].index,
								value: 'EQUIE ' + icd[k].equipments[i].index + ":" + icd[k].equipments[i].name,
								data: []
							}
							for(var j=0;j<icd[k].equipments[i].labels.length; j++){
								var labelNode = {
									id: 'LABLE' + icd[k].equipments[i].labels[j].index,
									value: 'LABLE' + icd[k].equipments[i].labels[j].index + ":" + icd[k].equipments[i].labels[j].name
								}
								equiNode.data.push(labelNode);
							}
							icdNode.data.push(equiNode);
						}
						root.data.push(icdNode);
					}
					
					$('#icdDetailModal').modal({ show: true }, {data: root});	
				};
				
		        this.showCurrentIcd = function(){
		        	utpService.getIcdFiles(self.getIcdFilesSuccessFunction, self.getIcdFilesErrorFunction);
				};
		        
		        this.initIcdTree = function(data){
					$('#icdTreeview').html('');
					webix.ready(function(){					
						self.icdTree = webix.ui({
							container:"icdTreeview",
							view:"tree",
							type:"lineTree",
							select:true,
							template:"{common.icon()}&nbsp;#value#",
							data : data,
							ready:function(){
								this.closeAll();
								this.sort("value", "asc", "string");
							}
						});
					});
				};
				
				this.showIcdDetail = function(item){
					self.currentRecord.time(item.time);
					self.currentRecord.labelIndex(item.labelIndex);
					self.currentRecord.labelName(item.labelName);
					self.currentRecord.encodedString(item.encodedString);
					self.currentRecord.bcdValue(item.bcdValue);
					self.currentRecord.decodedBits(item.decodedBits);
					self.currentRecord.units(item.units);
					self.currentRecord.ssmValue(item.ssmValue);
				}
				
				this.currentRecord = {
						time : ko.observable(''),
						labelIndex: ko.observable(''),
						labelName : ko.observable(''),
						encodedString : ko.observable(''),
						bcdValue : ko.observable(''),
						decodedBits : ko.observable(''),
						units : ko.observable(''),
						ssmValue : ko.observable('')
				};
				
				this.activate = function() {};
				
				this.detached = function(){
					self.deactive = true;
				};
				
				// The data-binding shall happen after DOM element be attached.
				this.attached = function(view, parent) {
					self.deactive = false;
					self.executeState(executionManager.notStarted);
					$('#icdDetailModal').on('shown.bs.modal', function(e) {
						self.initIcdTree(e.relatedTarget.data);	
					});
					$('#icdDetailModal').on('hidden.bs.modal', function () {
						self.selectIcd();
					});
				};				
			}
			return new ProtocolAnalysisViewModel();
		});
