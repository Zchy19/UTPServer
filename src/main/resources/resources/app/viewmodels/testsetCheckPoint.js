define(['durandal/app', 'knockout', 'jquery', 'komapping', 'services/utpService', 'services/selectionManager',
  'services/reportService', 'services/notificationService', 'jsoneditor', 'lodash', 'datepicker'],
  function (app, ko, $, komapping, utpService, selectionManager, reportService, notificationService, JSONEditor, _, datepicker) {

    function TestsetCheckPointViewModel() {
      var self = this;
      this.reportService = reportService;
      this.startFromDate = ko.observable('');
      this.endByDate = ko.observable('');
      this.autoRefreshTimeOptions = ["1天内", "7天内", "30天内"];
      this.autoRefreshTimeValue = ko.observable();
      this.selectedAutoRefreshTime = ko.observable();
      this.testPointAutoFlag = ko.observable(false);
      this.refreshInterval = null;



      this.startAutoRefresh = function () {
        if (self.testPointAutoFlag()) {
          self.refreshInterval = setInterval(function () {
            self.autoRefreshTimeChanged();
            self.createtestPointStatistics();
          }, 24 * 60 * 60 * 1000); // 10分钟
        } else {
          clearInterval(self.refreshInterval);
        }
      };

      this.testPointAutoFlag.subscribe(function (newValue) {
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
        $('#testsetCheckPointSettingModal').modal('show');
      };
      this.showChart = ko.observable(false);
      this.myChart = null;
      this.chartOptions = {};
      this.testsetCheckPointNames = ko.observableArray([]);
      this.testsetCheckPointSeriesData = ko.observableArray([]);
      
      this.testPointOption = ko.computed(function () {
        var data = self.testsetCheckPointNames();
        if (data.length > 0) {
          self.showChart(true);
        }
        return {
          // title: {
          //   text: '检查点统计',
          //   left: 'center'
          // },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          legend: {
            type: 'scroll',
            orient: 'horizontal', // 设置为水平排列
            left: 10, 
            top: 10,
            right: 10, 
            data: self.testsetCheckPointNames()
        },
          series: [
            {
              name: '检查点',
              type: 'pie',
              radius: '55%',
              center: ['40%', '60%'],
              data: self.testsetCheckPointSeriesData(),
              label: {
                show: true,
                formatter: function(params) {
                  // 获取数据数组的长度
                  var dataLength = self.testsetCheckPointSeriesData().length;
                  // 截取部分文字，如果文字过长
                  var name = params.name.length > 5 ? params.name.substring(0,5) + '...' : params.name;
                  // 返回标签内容，显示数据项的名称、数值和数据数组的长度
                  return `${name}: ${params.value}`;
                }
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
      });

      this.initChart = function () {
        //获取id为testPointWidth的div元素的宽
        var width = document.getElementById('testPointWidth').offsetWidth-20;
        //设置id为testPoint的div元素的宽高
        document.getElementById('testPoint').style.width = width + 'px';
        self.myChart = echarts.init(document.getElementById('testPoint'), 'walden');
        self.myChart.setOption(self.testPointOption());
        // 订阅计算属性，以便在数据变化时更新图表
        ko.computed(function () {
          self.myChart.setOption(self.testPointOption());
        })();
      };


      this.createtestPointStatistics = function () {

        var begin = new Date(self.startFromDate());
        var end = new Date(self.endByDate());
        end.setDate(end.getDate() + 1);
        if (begin > end) {
          notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
          return;
        }
        //访问后台接口获取数据
        utpService.getExecutionCheckPointByProjectIdAndTime(selectionManager.selectedProject().id, begin, end,
          self.getExecutionCheckPointByProjectIdAndTimeSuccessFunction, self.getExecutionCheckPointByProjectIdAndTimeErrorFunction);
        $('#testsetCheckPointSettingModal').modal('hide');
      };

      this.getExecutionCheckPointByProjectIdAndTimeSuccessFunction = function (data) {
        self.testsetCheckPointNames.removeAll();
        self.testsetCheckPointSeriesData.removeAll();
        if (data != null && data.status === 1) {
          var dataMaps = data.result;
          Object.entries(dataMaps).forEach(([key, value]) => {
            var temp = {
                name: key,
                value: value
            };
            self.testsetCheckPointSeriesData.push(temp);
            self.testsetCheckPointNames.push(key);
        });
          self.myChart.setOption(self.testPointOption(), true);
        } else {
          self.getExecutionCheckPointByProjectIdAndTimeErrorFunction();
        }
      };
      this.getExecutionCheckPointByProjectIdAndTimeErrorFunction = function () {
        notificationService.showError('获取统计数据失败');
      };
      // The data-binding shall happen after DOM element be attached.
      this.attached = function (view, parent) {
        $('#testPointSearchBeginDate').datepicker({
          format: "yyyy-mm-dd",
          todayHighlight: true,
          language: "zh-CN",
          autoclose: true
        });
        $('#testPointSearchEndDate').datepicker({
          format: "yyyy-mm-dd",
          todayHighlight: true,
          language: "zh-CN",
          autoclose: true
        });
        $('#testsetCheckPointSettingModal').on('shown.bs.modal', function () {
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
        self.testPointAutoFlag(true);
        self.startAutoRefresh();
        self.createtestPointStatistics();
      };
    }
    return new TestsetCheckPointViewModel();
  });
