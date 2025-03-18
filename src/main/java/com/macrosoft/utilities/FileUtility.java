package com.macrosoft.utilities;

import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.swing.JOptionPane;

import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;

public class FileUtility {

	private static final ILogger logger = LoggerFactory.Create(FileUtility.class.getName());
	private static Pattern FilePattern = Pattern.compile("[\\\\/:*?\"<>|]");;
	
	public static String filterInvalidCharacterFileName(String fileName)
	{
		return fileName==null?null:FilePattern.matcher(fileName).replaceAll("");
	}
	
	//Read file content into the string with - Files.lines(Path path, Charset cs)	 
    public static String readLineByLineJava8(String filePath) 
    {
        StringBuilder contentBuilder = new StringBuilder();
 
        try (Stream<String> stream = Files.lines( Paths.get(filePath), StandardCharsets.UTF_8)) 
        {
            stream.forEach(s -> contentBuilder.append(s).append("\n"));
        }
        catch (IOException ex) 
        {
        	logger.error("FileUtility::readLineByLineJava8()->ex" + ex.toString());
        }
 
        return contentBuilder.toString();
    }
    
    public static void writeFileByString(String path, String content)
    {
    	 
        try
        {
      	  Path fileNamePath = Paths.get(path);
          Files.write(fileNamePath, content.getBytes(StandardCharsets.UTF_8),StandardOpenOption.CREATE_NEW);
        }
        catch (IOException ex) 
        {
        	logger.error("FileUtility::writeFileByString()->ex" + ex.toString());
        }
    }
    
    public static void writeFile(byte[] bfile, String dirPath,String fileName) {
        BufferedOutputStream bos = null;
        FileOutputStream fos = null;
        File file = null;
        try {
            File dir = new File(dirPath);
            if(!dir.exists()){//判断文件目录是否存在
                dir.mkdirs();
            }
            file = new File(dirPath + File.separator + fileName);
            fos = new FileOutputStream(file);
            bos = new BufferedOutputStream(fos);
            bos.write(bfile);
        } catch (Exception ex) {
        	logger.error("FileUtility::writeFile()->ex" + ex.toString());
        } finally {
            if (bos != null) {
                try {
                    bos.close();
                } catch (IOException e1) {
                	logger.error("FileUtility::writeFile()->e1" + e1.toString());
                }
            }
            if (fos != null) {
                try {
                    fos.close();
                } catch (IOException e1) {
                	logger.error("FileUtility::writeFile()->e1" + e1.toString());
                }
            }
        }
    }

    public static void compressFolder(File folder, String parentFolder, ZipOutputStream zipOut) throws IOException {
        File[] files = folder.listFiles();
        byte[] buffer = new byte[1024];
        int length;
        for (File file : files) {
            if (file.isFile()) {
                FileInputStream fileIn = new FileInputStream(file);
                zipOut.putNextEntry(new ZipEntry(parentFolder + "/" + file.getName()));
                while ((length = fileIn.read(buffer)) > 0) {
                    zipOut.write(buffer, 0, length);
                }
                fileIn.close();
            } else if (file.isDirectory()) {
                compressFolder(file, parentFolder + "/" + file.getName(), zipOut);
            }
        }
    }

    //删除文件夹
    public static void deleteFolder(File folder) throws IOException {
        File[] files = folder.listFiles();
        for (File file : files) {
            if (file.isFile()) {
            	file.delete();
            } else if (file.isDirectory()) {
            	deleteFolder(file);
            }
        }
        folder.delete();
    }
    //复制一个文件夹的内容到另一个文件夹,包括子文件夹
    public static void copyFolder(File sourceFolder, File targetFolder) throws IOException {
        if (sourceFolder.isDirectory()) {
            if (!targetFolder.exists()) {
                targetFolder.mkdir();
            }
            String[] files = sourceFolder.list();
            for (String file : files) {
                File srcFile = new File(sourceFolder, file);
                File destFile = new File(targetFolder, file);
                copyFolder(srcFile, destFile);
            }
        } else {
            InputStream in = new FileInputStream(sourceFolder);
            OutputStream out = new FileOutputStream(targetFolder);
            byte[] buffer = new byte[1024];
            int length;
            while ((length = in.read(buffer)) > 0) {
            	out.write(buffer, 0, length);
            }
            in.close();
            out.close();
        }
    }

}
