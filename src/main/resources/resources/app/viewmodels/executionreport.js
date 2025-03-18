define(['durandal/app', 'bootstrap','knockout', 'jquery', 'komapping', 'services/ursService','services/selectionManager', 'services/reportService', 'services/utpService', 'services/viewManager', 
	'services/protocolService',	'services/cmdConvertService', 'services/executionManager', 'services/systemConfig','services/notificationService', 'services/utilityService', 'jsoneditor', 'bootstrapSwitch', 'blockUI', 'knockstrap','datepicker'],
		function(app, bootstrap, ko, $, komapping, ursService, selectionManager, reportService, utpService, viewManager, protocolService, cmdConvertService, executionManager, systemConfig, notificationService, utilityService, JSONEditor, bootstrapSwitch, blockUI, knockstrap, datepicker) {
	
			var executionReportViewModel = function() {
				var self = this;
				this.pageId = ko.observable('');
				this.viewManager = viewManager;
				this.reportService = reportService;
				this.executionManager = executionManager;
				this.systemConfig = systemConfig;
				this.executionChart = null;
				this.pressureTestSummaryChart = null;
				this.chartOptions = {};
				this.gridData = [];
				this.pieData = {};
				this.selectExecution = null;
				this.executionReportRefreshSubScription = null;
				this.executionReportRefreshAllSubScription = null;
				this.selectResultStep = null;
				this.currentTestsetId = null;
				this.currentTestsetName = null;
				
				this.singleReportRemove = true;
				this.observableData = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});			
				
				this.selectedUser = ko.observable(null);

				this.testsets = komapping.fromJS([], {
					key : function(item) {
						return ko.utils.unwrapObservable(item.id);
					}
				});

				this.selectedTestset =  ko.observable();

				this.testsetChanged = function(obj, event) {
					if (self.selectedTestset() == undefined)
						return;					
		
					if (event.originalEvent){

					}
					else { // program changed
		
					}
				};

				this.otherTest={
					"id": 0,
					"projectId":selectionManager.selectedProject().id,
					"name": "其他",
					"engineName":"",
					"description": ""
				}
				this.getTestSetByProjectSuccessFunction = function(data){
					if(data != null && data.status === 1){
						var testSetInfo = data.result;
						testSetInfo.push(self.otherTest);

						komapping.fromJS(testSetInfo, {}, self.testsets);
					}
					else
						self.getTestSetByProjectErrorFunction();
				};
				
				this.getTestSetByProjectErrorFunction = function(){
					notificationService.showError('获取测试集失败');
				};

				this.getTestSetByProject = function(){			
					utpService.getTestSetByProject(selectionManager.selectedProject().id, self.getTestSetByProjectSuccessFunction, self.getTestSetByProjectErrorFunction);
				};

				this.getReports = function() {
					if(self.currentTestsetId && self.currentTestsetId != '')
						utpService.getExecutionListByTestset(self.currentTestsetId, selectionManager.selectedProject().id, self.getCompletedExecutionListSuccessFunction, self.getCompletedExecutionListErrorFunction);
				};
				
				this.getAllReports = function(){
					utpService.getCompletedExecutionList($.cookie("orgId"), $.cookie("lastSelectedProject"), self.getCompletedExecutionListSuccessFunction, self.getCompletedExecutionListErrorFunction);
				};
				
				this.getTestReportByCondition = function(condition){
					utpService.getTestReportByCondition(condition, self.getCompletedExecutionListSuccessFunction, self.getCompletedExecutionListErrorFunction);
				};

				this.getCompletedExecutionListSuccessFunction = function(data){
					if(data && data.status === 1 && data.result)
						komapping.fromJS( data.result, {}, self.observableData );
					else
						self.getCompletedExecutionListErrorFunction();
				};
				
				this.getCompletedExecutionListErrorFunction = function(){
					notificationService.showError('获取报表失败');
				};
				
				this.initChart = function(){					
					var dom = document.getElementById("referrals" + self.pageId());
					self.executionChart = echarts.init(dom);
					var data = self.pieData;
					if(data == null){
						document.getElementById("referrals" + self.pageId()).innerText = "数据不存在！";
						return;
					}
					
				    var legendData = [];
				    var seriesData = [];
				    var name = '成功';
				    legendData.push(name);
				    if(data.passedScripts.length > 0){
				        seriesData.push({
				            name: name,
				            value: data.passedScripts.length,
				            itemStyle: {
		                        normal: {
		                            color: 'green',		                            
		                        }
		                    }
				        });
				    }
				    
				    name = '失败';
			        legendData.push(name);
			        
				    if(data.failedScripts.length > 0){				    	
				        seriesData.push({
				            name: name,
				            value: data.failedScripts.length,
				            itemStyle: {
		                        normal: {
		                            color: 'red',		                            
		                        }
		                    }
				        });
				    }
				    
				    name = '未执行';
			        legendData.push(name);
			        if(data.unExecutedScripts.length > 0){			        	
				        seriesData.push({
				            name: name,
				            value: data.unExecutedScripts.length,
				            itemStyle: {
		                        normal: {
		                            color: 'yellow',		                            
		                        }
		                    }
				        });
			        }
			        
			        if(seriesData.length == 0){
						document.getElementById("referrals" + self.pageId()).innerText = "数据不存在！";
						return;
					}
			        
					self.chartOptions = null;					
					self.chartOptions = {
					    title : {					    			    
					        text: data.targetTestsetName+'：'+data.executionName + '(' + data.executedByUserId + ')',
					        subtext: (data.testObject ? data.testObject + " " : "") + (data.executionStartTime ? data.executionStartTime : "") + ' - ' + (data.executionEndTime ? data.executionEndTime : ""),
					        left: 'center'
					    },
					    tooltip : {
					        trigger: 'item',
					        formatter: "{b} : {c} ({d}%)"
					    },					   
					    legend: {
					    	 bottom: 10,
					         left: 'center',
					         data : legendData,
					    },
					    toolbox: {
					        feature: {                
					            saveAsImage: {}
					        }
					    },
					    series : [
					        {
					            name: '种类',
					            type: 'pie',
					            radius : '55%',
					            center: ['40%', '50%'],
					            data: seriesData,
					            itemStyle: {
					                emphasis: {
					                    shadowBlur: 10,
					                    shadowOffsetX: 0,
					                    shadowColor: 'rgba(0, 0, 0, 0.5)'
					                }
					            }
					        }
					    ]
					};
					if (self.chartOptions && typeof self.chartOptions === "object") 
						self.executionChart.setOption(self.chartOptions, true);
				}
				
				this.stepTypeCompare = function(value, filter, config){					
					var type = config.type.toString().toLowerCase();
					filter = filter.toString().toLowerCase();
					return type == filter;
				}
				
				this.testResultCompare = function(value, filter, config){					
					var result = config.result.toString().toLowerCase();
					filter = filter.toString().toLowerCase();
					return result == filter;
				}
				this.initTable = function () {
					webix.ready(function () {
						const createSelectFilter = (compareFunc, options) => ({
							content: "selectFilter",
							compare: compareFunc,
							options: options
						});
				
						const createResultTemplate = (data) => {
							const resultMap = {
								[cmdConvertService.testResult.pass]: { color: 'green', text: '成功' },
								[cmdConvertService.testResult.failed]: { color: 'red', text: data.errorMessage || '失败' },
								[cmdConvertService.testResult.timeOut]: { color: 'yellow', text: '超时' },
								[cmdConvertService.testResult.unCompleted]: { color: 'yellow', text: '未完成' },
								[cmdConvertService.testResult.other]: { color: '', text: '其它' }
							};
							const result = resultMap[data.result];
							return `<div style='background-color: ${result.color}'><span>${result.text}</span></div>`;
						};
				
						const createResultTooltip = (obj, common) => {
							const resultMap = {
								[cmdConvertService.testResult.pass]: '成功',
								[cmdConvertService.testResult.failed]: obj.errorMessage || '失败',
								[cmdConvertService.testResult.timeOut]: '超时',
								[cmdConvertService.testResult.other]: '其它'
							};
							return resultMap[obj[common.column.id]];
						};
				
						webix.ui({
							container: "reportDetailInfo" + self.pageId(),
							id: "report_tabview" + self.pageId(),
							width: 0,
							view: "tabview",
							cells: [
								{
									header: "测试用例/检查点 结果",
									id: "main",
									body: {
										view: "datatable",
										css: "webix_header_border",
										id: "list1",
										template: "#title#",
										columns: [
											{
												id: "step",
												header: ["测试类型", createSelectFilter(self.stepTypeCompare, [
													{ "value": "测试用例", "id": "TestCase" },
													{ "value": "检查点", "id": "Checkpoint" }
												])],
												fillspace: 3
											},
											{
												id: "stepName",
												header: "测试名称",
												fillspace: 8,
												tooltip: (obj, common) => `<span style='display:inline-block;max-width:200;word-wrap:break-word;white-space:normal;'>${obj[common.column.id]}</span>`
											},
											{
												id: "result",
												header: ["测试结果", createSelectFilter(self.testResultCompare, [
													{ "value": "成功", "id": cmdConvertService.testResult.pass },
													{ "value": "失败", "id": cmdConvertService.testResult.failed },
													{ "value": "超时", "id": cmdConvertService.testResult.timeOut },
													{ "value": "未完成", "id": cmdConvertService.testResult.unCompleted },
													{ "value": "其它", "id": cmdConvertService.testResult.other }
												])],
												fillspace: 3,
												template: createResultTemplate,
												tooltip: createResultTooltip
											},
											{ id: "time", header: "执行时间", fillspace: 6 },
											{
												id: "", header: "", fillspace: 1,
												template: () => "<span class='webix_icon fas fa-search-plus' style='cursor: pointer;'></span>"
											},
											{
												id: "manualDecisionLevel",
												header: "人工判别",
												fillspace: 3,
												hidden: !self.systemConfig.getConfig('utpclient.testset.artificial_discrimination_level'), 
												template: (item) => {
													if (item.type == "checkpoint" && item.result == cmdConvertService.testResult.failed) {
														return `<select class='form-control' onchange='updateManualDecisionLevel(${item.checkpointId}, this.value);'>
															<option value='0'${item.manualDecisionLevel == 0 ? " selected" : ""}>${cmdConvertService.manualDecisionLevel.manualDecisionLevel0}</option>
															<option value='1'${item.manualDecisionLevel == 1 ? " selected" : ""}>${cmdConvertService.manualDecisionLevel.manualDecisionLevel1}</option>
															<option value='2'${item.manualDecisionLevel == 2 ? " selected" : ""}>${cmdConvertService.manualDecisionLevel.manualDecisionLevel2}</option>
															<option value='3'${item.manualDecisionLevel == 3 ? " selected" : ""}>${cmdConvertService.manualDecisionLevel.manualDecisionLevel3}</option>
														</select>`;
													} else {
														return "<span></span>";
													}
												}
											}
										],
										tooltip: true,
										fixedRowHeight: false,
										rowLineHeight: 25,
										rowHeight: 25,
										data: self.gridData,
										select: true,
										onMouseMove: function (id) {
											this.select(id);
										},
										onClick: {
											"fa-search-plus": function (ev, id) {
												var item = $$('list1').getItem(id);
												if (item == null)
													return;
												self.selectResultStep = item;
												if (!$$(item.id)) {
													var tabview = $$("report_tabview" + self.pageId());
													var views = tabview.getChildViews();
													for (var i = 0; i < views.length; i++) {
														var options = views[i].config.options;
														if (options) {
															for (var j = 0; j < options.length; j++) {
																if (options[j].id != "list1") {
																	tabview.removeView(options[j].id);
																}
															}
														}
													}
													self.getDetailExecutionResult(item.begin, item.end);
												}
												else
													$$(item.id).show(false, false);
											}
										},
										on: {
											onAfterLoad: function () {
												if (!this.count())
													this.showOverlay("数据不存在");
											},
											onresize: webix.once(function () {
												this.adjustRowHeight("stepName", true);
											}),
											onViewShow: function () {
												var tabview = $$("report_tabview" + self.pageId());
												var views = tabview.getChildViews();
												for (var i = 0; i < views.length; i++) {
													var options = views[i].config.options;
													if (options) {
														for (var j = 0; j < options.length; j++) {
															if (options[j].id != "list1") {
																tabview.removeView(options[j].id);
															}
														}
													}
												}
											}
										}
									}
								}
							]
						});
					});
				}
				window.updateManualDecisionLevel = function (checkpointId, level) {
					for (var i = 0; i < self.gridData.length; i++) {
						if (self.gridData[i].checkpointId == checkpointId) {
							self.gridData[i].manualDecisionLevel = level;
							break;
						}
					}
					utpService.updateExecutionCheckpointManualDecisionLevel(checkpointId, level, self.getUpdateManualDecisionLevelSuccessFunction, self.getUpdateManualDecisionLevelErrorFunction);
				}
				this.getUpdateManualDecisionLevelSuccessFunction = function(data){
					if(data.result)
						notificationService.showSuccess('更新人工判别成功。');
					else
						self.getUpdateManualDecisionLevelErrorFunction();
				}
				this.getUpdateManualDecisionLevelErrorFunction = function(){
					notificationService.showError('更新人工判别失败。');
				}
				
				this.initDetailData = function(executionResultList, isSummary){
					return cmdConvertService.executionResultLocalization(executionResultList, isSummary);
				}
				
				this.generateOnlineReport = function(expectedResultList, data){
					self.gridData = expectedResultList;					
					self.pieData = data;
					$('#staticModal' + self.pageId()).modal('show');
				};
				
				// webix.env.cdn = "plugins/webix/";
				
				this.generateCsv = function(expectedResultList, data){
					var csvData = [];
					expectedResultList.map(function (value) {
        	        	var result = "其它";
        	        	if(value.result == cmdConvertService.testResult.pass)
        	        		result = "成功";
        	        	else if(value.result == cmdConvertService.testResult.failed){
        	        		result = "失败";
        	        		if(value.errorMessage != null && value.errorMessage != "")
        	        			result = value.errorMessage;
        	        	}        	        		
        	        	else if(value.result == cmdConvertService.testResult.timeOut)
        	        		result = "超时";
        	        	else if(value.result == cmdConvertService.testResult.unCompleted)
        	        		result = "未完成";
        	        	
        	        	var obj = {
        	        		step : value.step,
        	        		stepName: value.stepName,
        	        		result : result,
        	        		time : value.time
						}
        	        	csvData.push(obj);
            		});
					
					webix.ui({
					    rows:[
					        {
					            view:"datatable",
					            id: "executionReport",
					            data: csvData,
					            columns:[
					                {id:"step", fillspace:true, header:"序号",},
					                {id:"stepName", fillspace:true, header:"步骤"},
					                {id:"result", fillspace:true, header:"结果"},
					                {id:"time", fillspace:true, header:"执行时间"}
					            ]
					        }
					    ]
					});
					webix.csv.delimiter.cols = ",";
					webix.toCSV($$("executionReport"),{					   
					    filename: data.executionName + '_' + data.targetTestsetName
					});
				}
				
				this.generateExcel = function(expectedResultList, data){
					var excelReport = {
							"conditions": [],
							"styles": [],
							"spans": [],
							"ranges": [],
							"sizes": [],
							"table": {"frozenColumns": 0,"frozenRows": 0,"gridlines": 1,"headers": 1},
							"data": [],
							"locked": [],
							"editors": [],
							"filters": [],
							"formats": [],
							"comments": [],
							"spans": [[1,1,4,1]]
						}
					self.spreadSheet = null;
					excelReport.data = [
						[1,1, data.executionName + '_' + data.targetTestsetName + (data.testObject? "_" + data.testObject :"") + '_' + data.executedByUserId, ""], 
						[2,1,"",""],
						[2,2,"步骤",""],
						[2,3,"结果",""],
						[2,4,"执行时间",""]
					];
					var i=2;
					expectedResultList.map(function (value) {
            			excelReport.data.push([++i,1, value.step, ""]);
        	        	excelReport.data.push([i,2, value.stepName, ""]);
        	        	var result = "其它";
        	        	if(value.result == cmdConvertService.testResult.pass)
        	        		result = "成功";
        	        	else if(value.result == cmdConvertService.testResult.failed){
        	        		result = "失败";
        	        		if(value.errorMessage != null && value.errorMessage != "")
        	        			result = value.errorMessage;
        	        	}        	        		
        	        	else if(value.result == cmdConvertService.testResult.timeOut)
        	        		result = "超时";
        	        	else if(value.result == cmdConvertService.testResult.unCompleted)
        	        		result = "未完成";
        	        	excelReport.data.push([i,3, result, ""]);
        	        	excelReport.data.push([i,4, value.time, ""]);
            		});
					
					if (self.spreadSheet)
            			self.spreadSheet.destructor();
            		self.spreadSheet = webix.ui({id:"executionReport", view:"spreadsheet", data: excelReport});
            		
        	        webix.toExcel("executionReport", {filename: data.executionName + '_' + data.targetTestsetName, spans:true});
        	        //webix.toPDF("executionReport", { fontName:"arial-unicode-ms", autowidth:true, filename: data.executionName + '_' + data.targetTestsetName, spans:true});
        	        self.spreadSheet.destructor();
        	        self.spreadSheet = null;
				}
				
				this.generateOfflineReport = function(expectedResultList, data){
					self.generateExcel(expectedResultList, data);
				//	self.generateCsv(expectedResultList, data);
        	    };
				
        	    this.getJsonStorageDataSuccessFunction = function(data){
		    		if(data && data.status === 1 && data.result)
		    			protocolService.addBigData(data.result);
		    		else
		    			self.getJsonStorageDataErrorFunction();
				};
		    	
		    	this.getJsonStorageDataErrorFunction = function(){
					notificationService.showError('获取数据失败。');
				};
		    	
		    	this.getJsonStorageData = function(item){
		    		if(item.existBigData && item.bigDataId){
			    		if(protocolService.getBigData(item.bigDataId))
			    			return;
			    		utpService.getOverviewBigDataById(item.bigDataId, self.getJsonStorageDataSuccessFunction, self.getJsonStorageDataErrorFunction);
		    		}
		    	};
        	    
		    	this.initBigData = function(executionResultList){
		    		if(executionResultList != null){
		    			for(var i=0;i<executionResultList.length;i++){
		    				self.getJsonStorageData(executionResultList[i]);
		    			}
		    		}
		    	};
		    	this.pressureTestSummaryData = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	this.pressureTestSummary = {
		    		succCount : ko.observable(0),
		    		failCount : ko.observable(0),
			    	result : ko.observable(''),
			    	startTime : ko.observable(''),			
			    	endTime : ko.observable('')
		    	};
		    	this.pressureTestDetailData = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	this.pressureTestDetail = {
		    		runId : ko.observable(0),
		    		result : ko.observable(''),
		    		startTime : ko.observable(''),			
		    		endTime : ko.observable('')
				};
		    	
		    	this.pressureTestCmdRunTimes = [];
		    	
		    	this.pressureTestCmdRunTimesDetail = {
		    		antbot:ko.observable(''),
		    		command: ko.observable(''),
		    		parameter:ko.observable('')
		    	}
		    	
		    	this.pressureTestCmdsStatisRunTimes = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	
		    	this.frameDataList = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	
		    	this.pressureTestFailDetailData = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	
		    	this.failDetailEnabled = ko.observable(false);
		    	
		    	this.disableFailDetailInfo = function(){
		    		self.failDetailEnabled(false);
		    	};
		    	
		    	this.enalbeFailDetailInfo = function(item){
		    		komapping.fromJS( item.commandResultList(), {}, self.pressureTestDetailData );
					self.pressureTestDetail.runId(item.runID());
					self.pressureTestDetail.result(item.result());
					self.pressureTestDetail.startTime(item.startTime());
					self.pressureTestDetail.endTime(item.endTime());
					self.failDetailEnabled(true);
		    	};
		    	
		    	// ARINC429
		    	this.arinc429FrameDataList = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	
		    	this.arincDetailEnabled = ko.observable(false);
		    	
		    	this.disableARINC429DetailInfo = function(){
		    		self.arincDetailEnabled(false);
		    	};
		    	
		    	this.showARINC429Detail = function(item){
					self.currentARINC429Record.time(item.time());
					self.currentARINC429Record.labelIndex(item.labelIndex(0));
					self.currentARINC429Record.labelName(item.labelName());
					self.currentARINC429Record.encodedString(item.encodedString());
					self.currentARINC429Record.fields(item.fields());
					self.currentARINC429Record.decodedBits(item.decodedBits());
					self.currentARINC429Record.units(item.units());
					self.currentARINC429Record.ssmValue(item.ssmValue());
					self.arincDetailEnabled(true);
				}
				
				this.currentARINC429Record = {
						time : ko.observable(''),
						labelIndex: ko.observable(''),
						labelName : ko.observable(''),
						encodedString : ko.observable(''),
						fields : ko.observable([]),
						decodedBits : ko.observable(''),
						units : ko.observable(''),
						ssmValue : ko.observable('')
				};
		    	
				// MIL1553B
				this.mil1553BFrameDataList = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	
		    	this.mil1553BDetailEnabled = ko.observable(false);
		    	
		    	this.disableMIL1553BDetailInfo = function(){
		    		self.mil1553BDetailEnabled(false);
		    	};
		    	
		    	this.showMIL1553BDetail = function(item){
					self.currentMIL1553BRecord.path(item.path());
					self.currentMIL1553BRecord.comWord(item.comWord());
					self.currentMIL1553BRecord.datas(item.datas());
					self.currentMIL1553BRecord.status(item.status());
					self.currentMIL1553BRecord.rawFrame(item.rawFrame());
					self.mil1553BDetailEnabled(true);
				}
				
				this.currentMIL1553BRecord = {
					path : ko.observable(''),
					comWord: ko.observable(''),
					datas : ko.observable(''),
					status : ko.observable(''),
					rawFrame : ko.observable('')
				};
				
				// MIL1553BCUSTOM
				this.mil1553BCustomFrameDataList = komapping.fromJS( [], {
					key: function(item) {
						return ko.utils.unwrapObservable(item.id);        
					}
				});
		    	
		    	this.mil1553BCustomDetailEnabled = ko.observable(false);
		    	
		    	this.disableMIL1553BCustomDetailInfo = function(){
		    		self.mil1553BCustomDetailEnabled(false);
		    	};
		    	
		    	this.showMIL1553BCustomDetail = function(item){
					var unmapped = komapping.toJS(item.frameDatas);
					self.currentMIL1553BCustomRecord.frameDatas(unmapped);
					self.mil1553BCustomDetailEnabled(true);
				};
				
				this.currentMIL1553BCustomRecord = {
					frameDatas : ko.observable([])
				};
				
				// Generic Frame				
				this.genericFrameDataList = ko.observable([]);
				this.genericDetailEnabled = ko.observable(false);
				this.genericRawFrame = ko.observable('');
				this.generalRawData = ko.observable('');
				this.currentBigDataFrameConfig = null;
				this.messageTemplateName = ko.observable('');
				this.genericErrorFrameData = ko.observable(false);
				this.genericRecordContent = ko.observable('');

				this.createMessageTemplateSuccessFunction = function(data){
					if(data && data.status === 1 && data.result)
						notificationService.showSuccess('创建消息模板成功！');
		    		else if(data.errorMessage)
						notificationService.showError(data.errorMessage);
					else
		    			self.createMessageTemplateErrorFunction();
				};

				this.createMessageTemplateErrorFunction = function(){
					notificationService.showError('创建消息模板失败！');
				};

				this.createMessageType = function(){
					if(self.messageTemplateName() === ''){
						notificationService.showError('消息模板名称不能为空');
						return;
					}						
					var messageTypeObj = {
						id:0,
						protocolId: self.currentBigDataFrameConfig.protocolId,
						messageName: self.currentBigDataFrameConfig.messageName,
						templateName:self.messageTemplateName(),
						fieldValues: self.currentBigDataFrameConfig.fieldValues
					}
					utpService.createMessageTemplate(messageTypeObj, self.createMessageTemplateSuccessFunction, self.createMessageTemplateErrorFunction);
				};

		    	this.disableGenericDetailInfo = function(){
					self.genericErrorFrameData(false);
					self.genericDetailEnabled(false);
					self.messageTemplateName('');
					self.genericRawFrame("");
					$('#reportConfigView' + self.pageId()).html('');
		    	};
		    	
				this.displayReportConfig = function(protocolId, messageName, genericRecordContent, fieldValues, fieldSizes){
					self.messageTemplateName('');
					const container = document.getElementById('reportConfigView' + self.pageId());
					const options = {
						mode: 'view',
						modes: ['text', 'view'],
						name: messageName,
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
						},
						onEvent: function (node, event) {
							if (event.type === "click") {							 
								var path = JSON.parse(JSON.stringify(node.path));
								var interval = protocolService.getFieldValueInterval(protocolId, messageName, path, fieldValues, fieldSizes);
								if(interval){
									var rawFrame = self.genericRawFrame();
									rawFrame = rawFrame.replace("<div style='color:#FF0000';>","").replace("</div>","");
									var start = interval.start / 4;
									var end = interval.end / 4;
									rawFrame = rawFrame.slice(0, start) + "<div style='color:#FF0000';>" + rawFrame.slice(start, end) + "</div>" + rawFrame.slice(end);
									self.genericRawFrame(rawFrame);
								}
								console.log(interval);
							}
						}
					}
					self.editor = new JSONEditor(container, options, genericRecordContent);
				};

				this.getFieldStorageDataSuccessFunction = function(data){
		    		if(data && data.status === 1){
						try{
							result = JSON.parse(data.result);
							var fieldValues = result.fieldValues;
							var fieldSizes = result.fieldSizes;
							var rawFrame = result.rawFrame;
							self.genericRawFrame(rawFrame);
							if(self.currentBigDataFrameConfig){
								var bigData = protocolService.getBigData(self.currentBigDataFrameConfig.bigDataId);
								if(bigData){
									var messageName = bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].message;
									bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].fieldValues = fieldValues;
									bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].rawFrame = rawFrame;
									bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].fieldSizes = fieldSizes;
									self.currentBigDataFrameConfig.fieldValues = fieldValues;
									protocolService.updateBigData(self.currentBigDataFrameConfig.bigDataId, bigData);								
									self.showFormatGenericDetail(bigData.data.busInterfaceDefID, messageName , fieldValues, fieldSizes);
								}
							}
						}
						catch(e){
							self.getFieldStorageDataErrorFunction();
						}
		    		}
		    		else
		    			self.getFieldStorageDataErrorFunction();
				};
		    	
		    	this.getFieldStorageDataErrorFunction = function(){
					notificationService.showError('获取字段数据失败！');
				};

				this.showFormatGenericDetail = function(busInterfaceDefID, messageName, fieldValues, fieldSizes){
					var fields = protocolService.bigDataFieldAnalysis(busInterfaceDefID, messageName , fieldValues);
					if(fields){
						self.genericRecordContent(JSON.parse(fields));
						self.genericErrorFrameData(false);
						self.displayReportConfig(busInterfaceDefID, messageName, self.genericRecordContent(), fieldValues, fieldSizes);
					}
					else{
						self.genericRecordContent(fieldValues);
						self.genericErrorFrameData(true);
						notificationService.showError("不满足协议定义,不能解析详细字段!");
					}
					self.genericDetailEnabled(true);
				};

		    	this.showGenericDetail = function(item, event){
					var context = ko.contextFor(event.target);
        			var index = context.$index();
					self.currentBigDataFrameConfig = {
						bigDataId: self.currentBigDataConfig.bigDataId,
						fieldValues:'',
						protocolId: self.currentBigDataConfig.protocolId,
						messageName: item.frameData.message(),
						index:index
					};
					self.disableGenericDetailInfo();
					if(item.frameData.fields().length === 0 || item.rawFrame() == undefined || item.rawFrame() == null || item.rawFrame() == ''){
						utpService.getIndexBigDataById(self.currentBigDataFrameConfig.bigDataId, self.currentBigDataFrameConfig.index, self.getFieldStorageDataSuccessFunction, self.getFieldStorageDataErrorFunction);
						return;
					}
					self.genericRawFrame(item.rawFrame());
					self.currentBigDataFrameConfig.fieldValues = item.frameData.fieldValues();
					self.showFormatGenericDetail(self.currentBigDataConfig.protocolId, item.frameData.message(), self.currentBigDataFrameConfig.fieldValues);
				};

				this.showProtocolCompare = function(jsonLeft, jsonRight){
					self.viewManager.protocolCompareActiveData({jsonLeft, jsonRight});
					self.viewManager.protocolCompareActivePage('app/viewmodels/protocolCompare');
				};

				this.treeTable=null;
				// this.reportTestResultData = function(dynamicId){
					
				// }
			
				this.currentBigDataConfig = null;

				this.testcaseTreeAsyncData = ko.observableArray([]);
				this.testcaseTreeAsyncDataFunction = function (data) {
					self.testcaseTreeAsyncData.removeAll();
					var resultItems = data
					for (var i = 0; i < resultItems.length; i++) {
						var data = resultItems[i];
						if (data.commandType == cmdConvertService.commandType.subscriptBegin) {
							var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
							var testcase = new Object();
							testcase.name = step.stepName;
							testcase.id = data.indexId;
							testcase.parentId = data.parentId;
							testcase.agentName = "";
							testcase.result = -1;
							testcase.children = [];
							testcase.isParent = true;
							testcase.errorMessage = data.errorMessage;
							if (step.stepType == "subScript") {
								testcase.icon = 'webix_fmanager_icon fm-file-text';
								testcase.name = "[子脚本]  " + step.stepName;
							} else if (step.stepType == "script") {
								testcase.icon = 'webix_fmanager_icon fm-file';
								testcase.name = "[测试用例]  " + step.stepName;
							}
							testcase.executionTime = data.executionTime;
							self.lastestCaseNode = testcase;
							self.testcaseTreeAsyncData.push(testcase);
						} else if (data.commandType == cmdConvertService.commandType.subscriptEnd) {
							//在testcaseTreeAsyncData里根据indexId找到,并修改testcaseTreeAsyncData中的数据
							var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
								var testcase = new Object();
								if (step.stepType == "subScript") {
									testcase.icon = 'webix_fmanager_icon fm-file-text';
									testcase.name= step.stepName;
								} else if (step.stepType == "script") {
									testcase.icon = 'webix_fmanager_icon fm-file';
									testcase.name=step.stepName;
								}
							for (var j = 0; j < self.testcaseTreeAsyncData().length; j++) {
								if (self.testcaseTreeAsyncData()[j].id == data.indexId) {
									self.testcaseTreeAsyncData()[j].result = data.result;
									self.testcaseTreeAsyncData()[j].name = testcase.name;
									self.testcaseTreeAsyncData()[j].errorMessage = data.errorMessage;
									self.testcaseTreeAsyncData()[j].executionTime = self.testcaseTreeAsyncData()[j].executionTime + " - " + data.executionTime;
									break;
								}
							}
						} else if (data.commandType == cmdConvertService.commandType.executionCommand) {
							var step = cmdConvertService.getcmdUserLanguage(data.command, data.antbotName);
							var testcase = new Object();
							testcase.name = step.stepName;
							testcase.result = data.result;
							testcase.children = [];
							testcase.errorMessage = data.errorMessage;
							testcase.executionTime = data.executionTime;
							testcase.id = data.indexId;
							testcase.existBigData = step.existBigData;
							testcase.bigDataId = step.bigDataId;

							if (data.antbotName == "__SYSDEV__" || data.antbotName == "__EXTDEV__") {
								testcase.agentName = "";
							}
							else {
								testcase.agentName = data.antbotName;
								testcase.name = "[" + data.antbotName + "]  " + step.stepName;
							}
							if (testcase.existBigData && testcase.bigDataId)
								self.getJsonStorageData(testcase);
							self.testcaseTreeAsyncData.push(testcase);
						}

					}
					// self.treeTable.reloadAsyncNode('test', 0); 

				};
				this.getDetailExecutionResultSuccessFunction = function (data) {
					if (data && data.status === 1) {
						var executionResultList = data.result;
						if (executionResultList != null) {
							executionResultList = executionResultList.filter(item => item.indexId && item.indexId.split('-').length === 2);
							self.testcaseTreeAsyncDataFunction(executionResultList);
							// self.initBigData(expectedResultList);
							// 动态生成ID
							var dynamicId = `testcaseTree${self.pageId()}_${new Date().getTime()}`
							$$("report_tabview" + self.pageId()).addView({
								header: self.selectResultStep.stepName,
								
								close: true,
								body: {
									view: "template",
									id: self.selectResultStep.id,
									template: `
										<div class="box box-info">
											<table class="layui-hide" id="${dynamicId}"></table>
										</div>
										
									`
								}
							});
							// 使用 MutationObserver 监控 DOM 变化
							var observer = new MutationObserver(function (mutations) {
								mutations.forEach(function (mutation) {
									if (mutation.addedNodes.length > 0) {
										var treeElement = document.getElementById(dynamicId);
										if (treeElement) {
											layui.use(function () {
												var treeTable = layui.treeTable;
												var inst = treeTable.render({
													elem: '#' + dynamicId,
													data: self.testcaseTreeAsyncData(),
													tree: {
														enable: true,
														async: {
															enable: true,
															format: function (trData, options, callback) {
																self.parentId = trData.id;
																utpService.listResultByParentId(self.selectExecution.executionId(), self.parentId, function (data) {
																	if (data && data.status === 1 && data.result) {
																		self.testcaseTreeAsyncDataFunction(data.result);
																		callback(self.testcaseTreeAsyncData());
																	}
																});

															}
														}
													},
													height: '400px',
													toolbar: '#TPL-treeTable-demo',
													cols: [[
														{ 
															field: 'name', title: '测试步骤', width: "55%", templet: function (d) {
																if (d.existBigData && d.bigDataId) {
																	return "<span>" + d.name + "</span> <a class='layui-btn layui-btn-primary layui-btn-xs' lay-event='detail'>查看</a>";
																}
																else
																	return "<span>" + d.name + "</span>";
															}
														},
														{
															field: 'result', title: '结果', width: "10%",  templet: function (d) {
																if (d.result === 1) {
																	return '<span style="color: green;">成功</span>';
																} else if (d.result === 0) {
																	return '<span style="color: red;">失败</span>';
																} else if (d.result === -1) {
																	return '<span style="color: orange;">执行中</span>';
																} else {
																	return '<span>未知</span>';
																}
															}
														},
														{ field: 'executionTime', title: '时间', width: "15%" },
														{ field: 'errorMessage', title: '备注', width: "20%" },
													]]
													
												});
												
												treeTable.on('tool(' + inst.config.id + ')', function (obj) {
													var layEvent = obj.event;
													var trData = obj.data;
													if (layEvent === "detail") {
														var bigData = protocolService.getBigData(trData.bigDataId);
														if (bigData) {
															self.currentBigDataConfig = {
																bigDataId: trData.bigDataId
															};
															if (bigData.type.includes("video/")) {
																var base64String = bigData.data;
																var videoElement = $('#pressureTestBigDataVideoModal').find('video')[0];
																videoElement.src = base64String;
																videoElement.controls = true;
																videoElement.autoplay = true;
																$('#pressureTestBigDataVideoModal').modal('show');
															}
															else if (bigData.type.includes("image/")) {
																var base64String = bigData.data;
																//将base64String转换为图片
																var img = new Image();
																img.src = base64String;
																//点击查看,弹出模态框显示图片,而不是新打开一个页面
																$('#pressureTestBigDataImgModal').modal('show');
																$('#pressureTestBigDataImgModal').on('shown.bs.modal', function () {
																	$('#pressureTestBigDataImgModal').find('img').attr('src', img.src);
																});
															} else if (bigData.type.includes("audio/")) {
																var audio = new Audio();
																audio.src = bigData.data;
																audio.controls = true;
																audio.autoplay = true;
																$('#pressureTestBigDataAudioModal').modal('show');
																$('#pressureTestigDataAudioModal').on('shown.bs.modal', function () {
																	$('#pressureTestBigDataAudioModal').find('audio').attr('src', audio.src);
																});
															} else if (bigData.type == protocolService.bigDataType.paralAllRunSummary) {
																komapping.fromJS(bigData.data.succRunTimeArry, {}, self.pressureTestSummaryData);
																self.pressureTestSummary.succCount(bigData.data.succCount);
																self.pressureTestSummary.failCount(bigData.data.failCount);
																self.pressureTestSummary.result(bigData.data.result);
																self.pressureTestSummary.startTime(bigData.data.startTime);
																self.pressureTestSummary.endTime(bigData.data.endTime);
																$('#pressureTestSummaryReportModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.paralScriptRunDetailInfo) {
																komapping.fromJS(bigData.data.commandResultList, {}, self.pressureTestDetailData);
																self.pressureTestDetail.runId(bigData.data.runID);
																self.pressureTestDetail.result(bigData.data.result);
																self.pressureTestDetail.startTime(bigData.data.startTime);
																self.pressureTestDetail.endTime(bigData.data.endTime);
																$('#pressureTestDetailReportModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.paralAllFailRunDetailInfo) {
																komapping.fromJS(bigData.data, {}, self.pressureTestFailDetailData);
																self.failDetailEnabled(false);
																$('#pressureTestFailDetailReportModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.paralCmdsStatisRunTimes) {
																komapping.fromJS(bigData.data, {}, self.pressureTestCmdsStatisRunTimes);
																$('#pressureTestCmdRunTimesReportModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.J1939) {
																komapping.fromJS(bigData.data.canFrameDataList, {}, self.frameDataList);
																$('#frameDataModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.ARINC429) {
																for (var i = 0; i < bigData.data.frameDataList.length; i++)
																	bigData.data.frameDataList[i].id = i;
																komapping.fromJS(bigData.data.frameDataList, {}, self.arinc429FrameDataList);
																self.arincDetailEnabled(false);
																$('#frameARINC429DataModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.MIL1553B) {
																for (var i = 0; i < bigData.data.frameDataList.length; i++)
																	bigData.data.frameDataList[i].id = i;
																komapping.fromJS(bigData.data.frameDataList, {}, self.mil1553BFrameDataList);
																self.mil1553BDetailEnabled(false);
																$('#frameMIL1553BDataModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.MIL1553BCUSTOM) {
																for (var i = 0; i < bigData.data.frameDataList.length; i++)
																	bigData.data.frameDataList[i].id = i;
																komapping.fromJS(bigData.data.frameDataList, {}, self.mil1553BCustomFrameDataList);
																self.mil1553BCustomDetailEnabled(false);
																$('#frameMIL1553BCustomDataModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.genericBusFrame) {
																self.currentBigDataConfig.protocolId = bigData.data.busInterfaceDefID;
																var genericFrameDataList = protocolService.bigDataAnalysis(bigData.data.busInterfaceDefID, bigData.data.genericBusFrameDatas);
																komapping.fromJS(genericFrameDataList, {}, self.genericFrameDataList);
																self.genericDetailEnabled(false);
																$('#frameGenericDataModal' + self.pageId()).modal('show');
															} else if (bigData.type == protocolService.bigDataType.generalBusMessagesToDiff) {
																self.currentBigDataConfig.protocolId = bigData.data.busInterfaceDefID;
																var messageName = bigData.data.messageName;
																if (bigData.data.fieldValues1 && bigData.data.fieldValues2) {
																	var fields = protocolService.bigDataFieldAnalysis(bigData.data.busInterfaceDefID, messageName, bigData.data.fieldValues1);
																	var jsonLeft = null;
																	var jsonRight = null;
																	if (fields) {
																		jsonLeft = JSON.parse(fields);
																	}
																	var fields = protocolService.bigDataFieldAnalysis(bigData.data.busInterfaceDefID, messageName, bigData.data.fieldValues2);

																	if (fields) {
																		jsonRight = JSON.parse(fields);
																	}
																	if (jsonLeft && jsonRight) {
																		$('#protocolCompareModal' + self.pageId()).modal({ show: true }, { data: { jsonLeft, jsonRight } });
																	}
																}
															}
															else {
																self.generalRawData(bigData.data);
																$('#reportGeneralRawDataModal' + self.pageId()).modal('show');
															}
														}

													}
												});
											});
											observer.disconnect(); // 停止观察
										}
									}
								});
							});
							var config = { childList: true, subtree: true };
							observer.observe(document.body, config);

						}
						else
							notificationService.showError('获取报表失败');
					}
					else
						notificationService.showError('获取报表失败');					
					$.unblockUI();
				};
				
				this.getDetailExecutionResultErrorFunction = function(){
					$.unblockUI();
					notificationService.showError('获取报表失败');
				};
				
				this.getDetailExecutionResult = function(start, end){					
				// self.getDetailExecutionResultSuccessFunction(null);
					$.blockUI(utilityService.template);
					utpService.getDetailExecutionResult(self.selectExecution.executionId(), start, end, self.getDetailExecutionResultSuccessFunction, self.getDetailExecutionResultErrorFunction);					
				};
				
				this.getStatisticsReportSuccessFunction = function(data){					
					if(data != null && data.status === 1){
						var result = data.result;
						var expectedResultList = self.initDetailData(result.executionResultList, false);
						self.generateOfflineReport(expectedResultList, result);							
					}
					else
						self.getStatisticsReportErrorFunction();
					$.unblockUI();
				};
				
				this.getExecutionReportSuccessFunction = function(data){					
					if(data != null && data.status === 1){
						var result = data.result;
						var a = document.createElement("a");
						a.download = result.fileName;
						a.href = result.filePath;
						$("body").append(a);
						a.click();					
					}
					else
						self.getStatisticsReportErrorFunction();
					$.unblockUI();
				};

				this.getStatisticsReportErrorFunction = function(error){
					$.unblockUI();
					notificationService.showError('获取报表失败');
				};
				this.permissionErrorFunction = function () {
					notificationService.showError('该功能无法使用,请安装相应许可！');
				};
				this.fetchReportData = function(item){
					var enable = self.systemConfig.getEnableByFeatureName('utpclient.testset_exec.export_report')
					if (!enable) {
						self.permissionErrorFunction();
						return;
					}
					$.blockUI(utilityService.template);
					utpService.getExecutionReport(item.executionId(), self.getExecutionReportSuccessFunction, self.getStatisticsReportErrorFunction );
				//	utpService.getStatisticsReport(item.executionId(), self.getStatisticsReportSuccessFunction, self.getStatisticsReportErrorFunction );
				};
				
				this.monitorProcess = function(result){
					var timeSeries = [];
					var variableSeries = [];
					var monitorMap = new Map();
					
					var variableMap = new Map();
					var timeMap = new Map();
					for(var i=0; i< result.length;i++){
						var data = result[i];
						
						var timeResult = timeMap.get(data.createdTime);
						if(!timeResult){
							timeMap.set(data.createdTime, data.createdTime);
							timeSeries.push(data.createdTime);
						}
						
						var monitorVariable = JSON.parse(data.jsonData);						
						if(data.dataType === 'string'){							
							var variableResult = variableMap.get(monitorVariable.name);
							if(!variableResult){
								variableMap.set(monitorVariable.name, monitorVariable.name);
								variableSeries.push(monitorVariable.name);
							}				
							var variable = monitorMap.get(data.createdTime);
							if(!variable)
								variable = [];
							variable.push({
								name: monitorVariable.name,
								value: monitorVariable.value
							});
							monitorMap.set(data.createdTime, variable);
						}
						if(data.dataType === 'array'){
							for(var j=0;j<monitorVariable.length;j++){								
								var variableResult = variableMap.get(monitorVariable[j].name);
								if(!variableResult){
									variableMap.set(monitorVariable.name[j], monitorVariable[j].name);
									variableSeries.push(monitorVariable[j].name);
								}															
								var variable = monitorMap.get(data.createdTime);
								if(!variable)
									variable = [];
								variable.push({
									name: monitorVariable[j].name, 
									value: monitorVariable[j].value});
								monitorMap.set(data.createdTime, variable);
							}
						}
					}
					timeSeries = timeSeries.sort(function(a, b){
						var dateA = new Date(a);
						var dateB = new Date(b);
						return dateA - dateB;
					});
					
					var monitorDataList = [];					
					for(var i=0; i<timeSeries.length;i++){
						var timeData = monitorMap.get(timeSeries[i]);
						if(timeData){
							var monitorData = [];
							monitorData.push(timeSeries[i]);
							for(var j=0;j < variableSeries.length;j++){
								var variableValue = self.getVariableValue(variableSeries[j], timeData);
								monitorData.push(variableValue);
							}
							monitorDataList.push(monitorData);
						}
					}
					return {timeSeries, variableSeries,  monitorDataList} ;
				};
				
				this.getVariableValue = function(variable, results){
					for(var i=0; i<results.length;i++){
						if(results[i].name == variable)
							return results[i].value;
					}
					return '';
				};
				
				this.generateMonitorExcel = function(variableSeries, monitorDataList){
					var excelTitle = [];
					excelTitle.push([1,1,"time",""]);
					
					for(var i=1; i<= variableSeries.length;i++)
						excelTitle.push([1,1 + i,variableSeries[i - 1],""]);
					
					var excelReport = {
							"conditions": [],
							"styles": [],
							"spans": [],
							"ranges": [],
							"sizes": [],
							"table": {"frozenColumns": 0,"frozenRows": 0,"gridlines": 1,"headers": 1},
							"data": [],
							"locked": [],
							"editors": [],
							"filters": [],
							"formats": [],
							"comments": [],
							"spans": []
						}
					self.spreadSheet = null;
					excelReport.data = excelTitle;
					var line = 1;
					for(var j=0;j<monitorDataList.length;j++){
						var lineData = monitorDataList[j];
						line++;
						for(var k=0; k< lineData.length;k++){
							excelReport.data.push([line, k + 1, lineData[k], ""]);
						}
					}
					
					if (self.spreadSheet)
            			self.spreadSheet.destructor();
            		self.spreadSheet = webix.ui({id:"monitorReport", view:"spreadsheet", data: excelReport});
            		
        	        webix.toExcel("monitorReport", {filename: "monitorReport", spans:true});
        	        self.spreadSheet.destructor();
        	        self.spreadSheet = null;
				}
				
				this.getMonitorDataSuccessFunction = function(data){					
					if(data != null && data.status === 1){
						if(data.result && data.result.length > 0){
							var result = self.monitorProcess(data.result);
							self.generateMonitorExcel(result.variableSeries, result.monitorDataList );
						}
						else
							notificationService.showInfo('指标数据不存在');
					}
					else
						self.getMonitorDataErrorFunction();
				};
				
				this.getMonitorDataErrorFunction = function(error){
					notificationService.showError('获取指标数据失败');
				};
				
				this.fetchMonitorData = function(item){
					utpService.getMonitorData(item.executionId(), 0, self.getMonitorDataSuccessFunction, self.getMonitorDataErrorFunction);
				};
				
				this.fetchTraceReportDataSuccessFunction = function(data){
					if(data != null && data.status === 1){
						var result = data.result;
						if(result == null){
							notificationService.showError('报表数据不存在');
							$.unblockUI();
							return;
						}
						if(result.reportPath == null){
							notificationService.showInfo('报表数据不存在');
							$.unblockUI();
							return;
						}
						var a = document.createElement("a");
						a.download = result.fileName;
						a.href = result.reportPath;
						$("body").append(a);
						a.click();
					}
					else
						notificationService.showError('获取报表失败');
					$.unblockUI();
				};
				
				this.fetchTraceReportDataErrorFunction = function(error){
					notificationService.showError('获取报表失败');
				};
				
				this.fetchTraceReportData = function(item){
					utpService.getExecutionRequirementTrace(item.executionId(), self.fetchTraceReportDataSuccessFunction, self.fetchTraceReportDataErrorFunction );
				};
				
				this.fetchSummaryReportDataSuccessFunction = function(data){
					//data ={"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","executionStartTime":"2019-06-16 09:00","executionEndTime":"2019-06-16 09:01","executionPeriod":"0 hours : 0 minutes : 39 seconds\r\n","executedByUserId":"test@macrosoftsys.com","targetTestsetName":"测试集1","executionName":"test","passedScripts":[],"failedScripts":[{"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","scriptId":769,"scriptName":"smoke test","startTime":"2019-06-16 09:01","result":"Fail"}],"unExecutedScripts":[],"executionResultList":[{"resultId":505496,"scriptId":769,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution TestCase Begin","executionTime":"2019-06-16 09:00:30","command":"smoke test","result":"Pass","errorMessage":null},{"resultId":505498,"scriptId":769,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution TestCase End","executionTime":"2019-06-16 09:01:06","command":"smoke test","result":"Fail","errorMessage":null},{"resultId":505499,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Exception Begin","executionTime":"2019-06-16 09:01:06","command":null,"result":"Pass","errorMessage":null},{"resultId":505500,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Exception End","executionTime":"2019-06-16 09:01:07","command":null,"result":"Pass","errorMessage":null},{"resultId":505501,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution End","executionTime":"2019-06-16 09:01:07","command":null,"result":"Pass","errorMessage":null}]};
					if(data != null && data.status === 1){
						var result = data.result;
						var expectedResultList = self.initDetailCheckpointAndtestcase(result);
						// var expectedResultList = self.initDetailData(result.executionResultList, true);
						if(self.onlineSummaryReport)
							self.generateOnlineReport(expectedResultList, result);
						else
							self.generateOfflineReport(expectedResultList, result);
					}
					else
						notificationService.showError('获取报表失败');
					$.unblockUI();
				};
							
				this.initDetailCheckpointAndtestcase = function (result) {
					var checkpointList = result.executionCheckPoints
					var failedScripts = result.failedScripts;
					var passedScripts = result.passedScripts;
					var unExecutedScripts = result.unExecutedScripts;
					var expectedResultList = [];
					for (var i = 0; i < passedScripts.length; i++) {
						var testcase = new Object();
						testcase.step = "测试用例 ";
						testcase.stepName = passedScripts[i].scriptName + "(系统Id:" + passedScripts[i].scriptId + ")";
						testcase.time = passedScripts[i].startTime+ " - " + passedScripts[i].endTime;
						testcase.begin = passedScripts[i].executionResultStartId;
						testcase.end = passedScripts[i].executionResultEndId;
						testcase.result = passedScripts[i].result;
						testcase.type = 'testcase';
						expectedResultList.push(testcase);
					}
					for (var i = 0; i < failedScripts.length; i++) {
						var testcase = new Object();
						testcase.step = "测试用例 ";
						testcase.stepName = failedScripts[i].scriptName + "(系统Id:" + failedScripts[i].scriptId + ")";
						testcase.time = failedScripts[i].startTime+ " - " + failedScripts[i].endTime;
						testcase.begin = failedScripts[i].executionResultStartId;
						testcase.end = failedScripts[i].executionResultEndId;
						testcase.result = failedScripts[i].result;
						testcase.type = 'testcase';
						expectedResultList.push(testcase);
					}
					for (var i = 0; i < unExecutedScripts.length; i++) {
						var testcase = new Object();
						testcase.step = "测试用例 ";
						testcase.stepName = unExecutedScripts[i].scriptName + "(系统Id:" + unExecutedScripts[i].scriptId + ")";
						testcase.time = unExecutedScripts[i].startTime+ " - " + unExecutedScripts[i].endTime;
						testcase.begin = unExecutedScripts[i].executionResultStartId;
						testcase.end = unExecutedScripts[i].executionResultEndId;
						testcase.result = unExecutedScripts[i].result;
						testcase.type = 'testcase';
						expectedResultList.push(testcase);
					}
				
					for (var i = 0; i < checkpointList.length; i++) {
						var checkpoint = new Object();
						checkpoint.step = "检查点 ";
						checkpoint.checkpointId = checkpointList[i].id;
						checkpoint.stepName = checkpointList[i].checkPointName;
						checkpoint.time = checkpointList[i].startTime + " - " + checkpointList[i].endTime;
						checkpoint.result = checkpointList[i].result;
						checkpoint.type = 'checkpoint';
						checkpoint.begin = checkpointList[i].executionResultStartId;
						checkpoint.end = checkpointList[i].executionResultEndId;
						checkpoint.manualDecisionLevel = checkpointList[i].manualDecisionLevel;
						expectedResultList.push(checkpoint);
					}
					return expectedResultList;
				};
				this.fetchSummaryReportDataErrorFunction = function(error){				
					$.unblockUI();
					notificationService.showError('获取报表失败');
				};
				
				this.fetchSummaryReportData = function(item){
					$.blockUI(utilityService.template);
					self.selectExecution = item;
					utpService.getStatisticsSummaryReport(item.executionId(), self.fetchSummaryReportDataSuccessFunction, self.fetchSummaryReportDataErrorFunction );
				};
				this.viewExecutionResultDetail=function(item){
					self.executionManager.newExecutionFlag(false);
					self.executionManager.isHistory(true);
					self.executionManager.setSelectedExecutionId(item.executionId());
					viewManager.testenvironmentActivePage('app/viewmodels/execution');
				};

				this.fetchOnlineSummaryReportData = function(item){
					self.onlineSummaryReport = true;
					self.fetchSummaryReportData(item);
				};
				
				this.fetchOfflineSummaryReportData = function(item){
					self.onlineSummaryReport = false;
					self.fetchSummaryReportData(item);
				};
				
				this.deleteReport = function(){
					if(self.singleReportRemove)
						utpService.deleteExecutionResultById(self.selectExecution.executionId(), 
								function(data){
									if (data && data.status === 1 && data.result) {
										self.observableData.remove(self.selectExecution);
										notificationService.showSuccess('删除报告成功');								
									}
									else
										notificationService.showError('删除报告失败');									
								}, 
								function(){
									notificationService.showError('删除报告失败');
								});
					else
						utpService.deleteExecutionResultByPeriod(selectionManager.selectedProject().id, self.reportRemoveCondition.begin(), self.reportRemoveCondition.end(),
								function(data){
									if (data && data.status === 1 && data.result) {
										notificationService.showSuccess('删除报告成功');	
										self.getReports();	
									}
									else
										notificationService.showError('删除报告失败');
								}, 
								function(){
									notificationService.showError('删除报告失败');
								});
					self.singleReportRemove = true;
				}
				
				this.reportRemoveCondition = {						
					begin : ko.observable(''),
					end : ko.observable(''),								
				};

				this.reportFilterCondition = {						
					begin : ko.observable(''),
					end : ko.observable(''),								
				};

				this.initReportFilterData = function(){			
					self.reportFilterCondition.begin(self.reportService.previousDate.getFullYear() + "-" + (self.reportService.previousDate.getMonth()+1) + "-" + self.reportService.previousDate.getDate()); 
					self.reportFilterCondition.end(self.reportService.nowDate.getFullYear() + "-" + (self.reportService.nowDate.getMonth()+1) + "-" + self.reportService.nowDate.getDate());
					
				};

				this.initReportRemoveData = function(){			
					self.reportRemoveCondition.begin(self.reportService.previousDate.getFullYear() + "-" + (self.reportService.previousDate.getMonth()+1) + "-" + self.reportService.previousDate.getDate()); 
					self.reportRemoveCondition.end(self.reportService.nowDate.getFullYear() + "-" + (self.reportService.nowDate.getMonth()+1) + "-" + self.reportService.nowDate.getDate());
					
				};

				this.removeReportSetting = function(){
					$('#reportRemoveConditionSettingModal' + self.pageId()).modal('show');
				}

				this.removePeriodReport = function(){
					var begin = new Date(self.reportRemoveCondition.begin());
					var end = new Date(self.reportRemoveCondition.end());
					if(begin > end){
						notificationService.showWarn('开始时间' + self.reportRemoveCondition.begin() + '不能晚于结束时间' + self.reportRemoveCondition.end());
						return;
					}
					$('#reportRemoveConditionSettingModal' + self.pageId()).modal('hide');
					self.singleReportRemove = false;
					self.removeReport();
				};

				this.removeReport = function(item){
					if(self.singleReportRemove)
						self.selectExecution = item;
					$('#deleteReportModal' + self.pageId()).modal('show');					
				}
				
				this.filterReport = function(){
					self.currentTestsetId = self.selectedTestset() == null ? '' : self.selectedTestset().id();
					self.currentUserId = self.selectedUser() == null ? '' : self.selectedUser();
					var begin = $("#filterBeginDate" + self.pageId()).data('datepicker').getFormattedDate('yyyy-mm-dd');
					// var begin = self.reportFilterCondition.begin() == null ? '' : self.reportFilterCondition.begin();
					var end = $("#filterEndDate" + self.pageId()).data('datepicker').getFormattedDate('yyyy-mm-dd');
					// var end = self.reportFilterCondition.end() == null ? '' : self.reportFilterCondition.end();
					if(begin != '' && end != ''){
						beginDate = new Date(begin);
						endDate = new Date(end);
						endDate.setDate(endDate.getDate() + 1);
						if(beginDate > endDate){
							notificationService.showWarn('开始时间' + begin + '不能晚于结束时间' + end);
							return;
						}
					}
					if(begin == '' || end == ''){
						begin ='';
						end = '';
					}
					
					$('#reportFilterConditionSettingModal' + self.pageId()).modal('hide');
					var condition = {
						domainId : $.cookie("orgId"),
						projectId: selectionManager.selectedProject().id, //  $.cookie("lastSelectedProject")
						testsetId: self.currentTestsetId,
						executedByUserId: self.currentUserId,
						executionTimeStartFrom: begin,
						executionTimeEndBy: endDate,
					}
					self.getTestReportByCondition(condition);		
				};

				this.filterReportConditionSetting = function(){
					self.selectedTestset(null);
					self.selectedUser(null);
					$('#reportFilterConditionSettingModal' + self.pageId()).modal('show');	
				};


				this.activate = function(activeData) {
					if(activeData.pageId)
						self.pageId(activeData.pageId)
					self.currentTestsetId = activeData.testsetId;
					self.currentTestsetName = activeData.testsetName;
					self.initReportFilterData();
					self.initReportRemoveData();
				};
				
				this.detached = function(view, parent){
				};
				
				this.drawPressureTestSummaryChart = function(seriesData){
					var min = max = seriesData()[0].millionSeconds();
					for(var i=1; i< seriesData().length;i++){
						if(seriesData()[i].millionSeconds() > max)
							max = seriesData()[i].millionSeconds();
						if(seriesData()[i].millionSeconds() < min)
							min = seriesData()[i].millionSeconds();
					}
					self.pressureTestSummaryChart.hideLoading();
					self.chartOptions = {
					    title: {
					        text: '并发实例执行时间',
					        subtext: self.pressureTestSummary.startTime() + " 到 " + self.pressureTestSummary.endTime(),
					    },
					    tooltip: {
					        trigger: 'axis',
					        axisPointer: { // 坐标轴指示器，坐标轴触发有效
					            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
					        },
					        formatter: function(params) {
					            return utilityService.formatMilliSecondToHourMinSecond(params[0].value)
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
					    xAxis: {
					        type: 'category',
					        boundaryGap: false,
					        data: seriesData().map(function (item) {
				                return item.runID();
				            }),
				            axisLabel : {
				                formatter: function (value, index) {
				                    return "运行" + (index + 1) + "\n" + value;
				                }
				            }
					    },
					    yAxis: {
					        type: 'value',
					        min: (min - 1000) < 0 ? 0 : (min - 1000),
		                    max: max + 1000,
					        axisLabel : {
				                formatter: function (value, index) {
				                    return utilityService.formatMilliSecondToHourMinSecond(value);
				                }
				            }
					    },
					    series: []
					};
					if (self.chartOptions && typeof self.chartOptions === "object") {
						var successTestCaseSeries = {
							name:'成功',
					        type:'line',
					        stack: '耗时',
					        data:seriesData().map(function (item) {
				                return item.millionSeconds();
				            })
			            };
						self.chartOptions.series.push(successTestCaseSeries);				
						self.chartOptions.legend.data = ["成功"];
						self.pressureTestSummaryChart.setOption(self.chartOptions, true);
					}
				};
				
				this.pressureTestGraphViewState = ko.observable(true);
				this.initPressureTestViewState = function(currentState){
					$('#pressureTestViewState' + self.pageId()).bootstrapSwitch("state", currentState);			
					$('#pressureTestViewState' + self.pageId()).on('switchChange.bootstrapSwitch', function (event, state) {
						self.pressureTestGraphViewState(state);
			        });
				}; 
				
				this.popoverTemplate = ko.observable('bitTablePopoverTemplate');

				// The data-binding shall happen after DOM element be attached.
				this.attached = function(view, parent) {
					var featureConfigValues = self.systemConfig.getConfigValuesByFeatureName('utpclient.report_mgr');
					if(self.viewManager.pageData.length==1&&self.viewManager.pageData[0]=='utpclient.report_mgr'){
						viewManager.testreportActivePage('app/viewmodels/testreport');
					}else if (featureConfigValues != null) {
						var configValuesObj = JSON.parse(featureConfigValues);
						//判断configValuesObj对象中是否含有main属性
						if (configValuesObj.hasOwnProperty('main')) {
							//获取main属性的值
							var mainValueBoole = configValuesObj['main'];
							if (mainValueBoole) {
								viewManager.testreportActivePage('app/viewmodels/testreport');
							}
						}
					}
					self.getTestSetByProject();
					self.getReports();
					$('#reportRemoveConditionSettingModal' + self.pageId()).on('shown.bs.modal', function(e) {
						//	self.initReportRemoveData();
						$('#removeBeginDate' + self.pageId()).datepicker({
							format: "yyyy-mm-dd",
							autoclose: true,
							todayHighlight: true,
							language: "zh-CN"
							});
						$('#removeEndDate' + self.pageId()).datepicker({
							format: "yyyy-mm-dd",
							autoclose: true,
							todayHighlight: true,
							language: "zh-CN"
							});
						});
					$('#reportFilterConditionSettingModal' + self.pageId()).on('shown.bs.modal', function(e) {
						//	self.initReportFilterData();
						$('#filterBeginDate' + self.pageId()).datepicker({
							format: "yyyy-mm-dd",
							autoclose: true,
							todayHighlight: true,
							clearBtn: true,
							language: "zh-CN"
						});
						
						$('#filterEndDate' + self.pageId()).datepicker({
							format: "yyyy-mm-dd",
							autoclose: true,
							todayHighlight: true,
							clearBtn: true,
							language: "zh-CN"
						});
					});
					$('#protocolCompareModal' + self.pageId()).on('shown.bs.modal', function(e) {
						self.showProtocolCompare(e.relatedTarget.data.jsonLeft, e.relatedTarget.data.jsonRight);
					});
					$('#staticModal' + self.pageId()).on('shown.bs.modal', function() {						
						$.blockUI(utilityService.template);
						setTimeout(function () {
							$('#reportDetailInfo' + self.pageId()).html('');
							self.initTable();
							self.initChart();
							$.unblockUI();
				         }, 500);					
					});
					$('#staticModal' + self.pageId()).on('hidden.bs.modal', function () {
						self.executionChart.clear();
						self.executionChart.dispose();
					});
					$('#pressureTestSummaryReportModal' + self.pageId()).on('shown.bs.modal', function() {
						setTimeout(function () {
							$('#pressureTestSummaryChart' + self.pageId()).html('');
							self.initPressureTestViewState(true);
							var dom = document.getElementById('pressureTestSummaryChart' + self.pageId());
							self.pressureTestSummaryChart = echarts.init(dom);
							self.pressureTestSummaryChart.showLoading({
								text: "数据正在努力加载..."
							});
							self.drawPressureTestSummaryChart(self.pressureTestSummaryData);
				         }, 500);					
					});
					$('#pressureTestSummaryReportModal' + self.pageId()).on('hidden.bs.modal', function () {
						if(self.pressureTestSummaryChart){
							self.pressureTestSummaryChart.clear();
							self.pressureTestSummaryChart.dispose();
						}
					});
					$('#pressureTestCmdRunTimesReportModalTest' + self.pageId()).on('shown.bs.modal', function() {
						setTimeout(function () {
							$('#pressureTestCmdRunTimesContainer').html('');
							webix.ui({
							    view:"datatable",
							    container:"pressureTestCmdRunTimesContainer",
							    columns:[
							        { id:"runID", header:"runID"},
							        { id:"timeMs", header:"timeMs"},
							        {
							            id:"timeMs",
							            template:"{common.sparklines()}",
							            tooltip: function(obj, common, value, index){
							                if (!value)
							                    return "";
							                return value;
							            }
							        }
							    ],
							    autoheight:true,
							    autowidth:true,
							    tooltip: true,
							    data: self.pressureTestCmdRunTimes
							});
				         }, 500);					
					});
				};
			}
			return executionReportViewModel;
		});
