define(["jquery", "knockout", "services/utpService", "services/utilityService", "lodash"], function (
	$,
	ko,
	utpService,
	utilityService,
	_
) {
	function protocolService() {
		var self = this;

		this.utpService = utpService;
		this.utilityService = utilityService;
		this.bigDataMapping = new Map();
		this.protocolDataMapping = new Map();
		this.structTables = [];
		this.bitTables = [];
		this.protocolTemplate = { "littleEndian": false, "messages": [{ "messageName": "消息名", "fields": [] }], "messageAttributeTable": [], "bitsTypeDefineTable": [], "structTypeDefineTable": [], "enumTypeDefineTable": [], "algorithmDefineTable": [] };
		this.dataType = {
			/* TODO
			  ARINC429: "ARINC-429",
			  ARINC664: "ARINC-664",
			  MIL1553B: "MIL-1553B",
			  ISO15765: "ISO-15765(CAN)",
			  J1939: "J1939(CAN)",
			  CANFD: "CANFD",
			  DEVICENET: "DEVICE NET",
			  ETHERCAT: "ETHERCAT",
			  ETHERNET: "ETHERNET",
			  MIL1553BCUSTOM: "MIL-1553B_CUSTOM",
			  */
			GENERICBUSFRAME: "GenericBusFrame",
		};

		this.protocolTypes = ["自定义(Custom Protocol)"] // 协议类型 暂时关闭,"MODBUS","PROFIBUS","HART","CANOpen","DeviceNet","iCAN","J1939","SomeIP","ARINC 429","MIL-STD-1553B","AFDX"
		// 自定义(Custom Protocol), MODBUS, MODBUS, PROFIBUS, HART, CANOpen, DeviceNet, iCAN, J1939, SomeIP, ARINC 429, MIL-STD-1553B, AFDX
		this.signalprotocolTypes = ["1", "2", "3", "4", "5", "6"] // 信号类型

		this.fieldTypes = ["标记字段", "长度字段","无符号整数", "有符号整数", "变长数据", "CRC校验", "Checksum校验", "LRC校验","数据块"]

		this.bigDataType = {
			waveDataTwoDimension: "waveData/twoDimension",
			imageBitmap: "image/bitmap",
			paralAllRunSummary: "paral/allRunSummary",
			paralScriptRunDetailInfo: "paral/scriptRunDetail",
			paralCmdRunTimes: "paral/cmdRunTimes",
			paralCmdsStatisRunTimes: "paral/cmdsStatisRunTimes",
			paralAllFailRunDetailInfo: "paral/allFailRunDetails",
			J1939: "busFrameData/J1939(CAN)",
			ARINC429: "busFrameData/ARINC-429",
			MIL1553B: "busFrameData/MIL-1553B",
			MIL1553BCUSTOM: "busFrameData/MIL-1553B_CUSTOM",
			genericBusFrame: "busFrameData/GenericBusFrame",
			generalBusMessagesToDiff: "generalBusMessagesToDiff",
			generalJsonTable: "generalJsonTable",
			audio: "audio/wav"
		};

		this.getProtocol = function (busInterfaceDefId) {
			var protocol = self.protocolDataMapping.get(busInterfaceDefId);
			if (protocol) return protocol;
			return null;
		};

		this.addProtocol = function (item) {
			if (item) self.protocolDataMapping.set(item.id, item);
		};

		this.getProtocolSuccessFunction = function (data) {
			if (data && data.status === 1 && data.result)
				self.addProtocol(data.result);
			else self.getProtocolErrorFunction();
		};

		this.getProtocolErrorFunction = function () {
			console.log("获取协议文件失败");
		};

		this.addBigData = function (result) {
			var bigData = null;
			if (result.dataType == self.bigDataType.waveDataTwoDimension) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType.includes("image/")) {
				var data = result.bigdata;
				var imageData = "data:" + result.dataType + ";base64," + data;
				bigData = { id: result.id, type: result.dataType, data: imageData };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType.includes("video/")) {
				var data = result.bigdata;
				var imageData = "data:" + result.dataType + ";base64," + data;
				bigData = { id: result.id, type: result.dataType, data: imageData };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType.includes("audio/")) {
				var data = result.bigdata;
				var audioData = "data:" + result.dataType + ";base64," + data;
				bigData = { id: result.id, type: result.dataType, data: audioData };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.paralAllRunSummary) {
				// {"StartTime":1620537766,"EndTime":1620537784,"Result":"SUCCESS","SuccCount":2,"FailCount":0,"SuccRunTimeArry":[{"RunID":1906704385,"RunTime":17344},{"RunID":1906704386,"RunTime":9094}]}
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.paralScriptRunDetailInfo) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.paralCmdRunTimes) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.paralCmdsStatisRunTimes) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.paralAllFailRunDetailInfo) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.J1939) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.ARINC429) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.MIL1553B) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.MIL1553BCUSTOM) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.genericBusFrame) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
				var protocol = self.getProtocol(bigData.data.busInterfaceDefID);
				if (protocol === null || protocol == undefined)
					self.utpService.getProtocol(
						bigData.data.busInterfaceDefID,
						self.getProtocolSuccessFunction,
						self.getProtocolErrorFunction
					);
			} else if (result.dataType == self.bigDataType.generalJsonTable) {
				var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: data };
				self.bigDataMapping.set(result.id, bigData);
			}
			else if (result.dataType == self.bigDataType.generalBusMessagesToDiff) {
				var data = {};
				try {
					data = JSON.parse(result.bigdata);
					bigData = { id: result.id, type: result.dataType, data: data };
					self.bigDataMapping.set(result.id, bigData);
					var protocol = self.getProtocol(data.busInterfaceDefID);
					if (protocol === null || protocol == undefined)
						self.utpService.getProtocol(
							data.busInterfaceDefID,
							self.getProtocolSuccessFunction,
							self.getProtocolErrorFunction
						);
				}
				catch (error) {
					console.log(error)
				}
			}
			else {
				//var data = JSON.parse(result.bigdata);
				bigData = { id: result.id, type: result.dataType, data: result.bigdata };
				self.bigDataMapping.set(result.id, bigData);
			}
			return bigData;
		};

		this.updateBigData = function (bigDataId, bigData) {
			self.bigDataMapping.set(bigDataId, bigData);
		};

		this.getBigData = function (bigDataId) {
			var bigData = self.bigDataMapping.get(bigDataId);
			if (bigData) return bigData;
			return null;
		};

		this.assistTableInit = function (structTables, bitTables, enumTables) {
			self.structTables = structTables;
			self.bitTables = bitTables;
			self.enumTables = enumTables;
		};

		this.getPaths = function (obj, arr = [], res = []) {
			Object.entries(obj).forEach(function ([key, value]) {
				var tempArr = JSON.parse(JSON.stringify(arr));
				tempArr.push(key);
				if (typeof value === "object" && value)
					self.getPaths(value, tempArr, res);
				else res.push(tempArr);
			});
			return res;
		};

		this.findStructTable = function (name) {
			for (var i = 0; i < self.structTables.length; i++)
				if (self.structTables[i].typeName === name)
					return self.structTables[i].fields;
			return null;
		};

		this.findEnumTable = function (name) {
			if (name == undefined || name == null || name === '')
				return null;
			for (var i = 0; i < self.enumTables.length; i++)
				if (self.enumTables[i].typeName === name)
					return self.enumTables[i].fields;
			return null;
		};

		this.findBitTable = function (name) {
			for (var i = 0; i < self.bitTables.length; i++)
				if (self.bitTables[i].typeName === name)
					return self.bitTables[i].fields;
			return null;
		};

		this.arraySchemaProcess = function (field) {
			var properties = {
				type: "array",
				items: {},
				minItems: self.utilityService.getInteger(field.elemCount),
			};
			if (field.elem.type === "uinteger" || field.elem.type === "integer") {
				if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
					var enumFields = self.findEnumTable(field.elem.enumName)
					if (enumFields) {
						var enumArray = [];
						for (var e = 0; e < enumFields.length; e++)
							enumArray.push(enumFields[e].value);
						if (enumArray.length > 0)
							properties.items.enum = enumArray;
					}
				}
			}
			if (field.elem.type === "string" || field.elem.type === "bool") {
				properties.items.type = field.elem.type;
			}
			if (field.elem.type === "crc") {
				properties.items.type = field.elem.type;
			}
			if (field.elem.type === "bits") {
				if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
					var bitFields = self.findBitTable(field.elem.bitsType);
					if (bitFields != null) {
						var bitObj = self.bitFieldProcess(bitFields);
						var propertyObj = {};
						var enumExist = false;
						for (var b = 0; b < bitObj.config.length; b++) {
							var config = bitObj.config[b];
							if (config.enum != null && config.enum != undefined) {
								enumExist = true;
								propertyObj[config.name] = {
									enum: config.enum
								}
							}
						}
						if (enumExist)
							properties.items = {
								properties: propertyObj
							}
					}
				}
			}
			if (field.elem.type === "struct") {
				properties.items.type = "object";
				var structFields = self.findStructTable(field.elem.structType);
				if (structFields != null) {
					properties.items.properties = self.schemaProcess(structFields);
				}
			}
			if (field.elem.type === "array") {
				var subArrayProperty = self.arraySchemaProcess(field.elem);
				if (subArrayProperty != null) {
					properties.items = subArrayProperty;
				}
			}
			return properties;
		};

		this.customSchemaProcess = function (fields, fieldValue) {
			var bitValidator = [];
			var numberPrecisionValidator = [];
			var conditionValidator = [];
			var integerValidator = [];
			var lengthValidator = [];
			var path = [];
			function customFieldProcess(fields, parentPath, needArrayBitProcess = false) {
				for (var i = 0; i < fields.length; i++) {
					var field = fields[i];
					if (field.editable != undefined && !field.editable) continue;
					var currentPath = JSON.parse(JSON.stringify(parentPath));
					if (!needArrayBitProcess)
						currentPath.push(field.name);

					if (field.type === "datablock") {
						var valuePath = JSON.parse(JSON.stringify(currentPath));
						valuePath.push(field.dataLen.name);
						dataLen = field.dataLen.default;
						if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
							valuePath.push('value');
							integerValidator.push({ path: valuePath, minimum: field.dataLen.minimum, maximum: field.dataLen.maximum, type: field.dataLen.type });
							conditionPath.push('condition');
							conditionValidator.push({ type: field.dataLen.type, path: conditionPath, minimum: field.dataLen.minimum, maximum: field.dataLen.maximum, enum: null });
							dataLen = _.get(fieldValue, valuePath);
						}
						else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
							integerValidator.push({ path: valuePath, minimum: field.dataLen.minimum, maximum: field.dataLen.maximum, type: field.dataLen.type });
							dataLen = _.get(fieldValue, valuePath);
						}
						else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
							conditionValidator.push({ type: field.dataLen.type, path: conditionPath, minimum: field.dataLen.minimum, maximum: field.dataLen.maximum, enum: null });
							dataLen = field.dataLen.default;
						}
						var elemPath = JSON.parse(JSON.stringify(currentPath));
						elemPath.push(field.data.name); // datablock.data field
						lengthValidator.push({ path: elemPath, dataLen: dataLen });
					}
					if (field.type === "phyQuant" || field.type === "float" || field.type === "double") {
						var conditionPath = JSON.parse(JSON.stringify(currentPath));
						var valuePath = JSON.parse(JSON.stringify(currentPath));
						if (field.precision) {
							if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
								valuePath.push('value');
								numberPrecisionValidator.push({ path: valuePath, precision: field.precision, minimum: field.minimum, maximum: field.maximum, type: field.type });
								conditionPath.push('condition');
								conditionValidator.push({ type: field.type, path: conditionPath, minimum: field.minimum, maximum: field.maximum });
							}
							else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
								numberPrecisionValidator.push({ path: valuePath, precision: field.precision, minimum: field.minimum, maximum: field.maximum, type: field.type });
							}
							else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
								conditionValidator.push({ type: field.type, path: conditionPath, minimum: field.minimum, maximum: field.maximum });
							}
						}
						else {
							if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
								conditionPath.push('condition');
								conditionValidator.push({ type: field.type, path: conditionPath, minimum: field.minimum, maximum: field.maximum });
							}
							else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
								conditionValidator.push({ type: field.type, path: conditionPath, minimum: field.minimum, maximum: field.maximum });
							}
						}
					}
					if (field.type === 'integer' || field.type === 'uinteger') {
						var conditionPath = JSON.parse(JSON.stringify(currentPath));
						var valuePath = JSON.parse(JSON.stringify(currentPath));
						var enumArray = [];
						var enumFields = self.findEnumTable(field.enumName)
						if (enumFields) {
							for (var e = 0; e < enumFields.length; e++) {
								enumArray.push(enumFields[e].value);
							}
						}
						if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
							valuePath.push('value');
							integerValidator.push({ path: valuePath, minimum: field.minimum, maximum: field.maximum, type: field.type });
							conditionPath.push('condition');
							conditionValidator.push({ type: field.type, path: conditionPath, minimum: field.minimum, maximum: field.maximum, enum: enumArray });
						}
						else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
							//判断是否有enumName和值是否为空
							if (enumFields && enumFields.length > 0) {
								integerValidator.push({ path: valuePath, minimum: field.minimum, maximum: field.maximum, type: field.type, enum: enumFields });
							} else {
								integerValidator.push({ path: valuePath, minimum: field.minimum, maximum: field.maximum, type: field.type });
							}
						}
						else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
							conditionValidator.push({ type: field.type, path: conditionPath, minimum: field.minimum, maximum: field.maximum, enum: enumArray });
						}
					}
					if (field.type === "bits") {
						var bitFields = self.findBitTable(field.bitsType);
						if (bitFields != null) {
							var bitObj = self.bitFieldProcess(bitFields);
							for (var b = 0; b < bitObj.config.length; b++) {
								var config = bitObj.config[b];
								if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
									var valuePath = JSON.parse(JSON.stringify(currentPath));
									var conditionPath = JSON.parse(JSON.stringify(currentPath));
									valuePath.push(config.name);
									valuePath.push('value');
									bitValidator.push({ path: valuePath, bitLength: config.bitLength });
									conditionPath.push(config.name);
									conditionPath.push('condition');
									conditionValidator.push({ type: field.type, path: conditionPath, minimum: config.minimum, maximum: config.maximum, enum: config.enum });
								}
								else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
									var valuePath = JSON.parse(JSON.stringify(currentPath));
									valuePath.push(config.name);
									bitValidator.push({ path: valuePath, bitLength: config.bitLength });
								}
								else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
									var conditionPath = JSON.parse(JSON.stringify(currentPath));
									conditionPath.push(config.name);
									conditionValidator.push({ type: field.type, path: conditionPath, minimum: config.minimum, maximum: config.maximum, enum: config.enum });
								}
							}
						}
					}
					if (field.type === "parity") {
						if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
							var valuePath = JSON.parse(JSON.stringify(currentPath));
							bitValidator.push({ path: valuePath, bitLength: 1 });
						}
					}
					if (field.type === "struct") {
						var structFields = self.findStructTable(field.structType);
						if (structFields != null) {
							customFieldProcess(structFields, currentPath);
						}
					}
					if (field.type === "array") {
						for (var e = 0; e < self.utilityService.getInteger(field.elemCount); e++) {
							var arrayPath = JSON.parse(JSON.stringify(currentPath));
							// arrayPath.push(e);
							if (field.elem.type === "float" || field.elem.type === "double" || field.elem.type === "phyQuant" || field.elem.type === 'integer' || field.elem.type === 'uinteger' || field.elem.type === 'parity') {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							} else if (field.elem.type === "bits") {
								arrayPath.push(e);
								customFieldProcess([field.elem], arrayPath, true);
							} else if (field.elem.type === "struct") {
								var structFields = self.findStructTable(field.elem.structType);
								if (structFields != null) {
									arrayPath.push(e);
									customFieldProcess(structFields, arrayPath);
								}
							} else if (field.elem.type === "array") {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							} else if (field.elem.type === "varray") {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							} else if (field.elem.type === "datablock") {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							}
						}
					}
					if (field.type === "varray") {
						var conditionPath = JSON.parse(JSON.stringify(currentPath));
						var valuePath = JSON.parse(JSON.stringify(currentPath));
						valuePath.push(field.count.name);
						conditionPath.push(field.count.name);
						elemCount = field.count.default;
						if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
							valuePath.push('value');
							integerValidator.push({ path: valuePath, minimum: field.count.minimum, maximum: field.count.maximum, type: field.count.type });
							conditionPath.push('condition');
							conditionValidator.push({ type: field.count.type, path: conditionPath, minimum: field.count.minimum, maximum: field.count.maximum, enum: null });
							elemCount = _.get(fieldValue, valuePath);
						}
						else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
							integerValidator.push({ path: valuePath, minimum: field.count.minimum, maximum: field.count.maximum, type: field.count.type });
							elemCount = _.get(fieldValue, valuePath);
						}
						else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
							conditionValidator.push({ type: field.count.type, path: conditionPath, minimum: field.count.minimum, maximum: field.count.maximum, enum: null });
							elemCount = field.count.default;
						}

						var elemPath = JSON.parse(JSON.stringify(currentPath));
						elemPath.push(field.elem.name);
						for (var e = 0; e < self.utilityService.getInteger(elemCount); e++) {
							var arrayPath = JSON.parse(JSON.stringify(elemPath));
							// arrayPath.push(e);
							if (field.elem.type === "float" || field.elem.type === "double" || field.elem.type === "phyQuant" || field.elem.type === 'integer' || field.elem.type === 'uinteger' || field.elem.type === 'parity') {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							} else if (field.elem.type === "bits") {
								arrayPath.push(e);
								customFieldProcess([field.elem], arrayPath, true);
							} else if (field.elem.type === "struct") {
								var structFields = self.findStructTable(field.elem.structType);
								if (structFields != null) {
									arrayPath.push(e);
									customFieldProcess(structFields, arrayPath);
								}
							} else if (field.elem.type === "array") {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							} else if (field.elem.type === "varray") {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							} else if (field.elem.type === "datablock") {
								var fieldElem = JSON.parse(JSON.stringify(field.elem));
								fieldElem.name = e;
								customFieldProcess([fieldElem], arrayPath);
							}
						}
					}
				}
			}
			customFieldProcess(fields, path);
			return {
				bitValidator,
				numberPrecisionValidator,
				conditionValidator,
				integerValidator,
				lengthValidator
			};
		};

		this.schemaProcess = function (fields) {
			var properties = {};
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				if (field.editable != undefined && !field.editable) continue;
				if (field.type === "uinteger" || field.type === "integer") {
					if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
						var enumFields = self.findEnumTable(field.enumName)
						if (enumFields) {
							var enumArray = [];
							for (var e = 0; e < enumFields.length; e++)
								enumArray.push(enumFields[e].name + "(" + enumFields[e].value + ")");
							if (enumArray.length > 0)
								properties[field.name] = {
									enum: enumArray
								}
						}
					}
				}
				if (field.type === "string" || field.type === "bool") {
					properties[field.name] = {
						type: field.type,
						description: JSON.stringify(field),
						default: field.default,
					};
				}

				if (field.type === "bits") {
					if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
						var bitFields = self.findBitTable(field.bitsType);
						if (bitFields != null) {
							var bitObj = self.bitFieldProcess(bitFields);
							var propertyObj = {};
							var enumExist = false;
							for (var b = 0; b < bitObj.config.length; b++) {
								var config = bitObj.config[b];
								if (config.enum != null && config.enum != undefined) {
									enumExist = true;
									propertyObj[config.name] = {
										enum: config.enum
									}
								}
							}
							if (enumExist)
								properties[field.name] = {
									type: "object",
									properties: propertyObj
								}
						}
					}
				}

				if (field.type === "struct") {
					var structFields = self.findStructTable(field.structType);
					if (structFields != null) {
						var propertyObj = self.schemaProcess(structFields);
						properties[field.name] = {
							type: "object",
							description: JSON.stringify(field),
							properties: propertyObj,
						};
					}
				}
				if (field.type === "array") {
					var arrayProperty = self.arraySchemaProcess(field);
					if (arrayProperty != null) {
						properties[field.name] = arrayProperty;
						properties[field.name].description = JSON.stringify(field);
					}
				}
			}
			return properties;
		};
		/*
		 * JSONEditor.defaults.custom_validators.push(function(schema,
		 * value, path) { var errors = []; if(schema.format === "date") {
		 * if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) { // Errors must
		 * be an object with `path`, `property`, and `message` errors.push({
		 * path: path, property: 'format', message: 'Dates must be in the
		 * format "YYYY-MM-DD"' }); } } return errors; });
		 */

		this.getBitMinMax = function (field) {
			var bitLength = field.bitLength;
			if (bitLength === 0)
				return {
					minimum: '0',
					maximum: '0',
				};

			if (field.minimum == undefined || field.minimum == null || field.minimum == '' ||
				field.maximum == undefined || field.maximum == null || field.maximum == '') {
				var minMax = {
					minimum: '',
					maximum: ''
				}
				for (var i = 0; i < bitLength; i++) {
					minMax.minimum = minMax.minimum + '0';
					minMax.maximum = minMax.maximum + '1';
				}
				return minMax;
			}
			else {
				return {
					minimum: field.minimum,
					maximum: field.maximum
				}
			}
		};

		this.bitFieldProcess = function (fields, fieldValues) {
			var option = {
				default: "",
				bitLength: 0,
				minimum: '',
				maximum: '',
				obj: {},
				config: []
			};
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				var value = fieldValues ? fieldValues[i] : null;
				option.bitLength += field.bitLength;
				option.default = value ? (value + option.default) : (field.default + option.default);
				var minMax = self.getBitMinMax(field);
				option.obj[field.name] = value ? value : field.default;
				option.minimum = option.minimum + minMax.minimum;
				option.maximum = option.maximum + minMax.maximum;

				var enumArray = [];
				var enumFields = self.findEnumTable(field.enumName)
				if (enumFields) {
					for (var e = 0; e < enumFields.length; e++)
						enumArray.push(enumFields[e].value);
				}
				if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
					option.obj[field.name] = {
						value: value ? value : field.default,
						condition: enumArray.length > 0 ? '[' + enumArray.join("|") + ']' : '[' + minMax.minimum + ',' + minMax.maximum + ']'
					}
				}
				else if (self.currentProtocolMode == self.protocolModeEnum.fieldSelection) {
					option.obj[field.name] = value ? value : field.default;
				}
				else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
					option.obj[field.name] = value ? value : field.default;
				}
				else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
					option.obj[field.name] = enumArray.length > 0 ? '[' + enumArray.join("|") + ']' : '[' + minMax.minimum + ',' + minMax.maximum + ']'
				}
				var config = {
					bitLength: field.bitLength,
					minimum: minMax.minimum,
					maximum: minMax.maximum,
					name: field.name
				}
				if (enumArray.length > 0)
					config = {
						bitLength: field.bitLength,
						minimum: minMax.minimum,
						maximum: minMax.maximum,
						name: field.name,
						enum: enumArray
					};
				option.config.push(config);
			}
			return option;
		};

		this.arrayFieldProcess = function (field, elemCount, fieldValues) {
			var elementArray = [];
			for (var e = 0; e < self.utilityService.getInteger(elemCount); e++) {
				var value = fieldValues ? fieldValues[e] : null;
				if (field.elem.type === "integer" || field.elem.type === "uinteger") {
					var enumArray = [];
					var enumFields = self.findEnumTable(field.elem.enumName)
					if (enumFields) {
						for (var i = 0; i < enumFields.length; i++)
							enumArray.push(enumFields[i].value);
					}
					var elm = null;
					if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
						elm = {
							value: value ? value : field.elem.default,
							condition: enumArray.length > 0 ? '[' + enumArray.join("|") + ']' : '[' + field.elem.minimum + ',' + field.elem.maximum + ']'
						};
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting ||
						self.currentProtocolMode == self.protocolModeEnum.fieldSelection) {
						elm = enumArray.length > 0 ? enumArray[0] + "" : field.elem.default;
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
						elm = enumArray.length > 0 ? '[' + enumArray.join("|") + ']' : '[' + field.elem.minimum + ',' + field.elem.maximum + ']';
					}
					elementArray.push(elm);
				}
				if (field.elem.type === "phyQuant" || field.elem.type === "float" || field.elem.type === "double") {
					var elm = null;
					if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
						elm = {
							value: value ? value : field.elem.default,
							condition: '[' + field.elem.minimum + ',' + field.elem.maximum + ']'
						};
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting ||
						self.currentProtocolMode == self.protocolModeEnum.fieldSelection) {
						elm = value ? value : field.elem.default;
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
						elm = '[' + field.elem.minimum + ',' + field.elem.maximum + ']';
					}
					elementArray.push(elm);
				}
				if (field.elem.type === "string" || field.elem.type === "bool" || field.elem.type === "vardata" || field.elem.type === "varstring") {
					if (self.currentProtocolMode == self.protocolModeEnum.fieldSelection ||
						self.currentProtocolMode == self.protocolModeEnum.valueSetting)
						elementArray.push(value ? value : field.elem.default);
				}
				if (field.elem.type === "bits") {
					var bitFields = self.findBitTable(field.elem.bitsType);
					if (bitFields != null) {
						var bitObj = self.bitFieldProcess(bitFields, value);
						elementArray.push(bitObj.obj);
					}
				}
				if (field.elem.type === "struct") {
					var structFields = self.findStructTable(field.elem.structType);
					if (structFields != null) {
						var structObj = self.fieldProcess(JSON.parse(JSON.stringify(structFields)), value);
						elementArray.push(structObj);
					}
				} else if (field.elem.type === "array") {
					var subArray = self.arrayFieldProcess(field.elem, field.elem.elemCount, value);
					if (subArray != null) {
						elementArray.push(subArray);
					}
				} else if (field.elem.type === "varray") {
					var countFieldObj = self.fieldProcess([field.elem.count], value ? value[0] : null);
					var arrayFieldObj = {};
					arrayFieldObj[field.elem.elem.name] = self.arrayFieldProcess(field.elem, field.elem.count.default, value ? value[1] : null);
					if (countFieldObj != null && arrayFieldObj) {
						elementArray.push(Object.assign({}, countFieldObj, arrayFieldObj));
					}
				} else if (field.elem.type === "datablock") {
					var dataLenFieldObj = self.fieldProcess([field.elem.dataLen], value ? value[0] : null);
					var valueObj = self.fieldProcess([field.elem.data], value ? value[1] : null);
					if (dataLenFieldObj != null && valueObj != null) {
						elementArray.push(Object.assign({}, dataLenFieldObj, valueObj));
					}
				}
			}
			return elementArray;
		};

		this.fieldProcess = function (fields, fieldValues) {
			var obj = {};
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				var value = fieldValues ? fieldValues[i] : null;
				if (field.editable != undefined && !field.editable) continue; // TODO
				if (field.type === "rawdata") {
					obj[field.name] = value ? value : field.default;
				}
				if (field.isASCII != undefined) {
					if (field.isASCII) {
						obj["isASCII"] = true;
					} else {
						obj["isASCII"] = false;
					}
				}
				if (field.type === "integer" || field.type === "uinteger") {
					var enumArray = [];
					var enumFields = self.findEnumTable(field.enumName)
					if (enumFields) {
						for (var e = 0; e < enumFields.length; e++)
							enumArray.push(enumFields[e].value);
					}

					if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
						obj[field.name] = {
							value: value ? value : field.default,
							condition: enumArray.length > 0 ? '[' + enumArray.join("|") + ']' : '[' + field.minimum + ',' + field.maximum + ']'
						};
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting || self.currentProtocolMode == self.protocolModeEnum.fieldSelection) {
						//根据field.default值,如果有enumName,那么就是enumName的第一个值，否则就是field.default
						var fieldName = enumArray.length > 0 ? enumFields[0].name + "" : field.default; // field.default + "";
						if (enumFields && enumFields.length > 0) {
							//遍历enumFields
							for (var e = 0; e < enumFields.length; e++) {
								//field.default是否和enumFields的value相等
								if (field.default == enumFields[e].value) {
									fieldName = enumFields[e].name + "(" + enumFields[e].value + ")";
									break;
								}
							}

						}

						obj[field.name] = fieldName;
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
						obj[field.name] = enumArray.length > 0 ? '[' + enumArray.join("|") + ']' : '[' + field.minimum + ',' + field.maximum + ']';
					}
				}
				if (field.type === "phyQuant" || field.type === "float" || field.type === "double") {
					if (self.currentProtocolMode == self.protocolModeEnum.valueConditionSetting) {
						obj[field.name] = {
							value: value ? value : field.default,
							condition: '[' + field.minimum + ',' + field.maximum + ']'
						};
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.valueSetting ||
						self.currentProtocolMode == self.protocolModeEnum.fieldSelection) {
						obj[field.name] = value ? value : field.default;
					}
					else if (self.currentProtocolMode == self.protocolModeEnum.conditionSetting) {
						obj[field.name] = '[' + field.minimum + ',' + field.maximum + ']';
					}
				}
				if (field.type === "string" || field.type === "bool" || field.type === "vardata" || field.type === "varstring") {
					if (self.currentProtocolMode == self.protocolModeEnum.fieldSelection ||
						self.currentProtocolMode == self.protocolModeEnum.valueSetting) {
						obj[field.name] = value ? value : field.default;
					}
				}
				if (field.type === "bits") {
					var bitFields = self.findBitTable(field.bitsType);
					if (bitFields != null) {
						var bitObj = self.bitFieldProcess(bitFields, value);
						obj[field.name] = bitObj.obj;
					}
				}
				if (field.type === "struct") {
					var structFields = self.findStructTable(field.structType);
					if (structFields != null) {
						var structObj = self.fieldProcess(JSON.parse(JSON.stringify(structFields)), value);
						obj[field.name] = structObj;
					}
				}
				if (field.type === "array") {
					var arrayFieldObj = self.arrayFieldProcess(field, field.elemCount, value);
					if (arrayFieldObj != null) {
						obj[field.name] = arrayFieldObj;
					}
				}
				if (field.type === "varray") {
					var countFieldObj = self.fieldProcess([field.count], value ? value[0] : null);
					var arrayFieldObj = {}
					arrayFieldObj[field.elem.name] = self.arrayFieldProcess(field, field.count.default, value ? value[1] : null);
					if (countFieldObj != null && arrayFieldObj != null) {
						obj[field.name] = Object.assign({}, countFieldObj, arrayFieldObj);
					}
				}
				if (field.type === "datablock") {
					var dataLenFieldObj = self.fieldProcess([field.dataLen], value ? value[0] : null);
					var valueObj = self.fieldProcess([field.data], value ? value[1] : null);
					if (dataLenFieldObj != null && valueObj != null) {
						obj[field.name] = Object.assign({}, dataLenFieldObj, valueObj);
					}
				}
				/*
				if (field.type === "parity" || field.type === "crc"){
					if(self.currentProtocolMode == self.protocolModeEnum.fieldSelection || 
						self.currentProtocolMode == self.protocolModeEnum.valueSetting){
						obj[field.name] = value ? value : field.value;
					}
				}
				*/
				if (self.keepAllFields) {
					// if (field.type === "startFlag" || field.type === "dataLength" || field.type === "checksum" || field.type === "endFlag"){
					// 	obj[field.name] = value ? value : field.value;
					// }
					// if (field.type === "parity" || field.type === "crc"){
					// 	obj[field.name] = value ? value : field.value;
					// }
					//如果field.type不等于上面的类型，那么就是普通的字段
					if (field.type != "datablock" && field.type != "array" && field.type != "varray" && field.type != "bits" && field.type != "struct" &&
						field.type != "string" && field.type != "bool" && field.type != "vardata" && field.type != "varstring" &&
						field.type != "phyQuant" && field.type != "float" && field.type != "double" &&
						field.type != "integer" && field.type != "uinteger" && field.type != "rawdata"
					) {
						obj[field.name] = value ? value : field.value;
					}
				}
			}
			return obj;
		};

		this.originalProtocolConfig = null;
		this.editedProtocolConfig = null;
		this.customeSchemaValidator = null;
		this.currentSelectNode = null;
		this.multipleSelection = false;
		this.changeMap = new Map();
		this.validatorErrors = [];
		this.editor = null;
		this.keepAllFields = false;
		this.needSchemaCheck = true;
		this.protocolModeEnum = {
			valueSetting: 1,
			conditionSetting: 2,
			valueConditionSetting: 3,
			fieldSelection: 4
		};
		this.currentProtocolMode = self.protocolModeEnum.fieldSelection;

		this.onClassName = function ({ path, field, value }) {
			var pathKey = JSON.stringify(path);
			if (self.changeMap.has(pathKey))
				return 'different_element';
			else
				return 'the_same_element';
			/*
				const currentValue = _.get(self.editedProtocolConfig, path);
				const originalValue = _.get(self.originalProtocolConfig, path);
				var pathKey = JSON.stringify(path);
				if (_.isEqual(currentValue, originalValue)) {
					var change = self.changeMap.get(pathKey);
					if (change) self.changeMap.delete(pathKey);
					return "the_same_element";
				} else {
					if (!_.isObject(currentValue))
					self.changeMap.set(pathKey, currentValue);
					return "different_element";
				}
			*/
		};

		this.protocolOptionInit = function (protocol, message, currentProtocolMode, multipleSelection, keepAllFields, needSchemaCheck, fieldValues = null) {
			self.validatorErrors = [];
			self.changeMap = new Map();
			self.currentSelectNode = null;
			self.currentProtocolMode = currentProtocolMode;
			self.multipleSelection = multipleSelection;
			self.needSchemaCheck = needSchemaCheck;
			self.keepAllFields = keepAllFields;
			var structTables = protocol.structTypeDefineTable;
			var bitTables = protocol.bitsTypeDefineTable;
			var enumTables = protocol.enumTypeDefineTable;
			self.assistTableInit(structTables, bitTables, enumTables);
			self.editedProtocolConfig = self.fieldProcess(message.fields, fieldValues);
			self.originalProtocolConfig = JSON.parse(
				JSON.stringify(self.editedProtocolConfig)
			);

			if (needSchemaCheck) {
				var schemaObj = {
					title: message.messageName,
					description: message.messageName,
					type: "object",
					properties: {},
				};

				schemaObj.properties = self.schemaProcess(message.fields);
				self.customeSchemaValidator = self.customSchemaProcess(message.fields, self.editedProtocolConfig);
			}

			self.currentSelectNode = null;

			const options = {
				mode: (self.currentProtocolMode == self.protocolModeEnum.fieldSelection) ? "view" : "tree",
				name: message.messageName,
				modes: (self.currentProtocolMode == self.protocolModeEnum.fieldSelection) ? ["view"] : ["text", "tree"],
				contextMenu: false,
				enableSort: false,
				enableTransform: false,
				enableExtract: false,
				colorPicker: false,
				language: 'zh-CN',
				onClassName: self.onClassName,
				onEditable: function (node) {
					if (self.currentProtocolMode == self.protocolModeEnum.fieldSelection)
						return {
							field: false,
							value: false
						};
					else
						return {
							field: false,
							value: true,
						};
				},
				onChangeJSON: function (json) {
					var dynamicArrayConfig = self.isDynamicArrayConfig(protocol, message.messageName, self.currentSelectNode.path);
					if (dynamicArrayConfig) {
						var path = JSON.parse(JSON.stringify(self.currentSelectNode.path));
						var count = self.utilityService.getInteger(_.get(json, path));
						path.splice(path.length - 1, 1);
						var currentValue = _.get(json, path);
						if (currentValue) {
							var elem = currentValue[dynamicArrayConfig.elem.name];
							if (count > elem.length) {
								var distance = count - elem.length;
								while (distance > 0) {
									distance--;
									elem.push(JSON.parse(JSON.stringify(elem[0])));
								}
							}
							else if (count < elem.length) {
								if (count > 0) {
									var distance = elem.length - count;
									elem.splice(elem.length - distance - 1, distance);
								}
							}
							json = _.set(json, path, currentValue);
						}
					}
					self.editedProtocolConfig = json;
					if (needSchemaCheck) {
						var schemaObj = {
							title: message.messageName,
							description: message.messageName,
							type: "object",
							properties: {},
						};

						schemaObj.properties = self.schemaProcess(message.fields);
						self.customeSchemaValidator = self.customSchemaProcess(message.fields, self.editedProtocolConfig);
						self.editor.setSchema(schemaObj);
					}
					self.editor.update(json); //editor.set(newObj)
					// self.currentSelectNode.expanded = true;
					self.editor.refresh();
				},
				onValidate: function (json) {
					if (json.isASCII || protocol.isASCII) {
						return;
					}
					if (!self.needSchemaCheck)
						return;
					const errors = [];
					var path = self.getPaths(json);
					for (var i = 0; i < self.customeSchemaValidator.bitValidator.length; i++) {
						var currentValue = _.get(json, self.customeSchemaValidator.bitValidator[i].path);
						currentValue = "" + currentValue;
						regex = new RegExp(
							"^[10]{" +
							self.customeSchemaValidator.bitValidator[i].bitLength +
							"}$"
						);
						if (!regex.test(currentValue.trim())) {
							errors.push({
								path: self.customeSchemaValidator.bitValidator[i].path,
								message:
									"请输入长度为" +
									self.customeSchemaValidator.bitValidator[i].bitLength +
									"的二进制数据",
							});
						}
					}

					for (var i = 0; i < self.customeSchemaValidator.lengthValidator.length; i++) {
						//暂时不检查长度验证

						// var currentValue = _.get(json,self.customeSchemaValidator.lengthValidator[i].path);
						// currentValue = "" + currentValue;
						// if(currentValue.length > self.customeSchemaValidator.lengthValidator[i].dataLen)
						// 	errors.push({
						// 		path: self.customeSchemaValidator.lengthValidator[i].path,
						// 		message:
						// 		"输入数据长度不能超过" +
						// 		self.customeSchemaValidator.lengthValidator[i].dataLen + "!",
						// 	});
					}

					for (
						var i = 0;
						i < self.customeSchemaValidator.numberPrecisionValidator.length;
						i++
					) {
						var currentValue = _.get(
							json,
							self.customeSchemaValidator.numberPrecisionValidator[i].path
						);
						currentValue = "" + currentValue;
						try {
							var min = Number(self.customeSchemaValidator.numberPrecisionValidator[i].minimum);
							var max = Number(self.customeSchemaValidator.numberPrecisionValidator[i].maximum);
							var val = Number(currentValue);
							if (isNaN(min) || isNaN(max) || isNaN(val))
								errors.push({ path: self.customeSchemaValidator.numberPrecisionValidator[i].path, message: '输入值' + currentValue + '不是数值' });
							else if (val < min || val > max) {
								errors.push({ path: self.customeSchemaValidator.numberPrecisionValidator[i].path, message: '输入值' + currentValue + '不在区间[' + min + ',' + max + ']范围内' });
							}
						} catch (e) {
							errors.push({ path: self.customeSchemaValidator.numberPrecisionValidator[i].path, message: '输入值' + currentValue + '不是数值' });
						}
						regex = new RegExp(
							"^(-?[0-9]+)(.[0-9]{0," +
							self.customeSchemaValidator.numberPrecisionValidator[i]
								.precision +
							"})?$"
						);
						if (!regex.test(currentValue.trim())) {
							errors.push({
								path: self.customeSchemaValidator.numberPrecisionValidator[i]
									.path,
								message:
									"请输入精度为" +
									self.customeSchemaValidator.numberPrecisionValidator[i]
										.precision +
									"的数据",
							});
						}
					}

					for (var i = 0; i < self.customeSchemaValidator.integerValidator.length; i++) {
						var currentValue = _.get(json, self.customeSchemaValidator.integerValidator[i].path);
						currentValue = '' + currentValue;
						//判断self.customeSchemaValidator.integerValidator[i]中是否含有enum数组
						if (self.customeSchemaValidator.integerValidator[i].enum && self.customeSchemaValidator.integerValidator[i].enum.length > 0) {
							//如果有enum数组，那么就判断当前的currentValue是否在enum数组中
							var enumArray = self.customeSchemaValidator.integerValidator[i].enum;
							//遍历enumArray数组
							for (var j = 0; j < enumArray.length; j++) {
								if (currentValue == enumArray[j].name + "(" + enumArray[j].value + ")") {
									currentValue = enumArray[j].value;
									break;
								}
							}
						}
						try {
							var min = self.utilityService.getInteger(self.customeSchemaValidator.integerValidator[i].minimum);
							var max = self.utilityService.getInteger(self.customeSchemaValidator.integerValidator[i].maximum);
							var val = self.utilityService.getInteger(currentValue);
							if (isNaN(min) || isNaN(max) || isNaN(val))
								errors.push({ path: self.customeSchemaValidator.integerValidator[i].path, message: '输入值' + currentValue + '不是数值' });
							else if (val < min || val > max) {
								errors.push({ path: self.customeSchemaValidator.integerValidator[i].path, message: '输入值' + currentValue + '不在区间[' + min + ',' + max + ']范围内' });
							}
						} catch (e) {
							errors.push({ path: self.customeSchemaValidator.integerValidator[i].path, message: '输入值' + currentValue + '不是数值' });
						}
					}

					for (var i = 0; i < self.customeSchemaValidator.conditionValidator.length; i++) {
						var currentValue = _.get(json, self.customeSchemaValidator.conditionValidator[i].path);
						currentValue = '' + currentValue;
						try {
							var conditions;
							if (currentValue[0] == '~') {
								currentValue = currentValue.substr(1, currentValue.length - 1);
							}
							if (currentValue[currentValue.length - 1] == '~')
								currentValue = currentValue.substr(0, currentValue.length - 1);
							conditions = currentValue.substr(1, currentValue.length - 2).split(',');
							if (self.customeSchemaValidator.conditionValidator[i].enum != undefined && self.customeSchemaValidator.conditionValidator[i].enum.length > 0) {
								conditions = currentValue.substr(1, currentValue.length - 2).split('|');
								for (var c = 0; c < conditions.length; c++) {
									if (self.customeSchemaValidator.conditionValidator[i].type === 'bits') {
										regex = new RegExp("^[10]{0,}$");
										if (!regex.test(conditions[c].trim())) {
											errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '请输入二进制条件范围' });
										}
									}
									else {
										if (isNaN(conditions[c]))
											errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '条件范围必须为数值' });
									}
								}
							}
							else {
								if (self.customeSchemaValidator.conditionValidator[i].type === 'bits') {
									regex = new RegExp("^[10]{0,}$");
									if (!regex.test(conditions[0].trim()) || !regex.test(conditions[1].trim())) {
										errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '请输入二进制条件范围' });
									}
								}
								regex = new RegExp("^(-?(0x)?[0-9]+)(\.[0-9]+)?$");
								if ((currentValue[0] != '[' && currentValue[0] != '(') || (currentValue[currentValue.length - 1] != ']' && currentValue[currentValue.length - 1] != ')') ||
									conditions[0] == null || conditions[0] == undefined || conditions[1] == null || conditions[1] == undefined || isNaN(conditions[0]) || isNaN(conditions[1]) ||
									conditions[0].trim() == '' || conditions[1].trim() == '') {
									errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '请按照格式正确输入条件范围' });
								}
								//else if(!regex.test(conditions[0].trim()) || !regex.test(conditions[1].trim())){
								else if (isNaN(conditions[0]) || isNaN(conditions[1]) || conditions[0].trim() == '' || conditions[1].trim() == '') {
									errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '条件范围必须为数值' });
								}
								if (Number(conditions[0]) > Number(conditions[1])) {
									errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '条件范围起止数值有误' });
								}
								if (Number(conditions[0]) < Number(self.customeSchemaValidator.conditionValidator[i].minimum) || Number(conditions[1]) > Number(self.customeSchemaValidator.conditionValidator[i].maximum)) {
									errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '条件范围起止数值不在合法区间内' });
								}
							}
						}
						catch (e) {
							errors.push({ path: self.customeSchemaValidator.conditionValidator[i].path, message: '请按照格式正确输入条件范围' });
						}
					}
					return errors;
				},
				onValidationError: function (errors) {
					self.validatorErrors = errors;
				},
				onEvent: function (node, event) {
					if (event.type === "click") {
						self.currentSelectNode = node;
						const currentValue = _.get(self.editedProtocolConfig, node.path);
						// if(currentValue == undefined || typeof currentValue === 'object' || Array.isArray(currentValue))
						if (!_.isObject(currentValue)) {
							var path = JSON.parse(JSON.stringify(node.path));
							var pathkey = JSON.stringify(path);
							var exist = false;
							if (self.changeMap.has(pathkey)) {
								if (!self.multipleSelection) {
									self.changeMap.clear();
									self.editor.refresh();
									return;
								}
								else
									exist = true;
							}
							else {
								if (!self.multipleSelection)
									self.changeMap.clear();
							}

							var pathkeys = [];
							for (var i = path.length - 1; i >= 0; i--) {
								pathkeys.push(JSON.stringify(path));
								path.splice(i, 1);
							}
							for (var i = pathkeys.length - 1; i >= 0; i--) {
								var change = self.changeMap.get(pathkeys[i]);
								if (exist) {
									if (pathkey === pathkeys[i])
										self.changeMap.delete(pathkeys[i]);
									else {
										var count = change.count;
										if (change.count <= 1)
											self.changeMap.delete(pathkeys[i])
										else
											self.changeMap.set(pathkeys[i], { count: count - 1 });
									}
								}
								else {
									if (pathkey === pathkeys[i])
										self.changeMap.set(pathkeys[i], currentValue);
									else {
										if (change) {
											var count = change.count;
											self.changeMap.set(pathkeys[i], { count: count + 1 });
										}
										else
											self.changeMap.set(pathkeys[i], { count: 1 });
									}
								}
							}
							self.editor.refresh();
						}
					}
				},
			};
			if (needSchemaCheck)
				options.schema = schemaObj;
			return options;
		};

		this.getTemplate = function () {
			var templates = [
				{
					text: '消息属性',
					title: 'Insert a message',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"messageName": "",
						"attributes": []
					}
				},
				{
					text: '消息ID',
					title: 'Insert a message',
					field: 'elem',
					value: {
						"name": "messageID",
						"value": "0x00",
						"unique": true
					}
				},
				{
					text: '接收标记',
					title: 'Insert a message',
					field: 'elem',
					value: {
						"name": "receiveFlag",
						"value": "1"
					}
				},
				{
					text: '发送标记',
					title: 'Insert a message',
					field: 'elem',
					value: {
						"name": "sendFlag",
						"value": "1"
					}
				},
				{
					text: '结构定义',
					title: 'Insert a struct table',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"typeName": "结构类型名",
						"fields": []
					}
				},
				{
					text: '位串定义',
					title: 'Insert a bits table',
					field: 'elem',
					value: {
						"typeName": "位串类型名",
						"fields": []
					}
				},
				{
					text: '位字段',
					title: 'Insert a bit',
					field: 'elem',
					value: {
						"name": "位字段名",
						"bitLength": 2,
						"minimum": "00",
						"maximum": "11",
						"enumName": '',
						"default": "10"
					}
				},
				{
					text: '枚举定义',
					title: 'Insert a enum table',
					field: 'elem',
					value: {
						"typeName": "枚举类型名",
						"fields": []
					}
				},
				{
					text: '枚举字段',
					title: 'Insert a enum',
					field: 'elem',
					value: {
						"name": "枚举字段名",
						"value": "0"
					}
				},
				{
					text: '比例算法',
					title: 'Insert a scale table',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"name": "算法名",
						"type": "SCALE",
						"params": [
							{
								"name": "比例(scale)",
								"value": 1.5
							}
						]
					}
				},
				{
					text: '线性算法',
					title: 'Insert a slope table',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"name": "算法名",
						"type": "SLOPE",
						"params": [
							{
								"name": "系数(ratio)",
								"value": 1.5
							},
							{
								"name": "偏移量(offset)",
								"value": 2.1
							}
						]
					}
				},
				{
					text: '自定义算法',
					title: 'Insert a custom table',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"name": "算法名",
						"type": "CUSTOM",
						"toPhyQuantFormula": "sin(1.25) * $INPUT",
						"fromPhyQuantFormula": "asin(1.25) * $INPUT"
					}
				},
				{
					text: '标记字段',
					title: 'Insert a flag',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "flag",
						"name": "标记字段",
						"bitLength": 8,
						"value": "0xff"
					}
				},
				/*
				{
				  text: '同步头',
				  title: 'Insert a startFlag',
				  className: 'jsoneditor-type-object',
				  field: 'elem',
				  value: {
					  "isId":true,
					  "type":"startFlag",
					  "name":"同步头",
					  "bitLength":16,
					  "value":"0x0000"
				   } 
				}, 
				{
				  text: '同步尾',
				  title: 'Insert a endFlag',
				  className: 'jsoneditor-type-object',
				  field: 'elem',
				  value: {
					  "isId":true,
					  "type":"endFlag",
					  "name":"同步尾",
					  "bitLength":16,
					  "value":"0x0000"
				   } 
				},*/
				{
					text: '长度字段',
					title: 'Insert a dataLength',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "dataLength",
						"name": "长度字段",
						"bitLength": 16,
						"value": "0x0000",
						"fromField": '',
						"toField": ''
					}
				},
				{
					text: '无符号整数',
					title: 'Insert a uinteger',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "uinteger",
						"name": "字段名",
						"bitLength": 16,
						"minimum": "0x0000",
						"maximum": "0xffff",
						"default": "0x1f1f",
						"enumName": '',
						"unit": ""
					}
				},
				{
					text: '有符号整数',
					title: 'Insert a integer',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "integer",
						"name": "字段名",
						"bitLength": 16,
						"minimum": -32768,
						"maximum": 32767,
						"default": -500,
						"enumName": '',
						"unit": ""
					}
				},
				{
					text: '物理量',
					title: 'Insert a phyQuant',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "phyQuant",
						"name": "字段名",
						"bitLength": 16,
						// "signedNumber":true,
						// "complementCode":true,
						"minimum": -100.123,
						"maximum": 100.123,
						"default": 1.123,
						"unit": "",
						"precision": 3,
						"algorithmName": '',
						"unit": ""
					}
				},
				{
					text: '位串',
					title: 'Insert a bits',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "bits",
						"bitsType": null,
						"name": "字段名"
					}
				},
				{
					text: '数据块',
					title: 'Insert a datablock',
					className: 'jsoneditor-type-array',
					field: 'elem',
					value: {
						"type": "datablock",
						"name": "字段名",
						"dataLen": {
							"type": "uinteger",
							"name": "数据块长度",
							"bitLength": 16,
							"minimum": "0",
							"maximum": "65535",
							"default": "100"
						},
						"data": {
							"type": "rawdata",
							"name": "数据",
							"default": "00",
						}
					}
				},
				{
					text: '变长数据',
					title: 'Insert a vardata',
					className: 'jsoneditor-type-array',
					field: 'elem',
					value: {
						"type": "vardata",
						"name": "字段名",
						"default": "00",
					}
				},
				{
					text: '变长字符串',
					title: 'Insert a varstring',
					className: 'jsoneditor-type-array',
					field: 'elem',
					value: {
						"type": "varstring",
						"name": "字段名",
						"default": "00",
					}
				},
				{
					text: '单精度浮点数',
					title: 'Insert a float',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "float",
						"name": "字段名",
						"default": 1000.123,
						"minimum": -10000.123,
						"maximum": 10000.123,
						"precision": 3,
						"unit": ""
					}
				},
				{
					text: '双精度浮点数',
					title: 'Insert a double',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "double",
						"name": "字段名",
						"default": 1000.123,
						"minimum": -10000.123,
						"maximum": 10000.123,
						"precision": 3,
						"unit": ""
					}
				},

				{
					text: '结构',
					title: 'Insert a struct',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "struct",
						"structType": null,
						"name": "字段名"
					}
				},
				{
					text: '数组',
					title: 'Insert a array',
					className: 'jsoneditor-type-array',
					field: 'elem',
					value: {
						"type": "array",
						"name": "字段名",
						"elemCount": 10,
						"elem": {}
					}
				},
				{
					text: '动态数组',
					title: 'Insert a variant array',
					className: 'jsoneditor-type-array',
					field: 'elem',
					value: {
						"type": "varray",
						"name": "字段名",
						"count": {
							"type": "uinteger",
							"name": "数组长度",
							"bitLength": 16,
							"minimum": "0",
							"maximum": "65535",
							"default": "1"
						},
						"elem": {}
					}
				},
				{
					text: 'CRC校验',
					title: 'Insert a crc',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "crc",
						"name": "CRC校验字段",
						"bitLength": 16,
						"value": "0x0000",
						"crcAlgorithm": "CRC16_CCITT_FALSE",
						"fromField": '',
						"toField": ''
					}
				},
				{
					text: 'Checksum校验',
					title: 'Insert a checksum',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "checksum",
						"name": "Checksum校验字段",
						"bitLength": 16,
						"value": "0x0000",
						"fromField": '',
						"toField": ''
					}
				},
				{
					text: 'LRC校验',
					title: 'Insert a lrc',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "lrc",
						"name": "LRC校验字段",
						"bitLength": 16,
						"value": "0x0000",
						"fromField": '',
						"toField": ''
					}
				},
				{
					text: '奇偶校验',
					title: 'Insert a odd',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"type": "parity",
						"name": "奇偶校验字段",
						"odd": true,
						"value": '0',
						"fromField": '',
						"toField": ''
					}
				},
				{
					text: '消息',
					title: 'Insert a message',
					className: 'jsoneditor-type-object',
					field: 'elem',
					value: {
						"messageName": "消息名", "fields": []
					}
				}
			];
			return templates;
		};

		this.recurTransform = function (protocol, parentIsArray, fieldConfigArry, valueArray) {
			var dataList = [];
			for (var i = 0; i < fieldConfigArry.length; i++) {
				var field = fieldConfigArry[i];
				var value = valueArray[i];
				var fieldData = {};
				fieldData["type"] = field.type;
				if (parentIsArray) {
					var name;
					if (field.name != undefined) {
						name = field.name + "-";
						name += i.toString();
					}
					else {
						name = i.toString();
					}
					fieldData["name"] = name;
				}
				else {
					fieldData["name"] = field.name;
				}

				if (field.type == "bits") {
					if (protocol.bitsTypeDefineTable) {
						for (var j = 0; j < protocol.bitsTypeDefineTable.length; j++) {
							if (protocol.bitsTypeDefineTable[j].typeName === field.bitsType) {
								fieldData["data"] = self.recurTransform(protocol, false, protocol.bitsTypeDefineTable[j].fields, value)
								break;
							}
						}
					}
				}
				else if (field.type == "struct") {
					if (protocol.structTypeDefineTable) {
						for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
							if (protocol.structTypeDefineTable[j].typeName === field.structType) {
								fieldData["data"] = self.recurTransform(protocol, false, protocol.structTypeDefineTable[j].fields, value);
								break;
							}
						}
					}
				}
				else if (field.type == "array") {
					arrayFields = [];
					var count = self.utilityService.getInteger(field.elemCount);
					for (var k = 0; k < count; k++) {
						arrayFields.push(field.elem);
					}
					fieldData["data"] = self.recurTransform(protocol, true, arrayFields, value);
				}
				else {
					fieldData["unit"] = field.unit;
					fieldData["value"] = value;
					fieldData["data"] = [];
				}
				dataList.push(fieldData);
			}
			return dataList;
		};

		this.bigDataTransform = function (protocolId, messages) {
			var result = self.getProtocol(protocolId);
			if (!result)
				return;
			var currentBigDatatype = result.dataType;
			var protocol = JSON.parse(result.bigdata);
			var frameDatas = [];
			for (var i = 0; i < messages.length; i++) {
				var messageData = messages[i];
				var frame = {
					receiveFrame: messageData.receiveFrame,
					timestamp: messageData.timestamp,
					rawFrame: messageData.rawFrame,
					frameData: {
						message: messageData.message,
						fields: []
					}
				};

				var messageDef = null;
				for (var j = 0; j < protocol.messages.length; j++) {
					if (messageData.message === protocol.messages[j].messageName) {
						messageDef = protocol.messages[j];
						break;
					}
				}
				if (messageDef != null && messageData.fieldValues != "") {
					var valueArry = JSON.parse(messageData.fieldValues);
					frame.frameData.fields = self.recurTransform(protocol, false, messageDef.fields, valueArry);
				}
				frameDatas.push(frame);
			}
			return frameDatas;
		};

		this.getFormatHexValue = function (value, bitLength) {
			try {
				var hexTemplate = '0x';
				for (i = 0; i < bitLength; i = i + 4) {
					hexTemplate = hexTemplate + '0';
				}
				var hexValue = Number(value).toString(16);
				hexTemplate = hexTemplate.substr(0, hexTemplate.length - hexValue.length);
				hexValue = hexTemplate + hexValue;
			}
			catch (el) {
				console.log("getFormatHexValue error:" + e);
			}
			return hexValue;
		};

		this.bigDataArrayFieldProcess = function (protocol, field, valueArray, elemCount) {
			var elementArray = [];
			for (var e = 0; e < self.utilityService.getInteger(elemCount); e++) {
				var value = valueArray ? valueArray[e] : null;
				if (field.elem.type === "float" || field.elem.type === "double" || field.elem.type === "string" || field.elem.type === "bool" || field.type === "vardata" || field.type === "varstring") {
					value = value ? value : field.elem.default;
					elementArray.push(value);
				}
				if (field.elem.type === "crc" || field.elem.type === "lrc") {
					value = value ? value : field.elem.value;
					elementArray.push(value);
				}
				if (field.elem.type === "phyQuant") {
					if (value === undefined || value === null)
						value = field.elem.default + '(' + self.getFormatHexValue(field.elem.default, field.elem.bitLength) + ')';
					else {
						if (value.code === undefined || value.code === null)
							value = value.value + '(' + self.getFormatHexValue(value.value, field.elem.bitLength) + ')';
						else
							value = value.value + '(' + value.code + ')';
					}
					elementArray.push(value);
				}
				if (field.elem.type === "integer") {
					if (value === undefined || value === null)
						value = field.elem.default;
					else {
						if (value.value != undefined && value.value != null) {
							var enumStr = null;
							if (value.enum != undefined && value.enum != '')
								enumStr = value.enum;
							value = enumStr ? enumStr + ':' + value.value : value.value; // {value:0, enum:''}
						}
					}
					elementArray.push(value);
				}
				if (field.elem.type === "uinteger") {
					if (value === undefined || value === null)
						value = field.elem.default + '(' + self.getFormatHexValue(field.elem.default, field.elem.bitLength) + ')';
					else {
						if (value.value != undefined && value.value != null) {
							var enumStr = null;
							if (value.enum != undefined && value.enum != '')
								enumStr = value.enum;
							value = value.value + '(' + self.getFormatHexValue(value.value, field.elem.bitLength) + ')';
							value = enumStr ? enumStr + ':' + value : value
						}
						else
							value = value + '(' + self.getFormatHexValue(value, field.elem.bitLength) + ')';
					}
					elementArray.push(value);
				}
				if (field.elem.type === "bits") {
					if (protocol.bitsTypeDefineTable) {
						for (var j = 0; j < protocol.bitsTypeDefineTable.length; j++) {
							if (protocol.bitsTypeDefineTable[j].typeName === field.elem.bitsType) {
								elementArray.push(self.bigDataFieldProcess(protocol, protocol.bitsTypeDefineTable[j].fields, value));
								break;
							}
						}
					}
				}
				if (field.elem.type === "struct") {
					if (protocol.structTypeDefineTable) {
						for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
							if (protocol.structTypeDefineTable[j].typeName === field.elem.structType) {
								elementArray.push(self.bigDataFieldProcess(protocol, protocol.structTypeDefineTable[j].fields, value));
								break;
							}
						}
					}
				} else if (field.elem.type === "array") {
					elementArray.push(self.bigDataArrayFieldProcess(protocol, field.elem, value, field.elem.elemCount));
				} else if (field.elem.type === "varray") {
					var countFieldObj = {};
					countFieldObj[field.elem.count.name] = value ? value[0] : field.elem.count.default;
					var arrayFieldObj = {};
					arrayFieldObj[field.elem.elem.name] = self.bigDataArrayFieldProcess(protocol, field.elem, value ? value[1] : [], countFieldObj[field.elem.count.name]);
					if (countFieldObj != null && arrayFieldObj) {
						elementArray.push(Object.assign({}, countFieldObj, arrayFieldObj));
					}
				} else if (field.elem.type === "datablock") {
					var dataLenFieldObj = {};
					dataLenFieldObj[field.elem.dataLen.name] = value ? value[0] : field.elem.dataLen.default;
					var valueFieldObj = {};
					valueFieldObj[field.elem.data.name] = value ? value[1] : field.elem.data.default;
					if (dataLenFieldObj != null && valueFieldObj) {
						elementArray.push(Object.assign({}, dataLenFieldObj, valueFieldObj));
					}
				}
			}
			return elementArray;
		};

		this.bigDataFieldProcess = function (protocol, fieldConfigArry, valueArray) {
			//获取isAscii属性
			//判断protocol是否存在isASCII是否存在
			var isASCII = false;
			if (protocol.isASCII) {
				isASCII = protocol.isASCII;
			}
			var obj = {};
			for (var i = 0; i < fieldConfigArry.length; i++) {
				var field = fieldConfigArry[i];
				var tempIsASCII = false;
				if (field.isASCII) {
					tempIsASCII = field.isASCII;
				}
				var value = valueArray ? valueArray[i] : null;
				// fieldData["type"] = field.type;
				if (field.type === "bits") {
					if (protocol.bitsTypeDefineTable) {
						for (var j = 0; j < protocol.bitsTypeDefineTable.length; j++) {
							if (protocol.bitsTypeDefineTable[j].typeName === field.bitsType) {
								obj[field.name] = self.bigDataFieldProcess(protocol, protocol.bitsTypeDefineTable[j].fields, value)
								break;
							}
						}
					}
				}
				else if (field.type === "struct") {
					if (protocol.structTypeDefineTable) {
						for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
							if (protocol.structTypeDefineTable[j].typeName === field.structType) {
								obj[field.name] = self.bigDataFieldProcess(protocol, protocol.structTypeDefineTable[j].fields, value);
								break;
							}
						}
					}
				}
				else if (field.type === "array") {
					obj[field.name] = self.bigDataArrayFieldProcess(protocol, field, value, field.elemCount);
				}
				else if (field.type === "varray") {
					var countFieldObj = {};
					countFieldObj[field.count.name] = value ? value[0] : field.count.default;
					var arrayFieldObj = {};
					arrayFieldObj[field.elem.name] = self.bigDataArrayFieldProcess(protocol, field, value ? value[1] : [], countFieldObj[field.count.name]);
					obj[field.name] = Object.assign({}, countFieldObj, arrayFieldObj);
				}
				else if (field.type === "datablock") {
					var dataLenFieldObj = {};
					dataLenFieldObj[field.dataLen.name] = value ? value[0] : field.dataLen.default;
					var valueFieldObj = {};
					valueFieldObj[field.data.name] = value ? value[1] : field.data.default;
					obj[field.name] = Object.assign({}, dataLenFieldObj, valueFieldObj);
				}
				else if (field.type === "phyQuant") {
					if (value === undefined || value === null)
						value = field.default
					else {
						if (isASCII || tempIsASCII) {
							value = value.value
						} else {
							if (value.code === undefined || value.code === null)
								value = value.value + '(' + self.getFormatHexValue(value.value, field.bitLength) + ')';
							else
								value = value.value + '(' + value.code + ')';
						}
					}
					obj[field.name] = value;
					if (field.unit)
						obj[field.name] = value + ' (' + field.unit + ')';
				}
				else if (field.type === 'integer') {
					if (value === undefined || value === null)
						value = field.default
					else {
						if (value.value != undefined && value.value != null) {
							var enumStr = null;
							if (value.enum != undefined && value.enum != '')
								enumStr = value.enum;
							value = enumStr ? enumStr + ':' + value.value : value.value; // {value:0, enum:''}
						}
					}
					obj[field.name] = value;
					if (field.unit)
						obj[field.name] = value + ' (' + field.unit + ')';
				}
				else if (field.type === 'uinteger') {
					if (value === undefined || value === null)
						value = field.default
					else {
						if (value.value != undefined && value.value != null) {
							var enumStr = null;
							if (value.enum != undefined && value.enum != '')
								enumStr = value.enum;
							var code = null;
							if (value.code != undefined && value.code != null)
								code = value.code;
							if (code)
								value = enumStr ? enumStr + ':' + value.value + '(' + value.code + ')' : value.value + '(' + value.code + ')'; // {value:0, enum:''}
							else
								value = enumStr ? enumStr + ':' + value.value + '(' + self.getFormatHexValue(value.value, field.bitLength) + ')' : value.value + '(' + self.getFormatHexValue(value.value, field.bitLength) + ')'; // {value:0, enum:''}
						}
						else {
							if (isASCII || tempIsASCII) {
								value = value
							} else {
								value = value + '(' + self.getFormatHexValue(value, field.bitLength) + ')';
							}
						}
					}
					obj[field.name] = value;
					if (field.unit)
						obj[field.name] = value + ' (' + field.unit + ')';
				}
				else if (field.type === 'startFlag' || field.type === 'endFlag' || field.type === 'dataLength' || field.type === 'checksum') {
					if (isASCII || tempIsASCII) {
						value = value
					} else {
						value = value ? (value + ' (' + self.getFormatHexValue(value, field.bitLength) + ')') : field.value;
					}
					obj[field.name] = value;
					if (field.unit)
						obj[field.name] = value + ' (' + field.unit + ')';
				}
				else {
					if (value === undefined || value === null)
						value = field.default
					else {
						if (value.value != undefined && value.value != null) {
							var enumStr = null;
							if (value.enum != undefined && value.enum != '')
								enumStr = value.enum;
							value = enumStr ? enumStr + ':' + value.value : value.value;
						}
					}
					obj[field.name] = value;
					if (field.unit)
						obj[field.name] = value + ' (' + field.unit + ')';
				}
			}
			return obj;
		};

		this.bigDataFieldAnalysis = function (protocolId, messageName, fieldValues) {
			var result = self.getProtocol(protocolId);
			if (!result)
				return null;
			var fields = null;
			var messageDef = null;
			var protocol = JSON.parse(result.bigdata);
			for (var j = 0; j < protocol.messages.length; j++) {
				if (messageName === protocol.messages[j].messageName) {
					messageDef = protocol.messages[j];
					break;
				}
			}
			if (messageDef != null && fieldValues != "") {
				var valueArry = JSON.parse(fieldValues);
				fields = JSON.stringify(self.bigDataFieldProcess(protocol, messageDef.fields, valueArry));
			}
			return fields;
		};

		this.bigDataAnalysis = function (protocolId, messages) {
			var result = self.getProtocol(protocolId);
			if (!result)
				return;
			var currentBigDatatype = result.dataType;
			var protocol = JSON.parse(result.bigdata);
			var frameDatas = [];
			for (var i = 0; i < messages.length; i++) {
				var messageData = messages[i];
				var frame = {
					receiveFrame: messageData.receiveFrame,
					timestamp: messageData.timestamp,
					rawFrame: messageData.rawFrame,
					frameData: {
						message: messageData.message,
						fields: ''
					}
				};

				var messageDef = null;
				for (var j = 0; j < protocol.messages.length; j++) {
					if (messageData.message === protocol.messages[j].messageName) {
						messageDef = protocol.messages[j];
						break;
					}
				}
				if (messageDef != null && messageData.fieldValues != "") {
					var valueArry = JSON.parse(messageData.fieldValues);
					frame.frameData.fields = JSON.stringify(self.bigDataFieldProcess(protocol, messageDef.fields, valueArry));
					frame.frameData.fieldValues = messageData.fieldValues;
				}
				frameDatas.push(frame);
			}
			return frameDatas;
		};

		this.getArrayFieldValues = function (protocol, fields) {
			var elementArray = [];
			for (var e = 0; e < self.utilityService.getInteger(fields.elemCount); e++) {
				if (fields.elem.type === "bits") {
					if (protocol.bitsTypeDefineTable) {
						for (var j = 0; j < protocol.bitsTypeDefineTable.length; j++) {
							if (protocol.bitsTypeDefineTable[j].typeName === fields.elem.bitsType) {
								elementArray.push(self.getFieldValues(protocol, protocol.bitsTypeDefineTable[j].fields));
								break;
							}
						}
					}
				}
				else if (fields.elem.type === "struct") {
					if (protocol.structTypeDefineTable) {
						for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
							if (protocol.structTypeDefineTable[j].typeName === fields.elem.structType) {
								elementArray.push(self.getFieldValues(protocol, protocol.structTypeDefineTable[j].fields));
								break;
							}
						}
					}
				} else if (fields.elem.type === "array") {
					elementArray.push(self.getArrayFieldValues(protocol, fields.elem));
				} else {
					elementArray.push(fields.elem.default);
				}
			}
			return elementArray;
		};

		this.getFieldValues = function (protocol, fieldConfigArry) {
			var obj = [];
			for (var i = 0; i < fieldConfigArry.length; i++) {
				var field = fieldConfigArry[i];
				if (field.type === "bits") {
					if (protocol.bitsTypeDefineTable) {
						for (var j = 0; j < protocol.bitsTypeDefineTable.length; j++) {
							if (protocol.bitsTypeDefineTable[j].typeName === field.bitsType) {
								obj.push(self.getFieldValues(protocol, protocol.bitsTypeDefineTable[j].fields));
								break;
							}
						}
					}
				}
				else if (field.type === "struct") {
					if (protocol.structTypeDefineTable) {
						for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
							if (protocol.structTypeDefineTable[j].typeName === field.structType) {
								obj.push(self.getFieldValues(protocol, protocol.structTypeDefineTable[j].fields));
								break;
							}
						}
					}
				}
				else if (field.type === "array")
					obj.push(self.getArrayFieldValues(protocol, field));
				else if (field.type === 'startFlag' || field.type === 'endFlag' || field.type === 'dataLength' || field.type === 'checksum')
					obj.push(field.value);
				else
					obj.push(field.default);
			}
			return obj;
		};

		this.getMessageFieldValues = function (protocolId, messageName) {
			var result = self.getProtocol(protocolId);
			if (!result)
				return null;
			var fields = null;
			var messageDef = null;
			var protocol = JSON.parse(result.bigdata);
			for (var j = 0; j < protocol.messages.length; j++) {
				if (messageName === protocol.messages[j].messageName) {
					messageDef = protocol.messages[j];
					break;
				}
			}
			if (messageDef != null) {
				fields = JSON.stringify(self.getFieldValues(protocol, messageDef.fields));
			}
			return fields;
		};

		this.complexFieldValueIndexUpdate = function (protocol, field, indexPath, currentIndex) {
			if (field.type === "bits") {
				if (protocol.bitsTypeDefineTable) {
					for (var j = 0; j < protocol.bitsTypeDefineTable.length; j++) {
						if (protocol.bitsTypeDefineTable[j].typeName === field.bitsType) {
							currentIndex = currentIndex + 1;
							self.fieldValueIndexUpdate(protocol, protocol.bitsTypeDefineTable[j].fields, indexPath, currentIndex);
							break;
						}
					}
				}
			}
			else if (field.type === "struct") {
				if (protocol.structTypeDefineTable) {
					for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
						if (protocol.structTypeDefineTable[j].typeName === field.structType) {
							currentIndex = currentIndex + 1;
							self.fieldValueIndexUpdate(protocol, protocol.structTypeDefineTable[j].fields, indexPath, currentIndex);
							break;
						}
					}
				}
			}
			else if (field.type === "array") {
				currentIndex = currentIndex + 1;
				self.complexFieldValueIndexUpdate(protocol, field.elem, indexPath, currentIndex);
			}
		};

		this.fieldValueIndexUpdate = function (protocol, fields, indexPath, currentIndex) {
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				if (field.name === indexPath[currentIndex]) {
					indexPath[currentIndex] = i;
					self.complexFieldValueIndexUpdate(protocol, field, indexPath, currentIndex);
					break;
				}
			}
		};

		this.getFieldValueIndex = function (protocolId, messageName, path) {
			var result = self.getProtocol(protocolId);
			if (!result)
				return null;
			var indexPath = null;
			var messageDef = null;
			var protocol = JSON.parse(result.bigdata);
			for (var j = 0; j < protocol.messages.length; j++) {
				if (messageName === protocol.messages[j].messageName) {
					messageDef = protocol.messages[j];
					break;
				}
			}
			if (messageDef != null) {
				var indexPath = JSON.parse(JSON.stringify(path));
				self.fieldValueIndexUpdate(protocol, messageDef.fields, indexPath, 0);
			}
			return indexPath;
		};

		this.isDynamicArrayConfig = function (protocol, messageName, path) {
			if (path.length < 2)
				return null;
			var messageDef = null;
			for (var j = 0; j < protocol.messages.length; j++) {
				if (messageName === protocol.messages[j].messageName) {
					messageDef = protocol.messages[j];
					break;
				}
			}
			if (messageDef != null) {
				var indexPath = JSON.parse(JSON.stringify(path));
				var currentIndex = 0;
				var fields = messageDef.fields;
				while (currentIndex < indexPath.length - 1) {
					var currentField = null;
					for (var i = 0; i < fields.length; i++) {
						if (fields[i].name === indexPath[currentIndex]) {
							currentField = fields[i];
							break;
						}
					}
					if (currentField) {
						if (currentIndex === indexPath.length - 2) {
							if (currentField.type === 'varray' && indexPath[indexPath.length - 1] === currentField.count.name)
								return currentField;
							else
								return null;
						}
						else {
							if (currentField.type === 'array') {
								currentIndex = currentIndex + 1;
								indexPath[currentIndex] = currentField.elem.name
								fields = [currentField.elem];
							}
							else if (currentField.type === 'struct') {
								if (protocol.structTypeDefineTable) {
									var isStruct = false;
									for (var j = 0; j < protocol.structTypeDefineTable.length; j++) {
										if (protocol.structTypeDefineTable[j].typeName === currentField.structType) {
											currentIndex = currentIndex + 1;
											fields = protocol.structTypeDefineTable[j].fields;
											isStruct = true;
											break;
										}
									}
								}
								if (!isStruct)
									return null;
							}
							else if (currentField.type === 'varray') {
								currentIndex = currentIndex + 1;
								indexPath[currentIndex] = currentField.elem.name
								fields = [currentField.elem];
							}
							else
								return null;
						}
					}
					else
						return null;
				}
			}
			return null;
		};

		this.getFieldSize = function (protocol, field, currentFieldValue = null, currentFieldSize = null) {
			try {
				if (field.type === "vardata" || field.type === "varstring")
					return currentFieldSize;
				if (field.type === "float")
					return 32;
				if (field.type === "double")
					return 64;
				if (field.type === "parity")
					return 1;
				/*
				if (field.type === "fag" || field.type === "startFlag" || field.type === "dataLength" || field.type === "uinteger" || field.type === "integer" ||  field.type === "crc" ||  
						field.type === "checksum" || field.type === "endFlag" || field.type === "phyQuant" || field.type === "string" || field.type === "bool") {
					return field.bitLength;
				}
				*/
				else if (field.type === "bits") {
					if (protocol.bitsTypeDefineTable) {
						for (var i = 0; i < protocol.bitsTypeDefineTable.length; i++) {
							if (protocol.bitsTypeDefineTable[i].typeName === field.bitsType) {
								var size = 0;
								for (var j = 0; j < protocol.bitsTypeDefineTable[i].fields.length; j++)
									size += protocol.bitsTypeDefineTable[i].fields[j].bitLength
								return size;
							}
						}
					}
				}
				else if (field.type === "struct") {
					if (protocol.structTypeDefineTable) {
						for (var i = 0; i < protocol.structTypeDefineTable.length; i++) {
							if (protocol.structTypeDefineTable[i].typeName === field.structType) {
								var size = 0;
								for (var j = 0; j < protocol.structTypeDefineTable[i].fields.length; j++) {
									size += self.getFieldSize(protocol, protocol.structTypeDefineTable[i].fields[j], currentFieldValue[j], currentFieldSize[j]);
								}
								return size;
							}
						}
					}
				}
				else if (field.type === "array") {
					var size = 0;
					size = field.elemCount * self.getFieldSize(protocol, field.elem, currentFieldValue[0], currentFieldSize[0]);
					return size;
				}
				else if (field.type === "varray") {
					var size = self.getFieldSize(protocol, field.count);
					var elemCount = self.utilityService.getInteger(currentFieldValue[0]);
					size += elemCount * self.getFieldSize(protocol, field.elem, currentFieldValue[1][0], currentFieldSize[1][0]);
					return size;
				}
				else if (field.type === 'datablock') {
					var size = self.getFieldSize(protocol, field.dataLen);
					size += self.utilityService.getInteger(currentFieldValue[0]) * 8;
					return size;
				}
				else if (field.bitLength)
					return field.bitLength;
				return 0;
			}
			catch (e) {
				return 0;
			}

		};

		this.getFieldValueInterval = function (protocolId, messageName, path, fieldValueStr, fieldSizeStr) {
			var fieldValues = JSON.parse(fieldValueStr);
			var fieldSizes = JSON.parse(fieldSizeStr);
			var result = self.getProtocol(protocolId);
			if (!result)
				return null;
			var protocol = JSON.parse(result.bigdata);
			var messageDef = null;
			for (var j = 0; j < protocol.messages.length; j++) {
				if (messageName === protocol.messages[j].messageName) {
					messageDef = protocol.messages[j];
					break;
				}
			}
			if (messageDef != null) {
				var pathIndex = 0;
				var start = 0;
				var end = 0;
				var currentFields = messageDef.fields;
				var currentFieldValues = JSON.parse(JSON.stringify(fieldValues));
				var currentFieldSizes = JSON.parse(JSON.stringify(fieldSizes));
				while (pathIndex < path.length) {
					var currentPath = path[pathIndex];
					for (var fieldIndex = 0; fieldIndex < currentFields.length; fieldIndex++) {
						var currentField = currentFields[fieldIndex];
						var currentFieldValue = currentFieldValues[fieldIndex];
						var currentFieldSize = currentFieldSizes[fieldIndex];
						var fieldSize = self.getFieldSize(protocol, currentField, currentFieldValue, currentFieldSize);
						if (currentPath === currentField.name) {
							currentFieldValues = currentFieldValue;
							currentFieldSizes = currentFieldSize;
							if (pathIndex < path.length - 1) {
								if (currentField.type === 'bits') {
									if (protocol.bitsTypeDefineTable) {
										for (var k = 0; k < protocol.bitsTypeDefineTable.length; k++) {
											if (protocol.bitsTypeDefineTable[k].typeName === currentField.bitsType) {
												currentFields = protocol.bitsTypeDefineTable[k].fields;
												break;
											}
										}
									}
								}
								else if (currentField.type === 'struct') {
									if (protocol.structTypeDefineTable) {
										for (var k = 0; k < protocol.structTypeDefineTable.length; k++) {
											if (protocol.structTypeDefineTable[k].typeName === currentField.structType) {
												currentFields = protocol.structTypeDefineTable[k].fields;
												break;
											}
										}
									}
								}
								else if (currentField.type === 'array') {
									var arrayFieldSize = self.getFieldSize(protocol, currentField.elem, currentFieldValue[0], currentFieldSize[0]);
									var count = Number(path[pathIndex + 1]);
									start += arrayFieldSize * count;
									if (pathIndex + 1 == path.length - 1) {
										end = start + arrayFieldSize;
										++pathIndex;
									}
									else {
										if (currentField.elem.type === 'struct') {
											if (protocol.structTypeDefineTable) {
												for (var k = 0; k < protocol.structTypeDefineTable.length; k++) {
													if (protocol.structTypeDefineTable[k].typeName === currentField.elem.structType) {
														currentFields = protocol.structTypeDefineTable[k].fields;
														++pathIndex;
														break;
													}
												}
											}
										}
										else if (currentField.elem.type === 'bits') {
											if (protocol.bitsTypeDefineTable) {
												for (var k = 0; k < protocol.bitsTypeDefineTable.length; k++) {
													if (protocol.bitsTypeDefineTable[k].typeName === currentField.elem.bitsType) {
														currentFields = protocol.bitsTypeDefineTable[k].fields;
														++pathIndex;
														break;
													}
												}
											}
										}
										else if (currentField.elem.type === 'array') {
											currentFields = [currentField.elem];
											path[pathIndex + 1] = currentField.elem.name;
										}
										else if (currentField.elem.type === 'varray') {
											currentFields = [currentField.elem];
											++pathIndex;
										}
										else if (currentField.elem.type === 'datablock') {
											currentFields = [currentField.elem];
											++pathIndex;
										}
										else {
											end = start + arrayFieldSize;
											++pathIndex;
										}
									}
								}
								else if (currentField.type === 'varray') {
									var countField = JSON.parse(JSON.stringify(currentField.count));
									var arrayField = JSON.parse(JSON.stringify(currentField));
									arrayField.type = 'array';
									arrayField.name = arrayField.elem.name;
									arrayField.elemCount = self.utilityService.getInteger(currentFieldValue[0]);
									currentFields = [countField, arrayField];
								}
								else if (currentField.type === 'datablock') {
									var dataLenField = JSON.parse(JSON.stringify(currentField.dataLen));
									var valueField = JSON.parse(JSON.stringify(currentField.data));
									valueField.bitLength = self.utilityService.getInteger(currentFieldValue[0]) * 8;
									currentFields = [dataLenField, valueField];
								}
							}
							else {
								end = start + fieldSize;
							}
							break;
						}
						else
							start += fieldSize;
					}
					pathIndex++;
				}
				return { start, end };
			}
			return null;
		};
	}
	return new protocolService();
});
