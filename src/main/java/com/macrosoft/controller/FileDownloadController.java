package com.macrosoft.controller;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.StringUtility;
import com.macrosoft.utilities.SystemUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Date;
import java.util.zip.ZipOutputStream;

@Controller
public class FileDownloadController {

	private static final ILogger logger = LoggerFactory.Create(ExecutionStatusController.class.getName());
	
	@Autowired
	ServletContext context;

	@RequestMapping(value = "/api/fileDownload/downloadAntbots", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<String> downloadAntbots(@RequestBody String[] downloadAntbots) {
		try {
			//复制antbotBox到antbotBoxTimeString下
			String antbotBoxTimeString =String.format("antbotBox_%s", StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			antbotBoxTimeString = antbotBoxTimeString.replace(":", "_");
			antbotBoxTimeString = antbotBoxTimeString.replace(" ", "_");
			antbotBoxTimeString = antbotBoxTimeString.replace("-", "_");

			File antbotBoxTimeFolder = new File(context.getRealPath("/WEB-INF/file_download")+File.separator+antbotBoxTimeString);
			antbotBoxTimeFolder.mkdirs();
			File antbotBoxFolder = new File(context.getRealPath("/WEB-INF/file_download/antbotBox"));
			FileUtility.copyFolder(antbotBoxFolder,antbotBoxTimeFolder);

			for (int i = 0; i < downloadAntbots.length; i++) {
				String downloadAntbot = downloadAntbots[i];
				//复制antbot到antbotBox
				File antbotBoxAntbotsFolder = new File(context.getRealPath("/WEB-INF/file_download")+File.separator+antbotBoxTimeString+File.separator+downloadAntbot);
				File antbotFile = new File(context.getRealPath("/WEB-INF/file_download/antbots")+File.separator+downloadAntbot);
				FileUtility.copyFolder(antbotFile,antbotBoxAntbotsFolder);
			}

			String zipFileName =String.format("%s_%s.zip","downloadAntbots", StringUtility.GetFormatedDateTime(new Date(new Date().getTime())));
			zipFileName = zipFileName.replace(":", "_");
			zipFileName = zipFileName.replace(" ", "_");
			zipFileName = zipFileName.replace("-", "_");
			String zipFilePath =context.getRealPath("/WEB-INF/file_download/download") + File.separator + zipFileName;
			ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(zipFilePath));
			File antbotBoxStringFolder = new File(context.getRealPath("/WEB-INF/file_download")+File.separator+antbotBoxTimeString);
			FileUtility.compressFolder(antbotBoxStringFolder,antbotBoxStringFolder.getName(),zipOut);
			String zipFileNamePath = ".\\file_download\\download\\"+zipFileName;
			//删除antbotBox下的antbot
			File antbotBoxAntbotsFolder = new File(context.getRealPath("/WEB-INF/file_download")+File.separator+antbotBoxTimeString);
			FileUtility.deleteFolder(antbotBoxAntbotsFolder);
			zipOut.close();
			return new ApiResponse<String>(ApiResponse.Success, zipFileNamePath);
		}catch (Exception ex) {
			logger.error("downloadAntbots", ex);
			return new ApiResponse<String>(ApiResponse.UnHandleException, null);
		}
	}


	@RequestMapping(value = "/api/utp/isResult", method = RequestMethod.GET)
	public @ResponseBody Boolean isResult() {
		try{
			return true;
		}
		catch(Exception ex){
			return false;
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
