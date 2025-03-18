define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/cmdConvertService', 'services/notificationService'],
		function(app, ko, $, komapping, utpService, cmdConvertService, notificationService) {
	
			function MonitorResultChartViewModel() {
				var self = this;				
				this.updateMonitorResultSubScription = null;				
				this.lastMonitorId = 0;
				this.executionId = null;
				this.result = [];
				this.showMonitorData = ko.observable(false);
				this.myChart = null;
				this.chartOptions = null;
				
				this.init = function() {
					self.lastMonitorId = 0;
					self.executionId = null;
					self.result = [];
					self.showMonitorData(false);
					self.myChart = null;
					self.chartOptions = null;
				};
				
				this.initChart = function(){
					self.chartOptions = null;
					self.chartOptions = {
					    title: {
					        text: '指标数据'
					    },
					    tooltip: {
					        trigger: 'axis',
					        axisPointer: {
					            type: 'line'
					        }
					    },
					    legend: {
					        data:[]
					    },
					    grid: {
					        left: '3%',
					        right: '4%',
					        bottom: '3%',
					        containLabel: true
					    },
					    toolbox: {
					        feature: {                
					            saveAsImage: {}
					        }
					    },
					    /*
					    dataZoom: [{
				            startValue: self.searchCondition.begin()
				        }, {
				            type: 'inside'
				        }],
				        */
					    xAxis: {
					        type: 'category',
					        scale: true,
					        boundaryGap: false,
					        axisLine: {onZero: false},
				            splitLine: {show: false},
				            splitNumber: 20,
					        data: []
					    },
					    yAxis: {
					    	scale: true,
					        type: 'value',
					    },
					    series: []
					};
				};
				
				this.drawChart = function(){
					if(self.myChart == null){
						var dom = document.getElementById('monitorChart');
						self.myChart = echarts.init(dom);
						self.myChart.showLoading({
							text: "数据正在努力加载..."
						});
					}
					self.initChart();
					if (self.chartOptions && typeof self.chartOptions === "object") {
						self.myChart.hideLoading();
						var data = self.getSeriesData();
						for(var i = 0; i < data.seriesData.length;i++){
							self.chartOptions.series.push({
								name: data.legend[i],
						        type:'line',
						        stack: '总量',
						        connectNulls: true,
						        data: data.seriesData[i]
							});
						}
						self.chartOptions.xAxis.data = self.getSeriesX();
						self.chartOptions.legend.data = data.legend;
						self.myChart.setOption(self.chartOptions, true);
					}
				};
				
				this.getSeriesData = function(){
					var monitorMap = new Map();					
					for(var i=0; i< self.result.length;i++){
						var data = self.result[i];
						var monitorVariable = JSON.parse(data.jsonData);
						if(data.dataType === 'string'){
							var variable = monitorMap.get(monitorVariable.name);
							if(!variable)
								variable = [];
							var monitorVariableValue = monitorVariable.value.replace('\u0000', '').trim();
							variable.push([data.createdTime, Number(monitorVariableValue)]);
							monitorMap.set(monitorVariable.name, variable);
						}
						if(data.dataType === 'array'){
							for(var j=0;j<monitorVariable.length;j++){
								var variable = monitorMap.get(monitorVariable[j].name);
								if(!variable)
									variable = [];
								var monitorVariableValue = monitorVariable[j].value.replace('\u0000', '').trim();
								variable.push([data.createdTime, Number(monitorVariableValue)]);
								monitorMap.set(monitorVariable[j].name, variable);
							}
						}
					}
					var legend = [];
					var seriesData = [];
					monitorMap.forEach(function(value,key){
			　　　　　　　　　legend.push(key);
						seriesData.push(value);
			　　　　　　});
					var processedData = {
						legend : legend,
						seriesData: seriesData
					}
					return processedData;
				};
				
				this.getSeriesX = function(){
					var xAxis = [];
					for(var i=0; i< self.result.length;i++){
						var data = self.result[i];
						xAxis.push(data.createdTime);
					}
					const sortedXAxis = xAxis.sort(function(a, b){
						var dateA = new Date(a);
						var dateB = new Date(b);
						return dateA - dateB;
					});
					return sortedXAxis;
				};
				
				this.resultProcess = function(items){
					var currentLastMonitorId = self.lastMonitorId;
					if(items.length > 0 && items[items.length - 1].id > self.lastMonitorId)
						self.lastMonitorId = items[items.length - 1].id;
					
					for (var i = 0; i < items.length; i++) {
						var data = items[i];
						if(data.id <= currentLastMonitorId)
							continue;						
						self.result.push(data);
				    }
					return currentLastMonitorId < self.lastMonitorId;
				};
				
				this.getMonitorDataSuccessFunction = function(data){
					if(data && data.status === 1 && data.result){
						var resultItems = data.result;
						var needUpdate = self.resultProcess(resultItems);						
						/*
						 * private long id;	
						 * private String executionId;	
						 * private String dataType; // string, array
						 * private String jsonData; 
						 * private Date createdTime; // yyyy-MM-dd HH:mm
						 */
						if(needUpdate){
							self.showMonitorData(true);
							self.drawChart();
							self.myChart.resize();
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
					self.myChart.clear();
					self.myChart.dispose();
				};
				
				this.activate = function() {
					self.init();
					self.start = 0;
					self.updateMonitorResultSubScription = app.on('updateMonitorResult:event').then(function(executionId) {
						self.executionId = executionId;
						self.getMonitorData(executionId);
			        }, this);
				};
			}
			return new MonitorResultChartViewModel();
		});
