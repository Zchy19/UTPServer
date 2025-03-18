define([ 'jquery', 'komapping',  'services/executionManager', 'services/loginManager', 'services/selectionManager',
	     'services/viewManager', 'services/utpService','knockout', 'knockout-postbox'],
	function( $, komapping, executionManager, loginManager, selectionManager, viewManager, utpService, ko) {
	
		function ExecutionSelectorViewModel() {
			var self = this;
			this.executionList = ko.observableArray([]);
			this.selectedExecutionId = ko.observable("");

			this.selectExecution = function () {
				if(self.selectedExecutionId() == null)
					return;
				
                if(self.executionList().length > 0 )
                	$('#selectExecutionModal').modal('hide');
                else
                	$('#emptyExecutionModal').modal('hide');
                
                executionManager.setSelectedExecutionId(self.selectedExecutionId());
                executionManager.newExecutionFlag(false);
                viewManager.activePage('app/viewmodels/execution');
            };
			
			this.activate = function() {
			};				
			
			this.getCompletedExecutionListSuccessFunction = function(data){
				if(data && data.status === 1){
					var executionInfo = executionInfo.result;
					for (var i = 0; i < executionInfo.length; i++) {
						self.executionList.push(executionInfo[i]);
					}					
					if(self.executionList().length > 0 )
						$('#selectExecutionModal').modal('show');
					else
						$('#emptyExecutionModal').modal('show');
				}
				else
					$('#emptyExecutionModal').modal('show');				
			};
			
			this.getCompletedExecutionListErrorFunction = function(){};
			
			this.attached = function(view, parent) {
				self.executionList([]);
				utpService.getActiveExecutionList($.cookie("orgId"), $.cookie("lastSelectedProject"), 
						self.getCompletedExecutionListSuccessFunction, self.getCompletedExecutionListErrorFunction);
			};
		}
		return new ExecutionSelectorViewModel();
});
