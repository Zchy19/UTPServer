package com.macrosoft.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.AgentConfig;
import com.macrosoft.model.Script;
import com.macrosoft.model.ScriptContentParser;
import com.macrosoft.utilities.ExportExecutionUtility;
import com.macrosoft.utilities.StringUtility;


public class ExportExecutionResultParser  {

	private static final ILogger logger = LoggerFactory.Create(ExportExecutionResultParser.class.getName());
	
	private static final String WrongResult = "The path is not exist!";
	
	public static void setEngineCmds(ArrayList engineCmdDefinitions)
	{
		HashMap<String, String> engineCmdMap = new HashMap<String, String>();
		
		for (int i=0; i< engineCmdDefinitions.size(); i++) {

			if (!(engineCmdDefinitions.get(i) instanceof LinkedHashMap)) continue;

			LinkedHashMap cmdJSONObject =(LinkedHashMap)  engineCmdDefinitions.get(i);
			
			if (cmdJSONObject.get("CmdName") == null) continue;

			if (cmdJSONObject.containsKey("UserLanguage"))
			{
				ArrayList UserLanguageJsonArray = ((ArrayList) cmdJSONObject.get("UserLanguage"));

				if (UserLanguageJsonArray.size() >= 2)
				{
					LinkedHashMap UserLanguageJson = (LinkedHashMap) UserLanguageJsonArray.get(1); // second is Chinese.
					String descriptionFormat = UserLanguageJson.get("cmdDescFormatter").toString();
					
					engineCmdMap.put(cmdJSONObject.get("CmdName").toString(), descriptionFormat);
				}
			}
			
		}
		
		
		ExportExecutionResultContext.setEngineCmdMap(engineCmdMap);		
	}
	
	public static void setAgentTypeDefinitions(JSONObject agentTypeDefinitions)
	{
		HashMap<String, ExportExecutionDataCollector> parsedCommandMap = new HashMap<String, ExportExecutionDataCollector>();

		if (agentTypeDefinitions.containsKey("agentTypeList"))
		{
			ArrayList agentTypeList = ((ArrayList) agentTypeDefinitions.get("agentTypeList"));

			for (Object agentType : agentTypeList) {
				LinkedHashMap agentTypeJSON = (LinkedHashMap) agentType;

				String agentTypeName = agentTypeJSON.get("name").toString();
				
				if (agentTypeJSON.containsKey("commands"))
				{
					ArrayList commandsJsonArray = ((ArrayList) agentTypeJSON.get("commands"));

					for (Object command : commandsJsonArray) {
						LinkedHashMap commandJSON = (LinkedHashMap) command;
						
						CollectCommands(parsedCommandMap, agentTypeName, commandJSON);
					}					
				}

			}
			
		}
		
		ExportExecutionResultContext.setParsedCommandMap(parsedCommandMap);
		
		
	}


	private static void CollectCommands(HashMap<String, ExportExecutionDataCollector> parsedCommandMap,
										String agentTypeName, LinkedHashMap commandJSON) 
	{
		if (commandJSON.get("CommandList") != null)
		{
			ArrayList commandsJsonArray2 = ((ArrayList) commandJSON.get("CommandList"));

			for (Object command2 : commandsJsonArray2) {
				LinkedHashMap commandJSON2 = (LinkedHashMap<?, ?>) command2;
				CollectCommands(parsedCommandMap, agentTypeName, commandJSON2);
			}			
		}
		
		if (commandJSON.get("CmdName") == null) return;
		
		
		String commandName = commandJSON.get("CmdName").toString();
		logger.debug(String.format("CollectCommands()->agentTypeName:%s, cmdName:%s", agentTypeName, commandName));
		
		ExportExecutionDataCollector collector = new ExportExecutionDataCollector();
		
		ArrayList ParamsJsonArray = ((ArrayList) commandJSON.get("Params"));
		for (int i=0; i<ParamsJsonArray.size(); i++) {
			
			if (!(ParamsJsonArray.get(i) instanceof LinkedHashMap)) continue;

			LinkedHashMap paramJSONObject =(LinkedHashMap)  ParamsJsonArray.get(i);
			
			logger.debug(String.format("CollectCommands()->param:%s", paramJSONObject.get("name")));
			
			if (paramJSONObject.containsKey("keyParamFlag"))
			{
				logger.debug(String.format("CollectCommands()->keyParamFlag:%s", paramJSONObject.get("keyParamFlag")));

				String name = paramJSONObject.get("name").toString();
				String keyParamFlag = paramJSONObject.get("keyParamFlag").toString();

				if ("input".equalsIgnoreCase(keyParamFlag))
				{
					collector.getInputKeyDataIndex().put(i, name);

				}
				if ("output".equalsIgnoreCase(keyParamFlag))
				{
					collector.getOutputKeyDataIndex().put(i, name);
				}
				if ("expected".equalsIgnoreCase(keyParamFlag))
				{
					collector.getExpectedKeyDataIndex().put(i, name);
				}
			}
		}
		
		
		if (commandJSON.containsKey("UserLanguage"))
		{
			ArrayList UserLanguageJsonArray = ((ArrayList) commandJSON.get("UserLanguage"));

			if (UserLanguageJsonArray.size() >= 2)
			{
				LinkedHashMap UserLanguageJson = (LinkedHashMap) UserLanguageJsonArray.get(1); // second is Chinese.
				String descriptionFormat = UserLanguageJson.get("cmdDescFormatter").toString();
				
				String key = String.format("%s_%s", agentTypeName, commandName);
				
				collector.setCommandFormat(descriptionFormat);
				
				parsedCommandMap.put(key, collector);
			}
		}
	}
	
	
	public static void setAgentInstances(List<AgentConfig> agentConfigs)
	{
		HashMap<String, String> agentInstances = new HashMap<String, String>();
		for (AgentConfig agentConfig : agentConfigs)
		{
			agentInstances.put(agentConfig.getAgentInstanceName(), agentConfig.getAgentType());
		}
		
		ExportExecutionResultContext.setAgentInstanceMap(agentInstances);
	}
	

	public static ExportExecutionParsedResult parseExecutionResult(String agentInstanceName, String command)
	{
		
		String[] commandGroups = command.split(ScriptContentParser.CommandSeparator);
		if (commandGroups.length < 2) return new ExportExecutionParsedResult(command);

		logger.debug(String.format("commandName: %s", commandGroups[0]));
		
		JSONArray commandParaGroups = StringUtility.toJsonArray(commandGroups[1]) ;
		if (commandParaGroups == null) 
		{
			logger.error(String.format("failed to parse command param: %s", commandGroups[1]));
			return new ExportExecutionParsedResult(command);
		}
		
		List<String> commandParams = new ArrayList<String>();
		for (Object j : commandParaGroups)
		{
			logger.debug(String.format("commandParaGroups iterate: %s", j.toString()));			
			commandParams.add(j.toString());
		}
		
		HashMap<String, String> agentInstances = ExportExecutionResultContext.getAgentInstanceMap();
		HashMap<String, String> engineCmdMaps = ExportExecutionResultContext.getEngineCmdMap();
		
		// 1. parse system command
		if ("__EXTDEV__".equalsIgnoreCase(agentInstanceName))
		{
			String commandFormater = engineCmdMaps.get(commandGroups[0]);
			ExportExecutionParsedResult parsedResult = new ExportExecutionParsedResult();

			if (commandFormater.contains("调用子脚本")){
				//获取commandParams的长度
				int length = commandParams.size();
				//根据长度,增加%si
				if (length > 1) {
					// 构建替换字符串
					StringBuilder replacement = new StringBuilder();
					for (int k = 2; k <= length; k++) {
						if (k > 2) {
							replacement.append(",");
						}
						replacement.append(String.format("%%s%d", k));
					}

					// 使用正则表达式进行替换
					commandFormater = commandFormater.replaceFirst("%s2", replacement.toString());
				}

			}
			for (int i=0; i < commandParams.size(); i++)
			{

				logger.debug(String.format("command parameter-%s: %s", i, commandParams.get(i)));
				if (i == 0)
				{
					parsedResult.setParsedCommand(commandFormater);
				}

				String parsedCommand = parsedResult.getParsedCommand().replace("%s".concat(Integer.toString(i+1)), commandParams.get(i));
				parsedResult.setParsedCommand(parsedCommand);

				logger.debug(String.format("parsedCommand:%s", parsedCommand));
			}
			return parsedResult;
		}

		// 2. parse antbot command
		if (!agentInstances.containsKey(agentInstanceName)) return new ExportExecutionParsedResult(command);
		
		String agentType = agentInstances.get(agentInstanceName);
		
		String key = String.format("%s_%s", agentType, commandGroups[0]);
		logger.debug(String.format("key: %s", key));
		
		HashMap<String,ExportExecutionDataCollector> parsedCommandMap = ExportExecutionResultContext.getParsedCommandMap();

		if (!parsedCommandMap.containsKey(key)) return new ExportExecutionParsedResult(command);
		
		ExportExecutionDataCollector dataCollector = parsedCommandMap.get(key);
		ExportExecutionParsedResult parsedResult = new ExportExecutionParsedResult();		

		logger.debug(String.format("dataCollector.getCommandFormat():%s", dataCollector.getCommandFormat()));
		
		parsedResult.setParsedCommand(dataCollector.getCommandFormat());	
		
		for (int i=0; i < commandParams.size(); i++)
		{
			logger.debug(String.format("command parameter-%s: %s", i, commandParams.get(i)));
			String parsedCommand = parsedResult.getParsedCommand().replace("%s".concat(Integer.toString(i+1)), commandParams.get(i));			
			parsedResult.setParsedCommand(parsedCommand);
		
			logger.debug(String.format("parsedCommand:%s", parsedCommand));
		}
		
		if (agentInstanceName != null)
		{
			parsedResult.setParsedCommand(agentInstanceName + " " + parsedResult.getParsedCommand());
		}
		
		logger.debug(String.format("dataCollector.getInputKeyDataIndex():%s", dataCollector.getInputKeyDataIndex()));
		logger.debug(String.format("dataCollector.getOutputKeyDataIndex():%s", dataCollector.getOutputKeyDataIndex()));
		logger.debug(String.format("dataCollector.getExpectedKeyDataIndex():%s", dataCollector.getExpectedKeyDataIndex()));
		
		
		for (int i : dataCollector.getInputKeyDataIndex().keySet())
		{
			if (commandParams.size() < (i+1)) 
			{
				logger.debug(String.format("dataCollector.getInputKeyDataIndex()->commandParams.size:%s, i:%s", commandParams.size(), i));

				parsedResult.setWrongComment(WrongResult);
				break;
			}
			
			String paramName = dataCollector.getInputKeyDataIndex().get(i);			
			parsedResult.setInputKeyData(parsedResult.getInputKeyData() + paramName + ":"+ commandParams.get(i) + ";");
		}
		
		for (int i : dataCollector.getOutputKeyDataIndex().keySet())
		{
			if (commandParams.size() < (i+1)) 
			{
				logger.debug(String.format("dataCollector.getOutputKeyDataIndex()->commandParams.size:%s, i:%s", commandParams.size(), i));
				parsedResult.setWrongComment(WrongResult);
				break;
			}
			
			String paramName = dataCollector.getOutputKeyDataIndex().get(i);			
			parsedResult.setOutputKeyData(parsedResult.getOutputKeyData() + paramName + ":"+ commandParams.get(i) + ";");
		}

		for (int i : dataCollector.getExpectedKeyDataIndex().keySet())
		{
			if (commandParams.size() < (i+1)) 
			{
				logger.debug(String.format("dataCollector.getExpectedKeyDataIndex()->commandParams.size:%s, i:%s", commandParams.size(), i));

				parsedResult.setWrongComment(WrongResult);
				break;
			}

			String paramName = dataCollector.getExpectedKeyDataIndex().get(i);
			parsedResult.setExpectedKeyData(parsedResult.getExpectedKeyData() + paramName + ":"+ commandParams.get(i) + ";");
		}
		
		
		return parsedResult;
	}


	public static List<ExportExecutionParsedResult> parseScript(String scriptContent)
	{
		List<ExportExecutionParsedResult> results = new ArrayList<ExportExecutionParsedResult>();
		if (scriptContent == null || scriptContent == "") return results;
		
		String[] commandLines = scriptContent.split(ScriptContentParser.ScriptLineSeparator);

		for (int i=0; i < commandLines.length; i++)
		{
			String command = commandLines[i];
			logger.debug(String.format("command: %s", command));

			String[] commandGroups = command.split(ScriptContentParser.CommandSeparator);
			if (commandGroups.length < 2) continue;

			boolean isSystemCommand = !(commandGroups[0].contains("[[") && commandGroups[0].contains("]]"));			
			
			HashMap<String, String> agentInstances = ExportExecutionResultContext.getAgentInstanceMap();
			HashMap<String, String> engineCmdMaps = ExportExecutionResultContext.getEngineCmdMap();
			
			if (isSystemCommand)
			{
				String commandName = commandGroups[0];

				logger.debug(String.format("commandName: %s", commandName));

				List<String> commandParams = new ArrayList<String>();
				for (int j=1; j< commandGroups.length; j++)
				{
					logger.debug(String.format("commandParaGroups iterate: %s", commandGroups[j]));			
					commandParams.add(commandGroups[j]);
				}

				String commandFormater = engineCmdMaps.get(commandName);

				ExportExecutionParsedResult parsedResult = new ExportExecutionParsedResult();	
				for (int j=0; j < commandParams.size(); j++)
				{
					logger.debug(String.format("command parameter-%s: %s", j, commandParams.get(j)));
					if (j == 0)
					{
						parsedResult.setParsedCommand(commandFormater);	
					}

					String parsedCommand = parsedResult.getParsedCommand().replace("%s".concat(Integer.toString(j+1)), commandParams.get(j));			
					parsedResult.setParsedCommand(parsedCommand);
				
					logger.debug(String.format("parsedCommand:%s", parsedCommand));
				}
				
				results.add(parsedResult);
			}
			else
			{
				String agentInstanceName = commandGroups[0];
				
				agentInstanceName = agentInstanceName.replace("[[", "");
				agentInstanceName = agentInstanceName.replace("]]", "");
				logger.debug(String.format("antbotInstanceName: %s", agentInstanceName));
		
				String commandName = commandGroups[1];
				logger.debug(String.format("commandName: %s", commandName));
				
				List<String> commandParams = new ArrayList<String>();
				for (int j=2; j< commandGroups.length; j++)
				{
					logger.debug(String.format("commandParaGroups iterate: %s", commandGroups[j]));
					commandParams.add(commandGroups[j]);
				}

				if (!agentInstances.containsKey(agentInstanceName)) continue;
				
				String agentType = agentInstances.get(agentInstanceName);
				
				String key = String.format("%s_%s", agentType, commandName);
				logger.debug(String.format("key: %s", key));
				
				HashMap<String,ExportExecutionDataCollector> parsedCommandMap = ExportExecutionResultContext.getParsedCommandMap();

				if (!parsedCommandMap.containsKey(key)) continue;
				
				ExportExecutionDataCollector dataCollector = parsedCommandMap.get(key);
				ExportExecutionParsedResult parsedResult = new ExportExecutionParsedResult();		

				logger.debug(String.format("dataCollector.getCommandFormat():%s", dataCollector.getCommandFormat()));
				
				parsedResult.setParsedCommand(dataCollector.getCommandFormat());	
				
				for (int j=0; j < commandParams.size(); j++)
				{
					logger.debug(String.format("command parameter-%s: %s", j, commandParams.get(j)));
					String parsedCommand = parsedResult.getParsedCommand().replace("%s".concat(Integer.toString(j+1)), commandParams.get(j));			
					parsedResult.setParsedCommand(parsedCommand);
				
					logger.debug(String.format("parsedCommand:%s", parsedCommand));
				}
				
				if (agentInstanceName != null)
				{
					parsedResult.setParsedCommand(agentInstanceName + " " + parsedResult.getParsedCommand());
				}
				
				logger.debug(String.format("dataCollector.getInputKeyDataIndex():%s", dataCollector.getInputKeyDataIndex()));
				logger.debug(String.format("dataCollector.getOutputKeyDataIndex():%s", dataCollector.getOutputKeyDataIndex()));
				logger.debug(String.format("dataCollector.getExpectedKeyDataIndex():%s", dataCollector.getExpectedKeyDataIndex()));
				
				
				for (int j : dataCollector.getInputKeyDataIndex().keySet())
				{
					if (commandParams.size() < (j+1)) 
					{
						logger.debug(String.format("dataCollector.getInputKeyDataIndex()->commandParams.size:%s, j:%s", commandParams.size(), j));

						parsedResult.setWrongComment(WrongResult);
						break;
					}
					
					String paramName = dataCollector.getInputKeyDataIndex().get(j);			
					parsedResult.setInputKeyData(parsedResult.getInputKeyData() + paramName + ":"+ commandParams.get(j) + ";");
				}
				
				for (int j : dataCollector.getExpectedKeyDataIndex().keySet())
				{
					if (commandParams.size() < (j+1)) 
					{
						logger.debug(String.format("dataCollector.getExpectedKeyDataIndex()->commandParams.size:%s, j:%s", commandParams.size(), j));

						parsedResult.setWrongComment(WrongResult);
						break;
					}

					String paramName = dataCollector.getExpectedKeyDataIndex().get(j);
					parsedResult.setExpectedKeyData(parsedResult.getExpectedKeyData() + paramName + ":"+ commandParams.get(j) + ";");
				}
				
				results.add(parsedResult);
			}			
		}
		
		return results;
	}
}
