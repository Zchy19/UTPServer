define(['durandal/app', 'knockout', 'jquery', 'komapping', 'services/utpService', 'services/selectionManager',
  'services/reportService', 'services/notificationService', 'jsoneditor', 'lodash', 'datepicker'],
  function (app, ko, $, komapping, utpService, selectionManager, reportService, notificationService, JSONEditor, _, datepicker) {

    function TestsetLineReportViewModel() {
      var self = this;
      this.reportService = reportService;
      this.startFromDate = ko.observable('');
      this.endByDate = ko.observable('');
      this.autoRefreshTimeOptions = ["1天内", "7天内", "30天内"];
      this.autoRefreshTimeValue = ko.observable();
      this.selectedAutoRefreshTime = ko.observable();
      this.testsetLineAutoFlag = ko.observable(false);
      this.refreshInterval = null;



      this.startAutoRefresh = function () {
        if (self.testsetLineAutoFlag()) {
          self.refreshInterval = setInterval(function () {
            self.autoRefreshTimeChanged();
            self.createTestsetLineStatistics();
          }, 24 * 60 * 60 * 1000); // 10分钟
        } else {
          clearInterval(self.refreshInterval);
        }
      };

      this.testsetLineAutoFlag.subscribe(function (newValue) {
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

      this.initSearchCondition = function () {
        var now = new Date();
        var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        // 获取当前时间
        self.endByDate(self.formatUTCDate(startDate));
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
        self.startFromDate(self.formatUTCDate(startDate));
      }
      this.protocolConditionSetting = function () {
        // self.getTestSetByProject();
        $('#testsetLineReportSettingModal').modal('show');
      };
      this.showChart = ko.observable(false);
      this.myChart = null;
      this.chartOptions = {};
      this.testsetAreaTimesData = ko.observableArray([]);
      this.seriesData = ko.observableArray([]);
      this.testsetAreaNamesData = ko.observableArray([]);

      
      this.testsetLineOption = ko.computed(function () {
        var data = self.testsetAreaTimesData();
        if (data.length > 0) {
          self.showChart(true);
        }
        return {
          title: {
            text: '整体质量走势图',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              const xAxisValue = params[0].axisValue;
              const seriesInfo = params.map(param => {
                const rawData = self.seriesData().find(series => series.name === param.seriesName).rawData[param.dataIndex];
                return `${param.seriesName}: ${param.value}% (${rawData.sumSuccessCount}/${rawData.sumTestsetCount})`;
              }).join('<br/>');
              return `时间: ${xAxisValue}<br/>${seriesInfo}`;
            }
          },
          legend: {
            data: self.testsetAreaNamesData(),
            top: '10%' 
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
            data: self.testsetAreaTimesData(),
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              formatter: function (value) {
                return value + '%';
              }
            }
          },
          series: self.seriesData().map(series => ({
            ...series,
            data: series.data.map(value => parseFloat(value))
          }))
        };
      });


      // this.testsetsType = komapping.fromJS([], {
      //   key: function (item) {
      //     return ko.utils.unwrapObservable(item.id);
      //   }
      // });
      // this.selectedTestsetType = ko.observable();
     
      // this.getTestSetByProjectSuccessFunction = function (data) {
      //   if (data != null && data.status === 1) {
      //     self.testsets.removeAll();
          
      //     var testSetInfo = data.result;
      //     //对数据进行映射
      //     testSetInfo.forEach(function (item) {
      //       //testsets中只存储名称不同的项目,名称相同的剔除
      //       if (self.testsetsType().findIndex(function (element) { return element.description() == item.description; }) == -1) {
      //         self.testsetsType.push(komapping.fromJS(item));
      //       }
      //     });
      //     if (self.selectedTestsetType() == undefined) {
      //       //默认选中第一个
      //       self.selectedTestsetType(self.testsetsType()[0]);
      //     }
      //   }
      //   else
      //     self.getTestSetByProjectErrorFunction();
      // };
      // this.getTestSetByProjectErrorFunction = function () {
      //   notificationService.showError('获取测试集失败');
      // };

      // this.getTestSetByProject = function () {
      //   utpService.getTestSetByProject(selectionManager.selectedProject().id, self.getTestSetByProjectSuccessFunction, self.getTestSetByProjectErrorFunction);
      // };
      this.initChart = function () {
        //获取id为testsetLineWidth的div元素的宽
        var width = document.getElementById('testsetLineWidth').offsetWidth-20;
        //设置id为testsetLine的div元素的宽高
        document.getElementById('testsetLine').style.width = width + 'px';
        self.myChart = echarts.init(document.getElementById('testsetLine'), 'walden');
        self.myChart.setOption(self.testsetLineOption());
        // 订阅计算属性，以便在数据变化时更新图表
        ko.computed(function () {
          self.myChart.setOption(self.testsetLineOption());
        })();
      };


      this.createTestsetLineStatistics = function () {

        var begin = new Date(self.startFromDate());
        var end = new Date(self.endByDate());
        end.setDate(end.getDate() + 1);
        if (begin > end) {
          notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
          return;
        }
        //访问后台接口获取数据
        utpService.statisticsTestsetsNumberByProjectIdAndTime(selectionManager.selectedProject().id, begin, end,
          self.statisticsTestsetsNumberByProjectIdAndTimeSuccessFunction, self.statisticsTestsetsNumberByProjectIdAndTimeErrorFunction);
        $('#testsetLineReportSettingModal').modal('hide');
      };

      this.statisticsTestsetsNumberByProjectIdAndTimeSuccessFunction = function (data) {
        self.testsetAreaTimesData.removeAll();
        self.seriesData.removeAll();
        self.testsetAreaNamesData.removeAll();
        if (data != null && data.status === 1) {
          var dataMaps = data.result;
          var keys = Object.keys(dataMaps).sort((a, b) => a.localeCompare(b));
          var map = new Map();
          for (var j = 0; j < keys.length; j++) {
            let key = keys[j];
            let time = key.substring(0, 10);
            self.testsetAreaTimesData.push(time);
            var executionStatuses = dataMaps[key];
            for (var i = 0; i < executionStatuses.length; i++) {
              var executionStatus = executionStatuses[i];
              var testsetName = executionStatus.testsetName;
              var sumTestsetCount = executionStatus.sumTestsetCount;
              var sumSuccessCount = executionStatus.sumSuccessCount;
              if (map.has(testsetName)) {
                var testsetAreaDataArray = map.get(testsetName);
                testsetAreaDataArray[j] = {
                  percentage: (sumSuccessCount / sumTestsetCount).toFixed(4),
                  sumSuccessCount: sumSuccessCount,
                  sumTestsetCount: sumTestsetCount
                };
                map.set(testsetName, testsetAreaDataArray);
              } else {
                var testsetAreaDataArray = new Array(keys.length).fill({ percentage: 0, sumSuccessCount: 0, sumTestsetCount: 0 });
                testsetAreaDataArray[j] = {
                  percentage: (sumSuccessCount / sumTestsetCount).toFixed(4),
                  sumSuccessCount: sumSuccessCount,
                  sumTestsetCount: sumTestsetCount
                };
                map.set(testsetName, testsetAreaDataArray);
              }
            }
          }
          map.forEach((value, key) => {
            var temp = {
              name: key,
              type: 'line',
              data: value.map(v => v.percentage * 100),
              rawData: value
            };
            self.seriesData.push(temp);
            self.testsetAreaNamesData.push(key);
          });
          self.myChart.setOption(self.testsetLineOption(), true);
        } else {
          self.statisticsTestsetsNumberByProjectIdAndTimeErrorFunction();
        }
      };
      this.statisticsTestsetsNumberByProjectIdAndTimeErrorFunction = function () {
        notificationService.showError('获取统计数据失败');
      };
      // The data-binding shall happen after DOM element be attached.
      this.attached = function (view, parent) {
        $('#testsetLineSearchBeginDate').datepicker({
          format: "yyyy-mm-dd",
          todayHighlight: true,
          language: "zh-CN",
          autoclose: true
        });
        $('#testsetLineSearchEndDate').datepicker({
          format: "yyyy-mm-dd",
          todayHighlight: true,
          language: "zh-CN",
          autoclose: true
        });
        $('#testsetLineReportSettingModal').on('shown.bs.modal', function () {
          // self.updateChart();
        });
        self.initChart();

      };

      this.detached = function (view, parent) {
        clearInterval(self.refreshInterval);
      };

      this.activate = function () {
        //获取测试集
        // self.getTestSetByProject();
        self.initSearchCondition();
        self.testsetLineAutoFlag(true);
        self.startAutoRefresh();
        self.createTestsetLineStatistics();
      };
    }
    return new TestsetLineReportViewModel();
  });
