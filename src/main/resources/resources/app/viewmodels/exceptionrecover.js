define(
		[ 'jquery', 'durandal/app', 'knockout', 'lang', 'services/utpService', 'komapping', 'services/utilityService',
				'services/selectionManager', 'services/projectManager', 'services/notificationService', 'validator', 'bootstrapSwitch', 'services/fileManagerUtility'],
		function($, app, ko, lang,  utpService, komapping, utilityService, selectionManager,
				 projectManager, notificationService, validator, bootstrapSwitch, fileManagerUtility) {			
			
	function ExceptionRecoverViewModel() {
		var self = this;
		
		this.selectionManager = selectionManager;
		this.projectManager = projectManager;
		this.fileManagerUtility = fileManagerUtility;
		this.utpService = utpService;
		this.currentExceptionRecover = null;
		this.showEmptyExceptionRecover = ko.observable(false);		
		this.inEdit = false;		
		this.subScriptTree = null;
		this.exceptionRecoverRefreshSubScription = null;
		this.count = 0;
		
		this.exceptionRecovers = komapping.fromJS([], {
			key : function(item) {
				return ko.utils.unwrapObservable(item.id);
			}
		});
				
		this.editingExceptionRecover = {
			id : ko.observable(0),
			description : ko.observable(''),
			name : ko.observable(''),			
			projectId : ko.observable(''),
			subscriptId : ko.observable(''),
			isDefault : ko.observable(false),
		};
		
		//add		
		this.createExceptionRecoverSuccessFunction = function(data){
			if(data != null && data.status === 1){
				var exceptionRecover = data.result;
				if(exceptionRecover.isDefault)
					for(var i = 0; i < self.exceptionRecovers().length;i++){
						self.exceptionRecovers()[i].isDefault(false);			
					}
				self.exceptionRecovers.unshift(komapping.fromJS(exceptionRecover));
				notificationService.showSuccess('创建异常恢复配置成功');
			}				
			else
				notificationService.showSuccess('创建异常恢复配置失败');
		};
		
		this.createExceptionRecoverErrorFunction = function(){			
			notificationService.showError('创建异常恢复配置失败');	
		};
		
		this.createExceptionRecover = function() {
			self.editingExceptionRecover.id(++self.count);
			self.editingExceptionRecover.projectId(self.selectionManager.selectedProject().id);
			self.editingExceptionRecover.name("");
			self.editingExceptionRecover.description("");
			self.editingExceptionRecover.subscriptId("");
			self.editingExceptionRecover.isDefault(false);			
			self.inEdit = false;
			self.getProjectSubScript();
		};
		
		//edit
		this.initSubScriptTree = function(scripts){
			var data = [];
			data.push(scripts);			
			$('#exceptionSubScriptTreeview').html('');
			webix.ready(function(){					
				self.subScriptTree = webix.ui({
					container:"exceptionSubScriptTreeview",
					view:"tree",
					select:true,
					data : data,
					ready:function(){
						this.closeAll();
						this.open(self.fileManagerUtility.root);
						this.sort("value", "asc", "string");
						this.unselectAll();
						if(self.editingExceptionRecover.subscriptId() != '')
							this.select(self.editingExceptionRecover.subscriptId());
					}
				});
			});
		}
		
		this.prepareSubScriptTreeData = function(data){
			if(data != null){
			//	var scripts = self.projectManager.generateScriptGroups(data);	
				var scripts = self.projectManager.generateScriptGroupsFromFlatInfo(data);	
				self.projectManager.removeEmptyScriptGroup(scripts.data);
				if(scripts.data == null || scripts.data.length == 0)
					notificationService.showWarn('无参子脚本不存在， 无法配置异常恢复！');	
				else
					$('#exceptionRecoverLoadModal').modal(
							{show: true}, 
							{scripts: scripts}
					);
			}
		}		
		
		
		this.resetValidator = function(){
			$('#exceptionRecoverForm').validator().off('submit');
			$('#exceptionRecoverForm').validator('destroy').validator();
			$('#exceptionRecoverForm').validator().on('submit', function (e) {
				  if (e.isDefaultPrevented()) {
				    // handle the invalid form...
				  } else {	
					  e.preventDefault();
					  self.submit();
				  }
				});		
		}
		
		this.getSubScriptSuccessFunction = function(data){
			if (data != null && data.status === 1){
				self.prepareSubScriptTreeData(data.result);
				self.resetValidator();
			}
			else
				self.getSubScriptErrorFunction();
		}
		
		this.getSubScriptErrorFunction = function(){
			notificationService.showError('获取异常恢复脚本失败');	
		}
		
		this.getProjectSubScript = function() {					
		//	utpService.getSubScriptWithoutParamByProject(selectionManager.selectedProject().id, self.getSubScriptSuccessFunction, self.getSubScriptErrorFunction);
			utpService.getFlatSubScriptWithoutParamByProject(selectionManager.selectedProject().id, self.getSubScriptSuccessFunction, self.getSubScriptErrorFunction);
		}
		
        // function that gathers IDs of checked nodes        
        
        this.submit = function () {        	
        	var selectedScript = self.subScriptTree.getSelectedItem();
        	if(selectedScript == undefined || selectedScript == null || selectedScript.dataType != 'subscript')
        		self.showEmptyExceptionRecover(true);
        	else{
            	self.showEmptyExceptionRecover(false);
        		var scriptObj = {
					projectId : self.selectionManager.selectedProject().id,
					id : self.editingExceptionRecover.id(),
					subscriptId : selectedScript.id,
					subscriptName : selectedScript.value,
					description : self.editingExceptionRecover.description(),
					name: self.editingExceptionRecover.name(),
					isDefault :  self.editingExceptionRecover.isDefault()					
				};
        		
        		if(self.inEdit)
        			self.utpService.updateExceptionRecover(scriptObj, self.updateExceptionRecoverSuccessFunction, self.updateExceptionRecoverErrorFunction);
        		else
        			self.utpService.createExceptionRecover(scriptObj, self.createExceptionRecoverSuccessFunction, self.createExceptionRecoverErrorFunction);        		  			
        		$('#exceptionRecoverLoadModal').modal('hide');
            }            
        };
        
        this.updateExceptionRecoverSuccessFunction = function(data){
        	if (data != null && data.status === 1){
        		var exceptionRecoverInfo = data.result;
        		for(var i = 0; i < self.exceptionRecovers().length;i++){
					if(self.exceptionRecovers()[i].id() === exceptionRecoverInfo.id)						
						self.exceptionRecovers.splice(i, 1, komapping.fromJS(exceptionRecoverInfo));
					else{						
						if(exceptionRecoverInfo.isDefault)
							self.exceptionRecovers()[i].isDefault(false);
					}						
				}
        		notificationService.showSuccess('更新异常恢复配置成功');        		
			}
        	else
        		 self.updateExceptionRecoverErrorFunction();
        };
        
        this.updateExceptionRecoverErrorFunction = function(){
        	notificationService.showError('更新异常恢复配置失败');	
        };
		
		this.enterEditItemMode = function(item) {
			self.editingExceptionRecover.id(item.id());
			self.editingExceptionRecover.projectId(item.projectId());
			self.editingExceptionRecover.name(item.name());
			self.editingExceptionRecover.description(item.description());
			self.editingExceptionRecover.subscriptId(item.subscriptId());
			self.editingExceptionRecover.isDefault(item.isDefault());
			self.inEdit = true;
			self.getProjectSubScript();
		}
		
		this.cancel = function() {			
			$('#exceptionRecoverLoadModal').modal('hide');
		};
		
		// remove
		this.deleteExceptionRecoverSuccessFunction = function(data){
			if (data != null && data.status === 1 && data.result) {
				self.exceptionRecovers.remove(self.currentExceptionRecover);
				//self.exceptionRecovers.mappedRemove({id : self.currentExceptionRecover.id()});
				notificationService.showSuccess('删除异常恢复配置成功');	
			}
			else
				self.deleteExceptionRecoverErrorFunction();
		}
		
		this.deleteExceptionRecoverErrorFunction = function(){
			notificationService.showError('删除异常恢复配置失败');
		}
		
		this.deleteCurrentExceptionRecover = function(){
			self.utpService.deleteExceptionRecover(self.selectionManager.selectedProject().id, self.currentExceptionRecover.id(), self.deleteExceptionRecoverSuccessFunction, self.deleteExceptionRecoverErrorFunction);
		}
		
		this.remove = function(item) {
			$('#deleteExceptionRecoverModal').modal('show');
			self.currentExceptionRecover = item;	
		};
		
		this.initExceptionRecover = function(currentState){
			$('#exceptionRecoverEnable').bootstrapSwitch("state", currentState);
			$('#exceptionRecoverEnable').on('switchChange.bootstrapSwitch', function (event, state) {
				self.editingExceptionRecover.isDefault(state);   
	        });
		}
		
		this.getExceptionRecoversSuccessFunction = function(data){
			if(data != null && data.status === 1)
				komapping.fromJS( data.result, {}, self.exceptionRecovers );
			else
				self.getExceptionRecoversErrorFunction();
		}
		
		this.getExceptionRecoversErrorFunction = function(){
			notificationService.showError('获取异常恢复配置失败');
		}
		
		this.getExceptionRecovers = function() {
			self.exceptionRecovers([]);
		    self.utpService.getExceptionRecoverByProjectId(self.selectionManager.selectedProject().id, 
		    		self.getExceptionRecoversSuccessFunction, self.getExceptionRecoversErrorFunction);				  		
		}
		
		this.detached = function(view, parent){
			
		};
		
		this.activate = function() {			
			self.getExceptionRecovers();
		};	
		
		this.attached = function(view, parent) {			
			$('#exceptionRecoverLoadModal').on('shown.bs.modal', function(e) {
				self.showEmptyExceptionRecover(false);
				self.initExceptionRecover(self.editingExceptionRecover.isDefault());				
				self.initSubScriptTree(e.relatedTarget.scripts);
			});
		};
	}
	return new ExceptionRecoverViewModel();
});
