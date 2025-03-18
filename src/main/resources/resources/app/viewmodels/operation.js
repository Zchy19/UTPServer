define(
    ['jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
        'services/langManager', 'services/viewManager', 'services/systemConfig',
        'services/fileManagerUtility', 'services/utpService', 'services/notificationService', 'komapping',
        'services/selectionManager', 'services/projectManager', 'knockout', 'knockout-postbox'],
    function ($, app, bootstrap, lang, dtManager, langManager,
        viewManager, systemConfig, fileManagerUtility, utpService, notificationService, komapping,
        selectionManager, projectManager, ko) {

        function OperationViewModel() {
            var self = this;

            this.selectionManager = selectionManager;
            this.projectManager = projectManager;
            this.viewManager = viewManager;
            this.systemConfig = systemConfig;

            this.getProjectOperationData = function () {
                //获取projectId
                var projectId = self.selectionManager.selectedProject().id;
                //访问后台接口获取数据
                utpService.getProjectOperationDataByProjectId(projectId,
                    self.getProjectOperationDataByProjectIdSuccessFunction, self.getProjectOperationDataByProjectIdErrorFunction);
            };
            this.activateIimedRefresh = function() {
                // self.getProjectOperationData();
                if (!self.refreshInterval) { // 检查定时器是否已经设置
                    self.refreshInterval = setInterval(self.getProjectOperationData, 5000);
                }
            };
            

            this.getProjectOperationDataByProjectIdSuccessFunction = function (data) {
                if (data != null && data.status === 1) {
                    self.failCount(0);
                    var resultList = data.result
                    //遍历数据，将数据转换为前端需要的格式
                    var newData = [];
                    for (var i = 0; i < resultList.length; i++) {
                        var testset = resultList[i];
                        var newItem = {
                            id: i + 1,
                            testName: testset.testsetName,
                            testStatus: testset.status,
                            testCheckPointName: "",
                            checkExecutedCount: testset.checkExecutedCount,
                            checkFailCount: testset.checkFailCount,
                            checkSuccessCount: testset.checkSuccessCount
                        };
                        if (testset.checkPointName != null) {
                            newItem.testCheckPointName ="正在执行:"+ testset.checkPointName;
                        } else {
                            newItem.testCheckPointName = "暂无检查点";
                        }
                        if (testset.status == "Running"||testset.status == "Starting"||testset.status == "Resuming") {
                            newItem.testStatus = "正在运行";
                        } else if (testset.status == "NotRun") {
                            newItem.testStatus = "今日未测试";
                        } else if (testset.status == "Completed") {
                            if(testset.result=="Fail"){
                                newItem.testStatus = "测试用例已完成,详情如下:";
                                newItem.testCheckPointName = "请查看测试台账，以获取测试发现的问题并人工确认。";
                            }else if(testset.result=="Success"){
                                newItem.testStatus = "测试用例已完成,详情如下";
                            }
                        } else {
                            newItem.testStatus = "测试已终止";
                        }
                        
                        newData.push(newItem);
                    }
                    var dataview = $$("operationDataAView");
                    if (dataview) {
                        dataview.clearAll();
                        dataview.define("xCount", Math.ceil(Math.sqrt(newData.length))); // 动态更改 xCount 的值
                        dataview.define("yCount", Math.ceil(newData.length / Math.ceil(Math.sqrt(newData.length)))); // 动态更改 yCount 的值
                        dataview.parse(newData);
                    }
                }
                else
                    self.getProjectOperationDataByProjectIdErrorFunction();

            }
            this.failCount=ko.observable(0);
            this.getProjectOperationDataByProjectIdErrorFunction = function () {
                self.failCount(self.failCount()+1);
                if(self.failCount()>5){
                    // clearInterval(self.refreshInterval);
                    notificationService.showError('获取数据失败');
                    self.failCount(0);
                }

            }

            this.initOperation = function () {
                utpService.getProjectOperationDataByProjectId(self.selectionManager.selectedProject().id, function (data) {
                    if (data != null && data.status === 1) {
                        var resultList = data.result
                        var data = [];
                        for (var i = 0; i < resultList.length; i++) {
                            var testset = resultList[i];
                            var newItem = {
                                id: i + 1,
                                testName: testset.testsetName,
                                testStatus: testset.status,
                                testCheckPointName: "",
                                checkExecutedCount: testset.checkExecutedCount,
                                checkFailCount: testset.checkFailCount,
                                checkSuccessCount: testset.checkSuccessCount
                            };
                            if (testset.checkPointName != null) {
                                newItem.testCheckPointName ="正在执行:"+ testset.checkPointName;
                            } else {
                                newItem.testCheckPointName = "暂无检查点";
                            }
                            if (testset.status == "Running"||testset.status == "Starting"||testset.status == "Resuming") {
                                newItem.testStatus = "正在运行";
                            }  else if (testset.status == "NotRun") {
                                newItem.testStatus = "今日未测试";

                            } else if (testset.status == "Completed") {
                                if(testset.result=="Fail"){
                                    newItem.testStatus = "测试用例已完成,详情如下:";
                                    newItem.testCheckPointName = "请查看测试台账，以获取测试发现的问题并人工确认。";
                                }else if(testset.result=="Success"){
                                    newItem.testStatus = "测试用例已完成,详情如下";
                                }
                            } else {
                                newItem.testStatus = "测试已终止";
                            }
                           
                            data.push(newItem);
                        }
                        webix.ready(function () {
                            webix.ui({
                                view: "dataview",
                                id: "operationDataAView",
                                container: "operationDataA",
                                xCount: Math.ceil(Math.sqrt(data.length)), // 动态更改 xCount 的值
                                yCount: Math.ceil(data.length / Math.ceil(Math.sqrt(data.length))), // 动态更改 yCount 的值
                                type: {
                                    width: "auto",
                                    height: "auto",
                                    template: function (obj) {
                                        let headingColor;
                                        let statusColor;
                                        let iconClass;

                                        if (obj.testStatus === "正在运行") {
                                            headingColor = "#337ab7"; 
                                            statusColor = "#337ab7"; 
                                            iconClass = "fa fa-cog fa-spin";
                                        } else if (obj.testStatus === "今日未测试") {
                                            headingColor = "#D3D3D3"; // 浅灰色
                                            statusColor = "#32CD32"; // 绿色
                                            iconClass = "fa fa-check-circle";
                                        } else if (obj.testStatus === "测试已终止") {
                                            headingColor = "#FF6347"; // 番茄色
                                            statusColor = "#FF6347"; // 番茄色
                                            iconClass = "fa fa-times-circle";
                                        } else if (obj.testStatus === "测试用例已完成,详情如下:") {
                                            headingColor = "#FF0000"; // 红色
                                            statusColor = "#FF0000"; // 红色
                                            iconClass = "fa fa-times-circle";
                                        } else {
                                            headingColor = "#32CD32"; // 绿色
                                            statusColor = "#32CD32"; // 绿色
                                            iconClass = "fa fa-check-circle";
                                        }
                                        return "<div class='panel panel-info' style='width: 100%; height: 90%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);'>" +
                                            "<div class='panel-heading' style='font-weight: bold; font-size: 1.5em; background-color: " + headingColor + "; color: white; padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px;'>" + obj.testName + "</div>" +
                                            "<div class='panel-body' style='background-color: #F0F8FF; color: #333; padding: 20px; height: calc(100% - 2em); display: flex; flex-direction: column; align-items: center; justify-content: center;'>" +
                                            "<h5 class='panel-title' style='color: " + statusColor + "; margin-bottom: 10px; font-size: 2em; text-align: center;'>" +
                                            "<i class='" + iconClass + "'></i> " + obj.testStatus +
                                            "</h5>" +
                                            (obj.testCheckPointName !== "暂无检查点" ?
                                                "<p class='panel-text' style='font-style: italic; text-align: center;'>" +
                                                obj.testCheckPointName +
                                                "</p>" :"") +
                                            "<p class='panel-text' style='font-style: italic; text-align: center;'>" +
                                            "已经执行: " + obj.checkExecutedCount + "条, 成功: " + obj.checkSuccessCount + "条, 问题: " + obj.checkFailCount + "条" +
                                            "</p>" +
                                            "</div>" +
                                            "</div>";
                                    }
                                },
                                data: data
                            });
                        });
                    }
                }
                );

            };
            // 加载数据
			this.refreshInterval=""
            this.enableAutotestSubScription = null;
            this.detached = function (view, parent) {
                self.enableAutotestSubScription.off();
                // 清除 Webix 视图
                if ($$("operationDataAView")) {
                    $$("operationDataAView").destructor();
                }
                // 清除定时器
                if (self.refreshInterval) {
                    clearInterval(self.refreshInterval);
                    self.refreshInterval = null;
                }
            };
            this.activate = function () {
                self.enableAutotestSubScription = app.on('enableOperation:event').then(function () {
                }, this);
                self.initOperation();
                self.activateIimedRefresh(); 
            };

            this.attached = function (view, parent) {
                // 设置定时器，每隔5秒刷新一次数据
                // self.activateIimedRefresh(); 

            };
        }
        return new OperationViewModel();
    });