package com.macrosoft.controller;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletContext;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.macrosoft.utilities.FileUtility;
import com.macrosoft.utilities.SystemUtil;

public class ReportUtility {

	public static String GetReportFolderPath(ServletContext context)
	{
		return context.getRealPath("/WEB-INF/reports");		
	}

	public static String GetDownloadFolderPath(ServletContext context)
	{
		return context.getRealPath("/WEB-INF/downloads");		
	}
		
	public static void CreateFolderIfNotExist(ServletContext context)
	{
		new File(context.getRealPath("/WEB-INF/reports")).mkdir();

		new File(context.getRealPath("/WEB-INF/downloads")).mkdir();
	}
	
	public static String GetReportPath(ServletContext context, String fileName)
	{
		fileName = FileUtility.filterInvalidCharacterFileName(fileName);
		
		return GetReportFolderPath(context) + File.separator + fileName;
	}

	public static String GetDownloadPath(ServletContext context, String fileName)
	{
		fileName = FileUtility.filterInvalidCharacterFileName(fileName);
		return GetDownloadFolderPath(context) + File.separator + fileName;
	}

	public static String GetStaticReportPath(String fileName)
	{
		fileName = FileUtility.filterInvalidCharacterFileName(fileName);
		return "." + File.separator  + "reports" + File.separator + fileName;
	}

	public static String GetStaticDownloadPath(String fileName)
	{
		fileName = FileUtility.filterInvalidCharacterFileName(fileName);
		return "." + File.separator  + "downloads" + File.separator + fileName;
	}
	
	public static void downloadReport(ServletContext context, 
										HttpServletRequest request, 
										HttpServletResponse response, 
										String fileName) throws Exception 
	{
			String fileFullPath = ReportUtility.GetReportPath(context, fileName);
			
			File file = new File(fileFullPath);
	        
			if (!file.exists()) return;
	        
			  InputStream inputStream = null;
		        ServletOutputStream servletOutputStream = null;
		        // 重置response
		        response.reset();
		        //设置http头信息的内容
		        response.setCharacterEncoding("utf-8");
		        response.setContentType("application/vnd.ms-excel");
		        response.addHeader("Content-Disposition", "attachment;filename=\"" + fileName + "\"");
		        int fileLength = (int) file.length();
		        response.setContentLength(fileLength);

		        try {
		            if (fileLength != 0) {
		                inputStream = new FileInputStream(file);
		                byte[] buf = new byte[4096];
		                // 创建输出流
		                servletOutputStream = response.getOutputStream();
		                int readLength;
		                // 读取文件内容并输出到response的输出流中
		                while ((readLength = inputStream.read(buf)) != -1) {
		                    servletOutputStream.write(buf, 0, readLength);
		                }
		            }
		        } catch (IOException e) {
		            throw new RuntimeException("download file error：" + e.toString());
		        } finally {
		            try {
		                // 关闭ServletOutputStream
		                if (servletOutputStream != null) {
		                    servletOutputStream.flush();
		                    servletOutputStream.close();
		                }
		                // 关闭InputStream
		                if (inputStream != null) {
		                    inputStream.close();
		                }
		            } catch (IOException e) {
			            throw new RuntimeException("download file error：IOException" + e.toString());
		            }
		        }
	}
}
