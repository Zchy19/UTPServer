define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/protocolService', 
'services/reportService','services/notificationService', 'jsoneditor', 'lodash','datepicker'],
		function(app, ko, $, komapping, utpService, protocolService, reportService, notificationService, JSONEditor, _, datepicker) {
	
			function ProtocolHistoryViewModel() {
				var self = this;				
				this.reportService = reportService;
				this.protocolTypes = ko.observableArray([]);
				this.protocols = ko.observableArray([]);
				this.selectedProtocolType = ko.observable();
				this.selectedProtocol = ko.observable();
				this.selectedProtocolName = ko.observable('');
				this.currentProtocolContent = '';
				this.currentSelectNode = null;
				this.showHistory = ko.observable(false);
				this.startFromDate = ko.observable('');
				this.endByDate = ko.observable('');

				this.initSearchCondition = function() {
					self.startFromDate(self.reportService.previousDate.getFullYear() + "-" + (self.reportService.previousDate.getMonth()+1) + "-" + self.reportService.previousDate.getDate()); 
				    self.endByDate(self.reportService.nowDate.getFullYear() + "-" + (self.reportService.nowDate.getMonth()+1) + "-" + self.reportService.nowDate.getDate());
				};

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
						else 
							self.selectedProtocol(null);
					}
					else
						self.getProtocolsErrorFunction();
				};
				
				this.getProtocolsErrorFunction = function(){
					notificationService.showError('获取协议列表失败');
				};
				
				this.getProtocols = function(protocolType){
					utpService.getBigDataByType(null, protocolType, self.getProtocolsSuccessFunction, self.getProtocolsErrorFunction);
				};

				this.getProtocolSuccessFunction = function(data){
					if(data && data.status === 1 && data.result)
						protocolService.addProtocol(data.result);
					else 
						self.getProtocolErrorFunction();
				};
				
				this.getProtocolErrorFunction = function(){
					notificationService.showError('获取协议文件失败');
				};

				this.getProtocol = function(id){
					utpService.getProtocol(id, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
				};

				this.protocolChanged = function(obj, event) {
					if (self.selectedProtocol() == undefined)
						return;					
		
					if (event.originalEvent)// user changed
						self.getProtocol(self.selectedProtocol().id);
					else { // program changed
		
					}
				};

				this.protocolHistoryConditionSetting = function(){
					$('#protocolHistoryConditionSettingModal').modal('show');
				};
				
				this.getFrameStatisticsSuccessFunction = function(data){
					$('#protocolHistoryConditionSettingModal').modal('hide');
					if(data != null && data.status === 1){
						if(data.result && data.result.length > 0){
							self.showHistory(true);
							self.initStatistics(data.result);
						}
						else
							self.showHistory(false);
					}
					else{
						self.showHistory(false);
						self.getFrameStatisticsErrorFunction();
					}
				};			

				this.getFrameStatisticsErrorFunction = function(){
					notificationService.showError('获取数据失败');
				};
				
				this.createProtocolFieldStatistics = function(){
					if(self.selectedProtocol() == null){
						notificationService.showWarn('请选择协议！');
						return;
					}

					var begin = new Date(self.startFromDate());
					var end = new Date(self.endByDate());
					if(begin > end){
						notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
						return;
					}

					var parameter = {
						protocolId: self.selectedProtocol().id,
						startFromDate: self.startFromDate(),
						//endByDate多加一天，因为数据库查询时是小于结束时间的
						endByDate:self.endByDate()+1,
					};
					utpService.searchBusFrameStatisticsOverview(parameter, self.getFrameStatisticsSuccessFunction, self.getFrameStatisticsErrorFunction);
				};
				
				this.genericRawFrame = ko.observable('');
				this.getRawStorageDataSuccessFunction = function(data){
		    		if(data && data.status === 1 && data.result){
						var rawFrame = data.result;
						self.genericRawFrame(rawFrame);
						$('#protocolHistoryRawFrameModal').modal('show');
		    		}
		    		else
		    			self.getRawStorageDataErrorFunction();
				};
		    	
		    	this.getRawStorageDataErrorFunction = function(){
					notificationService.showError('获取原始帧数据失败！');
				};

				this.showRawFrame = function(item){
					utpService.getPartBigDataById(item.bigDataId, 'rawFrameOnly', item.index, self.getRawStorageDataSuccessFunction, self.getRawStorageDataErrorFunction);
				}; 

				this.genericRecordContent = null;
				this.getFieldStorageDataSuccessFunction = function(data){
		    		if(data && data.status === 1 && data.result){
						var fieldValues = data.result;
						var fields = protocolService.bigDataFieldAnalysis(self.currentBigDataFrameConfig.protocolId, self.currentBigDataFrameConfig.messageName , fieldValues);
						if(fields){
							self.genericRecordContent = JSON.parse(fields);
							$('#protocolHistoryFieldModal').modal('show');
							return;
						}
						else
							notificationService.showError("不满足协议定义,不能解析详细字段!");
		    		}
		    		else
		    			self.getFieldStorageDataErrorFunction();
				};
		    	
		    	this.getFieldStorageDataErrorFunction = function(){
					notificationService.showError('获取字段数据失败！');
				};

				this.disableGenericDetailInfo = function(){
					$('#protocolHistoryFieldView').html('');
		    	};

				this.currentBigDataFrameConfig = null;
				this.showGenericDetail = function(item){
					self.disableGenericDetailInfo();
					self.currentBigDataFrameConfig = {
						bigDataId: item.bigDataId,
						fieldValues:'',
						protocolId: item.protocolId,
						messageName: item.messageName
					};					
					utpService.getPartBigDataById(item.bigDataId, 'FieldValuesOnly', item.index, self.getFieldStorageDataSuccessFunction, self.getFieldStorageDataErrorFunction);
					return;
				};

				this.displayReportConfig = function(message, genericRecordContent){

					const container = document.getElementById('protocolHistoryFieldView');
					const options = {
						mode: 'view',
						modes: ['text', 'view'],
						name: message,
						dragarea: false,
						enableSort: false,
						enableTransform: false,
						enableExtract: false,
						colorPicker: false,
						language: 'zh-CN',
						onEditable: function (node) {
							if (!node.path) {
							  // In modes code and text, node is empty: no path, field, or value
							  // returning false makes the text area read-only
							  return false;
							}
						}
					}
					self.editor = new JSONEditor(container, options, genericRecordContent);
				};

				this.initStatistics = function(data){
					$('#protocolHistoryTable').html('');
					var currentIndex = 1;
					var table = [];
					var spans = [];
					for(var i = 0; i< data.length;i++){
						var createdAt = data[i].createdAt;
						var bigData = JSON.parse(data[i].bigdata);
						var genericFrameDataList = protocolService.bigDataAnalysis(bigData.busInterfaceDefID, bigData.genericBusFrameDatas);
						if(genericFrameDataList == null)
							continue;
						if(genericFrameDataList.length > 0){
							spans.push([currentIndex, "createdAt", 1, genericFrameDataList.length])
							for(var j = 0; j<genericFrameDataList.length;j++){
								table.push({
									id: currentIndex,
									createdAt: createdAt,
									messageName: genericFrameDataList[j].frameData.message,
									receiveFrame: genericFrameDataList[j].receiveFrame ? '接收':'发送',
									timestamp:genericFrameDataList[j].timestamp,
									index: j,
									bigDataId: data[i].id,
									protocolId: bigData.busInterfaceDefID
								});
								currentIndex++;
							}
						}
					}

					webix.ui({
						view:"datatable", 
						container:"protocolHistoryTable",
						fixedRowHeight:false,
						id:"protocolHistoryTableList",
						select:true,
						spans:true,
						resizeColumn:true,
						height:400, 			
						columns:[
						  { id:"createdAt",	header:"时间", fillspace:3 },
						  { id:"messageName", 	header:"消息名称" , fillspace:2},
						  { id:"", header:"原始帧", fillspace:2,
								template : function(item){															
									return "<span class='webix_icon fas fa-search-plus rawInfo' style='cursor: pointer;'></span>"
							}
						  },
						  { id:"receiveFrame",	header:"方向", 	fillspace:2 },
						  { id:"timestamp",	header:"时间", fillspace:2 },
						  { id:"", header:"字段信息", fillspace:2,
								template : function(item){															
									return "<span class='webix_icon fas fa-search-plus fieldInfo' style='cursor: pointer;'></span>"
								}
						  }
						],						
						//autoheight:true,
						//scrollX:false,
						data:{
						  data:table,
						  spans: spans
						},
						onClick:{
							"fieldInfo":function(event, cell, target){											            
								var item = $$('protocolHistoryTableList').getItem(cell);
								if(item == null)
									return;								
								self.showGenericDetail(item);
							},
							"rawInfo":function(event, cell, target){											            
								var item = $$('protocolHistoryTableList').getItem(cell);
								if(item == null)
									return;
								self.showRawFrame(item);
							}
						},
					  });				
				};

				// The data-binding shall happen after DOM element be attached.
				this.attached = function(view, parent) {
					self.protocols([]);
					self.showHistory(false);
					$('#historySearchBeginDate').datepicker({
						format: "yyyy-mm-dd",
						todayHighlight: true,
						language: "zh-CN",
						autoclose: true
					});
					$('#historySearchEndDate').datepicker({
						format: "yyyy-mm-dd",
						todayHighlight: true,
						language: "zh-CN",
						autoclose: true
					});
					$('#protocolHistoryConditionSettingModal').on('shown.bs.modal', function() {
					//	self.initSearchCondition();
						self.initProtocols();
					});
					$('#protocolHistoryFieldModal').on('shown.bs.modal', function() {
						self.displayReportConfig(self.currentBigDataFrameConfig.messageName, self.genericRecordContent);
					});		
				};
				
				this.detached = function(view, parent){
					
				};

				this.activate = function() {
					self.prepareProtocolType();
					self.initSearchCondition();
				};
			}
			return new ProtocolHistoryViewModel();
		});
