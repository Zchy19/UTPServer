define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/selectionManager', 
    'services/reportService','services/notificationService', 'jsoneditor', 'lodash','datepicker'],
            function(app, ko, $, komapping, utpService,selectionManager, reportService, notificationService, JSONEditor, _, datepicker) {
        
                function TestsetElectricReportOneViewModel() {
                    var self = this;				
                    this.reportService = reportService;
                    this.startFromDate = ko.observable('');
                    this.endByDate = ko.observable('');
                    this.autoRefreshTimeOptions=["1天内","7天内","30天内"];
                    this.autoRefreshTimeValue = ko.observable();
                    this.selectedAutoRefreshTime = ko.observable();
                    this.testsetElectricOneAutoFlag=ko.observable(false);
                    this.refreshInterval = null;
                    this.aotoFirst=false;
                    this.selectedTestset = ko.observable();
                    this.testsets = komapping.fromJS([], {
                      key: function (item) {
                        return ko.utils.unwrapObservable(item.id);
                      }
                    });
                    this.getTestSetByProjectSuccessFunction = function (data) {
                      if (data != null && data.status === 1) {
                        var testSetInfo = data.result;
                        komapping.fromJS(testSetInfo, {}, self.testsets);
                        if (self.selectedTestset() == undefined) {
                          //默认选中第一个
                          self.selectedTestset(self.testsets()[1]);
                          if(self.aotoFirst){
                            // self.createTestsetPieChartStatistics();
                            self.createTestsetElectricOneStatistics();
                            self.aotoFirst=false;
                          }
                        }
                      }
                      else
                        self.getTestSetByProjectErrorFunction();
                    };
                    this.getTestSetByProjectErrorFunction = function () {
                      notificationService.showError('获取测试集失败');
                    };
              
                    this.getTestSetByProject = function () {
                      utpService.getTestSetByProject(selectionManager.selectedProject().id, self.getTestSetByProjectSuccessFunction, self.getTestSetByProjectErrorFunction);
                    };
              

                    this.startAutoRefresh = function() {
                        if (self.testsetElectricOneAutoFlag()) {
                            self.refreshInterval = setInterval(function() {
                                self.autoRefreshTimeChanged();
                                self.createTestsetElectricOneStatistics();
                            }, 24 * 60 * 60 * 1000); // 10分钟
                        } else {
                            clearInterval(self.refreshInterval);
                        }
                    };
            
                    this.testsetElectricOneAutoFlag.subscribe(function(newValue) {
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
                      self.getTestSetByProject();
                        $('#testsetElectricOneReportOneSettingModal').modal('show');
                    };
                    this.showChart=ko.observable(false);
                    this.myChart = null;
                    this.chartOptions = {};
                    this.testsetElectricOneSeriesData = ko.observableArray([]);
                    this.testsetElectricOneOption = ko.computed(function() {
                      var seriesData = self.testsetElectricOneSeriesData();
                      var totalTime = 0;
                      var totalFailCount = 0;
                      var totalSuccessCount = 0;
                  
                      seriesData.forEach(function(item) {
                          totalTime += item.value;
                          totalFailCount += item.sumFailCheckPointCount;
                          totalSuccessCount += item.sumSuccessCheckPointCount;
                      });
                      var name=null;
                      if (seriesData.length > 0) {
                          self.showChart(true);
                          name =self.selectedTestset().name();
                      }
                  
                      return{
                        title: {
                          text: name,
                          subtext:'运行: ' + formatTime(totalTime) + ', 成功: ' + totalSuccessCount+ ', 失败: ' + totalFailCount ,
                          left: 'center'
                        },
                        tooltip: {
                          trigger: 'item'
                        },
                        legend: {
                          orient: 'vertical',
                          left: 'left',
                          type: 'scroll'
                        },
                        series: [
                          {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            center: ['53%', '60%'],
                            data: seriesData,
                            emphasis: {
                              itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                              }
                            },
                            label: {
                              formatter: function(params) {
                                var data = params.data;
                                return `${data.name}(运行: ${formatTime(data.value)})`;
                              }
                            },
                            tooltip: {
                              trigger: 'item',
                              formatter: function(params) {
                                var data = params.data;
                                return `${data.name}<br/>运行: ${formatTime(data.value)}<br/>成功: ${data.sumSuccessCheckPointCount}<br/>失败: ${data.sumFailCheckPointCount}`;
                              }
                            }
                          }
                        ]
                      }
                      
                      // 辅助函数：将秒数转换为时分秒格式
                      function formatTime(seconds) {
                        var h = Math.floor(seconds / 3600);
                        var m = Math.floor((seconds % 3600) / 60);
                        var s = seconds % 60;
                        return `${h}h${m}m${s}s`;
                      }
                  });
                    this.initChart = function() {
                       var width = document.getElementById('testsetElectricOneWidth').offsetWidth-20;
                        //设置id为testsetLine的div元素的宽高
                        document.getElementById('testsetElectricOne').style.width = width + 'px';
                        self.myChart = echarts.init(document.getElementById('testsetElectricOne'),'walden');
                        self.myChart.setOption(self.testsetElectricOneOption());
                        // 订阅计算属性，以便在数据变化时更新图表
                        ko.computed(function() {
                            self.myChart.setOption(self.testsetElectricOneOption());
                        })();
                    };
                
                    this.createTestsetElectricOneStatistics = function(){
                        var begin = new Date(self.startFromDate());
                        var end = new Date(self.endByDate());
                        //end时间增加一天
                        end.setDate(end.getDate() + 1);
                        if(begin > end){
                            notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
                            return;
                        }
                        let testsetId = self.selectedTestset().id;
                        //访问后台接口获取数据
                        utpService.statisticsTimeByProjectIdAndTestsetId(selectionManager.selectedProject().id,testsetId,begin,end,self.statisticsTimeByProjectIdAndTestsetIdSuccessFunction, self.statisticsTimeByProjectIdAndTestsetIdErrorFunction);
                        $('#testsetElectricOneReportOneSettingModal').modal('hide');
                    };
                    
                    this.statisticsTimeByProjectIdAndTestsetIdSuccessFunction=function(data){
                      self.testsetElectricOneSeriesData.removeAll();
                        if(data != null && data.status === 1){
                            let dataMaps = data.result;
                            Object.entries(dataMaps).forEach(([key, value]) => {
                              var temp = {
                                  name: key,
                                  value: value.sumTime,
                                  sumFailCheckPointCount: value.sumFailCheckPointCount,
                                  sumSuccessCheckPointCount: value.sumSuccessCheckPointCount
                              };
                              self.testsetElectricOneSeriesData.push(temp);
                            });
                        

                            // self.testsetElectricOneSumTimesData.removeAll();
                            // self.testsetElectricOneNamesData.removeAll();
                            // //定义一个数组
                            // executionStatus.forEach(item => { 
                            //     self.testsetElectricOneSumTimesData.push(item.sumTime);
                            //     self.testsetElectricOneNamesData.push(item.testsetName+"|(成功:"+item.sumSuccessCheckPointCount+",失败:"+item.sumFailCheckPointCount+")");
                            // });
                            
                        }
                        else
                            self.statisticsTimeByProjectIdAndTestsetIdErrorFunction();
                    };
                    this.statisticsTimeByProjectIdAndTestsetIdErrorFunction=function(){
                        notificationService.showError('获取统计数据失败');
                    };
                    // The data-binding shall happen after DOM element be attached.
                    this.attached = function(view, parent) {
                        $('#testsetElectricOneSearchBeginDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetElectricOneSearchEndDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetElectricOneReportOneSettingModal').on('shown.bs.modal', function() {
                            // self.updateChart();
                        });			
                        self.initChart(); 

                    };
                    
                    this.detached = function(view, parent){
                        clearInterval(self.refreshInterval);
                    };
    
                    this.activate = function() {
                      self.aotoFirst=true;
                        //获取测试集
                        self.getTestSetByProject();
                        self.initSearchCondition();
                        self.testsetElectricOneAutoFlag(true);
                        self.startAutoRefresh();
                       
                    };
                }
                return new TestsetElectricReportOneViewModel();
            });
    