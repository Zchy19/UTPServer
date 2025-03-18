package com.macrosoft.controller;

import java.io.File;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.model.idc.IcdModel;
import com.macrosoft.model.idc.ARINC429FrameData;
import com.macrosoft.service.IcdDocumentService;
import com.macrosoft.utilities.IcdUtility;

@Controller
public class IcdDocumentController {
	private static final ILogger logger = LoggerFactory.Create(IcdDocumentController.class.getName());
	private IcdDocumentService mIcdDocumentService;

	
	@Autowired(required = true)
	
	public void setIcdDocumentService(IcdDocumentService ps) {
		this.mIcdDocumentService = ps;
	}
	
	@RequestMapping(value = "/api/icd/add", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
	public @ResponseBody ApiResponse<IcdModel> uploadIcd(@RequestParam("file") MultipartFile inputFile) {

		if (inputFile.isEmpty()) {
			return null;
		}

		try {
			HttpHeaders headers = new HttpHeaders();
			// Step1: Save uploaded file to temporary folder.
			String originalFilename = inputFile.getOriginalFilename();

			String icdRepositoryFolder = mIcdDocumentService.resolveIcdFolderPath();
			String id =  UUID.randomUUID().toString();
			String destinationFilePath = icdRepositoryFolder + File.separator + id;
			File destinationFile = new File(destinationFilePath);
			if (!new File(destinationFilePath).exists()) {
				new File(destinationFilePath).mkdir();
			}

			inputFile.transferTo(destinationFile);

			headers.add("File Uploaded Successfully - ", originalFilename);
			logger.info(String.format("File Uploaded Successfully - originalFilename: %s, destinationFilePath: %s ", originalFilename, destinationFilePath));
		
			IcdModel model = this.mIcdDocumentService.addIdcDocument(id);
			
			if (model == null)
			{
				logger.info("failed to parse new added icd file.");
				return new ApiResponse<IcdModel>(ApiResponse.UnHandleException, null);
			}
			
			return new ApiResponse<IcdModel>(ApiResponse.Success, model);
		} catch (Exception ex) {
			logger.error("uploadIcd", ex);
			return new ApiResponse<IcdModel>(ApiResponse.UnHandleException, null);
		}
		
	}
	

	@RequestMapping(value = "/api/icd/documents", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<IcdModel>> getIcdModes() {
		try {
			List<IcdModel> models = mIcdDocumentService.getIdcModels();
			
			return new ApiResponse<List<IcdModel>>(ApiResponse.Success, models);
		} catch (Exception ex) {
			logger.error("getIcdModes", ex);
			return new ApiResponse<List<IcdModel>>(ApiResponse.UnHandleException, null);
		}
	}

	//this api is only used for testing
	@RequestMapping(value = "/api/icd/label/get/{rawdata}")
	public @ResponseBody ApiResponse<ARINC429FrameData> getFrameData(@PathVariable("rawdata") String rawdata) {
		try {
			
			ARINC429FrameData frameData = new ARINC429FrameData();
			
			//byte[] data = hexStringToByte("01020080");
		
			String full32Bits = IcdUtility.hexString2binaryString(rawdata);
			
			String labelIndex = IcdUtility.resolveLableIndex(full32Bits);
			
		
			frameData.setLabelIndex(labelIndex); 
			//frameData.setTime(new Date(new Date().getTime()));
			
			return new ApiResponse<ARINC429FrameData>(ApiResponse.Success, frameData);
			/*
			*/
		} catch (Exception ex) {
			logger.error("getFrameData", ex);
			return new ApiResponse<ARINC429FrameData>(ApiResponse.UnHandleException, null);
		}	
	}

	

}
