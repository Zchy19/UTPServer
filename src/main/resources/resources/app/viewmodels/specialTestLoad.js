define(['durandal/app', 'knockout', 'jquery', 'services/loginManager', 'services/viewManager', 'services/systemConfig', 'services/projectManager', 'services/ursService', 'services/notificationService', 'services/selectionManager'
	, 'services/specialTestService'
], function (
	app, ko, $, loginManager, viewManager, systemConfig, ursService, projectManager, notificationService, selectionManager, specialTestService) {

	function SpecialTestLoadViewModel() {
		var self = this;
		this.viewManager = viewManager;
		this.systemConfig = systemConfig;
		this.selectionManager = selectionManager;
		this.loginManager = loginManager;
		this.projectManager = projectManager;
		this.selectedSpecialTestset = null;
		this.specialTestService = specialTestService;
		this.specialTestClass = ko.observable('col-md-6');

		this.updateSpecialTestClass = function() {
			if (self.viewManager.selectedSpecialTestsetActiveData.subpageNumber == 1) {
				self.specialTestClass('col-md-12');
			} else {
				self.specialTestClass('col-md-6');
			}
		};

		// this.specialTestOneControl=specialTestOneControl
		// this.specialTestTwoControl=specialTestTwoControl
		this.goback = function () {
			self.viewManager.specialTestActivePage('app/viewmodels/specialTest');
		}
		this.showDetail = function () {
			if (self.selectedSpecialTestset.type == 1) {
				self.viewManager.specialTestControlActivePage('app/viewmodels/specialTestControl');
			} else if (self.selectedSpecialTestset.type == 2) {
				//跳转至多页面页面
				self.viewManager.specialTestOneControlActivePage('app/viewmodels/specialTestOneControl');

				if (self.viewManager.selectedSpecialTestsetActiveData.subpageNumber >= 2) {
					self.viewManager.specialTestTwoControlActivePage('app/viewmodels/specialTestTwoControl');
				}

				if (self.viewManager.selectedSpecialTestsetActiveData.subpageNumber >= 3) {
					self.viewManager.specialTestThreeControlActivePage('app/viewmodels/specialTestThreeControl');
				}

				if (self.viewManager.selectedSpecialTestsetActiveData.subpageNumber >= 4) {
					self.viewManager.specialTestFourControlActivePage('app/viewmodels/specialTestFourControl');
				}

			} else if (self.selectedSpecialTestset.type == 3){ //新增自定义页面
				self.viewManager.specialTestCustomizationControlActivePage('app/viewmodels/specialTestCustomizationControl');
			}
		};


		this.startpop = async () => {
			self.specialTestService.isExecuting(true);

			self.specialTestService.clearALL(true);

			self.specialTestService.startone(true);
			self.specialTestService.flagone(true);
			
			//判断第一页中是否有执行器
			if(!self.specialTestService.haveEngine()){
				self.specialTestService.haveEngine(true);
				self.specialTestService.isExecuting(false);
				return;
			}
			try {
				if (self.selectedSpecialTestset.isParallel == 0
				) {
					await waitForFlagAndStart('startone', 'flagone');

					if (self.selectedSpecialTestset.subpageNumber >= 2) {
						self.specialTestService.starttwo(true);
						self.specialTestService.flagtwo(true);
						await waitForFlagAndStart('starttwo', 'flagtwo');
					}

					if (self.selectedSpecialTestset.subpageNumber >= 3) {
						self.specialTestService.startthree(true);
						self.specialTestService.flagthree(true);
						await waitForFlagAndStart('startthree', 'flagthree');
					}

					if (self.selectedSpecialTestset.subpageNumber >= 4) {
						self.specialTestService.startfour(true);
						self.specialTestService.flagfour(true);
						await waitForFlagAndStart('startfour', 'flagfour');
					}

					//新增
				}
			} catch (error) {
				console.error("Promise执行出错:", error);
			} finally {
				self.specialTestService.isExecuting(false);
			}
		};

		async function waitForFlagAndStart(startName, flagName) {
			const flagObservable = self.specialTestService[flagName];
			const startObservable = self.specialTestService[startName];
			// 用于记录两个可观察对象是否都已经变为 false
			let flagIsFalse = false;
			let startIsFalse = false;
			return new Promise((resolve, reject) => {
				// 先创建 startObservable 的订阅
				const startSubscription = startObservable.subscribe((newValue) => {
					try {
						if (!newValue) {
							startIsFalse = true;
							checkAndResolve();
						}
					} catch (error) {
						console.error(`订阅 ${startName} 变化时出错:`, error);
						reject(error);
					}
				});
				// 再创建 flagObservable 的订阅
				const flagSubscription = flagObservable.subscribe((newValue) => {
					try {
						if (!newValue) {
							flagIsFalse = true;
							checkAndResolve();
						}
					} catch (error) {
						console.error(`订阅 ${flagName} 变化时出错:`, error);
						reject(error);
					}
				});

				// 处理初始值为false的情况
				if (!startObservable() && !flagObservable()) {
					startIsFalse = true;
					flagIsFalse = true;
					checkAndResolve();
				}

				function checkAndResolve() {
					try {
						if (flagIsFalse && startIsFalse) {
							flagSubscription.dispose();
							startSubscription.dispose();
							resolve();
						}
					} catch (error) {
						console.error("检查并解决 Promise 时出错:", error);
						reject(error);
					}
				}
			});
		}

		this.attached = function (view, parent) {
			self.selectedSpecialTestset = self.viewManager.selectedSpecialTestsetActiveData;
			self.showDetail();
		
			// 初始化时更新类名
			self.updateSpecialTestClass();

			// 订阅selectedSpecialTestsetActiveData的变化，以便在变化时更新类名
			// self.viewManager.selectedSpecialTestsetActiveData.subpageNumber.subscribe(function(newValue) {
			// 	self.updateSpecialTestClass();
			// });
		};

		this.activate = function () {

		};

		this.detached = function () {
			self.viewManager.specialTestControlActivePage('');
			self.viewManager.specialTestTwoControlActivePage('');
			self.viewManager.specialTestThreeControlActivePage('');
			self.viewManager.specialTestOneControlActivePage('');
			// self.viewManager.monitorTestsetRunActivePage('');
		}
	};
	return new SpecialTestLoadViewModel();
});