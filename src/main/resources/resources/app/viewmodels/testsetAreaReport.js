define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/selectionManager', 
    'services/reportService','services/notificationService', 'jsoneditor', 'lodash','datepicker'],
            function(app, ko, $, komapping, utpService,selectionManager, reportService, notificationService, JSONEditor, _, datepicker) {
        
                function TestsetAreaReportViewModel() {
                    var self = this;				
                    this.reportService = reportService;
                    this.startFromDate = ko.observable('');
                    this.endByDate = ko.observable('');
                    this.autoRefreshTimeOptions=["1天内","7天内","30天内"];
                    this.autoRefreshTimeValue = ko.observable();
                    this.selectedAutoRefreshTime = ko.observable();
                    this.testsetAreaAutoFlag=ko.observable(false);
                    this.refreshInterval = null;



                    this.startAutoRefresh = function() {
                        if (self.testsetAreaAutoFlag()) {
                            self.refreshInterval = setInterval(function() {
                                self.autoRefreshTimeChanged();
                                self.createTestsetAreaStatistics();
                            },  24 * 60 * 60 * 1000); // 10分钟
                        } else {
                            clearInterval(self.refreshInterval);
                        }
                    };
            
                    this.testsetAreaAutoFlag.subscribe(function(newValue) {
                        self.startAutoRefresh();
                    });

                    this.formatUTCDate = function (date) {
                      var year = date.getUTCFullYear();
                      var month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                      var day = ("0" + date.getUTCDate()).slice(-2);
                      return year + "-" + month + "-" + day;
                    }
                    this.autoRefreshTimeChanged = function () {
                      //获取当前时间
                      var now = new Date();
                      var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
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
                          startDate = new Date(startDate.getTime() - 6 * 24 * 60 * 60 * 1000);
                          break;
                      }
                      self.startFromDate(self.formatUTCDate(startDate));
                    }
                    this.initSearchCondition = function() {
                      var now = new Date();
                      var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0, 0, 0, 0);
                      // 获取当前时间
                      self.endByDate(self.formatUTCDate(startDate));
                      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()-6, 0, 0, 0, 0);
                      self.startFromDate(self.formatUTCDate(startDate)); 
                  }
                    this.protocolConditionSetting = function(){
                        $('#testsetAreaReportSettingModal').modal('show');
                    };
                    this.showChart=ko.observable(false);
                    this.myChart = null;
                    this.chartOptions = {};
                    this.testsetAreaTimesData = ko.observableArray([]);
                    this.seriesData = ko.observableArray([]);
               
                    
                    this.testsetAreaOption =  ko.computed(function() {
                       
                        // var data = self.testsetAreaData();
                        //如果data不为空,则显示图表
                        if(self.seriesData().length > 0){
                            self.showChart(true);
                        }
                   
                        return option = {
                          title: {
                            text: '每日测试数量统计图',
                            left: 'center'
                          },
                          tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                              type: 'shadow'
                            }
                          },
                          legend: {
                            top: '10%' 
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
                              data:  self.testsetAreaTimesData() ,
                              axisLabel: {
                                rotate: 45 // 旋转45度
                              }
                            }
                          ],
                          yAxis: [
                            {
                              type: 'value'
                            }
                          ],
                          series: self.seriesData()
                          
                        };
                    });
                  
                    this.initChart = function() {
                        var width = document.getElementById('testsetAreaWidth').offsetWidth-20;
                        //设置id为testsetLine的div元素的宽高
                        document.getElementById('testsetArea').style.width = width + 'px';
                        self.myChart = echarts.init(document.getElementById('testsetArea'),'walden');
                        self.myChart.setOption(self.testsetAreaOption());
                        // 订阅计算属性，以便在数据变化时更新图表
                        ko.computed(function() {
                            self.myChart.setOption(self.testsetAreaOption());
                        })();
                    };
                
                            
                    
                    this.createTestsetAreaStatistics = function(){
                     
                        var begin = new Date(self.startFromDate());
                        var end = new Date(self.endByDate());
                        end.setDate(end.getDate() + 1);
                        if(begin > end){
                            notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
                            return;
                        }
                        //访问后台接口获取数据
                        utpService.statisticsTestsetsNumberByProjectIdAndTime(selectionManager.selectedProject().id, begin,end,
                         self.statisticsTestsetsNumberByProjectIdAndTimeSuccessFunction, self.statisticsTestsetsNumberByProjectIdAndTimeErrorFunction);
                        $('#testsetAreaReportSettingModal').modal('hide');
                    };

                   this.statisticsTestsetsNumberByProjectIdAndTimeSuccessFunction=function(data){
                        if(data != null && data.status === 1){
                            var dataMaps = data.result;
                            //executionStatus是一个map集合,取出每一个key-value对
                            self.testsetAreaTimesData.removeAll();
                            self.seriesData.removeAll();
                            var keys = Object.keys(dataMaps).sort((a, b) => a.localeCompare(b));
                            //定义一个map集合,key是name ,值是数组
                            var map = new Map();
                            for (var j = 0; j < keys.length; j++) {
                                let key = keys[j];
                                //取出时间
                                let time = key;
                                //只保留年月日
                                time = time.substring(0, 10);
                                self.testsetAreaTimesData.push(time);
                                var executionStatuses = dataMaps[key];
                                // 遍历 executionStatuses 数组
                                for (var i = 0; i < executionStatuses.length; i++) {
                                    var executionStatus = executionStatuses[i];
                                    var testsetName = executionStatus.testsetName;
                                    // 取出 sumTestsetCount
                                    var sumTestsetCount = executionStatus.sumTestsetCount;
                                    // 如果map中已经有了testsetName,则取出数组,在数组的j位置插入sumTestsetCount
                                    if (map.has(testsetName)) {
                                        var testsetAreaDataArray = map.get(testsetName);
                                        testsetAreaDataArray[j] = sumTestsetCount;
                                        map.set(testsetName, testsetAreaDataArray);
                                    } else {
                                    //定义一个数组长度为keys的长度,并且初始化为0
                                        var testsetAreaDataArray = new Array(keys.length).fill(0);
                                        testsetAreaDataArray[j] = sumTestsetCount;
                                        map.set(testsetName, testsetAreaDataArray);
                                  }
                                }
                            }
                            //遍历map,取出key-value对
                            map.forEach((value, key) => {
                                var temp = {
                                    name: key,
                                    type: 'bar',
                                    stack: 'Ad',
                                    emphasis: {
                                        focus: 'series'
                                    },
                                    data: value
                                };
                                self.seriesData.push(temp);
                            });
                            
                        }
                        else
                            self.statisticsTestsetsNumberByProjectIdAndTimeErrorFunction();
                    };
                    this.statisticsTestsetsNumberByProjectIdAndTimeErrorFunction=function(){
                        notificationService.showError('获取统计数据失败');
                    };
                    // The data-binding shall happen after DOM element be attached.
                    this.attached = function(view, parent) {
                        $('#testsetAreaSearchBeginDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetAreaSearchEndDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetAreaReportSettingModal').on('shown.bs.modal', function() {
                            // self.updateChart();
                        });			
                        self.initChart(); 

                    };
                    
                    this.detached = function(view, parent){
                        clearInterval(self.refreshInterval);
                    };
    
                    this.activate = function() {
                        self.initSearchCondition();
                        self.testsetAreaAutoFlag(true);
                        self.startAutoRefresh();
                        self.createTestsetAreaStatistics();
                    };
                }
                return new TestsetAreaReportViewModel();
            });
    