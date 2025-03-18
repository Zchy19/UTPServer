package com.macrosoft.utilities;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class HarmonizedUtil {
	private static HarmonizedUtil harmonizedUtil = null;   
	private static String OS = System.getProperty("os.name").toLowerCase();
	
    public ApplicationContext ctx = null;    
    public HarmonizedConfig config = null;
    
    private HarmonizedUtil() {
        
    	if (isWindows())
    	{
    		ctx = new ClassPathXmlApplicationContext("applicationContext-harmony-windows.xml");
    	}
    	else
    	{
    		ctx = new ClassPathXmlApplicationContext("applicationContext-harmony-linux.xml");
    	}
        
        config = (HarmonizedConfig) ctx.getBean("harmonizedConfig");
    }

    public static HarmonizedUtil getInstance()   
    {   
        if(harmonizedUtil==null) {   
            synchronized (BaiduUtil.class)    
            {   
                if(harmonizedUtil==null) {   
                	harmonizedUtil = new HarmonizedUtil();   
                }   
            }   
        }   
        return harmonizedUtil;   
    }
    
    public static boolean isWindows() {
        return OS.contains("win");
    }
}
