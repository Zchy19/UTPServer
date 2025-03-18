define(['knockout','services/guidGenerator', 'services/selectionManager'], function(ko, guidGenerator, selectionManager) {

	function executionManager() {
		var self = this;		
		this.newExecutionFlag = ko.observable(true);
		this.currentExecutionStatus = "";
		// client id is unique id for each page.
		this.isHistory=ko.observable(false);
        this.selectedExecutionId = null;
        this.trueExecution = false;
		this.selectedEngineName = ko.observable();

		this.switchExecutionConfirmed=ko.observable(false);
        
        this.setTrueExecition = function(label){
        	self.trueExecution = label;
        }
        
        this.getTrueExecution = function(){
        	return self.trueExecution;
        }
        
		this.setSelectedExecutionId = function(executionId) {
			self.selectedExecutionId = executionId;
		};
		// execution id is unique id for each engine.
    	this.getExecutionId = function() {
			if(self.newExecutionFlag())
			{
				return guidGenerator.create();
			}
			else{
				return self.selectedExecutionId;
			}
    	};
    	
		this.getGuid = function(){
			return guidGenerator.create();
		};

    	this.engineInitializing = "EngineInitializing";
    	this.engineInitialized = "EngineInitialized";
    	this.engineConfiguring = "EngineConfiguring";
    	this.engineConfigured = "EngineConfigured";
    	this.analyzingScript = "AnalyzingScript";
    	this.scriptAnalyzed = "ScriptAnalyzed";
    	this.waitingMatchAntbot = "WaitingMatchAntbot";
    	
    	this.configureError = "ConfigureError";
    	this.utpCoreNetworkError = "UtpCoreNetworkError";
    	this.analyzeScriptError = "AnalyzeScriptError";
		this.AntbotNotFoundError = "AntbotNotFoundError";
    	this.startExecutionError = "StartExecutionError";
    	this.unknownError = "UnknownError";
		this.engineInitError="EngineInitError";
    	
    	this.notStarted = "NotStarted";
    	this.starting = "Starting";
    	this.running = "Running";
    	this.pausing = "Pausing";
    	this.paused = "Paused";
    	this.resuming = "Resuming";
    	this.stopping = "Stopping";
    	this.stopped = "Stopped";
    	this.exceptionHandling = "ExceptionHandling";
    	this.throwException = "ThrowException";
    	this.reconnectingNetwork = "ReconnectingNetwork";
    	this.terminated = "Terminated";
    	this.completed = "Completed";
    	this.excutionSwitching = "Switching";
	}
	return new executionManager();
})