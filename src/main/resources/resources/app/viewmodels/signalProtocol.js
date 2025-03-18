define(
    ['jquery', 'durandal/app', 'bootstrap', 'lang', 'services/datatableManager',
        'services/langManager', 'services/utilityService',
        'services/utpService', 'services/cmdConvertService', 'services/notificationService', 'komapping',
        'services/executionManager',
        'services/projectManager', 'knockout', 'validator', 'jsoneditor', 'lodash', 'knockout-postbox'],
    function ($, app, bootstrap, lang, dtManager, langManager, utilityService,
        utpService, cmdConvertService, notificationService, komapping,
        executionManager, projectManager, ko, validator, JSONEditor, _) {

        function ProtocolViewModel() {
            var self = this;
            this.projectManager = projectManager;
            this.utpService = utpService;

            this.protocols = komapping.fromJS([], {
                key: function (item) {
                    return ko.utils.unwrapObservable(item.id);
                }
            });
            this.selectedFile = null;
            this.currentProtocol = null;
            this.currentProtocolContent = '';
            this.selectedProtocolType = ko.observable();
            this.selectedProtocolName = ko.observable('');
            this.selectedTargetProject = undefined;
            this.protocolTypes = ko.observableArray([]);
            this.isEditMode = ko.observable(false);
            this.viewProtocolMode = '';
            this.signalTextValues = ko.observable();
            this.newFlag = ko.observable(false); // 判断新增还是编辑
            this.detailName = ko.observableArray(['channelType', 'maxValue', 'minValue', 'unit', 'direction']);

            this.onProjectSelected = function (obj, event) {
                self.getProtocols(self.selectedProtocolType().value);
            };

            this.getProtocolsSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var protocols = data.result;
                    komapping.fromJS(protocols, {}, self.protocols);
                }
                else
                    self.getProtocolsErrorFunction();
            };

            this.getProtocolsErrorFunction = function () {
                notificationService.showError('获取信号表失败');
            };

            this.getProtocols = function (protocolType) {
                var projectId = null;
                if (self.selectedTargetProject != undefined && self.selectedTargetProject != null)
                    projectId = self.selectedTargetProject.id
                self.utpService.getBigDataByType(projectId, protocolType, self.getProtocolsSuccessFunction, self.getProtocolsErrorFunction);
            };

            this.submitProtocol = function () {
                self.addProtocol();
            };

            this.cancelProtocol = function () {
                self.signalTableData = null;
                self.signalGroup = null;
                $('#signalProtocolEditModal').modal('hide');
                self.signalTableData = []; // 信号数组
                self.signalGroup = []; // 信号组别
                
            };

            this.importProtocolConfirm = function () {
                self.importProtocol();
            };

            this.cancelImportProtocol = function () {
                $('#signalProtocolImportModal').modal('hide');
            };

            this.signalEnterImportProtocolMode = function () {
                self.selectedFile = null;
                $('#signalProtocolImportModal').modal('show');
            };


            this.enterAddItemMode = function () {
                self.selectedFile = null;
                self.currentProtocolContent = '';
                self.selectedProtocolName('');
                self.signalTextValues('{}');
                self.isEditMode(false);
                // self.description('');
                // this.signalTableVersion('');
                // this.templateVersion('');
                this.signalDevice('');
                this.signalType('');
                self.populateTable([]);
                self.signalTableData = [] ;// 信号数组
                self.signalGroup = []; // 信号组别
                self.newFlag(true);
                $('#myTable').DataTable().draw();
                $('#signalProtocolEditModal').modal('show');
            };
            
            //导入信号表
            this.loadFromFile = function (file) {
                self.selectedFile = file;
                /*
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = function(evt){
                    var fileString = evt.target.result;
                    self.editor.setText(fileString);
                }
                */
            };

            this.addProtocolErrorFunction = function (result) {
                if (result != null && result != "") {
                    var message = result.messages;
                    if (message === "OVER_MAX_PROTOCOLSIGNAL_NUM") {
                        notificationService.showError('信号表数量超过最大限制,请安装对应的许可文件');
                    }
                } else {
                    notificationService.showError('新增信号表失败');
                }
            };

            this.importProtocolErrorFunction = function () {
                notificationService.showError('新增信号表失败');
            };

            this.addProtocolSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var configInfo = data.result;
                    // self.protocols.unshift(configInfo);
                    self.refreshProtocols();
                    notificationService.showSuccess('添加信号表成功！');
                } else {
                    self.addProtocolErrorFunction(data.result);
                }
            };

            this.importProtocolSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    var configInfo = data.result;
                    notificationService.showSuccess('上传信号表成功！');
                    self.refreshProtocols();
                } else {
                    self.addProtocolErrorFunction(data.result);
                }
            };

            this.importProtocol = function () {
                if (self.selectedFile === null) {
                    notificationService.showError('请选择信号表文件！');
                    return;
                }
                if (!self.selectedFile.name.endsWith('.uSignal')) {
					notificationService.showError('协议文件类型错误,请重新选择文件！');
					return;
		}
                var fd = new FormData();
                fd.append('dataType', self.selectedProtocolType().value);
                fd.append('file', self.selectedFile);
                fd.append('protocolType', "SignalProtocol");
                utpService.addBigData(fd, self.importProtocolSuccessFunction, self.addProtocolErrorFunction);
            };

            this.addProtocol = function () {
                if (self.selectedProtocolName() === '') {
                    notificationService.showError('请输入信号表名称！');
                    return;
                }

                const currentProtocolContent = {
                    signalMappingTable: self.signalTableData,
                    groupMappingTable: self.signalGroup,
                    // description: self.description(),
                    // signalTableVersion: self.signalTableVersion(),
                    // templateVersion: self.templateVersion(),
                    signalDevice: self.signalDevice(),
                    signalType: self.signalType()
                };

                try {
                    const jsonString = JSON.stringify(currentProtocolContent, null, 2);
                    self.signalTextValues(jsonString);
                    JSON.parse(jsonString); // 再次解析以验证格式
                } catch (error) {
                    notificationService.showError('信号表不是JSON数据格式');
                    return;
                }

                const blob = new Blob([self.signalTextValues()], { type: 'application/json;charset=utf-8' });
                self.selectedFile = new File([blob], self.selectedProtocolName() + '.uSignal', { type: "application/json;charset=utf-8" });

                if (!self.selectedFile) {
                    notificationService.showError('创建信号表文件失败！');
                    return;
                }

                const fd = new FormData();
                fd.append('dataType', self.selectedProtocolType().value);
                fd.append('protocolType', "SignalProtocol");
                fd.append('file', self.selectedFile);

                try {
                    utpService.addBigData(fd, self.addProtocolSuccessFunction, self.addProtocolErrorFunction);
                } catch (error) {
                    notificationService.showError('上传信号表时发生错误：' + error.message);
                }
            };


            // this.description = ko.observable('');
            // this.signalTableVersion = ko.observable('');
            // this.templateVersion = ko.observable('');
            this.signalDevice = ko.observable('');
            this.signalType = ko.observable('');
            this.getProtocolSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    if (self.viewProtocolMode === 'signalEditProtocol') {
                        self.currentProtocolContent = JSON.parse(data.result.bigdata);
                        $('#signalProtocolEditModal').modal('show');
                    }
                    self.signalTableData = self.currentProtocolContent.signalMappingTable // 信号数组
                    self.signalGroup = self.currentProtocolContent.groupMappingTable // 信号组别
                    // self.description(self.currentProtocolContent.description);
                    // self.signalTableVersion(self.currentProtocolContent.signalTableVersion);
                    // self.templateVersion(self.currentProtocolContent.templateVersion);
                    self.signalDevice(self.currentProtocolContent.signalDevice);
                    self.signalType(self.currentProtocolContent.signalType);

                    self.populateTable(self.signalTableData);
                }
            };

            this.getProtocolErrorFunction = function () {
                notificationService.showError('获取信号表文件失败');
            };

            this.exportProtocolSuccessFunction = function (data) {
                if (data && data.status === 1 && data.result) {
                    var blob = new Blob([data.result.bigdata]);
                    var a = document.createElement("a");
                    a.download = data.result.fileName;
                    a.href = URL.createObjectURL(blob);
                    $("body").append(a);
                    a.click();

                }
                else
                    notificationService.showError('导出项目失败');
            };

            this.exportProtocolErrorFunction = function () {
                notificationService.showError('导出信号表文件失败');
            };

            this.exportProtocol = function (item) {
                self.utpService.getProtocol(item.id(), self.exportProtocolSuccessFunction, self.exportProtocolErrorFunction);
                if (item.fileName().indexOf(".") >= 0)
                    self.selectedProtocolName(item.fileName().slice(0, item.fileName().indexOf(".")));
                else
                    self.selectedProtocolName(item.fileName());
                self.currentProtocol = item;
                self.isEditMode(true);
            };

            this.signalEditProtocol = function (item) {
                self.viewProtocolMode = 'signalEditProtocol';
                self.newFlag(false);
                self.utpService.getProtocol(item.id(), self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
                if (item.fileName().indexOf(".") >= 0)
                    self.selectedProtocolName(item.fileName().slice(0, item.fileName().indexOf(".")));
                else
                    self.selectedProtocolName(item.fileName());
                self.currentProtocol = item;
                self.isEditMode(true);
            };

            this.updateSignalProtocolErrorFunction = function () {
                notificationService.showError('信号表更新失败');
            };

            this.updateSignalProtocolSuccessFunction = function (data) {
                if (data && data.status === 1) {
                    notificationService.showSuccess('信号表更新成功');
                    self.refreshProtocols();
                    self.utpService.getProtocol(self.currentProtocol.id(), self.getProtocolSuccessFunction, self.getProtocolErrorFunction);
                }
                else
                    self.updateSignalProtocolErrorFunction();
            };
            this.updateSignalProtocol = function () {
                // let table = $('#myTable').DataTable();
                // let demo = table.rows().data().toArray()
                // for(let i = 0;i < demo.length){

                // }
                self.currentProtocolContent.signalMappingTable = self.signalTableData;
                self.currentProtocolContent.groupMappingTable = self.signalGroup;
                // self.currentProtocolContent.description = self.description();
                // self.currentProtocolContent.signalTableVersion = self.signalTableVersion();
                // self.currentProtocolContent.templateVersion = self.templateVersion();
                self.currentProtocolContent.signalDevice = self.signalDevice();
                self.currentProtocolContent.signalType = self.signalType();

                let currentProtocolContent = JSON.stringify(self.currentProtocolContent, null, 2);
                self.signalTextValues(currentProtocolContent);
                try {
                    JSON.parse(self.signalTextValues());
                } catch (error) {
                    notificationService.showError('信号表不是JSON数据格式')
                    return;
                }
                const blob = new Blob([self.signalTextValues()], { type: 'application/json;charset=utf-8' });
                self.selectedFile = new File([blob], self.selectedProtocolName() + '.uSignal', { type: "application/json;charset=utf-8" });
                if (self.selectedFile === null) {
                    notificationService.showError('请选择信号表文件！');
                    return;
                }
                var fd = new FormData();
                fd.append('id', self.currentProtocol.id());
                fd.append('file', self.selectedFile);
                fd.append('protocolType', 'SignalProtocol');
                utpService.updateBigData(fd, self.updateSignalProtocolSuccessFunction, self.updateSignalProtocolErrorFunction);
            };


            this.deleteCurrentProtocol = function () {
                self.clearRemoveNotification();
                utpService.deleteBigData(self.currentProtocol.id(),
                    function (data) {
                        if (data != null && data.status === 1 && data.result) {
                            self.protocols.remove(self.currentProtocol);
                            notificationService.showSuccess('删除信号表成功！');
                        }
                        else
                            notificationService.showError('删除信号表失败');
                    },
                    function () {
                        notificationService.showError('删除信号表失败');
                    });
            };

            this.genericProtocolName = ko.observable('信号表内容配置');

            this.clearRemoveNotification = function () {
                $('#signalDeleteProtocolModal').modal('hide');
            };

            this.remove = function (item) {
                $('#signalDeleteProtocolModal').modal('show');
                self.currentProtocol = item;
            };

            this.protocolTypeChanged = function (obj, event) {
                if (self.selectedProtocolType() == undefined)
                    return;

                if (event.originalEvent)// user changed
                    self.getProtocols(self.selectedProtocolType().value);
                else { // program changed

                }
            };

            // 类型写死成SignalProtocol
            this.prepareProtocolType = function () {
                self.protocolTypes = ko.observableArray([]);
                self.protocolTypes.push({
                    name: 'SignalProtocol',
                    value: 'SignalProtocol',
                })
                self.selectedProtocolType(self.protocolTypes()[0]);
                if (self.selectedProtocolName === '')
                    self.selectedProtocolName(self.selectedProtocolType().name);
            };

            this.refreshProtocols = function () {
                self.getProtocols(self.selectedProtocolType().value);
                $('#signalProtocolImportModal').modal('hide');
                $('#signalProtocolEditModal').modal('hide');
                self.viewProtocolMode = '';
                self.signalTableData = [] // 信号数组
                self.signalGroup = [] // 信号组别
            };

            this.activate = function () {
                self.prepareProtocolType();
                self.getProtocols(self.selectedProtocolType().value);
                self.selectedFile = null;
            };

            this.editor = null;
            this.currentSelectNode = null;
            this.editedProtocolConfig = null;

            this.detached = function (view, parent) {

            };
            this.currentSchema = null;
            this.getMessageId = function (message) {
                var fields = message.fields;
                if (fields == null)
                    return '';
                var id = '';
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (field.isId)
                        id = id + field.value;
                }
                return id;
            };

            this.enumNameCheck = function (enumTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < enumTypeDefineTable.length - 1; i++) {
                    for (var j = i + 1; j < enumTypeDefineTable.length; j++) {
                        if (enumTypeDefineTable[i].typeName === enumTypeDefineTable[j].typeName) {
                            var path = ['enumTypeDefineTable'];
                            path.push(i);
                            path.push('typeName');
                            var duplicatePath = ['enumTypeDefineTable'];
                            duplicatePath.push(j);
                            duplicatePath.push('typeName');
                            errors.push(path);
                            errors.push(duplicatePath);
                        }
                    }
                }
                return errors;
            };
            this.enumFieldNameCheck = function (enumTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < enumTypeDefineTable.length; i++) {
                    var enumType = enumTypeDefineTable[i];
                    for (var j = 0; j < enumType.fields.length - 1; j++) {
                        for (var k = j + 1; k < enumType.fields.length; k++) {
                            if (enumType.fields[j].name === enumType.fields[k].name) {
                                var path = ['enumTypeDefineTable'];
                                path.push(i);
                                path.push('fields');
                                var duplicatePath = JSON.parse(JSON.stringify(path));
                                path.push(j);
                                errors.push(path);
                                duplicatePath.push(k);
                                errors.push(duplicatePath);
                            }
                        }
                    }
                }
                return errors;
            };
            this.bitTypeNameCheck = function (bitsTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < bitsTypeDefineTable.length - 1; i++) {
                    for (var j = i + 1; j < bitsTypeDefineTable.length; j++) {
                        if (bitsTypeDefineTable[i].typeName === bitsTypeDefineTable[j].typeName) {
                            var path = ['bitsTypeDefineTable']; path.push(i); path.push('typeName');
                            var duplicatePath = ['bitsTypeDefineTable'];
                            duplicatePath.push(j); duplicatePath.push('typeName');
                            errors.push(path);
                            errors.push(duplicatePath);
                        }
                    }
                }
                return errors;
            };

            this.bitFieldNameCheck = function (bitsTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < bitsTypeDefineTable.length; i++) {
                    var bit = bitsTypeDefineTable[i];
                    for (var j = 0; j < bit.fields.length - 1; j++) {
                        for (var k = j + 1; k < bit.fields.length; k++) {
                            if (bit.fields[j].name === bit.fields[k].name) {
                                var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
                                var duplicatePath = JSON.parse(JSON.stringify(path));
                                path.push(j);
                                errors.push(path);
                                duplicatePath.push(k);
                                errors.push(duplicatePath);
                            }
                        }
                    }
                }
                return errors;
            };

            this.bitFieldLengthCheck = function (bitsTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < bitsTypeDefineTable.length; i++) {
                    var bit = bitsTypeDefineTable[i];
                    for (var j = 0; j < bit.fields.length; j++) {
                        var field = bit.fields[j];
                        if (field.minimum && field.minimum.length != field.bitLength) {
                            var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
                            path.push(j);
                            path.push('minimum');
                            errors.push(path);
                        }
                        if (field.maximum && field.maximum.length != field.bitLength) {
                            var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
                            path.push(j);
                            path.push('maximum');
                            errors.push(path);
                        }
                        if (field.default && field.default.length != field.bitLength) {
                            var path = ['bitsTypeDefineTable']; path.push(i); path.push('fields');
                            path.push(j);
                            path.push('default');
                            errors.push(path);
                        }
                    }
                }
                return errors;
            };
            this.enumvalueCheck = function (enumTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < enumTypeDefineTable.length; i++) {
                    var enums = enumTypeDefineTable[i];
                    for (var j = 0; j < enums.fields.length; j++) {
                        var field = enums.fields[j];
                        if (field.value) {
                            var pattern = /^(0[xX])?[\da-fA-F]+$|^(\-)?\d+(\.\d+)?$/;
                            if (!pattern.test(field.value)) {
                                var path = ['enumTypeDefineTable'];
                                path.push(i);
                                path.push('fields');
                                path.push(j);
                                path.push('value');
                                errors.push(path);
                            }
                        }
                    }
                }
                return errors;
            };

            this.structTypeNameCheck = function (structTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < structTypeDefineTable.length - 1; i++) {
                    for (var j = i + 1; j < structTypeDefineTable.length; j++) {
                        if (structTypeDefineTable[i].typeName === structTypeDefineTable[j].typeName) {
                            var path = ['structTypeDefineTable']; path.push(i); path.push('typeName');
                            var duplicatePath = ['structTypeDefineTable'];
                            duplicatePath.push(j); duplicatePath.push('typeName');
                            errors.push(path);
                            errors.push(duplicatePath);
                        }
                    }
                }
                return errors;
            };

            this.structFieldNameCheck = function (structTypeDefineTable) {
                var errors = [];
                for (var i = 0; i < structTypeDefineTable.length; i++) {
                    var struct = structTypeDefineTable[i];
                    for (var j = 0; j < struct.fields.length - 1; j++) {
                        for (var k = j + 1; k < struct.fields.length; k++) {
                            if (struct.fields[j].name === struct.fields[k].name) {
                                var path = ['structTypeDefineTable']; path.push(i); path.push('fields');
                                var duplicatePath = JSON.parse(JSON.stringify(path));
                                path.push(j);
                                errors.push(path);
                                duplicatePath.push(k);
                                errors.push(duplicatePath);
                            }
                        }
                    }
                }
                return errors;
            };

            this.algorithmTypeNameCheck = function (algorithmDefineTable) {
                var errors = [];
                for (var i = 0; i < algorithmDefineTable.length - 1; i++) {
                    for (var j = i + 1; j < algorithmDefineTable.length; j++) {
                        if (algorithmDefineTable[i].name === algorithmDefineTable[j].name) {
                            var path = ['algorithmDefineTable']; path.push(i); path.push('name');
                            var duplicatePath = ['algorithmDefineTable'];
                            duplicatePath.push(j); duplicatePath.push('name');
                            errors.push(path);
                            errors.push(duplicatePath);
                        }
                    }
                }
                return errors;
            };

            this.algorithmParamNameCheck = function (algorithmDefineTable) {
                var errors = [];
                for (var i = 0; i < algorithmDefineTable.length; i++) {
                    var algorithm = algorithmDefineTable[i];
                    if (algorithm.params != undefined && algorithm.params != null) {
                        for (var j = 0; j < algorithm.params.length - 1; j++) {
                            for (var k = j + 1; k < algorithm.params.length; k++) {
                                if (algorithm.params[j].name === algorithm.params[k].name) {
                                    var path = ['algorithmDefineTable']; path.push(i); path.push('params');
                                    var duplicatePath = JSON.parse(JSON.stringify(path));
                                    path.push(j);
                                    errors.push(path);
                                    duplicatePath.push(k);
                                    errors.push(duplicatePath);
                                }
                            }
                        }
                    }
                }
                return errors;
            };

            this.getPaths = function (obj, parentKey) {
                var result;
                if (_.isArray(obj)) {
                    var idx = 0;
                    result = _.flatMap(obj, function (obj) {
                        return self.getPaths(obj, (parentKey || '') + '[' + idx++ + ']');
                    });
                }
                else if (_.isPlainObject(obj)) {
                    result = _.flatMap(_.keys(obj), function (key) {
                        return _.map(self.getPaths(obj[key], key), function (subkey) {
                            return (parentKey ? parentKey + '.' : '') + subkey;
                        });
                    });
                }
                else {
                    result = [];
                }
                return _.concat(result, parentKey || []);
            };


            this.attached = function (view, parent) {
                $('#signalProtocolImportModal').on('shown.bs.modal', function () {
                    var file = document.getElementById("icdInputFile");
                    file.value = "";
                    $('#signalProtocolImportForm').validator().off('submit');
                    $('#signalProtocolImportForm').validator('destroy').validator();
                    $('#signalProtocolImportForm').validator().on('submit', function (e) {
                        if (e.isDefaultPrevented()) {
                            // handle the invalid form...
                        } else {
                            e.preventDefault();
                            self.importProtocolConfirm();
                        }
                    });
                });
                self.createTable();
            };

            this.channelParams = ko.observableArray([]); //暂存详细信息
            this.detailIndex = null; // 详细信息所处下标
            this.createTable = function () {
                var columnDefs = [
                    {
                        "targets": 0,
                        "render": function (data, type, row, meta) {
                            return parseInt(meta.row, 10) + 1; // 直接返回数字
                        }
                    },
                    {
                        "targets": 1,
                        "render": function (data, type, row) {
                            return '<input type="text" class="form-control editable-input" data-column-index="1" value="' + data + '">';
                        }
                    },
                    {
                        "targets": 2,
                        "render": function (data, type, row) {
                            return '<input type="text" class="form-control editable-input" data-column-index="2" value="' + data + '">';
                        }
                    },
                    {
                        "targets": 3,
                        "render": function (data, type, row, meta) {
                            if (self.signalGroup == null) {
                                return '暂无分组';
                            }
                            var channelValue = row[2]; // 获取当前行第三列的值

                            // 始终包含“暂无”选项
                            var selectOptions = '<option value="暂无">暂无</option>';

                            // 构建下拉框的选项
                            self.signalGroup.forEach(function (group) {
                                // 检查当前分组的channelList是否包含第三列的值
                                var isSelected = group.channelList.includes(channelValue) ? 'selected' : '';
                                selectOptions += '<option value="' + group.groupName + '" ' + isSelected + '>' + group.groupName + '</option>';
                            });

                            // 返回下拉框HTML代码
                            return '<select class="form-control">' + selectOptions + '</select>';
                        }
                    },
                    {
                        "targets": 4,
                        "render": function (data, type, row) {
                            return '<button class="btn btn-primary signalDetailEdit">编辑</button>';
                        }
                    },
                    {
                        "targets": 5,
                        "render": function (data, type, row) {
                            return '<button class="btn btn-sm btn-danger signalDelete">删除</button>';
                        }
                    }
                ];

                // 初始化DataTable，并传入构建好的columnDefs数组
                $('#myTable').DataTable({
                    "paging": true,
                    "language": {
                        "paginate": {
                            "previous": "上一页",
                            "next": "下一页"
                        },
                        "lengthMenu": "每页展示 _MENU_ 数据"
                    },
                    "lengthMenu": [
                        [5, 10, 20, -1],
                        ["5条", "10条", "20条", "全部"]
                    ],
                    "pageLength": 10,
                    "lengthChange": true,
                    "info": false,
                    "searching": false,
                    "ordering": false,
                    "autoWidth": false,
                    "stripeClasses": [],
                    "stateSave": false,
                    "columnDefs": columnDefs,
                    "drawCallback": function () {
                        // 为下拉框添加事件监听器
                        $('#myTable tbody').off('change', 'select.form-control').on('change', 'select.form-control', function () {
                            var row = $(this).closest('tr');
                            var rowData = $('#myTable').DataTable().row(row).data();
                            var previousValue = $(this).data('prev-value'); // 获取变化前的值
                            var selectedValue = $(this).val(); // 获取变化后的值
                            // 存储变化前的值，以便下次变化时可以获取
                            $(this).data('prev-value', selectedValue);

                            if (previousValue == undefined || previousValue == '暂无') { // 变化前没有分组,直接存到分组数组中
                                for (let i = 0; i < self.signalGroup.length; i++) {
                                    if (self.signalGroup[i].groupName == selectedValue) {
                                        self.signalGroup[i].channelList.push(rowData[2])
                                    }
                                }
                            } else {
                                for (let i = 0; i < self.signalGroup.length; i++) {
                                    if (self.signalGroup[i].groupName == previousValue) { // 变化前有分组,先从原分组中删除
                                        let index = self.signalGroup[i].channelList.indexOf(rowData[2]);
                                        self.signalGroup[i].channelList.splice(index, 1);
                                    }

                                    if (self.signalGroup[i].groupName == selectedValue) {
                                        self.signalGroup[i].channelList.push(rowData[2])
                                    }
                                }
                            }

                            if (selectedValue == undefined || selectedValue == '暂无') { // 变化后没有分组,删除
                                for (let i = 0; i < self.signalGroup[i].length; i++) {
                                    if (self.signalGroup[i].groupName == previousValue) {
                                        let index = self.signalGroup[i].channelList.indexOf(rowData[2]);
                                        self.signalGroup[i].channelList.splice(index, 1);
                                    }
                                }
                            }
                        });
                        // 初始化下拉框的prev-value
                        $('#myTable tbody select.form-control').each(function () {
                            var $select = $(this);
                            var value = $select.val();
                            $select.data('prev-value', value); // 存储初始值
                        });
                        // 为输入框添加事件监听器
                        $('#myTable').off('change', '.editable-input').on('change', '.editable-input', function () {
                            var $input = $(this);
                            var columnIdx = $input.data('column-index');
                            var rowIdx = $input.closest('tr').index();
                            var rowData = $('#myTable').DataTable().row(rowIdx).data();
                            var newValue = $input.val();
                            rowData[columnIdx] = newValue;

                            let index = rowData[0] - 1;
                            self.signalTableData[index].logicName = rowData[1];
                            self.signalTableData[index].physicalName = rowData[2];
                        });
                    }
                });
                $('#myTable').on('click', '.signalDetailEdit', function (event) {
                    event.stopPropagation(); // 阻止事件冒泡
                    event.preventDefault(); // 阻止默认行为
                    let table = $('#myTable').DataTable();
                    // 获取当前行DOM元素
                    var tr = $(this).closest('tr');

                    // 获取DataTables行数据（不包括自定义下拉框的值）
                    var rowData = table.row(tr).data();

                    // 直接从DOM中获取下拉框的值
                    var selectValue = tr.find('select.form-control').val();
                    rowData[3] = selectValue;
                    self.detailIndex = rowData[0] - 1;
                    if (self.signalTableData[self.detailIndex].channelParams != null) {
                        let a = JSON.parse(JSON.stringify(self.signalTableData[self.detailIndex].channelParams));
                        self.channelParams(a);
                    } else {
                        self.channelParams([{ name: '', value: '' }])
                    }
                    self.showDetailModal();
                });
                $('#myTable').on('click', '.signalDelete', function (event) {
                    event.stopPropagation(); // 阻止事件冒泡
                    event.preventDefault(); // 阻止默认行为
                    let table = $('#myTable').DataTable();

                    var tr = $(this).closest('tr'); // 获取按钮所在的行
                    var rowIndex = table.row(tr).index(); // 获取行索引
                    var rowData = table.row(rowIndex).data(); // 获取行数据

                    // 从数组中移除数据
                    var index = rowData[0] - 1;
                    self.signalTableData.splice(index, 1);


                    // 删除DataTables中的行
                    table.row(rowIndex).remove().draw(false);
                    self.updateSerialNumbers(); // 更新编号

                    // 可以在此处添加其他逻辑，例如提示用户数据已删除
                    alert('数据已删除');
                });
            }

            this.updateSerialNumbers = function () {
                var rowIndex = 1; // 序号从1开始
                $('#myTable').DataTable().rows().every(function () {
                    var rowData = this.data();
                    rowData[0] = rowIndex++; // 更新序号并递增
                    this.data(rowData); // 重新设置行数据，不立即绘制
                });
                // 重新绘制表格以更新视图
                $('#myTable').DataTable().draw();
            }

            this.signalTableData = null // 信号数组,在点击编辑时获取
            this.signalGroup = null // 信号组别,在点击编辑时获取.
            this.allData = [];// 只包含逻辑名和物理名单数组

            this.populateTable = function (obj) {
                let table = $('#myTable').DataTable();
                table.clear();
                obj.forEach(function (item, index) {
                    // 添加行时，确保每行都有evaluation值
                    table.row.add([index + 1, item.logicName, item.physicalName, '', '', '']).draw();
                });
            }
            this.showDetailModal = function () {
                $('#signalDetailModal').modal('show');
            };
            this.addSignalDetail = function () {
                self.channelParams.push({ name: '', value: '' })
            }
            this.updateSignalDetail = function () {
                for (let i = 0; i < self.channelParams().length; i++) {
                    if (self.channelParams()[i].name == '' || self.channelParams()[i].name == undefined || self.channelParams()[i].value == '') {
                        notificationService.showError('存在值为空或未选名称,请检查后再进行保存');
                        return
                    }
                }

                self.signalTableData[self.detailIndex].channelParams = self.channelParams();
                if (self.signalTableData[self.detailIndex].channelParams.length == 0) {
                    delete self.signalTableData[self.detailIndex].channelParams;
                }
                $('#signalDetailModal').modal('hide');
            }
            this.removeSignalDetail = function (param) {
                self.channelParams.remove(param);
            };
            this.cancelDetailModal = function () {
                $('#signalDetailModal').modal('hide');
            }

            this.addNumber = ko.observable(); // 添加行数
            this.addModal = function () {
                $('#addNumberModal').modal('show');
            };

            this.addGroupModal = function () {
                $('#addNumberModal').modal('show');
            };

            this.cancelAddFiled = function () {
                self.addNumber('');
                $('#addNumberModal').modal('hide');
            }

            this.sureAddFiled = function () {
                if (isNaN(self.addNumber()) || self.addNumber() < 1) {
                    notificationService.showError('请输入非零的正数');
                    return
                }
                let i = 0;
                while (i < self.addNumber()) {
                    self.addField();
                    let table = $('#myTable').DataTable();
                    let lastRowData = table.row(':last').data(); // 获取最后一行的数据
                    self.signalTableData.push({ logicName: lastRowData[1], physicalName: lastRowData[2] });
                    i++;
                }
                self.addNumber('');
                $('#addNumberModal').modal('hide');
            }
            // 增加行数
            this.addField = function () {
                let table = $('#myTable').DataTable();
                let lastRowData = table.row(':last').data(); // 获取最后一行的数据

                if (self.newFlag()) {
                    // 表格为空，直接添加一行
                    table.row.add([
                        table.rows().data().length + 1, // 第一列：行号
                        '', // 第二列：空值
                        '', // 第三列：空值
                        '', // 第四列：空值
                        '', // 第五列：空值
                        ''  // 第六列：空值
                    ]).draw();
                } else {

                    // 获取最后一行第二列和第三列的值，并去掉末尾的数字
                    let lastPwm = lastRowData[1].toString().replace(/\d+$/, '');
                    let lastCtr = lastRowData[2].toString().replace(/\d+$/, '');

                    // 计算新的数字后缀
                    let currentPwmSuffix = parseInt(lastRowData[1].match(/\d+$/)[0], 10);
                    let currentCtrSuffix = parseInt(lastRowData[2].match(/\d+$/)[0], 10);
                    let newPwmSuffix = currentPwmSuffix + 1;
                    let newCtrSuffix = currentCtrSuffix + 1;

                    // 构建新的值
                    let newPwm = lastPwm + newPwmSuffix;
                    let newCtr = lastCtr + newCtrSuffix;

                    // 添加新行
                    table.row.add([
                        table.rows().data().length + 1, // 第一列：行号
                        newPwm, // 第二列：新的PWM值
                        newCtr, // 第三列：新的CTR值
                        '', // 第四列：空值
                        '', // 第五列：空值
                        ''  // 第六列：空值
                    ]).draw();
                }
            };

            this.signalGroupDemo = ko.observableArray([]);
            this.addGroupModal = function () {
                let a = JSON.parse(JSON.stringify(self.signalGroup))
                self.signalGroupDemo(a);
                $('#signalGroupModal').modal('show');
            }
            this.removeSignalGroup = function (param) {
                self.signalGroupDemo.remove(param);
            };
            this.addSignalGroup = function () {
                self.signalGroupDemo.push({ groupName: '', channelList: [] })
            };
            this.updateSignalGroup = function () {
                const groupNameCounts = new Map();
                for (let i = 0; i < self.signalGroupDemo().length; i++) {
                    if (self.signalGroupDemo()[i].groupName === '') {
                        notificationService.showError('存在命名为空，请检查后再进行保存');
                        return;
                    }
                    const count = groupNameCounts.get(self.signalGroupDemo()[i].groupName) || 0;
                    if (count > 0) {
                        notificationService.showError('存在重复的组名，请检查后再进行保存');
                        return;
                    }
                    groupNameCounts.set(self.signalGroupDemo()[i].groupName, count + 1);
                }

                self.signalGroup = self.signalGroupDemo();
                if (self.signalGroup.length === 0) {
                    delete self.signalGroup;
                }
                self.updateSerialNumbers();
                $('#signalGroupModal').modal('hide');
            };
            this.cancelGroupModal = function () {
                $('#signalGroupModal').modal('hide');
            };
        }
        return new ProtocolViewModel();
    });
