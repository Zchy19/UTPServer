define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/cmdConvertService', 'services/reportService','services/notificationService'],
		function(app, ko, $, komapping, utpService, cmdConvertService, reportService, notificationService) {
	
			function QualityReportViewModel() {
				var self = this;				
				this.reportService = reportService;
				this.myChart = null;
				this.chartOptions = {};
				this.qualityReportRefreshSubScription = null;
				this.qualityConditionSettingSubScription = null;
				function init() {
					self.searchCondition.begin(self.reportService.previousDate.getFullYear() + "-" + (self.reportService.previousDate.getMonth()+1) + "-" + self.reportService.previousDate.getDate()); 
				    self.searchCondition.end(self.reportService.nowDate.getFullYear() + "-" + (self.reportService.nowDate.getMonth()+1) + "-" + self.reportService.nowDate.getDate());
				}
				
				this.searchCondition = {						
						begin : ko.observable(''),
						end : ko.observable(''),
						// David : It will be not updated if project changed. so projectId shall be passed by directly.
						// projectId : $.cookie("lastSelectedProject"),
				};
				
				this.initChart = function(){					
					var dom = document.getElementById('qualityChart');
					self.myChart = echarts.init(dom);
					self.myChart.showLoading({
						text: "数据正在努力加载..."
					});
				}
				
				this.drawChart = function(seriesData){
					self.myChart.hideLoading();
					self.chartOptions = null;
					self.chartOptions = {
					    title: {
					        text: '质量走势报告',
					        subtext: self.searchCondition.begin() + " 到 " + self.searchCondition.end(),
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
			                return item.date;
			            });
						
						var successTestCaseSeries = {
							name:'成功',
					        type:'line',
					        // stack: '总量',
					        data:seriesData.map(function (item) {
				                return item.passedScripts;
				            })
			            };
						self.chartOptions.series.push(successTestCaseSeries);
						
						var failedTestCaseSeries = {
								name:'失败',
						        type:'line',
						        // stack: '总量',
						        data:seriesData.map(function (item) {
					                return item.failedScripts;
					            })
				            };
						self.chartOptions.series.push(failedTestCaseSeries);
												
						var unExecutedTestCaseSeries = {
								name:'未执行',
						        type:'line',
						        // stack: '总量',
						        data:seriesData.map(function (item) {
					                return item.unExecutedScripts;
					            })
				            };
						self.chartOptions.series.push(unExecutedTestCaseSeries);										
						
						var totalTestCaseSeries = {
								name:'总数',
						        type:'line',
						        // stack: '总量',
						        data:seriesData.map(function (item) {
					                return item.total;
					            })
				            };
						self.chartOptions.series.push(totalTestCaseSeries);						
						self.chartOptions.legend.data = ["成功","失败","未执行","总数"];
						self.myChart.setOption(self.chartOptions, true);
					}
				}
				
				this.getQualityReportSuccessFunction = function(data){
					if(data != null && data.status === 1){	
						var seriesData = data.result;
			        	for(var i=0;i< seriesData.length;i++){
			        		seriesData[i].total = seriesData[i].passedScripts + seriesData[i].failedScripts + seriesData[i].unExecutedScripts;
			        	}			        	
			        	self.drawChart(seriesData);
					}
					else
						self.getQualityReportErrorFunction();
				};			

				this.getQualityReportErrorFunction = function(){
					notificationService.showError('获取质量报告失败');
				};
				
				this.createQualityChart = function(){
					self.initChart();
					utpService.getQualityReport($.cookie("lastSelectedProject"), this.searchCondition.begin(), this.searchCondition.end(),
							self.getQualityReportSuccessFunction, self.getQualityReportErrorFunction);							
				};
						
				// The data-binding shall happen after DOM element be attached.
				this.attached = function(view, parent) {
					self.createQualityChart();				
				};
				
				this.detached = function(view, parent){
					self.qualityReportRefreshSubScription.off();
					self.qualityConditionSettingSubScription.off();
				};
				
				this.activate = function() {
					init();
					self.qualityConditionSettingSubScription = app.on('qualityConditionSetting:event').then(function(begin, end) {
						self.searchCondition.begin(begin);
						self.searchCondition.end(end);
						self.createQualityChart();
			            }, this);
					self.qualityReportRefreshSubScription = app.on('qualityReportRefresh:event').then(function() {self.createQualityChart();}, this);
				};
			}
			return new QualityReportViewModel();
		});
