define(['knockout','blockUI'], function(ko, blockUI) {
	function blockUIService() {
		this.template = { 
				message: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>' ,
				css: {
					border:     'none',
			        backgroundColor:'transparent'            
		        },
		        baseZ: 2000,
		};
	}
	return new blockUIService();
})