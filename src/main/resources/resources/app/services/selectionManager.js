define(['knockout'  ], function(ko) {

	function selectionManager() {
		var self = this;
    	this.selectedProject = ko.observable(null);
    	this.selectedAgentConfigId = ko.observable('');
        this.selectedNodeId = ko.observable('');
		this.selectedEngineName = ko.observable('');
        this.selectedNodeType = "";
        this.selectedNodeName = ko.observable('');
    	this.refreshTreeNodeCallback = null;
		this.verificationSource = '';

		this.clear = function() {
	    	self.selectedProject = ko.observable(null);
	    	self.selectedAgentConfigId = ko.observable('');
	    	self.selectedNodeId = ko.observable('');
			self.selectedEngineName = ko.observable('');
			self.selectedNodeType = "";
			self.verificationSource = '';
	    	self.refreshTreeNodeCallback = null;
		};  	
	}

	return new selectionManager();
})