package com.macrosoft.utilities;

import java.io.File;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class OcrUtil {
	private static OcrUtil ocrUtil = null;   
	private static String OS = System.getProperty("os.name").toLowerCase();
	
    public ApplicationContext ctx = null;    
    public OcrConfig config = null;
    
    private OcrUtil() {
        if (OS.toLowerCase().startsWith("win"))    	
        	ctx = new ClassPathXmlApplicationContext("applicationContext-ocr-windows.xml");
    	else if (OS.toLowerCase().equals("linux"))
    		ctx = new ClassPathXmlApplicationContext("applicationContext-ocr-linux.xml");    	
		else
			ctx = new ClassPathXmlApplicationContext("applicationContext-ocr-windows.xml");    	
        config = (OcrConfig) ctx.getBean("ocrConfig");
    }   
    
    public static OcrUtil getInstance()   
    {   
        if(ocrUtil==null) {   
            synchronized (OcrUtil.class)    
            {   
                if(ocrUtil==null) {   
                	ocrUtil = new OcrUtil();   
                }   
            }   
        }   
        return ocrUtil;   
    }
    
    public String getTesseractOutput() {
		return config.getTesseractOutput();
	}
    
    public String getTesseractPath() {
		return config.getTesseractPath();
	}
    
    public String getTesseractExe() {
		return config.getTesseractExe();
	}	
    
	public String getTesseractEnv() {
		return config.getTesseractEnv();
	}
	
	public String getTesseractLang() {
		return config.getTesseractLang();
	}
	
	public String getTesseractPagesegmode() {
		return config.getTesseractPagesegmode();
	}
	
	public String getTesseractOcrenginemode() {
		return config.getTesseractOcrenginemode();
	}
}
