define(['jquery', 'durandal/plugins/http', 'komapping', 'services/executionManager', 'services/projectManager', 'services/protocolService', 'services/loginManager', 'services/selectionManager', 'services/viewManager',
	'services/ursService', 'services/utpService', 'services/cmdConvertService', 'services/notificationService', 'services/utilityService', 'jsoneditor', 'blockUI', 'bootstrapSwitch', 'knockout', 'knockout-sortable', 'knockstrap'],
	function ($, $http, komapping, executionManager, projectManager, protocolService, loginManager, selectionManager, viewManager, ursService, utpService, cmdConvertService, notificationService, utilityService, JSONEditor, blockUI, bootstrapSwitch, ko, sortable, knockstrap) {

		function MonitorTestSetRunViewModel() {
			var self = this;
			this.selectionManager = selectionManager;
			this.viewManager = viewManager;
			this.projectManager = projectManager;
			this.cmdConvertService = cmdConvertService;
			this.lastestCaseNode = null;
			this.lastResultId = 0;
			this.executionCallbackRegisted = false;
			this.executionId = 0;
			this.resultRetrieveBegin = false;
			this.executeState = ko.observable(executionManager.notStarted);
			this.executeStateNotification = ko.observable('');
			this.busyPropInfo = ko.observable('');
			this.errorPropInfo = ko.observable('');
			this.runResultPropInfo = ko.observable('');
			this.executionName = ko.observable('');
			this.selectedProject = ko.observable();

			this.targetEngineCandidates = ko.observableArray([]);
			this.selectTargetEngineId = ko.observable();
			this.triggerStop = true;
			this.monitorIsRunning = ko.observable(false)
			this.deactive = false;
			this.preExecutionStatusFetchingCount = 3;

			this.genericRawFrame = ko.observable('');
			this.genericErrorFrameData = ko.observable(false);
			this.genericRecordContent = ko.observable('');
			this.genericDetailEnabled = ko.observable(false)
			this.monitorDataMapping = new Map();
			this.websocketAddress = ko.observable('');
			this.transformConfigData=[{
				"dataType": "monitoringexecutiondetail",
				"transparentData": "entrepotSaveDatabase"
			}];
			this.saveData = ko.observable(0);
			this.getTransformConfigData=function(saveType) {
				const configData = {
					noEntrepotSave: [
						{ "dataType": "monitoringexecutiondetail", "transparentData": "NoEntrepotSaveDatabase" }
					],
					entrepotSave: [
						{ "dataType": "monitoringexecutiondetail", "transparentData": "entrepotSaveDatabase" }
					],
					entrepotNoSave: [
						{ "dataType": "monitoringexecutiondetail", "transparentData": "entrepotNoSaveDatabase" }
					]
				};
				return configData[saveType];
			}
			this.customMaxResult = ko.observable(cmdConvertService.monotorDataMaxResult)
			self.customMaxResult.subscribe(function (newValue) {
				if (newValue < 10) {
					self.customMaxResult(10)
					newValue = self.customMaxResult()
				}
			});

			this.getFieldStorageDataSuccessFunction = function (data) {
				if (data && data.status === 1) {
					result = JSON.parse(data.result);
					var fieldValues = result.fieldValues;
					var fieldSizes = result.fieldSizes;
					var rawFrame = result.rawFrame;
					self.genericRawFrame(rawFrame);
					if (self.currentBigDataFrameConfig) {
						var bigData = protocolService.getBigData(self.currentBigDataFrameConfig.bigDataId);
						if (bigData) {
							var messageName = bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].message;
							bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].fieldValues = fieldValues;
							bigData.data.genericBusFrameDatas[self.currentBigDataFrameConfig.index].rawFrame = rawFrame;
							self.currentBigDataFrameConfig.fieldValues = fieldValues;
							self.showFormatGenericDetail(bigData.data.busInterfaceDefID, messageName, fieldValues, fieldSizes);
						}
					}
				}
				else
					self.getFieldStorageDataErrorFunction();
			};

			this.getFieldStorageDataErrorFunction = function () {
				notificationService.showError('获取字段数据失败！');
			};

			this.disableGenericDetailInfo = function () {
				self.genericErrorFrameData(false);
				self.genericRawFrame("");
				$('#monitorTestSetRunFrameInfoConfigView').html('');
			};

			this.displayReportConfig = function (protocolId, messageName, genericRecordContent, fieldValues, fieldSizes) {
				$('#monitorTestSetRunFrameInfoModal').modal('show')
				const container = document.getElementById('monitorTestSetRunFrameInfoConfigView');
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
							if (interval) {
								var rawFrame = self.genericRawFrame();
								rawFrame = rawFrame.replace("<div style='color:#FF0000';>", "").replace("</div>", "");
								var start = interval.start / 4;
								var end = interval.end / 4;
								rawFrame = rawFrame.slice(0, start) + "<div style='color:#FF0000';>" + rawFrame.slice(start, end) + "</div>" + rawFrame.slice(end);
								self.genericRawFrame(rawFrame);
							}
						}
					}
				}
				self.editor = new JSONEditor(container, options, genericRecordContent);
			};

			this.showFormatGenericDetail = function (busInterfaceDefID, messageName, fieldValues, fieldSizes) {
				var fields = protocolService.bigDataFieldAnalysis(busInterfaceDefID, messageName, fieldValues);
				if (fields) {
					self.genericRecordContent(JSON.parse(fields));
					self.genericErrorFrameData(false);
					self.displayReportConfig(busInterfaceDefID, messageName, self.genericRecordContent(), fieldValues, fieldSizes);
				}
				else {
					self.genericRecordContent(fieldValues);
					self.genericErrorFrameData(true);
					notificationService.showError("不满足协议定义,不能解析详细字段!");
				}
				self.genericDetailEnabled(true);
			};

			this.showGenericDetail = function (busInterfaceDefID, item) {
				var index = 0;
				self.currentBigDataFrameConfig = {
					fieldValues: '',
					protocolId: busInterfaceDefID,
					messageName: item.message,
					index: index,
				};
				self.disableGenericDetailInfo();
				// if(item.fieldSizes.length === 0 || item.rawFrame == null || item.rawFrame == undefined || item.rawFrame == ''){
				// 	utpService.getIndexBigDataById(self.currentBigDataFrameConfig.protocolId, self.currentBigDataFrameConfig.index, self.getFieldStorageDataSuccessFunction, self.getFieldStorageDataErrorFunction);
				// 	return;
				// }
				self.currentBigDataFrameConfig.fieldValues = item.fieldValues;
				self.genericRawFrame(item.rawFrame);
				self.showFormatGenericDetail(busInterfaceDefID, item.message, self.currentBigDataFrameConfig.fieldValues, item.fieldSizes);
			};

			this.getProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result)
					protocolService.addProtocol(data.result);
				else
					self.getProtocolErrorFunction();
			};

			this.getProtocolErrorFunction = function () {
				//notificationService.showError('获取数据失败。');
			};

			this.getProtocol = function (protocolId) {
				var protocol = protocolService.getProtocol(protocolId);
				if (protocol === null || protocol == undefined)
					utpService.getProtocol(protocolId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
			};

			this.initFrameList = function (config) {
				var monitorDataName = config.monitorDataName;
				var busInterfaceDefID = self.monitorDataArr.frameList[self.monitorDataArr.frameList.findIndex(fl => fl.monitorDataName === monitorDataName)].protocolId
				// self.getProtocol(busInterfaceDefID);
				var data = [];

				const myView = webix.$$(monitorDataName);

				if (myView) {
					self.clearRepeatElement(myView.$view.id)
				}

				var tableView = {
					view: "datatable",
					fixedRowHeight: false,
					id: monitorDataName,
					select: true,
					resizeColumn: true,
					height: 400,
					gravity: 2,
					columns: [
						{ id: "index", header: "序号", fillspace: 2, css: { "text-align": "center" } },
						{ id: "message", header: "消息名称", fillspace: 2, css: { "text-align": "center" } },
						{ 
							id: "receiveFrame", 
							header: "方向", 
							fillspace: 2,
							css: { "text-align": "center" },
							template: function (obj) {
								return obj.receiveFrame ? "接收" : "发送";
							}
						},
						{ id: "timestamp", header: "时间", fillspace: 2, css: { "text-align": "center" } },
						{ id: "rawFrame", header: "消息帧", fillspace: 2, css: { "text-align": "center" } },
						{
							id: "", header: "字段信息", fillspace: 2, css: { "text-align": "center" },
							template: function (item) {
								return "<span class='webix_icon fas fa-search-plus fieldInfo' style='cursor: pointer;'></span>"
							}
						}
					],
					data: {
						data: data
					},
					onClick: {
						"fieldInfo": function (event, cell, target) {
							var item = $$(monitorDataName).getItem(cell);
							if (item == null)
								return;
							self.showGenericDetail(self.monitorDataArr.frameList[self.monitorDataArr.frameList.findIndex(fl => fl.monitorDataName === monitorDataName)].protocolId, item);
						}
					}
				};
				$$("monitorDataCols").addView(tableView, 0);
				self.monitorDataMapping.set(monitorDataName, tableView);
				return tableView;
			};

			this.initMultiSquareWave = function (config) {
				var charts = [];
				var monitorDataName = config.monitorDataName;
				var p = document.createElement('div');
				var bgColor = self.bgcStyle(config.id)
				self.clearRepeatElement(monitorDataName + '_chart')
				p.setAttribute('id', monitorDataName + '_chart');
				p.setAttribute('style', 'width: 100%; height: 400px; border-bottom: 1px solid #e3e3e3; margin-top: 30px; background-color: ' + bgColor);
				$$("flexlayout").getNode().append(p);
				charts.push({
					id: monitorDataName + "_control",
					body: {
						view: "htmlform",
						content: monitorDataName + '_chart',
					},
					minWidth: 300,
					height: 400
				});
				var dom = document.getElementById(monitorDataName + '_chart');
				var myChart = echarts.init(dom);
				var option = {
					title: {
						text: monitorDataName,
						textStyle: {
							fontWeight: 'normal',
						},
						left: '10%',
						top: 'top'
					},
					toolbox: {
						feature: {
						//   dataView: { readOnly: false },
						  saveAsImage: {} // 这里是开启下载功能的配置项
						}
					},
					xAxis: {
						type: 'category',
						name: 'x',
						data: []
					},
					yAxis: {
						type: 'value',
						name: 'y',
						axisLabel: {
							formatter: '{value}'
						},
					},
					series: [],
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							animation: false
						}
					},
					axisPointer: {
						link: [
							{
								xAxisIndex: 'all'
							}
						]
					},
					legend: {
						data: []
					},
				};
				if (option && typeof option === "object")
					myChart.setOption(option, true);
				self.monitorDataMapping.set(monitorDataName, myChart);

				return charts;
			};
			this.initMultiWave = function (config) {
				var charts = [];
				var monitorDataName = config.monitorDataName;
				var p = document.createElement('div');
				var bgColor = self.bgcStyle(config.id)
				self.clearRepeatElement(monitorDataName + '_chart')
				p.setAttribute('id', monitorDataName + '_chart');
				// p.setAttribute('style', 'width: 100%; height: 400px; border-bottom: 1px solid #e3e3e3; margin-top: 30px; background-color: ' + bgColor);
				// $$("flexlayout").getNode().append(p);
					
				//判断是否是监控通道信号
				if (config.commandName =="StartMonitorTmpGroup") {
					p.setAttribute('style', 'width: 80%; height: 400px; border: 1px solid #e3e3e3; float: left;padding-top: 30px;background-color: ' + bgColor);
					$$("flexlayout").getNode().append(p);
					//通道信号节点
					var pRight = document.createElement('div');
					self.clearRepeatElement(monitorDataName + '_signalTmpChart')
					pRight.setAttribute('id', monitorDataName + '_signalTmpChart');
					pRight.setAttribute('style', 'width:18%; height: 400px;float: left;padding-top:30px;background-color: ' + bgColor);
					var pRightID = monitorDataName + '_signalTmpChart';
					//文字节点
					var SignalTextNode = document.createElement("small");
					SignalTextNode.setAttribute('style', 'height: 30px;;font-size: 150%;');
					SignalTextNode.innerHTML = '通道选择：';
					//通道信号下拉框节点
					var pRightSelect = document.createElement('select');
					pRightSelect.setAttribute('id', monitorDataName + '_signalTmpSelect');
					self.pRightSelectIdArr.push(monitorDataName + '_signalTmpSelect');
					pRightSelect.setAttribute('style', 'width:45%; height: 30px;margin-right: 8px;background-color: ' + bgColor);
					//按钮节点
					var addBtn = document.createElement("button");
					addBtn.setAttribute('id', monitorDataName+'_addBtn');
					addBtn.setAttribute('class', 'btn btn-primary');
					addBtn.innerHTML = '新增';
					//添加框节点
					var SignalTmpValueBox = document.createElement("div");
					SignalTmpValueBox.setAttribute('id',monitorDataName+'_SingnalTmpBox');
					//向flexlayout加入加节点
					$$("flexlayout").getNode().append(pRight);
					// 向节点pRightID加入子节点
					document.querySelector('#' + pRightID).appendChild(SignalTextNode);
					document.querySelector('#' + pRightID).appendChild(pRightSelect);
					document.querySelector('#' + pRightID).appendChild(addBtn);
					document.querySelector('#' + pRightID).appendChild(SignalTmpValueBox);
					//存放已经添加的值
					let signalTemGroupRepetition=[]; 
					//给添加按钮添加点击事件
					document.querySelector('#'+monitorDataName+'_addBtn').onclick = function () {
						//获取下拉框的值
						let singnalTmpvalue = document.querySelector('#'+monitorDataName + '_signalTmpSelect').value;
						//判断singnalTmpvalue是否为空
						if (singnalTmpvalue == ""||signalTemGroupRepetition.includes(singnalTmpvalue)){return;}
						//遍历已经添加的值,如果已经添加过,就不再添加
						for (var i = 0; i <signalTemGroupRepetition.length; i++) {
							if (signalTemGroupRepetition[i] == singnalTmpvalue)
								return;
						}
						//将singnalTmpvalue添加到数组中
						signalTemGroupRepetition.push(singnalTmpvalue);
						var signalTmpchannel = document.createElement("div");
						signalTmpchannel.setAttribute('style', 'width:100%;margin-top: 8px;text-align: center;');
						signalTmpchannel.innerHTML = `<small style="font-size: 120%;width:20%;">通道:</small><label style="font-size: 120%;width:50%;">${singnalTmpvalue}</label>&emsp;&emsp;<button class="btn btn-danger btn-sm">删除</button>`
						document.querySelector('#'+monitorDataName+'_SingnalTmpBox').appendChild(signalTmpchannel)
					}
					//给删除按钮添加点击事件
					document.querySelector('#'+monitorDataName+'_SingnalTmpBox').onclick = function (e) {
						if (e.target.nodeName == 'BUTTON') {
							//获取label的值
							let labelValue = e.target.parentNode.querySelector('label').innerText
							e.target.parentNode.remove()
							//从数组中删除
							for (var i = 0; i < signalTemGroupRepetition.length; i++) {
								if (signalTemGroupRepetition[i] == labelValue) {
									signalTemGroupRepetition.splice(i, 1);
									break;
								}
							}
							
						}
					}

				} else {
					p.setAttribute('style', 'width: 100%; height: 400px; border: 1px solid #e3e3e3; float: left;padding-top: 30px;background-color: ' + bgColor);
					$$("flexlayout").getNode().append(p);
				}
				
				
				charts.push({
					id: monitorDataName + "_control",
					body: {
						view: "htmlform",
						content: monitorDataName + '_chart',
					},
					minWidth: 300,
					height: 400
				});
				var dom = document.getElementById(monitorDataName + '_chart');
				var myChart = echarts.init(dom);
				var option = {
					title: {
						text: monitorDataName,
						textStyle: {
							fontWeight: 'normal',
						},
						left: '10%',
						top: 'top'
					},
					toolbox: {
						feature: {
						//   dataView: { readOnly: false },
						  saveAsImage: {} // 这里是开启下载功能的配置项
						}
					},
					xAxis: {
						type: 'category',
						name: 'x',
						data: []
					},
					yAxis: {
						type: 'value',
						name: 'y',
						axisLabel: {
							formatter: '{value}'
						},
					},
					series: [],
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							animation: false
						}
					},
					axisPointer: {
						link: [
							{
								xAxisIndex: 'all'
							}
						]
					},
					legend: {
						data: []
					},
				};

				if (option && typeof option === "object")
					myChart.setOption(option, true);
				self.monitorDataMapping.set(monitorDataName, myChart);
				return charts;
			};

			this.initOneSquareWave = function (config) {
				var monitorDataName = config.monitorDataName;
				var p = document.createElement('div');
				var bgColor = self.bgcStyle(config.id)
				self.clearRepeatElement(monitorDataName + '_chart')
				p.setAttribute('id', monitorDataName + '_chart');
				p.setAttribute('style', 'width: 100%; height: 400px; border-bottom: 1px solid #e3e3e3; margin-top: 30px; background-color: ' + bgColor);
				$$("flexlayout").getNode().append(p);

				var dom = document.getElementById(monitorDataName + '_chart');
				var myChart = echarts.init(dom);
				var option = {
					title: {
						text: monitorDataName,
						textStyle: {
							fontWeight: 'normal',
						},
						left: '10%',
						top: 'top'
					},
					toolbox: {
						feature: {
						//   dataView: { readOnly: false },
						  saveAsImage: {} // 这里是开启下载功能的配置项
						}
					},
					xAxis: {
						type: 'category',
						data: []
					},
					yAxis: {
						type: 'value',
						name: monitorDataName + '(' + config.data.xAxisUnit + ')',
						axisLabel: {
							formatter: '{value}'
						},
					},
					series: [
						{
							data: [],
							type: 'line',
							step: 'end',
							smooth: true
						}
					],
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							animation: false
						}
					},
					axisPointer: {
						link: [
							{
								xAxisIndex: 'all'
							}
						]
					},
				};

				if (option && typeof option === "object")
					myChart.setOption(option, true);
				self.monitorDataMapping.set(monitorDataName, myChart);

				return {
					id: monitorDataName + "_control",
					body: {
						view: "htmlform",
						content: monitorDataName + '_chart',
					},
					minWidth: 300,
					height: 400
				}
			};
			this.pRightSelectIdArr=[];
			this.initOneWave = function (config) {
				var monitorDataName = config.monitorDataName;
				var p = document.createElement('div');
				self.clearRepeatElement(monitorDataName + '_chart')
				p.setAttribute('id', monitorDataName + '_chart');
				// var pid=monitorDataName + '_chart'
				var bgColor = self.bgcStyle(config.id)
				var commandName = config.commandName;
				
				//判断是否是监控通道信号
				if (commandName == "StartMonitorChannel") {
					p.setAttribute('style', 'width: 80%; height: 400px; border: 1px solid #e3e3e3; float: left;padding-top: 30px;background-color: ' + bgColor);
					$$("flexlayout").getNode().append(p);
					//通道信号节点
					var pRight = document.createElement('div');
					self.clearRepeatElement(monitorDataName + '_signalChart')
					pRight.setAttribute('id', monitorDataName + '_signalChart');
					pRight.setAttribute('style', 'width:18%; height: 400px;float: left;padding-top:30px;background-color: ' + bgColor);
					var pRightID = monitorDataName + '_signalChart';
					//文字节点
					var SignalTextNode = document.createElement("div");
					SignalTextNode.innerHTML = `<small style="width:40%; height: 30px;;font-size: 150%;">通道选择:</small>`

					//通道信号下拉框节点
					var pRightSelect = document.createElement('select');
					pRightSelect.setAttribute('id', monitorDataName + '_signalSelect');
					self.pRightSelectIdArr.push(monitorDataName + '_signalSelect');
					pRightSelect.setAttribute('style', 'width:65%; height: 30px;background-color: ' + bgColor);
					//向flexlayout加入加节点
					$$("flexlayout").getNode().append(pRight);
					document.querySelector('#' + pRightID).appendChild(SignalTextNode);
					document.querySelector('#' + pRightID).appendChild(pRightSelect);
				} else {
					p.setAttribute('style', 'width: 100%; height: 400px; border: 1px solid #e3e3e3; float: left;padding-top: 30px;background-color: ' + bgColor);
					$$("flexlayout").getNode().append(p);
				}

				var dom = document.getElementById(monitorDataName + '_chart');
				var myChart = echarts.init(dom);
				var option = {
					title: {
						text: monitorDataName,
						textStyle: {
							fontWeight: 'normal',
						},
						left: '10%',
						top: 'top',
					},
					toolbox: {
						feature: {
							// dataView: { readOnly: false },
							saveAsImage: {} // 这里是开启下载功能的配置项
						}
					},
					xAxis: {
						type: 'value',
						name: '(' + config.data.xAxisUnit + ')',
						// data: []
					},
					yAxis: {
						type: 'value',
						name: config.data.yAxisName + '(' + config.data.yAxisUnit + ')',
					},
					series: [
						{
							data: [],
							type: 'line',
							smooth: true
						}
					],
					tooltip: {
						trigger: 'axis',
						axisPointer: {
							animation: false
						}
					},
					axisPointer: {
						link: [
							{
								xAxisIndex: 'all'
							}
						]
					},
					dataZoom: [
						{
							type: 'inside', // 支持鼠标滚轮缩放
							xAxisIndex: 0, // 对第一个 x 轴生效
							start: 0, // 数据窗口范围的起始百分比
							end: 100 // 数据窗口范围的结束百分比
						},
						{
							type: 'slider', // 支持拖动缩放
							xAxisIndex: 0, // 对第一个 x 轴生效
							start: 0, // 数据窗口范围的起始百分比
							end: 100 // 数据窗口范围的结束百分比
						}
					]
				};

				self.monitorDataMapping.set(monitorDataName, myChart);
				if (option && typeof option === "object") {
					myChart.setOption(option, true);
				}
				return {
					id: monitorDataName + "_control",
					body: {
						view: "htmlform",
						content: monitorDataName + '_chart',
					},
					minWidth: 300,
					height: 400
				}

			};

			this.clearRepeatElement = function (elementId) {
				var clearRepeat = document.getElementById(elementId)
				if (clearRepeat)
					clearRepeat.parentNode.removeChild(clearRepeat);
				return
			}
			this.bgcStyle = function (x) {
				if (x % 2 == 0)
					return "#f4f4f4"
				return "#fff"
			}

			this.setOneSeriesData = function (config, clear) {
				var monitorDataName = config.monitorDataName;
				var myChart = self.monitorDataMapping.get(monitorDataName);
				if (myChart == null || myChart == undefined) return;
				var option = myChart.getOption();
				option.xAxis[0].name = config.data.xAxisUnit != null && config.data.xAxisUnit.length > 0 ? "(" + config.data.xAxisUnit + ")" : 'x'
				option.yAxis[0].name = config.data.yAxisUnit != null && config.data.yAxisUnit.length > 0 ? "(" + config.data.yAxisUnit + ")" : 'y'
				if (clear) {
					option.xAxis[0].data = []
					option.yAxis[0].data = []
					option.series[0].data = []
					myChart.setOption(option);
					return
				}
				//获取x的值
				var data = option.series[0].data;
				if (config.data.xAxisData.length == 0) {
					for (let i = 0; i < config.data.yAxisData.length; i++){
						let xtemp=config.data.xAxisStepVal
						let ytemp=config.data.yAxisData[i]
						//获取data中最后一个值
						if (data.length > 0) {
							let lastData = data[data.length - 1]
							//获取最后一个值的x
							let lastx = lastData[0]
							//对x轴值进行叠加
							xtemp += lastx
						}
						data.push([xtemp,ytemp])
					}
				}else{
					for (let i = 0; i < config.data.xAxisData.length; i++){
						let xtemp=config.data.xAxisData[i]
						let ytemp=config.data.yAxisData[i]
						//获取data中最后一个值
						if (data.length > 0) {
							let lastData = data[data.length - 1]
							//获取最后一个值的x
							let lastx = lastData[0]
							//对x轴值进行叠加
							xtemp += lastx
						}
						data.push([xtemp,ytemp])
					}
				}
					

				if (self.isRestart) {
					option.series[0].data = [];
					option.xAxis[0].data = []
				} else {
					// data = data.concat(config.data.yAxisData);
					if (data.length > self.customMaxResult() && !self.projectManager.isMonitoringResult) {
						data = data.slice(-self.customMaxResult());
						option.xAxis[0].data = option.xAxis[0].data.slice(-self.customMaxResult());
					}
					option.series[0].data = data;
				}
				myChart.setOption(option);
				if (self.projectManager.isMonitoringResult) {
					var slideOption = {
						dataZoom: [
							{
								show: true,
								realtime: true,
								startValue: 0,
								endValue: 30,
							}
						],
						toolbox: {
							feature: {
								dataZoom: {
									yAxisIndex: 'none'
								},
								restore: {},
								saveAsImage: {}
							}
						},
					}
					myChart.setOption(slideOption);
				}
			};

			this.multipleWaveIsFirstLoad = false
			this.setMultipleSeriesData = function (config, clear) {
				var monitorDataName = config.monitorDataName;
				var myChart = self.monitorDataMapping.get(monitorDataName);
				if (myChart == null || myChart == undefined) return;
				var option = myChart.getOption();
				option.xAxis[0].name = config.data.xAxisUnit != null && config.data.xAxisUnit.length > 0 ? "(" + config.data.xAxisUnit + ")" : 'x'

				if (clear || self.multipleWaveIsFirstLoad) {
					option.series = []
					option.legend.data = []
					for (var i = 0; i < config.data.yAxes.length; i++) {
						var yInstance = config.data.yAxes[i];
						var seriesOptions = {
							name: '',
							data: [],
							type: 'line',
							smooth: true
						}
						if (config.monitorDataType == 'MultiSquareWave')
							seriesOptions.step = 'end'
						seriesOptions.name = yInstance.yAxisName != undefined && yInstance.yAxisName != null && yInstance.yAxisName.trim() != '' ? "(" + yInstance.yAxisName + ")" : '未命名-' + i
						option.series.push(seriesOptions)
						option.legend[0].data.push(seriesOptions.name)
						if (option.xAxis[i])
							option.xAxis[i].data = []
						if (option.yAxis[i])
							option.yAxis[i].data = []
					}
					myChart.setOption(option);
					self.multipleWaveIsFirstLoad = false
					return
				}

				if (config.data.xAxisData.length == 0) {
					let j = 0, n = 0;
					if (option.xAxis[0].data.length > 0)
						n = option.xAxis[0].data[option.xAxis[0].data.length - 1]
					while (j < config.data.yAxes[0].yAxisData.length) {
						option.xAxis[0].data.push(n)
						j++
						n++
					}
				}
				else
					for (let i = 0; i < config.data.xAxisData.length; i++)
						option.xAxis[0].data.push(config.data.xAxisData[i])

				for (var i = 0; i < config.data.yAxes.length; i++) {
					var yInstance = config.data.yAxes[i];
					var data = option.series[i].data;
					if (self.isRestart) {
						option.series[i].data = yInstance.yAxisData;
						option.xAxis[0].data = []
					} else {
						data = data.concat(yInstance.yAxisData);

						if (data.length > self.customMaxResult() && !self.projectManager.isMonitoringResult) {
							data = data.slice(-self.customMaxResult());
							option.xAxis[0].data = option.xAxis[0].data.slice(-self.customMaxResult());
						}
						option.series[i].data = data;
					}
				}

				myChart.setOption(option);
				if (self.projectManager.isMonitoringResult) {
					var slideOption = {
						dataZoom: [
							{
								show: true,
								realtime: true,
								startValue: 0,
								endValue: 30,
							}
						],
						toolbox: {
							feature: {
								dataZoom: {
									yAxisIndex: 'none'
								},
								restore: {},
								saveAsImage: {}
							}
						},
					}
					myChart.setOption(slideOption);
				}

			};
			this.totalEntries = 0; // 在 ViewModel 中添加一个全局计数器

			this.setFrameData = function (config, clear) {
				var monitorDataName = config.monitorDataName;
				var frameListView = $$(monitorDataName);
				var myTable = self.monitorDataMapping.get(monitorDataName);
				if (myTable == null || myTable == undefined) return;
				if (clear) {
					frameListView.clearAll();
					frameListView.refresh();
					self.totalEntries = 0; // 清除时重置计数器
					return;
				}
				if (self.isRestart) {
					var total = frameListView.count();
					for (var i = 0; i < total; i++) {
						frameListView.remove(frameListView.getLastId());
					}
					frameListView.refresh();
				} else {
					if (config.data != null && config.data.length > 0) {
						for (let j = 0; j < config.data.length; j++) {
							self.totalEntries++;
							config.data[j].index = self.totalEntries;
							frameListView.add(config.data[j], 0);
						}
						var total = frameListView.count();
						if (total > self.customMaxResult() && !self.projectManager.isMonitoringResult) {
							for (var i = self.customMaxResult(); i < total; i++) {
								frameListView.remove(frameListView.getLastId());
							}
						}
						frameListView.refresh();
					}
				}
			};
			this.selectFrameList = ''
			this.beforeFrameList = ''
			this.frameListChanged = function () {
				if (self.selectFrameList != self.beforeFrameList && self.selectFrameList != '' && self.beforeFrameList != '') {
					if($$(self.beforeFrameList)){
						$$(self.beforeFrameList).hide()
					}
					//判断是否存在$$(self.selectFrameList)节点
					if($$(self.selectFrameList)){
						$$(self.selectFrameList).show()
					}
					self.beforeFrameList = self.selectFrameList
				}
			}
			this.initDataTrendDiagram = function (dataResult) {
				for (var i = 0; i < dataResult.frameList.length; i++) {
					var charts = null;
					if (dataResult.frameList[i].monitorDataType === 'FrameList') {
						charts = self.initFrameList(dataResult.frameList[i]);
						//self.setFrameData(dataResult.frameList[i], true);
					}
					if (i < 1) {
						self.selectFrameList = dataResult.frameList[i].monitorDataName
					}
					else
						$$(dataResult.frameList[i].monitorDataName).hide()
				}
				//清空pRightSelectIdArr
				self.pRightSelectIdArr=[];
				for (var i = 0; i < dataResult.wave.length; i++) {
					if (i == 0) {
						var dataview = {
							margin: 10, padding: 10, type: "wide",
							view: "dataview",
							id: "flexlayout",
							gravity: 3
						}
						$$("monitorDataCols").addView(dataview, 2);
					}
					var charts = null;
					if (dataResult.wave[i].monitorDataType === 'OneWave')
						charts = self.initOneWave(dataResult.wave[i]);
					if (dataResult.wave[i].monitorDataType === 'OneSquareWave')
						charts = self.initOneSquareWave(dataResult.wave[i]);
					if (dataResult.wave[i].monitorDataType === 'MultiWave')
						charts = self.initMultiWave(dataResult.wave[i]);
					if (dataResult.wave[i].monitorDataType === 'MultiSquareWave')
						charts = self.initMultiSquareWave(dataResult.wave[i]);
				}
				webix.ui.fullScreen();
				if (self.projectManager.isMonitoringResult) {
					utpService.getMonitoringExecutionDetailByExecutionId(self.viewManager.selectedMonitorExecution().executionId, 0, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
				}
			};

			this.isRestart = false
			this.cleanData = function () {
				self.isRestart = true
				if (self.monitorTypeArr != null) {
					self.monitorDataArr = {
						frameList: [],
						wave: []
					}
					if (self.frameListArr() != null && self.frameListArr().length > 0)
						self.frameListArr = ko.observableArray([])
					let n = 0, m = 0
					for (let i = 0; i < self.monitorTypeArr.length; i++) {
						let data = null
						data = self.initDiagramTemplate(self.monitorTypeArr[i])
						if (data != null)
							if (data.monitorDataType == "FrameList") {
								self.monitorDataArr.frameList.push(data)
								self.frameListArr.push(data)
								if (self.monitorDataArr.frameList[n].monitorDataType == "FrameList")
									self.setFrameData(self.monitorDataArr.frameList[n], true)
								n++
							}
							else {
								self.monitorDataArr.wave.push(data)
								if (self.monitorDataArr.wave[m].monitorDataType.includes("One"))
									self.setOneSeriesData(self.monitorDataArr.wave[m], true);
								else if (self.monitorDataArr.wave[m].monitorDataType.includes("Mult"))
									self.setMultipleSeriesData(self.monitorDataArr.wave[m], true);
								m++
							}

					}
				}
				self.isRestart = false
			}

			this.targetEngineCandidates = ko.observableArray([]);
			this.selectTargetEngineId = ko.observable();
			this.engineStatus = null;
			this.cancelTargetEngine = function () {
				$('#monitorTestRunDynamicTargetEngineModal').modal('hide');
				$('.modal-backdrop').remove();
			};

			this.confirmTargetEngine = function () {
				var selectTargetEngineStatus = null;
				for (var i = 0; i < self.targetEngineCandidates().length; i++) {
					if (self.targetEngineCandidates()[i].id === self.selectTargetEngineId()) {
						selectTargetEngineStatus = komapping.toJS(self.targetEngineCandidates()[i]);
						break;
					}
				}
				if (selectTargetEngineStatus) {
					$('#monitorTestRunDynamicTargetEngineModal').modal('hide');
					$('.modal-backdrop').remove();
					self.engineStatus = selectTargetEngineStatus;
					self.viewManager.selectedMonitorTestsetActiveEngine = selectTargetEngineStatus;
					self.startMonitorExecution();
				}
				else
					notificationService.showWarn("请选择执行器");
			};

			this.getEngineAddressSuccessFunction = function (response) {
				if (response && response.result && response.engineStatus) {
					// notificationService.showProgressSuccess('获取执行器地址成功。', 100);
					if (response.engineStatuses && response.engineStatuses.length > 1) {
						for (var i = 0; i < response.engineStatuses.length; i++) {
							if(response.engineStatuses[i].shareMode == 0){
								response.engineStatuses[i].property= "全局共享";
								response.engineStatuses[i].describe="所有团队共享使用，多人同时执行测试，多节点分布式测试";
							}
							if(response.engineStatuses[i].shareMode == 1){
								response.engineStatuses[i].property= "团队共享";
								response.engineStatuses[i].describe="团队共享使用，多人同时执行测试，毫秒级实时性测试";
							}
							if(response.engineStatuses[i].shareMode == 2){
								response.engineStatuses[i].property= "个人独用";
								response.engineStatuses[i].describe="仅限所登录的账号执行测试，毫秒级实时性测试";
							}
						}
						self.targetEngineCandidates(response.engineStatuses);
						self.selectTargetEngineId(response.engineStatuses[0].id);
						$('#monitorTestRunDynamicTargetEngineModal').modal('show');
					}
					else {
						self.viewManager.selectedMonitorTestsetActiveEngine = response.engineStatus;
						self.engineStatus = response.engineStatus;
						self.startMonitorExecution();
					}
				}
				else {
					if (response.returnMessage)
						self.getEngineAddressErrorFunction(response.returnMessage);
					else
						self.getEngineAddressErrorFunction("获取执行器地址失败");
				}
			};

			this.getEngineAddressErrorFunction = function (msg) {
				notificationService.showError(msg);
			};

			this.prepareExecution = function () {
				// TODO
				if (self.monitorIsRunning()) {
					notificationService.showWarn('监控进行中，请先停止！');
					return
				}
				//调用保存方法
				if(self.monitorSignalMonoSave()==false){
					notificationService.showError('信号选择不能为空');
					return;
				}
				// notificationService.showProgressSuccess('探测可用的执行器实例...', 0);
				ursService.getEngineAddress(loginManager.getOrganization(), $.cookie("userName"), loginManager.getAuthorizationKey(), self.getEngineAddressSuccessFunction, self.getEngineAddressErrorFunction);
			};

			this.startMonitorSuccessFunction = function (data) {
				//if((self.monitorDataArr.wave != undefined && self.monitorDataArr.wave.length != 0 && (self.monitorDataArr.wave[0].data.yAxisData != undefined && (self.monitorDataArr.wave[0].data.yAxisData != null && self.monitorDataArr.wave[0].data.yAxisData.length != 0))) || (self.monitorDataArr.wave[0].data.yAxes != undefined && self.monitorDataArr.wave[0].data.yAxes != null && self.monitorDataArr.wave[0].data.yAxes[0].yAxisData.length != 0) || (self.monitorDataArr.frameList != undefined && self.monitorDataArr.frameList.length != null && (self.monitorDataArr.frameList[0] != undefined	&& self.monitorDataArr.frameList[0] != null && self.monitorDataArr.frameList[0].data.length != 0)))
				self.cleanData();
				if (data && data.status === 1) {
					self.lastResultId = 0;
					self.resultRetrieveBegin = false;
					self.lastestCaseNode = null;
					self.monitorIsRunning(true)
					self.triggerStop=true;
					notificationService.showSuccess('启动监测集发送成功。');
					self.getExecutionStatus();
					// self.getExecutionResult();
					// setTimeout(
					// 	function () {
					// 		$.blockUI(utilityService.template);
					// 		self.getExecutionStatus();
					// 		$.unblockUI();
					// 	}, 1000);
				}
				else
					self.startMonitorErrorFunction(data.result);
			};

			this.startMonitorErrorFunction = function (msg) {
				if(msg=="ExceedMaxExecutionCount"){
					notificationService.showError('执行已超过每日最大次数限制,请安装相应许可');
					//设置为可点击
					self.isExecuting(false);
				} else {
					notificationService.showProgressError('监测集执行准备失败。', 100);
				}

			};
			this.handleWebSocketConnection = async function () {
				try {
					// 主连接失败的操作
					var protocol = window.location.protocol;
					var host = window.location.hostname;
					var port = window.location.port || (protocol === 'https:' ? '443' : '80');
					var pathname = window.location.pathname;
					var address = protocol + "//" + host + ":" + port + pathname;
					address = address.replace("http", "ws");
					var webAddress = address + "UtpClientWebSocket?key=" + self.executionId + "+monitoringexecutiondetail";
					let isConnected = await self.connectWebsocket();
					if (!isConnected) {
						// 连接失败后尝试备用地址
						self.websocketAddress(webAddress);
						self.transformConfig[0].dataTypes = [];
						if (self.saveData() == 1) {
							self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotSave');
						}
						else {
							self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotNoSave');
						}
						await self.connectWebsocket();
					}
				} catch (error) {
					self.websocketAddress(webAddress);
					self.transformConfig[0].dataTypes = [];
					if (self.saveData() == 1) {
						self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotSave');
					}
					else {
						self.transformConfig[1].dataTypes = self.getTransformConfigData('entrepotNoSave');
					}
					await self.connectWebsocket();
				}
			}
			this.transformConfig = JSON.parse(JSON.stringify(cmdConvertService.transformConfig));
			this.startMonitorExecution = async function () {
				var engineStatus = self.viewManager.selectedMonitorTestsetActiveEngine;
				if (engineStatus == null) {
					notificationService.showError('执行器不存在！');
					return;
				}
				self.executionId = executionManager.getGuid();
				self.transformConfig[0].dataTypes = self.getTransformConfigData('noEntrepotSave');
				if(self.saveData()==1){
					self.transformConfig[1].dataTypes = self.getTransformConfigData('noEntrepotSave');
				}
				self.websocketAddress("ws://" + engineStatus.websocketAddress + "?key=" + self.executionId + "+monitoringexecutiondetail");
				await self.handleWebSocketConnection();

				self.executeState(executionManager.notStarted);
				self.executeStateNotification('');
				var monitorExecution = {
					executionId: self.executionId,
					monitoringTestSetId: self.viewManager.selectedMonitorTestsetActiveData.id,
					projectId: self.selectionManager.selectedProject().id
				};
				utpService.addMonitorExecution(monitorExecution, self.addMonitorExecutionSuccessFunction, self.addMonitorExecutionErrorFunction);
				var obj = {
					scriptIds: [self.viewManager.selectedMonitorTestsetActiveData.startScriptId],
					executionId: self.executionId,
					executedByUserId: $.cookie("userName"),
					utpCoreIpAddress: engineStatus.utpIpAddress,
					utpCorePort: engineStatus.utpPort,
					projectId: self.selectionManager.selectedProject().id,
					domainId: loginManager.getOrganization(),
					isAutoRun: true,
					scriptGroupId: "0",
					isSendEmail: false,
					isTestcaseCollect: false,
					isTestcasePersist: false,
					isTeststepCollect: false,
					isTeststepPersist: false,
					isTestdataCollect: true,
					isTestdataPersist: true,
					isMonitordataPersistence: true,
					isSend: false,
					transformConfig: JSON.stringify(self.transformConfig),
				}
				utpService.prepareExecutionScripts(obj, self.startMonitorSuccessFunction, self.startMonitorErrorFunction);
			};
			this.addMonitorExecutionSuccessFunction = function (data) {
				if (data && data.status === 1) {
				}
				else
					self.addMonitorExecutionErrorFunction();
			};
			this.addMonitorExecutionErrorFunction = function () {
				notificationService.showProgressError('添加监控执行失败。', 100);
			}

			// prepare execution
			this.canStartExecution = ko.observable(true);

			this.refreshExecutionStatus = function () {
				if (!self.projectManager.isMonitoringResult) {
					if (self.monitorIsRunning() || self.triggerStop ||
						(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork ||
							self.executeState() == executionManager.throwException || self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming ||
							self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
						)) {
						self.lastResultId = self.lastResultId - self.customMaxResult()
						self.getExecutionStatus();
						notificationService.showSuccess('数据已更新。');
					} else notificationService.showWarn('没有正在运行的监控测试集。');
				} else {
					self.cleanData()
					// utpService.getMonitoringExecutionDetailByExecutionId(self.viewManager.selectedMonitorExecution().executionId, 0, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
				}
			};

			this.getExecutionStatus = function () {
				utpService.getExecutionModel(self.executionId,
					function (data) {
						if (data && data.status === 1) {
							var result = data.result;
							if (result.status != undefined) {
								if (self.executeState() != result.status) {
									if (result.status == executionManager.starting) {
										self.executeStateNotification('验证启动中...');
									}
									else if (result.status == executionManager.running) {
										self.executeStateNotification('验证执行中...');
									}
									else if (result.status == executionManager.pausing) {
										self.executeStateNotification('验证暂停中...');
									}
									else if (result.status == executionManager.paused) {
										self.executeStateNotification('验证已暂停。');
										notificationService.showSuccess('验证已暂停。');
									}
									else if (result.status == executionManager.resuming) {
										self.executeStateNotification('验证重启中...');
									}
									else if (result.status == executionManager.stopping) {
										self.executeStateNotification('验证停止中...');
									}
									else if (result.status == executionManager.stopped) {
										self.executeStateNotification('验证已停止。');
										notificationService.showSuccess('验证已停止。');
									}
									else if (result.status == executionManager.completed) {
										self.executeStateNotification('验证已完成。');
									}
									else if (result.status == executionManager.exceptionHandling) {
										self.executeStateNotification('异常处理中...');
									}
									else if (result.status == executionManager.reconnectingNetwork) {
										self.executeStateNotification('网络重连中...');
									}
									else if (result.status == executionManager.terminated) {
										self.executeStateNotification('验证已终止。');
										notificationService.showSuccess('验证已终止。');
									}
									else if (result.status == executionManager.startExecutionError) {
										var errorMessage = "";
										for (var i = 0; i < result.startExecutionError.antbotFailedReasons.length; i++)
											errorMessage = errorMessage + "antbotName:" + result.startExecutionError.antbotFailedReasons[i].antbotName + ", 失败原因:" + result.startExecutionError.antbotFailedReasons[i].failedReason + "<br />"
										notificationService.showError(errorMessage);
										self.monitorIsRunning(false)
									}
									else if (result.status == executionManager.utpCoreNetworkError) {
										var errorMessage = "执行器连接断开，请检查连接状态,再次尝试。"
										notificationService.showError(errorMessage);
										self.monitorIsRunning(false)
									}else if(result.status == executionManager.engineInitError){
										var errorMessage = "暂无可用执行器，请确认执行器是否登录或已有测试在执行中。"
										notificationService.showError(errorMessage);
										self.monitorIsRunning(false)
									}
									else if (result.status == executionManager.unknownError) {
										var errorMessage = "未知错误。"
										notificationService.showError(errorMessage);
										self.monitorIsRunning(false)
									}
									else if (result.status == executionManager.configureError) {
										var errorMessage = "引擎配置错误。"
										notificationService.showError(errorMessage);
										self.monitorIsRunning(false)
									}
									else if (result.status == executionManager.AntbotNotFoundError) {
										var errorMessage = "测试机器人未找到。"
										notificationService.showError(errorMessage);
										self.monitorIsRunning(false)
									}
								}
								if (result.status == executionManager.unknownError || result.status == executionManager.configureError || result.status == executionManager.engineInitError
									|| result.status == executionManager.startExecutionError || result.status == executionManager.utpCoreNetworkError ||
									result.status == executionManager.terminated || result.status == executionManager.completed || result.status == executionManager.stopped) {
									self.triggerStop = false;
								}
								if (result.status == executionManager.startExecutionError || result.status == executionManager.AntbotNotFoundError) {
									return;
								}

								self.executeState(result.status);
							} else {
								self.monitorIsRunning(false)
								notificationService.showError('数据获取异常');
								return
							}
							// self.getExecutionResult();
							// self.connectWebsocket();

							if (self.deactive)
								return;

							if (self.triggerStop ||
								(self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork ||
									self.executeState() == executionManager.stopping || self.executeState() == executionManager.resuming ||
									self.executeState() == executionManager.pausing || self.executeState() == executionManager.running || self.executeState() == executionManager.starting
								))
								setTimeout(
									function () {
										self.getExecutionStatus();
									}, 1000);
						}
						else {
							self.monitorIsRunning(false)
							self.executeState(executionManager.throwException);
							self.executeStateNotification('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
							notificationService.showError('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
						}
					},
					function () {
						self.executeState(executionManager.throwException);
						self.executeStateNotification('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
						notificationService.showError('获取验证状态失败,如需继续尝试，请点击结果面板中刷新按钮!');
					}
				);
			}

			this.canShowVerification = ko.computed(function () {
				return (self.executeState() != executionManager.notStarted && self.executeState() != executionManager.starting);
			});

			this.canShowControlButton = ko.computed(function () {
				return (self.executeState() != executionManager.notStarted && self.executeState() != executionManager.starting &&
					self.executeState() != executionManager.completed && self.executeState() != executionManager.stopped &&
					self.executeState() != executionManager.terminated);

			});

			// stop execution
			this.canStop = ko.computed(function () {
				return (self.executeState() == executionManager.pausing || self.executeState() == executionManager.paused ||
					self.executeState() == executionManager.running || self.executeState() == executionManager.resuming ||
					self.executeState() == executionManager.exceptionHandling || self.executeState() == executionManager.reconnectingNetwork);
			});

			this.stopExecution =async function () {
				if (!self.monitorIsRunning()) {
					notificationService.showWarn('没有正在运行的监控测试集。');
					return
				}
				var engineStatus = self.viewManager.selectedMonitorTestsetActiveEngine;
				utpService.updateMonitorExecution(self.executionId,function (data) {
					if (data && data.status === 1) {
						// notificationService.showSuccess('停止验证命令发送成功。');
					}
				},
				function () {
					notificationService.showError('停止验证命令发送失败。');
					return ;
				});
				self.executionId=self.executionId+"_stop";
				// var transformConfig = JSON.parse(JSON.stringify(cmdConvertService.transformConfig));
				self.transformConfig[0].dataTypes = self.getTransformConfigData('noEntrepotSave');
				if(self.saveData()==1){
					self.transformConfig[1].dataTypes = self.getTransformConfigData('noEntrepotSave');
				}
				self.websocketAddress("ws://" + engineStatus.websocketAddress + "?key=" + self.executionId + "+monitoringexecutiondetail");
				await self.handleWebSocketConnection();

				var obj = {
					executionId:self.executionId,
					scriptIds: [self.viewManager.selectedMonitorTestsetActiveData.stopScriptId],
					executedByUserId: $.cookie("userName"),
					utpCoreIpAddress: engineStatus.utpIpAddress,
					utpCorePort: engineStatus.utpPort,
					projectId: self.selectionManager.selectedProject().id,
					isAutoRun:true,
					scriptGroupId:"0",
					domainId:loginManager.getOrganization(),
					isSendEmail:false,
					isTestcaseCollect:false,
					isTestcasePersist:false,
					isTeststepCollect:false,
					isTeststepPersist:false,
					isTestdataCollect:true,
					isTestdataPersist:true,
					isMonitordataPersistence:true,
					isSend:false,
					transformConfig:JSON.stringify(self.transformConfig)
				};
				self.executeState(executionManager.notStarted);
				utpService.prepareExecutionScripts(obj,
					function (data) {
						if (data && data.status === 1 && data.result) {
							self.getExecutionStatus();
							self.triggerStop = true;
							self.monitorIsRunning(false);
							notificationService.showSuccess('停止验证命令发送成功。');
						}
						else{
							if(data.result=="ExceedMaxExecutionCount"){
								notificationService.showError('执行已超过每日最大次数限制,请安装相应许可');
							}else{
							notificationService.showError('停止验证命令发送失败。');
							}
						}
					},
					function () {
						notificationService.showError('停止验证命令发送失败。');
					}
				);
			};

			this.currentStepNumber = 0;
			// get execution result
			this.getExecutionResultSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					if (data.result.length == 0 || data.result == null || data.result == []) {
						self.resultRetrieveBegin = false
						return
					}
					var resultItems = data.result;
					var currentLastResultId = self.lastResultId;
					if (resultItems.length > 0 && resultItems[resultItems.length - 1].id > self.lastResultId) {
						self.lastResultId = resultItems[resultItems.length - 1].id
					}
					for (var i = 0; i < resultItems.length; i++) {
						// skip intermediate result call
						var resultItem = resultItems[i];
						self.executinResultData(resultItem)
					}
					
					self.resultRetrieveBegin = false; // should after the setting of lastResulteId
					if(self.monitorIsRunning()){
						setTimeout(
							function () {
								self.getExecutionResult();
							}, 1000);
					}
				}else {
					self.getExecutionResultErrorFunction()
				}
			};
			this.executinResultData=function(data){
					var index = self.monitorDataArr.frameList.findIndex(md => md.monitorDataName === data.monitorDataName)
					var monitorDataType = ''
					if (index == -1) {
						index = self.monitorDataArr.wave.findIndex(md => md.monitorDataName === data.monitorDataName)
						monitorDataType = "Wave"
					}
					else monitorDataType = "FrameList"

					if (data.executionStatus == "STOP")
						return
					if (monitorDataType != "FrameList") {
						let jsonData = JSON.parse(data.jsonData)
						if (jsonData.xAxisUnit) {
							self.monitorDataArr.wave[index].data.xAxisUnit = jsonData.xAxisUnit
							self.monitorDataArr.wave[index].data.xAxisStep = jsonData.xAxisStep != undefined && jsonData.xAxisStep != null && jsonData.xAxisStep.length > 0 ? jsonData.xAxisStep.xAxisStep : ''
							self.monitorDataArr.wave[index].data.yAxisName = jsonData.yAxisName != undefined && jsonData.yAxisName != null && jsonData.yAxisName.length > 0 ? jsonData.yAxisName : ''
							self.monitorDataArr.wave[index].data.yAxisUnit = jsonData.yAxisUnit != undefined && jsonData.yAxisUnit != null && jsonData.yAxisUnit.length > 0 ? jsonData.yAxisUnit : ''
							self.monitorDataArr.wave[index].data.xAxisFixStep = jsonData.xAxisFixStep
							self.monitorDataArr.wave[index].data.xAxisStepVal = jsonData.xAxisStepVal != undefined && jsonData.xAxisStepVal != null ? jsonData.xAxisStepVal : ''
							if (self.monitorDataArr.wave[index].monitorDataType.includes("Multi")) {
								self.monitorDataArr.wave[index].data.yAxes = []
								for (var j = 0; j < jsonData.yAxisInfo.length; j++) {
									var temp = {
										yAxisName: jsonData.yAxisInfo[j].axisName+"/"+jsonData.yAxisInfo[j].axisUnit,
										yAxisData: []
									}
									self.monitorDataArr.wave[index].data.yAxes.push(temp)
								}
								self.multipleWaveIsFirstLoad = true
							}
						} else {
							let dataArr = JSON.parse(data.jsonData)
							if (self.monitorDataArr.wave[index].monitorDataType.includes("Multi")) {
								for (var j = 0; j < dataArr.length; j++) {
									if (!self.monitorDataArr.wave[index].data.xAxisFixStep) {
										self.monitorDataArr.wave[index].data.xAxisData.push(dataArr[j][0])
										for (var k = 0; k < dataArr[j][1].length; k++)
											self.monitorDataArr.wave[index].data.yAxes[j].yAxisData.push(dataArr[j][1][k])
									}
									else {
										for (var k = 0; k < dataArr[j].length; k++)
										self.monitorDataArr.wave[index].data.yAxes[j].yAxisData.push(dataArr[j][k])
									}
								}
								if (self.monitorDataArr.wave[index].data.yAxes[0].yAxisData.length > self.customMaxResult() && !self.projectManager.isMonitoringResult) {
									for (let j = 0; j < self.monitorDataArr.wave[index].data.yAxes.length; j++) {
										if (!self.monitorDataArr.wave[index].data.xAxisFixStep)
											self.monitorDataArr.wave[index].data.xAxisData = self.monitorDataArr.wave[index].data.xAxisData.slice(-self.customMaxResult())
										self.monitorDataArr.wave[index].data.yAxes[j].yAxisData = self.monitorDataArr.wave[index].data.yAxes[j].yAxisData.slice(-self.customMaxResult())
									}
								}
							} else {
								for (let j = 0; j < dataArr.length; j++) {
									if (self.monitorDataArr.wave[index].data.xAxisFixStep)
										self.monitorDataArr.wave[index].data.yAxisData.push(dataArr[j])
									else {
										self.monitorDataArr.wave[index].data.xAxisData.push(dataArr[j][0])
										self.monitorDataArr.wave[index].data.yAxisData.push(dataArr[j][1])
									}
								}
								// if (self.monitorDataArr.wave[index].data.xAxisFixStep){
								// 	self.monitorDataArr.wave[index].data.yAxisData=dataArr
								// }else{
								// 	for (let j = 0; j < dataArr.length; j++) {
								// 		self.monitorDataArr.wave[index].data.xAxisData.push(dataArr[j][0])
								// 		self.monitorDataArr.wave[index].data.yAxisData.push(dataArr[j][1])
								// 	}
								// }
								if (self.monitorDataArr.wave[index].data.yAxisData.length > self.customMaxResult() && !self.projectManager.isMonitoringResult) {
									if (!self.monitorDataArr.wave[index].data.xAxisFixStep)
										self.monitorDataArr.wave[index].data.xAxisData = self.monitorDataArr.wave[index].data.xAxisData.slice(-self.customMaxResult())
									self.monitorDataArr.wave[index].data.yAxisData = self.monitorDataArr.wave[index].data.yAxisData.slice(-self.customMaxResult())
								}
							}
							if (monitorDataType == "Wave" && self.monitorDataArr.wave[index].monitorDataType.includes("One")) {
								let waveData = self.monitorDataArr.wave[index]
								waveData.data.yAxisData = waveData.data.yAxisData.slice(-dataArr.length)
								if (!self.monitorDataArr.wave[index].data.xAxisFixStep)
									waveData.data.xAxisData = waveData.data.xAxisData.slice(-dataArr.length)
								self.setOneSeriesData(waveData, false);
							}
							else if (monitorDataType == "Wave" && self.monitorDataArr.wave[index].monitorDataType.includes("Multi")) {
								let waveData = self.monitorDataArr.wave[index]
								for (let j = 0; j < waveData.data.yAxes.length; j++)
									waveData.data.yAxes[j].yAxisData = waveData.data.yAxes[j].yAxisData.slice(-dataArr[j].length)
								if (!self.monitorDataArr.wave[index].data.xAxisFixStep)
									waveData.data.xAxisData = waveData.data.xAxisData.slice(-dataArr[j].length)
								self.setMultipleSeriesData(waveData, false);
							}
						}
					} else {
						let jsonData = JSON.parse(data.jsonData)
						if (jsonData.protocolId) {
							self.monitorDataArr.frameList[index].executionId = data.executionId
							self.monitorDataArr.frameList[index].monitorSessionId = data.monitorSessionId
							self.monitorDataArr.frameList[index].executionDate = data.executionDate
							self.monitorDataArr.frameList[index].protocolId = jsonData.protocolId
							self.getProtocol(jsonData.protocolId);
						} else {
							var frameListInfo = self.monitorDataArr.frameList[index]
							frameListInfo.data = jsonData
							// for (let n = 0; n < jsonData.length; n++) {
							// 	var frameListData = jsonData[n]
							// 	var dataTemp = {
							// 		timestamp: frameListData.timestamp,
							// 		message: frameListData.message,
							// 		receiveFrame: frameListData.receiveFrame ? "接收" : "发送",
							// 		rawFrame: frameListData.rawFrame,
							// 		fieldValues: frameListData.fieldValues,
							// 		fieldSizes: frameListData.fieldSizes
							// 	}
							// 	frameListInfo.data.push(dataTemp)
							// }
                        	if( utpService.monitorHistoryCheck){
								self.totalEntries = 0;
								utpService.monitorHistoryCheck = false;
							}
							self.setFrameData(frameListInfo, false)
						}
					}
				
			}

			this.getExecutionResultErrorFunction = function () {
				self.resultRetrieveBegin = false;
				notificationService.showError('获取验证结果失败。');
			};
			this.websocket = null;
			this.connectWebsocket = function () {
				let isConnected = false; // 添加一个标志来表示连接状态
				return new Promise((resolve, reject) => {
					self.websocket = new WebSocket(self.websocketAddress());
			
					// 定义WebSocket事件处理函数
					self.websocket.onopen = function (evt) {
						isConnected = true; // 连接成功时更新标志
						resolve(isConnected); // 使用resolve来解决Promise
					};
			
					self.websocket.onclose = function (evt) {
						isConnected = false; // 连接关闭时更新标志
						reject(isConnected); // 使用reject来拒绝Promise
					};
			
					self.websocket.onmessage = function (evt) {
						let data = JSON.parse(evt.data);
						if (data.executionStatus != "STOP") {
							self.executinResultData(data);
						} else {
							self.websocket.close();
						}
					};
			
					self.websocket.onerror = function (evt) {
						isConnected = false; // 连接失败时更新标志
						reject(isConnected); // 使用reject来拒绝Promise
					};
				});
			};
			this.getExecutionResult = function () {
				if (!self.resultRetrieveBegin) {
					self.resultRetrieveBegin = true;
					utpService.getMonitoringExecutionDetailByExecutionId(self.executionId, self.lastResultId, self.getExecutionResultSuccessFunction, self.getExecutionResultErrorFunction);
				}
			};

			//单通道信号,根据下拉框选择的信号,保存数据
			this.monitorSignalMonoSave = function () {
				var commandItemList = self.signalCurrentScript.script.split(cmdConvertService.CMD_SEPARATOR);
				if (self.signalMonitorCmdInfoArray[0].cmdIndex >= commandItemList.length)
					return;

				//对脚本命令self.signalMonitorCmdInfoArray进行遍历
				for (var i = 0; i < self.signalMonitorCmdInfoArray.length; i++) {
					if (self.signalMonitorCmdInfoArray[i].cmdName == "StartMonitorChannel") {
						//对下拉框节点id,self.pRightSelectIdArr进行遍历
						var signalNameVaule = '';
						for (var j = 0; j < self.pRightSelectIdArr.length; j++) {
							signalNameVaule = document.querySelector('#' + self.pRightSelectIdArr[j]).value;
							if (self.signalMonitorCmdInfoArray[i].monitorDataName == self.pRightSelectIdArr[j].split("_")[0]) {
								var updateCmdArray = [{ "cmdIndex": self.signalMonitorCmdInfoArray[i].cmdIndex, "updateParams": [{ "index": self.signalMonitorCmdInfoArray[i].updateParamsInfo[0], "value": signalNameVaule }] }];
								utpService.updateFullScript(cmdConvertService.publicSaveScript(self.signalCurrentScript, updateCmdArray), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
							}
						}
						return true;
					}
					else if(self.signalMonitorCmdInfoArray[i].cmdName == "StartMonitorTmpGroup"){
						var signalNameVauleArr = [];
						//对下拉框节点id,self.pRightSelectIdArr进行遍历
						for (var j = 0; j < self.pRightSelectIdArr.length; j++) {
							if (self.signalMonitorCmdInfoArray[i].monitorDataName == self.pRightSelectIdArr[j].split("_")[0]) {
								//获取id为self.pRightSelectIdArr[j]节点下所有的<lable>节点的值
								document.querySelectorAll('#'+ self.pRightSelectIdArr[j].split("_")[0]+'_SingnalTmpBox label').forEach((item) => {
									signalNameVauleArr.push(item.innerHTML)
								})
								if(signalNameVauleArr.length == 0){
									return false;
								}
								var updateCmdArray = [{ "cmdIndex": self.signalMonitorCmdInfoArray[i].cmdIndex, "updateParams": [{ "index": self.signalMonitorCmdInfoArray[i].updateParamsInfo[0], "value": JSON.stringify(signalNameVauleArr) }] }];
								utpService.updateFullScript(cmdConvertService.publicSaveScript(self.signalCurrentScript, updateCmdArray), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
							}
						}
						return true;
					}
				}
			};
			this.updateScriptSuccessFunction = function (data) {
				if (data && data.status === 1) {
					// notificationService.showSuccess('更新脚本成功');
				}
				else
					self.updateScriptErrorFunction();
			};

			this.updateScriptErrorFunction = function () {
				notificationService.showError('更新脚本失败');
			};
			//信号表数据解析
			this.signalTableNameArr = ko.observableArray([]);
			this.signalTable = null;
			this.signalGetProtocolSuccessFunction = function (data) {
				self.signalTableNameArr.removeAll();
				let optionList = [];
				if (data && data.status === 1 && data.result) {
					self.signalTable = JSON.parse(data.result.bigdata);
					//遍历信号表的数据,将logicName取出来
					for (var i = 0; i < self.signalTable.signalMappingTable.length; i++) {
						self.signalTableNameArr.push(self.signalTable.signalMappingTable[i].logicName);
					}
					//给下拉框赋值
					if (self.pRightSelectIdArr.length > 0) {
						//遍历pRightSelectIdArr
						optionList = self.signalTableNameArr();
						for (var i = 0; i < self.pRightSelectIdArr.length; i++) {
						document.querySelector('#' + self.pRightSelectIdArr[i]).innerHTML = optionList.map(item => `<option value="${item}">${item}</option>`).join('')
						}
					}
				}
				else
					self.getProtocolErrorFunction();
			};
			//是否加载信号表
			this.loadSignalTable = function () {
				if (self.signalMonitorCmdInfoArray == null)
					return;
				for (var i = 0; i < self.signalMonitorCmdInfoArray.length; i++) {
					//判断脚本是否为StartMonitorChannel或StartMonitorTmpGroup
					if ((self.signalMonitorCmdInfoArray[i].agent != null && self.signalMonitorCmdInfoArray[i].cmdName == "StartMonitorChannel")||(self.signalMonitorCmdInfoArray[i].agent != null && self.signalMonitorCmdInfoArray[i].cmdName == "StartMonitorTmpGroup")) {
						//获取信号表
						utpService.getProtocol(self.signalMonitorCmdInfoArray[i].agent.protocolSignalId, self.signalGetProtocolSuccessFunction, self.getProtocolErrorFunction);
					}
					// if (self.signalMonitorCmdInfoArray[i].agent != null && self.signalMonitorCmdInfoArray[i].cmdName == "StartMonitorTmpGroup") {
					// 	//获取信号表
					// 	utpService.getProtocol(self.signalMonitorCmdInfoArray[i].agent.protocolSignalId, self.signalGetProtocolSuccessFunction, self.getProtocolErrorFunction);
					// }
				}
			}
			this.signalCurrentScript = null;
			this.signalMonitorCmdInfoArray = null;
			this.getAntName = [];
			this.monitorTypeArr = []
			this.scanScript = function (monitorTestSet) {
				//清空信号表数据
				self.signalTableNameArr.removeAll();
				//清空脚本命令
				self.signalMonitorCmdInfoArray = null;
				let commandArr = null
				self.monitorTypeArr = []
				utpService.getFullScript(self.selectionManager.selectedProject().id, monitorTestSet.startScriptId, function (resp) {
					self.signalCurrentScript = resp.result;
					var commandItemList = resp.result.script.split(cmdConvertService.TESTCASE_BEGIN)[1].split(cmdConvertService.TESTCASE_END)[0].split(cmdConvertService.CMD_SEPARATOR);
					//获取脚本命令
					self.signalMonitorCmdInfoArray = cmdConvertService.agentMonitorDataDescCmdAnalysis(resp.result.script);
					//判断是否有AnalogInputAntbot类型,有就加载信号表
					self.loadSignalTable();
					for (var i = 0; i < commandItemList.length; i++) {
						commandItemList[i] = commandItemList[i].trim();
						if (commandItemList[i] == ""
							|| commandItemList[i].indexOf("#") !== -1)
							continue;

						var splitedCommandValues = commandItemList[i].split(cmdConvertService.PARA_SEPARATOR);
						if (splitedCommandValues.length == 0)
							continue;
						var parameters = new Array();
						// check whether it's engine command
						var tempAgentName = splitedCommandValues[0].trim();

						tempAgentName = cmdConvertService.recorverAgentName(tempAgentName);
						var agentName = "";
						for (var j = 0; j < projectManager.agentsConfigData().length; j++) {
							if (projectManager.agentsConfigData()[j].antbotName == tempAgentName) {
								agentName=projectManager.agentsConfigData()[j].antbotName
							}
						}	
						if (agentName == "")
							continue;	
						var antbotType = projectManager.agentsConfigData()[projectManager.agentsConfigData().findIndex(antbot => antbot.antbotName === agentName)].antbotType
						if (cmdConvertService.agentCmdList.length != 0)
							commandArr = cmdConvertService.agentCmdList[cmdConvertService.agentCmdList.findIndex(agent => agent.name === antbotType)].commands
						else {
							commandArr = JSON.parse(self.agentCmdList[self.agentCmdList.findIndex(agent => agent.name === antbotType)].commands)
						}


						var commandName = splitedCommandValues[1].trim();
						for (var j = 2; j < splitedCommandValues.length; j++) {
							//	var commandValue = splitedCommandValues[j].trim();
							var commandValue = splitedCommandValues[j]; // should not trim
							parameters[j - 2] = commandValue;
						}
						for (let j = 0; j < commandArr.length; j++)
							for (let k = 0; k < commandArr[j].CommandList.length; k++) {
								if (commandArr[j].CommandList[k].CmdName == commandName)
									if (commandArr[j].CommandList[k].MonitorDataDesc != undefined && commandArr[j].CommandList[k].MonitorDataDesc != '') {
										var temp = {
											dataNameInParam: commandArr[j].CommandList[k].MonitorDataDesc[0].dataNameInParam,
											dataType: commandArr[j].CommandList[k].MonitorDataDesc[0].dataType,
										}
										temp.commandName=splitedCommandValues[1]
										temp.monitorDataName = splitedCommandValues[2]
										self.monitorTypeArr.push(temp)
										break
									}
							}
					}
					if (self.monitorTypeArr != null) {
						self.monitorDataArr = {
							frameList: [],
							wave: []
						}
						if (self.frameListArr() != null && self.frameListArr().length > 0)
							self.frameListArr.removeAll();
						for (let i = 0; i < self.monitorTypeArr.length; i++) {
							let data = null
							data = self.initDiagramTemplate(self.monitorTypeArr[i])
							if (data != null)
								if (data.monitorDataType == "FrameList") {
									self.monitorDataArr.frameList.push(data)
									self.frameListArr.push(data)
								}
								else self.monitorDataArr.wave.push(data)
						}
					}
					self.beforeFrameList = self.selectFrameList
					self.initDataTrendDiagram(self.monitorDataArr)
				})
			}


			this.frameListArr = ko.observableArray([])

			this.monitorDataArr = ko.observable({
				frameList: [],
				wave: []
			})
			this.initDiagramTemplate = function (data) {
				var dataResult = [
					{
						monitorDataName: "",
						commandName: "",
						monitorDataType: "OneSquareWave",
						data: {
							xAxisUnit: null,
							xAxisStep: null,
							yAxisData: [],
							xAxisData: []
						}
					},
					{
						monitorDataName: "",
						commandName: "",
						monitorDataType: "OneWave",
						data: {
							xAxisUnit: null,
							xAxisStep: null,
							yAxisName: "",
							yAxisUnit: null,
							yAxisData: [],
							xAxisData: []
						}
					},
					{
						monitorDataName: "",
						commandName: "",
						monitorDataType: "MultiWave",
						data:
						{
							xAxisUnit: null,
							xAxisStep: null,
							xAxisData: [],
							yAxes: [
								{
									yAxisName: "",
									yAxisData: [],
								}
								//解决使用多通道的时候插入一个通道出现的问题
								// ,
								// {
								// 	yAxisName: "",
								// 	yAxisData: [],
								// }
							]
						}
					},
					{
						monitorDataName: "",
						commandName: "",
						monitorDataType: "MultiSquareWave",
						data:
						{
							xAxisUnit: null,
							xAxisStep: null,
							xAxisData: [],
							yAxes: [
								{
									yAxisName: "",
									yAxisData: [],
								}
								//解决使用多通道的时候插入一个通道出现的问题
								// ,
								// { 
								// 	yAxisName: "",
								// 	yAxisData: [],
								// }
							]
						}
					},
					{
						executionId: '',
						monitorDataName: '',
						monitorDataType: "FrameList",
						protocolId: '',
						data: [],
						monitorSessionId: '',
						executionDate: '',
						executionStatus: '', //该字段可能的值为："Start","","Stop"
					},
				]
				let index = dataResult.findIndex(rs => rs.monitorDataType === data.dataType)
				if (index != -1) {
					dataResult[index].commandName = data.commandName
					dataResult[index].monitorDataName = data.monitorDataName
					if (data.dataType != 'FrameList') {
						dataResult[index].id = self.dataResultId
						self.dataResultId++
					}
					return dataResult[index]
				}
				return null
			}
			this.dataResultId = 0

			this.initGraphs = function () {
				var flex = {
					id: 'monitorDataCols',
					cols: []

				};

				webix.ui({
					container: "monitorTestSetRunStep",
					id: 'monitorData',
					rows: [
						{ body: flex, height: 800 },
						{
							template: "Status: all data is saved",
							height: 30
						}
					]
				});

				self.scanScript(viewManager.selectedMonitorTestsetActiveData)
			}

			this.activate = function () {
				// setTimeout(self.initDataTrendDiagram(), 1000);
			};

			this.detached = function () {
				self.deactive = true;

			};

			self.agentCmdList = []
			// The data-binding shall happen after DOM element be attached.
			this.attached = function (view, parent) {
				self.deactive = false;
				self.executeState(executionManager.notStarted);
				if (cmdConvertService.agentCmdList.length == 0) {
					ursService.getAllAgentType(loginManager.getOrganization(), loginManager.getAuthorizationKey(), function (data) {
						self.agentCmdList = data.toolTypes
						self.initGraphs()
					})
				} else
					self.initGraphs()
			};
		}
		return new MonitorTestSetRunViewModel();
	});
