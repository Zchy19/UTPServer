package com.macrosoft.utilities;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class BaiduUtil {
	private static BaiduUtil baiduUtil = null;   
    
    public ApplicationContext ctx = null;    
    public BaiduConfig config = null;
    
    private BaiduUtil() {
        ctx = new ClassPathXmlApplicationContext("applicationContext-baidu.xml");
        config = (BaiduConfig) ctx.getBean("baiduConfig");
    }   
    
    public static BaiduUtil getInstance()   
    {   
        if(baiduUtil==null) {   
            synchronized (BaiduUtil.class)    
            {   
                if(baiduUtil==null) {   
                    baiduUtil = new BaiduUtil();   
                }   
            }   
        }   
        return baiduUtil;   
    }
    
    public String getOcrAppId() {
		return config.getOcrAppId();
	}	
	public String getOcrApiKey() {
		return config.getOcrApiKey();
	}
	
	public String getOcrSecretKey() {
		return config.getOcrSecretKey();
	}
	
	public String getQrAppId() {
		return config.getQrAppId();
	}
	
	public String getQrApiKey() {
		return config.getQrApiKey();
	}
	
	public String getQrSecretKey() {
		return config.getQrSecretKey();
	}	
}
