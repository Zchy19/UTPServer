define(['durandal/app', 'knockout', 'jquery', 'komapping', 'services/utpService', 'services/selectionManager',
  'services/reportService', 'services/notificationService', 'jsoneditor', 'lodash', 'datepicker'],
  function (app, ko, $, komapping, utpService, selectionManager, reportService, notificationService, JSONEditor, _, datepicker) {

    function TestsetPieChartReportViewModel() {
      var self = this;
      this.reportService = reportService;
      this.startFromDate = ko.observable('');
      this.endByDate = ko.observable('');
      this.autoRefreshTimeOptions = ["1天内", "7天内", "30天内"];
      this.autoRefreshTimeValue = ko.observable();
      this.selectedAutoRefreshTime = ko.observable();
      this.testsetPieChartAutoFlag = ko.observable(false);
      this.refreshInterval = null;
      this.startAutoRefresh = function () {
        if (self.testsetPieChartAutoFlag()) {
          self.refreshInterval = setInterval(function () {
            self.autoRefreshTimeChanged();
            self.testsetChanged();
          },24* 60*60 * 1000);
        } else {
          clearInterval(self.refreshInterval);
        }
      };

      this.testsetPieChartAutoFlag.subscribe(function (newValue) {
        self.startAutoRefresh();
        //刷新测试集数据
        self.selectedTestset('');
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
              self.testsetChanged();
              // self.createTestsetPieChartStatistics();
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


      this.testsetExecutions = ko.observableArray([]);
      this.selectedTestsetExecution = ko.observable();
      this.selectedTestset = ko.observable();
      this.testsetChanged = function (obj, event) {
        if (self.selectedTestset() == undefined)
          return;
        //获取testset的id
        var testsetId = self.selectedTestset().id();
        //获取project的id
        var projectId = selectionManager.selectedProject().id;
        //根据projectId和testsetId获取所有测试集
        //获取开始时间
        var begin = new Date(self.startFromDate());
        var end = new Date(self.endByDate());
        end.setDate(end.getDate() + 1);
        if (begin > end) {
          notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
          return;
        }
        //访问后台接口获取数据
        utpService.getExecutionStatusByTestsetIdAndTime(projectId, testsetId, begin, end, self.getExecutionStatusByTestsetIdAndTimeSuccessFunction, self.getExecutionStatusByTestsetIdAndTimeErrorFunction);
      };
      this.getExecutionStatusByTestsetIdAndTimeSuccessFunction = function (data) {
        if (data != null && data.status === 1) {
          var executionStatuses = data.result;
          self.testsetExecutions.removeAll();
          executionStatuses.forEach(item => {
            self.testsetExecutions.push(item);
          });
          if(self.testsetPieChartAutoFlag()){
            if(self.testsetExecutions().length==0){
              // notificationService.showWarn('该时间段没有测试集执行数据');
            }else{
            self.selectedTestsetExecution(self.testsetExecutions()[0]);
            self.createTestsetPieChartStatistics();}
          }
        }
        else
          self.getExecutionStatusByTestsetIdAndTimeErrorFunction();
      };
      this.getExecutionStatusByTestsetIdAndTimeErrorFunction = function () {
        notificationService.showError('获取统计数据失败');
      };

      this.aotoFirst=false;
      this.initSearchCondition = function () {
        var now = new Date();
        var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        // 获取当前时间
        self.endByDate(self.formatUTCDate(startDate));
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
        self.startFromDate(self.formatUTCDate(startDate));
       
      }
      this.protocolConditionSetting = function () {
        $('#testsetPieChartReportSettingModal').modal('show');
      };
      this.showChart = ko.observable(false);
      this.myChart = null;
      this.chartOptions = {};
      this.testCasePieChartData=ko.observable({
        '成功': 0,
        '失败': 0,
        '未执行': 0
      });
      this.testCaseColumnarData=ko.observable({});


      this.getResultDisplay=function(result) {
        switch (result) {
          case "-":
            return "执行中";
          case "Success":
            return "成功";
          case "Fail":
            return "失败";
          default:
            return "异常";
        }
      }
      this.testsetPieChartOption = ko.computed(function () {
        //判断self.selectedTestset()是否为空
        var titleName = (self.selectedTestsetExecution == undefined || !self.selectedTestsetExecution() 
        ? "测试集" 
        : self.selectedTestsetExecution().testsetName + ":" + self.selectedTestsetExecution().startTime + 
          "(" + self.getResultDisplay(self.selectedTestsetExecution().result) + ")");
          //判断self.testCaseColumnarData()是否有对象
        if (Object.keys(self.testCaseColumnarData()).length> 0) {
          self.showChart(true);
        }
        const builderJson = {
          charts: self.testCaseColumnarData()
        };
        builderJson.all = Object.values(builderJson.charts).reduce((sum, value) => sum + value, 0);
        const testCasePieChartData = self.testCasePieChartData();
        // 定义一个函数来格式化时间
        function formatDuration(ms) {
          const hours = Math.floor(ms / 3600000);
          const minutes = Math.floor((ms % 3600000) / 60000);
          const seconds = Math.floor((ms % 60000) / 1000);
          const milliseconds = ms % 1000;

          let formattedTime = '';
          if (hours > 0) {
            formattedTime += hours + 'h ';
          }
          if (minutes > 0) {
            formattedTime += minutes + 'min ';
          }
          if (seconds > 0) {
            formattedTime += seconds + 's ';
          }
          formattedTime += milliseconds + 'ms';

          return formattedTime;
        }

        return {
          tooltip: {
            formatter: function (params) {
              if (params.seriesType === 'bar') {
                var value = params.value;
                var hours = Math.floor(value / 3600000);
                var minutes = Math.floor((value % 3600000) / 60000);
                var seconds = Math.floor((value % 60000) / 1000);
                var milliseconds = value % 1000;

                var result = params.name + ': ';
                if (hours > 0) {
                  result += hours + 'h ';
                }
                if (minutes > 0) {
                  result += minutes + 'min ';
                }
                if (seconds > 0) {
                  result += seconds + 's ';
                }
                result += milliseconds + 'ms';
                return result;
              }
              return params.name + ': ' + params.value;
            }
          },
          title: [
            {
              text: '单次测试结果统计图',
              left: '50%',
              top: '0%',
              textAlign: 'center'
            },
            {
              subtext: titleName,
              left: '50%',
              top: '5%',
              textAlign: 'center'
            },
            {
              subtext: '时长总计 ' + formatDuration(builderJson.all),
              top: '12%',
              left: '30%',
              textAlign: 'center'
            },
            {
              subtext: '个数总计 ' +
                Object.keys(testCasePieChartData).reduce(function (all, key) {
                  return all + testCasePieChartData[key];
                }, 0),
              left: '75%',
              top: '10%',
              textAlign: 'center'
            }
          ],
          grid: [
            {
              top: '25%',
              width: '50%',
              bottom: '10%',
              left: 10,
              containLabel: true
            }
          ],
          xAxis: [
            {
              type: 'value',
              max: builderJson.all,
              splitLine: {
                show: false
              },
              axisLabel: {
                show: false // 隐藏横坐标标签
              }
            }
          ],
          yAxis: [
            {
              type: 'category',
              data: Object.keys(builderJson.charts),
              axisLabel: {
                interval: 0,
                rotate: 0
              },
              splitLine: {
                show: false
              }
            }
          ],
          series: [
            // 第一个柱形图系列，显示主要数据
            {
              type: 'bar',
              stack: 'chart',
              z: 3,
              label: {
                position: 'right',
                show: true,
                formatter: function (params) {
                  var value = params.value;
                  var hours = Math.floor(value / 3600000);
                  var minutes = Math.floor((value % 3600000) / 60000);
                  var seconds = Math.floor((value % 60000) / 1000);
                  var milliseconds = value % 1000;
                  var result = '';
                  if (hours > 0) {
                    result += hours + 'h ';
                  }
                  if (minutes > 0) {
                    result += minutes + 'min ';
                  }
                  if (seconds > 0) {
                    result += seconds + 's ';
                  }
                  result += milliseconds + 'ms';
                  return result;
                }
              },
              data: Object.keys(builderJson.charts).map(function (key) {
                return builderJson.charts[key];
              })
            },
            // 第二个柱形图系列，显示辅助数据
            {
              type: 'bar',
              stack: 'chart',
              silent: true,
              data: Object.keys(builderJson.charts).map(function (key) {
                return builderJson.all - builderJson.charts[key];
              })
            },

            // 饼图系列
            {
              type: 'pie',
              radius: [0, '30%'],
              center: ['75%', '50%'],
              data: Object.keys(testCasePieChartData).map(function (key) {
                return {
                  name: key,
                  value: testCasePieChartData[key]
                };
              })
            }
          ]
        };
      });
      this.initChart = function () {

        if (self.myChart) {
          self.myChart.dispose();
        }
        var width = document.getElementById('testsetPieChartWidth').offsetWidth-20;
        //设置id为testsetLine的div元素的宽高
        document.getElementById('testsetPieChart').style.width = width + 'px';
        self.myChart = echarts.init(document.getElementById('testsetPieChart'), 'walden');
        self.myChart.setOption(self.testsetPieChartOption());
        // 订阅计算属性，以便在数据变化时更新图表
        ko.computed(function () {
          self.myChart.setOption(self.testsetPieChartOption());
        })();
      };



      this.createTestsetPieChartStatistics = function () {
        if (self.selectedTestset() == undefined) {
          notificationService.showWarn('请选择测试集');
          return;
        }
        if (self.selectedTestsetExecution() == undefined) {
          if (self.testsetPieChartAutoFlag()) {
            notificationService.showWarn('该时间段没有测试集执行数据');
          }
          else {
            notificationService.showWarn('请选择测试集执行数据');
          }
          return;
        }
        //访问后台接口获取数据
        utpService.statisticsExecutionByExecutionId(self.selectedTestsetExecution().executionId,self.statisticsExecutionByExecutionIdSuccessFunction, self.statisticsExecutionByExecutionIdErrorFunction);
        $('#testsetPieChartReportSettingModal').modal('hide');
      };
      
   
      this.statisticsExecutionByExecutionIdSuccessFunction = function (data) {
        if (data != null && data.status === 1) {
          let ExecutionResultList = data.result;
          let successCount = 0;
          let failCount = 0;
          let unusualCount = 0;
          self.testCaseColumnarData({});
          ExecutionResultList.forEach(item => {
            switch (item.result) {
              case 1:
                successCount++;
                break;
              case 0:
                failCount++;
                break;
              default:
                unusualCount++;
                break;
            }
            //差值时间
            let time = 0;
            if (item.endTime != null) {
              time =new Date(item.endTime).getTime() - new Date(item.startTime).getTime();
            }
            //获取测试用例的执行结果
            let resultdata = item.result;
            resultdata===1?resultdata='(成功)':resultdata===0?resultdata='(失败)':resultdata='(未执行)'
            self.testCaseColumnarData()[item.scriptName+resultdata] = time;
          });
          let temp = {
            '成功': successCount,
            '失败': failCount,
            '未执行': unusualCount
          };
          //将temp数据填入testCasePieChartData
          self.testCasePieChartData(temp);

        }
        else
          self.statisticsExecutionByExecutionIdErrorFunction();

      };


      this.statisticsExecutionByExecutionIdErrorFunction = function () {
        notificationService.showError('获取统计数据失败');
      };


      // The data-binding shall happen after DOM element be attached.
      this.attached = function (view, parent) {
        $('#testsetPieChartSearchBeginDate').datepicker({
          format: "yyyy-mm-dd",
          todayHighlight: true,
          language: "zh-CN",
          autoclose: true
        });
        $('#testsetPieChartSearchEndDate').datepicker({
          format: "yyyy-mm-dd",
          todayHighlight: true,
          language: "zh-CN",
          autoclose: true
        });
        $('#testsetPieChartReportSettingModal').on('shown.bs.modal', function () {
          // self.updateChart();
        });
        self.initChart();

      };
      // this.first=false;

      this.detached = function (view, parent) {
        clearInterval(self.refreshInterval);
      };

      this.activate = function () {
        //获取测试集
        self.aotoFirst=true;
        self.getTestSetByProject();
        self.initSearchCondition();
        self.testsetPieChartAutoFlag(true);
        self.startAutoRefresh();
      };
    }
    return new TestsetPieChartReportViewModel();
  });
