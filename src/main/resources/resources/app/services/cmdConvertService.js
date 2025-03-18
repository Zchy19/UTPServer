define(['knockout', 'jquery', 'services/ursService', 'services/projectManager', 'services/systemConfig'], function (ko, $, ursService, projectManager, systemConfig) {

	function cmdConvertService() {
		var self = this;
		this.projectManager = projectManager;
		this.systemConfig = systemConfig;
		this.CMD_SEPARATOR = 'óò';
		this.PARA_SEPARATOR = '```';
		this.EMPTY_ENCODER = "%20";
		this.RETURN_ENCODER = "%0A"
		this.STARTER_SUB_BLOCK_XML_TEXT = '<xml>' +
			'<block type="procedures_defscript" deletable="false" movable="false">' +
			'<field name="SCRIPTNAME">XXXX</field>' +
			'<field name="PARAMS"></field>' +
			'</block></xml>';
		this.SUB_SCRIPT_NAME_REGEX = '<field name="SCRIPTNAME">([^<]+?)</field>';
		this.SUB_SCRIPT_ID_REGEX = '<field name="SCRIPTID">([^<]+?)</field>';
		this.SUBSCRIPT_DEF = 'CALL_SCRIPT';
		this.GET_SCRIPT_CONTENT = 'GET_SCRIPT_CONTENT';
		this.CHECKPOINT_BEGIN = 'CHECKPOINT_BEGIN';
		this.CHECKPOINT_END = 'CHECKPOINT_END';
		this.TESTCASE_BEGIN = 'TESTCASE_BEGIN';
		this.TESTCASE_END = 'TESTCASE_END';
		this.bigDataIdLabel = 'BigDataID';
		this.SUBSCRIPT_BEGIN = 'SUBSCRIPT_BEGIN';
		this.SUBSCRIPT_END = 'SUBSCRIPT_END';
		this.descriptionLength = 60;
		this.agentCmdList = [];
		this.agentCmdExpandList = [];
		this.engineCmdList = [];
		this.engineCmdExpandList = [];
		this.maxReuslt = 500;
		this.monotorDataMaxResult = 1000
		this.transformConfig = [
			{
				"commuPath": "server",
				"dataTypes": [
				]
			},
			{
				"commuPath": "client",
				"dataTypes": [
				]
			}
		]
		this.testResult = {
			unCompleted: '-1',
			failed: '0',
			timeOut: '2',
			other: '3',
			pass: '1',

		};
		this.manualDecisionLevel = {
			"manualDecisionLevel0": '未判别',
			"manualDecisionLevel1": 'A',
			"manualDecisionLevel2": 'B',
			"manualDecisionLevel3": 'C',
			"manualDecisionLevel4": 'D',
			"manualDecisionLevel5": 'E'
		};

		this.antbotExtraCofig = {
			common: 0,
			recordset: 1,
			busInterfaceDef: 2,
			signalConfigTable: 3
		}

		this.commandType = {
			exceptionBegin: -1,
			exceptionEnd: -2,
			testCaseBegin: 2,
			testCaseEnd: 8,
			executionBegin: 1,
			executionEnd: 9,
			checkPointBegin: 3,
			checkPointEnd: 7,
			executionCommand: 5,
			subscriptBegin: 4,
			subscriptEnd: 6
		};

		this.eol = '\n';
		this.antKeywordText = [
			{ name: 'sin', value: 'sin()', caption: 'sin', type: 'local', meta: "math" },
			{ name: 'cos', value: 'cos()', caption: 'cos', type: 'local', meta: "math" },
			{ name: 'tan', value: 'tan()', caption: 'tan', type: 'local', meta: "math" },
			{ name: 'asin', value: 'asin()', caption: 'asin', type: 'local', meta: "math" },
			{ name: 'acos', value: 'acos()', caption: 'acos', type: 'local', meta: "math" },
			{ name: 'atan', value: 'atan()', caption: 'atan', type: 'local', meta: "math" },
			{ name: 'power', value: 'power()', caption: 'power', type: 'local', meta: "math" },
			{ name: 'abs', value: 'abs()', caption: 'abs', type: 'local', meta: "math" },
			{ name: 'log', value: 'log()', caption: 'log', type: 'local', meta: "math" },
			{ name: 'log10', value: 'log10()', caption: 'log10', type: 'local', meta: "math" },
			{ name: 'exp', value: 'exp()', caption: 'exp', type: 'local', meta: "math" },
			{ name: 'sqrt', value: 'sqrt()', caption: 'sqrt', type: 'local', meta: "math" }
		];

		this.antSnippetText = [
			"snippet while",
			"	WHILE_BEGIN```${1:condition}óò",
			"		${2:expression}óò",
			"	WHILE_ENDóò",
			"snippet async",
			"	ASYNC_BEGINóò",
			"		${1:expression}óò",
			"	ASYNC_ENDóò",
			"snippet if",
			"	IF_BEGIN```${1:condition}óò",
			"		${2:expression}óò",
			"	IF_ENDóò",
			"snippet for",
			"	FOR_BEGIN```${1:i}```${2:from}```${3:to}óò",
			"		${4:expression}óò",
			"	FOR_ENDóò",
			"snippet checkpoint",
			"	CHECKPOINT_BEGIN```${1:checkpointId}óò",
			"		${2:expression}óò",
			"	CHECKPOINT_ENDóò",
			"snippet subscript",
			"	CALL_SCRIPT```${1:subscriptId}óò",
			"snippet getSubscript",
			"	GET_SCRIPT_CONTENT```${1:subscriptId}óò",
			"snippet foreach",
			"	FOREACH_BEGIN```${1:obj}```${2:list}óò",
			"		${3:expression}óò",
			"	FOREACH_ENDóò",
			"snippet setCurTime",
			"	SET_CURTIME```${1:var}óò",
			"snippet monitor",
			"	MONITORDATA```${1:var}óò",
			"snippet regexMatch",
			"	REGEX_MATCH```${1:str}```${2:regex}```${3:varResult}óò",
			"snippet regexCmp",
			"	REGEX_CMP```${1:str}```${2:regex}óò",
			"snippet stringCmp",
			"	STRING_CMP```${1:str1}```${2:str2}```${3:caseSensitive}óò",
			"snippet logic",
			"	LOGIC```${1:boolExpression}óò",
			"snippet wait",
			"	WAIT```${1:time}óò",
			"snippet setBinary",
			"	SETBINARY```${1:var}```${3:binary}óò",
			"snippet setArray",
			"	SET_ARRAY```${1:arrayVar}óò",
			"snippet updateVal",
			"	UPDATE_VAR```${1:var}```${2:value}óò",
			"snippet setVal",
			"	SET_VAR```${1:var}```${2:value}óò",
			""
		].join(self.eol);

		this.txtToScript = function (str) {
			var script = str.trim();
			script = script.replace(new RegExp('\r\n', 'g'), self.CMD_SEPARATOR);
			script = script.replace(new RegExp('\n', 'g'), self.CMD_SEPARATOR);
			script = script.replace(new RegExp(' ', 'g'), self.PARA_SEPARATOR);
			script = script.trim().replace(new RegExp('%20', 'g'), ' ');
			script = script.trim().replace(new RegExp('%0A', 'g'), '\n');
			return script;
		};

		this.scriptToTxt = function (str) {
			var script = str.trim();
			script = script.replace(new RegExp(self.CMD_SEPARATOR + '\r\n*', 'g'), self.CMD_SEPARATOR);
			script = script.replace(new RegExp(self.CMD_SEPARATOR + '\n*', 'g'), self.CMD_SEPARATOR);
			script = script.trim().replace(new RegExp(' ', 'g'), '%20');
			script = script.trim().replace(new RegExp('\n', 'g'), '%0A');
			script = script.replace(new RegExp(self.CMD_SEPARATOR, 'g'), '\n');
			script = script.replace(new RegExp(self.PARA_SEPARATOR, 'g'), ' ');
			return script;
		};

		this.requirementIdAnalysis = function (script) {
			var ids = [];
			if (script) {
				var index = script.indexOf("CHECKPOINT_BEGIN");
				while (index >= 0) {
					script = script.slice(index + "CHECKPOINT_BEGIN".length + self.PARA_SEPARATOR.length);
					cmdIndex = script.indexOf(self.CMD_SEPARATOR);
					var id = script.slice(0, cmdIndex);
					if (id)
						ids.push(id);
					index = script.indexOf("CHECKPOINT_BEGIN");
				}
			}
			return ids;
		};

		// level1: agentType; level2: commandname; level3: lang; level4:formattedCommandString;
		this.agentTypeDefinitionDictionary = {};
		//used to store engine command list
		this.engineCmdDictionary = {};

		this.clear = function () {
			self.agentTypeDefinitionDictionary = {};
			self.engineCmdDictionary = {};
		};

		this.decorateAgentName = function (agentName) {
			return "[[" + agentName + "]]";
		}

		this.recorverAgentName = function (agentName) {
			var regex = /\[{2}(.+)(\]{2})$/gm;
			var matchList = regex.exec(agentName);
			if (matchList == null)
				return agentName;
			return matchList[1];
		};
		this.executionResultStepListWebsocket = function (data) {
			let tempResultArray = [];
			//获取result
			let resultArray = JSON.parse(data.result);
			//遍历resultArray
			for (let i = 0; i < resultArray.length; i++) {
				let tempResult = {
					"resultId": 0,
					"scriptId": 0,
					"antbotName": "",
					"commandType": "",
					"executionTime": "",
					"command": "",
					"result": "",
					"errorMessage": "",
					"parentId": "",
					"indexId": ""
				};
				let notifContentArray = resultArray[i].notifContent
				if (resultArray[i].notifType == 1) {
					tempResult.commandType = 1;
					tempResult.executionTime = notifContentArray[notifContentArray.length - 1];
					tempResult.result = 1;
				} else if (resultArray[i].notifType == 2) {
					tempResult.commandType = 9;
					tempResult.executionTime = notifContentArray[notifContentArray.length - 1];
					if (notifContentArray[0] == "success") {
						tempResult.result = 1;
					} else {
						tempResult.result = 0;
					}

				} else if (resultArray[i].notifType == 3) {
					tempResult.commandType = 2;
					tempResult.executionTime = notifContentArray[notifContentArray.length - 1];
					tempResult.result = 1;
					tempResult.command = notifContentArray[0];
					tempResult.scriptId = notifContentArray[0];
				} else if (resultArray[i].notifType == 4) {
					tempResult.commandType = 8;
					tempResult.command = notifContentArray[0]
					tempResult.executionTime = notifContentArray[notifContentArray.length - 1];
					tempResult.scriptId = notifContentArray[0];
					if (notifContentArray[1] == "success") {
						tempResult.result = 1;
					} else {
						tempResult.result = 0;
					}
				} else if (resultArray[i].notifType == 7) {
					tempResult.commandType = 4;
					tempResult.executionTime = notifContentArray[notifContentArray.length - 1];
					tempResult.indexId = notifContentArray[1];
					let parentId = "-1";
					if (notifContentArray[1].includes("-")) {
						// 去除最后一个斜杠和其后面的内容
						parentId = notifContentArray[1].substring(0, notifContentArray[1].lastIndexOf("-"));
					}
					tempResult.parentId = parentId;
					tempResult.scriptId = notifContentArray[0];
					tempResult.antbotName = "__EXTDEV__";
					tempResult.command = notifContentArray[3] + "```" + notifContentArray[4];
					tempResult.result = 1;
				} else if (resultArray[i].notifType == 8) {
					tempResult.commandType = 5;
					tempResult.executionTime = notifContentArray[notifContentArray.length - 1];
					tempResult.errorMessage = notifContentArray[0];
					tempResult.indexId = notifContentArray[1];
					let parentId = "-1";
					if (notifContentArray[1].includes("-")) {
						// 去除最后一个斜杠和其后面的内容
						parentId = notifContentArray[1].substring(0, notifContentArray[1].lastIndexOf("-"));
					}
					tempResult.parentId = parentId;
					tempResult.antbotName = notifContentArray[2];
					let command = notifContentArray[3] + "```" + notifContentArray[4];
					tempResult.command = command;
					//如果command中包含CALL_SCRIPT,则设置
					if (command.includes("CALL_SCRIPT")) {
						tempResult.commandType = 6;
					}
					if (notifContentArray[5] == "SUCCESS") {
						tempResult.result = 1;
					} else if (notifContentArray[5] == "FAIL") {
						tempResult.result = 0;
					} else if (notifContentArray[5] == "TIMEOUT") {
						tempResult.result = 2;
					} else {
						tempResult.result = 3;
					}
					tempResult.errorMessage = notifContentArray[6];
				}
				tempResultArray.push(tempResult);
			}
			let tdata = {
				status: 1,
				result: tempResultArray
			}
			return tdata;
		}

		this.executionResultLocalization = function (executionResultList, isSummary) {
			var expectedResultList = [];
			var currentTestcase = null;
			var currentCheckpoint = null;
			var currentStep = 1;
			var currentStepName = 1;
			var lastTestCaseComplete = true;
			var lastCheckPointComplete = true;
			for (var i = 0; i < executionResultList.length; i++) {
				var scriptId = executionResultList[i].scriptId != null && executionResultList[i].scriptId != 0 ? executionResultList[i].scriptId : "";
				if (executionResultList[i].commandType == self.commandType.testCaseBegin) {
					var testcase = new Object();
					testcase.step = "测试用例 ";
					testcase.stepName = executionResultList[i].command + "(系统Id:" + scriptId + ")";
					testcase.time = executionResultList[i].executionTime;
					testcase.errorMessage = executionResultList[i].errorMessage;
					testcase.begin = executionResultList[i].resultId;
					testcase.result = self.testResult.unCompleted;
					testcase.type = 'testcase';

					testcase.indexId = executionResultList[i].indexId;
					testcase.parentId = executionResultList[i].parentId;
					if (!lastTestCaseComplete) {
						currentTestcase.end = executionResultList[i].resultId;
						if (!lastCheckPointComplete)
							currentCheckpoint.end = executionResultList[i].resultId;
					}

					currentTestcase = testcase;
					currentStep = 1;
					expectedResultList.push(testcase);
					lastTestCaseComplete = false;
				}
				else if (executionResultList[i].commandType == self.commandType.testCaseEnd) {
					currentTestcase.time = currentTestcase.time + " - " + executionResultList[i].executionTime;
					currentTestcase.result = executionResultList[i].result;
					currentTestcase.end = executionResultList[i].resultId;
					lastTestCaseComplete = true;
					if (!lastCheckPointComplete)
						currentCheckpoint.end = executionResultList[i].resultId;
				}
				else if (executionResultList[i].commandType == self.commandType.exceptionBegin) {
					var testcase = new Object();
					testcase.step = "异常恢复 " + executionResultList[i].command;
					testcase.stepName = executionResultList[i].command;
					testcase.time = executionResultList[i].executionTime;
					testcase.errorMessage = executionResultList[i].errorMessage;
					testcase.begin = executionResultList[i].resultId;
					testcase.result = self.testResult.unCompleted;
					testcase.type = 'testcase';

					testcase.indexId = executionResultList[i].indexId;
					testcase.parentId = executionResultList[i].parentId;

					if (!lastTestCaseComplete) {
						currentTestcase.end = executionResultList[i].resultId;
						if (!lastCheckPointComplete)
							currentCheckpoint.end = executionResultList[i].resultId;
					}

					currentTestcase = testcase;
					currentStep = 1;
					expectedResultList.push(testcase);
					lastTestCaseComplete = false;
				}
				else if (executionResultList[i].commandType == self.commandType.exceptionEnd) {
					currentTestcase.time = currentTestcase.time + " - " + executionResultList[i].executionTime;
					currentTestcase.result = executionResultList[i].result;
					currentTestcase.end = executionResultList[i].resultId;
					lastTestCaseComplete = true;
					if (!lastCheckPointComplete)
						currentCheckpoint.end = executionResultList[i].resultId;
				}
				else if (executionResultList[i].commandType == self.commandType.executionBegin) {
					continue;
				}
				else if (executionResultList[i].commandType == self.commandType.executionEnd) {
					if (!lastTestCaseComplete)
						currentTestcase.end = executionResultList[i].resultId;
					if (!lastCheckPointComplete)
						currentCheckpoint.end = executionResultList[i].resultId;
				}
				else if (executionResultList[i].commandType == self.commandType.checkPointBegin) {
					var checkpoint = new Object();
					checkpoint.step = "测试点 ";
					if (isSummary)
						checkpoint.stepName = executionResultList[i].command;
					else
						checkpoint.stepName = executionResultList[i].command + " 开始 ";
					checkpoint.time = executionResultList[i].executionTime;
					checkpoint.result = self.testResult.unCompleted;
					checkpoint.type = 'checkpoint';
					checkpoint.errorMessage = executionResultList[i].errorMessage;
					checkpoint.begin = executionResultList[i].resultId;

					checkpoint.indexId = executionResultList[i].indexId;
					checkpoint.parentId = executionResultList[i].parentId;


					if (!lastCheckPointComplete)
						currentCheckpoint.end = checkpoint.begin;

					currentCheckpoint = checkpoint;
					expectedResultList.push(checkpoint);
					lastCheckPointComplete = false;
				}
				else if (executionResultList[i].commandType == self.commandType.checkPointEnd) {
					if (isSummary) {
						currentCheckpoint.time = currentCheckpoint.time + " - " + executionResultList[i].executionTime;
						currentCheckpoint.result = executionResultList[i].result;
						currentCheckpoint.end = executionResultList[i].resultId;
					}
					else {
						var checkpoint = new Object();
						checkpoint.step = "测试点 ";
						checkpoint.stepName = executionResultList[i].command + " 结束 ";
						checkpoint.time = executionResultList[i].executionTime;
						checkpoint.result = executionResultList[i].result;
						currentCheckpoint.result = executionResultList[i].result;
						checkpoint.type = 'checkpoint';
						checkpoint.errorMessage = executionResultList[i].errorMessage;
						checkpoint.end = executionResultList[i].resultId;
						checkpoint.indexId = executionResultList[i].indexId;
						checkpoint.parentId = executionResultList[i].parentId;
						expectedResultList.push(checkpoint);
					}
					lastCheckPointComplete = true;
				}
				else if (executionResultList[i].commandType == self.commandType.executionCommand) {
					var testcase = new Object();
					testcase.step = currentStep;
					currentStep++;
					var step = self.getcmdUserLanguage(executionResultList[i].command, executionResultList[i].antbotName);
					testcase.stepName = step.stepName;
					testcase.existBigData = step.existBigData;
					testcase.bigDataId = step.bigDataId;
					testcase.time = executionResultList[i].executionTime;
					testcase.result = executionResultList[i].result;
					testcase.antbotName = executionResultList[i].antbotName;
					testcase.indexId = executionResultList[i].indexId;
					testcase.parentId = executionResultList[i].parentId;
					if (testcase.antbotName == "__EXTDEV__") {
						testcase.antbotName = " ";
					}
					testcase.errorMessage = executionResultList[i].errorMessage;
					expectedResultList.push(testcase);
				}
			}
			return expectedResultList;
		};

		this.getcmdListByAgentType = function (agentType) {
			for (var i = 0; i < self.agentCmdList.length; i++) {
				var agentTypeName = self.agentCmdList[i].name;
				if (agentTypeName == agentType)
					return self.agentCmdList[i].commands;
			}
			return [];
		};

		this.getcmdListByAgentName = function (agentName) {
			if (agentName == undefined || agentName === '')
				return [];
			var agentType = projectManager.getAgentType(agentName);
			if (agentType === null) {
				return [];
			}
			return self.getcmdListByAgentType(agentType);
		};

		this.generateCmd = function (antbotName, cmdName, cmdParameters) {
			var cmdsString = "";
			if (self.isEngineCommand(cmdName)) {
				return "";
				//cmdsString += cmdName;				
			}
			else {
				cmdsString += self.decorateAgentName(antbotName);
				cmdsString += self.PARA_SEPARATOR;
				cmdsString += cmdName;
			}

			var paraValue = "";
			for (var i = 0; i < cmdParameters.length; i++) {
				cmdsString += self.PARA_SEPARATOR;
				paraValue = cmdParameters[i];

				if (cmdParameters[i].name != null)
					paraValue = cmdParameters[i].name;

				if (cmdParameters[i].type != null) {
					if (cmdParameters[i].type === "float" || cmdParameters[i].type === "integer" || cmdParameters[i].type === "uinteger")
						paraValue = 0;
				}

				if (cmdParameters[i].value != null && cmdParameters[i].value != undefined)
					paraValue = cmdParameters[i].value;
				cmdsString += paraValue;
			}
			// cmdsString += '\n';
			return cmdsString;
		};

		this.getControlDataCmd = function (agenteName, cmdName) {
			var groupList = self.getcmdListByAgentName(agenteName);
			for (var i = 0; i < groupList.length; i++) {
				var group = groupList[i];
				if (group.GroupName != undefined && group.GroupName != '') {
					for (var j = 0; j < group.CommandList.length; j++) {
						var cmd = group.CommandList[j];
						if (cmdName === cmd.CmdName) {
							if (cmd.ControlDataDesc != undefined && cmd.ControlDataDesc != null && cmd.ControlDataDesc.length > 0) {
								return cmd;
							}
						}
					}
				}
				else {
					var cmd = group;
					if (cmdName === cmd.CmdName) {
						if (cmd.ControlDataDesc != undefined && cmd.ControlDataDesc != null && cmd.ControlDataDesc.length > 0) {
							return cmd;
						}
					}
				}
			}
			return null;
		};
		this.publicSaveScript = function (currentScript, updateCmdArray) {
			if (updateCmdArray == null || updateCmdArray.length == 0)
				return false;

			var commandItemList = currentScript.script.split(self.CMD_SEPARATOR);

			for (var i = 0; i < updateCmdArray.length; ++i) {
				if (updateCmdArray[i].cmdIndex >= commandItemList.length)
					return false;
				var originalCmd = commandItemList[updateCmdArray[i].cmdIndex];
				var cmdSegments = originalCmd.split(self.PARA_SEPARATOR);

				var paramArray = updateCmdArray[i].updateParams;
				for (var j = 0; j < paramArray.length; ++j) {
					cmdSegments[2 + paramArray[j].index.paramIndex] = paramArray[j].value;
				}
				var newCmd = cmdSegments.join(self.PARA_SEPARATOR);
				commandItemList[updateCmdArray[i].cmdIndex] = newCmd;
			}
			currentScript.script = commandItemList.join(self.CMD_SEPARATOR);
			return currentScript;
		};
		//监测
		this.getMonitorDataCmd = function (agenteName, cmdName) {
			var groupList = self.getcmdListByAgentName(agenteName);
			for (var i = 0; i < groupList.length; i++) {
				var group = groupList[i];
				if (group.GroupName != undefined && group.GroupName != '') {
					for (var j = 0; j < group.CommandList.length; j++) {
						var cmd = group.CommandList[j];
						if (cmdName === cmd.CmdName) {
							if (cmd.MonitorDataDesc != undefined && cmd.MonitorDataDesc != null && cmd.MonitorDataDesc.length > 0) {
								return cmd;
							}
						}
					}
				}
				else {
					var cmd = group;
					if (cmdName === cmd.CmdName) {
						if (cmd.MonitorDataDesc != undefined && cmd.MonitorDataDesc != null && cmd.MonitorDataDesc.length > 0) {
							return cmd;
						}
					}
				}
			}
			return null;
		};

		//监测数据
		this.agentMonitorDataDescCmdAnalysis = function (utpMonnitorCommandsString) {
			var monitorCmdInfoArray = [];
			if (utpMonnitorCommandsString != null && utpMonnitorCommandsString != "") {
				var commandItemList = utpMonnitorCommandsString.split(self.CMD_SEPARATOR);
				for (var i = 0; i < commandItemList.length; i++) {
					commandItemList[i] = commandItemList[i].trim();
					if (commandItemList[i] == "" || commandItemList[i].indexOf("#") !== -1)
						continue;
					var splitedCommandValues = commandItemList[i].split(self.PARA_SEPARATOR);
					if (splitedCommandValues.length == 0)
						continue;
					// check whether it's engine command					
					if (self.isEngineCommand(splitedCommandValues[0])) { }
					else {
						var agentName = splitedCommandValues[0].trim();
						var commandName = splitedCommandValues[1].trim();
						var monitorDataCmd = self.getMonitorDataCmd(agentName, commandName);
						agentName = self.recorverAgentName(agentName);
						var agent = projectManager.getFullAgentType(agentName);
						if (monitorDataCmd === null)
							continue;
						for (var j = 0; j < monitorDataCmd.MonitorDataDesc.length; j++) {
							var monitorData = monitorDataCmd.MonitorDataDesc[j];

							if (monitorData == null)
								continue;
							if (monitorData.dataNameInParam == undefined)
								continue;
							if (monitorData.dataNameInParam >= monitorDataCmd.Params.length)
								continue;

							let monitorCmdInfo = {
								agent: agent,
								cmdIndex: i,
								cmdName: commandName,
								monitorDataName: splitedCommandValues[2 + j],
								monitorDataType: monitorData.dataType,
								updateParamsInfo: [],
							};
							if (monitorData.userInputValues != undefined && monitorData.userInputValues.length != 0) {
								for (let k = 0; k < monitorData.userInputValues.length; k++) {
									monitorCmdInfo.updateParamsInfo.push({ "paramIndex": monitorData.userInputValues[k].valueInParam, "assistInputType": monitorDataCmd.Params[monitorData.userInputValues[k].valueType] });
								}
							}
							monitorCmdInfoArray.push(monitorCmdInfo);
						}
					}
				}
			}
			return monitorCmdInfoArray;
		};
		//解析用例数据,获取展示数据
		this.commandDataAnalysis = function (utpCommandsString) {
			//var controlCmdMapping = new Map();
			var controlCmdInfoType = [];
			if (utpCommandsString != null && utpCommandsString != "") {
				var commandItemList = utpCommandsString.split(self.CMD_SEPARATOR);
				for (var i = 0; i < commandItemList.length; i++) {
					commandItemList[i] = commandItemList[i].trim();
					if (commandItemList[i] == "" || commandItemList[i].indexOf("#") !== -1)
						continue;
					var splitedCommandValues = commandItemList[i].split(self.PARA_SEPARATOR);
					if (splitedCommandValues.length == 0)
						continue;
					// if (self.isEngineCommand(splitedCommandValues[0])) { 
					var commandName = splitedCommandValues[0].trim();
					if (commandName === "MONITOR_GROUP") {
						controlCmdInfoType.push(commandName);
					} else if (commandName === "MONITORDATA") {
						var executionDataType = splitedCommandValues[1].trim();
						controlCmdInfoType.push(executionDataType);
					} else {
						if (splitedCommandValues.length == 3 && (splitedCommandValues[1].trim() == "SetCollectDataFlag" && splitedCommandValues[2].trim() == "true")) {
							controlCmdInfoType.push("frameList");
						}
					}

				}
			}
			return controlCmdInfoType;
		};
		//解析monitogroup数据
		this.groupcommandDataAnalysis = function (utpCommandsString) {
			//var controlCmdMapping = new Map();
			var controlCmdInfoArray = [];
			var listArray = [];
			if (utpCommandsString != null && utpCommandsString != "") {
				var commandItemList = utpCommandsString.split(self.CMD_SEPARATOR);
				for (var i = 0; i < commandItemList.length; i++) {
					commandItemList[i] = commandItemList[i].trim();
					if (commandItemList[i] == "" || commandItemList[i].indexOf("#") !== -1)
						continue;
					var splitedCommandValues = commandItemList[i].split(self.PARA_SEPARATOR);
					if (splitedCommandValues.length == 0)
						continue;
					// if (self.isEngineCommand(splitedCommandValues[0])) { 
					var commandName = splitedCommandValues[0].trim();
					if (commandName === "MONITOR_GROUP") {
						var monitorGroupName = splitedCommandValues[2].trim();
						for(let i = 0;i < listArray.length;i++){
							if(splitedCommandValues[3] == "$" + listArray[i].listGroupName){
								var monitorGroup = {
									monitorGroupName: monitorGroupName,
									monitorGroupData: listArray[i].listGroupData,
								};
							}
						}
						controlCmdInfoArray.push(monitorGroup);
					} else if (commandName === "DEFINE_ARRAY_VAR"){ // 获取数组定义,以便存入分组名
						var listName = splitedCommandValues[1].trim();
						splitedCommandValues.splice(0, 2); //移除数组前两个值
						//遍历数组,将剩下的值存入数组
						var listGroup = {
							listGroupName: listName,
							listGroupData: splitedCommandValues,
						};
						listArray.push(listGroup);
					}
					// }

				}
			}
			return controlCmdInfoArray;
		};
		//解析非命令里的monitor数据,暂未完成
		this.noncommandDataAnalysis = function (utpCommandsString) {
			//var controlCmdMapping = new Map();
			var controlCmdInfoArray = [];
			if (utpCommandsString != null && utpCommandsString != "") {
				var commandItemList = utpCommandsString.split(self.CMD_SEPARATOR);
				for (var i = 0; i < commandItemList.length; i++) {
					commandItemList[i] = commandItemList[i].trim();
					if (commandItemList[i] == "" || commandItemList[i].indexOf("#") !== -1)
						continue;
					var splitedCommandValues = commandItemList[i].split(self.PARA_SEPARATOR);
					if (splitedCommandValues.length == 0)
						continue;
					if (self.isEngineCommand(splitedCommandValues[0])) {
						var commandName = splitedCommandValues[0].trim();
						if (commandName === "MONITORDATA") {
							var monitorDataName = splitedCommandValues[2].trim();
							var monitorData = {
								monitorDataName: monitorDataName,
							};
							controlCmdInfoArray.push(monitorData);
						}
					}

				}
			}
			return controlCmdInfoArray;
		};

		this.agentControlDataCmdAnalysis = function (utpCommandsString) {
			//var controlCmdMapping = new Map();
			var controlCmdInfoArray = [];
			if (utpCommandsString != null && utpCommandsString != "") {
				var commandItemList = utpCommandsString.split(self.CMD_SEPARATOR);
				for (var i = 0; i < commandItemList.length; i++) {
					commandItemList[i] = commandItemList[i].trim();
					if (commandItemList[i] == "" || commandItemList[i].indexOf("#") !== -1)
						continue;
					var splitedCommandValues = commandItemList[i].split(self.PARA_SEPARATOR);
					if (splitedCommandValues.length == 0)
						continue;
					// check whether it's engine command					
					if (self.isEngineCommand(splitedCommandValues[0])) { }
					else {
						var agentName = splitedCommandValues[0].trim();
						var commandName = splitedCommandValues[1].trim();
						var controlDataCmd = self.getControlDataCmd(agentName, commandName);
						agentName = self.recorverAgentName(agentName);
						var agent = projectManager.getFullAgentType(agentName);
						if (controlDataCmd === null)
							continue;
						for (var j = 0; j < controlDataCmd.ControlDataDesc.length; j++) {
							var controlData = controlDataCmd.ControlDataDesc[j];

							if (controlData == null)
								continue;
							if (controlData.dataNameInParam == undefined)
								continue;
							if (controlData.dataNameInParam >= controlDataCmd.Params.length)
								continue;

							let controlCmdInfo = {
								agent: agent,
								cmdIndex: i,
								cmdName: commandName,
								controlDataName: splitedCommandValues[2 + j],
								controlDataType: controlData.dataType,
								updateParamsInfo: [],
							};
							if (controlData.dataValuesInParam != undefined || controlData.dataValuesInParam.length != 0) {
								for (let k = 0; k < controlData.dataValuesInParam.length; k++) {
									controlCmdInfo.updateParamsInfo.push({ "paramIndex": controlData.dataValuesInParam[k], "assistInputType": controlDataCmd.Params[controlData.dataValuesInParam[k]].assistInputType });
								}
							}
							controlCmdInfoArray.push(controlCmdInfo);
						}
					}
				}
			}
			return controlCmdInfoArray;
		};

		this.generatecmdStepList = function (utpCommandsString, displayStep) {
			var sequenceDiagramStr = "";
			var stepsCount = 0;
			if (utpCommandsString != null && utpCommandsString != "") {
				var commandItemList = utpCommandsString.split(self.CMD_SEPARATOR);
				for (var i = 0; i < commandItemList.length; i++) {
					commandItemList[i] = commandItemList[i].trim();
					if (commandItemList[i] == ""
						|| commandItemList[i].indexOf("#") !== -1)
						continue;

					var splitedCommandValues = commandItemList[i].split(self.PARA_SEPARATOR);
					if (splitedCommandValues.length == 0)
						continue;
					var parameters = new Array();
					stepsCount++;
					// check whether it's engine command					
					if (self.isEngineCommand(splitedCommandValues[0])) {

						var commandName = splitedCommandValues[0].trim();

						for (var j = 1; j < splitedCommandValues.length; j++) {
							var commandValue = splitedCommandValues[j].trim();
							if (commandValue.length > self.descriptionLength)
								parameters[j - 1] = commandValue.substring(0, self.descriptionLength) + '\u2026';
							else
								parameters[j - 1] = commandValue;
						}
						var cmdUserLanguage = self
							.convertEngineCmdToUserLanguange(commandName, parameters);
						cmdUserLanguage = cmdUserLanguage.replace(new RegExp('\n', 'g'), "↵");
						if (displayStep)
							sequenceDiagramStr = sequenceDiagramStr
								+ "步骤 " + stepsCount + ": "
								+ cmdUserLanguage;
						else
							sequenceDiagramStr = sequenceDiagramStr
								+ "UTP平台->UTP平台" + ": "
								+ cmdUserLanguage;
					} else {
						var commandName = splitedCommandValues[1].trim();
						for (var j = 2; j < splitedCommandValues.length; j++) {
							//	var commandValue = splitedCommandValues[j].trim();
							var commandValue = splitedCommandValues[j]; // should not trim
							if (commandValue.length > self.descriptionLength)
								parameters[j - 2] = commandValue.substring(0, self.descriptionLength) + '\u2026';
							else
								parameters[j - 2] = commandValue;

						}

						var agentName = splitedCommandValues[0].trim();
						var cmdUserLanguage = self
							.convertAgentCmdToUserLanguange(projectManager.getAgentType(agentName), commandName, parameters, true);

						agentName = agentName.replace(new RegExp('-', 'g'), '_');	// - within agent name will lead diagram generation fail
						if (cmdUserLanguage == null) {
							cmdUserLanguage = commandItemList[i];
							if (displayStep)
								sequenceDiagramStr = sequenceDiagramStr
									+ "步骤 " + stepsCount + ": [" + agentName + "(未知)] "
									+ cmdUserLanguage;
							else
								sequenceDiagramStr = sequenceDiagramStr
									+ "UTP平台->" + agentName + "(未知):"
									+ cmdUserLanguage;
						}
						else {
							cmdUserLanguage = cmdUserLanguage.replace(new RegExp('\n', 'g'), "↵");
							if (displayStep)
								sequenceDiagramStr = sequenceDiagramStr
									+ "步骤 " + stepsCount + ": [" + agentName + "] "
									+ cmdUserLanguage;
							else
								sequenceDiagramStr = sequenceDiagramStr
									+ "UTP平台->" + agentName + ": "
									+ cmdUserLanguage;
						}
					}
					sequenceDiagramStr = sequenceDiagramStr.trim() + "\n";
				}
			}
			return sequenceDiagramStr;
		};

		this.existBigData = function (parameters) {
			if (parameters == null || parameters == undefined || parameters.length == 0)
				return null;
			for (var i = 0; i < parameters.length; i++) {
				try {
					try {
						var parameter = JSON.parse(parameters[i]);
					} catch (e) {
						var parameter = parameters[i];
					}

					if (parameter && parameter[self.bigDataIdLabel] != undefined) {
						return parameter[self.bigDataIdLabel];
					}
				}
				catch (err) {
					console.log(err);
				}
			}
			return null;
		};

		// report
		this.getcmdUserLanguage = function (commandStr, agentName) {
			var step = {
				stepName: "",
				existBigData: false,
				bigDataId: null,
				stepType: null
			};
			try {
				var cmdWithParams = commandStr.split(self.PARA_SEPARATOR);
				if (cmdWithParams.length == 0)
					return "未知命令";
				var command = cmdWithParams[0];
				var parameters = new Array();
				if (cmdWithParams.length > 1) {
					var paramJsonStr = cmdWithParams[1];
					parameters = JSON.parse(paramJsonStr);
				}
				var cmdUserLanguage = "未知命令";
				var agentInstanceName = self.recorverAgentName(agentName);
				if (agentInstanceName == "__SYSDEV__" || agentInstanceName == "__EXTDEV__") {

					if (command != null && command === 'CALL_SCRIPT' && parameters != null) {
						var sId = parameters[0];
						var subScript = projectManager.getSubScript(sId);
						if (subScript == undefined || subScript == null) {
							var script = projectManager.getTestcase(sId);
							if (script) {
								step.stepType = "script"
							}
						} else {
							step.stepType = "subScript"
						}
					}
					cmdUserLanguage = self.convertEngineCmdToUserLanguange(command, parameters);
				} else {
					var agentType = projectManager.getAgentType(agentName);
					cmdUserLanguage = self.convertAgentCmdToUserLanguange(agentType, command, parameters, true);
				}

				if (cmdUserLanguage == null)
					cmdUserLanguage = commandStr;
				step.stepName = cmdUserLanguage;
				var bigDataId = self.existBigData(parameters);
				if (bigDataId) {
					step.existBigData = true;
					step.bigDataId = bigDataId;
				}
			}
			catch (err) {
				if (command == null || command == undefined || command == '')
					step.stepName = "未知命令";
				else
					step.stepName = command + ": 参数未知";
			}
			return step;
		};

		this.needRecordSetConfig = function (agentType) {
			if (self.agentTypeDefinitionDictionary[agentType] == undefined)
				return false;
			return self.agentTypeDefinitionDictionary[agentType].extraDataConfig == self.antbotExtraCofig.recordset;
		};

		this.needBigDataConfig = function (agentType) {
			if (self.agentTypeDefinitionDictionary[agentType] == undefined)
				return false;
			return self.agentTypeDefinitionDictionary[agentType].extraDataConfig == self.antbotExtraCofig.busInterfaceDef;
		};
		//信号部分
		this.signalNeedBigDataConfig = function (agentType) {
			if (self.agentTypeDefinitionDictionary[agentType] == undefined)
				return false;
			return self.agentTypeDefinitionDictionary[agentType].extraDataConfig == self.antbotExtraCofig.signalConfigTable;
		};

		// tree
		this.convertCmdToUserLanguange = function (agentType, commandType, commandName, paramList) {
			var formattedCommandString = "";

			if (commandType === "SysCmd")
				formattedCommandString = self.convertEngineCmdToUserLanguange(commandName, paramList);
			else
				formattedCommandString = self.convertAgentCmdToUserLanguange(agentType, commandName, paramList, false);
			if (formattedCommandString == null)
				formattedCommandString = "未知命令";

			return formattedCommandString;
		};

		this.convertAgentCmdToUserLanguange = function (agentType, commandName, paramList, detail) {
			if (agentType == null || agentType == undefined || commandName == undefined || paramList == null)
				return null;
			var lang = "zh";//"en";
			try {
				var formmattedString = detail ? self.agentTypeDefinitionDictionary[agentType][commandName][lang].cmdDescFormatter :
					(self.needRecordSetConfig(agentType) ? self.agentTypeDefinitionDictionary[agentType][commandName][lang].cmdDescFormatter : self.agentTypeDefinitionDictionary[agentType][commandName][lang].nameDesc);
				for (var n = 0; n < paramList.length; n++) {
					var str;
					if (paramList[n].length > 0 && paramList[n][0] != '"') {
						str = '"' + paramList[n] + '"';
					} else if (typeof paramList[n] == 'object') {
						//将对象转换为字符串
						str = '"' + JSON.stringify(paramList[n]) + '"';
					} else {
						str = paramList[n];
					}

					formmattedString = formmattedString
						.replace("%s" + (n + 1), str);
				}
				return formmattedString;
			} catch (e) {
				return null;
			}
		};
		this.convertRecordAllCmdToUserLanguage = function (agentType, commandName, lang = "zh") {
			return self.agentTypeDefinitionDictionary[agentType][commandName][lang].nameDesc;
		};
		this.convertEngineCmdToUserLanguange = function (commandName, paramList) {
			if (commandName == null || commandName == undefined)
				return "未知命令";
			if (paramList == null)
				return commandName + ": 参数未知";

			var lang = "zh";//"en";
			try {
				var formmattedString = self.engineCmdDictionary[commandName][lang].cmdDescFormatter;
				if (commandName == 'CALL_SCRIPT') {
					var subScriptId = paramList[0];
					var subScript = projectManager.getSubScript(subScriptId);
					if (subScript == undefined || subScript == null) {
						subScript = projectManager.getTestcase(subScriptId);
						if (subScript == undefined || subScript == null) {
							return "未知脚本";
						}
					}

					var paramNameList = [];
					subScriptName = subScript.value;
					if (subScript.parameter != undefined && subScript.parameter != "")
						paramNameList = $.parseJSON(subScript.parameter);
					paramList.splice(0, 1);
					var paramString = "";
					if (paramNameList.length > 0) {
						paramString = "参数:";
						for (var i = 0; i < paramNameList.length; i++) {
							var paramValue = "未设置";
							if (paramList[i] != undefined && paramList[i] != null)
								paramValue = paramList[i];
							paramString += "&nbsp;&nbsp;&nbsp;" + paramNameList[i] + "=" + paramValue;
						}
						paramString += ";";
					}
					//关闭备注解析
					// var comment = "备注: ";
					// if(subScript.description != undefined && subScript.description != "")						
					//     comment += subScript.description.replace(new RegExp('\n', 'g'), "↵");
					// else
					// 	comment += "暂无";
					// formmattedString = "[" + subScriptName + "]" + "(" + paramString + comment + ")";	
					//判断paramString是否为空
					if (paramString == "") {
						formmattedString = "[" + subScriptName + "]";
					} else {
						formmattedString = "[" + subScriptName + "]" + "(" + paramString + ")";
					}

					//	formmattedString = formmattedString.replace("%subScriptName", subScriptName);
				}
				else if (commandName == 'CHECKPOINT_BEGIN') {
					var requirementId = paramList[0];
					var requirement = projectManager.getRequirement(requirementId);
					if (requirement)
						formmattedString = formmattedString.replace("%s1", "[" + requirement.value + "]");
					else {
						if (requirementId)
							formmattedString = formmattedString.replace("%s1", "[" + requirementId + "]");
						else
							formmattedString = formmattedString.replace("%s1", "[未知]");
					}
				}
				else {
					for (var n = 0; n < paramList.length; n++) {
						var str;
						if (paramList[n].length > 0 && paramList[n][0] != '"')
							str = '"' + paramList[n] + '"';
						else if (typeof paramList[n] == 'object') {
							//当是对象时,则不显示参数
							str = "";
							formmattedString = formmattedString
								.replaceAll("(%s" + (n + 1) + ")", str);
							//跳过循环
							continue;
						} else {
							str = paramList[n];
						}
						formmattedString = formmattedString
							.replaceAll("%s" + (n + 1), str);
					}
				}

				return formmattedString;
			} catch (e) {
				if (commandName == null || commandName == undefined)
					return "未知命令";
				if (paramList == null)
					return commandName + ": 参数未知";
			}
		};

		this.isEngineCommand = function (commandName) {
			return (self.engineCmdDictionary[commandName] != undefined);
		};

		this.recurHandleCmdList = function (commands, allCmdList, agentTypeDictionary) {
			for (var j = 0; j < commands.length; j++) {
				if ("CommandList" in commands[j]) {
					self.recurHandleCmdList(commands[j].CommandList, allCmdList, agentTypeDictionary);
				} else {
					allCmdList.push(commands[j]);
					var commandName = commands[j].CmdName;
					agentTypeDictionary[commandName] = {};
					for (var m = 0; m < commands[j].UserLanguage.length; m++) {
						var lang = commands[j].UserLanguage[m].lang;
						var formatNameString = commands[j].UserLanguage[m].nameDesc;
						var formatCommandString = commands[j].UserLanguage[m].cmdDescFormatter;

						agentTypeDictionary[commandName][lang] = {
							nameDesc: commands[j].UserLanguage[m].nameDesc,
							cmdDescFormatter: commands[j].UserLanguage[m].cmdDescFormatter
						}
					}
				}
			}
		};
		this.loadAgentCmdListSuccessFunction = function (agentCmdList) {
			if (agentCmdList != null && agentCmdList != "") {
				self.agentCmdList = agentCmdList;
				self.agentCmdExpandList = [];
				//self.agentCmdListRawJsonStr = JSON.stringify(s);
				for (var i = 0; i < agentCmdList.length; i++) {
					var agentTypeName = agentCmdList[i].name;
					var extraDataConfig = agentCmdList[i].extraDataConfig;
					self.agentTypeDefinitionDictionary[agentTypeName] = {};
					self.agentTypeDefinitionDictionary[agentTypeName].extraDataConfig = extraDataConfig;
					var allCmdList = [];
					self.recurHandleCmdList(agentCmdList[i].commands, allCmdList, self.agentTypeDefinitionDictionary[agentTypeName]);
					self.agentCmdExpandList.push({
						name: agentCmdList[i].name,
						extraDataConfig: agentCmdList[i].extraDataConfig,
						commands: allCmdList,
						notifications: agentCmdList[i].notifications
					});
				}
			}
		};

		this.loadResourcesErrorFunction = function (response) { };

		this.getEngineCmdListSuccessFunction = function (engineCmdList) {
			if (engineCmdList != null && engineCmdList != "") {
				self.engineCmdList = engineCmdList;
				var allCmdList = [];
				self.recurHandleCmdList(engineCmdList, allCmdList, self.engineCmdDictionary);
			}
		};

		this.getEngineCmdListErrorFunction = function () { };

		this.loadResources = function (organization, authorizationKey) {
			ursService.getAgentTypeList(organization, authorizationKey, self.loadAgentCmdListSuccessFunction, self.loadResourcesErrorFunction);
			ursService.getEngineCmdList(self.getEngineCmdListSuccessFunction, self.getEngineCmdListErrorFunction);
		};
		this.blocklyScriptToXml = function (type, result) {
			let begin = null;
			let end = null;
			if (type == "testcase") {
				begin = self.TESTCASE_BEGIN + self.CMD_SEPARATOR;
				end = self.TESTCASE_END;
			} else if (type == "subscript") {
				begin = self.SUBSCRIPT_BEGIN + self.CMD_SEPARATOR;
				end = self.SUBSCRIPT_END;
			}

			if (begin == null || end == null)
				return null;

			script = result.replace(begin, "").replace(end, "");

			var agentOptions = [];
			for (var i = 0; i < self.agentCmdExpandList.length; i++) {
				if (self.agentCmdExpandList[i].commands != null) {
					agentOptions[self.agentCmdExpandList[i].name] = self.agentCmdExpandList[i].commands;
				}
			}
			var workspace = {
				options: {
					locale: 'en', // 设置默认语言为英文
					strictMode: false, // 设置默认的严格模式为false
					agentOptions: agentOptions,
					getCheckpoint: self.projectManager.getRequirement,
					getScript: self.projectManager.getScript,
					getSubScript: self.projectManager.getSubScript,
					getAgentType: self.projectManager.getAgentType
				}
			};
			dom = Blockly.Xml.scriptToDom(script, workspace);
			var xml = Blockly.Xml.domToPrettyText(dom);
			return xml;
		}
	}
	return new cmdConvertService();
});


