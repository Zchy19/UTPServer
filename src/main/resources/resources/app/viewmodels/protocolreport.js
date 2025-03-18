define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/protocolService', 
'services/reportService','services/notificationService', 'jsoneditor', 'lodash','datepicker'],
		function(app, ko, $, komapping, utpService, protocolService, reportService, notificationService, JSONEditor, _, datepicker) {
	
			function ProtocolReportViewModel() {
				var self = this;				
				this.reportService = reportService;
				this.protocolTypes = ko.observableArray([]);
				this.protocols = ko.observableArray([]);
				this.messages = ko.observableArray([]);
				this.selectedProtocolType = ko.observable();
				this.selectedProtocol = ko.observable();
				this.selectedMessage = ko.observable();
				this.selectedProtocolName = ko.observable('');
				this.selectedFieldLocator = [];
				this.currentProtocolContent = '';
				this.currentSelectNode = null;
				this.showChart = ko.observable(false);

				this.myChart = null;
				this.chartOptions = {};

				this.startFromDate = ko.observable('');
				this.endByDate = ko.observable('');

				this.initSearchCondition = function() {
					self.startFromDate(self.reportService.previousDate.getFullYear() + "-" + (self.reportService.previousDate.getMonth()+1) + "-" + self.reportService.previousDate.getDate()); 
				    self.endByDate(self.reportService.nowDate.getFullYear() + "-" + (self.reportService.nowDate.getMonth()+1) + "-" + self.reportService.nowDate.getDate());
				}

				this.protocolTypeChanged = function(obj, event) {
					if (self.selectedProtocolType() == undefined)
						return;					
		
					if (event.originalEvent)// user changed
						self.getProtocols(self.selectedProtocolType().value);
					else { // program changed
		
					}
				};

				this.initProtocols = function(){
					self.selectedProtocolType(self.protocolTypes()[0]);
					if(self.selectedProtocolName === '')
						self.selectedProtocolName(self.selectedProtocolType().name);
					self.getProtocols(self.protocolTypes()[0].value);
				};

				this.prepareProtocolType = function(){
					self.protocolTypes = ko.observableArray([]);
					var keys = Object.getOwnPropertyNames(protocolService.dataType);
					var values = Object.keys(protocolService.dataType).map(function (e) { return protocolService.dataType[e] });
					for(var i=0; i< values.length;i++){
						self.protocolTypes.push({
							name: values[i],
							value: values[i],
						})
					}
				};

				this.getProtocolsSuccessFunction = function(data){					
					if(data && data.status === 1){
						var protocols = data.result;
						self.protocols(protocols);
						if(protocols.length > 0){
							self.selectedProtocol(self.protocols()[0]);
							self.getProtocol(self.selectedProtocol().id);
						}
						else {
							self.selectedProtocol(null);
							self.clearProtocolFieldSelectionConfigModal();
						}	
					}
					else
						self.getProtocolsErrorFunction();
				};
				
				this.getProtocolsErrorFunction = function(){
					self.clearProtocolFieldSelectionConfigModal();
					notificationService.showError('获取协议列表失败');
				};
				
				this.getProtocols = function(protocolType){
					utpService.getBigDataByType(null, protocolType, self.getProtocolsSuccessFunction, self.getProtocolsErrorFunction);
				};

				this.protocolChanged = function(obj, event) {
					if (self.selectedProtocol() == undefined)
						return;					
		
					if (event.originalEvent)// user changed
						self.getProtocol(self.selectedProtocol().id);
					else { // program changed
		
					}
				};

				this.messageChanged = function(obj, event) {
					if (self.selectedMessage() == undefined)
						return;					
		
					if (event.originalEvent)// user changed
						self.initProtocolConfigView();
					else { // program changed
		
					}
				};

				this.getProtocolSuccessFunction = function(data){
					if(data && data.status === 1 && data.result){
						try{
							self.currentProtocolContent = JSON.parse(data.result.bigdata);
							self.messages(self.currentProtocolContent.messages);
							if(self.currentProtocolContent.messages.length > 0){
								self.selectedMessage(self.messages()[0]);
								self.initProtocolConfigView();
							}
							else{
								self.selectedMessage(null);
								self.clearProtocolFieldSelectionConfigModal();
							}
						}
						catch(e){
							console.log(e);
							self.messages([]);
							self.selectedMessage(null);
							self.clearProtocolFieldSelectionConfigModal();
						}
					}
					else 
						self.getProtocolErrorFunction();
				};
				
				this.getProtocolErrorFunction = function(){
					self.clearProtocolFieldSelectionConfigModal();
					notificationService.showError('获取协议文件失败');
				};

				this.getProtocol = function(id){
					utpService.getProtocol(id, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
				};

				this.genericRecordContent = null; 
				this.initProtocolConfigView = function(){
					self.clearProtocolFieldSelectionConfigModal();
					self.genericRecordContent = protocolService.bigDataFieldProcess(self.currentProtocolContent, self.selectedMessage().fields, null);					
					if(self.genericRecordContent){
						const container = document.getElementById('protocolFieldSelectionConfigModal');
						const options = {
							mode: 'view',
							modes: ['view'],
							name: self.selectedMessage().messageName,
							dragarea: false,
							enableSort: false,
							enableTransform: false,
							enableExtract: false,
							colorPicker: false,
							language: 'zh-CN',
							onEditable: function (node) {
								if (!node.path)
									return false;
							},
							onEvent: function (node, event) {
								if (event.type === "click")
								  self.currentSelectNode = node;
							}
						}
						self.editor = new JSONEditor(container, options, self.genericRecordContent);
					}
				};

				this.protocolConditionSetting = function(){
					$('#protocolConditionSettingModal').modal('show');
				};

				this.clearProtocolFieldSelectionConfigModal = function(){
					$('#protocolFieldSelectionConfigModal').html('');
				};
				
				this.initChart = function(){					
					self.showChart(true);
					var dom = document.getElementById('protocolChart');
					self.myChart = echarts.init(dom);
					self.myChart.showLoading({
						text: "数据正在努力加载..."
					});
				};
				
				this.drawChart = function(seriesData){
					self.chartOptions = null;
					self.chartOptions = {
					    title: {
					        text: self.selectedFieldLocator.join("->"),
							textStyle:{
								//color:'#ccc',
								fontStyle:'normal',
								//fontWeight:'bold',
								//fontFamily:'sans-serif',
						　　　　 fontSize:12
							},
					        subtext: self.startFromDate() + " 到 " + self.endByDate(),
					    },
					    tooltip: {
					        trigger: 'axis'
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
					        boundaryGap: false,
					        data: []
					    },
					    yAxis: {
					        type: 'value',					       
					    },
					    series: []
					};
					if (self.chartOptions && typeof self.chartOptions === "object") {
						self.chartOptions.xAxis.data = seriesData.map(function (item) {
			                return item.timestamp;
			            });
						
						var dataSeries = {
							name:'数值',
					        type:'line',
					        stack: '总量',
					        data:seriesData.map(function (item) {
				                return item.fieldValue;
				            })
			            };
						self.chartOptions.series.push(dataSeries);											
						self.chartOptions.legend.data = ["数值"];
						self.myChart.setOption(self.chartOptions, true);
					}
				};
				
				this.getFrameStatisticsSuccessFunction = function(data){
					$('#protocolConditionSettingModal').modal('hide');
					if(data != null && data.status === 1){	
						var seriesData = data.result;
						if(seriesData && seriesData.length > 0)
							self.drawChart(seriesData);
						else
							self.showChart(false);
					}
					else
						self.getFrameStatisticsErrorFunction();
					self.myChart.hideLoading();
				};			

				this.getFrameStatisticsErrorFunction = function(){
					notificationService.showError('获取数据失败');
				};
				
				this.createProtocolFieldStatistics = function(){
					if(self.selectedProtocol() == null){
						notificationService.showWarn('请选择协议！');
						return;
					}
					if(self.selectedMessage() == null){
						notificationService.showWarn('请选择消息！');
						return;
					}
					if(self.currentSelectNode == null){
						notificationService.showWarn('请选择字段！');
						return;
					}

					var begin = new Date(self.startFromDate());
					var end = new Date(self.endByDate());
					if(begin > end){
						notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
						return;
					}					
					const currentValue = _.get(self.genericRecordContent, self.currentSelectNode.path);
					// if(currentValue == undefined || typeof currentValue === 'object' || Array.isArray(currentValue))
					self.initChart();
					if (!_.isObject(currentValue)){
						var path = JSON.parse(JSON.stringify(self.currentSelectNode.path));
						protocolService.fieldValueIndexUpdate(self.currentProtocolContent, self.selectedMessage().fields, path, 0);
						// projectId : $.cookie("lastSelectedProject"),
						var parameter = {
							protocolId: self.selectedProtocol().id,
							messageName: self.selectedMessage().messageName,
							startFromDate: self.startFromDate(),
							//endByDate多加一天，因为数据库查询时是小于endByDate的
							endByDate:self.endByDate()+1,
							fieldLocator: JSON.stringify(path)
						};
						self.selectedFieldLocator = JSON.parse(JSON.stringify(self.currentSelectNode.path));
						self.selectedFieldLocator.unshift(self.selectedMessage().messageName);
						self.selectedFieldLocator.unshift(self.selectedProtocol().fileName);
						utpService.busFrameStatistics(parameter, self.getFrameStatisticsSuccessFunction, self.getFrameStatisticsErrorFunction);							
					}
					else
						notificationService.showWarn('请选择叶节点字段！');
				};
						
				// The data-binding shall happen after DOM element be attached.
				this.attached = function(view, parent) {
					self.protocols([]);
					self.messages([]);
					self.showChart(false);
					$('#searchBeginDate').datepicker({
						format: "yyyy-mm-dd",
						todayHighlight: true,
						language: "zh-CN",
						autoclose: true
					});
					$('#searchEndDate').datepicker({
						format: "yyyy-mm-dd",
						todayHighlight: true,
						language: "zh-CN",
						autoclose: true
					});
					$('#protocolConditionSettingModal').on('shown.bs.modal', function() {
					//	self.initSearchCondition();
						self.initProtocols();
					});				
				};
				
				this.detached = function(view, parent){
					
				};

				this.activate = function() {
					self.prepareProtocolType();
					self.initSearchCondition();
				};
			}
			return new ProtocolReportViewModel();
		});
