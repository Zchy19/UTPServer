define(['knockout'  ], function(ko) {
	function reportService() {
		this.nowDate = new Date();
	    this.previousDate = new Date();	    
	    this.previousDate.setMonth(this.nowDate.getMonth() - 1);
	}
	return new reportService();
})