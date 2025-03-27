define(
    ['jquery', 'komapping', 'durandal/system', 'durandal/app', 'lang', 'knockout', 'blockUI',
        'services/loginManager', 'services/projectManager',
        'services/executionManager', 'services/viewManager', 'services/systemConfig', 'services/protocolService',
        'services/fileManagerUtility', 'services/selectionManager', 'sequencediagram', 'jsoneditor',
        'services/utpService', 'services/notificationService', 'lodash',
        'services/cmdConvertService', 'services/utilityService'],
    function ($, komapping, system, app, lang, ko, blockUI, loginManager, projectManager,
              executionManager, viewManager, systemConfig, protocolService, fileManagerUtility,
              selectionManager, sequencediagram, JSONEditor, utpService, notificationService, _,
              cmdConvertService, utilityService) {

        function CommonScriptViewModel() {
            var self = this;
            self.viewManager = viewManager;
            self.systemConfig = systemConfig;
            self.projectManager = projectManager;
            self.selectionManager = selectionManager;
            self.utpService = utpService;
            self.executionManager = executionManager;
            self.initFinish = false;
            self.reload = true;
            self.maxNameLength = 200;
            this.protocolService = protocolService;

            this.gotoPlayground = function () {
                self.viewManager.commonscriptActivePage('app/viewmodels/playground_comsc');
            };

            this.gotoExecution = function () {
                self.executionManager.newExecutionFlag(true);
                self.selectionManager.verificationSource = 'logicblock';
                self.viewManager.commonscriptActivePage('app/viewmodels/verification');
            };

            this.refreshFileManager = function (data) {
                if (data != null) {
                    $$("cfm").clearAll();
                    self.initFinish = false;
                    $$("cfm").parse(data);
                    self.treeAdjust();
                }
            };

            this.getScriptGroupByProjectSuccessFunction = function (data) {
                self.projectManager.subScriptMappingClear();
                if (data != null && data.status === 1
                    && data.result != null) {
                    var scriptGroups = self.projectManager
                        .generateScriptGroupsFromFlatInfo(data.result);
                    var root = [];
                    root.push(scriptGroups);
                    self.refreshFileManager(root);
                } else
                    self.getScriptGroupByProjectErrorFunction();
            };

            this.getScriptGroupByProjectErrorFunction = function () {
                notificationService.showError('获取项目公共逻辑信息失败');
            };

            this.getScriptGroupByProject = function () {
                self.utpService.getFlatScriptGroupByProject(
                    0,
                    'logicblock',
                    self.getScriptGroupByProjectSuccessFunction,
                    self.getScriptGroupByProjectErrorFunction);
            }

            // create folder
            this.createScriptGroupSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var retNewScriptGroup = data.result;
                    if (retNewScriptGroup != null) {
                        if (retNewScriptGroup.parentScriptGroupId == 0)
                            retNewScriptGroup.parentScriptGroupId = fileManagerUtility.root;
                        $$("cfm").add({
                            id: retNewScriptGroup.id,
                            value: retNewScriptGroup.name,
                            date: new Date(),
                            type: "folder",
                            dataType: "scriptGroup"
                        }, 0, retNewScriptGroup.parentScriptGroupId);
                        $$("cfm").refreshCursor();
                        self.treeAdjust();
                        notificationService.showSuccess('创建公共逻辑组成功');
                    } else
                        self.createScriptGroupErrorFunction();
                } else
                    self.createScriptGroupErrorFunction();
            };

            this.createScriptGroupErrorFunction = function () {
                notificationService.showError('创建公共逻辑组失败');
            };

            this.createScriptGroup = function (parentId) {
                var defNewScriptGroup = {
                    id: 0,
                    projectId: 0,
                    parentScriptGroupId: parentId,
                    description: '',
                    name: '新建公共逻辑组',
                    type:  'logicblock'
                };
                self.utpService.createScriptGroup(defNewScriptGroup,
                    self.createScriptGroupSuccessFunction,
                    self.createScriptGroupErrorFunction);
            };



            this.genericFrameInfo = {
                protocolId: "",
                id: "",
                fields: [],
                conditions: []
            };

            this.diagramChart = function () {
                var data = "";
                var cmdsStrings = self.cmdsStrings()
                //遍历cmdsStrings
                for (var i = 0; i < cmdsStrings.length; i++) {
                    // 获取behavior
                    var behavior = cmdsStrings[i].behavior;
                    if (behavior == "send") {
                        data += cmdsStrings[i].antbot.antbotName + "->被测产品: " + cmdsStrings[i].alias;
                        if (i < cmdsStrings.length - 1) {
                            data += "\n";
                        }
                    } if (behavior == "check") {
                        data += "被测产品->" + cmdsStrings[i].antbot.antbotName + ": " + cmdsStrings[i].alias;
                        if (i < cmdsStrings.length - 1) {
                            data += "\n";
                        }
                    }
                }
                var diagram = Diagram.parse(data);
                $('#commontimeSeriesScriptDiagram').html('');
                diagram.drawSVG("commontimeSeriesScriptDiagram", {
                    theme: 'simple'
                });

            };
            this.composeGenericFrameField = function () {
                if (self.protocolService.validatorErrors.length > 0) {
                    notificationService.showError('请输入合法数据');
                    return;
                }
                self.genericFrameInfo.fields = [];
                self.genericFrameInfo.conditions = [];
                if (self.protocolNeedFieldSetting()) {
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
                } else if (self.protocolNeedConditionSetting()) {
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

                self.composeFieldGroupSetting(self.checkedCommandNode());
                self.prepareCommands();
                $('#commongenericTimeSeriesScriptProtocolFieldSettingModal').modal('hide');
                self.diagramChart();

            };

            this.checkedCommandNode = ko.observable();


            this.checkedCommandNodes = [
                {
                    "name": "发送消息",
                    "behavior": "send",
                    "commandName": "SendMessageFromJson",
                    "commandParameters": [
                        {
                            "name": "messageJson",
                            "type": "string",
                            "assistInputType": "messageFiledsValueJson",
                            "value": ""
                        }
                    ]
                },
                {
                    "name": "检查消息",
                    "behavior": "check",
                    "commandName": "ChkLastRecvdMsgByCondi",
                    "commandParameters": [
                        {
                            "name": "expectedCondition",
                            "type": "string",
                            "assistInputType": "messageFiledsConditionJson"
                        },
                        "^realMessage"
                    ]
                }

            ]
            this.composeFieldGroupSetting = function (checkedCommandNode) {
                var commandParameters = checkedCommandNode.commandParameters;
                for (var p = 0; p < commandParameters.length; p++) {
                    if (commandParameters[p].assistInputType) {
                        if (commandParameters[p].assistInputType === 'messageFiledsValueJson') {
                            if (self.selectedMessageTemplate() == undefined) {
                                commandParameters[p].value = JSON.stringify({
                                    messageName: self.currentGenericFrameMessageName,
                                    config: self.genericFrameInfo.fields
                                });

                            }
                        } else if (commandParameters[p].assistInputType === 'messageFiledsConditionJson') {
                            commandParameters[p].value = JSON.stringify({
                                messageName: self.currentGenericFrameMessageName,
                                config: self.genericFrameInfo.conditions
                            });
                        }
                    }
                }
            };

            this.cmdsStrings = ko.observableArray([]);
            this.prepareCommands = function () {
                var checkedNode = self.checkedCommandNode();
                var cmdsString = cmdConvertService.generateCmd(self.selectedAntbot().antbotName, checkedNode.commandName, checkedNode.commandParameters);
                if (cmdsString && cmdsString != '') {
                    //使用深度拷贝，避免引用导致数据变化
                    var genericFrameInfoData = JSON.parse(JSON.stringify(self.genericFrameInfo)); // 深拷贝
                    var data = {
                        //生成id
                        id: 'cmd_' + (new Date()).getTime(),
                        alias: genericFrameInfoData.id,
                        genericFrameData: genericFrameInfoData,
                        antbot: self.selectedAntbot(),
                        cmdsString: cmdsString,
                        behavior: checkedNode.behavior
                    }
                    self.cmdsStrings.push(data);
                }
            };

            this.clearcommontimeSeriesScriptProtocolConfigView = function () {
                $('#commontimeSeriesScriptProtocolConfigView').html('');
            };

            this.genericProtocolName = ko.observable('协议帧内容配置');

            this.selectedMessage = null;
            this.currentGenericFrameMessageName = "";
            this.initGenericTimeSeriesScriptProtocolTree = function (data) {
                $('#commongenericTimeSeriesScriptProtocolTreeview').html('');
                self.selectedMessageTemplate(undefined);
                self.messageTemplates([]);
                self.clearcommontimeSeriesScriptProtocolConfigView();
                // self.protocolFieldsconfig.removeAll();
                self.genericProtocolName(data.value);
                webix.ready(function () {
                    self.genericTimeSeriesScriptProtocolTree = webix.ui({
                        container: "commongenericTimeSeriesScriptProtocolTreeview",
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

                    self.genericTimeSeriesScriptProtocolTree.attachEvent("onItemClick", function (id, e, node) {
                        // var item = this.getItem(id);
                        if (self.protocolNeedConditionSetting() || self.protocolNeedFieldSetting()) {
                            // self.protocolFieldsconfig.removeAll();
                            self.currentGenericFrameMessageName = "";
                            for (var i = 0; i < self.protocol.messages.length; i++) {
                                if (self.protocol.messages[i].id === id) {
                                    self.selectedMessage = JSON.parse(JSON.stringify(self.protocol.messages[i]));
                                    self.currentGenericFrameMessageName = self.selectedMessage.messageName;
                                    self.genericFrameInfo.id = self.selectedMessage.id;
                                    self.selectedMessage.fieldValues = null;
                                    // self.genericCommandField(self.selectedMessage.messageName);
                                    self.initProtocolConfigView(self.selectedMessage, true, true);
                                    if (self.protocolNeedFieldSetting()) {
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

            this.initProtocolConfigView = function (message, keepAllFields, needSchemaCheck) {
                self.clearcommontimeSeriesScriptProtocolConfigView();
                var currentProtocolMode = self.protocolService.protocolModeEnum.valueSelectionSetting;
                if (self.protocolNeedFieldSetting()) {
                    currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting;
                } else if (self.protocolNeedConditionSetting()) {
                    currentProtocolMode = self.protocolService.protocolModeEnum.valueSetting;
                }

                var multipleSelection = true;
                var options = self.protocolService.protocolOptionInit(self.protocol, message, currentProtocolMode, multipleSelection, keepAllFields, needSchemaCheck, message.fieldValues);
                const container = document.getElementById('commontimeSeriesScriptProtocolConfigView');
                var obj = self.protocolService.editedProtocolConfig;
                self.editor = new JSONEditor(container, options, obj);
                self.protocolService.editor = self.editor;
            };


            this.genericProtocolFieldSettingProcess = function () {
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
                $('#commongenericTimeSeriesScriptProtocolFieldSettingModal').modal({ show: true }, { data: root });
            };



            this.needBigData = ko.observable(false);

            this.protocolNeedFieldSetting = ko.observable(false);
            this.protocolNeedConditionSetting = ko.observable(false);
            this.genericProtocolProcess = function () {
                self.protocolNeedConditionSetting(false);
                self.protocolNeedFieldSetting(false);
                if (self.currentBigDatatype === self.protocolService.dataType.GENERICBUSFRAME) {
                    if (self.checkedCommandNode().commandParameters[0].assistInputType === 'messageFiledsValueJson')
                        self.protocolNeedFieldSetting(true);
                    else if (self.checkedCommandNode().commandParameters[0].assistInputType === 'messageFiledsConditionJson')
                        self.protocolNeedConditionSetting(true);

                    self.genericProtocolFieldSettingProcess();
                }
                else {
                    notificationService.showWarn('暂时无逻辑,待补充');
                }
            };
            this.addTimeSeriesScript = function () {
                self.genericProtocolProcess();
                // if(cmdConvertService.needBigDataConfig(self.selectedAntbot().antbotType)){
                // 	self.needBigData(true);
                // 	self.currentBigDatatype = null;
                // 	self.utpService.getProtocol(self.selectedAntbot().protocolSignalId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
                // }
            };

            this.removeTimeSeriesScript = function (item) {
                //从cmdsStrings中删除item
                for (var i = 0; i < self.cmdsStrings().length; i++) {
                    if (self.cmdsStrings()[i].id == item.id) {
                        self.cmdsStrings.splice(i, 1);
                        break;
                    }
                }
                self.diagramChart();

            };
            this.newName = ko.observable();
            this.newNameItem = ko.observable();
            this.saveNewName = function () {
                var newNameItem = self.newNameItem();
                if (newNameItem) {
                    for (var i = 0; i < self.cmdsStrings().length; i++) {
                        if (self.cmdsStrings()[i].id == newNameItem.id) {
                            newNameItem.alias = self.newName();
                            //移除旧的
                            self.cmdsStrings.splice(i, 1);
                            //添加新的到原位置
                            self.cmdsStrings.splice(i, 0, newNameItem);
                            break;
                        }
                    }
                    self.diagramChart();
                    $('#commoneditNameModal').modal('hide');
                } else {
                    notificationService.showError('名称不能为空');
                }
            };
            this.editTimeSeriesScript = function (item) {
                //
                self.newName(item.alias)
                self.newNameItem(item);
                // 显示模态框
                $('#commoneditNameModal').modal('show');
            };
            this.currentBigDatatype = null;
            this.protocol = { "equipments": [{ "index": "002", "name": "Flight Management Computer (702)", "labels": [{ "index": "001", "name": "Distance to Go", "minTxInterval": 100, "maxTxInterval": 200, "fields": [{ "name": "Distance to Go", "unit": "N.M.", "startBit": "29", "endBit": "11", "codeField": null, "bcd": { "digits": 5, "digit_Size": 4, "minva1": 0, "maxva1": 3999.9, "msd_Size": 3 } }, { "name": "SSM", "startBit": "31", "endBit": "30", "codeField": { "codes": [{ "value": "0", "String": "+" }, { "value": "1", "String": "NO Computed Data" }, { "value": "2", "String": "Functional Test" }, { "value": "3", "String": "-" }] } }] }, { "index": "002", "name": "Time to Go", "minTxInterval": 100, "maxTxInterval": 200, "fields": [{ "name": "Time to Go", "unit": "Min", "startBit": 29, "endBit": 15, "codeField": null, "bcd": { "digits": 4, "digit_Size": 4, "minva1": 0, "maxva1": 3999.9, "msd_Size": 3 } }] }, { "index": "003", "name": "Cross Track Distance", "minTxInterval": 100, "maxTxInterval": 200, "fields": [{ "name": "Cross Track Distance", "unit": "N.M.", "startBit": 29, "endBit": 15, "codeField": null, "bcd": { "digits": 4, "digit_Size": 4, "minva1": 0, "maxva1": 399.9, "msd_Size": 3 } }] }, { "index": "010", "name": "Present Position - Latitude", "minTxInterval": 250, "maxTxInterval": 500, "fields": [{ "name": "Degrees", "unit": "Deg", "startBit": 29, "endBit": 21, "codeField": null, "bcd": { "digits": 3, "digit_Size": 4, "minva1": 0, "maxva1": 180, "msd_Size": 1 } }, { "name": "minutes", "unit": "'", "startBit": 20, "endBit": 9, "codeField": null, "bcd": { "digits": 3, "digit_Size": 4, "minva1": 0, "maxva1": 180, "msd_Size": 4 } }] }, { "index": "012", "name": "Ground Speed", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Ground Speed", "unit": "Knots", "startBit": "29", "endBit": "15", "bcd": { "digits": "4", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "7000" } }] }, { "index": "013", "name": "Track Angle - True", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Track Angle - True", "unit": "Deg", "startBit": "29", "endBit": "15", "bcd": { "digits": "4", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "359.9" } }] }, { "index": "015", "name": "Wind Speed", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Wind Speed", "unit": "Knots", "startBit": "29", "endBit": "19", "bcd": { "digits": "3", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "799" } }] }, { "index": "027", "name": "TACAN Selected Course", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "TACAN Selected Course", "unit": "Deg", "startBit": "29", "endBit": "19", "bcd": { "digits": "3", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "359" } }] }, { "index": "041", "name": "Set Latitude ", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Set Latitude ", "unit": "Deg/Min", "startBit": "29", "endBit": "21", "bcd": { "digits": "3", "msd_Size": "1", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }, { "name": "minutes", "unit": "'", "startBit": "20", "endBit": "9", "bcd": { "digits": "3", "msd_Size": "4", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }] }, { "index": "042", "name": "Present Position - Latitude", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Degrees", "unit": "Deg", "startBit": "29", "endBit": "21", "bcd": { "digits": "3", "msd_Size": "1", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }, { "name": "minutes", "unit": "'", "startBit": "20", "endBit": "9", "bcd": { "digits": "3", "msd_Size": "4", "digit_Size": "4", "minva1": "0", "maxva1": "180" } }] }, { "index": "043", "name": "Set Magnetic Heading", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Set Magnetic Heading", "unit": "Deg", "startBit": "29", "endBit": "19", "bcd": { "digits": "3", "msd_Size": "3", "digit_Size": "4", "minva1": "0", "maxva1": "359" } }] }, { "index": "200", "name": "Drift Angle", "minTxInterval": "250", "maxTxInterval": "500", "fields": [{ "name": "Drift Angle", "unit": "Deg", "startBit": "29", "endBit": "15", "bcd": { "digits": "4", "msd_Size": "4", "digit_Size": "4", "minva1": "-180", "maxva1": "180" } }] }, { "index": "261", "name": "Flight Number", "minTxInterval": "500", "maxTxInterval": "1000", "fields": [{ "name": "Flight Number", "unit": "N/A", "startBit": "29", "endBit": "14", "bcd": { "digits": "4", "msd_Size": "4", "digit_Size": "4", "minva1": "0", "maxva1": "9999" } }] }] }] };

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

            this.selectedAntbot = ko.observable();

            this.onAntbotSelected = function (obj, event) {
                if (self.selectedAntbot() == undefined)
                    return;
                if (cmdConvertService.needBigDataConfig(self.selectedAntbot().antbotType)) {
                    self.needBigData(true);
                    self.currentBigDatatype = null;
                    self.utpService.getProtocol(self.selectedAntbot().protocolSignalId, self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
                }








            };
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

            this.workspace = null;
            this.insertCommandsAsBlock = function (cmdsStrings) {

                var xmlDom = Blockly.Xml.workspaceToDom(self.workspace);
                var xml = Blockly.Xml.domToText(xmlDom);
                self.currentScript.blockyXml(xml);
            };

            this.insertCommandsAsText = function () {
                var cmdsStrings = self.cmdsStrings()
                //命令拼接
                var result = "\n"
                for (var i = 0; i < cmdsStrings.length; i++) {
                    var cmdsString = cmdsStrings[i].cmdsString + cmdConvertService.CMD_SEPARATOR + '\n';
                    result += cmdsString;
                }
                var testcaseBegCmd = cmdConvertService.TESTCASE_BEGIN + cmdConvertService.CMD_SEPARATOR;
                var testcaseEndCmd = cmdConvertService.TESTCASE_END;
                var scriptContent = testcaseBegCmd + result + testcaseEndCmd
                scriptContent = scriptContent.replace(new RegExp(cmdConvertService.CMD_SEPARATOR + "\n", 'g'), cmdConvertService.CMD_SEPARATOR);
                self.currentScript.script(scriptContent);
            };

            this.referTimeSeriesScript = function () {
                //创建用例
                var parentId = self.sourceId;
                self.currentScript.parentScriptGroupId(parentId);
                self.currentScript.projectId(0)
                self.currentScript.name("新建时序用例")
                self.currentScript.type("testcase")

                //整理script命令
                self.insertCommandsAsText();
                //整理blockyXml命令-------未完成
                // self.insertCommandsAsBlock();
                var xml = cmdConvertService.blocklyScriptToXml(self.currentScript.type(), self.currentScript.script());
                self.currentScript.blockyXml(xml);

                self.utpService.createScript(komapping.toJS(self.currentScript), self.createScriptSuccessFunction, self.createScriptErrorFunction);
                $('#commoncreateTimeSeriesScriptModal').modal('hide');
            }



            // create text case
            this.createScriptSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var retNewScript = data.result;
                    if (retNewScript != null) {
                        self.currentScript.name(retNewScript.name)
                        self.currentScript.id(retNewScript.id)
                        self.currentScript.type(retNewScript.type)
                        $$("cfm").add({
                            id: retNewScript.id,
                            value: retNewScript.name,
                            date: new Date(),
                            type: "file",
                            dataType: "usrlogicblock"
                        }, 0, retNewScript.parentScriptGroupId);
                        self.treeAdjust();
                        $$("cfm").refreshCursor();
                        notificationService.showSuccess('创建公共逻辑成功');
                        self.getScriptGroupByProject();
                    } else
                        self.createScriptErrorFunction();
                } else if (data && data.status === 0 && data.result != null) {
                    self.createScriptErrorFunction(data.result.errorMessages);
                } else {
                    self.createScriptErrorFunction();
                }
            };

            this.createScriptErrorFunction = function (errorMessages) {
                if (errorMessages === 'OVER_MAX_SCRIPT_NUM') {
                    notificationService.showError('公共逻辑数量已达上限,请安装对应的许可文件!');
                } else {
                    notificationService.showError('创建公共逻辑失败');
                }
            };

            this.createScript = function (parentId) {
                var defNewscript = {
                    id: 0,
                    customizedId: '',
                    projectId: 0,
                    parentScriptGroupId: parentId,
                    description: '',
                    name: '新建公共逻辑',
                    type:  'usrlogicblock'
                };
                self.utpService.createScript(defNewscript,
                    self.createScriptSuccessFunction,
                    self.createScriptErrorFunction);
            };

            // create sub script
            this.createSubScriptSuccessFunction = function (data) {
            	if (data && data.status === 1) {
            		var retNewSubScript = data.result;
            		if (retNewSubScript != null) {
            			$$("cfm").add({
            				id: retNewSubScript.id,
            				value: retNewSubScript.name,
            				date: new Date(),
            				type: "text",
            				dataType: "usrlogicblock"
            			}, 0, retNewSubScript.parentScriptGroupId);
            			self.treeAdjust();
            			$$("cfm").refreshCursor();
            			notificationService.showSuccess('创建公共逻辑成功');
            			self.getScriptGroupByProject();
            		} else
            			self.createSubScriptErrorFunction();
            	} else if (data && data.status === 0 && data.result != null) {
            		self.createSubScriptErrorFunction(data.result.errorMessages);
            	} else {
            		self.createSubScriptErrorFunction();
            	}
            };

            this.createSubScriptErrorFunction = function (errorMessages) {
            	if (errorMessages === 'OVER_MAX_SUBSCRIPT_NUM') {
            		notificationService.showError('子脚本数量已达上限,请安装对应的许可文件!');
            	} else {
            		notificationService.showError('创建子脚本失败');
            	}
            };

            this.createSubScript = function (parentId) {
            	var defNewScriptGroup = {
            		id: 0,
            		customizedId: '',
            		projectId: 0,
            		parentScriptGroupId: parentId,
            		description: '',
            		name: '新建公共逻辑',
            		parameter: ""
            	};
            	self.utpService.createSubScript(defNewScriptGroup,
            		self.createSubScriptSuccessFunction,
            		self.createSubScriptErrorFunction);
            };

            // edit
            this.editName = function (name) {
                $$("cfm").renameFile(self.selectedItem.id, name);
                self.treeAdjust();
            }

            // edit folder
            this.updateScriptGroupSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var scriptGroup = data.result;
                    if (scriptGroup == null || scriptGroup.name == null
                        || scriptGroup.name == "")
                        self.updateScriptGroupErrorFunction();
                    else {
                        self.editName(scriptGroup.name);
                        notificationService.showSuccess('更新公共逻辑组成功');
                    }
                } else
                    self.updateScriptGroupErrorFunction();
            };

            this.updateScriptGroupErrorFunction = function () {
                self.editName(self.selectedItem.value);
                notificationService.showError('更新公共逻辑组失败');
            };

            this.updateScriptGroup = function (selectedScriptGroup) {
                self.utpService.updateScriptGroup(selectedScriptGroup,
                    self.updateScriptGroupSuccessFunction,
                    self.updateScriptGroupErrorFunction);
            };

            // edit test case
            this.renameScriptSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var script = data.result;
                    if (script == null || script.name == null || script.name == "")
                        self.updateScriptErrorFunction();
                    else {
                        self.editName(script.name);
                        notificationService.showSuccess('更新公共逻辑成功');
                    }
                } else
                    self.updateScriptErrorFunction();
            };

            this.renameScriptErrorFunction = function () {
                self.editName(self.selectedItem.value);
                notificationService.showError('更新公共逻辑失败');
            };

            this.renameScript = function (selectedScript) {
                self.utpService.renameScript(selectedScript,
                    self.renameScriptSuccessFunction,
                    self.renameScriptErrorFunction);
            };

            // edit sub script
            this.renameSubScriptSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var subScript = data.result;
                    if (subScript == null || subScript.name == null || subScript.name == "")
                        self.renameSubScriptErrorFunction();
                    else {
                        self.editName(subScript.name);
                        notificationService.showSuccess('更新子脚本成功');
                    }
                } else
                    self.renameSubScriptErrorFunction();
            };

            this.renameSubScriptErrorFunction = function () {
                notificationService.showError('更新子脚本失败');
            };

            this.renameSubScript = function (selectedSubScript) {
                self.utpService.renameSubScript(selectedSubScript,
                    self.renameSubScriptSuccessFunction,
                    self.renameSubScriptErrorFunction);
            };

            // delete
            this.forceDeleteTargetItem = function () {
                if (self.selectedItem.type === "file" || self.selectedItem.type === "text")
                    self.forceDeleteScript(self.selectedItem.id);
                else if (self.selectedItem.type === "folder")
                    self.forceDeleteScriptGroup(self.selectedItem.id);
            };

            // delete
            this.deleteTargetItem = function () {
                if (self.selectedItem.type === "file")
                    self.deleteScript(self.selectedItem.id);
                else if (self.selectedItem.type === "text")
                    self.deleteSubScript(self.selectedItem.id);
                else if (self.selectedItem.type === "folder")
                    self.deleteScriptGroup(self.selectedItem.id);
            };

            // delete folder
            this.deleteScriptGroupSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    var parentId = $$("cfm").getParentId(
                        self.selectedItem.id);
                    $$("cfm").deleteFile(self.selectedItem.id);
                    $$("cfm").setPath(parentId);
                    self.treeAdjust();
                    notificationService.showSuccess('删除公共逻辑组成功');
                } else
                    notificationService.showError('删除公共逻辑组失败');
            };

            this.deleteScriptGroupErrorFunction = function () {
                notificationService.showError('删除公共逻辑组失败');
            };

            this.deleteScriptGroup = function (id) {
                self.utpService.deleteScriptGroup(0, id,
                    self.deleteScriptGroupSuccessFunction,
                    self.deleteScriptGroupErrorFunction);
            };

            this.forceDeleteScriptGroup = function (id) {
                self.utpService.forceDeleteScriptGroup(0, id,
                    self.deleteScriptGroupSuccessFunction,
                    self.deleteScriptGroupErrorFunction);
            };

            this.getTestRunReference = function (referencesByTestSet) {
                var message = "";
                for (var i = 0; i < referencesByTestSet.length; i++)
                    message += referencesByTestSet[i].name + " ";
                return message;
            };

            // delete script
            this.deleteScriptSuccessFunction = function (data) {
                var State_Success = "Success";
                var State_FailedByReference = "FailedByReference";
                var State_UnknowError = "FailedByUnknowError";
                if (data && data.status === 1 && data.result) {
                    if (data.result.state == State_Success) {
                        $$("cfm").deleteFile(self.selectedItem.id);
                        self.treeAdjust();
                        notificationService.showSuccess('删除公共逻辑成功');
                    } else {
                        var message = self.getTestRunReference(data.result.referencesByTestSet);
                        if (message == "")
                            notificationService.showError("删除公共逻辑失败！");
                        else
                            notificationService.showError("该公共逻辑已被测试集引用：" + message);
                    }
                } else
                    self.deleteScriptErrorFunction();
            };

            this.deleteScriptErrorFunction = function () {
                notificationService.showError('删除公共逻辑失败！');
            };

            this.deleteScript = function (id) {
                self.utpService.deleteScript(0, id,
                    self.deleteScriptSuccessFunction,
                    self.deleteScriptErrorFunction);
            };

            this.forceDeleteScriptSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    $$("cfm").deleteFile(self.selectedItem.id);
                    self.treeAdjust();
                    if (self.selectedItem.type === "file")
                        notificationService.showSuccess('删除公共逻辑成功');
                    else if (self.selectedItem.type === "text")
                        notificationService.showSuccess('删除公共逻辑成功');
                } else
                    self.forceDeleteScriptErrorFunction();
            };

            this.forceDeleteScriptErrorFunction = function () {
                if (self.selectedItem.type === "file")
                    notificationService.showError('删除公共逻辑失败！');
                else if (self.selectedItem.type === "text")
                    notificationService.showError('删除公共逻辑失败！');
            };

            this.forceDeleteScript = function (id) {
                self.utpService.forceDeleteScript(0, id,
                    self.forceDeleteScriptSuccessFunction,
                    self.forceDeleteScriptErrorFunction);
            };

            // delete sub script
            this.getRecoverSubscriptReference = function (referencesByRecoverSubscript) {
                var message = "";
                for (var i = 0; i < referencesByRecoverSubscript.length; i++)
                    message += referencesByRecoverSubscript[i].name + " ";
                return message;
            };

            this.getSubscriptReference = function (referencesByScript) {
                var message = "";
                for (var i = 0; i < referencesByScript.length; i++)
                    message += referencesByScript[i].name + "("
                        + referencesByScript[i].id + ")\n";
                return message;
            };

            this.deleteSubScriptSuccessFunction = function (data) {
                var State_Success = "Success";
                var State_FailedByReference = "FailedByReference";
                var State_UnknowError = "FailedByUnknowError";
                if (data && data.status === 1) {
                    if (data.result.state == State_Success) {
                        $$("cfm").deleteFile(self.selectedItem.id);
                        self.treeAdjust();
                        notificationService.showSuccess('删除公共逻辑成功！');
                    } else {
                        var recoverSubscriptReferenceMessage = self.getRecoverSubscriptReference(data.result.referencesByRecoverSubscript);
                        var subscriptReferenceMessage = self.getSubscriptReference(data.result.referencesByScript);
                        if (recoverSubscriptReferenceMessage == "" && subscriptReferenceMessage == "")
                            notificationService.showError("删除公共逻辑失败！");
                        if (recoverSubscriptReferenceMessage != "")
                            notificationService.showError("该公共逻辑已作为异常恢复脚本：" + recoverSubscriptReferenceMessage);
                        if (subscriptReferenceMessage != "")
                            notificationService.showError("该公共逻辑已被其它测试用例/子脚本引用：" + subscriptReferenceMessage);
                    }
                } else
                    self.deleteSubScriptErrorFunction();
            };

            this.deleteSubScriptErrorFunction = function () {
                notificationService.showError('删除子脚本失败');
            };

            this.deleteSubScript = function (id) {
                self.utpService.deleteSubScript(0, id,
                    self.deleteSubScriptSuccessFunction,
                    self.deleteSubScriptErrorFunction);
            };

            // move script group
            this.moveScriptGroupSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var scriptGroup = data.result;
                    if (scriptGroup != null) {
                        if (self.copyOrCut)
                            self.getScriptGroupByProject();
                        else
                            $$("cfm").moveFile(self.sourceId, self.targetId);
                        $$("cfm").refreshCursor();
                        self.treeAdjust();
                        notificationService.showSuccess('粘贴公共逻辑组成功');
                        $.unblockUI();
                    } else
                        self.moveScriptGroupErrorFunction();
                } else
                    self.moveScriptGroupErrorFunction(data.result.state);
            };

            this.moveScriptGroupErrorFunction = function (errorMessages) {
                $.unblockUI();
                if (errorMessages === 'OVER_MAX_SCRIPT_NUM') {
                    notificationService.showError('公共逻辑数量/子脚本已达上限,请安装对应的许可文件!');
                } else {
                    notificationService.showError('粘贴公共逻辑组失败');
                }
            };

            this.moveScriptGroup = function (sourceId, targetId, copyOrCut) {
                if (copyOrCut) {
                    $.blockUI(utilityService.template);
                    self.utpService.copyScriptGroup(0, sourceId, targetId,
                        self.moveScriptGroupSuccessFunction,
                        self.moveScriptGroupErrorFunction);
                } else
                    self.utpService.cutScriptGroup(0, sourceId, targetId,
                        self.moveScriptGroupSuccessFunction,
                        self.moveScriptGroupErrorFunction);
            };

            // move script
            this.moveScriptSuccessFunction = function (data) {
                $$("cfm").refreshCursor();
                if (data && data.status === 1) {
                    var script = data.result;
                    if (script != null) {
                        if (self.copyOrCut) {
                            // $$("cfm").copyFile(self.sourceId,
                            // self.targetId);
                            if (self.sourceType == "file")
                                $$("cfm").add({
                                    id: script.id,
                                    value: script.name,
                                    date: new Date(),
                                    type: self.sourceType,
                                    dataType: "testcase",
                                    description: script.description,
                                    customizedId: script.customizedId
                                }, 0, script.parentScriptGroupId);
                            else
                                $$("cfm").add({
                                    id: script.id,
                                    value: script.name,
                                    date: new Date(),
                                    type: self.sourceType,
                                    dataType: "usrlogicblock",
                                    description: script.description,
                                    customizedId: script.customizedId
                                }, 0, script.parentScriptGroupId);
                        } else
                            $$("cfm").moveFile(self.sourceId, self.targetId);
                        self.treeAdjust();
                        $$("cfm").refreshCursor();
                        notificationService.showSuccess('粘贴测试用例/子脚本成功');
                    } else
                        self.moveScriptErrorFunction();
                } else
                    self.moveScriptErrorFunction(data.result.errorMessages);
            };

            this.moveScriptErrorFunction = function (errorMessages) {
                if (errorMessages === 'OVER_MAX_SCRIPT_NUM') {
                    notificationService.showError('测试用例数量/子脚本已达上限,请安装对应的许可文件!');
                } else {
                    notificationService.showError('粘贴测试用例/子脚本失败');
                }
            };

            this.moveScript = function (sourceId, targetId, copyOrCut) {
                if (copyOrCut)
                    self.utpService.copyScript(0, sourceId, targetId,
                        self.moveScriptSuccessFunction,
                        self.moveScriptErrorFunction);
                else
                    self.utpService.cutScript(0, sourceId, targetId,
                        self.moveScriptSuccessFunction,
                        self.moveScriptErrorFunction);
            };

            // reference of script
            this.getReferenceOfScriptSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    var message = self
                        .getTestRunReference(data.result.referencesByTestSet);
                    if (message == "")
                        notificationService.showInfo('该测试用例未被引用');
                    else
                        notificationService.showInfo("该测试用例已被测试集引用：" + message);
                } else
                    self.getReferenceOfScriptErrorFunction();
            };

            this.getReferenceOfScriptErrorFunction = function () {
                notificationService.showError('获取测试用例引用失败！');
            };

            this.referenceOfScript = function (sourceId) {
                self.utpService.getReferenceOfScript(self.selectionManager
                        .selectedProject().id, sourceId,
                    self.getReferenceOfScriptSuccessFunction,
                    self.getReferenceOfScriptErrorFunction);
            };

            // reference of sub script
            this.getReferenceOfSubScriptSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    var recoverSubscriptReferenceMessage = self
                        .getRecoverSubscriptReference(data.result.referencesByRecoverSubscript);
                    var subscriptReferenceMessage = self
                        .getSubscriptReference(data.result.referencesByScript);
                    if (recoverSubscriptReferenceMessage == ""
                        && subscriptReferenceMessage == "")
                        notificationService.showInfo('公共逻辑未被引用!');
                    if (recoverSubscriptReferenceMessage != "")
                        notificationService.showInfo("该公共逻辑已作为异常恢复脚本："
                            + recoverSubscriptReferenceMessage);
                    if (subscriptReferenceMessage != "")
                        notificationService.showInfo("该公共逻辑已被其它测试用例/子脚本引用："
                            + subscriptReferenceMessage);
                } else
                    self.getReferenceOfSubScriptErrorFunction();
            };

            this.getReferenceOfSubScriptErrorFunction = function () {
                notificationService.showError('获取子脚本引用失败');
            };

            this.referenceOfSubScript = function (sourceId) {
                self.utpService.getReferenceOfSubScript(
                    0,
                    sourceId,
                    self.getReferenceOfSubScriptSuccessFunction,
                    self.getReferenceOfSubScriptErrorFunction);
            };

            this.transitToSubscriptSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    if (data.result.state == "Success") {
                        self.selectedItem.type = "text";
                        self.selectedItem.dataType = "usrlogicblock";
                        self.selectedItem.parameter = null;
                        notificationService.showSuccess('测试用例转换子脚成功!');
                        $$("cfm").refreshCursor();
                    }
                    if (data.result.state == "FailedByReference") {
                        var testset = data.result.referencesByTestSet;
                        if (testset && testset.length > 0)
                            notificationService.showWarn("该用例已被" + testset[0].name + "等测试集引用，不能转换成子脚本！");
                        else
                            notificationService.showWarn("该用例已被测试集引用，不能转换成子脚本！");
                    }
                } else
                    self.transitToSubscriptErrorFunction();
            };

            this.transitToSubscriptErrorFunction = function () {
                notificationService.showError('测试用例转换成子脚本失败');
            };

            this.convertToSubScript = function (item) {
                if (item.dataType != "testcase")
                    notificationService.showWarn('类型不匹配，无法转换！');
                var obj = {
                    projectId: 0,
                    scriptId: item.id,
                };
                self.utpService.transitToSubscript(
                    obj,
                    self.transitToSubscriptSuccessFunction,
                    self.transitToSubscriptErrorFunction);
            };

            this.transitToScriptSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    if (data.result.state == "Success") {
                        self.selectedItem.type = "file";
                        self.selectedItem.dataType = "testcase";
                        delete self.selectedItem.parameter;
                        notificationService.showSuccess('子脚本转换为测试用例成功!');
                        $$("cfm").refreshCursor();
                    }
                    else if (data.result.state == "FailedByReference") {
                        var script = data.result.referencesByScript;
                        var recover = data.result.referencesByRecoverSubscript;
                        if (script && script.length > 0)
                            notificationService.showWarn("该子脚本已经被" + script[0].name + "等其它脚本或者测试用例引用，不能转换成测试用例！");
                        else if (recover && recover.length > 0)
                            notificationService.showWarn("该子脚本已经作为异常恢复脚本，不能转换成测试用例！");
                        else
                            notificationService.showWarn("该子脚本已被引用，不能转换成测试用例！");
                    }
                    else if (data.result.state == "FailedByParameterNotEmpty")
                        notificationService.showWarn("带参子脚本不能转换成测试用例！");
                    else if (subscriptReferenceMessage == "FailedByUnknowError")
                        self.transitToScriptErrorFunction();
                    else
                        self.transitToScriptErrorFunction();
                } else
                    self.transitToScriptErrorFunction();
            };

            this.transitToScriptErrorFunction = function () {
                notificationService.showError('子脚本转换为测试用例失败');
            };

            this.convertToTestCase = function (item) {
                if (item.dataType != "usrlogicblock")
                    notificationService.showWarn('类型不匹配，无法转换！');
                var parameter = item.parameter;
                if (parameter) {
                    var parameters = JSON.parse(parameter);
                    if (parameters.length > 0) {
                        notificationService.showWarn('子脚本包含参数，无法转换为测试用例！');
                        return;
                    }
                }
                var obj = {
                    projectId: 0,
                    subscriptId: item.id,
                };
                self.utpService.transitToScript(
                    obj,
                    self.transitToScriptSuccessFunction,
                    self.transitToScriptErrorFunction);
            };

            this.referScript = function () {
                var checkedIds = self.subScriptTree.getChecked();
                if (checkedIds == null || checkedIds.length == 0) {
                    notificationService.showWarn('请选择至少一个用例或者子脚本！');
                    return;
                }
                var scriptIds = [];
                var scriptGroupIds = [];
                var targetScriptGroupId = self.sourceId;
                for (var i = 0; i < checkedIds.length; i++) {
                    var nodeId = checkedIds[i];
                    var item = self.subScriptTree.getItem(nodeId);
                    if (item.dataType == 'usrlogicblock' || item.dataType == 'testcase') {
                        scriptIds.push(nodeId);
                        if (item.$parent && item.$parent != undefined)
                            scriptGroupIds.push(item.$parent);
                    }
                    if (item.dataType === 'scriptGroup')
                        scriptGroupIds.push(nodeId);
                }
                if (scriptIds.length > 0) {
                    var uniqueScriptGroupIds = [];
                    for (var i = 0; i < scriptGroupIds.length; i++) {
                        if (uniqueScriptGroupIds.indexOf(scriptGroupIds[i]) === -1) {
                            uniqueScriptGroupIds.push(scriptGroupIds[i]);
                        }
                    }
                    if (targetScriptGroupId === fileManagerUtility.root)
                        targetScriptGroupId = 0;
                    var configObj = {
                        sourceProjectId: self.selectedTargetProject.id,
                        targetProjectId: 0,
                        targetScriptGroupId,
                        scriptIds,
                        scriptGroupIds: uniqueScriptGroupIds
                    }
                    self.utpService.copyScriptAcrossProject(configObj, function (data) {
                        if (data && data.status === 1 && data.result) {
                            notificationService.showSuccess('导入成功！');
                            self.getScriptGroupByProject();
                            $$("cfm").refreshCursor();
                            self.treeAdjust();
                        }
                        else
                            notificationService.showError('导入失败！');
                    }, function (error) {
                        notificationService.showError('导入失败！');
                    })
                    $('#commonreferScriptModal').modal('hide');
                }
                else
                    notificationService.showInfo('所选用例组不包含任何测试用例或者子脚本！');
            };

            self.exportData = null;
            self.excelReport = {
                "conditions": [],
                "styles": [],
                "spans": [],
                "ranges": [],
                "sizes": [],
                "table": {
                    "frozenColumns": 0,
                    "frozenRows": 0,
                    "gridlines": 1,
                    "headers": 1
                },
                "data": [],
                "locked": [],
                "editors": [],
                "filters": [],
                "formats": [],
                "comments": []
            }
            self.spreadSheet = null;
            this.exportScript = function (nodes) {
                if (nodes == null && nodes.length == 0) {
                    notificationService.showInfo('暂无信息!');
                    return;
                }
                self.exportData = new Map();
                self.excelReport.data = [[1, 1, "ID", ""], [1, 2, "公共逻辑ID", ""],
                    [1, 3, "路径", ""], [1, 4, "名称", ""],
                    [1, 5, "类型", ""], [1, 6, "内容", ""],
                    [1, 7, "参数", ""], [1, 8, "备注", ""]];
                var fetchDataList = [];
                var testCaseIdList = [];
                var subScriptIdList = [];
                nodes.map(function (node) {
                    self.exportData.set(node.id, node);
                    if (node.type == 'testcase')
                        testCaseIdList.push(node.id);
                    else
                        subScriptIdList.push(node.id);
                });

                if (testCaseIdList.length > 0) {
                    var testCaseIds = testCaseIdList.join(',');
                    var fetchTestCaseDataPromise = new Promise(function (
                        resolve, reject) {
                        self.utpService.getFullScripts(
                            0,
                            testCaseIds, function (data) {
                                if (data && data.status === 1 && data.result)
                                    resolve(data.result);
                                else
                                    reject(data.errorMessage);
                            }, function (error) {
                                reject(error);
                            }, false);
                    });
                    fetchDataList.push(fetchTestCaseDataPromise);
                }

                if (subScriptIdList.length > 0) {
                    var subScriptIds = subScriptIdList.join(',');
                    var fetchSubScriptDataPromise = new Promise(function (
                        resolve, reject) {
                        self.utpService.getFullSubScripts(
                            0,
                            subScriptIds, function (data) {
                                if (data && data.status === 1 && data.result)
                                    resolve(data.result);
                                else
                                    reject(data.errorMessage);
                            }, function (error) {
                                reject(error);
                            }, false);
                    });
                    fetchDataList.push(fetchSubScriptDataPromise);
                }

                if (fetchDataList.length > 0) {
                    $.blockUI(utilityService.template);
                    Promise.all(fetchDataList).then(
                        function (results) {
                            if (results && results.length > 0) {
                                results.map(function (data) {
                                    if (data && data.length > 0) {
                                        data.map(function (node) {
                                            var currentNode = self.exportData.get(node.id);
                                            if (currentNode) {
                                                currentNode.description = node.description;
                                                if (currentNode.type == "testcase" && node.script != null) {
                                                    node.script = node.script.substring(node.script.indexOf(cmdConvertService.CMD_SEPARATOR));
                                                    node.script = node.script.replace('TESTCASE_END', '');
                                                }
                                                var scriptContent = cmdConvertService.generatecmdStepList(node.script, true);
                                                currentNode.script = scriptContent.replace(
                                                    new RegExp(cmdConvertService.CMD_SEPARATOR, 'g'), '\n');
                                                currentNode.parameter = node.type == "usrlogicblock" ? (node.parameter != null && node.parameter.length > 2 ? node.parameter
                                                        : "")
                                                    : "";
                                                currentNode.customizedId = node.customizedId;
                                                self.exportData.set(node.id, currentNode);
                                            }
                                        });
                                    }
                                });

                                var i = 1;
                                self.exportData.forEach(function (value, key, map) {
                                    self.excelReport.data.push([++i, 1, value.id, ""]);
                                    self.excelReport.data.push([i, 2, value.customizedId, ""]);
                                    self.excelReport.data.push([i, 3, value.path, ""]);
                                    self.excelReport.data.push([i, 4, value.name, ""]);
                                    self.excelReport.data.push([i, 5, value.type == "testcase" ? "测试用例" : "子脚本", ""]);
                                    self.excelReport.data.push([i, 6, value.script, ""]);
                                    self.excelReport.data.push([i, 7, value.parameter, ""]);
                                    self.excelReport.data.push([i, 8, value.description, ""]);
                                });

                                if (self.spreadSheet)
                                    self.spreadSheet.destructor();
                                self.spreadSheet = webix.ui({
                                    id: "excelReport",
                                    view: "spreadsheet",
                                    data: self.excelReport
                                });
                                webix.toExcel(
                                    "excelReport",
                                    {
                                        filename: self.selectionManager.selectedProject().name
                                    });
                                self.spreadSheet.destructor();
                                self.spreadSheet = null;
                                $.unblockUI();
                            }
                        },
                        function (errors) {
                            $.unblockUI();
                            notificationService.showError('数据导出失败！');
                        });
                }

            }

            this.fetchWordDataSuccessFunction = function (data) {
                if (data != null && data.status === 1) {
                    var result = data.result;
                    var a = document.createElement("a");
                    a.download = result.fileName;
                    a.href = result.filePath;
                    $("body").append(a);
                    a.click();
                }
                else
                    notificationService.showError('导出word用例失败');
                $.unblockUI();
            };

            this.fetchWordDataErrorFunction = function (error) {
                notificationService.showError('导出word用例失败');
            };
            this.permissionErrorFunction = function () {
                notificationService.showError('该功能无法使用,请安装相应许可！');
            };
            this.exportWord = function (item) {
                var enable = self.systemConfig.getEnableByFeatureName('utpclient.testcase_mgr.export_word')
                if (!enable) {
                    self.permissionErrorFunction();
                    return;
                }
                if (item.type === "folder") {
                    var id = item.id;
                    if (id === fileManagerUtility.root)
                        id = 0;
                    utpService.exportScriptGroup(0, id, self.fetchWordDataSuccessFunction, self.fetchWordDataErrorFunction);
                }
                else
                    utpService.exportScript(0, item.id, self.fetchWordDataSuccessFunction, self.fetchWordDataErrorFunction);
            };
            this.sourceId = "";
            this.sourceType = ""; // text, folder, script
            this.copyOrCut = true; // true: copy, false, cut
            this.targetId = "";
            this.selectedItem = null;
            this.selectedTargetProject = null;

            this.onProjectSelected = function (obj, event) {
                if (self.selectedTargetProject == undefined)
                    return;
                self.utpService.getFlatScriptGroupByProject(
                    self.selectedTargetProject.id,
                    'logicblock',
                    function (data) {
                        if (data != null && data.status === 1
                            && data.result != null) {
                            var scriptGroups = self.projectManager
                                .getnerateTargetProjectScriptGroupsFromFlatInfo(self.selectedTargetProject.name, data.result);
                            var root = [];
                            root.push(scriptGroups);
                            self.initScriptTree(root);
                        } else
                            notificationService.showError('获取项目公共逻辑信息失败');
                    },
                    function () {
                        notificationService.showError('获取项目公共逻辑信息失败');
                    });
            };

            this.initScriptTree = function (data) {
                $('#commonreferScriptTreeview').html('');
                webix.ready(function () {
                    self.subScriptTree = webix.ui({
                        container: "commonreferScriptTreeview",
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
                            this.sort("value", "asc", "string");
                        }
                    });
                });
            }

            this.localeCompare = function (data1, data2) {
                return data1.localeCompare(data2);
            };

            this.treeAdjust = function () {
                // $$("cfm").data.sort("value","asc", self.localeCompare);
                $$("cfm").$$("table").sort("#value#", "asc", "string");
                $$("cfm").$$("table").markSorting("value", "asc");
                $$("cfm").$$("table").attachEvent("onAfterSort",
                    function (by, dir, as) {
                        $$("cfm").$$("tree").sort("#" + by + "#", dir, as);
                    });
                $$("cfm").$$("tree").closeAll();

                if (self.projectManager.currentTestCaseOpenFolders != null && self.projectManager.currentTestCaseOpenFolders.length > 1) {
                    $$("cfm").$$("tree").open(self.projectManager.currentTestCaseOpenFolders[self.projectManager.currentTestCaseOpenFolders.length - 2], true);
                    $$("cfm").$$("tree").select(self.projectManager.currentTestCaseOpenFolders[self.projectManager.currentTestCaseOpenFolders.length - 1]);
                } else {
                    $$("cfm").$$("tree").open(fileManagerUtility.root);
                    $$("cfm").$$("tree").select(fileManagerUtility.root);
                }
            }

            this.getManager = function () {
                return;
            }

            this.initCommonScriptManager = function () {
                this.viewManager.comantbotActivePage('app/viewmodels/antbot_com');
                webix.ready(function () {
                    fileManagerUtility.commonConfigInit();
                    webix.ui({
                        container: "commonscript_div",
                        id: "commonscript_accord",
                        multi: true,
                        view: "accordion",
                        minHeight: 700,
                        cols: [
                            {
                                view: "filemanager",
                                id: "cfm",
                                minHeight: 700,
                                minWidth: 800,
                                scroll: true,
                                // container: 'fm',
                                on: {
                                    "onViewInit": function (name, config) {
                                        if (name === 'search')
                                            config.placeholder = "查找ID/公共逻辑ID/名称";
                                        else if (name == "table") {
                                            var columns = config.columns;
                                            columns.splice(3, 1);
                                            columns.splice(1, 1);
                                            for (var i = 0; i < columns.length; i++)
                                                columns[i].header = {
                                                    text: columns[i].header,
                                                    css: {
                                                        "text-align": "left"
                                                    }
                                                };
                                            var descriptionColumn = {
                                                id: "description",
                                                header: {
                                                    text: "备注",
                                                    css: { "text-align": "left" }
                                                },
                                                fillspace: 5,
                                                sort: "string",
                                                template: function (obj, common) {
                                                    if (obj.description == undefined
                                                        || obj.description == null)
                                                        return "";
                                                    return obj.description;
                                                }
                                            };
                                            var idColumn = {
                                                id: "id",
                                                header: {
                                                    text: "系统ID",
                                                    css: { "text-align": "left" }
                                                },
                                                fillspace: 1,
                                                sort: "int",
                                                template: function (obj, common) {
                                                    if (obj.id == undefined
                                                        || obj.id == null)
                                                        return "";
                                                    return obj.id;
                                                }
                                            };
                                            var customizedIdColumn = {
                                                id: "customizedId",
                                                header: {
                                                    text: "公共逻辑ID",
                                                    css: { "text-align": "left" }
                                                },
                                                fillspace: 1,
                                                sort: "string",
                                                template: function (obj, common) {
                                                    if (obj.customizedId == undefined || obj.customizedId == null)
                                                        return "";
                                                    return obj.customizedId;
                                                }
                                            };
                                            columns.splice(2, 0, customizedIdColumn);
                                            columns.splice(3, 0, descriptionColumn);
                                            columns.splice(5, 0, idColumn);
                                            // 将idColumn放入数组最后一项
                                        }
                                        if (name == "table" || name == "files")
                                            config.select = true;

                                        if (name == "table" || name == "tree" || name == "files")
                                            config.drag = false;
                                    },

                                    "onSubViewCreate": function (view, item) {
                                        view.parse(item.outlets);
                                        view.config.id = "test";
                                    },
                                    "onBeforeUploadDialog": function (id) {
                                        $('#commonreferScriptModal').modal({ show: true });
                                        self.sourceId = id;
                                        return false;
                                    },
                                    "onBeforeFileUpload": function (config) {
                                        return false;
                                    },
                                    "onBeforeAdd": function (id, item) {
                                        return true;
                                    },

                                    "onBeforeCreateFolder": function (parentId) {
                                        if (parentId === fileManagerUtility.root)
                                            parentId = "";
                                        self.createScriptGroup(parentId);
                                        $$("cfm").getMenu().hide();
                                        return false;
                                    },

                                    // disable delete
                                    // demo file
                                    "onBeforeDeleteFile": function (id) {
                                        var item = $$("cfm").getItem(id);
                                        item.id = id;
                                        if (item.type === "folder" && $$("cfm").getFirstChildId(item.id) != null) {
                                            notificationService.showError('公共逻辑组不为空，不允许删除！');
                                        } else {
                                            self.selectedItem = item;
                                            $('#commondeleteTestcaseModal').modal('show');
                                        }
                                        $$("cfm").getMenu().hide();
                                        return false;
                                    },

                                    "onBeforeMarkCopy": function (id) {
                                        var item = $$("cfm").getItem(id);
                                        self.sourceType = item.type;
                                        self.copyOrCut = true;
                                        self.sourceId = id;
                                        return true;
                                    },

                                    "onBeforeMarkCut": function (id) {
                                        var item = $$("cfm").getItem(id);
                                        self.sourceType = item.type;
                                        self.copyOrCut = false;
                                        self.sourceId = id;
                                        return true;
                                    },

                                    "onBeforePasteFile": function (targetId) {
                                        if (self.sourceId == "" || self.sourceType == "") {
                                            $$("cfm").getMenu().hide();
                                            return false;
                                        }

                                        var candidateTargetId = targetId;
                                        while (candidateTargetId != fileManagerUtility.root && self.sourceId != candidateTargetId)
                                            candidateTargetId = $$("cfm").getParentId(candidateTargetId);

                                        if (self.sourceId == candidateTargetId) {
                                            $$("cfm").getMenu().hide();
                                            return false;
                                        }

                                        if (targetId === fileManagerUtility.root)
                                            targetId = 0;
                                        self.targetId = targetId;

                                        if (self.sourceType == "folder")
                                            self.moveScriptGroup(self.sourceId, self.targetId, self.copyOrCut);
                                        else
                                            self.moveScript(self.sourceId, self.targetId, self.copyOrCut);
                                        $$("cfm").getMenu().hide();
                                        return false;
                                    },

                                    "onHistoryChange": function (path, ids, cursor) {
                                        if (self.initFinish) {
                                            self.projectManager.currentTestCasePath = path;
                                            self.projectManager.currentTestCaseOpenFolders = $$("cfm").getPath();
                                        }
                                        return true;
                                    },

                                    "onAfterLoad": function () {
                                        $$("cfm").setPath(self.projectManager.currentTestCasePath);
                                        self.initFinish = true;
                                    },

                                    "onAfterShowTree": function () {
                                        $$("cfm").setPath(self.projectManager.currentTestCasePath);
                                        self.initFinish = true;
                                    },

                                    "onBeforeEditFile": function (id) {
                                        var item = $$("cfm").getItem(id);
                                        // if (item.type === "file" || item.type === "text") {
                                        // 	self.selectionManager.selectedNodeId(item.id);
                                        // 	self.selectionManager.selectedNodeType = item.dataType;
                                        // 	self.gotoPlayground();
                                        // 	$$("cfm").getMenu().hide();
                                        // 	return false;
                                        // }
                                        return true;
                                    },

                                    "onBeforeEditStop": function (id, state, editor, view) {
                                        if (state.value === null || state.value == "") {
                                            state.value = state.old;
                                            notificationService.showWarn('名称不能为空');
                                        }

                                        if (state.value.length > self.maxNameLength) {
                                            state.value = state.old;
                                            notificationService.showWarn('名称长度不能超过' + self.maxNameLength);
                                        }

                                        var reg = /[@%\^&<>]+/g;
                                        if (state.value.match(reg) != null) {
                                            state.value = state.old;
                                            notificationService.showWarn('名称不能包含@%^&<>等特殊字符');
                                        }
                                    },

                                    "onAfterEditStop": function (id, state, editor, view) {
                                        var item = $$("cfm").getItem(id);
                                        if (state.value === state.old)
                                            return true;

                                        self.selectedItem = item;
                                        var parentId = item.$parent;
                                        if (item.$parent === fileManagerUtility.root)
                                            parentId = "";
                                        if (item.type === "folder") {
                                            var selectedScriptGroup = {
                                                id: id,
                                                name: state.value,
                                                description: '',
                                                projectId: 0,
                                                parentScriptGroupId: parentId,
                                                type: 'logicblock'
                                            };
                                            self.updateScriptGroup(selectedScriptGroup);
                                        } else if (item.type === "file" || item.type === "text") {
                                            var selectedScript = {
                                                id: id,
                                                name: state.value,
                                                projectId: 0,
                                            }
                                            self.renameScript(selectedScript);

                                        }
                                        $$("cfm").getMenu().hide();
                                        return false;
                                    },

                                    "onItemClick": function (id, e, node) {
                                        if (id === 'configCustomizedField') {
                                            $('#commonscriptCustomizedFieldModal').modal({ show: true });
                                            $$("cfm").getMenu().hide();
                                        }

                                        if (id === "verify") {
                                            var itemId = $$("cfm").getActive();
                                            var item = $$("cfm").getItem(itemId);
                                            if (item.type === "file") {
                                                self.selectionManager.selectedNodeId(item.id);
                                                self.selectionManager.selectedNodeType = item.dataType;
                                                self.gotoExecution();
                                            } else if (item.type === "text") {
                                                self.selectionManager.selectedNodeId(item.id);
                                                self.selectionManager.selectedNodeType = item.dataType;
                                                self.gotoExecution();
                                            }
                                            $$("cfm").getMenu().hide();
                                        }

                                        if (id === "reference") {
                                            var itemId = $$("cfm").getActive();
                                            var item = $$("cfm").getItem(itemId);
                                            if (item.type === "file")
                                                self.referenceOfScript(item.id);
                                            else if (item.type === "text")
                                                self.referenceOfSubScript(item.id);
                                            $$("cfm").getMenu().hide();
                                        }

                                        if (id === "refresh") {
                                            self.getScriptGroupByProject();
                                            $$("cfm").getMenu().hide();
                                        }

                                        if (id === "createTestCase") {
                                            var parent = $$("cfm").getCurrentFolder();
                                            if (parent === fileManagerUtility.root)
                                                parent = "";
                                            self.createSubScript(parent);
                                            $$("cfm").getMenu().hide();
                                        }
                                        if (id === "createTimeSeriesTestCase") {
                                            var parent = $$("cfm").getCurrentFolder();
                                            if (parent === fileManagerUtility.root)
                                                parent = "";
                                            $('#commoncreateTimeSeriesScriptModal').modal('show');
                                            self.sourceId = parent;
                                            $$("cfm").getMenu().hide();

                                        }
                                        if (id === "convertScript") {
                                            var itemId = $$("cfm").getActive();
                                            var item = $$("cfm").getItem(itemId);
                                            self.selectedItem = item;
                                            if (item.type === "file")
                                                self.convertToSubScript(item);
                                            else if (item.type === "text")
                                                self.convertToTestCase(item);
                                            $$("cfm").getMenu().hide();
                                        }

                                        if (id === "forceRemove") {
                                            var itemId = $$("cfm").getActive();
                                            var item = $$("cfm").getItem(itemId);
                                            self.selectedItem = item;
                                            $('#commonforcecommondeleteTestcaseModal').modal('show');
                                            $$("cfm").getMenu().hide();
                                            return false;
                                        }
                                        if (id === "exportWord") {
                                            var itemId = $$("cfm").getActive();
                                            var item = $$("cfm").getItem(itemId);
                                            self.exportWord(item);
                                            return false;
                                        }
                                        if (id === "export") {
                                            var itemId = $$("cfm").getActive();
                                            var item = $$("cfm").getItem(itemId);
                                            var nodes = [];
                                            if (item.type === "file" || item.type === "text") {
                                                var parentId = $$("cfm").getCurrentFolder();
                                                var pathNames = $$("cfm").getPathNames(parentId).map(
                                                    function (elem) {
                                                        return elem.value;
                                                    }).join("/");
                                                var node = {
                                                    id: itemId,
                                                    name: item.value,
                                                    path: pathNames + "/",
                                                    type: item.dataType
                                                };
                                                nodes.push(node);
                                            } else if (item.type === "folder") {
                                                $$("cfm").data.eachLeaf(itemId,
                                                    function (obj) {
                                                        var parentId = $$("cfm").getParentId(obj.id);
                                                        var pathNames = $$("cfm").getPathNames(parentId).map(
                                                            function (elem) {
                                                                return elem.value;
                                                            })
                                                            .join("/");
                                                        var node = {
                                                            id: obj.id,
                                                            name: obj.value,
                                                            path: pathNames + "/",
                                                            type: obj.dataType
                                                        };
                                                        nodes.push(node);
                                                    });
                                            }
                                            self.exportScript(nodes);
                                            $$("cfm").getMenu().hide();
                                        }

                                        // if (id === "createSubScript") {
                                        // 	var parent = $$("cfm").getCurrentFolder();
                                        // 	if (parent === fileManagerUtility.root)
                                        // 		parent = "";
                                        // 	self.createSubScript(parent);
                                        // 	$$("cfm").getMenu().hide();
                                        // }
                                        return true;
                                    },
                                },

                                ready: function () {
                                    var actions = this.getMenu();
                                    var createItem = actions.getItem("create");
                                    createItem.value = "新建公共逻辑组";
                                    var uploadItem = actions.getItem("upload");
                                    uploadItem.value = "跨项目脚本导入";
                                    //移除actions里的导入菜单项
                                    if (!self.systemConfig.getConfig("utpclient.testcase_mgr.import")) {
                                        actions.remove("upload");
                                    }
                                    actions.add(
                                        {
                                            id: "createTestCase",
                                            icon: "fm-file",
                                            value: "新建公共逻辑"
                                        },
                                        5);
                                    if (self.systemConfig.getConfig("utpclient.testcase_mgr.timing_use_case")) {
                                        actions.add(
                                            {
                                                id: "createTimeSeriesTestCase",
                                                icon: "fm-file",
                                                value: "新建时序用例"
                                            },
                                            7);
                                    }
                                    // actions.add(
                                    // 	{
                                    // 		id: "createSubScript",
                                    // 		icon: "fm-file-text",
                                    // 		value: "新建子脚本"
                                    // 	},
                                    // 	6);
                                    // actions.add(
                                    //         {
                                    //             id : "convertScript",
                                    //             icon : "webix_fmanager_icon fa-exchange",
                                    //             value : "用例/脚本转换"
                                    //         },
                                    //         9);
                                    actions.add({
                                        $template: "Separator"
                                    });
                                    // actions.add(
                                    //                 {
                                    //                     id : "verify",
                                    //                     icon : "webix_fmanager_icon fa-cog",
                                    //                     value : "验证测试用例"
                                    //                 },
                                    //                 11);
                                    actions.add(
                                        {
                                            id: "reference",
                                            icon: "webix_fmanager_icon fa-link",
                                            value: "查找所有引用"
                                        },
                                        12);
                                    if (self.systemConfig.getConfig("utpclient.testcase_mgr.export_excel")) {
                                        actions.add(
                                            {
                                                id: "export",
                                                icon: "webix_fmanager_icon fa-download",
                                                value: "导出"
                                            },
                                            13);
                                    }
                                    if (self.systemConfig.getConfig("utpclient.testcase_mgr.export_word")) {
                                        actions.add(
                                            {
                                                id: "exportWord",
                                                icon: "webix_fmanager_icon fa-file-word-o",
                                                value: "导出Word"
                                            },
                                            14);
                                    }
                                    actions.add(
                                        {
                                            id: "refresh",
                                            icon: "webix_fmanager_icon fa-refresh",
                                            value: "刷新"
                                        },
                                        15);
                                    actions.add(
                                        {
                                            id: "forceRemove",
                                            icon: "webix_fmanager_icon fa-trash",
                                            value: "强制删除"
                                        },
                                        16);
                                    if (self.systemConfig.getConfig("utpclient.testcase_mgr.customize_field")) {
                                        actions.add(
                                            {
                                                id: "configCustomizedField",
                                                icon: "webix_fmanager_icon fa-tag",
                                                value: "自定义字段"
                                            },
                                            17);
                                    }
                                    //移除所有选项
                                    if (self.systemConfig.getConfig("utpclient.testcase_mgr.readonlymode")) {
                                        actions.remove("create");
                                        actions.remove("createTestCase");
                                        actions.remove("createTimeSeriesTestCase");
                                        // actions.remove("createSubScript");
                                        actions.remove("convertScript");
                                        actions.remove("upload");
                                        actions.remove("remove");
                                        actions.remove("forceRemove");
                                        actions.remove("edit");
                                        actions.remove("cut");
                                        actions.remove("copy");
                                        actions.remove("paste");
                                        //移除自定义字段
                                        actions.remove("configCustomizedField");
                                        //移除验证测试用例
                                        actions.remove("verify");

                                    }

                                    self.treeAdjust();
                                    $$('common_antbot_control').collapse();
                                },

                                menuFilter: function (obj) {
                                    var actions = $$("cfm").getMenu();
                                    var dataId = actions.getContext().id;
                                    if (dataId === undefined) {
                                        if (obj.id === "verify" || obj.id === "reference" || obj.id === "export" || obj.id === 'exportWord' || obj.id === "convertScript" || obj.id === "forceRemove")
                                            return false;
                                        var parent = $$("cfm").getCurrentFolder();
                                        if (parent === fileManagerUtility.root) {
                                            if (obj.id === "createTestCase"
                                                // || obj.id === "createSubScript"
                                                || obj.id === "remove"
                                                || obj.id === "forceRemove"
                                                || obj.id === "edit"
                                                || obj.id === "cut"
                                                || obj.id === "copy"
                                                || obj.id == "convertScript"
                                                || obj.id === "createTimeSeriesTestCase")
                                                return false;
                                            if ((self.sourceType == "file" || self.sourceType == "text") && obj.id === "paste")
                                                return false;
                                        }
                                    } else {
                                        var item = $$("cfm").getItem(dataId);
                                        if (item.type === "folder") {
                                            if (obj.id === "verify" || obj.id === "reference" || obj.id == "convertScript")
                                                return false;
                                        }
                                        if (item.type === "file") {
                                            if (obj.id === "createTestCase"
                                                || obj.id === "createTimeSeriesTestCase"
                                                // || obj.id === "createSubScript"
                                                || obj.id === "upload"
                                                || obj.id === "create")
                                                return false;
                                        }
                                        if (item.type === "text") {
                                            if (obj.id === "createTestCase"
                                                || obj.id === "createTimeSeriesTestCase"
                                                // || obj.id === "createSubScript"
                                                || obj.id === "create"
                                                || obj.id === "upload"
                                                || obj.id === "exportWord"
                                                || obj.id === "verify")
                                                return false;
                                        }
                                        if (dataId === fileManagerUtility.root) {
                                            if (obj.id === "createTestCase"
                                                || obj.id === "createTimeSeriesTestCase"
                                                // || obj.id === "createSubScript"
                                                || obj.id === "remove"
                                                || obj.id === "forceRemove"
                                                || obj.id === "edit"
                                                || obj.id === "cut"
                                                || obj.id === "copy"
                                                || obj.id === "convertScript")
                                                return false;
                                            // not allowed script and subscript under root directly
                                            if ((self.sourceType == "file" || self.sourceType == "text")
                                                && obj.id === "paste")
                                                return false;
                                        }
                                    }
                                    return true;
                                }
                            }, {
                                view: "resizer"
                            }, {
                                header: "测试机器人管理",
                                id: "common_antbot_control",
                                body: {
                                    view: "htmlform",
                                    content: "commonantbotinfo",
                                },
                                width: 400,
                                minWidth: 400,
                                minHeight: 600,
                                scroll: false
                            }]
                    });
                    self.projectManager.setScriptGroupManager($$("cfm"));
                    $$("cfm").$$("files").define({
                        tooltip: function (obj) {
                            return obj.value;
                        }
                    });

                    $$("cfm").$$("table").define({
                        tooltip: function (obj, common) {
                            var column = common.column.id;
                            if (column == "type") {
                                if (obj[column] == 'folder')
                                    return "公共逻辑组";
                                if (obj[column] == 'text')
                                    return "公共逻辑";
                                if (obj[column] == 'file')
                                    return "公共逻辑";
                            }
                            else if (column == "location") {
                                var parents = $$("cfm").getPathNames(obj.id);
                                var path = [];
                                parents.slice(1, parents.length - 1).forEach(function (parent) {
                                    path.push(parent.value);
                                })
                                return path.join("/");
                            }
                            else if (obj[column] === null || obj[column] === undefined)
                                return "";
                            return obj[column];
                        }
                    });

                    $$("cfm").$$("tree").define({
                        tooltip: function (obj) {
                            return obj.value;
                        }
                    });

                    $$("cfm").$$("table").attachEvent("onItemDblClick", function (id, e, node) {
                        var item = $$("cfm").getItem(id.row);
                        if (item.type === "file" || item.type === "text") {
                            self.selectionManager.selectedNodeId(item.id);
                            self.selectionManager.selectedNodeType = item.dataType;
                            self.gotoPlayground();
                        }
                    });

                    $$("cfm").$$("files").attachEvent("onItemDblClick", function (id, e, node) {
                        var item = $$("cfm").getItem(id);
                        if (item.type === "file" || item.type === "text") {
                            self.selectionManager.selectedNodeId(item.id);
                            self.selectionManager.selectedNodeType = item.dataType;
                            self.gotoPlayground();
                        }
                    });

                    $$("cfm").getSearchData = function (id, value) {
                        var found = [];
                        this.data.each(function (obj) {
                            var text = this.config.templateName(obj);
                            var id = obj.id + '';
                            if (text.toLowerCase().indexOf(value.toLowerCase()) >= 0 || id.toLowerCase().indexOf(value.toLowerCase()) >= 0)
                                found.push(webix.copy(obj));
                            if (obj.customizedId && obj.customizedId.toLowerCase().indexOf(value.toLowerCase()) >= 0)
                                found.push(webix.copy(obj));
                        }, this, true, id);
                        return found;
                    }
                });

            }

            this.commonscriptContainerAdjust = function () {
                var parent = document
                    .getElementById("commonscriptinfo").parentNode;
                $$("commonscript_accord").define("width",
                    parent.clientWidth);
                $$("commonscript_accord").resize();
                $$("cfm").define("height", "700");
                $$("cfm").resize();
                // 增加了对 $$("cfm") 是否存在的检查，以及 $view 属性是否存在 的检查
                var fmView = $$("cfm");
                if (fmView && fmView.$view) {
                    // 获取具有 webix_ss_body 类的元素
                    var centerElements = fmView.$view.getElementsByClassName("webix_ss_hscroll webix_vscroll_x");
                    // 检查是否找到了具有 webix_ss_body 类的元素
                    if (centerElements.length > 0) {
                        // 对找到的第一个元素应用样式调整,使其下拉框下边留白30px
                        centerElements[0].style.paddingBottom = "50px";
                    }
                    var centerElements = fmView.$view.getElementsByClassName("webix_ss_body");
                    // 检查是否找到了具有 webix_ss_body 类的元素
                    if (centerElements.length > 0) {
                        // 对找到的第一个元素应用样式调整,使其下拉框下边留白30px
                        centerElements[0].style.height = "591px";
                    }
                }

            };

            this.updateScriptCustomizedFieldsSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    $('#commonscriptCustomizedFieldModal').modal('hide');
                    self.projectManager.setProjectScriptCustomizedFieldMapping(selectionManager.selectedProject().id, JSON.stringify(self.customizedFields));
                    notificationService.showSuccess('更新自定义字段协议成功');
                }
                else
                    self.updateScriptCustomizedFieldsErrorFunction();
            };

            this.updateScriptCustomizedFieldsErrorFunction = function () {
                notificationService.showError('更新自定义字段协议失败');
            };

            this.updateScriptCustomizedFields = function () {
                var customizedFields = []
                for (var i = 0; i < self.customizedFields.length; i++)
                    customizedFields.push(self.customizedFields[i]);
                var customizedFieldsConfig = JSON.stringify(customizedFields);
                utpService.updateScriptCustomizedFields(selectionManager.selectedProject().id, customizedFieldsConfig, self.updateScriptCustomizedFieldsSuccessFunction, self.updateScriptCustomizedFieldsErrorFunction);
            };

            this.getCustomizedFields = function () {
                var customizedFields = self.projectManager.getProjectScriptCustomizedFieldMapping(selectionManager.selectedProject().id);
                try {
                    if (customizedFields === '')
                        customizedFields = [];
                    else
                        customizedFields = JSON.parse(customizedFields);

                }
                catch (e) {
                    customizedFields = [];
                }
                self.customizedFields = customizedFields;
                // self.customizedFields = ['111','222','333'];
                self.setCustomizedField(self.customizedFields);
            };
            this.customizedFields = [];
            this.customizedFieldContainer = ko.observable();
            this.customizedFieldChanged = function (fields) {
                self.customizedFields = fields;
            };
            this.setCustomizedField = function (customizedFields) {
                system.acquire("app/viewmodels/customizedfield").then(function (customizedField) {
                    v = "app/views/customizedfield.html";
                    vm = new customizedField(self.customizedFieldChanged);
                    self.customizedFieldContainer({ model: vm, activationData: { pageId: 'TestCase', customizedFields } });
                });
            };

            this.activate = function (data) {
                self.reload = true;
                //	webix.event(window, "resize", function(){ $$("cfm").adjust(); });

                if (data != null && data.reload != null)
                    self.reload = data.reload;
                self.enableTestcaseSubScription = app
                    .on('enableTestcase:event')
                    .then(
                        function () {
                            fileManagerUtility.commonConfigInit();
                            self.commonscriptContainerAdjust();
                            $$("cfm").refreshCursor();
                        });
            };

            this.attached = function (view, parent) {
                // self.getScriptGroupByProject();
                self.initCommonScriptManager();
                $('#commonreferScriptModal').on('shown.bs.modal', function (e) {
                    if (self.selectedTargetProject == null || self.selectedTargetProject == undefined)
                        self.selectedTargetProject = self.projectManager.projects()[0];
                    self.onProjectSelected();
                });
                $('#commoncreateTimeSeriesScriptModal').on('shown.bs.modal', function (e) {
                    //清空数据
                    self.cmdsStrings.removeAll();
                    self.selectedAntbot(null);
                    self.checkedCommandNode(null)
                    $('#commontimeSeriesScriptDiagram').html('');
                })
                $('#commongenericTimeSeriesScriptProtocolFieldSettingModal').on('shown.bs.modal', function (e) {
                    self.initGenericTimeSeriesScriptProtocolTree(e.relatedTarget.data);
                });
                if (self.projectManager.useBackupCommonScripts) {
                    if (self.projectManager.backupCommonScripts != null) {
                        self.refreshFileManager(self.projectManager.backupCommonScripts);
                        if (self.projectManager.previousEditedScript != null) {
                            $$("cfm").renameFile(self.projectManager.previousEditedScript.id, self.projectManager.previousEditedScript.name, "value");
                            $$("cfm").renameFile(self.projectManager.previousEditedScript.id, self.projectManager.previousEditedScript.customizedId, "customizedId");
                            $$("cfm").renameFile(self.projectManager.previousEditedScript.id, self.projectManager.previousEditedScript.description, "description");
                            self.projectManager.previousEditedScript = null;
                        }
                    } else
                        self.getScriptGroupByProject();
                } else
                    self.getScriptGroupByProject();
                self.projectManager.useBackupCommonScripts = false;
                self.commonscriptContainerAdjust();

                $('#commonscriptCustomizedFieldModal').on('shown.bs.modal', function (e) {
                    self.getCustomizedFields();
                });
            };

            this.detached = function () {
                self.enableTestcaseSubScription.off();
                //disable the paste among different projects
                self.sourceId = "";
                self.projectManager.backupCommonScripts = self.projectManager.getScriptGroups();
            };
        };
        return new CommonScriptViewModel();
    });
