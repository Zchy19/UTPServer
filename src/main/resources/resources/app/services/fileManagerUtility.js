define([  ], function() {

	function fileManagerUtility() {
		
		this.root = "project";
		
		this.testcaseConfigInit = function(){
			webix.env.cdn = "resources/plugins/webix";
			webix.i18n.filemanager = {
				    actions: "操作",
				    back: "回退",
				    forward: "前进",
				    levelUp: "上一级",
				    name: "名称",
				    size: "Size",
				    type: "类型",
				    date: "日期",
				    copy: "拷贝",
				    cut: "剪切",
				    paste: "粘贴",				    
				    remove: "删除",
				    create: "新建测试用例组",
				    upload: "导入",
				    rename: "重命名",
				    location: "Location",
				    select: "Select Files",
				    sizeLabels: ["B","KB","MB","GB"],
				    iconsView: "图标",
				    tableView: "列表",
				    hideTree: "隐藏",
				    showTree: "显示",
				    collapseTree: "合并",
				    expandTree: "展开",
				    saving: "Saving...",
				    errorResponse: "Error: changes were not saved!",
				    replaceConfirmation: "Would you like to replace existing files?",
				    createConfirmation: "The folder already exists. Would you like to replace it?",
				    renameConfirmation: "The file already exists. Would you like to replace it?",
				    yes: "Yes",
				    no: "No",
				    types:{
				        folder: "测试用例组",
				        doc: "Document",
				        excel: "Excel",
				        pdf: "PDF",
				        pp: "PowerPoint",
				        text: "子脚本",
				        video: "Video File",
				        image: "Image",
				        code: "Code",
				        audio: "Audio",
				        archive: "Archive",
				        file: "测试用例"
				    }
				};
		};
		
		this.runablescriptConfigInit = function(){
			webix.env.cdn = "resources/plugins/webix";
			webix.i18n.filemanager = {
				    actions: "操作",
				    back: "回退",
				    forward: "前进",
				    levelUp: "上一级",
				    name: "名称",
				    size: "Size",
				    type: "类型",
				    date: "日期",
				    copy: "拷贝",
				    cut: "剪切",
				    paste: "粘贴",				    
				    remove: "删除",
				    create: "新建业务脚本组",
				    upload: "导入",
				    rename: "重命名",
				    location: "Location",
				    select: "Select Files",
				    sizeLabels: ["B","KB","MB","GB"],
				    iconsView: "图标",
				    tableView: "列表",
				    hideTree: "隐藏",
				    showTree: "显示",
				    collapseTree: "合并",
				    expandTree: "展开",
				    saving: "Saving...",
				    errorResponse: "Error: changes were not saved!",
				    replaceConfirmation: "Would you like to replace existing files?",
				    createConfirmation: "The folder already exists. Would you like to replace it?",
				    renameConfirmation: "The file already exists. Would you like to replace it?",
				    yes: "Yes",
				    no: "No",
				    types:{
				        folder: "业务脚本组",
				        doc: "Document",
				        excel: "Excel",
				        pdf: "PDF",
				        pp: "PowerPoint",
				        text: "子脚本",
				        video: "Video File",
				        image: "Image",
				        code: "Code",
				        audio: "Audio",
				        archive: "Archive",
				        file: "业务脚本"
				    }
				};
		};

		this.commonConfigInit = function(){
			webix.env.cdn = "resources/plugins/webix";
			webix.i18n.filemanager = {
				    actions: "操作",
				    back: "回退",
				    forward: "前进",
				    levelUp: "上一级",
				    name: "名称",
				    size: "Size",
				    type: "类型",
				    date: "日期",
				    copy: "拷贝",
				    cut: "剪切",
				    paste: "粘贴",				    
				    remove: "删除",
				    create: "新建公共逻辑组",
				    upload: "导入",
				    rename: "重命名",
				    location: "Location",
				    select: "Select Files",
				    sizeLabels: ["B","KB","MB","GB"],
				    iconsView: "图标",
				    tableView: "列表",
				    hideTree: "隐藏",
				    showTree: "显示",
				    collapseTree: "合并",
				    expandTree: "展开",
				    saving: "Saving...",
				    errorResponse: "Error: changes were not saved!",
				    replaceConfirmation: "Would you like to replace existing files?",
				    createConfirmation: "The folder already exists. Would you like to replace it?",
				    renameConfirmation: "The file already exists. Would you like to replace it?",
				    yes: "Yes",
				    no: "No",
				    types:{
				        folder: "公共逻辑组",
				        doc: "Document",
				        excel: "Excel",
				        pdf: "PDF",
				        pp: "PowerPoint",
				        text: "子脚本",
				        video: "Video File",
				        image: "Image",
				        code: "Code",
				        audio: "Audio",
				        archive: "Archive",
				        file: "公共逻辑"
				    }
				};
		};

		this.requirementConfigInit = function(){
			webix.env.cdn = "resources/plugins/webix";
			webix.i18n.filemanager = {
				    actions: "操作",
				    back: "回退",
				    forward: "前进",
				    levelUp: "上一级",
				    name: "名称",
				    size: "Size",
				    type: "类型",
				    date: "日期",
				    copy: "拷贝",
				    cut: "剪切",
				    paste: "粘贴",				    
				    remove: "删除",
				    create: "新建需求组",
				    upload: "导入",
				    rename: "重命名",
				    location: "Location",
				    select: "Select Files",
				    sizeLabels: ["B","KB","MB","GB"],
				    iconsView: "图标",
				    tableView: "列表",
				    hideTree: "隐藏",
				    showTree: "显示",
				    collapseTree: "合并",
				    expandTree: "展开",
				    saving: "Saving...",
				    errorResponse: "Error: changes were not saved!",
				    replaceConfirmation: "Would you like to replace existing files?",
				    createConfirmation: "The folder already exists. Would you like to replace it?",
				    renameConfirmation: "The file already exists. Would you like to replace it?",
				    yes: "Yes",
				    no: "No",
				    types:{
				        folder: "需求组",
				        doc: "Document",
				        excel: "Excel",
				        pdf: "PDF",
				        pp: "PowerPoint",
				        text: "检查点",
				        video: "Video File",
				        image: "Image",
				        code: "Code",
				        audio: "Audio",
				        archive: "Archive",
				        file: "需求"
				    }
				};
		};
	}
	return new fileManagerUtility();
})