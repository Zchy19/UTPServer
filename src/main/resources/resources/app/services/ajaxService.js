define(['knockout', 'jquery', 'jquerycookie', 'durandal/plugins/http', 'blockUI', 'services/notificationService', 'services/utilityService'],
		function(ko, $, JCookie, $http, blockUI, notificationService, utilityService) {
	
	function ajaxService() {
		var self = this;
		this.timeout = 10000;
		this.longtimeout = 600000;
		this.request = 0;
		
		this.getHeader = function(route){
			var header = {};
			if(route.indexOf('http') < 0){
				header.tenantId = $.cookie("orgId");
				header.accountId = $.cookie("userName");
			}
			if($.cookie("promoter") != null && $.cookie("promoter") != '')
				header.promoter = $.cookie("promoter");		
			return header;
		};
		
		this.AjaxPost = function (data, route, successFunction, errorFunction) {
        	$.blockUI(utilityService.template);
        	self.request++;
       // 	var timeoutHandler = getTimeoutHandler();        	
            setTimeout(function () {
                var xhr = $http.post(route, self.timeout, data, self.getHeader(route));
                xhr.success(function (response, status, headers, config) {
                	try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                //    if (jqXHR.IsAuthenicated === false) { window.location = "/index.jsp"; }
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(XMLHttpRequest, status){
                	self.request--;
                	if(self.request == 0)                		
                		$.unblockUI();
        //        	destroyTimeoutHandler(timeoutHandler);
                });
            }, 500);
        };
		
        this.AjaxPostNoBlock = function (data, route, successFunction, errorFunction) {         
            setTimeout(function () {
                var xhr = $http.post(route, self.timeout, data, self.getHeader(route))
                xhr.success(function (response, status, headers, config) {
                	try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }                    
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };
        
        this.AjaxPostFile = function (data, route, successFunction, errorFunction) {         
            setTimeout(function () {
                var xhr = $http.filepost(route, self.timeout, data, self.getHeader(route))
                xhr.success(function (response, status, headers, config) {
                	try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }                    
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };
        
        this.AjaxPostTimeConsumedNoBlock = function (data, route, successFunction, errorFunction) {
            setTimeout(function () {
            	var xhr = $http.post(route, self.longtimeout, data, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {                 
            		try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };
        
        this.AjaxPostWithNoAuthenication = function (data, route, successFunction, errorFunction) {
        	$.blockUI(utilityService.template);
        	self.request++;
            setTimeout(function () {
                var xhr = $http.post(route, self.timeout, data, self.getHeader(route));
                xhr.success(function (response, status, headers, config) {                	
                	try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }        
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                	self.request--;
                	if(self.request == 0)                		
                		$.unblockUI();
                });
            }, 500);
        };
        
        this.AjaxGet = function (route, successFunction, errorFunction) {
        	$.blockUI(utilityService.template);
        	self.request++;
            setTimeout(function () {
            	var xhr = $http.get(route, self.timeout, null, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {
                	try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }        
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                	self.request--;
                	if(self.request == 0)                		
                		$.unblockUI();
                });
            }, 500);
        };
        
        this.AjaxGetNoBlock = function (route, successFunction, errorFunction) {
            setTimeout(function () {
            	var xhr = $http.get(route, self.timeout, null, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {                	
            		try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }        
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };

		this.NativeAjaxGetBlob = function(route, successFunction, errorFunction) {
			return new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', route, true);
				xhr.responseType = 'blob'; // 强制指定响应类型
		
				// 添加请求头（从原有逻辑复制）
				var headers = self.getHeader(route);
				for (var key in headers) {
					if (headers.hasOwnProperty(key)) {
						xhr.setRequestHeader(key, headers[key]);
					}
				}
		
				xhr.onload = function() {
					if (xhr.status === 200) {
						// 直接返回 Blob 对象
						var blob = xhr.response;
						successFunction(blob, xhr.status);
						resolve(blob);
					} else {
						errorFunction(xhr);
						reject(new Error('请求失败，状态码: ' + xhr.status));
					}
				};
		
				xhr.onerror = function() {
					errorFunction(xhr);
					reject(new Error('网络错误'));
				};
		
				xhr.send();
			});
		};
        
        this.AjaxGetWithData = function (data, route, successFunction, errorFunction) {
        	$.blockUI(utilityService.template);
        	self.request++;
            setTimeout(function () {
            	var xhr = $http.get(route, self.timeout, data, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {
                	try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                	self.request--;
                	if(self.request == 0)                		
                		$.unblockUI();
                });
            }, 500);
        };
        
        this.AjaxGetWithDataNoBlock = function (data, route, successFunction, errorFunction) {
            setTimeout(function () {
            	var xhr = $http.get(route, self.timeout, data, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {                 
            		try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };
        
        this.AjaxGetTimeConsumedNoBlock = function (route, successFunction, errorFunction) {
            setTimeout(function () {
            	var xhr = $http.get(route, self.longtimeout, null, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {                 
            		try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };
        
		this.AjaxGetTimeConsumedWithDataNoBlock = function (data, route, successFunction, errorFunction) {
            setTimeout(function () {
            	var xhr = $http.get(route, self.longtimeout, data, self.getHeader(route));
            	xhr.success(function (response, status, headers, config) {                 
            		try{
                		successFunction(response, status);
                	}
                    catch(err){
                    	console.error(err.message);
                    }
                }).error(function (jqXHR, textStatus, errorThrown) {
                	errorProcess(xhr, route, jqXHR, textStatus, errorFunction);
                }).complete(function(){
                });
            }, 500);
        };

        function errorProcess(xhr, route, jqXHR, textStatus, errorFunction){
        	if(textStatus == 'timeout'){
        		xhr.abort();
        	}
        	console.log(textStatus + ": " + route);
        	errorFunction(jqXHR);
        }
        
        function getTimeoutHandler(){
        	var timeoutHandler = setTimeout(function () {
    			clearTimeout(timeoutHandler);
    			$.unblockUI();
    			notificationService.showError('请求超时，请检查网络是否正常连接！');
            }, 15000);
        	return timeoutHandler;
        }
        
        function destroyTimeoutHandler(timeoutHandler){
        	if(timeoutHandler)
        		timeoutHandler = clearTimeout(timeoutHandler);
        }
	}
    return new ajaxService();
});


