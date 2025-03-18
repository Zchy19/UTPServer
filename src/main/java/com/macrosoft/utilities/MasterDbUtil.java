package com.macrosoft.utilities;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MasterDbUtil {
	private static MasterDbUtil masterDbUtil = null;   
    
    public ApplicationContext ctx = null;    
    public MasterConfig config = null;
    
    private MasterDbUtil() {
        ctx = new ClassPathXmlApplicationContext("applicationContext-master.xml");
        config = (MasterConfig) ctx.getBean("masterConfig");
    }   
    
    public static MasterDbUtil getInstance()   
    {   
        if(masterDbUtil==null) {   
            synchronized (MasterDbUtil.class)    
            {   
                if(masterDbUtil==null) {   
                    masterDbUtil = new MasterDbUtil();   
                }   
            }   
        }   
        return masterDbUtil;   
    }
    
    public String getUrl() {
		return config.getUrl();
	}	
	
	public String getUsername() {
		return config.getUsername();
	}
	
	public String getPassword() {
		return config.getPassword();
	}	
	
	public boolean getReportIncludeDummyRun() {
		return config.getReportIncludeDummyRun();
	}	
}
