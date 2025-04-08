define(['knockout', 'jquery', 'komapping',
	'services/cmdConvertService',
	'services/loginManager', 'services/viewManager', 'services/systemConfig', 'services/executionManager',
	'services/selectionManager', 'services/projectManager', 'services/protocolService', 'services/utpService',
	'sequencediagram', 'services/notificationService', 'services/fileManagerUtility', 'jsoneditor', 'lodash',
	'bootstrapSwitch', 'ace/ace', 'ace/ext/language_tools'],
	function (ko, $, komapping,
		cmdConvertService, loginManager, viewManager, systemConfig, executionManager, selectionManager,
		projectManager, protocolService, utpService, sequencediagram, notificationService, fileManagerUtility, JSONEditor, _, bootstrapSwitch, ace) {

		function PlaygroundViewModel() {
			var self = this;
			this.maxBlocks = 500;
			this.remainNumberOfBlocks = ko.observable(self.maxBlocks);
			this.loginManager = loginManager;
			this.viewManager = viewManager;
			this.systemConfig = systemConfig;
			this.projectManager = projectManager;
			this.protocolService = protocolService;
			this.fileManagerUtility = fileManagerUtility;
			this.utpService = utpService;
			this.auth = 0;
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
			this.recordLabel = ko.observable("2: 选择录制集:");
			this.STARTER_SUB_BLOCK_XML_TEXT = '<xml>' +
				'<block type="procedures_defscript" deletable="false" movable="false">' +
				'<field name="SCRIPTNAME">XXXX</field>' +
				'<field name="PARAMS"></field>' +
				'</block></xml>';
			this.SUB_SCRIPT_NAME_REGEX = '<field name="SCRIPTNAME">([^<]+?)</field>';
			this.SUB_SCRIPT_ID_REGEX = '<field name="SCRIPTID">([^<]+?)</field>';
			this.maxNameLength = 200;
			this.textEdit = false; //是否处于文本编辑模式
			this.commandDisplay = false; //是否显示禁用命令

			this.gotoTestcase = function () {
				//	self.viewManager.testcaseActiveData({reload:self.updated});
				self.projectManager.useBackupTestCase = true;
				self.viewManager.testcaseActivePage('app/viewmodels/testcase');
			};

			this.gotoVerification = function () {
				selectionManager.selectedNodeId(self.currentScript.id());
				selectionManager.selectedNodeType = self.currentScript.type();
				selectionManager.verificationSource = 'playground';
				executionManager.newExecutionFlag(true);
				self.viewManager.testcaseActivePage('app/viewmodels/verification');
			};

			this.busyPropInfo = ko.observable('');
			this.blockInitHappened = false;
			this.currentScript = {
				id: ko.observable(0),
				customizedId: ko.observable(''),
				projectId: ko.observable(0),
				parentScriptGroupId: ko.observable(0),
				description: ko.observable(''),
				name: ko.observable(''),
				script: ko.observable(''),
				blockyXml: ko.observable(''),
				type: ko.observable(''),
				customizedFields: ko.observable('')
				//	parameter : ko.observable('')
			};

			this.lastscriptStr = '';
			this.enableBlockScriptEdit = function () {
				self.workspace.addChangeListener(blockyChangedEvent);
				// 监听BlocklyScript变化
				var scriptStr = self.scriptEditor.getValue();
				var script = cmdConvertService.txtToScript(scriptStr);
				if (self.lastscriptStr.endsWith("óò")) {
					self.lastscriptStr = self.lastscriptStr.slice(0, -2);
				}
				if (self.lastscriptStr != script && self.lastscriptStr != "") {
					self.blockInitHappened = true;
				} else {
					self.blockInitHappened = false;
				}

				if (self.blockInitHappened && self.textEdit) {
					try {
						var scriptStr = self.scriptEditor.getValue();
						var script = cmdConvertService.txtToScript(scriptStr);
						self.lastscriptStr = script;
						var dom = null;
						if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock')
							dom = Blockly.Xml.subScriptToDom(script, self.workspace);
						else
							dom = Blockly.Xml.scriptToDom(script, self.workspace);
						self.workspace.clear();
						var xml = Blockly.Xml.domToPrettyText(dom);
						var txt = Blockly.Xml.textToDom(xml);
						Blockly.Xml.domToWorkspace(txt, self.workspace);
					}
					catch (error) {
						notificationService.showWarn('用例脚本编辑有误，已恢复至上一版，请重新编辑！');
						throw error;
					}
				}
				if (!self.blockInitHappened) {
					self.blockInitHappened = true;
				}
				document.getElementById('script-edit').style.display = 'block';
				Blockly.svgResize(self.workspace);
				self.workspace.render();
			};

			this.disableScriptEdit = function () {
				if (document.getElementById('script-edit')) {
					document.getElementById('script-edit').style.display = 'none';
				}
			};

			this.initTextEditor = function () {
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
					getCompletions: function (editor, session, pos, prefix, callback) {
						callback(null, cmdConvertService.antKeywordText.map(function (word) {
							return {
								name: word.name,
								value: word.value,
								caption: word.caption,
								type: word.type,
								meta: word.meta
							};
						}));
					}
				};
				var langTools = ace.require('ace/ext/language_tools');
				langTools.addCompleter(staticWordCompleter); //self.scriptEditor.completers = [staticWordCompleter];								
				self.scriptEditor.session.on('change', function (delta) {
					// delta.start, delta.end, delta.lines, delta.action
					self.blockNumberUpdate(0);
					//self.testcaseSavedFlag(false);
				});
				var snippetManager = ace.require("ace/snippets").snippetManager;
				snippet = snippetManager.parseSnippetFile(cmdConvertService.antSnippetText, "text");
				snippetManager.register(snippet, "text");
				//self.scriptEditor.setValue("the new text here");
				//self.scriptEditor.setHighlightActiveLine(false);
				//self.scriptEditor.setReadOnly(true);
				//snippetManager.insertSnippet(self.scriptEditor,snippet);
			};

			this.start = function () {
				this.setBackgroundColor();
				var match = location.search.match(/dir=([^&]+)/);
				var rtl = 'ltr';
				var toolbox = this.getToolboxElement();
				//暂时关闭
				if (selectionManager.selectedNodeType != 'testcase') {
					toolbox = this.getToolboxElementBySubScript();
				}
				var match = location.search.match(/side=([^&]+)/);
				var side = match ? match[1] : 'start';
				var agentOptions = [];
				for (var i = 0; i < cmdConvertService.agentCmdExpandList.length; i++) {
					if (cmdConvertService.agentCmdExpandList[i].commands != null) {
						agentOptions[cmdConvertService.agentCmdExpandList[i].name] = cmdConvertService.agentCmdExpandList[i].commands;
					}
				}

				self.workspace = Blockly.inject('blocklyDiv',
					{
						comments: true,
						collapse: true,
						disable: true,
						grid: {
							spacing: 25,
							length: 3,
							colour: '#ccc',
							snap: true
						},
						horizontalLayout: side == 'top' || side == 'bottom',
						maxBlocks: self.maxBlocks,
						media: 'resources/plugins/blockly/media/',
						oneBasedIndex: true,
						readOnly: false,
						// rtl: rtl,
						scrollbars: true,
						toolbox: toolbox,
						toolboxPosition: side == 'top'
							|| side == 'start' ? 'start'
							: 'end',
						zoom: {
							controls: true,
							wheel: true,
							startScale: 1.0,
							maxScale: 4,
							minScale: .25,
							scaleSpeed: 1.1
						},
						agentOptions: agentOptions,
						// When no globalVariables defined or
						// its length equals to zero, the block
						// of global EVN will not displayed
						// within view
						// globalVariables : [{"VarName": "Env",
						// "VarValue":"test"}],
						// Script or TestCase or CheckPoint or All
						editType: 'None',
						// now only support 'zh_CN' and 'en'
						locale: 'zh'
					});
				self.workspace.options.getCheckpoint = self.projectManager.getRequirement;
				self.workspace.options.getScript = self.projectManager.getScript;
				self.workspace.options.getSubScript = self.projectManager.getSubScript;
				self.workspace.options.getAgentType = self.projectManager.getAgentType;
				self.workspace.options.strictMode = true;
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
			}

			this.setBackgroundColor = function () {
				var lilac = '#d6d6ff';
				var currentPage = window.location.href;
				var regexFile = /^file[\S]*$/;
				// if (regexFile.test(currentPage))
				document.getElementById('blocklyDiv').style.backgroundColor = lilac;
			};

			this.getToolboxElement = function () {
				var match = location.search.match(/toolbox=([^&]+)/);
				return document.getElementById('toolbox-categories');
			};
			this.getToolboxElementBySubScript = function () {
				var match = location.search.match(/toolbox=([^&]+)/);
				return document.getElementById('toolbox-categories-subscript');
			};

			this.collapseBlocky = function () {
				var blocks = self.workspace.getAllBlocks();
				for (var i = 0; i < blocks.length; i++) {
					blocks[i].setCollapsed(true);
				}
			};

			this.expandBlocky = function () {
				var blocks = self.workspace.getAllBlocks();
				for (var i = 0; i < blocks.length; i++) {
					blocks[i].setCollapsed(false);
				}
			};

			this.blockNumberUpdate = function (change) {
				if (self.maxBlocks - self.workspace.getAllBlocks().length - change < 0) {
					notificationService.showWarn('已超过最大Block数目，无法添加.');
					return false;
				}
				self.remainNumberOfBlocks(self.maxBlocks - self.workspace.getAllBlocks().length - change);
				return true;
			}

			this.getTopBlocks = function () {
				var topBlocks = [];
				if (self.workspace.topBlocks_ && self.workspace.topBlocks_.length > 0) {
					self.workspace.topBlocks_.forEach(function (block) {
						if (block.rendered != null && block.rendered)
							topBlocks.push(block);
					})
				}
				return topBlocks;
			}

			// insert sub script				
			this.getSubScriptSuccessFunction = function (data) {
				if (data != null && data.status === 1) {
					var scripts = self.projectManager.generateScriptGroupsFromFlatInfo(data.result);
					self.projectManager.removeEmptyScriptGroup(scripts.data);
					if (scripts.data == null || scripts.data.length == 0)
						notificationService.showWarn('该项目中不存在子脚本定义，无法引用.');
					else {
						self.subScriptMapping = data.result;
						var project = [];
						project.push(scripts);
						if (self.protocolNeedScript()) {
							$('#antbotScriptModal').modal({ show: true }, { data: project });
						} else {
							$('#insertScriptModal').modal({ show: true }, { data: project });
						}
					}
				}
				else
					notificationService.showWarn('该项目中不存在子脚本定义，无法引用.');
			}

			this.getSubScriptErrorFunction = function () {
				notificationService.showError('获取子脚本信息失败.');
			}

			this.getProjectSubScript = function () {
				self.utpService.getFlatSubScriptByProject(0, self.getSubScriptSuccessFunction, self.getSubScriptErrorFunction);
			}

			this.initSubScriptTree = function (data) {
				const treeTemplate = (obj, com) => {
					let content = com.icon(obj, com);
					content += (obj.$count === 0 && obj.type === "folder")
						? "<div class='webix_tree_folder'></div>"
						: com.folder(obj, com);
					content += com.checkbox(obj, com) + obj.value;
					if (obj.id !== "project") content += ` (${obj.id})`;
					return content;
				};

				// 公共搜索处理
				const searchHandler = {
					onTimedKeyPress: function () {
						const value = this.getValue().toLowerCase();
						const tree = $$("subScriptTree");
						if (tree) {
							tree.filter(obj =>
								obj.value.toLowerCase().includes(value) ||
								String(obj.id).toLowerCase().includes(value)
							);
						}
					}
				};

				const containerId = self.protocolNeedScript()
					? "antbotScriptTreeview"
					: "subScriptTreeview";
				$(`#${containerId}`).html('');

				webix.ready(() => {
					self.subScriptTree = webix.ui({
						container: containerId,
						rows: [
							{
								view: "text",
								id: "subScriptTreeSearch",
								placeholder: "搜索...",
								on: searchHandler
							},
							{
								view: "tree",
								id: "subScriptTree",
								template: treeTemplate,
								threeState: true,
								data: data,
								ready: function () {
									this.closeAll();
									this.open(self.fileManagerUtility.root);
									this.sort("value", "asc", "string");
								}
							}
						]
					});
				});
			};
			// 确保在调用 getChecked 方法时，self.subScriptTree 已经被正确初始化
			this.getCheckedItems = function () {
				var tree = $$("subScriptTree");
				if (tree) {
					return tree.getChecked();
				} else {
					console.error("subScriptTree is not initialized");
					return [];
				}
			};

			this.insertSubScriptCmd = function () {
				self.getProjectSubScript();
			};

			this.checkedSubScriptNodeIds = function (scripts, checkedNodes, checkedIds) {
				for (var i = 0; i < scripts.length; i++) {
					if ($.inArray(scripts[i].id, checkedIds) >= 0) {
						if (self.selectScriptFunType() === '0') {
							checkedNodes.push(scripts[i]);
						}
						else {
							if (scripts[i].parameter == undefined || scripts[i].parameter == null || scripts[i].parameter == "") {
								checkedNodes.push(scripts[i]);
							}
							else {
								notificationService.showWarn(scripts[i].name + '：子脚本包含参数，不能获取脚本内容.');
							}
						}
					}
				}
			};

			this.insertSubScriptAsBlock = function (checkedNodes) {
				var dom = null;
				if (self.selectScriptFunType() === '0')
					dom = Blockly.Xml.subScriptCallToDom(checkedNodes, this.workspace);
				if (self.selectScriptFunType() === '1')
					dom = Blockly.Xml.subScriptGetToDom(checkedNodes, this.workspace);
				if (dom == null)
					return false;
				if (!self.blockNumberUpdate(dom.getElementsByTagName('block').length))
					return false;
				Blockly.Xml.domToWorkspace(dom, self.workspace);
				return true;
			};

			this.insertSubScriptAsText = function (checkedNodes) {
				for (var i = 0; i < checkedNodes.length; i++) {
					var scriptStr = cmdConvertService.SUBSCRIPT_DEF + cmdConvertService.PARA_SEPARATOR + checkedNodes[i].id + '[' + checkedNodes[i].name + ']';
					if (checkedNodes[i].parameter && checkedNodes[i].parameter != '') {
						var parameters = JSON.parse(checkedNodes[i].parameter);
						for (var j = 0; j < parameters.length; j++)
							scriptStr += parameters[j] + cmdConvertService.PARA_SEPARATOR;
					}
					scriptStr += cmdConvertService.CMD_SEPARATOR;
					if (self.selectScriptFunType() === '1')
						scriptStr = cmdConvertService.GET_SCRIPT_CONTENT + cmdConvertService.PARA_SEPARATOR +
							checkedNodes[i].id + '[' + checkedNodes[i].name + ']' + cmdConvertService.PARA_SEPARATOR + '^x' + cmdConvertService.CMD_SEPARATOR
					self.updateEditor(scriptStr + '\n');
				}
			};

			this.insertSubScript = function () {
				var checkedNodes = [];
				var checkedIds = self.getCheckedItems();
				self.checkedSubScriptNodeIds(self.subScriptMapping.scripts, checkedNodes, checkedIds);
				if (checkedNodes.length == 0) {
					notificationService.showWarn('请选择子脚本');
					return;
				}
				// if (self.selectedAgent == null) {
				// 	notificationService.showWarn('未配置测试机器人， 请在测试机器人管理功能中配置测试机器人');
				// 	return;
				// }
				if (!self.insertSubScriptAsBlock(checkedNodes)) {
					notificationService.showWarn('已超过最大Block数目，无法添加');
					return;
				}

				self.insertSubScriptAsText(checkedNodes);

				$('#insertScriptModal').modal('hide');
				self.testcaseSavedFlag(false);
			}

			// insert checkpoint
			this.insertCheckpointCmd = function () {
				var project = self.projectManager.getRequirements();
				$('#insertCheckPointModal').modal({ show: true }, { data: project });
			}

			this.initCheckPointTree = function (data) {
				$('#checkPointTreeview').html('');
				webix.ready(function () {
					self.checkPointTree = webix.ui({
						container: "checkPointTreeview",
						view: "tree",
						template: function (obj, com) {
							if (obj.$count === 0 && (obj.type === "folder")) {
								var icon = obj.$count === 0 && (obj.type === "folder") ? ("<div class='webix_tree_folder'></div>") : com.folder(obj, com);
								return com.icon(obj, com) + icon + obj.value;
							}
							else
								return com.icon(obj, com) + com.checkbox(obj, com) + com.folder(obj, com) + obj.value;
						},
						threeState: true,
						data: data,
						ready: function () {
							this.closeAll();
							this.uncheckAll();
							this.open(self.fileManagerUtility.root);
							this.sort("value", "asc", "string");
						}
					});
				});
			};

			this.checkedCheckPointNodeIds = function (checkedIds) {
				var checkedNodes = [];
				checkedIds.forEach(function (id) {
					var node = self.checkPointTree.getItem(id);
					if (node.type != "folder")
						checkedNodes.push(node);
				});
				return checkedNodes;
			};

			this.insertCheckPointAsText = function (checkedNodes) {
				for (var i = 0; i < checkedNodes.length; i++) {
					var checkpointStr = cmdConvertService.CHECKPOINT_BEGIN + cmdConvertService.PARA_SEPARATOR +
						checkedNodes[i].id + '[' + checkedNodes[i].value + ']' + cmdConvertService.CMD_SEPARATOR +
						cmdConvertService.CHECKPOINT_END + cmdConvertService.CMD_SEPARATOR;
					self.updateEditor(checkpointStr + '\n');
				}
			};

			this.insertCheckPointAsBlock = function (checkedNodes) {
				var dom = Blockly.Xml.checkPointCallToDom(checkedNodes,
					this.workspace);
				if (!self.blockNumberUpdate(dom.getElementsByTagName('block').length))
					return;
				Blockly.Xml.domToWorkspace(dom, self.workspace);
			};

			this.insertCheckPoint = function () {
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

			this.prepareCmdTreeData = function (cmdList) {
				if (cmdList == undefined || cmdList == null || cmdList.length == 0) {
					notificationService.showWarn('命令不存在，请确认测试机器人配置是否正确!');
					return;
				}
				self.commandMapping = [];
				var selectedCommandHierarchy = [{
					data: [],
					value: '全部命令',
					id: self.fileManagerUtility.root,
					open: true
				}];

				var flag = false;
				self.recurPrepareCmdTreeData(cmdList, "0", selectedCommandHierarchy[0].data, flag);
				self.initCmdTree(selectedCommandHierarchy);
			}

			this.recurPrepareCmdTreeData = function (cmdList, parentId, parentData, parentDisable) {
				for (var i = 0; i < cmdList.length; i++) {
					if ('Disable' in cmdList[i] && cmdList[i].Disable === true) {
						continue;
					}
			
					var id = parentId + "-" + i.toString();
					if ("CommandList" in cmdList[i] && "GroupName" in cmdList[i]) {
						// 计算当前节点的禁用状态：继承父级禁用 或 当前节点权限不足
						var currentDisable = parentDisable || ('EnableLevel' in cmdList[i] && cmdList[i].EnableLevel > self.auth);
						var data = [];
						// 递归处理子节点，传递累积的禁用状态
						self.recurPrepareCmdTreeData(cmdList[i].CommandList, id, data, currentDisable);
			
						// 根据当前禁用状态设置节点属性
						var nodeValue, nodeDisabled;
						if (currentDisable) {
							nodeValue = '<span class="pull-left-container text-muted">' + cmdList[i].GroupName + "(暂无权限,不可使用)" + '</span>';
							nodeDisabled = true;
						} else {
							nodeValue = cmdList[i].GroupName;
							nodeDisabled = false;
						}
			
						parentData.push({
							id: id,
							data: data,
							value: nodeValue,
							disabled: nodeDisabled
						});
					} else {
						// 处理叶子节点
						var cmdName = cmdList[i].CmdName;
						var parameters = cmdList[i].Params;
						var cmdType = cmdList[i].Type;
						var formattedCommandString = self.needRecordSetConfigAndSelectAllCmd() 
							? cmdConvertService.convertRecordAllCmdToUserLanguage(self.selectedAgent.antbotType, cmdName)
							: cmdConvertService.convertCmdToUserLanguange(self.selectedAgent.antbotType, cmdType, cmdName, parameters);
			
						var commandObj = { commandName: cmdName, commandParameters: parameters };
						self.commandMapping.push(commandObj);
			
						// 叶子节点的禁用状态：父级禁用 或 自身权限不足
						var leafDisabled = parentDisable || ('EnableLevel' in cmdList[i] && cmdList[i].EnableLevel > self.auth);
			
						if (leafDisabled) {
							parentData.push({
								id: id,
								cmd: commandObj,
								value: '<span class="pull-left-container text-muted">' + formattedCommandString + "---" + cmdName + " (暂无权限,不可使用)</span>",
								disabled: true
							});
						} else {
							parentData.push({
								id: id,
								cmd: commandObj,
								value: formattedCommandString + "---" + cmdName,
								disabled: false
							});
						}
					}
				}
			};


			this.initCmdTree = function (data) {
				$('#commandSelectionView').html(''); // 清空容器内容

				// 获取需要默认选中的节点路径
				var selectedPaths = [];
				for (var i = 0; i < self.checkedCommandNodes.length; i++) {
					if (self.checkedCommandNodes[i].antbotName == self.selectedAgent.antbotName) {
						selectedPaths.push(self.checkedCommandNodes[i].checkedid);
					}
				}

				// 递归过滤数据
				function filterData(items) {
					return items.filter(function (item) {
						// 如果自身需要被删除，则直接返回 false
						if (systemConfig.getConfig('utpclient.testcommand.command_display') && item.disabled) {
							return false;
						}
						// 如果有子节点，递归过滤子节点
						if (item.data && item.data.length > 0) {
							item.data = filterData(item.data);
						}
						return true;
					});
				}

				// 过滤数据
				var filteredData = filterData(data);

				// 初始化 Webix 树组件
				webix.ready(function () {
					self.tree = webix.ui({
						container: "commandSelectionView",
						rows: [
							{
								view: "text",
								id: "commandTreeSearch", // 搜索框唯一ID
								placeholder: "搜索...",
								on: {
									onTimedKeyPress: function () {
										const value = this.getValue().toLowerCase();
										const tree = $$("commandTree"); // 对应树的ID
										if (tree) {
											tree.filter(obj =>
												obj.value.toLowerCase().includes(value) ||
												String(obj.id).toLowerCase().includes(value)
											);
										}
									}
								}
							},
							{
								view: "tree",
								id: "commandTree", // 树形结构唯一ID
								template: function (obj, com) {
									var icon = "";
									if (obj.$count && obj.disabled) // 无权目录
										icon = '';
									else if (obj.$count && !obj.disabled) // 有权目录
										icon = '';
									else if (!obj.$count && obj.disabled) // 无权命令
										icon = '<span class="pull-left-container bg-gray"> 禁用: </span>';
									else // 有权命令
										icon = '<span class="pull-left-container bg-blue"> 命令: </span>';
									// 只在叶子节点显示复选框
									var checkbox = obj.$count === 0 ? com.checkbox(obj, com) : '';
									return com.icon(obj, com) + checkbox + icon + obj.value;
								},
								threeState: false, // 修改为 false，因为我们只希望叶子节点有复选框
								data: filteredData,
								ready: function () {
									this.closeAll();
									this.open(self.fileManagerUtility.root);
									selectedPaths.forEach(path => {
										this.checkItem(path);
									});

									this.refresh();
								},
								tooltip: function (obj) {
									if (obj && obj.cmd && obj.cmd.commandName) {
										return obj.cmd.commandName;
									}
									return '';
								}
							}	
						  ]
					});
				});
			};


			this.initCommandHierarchy = function (rootId, recordId) {
				self.utpService.getBigdata(rootId, recordId, self.getBigdataSuccessFunction, self.getBigdataErrorFunction);
			};

			this.checkedCmdNodeIds = function (checkedIds, checkedNodes, antbotName) {
				for (var i = 0; i < checkedIds.length; i++) {
					const commandTree = webix.$$("commandTree"); // 使用 Webix API 根据ID获取树实例
					var node = commandTree.getItem(checkedIds[i]);
					if (!node || !node.cmd) {
						continue; // 如果节点无效或没有 cmd 属性，跳过当前循环
					}

					let cmd = node.cmd;
					cmd.checkedid = checkedIds[i];
					cmd.antbotName = antbotName || self.selectedAgent.antbotName;

					// 检查 checkedNodes 中是否已存在相同的 checkedid 和 antbotName
					if (!checkedNodes.some(existingNode => existingNode.checkedid === cmd.checkedid && existingNode.antbotName === cmd.antbotName)) {
						checkedNodes.push(cmd);
					}
				}
			};

			this.insertCommandsAsBlock = function (agentType, cmdsStrings) { // 修改为接受类型参数
				var dom1 = Blockly.Xml.agentCMDToDom(agentType, cmdsStrings.join('\n'), this.workspace);
				var xml = Blockly.Xml.domToPrettyText(dom1);
				var dom2 = Blockly.Xml.textToDom(xml);
				Blockly.Xml.domToWorkspace(dom2, self.workspace);
			};
			this.insertCommandsAsText = function (cmdsStrings) {
				var result = "\n"
				for (var i = 0; i < cmdsStrings.length; i++) {
					var cmdsString = cmdsStrings[i] + cmdConvertService.CMD_SEPARATOR + '\n';
					result += cmdsString;
				}
				self.updateEditor(result);
			};

			this.prepareCommands = function () {
				var checkedNodes = self.checkedCommandNodes;
				var commandsByType = {}; // 类型分组容器
				let antbots = self.projectManager.agentsConfigData(); // 获取所有机器人配置
			
				// 第一阶段：命令分组
				for (var x = 0; x < checkedNodes.length; x++) {
					var node = checkedNodes[x];
					
					// 根据antbotName查找对应机器人类型
					var targetAntbot = antbots.find(a => a.antbotName === node.antbotName);
					if (!targetAntbot) {
						console.warn(`未找到机器人 ${node.antbotName} 的配置，跳过命令`);
						continue;
					}
					
					var cmdsString = cmdConvertService.generateCmd(
						node.antbotName,
						node.commandName,
						node.commandParameters
					);
					
					if (cmdsString) {
						var agentType = targetAntbot.antbotType;
						commandsByType[agentType] = commandsByType[agentType] || [];
						commandsByType[agentType].push(cmdsString);
					}
				}
			
				// 第二阶段：块数量预检
				try {
					let totalBlocks = 0;
					Object.keys(commandsByType).forEach(agentType => {
						const cmds = commandsByType[agentType];
						const dom = Blockly.Xml.agentCMDToDom(agentType, cmds.join('\n'), self.workspace);
						totalBlocks += dom.getElementsByTagName('block').length;
					});
			
					if (!self.blockNumberUpdate(totalBlocks)) return;
			
					// 第三阶段：分类型插入
					Object.keys(commandsByType).forEach(agentType => {
						self.insertCommandsAsBlock(agentType, commandsByType[agentType]);
					});
			
					// 文本插入保持原有逻辑
					const allCmds = Object.values(commandsByType).flat();
					self.insertCommandsAsText(allCmds);
					
					self.testcaseSavedFlag(false);
				} catch (err) {
					notificationService.showError(`命令插入失败: ${err.message}`);
				}
			};

			this.insertCommands = function () {
				if (self.selectedAgent == null) return;
				
				// 通过树ID直接获取树对象
				const commandTree = webix.$$("commandTree"); // 使用 Webix API 根据ID获取树实例
				if (!commandTree) {
				  notificationService.showError('命令树未初始化');
				  return;
				}
			  
				// 从正确的树对象中获取选中项
				var checkedIds = commandTree.getChecked(); 
				self.checkedCmdNodeIds(checkedIds, self.checkedCommandNodes, null);
			  
				if (self.checkedCommandNodes.length == 0) {
				  notificationService.showWarn('请选择命令');
				  return;
				}
				
				$('#insertCommandModal').modal('hide');
				if (self.needBigData()) {
				  self.genericProtocolProcess();
				  return;
				}
				self.prepareCommands();
			  };

			// need record and select all cmd
			this.needRecordSetConfigAndSelectAllCmd = function () {
				return cmdConvertService.needRecordSetConfig(self.selectedAgent.antbotType) && self.selectedRecord().scriptId === "all_gui_cmd";
			}
			// insert record

			this.onRecordSelected = function (obj, event) {
				if (self.selectedRecord() == undefined)
					return;
				if (self.needRecordSetConfigAndSelectAllCmd()) {
					var cmdList = cmdConvertService.getcmdListByAgentType(self.selectedAgent.antbotType);
					return self.prepareCmdTreeData(cmdList);
				}
				self.initCommandHierarchy(self.selectedRecord().rootId, self.selectedRecord().scriptId);
			};

			this.insertRecordCmd = function () {
				if (self.projectManager.agentsConfigData() == undefined || self.projectManager.agentsConfigData() == null
					|| self.projectManager.agentsConfigData().length == 0) {
					notificationService.showWarn('未配置测试机器人， 请在测试机器人管理功能中配置测试机器人.');
					return;
				}
				self.checkedCommandNodes = [];
				$('#insertCommandModal').modal('show');
			};

			this.lastAntbotName = null;
			this.agentChangedOnInsertCommands = function (obj, event) {
				const commandTree = webix.$$("commandTree"); // 使用 Webix API 根据ID获取树实例
				// 从正确的树对象中获取选中项
				var checkedIds = commandTree.getChecked(); 
				if (self.projectManager.agentsConfigData().length > 0 && self.lastAntbotName == null) {
					self.lastAntbotName = self.projectManager.agentsConfigData()[0].antbotName;
				};
				self.checkedCmdNodeIds(checkedIds, self.checkedCommandNodes, self.lastAntbotName);

				if (self.selectedAgent == undefined)
					return;

				if (event.originalEvent)// user changed
					self.showRecordListFromSelectedAgent();
				else { // program changed

				}

				self.lastAntbotName = self.selectedAgent.antbotName;
			};
			//TBD
			this.getRecordsByAgentTypeSuccessFunction = function (records) {
				if (records) {
					if (cmdConvertService.needRecordSetConfig(self.selectedAgent.antbotType)) {
						for (var i = 0; i < records.length; i++) {
							records[i].scriptName = "录制集-" + records[i].scriptName.toString()
						}
						records.push({ scriptName: "所有命令", rootId: "all", recordSetName: "all", scriptId: "all_gui_cmd" });
					}
					self.agentsRecordData([]);
					for (var i = 0; i < records.length; i++)
						self.agentsRecordData.push(records[i]);
				}
			};

			this.getRecordsByAgentTypeErrorFunction = function () { };

			this.updateRecordLabel = function () {
				self.recordLabel(cmdConvertService.needRecordSetConfig(self.selectedAgent.antbotType) ? "2: 选择命令源:" : "2: 选择录制集:");
			};

			this.showRecordListFromSelectedAgent = function () {
				if (self.selectedAgent == undefined)
					return;
				this.updateRecordLabel();
				self.needRecordSelected(false);
				self.needBigData(false);
				if (cmdConvertService.needRecordSetConfig(self.selectedAgent.antbotType)) {
					self.needRecordSelected(true);
					var queryObj = {
						toolDynId: loginManager.getAuthorizationKey(),
						orgId: loginManager.getOrganization(),
						rootType: self.selectedAgent.antbotType,
						recordsetId: self.selectedAgent.recordsetId
					}
					self.utpService.getRecordsByAgentType(queryObj, self.getRecordsByAgentTypeSuccessFunction, self.getRecordsByAgentTypeErrorFunction);
					return;
				}

				if (cmdConvertService.needBigDataConfig(self.selectedAgent.antbotType)) {
					self.needBigData(true);
					self.currentBigDatatype = null;
					self.utpService.getProtocol(self.selectedAgent.protocolSignalId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
				}
				var cmdList = cmdConvertService.getcmdListByAgentType(self.selectedAgent.antbotType);
				for (var i = 0; i < cmdList.length; i++)
					cmdList[i].Id = i + 1;
				self.prepareCmdTreeData(cmdList);
			};

			// insert protocol
			this.currentBigDatatype = null;

			this.getProtocolSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.protocolService.addProtocol(data.result);
					self.currentBigDatatype = data.result.dataType;
					self.protocol = JSON.parse(data.result.bigdata);
					self.genericFrameInfo.protocolId = data.result.id;
				}
			};

			this.getProtocolErrorFunction = function () {
				notificationService.showError('获取协议文件失败');
			};

			this.getBigdataSuccessFunction = function (data) {
				if (data) {
					var scriptContentJSON = JSON.parse(data.value);
					var cmdList = new Array();
					for (var i = 0; i < scriptContentJSON.length; i++) {
						var parameters = new Array();
						for (var j = 1; j < scriptContentJSON[i].value.length; j++)
							parameters[j - 1] = scriptContentJSON[i].value[j];

						var commandObj = {
							CmdName: scriptContentJSON[i].value[0],
							Params: parameters,
							Type: scriptContentJSON[i].type,
							Id: parseInt(scriptContentJSON[i].id) + 1
						}
						cmdList.push(commandObj);
					}
					self.prepareCmdTreeData(cmdList);
				}
			};

			this.getBigdataErrorFunction = function () { };

			this.protocolFieldsconfig = ko.observableArray([]);

			this.protocol = { "equipments": [{ "index": "002", "name": "Flight Management Computer (702)", "labels": [{ "index": "001", "name": "Distance to Go", "minTxInterval": 100, "maxTxInterval": 200, "fields": [{ "name": "Distance to Go", "unit": "N.M.", "startBit": "29", "endBit": "11", "codeField": null, "bcd": { "digits": 5, "digit_Size": 4, "minva1": 0, "maxva1": 3999.9, "msd_Size": 3 } }, { "name": "SSM", "startBit": "31", "endBit": "30", "codeField": { "codes": [{ "value": "0", "String": "+" }, { "value": "1", "String": "NO Computed Data" }, { "value": "2", "String": "Functional Test" }, { "value": "3", "String": "-" }] } }] }, { "index": "002", "name": "Time to Go", "minTxInterval": 100, "maxTxInterval": 200, "fields": [{ "name": "Time to Go", "unit": "Min", "startBit": 29, "endBit": 15, "codeField": null, "bcd": { "digits": 4, "digit_Size": 4, "minva1": 0, "maxva1": 3999.9, "msd_Size": 3 } }] }, { "index": "003", "name": "Cross Track Distance", "minTxInterval": 100, "maxTxInterval": 200, "fields": [{ "name": "Cross Track Distance", "unit": "N.M.", "startBit": 29, "endBit": 15, "codeField": null, "bcd": { "digits": 4, "digit_Size": 4, "minva1": 0, "maxva1": 399.9, "msd_Size": 3 } }] }, { "index": "010", "name": "Present Position - Latitude", "minTxInterval": 250, "maxTxInterval": 500, "fields": [{ "name": "Degrees", "unit": "Deg", "startBit": 29, "endBit": 21, "codeField": null, "bcd": { "digits": 3, "digit_Size": 4, "minva1": 0, "maxva1": 180, "msd_Size": 1 } }, { "name": "minutes", "unit": "'", "startBit": 20, "endBit": 9, "codeField": null, "bcd": { "digits": 3, "digit_Size": 4, "minva1": 0, "maxva1": 180, "msd_Size": 4 } }] }, { "index": "012", "name": "Ground Speed", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Ground Speed", "unit": "Knots", "startBit": "29", "endBit": "15", "bcd": { "digits": "4", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "7000" } }] }, { "index": "013", "name": "Track Angle - True", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Track Angle - True", "unit": "Deg", "startBit": "29", "endBit": "15", "bcd": { "digits": "4", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "359.9" } }] }, { "index": "015", "name": "Wind Speed", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Wind Speed", "unit": "Knots", "startBit": "29", "endBit": "19", "bcd": { "digits": "3", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "799" } }] }, { "index": "027", "name": "TACAN Selected Course", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "TACAN Selected Course", "unit": "Deg", "startBit": "29", "endBit": "19", "bcd": { "digits": "3", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "359" } }] }, { "index": "041", "name": "Set Latitude ", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Set Latitude ", "unit": "Deg/Min", "startBit": "29", "endBit": "21", "bcd": { "digits": "3", "msd_Size": "1", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }, { "name": "minutes", "unit": "'", "startBit": "20", "endBit": "9", "bcd": { "digits": "3", "msd_Size": "4", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }] }, { "index": "042", "name": "Present Position - Latitude", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Degrees", "unit": "Deg", "startBit": "29", "endBit": "21", "bcd": { "digits": "3", "msd_Size": "1", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }, { "name": "minutes", "unit": "'", "startBit": "20", "endBit": "9", "bcd": { "digits": "3", "msd_Size": "4", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }] }, { "index": "043", "name": "Set Magnetic Heading", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Set Magnetic Heading", "unit": "Deg", "startBit": "29", "endBit": "19", "bcd": { "digits": "3", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "359" } }] }, { "index": "200", "name": "Drift Angle", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Drift Angle", "unit": "Deg", "startBit": "29", "endBit": "15", "bcd": { "digits": "4", "msd_Size": "4", "digit_Size": "4", "minva1": "-180", "maxva1": "180" } }] }, { "index": "261", "name": "Flight Number", "minTxInterval": "500", "maxTxInterval": "1000", "fields": [{ "name": "Flight Number", "unit": "N/A", "startBit": "29", "endBit": "14", "bcd": { "digits": "4", "msd_Size": "4", "digit_Size": "4", "minva1": "0", "maxva1": "9999" } }] }] }] };

			this.addSubScript = function () {
				self.protocolNeedScript(false);
				var checkedNodes = [];
				var checkedIds = self.getCheckedItems();
				self.checkedSubScriptNodeIds(self.subScriptMapping.scripts, checkedNodes, checkedIds);
				if (checkedNodes.length == 0) {
					notificationService.showWarn('请选择子脚本');
					return;
				}
				let value = "";
				for (let i = 0; i < checkedNodes.length; i++) {
					value = value + checkedNodes[i].id + ", "
				}

				for (var x = 0; x < self.checkedCommandNodes.length; x++) {
					var commandParameters = self.checkedCommandNodes[x].commandParameters;
					for (var p = 0; p < commandParameters.length; p++) {
						if (commandParameters[p].assistInputType) {
							if (commandParameters[p].assistInputType === 'scriptId') {
								commandParameters[p].value = commandParameters[p].value = value;
							}
						}
					}
				}

				$('#antbotScriptModal').modal('hide');
				if (self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting() || self.protocolNeedMessageNameSetting() ||
					self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() ||
					self.protocolNeedFieldValueSetting() || self.protocolNeedFieldConditionSetting() || self.protocolNeedScript())
					self.genericProtocolFieldSettingProcess();
				else
					self.prepareCommands();;
			}

			this.cancelAntbotScript = function () {
				$('#antbotScriptModal').modal('hide');
				self.protocolNeedScript(false);
			}
			// generic protocol
			this.genericProtocolFieldSettingProcess = function () {
				if (self.protocolNeedScript()) {
					self.insertSubScriptCmd();
				} else {
					var protocol = self.protocol;
					var root = {
						id: protocol.protocolName,
						value: protocol.protocolName,
						data: []
					};
					if (protocol.messages == undefined || protocol.messages == null || protocol.messages.length == 0) {
						notificationService.showWarn('协议文件中不存在消息定义，请确认协议文件是否正确!');
						return;
					}
					for (var i = 0; i < protocol.messages.length; i++) {
						var id = protocol.messages[i].messageName;
						protocol.messages[i].id = id ? id : i;
						var equiNode = {
							id: id ? id : i,
							value: protocol.messages[i].messageName,
							data: []
						}
						root.data.push(equiNode);
					}
					$('#genericProtocolFieldSettingModal').modal({ show: true }, { data: root });
				}
			};

			this.composeFieldGroupSetting = function () {
				for (var x = 0; x < self.checkedCommandNodes.length; x++) {
					var commandParameters = self.checkedCommandNodes[x].commandParameters;
					for (var p = 0; p < commandParameters.length; p++) {
						if (commandParameters[p].assistInputType) {
							if (commandParameters[p].assistInputType === 'messageFiledsConditionJson') {
								commandParameters[p].value = JSON.stringify({
									messageName: self.currentGenericFrameMessageName,
									config: self.genericFrameInfo.conditions
								});
							}
							else if (commandParameters[p].assistInputType === 'messageFiledsValueJson') {
								//判断 self.selectedMessageTemplate() == undefined
								if (self.selectedMessageTemplate() == undefined) {
									commandParameters[p].value = JSON.stringify({
										messageName: self.currentGenericFrameMessageName,
										config: self.genericFrameInfo.fields
									});
								} else {
									commandParameters[p].value = JSON.stringify({
										messageName: self.currentGenericFrameMessageName,
										messageTemplate: self.selectedMessageTemplate().id,
										config: self.genericFrameInfo.fields
									});
								}
							}
						}
					}
				}
			};

			this.composeFieldSetting = function () {
				var messageName = self.currentGenericFrameMessageName;
				var path = "";
				var value = "";
				var condition = "";
				if (self.protocolNeedFieldConditionSetting()) {
					path = self.genericFrameInfo.conditions[0].path;
					condition = self.genericFrameInfo.conditions[0].condition;
				}
				else if (self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSelectionSetting()) {
					path = self.genericFrameInfo.fields[0].path;
					value = self.genericFrameInfo.fields[0].value;
				}
				else if (self.protocolNeedMultipleFieldSelectionSetting()) {
					path = [];
					for (var i = 0; i < self.genericFrameInfo.fields.length; i++)
						path.push(self.genericFrameInfo.fields[i].path);
				}

				for (var x = 0; x < self.checkedCommandNodes.length; x++) {
					var commandParameters = self.checkedCommandNodes[x].commandParameters;
					for (var p = 0; p < commandParameters.length; p++) {
						if (commandParameters[p].assistInputType) {
							if (commandParameters[p].assistInputType === 'messageName') {
								commandParameters[p].value = messageName;
							}
							else if (commandParameters[p].assistInputType === 'fieldLocator') {
								//path.unshift(messageName);
								commandParameters[p].value = JSON.stringify(path);
							}
							else if (commandParameters[p].assistInputType === 'multiFieldLocator') {
								commandParameters[p].value = JSON.stringify(path);
							}
							else if (commandParameters[p].assistInputType === 'fieldValue') {
								//判断 self.selectedMessageTemplate() == undefined
								if (self.selectedMessageTemplate() == undefined) {
									commandParameters[p].value = JSON.stringify({
										messageName: self.currentGenericFrameMessageName,
										config: self.genericFrameInfo.fields
									});
								} else {
									commandParameters[p].value = JSON.stringify({
										messageName: self.currentGenericFrameMessageName,
										messageTemplate: self.selectedMessageTemplate().id,
										config: self.genericFrameInfo.fields
									});
								}
							}
							else if (commandParameters[p].assistInputType === 'fieldCondition') {
								commandParameters[p].value = JSON.stringify({ messageName: self.currentGenericFrameMessageName, path, condition });
							}
						}
					}
				}
			};

			this.composeGenericFrameField = function () {
				if (self.protocolService.validatorErrors.length > 0) {
					notificationService.showError('请输入合法数据');
					return;
				}

				self.genericFrameInfo.fields = [];
				self.genericFrameInfo.conditions = [];
				if (self.protocolNeedFieldSetting() && self.protocolNeedConditionSetting()) {
					// TODO, this condition should not exist
				}
				else if (self.protocolNeedFieldSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (typeof currrntValue === 'string') {
								//判断currrntValue是否含有括号
								if (currrntValue.indexOf('(') != -1) {
									currrntValue = currrntValue.match(/\(([^)]+)\)/)[1];
								}
							}

							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.fields.push({
									path: path,
									value: currrntValue
								});
							}
						});
					}
					else {
						notificationService.showWarn('请选择字段！');
						return;
					}
				}
				else if (self.protocolNeedConditionSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.conditions.push({
									path: path,
									condition: currrntValue
								});
							}
						});
					}
					else {
						notificationService.showWarn('请选择字段！');
						return;
					}
				}
				else if (self.protocolNeedFieldValueSetting() && self.protocolNeedFieldConditionSetting()) {
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
				else if (self.protocolNeedFieldValueSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.fields.push({
									path: path,
									value: currrntValue,
								});
							}
						});
					}
					else {
						notificationService.showWarn('请选择字段！');
						return;
					}
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
				else if (self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.fields.push({
									path: path,
									value: currrntValue
								});
							}
						});
					}
					else {
						notificationService.showWarn('请选择字段！');
						return;
					}

				}
				else if (self.protocolNeedFieldConditionSetting()) {
					if (self.protocolService.changeMap.size > 0) {
						self.protocolService.changeMap.forEach(function (value, key) {
							var path = JSON.parse(key);
							var currrntValue = _.get(self.protocolService.editedProtocolConfig, path)
							if (!_.isObject(currrntValue)) {
								self.genericFrameInfo.conditions.push({
									path: path,
									condition: currrntValue
								});
							}
						});
					}
					else {
						notificationService.showWarn('请选择字段！');
						return;
					}
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

				if (self.protocolNeedConditionSetting() || self.protocolNeedFieldSetting())
					self.composeFieldGroupSetting();
				else if (self.protocolNeedFieldConditionSetting() || self.protocolNeedFieldValueSetting() ||
					self.protocolNeedMessageNameSetting() || self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting())
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
			this.composeGenericFrameName = function () {
				var item = $$('protocolGroupList').getSelectedItem();
				if (item == undefined || item == null) {
					notificationService.showError('请选择字段！');
					return;
				}
				var names = [];
				names.push(item.id);
				while (item.$level > 1) {
					item = $$('protocolGroupList').getItem(item.$parent);
					names.unshift(item.id);
				}

				for (var x = 0; x < self.checkedCommandNodes.length; x++) {
					var commandParameters = self.checkedCommandNodes[x].commandParameters;
					for (var p = 0; p < commandParameters.length; p++) {
						if (commandParameters[p].assistInputType) {
							if (commandParameters[p].assistInputType === 'messageName')
								commandParameters[p].value = names[0];
							else if (commandParameters[p].assistInputType === 'fieldName' && names[1] != undefined)
								commandParameters[p].value = names[1];
							else if (commandParameters[p].assistInputType === 'bitName' && names[2] != undefined)
								commandParameters[p].value = names[2];
							else if (commandParameters[p].assistInputType === 'bitName' && names[2] != undefined)
								commandParameters[p].value = names[2];
							else if (commandParameters[p].assistInputType === 'bitName' && names[2] != undefined)
								commandParameters[p].value = names[2];
						}
					}
				}
				self.prepareCommands();
			};

			this.clearProtocolConfigView = function () {
				$('#protocolConfigView').html('');
			};

			this.exceptionCheck = ko.observable(false);
			this.onlySelection = ko.observable(false);
			this.selectedMessage = null;

			this.initProtocolConfigView = function (message, keepAllFields, needSchemaCheck) {
				self.clearProtocolConfigView();
				self.onlySelection(false);
				var currentProtocolMode = self.protocolService.protocolModeEnum.valueSelectionSetting
				if (self.protocolNeedFieldSetting() && self.protocolNeedConditionSetting() || self.protocolNeedFieldValueSetting() && self.protocolNeedFieldConditionSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.valueConditionSetting;
				}
				else if (self.protocolNeedFieldSetting() || self.protocolNeedFieldValueSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting;
				}
				else if (self.protocolNeedFieldConditionSetting() || self.protocolNeedConditionSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.conditionSetting;
				}
				// self.protocolNeedMessageNameSetting() TODO
				else if (self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() || self.protocolNeedMessageNameSetting()) {
					currentProtocolMode = self.protocolService.protocolModeEnum.fieldSelection;
					self.onlySelection(true);
				}
				var multipleSelection = false;
				if (self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting() || self.protocolNeedMultipleFieldSelectionSetting())
					multipleSelection = true;
				var options = self.protocolService.protocolOptionInit(self.protocol, message, currentProtocolMode, multipleSelection, keepAllFields, needSchemaCheck, message.fieldValues);
				const container = document.getElementById('protocolConfigView');
				var obj = self.protocolService.editedProtocolConfig;
				self.editor = new JSONEditor(container, options, obj);
				self.protocolService.editor = self.editor;
			};

			this.protocolConfigViewModeChange = function (state) {
				if (state)
					self.initProtocolConfigView(self.selectedMessage, true, false);
				else
					self.initProtocolConfigView(self.selectedMessage, false, true);
			};

			this.selectedMessageTemplate = ko.observable();
			this.messageTemplates = ko.observable([]);

			this.getActiveMessageTemplateSuccessFunction = function (data) {
				if (data && data.status && data.result) {
					var messageTemplates = data.result;
					self.messageTemplates(messageTemplates);
					self.selectedMessageTemplate(undefined);
				}
			};

			this.getActiveMessageTemplateErrorFunction = function () {
				notificationService.showError('获取消息模板失败');
			};

			this.getActiveMessageTemplate = function (protocolId, messageName) {
				utpService.getActiveMessageTemplate(protocolId, messageName, self.getActiveMessageTemplateSuccessFunction, self.getActiveMessageTemplateErrorFunction);
			};

			this.messageTemplateChanged = function (obj, event) {
				if (self.selectedMessageTemplate() == undefined) {
					self.protocolFieldsconfig.removeAll();
					self.selectedMessage.fieldValues = null;
					self.initProtocolConfigView(self.selectedMessage, false, true);
					return;
				}
				if (event.originalEvent) {// user changed
					self.protocolFieldsconfig.removeAll();
					self.selectedMessage.fieldValues = JSON.parse(self.selectedMessageTemplate().fieldValues);
					self.initProtocolConfigView(self.selectedMessage, false, true);
				}
				else { // program changed

				}
			};

			this.initGenericProtocolTree = function (data) {
				$('#genericProtocolTreeview').html('');
				self.exceptionCheck(false);
				self.selectedMessageTemplate(undefined);
				self.messageTemplates([]);
				self.clearProtocolConfigView();
				self.protocolFieldsconfig.removeAll();
				self.genericProtocolName(data.value);
				webix.ready(function () {
					self.genericProtocolTree = webix.ui({
						container: "genericProtocolTreeview",
						view: "tree",
						type: "lineTree",
						select: true,
						template: "{common.icon()}&nbsp;#value#",
						data: data,
						ready: function () {
							this.closeAll();
							// this.sort("value", "asc", "string");
						}
					});

					self.genericProtocolTree.attachEvent("onItemClick", function (id, e, node) {
						// var item = this.getItem(id);
						if (self.protocolNeedConditionSetting() || self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() ||
							self.protocolNeedFieldConditionSetting() || self.protocolNeedMessageNameSetting() ||
							self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSetting()) {
							self.exceptionCheck(false);
							self.protocolFieldsconfig.removeAll();
							self.currentGenericFrameMessageName = "";
							for (var i = 0; i < self.protocol.messages.length; i++) {
								if (self.protocol.messages[i].id === id) {
									self.selectedMessage = JSON.parse(JSON.stringify(self.protocol.messages[i]));
									self.currentGenericFrameMessageName = self.selectedMessage.messageName;
									self.genericFrameInfo.id = self.selectedMessage.id;
									self.selectedMessage.fieldValues = null;
									self.genericCommandField(self.selectedMessage.messageName);
									self.initProtocolConfigView(self.selectedMessage, true, true);
									if (self.protocolNeedFieldValueSetting() || self.protocolNeedFieldSetting()) {
										self.getActiveMessageTemplate(self.genericFrameInfo.protocolId, self.selectedMessage.messageName)
									}
									break;
								}
							}
							$('#exceptionCheckConfig').bootstrapSwitch("state", false);
							$('#exceptionCheckConfig').on('switchChange.bootstrapSwitch', function (event, state) {
								self.protocolConfigViewModeChange(state);
							});
						}
					});
				});
			};

			this.protocolNeedConditionSetting = ko.observable(false);
			this.protocolNeedFieldSetting = ko.observable(false);
			this.protocolNeedMessageNameSetting = ko.observable(false);
			this.protocolNeedFieldSelectionSetting = ko.observable(false);
			this.protocolNeedMultipleFieldSelectionSetting = ko.observable(false);
			this.protocolNeedFieldValueSetting = ko.observable(false);
			this.protocolNeedFieldConditionSetting = ko.observable(false);
			this.protocolNeedScript = ko.observable(false);

			this.genericProtocolProcess = function () {
				if (self.currentBigDatatype === self.protocolService.dataType.GENERICBUSFRAME) {
					self.protocolNeedConditionSetting(false);
					self.protocolNeedFieldSetting(false);
					self.protocolNeedMessageNameSetting(false);
					self.protocolNeedFieldSelectionSetting(false);
					self.protocolNeedMultipleFieldSelectionSetting(false);
					self.protocolNeedFieldValueSetting(false);
					self.protocolNeedFieldConditionSetting(false);

					for (var x = 0; x < self.checkedCommandNodes.length; x++) {
						var commandParameters = self.checkedCommandNodes[x].commandParameters;
						for (var p = 0; p < commandParameters.length; p++) {
							if (commandParameters[p].assistInputType) {
								if (commandParameters[p].assistInputType === 'messageFiledsValueJson')
									self.protocolNeedFieldSetting(true);
								else if (commandParameters[p].assistInputType === 'messageFiledsConditionJson')
									self.protocolNeedConditionSetting(true);
								else if (commandParameters[p].assistInputType === 'messageName')
									self.protocolNeedMessageNameSetting(true);
								else if (commandParameters[p].assistInputType === 'fieldLocator')
									self.protocolNeedFieldSelectionSetting(true);
								else if (commandParameters[p].assistInputType === 'multiFieldLocator')
									self.protocolNeedMultipleFieldSelectionSetting(true);
								else if (commandParameters[p].assistInputType === 'fieldValue')
									self.protocolNeedFieldValueSetting(true);
								else if (commandParameters[p].assistInputType === 'fieldCondition')
									self.protocolNeedFieldConditionSetting(true);
								else if (commandParameters[p].assistInputType === 'scriptId')
									self.protocolNeedScript(true);
							}
						}
					}
					if (self.protocolNeedFieldSetting() || self.protocolNeedConditionSetting() || self.protocolNeedMessageNameSetting() ||
						self.protocolNeedFieldSelectionSetting() || self.protocolNeedMultipleFieldSelectionSetting() ||
						self.protocolNeedFieldValueSetting() || self.protocolNeedFieldConditionSetting() || self.protocolNeedScript())
						self.genericProtocolFieldSettingProcess();
					else
						self.prepareCommands();
				}
				else {
					notificationService.showWarn('无法插入命令，请确认相关协议是否存在');
				}
			};

			// update script(testcase) & sub script 
			this.updateScriptSuccessFunction = function (data) {
				if (data && data.status === 1) {
					self.testcaseSavedFlag(true);
					if (typeof selectionManager.refreshTreeNodeCallback === "function") {
						selectionManager.refreshTreeNodeCallback(self.currentScript.name());
					}
					if (selectionManager.selectedNodeType == 'testcase')
						notificationService.showSuccess('更新测试用例成功');
					else
						notificationService.showSuccess('更新子脚本成功');
					self.updated = true;
				}
				else
					self.updateScriptErrorFunction();
			};

			this.updateScriptErrorFunction = function () {
				if (selectionManager.selectedNodeType == 'testcase')
					notificationService.showError('更新测试用例失败');
				else
					notificationService.showError('更新子脚本失败');
			};

			this.updateBasicSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					self.currentScript.description(data.result.description);
					self.currentScript.name(data.result.name);
					self.currentScript.customizedId(data.result.customizedId);
					self.currentScript.customizedFields(data.result.customizedFields);
					var topBlocks = self.getTopBlocks();
					if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock' && topBlocks[0].type === "procedures_defscript")
						topBlocks[0].setFieldValue(self.currentScript.name(), 'SCRIPTNAME');
					notificationService.showSuccess('基本信息更新成功');
				}
				else
					self.updateBasicErrorFunction();
			};

			this.updateBasicErrorFunction = function () {
				notificationService.showError('基本信息更新失败');
			};

			this.updateBasic = function () {
				var name = self.currentScript.name();
				if (name === null || name == "") {
					notificationService.showWarn('名称不能为空');
					return;
				}

				if (name.length > self.maxNameLength) {
					notificationService.showWarn('名称长度不能超过' + self.maxNameLength);
					return;
				}

				var reg = /[@%\^&<>]+/g;
				if (name.match(reg) != null) {
					notificationService.showWarn('名称不能包含@%^&<>等特殊字符');
					return;
				}
				var customizedFields = [];
				try {
					var candidateCustomizedFields = $$("script_customizedField").serialize();
					if (candidateCustomizedFields.length > 0) {
						for (var i = 0; i < candidateCustomizedFields.length; i++) {
							if (candidateCustomizedFields[i].value != '')
								customizedFields.push({
									name: candidateCustomizedFields[i].name,
									value: candidateCustomizedFields[i].value
								})
						}
					}
				}
				catch (e) {
					customizedFields = [];
					console.log(e);
				}
				var selectedScript = {
					id: self.currentScript.id(),
					customizedId: self.currentScript.customizedId(),
					name: self.currentScript.name(),
					description: self.currentScript.description(),
					projectId: self.currentScript.projectId(),
					parentScriptGroupId: self.currentScript.parentScriptGroupId(),
					customizedFields: JSON.stringify(customizedFields)
				}
				if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock')
					self.utpService.updateSubScript(selectedScript, self.updateBasicSuccessFunction, self.updateBasicErrorFunction);
				else
					self.utpService.updateScript(selectedScript, self.updateBasicSuccessFunction, self.updateBasicErrorFunction);
			}

			this.saveBlockScript = function () {
				var topBlocks = self.getTopBlocks();
				if (topBlocks.length > 1) {
					notificationService.showError('请保证所有命令组成一个脚本段！');
					return false;
				}
				var macro = [];
				if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					if (topBlocks.length == 0 || topBlocks[0].type != "procedures_defscript") {
						notificationService.showError('子脚本定义不存在！');
						return false;
					}
					macro = JSON.parse(JSON.stringify(topBlocks[0].arguments_));
				}

				var scriptContent = Blockly.AntScript
					.workspaceToCode(self.workspace);
				// 去除末尾的换行符
				scriptContent = scriptContent.trimEnd();
				//判断scriptContent字符串最后是否有两个相同的cmdConvertService.CMD_SEPARATOR字符串,如果有两个相同的cmdConvertService.CMD_SEPARATOR字符串则去除一个
				var cmdSeparator = cmdConvertService.CMD_SEPARATOR;
				var cmdSeparatorLength = cmdSeparator.length;
				if (scriptContent.endsWith(cmdSeparator + cmdSeparator)) {
					scriptContent = scriptContent.substring(0, scriptContent.length - cmdSeparatorLength);
				}
				//添加换行符
				// scriptContent = scriptContent.replace(new RegExp(cmdSeparator, 'g'), cmdSeparator + '\n');

				if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					/*scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
					for(var i=0; i < macro.length; i++){
						if(scriptContent.indexOf("%" + macro[i] + "%") >= 0){
							scriptContent = 
								scriptContent.replace(new RegExp("%"+macro[i]+"%", 'g'), "%" + i + "%");
							continue;
						}
					}*/
					var returnBlock = topBlocks[0].getField('SCRIPTRETURN');
					if (returnBlock) {
						var returnMacro = returnBlock.getText();
						/*
						scriptContent = scriptContent.replace(new RegExp("\\$" + returnMacro, 'g'), "$%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("\\^" + returnMacro, 'g'), "^%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("SET_VAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "SET_VAR" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("SET_ARRAY" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "SET_ARRAY" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("UPDATE_SIMPLE_VAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "UPDATE_SIMPLE_VAR" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("UPDATE_ARRAY_VAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "UPDATE_ARRAY_VAR" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("DEFINE_ARRAY_VAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "DEFINE_ARRAY_VAR" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
						scriptContent = scriptContent.replace(new RegExp("DEFINE_SIMPLE_VAR" + cmdConvertService.PARA_SEPARATOR + returnMacro, 'g'), "DEFINE_SIMPLE_VAR" + cmdConvertService.PARA_SEPARATOR + "%" + macro.length + "%");
						*/
						macro.push('^' + returnMacro);
					}
					var subScriptBegCmd = cmdConvertService.SUBSCRIPT_BEGIN + cmdConvertService.PARA_SEPARATOR;
					var subScriptEndCmd = cmdConvertService.SUBSCRIPT_END;
					scriptContent = subScriptBegCmd + scriptContent + subScriptEndCmd;
				}

				if (selectionManager.selectedNodeType === 'testcase') {
					//	var testcaseBegCmd = "TESTCASE_BEGIN" + cmdConvertService.PARA_SEPARATOR + selectionManager.selectedNodeId() + cmdConvertService.CMD_SEPARATOR;
					var testcaseBegCmd = "TESTCASE_BEGIN" + cmdConvertService.CMD_SEPARATOR;
					var testcaseEndCmd = "TESTCASE_END";
					scriptContent = testcaseBegCmd + scriptContent
						+ testcaseEndCmd;
				}
				self.currentScript.script(scriptContent);
				var xmlDom = Blockly.Xml.workspaceToDom(self.workspace);
				//var xml = Blockly.Xml.domToPrettyText(xmlDom);
				var xml = Blockly.Xml.domToText(xmlDom);
				self.currentScript.blockyXml(xml);
				if (selectionManager.selectedNodeType === 'testcase')
					self.utpService.updateFullScript(komapping.toJS(self.currentScript), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
				else if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					var selectedScript = {
						id: self.currentScript.id(),
						customizedId: self.currentScript.customizedId(),
						name: self.currentScript.name(),
						description: self.currentScript.description(),
						projectId: self.currentScript.projectId(),
						parentScriptGroupId: self.currentScript.parentScriptGroupId(),
						script: self.currentScript.script(),
						type: self.currentScript.type(),
						blockyXml: self.currentScript.blockyXml(),
						parameter: JSON.stringify(macro),
						customizedFields: self.currentScript.customizedFields()
					}
					self.utpService.updateFullSubScript(selectedScript, self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
				}
				return true;
			};

			this.saveTextScript = function () {
				var scriptContent = self.scriptEditor.getValue().trim();
				scriptContent = cmdConvertService.txtToScript(scriptContent);
				if (selectionManager.selectedNodeType === 'testcase') {
					var testcaseBegCmd = cmdConvertService.TESTCASE_BEGIN + cmdConvertService.CMD_SEPARATOR;
					var testcaseEndCmd = cmdConvertService.TESTCASE_END;
					scriptContent = testcaseBegCmd + scriptContent + testcaseEndCmd;
				}
				var macro = [];
				if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					if (!scriptContent.startsWith(self.currentScript.name())) {
						notificationService.showError('子脚本定义不存在！');
						return false;
					}
					/*var scriptDef = scriptContent.substring(0, scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
					scriptDef = scriptDef.replace(self.currentScript.name() + cmdConvertService.PARA_SEPARATOR, '').replace(new RegExp("%", 'g'), "");
					macro = scriptDef.split(',');*/
					scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR) + 2);
					/*for(var i = 0; i < macro.length; i++){
						if(macro[i].startsWith('^')){
							var returnMacro =  macro[i].replace('^', '');
							scriptContent = scriptContent.replace(new RegExp("\\$" + returnMacro + '\b', 'g'), "$%" + i + "%" + '\b');
							scriptContent = scriptContent.replace(new RegExp("\\^" + returnMacro+ '\b', 'g'), "^%" + i + "%" + '\b');
							scriptContent = scriptContent.replace(new RegExp("SETVAL" + cmdConvertService.PARA_SEPARATOR + returnMacro + cmdConvertService.PARA_SEPARATOR, 'g'), "SETVAL" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%" + cmdConvertService.PARA_SEPARATOR);
							scriptContent = scriptContent.replace(new RegExp("UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + returnMacro + cmdConvertService.PARA_SEPARATOR, 'g'), "UPDATEVAR" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%" + cmdConvertService.PARA_SEPARATOR);
							scriptContent = scriptContent.replace(new RegExp("SETARRY" + cmdConvertService.PARA_SEPARATOR + returnMacro + cmdConvertService.PARA_SEPARATOR, 'g'), "SETARRY" + cmdConvertService.PARA_SEPARATOR + "%" + i + "%" + cmdConvertService.PARA_SEPARATOR);
						}
						else
							scriptContent = scriptContent.replace(new RegExp("%" + macro[i] + "%", 'g'), "%" + i + "%");
					}*/
					var subScriptBegCmd = cmdConvertService.SUBSCRIPT_BEGIN + cmdConvertService.PARA_SEPARATOR;
					var subScriptEndCmd = cmdConvertService.SUBSCRIPT_END;
					scriptContent = subScriptBegCmd + scriptContent + subScriptEndCmd;
				}
				scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR + "\n", 'g'), cmdConvertService.CMD_SEPARATOR);
				self.currentScript.script(scriptContent);
				var xmlDom = Blockly.Xml.workspaceToDom(self.workspace);
				var xml = Blockly.Xml.domToText(xmlDom);
				self.currentScript.blockyXml(xml);
				if (selectionManager.selectedNodeType === 'testcase')
					self.utpService.updateFullScript(komapping.toJS(self.currentScript), self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
				else if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					var selectedScript = {
						id: self.currentScript.id(),
						customizedId: self.currentScript.customizedId(),
						name: self.currentScript.name(),
						description: self.currentScript.description(),
						projectId: self.currentScript.projectId(),
						parentScriptGroupId: self.currentScript.parentScriptGroupId(),
						script: self.currentScript.script(),
						type: self.currentScript.type(),
						blockyXml: self.currentScript.blockyXml(),
						parameter: JSON.stringify(macro)
					}
					self.utpService.updateFullSubScript(selectedScript, self.updateScriptSuccessFunction, self.updateScriptErrorFunction);
				}
				return true;
			};

			this.saveScript = function () {
				//解决点击测试集执行后,selectionManager.selectedNodeType发生变化,再返回用例时无法保存
				selectionManager.selectedNodeType = self.currentScript.type();
				if (self.commandMode()) {
					if (!self.saveTextScript())
						return;
				}
				else {
					if (!self.saveBlockScript())
						return;
				}
				var requirmentIds = cmdConvertService.requirementIdAnalysis(self.currentScript.script());
				var ids = [];
				requirmentIds.forEach(function (id) {
					if (self.projectManager.getRequirement(id) != null)
						ids.push(Number(id));
				});
				var obj = {
					projectId: self.currentScript.projectId(),
					scriptId: self.currentScript.id(),
					requirementIdsWithCommaSeperator: ids.join(",")
				}
				self.scriptRequirementMapping = {
					scriptId: self.currentScript.id(),
					requirementIds: ids
				};
				self.utpService.updateRequirementScriptMapping(obj, self.updateRequirementScriptMappingSuccessFunction, self.updateRequirementScriptMappingErrorFunction);
			};

			this.updateRequirementScriptMappingSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					if (self.scriptRequirementMapping)
						self.projectManager.updateScriptRequirementMapping(self.scriptRequirementMapping.scriptId, self.scriptRequirementMapping.requirementIds);
					//	notificationService.showSuccess('检查点关联更新成功');
				}
				else
					self.updateRequirementScriptMappingErrorFunction();
			};

			this.updateRequirementScriptMappingErrorFunction = function () {
				notificationService.showError('检查点关联更新失败');
			};

			this.showScriptInStepsView = function () {
				self.disableScriptEdit();
				self.overWriteText();
				var scriptContent = Blockly.AntScript.workspaceToCode(self.workspace);

				//判断scriptContent字符串最后是否有两个相同的cmdConvertService.CMD_SEPARATOR字符串,如果有两个相同的cmdConvertService.CMD_SEPARATOR字符串则去除一个
				var cmdSeparator = cmdConvertService.CMD_SEPARATOR;
				var cmdSeparatorLength = cmdSeparator.length;
				if (scriptContent.endsWith(cmdSeparator + cmdSeparator)) {
					scriptContent = scriptContent.substring(0, scriptContent.length - cmdSeparatorLength);
				}
				var steps = "\n";
				if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
					var topBlocks = self.getTopBlocks();
					if (topBlocks.length > 0 && topBlocks[0].type == "procedures_defscript") {
						steps += "子脚本:" + self.currentScript.name();
						var macro = topBlocks[0].arguments_;
						if (macro != null && macro.length > 0)
							steps += " 参数：" + JSON.stringify(macro);
						steps += "\n\n";
						scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
					}
				}
				scriptContent = cmdConvertService.generatecmdStepList(scriptContent, true);
				scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), '\n');
				steps += scriptContent;
				self.scriptInTestSteps(steps);
			};

			this.UtpCmdsToSeqDiagramString = function (utpCommandsString) {
				var sequenceDiagramStr = cmdConvertService.generatecmdStepList(utpCommandsString, false);
				return sequenceDiagramStr;
			}

			this.updateEditor = function (cmd) {
				var cursorPosition = self.scriptEditor.getCursorPosition();
				self.scriptEditor.session.insert(cursorPosition, cmd);
				//self.scriptEditor.insert("Something cool");
			};

			this.insertParaSeparator = function () {
				self.updateEditor(cmdConvertService.PARA_SEPARATOR);
			};

			this.insertCmdSeparator = function () {
				self.updateEditor(cmdConvertService.CMD_SEPARATOR);
			};

			this.showScriptInSequenceView = function () {
				self.disableScriptEdit();
				self.overWriteText();
				if (self.blockyConvertedFlag)
					return;
				self.busyPropInfo("converting to sequence diagram ...");
				$('#waitingModal').modal('show');
				setTimeout(
					function () {
						var scriptContent = '';
						if (self.commandMode()) {
							scriptContent = self.scriptEditor.getValue().trim();
							scriptContent = cmdConvertService.txtToScript(scriptContent);
							if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock') {
								if (scriptContent.startsWith(self.currentScript.name()))
									scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR) + 2);
							}
						}
						else {
							var scriptContent = Blockly.AntScript
								.workspaceToCode(self.workspace);
							// 去除末尾的换行符
							scriptContent = scriptContent.trimEnd();
							//判断scriptContent字符串最后是否有两个相同的cmdConvertService.CMD_SEPARATOR字符串,如果有两个相同的cmdConvertService.CMD_SEPARATOR字符串则去除一个
							var cmdSeparator = cmdConvertService.CMD_SEPARATOR;
							var cmdSeparatorLength = cmdSeparator.length;
							if (scriptContent.endsWith(cmdSeparator + cmdSeparator)) {
								scriptContent = scriptContent.substring(0, scriptContent.length - cmdSeparatorLength);
							}
							//添加换行符
							scriptContent = scriptContent.replace(new RegExp(cmdSeparator, 'g'), cmdSeparator + '\n');
							if (selectionManager.selectedNodeType === 'usrlogicblock' || selectionManager.selectedNodeType === 'syslogicblock')
								scriptContent = scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
							try {
								var sequencediagramStr = self.UtpCmdsToSeqDiagramString(scriptContent);
								sequencediagramStr = sequencediagramStr.replace(new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), '\n');
								var diagram = Diagram.parse(sequencediagramStr);
								$('#diagram').html('');
								diagram.drawSVG("diagram", {
									theme: 'hand'
								});
								var a = $('#download');
								a
									.click(function (ev) {
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
							} catch (e) {
								self.blockyConvertedFlag = false;
								notificationService.showError('交互图生成错误！');
								console.log(e);
							} finally {
								$('#waitingModal').modal('hide');
							}
						}
					}, 1000);
			};

			this.subScriptNameProcess = function (blocklyXml) {
				var startFieldOfScriptID = '<field name="SCRIPTID">';
				var startFieldOfScriptName = '<field name="SCRIPTNAME">';
				var endField = '</field>';

				var scriptIdStartIndex = blocklyXml.indexOf(startFieldOfScriptID);

				while (scriptIdStartIndex >= 0) {
					var scriptIdEndIndex = blocklyXml.indexOf(endField, scriptIdStartIndex);

					var subScriptId = blocklyXml.substring(scriptIdStartIndex + startFieldOfScriptID.length, scriptIdEndIndex);
					var subScript = self.projectManager.getSubScript(subScriptId);
					var subScriptName = "未知脚本";
					if (subScript != undefined && subScript != null)
						subScriptName = subScript.value;

					var scriptNameStartIndex = blocklyXml.lastIndexOf(startFieldOfScriptName, scriptIdStartIndex);
					var scriptNameEndIndex = blocklyXml.lastIndexOf(endField, scriptIdStartIndex);
					blocklyXml = blocklyXml.substring(0, scriptNameStartIndex + startFieldOfScriptName.length) + subScriptName + blocklyXml.substring(scriptNameEndIndex);
					scriptIdStartIndex = blocklyXml.indexOf(startFieldOfScriptID, scriptIdEndIndex);
				}

				return blocklyXml;
			}

			this.initScriptEditor = function (scriptContent) {
				scriptContent = cmdConvertService.scriptToTxt(scriptContent);
				//scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), cmdConvertService.CMD_SEPARATOR + '\n');					
				self.scriptEditor.setValue(scriptContent); //self.scriptEditor.session.setValue("the new text here");
			};

			this.overWriteText = function () {
				var scriptContent = Blockly.AntScript.workspaceToCode(self.workspace);
				var scriptDef = scriptContent.substring(0, scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
				//scriptDef = scriptDef.replace(new RegExp("%", 'g'), "");
				scriptContent = scriptDef + scriptContent.substring(scriptContent.indexOf(cmdConvertService.CMD_SEPARATOR));
				// 去除末尾的换行符
				scriptContent = scriptContent.trimEnd();
				//判断scriptContent字符串最后是否有两个相同的cmdConvertService.CMD_SEPARATOR字符串,如果有两个相同的cmdConvertService.CMD_SEPARATOR字符串则去除一个
				var cmdSeparator = cmdConvertService.CMD_SEPARATOR;
				var cmdSeparatorLength = cmdSeparator.length;
				if (scriptContent.endsWith(cmdSeparator + cmdSeparator)) {
					scriptContent = scriptContent.substring(0, scriptContent.length - cmdSeparatorLength);
				}
				//添加换行符
				scriptContent = scriptContent.replace(new RegExp(cmdSeparator, 'g'), cmdSeparator + '\n');
				self.currentScript.script(scriptContent);
				self.initScriptEditor(scriptContent);
			};

			this.initBlockScript = function (script) {
				if ((script.blockyXml === null || script.blockyXml === '') && script.type != "subscript") {
					var dom = null;
					if (script.script == null) {
						self.showScriptInStepsView();
						return;
					}
					var scriptContent = self.initTextScript(script.name, script.script, script.parameter);
					if (selectionManager.selectedNodeType === 'subscript')
						dom = Blockly.Xml.subScriptToDom(scriptContent, self.workspace);
					else
						dom = Blockly.Xml.scriptToDom(scriptContent, self.workspace);
					var xml = Blockly.Xml.domToPrettyText(dom);
					script.blockyXml = xml;
				}
				if (script.blockyXml != null && script.blockyXml != '') {
					if (selectionManager.selectedNodeType === 'subscript') {
						var re = new RegExp(cmdConvertService.SUB_SCRIPT_NAME_REGEX);
						script.blockyXml = script.blockyXml.replace(re, '<field name="SCRIPTNAME">' + self.currentScript.name() + '</field>');
					}
					script.blockyXml = self.subScriptNameProcess(script.blockyXml);
					var dom2 = Blockly.Xml.textToDom(script.blockyXml);
					Blockly.Xml.domToWorkspace(dom2, self.workspace);
				}
				else if (selectionManager.selectedNodeType === 'subscript') {
					var initScriptXml = cmdConvertService.STARTER_SUB_BLOCK_XML_TEXT.replace(/XXXX/, self.currentScript.name());
					var xml = Blockly.Xml.textToDom(initScriptXml);
					Blockly.Xml.domToWorkspace(xml, self.workspace);
				}
				self.showScriptInStepsView();
			};

			this.initTextScript = function (scriptName, scriptContent, paraStr) {
				if (selectionManager.selectedNodeType === 'subscript') {
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.SUBSCRIPT_BEGIN + cmdConvertService.PARA_SEPARATOR, 'g'), "");
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.SUBSCRIPT_END, 'g'), "");
					var scriptDef = scriptName;
					if (paraStr) {
						var parameters = JSON.parse(paraStr);
						if (parameters && parameters.length > 0) {
							/*if(scriptContent){
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
							}*/
							scriptDef = scriptDef + cmdConvertService.PARA_SEPARATOR + parameters.join(cmdConvertService.PARA_SEPARATOR);
						}
					}
					if (scriptContent)
						scriptContent = scriptDef + cmdConvertService.CMD_SEPARATOR + scriptContent;
					else
						scriptContent = scriptDef + cmdConvertService.CMD_SEPARATOR;
				}
				else if (selectionManager.selectedNodeType === 'testcase' && scriptContent != null) {
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.TESTCASE_BEGIN + cmdConvertService.CMD_SEPARATOR, 'g'), "");
					scriptContent = scriptContent.replace(new RegExp(cmdConvertService.TESTCASE_END, 'g'), "");
				}
				return scriptContent;
			};

			this.getScriptSuccessFunction = function (data) {
				if (data && data.status === 1 && data.result) {
					var script = data.result;
					self.currentScript.id(script.id);
					self.currentScript.customizedId(script.customizedId);
					self.currentScript.projectId(script.projectId);
					self.currentScript.name(script.name);
					self.currentScript.parentScriptGroupId(script.parentScriptGroupId);
					self.currentScript.description(script.description);
					self.currentScript.script(script.script);
					self.currentScript.blockyXml(script.blockyXml);
					self.currentScript.type(script.type);
					var customizedFields = script.customizedFields;
					if (customizedFields)
						self.currentScript.customizedFields(script.customizedFields);
					else
						self.currentScript.customizedFields('');
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

					if (script.script != null) {
						var scriptContent = '';
						if (script.script.startsWith("SUBSCRIPT_BEGIN```")) {
							scriptContent = script.script.replace(new RegExp("^SUBSCRIPT_BEGIN```"), "")
							scriptContent = scriptContent.replace(new RegExp("óòSUBSCRIPT_END$"), "");
							if (scriptContent.endsWith("óòóò\n")) {
								scriptContent = scriptContent.replace(new RegExp("óòóò\n$"), "");
							}
						} else {
							scriptContent = self.initTextScript(script.name, script.script, script.parameter);
							if (scriptContent.endsWith("óòóò\n")) {
								scriptContent = scriptContent.replace(new RegExp("óòóò\n$"), "");
							}
						}
						self.currentScript.script(scriptContent);
						self.initScriptEditor(scriptContent);
						self.lastscriptStr = scriptContent;
					} else {
						self.lastscriptStr = '';
					}
					self.initBlockScript(script);
					self.blockNumberUpdate(0);
				}
				else
					self.getScriptErrorFunction();
			};

			this.initScriptCustomizedField = function (scriptCustomizedFields, scriptCustomizedField) {
				var candidateValue = []
				try {
					candidateValue = JSON.parse(scriptCustomizedField)
				}
				catch (e) {
					candidateValue = []
				}
				if (scriptCustomizedFields) {
					for (var i = 0; i < scriptCustomizedFields.length; i++) {
						var exist = false;
						for (var j = 0; j < candidateValue.length; j++) {
							if (scriptCustomizedFields[i] === candidateValue[j].name) {
								exist = true;
								break;
							}
						}
						if (!exist)
							candidateValue.push({ name: scriptCustomizedFields[i], value: '' })
					}
				}
				return candidateValue;
			};

			this.getScriptErrorFunction = function () {
				if (selectionManager.selectedNodeType == 'testcase')
					notificationService.showError('获取测试用例信息失败');
				else
					notificationService.showError('获取子脚本信息失败');
			};

			this.initRequirementReference = function () {
				self.disableScriptEdit();
				$('#requirement_reference').html('');
				webix.ui({
					container: "requirement_reference",
					view: "list",
					id: "req_reference",
					tooltip: function (obj) {
						return "<span style='display:inline-block;max-width:300;word-wrap:break-word;white-space:normal;'>" + obj.value + "</span>";
					},
					height: 250,
					width: 450,
					data: self.projectManager.getRequirementReferenceOfScript(selectionManager.selectedNodeId())
				});
			};

			// this.blocklyAuth = function () {
			// 	// 监听工具箱加载完成事件
			// 	self.workspace.registerToolboxCategoryCallback(function (workspace, category) {
			// 		// 遍历工具箱中的所有类别
			// 		const toolboxCategories = document.querySelectorAll('category');
			// 		toolboxCategories.forEach(categoryElement => {
			// 			const enablelevel = categoryElement.getAttribute('enablelevel');
			// 			if (enablelevel) {
			// 				console.log(`Category: ${categoryElement.getAttribute('name')}, EnableLevel: ${enablelevel}`);
			// 				// 根据 EnableLevel 的值进行逻辑处理
			// 				if (enablelevel === '11') {
			// 					// 执行特定逻辑，例如启用或禁用某些功能
			// 					console.log('EnableLevel is 11, performing specific actions...');
			// 				}
			// 			}
			// 		});
			// 	});
			// }

			this.loadFromFile = function (file) {
				self.selectedFile = file;
			};

			this.importScript = function () {
				if (self.selectedFile === null) {
					notificationService.showError('请选择脚本文件！');
					return;
				}
				var reader = new FileReader();
				reader.readAsText(self.selectedFile, "UTF-8");
				reader.onload = function (evt) {
					var scriptContent = evt.target.result;
					self.scriptEditor.setValue(scriptContent);
					self.cancelImportScript();
				}
			};

			this.importScriptConfirm = function () {
				self.importScript();
			};

			this.cancelImportScript = function () {
				$('#scriptImportModal').modal('hide');
			};

			this.enterImportScriptMode = function () {
				self.selectedFile = null;
				$('#scriptImportModal').modal('show');
			};

			this.exportScript = function () {
				try {
					var txt = cmdConvertService.scriptToTxt(self.currentScript.script());
					var blob = new Blob([txt]);
					var a = document.createElement("a");
					a.download = self.currentScript.name() + ".txt";
					a.href = URL.createObjectURL(blob);
					$("body").append(a);
					a.click();
				}
				catch {
					notificationService.showError('导出用例失败');
				}
			};

			this.customField = ko.observable(true);
			this.initCustomizedField = function () {
				$('#dataview_edit').html('');
				var scriptCustomizedFields = self.projectManager.getProjectScriptCustomizedFieldMapping(selectionManager.selectedProject().id);
				var scriptCustomizedFieldConfig = []
				try {
					scriptCustomizedFieldConfig = JSON.parse(scriptCustomizedFields)
				}
				catch (e) {
					scriptCustomizedFieldConfig = []
				}
				var candidateScriptCustomizedFields = self.initScriptCustomizedField(scriptCustomizedFieldConfig, self.currentScript.customizedFields());
				if (candidateScriptCustomizedFields.length > 0) {
					self.customField(true);
					//清空customizedFieldDiv里面的内容
					$('#customizedFieldDiv').html('');
					webix.protoUI({
						name: "dataview_edit"
					}, webix.EditAbility, webix.ui.dataview);

					webix.ui({
						view: "dataview_edit",
						id: "script_customizedField",
						container: "customizedFieldDiv",
						template: " <div class='webix_strong' style='width: 100%'>#name#: <input type='text' style='width: 80%;height: 80%;' value='#value#'></div>",
						data: candidateScriptCustomizedFields,
						editable: true,
						editor: "text",
						editValue: "value",
						type: {
							height: 50,
							width: 500,
						},
						width: 750,
						height: 250
					});
					$$("script_customizedField").show();
					//$$("customizedFieldDiv").clearAll();
					// $$("customizedFieldDiv").parse(candidateScriptCustomizedFields);
				} else {
					self.customField(false);
					//如果为空,则隐藏字段
				}
			};

			this.initTrigger = function (currentstate) {
				$('#scripEditingtModeInput').bootstrapSwitch("state", currentstate);
				$('#scripEditingtModeInput').on('switchChange.bootstrapSwitch', function (event, state) {
					self.commandMode(state);
					if (!state) {
						self.enableBlockScriptEdit();
						self.textEdit = false;
					}
					else {
						self.overWriteText(); //$('#changeEditorModal').modal('show');
						self.textEdit = true;
					}
					setTimeout(function () {
						//self.testcaseSavedFlag(true);
					}, 100);
				});
			};

			this.initBasicInfo = function () {
				self.initRequirementReference();
				self.initCustomizedField();
			};

			this.activate = function () {
				self.blockInitHappened = false;
				self.blockyConvertedFlag = false;
				self.updated = false;
				self.testcaseSavedFlag(true);
				self.commandMode(false);
				self.scriptInTestSteps([]);
				self.isTestcase = selectionManager.selectedNodeType == 'testcase';
				if (selectionManager.selectedNodeType == 'testcase')
					self.utpService.getFullScript(selectionManager.selectedProject().id, selectionManager.selectedNodeId(), self.getScriptSuccessFunction, self.getScriptErrorFunction);
				else
					self.utpService.getFullSubScript(selectionManager.selectedProject().id, selectionManager.selectedNodeId(), self.getScriptSuccessFunction, self.getScriptErrorFunction);
			};

			this.closeBlock = function (xmlId) {
				var toolbox1 = document.getElementById(xmlId);
				// 按照分类进行过滤
				var categories = toolbox1.getElementsByTagName('category');
				for (var i = 0; i < categories.length; i++) {
					var enableLevel = categories[i].getAttribute('enablelevel');
					if (enableLevel && parseInt(enableLevel) > self.auth) {
						categories[i].parentNode.removeChild(categories[i]);
					}
				}

				// 按照块进行过滤
				var blocks = toolbox1.getElementsByTagName('block');
				for (var i = 0; i < blocks.length; i++) {
					var enableLevel = blocks[i].getAttribute('enablelevel');
					if (enableLevel && parseInt(enableLevel) > self.auth) {
						blocks[i].parentNode.removeChild(blocks[i]);
					}
				}
				// cmdConvertService.engineCmdList // 系统命令列表
				// console.log(window.sysCmdToDom("LOGIC"))
			}

			this.attached = function (view, parent) {
				var commandConfig = self.systemConfig.getValueByFeatureName('utpclient.testcommand.max_enable_level') || {};
				var hideDisabledCmd = typeof commandConfig.hideDisabledCmd === 'boolean'
					? commandConfig.hideDisabledCmd
					: false; // 无配置时默认不隐藏
				self.auth = typeof commandConfig.value === 'number' ? commandConfig.value : 0; // 类型检查+默认值
				self.commandDisplay = !hideDisabledCmd; // 反转布尔值
				// 关闭工具箱中不符合权限的块
				self.closeBlock('toolbox-categories'); //用例
				self.closeBlock('toolbox-categories-subscript'); //子脚本
				self.disableScriptEdit();
				self.initRequirementReference();
				self.initTrigger(false);
				self.start();
				self.initTextEditor();
				$('#insertCommandModal').on('shown.bs.modal', function () {
					self.showRecordListFromSelectedAgent();
				});
				$('#insertScriptModal').on('shown.bs.modal', function (e) {
					self.selectScriptFunType('0');
					self.initSubScriptTree(e.relatedTarget.data);
					//	self.getProjectSubScript();						
				});
				$('#antbotScriptModal').on('shown.bs.modal', function (e) {
					self.selectScriptFunType('0');
					self.initSubScriptTree(e.relatedTarget.data);
				});
				$('#insertCheckPointModal').on('shown.bs.modal', function (e) {
					self.initCheckPointTree(e.relatedTarget.data);
				});
				$('#genericProtocolFieldSettingModal').on('shown.bs.modal', function (e) {
					self.initGenericProtocolTree(e.relatedTarget.data);
				});
				$('#scriptImportModal').on('shown.bs.modal', function () {
					var file = document.getElementById("scriptInputFile");
					file.value = "";
					$('#scriptImportForm').validator().off('submit');
					$('#scriptImportForm').validator('destroy').validator();
					$('#scriptImportForm').validator().on('submit', function (e) {
						if (e.isDefaultPrevented()) {
							// handle the invalid form...
						} else {
							e.preventDefault();
							self.importScriptConfirm();
						}
					});
				});
			};

			this.detached = function () {
				self.workspace.removeChangeListener(blockyChangedEvent);
				self.projectManager.previousEditedScript = komapping.toJS(self.currentScript);
			}
		}
		return new PlaygroundViewModel();
	});
