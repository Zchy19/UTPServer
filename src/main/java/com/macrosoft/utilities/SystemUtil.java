package com.macrosoft.utilities;

import java.io.File;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class SystemUtil {
	private static SystemUtil systemUtil = null;   
	private static String OS = System.getProperty("os.name").toLowerCase();
	
    public ApplicationContext ctx = null;    
    public SystemConfig systemConfig = null;
    
    private SystemUtil() {        
        if (OS.toLowerCase().startsWith("win"))    	
        	ctx = new ClassPathXmlApplicationContext("applicationContext-system-windows.xml");
    	else if (OS.toLowerCase().equals("linux"))
    		ctx = new ClassPathXmlApplicationContext("applicationContext-system-linux.xml");
		else
			ctx = new ClassPathXmlApplicationContext("applicationContext-system-windows.xml");
        systemConfig = (SystemConfig) ctx.getBean("systemConfig");
    }   
    
    public static SystemUtil getInstance()   
    {   
        if(systemUtil==null) {   
            synchronized (SystemUtil.class)    
            {   
                if(systemUtil==null) {   
                	systemUtil = new SystemUtil();   
                }   
            }   
        }   
        return systemUtil;   
    }
    
    public static String getUploadDirectory()
    {
    	String uploadDirectory = getUserHomeDirectory() + File.separator + "upload";
		if (!new File(uploadDirectory).exists()) {
			new File(uploadDirectory).mkdir();
		}
		
    	return uploadDirectory;    	
    }

    public static String getTempDirectory()
    {
    	String tempDirectory = getUserHomeDirectory() + File.separator + "temp";
		if (!new File(tempDirectory).exists()) {
			new File(tempDirectory).mkdir();
		}
		
    	return tempDirectory;    	
    }
    public static String getUserHomeDirectory()
    {
    	return System.getProperty("user.home").toLowerCase() + File.separator + "Documents" + File.separator + "UTP" + File.separator + "UTPServer" ;    	
    }
    
    public String getUtpCoreAccessLibName() {
		return systemConfig.getUtpCoreAccessLibName();
	}

    public String getConvertorMgrName() {
        return systemConfig.getConvertorMgrName();
    }
}
