define([ 'jquery', 'lang', 'services/langManager' ], function($, lang, langManager ) {

	function datatableManager() {		
		this.tableDict = {};
		this.bindingDataTable = function(tableId) {
			if (this.tableDict[tableId] != null && this.tableDict[tableId].length > 0) {
				//this.tableDict[tableId].fnClearTable(false);
				//this.tableDict[tableId].fnClearTable();
				//this.tableDict[tableId].fnDraw();  
				this.tableDict[tableId].fnDestroy(false);
				this.tableDict[tableId].fnDraw();  
			}
                                                                                           
			var table = $(tableId).dataTable(
			{
				"oLanguage" : {
					"sUrl" : "./dist/js/langpack/datatable."+ langManager.currentlang + ".json"
				}
			});
			this.tableDict[tableId] = table;			
			return table;
		};
	}
	return new datatableManager();
})