define(
    [ 'jquery', 'durandal/app', 'bootstrap', 'lang', 
            'services/utpService', 'services/notificationService', 'komapping',
            'services/selectionManager', 'services/projectManager', 'knockout'],
    function($, app, bootstrap, lang, utpService, notificationService, komapping, selectionManager, projectManager, ko) {

var  customizedFieldViewModel = function(dataChanged){
    var self = this;
    
    this.selectionManager = selectionManager;
    this.projectManager = projectManager;
    
    this.customizedFields = ko.observableArray([]);
    
    this.currentCustomizedFild = ko.observableArray('');
    this.isEditMode = ko.observableArray(false);
    this.pageId = ko.observable('');
    this.dataChagned = dataChanged;

    this.enterAddItemMode = function() {
        self.currentCustomizedFild('');
        self.isEditMode(true);
    };
    
    this.addCustomizedField = function(){
        if(self.currentCustomizedFild() === '')
            notificationService.showWarn('自定义字段不能为空');
        else{
            var duplicate = false;
            for(var i = 0; i< self.customizedFields().length; i++)
                if(self.customizedFields()[i] === self.currentCustomizedFild())
                {
                    duplicate = true;
                    break;
                }
                    
            if(duplicate)
                notificationService.showWarn('自定义字段不能重复');
            else{
                // self.customizedFields.unshift(self.currentCustomizedFild());
                //将字段添加到元素末尾
                self.customizedFields.push(self.currentCustomizedFild());
                self.isEditMode(false);
                if (self.dataChagned && typeof self.dataChagned === "function"){
                    self.dataChagned(self.customizedFields());
                }
            }
        } 
    };

    this.cancelCustomizedField = function(){
        self.currentCustomizedFild('');
        self.isEditMode(false);
    };

    this.removeCustomizedField = function(item){
        self.customizedFields.remove(item);
        if (self.dataChagned && typeof self.dataChagned === "function"){
            self.dataChagned(self.customizedFields());
        }
    };

   
    this.detached = function(view, parent){
        
    };
    
    this.activate = function(activeData) {		
        if(activeData.pageId)
            self.pageId(activeData.pageId);
        self.customizedFields([]);
        if(activeData.customizedFields){
            for(var i = 0 ; i < activeData.customizedFields.length; i++)
                self.customizedFields.push(activeData.customizedFields[i]);
        }
    };	

    this.attached = function(view, parent) {			
       
    };
}
return customizedFieldViewModel;
});
