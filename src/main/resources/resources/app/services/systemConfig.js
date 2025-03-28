define(['knockout', 'jquery', 'services/ursService', 'services/loginManager'], function (ko, $, ursService, loginManager) {
    function systemConfigs() {
        // default use email.
        var self = this;
        // var assignedAuthorizationKey = "";
        this.ursService = ursService;
        this.loginManager = loginManager;
        this.getFeatures = function () {
            self.ursService.getConfigByModule($.cookie("userName"), "utpclient", function (data) {
                self.visitNum = 0;
                self.loginManager.allFeatures(data.systemConfigs);
            });
        }
        this.visitNum = 0;
        this.getConfig = function (featureName) {
            // var feature = decodeURIComponent($.cookie("feature"));
            var feature = self.loginManager.allFeatures();
            if (feature == null || feature == "" || feature == "undefined") {
                self.visitNum++;
                if (self.visitNum > 25) {
                    return false;
                }
                self.ursService.getConfigByModule($.cookie("userName"), "utpclient", function (data) {
                    self.visitNum = 0;
                    self.loginManager.allFeatures(data.systemConfigs);
                    feature = self.loginManager.allFeatures();
                    for (var i = 0; i < feature.length; i++) {
                        //比较字符串是否相等,忽略大小写,忽略空格
                        if (feature[i].featureName.replace(/\s/g, "").toLowerCase() == featureName.replace(/\s/g, "").toLowerCase()) {
                            return true;
                        }
                    }
                });
            } else {
                // feature = JSON.parse(feature);
                for (var i = 0; i < feature.length; i++) {
                    //比较字符串是否相等,忽略大小写,忽略空格
                    if (feature[i].featureName.replace(/\s/g, "").toLowerCase() == featureName.replace(/\s/g, "").toLowerCase()) {
                        return true;
                    }
                }
            }
            return false;
        }
        this.getAllDemandByFeatureName = function (featureName) {
            // var feature = decodeURIComponent($.cookie("feature"));
            var feature = self.loginManager.allFeatures();
            if (feature == null || feature == "" || feature == "undefined") {
                self.ursService.getConfigByModule($.cookie("userName"), "utpclient", function (data) {
                    self.visitNum = 0;
                    self.loginManager.allFeatures(data.systemConfigs);
                    feature = self.loginManager.allFeatures();
                    for (var i = 0; i < feature.length; i++) {
                        //比较字符串是否相等,忽略大小写,忽略空格
                        if (feature[i].featureName.replace(/\s/g, "").toLowerCase() == featureName.replace(/\s/g, "").toLowerCase()) {
                            return feature[i];
                        }
                    }

                });
            } else {
                // feature = JSON.parse(feature);
                for (var i = 0; i < feature.length; i++) {
                    //比较字符串是否相等,忽略大小写,忽略空格
                    if (feature[i].featureName.replace(/\s/g, "").toLowerCase() == featureName.replace(/\s/g, "").toLowerCase()) {
                        return feature[i];
                    }
                }
            }
            return null;
        };
        //获取配置值
        this.getConfigValuesByFeatureName = function (featureName) {
            var feature = self.getAllDemandByFeatureName(featureName);
            if (feature) {
                if (feature.configValues) {
                    return feature.configValues;
                }
            }
            return null;
        }
        //获取是否显示并启用
        this.getEnableByFeatureName = function (featureName) {
            var configValues = self.getConfigValuesByFeatureName(featureName);
            if (configValues != null) {
                //将configValues的值转换为json对象
                var configValuesObj = JSON.parse(configValues);
                //获取configValues的值
                var enable = configValuesObj.enable;
                return enable;
            } else {
                return false;
            }
        };
        //获取有value的feature
        this.getValueByFeatureName = function (featureName) {
            var configValues = self.getConfigValuesByFeatureName(featureName);
            if (configValues != null) {
                // 将configValues的值转换为json对象
                var configValuesObj = JSON.parse(configValues);
                var value = 0;
                var hideDisabledCmd = false;

                if (configValuesObj.value != null && configValuesObj.value !== "") {
                    value = configValuesObj.value;
                }

                if (configValuesObj.hide_disabled_cmd != null && configValuesObj.hide_disabled_cmd === true) {
                    hideDisabledCmd = true;
                }
                return {
                    value: value,
                    hideDisabledCmd: hideDisabledCmd
                }
            } else {
                if (featureName == 'utpclient.testcommand.max_enable_level') {
                    return {
                        value: 0,
                        hideDisabledCmd: false
                    };
                } else if (featureName == 'utpclient.proto_mgr.pattern') {
                    return {
                        value: "simpleAndAdvanced"
                    };
                } else {
                    return {
                        value: 0
                    };
                }

            }
        };
    }
    return new systemConfigs();
})
