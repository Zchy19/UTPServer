define(['durandal/app', 'knockout', 'jquery', 'komapping','services/utpService', 'services/cmdConvertService', 'services/notificationService'],
		function(app, ko, $, komapping, utpService, cmdConvertService, notificationService){
    function specialTestService() {
        var self = this;

        this.haveEngine = ko.observable(true);
        this.isExecuting = ko.observable(false);
        this.clearALL = ko.observable(false);

        this.flagone = ko.observable(true);
        this.startone = ko.observable(false);

        this.flagtwo = ko.observable(true);
        this.starttwo = ko.observable(false);

        this.flagthree = ko.observable(true);
        this.startthree = ko.observable(false);

        this.flagfour = ko.observable(true);
        this.startfour = ko.observable(false);

         // 通用订阅方法
         this.subscribe = (observable, callback) => {
            console.log("Subscribing to observable");
            observable.subscribe((newValue) => {
                callback(newValue);
            });
            return observable.subscribe(callback);
        };

    }

    return new specialTestService();
});