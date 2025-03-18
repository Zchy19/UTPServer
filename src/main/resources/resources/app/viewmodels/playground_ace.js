define([ 'knockout', 'jquery', 'komapping',
				'services/cmdConvertService',
				'services/loginManager', 'services/viewManager',
				'services/selectionManager', 'services/projectManager', 'services/protocolService','services/utpService',
				'sequencediagram', 'services/notificationService', 'services/fileManagerUtility', 'jsoneditor', 'lodash', 
				'bootstrapSwitch','ace/ace', 'ace/ext/language_tools'],
		function(ko, $, komapping,
				cmdConvertService, loginManager, viewManager, selectionManager,
				projectManager, protocolService, utpService, sequencediagram, notificationService, fileManagerUtility, JSONEditor, _, bootstrapSwitch, ace) {
	
			function PlaygroundViewModel() {
				var self = this;
				this.maxBlocks = 500;
				this.remainNumberOfBlocks = ko.observable(self.maxBlocks);
				this.viewManager = viewManager;
				this.projectManager = projectManager;
				this.protocolService = protocolService;
				this.fileManagerUtility = fileManagerUtility;
				this.utpService = utpService;
				
				this.fakeDragStack = [];
				this.workspace = null;				
				this.selectedAgent = null;
				this.agentsRecordData = ko.observableArray([]);
				this.selectedRecord = ko.observable('');
				this.scriptInTestSteps = ko.observable('');
				this.blockyConvertedFlag = false;
				this.testcaseSavedFlag = ko.observable(true);				
				this.needRecordSelected = ko.observable(true);
				this.needBigData = ko.observable(false);
				this.scriptRequirementMapping = null;
				this.selectScriptFunType = ko.observable('0');
				this.updated = false;
				this.tree = null;
				this.commandMapping = [];
				this.isTestcase = false;
				this.commandMode = ko.observable(false);
				this.blockOverwriteText = false;
				this.maxNameLength = 200;
				
				this.gotoTestcase = function(){
				//	self.viewManager.testcaseActiveData({reload:self.updated});
					self.projectManager.useBackupScripts = true;
					self.viewManager.testcaseActivePage('app/viewmodels/testcase');
				}
				
				this.busyPropInfo = ko.observable('');
				this.blockInitHappened = false;
				this.currentScript = {
					id : ko.observable(0),
					customizedId: ko.observable(''),
					projectId : ko.observable(0),
					parentScriptGroupId : ko.observable(0),
					description : ko.observable(''),
					name : ko.observable(''),
					script : ko.observable(''),
					blockyXml : ko.observable(''),
					type : ko.observable(''),				
				//	parameter : ko.observable('')
				};
				
				this.enableBlockScriptEdit = function() {
					if(!self.blockInitHappened){
						self.blockInitHappened = true;
						self.workspace.addChangeListener(blockyChangedEvent);
					}
					document.getElementById('script-edit').style.display = 'block';
					Blockly.svgResize(self.workspace);
					self.workspace.render();
				};

				this.disableScriptEdit = function() {
					document.getElementById('script-edit').style.display = 'none';
				};

				this.initTextEditor = function(){
					self.scriptEditor = ace.edit("editor");
					self.scriptEditor.setTheme("ace/theme/tomorrow");
					self.scriptEditor.getSession().setMode('ace/mode/text');
					self.scriptEditor.setFontSize(16);
					self.scriptEditor.setOptions({
						 enableBasicAutocompletion: true,
					     enableSnippets: true,
					     enableLiveAutocompletion: true
					});
					
					var staticWordCompleter = {
							getCompletions: function(editor, session, pos, prefix, callback) {
								callback(null, cmdConvertService.antKeywordText.map(function(word){
									return {
										name : word.name,
										value : word.value,
										caption: word.caption,
										type: word.type,
										meta: word.meta
									};
								}));
						    }
					};
					var langTools = ace.require('ace/ext/language_tools');
					langTools.addCompleter(staticWordCompleter); //self.scriptEditor.completers = [staticWordCompleter];								
					self.scriptEditor.session.on('change', function(delta) {
					    // delta.start, delta.end, delta.lines, delta.action
						self.blockNumberUpdate(0);
						self.testcaseSavedFlag(false);
					});
					var snippetManager = ace.require("ace/snippets").snippetManager;
					snippet = snippetManager.parseSnippetFile(cmdConvertService.antSnippetText, "text");
					snippetManager.register(snippet, "text");
					//self.scriptEditor.setValue("the new text here");
					//self.scriptEditor.setHighlightActiveLine(false);
					//self.scriptEditor.setReadOnly(true);
					//snippetManager.insertSnippet(self.scriptEditor,snippet);
				};

				this.initBlock = function() {
					this.setBackgroundColor();
					var match = location.search.match(/dir=([^&]+)/);
					var rtl = 'ltr';					
					var toolbox = this.getToolboxElement();					
					var match = location.search.match(/side=([^&]+)/);
					var side = match ? match[1] : 'start';					
					var agentOptions = [];
					for(var i=0;i<cmdConvertService.agentCmdList.length;i++){
						if(cmdConvertService.agentCmdList[i].commands != null){
							agentOptions[cmdConvertService.agentCmdList[i].name] = cmdConvertService.agentCmdList[i].commands;
						}						
					}
					
					self.workspace = Blockly.inject('blocklyDiv',
									{
										comments : true,
										collapse : true,
										disable : true,
										grid : {
											spacing : 25,
											length : 3,
											colour : '#ccc',
											snap : true
										},
										horizontalLayout : side == 'top' || side == 'bottom',
										maxBlocks : self.maxBlocks,
										media : 'plugins/blockly/media/',
										oneBasedIndex : true,
										readOnly : false,
										// rtl: rtl,
										scrollbars : true,
										toolbox : toolbox,
										toolboxPosition : side == 'top'
												|| side == 'start' ? 'start'
												: 'end',
										zoom : {
											controls : true,
											wheel : true,
											startScale : 1.0,
											maxScale : 4,
											minScale : .25,
											scaleSpeed : 1.1
										},
										agentOptions : agentOptions,
										// When no globalVariables defined or
										// its length equals to zero, the block
										// of global EVN will not displayed
										// within view
										// globalVariables : [{"VarName": "Env",
										// "VarValue":"test"}],
										// Script or TestCase or CheckPoint or All
										editType : 'None',
										// now only support 'zh_CN' and 'en'
										locale : 'zh'
									});
					self.workspace.options.getCheckpoint = self.projectManager.getRequirement;
					self.workspace.options.getScript = self.projectManager.getScript;
					self.workspace.options.getAgentType = self.projectManager.getAgentType;
				};
				
				function blockyChangedEvent(primaryEvent) {
					self.remainNumberOfBlocks(self.workspace.remainingCapacity());
				//	self.remainNumberOfBlocks(self.maxBlocks - self.workspace.getAllBlocks().length);
					
					if (primaryEvent.type == Blockly.Events.UI) {
						return; // Don't mirror UI events.
					}
					self.blockyConvertedFlag = false;
					if (self.blockInitHappened)
						self.testcaseSavedFlag(false);					
				};

				this.setBackgroundColor = function() {
					var lilac = '#d6d6ff';
					var currentPage = window.location.href;
					var regexFile = /^file[\S]*$/;
					// if (regexFile.test(currentPage))
					document.getElementById('blocklyDiv').style.backgroundColor = lilac;
				};

				this.getToolboxElement = function() {
					var match = location.search.match(/toolbox=([^&]+)/);
					return document.getElementById('toolbox-categories');
				};

				this.collapseBlocky = function() {
					var blocks = self.workspace.getAllBlocks();
					for (var i = 0; i < blocks.length; i++) {
						blocks[i].setCollapsed(true);
					}
				};

				this.expandBlocky = function() {
					var blocks = self.workspace.getAllBlocks();
					for (var i = 0; i < blocks.length; i++) {
						blocks[i].setCollapsed(false);
					}
				};
				
				this.blockNumberUpdate = function(change){
					if(self.maxBlocks - self.workspace.getAllBlocks().length - change < 0){
						notificationService.showWarn('已超过最大Block数目，无法添加.');
						return false;
					}
					self.remainNumberOfBlocks(self.maxBlocks - self.workspace.getAllBlocks().length - change);
					return true;
				}
				
				this.getTopBlocks = function(){
					var topBlocks = [];				
					if(self.workspace.topBlocks_ && self.workspace.topBlocks_.length > 0){
						self.workspace.topBlocks_.forEach(function(block){
							if(block.rendered != null && block.rendered)
								topBlocks.push(block);
			    		 })	
					}
					return topBlocks;
				}

				// insert sub script				
				this.getSubScriptSuccessFunction = function(data){
					if (data != null && data.status === 1){
						var scripts = self.projectManager.generateScriptGroupsFromFlatInfo(data.result);
						self.projectManager.removeEmptyScriptGroup(scripts.data);
						if(scripts.data == null || scripts.data.length == 0)
							notificationService.showWarn('该项目中不存在子脚本定义，无法引用.');			
						else{
							self.subScriptMapping = data.result;
							var project = [];
							project.push(scripts);							
							$('#insertScriptModal').modal({ show: true }, {data: project});	
						}											
					}					
					else
						notificationService.showWarn('该项目中不存在子脚本定义，无法引用.');
				}
				
				this.getSubScriptErrorFunction = function(){
					notificationService.showError('获取子脚本信息失败.');	
				};
				
				this.getProjectSubScript = function() {
					self.utpService.getFlatSubScriptByProject(selectionManager.selectedProject().id, self.getSubScriptSuccessFunction, self.getSubScriptErrorFunction);
				};
				
				this.initSubScriptTree = function(data){
					$('#subScriptTreeview').html('');
					webix.ready(function(){					
						self.subScriptTree = webix.ui({
							container:"subScriptTreeview",
							view:"tree",					
							template:function(obj, com){
								if(obj.$count === 0 && (obj.type === "folder")){
									var icon = obj.$count === 0 && (obj.type === "folder") ? ("<div class='webix_tree_folder'></div>") : com.folder(obj, com);
									return com.icon(obj, com) + icon + obj.value;
								}
								else
									return com.icon(obj, com) + com.checkbox(obj, com) + com.folder(obj, com) + obj.value;						
							},
							threeState: true,
							data : data,
							ready:function(){
								this.closeAll();
								this.open(self.fileManagerUtility.root);
								this.sort("value", "asc", "string");
							}
						});
					});
				};
				
				this.insertSubScriptCmd = function() {
					self.getProjectSubScript();
				};
				
				this.checkedSubScriptNodeIds = function(scripts, checkedNodes, checkedIds) {					
					for (var i = 0; i < scripts.length; i++) {
						if($.inArray(scripts[i].id, checkedIds) >= 0)
							checkedNodes.push(scripts[i]);
					}
				};
				
				this.insertSubScriptAsBlock = function(checkedNodes){
					var dom = Blockly.Xml.subScriptCallToDom(checkedNodes,
							this.workspace);
					if(self.selectScriptFunType() === '1')
						dom = Blockly.Xml.subScriptGetToDom(checkedNodes,
								this.workspace);
					if(!self.blockNumberUpdate(dom.getElementsByTagName('block').length))
						return false;
					Blockly.Xml.domToWorkspace(dom, self.workspace);
					return true;
				};
				
				this.insertSubScriptAsText = function(checkedNodes){
					for(var i = 0; i < checkedNodes.length; i++){
						var scriptStr = cmdConvertService.SUBSCRIPT_DEF + cmdConvertService.PARA_SEPARATOR + checkedNodes[i].id + '[' + checkedNodes[i].name +']';
						if(checkedNodes[i].parameter && checkedNodes[i].parameter != ''){
							var parameters = JSON.parse(checkedNodes[i].parameter);
							for(var j = 0; j < parameters.length; j++ )
								scriptStr += parameters[j] + cmdConvertService.PARA_SEPARATOR;
						}
						scriptStr += cmdConvertService.CMD_SEPARATOR;
						if(self.selectScriptFunType() === '1')
							scriptStr = cmdConvertService.GET_SCRIPT_CONTENT + cmdConvertService.PARA_SEPARATOR + 
									checkedNodes[i].id + '[' + checkedNodes[i].name +']' + cmdConvertService.PARA_SEPARATOR + '^x' +  cmdConvertService.CMD_SEPARATOR
						self.updateEditor(scriptStr + '\n');
					}
				};

				this.insertSubScript = function(){
					var checkedNodes = [];
					var checkedIds = self.subScriptTree.getChecked();
					self.checkedSubScriptNodeIds(self.subScriptMapping.scripts, checkedNodes, checkedIds);
					if (checkedNodes.length == 0)
						return;	

					if (self.selectedAgent == null)
						return;
					
					if(!self.insertSubScriptAsBlock(checkedNodes))
						return;
					self.insertSubScriptAsText(checkedNodes);
					$('#insertScriptModal').modal('hide');
					self.testcaseSavedFlag(false);
				};
				
				// insert checkpoint
				this.insertCheckpointCmd = function(){
					var project = self.projectManager.getRequirements();
					$('#insertCheckPointModal').modal({ show: true }, {data: project});	
				};
				
				this.initCheckPointTree = function(data){
					$('#checkPointTreeview').html('');
					webix.ready(function(){					
						self.checkPointTree = webix.ui({
							container:"checkPointTreeview",
							view:"tree",					
							template:function(obj, com){
								if(obj.$count === 0 && (obj.type === "folder")){
									var icon = obj.$count === 0 && (obj.type === "folder") ? ("<div class='webix_tree_folder'></div>") : com.folder(obj, com);
									return com.icon(obj, com) + icon + obj.value;
								}
								else
									return com.icon(obj, com) + com.checkbox(obj, com) + com.folder(obj, com) + obj.value;						
							},
							threeState: true,
							data : data,
							ready:function(){
								this.closeAll();
								this.uncheckAll();
								this.open(self.fileManagerUtility.root);
								this.sort("value", "asc", "string");
							}
						});
					});
				};
				
				this.checkedCheckPointNodeIds = function(checkedIds) {
					var checkedNodes = [];
					checkedIds.forEach(function(id){
						var node = self.checkPointTree.getItem(id);
						if(node.type != "folder")
							checkedNodes.push(node);
		    		 });
					return checkedNodes;
				};
				
				this.insertCheckPointAsText = function(checkedNodes){
					for(var i = 0; i < checkedNodes.length; i++){
						var checkpointStr = cmdConvertService.CHECKPOINT_BEGIN + cmdConvertService.PARA_SEPARATOR + 
									checkedNodes[i].id + '[' + checkedNodes[i].value +']' + cmdConvertService.CMD_SEPARATOR +
									cmdConvertService.CHECKPOINT_END + cmdConvertService.CMD_SEPARATOR;
						self.updateEditor(checkpointStr + '\n');
					}
				};
				
				this.insertCheckPointAsBlock = function(checkedNodes){
					var dom = Blockly.Xml.checkPointCallToDom(checkedNodes,
							this.workspace);
					if(!self.blockNumberUpdate(dom.getElementsByTagName('block').length))
						return;
					Blockly.Xml.domToWorkspace(dom, self.workspace);
				};

				this.insertCheckPoint = function(){
					var checkedIds = self.checkPointTree.getChecked();
					var checkedNodes = self.checkedCheckPointNodeIds(checkedIds);
					if (checkedNodes.length == 0)
						return;
					
					self.insertCheckPointAsBlock(checkedNodes);
					self.insertCheckPointAsText(checkedNodes);
					$('#insertCheckPointModal').modal('hide');
					self.testcaseSavedFlag(false);
				}
				
				// insert agent cmd
				this.checkedCommandNodes = [];

				this.prepareCmdTreeData = function(cmdList){
					if(cmdList == undefined || cmdList == null || cmdList.length == 0){
						notificationService.showWarn('命令不存在，请确认Antbot配置是否正确!');
						return;
					}
					
					self.commandMapping = [];						
					var selectedCommandHierarchy = [{
							data : [],
							value : '选择全部',
							id : self.fileManagerUtility.root,
							open:true
					}];				
					
					for (var i = 0; i < cmdList.length; i++) {								
						var cmdName = cmdList[i].CmdName;
						var parameters = cmdList[i].Params;
						var cmdType = cmdList[i].Type;
						var id = cmdList[i].Id;
						var	formattedCommandString = cmdConvertService.convertCmdToUserLanguange(self.selectedAgent.antbotType, cmdType, cmdName, parameters);						
						var commandObj = {
							commandName	: cmdName,
							commandParameters : parameters
						}
						
						self.commandMapping.push(commandObj);							
						selectedCommandHierarchy[0].data.push({
							value : formattedCommandString,
							id : id
						});							
					}
					self.initCmdTree(selectedCommandHierarchy);
				}
				
				this.initCmdTree = function(data){
					$('#commandSelectionView').html('');
					webix.ready(function(){					
						self.tree = webix.ui({
							container:"commandSelectionView",
							view:"tree",					
							template:function(obj, com){
								var icon = "";
								if(obj.$count)
									icon = '<span class="pull-left-container bg-blue"> 所有: </span>';								
								else
									icon = '<span class="pull-left-container bg-blue"> 命令: </span>';
									
								return com.icon(obj, com) + com.checkbox(obj, com) + icon + obj.value;						
							},
							threeState: true,
							data : data,
							ready:function(){
								this.closeAll();
								this.open(self.fileManagerUtility.root);
								this.sort("id", "asc", "int");
							}
						});
					});
				}
				
				this.initCommandHierarchy = function(rootId, recordId){
					self.utpService.getBigdata(rootId, recordId, self.getBigdataSuccessFunction, self.getBigdataErrorFunction);
				};

				function checkedCmdNodeIds(checkedIds, checkedNodes) {					
					for (var i = 0; i < checkedIds.length; i++) {
						if(checkedIds[i] != self.fileManagerUtility.root)
							checkedNodes.push(JSON.parse(JSON.stringify(self.commandMapping[checkedIds[i] - 1])));
					}
				};

				this.insertCommandsAsBlock = function(cmdsStrings){
					var dom1 = Blockly.Xml.agentCMDToDom(self.selectedAgent.antbotType, cmdsStrings.join('\n'),
							this.workspace);
					var xml = Blockly.Xml.domToPrettyText(dom1);
					var dom2 = Blockly.Xml.textToDom(xml);					
					if(!self.blockNumberUpdate(dom2.getElementsByTagName('block').length))
						return;
					Blockly.Xml.domToWorkspace(dom2, self.workspace);
				};
				
				this.insertCommandsAsText = function(cmdsStrings){
					for(var i = 0; i < cmdsStrings.length; i++){
						self.updateEditor(cmdsStrings[i] + cmdConvertService.CMD_SEPARATOR + '\n');
					}
				};
				
				this.prepareCommands = function(){
					var checkedNodes = self.checkedCommandNodes;
					var cmdsStrings = [];
					for (var x = 0; x < checkedNodes.length; x++){
						var cmdsString = cmdConvertService.generateCmd(self.selectedAgent.antbotName, checkedNodes[x].commandName, checkedNodes[x].commandParameters);
						if(cmdsString && cmdsString != '')
							cmdsStrings.push(cmdsString);
					}
					try{
						if(cmdsStrings.length > 0){
							self.insertCommandsAsBlock(cmdsStrings);
							self.insertCommandsAsText(cmdsStrings);
						}						
						self.testcaseSavedFlag(false);
                	}
                    catch(err){
                    	notificationService.showError('命令插入失败！');
                    }
				};

				this.insertCommands = function() {
					var checkedNodes = [];
					var checkedIds = self.tree.getChecked();					
					checkedCmdNodeIds(checkedIds, checkedNodes);
					
					if (checkedNodes.length == 0)
						return;					

					if (self.selectedAgent == null)
						return;
					
					self.checkedCommandNodes = checkedNodes;
					
					$('#insertCommandModal').modal('hide');
					
					if(self.needBigData()){
						self.genericProtocolProcess();
						return;
					}
					self.prepareCommands();
				};

				// insert record

				this.onRecordSelected = function(obj, event) {
					if (self.selectedRecord() == undefined)
						return;		
					self.initCommandHierarchy(self.selectedRecord().rootId, self.selectedRecord().scriptId);					
				};

				this.insertRecordCmd = function() {					
					if (self.projectManager.agentsConfigData() == undefined || self.projectManager.agentsConfigData() == null
							|| self.projectManager.agentsConfigData().length == 0) {
						notificationService.showWarn('未配置Antbot， 请在Antbot管理功能中配置AntBot.');
						return;
					}					
					$('#insertCommandModal').modal('show');
				};
				
				this.agentChangedOnInsertCommands = function(obj, event) {
					if (self.selectedAgent == undefined)
						return;					

					if (event.originalEvent)// user changed
						self.showRecordListFromSelectedAgent();
					else { // program changed

					}
				};
				//TBD
				this.getRecordsByAgentTypeSuccessFunction = function(records){
					if (records) {
						self.agentsRecordData([]);						
						for (var i = 0; i < records.length; i++)
							self.agentsRecordData.push(records[i]);						
					}
				};
				
				this.getRecordsByAgentTypeErrorFunction = function(){};

				this.showRecordListFromSelectedAgent = function() {
					if (self.selectedAgent == undefined)
						return;					
					self.needRecordSelected(false);
					self.needBigData(false);
					if(cmdConvertService.needRecordSetConfig(self.selectedAgent.antbotType)){
						self.needRecordSelected(true);
						var queryObj = {
							toolDynId : loginManager.getAuthorizationKey(),
							orgId : loginManager.getOrganization(),
							rootType : self.selectedAgent.antbotType,
							recordsetId : self.selectedAgent.recordsetId
						}					
						self.utpService.getRecordsByAgentType(queryObj, self.getRecordsByAgentTypeSuccessFunction, self.getRecordsByAgentTypeErrorFunction);
						return;
					} 
					
					if(cmdConvertService.needBigDataConfig(self.selectedAgent.antbotType)){
						self.needBigData(true);
						self.utpService.getProtocol(self.selectedAgent.protocolSignalId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
					}
					var cmdList = cmdConvertService.getcmdListByAgentType(self.selectedAgent.antbotType);
					for (var i = 0; i < cmdList.length; i++)							
						cmdList[i].Id = i + 1;
					self.prepareCmdTreeData(cmdList);
				};

				// insert protocol
				this.currentBigDatatype = null;
				
				this.getProtocolSuccessFunction = function(data){
					if(data && data.status === 1 && data.result){
						self.protocolService.addProtocol(data.result);
						self.currentBigDatatype = data.result.dataType;
						self.protocol = JSON.parse(data.result.bigdata);
						self.genericFrameInfo.protocolId = data.result.id;
					}
				};
				
				this.getProtocolErrorFunction = function(){
					notificationService.showError('获取协议文件失败');
				};
				
				this.getBigdataSuccessFunction = function(data){
					if (data) {
						var scriptContentJSON = JSON.parse(data.value);							
						var cmdList = new Array();
						for (var i = 0; i < scriptContentJSON.length; i++) {
							var parameters = new Array();
							for (var j = 1; j < scriptContentJSON[i].value.length; j++)
								parameters[j - 1] = scriptContentJSON[i].value[j];
						
							var commandObj = {
								CmdName	: scriptContentJSON[i].value[0],
								Params : parameters,
								Type : scriptContentJSON[i].type,
								Id: parseInt(scriptContentJSON[i].id) + 1
							}							
							cmdList.push(commandObj);
						}
						self.prepareCmdTreeData(cmdList);
					}
				};
				
				this.getBigdataErrorFunction = function(){};
				
				this.protocolFieldsconfig = ko.observableArray([]);
				
				this.protocol = {"equipments":[{"index":"002","name":"Flight Management Computer (702)","labels":[{"index":"001","name":"Distance to Go","minTxInterval":100,"maxTxInterval":200,"fields":[{"name":"Distance to Go","unit":"N.M.","startBit":"29","endBit":"11","codeField":null,"bcd":{"digits":5,"digit_Size":4,"minva1":0,"maxva1":3999.9,"msd_Size":3}},{"name":"SSM","startBit":"31","endBit":"30","codeField":{"codes":[{"value":"0","String":"+"},{"value":"1","String":"NO Computed Data"},{"value":"2","String":"Functional Test"},{"value":"3","String":"-"}]}}]},{"index":"002","name":"Time to Go","minTxInterval":100,"maxTxInterval":200,"fields":[{"name":"Time to Go","unit":"Min","startBit":29,"endBit":15,"codeField":null,"bcd":{"digits":4,"digit_Size":4,"minva1":0,"maxva1":3999.9,"msd_Size":3}}]},{"index":"003","name":"Cross Track Distance","minTxInterval":100,"maxTxInterval":200,"fields":[{"name":"Cross Track Distance","unit":"N.M.","startBit":29,"endBit":15,"codeField":null,"bcd":{"digits":4,"digit_Size":4,"minva1":0,"maxva1":399.9,"msd_Size":3}}]},{"index":"010","name":"Present Position - Latitude","minTxInterval":250,"maxTxInterval":500,"fields":[{"name":"Degrees","unit":"Deg","startBit":29,"endBit":21,"codeField":null,"bcd":{"digits":3,"digit_Size":4,"minva1":0,"maxva1":180,"msd_Size":1}},{"name":"minutes","unit":"'","startBit":20,"endBit":9,"codeField":null,"bcd":{"digits":3,"digit_Size":4,"minva1":0,"maxva1":180,"msd_Size":4}}]},{"index":"012","name":"Ground Speed","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Ground Speed","unit":"Knots","startBit":"29","endBit":"15","bcd":{"digits":"4","msd_Size":"3","digit_Size":"4","minva1":"0","maxva1":"7000"}}]},{"index":"013","name":"Track Angle - True","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Track Angle - True","unit":"Deg","startBit":"29","endBit":"15","bcd":{"digits":"4","msd_Size":"3","digit_Size":"4","minva1":"0","maxva1":"359.9"}}]},{"index":"015","name":"Wind Speed","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Wind Speed","unit":"Knots","startBit":"29","endBit":"19","bcd":{"digits":"3","msd_Size":"3","digit_Size":"4","minva1":"0","maxva1":"799"}}]},{"index":"027","name":"TACAN Selected Course","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"TACAN Selected Course","unit":"Deg","startBit":"29","endBit":"19","bcd":{"digits":"3","msd_Size":"3","digit_Size":"4","minva1":"0","maxva1":"359"}}]},{"index":"041","name":"Set Latitude ","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Set Latitude ","unit":"Deg/Min","startBit":"29","endBit":"21","bcd":{"digits":"3","msd_Size":"1","digit_Size":"4","minva1":"0","maxva1":"180"}},{"name":"minutes","unit":"'","startBit":"20","endBit":"9","bcd":{"digits":"3","msd_Size":"4","digit_Size":"4","minva1":"0","maxva1":"180"}}]},{"index":"042","name":"Present Position - Latitude","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Degrees","unit":"Deg","startBit":"29","endBit":"21","bcd":{"digits":"3","msd_Size":"1","digit_Size":"4","minva1":"0","maxva1":"180"}},{"name":"minutes","unit":"'","startBit":"20","endBit":"9","bcd":{"digits":"3","msd_Size":"4","digit_Size":"4","minva1":"0","maxva1":"180"}}]},{"index":"043","name":"Set Magnetic Heading","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Set Magnetic Heading","unit":"Deg","startBit":"29","endBit":"19","bcd":{"digits":"3","msd_Size":"3","digit_Size":"4","minva1":"0","maxva1":"359"}}]},{"index":"200","name":"Drift Angle","minTxInterval":"250","maxTxInterval":"500","fields":[{"name":"Drift Angle","unit":"Deg","startBit":"29","endBit":"15","bcd":{"digits":"4","msd_Size":"4","digit_Size":"4","minva1":"-180","maxva1":"180"}}]},{"index":"261","name":"Flight Number","minTxInterval":"500","maxTxInterval":"1000","fields":[{"name":"Flight Number","unit":"N/A","startBit":"29","endBit":"14","bcd":{"digits":"4","msd_Size":"4","digit_Size":"4","minva1":"0","maxva1":"9999"}}]}]}]};
								
				// generic protocol
				this.genericProtocolFieldSettingProcess = function(){
					var protocol = self.protocol;
					var root = {
						id: protocol.protocolName,
						value: protocol.protocolName,
						data: []
					};
					
					for(var i = 0; i < protocol.messages.length; i++){
						var id = protocol.messages[i].messageName;
						protocol.messages[i].id =  id ? id : i;
						var equiNode = {
							id: id ? id : i,
							value: protocol.messages[i].messageName,
							data: []
						}
						root.data.push(equiNode);
					}
					$('#genericProtocolFieldSettingModal').modal({ show: true }, {data: root});
				};
				
				this.composeFieldGroupSetting = function(){
					var conditionFrame = JSON.stringify(self.genericFrameInfo.conditions);					
					var valueFrame = JSON.stringify(self.genericFrameInfo.fields);					
					for (var x = 0; x < self.checkedCommandNodes.length; x++){
						var commandParameters = self.checkedCommandNodes[x].commandParameters;
						for(var p = 0; p < commandParameters.length;p++){
							if(commandParameters[p].assistInputType){
								if(commandParameters[p].assistInputType === 'messageFiledsConditionJson'){
									commandParameters[p].value = conditionFrame;
								}
								else if(commandParameters[p].assistInputType === 'messageFiledsValueJson'){
									commandParameters[p].value = valueFrame;
								}
							}
						}
					}
				};
				
				this.composeFieldSetting = function(){
					var messageName = self.currentGenericFrameMessageName;
					var path = "";
					var value = "";
					var condition = "";
					if(self.protocolNeedFieldConditionSetting()){
						path = self.genericFrameInfo.conditions[0].path;
						condition = self.genericFrameInfo.conditions[0].condition;
					}
					else if(self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSelectionSetting()){
						path = self.genericFrameInfo.fields[0].path;
						value = self.genericFrameInfo.fields[0].value;
					}
					
					for (var x = 0; x < self.checkedCommandNodes.length; x++){
						var commandParameters = self.checkedCommandNodes[x].commandParameters;
						for(var p = 0; p < commandParameters.length;p++){
							if(commandParameters[p].assistInputType){
								if(commandParameters[p].assistInputType === 'messageName'){
									commandParameters[p].value = messageName;
								}
								else if(commandParameters[p].assistInputType === 'fieldLocator'){
									commandParameters[p].value = JSON.stringify(path);
								}
								else if(commandParameters[p].assistInputType === 'fieldValue'){
									commandParameters[p].value = JSON.stringify({path, value});
								}
								else if(commandParameters[p].assistInputType === 'fieldCondition'){
									commandParameters[p].value = JSON.stringify({path, condition});
								}
							}
						}
					}
				};
				
				this.composeGenericFrameField = function(){
					if(self.protocolService.validatorErrors.length > 0){
						notificationService.showError('请输入合法数据');	 
						return;
					}

					self.genericFrameInfo.fields = [];
					self.genericFrameInfo.conditions = [];
					if(self.protocolNeedFieldSetting() && self.protocolNeedConditionSetting()){
						// TODO, this condition should not exist
					}
					else if(self.protocolNeedFieldSetting()){
						if(self.protocolService.changeMap.size > 0){
							self.protocolService.changeMap.forEach(function(value, key){
								var path = JSON.parse(key);
								if (!_.isObject(value)){
								path.unshift(self.currentGenericFrameMessageName);
								self.genericFrameInfo.fields.push({
									path: path,
									value: value
								});
								}
							});
						}
						else
							return;
					}
					else if(self.protocolNeedConditionSetting()){
						if(self.protocolService.changeMap.size > 0){
							self.protocolService.changeMap.forEach(function(value, key){
								var path = JSON.parse(key);
								if (!_.isObject(value)){
								path.unshift(self.currentGenericFrameMessageName);
								self.genericFrameInfo.conditions.push({
									path: path,
									condition: value
								});
								}
							});
						}
						else 
							return;
					}
					else if(self.protocolNeedFieldValueSetting() && self.protocolNeedFieldConditionSetting()){
						// TODO, this condition should not exist
						/*
						if(self.protocolService.currentSelectNode == null)
							return;
						var path = self.protocolService.currentSelectNode.path.splice(self.protocolService.currentSelectNode.path.length - 1, 1);
						var currentSelectNodeValue = _.get(self.protocolService.editedProtocolConfig, path);
						if( currentSelectNodeValue == undefined || currentSelectNodeValue == null || !(typeof(currentSelectNodeValue) == 'object'))
							return;
						var path = JSON.parse(JSON.stringify(path));
						path.unshift(self.currentGenericFrameMessageName);
						self.genericFrameInfo.fields.push({
							path: path,
							value: currentSelectNodeValue.value
						});
						self.genericFrameInfo.conditions.push({
							path: path,
							condition: currentSelectNodeValue.condition
						});
						*/
					}
					else if(self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSelectionSetting()){
						if(self.protocolService.changeMap.size > 0){
							self.protocolService.changeMap.forEach(function(value, key){
								var path = JSON.parse(key);
								if (!_.isObject(value)){
									path.unshift(self.currentGenericFrameMessageName);
									self.genericFrameInfo.fields.push({
										path: path,
										value: value
									});
								}
							});
						}
						else 
							return;
						/*
						if(self.protocolService.currentSelectNode == null)
							return;
						var currentSelectNodeValue = _.get(self.protocolService.editedProtocolConfig, self.protocolService.currentSelectNode.path);
						if( currentSelectNodeValue == undefined || currentSelectNodeValue == null || typeof(currentSelectNodeValue) == 'object')
							return;
						var path = JSON.parse(JSON.stringify(self.protocolService.currentSelectNode.path));
						path.unshift(self.currentGenericFrameMessageName);
						self.genericFrameInfo.fields.push({
							path: path,
							value: currentSelectNodeValue
						});
						*/
					}
					else if(self.protocolNeedFieldConditionSetting()){
						if(self.protocolService.changeMap.size > 0){
							self.protocolService.changeMap.forEach(function(value, key){
								var path = JSON.parse(key);
								if (!_.isObject(value)){
									path.unshift(self.currentGenericFrameMessageName);
									self.genericFrameInfo.conditions.push({
										path: path,
										condition: value
									});
								}
							});
						}
						else 
							return;
						/*
						if(self.protocolService.currentSelectNode == null)
							return;
						var currentSelectNodeValue = _.get(self.protocolService.editedProtocolConfig, self.protocolService.currentSelectNode.path);
						if( currentSelectNodeValue == undefined || currentSelectNodeValue == null || typeof(currentSelectNodeValue) == 'object')
							return;

						var path = JSON.parse(JSON.stringify(self.protocolService.currentSelectNode.path));
						path.unshift(self.currentGenericFrameMessageName);
						self.genericFrameInfo.conditions.push({
							path: path,
							condition: currentSelectNodeValue
						});
						*/
					}

					if(self.protocolNeedConditionSetting() || self.protocolNeedFieldSetting())
						self.composeFieldGroupSetting();
					else if(self.protocolNeedFieldConditionSetting() || self.protocolNeedFieldValueSetting() || self.protocolNeedMessageNameSetting() || self.protocolNeedFieldSelectionSetting())
						self.composeFieldSetting();
					
					$('#genericProtocolFieldSettingModal').modal('hide');
					self.prepareCommands();
				};
				
				this.genericFrameInfo = {
					protocolId: "",
					id: "",
					fields: [],
					conditions: []
				};

				this.currentGenericFrameMessageName = "";
				this.genericCommandField = ko.observable('');
				this.genericProtocolName = ko.observable('协议帧内容配置');
				
				this.composeGenericFrameName = function(){
					var item = $$('protocolGroupList').getSelectedItem();
					if(item == undefined || item == null){
						notificationService.showError('请选择字段！');
						return;
					}
					var names = [];
					names.push(item.id);
					while(item.$level > 1){
						item = $$('protocolGroupList').getItem(item.$parent);
						names.unshift(item.id);
					}
					
					for (var x = 0; x < self.checkedCommandNodes.length; x++){
						var commandParameters = self.checkedCommandNodes[x].commandParameters;
						for(var p = 0; p < commandParameters.length;p++){
							if(commandParameters[p].assistInputType){
								if(commandParameters[p].assistInputType === 'messageName'){
									commandParameters[p].value = names[0];
								}
								else if(commandParameters[p].assistInputType === 'fieldName' && names[1] != undefined){
									commandParameters[p].value = names[1];
								}
								else if(commandParameters[p].assistInputType === 'bitName' && names[2] != undefined){
									commandParameters[p].value = names[2];
								}
								else if(commandParameters[p].assistInputType === 'bitName' && names[2] != undefined){
									commandParameters[p].value = names[2];
								}
								else if(commandParameters[p].assistInputType === 'bitName' && names[2] != undefined){
									commandParameters[p].value = names[2];
								}
							}
						}
					}
					self.prepareCommands();
				};
				
				this.clearProtocolConfigView = function(){
					$('#protocolConfigView').html('');
				};

				this.initProtocolConfigView = function(message){
					self.clearProtocolConfigView();
					var currentProtocolMode = self.protocolService.protocolModeEnum.valueSelectionSetting
					if(self.protocolNeedFieldSetting() && self.protocolNeedConditionSetting() || self.protocolNeedFieldValueSetting() && self.protocolNeedFieldConditionSetting()){
						currentProtocolMode = self.protocolService.protocolModeEnum.valueConditionSetting;
					}
					else if(self.protocolNeedFieldSetting() || self.protocolNeedFieldValueSetting()){
						currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting
					}
					else if(self.protocolNeedFieldConditionSetting() || self.protocolNeedConditionSetting()){
						currentProtocolMode = self.protocolService.protocolModeEnum.conditionSetting
					}
					// self.protocolNeedMessageNameSetting() TODO
					else if(self.protocolNeedFieldSelectionSetting() || self.protocolNeedMessageNameSetting()){
						currentProtocolMode = self.protocolService.protocolModeEnum.fieldSelection
					}
					var multipleSelection = false;
					if(self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting())
						multipleSelection = true;
					var options = self.protocolService.protocolOptionInit(self.protocol, message, currentProtocolMode, multipleSelection);					
					const container = document.getElementById('protocolConfigView');
					var obj = self.protocolService.editedProtocolConfig;
					self.protocolEditor = new JSONEditor(container, options, obj);
					self.protocolService.editor = self.protocolEditor;
				};

				this.initGenericProtocolTree = function(data){
					$('#genericProtocolTreeview').html('');
					self.clearProtocolConfigView();
					self.protocolFieldsconfig.removeAll();
					self.genericProtocolName(data.value);					
					webix.ready(function(){						
						self.genericProtocolTree = webix.ui({
							container:"genericProtocolTreeview",
							view:"tree",
							type:"lineTree",
							select:true,
							template:"{common.icon()}&nbsp;#value#",
							data : data,
							ready:function(){
								this.closeAll();
								this.sort("value", "asc", "string");
							}
						});
						
						self.genericProtocolTree.attachEvent("onItemClick", function(id, e, node) {
							var item = this.getItem(id);
							
							if(self.protocolNeedConditionSetting() || self.protocolNeedFieldSetting() || self.protocolNeedFieldSelectionSetting() || 
								self.protocolNeedFieldValueSetting() || self.protocolNeedFieldConditionSetting() || self.protocolNeedMessageNameSetting()){
									self.protocolFieldsconfig.removeAll();
									self.currentGenericFrameMessageName = "";
									for(var i = 0; i < self.protocol.messages.length; i++){
										if(self.protocol.messages[i].id === id){
											self.currentGenericFrameMessageName = self.protocol.messages[i].messageName;								
											self.genericFrameInfo.id = self.protocol.messages[i].id;
											self.genericCommandField(self.protocol.messages[i].messageName);
											self.initProtocolConfigView(self.protocol.messages[i]);									
											break;
										}
									}
							}
						});
					});
				};
				
				this.protocolNeedConditionSetting = ko.observable(false);
				this.protocolNeedFieldSetting = ko.observable(false);
				this.protocolNeedMessageNameSetting = ko.observable(false);
				this.protocolNeedFieldSelectionSetting = ko.observable(false);
				this.protocolNeedFieldValueSetting = ko.observable(false);
				this.protocolNeedFieldConditionSetting = ko.observable(false);
				
				this.genericProtocolProcess = function(){
					if(self.currentBigDatatype === self.protocolService.dataType.GENERICBUSFRAME){
						self.protocolNeedConditionSetting(false);
						self.protocolNeedFieldSetting(false);
						self.protocolNeedMessageNameSetting(false);
						self.protocolNeedFieldSelectionSetting(false);
						self.protocolNeedFieldValueSetting(false);
						self.protocolNeedFieldConditionSetting(false);

						for (var x = 0; x < self.checkedCommandNodes.length; x++){
							var commandParameters = self.checkedCommandNodes[x].commandParameters;
							for(var p=0; p < commandParameters.length;p++){
								if(commandParameters[p].assistInputType){
									if(commandParameters[p].assistInputType === 'messageFiledsValueJson')
										self.protocolNeedFieldSetting(true);
									else if(commandParameters[p].assistInputType === 'messageFiledsConditionJson')
										self.protocolNeedConditionSetting(true);
									else if(commandParameters[p].assistInputType === 'messageName')
										self.protocolNeedMessageNameSetting(true);
									else if(commandParameters[p].assistInputType === 'fieldLocator')
										self.protocolNeedFieldSelectionSetting(true);
									else if(commandParameters[p].assistInputType === 'fieldValue')
										self.protocolNeedFieldValueSetting(true);
									else if(commandParameters[p].assistInputType === 'fieldCondition')
										self.protocolNeedFieldConditionSetting(true);
								}
							}
						}
						if(self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting() || self.protocolNeedMessageNameSetting() || self.protocolNeedFieldSelectionSetting() ||
							self.protocolNeedFieldValueSetting() || self.protocolNeedFieldConditionSetting())
							self.genericProtocolFieldSettingProcess();
						else
							self.prepareCommands();
					}
				};

				// update script(testcase) & sub script 
				this.updateScriptSuccessFunction = function(data){
					if(data && data.status === 1){
						self.testcaseSavedFlag(true);
						if (typeof selectionManager.refreshTreeNodeCallback === "function") {
							selectionManager
									.refreshTreeNodeCallback(self.currentScript
											.name());
						}
						if(selectionManager.selectedNodeType == 'testcase')
							notificationService.showSuccess('更新测试用例成功');
						else
							notificationService.showSuccess('更新子脚本成功');
						self.updated = true;
					}
					else
						self.updateScriptErrorFunction();
				};
				
				this.updateScriptErrorFunction = function(){
					if(selectionManager.selectedNodeType == 'testcase')
						notificationService.showError('更新测试用例失败');
					else
						notificationService.showError('更新子脚本失败');
				};
				
				this.updateBasicSuccessFunction = function(data){
					if( data && data.status === 1 && data.result){
						self.currentScript.description(data.result.description);
						self.currentScript.name(data.result.name);
						self.currentScript.customizedId(data.result.customizedId);
						var topBlocks = self.getTopBlocks();
						if(selectionManager.selectedNodeType === 'subscript' && topBlocks[0].type === "procedures_defscript")
							topBlocks[0].setFieldValue(self.currentScript.name(), 'SCRIPTNAME');
						notificationService.showSuccess('基本信息更新成功');	
					}			
					else
						self.updateBasicErrorFunction();
				};
				
				this.updateBasicErrorFunction = function(){
					notificationService.showError('基本信息更新失败');	
				};
				
				this.updateBasic = function(){
					var name = self.currentScript.name();
					if (name === null || name == ""){
						notificationService.showWarn('名称不能为空');
						return;
					}
						
					if (name.length > self.maxNameLength){
						notificationService.showWarn('名称长度不能超过' + self.maxNameLength);
						return;
					}
						
					var reg = /[@%\^&<>]+/g;
					if (name.match(reg) != null){
						notificationService.showWarn('名称不能包含@%^&<>等特殊字符');
						return;
					}
					
					var selectedScript = {
 						id : self.currentScript.id(),
 						customizedId : self.currentScript.customizedId(),
 	     				name : self.currentScript.name(),
 	     				description : self.currentScript.description(),
 	     				projectId : self.currentScript.projectId(),
 	     				parentScriptGroupId : self.currentScript.parentScriptGroupId()
 					}
					if(selectionManager.selectedNodeType === 'subscript')
						self.utpService.updateSubScript(selectedScript, self.updateBasicSuccessFunction, self.updateBasicErrorFunction);
					else
						self.utpService.updateScript(selectedScript, self.updateBasicSuccessFunction, self.updateBasicErrorFunction);						
				}
				
				this.saveBlockScript = function() {
					var topBlocks = self.getTopBlocks();
					if(topBlocks.length > 1){
						notificationService.showError('请保证所有命令组成一个脚本段！');
						return false;
					}
					var macro = [];
					if(selectionManager.selectedNodeType === 'subscript'){					
						if(topBlocks.length == 0 || topBlocks[0].type != "procedures_defscript"){
							notificationService.showError('子脚本定义不存在！');
							return false;
						}
						macro = JSON.parse(JSON.stringify(topBlocks[0].arguments_));
					}
					
					var scriptContent = Blockly.AntScript
							.workspaceToCode(self.workspace);
					if(selectionManager.selectedNodeType === 'subscript'){
						scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
						for(var i=0; i < macro.length; i++){
							if(scriptContent.indexOf("%" + macro[i] + "%") >= 0){
								scriptContent = 
									scriptContent.replace(new RegExp("%"+macro[i]+"%", 'g'), "%" + i + "%");
								continue;
							}
						}
						var returnBlock = topBlocks[0].getField('SCRIPTRETURN');
						if(returnBlock){
							var returnMacro = returnBlock.getText();
							scriptContent = scriptContent.replace(new RegExp("\\$" + returnMacro, 'g'), "$%" + macro.length + "%");
							scriptContent = scriptContent.replace(new RegExp("\\^" + returnMacro, 'g'), "^%" + macro.length + "%");
							scriptContent = scriptContent.replace(new RegExp("SETVAL" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "SETVAL" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
							scriptContent = scriptContent.replace(new RegExp("UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
							scriptContent = scriptContent.replace(new RegExp("SETARRY" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "SETARRY" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");							
							macro.push('^' + returnMacro);
						}
					}
					if(selectionManager.selectedNodeType === 'testcase'){
					//	var testcaseBegCmd = "TESTCASE_BEGIN" + cmdConvertService.PARA_SEPARATOR + selectionManager.selectedNodeId() + cmdConvertService.CMD_SEPARATOR;
						var testcaseBegCmd = cmdConvertService.TESTCASE_BEGIN + cmdConvertService.CMD_SEPARATOR;
						var testcaseEndCmd = cmdConvertService.TESTCASE_END;
						scriptContent = testcaseBegCmd + scriptContent + testcaseEndCmd;
					}
					self.currentScript.script(scriptContent);
					var xmlDom = Blockly.Xml.workspaceToDom(self.workspace);
					//var xml = Blockly.Xml.domToPrettyText(xmlDom);
					var xml = Blockly.Xml.domToText(xmlDom);
					self.currentScript.blockyXml(xml);
					if(selectionManager.selectedNodeType === 'testcase')						
						self.utpService.updateFullScript(komapping.toJS(self.currentScript), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
					else if(selectionManager.selectedNodeType === 'subscript'){						
						var selectedScript = {
							id : self.currentScript.id(),
							customizedId: self.currentScript.customizedId(),
 	 	     				name : self.currentScript.name(),
 	 	     				description : self.currentScript.description(),
 	 	     				projectId : self.currentScript.projectId(),
 	 	     				parentScriptGroupId : self.currentScript.parentScriptGroupId(),
 	 	     				script : self.currentScript.script(),
 	 	     				type : self.currentScript.type(),
 	 	     				blockyXml : self.currentScript.blockyXml(),
 	 	     				parameter : JSON.stringify(macro)
 	 					}
						self.utpService.updateFullSubScript(selectedScript, self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
					}
					return true;
				};
					
				this.saveTextScript = function(){
					var scriptContent = self.scriptEditor.getValue().trim();
					if(selectionManager.selectedNodeType === 'testcase'){
						var testcaseBegCmd = cmdConvertService.TESTCASE_BEGIN + cmdConvertService.CMD_SEPARATOR;
						var testcaseEndCmd = cmdConvertService.TESTCASE_END;
						scriptContent = testcaseBegCmd + scriptContent + testcaseEndCmd;
					}
					var macro = [];
					if(selectionManager.selectedNodeType === 'subscript'){
						if(!scriptContent.startsWith(self.currentScript.name())){
							notificationService.showError('子脚本定义不存在！');
							return false;
						}
						var scriptDef = scriptContent.substring(0, scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
						scriptDef = scriptDef.replace(self.currentScript.name() + cmdConvertService.PARA_SEPARATOR, '').replace(new RegExp("%", 'g'), "");
						macro = scriptDef.split(',');
						scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR) + 2);						
						for(var i = 0; i < macro.length; i++){
							if(macro[i].startsWith('^')){
								var returnMacro =  macro[i].replace('^', '');
								scriptContent = scriptContent.replace(new RegExp("\\$" + returnMacro, 'g'), "$%" + i + "%");
								scriptContent = scriptContent.replace(new RegExp("\\^" + returnMacro, 'g'), "^%" + i + "%");
								scriptContent = scriptContent.replace(new RegExp("SETVAL" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "SETVAL" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%");
								scriptContent = scriptContent.replace(new RegExp("UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%");
								scriptContent = scriptContent.replace(new RegExp("SETARRY" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "SETARRY" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%");
							}
							else
								scriptContent = scriptContent.replace(new RegExp("%" + macro[i] + "%", 'g'), "%" + i + "%");
						}
					}
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR + "\n", 'g'), cmdConvertService.CMD_SEPARATOR);
					self.currentScript.script(scriptContent);
					var xmlDom = Blockly.Xml.workspaceToDom(self.workspace);
					var xml = Blockly.Xml.domToText(xmlDom);
					self.currentScript.blockyXml(xml);
					if(selectionManager.selectedNodeType === 'testcase')						
						self.utpService.updateFullScript(komapping.toJS(self.currentScript), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
					else if(selectionManager.selectedNodeType === 'subscript'){						
						var selectedScript = {
							id : self.currentScript.id(),
							customizedId: self.currentScript.customizedId(),
 	 	     				name : self.currentScript.name(),
 	 	     				description : self.currentScript.description(),
 	 	     				projectId : self.currentScript.projectId(),
 	 	     				parentScriptGroupId : self.currentScript.parentScriptGroupId(),
 	 	     				script : self.currentScript.script(),
 	 	     				type : self.currentScript.type(),
 	 	     				blockyXml : self.currentScript.blockyXml(),
 	 	     				parameter : JSON.stringify(macro)
 	 					}
						self.utpService.updateFullSubScript(selectedScript, self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
					}
					return true;
				};
				
				this.saveScript = function() {
					if(self.commandMode()){
						if(!self.saveTextScript())
							return;
					}
					else {
						if(!self.saveBlockScript())
							return;
					}					
					var requirmentIds = cmdConvertService.requirementIdAnalysis(self.currentScript.script());
					var ids = [];
					requirmentIds.forEach(function(id){
						if(self.projectManager.getRequirement(id) != null)
							ids.push(Number(id));
		    		});					
					var obj = {
						projectId : self.currentScript.projectId(),
						scriptId : self.currentScript.id(),
						requirementIdsWithCommaSeperator : ids.join(",")
					}
					self.scriptRequirementMapping = {
						scriptId : self.currentScript.id(),
						requirementIds : ids
					};
					self.utpService.updateRequirementScriptMapping(obj, self.updateRequirementScriptMappingSuccessFunction, self.updateRequirementScriptMappingErrorFunction);
				};
				
				this.updateRequirementScriptMappingSuccessFunction = function(data){
					if( data && data.status === 1 && data.result){
						if(self.scriptRequirementMapping)
							self.projectManager.updateScriptRequirementMapping(self.scriptRequirementMapping.scriptId, self.scriptRequirementMapping.requirementIds);
					//	notificationService.showSuccess('检查点关联更新成功');
					}	
					else
						self.updateRequirementScriptMappingErrorFunction();
				};
				
				this.updateRequirementScriptMappingErrorFunction = function(){
					notificationService.showError('检查点关联更新失败');
				};

				this.updateEditor = function(cmd){
					var cursorPosition = self.scriptEditor.getCursorPosition();
					self.scriptEditor.session.insert(cursorPosition, cmd);
					//self.scriptEditor.insert("Something cool");
				};
				
				this.insertParaSeparator = function(){
					self.updateEditor(cmdConvertService.PARA_SEPARATOR);
				};
				
				this.insertCmdSeparator = function(){
					self.updateEditor(cmdConvertService.CMD_SEPARATOR);
				};

				this.showScriptInStepsView = function() {
					this.disableScriptEdit();					
					var scriptDef = "\n";
					var scriptContent = "";
					if(self.commandMode()){
						scriptContent = self.scriptEditor.getValue().trim();
						if(selectionManager.selectedNodeType === 'subscript'){							
							var macro = [];
							if(scriptContent.startsWith(self.currentScript.name())){
								scriptDef += "子脚本:" + self.currentScript.name();
								defStr = scriptContent.substring(0, scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
								defStr = defStr.replace(self.currentScript.name() + cmdConvertService.PARA_SEPARATOR, '');
								macro = defStr.split(cmdConvertService.PARA_SEPARATOR);
								if(macro != null && macro.length > 0)
									scriptDef += " 参数：" + JSON.stringify(macro);						
								scriptDef += "\n\n";
								scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR) + 2);
							}
						}
					}
					else{
						scriptContent = Blockly.AntScript.workspaceToCode(self.workspace);
					if(selectionManager.selectedNodeType === 'subscript'){
						var topBlocks = self.getTopBlocks();						
						if(topBlocks.length > 0 && topBlocks[0].type == "procedures_defscript"){
								scriptDef += "子脚本:" + self.currentScript.name();
								var macro = JSON.parse(JSON.stringify(topBlocks[0].arguments_));
								var returnBlock = topBlocks[0].getField('SCRIPTRETURN');
								if(returnBlock)
									macro.push('^' + returnBlock.getText());
							if(macro != null && macro.length > 0)
									scriptDef += " 参数：" + JSON.stringify(macro);
								scriptDef += "\n\n";
							scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
						}
					}								
					}
					scriptContent = cmdConvertService.generatecmdStepList(scriptContent, true);					
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), '\n');
					scriptDef += scriptContent;
					self.scriptInTestSteps(scriptDef);
				};

				this.UtpCmdsToSeqDiagramString = function(utpCommandsString) {
					var sequenceDiagramStr = cmdConvertService.generatecmdStepList(utpCommandsString, false);
					return sequenceDiagramStr;
				};
				
				this.showScriptInSequenceView = function() {
					this.disableScriptEdit();
					if (self.blockyConvertedFlag)
						return;
					self.busyPropInfo("converting to sequence diagram ...");
					$('#waitingModal').modal('show');
					setTimeout(
						function(){
								var scriptContent = '';
								if(self.commandMode()){
									scriptContent = self.scriptEditor.getValue().trim();
									if(selectionManager.selectedNodeType === 'subscript'){
										if(scriptContent.startsWith(self.currentScript.name()))											
											scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR) + 2);
									}
								}
								else{
									scriptContent = Blockly.AntScript.workspaceToCode(self.workspace);
									if(selectionManager.selectedNodeType === 'subscript')
										scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
									try{
										var sequencediagramStr = self.UtpCmdsToSeqDiagramString(scriptContent);
										sequencediagramStr = sequencediagramStr.replace(new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), '\n');	
										var diagram = Diagram.parse(sequencediagramStr);
										$('#diagram').html('');
										diagram.drawSVG("diagram", {
											theme : 'hand'
										});
										var a = $('#download');
										a.click(function(ev){
												var diagram_div = $('#diagram');
												var svg = diagram_div.find('svg')[0];
												var width = parseInt(svg.width.baseVal.value);
												var height = parseInt(svg.height.baseVal.value);
												var xml = '<?xml version="1.0" encoding="utf-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg xmlns="http://www.w3.org/2000/svg" width="'
														+ width
														+ '" height="'
														+ height
														+ '" xmlns:xlink="http://www.w3.org/1999/xlink"><source><![CDATA['
														+ sequencediagramStr
														+ ']]></source>'
														+ svg.innerHTML + '</svg>';
												var a = $(this);
												a.attr("download", "diagram.svg");
												a.attr("href", "data:image/svg+xml," + encodeURIComponent(xml));
											});
										self.blockyConvertedFlag = true;
									}catch(e){
										self.blockyConvertedFlag = false;
										notificationService.showError('交互图生成错误！');
										console.log(e);
									}finally{
										$('#waitingModal').modal('hide');
									}
								}
							}, 1000);
				};

				this.subScriptNameProcess = function(blocklyXml){
					var startFieldOfScriptID = '<field name="SCRIPTID">';
					var startFieldOfScriptName = '<field name="SCRIPTNAME">';					
					var endField = '</field>';
					
					var scriptIdStartIndex = blocklyXml.indexOf(startFieldOfScriptID);
					
					while (scriptIdStartIndex >= 0){
						var scriptIdEndIndex = blocklyXml.indexOf(endField, scriptIdStartIndex);
						
						var subScriptId = blocklyXml.substring(scriptIdStartIndex + startFieldOfScriptID.length, scriptIdEndIndex);
						var subScript = self.projectManager.getSubScript(subScriptId);
						var subScriptName = "未知脚本";
						if(subScript != undefined && subScript != null)
							subScriptName = subScript.value;	
						
						var scriptNameStartIndex = blocklyXml.lastIndexOf(startFieldOfScriptName, scriptIdStartIndex);
						var scriptNameEndIndex = blocklyXml.lastIndexOf(endField, scriptIdStartIndex);						
						blocklyXml = blocklyXml.substring(0, scriptNameStartIndex + startFieldOfScriptName.length) + subScriptName + blocklyXml.substring(scriptNameEndIndex);						
						scriptIdStartIndex = blocklyXml.indexOf(startFieldOfScriptID, scriptIdEndIndex);
					}				
					
					return blocklyXml;
				}
				
				this.initScriptEditor = function(scriptContent){
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), cmdConvertService.CMD_SEPARATOR + '\n');					
					self.scriptEditor.setValue(scriptContent); //self.scriptEditor.session.setValue("the new text here");
				};
				
				this.overWriteText = function(){					
					var scriptContent = Blockly.AntScript.workspaceToCode(self.workspace);
					var scriptDef =	scriptContent.substring(0, scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
					scriptDef = scriptDef.replace(new RegExp("%", 'g'), "");
					scriptContent = scriptDef + scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
					self.currentScript.script(scriptContent);
					self.initScriptEditor(scriptContent);
				};

				this.initBlockScript = function(script){
					if(script.blockyXml != null && script.blockyXml != ''){
						if(selectionManager.selectedNodeType === 'subscript'){
							var re = new RegExp(cmdConvertService.SUB_SCRIPT_NAME_REGEX);
							script.blockyXml = script.blockyXml.replace(re, '<field name="SCRIPTNAME">' + self.currentScript.name() + '</field>');								
						}
						script.blockyXml = self.subScriptNameProcess(script.blockyXml);
						var dom2 = Blockly.Xml.textToDom(script.blockyXml);
						Blockly.Xml.domToWorkspace(dom2, self.workspace);
					}
					else if(selectionManager.selectedNodeType === 'subscript'){
						var initScriptXml = cmdConvertService.STARTER_SUB_BLOCK_XML_TEXT.replace(/XXXX/, self.currentScript.name());
						var xml = Blockly.Xml.textToDom(initScriptXml);
						Blockly.Xml.domToWorkspace(xml, self.workspace);
					}
					self.showScriptInStepsView();
				};
				
				this.initTextScript = function(scriptName, scriptContent, paraStr){
					if(selectionManager.selectedNodeType === 'subscript'){
						var scriptDef = scriptName;
						if(paraStr){
							var parameters = JSON.parse(paraStr);
							if(parameters && parameters.length > 0){
								for(var i=0; i < parameters.length;i++){									
									if(parameters[i].startsWith('^')){
										var returnPara = parameters[i].replace('^', '');
										scriptContent = scriptContent.replace(new RegExp("\\$%" + i + "%", 'g'), "$" + returnPara);
										scriptContent = scriptContent.replace(new RegExp("\\^%" + i + "%", 'g'), "^" + returnPara);
										scriptContent = scriptContent.replace(new RegExp("SETVAL" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%", 'g'), "SETVAL" + cmdConvertService.PARA_SEPARATOR + returnPara);
										scriptContent = scriptContent.replace(new RegExp("UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%", 'g'), "UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + returnPara);
										scriptContent = scriptContent.replace(new RegExp("SETARRY" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%", 'g'), "SETARRY" + cmdConvertService.PARA_SEPARATOR + returnPara);
									}
									else
										scriptContent = scriptContent.replace(new RegExp("%" + i + "%", 'g'), "%" + parameters[i] + "%");
								}
								scriptDef = scriptDef + cmdConvertService.PARA_SEPARATOR + parameters.join(',');
							}
						}
						scriptContent = scriptDef + cmdConvertService.CMD_SEPARATOR + scriptContent;
					}
					else if(selectionManager.selectedNodeType === 'testcase'){
						scriptContent = scriptContent.replace(new RegExp(cmdConvertService.TESTCASE_BEGIN + cmdConvertService.CMD_SEPARATOR, 'g'), "");
						scriptContent = scriptContent.replace(new RegExp(cmdConvertService.TESTCASE_END, 'g'), "");
					}
					return scriptContent;
				};

				this.getScriptSuccessFunction = function(data){
					if (data && data.status === 1 && data.result) {
						var script = data.result;
						self.currentScript.id(script.id);
						self.currentScript.customizedId(script.customizedId);
						self.currentScript.projectId(script.projectId);
						self.currentScript.name(script.name);
						self.currentScript.parentScriptGroupId(script.parentScriptGroupId);
						self.currentScript.description(script.description);						
						self.currentScript.type(script.type);
						self.currentScript.script(script.script);
						self.currentScript.blockyXml(script.blockyXml);
						/*
						 * var dom1 =
						 * Blockly.Xml.agentCMDToDom(data.script,
						 * self.workspace); var xml =
						 * Blockly.Xml.domToPrettyText(dom1);
						 * var xml2 =
						 * Blockly.Xml.scriptToDom(xml,
						 * self.workspace);
						 * Blockly.Xml.domToWorkspace(xml2,
						 * self.workspace);
						 */
						
						self.initBlockScript(script);
						var scriptContent = self.initTextScript(script.name, script.script, script.parameter);
						self.currentScript.script(scriptContent);
						self.initScriptEditor(scriptContent);
						self.blockNumberUpdate(0);
					}
					else
						self.getScriptErrorFunction();
				};
				
				this.getScriptErrorFunction = function(){
					if(selectionManager.selectedNodeType == 'testcase')
						notificationService.showError('获取测试用例信息失败');
					else
						notificationService.showError('获取子脚本信息失败');
				};
				
				this.initRequirementReference = function(){
					self.disableScriptEdit();
					$('#requirement_reference').html('');
					webix.ui({
						container:"requirement_reference",
						view:"list",
						id : "req_reference",
						tooltip:function(obj){
							return "<span style='display:inline-block;max-width:300;word-wrap:break-word;white-space:normal;'>" + obj.value + "</span>";
					    },
						height: 250,
					    width: 600,
						data: self.projectManager.getRequirementReferenceOfScript(selectionManager.selectedNodeId())
					});
				};
							
				this.initTrigger = function(currentstate){
					$('#scripEditingtModeInput').bootstrapSwitch("state", currentstate);
					$('#scripEditingtModeInput').on('switchChange.bootstrapSwitch', function (event, state) {
						self.commandMode(state);
						if(!state)
							self.enableBlockScriptEdit();
						else
							$('#changeEditorModal').modal('show');
			        });
				};
				
				this.activate = function() {
					self.blockInitHappened = false;
					self.blockyConvertedFlag = false;
					self.updated = false;
					self.testcaseSavedFlag(true);
					self.commandMode(false);
					self.scriptInTestSteps([]);
					self.isTestcase = selectionManager.selectedNodeType == 'testcase';
					if(selectionManager.selectedNodeType == 'testcase')
						self.utpService.getFullScript(selectionManager.selectedProject().id, selectionManager.selectedNodeId(), self.getScriptSuccessFunction, self.getScriptErrorFunction);
					else
						self.utpService.getFullSubScript(selectionManager.selectedProject().id, selectionManager.selectedNodeId(), self.getScriptSuccessFunction, self.getScriptErrorFunction);					
				};
				
				this.attached = function(view, parent) {
					self.disableScriptEdit();
					self.initRequirementReference();
					self.initTrigger(false);
					self.initBlock();					
					self.initTextEditor();
					$('#insertCommandModal').on('shown.bs.modal', function() {
						self.showRecordListFromSelectedAgent();
					});					
					$('#insertScriptModal').on('shown.bs.modal', function(e) {
						self.selectScriptFunType('0');
						self.initSubScriptTree(e.relatedTarget.data);
						//	self.getProjectSubScript();						
					});
					$('#insertCheckPointModal').on('shown.bs.modal', function(e) {
						self.initCheckPointTree(e.relatedTarget.data);	
					});
					$('#genericProtocolFieldSettingModal').on('shown.bs.modal', function(e) {
						self.initGenericProtocolTree(e.relatedTarget.data);
					});
				};
				
				this.detached = function(){
					self.workspace.removeChangeListener(blockyChangedEvent);
					self.projectManager.previousEditedScript = komapping.toJS(self.currentScript);
				};
			}
			return new PlaygroundViewModel();
		});
