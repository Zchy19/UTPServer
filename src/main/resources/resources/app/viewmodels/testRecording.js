define(['durandal/app', 'knockout', 'jquery', 'komapping', 'services/utpService', 'services/selectionManager', 
    'services/reportService', 'services/cmdConvertService', 'services/notificationService', 'jsoneditor', 'lodash', 'datepicker'],
    function(app, ko, $, komapping, utpService, selectionManager, reportService, cmdConvertService, notificationService, JSONEditor, _, datepicker) {

        function TestRecordingViewModel() {
            var self = this;				
            this.reportService = reportService;
            this.startFromDate = ko.observable('');
            this.endByDate = ko.observable('');
            this.cmdConvertService = cmdConvertService;
            this.autoRefreshTimeValue = ko.observable();
            this.aotoFirst = false;

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
                } else {
                    self.getTestSetByProjectErrorFunction();
                }
            };

            this.getTestSetByProjectErrorFunction = function () {
                notificationService.showError('获取测试集失败');
            };

            this.getTestSetByProject = function () {
                utpService.getTestSetByProject(selectionManager.selectedProject().id, self.getTestSetByProjectSuccessFunction, self.getTestSetByProjectErrorFunction);
            };
			this.selectExecution = null;
			this.fetchSummaryReportData = function(item){
				// $.blockUI(utilityService.template);
				self.selectExecution = item;
				utpService.getTestCaseCheckPointByExecution(item.executionId(), self.fetchSummaryReportDataSuccessFunction, self.fetchSummaryReportDataErrorFunction );
			};
			
			this.fetchSummaryReportDataSuccessFunction = function(data){
				//data ={"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","executionStartTime":"2019-06-16 09:00","executionEndTime":"2019-06-16 09:01","executionPeriod":"0 hours : 0 minutes : 39 seconds\r\n","executedByUserId":"test@macrosoftsys.com","targetTestsetName":"测试集1","executionName":"test","passedScripts":[],"failedScripts":[{"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","scriptId":769,"scriptName":"smoke test","startTime":"2019-06-16 09:01","result":"Fail"}],"unExecutedScripts":[],"executionResultList":[{"resultId":505496,"scriptId":769,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution TestCase Begin","executionTime":"2019-06-16 09:00:30","command":"smoke test","result":"Pass","errorMessage":null},{"resultId":505498,"scriptId":769,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution TestCase End","executionTime":"2019-06-16 09:01:06","command":"smoke test","result":"Fail","errorMessage":null},{"resultId":505499,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Exception Begin","executionTime":"2019-06-16 09:01:06","command":null,"result":"Pass","errorMessage":null},{"resultId":505500,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Exception End","executionTime":"2019-06-16 09:01:07","command":null,"result":"Pass","errorMessage":null},{"resultId":505501,"scriptId":0,"executionId":"88e5a406-cec3-5284-84b5-a48cad866cb4","antbotName":null,"commandType":"Execution End","executionTime":"2019-06-16 09:01:07","command":null,"result":"Pass","errorMessage":null}]};
				if(data != null && data.status === 1){
					var executionCheckpointsList = data.result;
					self.generateOnlineReport(executionCheckpointsList);
				}
				else
					notificationService.showError('获取报表失败');
			};
	
			this.gridData =  [];
			this.generateOnlineReport = function(expectedResultList){
				//expectedResultList为:{"4632can开关":[{"id":3894,"executionId":"7aab167e-ce86-d2f3-c7ce-a800b93ccd08","testCaseId":252,"checkPointName":"1cc","result":1,"startTime":"2024-11-16 11:18:10:014","endTime":"2024-11-16 11:18:10:171","projectId":119,"testsetId":104,"executionResultStartId":446155,"executionResultEndId":446158,"manualDecisionLevel":0},{"id":3893,"executionId":"7aab167e-ce86-d2f3-c7ce-a800b93ccd08","testCaseId":252,"checkPointName":"ABC","result":1,"startTime":"2024-11-16 11:18:10:014","endTime":"2024-11-16 11:18:10:014","projectId":119,"testsetId":104,"executionResultStartId":446153,"executionResultEndId":446154,"manualDecisionLevel":0}],"4633can开关_Copy":[{"id":3895,"executionId":"7aab167e-ce86-d2f3-c7ce-a800b93ccd08","testCaseId":456,"checkPointName":"ABC222","result":1,"startTime":"2024-11-16 11:18:10:226","endTime":"2024-11-16 11:18:11:114","projectId":119,"testsetId":104,"executionResultStartId":446164,"executionResultEndId":446166,"manualDecisionLevel":0}]}
				//将expectedResultList为转换为gridData格式
				var expectedResults = [];
				for(var key in expectedResultList){
					var testCase = {};
					testCase.name = key;
					// 将testCase.name进行切割,只获取:后面的
					var index = key.indexOf(":");
					if(index != -1){
						testCase.name = key.substring(index+1);
					}
					var checkPoints = [];
					var checkPointList = expectedResultList[key];
					for(var i = 0; i < checkPointList.length; i++){
						var checkPoint = {};
						checkPoint.name = checkPointList[i].checkPointName;
						checkPoint.time = checkPointList[i].startTime+"-"+checkPointList[i].endTime;
						if(checkPointList[i].result == 1){
							checkPoint.result = "成功";
						}else{
							checkPoint.result = checkPointList[i].manualDecisionLevel == 1 ? "成功" : "失败";
							switch(checkPointList[i].manualDecisionLevel){
								case 0:
									checkPoint.descr = cmdConvertService.manualDecisionLevel.manualDecisionLevel0;
									break;
								case 1:
									checkPoint.descr = cmdConvertService.manualDecisionLevel.manualDecisionLevel1;
									break;
								case 2:
									checkPoint.descr = cmdConvertService.manualDecisionLevel.manualDecisionLevel2;
									break;
								case 3:
									checkPoint.descr = cmdConvertService.manualDecisionLevel.manualDecisionLevel3;
									break;
								case 4:
									checkPoint.descr = cmdConvertService.manualDecisionLevel.manualDecisionLevel4;
									break;
								case 5:
									checkPoint.descr = cmdConvertService.manualDecisionLevel.manualDecisionLevel5;
									break;
								default:
									checkPoint.descr = "失败";
									break;
									
							}
						}
						checkPoint.isParent = false;
						checkPoints.push(checkPoint);
					}
					testCase.children = checkPoints;
					testCase.isParent = true;
					expectedResults.push(testCase);
				}
				self.gridData = expectedResults;			
				$('#testRecordingCheckPointModal').modal('show');
			};
			this.fetchSummaryReportDataErrorFunction = function(error){				
				notificationService.showError('获取报表失败');
			};

			this.treeTable = null;
			this.initTable = function() {
				layui.use(function () {
					self.treeTable = layui.treeTable;
					// 渲染
					self.treeTable.render({
						elem: '#testRecordingCheckPoint',
						//gridData: [{"name":"252:can开关","children":[{"name":"1cc","startTime":"2024-11-16 11:18:10:014","endTime":"2024-11-16 11:18:10:171","result":"成功","isParent":false},{"name":"ABC","startTime":"2024-11-16 11:18:10:014","endTime":"2024-11-16 11:18:10:014","result":"成功","isParent":false}],"isParent":true},{"name":"456:can开关_Copy","children":[{"name":"ABC222","startTime":"2024-11-16 11:18:10:226","endTime":"2024-11-16 11:18:11:114","result":"成功","isParent":false}],"isParent":true}]
						data: self.gridData,
						toolbar: '#TPL-treeTable-demo',
						tree: {
						},
						height: '601px',
						cols: [[
							{ title: "名称", field: "name", minWidth: 200 },
							{ title: "检查点结果", field: "result", minWidth: 100 },
							{ title: "结果说明", field: "descr", minWidth: 200},
							{ title: "时间", field: "time", minWidth: 200}
						]]
					});
				});
			};


			
            this.formatUTCDate = function (date) {
                var year = date.getUTCFullYear();
                var month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // Months are zero-based
                var day = ("0" + date.getUTCDate()).slice(-2);
                return year + "-" + month + "-" + day;
            };

            this.initSearchCondition = function() {
                var now = new Date();
                var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
                // 获取当前时间
                self.endByDate(self.formatUTCDate(startDate));
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
                self.startFromDate(self.formatUTCDate(startDate)); 
            };

            this.protocolConditionSetting = function() {
                self.getTestSetByProject();
                $('#testRecordingReportSettingModal').modal('show');
            };

            this.createTestRecordingStatistics = function() {
                var begin = new Date(self.startFromDate());
                var end = new Date(self.endByDate());
                // end时间增加一天
                end.setDate(end.getDate() + 1);
                if (begin > end) {
                    notificationService.showWarn('开始时间' + self.startFromDate() + '不能晚于结束时间' + self.endByDate());
                    return;
                }
				let testsetId  = self.selectedTestset() == null ? '' : self.selectedTestset().id();
                // 访问后台接口获取数据
                var condition = {
                    domainId: $.cookie("orgId"),
                    projectId: selectionManager.selectedProject().id,
                    testsetId: testsetId,
                    executedByUserId: "",
                    executionTimeStartFrom: begin,
                    executionTimeEndBy: end,
                };
                self.getTestReportByCondition(condition);		
                $('#testRecordingReportSettingModal').modal('hide');
            };

            this.observableData = komapping.fromJS([], {
                key: function(item) {
                    return ko.utils.unwrapObservable(item.id);        
                }
            });

            this.getTestReportByCondition = function(condition) {
                utpService.getTestReportByCondition(condition, self.getCompletedExecutionListSuccessFunction, self.getCompletedExecutionListErrorFunction);
            };

            this.getCompletedExecutionListSuccessFunction = function(data) {
                if (data && data.status === 1 && data.result) {
                    komapping.fromJS(data.result, {}, self.observableData);
                } else {
                    self.getCompletedExecutionListErrorFunction();
                }
            };

            this.getCompletedExecutionListErrorFunction = function() {
                notificationService.showError('获取报表失败');
            };

            // The data-binding shall happen after DOM element be attached.
            this.attached = function(view, parent) {
                $('#testRecordingSearchBeginDate').datepicker({
                    format: "yyyy-mm-dd",
                    todayHighlight: true,
                    language: "zh-CN",
                    autoclose: true
                });
                $('#testRecordingSearchEndDate').datepicker({
                    format: "yyyy-mm-dd",
                    todayHighlight: true,
                    language: "zh-CN",
                    autoclose: true
                });
                $('#testRecordingReportSettingModal').on('shown.bs.modal', function() {
                    // self.updateChart();
                });			
				$('#testRecordingCheckPointModal').on('shown.bs.modal', function() {		
					$('#testRecordingCheckPoint').html('');
					self.initTable();				
				});
				$('#testRecordingCheckPointModal').on('hidden.bs.modal', function() {		
					$('#testRecordingCheckPoint').html('');
					//清除数据
					self.gridData = [];
					self.treeTable = null;
				});
                self.initSearchCondition();
            };

            this.detached = function(view, parent) {
		
            };

            this.activate = function() {
                self.aotoFirst = true;
                // 获取测试集
                self.getTestSetByProject();
                self.initSearchCondition();
				self.createTestRecordingStatistics();
            };
        }

        return new TestRecordingViewModel();
    });