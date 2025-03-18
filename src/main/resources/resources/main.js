requirejs.config({
	/*
	urlArgs: "dm=" + (new Date()).getTime(),
	*/
	urlArgs: "v=0.4",
	/*https://stackoverflow.com/questions/26653748/durandal-view-not-found-searched-for-on-intermittent*/
	waitSeconds : 0,
    paths: {      
    	'jquery': 'plugins/jQuery/jquery-2.2.3.min',
    	'jquery-ui': 'plugins/jQueryUI/jquery-ui',    	
        'jquerycookie': 'dist/js/jquery-cookie',
    	'bootstrap' : 'bootstrap/js/bootstrap',
    	'AdminLTE' : 'dist/js/app',
        'text': 'dist/js/text',
        'durandal': 'dist/js/durandal/',
        'plugins': 'dist/js/durandal/plugins',
        'knockout': 'dist/js/knockout-3.4.0',
        "knockout-postbox": "dist/js/knockout-postbox.min",
        "knockout-sortable": "plugins/knockout-sortable/knockout-sortable",
        'komapping': 'dist/js/knockout.mapping',
        'lang' : 'dist/js/jquery-lang',
        'services' : 'app/services',
        'viewmodels' : 'app/viewmodels',
        'codemirror' : 'dist/codemirror',      
        'sockjs' : 'dist/js/sockjs-0.3.min',
        'stomp' : 'dist/js/stomp',
        'xlsx': 'plugins/sheetjs-master/xlsx.full.min',
        'datepicker': 'plugins/bootstrap-datepicker/js/bootstrap-datepicker',
        'datetimepicker': 'plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker',
        'raphael': 'plugins/scriptview/raphael-min',
        'sequencediagram': 'plugins/scriptview/sequence-diagram-min',
        'underscore': 'plugins/scriptview/underscore-min',
        'sequencediagramsnap':'plugins/scriptview/sequence-diagram-snap-min',
        'snap.svg' : 'plugins/scriptview/snap.svg-min',
        'blockUI' : 'dist/js/jquery.blockUI',
        'notify': 'plugins/bootstrap-notify/bootstrap-notify.min',
        'validator': 'plugins/bootstrap-validator/validator',
        'bootstrapSwitch':'plugins/bootstrap-switch/js/bootstrap-switch',
        'later': 'plugins/later/later',
	//	'Promise': 'plugins/prim',
		'poly' : 'plugins/browser-polyfill.min',
        'datatables.net' : 'plugins/datatables/DataTables-1.10.18/js/jquery.dataTables.min',
        'datatables.net-bs' : 'plugins/datatables/DataTables-1.10.18/js/dataTables.bootstrap.min',
        'datatables.net-buttons' : 'plugins/datatables/Buttons-1.5.4/js/dataTables.buttons.min',       
        'datatables.net-buttons-html5' : 'plugins/datatables/Buttons-1.5.4/js/buttons.html5.min',
        'datatables.net-buttons-flash' : 'plugins/datatables/Buttons-1.5.4/js/buttons.flash.min',
        'datatables.net-buttons-print' : 'plugins/datatables/Buttons-1.5.4/js/buttons.print.min',
        'datatables.net-js' : 'plugins/datatables/JSZip-2.5.0/jszip.min',
        'jbinary': 'plugins/jBinary/jbinary',
        'jdataview': 'plugins/jDataView/jdataview',
        'ace': 'plugins/ace-1.4.12/lib/ace',
        'knockstrap':'plugins/knockstrap/knockstrap',
        'jsoneditor': 'plugins/jsoneditor/jsoneditor.min',
        'lodash':'plugins/lodash/lodash.min',
    //    'datatables.net-pdf' : 'plugins/datatables/pdfmake-0.1.36/pdfmake.min',
    //    'datatables.net-pdf-font' : 'plugins/datatables/pdfmake-0.1.36/vfs_fonts',
        'crypto':'plugins/crypto-js',
        'jsencrypt':'plugins/jsencrypt/bin/jsencrypt',
    },
    shim: {
        'sequencediagramsnap':['snap.svg','jquery'],
        'sequencediagram' : ['sequencediagramsnap','snap.svg','underscore','jquery'],
        'jquerycookie' : ['jquery'],
        'blockUI' : ['jquery'],       
        'jquery-ui' : ['jquery'],
        'xlsx': ['jquery'],
        'bootstrap' : ['jquery'],
        'datatables' : ['bootstrap', 'jquery'],
        'AdminLTE' : ['bootstrap','jquery'],
        'ace' : ['bootstrap','jquery'],
        'knockout-sortable' : ['jquery-ui', 'jquery', 'knockout'],
        'notify': { deps: ['jquery'], exports: '$.notify' },
        'jsoneditor':{exports:'JSONEditor'},
        'validator': ['bootstrap','jquery'],
        'datetimepicker' : ['bootstrap'],
        'bootstrapSwitch':['bootstrap'],
        'datatables.net':['bootstrap','jquery'],
        'datatables.net-bs':['bootstrap','jquery'],
        'datatables.net-buttons':['bootstrap','jquery'],
        'datatables.net-buttons-html5':['bootstrap','jquery'],
        'datatables.net-buttons-flash':['bootstrap','jquery'],
        'datatables.net-buttons-print':['bootstrap','jquery'],
        'datatables.net-js':['bootstrap','jquery'],
        'jdataview': ['bootstrap','jquery'],
        'jbinary': ['bootstrap','jquery', 'jdataview'],
        'knockstrap':{deps: ['knockout', 'jquery', 'bootstrap']},
  //      'datatables.net-pdf':['bootstrap','jquery'],
  //      'datatables.net-pdf-font':['bootstrap','jquery'],
      }    
});


define(['jquery','durandal/system', 'durandal/app', 'poly', 'durandal/viewLocator', 'knockout', 'jquerycookie', 'datatables.net-js','datatables.net',
	'datatables.net-bs','datatables.net-buttons','datatables.net-buttons-html5','datatables.net-buttons-flash','datatables.net-buttons-print'], 
        function ($, system, app, poly, viewLocator, ko, cookie, jszip) {
	window.JSZip = jszip;
	//window.pdfmake = pdfmake;
	// start application.
    system.debug(false);
    app.title = 'UTP协同自动化测试平台';

    Date.prototype.format = function(fmt) { 
         var o = { 
            "M+" : this.getMonth()+1,                 
            "d+" : this.getDate(),                    
            "h+" : this.getHours(),                   
            "m+" : this.getMinutes(),                
            "s+" : this.getSeconds(),                 
            "q+" : Math.floor((this.getMonth()+3)/3), 
            "S"  : this.getMilliseconds()             
        }; 
        if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
        }
         for(var k in o) {
            if(new RegExp("("+ k +")").test(fmt)){
                 fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
             }
         }
        return fmt; 
   };
    
    app.configurePlugins({
        router: true,
        dialog: true,
        widget: {
            kinds: ['grid']
        }
    });
    viewLocator.useConvention("app/viewmodels", "app/views");
    app.start()
       .then(function () {
           app.setRoot('app/viewmodels/index');
    	   /*
    	   if ($.cookie('loginSucc') == "true") 
    		   app.setRoot('app/viewmodels/shell');
    	   else
    		   app.setRoot('app/viewmodels/index');
    	  */
       });
});

