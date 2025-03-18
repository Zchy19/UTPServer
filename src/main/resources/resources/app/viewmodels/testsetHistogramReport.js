define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/selectionManager', 
    'services/reportService','services/notificationService', 'jsoneditor', 'lodash','datepicker'],
            function(app, ko, $, komapping, utpService,selectionManager, reportService, notificationService, JSONEditor, _, datepicker) {
        
                function TestsetHistogramReportViewModel() {
                    var self = this;				
                    this.reportService = reportService;
                    this.startFromDate = ko.observable('');
                    this.endByDate = ko.observable('');
                    this.autoRefreshTimeOptions=["1天内","7天内","30天内"];
                    this.autoRefreshTimeValue = ko.observable();
                    this.selectedAutoRefreshTime = ko.observable();
                    this.testsetHistogramAutoFlag=ko.observable(false);
                    this.refreshInterval = null;

                    this.startAutoRefresh = function() {
                        if (self.testsetHistogramAutoFlag()) {
                            self.refreshInterval = setInterval(function() {
                                self.autoRefreshTimeChanged();
                                self.createTestsetHistogramStatistics();
                            }, 24 * 60 * 60 * 1000); // 10分钟
                        } else {
                            clearInterval(self.refreshInterval);
                        }
                    };
            
                    this.testsetHistogramAutoFlag.subscribe(function(newValue) {
                        self.startAutoRefresh();
                    });

                    this.formatUTCDate= function (date) {
                        var year = date.getUTCFullYear();
                        var month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                        var day = ("0" + date.getUTCDate()).slice(-2);
                        return year + "-" + month + "-" + day;
                    }
                    this.autoRefreshTimeChanged = function () {
                        //获取当前时间
                        var now = new Date();
                        var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
                        // 获取当前时间
                        self.endByDate(self.formatUTCDate(startDate));
                        // 根据选择的自动刷新时间设置起始时间
                        switch (self.selectedAutoRefreshTime()) {
                            case "1天内":
                                // 不需要修改startDate，它已经是当天的零点了
                                break;
                            case "7天内":
                                startDate = new Date(startDate.getTime() - 6 * 24 * 60 * 60 * 1000);
                                break;
                            case "30天内":
                                startDate = new Date(startDate.getTime() - 29 * 24 * 60 * 60 * 1000);
                                break;
                            default:
                                startDate = new Date(startDate.getTime() - 29 * 24 * 60 * 60 * 1000);
                                break;
                        }
                        self.startFromDate(self.formatUTCDate(startDate));
                    }

                    this.initSearchCondition = function() {
                        var now = new Date();
                        var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
                        // 获取当前时间
                        self.endByDate(self.formatUTCDate(startDate));
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()-29, 0, 0, 0, 0);
                        self.startFromDate(self.formatUTCDate(startDate)); 
                    }
                    this.protocolConditionSetting = function(){
                        $('#testsetHistogramReportSettingModal').modal('show');
                    };
                    this.showChart=ko.observable(false);
                    this.myChart = null;
                    this.chartOptions = {};
                    this.testsetHistogramSumTimesData = ko.observableArray([]);
                    this.testsetHistogramNamesData =ko.observableArray([]);
                    this.testsetHistogramOption =  ko.computed(function() {
                        var sumTimesData = self.testsetHistogramSumTimesData();
                        var namesData = self.testsetHistogramNamesData();
                        //如果data不为空,则显示图表
                        if(namesData.length > 0){
                            self.showChart(true);
                        }
                        return {
                          title: {
                            text: '测试运行统计图',
                            left: 'center'
                          },
                          tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                              type: 'shadow'
                            },
                            formatter: function(params) {
                                var result = '';
                                params.forEach(function(param) {
                                    var value = param.value;
                                    var name = namesData[param.dataIndex];
                                    var bracketText = '';
                            
                                    if (name) {
                                        var bracketContent = name.match(/\((.*?)\)/);
                                        bracketText = bracketContent ? bracketContent[1] : '';
                                    }
                            
                                    var timeText = '';
                                    if (value >= 3600) {
                                        var hours = Math.floor(value / 3600);
                                        var minutes = Math.floor((value % 3600) / 60);
                                        var seconds = Math.floor(value % 60);
                                        timeText = hours + 'h' + minutes + 'm' + seconds + 's';
                                    } else if (value >= 60) {
                                        var minutes = Math.floor(value / 60);
                                        var seconds = Math.floor(value % 60);
                                        timeText = minutes + 'm' + seconds + 's';
                                    } else {
                                        timeText = value + 's';
                                    }
                            
                                    result += timeText + '\n(' + bracketText + ')<br/>';
                                });
                                return result;
                            }
                          },
                          grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                          },
                          xAxis: [
                            {
                              type: 'category',
                              data: namesData, //['测试集1', '测试集2', '测试集3', '测试集4']
                              axisTick: {
                                alignWithLabel: true
                              },
                              axisLabel: {
                                rotate: 45, // 将文字倾斜45度
                                formatter: function(value) {
                                  // 使用"|"分割字符串，只显示测试集名称
                                  return value.split("|")[0];
                                }
                              }
                            }
                          ],
                          yAxis: [
                            {
                              type: 'value',
                              axisLabel: {
                                show: false
                              }
                            }
                          ],
                          series: [
                            {
                              type: 'bar',
                              barWidth: '60%',
                              data: sumTimesData,
                              label: {
                                show: true,
                                position: 'top',
                                fontSize: 10, // 缩小文字大小
                                formatter: function(params) {
                                  var value = params.value;
                                  var name = namesData[params.dataIndex];
                                  var bracketText = '';
                          
                                  if (name) {
                                    var bracketContent = name.match(/\((.*?)\)/);
                                    bracketText = bracketContent ? bracketContent[1] : '';
                                  }
                          
                                  var timeText = '';
                                  if (value >= 3600) {
                                    var hours = Math.floor(value / 3600);
                                    var minutes = Math.floor((value % 3600) / 60);
                                    var seconds = Math.floor(value % 60);
                                    timeText = hours + 'h' + minutes + 'm' + seconds + 's';
                                  } else if (value >= 60) {
                                    var minutes = Math.floor(value / 60);
                                    var seconds = Math.floor(value % 60);
                                    timeText = minutes + 'm' + seconds + 's';
                                  } else {
                                    timeText = value + 's';
                                  }
                          
                                  return timeText + '\n(' + bracketText + ')';
                                }
                              }
                            }
                          ]
                        }
                    });
                    this.initChart = function() {
                       var width = document.getElementById('testsetHistogramWidth').offsetWidth-20;
                        //设置id为testsetLine的div元素的宽高
                        document.getElementById('testsetHistogram').style.width = width + 'px';
                        self.myChart = echarts.init(document.getElementById('testsetHistogram'),'walden');
                        self.myChart.setOption(self.testsetHistogramOption());
                        // 订阅计算属性，以便在数据变化时更新图表
                        ko.computed(function() {
                            self.myChart.setOption(self.testsetHistogramOption());
                        })();
                    };
                
                    this.createTestsetHistogramStatistics = function(){
                        var begin = new Date(self.startFromDate());
                        var end = new Date(self.endByDate());
                        //end时间增加一天
                        end.setDate(end.getDate() + 1);
                        if(begin > end){
                            notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
                            return;
                        }
                        //访问后台接口获取数据
                        utpService.statisticsTestsetDurationByProjectId(selectionManager.selectedProject().id,begin,end,self.statisticsTestsetDurationByProjectIdSuccessFunction, self.statisticsTestsetDurationByProjectIdErrorFunction);
                        $('#testsetHistogramReportSettingModal').modal('hide');
                    };
                    
                   
                    this.statisticsTestsetDurationByProjectIdSuccessFunction=function(data){
                        if(data != null && data.status === 1){
                            let executionStatus = data.result;
                            self.testsetHistogramSumTimesData.removeAll();
                            self.testsetHistogramNamesData.removeAll();
                            //定义一个数组
                            executionStatus.forEach(item => { 
                                self.testsetHistogramSumTimesData.push(item.sumTime);
                                self.testsetHistogramNamesData.push(item.testsetName+"|(成功:"+item.sumSuccessCheckPointCount+",失败:"+item.sumFailCheckPointCount+")");
                            });
                            
                        }
                        else
                            self.statisticsTestsetDurationByProjectIdErrorFunction();
                    };
                    this.statisticsTestsetDurationByProjectIdErrorFunction=function(){
                        notificationService.showError('获取统计数据失败');
                    };
                    // The data-binding shall happen after DOM element be attached.
                    this.attached = function(view, parent) {
                        $('#testsetHistogramSearchBeginDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetHistogramSearchEndDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetHistogramReportSettingModal').on('shown.bs.modal', function() {
                            // self.updateChart();
                        });			
                        self.initChart(); 

                    };
                    
                    this.detached = function(view, parent){
                        clearInterval(self.refreshInterval);
                    };
    
                    this.activate = function() {
                        //获取测试集
                        // self.getTestSetByProject();
                        self.initSearchCondition();
                        self.testsetHistogramAutoFlag(true);
                        self.startAutoRefresh();
                        self.createTestsetHistogramStatistics();
                    };
                }
                return new TestsetHistogramReportViewModel();
            });
