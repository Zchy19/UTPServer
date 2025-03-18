define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/cmdConvertService', 'services/notificationService'],
		function(app, ko, $, komapping, utpService, cmdConvertService, notificationService) {
	
			function MonitorResultViewModel() {
				var self = this;				
				this.updateMonitorResultSubScription = null;				
				this.lastMonitorId = 0;
				this.executionId = null;
				this.showMonitorData = ko.observable(false);				
				this.variables =  ko.observableArray([]);
				this.variableResults =  ko.observableArray([]);
				
				this.init = function() {
					self.lastMonitorId = 0;
					self.executionId = null;
					self.variables([]);
					self.variableResults([]);
					self.showMonitorData(false);
				};
				
				this.resultProcess = function(items){
					var currentLastMonitorId = self.lastMonitorId;
					if(items.length > 0 && items[items.length - 1].id > self.lastMonitorId)
						self.lastMonitorId = items[items.length - 1].id;
					
					for (var i = 0; i < items.length; i++) {
						var data = items[i];
						if(data.id <= currentLastMonitorId)
							continue;
						
						var createdTime = data.createdTime;
						var monitorVariable = JSON.parse(data.jsonData);
						var monitorVariableFormatValue = "";
						
						if(data.dataType === 'string'){
							var monitorVariableValue = monitorVariable.value.replace('\u0000', '').trim();
							monitorVariableFormatValue = monitorVariable.name + ": " + monitorVariableValue + ";";
						}
						if(data.dataType === 'array'){
							for(var j=0;j<monitorVariable.length;j++){														
								var monitorVariableValue = monitorVariable[j].value.replace('\u0000', '').trim();
								monitorVariableFormatValue += monitorVariable[j].name + ": " + monitorVariableValue + ";";
							}
						}						
						var monitorVariableResult = {
							time: createdTime,
							value: monitorVariableFormatValue
						}
						self.variableResults.push(monitorVariableResult); // asc order
				    }
					return currentLastMonitorId < self.lastMonitorId;
				};
				
				this.getMonitorDataSuccessFunction = function(data){
					if(data && data.status === 1 && data.result){
						var needUpdate = self.resultProcess(data.result);						
						/*
						 * private long id;	
						 * private String executionId;	
						 * private String dataType; // string, array
						 * private String jsonData; 
						 * private Date createdTime; // yyyy-MM-dd HH:mm
						 */
						if(needUpdate){
							self.showMonitorData(true);
						}
					}
					else
						self.getMonitorDataErrorFunction();
				};
		    	
		    	this.getMonitorDataErrorFunction = function(){
					notificationService.showError('获取指标数据失败。');
				};
		    	
		    	this.getMonitorData = function(executionId){		    		
		    		utpService.getMonitorData(executionId, self.lastMonitorId, self.getMonitorDataSuccessFunction, self.getMonitorDataErrorFunction);
		    	};	
				
				this.attached = function(view, parent) {
				};
				
				this.detached = function(view, parent){
					self.updateMonitorResultSubScription.off();
				};
				
				this.activate = function() {
					self.init();
					self.updateMonitorResultSubScription = app.on('updateMonitorResult:event').then(function(executionId) {
						self.executionId = executionId;
						self.getMonitorData(executionId);
			        }, this);
				};
			}
			return new MonitorResultViewModel();
		});
