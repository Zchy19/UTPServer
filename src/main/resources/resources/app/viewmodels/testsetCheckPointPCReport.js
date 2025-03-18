define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/selectionManager', 
    'services/reportService','services/cmdConvertService','services/notificationService', 'jsoneditor', 'lodash','datepicker'],
            function(app, ko, $, komapping, utpService,selectionManager, reportService, cmdConvertService,notificationService, JSONEditor, _, datepicker) {
        
                function TestsetCheckPointPCReportViewModel() {
                    var self = this;				
                    this.reportService = reportService;
                    this.startFromDate = ko.observable('');
                    this.endByDate = ko.observable('');
                    this.cmdConvertService = cmdConvertService;
                    this.autoRefreshTimeOptions=["1天内","7天内","30天内"];
                    this.autoRefreshTimeValue = ko.observable();
                    this.selectedAutoRefreshTime = ko.observable();
                    this.testsetCheckPointPCAutoFlag=ko.observable(false);
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
                          self.selectedTestset(self.testsets()[0]);
                          if(self.aotoFirst){
                            // self.createTestsetPieChartStatistics();
                            self.createTestsetCheckPointPCStatistics();
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
                        if (self.testsetCheckPointPCAutoFlag()) {
                            self.refreshInterval = setInterval(function() {
                                self.autoRefreshTimeChanged();
                                self.createTestsetCheckPointPCStatistics();
                            }, 24 * 60 * 60 * 1000); // 10分钟
                        } else {
                            clearInterval(self.refreshInterval);
                        }
                    };
            
                    this.testsetCheckPointPCAutoFlag.subscribe(function(newValue) {
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
                        $('#testsetCheckPointPCReportSettingModal').modal('show');
                    };
                    this.showChart=ko.observable(false);
                    this.myChart = null;
                    this.chartOptions = {};
                    this.testsetCheckPointPCNamesData = ko.observableArray([]);
                    this.testsetCheckPointPCSumManualDecisionLevel0Data = ko.observableArray([]);
                    this.testsetCheckPointPCSumManualDecisionLevel1Data = ko.observableArray([]);
                    this.testsetCheckPointPCSumManualDecisionLevel2Data = ko.observableArray([]);
                    this.testsetCheckPointPCSumManualDecisionLevel3Data = ko.observableArray([]);
                    this.testsetCheckPointPCSumSuccessCheckPointCountData = ko.observableArray([]);
                    this.testsetCheckPointPCOption = ko.computed(function() {
                      const namesData = self.testsetCheckPointPCNamesData();
                      const sumSuccessCheckPointCount = self.testsetCheckPointPCSumSuccessCheckPointCountData();
                      const sumManualDecisionLevel0Data = self.testsetCheckPointPCSumManualDecisionLevel0Data();
                      const sumManualDecisionLevel1Data = self.testsetCheckPointPCSumManualDecisionLevel1Data();
                      const sumManualDecisionLevel2Data = self.testsetCheckPointPCSumManualDecisionLevel2Data();
                      const sumManualDecisionLevel3Data = self.testsetCheckPointPCSumManualDecisionLevel3Data();
                      // 如果data不为空,则显示图表
                      var name = null;
                      if (namesData.length > 0) {
                          self.showChart(true);
                          name = self.selectedTestset().name();
                      }
                      return {
                          title: {
                              text: name,
                              left: 'center'
                          },
                          tooltip: {
                              trigger: 'axis',
                              axisPointer: {
                                  // Use axis to trigger tooltip
                                  type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                              }
                          },
                          legend: {
                              top: '10%' // 将图例下移
                          },
                          grid: {
                              left: '3%',
                              right: '4%',
                              bottom: '3%',
                              top: '20%', // 将图表整体下移
                              containLabel: true
                          },
                          yAxis: {
                              type: 'category',
                              data: namesData
                          },
                          xAxis: {
                              type: 'value'
                          },
                          series: [
                              {
                                  name: '成功',
                                  type: 'bar',
                                  stack: 'total',
                                  label: {
                                      show: true
                                  },
                                  emphasis: {
                                      focus: 'series'
                                  },
                                  data: sumSuccessCheckPointCount
                              },
                              {
                                  name: self.cmdConvertService.manualDecisionLevel.manualDecisionLevel0,
                                  type: 'bar',
                                  stack: 'total',
                                  label: {
                                      show: true
                                  },
                                  emphasis: {
                                      focus: 'series'
                                  },
                                  data: sumManualDecisionLevel0Data
                              },
                              {
                                  name: self.cmdConvertService.manualDecisionLevel.manualDecisionLevel1,
                                  type: 'bar',
                                  stack: 'total',
                                  label: {
                                      show: true
                                  },
                                  emphasis: {
                                      focus: 'series'
                                  },
                                  data: sumManualDecisionLevel1Data
                              },
                              {
                                  name: self.cmdConvertService.manualDecisionLevel.manualDecisionLevel2,
                                  type: 'bar',
                                  stack: 'total',
                                  label: {
                                      show: true
                                  },
                                  emphasis: {
                                      focus: 'series'
                                  },
                                  data: sumManualDecisionLevel2Data
                              },
                              {
                                  name: self.cmdConvertService.manualDecisionLevel.manualDecisionLevel3,
                                  type: 'bar',
                                  stack: 'total',
                                  label: {
                                      show: true
                                  },
                                  emphasis: {
                                      focus: 'series'
                                  },
                                  data: sumManualDecisionLevel3Data
                              }
                          ]
                      };
                  });
                    this.initChart = function() {
                       var width = document.getElementById('testsetCheckPointPCWidth').offsetWidth-20;
                        //设置id为testsetLine的div元素的宽高
                        document.getElementById('testsetCheckPointPC').style.width = width + 'px';
                        self.myChart = echarts.init(document.getElementById('testsetCheckPointPC'),'walden');
                        self.myChart.setOption(self.testsetCheckPointPCOption());
                        // 订阅计算属性，以便在数据变化时更新图表
                        ko.computed(function() {
                            self.myChart.setOption(self.testsetCheckPointPCOption());
                        })();
                    };
                
                    this.createTestsetCheckPointPCStatistics = function(){
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
                        utpService.statisticsManualDecisionLevelByProjectIdAndTestsetId(selectionManager.selectedProject().id,testsetId,begin,end,self.statisticsTimeByProjectIdAndTestsetIdSuccessFunction, self.statisticsTimeByProjectIdAndTestsetIdErrorFunction);
                        $('#testsetCheckPointPCReportSettingModal').modal('hide');
                    };
                    
                  
                    this.statisticsTimeByProjectIdAndTestsetIdSuccessFunction=function(data){
                        if(data != null && data.status === 1){
                            let dataMaps = data.result;
                            self.testsetCheckPointPCNamesData.removeAll();
                            self.testsetCheckPointPCSumManualDecisionLevel0Data.removeAll();
                            self.testsetCheckPointPCSumManualDecisionLevel1Data.removeAll();
                            self.testsetCheckPointPCSumManualDecisionLevel2Data.removeAll();
                            self.testsetCheckPointPCSumManualDecisionLevel3Data.removeAll();
                            self.testsetCheckPointPCSumSuccessCheckPointCountData.removeAll();
                            Object.entries(dataMaps).forEach(([key, value]) => {
                              // var temp = {
                              //     name: key,
                              //     value: value.sumTime,
                              //     sumManualDecisionLevel0: value.sumManualDecisionLevel0,
                              //     sumManualDecisionLevel1: value.sumManualDecisionLevel1,
                              //     sumManualDecisionLevel2: value.sumManualDecisionLevel2,
                              //     sumManualDecisionLevel3: value.sumManualDecisionLevel3,
                              //     sumSuccessCheckPointCount: value.sumSuccessCheckPointCount
                              // };
                              self.testsetCheckPointPCNamesData.push(key);
                              self.testsetCheckPointPCSumManualDecisionLevel0Data.push(value.sumManualDecisionLevel0);
                              self.testsetCheckPointPCSumManualDecisionLevel1Data.push(value.sumManualDecisionLevel1);
                              self.testsetCheckPointPCSumManualDecisionLevel2Data.push(value.sumManualDecisionLevel2);
                              self.testsetCheckPointPCSumManualDecisionLevel3Data.push(value.sumManualDecisionLevel3);
                              self.testsetCheckPointPCSumSuccessCheckPointCountData.push(value.sumSuccessCheckPointCount);
                            });
                        

                            // self.testsetCheckPointPCSumTimesData.removeAll();
                            // self.testsetCheckPointPCNamesData.removeAll();
                            // //定义一个数组
                            // executionStatus.forEach(item => { 
                            //     self.testsetCheckPointPCSumTimesData.push(item.sumTime);
                            //     self.testsetCheckPointPCNamesData.push(item.testsetName+"|(成功:"+item.sumSuccessCheckPointCount+",失败:"+item.sumFailCheckPointCount+")");
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
                        $('#testsetCheckPointPCSearchBeginDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetCheckPointPCSearchEndDate').datepicker({
                            format: "yyyy-mm-dd",
                            todayHighlight: true,
                            language: "zh-CN",
                            autoclose: true
                        });
                        $('#testsetCheckPointPCReportSettingModal').on('shown.bs.modal', function() {
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
                        self.testsetCheckPointPCAutoFlag(true);
                        self.startAutoRefresh();
                       
                    };
                }
                return new TestsetCheckPointPCReportViewModel();
            });
    