package com.macrosoft.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.ServletContext;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.baidu.aip.ocr.AipOcr;
import com.macrosoft.controller.dto.BigdataStorageInfo;
import com.macrosoft.controller.dto.DataWraper;
import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.BigdataStorage;
import com.macrosoft.utilities.BaiduUtil;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.OcrUtil;
import com.macrosoft.utilities.SystemUtil;

import ch.qos.logback.core.util.FileUtil;

@Controller
public class BaiduAiAdapterController {
	private static final ILogger logger = LoggerFactory.Create(BaiduAiAdapterController.class.getName());
	@Autowired
	ServletContext context;

	@RequestMapping(value = "/api/ocr", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
	public @ResponseBody JSONObject ocr(@RequestParam("file") MultipartFile inputFile) {

		if (inputFile.isEmpty()) {
			return null;
		}

		try {
			HttpHeaders headers = new HttpHeaders();
			// Step1: Save uploaded file to temporary folder.
			String originalFilename = inputFile.getOriginalFilename();
			String destinationFilePath = SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/ + File.separator + UUID.randomUUID();
			File destinationFile = new File(destinationFilePath);
			if (!new File(destinationFilePath).exists()) {
				new File(destinationFilePath).mkdir();
			}

			inputFile.transferTo(destinationFile);

			headers.add("File Uploaded Successfully - ", originalFilename);
			logger.info(String.format("File Uploaded Successfully - originalFilename: %s, destinationFilePath: %s ", originalFilename, destinationFilePath));
			
			// Step2: Call baidu api to process ocr.
			AipOcr client = new AipOcr(BaiduUtil.getInstance().getOcrAppId(), BaiduUtil.getInstance().getOcrApiKey(),
					BaiduUtil.getInstance().getOcrSecretKey());

			// 可选：设置网络连接参数
			client.setConnectionTimeoutInMillis(2000);
			client.setSocketTimeoutInMillis(60000);

			// 可选：设置代理服务器地址, http和socket二选一，或者均不设置
			// client.setHttpProxy("proxy_host", proxy_port); // 设置http代理
			// client.setSocketProxy("proxy_host", proxy_port); // 设置socket代理

			// 可选：设置log4j日志输出格式，若不设置，则使用默认配置
			// 也可以直接通过jvm启动参数设置此环境变量
			// System.setProperty("aip.log4j.conf",
			// "path/to/your/log4j.properties");

			// 传入可选参数调用接口
			HashMap<String, String> options = new HashMap<String, String>();
			options.put("language_type", "CHN_ENG");
			options.put("detect_direction", "true");
			options.put("detect_language", "true");
			options.put("probability", "true");

			String image = destinationFilePath;
			org.json.JSONObject res2 = client.basicGeneral(image, options);

			JSONParser parser = new JSONParser();
			JSONObject parsedWordsResult = (JSONObject) parser.parse(res2.toString());

			logger.info(String.format("client result parsed. "));
			JSONObject result = new JSONObject();
			if (parsedWordsResult != null) {
				org.json.simple.JSONArray wordsList = (org.json.simple.JSONArray) parsedWordsResult.get("words_result");
				org.json.simple.JSONArray myWords = new org.json.simple.JSONArray();

				result.put("words", myWords);

				if (wordsList != null) {
					for (int i = 0; i < wordsList.size(); i++) {
						JSONObject wordObject = (JSONObject) wordsList.get(i);
						String word = wordObject.get("words").toString();
						logger.info(String.format("word - %s ", word));
						myWords.add(word);
					}
				}
			}

			logger.info(String.format(" temp log - ocr result : ", result.toString()));
			return result;

		} catch (Exception ex) {

			logger.error("ocr", ex);

			JSONObject result = new JSONObject();
			result.put("result", ex.toString());
			return result;
		}
	}



	@RequestMapping(value = "/api/local/base64ocr", method = RequestMethod.POST)
	public @ResponseBody JSONObject localOcrBase64(@RequestBody DataWraper dataWrapper) {

		try {
			// to do
			String directoryPath = SystemUtil.getUploadDirectory(); //context.getRealPath("/WEB-INF/uploaded");
			String fileName = UUID.randomUUID().toString();
			
			String destinationFilePath = directoryPath + File.separator +fileName;
			byte[] decodedbytes = Base64.getDecoder().decode(dataWrapper.getData());
			FileUtility.writeFile(decodedbytes, directoryPath, fileName);

			JSONObject jsonObject = GetOcrResult(destinationFilePath);
			

		    new File(destinationFilePath).delete();
		    
		    return jsonObject;
		} catch (Exception ex) {
			logger.error("localOcrBase64 Exception:", ex);
			JSONObject ocrResult = new JSONObject();
			ocrResult.put("result", ex.toString());
			return ocrResult;
		}
		
	}
	
	@RequestMapping(value = "/api/local/ocr", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
	public @ResponseBody JSONObject localOcr(@RequestParam("file") MultipartFile inputFile) {		
		try {
			HttpHeaders headers = new HttpHeaders();
			
			// Step1: Save uploaded file to temporary folder.
			String originalFilename = inputFile.getOriginalFilename();
			String destinationFilePath = SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/ + File.separator + UUID.randomUUID();
			File destinationFile = new File(destinationFilePath);
			if (!new File(destinationFilePath).exists())
				new File(destinationFilePath).mkdir();
			inputFile.transferTo(destinationFile);

			headers.add("File Uploaded Successfully: ", originalFilename);
			logger.info(String.format("Local Ocr File Uploaded Successfully - originalFilename: %s, destinationFilePath: %s ", originalFilename, destinationFilePath));			
			
			return GetOcrResult(destinationFilePath);
		} catch (Exception ex) {
			logger.error("Local Ocr Exception:", ex);
			JSONObject ocrResult = new JSONObject();
			ocrResult.put("result", ex.toString());
			return ocrResult;
		}
	}



	private JSONObject GetOcrResult(String destinationFilePath) throws ParseException, IOException, InterruptedException,
			UnsupportedEncodingException, FileNotFoundException {
		File destinationFile = new File(destinationFilePath);
		// step2: local ocr		    
		JSONObject ocrResult = new JSONObject();
		String tessPath = OcrUtil.getInstance().getTesseractPath().trim();
		List<String> cmd = new ArrayList<String>();
		// 2.1 tesseract cmd
		String os = System.getProperty("os.name");  
		if(os.toLowerCase().startsWith("win")) 
			cmd.add("\"" + tessPath + File.separator +  OcrUtil.getInstance().getTesseractExe().trim() + "\"");
		else if (os.toLowerCase().equals("linux"))
			cmd.add(tessPath + File.separator +  OcrUtil.getInstance().getTesseractExe().trim());
		else
			cmd.add("\"" + tessPath + File.separator +  OcrUtil.getInstance().getTesseractExe().trim() + "\"");
		// 2.2 target image
		cmd.add(destinationFile.getAbsolutePath());
		// 2.3 output
		cmd.add(destinationFile.getParentFile() + File.separator + OcrUtil.getInstance().getTesseractOutput().trim());
		// 2.4 lang
		cmd.add("-l");
		cmd.add(OcrUtil.getInstance().getTesseractLang().trim());
		// 2.5 oem
		cmd.add("--oem");
		cmd.add(OcrUtil.getInstance().getTesseractOcrenginemode().trim());
		// 2.6 psm
		cmd.add("--psm");
		cmd.add("");
		
		org.json.simple.JSONArray myWords = new org.json.simple.JSONArray();
		String errorMsg = "";
		boolean error = false;
		String pagesegmodeStr = OcrUtil.getInstance().getTesseractPagesegmode();
		String[] pagesegmodes = pagesegmodeStr.split(",");	        
		for(int j=0 ;j<pagesegmodes.length;j++){
			// 2.6 psm para update
			cmd.set(8, pagesegmodes[j].trim());
			
			ProcessBuilder pb = new ProcessBuilder();	       
		    Map<String, String> env = pb.environment(); //获得进程的环境	        
		    String tesseractEnvString = OcrUtil.getInstance().getTesseractEnv();
		    JSONParser parser = new JSONParser();			
			JSONArray envArray = (JSONArray) parser.parse(tesseractEnvString);
			
			for(int i=0; i<envArray.size(); i++){
				JSONObject envObj = (JSONObject) envArray.get(i);
				String key = (String) envObj.get("key");
				String value = (String) envObj.get("value");
				env.put(key.trim(), value.trim());
				logger.info(String.format("env key: %s, value: %s ", key.trim(), value.trim()));
		    }
		    pb.directory(new File(tessPath));
		    pb.command(cmd);
		    pb.redirectErrorStream(true);
 
		    Process process = pb.start();
		    int w = process.waitFor();
		    
		    String line;	        
		    final BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));	
		    StringBuilder processResult = new StringBuilder();
		    while ((line = reader.readLine()) != null)  
		    	processResult.append(line);
		    
		    logger.info(String.format("Local Ocr Process Result with psm(%s): %s", pagesegmodes[j], processResult));
		    
		    File outputFile = new File(destinationFile.getParentFile(), OcrUtil.getInstance().getTesseractOutput());
		    if(w == 0){	        	
		        BufferedReader in = new BufferedReader(new InputStreamReader(new FileInputStream(outputFile.getAbsolutePath()+".txt"), "UTF-8"));		            
		        StringBuffer ocrResultInfo = new StringBuffer();
		        String EOL = System.getProperty("line.separator");
		        while((line = in.readLine()) != null){
		        	if(line.isEmpty() || line.trim().isEmpty())
		        		continue;
		        	if(myWords.contains(line.trim()))
		        		continue;
		        	myWords.add(line.trim());
		        	ocrResultInfo.append(line.trim()).append(EOL);
		        }	                
		        in.close();
		        logger.info(String.format("Local Ocr Analysis Result with psm(%s) :%s", pagesegmodes[j], ocrResultInfo));		           
		    }
		    else{
		    	error = true;
		        switch(w){
		            case 1:
		            	errorMsg = "Errors accessing files.There may be spaces in your image's filename.";
		                break;
		            case 29:
		            	errorMsg = "Cannot recongnize the image or its selected region.";
		                break;
		            case 31:
		            	errorMsg = "Unsupported image format.";
		                break;
		            default:
		            	errorMsg = "Errors occurred.";
		        }
		        logger.error(String.format("Local Ocr Analysis Failed with psm(%s): %s ", pagesegmodes[j], errorMsg));	            
		        				
		    }
		    new File(outputFile.getAbsolutePath()+".txt").delete();
		}
		if(error && myWords.size() == 0)
			ocrResult.put("result", errorMsg);
		else
			ocrResult.put("words", myWords);	        
		return ocrResult;
	}
	
	@RequestMapping(value = "/api/qrcode", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
	public @ResponseBody JSONObject qrcode(@RequestParam("file") MultipartFile inputFile) {

		if (inputFile.isEmpty()) {
			return null;
		}

		try {
			HttpHeaders headers = new HttpHeaders();
			// Step1: Save uploaded file to temporary folder.
			String originalFilename = inputFile.getOriginalFilename();
			String destinationFilePath = SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/ + File.separator + UUID.randomUUID();
			File destinationFile = new File(destinationFilePath);
			if (!new File(destinationFilePath).exists()) {
				new File(destinationFilePath).mkdir();
			}

			inputFile.transferTo(destinationFile);

			headers.add("File Uploaded Successfully - ", originalFilename);

			// Step2: Call baidu api to process qrcode.
			AipOcr client = new AipOcr(BaiduUtil.getInstance().getQrAppId(), BaiduUtil.getInstance().getQrApiKey(),
					BaiduUtil.getInstance().getQrSecretKey());

			// 可选：设置网络连接参数
			client.setConnectionTimeoutInMillis(2000);
			client.setSocketTimeoutInMillis(60000);

			// 可选：设置代理服务器地址, http和socket二选一，或者均不设置
			// client.setHttpProxy("proxy_host", proxy_port); // 设置http代理
			// client.setSocketProxy("proxy_host", proxy_port); // 设置socket代理

			// 可选：设置log4j日志输出格式，若不设置，则使用默认配置
			// 也可以直接通过jvm启动参数设置此环境变量
			// System.setProperty("aip.log4j.conf",
			// "path/to/your/log4j.properties");

			// 传入可选参数调用接口
			HashMap<String, String> options = new HashMap<String, String>();
			options.put("language_type", "CHN_ENG");
			options.put("detect_direction", "true");
			options.put("detect_language", "true");
			options.put("probability", "true");

			String image = destinationFilePath;
			org.json.JSONObject res2 = client.qrcode(image, options);

			JSONParser parser = new JSONParser();
			JSONObject parsedWordsResult = (JSONObject) parser.parse(res2.toString());
			JSONObject result = new JSONObject();
			if (parsedWordsResult != null) {
				org.json.simple.JSONArray wordArray = (org.json.simple.JSONArray) parsedWordsResult.get("codes_result");

				org.json.simple.JSONArray myWords = new org.json.simple.JSONArray();

				result.put("words", myWords);
				for (int i = 0; i < wordArray.size(); i++) {
					JSONObject wordObject = (JSONObject) wordArray.get(i);
					JSONArray wordList = (JSONArray) wordObject.get("text");

					for (int j = 0; j < wordList.size(); j++)
						myWords.add(wordList.get(j).toString());
				}
			}

			return result;
			// destinationFile.delete();

			// JSONObject result = new JSONObject();
			// result.put("result", res2.toString());
			// return result;

		} catch (Exception ex) {

			logger.error("qrcode", ex);
			
			JSONObject result = new JSONObject();
			result.put("result", ex.toString());
			return result;
		}
	}

}
