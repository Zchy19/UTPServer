package com.macrosoft.controller;

import java.io.File;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utilities.SystemUtil;

@Controller
public class FileuploadController {

	private static final ILogger logger = LoggerFactory.Create(ExecutionStatusController.class.getName());
	
	@Autowired
	ServletContext context;

	@RequestMapping(value = "/fileupload", headers = ("content-type=multipart/*"), method = RequestMethod.POST)
	public ResponseEntity<FileInfo> upload(@RequestParam("file") MultipartFile inputFile) {
		try
		{
			FileInfo fileInfo = new FileInfo();
			HttpHeaders headers = new HttpHeaders();
			if (!inputFile.isEmpty()) {
				try {
					String originalFilename = inputFile.getOriginalFilename();
					File destinationFile = new File(
							SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/ + File.separator + originalFilename);
					inputFile.transferTo(destinationFile);
					fileInfo.setFileName(destinationFile.getPath());
					fileInfo.setFileSize(inputFile.getSize());
					headers.add("File Uploaded Successfully - ", originalFilename);
					return new ResponseEntity<FileInfo>(fileInfo, headers, HttpStatus.OK);
				} catch (Exception ex) {
		        	logger.error("upload", ex);
					return new ResponseEntity<FileInfo>(HttpStatus.BAD_REQUEST);
				}
			} else {
				return new ResponseEntity<FileInfo>(HttpStatus.BAD_REQUEST);
			}
		}
		catch (Exception ex)
		{
			logger.error("upload", ex);
			return null;
		}	
	}

	public class FileInfo {

		private String fileName;
		private long fileSize;

		public String getFileName() {
			return fileName;
		}

		public void setFileName(String fileName) {
			this.fileName = fileName;
		}

		public long getFileSize() {
			return fileSize;
		}

		public void setFileSize(long fileSize) {
			this.fileSize = fileSize;
		}

	}
}
