define(
	[ 'jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
			'services/langManager', 'services/viewManager', 'services/systemConfig',
			'services/fileManagerUtility', 'services/utpService', 'services/notificationService', 'komapping',
			'services/selectionManager', 'services/projectManager', 'knockout', 'knockout-postbox'],
	function($, app, bootstrap, lang, dtManager, langManager,
			viewManager,systemConfig, fileManagerUtility, utpService, notificationService, komapping,
			selectionManager,  projectManager, ko) {

function StatisticalStateViewModel() {
	var self = this;
	
	this.selectionManager = selectionManager;
	this.projectManager = projectManager;
	this.viewManager = viewManager;
	this.systemConfig = systemConfig;
	this.projectIds="119,158,167";
	this.failCount = ko.observable(0);

	this.getProjectStatisticalStateData= function () {
        //访问后台接口获取数据
        utpService.getProjectOperationDataByProjects(self.projectIds, 
          self.getProjectOperationDataByProjectsSuccessFunction, self.getProjectOperationDataByProjectsErrorFunction);
    };
	this.activateIimedRefresh = function() {
		// self.getProjectStatisticalStateData();
		if (!self.refreshInterval) { // 检查定时器是否已经设置
			self.refreshInterval = setInterval(self.getProjectStatisticalStateData, 5000);
		}
	};
	this.getProjectOperationDataByProjectsSuccessFunction = function (data) {
		if(data != null && data.status === 1){
			self.failCount(0);
			var resultList=data.result
			//遍历数据，将数据转换为前端需要的格式
			var newData = [];
			for (var i = 0; i < resultList.length; i++) {
				var project = resultList[i];
				var newItem = {
					id: i + 1,
					name: project.projectName,
					status: project.status,
					startTime: project.startTime,
					endTime: project.endTime,
					executedTotal: project.executedTotal
				};
				if (project.status == "Running"||project.status == "Starting"||project.status == "Resuming") {
					newItem.status = "正在运行";
				}  else if (project.status == "NotRun") {
					newItem.status = "今日未测试";
				} else if (project.status == "Completed") {
					if(project.result=="Fail"){
						newItem.status = "测试已完成,当前测试未通过";
					}else if(project.result=="Success"){
						newItem.status = "测试已完成,当前测试已通过";
					}
				} else {
					newItem.status = "测试已终止";
				}
				newData.push(newItem);
			}
			var dataview = $$("statisticalStateDataAView");
			if (dataview) {
				dataview.clearAll();
				dataview.define("xCount", Math.ceil(Math.sqrt(newData.length))); // 动态更改 xCount 的值
				dataview.define("yCount", Math.ceil(newData.length / Math.ceil(Math.sqrt(newData.length)))); // 动态更改 yCount 的值
				dataview.parse(newData);
			}
		}
		else
			self.getProjectOperationDataByProjectsErrorFunction();
		
	}
	this.getProjectOperationDataByProjectsErrorFunction = function () {
		self.failCount(self.failCount() + 1);
		if (self.failCount() > 5) {
			// clearInterval(self.refreshInterval);
			notificationService.showError('获取数据失败');
			self.failCount(0);
		}
	}
	this.initStatisticalState = function () {
		utpService.getProjectOperationDataByProjects(self.projectIds,function (data) {
				if (data != null && data.status === 1) {
					var resultList = data.result
					var data = [];
					for (var i = 0; i < resultList.length; i++) {
						var project = resultList[i];
						var newItem = {
							id: i + 1,
							name: project.projectName,
							status: project.status,
							startTime: project.startTime,
							endTime: project.endTime,
							executedTotal: project.executedTotal
						};
						if (project.status == "Running"||project.status == "Starting"||project.status == "Resuming") {
							newItem.status = "正在运行";
						}  else if (project.status == "NotRun") {
							newItem.status = "今日未测试";
						} else if (project.status == "Completed") {
							if(project.result=="Fail"){
								newItem.status = "测试已完成,当前测试未通过";
							}else if(project.result=="Success"){
								newItem.status = "测试已完成,当前测试已通过";
							}
						} else {
							newItem.status = "测试已终止";
						}
						data.push(newItem);
					}
					webix.ready(function () {
						webix.ui({
							view: "dataview",
							id: "statisticalStateDataAView",
							container: "statisticalStateDataA",
							xCount: Math.ceil(Math.sqrt(data.length)), // 动态更改 xCount 的值
							yCount: Math.ceil(data.length / Math.ceil(Math.sqrt(data.length))), // 动态更改 yCount 的值
							type: {
								width: "auto",
								height: "auto",
								template: function (obj) {
									let headingColor;
									let statusColor;
									let iconClass;
					
									if (obj.status === "正在运行") {
										headingColor = "#337ab7"; 
										statusColor = "#337ab7"; 
										iconClass = "fa fa-cog fa-spin";
									} else if (obj.status === "今日未测试") {
										headingColor = "#D3D3D3"; // 浅灰色
										statusColor = "#32CD32"; // 绿色
										iconClass = "fa fa-check-circle";
									} else if (obj.status === "测试已终止") {
										headingColor = "#FF6347"; // 番茄色
										statusColor = "#FF6347"; // 番茄色
										iconClass = "fa fa-times-circle";
									} else if (obj.status === "NG") {
										headingColor = "#FF0000"; // 红色
										statusColor = "#FF0000"; // 红色
										iconClass = "fa fa-times-circle";
									} else {
										headingColor = "#32CD32"; // 绿色
										statusColor = "#32CD32"; // 绿色
										iconClass = "fa fa-check-circle";
									}
					
									let startTime = obj.startTime ? "<div>开始时间: " + obj.startTime + "</div>" : "";
									let endTime = obj.endTime ? "<div>结束时间: " + obj.endTime + "</div>" : "";
									let executedTotal = obj.executedTotal ? "<div>今日已执行: " + obj.executedTotal + " 条</div>" : "";
					
									return "<div class='panel panel-info' style='width: 100%; height: 90%; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);'>" +
										"<div class='panel-heading' style='font-weight: bold; font-size: 1.5em; background-color: " + headingColor + "; color: white; padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px;'>" + obj.name + "</div>" +
										"<div class='panel-body' style='background-color: #F0F8FF; color: #333; padding: 20px; height: calc(100% - 2em); display: flex; flex-direction: column; align-items: center; justify-content: center;'>" +
										"<h5 class='panel-title' style='color: " + statusColor + "; margin-bottom: 10px; font-size: 2em; text-align: center;'>" +
										"<i class='" + iconClass + "'></i> " + obj.status +
										"</h5>" +
										startTime +
										endTime +
										executedTotal +
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
	this.detached = function(view, parent){
		self.enableAutotestSubScription.off();
		    // 清除 Webix 视图
			if ($$("statisticalStateDataAView")) {
				$$("statisticalStateDataAView").destructor();
			}
			  // 清除定时器
			if (self.refreshInterval) {
				clearInterval(self.refreshInterval);
				self.refreshInterval = null;
			}
	};
	
	this.activate = function() {
		self.enableAutotestSubScription = app.on('enableStatisticalState:event').then(function(){
		}, this);
		self.initStatisticalState();
		self.activateIimedRefresh(); 
	};

	this.attached = function(view, parent) {
	};
}
return new StatisticalStateViewModel();
});
 