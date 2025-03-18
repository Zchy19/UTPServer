package com.macrosoft.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.dto.BigDataWithTick;
import com.macrosoft.controller.dto.RecorderInfo;
import com.macrosoft.controller.dto.RecorderInfoConverter;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.BigData;
import com.macrosoft.model.Recorder;
import com.macrosoft.service.RecorderService;

@Controller
public class RecorderController {
	private static final ILogger logger = LoggerFactory.Create(RecorderController.class.getName());
	private RecorderService mRecorderService;

	@Autowired(required = true)
	
	public void setRecorderService(RecorderService ps) {
		this.mRecorderService = ps;
	}

	public class ValueObject {
		String value;

		public String getValue() {
			return value;
		}

		public void setValue(String value) {
			this.value = value;
		}
	}

	class AvailableScript {
		String rootId;
		String recordSetName;
		String scriptId;
		String scriptName;

		public String getRecordSetName() {
			return recordSetName;
		}

		public void setRecordSetName(String recordSetName) {
			this.recordSetName = recordSetName;
		}

		public String getRootId() {
			return rootId;
		}

		public void setRootId(String rootId) {
			this.rootId = rootId;
		}

		public String getScriptId() {
			return scriptId;
		}

		public void setScriptId(String scriptId) {
			this.scriptId = scriptId;
		}

		public String getScriptName() {
			return scriptName;
		}

		public void setScriptName(String scriptName) {
			this.scriptName = scriptName;
		}
	}

	@RequestMapping(value = RecorderRestURIConstants.GET_ScriptsListForSpecificRecordSet, method = RequestMethod.POST)
	public @ResponseBody ArrayList<AvailableScript> GET_ScriptsListForSpecificRecordSet(@RequestBody String params) {
		logger.info(String.format("GET_ScriptsListForSpecificRecordSet params: %s", params));
		String toolDynId = "";
		String orgId = "";
		String rootType = "";
		String recordsetId = "";

		JSONParser parser = new JSONParser();
		ArrayList<AvailableScript> result = new ArrayList<AvailableScript>();
		try {
			JSONObject p = (JSONObject) parser.parse(params);
			toolDynId = (String) p.get("toolDynId");
			orgId = (String) p.get("orgId");
			rootType = (String) p.get("rootType");
			recordsetId = (String) p.get("recordsetId");

			Recorder r = this.mRecorderService.getRecorder(recordsetId);
			if (r == null)
				return result;

			Object scriptNodes = getScriptJsonNode(r);
			if (scriptNodes != null) {

				JSONArray scriptNodesJSON = (JSONArray) scriptNodes;
				for (Object scriptNode : scriptNodesJSON) {
					JSONObject scriptNodeJSON = (JSONObject) scriptNode;

					AvailableScript script = new AvailableScript();
					script.setRootId(String.valueOf(r.getId()));
					script.setScriptId(((JSONArray) scriptNodeJSON.get("value")).get(0).toString());
					script.setScriptName(scriptNodeJSON.get("name").toString());
					script.setRecordSetName(r.getName());
					result.add(script);
				}
			}

		} catch (ParseException ex) {
			logger.error("GET_ScriptsListForSpecificRecordSet", ex);
		} catch (Exception ex) {
			logger.error("GET_ScriptsListForSpecificRecordSet", ex);
		}

		return result;
	}

	@RequestMapping(value = RecorderRestURIConstants.GET_ScriptsList, method = RequestMethod.POST)
	public @ResponseBody ArrayList<AvailableScript> getScripts(@RequestBody String params) {
		logger.info(String.format("GET_ScriptsList params: %s", params));
		String toolDynId = "";
		String orgId = "";
		String rootType = "";

		JSONParser parser = new JSONParser();
		try {
			JSONObject p = (JSONObject) parser.parse(params);
			toolDynId = (String) p.get("toolDynId");
			orgId = (String) p.get("orgId");
			rootType = (String) p.get("rootType");

		} catch (ParseException e) {
			logger.error(e.toString());
		}

		ArrayList<AvailableScript> result = new ArrayList<AvailableScript>();

		try {
			List<Recorder> records = this.mRecorderService.getRecorders(orgId, rootType);
			for (Recorder r : records) {
				Object scriptNodes = getScriptJsonNode(r);
				if (scriptNodes != null) {

					JSONArray scriptNodesJSON = (JSONArray) scriptNodes;
					for (Object scriptNode : scriptNodesJSON) {
						JSONObject scriptNodeJSON = (JSONObject) scriptNode;

						AvailableScript script = new AvailableScript();
						script.setRootId(String.valueOf(r.getId()));
						script.setScriptId(((JSONArray) scriptNodeJSON.get("value")).get(0).toString());
						script.setScriptName(scriptNodeJSON.get("name").toString());
						script.setRecordSetName(r.getName());
						;
						result.add(script);
					}
				}
			}
			return result;
		} catch (Exception ex) {
			logger.error("getScripts", ex);
			return null;
		}
	}

	private Object getScriptJsonNode(Recorder recorder) {
		JSONParser parser = new JSONParser();
		Object data;

		try {
			data = parser.parse(recorder.getJsonData());
			Object scriptNode = getScriptJsonNodeRecursively(data);
			return scriptNode;
		} catch (ParseException ex) {
			logger.error("getScriptJsonNode", ex);
		}

		return null;
	}

	private Object getScriptJsonNodeRecursively(Object jsonNode) {
		if (jsonNode instanceof JSONArray) {
			JSONArray result = new JSONArray();

			Iterator<JSONObject> iterator = ((JSONArray) jsonNode).iterator();
			while (iterator.hasNext()) {
				Object itemObj = iterator.next();
				if (!(itemObj instanceof JSONObject)) {
					return null;
				}
				JSONObject item = (JSONObject) itemObj;
				String typeValue = item.get("type").toString();

				// good way: find record collection in same level, which shall
				// be under recordset node.
				// current way: find one record, and then loop current level,
				// get all record node.
				if (typeValue.compareTo("Record") == 0) {
					JSONArray candidates = (JSONArray) jsonNode;
					for (Object candidate : candidates) {
						JSONObject obj = (JSONObject) candidate;
						String objTypeValue = obj.get("type").toString();
						if (objTypeValue.compareTo("Record") == 0) {
							result.add(obj);
						}
					}

					return result;
				}

				Object checkChild = getScriptJsonNodeRecursively(item.get("value"));
				if (checkChild != null) {
					return checkChild;
				}
			}
		} else if (jsonNode instanceof JSONObject) {
			Object itemObj = (JSONObject) jsonNode;
			if (!(itemObj instanceof JSONObject)) {
				return null;
			}
			JSONObject item = (JSONObject) itemObj;
			String typeValue = item.get("type").toString();
			if (typeValue.compareTo("Record") == 0) {
				return item;
			}
			Object checkChild = getScriptJsonNodeRecursively(item.get("value"));
			if (checkChild != null) {
				return checkChild;
			}
		}
		return null;
	}

	@RequestMapping(value = "/rest/record/getrootnode/{recordsetId}", method = RequestMethod.GET)
	public @ResponseBody RecorderInfo getAllRecorder(@PathVariable("recordsetId") String recordsetId) {

		logger.info(String.format("GET_RecordRoot recordsetId: %s", recordsetId));

		RecorderInfo result = new RecorderInfo();
		try {
			Recorder r = this.mRecorderService.getRecorder(recordsetId);

			RecorderInfo recorderInfo = RecorderInfoConverter.ConvertToRecorderInfo(r);

			return recorderInfo;
		} catch (Exception ex) {
			logger.error("getAllRecorder", ex);
		}

		return result;
	}

	@RequestMapping(value = RecorderRestURIConstants.GET_RecordRootList, method = RequestMethod.GET)
	public @ResponseBody List<RecorderInfo> getAllRecorders(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("orgId") String orgId, @PathVariable("rootType") String rootType) {

		logger.info(
				String.format("getAllRecorders toolDynId: %s , orgId: %s, rootType: %s", toolDynId, orgId, rootType));

		List<RecorderInfo> result = new ArrayList<RecorderInfo>();
		try {

			List<Recorder> records = this.mRecorderService.getRecorders(orgId, rootType);
			for (Recorder r : records) {
				RecorderInfo recorderInfo = RecorderInfoConverter.ConvertToRecorderInfo(r);
				result.add(recorderInfo);
			}
		} catch (Exception ex) {
			logger.error("getAllRecorders", ex);
		}

		return result;
	}

	@RequestMapping(value = RecorderRestURIConstants.GET_RecordFullNodeList, method = RequestMethod.GET)
	public @ResponseBody String getRecorderFullNodeList(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId) {

		logger.info(String.format("getRecorderFullNodeList toolDynId: %s , rootId: %s", toolDynId, rootId));

		Recorder recorder = this.mRecorderService.getRecorder(rootId);

		JSONObject result = new JSONObject();
		try {
			Object data;
			JSONParser parser = new JSONParser();
			data = parser.parse(recorder.getJsonData());
			result.put("data", data);
		} catch (ParseException ex) {
			logger.error("getRecorderFullNodeList", ex);
		} catch (Exception ex) {
			logger.error("getRecorderFullNodeList", ex);
		}

		return result.toJSONString();
	}

	@RequestMapping(value = RecorderRestURIConstants.GET_BigData, method = RequestMethod.GET)
	public @ResponseBody JSONObject getBigData(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId, @PathVariable("bigdataId") String bigdataId) {
		logger.info(
				String.format("getBigData toolDynId: %s , rootId: %s, bigdataId: %s", toolDynId, rootId, bigdataId));

		try {
			BigData bigData = this.mRecorderService.getBigData(rootId, bigdataId);

			BigDataWithTick bigdataWithTick = new BigDataWithTick(bigData);
			JSONObject result = new JSONObject();
			result.put("id", String.valueOf(bigdataId));
			result.put("value", bigData.getValue());
			result.put("lastUpdateTimeTicks", bigdataWithTick.getLastUpdateTimeTicks());
			
			// logger.info("get big data:" + result.toJSONString());
			// ValueObject obj = new ValueObject();
			// obj.setValue(result.toJSONString());
			return result;
		} catch (Exception ex) {
			logger.error("getBigData", ex);
			return null;
		}
	}

	// For add and update person both
	@RequestMapping(value = "/rest/record/attachBigData/{toolDynId}/{rootId}/{bigDataId}", method = RequestMethod.POST)
	public @ResponseBody boolean attachBigData(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId, @PathVariable("bigDataId") String bigDataId,
			@RequestBody String bigdataValue) {

		try {
			logger.info(String.format("attachBigData toolDynId: %s , rootId: %s, bigdataId: %s", toolDynId, rootId,
					bigDataId));

			BigData bigData = this.mRecorderService.getBigData(rootId, bigDataId);
			if (bigData != null) {
				bigData.setValue(bigdataValue);
				bigData.setLastUpdateTime(new Date(new Date().getTime()));
				this.mRecorderService.updateBigData(bigData);
			} else {
				BigData newBigData = new BigData();
				newBigData.setReferenceId(bigDataId);
				newBigData.setRootId(rootId);
				newBigData.setValue(bigdataValue);
				newBigData.setLastUpdateTime(new Date(new Date().getTime()));
				this.mRecorderService.addBigData(newBigData);
			}
			return true;
		} catch (Exception ex) {
			logger.error("attachBigData", ex);
			return false;
		}
	}

	// For add and update person both
	@RequestMapping(value = "/rest/record/create/{toolDynId}/{orgId}", method = RequestMethod.POST)
	public @ResponseBody String createRecorder(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("orgId") String orgId, @RequestBody String recorderJson) {

		logger.info(String.format("createRecorder toolDynId: %s , orgId: %s", toolDynId, orgId));

		Recorder recorder = new Recorder();
		recorder.setId(UUID.randomUUID().toString());
		JSONParser parser = new JSONParser();
		JSONObject obj;
		boolean saved = false;
		try {
			obj = (JSONObject) parser.parse(recorderJson);

			JSONObject rootInfo = (JSONObject) obj.get("rootInfo");

			recorder.setName(rootInfo.get("name").toString());
			recorder.setType(rootInfo.get("type").toString());
			recorder.setLastUpdatedTime(new Date()); // todo: rework.
			recorder.setJsonData(obj.get("data").toString());
			recorder.setOrgId(orgId);
			this.mRecorderService.addRecorder(recorder);

			logger.info(String.format("createRecorder recorderId: %s", recorder.getId()));

			Object bigDataObject = obj.get("bigData");
			if (bigDataObject != null) {
				JSONArray bigDatas = (JSONArray) obj.get("bigData");
				Iterator<JSONObject> iterator = ((JSONArray) bigDatas).iterator();
				while (iterator.hasNext()) {
					JSONObject bigDataJsonObj = iterator.next();
					BigData bigData = new BigData();
					bigData.setReferenceId(bigDataJsonObj.get("id").toString());
					bigData.setRootId(recorder.getId());
					bigData.setValue(bigDataJsonObj.get("value").toString());
					bigData.setLastUpdateTime(new Date(new Date().getTime()));
					this.mRecorderService.addBigData(bigData);
				}
			}

			saved = true;
		} catch (Exception ex) {
			logger.error("createRecorder", ex);
			saved = false;
		}
		if (saved) {
			JSONObject result = new JSONObject();
			result.put("rootId", String.valueOf(recorder.getId()));
			result.put("status", "ok");
			return result.toJSONString();
		}

		JSONObject result = new JSONObject();
		result.put("rootId", "");
		result.put("status", "fail");
		return result.toJSONString();
	}

	@RequestMapping(value = RecorderRestURIConstants.Update_Recorder, method = RequestMethod.POST)
	public @ResponseBody String editRecorder(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId, @RequestBody String recorderJson) {

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editRecorder");
		logger.info(String.format("editRecorder toolDynId: %s , rootId: %s", toolDynId, rootId));

		Recorder recorder = this.mRecorderService.getRecorder(rootId);

		JSONParser parser = new JSONParser();
		JSONObject obj;

		boolean saved = false;
		try {
			obj = (JSONObject) parser.parse(recorderJson);

			JSONObject rootInfo = (JSONObject) obj.get("rootInfo");

			recorder.setName(rootInfo.get("name").toString());
			recorder.setType(rootInfo.get("type").toString());
			recorder.setLastUpdatedTime(new Date()); // todo: rework.
			recorder.setJsonData(obj.get("data").toString());

			this.mRecorderService.updateRecorder(recorder);
			/*
			 * this.RecorderService.deleteBigDataByRootId(rootId);
			 * 
			 * Object bigDataObject = obj.get("bigData"); if (bigDataObject!=
			 * null) { JSONArray bigDatas = (JSONArray) obj.get("bigData");
			 * Iterator<JSONObject> iterator = ((JSONArray)bigDatas).iterator();
			 * while (iterator.hasNext()) { JSONObject bigDataJsonObj =
			 * iterator.next(); BigData bigData = new BigData();
			 * bigData.setReferenceId(bigDataJsonObj.get("id").toString());
			 * bigData.setRootId(rootId);
			 * bigData.setValue(bigDataJsonObj.get("value").toString());
			 * this.RecorderService.addBigData(bigData); } }
			 */
			saved = true;
		} catch (Exception ex) {
			logger.error("editRecorder", ex);
			saved = false;
		}
		if (saved) {
			JSONObject result = new JSONObject();
			result.put("rootId", String.valueOf(rootId));
			result.put("status", "ok");
			return result.toJSONString();
		}

		JSONObject result = new JSONObject();
		result.put("rootId", "");
		result.put("status", "fail");
		return result.toJSONString();
	}

	@RequestMapping(value = "/rest/bigdata/delete/{toolDynId}/{rootId}/{bigdataId}", method = RequestMethod.POST)
	public @ResponseBody boolean deleteBigData(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId, @PathVariable("bigdataId") String bigdataId) {

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteBigData");
		logger.info(
				String.format("deleteBigData toolDynId: %s , rootId: %s, bigdataId: %s", toolDynId, rootId, bigdataId));

		JSONObject result = new JSONObject();
		try {
			BigData bigdata = this.mRecorderService.getBigData(rootId, bigdataId);
			if (bigdata == null)
				return true;

			mRecorderService.deleteBigDataByBigDataId(bigdata.getId());
			return true;
		} catch (Exception ex) {
			logger.error("deleteBigData", ex);
			return false;
		}
	}

	@RequestMapping(value = "/rest/getBigDataByRootId/{toolDynId}/{rootId}", method = RequestMethod.GET)
	public @ResponseBody List<String> getBigDataByRootId(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId) {

		logger.info(String.format("getBigDataByRootId toolDynId: %s , rootId: %s", toolDynId, rootId));

		List<String> bigdataIds = new ArrayList<String>();
		try {
			List<BigData> bigdatas = this.mRecorderService.getBigDataByRootId(rootId);
			for (BigData bigdata : bigdatas) {
				bigdataIds.add(bigdata.getReferenceId());
			}
			return bigdataIds;

		} catch (Exception ex) {
			logger.error("getBigDataByRootId", ex);
			return bigdataIds;
		}
	}

	@RequestMapping(value = RecorderRestURIConstants.DELETE_Recorder, method = RequestMethod.POST)
	public @ResponseBody String deleteRecorder(@PathVariable("toolDynId") String toolDynId,
			@PathVariable("rootId") String rootId) {

		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteRecorder");

		logger.info(String.format("deleteRecorder toolDynId: %s , rootId: %s", toolDynId, rootId));
		JSONObject result = new JSONObject();
		try {
			this.mRecorderService.deleteRecorder(rootId);
			result.put("status", "ok");
			return result.toJSONString();
		} catch (Exception ex) {
			logger.error("deleteRecorder", ex);
			result.put("status", "fail");
		}
		return result.toJSONString();
	}

	public class RecorderRestURIConstants {
		public static final String GET_RecordRootList = "/rest/record/getrootlist/{toolDynId}/{orgId}/{rootType}";
		public static final String GET_ScriptsList = "/rest/record/getscriptlist";
		public static final String GET_ScriptsListForSpecificRecordSet = "/rest/record/recordset/getscriptlist";
		public static final String GET_RecordFullNodeList = "/rest/record/getfullnodes/{toolDynId}/{rootId}";
		public static final String GET_BigData = "/rest/record/getbigdata/{toolDynId}/{rootId}/{bigdataId}";

		public static final String Update_Recorder = "/rest/record/update/{toolDynId}/{rootId}";

		public static final String DELETE_Recorder = "/rest/record/delete/{toolDynId}/{rootId}";
	}
}
