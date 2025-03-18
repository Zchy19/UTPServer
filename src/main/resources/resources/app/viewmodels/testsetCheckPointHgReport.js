define(['durandal/app', 'knockout', 'jquery', 'komapping', 'services/utpService', 'services/selectionManager', 
  'services/cmdConvertService', 'services/reportService', 'services/notificationService', 'jsoneditor', 'lodash', 'datepicker'],
  function(app, ko, $, komapping, utpService, selectionManager, cmdConvertService, reportService, notificationService, JSONEditor, _, datepicker) {

      function TestsetCheckPointHgReportViewModel() {
          const self = this;
          this.reportService = reportService;
          this.startFromDate = ko.observable('');
          this.endByDate = ko.observable('');
          this.cmdConvertService = cmdConvertService;
          this.autoRefreshTimeOptions = ["1天内", "7天内", "30天内"];
          this.autoRefreshTimeValue = ko.observable();
          this.selectedAutoRefreshTime = ko.observable();
          this.testsetCheckPointHgAutoFlag = ko.observable(false);
          this.refreshInterval = null;

          this.startAutoRefresh = function() {
              if (self.testsetCheckPointHgAutoFlag()) {
                  self.refreshInterval = setInterval(function() {
                      self.autoRefreshTimeChanged();
                      self.createTestsetCheckPointHgStatistics();
                  }, 24 * 60 * 60 * 1000); // 24小时
              } else {
                  clearInterval(self.refreshInterval);
              }
          };

          this.testsetCheckPointHgAutoFlag.subscribe(function(newValue) {
              self.startAutoRefresh();
          });

          this.formatUTCDate = function(date) {
              const year = date.getUTCFullYear();
              const month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // Months are zero-based
              const day = ("0" + date.getUTCDate()).slice(-2);
              return year + "-" + month + "-" + day;
          };

          this.autoRefreshTimeChanged = function() {
              // 获取当前时间
              const now = new Date();
              let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
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
          };

          this.initSearchCondition = function() {
              const now = new Date();
              let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
              // 获取当前时间
              self.endByDate(self.formatUTCDate(startDate));
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
              self.startFromDate(self.formatUTCDate(startDate));
          };

          this.protocolConditionSetting = function() {
              $('#testsetCheckPointHgReportSettingModal').modal('show');
          };

          this.showChart = ko.observable(false);
          this.myChart = null;
          this.chartOptions = {};
          this.testsetCheckPointHgNamesData = ko.observableArray([]);
          this.testsetCheckPointHgSumManualDecisionLevel0Data = ko.observableArray([]);
          this.testsetCheckPointHgSumManualDecisionLevel1Data = ko.observableArray([]);
          this.testsetCheckPointHgSumManualDecisionLevel2Data = ko.observableArray([]);
          this.testsetCheckPointHgSumManualDecisionLevel3Data = ko.observableArray([]);
          this.testsetCheckPointHgSumManualDecisionLevel4Data = ko.observableArray([]);
          this.testsetCheckPointHgSumManualDecisionLevel5Data = ko.observableArray([]);
          this.testsetCheckPointHgSumSuccessCheckPointCountData = ko.observableArray([]);
          this.testsetCheckPointHgOption = ko.computed(function() {
              const namesData = self.testsetCheckPointHgNamesData();
              const sumSuccessCheckPointCount = self.testsetCheckPointHgSumSuccessCheckPointCountData();
              const sumManualDecisionLevel0Data = self.testsetCheckPointHgSumManualDecisionLevel0Data();
              const sumManualDecisionLevel1Data = self.testsetCheckPointHgSumManualDecisionLevel1Data();
              const sumManualDecisionLevel2Data = self.testsetCheckPointHgSumManualDecisionLevel2Data();
              const sumManualDecisionLevel3Data = self.testsetCheckPointHgSumManualDecisionLevel3Data();
              const sumManualDecisionLevel4Data = self.testsetCheckPointHgSumManualDecisionLevel4Data();
              const sumManualDecisionLevel5Data = self.testsetCheckPointHgSumManualDecisionLevel5Data();
              // 如果data不为空,则显示图表
              if (namesData.length > 0) {
                  self.showChart(true);
              }
              return {
                  tooltip: {
                      trigger: 'axis',
                      axisPointer: {
                          // Use axis to trigger tooltip
                          type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                      }
                  },
                  legend: {},
                  grid: {
                      left: '3%',
                      right: '4%',
                      bottom: '3%',
                      containLabel: true
                  },
                  xAxis: {
                      type: 'category',
                      data: namesData
                  },
                  yAxis: {
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
              const width = document.getElementById('testsetCheckPointHgWidth').offsetWidth - 20;
              // 设置id为testsetLine的div元素的宽高
              document.getElementById('testsetCheckPointHg').style.width = width + 'px';
              self.myChart = echarts.init(document.getElementById('testsetCheckPointHg'), 'walden');
              self.myChart.setOption(self.testsetCheckPointHgOption());
              // 订阅计算属性，以便在数据变化时更新图表
              ko.computed(function() {
                  self.myChart.setOption(self.testsetCheckPointHgOption());
              })();
          };

          this.createTestsetCheckPointHgStatistics = function() {
              const begin = new Date(self.startFromDate());
              const end = new Date(self.endByDate());
              // end时间增加一天
              end.setDate(end.getDate() + 1);
              if (begin > end) {
                  notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
                  return;
              }
              // 访问后台接口获取数据
              utpService.statisticsTestsetCheckPointByProjectId(selectionManager.selectedProject().id, begin, end, self.statisticsTestsetDurationByProjectIdSuccessFunction, self.statisticsTestsetDurationByProjectIdErrorFunction);
              $('#testsetCheckPointHgReportSettingModal').modal('hide');
          };

          this.statisticsTestsetDurationByProjectIdSuccessFunction = function(data) {
              if (data != null && data.status === 1) {
                  const executionStatus = data.result;
                  self.testsetCheckPointHgNamesData.removeAll();
                  self.testsetCheckPointHgSumManualDecisionLevel0Data.removeAll();
                  self.testsetCheckPointHgSumManualDecisionLevel1Data.removeAll();
                  self.testsetCheckPointHgSumManualDecisionLevel2Data.removeAll();
                  self.testsetCheckPointHgSumManualDecisionLevel3Data.removeAll();
                  self.testsetCheckPointHgSumManualDecisionLevel4Data.removeAll();
                  self.testsetCheckPointHgSumManualDecisionLevel5Data.removeAll();
                  self.testsetCheckPointHgSumSuccessCheckPointCountData.removeAll();
                  // 定义一个数组
                  executionStatus.forEach(item => {
                      self.testsetCheckPointHgNamesData.push(item.testsetName);
                      self.testsetCheckPointHgSumManualDecisionLevel0Data.push(item.sumManualDecisionLevel0);
                      self.testsetCheckPointHgSumManualDecisionLevel1Data.push(item.sumManualDecisionLevel1);
                      self.testsetCheckPointHgSumManualDecisionLevel2Data.push(item.sumManualDecisionLevel2);
                      self.testsetCheckPointHgSumManualDecisionLevel3Data.push(item.sumManualDecisionLevel3);
                      self.testsetCheckPointHgSumManualDecisionLevel4Data.push(item.sumManualDecisionLevel4);
                      self.testsetCheckPointHgSumManualDecisionLevel5Data.push(item.sumManualDecisionLevel5);
                      self.testsetCheckPointHgSumSuccessCheckPointCountData.push(item.sumSuccessCheckPointCount);
                  });

              } else {
                  self.statisticsTestsetDurationByProjectIdErrorFunction();
              }
          };

          this.statisticsTestsetDurationByProjectIdErrorFunction = function() {
              notificationService.showError('获取统计数据失败');
          };

          // The data-binding shall happen after DOM element be attached.
          this.attached = function(view, parent) {
              $('#testsetCheckPointHgSearchBeginDate').datepicker({
                  format: "yyyy-mm-dd",
                  todayHighlight: true,
                  language: "zh-CN",
                  autoclose: true
              });
              $('#testsetCheckPointHgSearchEndDate').datepicker({
                  format: "yyyy-mm-dd",
                  todayHighlight: true,
                  language: "zh-CN",
                  autoclose: true
              });
              $('#testsetCheckPointHgReportSettingModal').on('shown.bs.modal', function() {
                  // self.updateChart();
              });
              self.initChart();
          };

          this.detached = function(view, parent) {
              clearInterval(self.refreshInterval);
          };

          this.activate = function() {
              // 获取测试集
              // self.getTestSetByProject();
              self.initSearchCondition();
              self.testsetCheckPointHgAutoFlag(true);
              self.startAutoRefresh();
              self.createTestsetCheckPointHgStatistics();
          };
      }
      return new TestsetCheckPointHgReportViewModel();
  });