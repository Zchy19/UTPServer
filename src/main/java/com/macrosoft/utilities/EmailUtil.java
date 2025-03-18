package com.macrosoft.utilities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import java.io.File;

public class EmailUtil {
	private static EmailUtil emailUtil = null;   
    
    public ApplicationContext ctx = null;    
    
    private static final Logger log = LoggerFactory.getLogger(EmailUtil.class);
    
    private EmailUtil() {
        ctx = new ClassPathXmlApplicationContext("applicationContext-mail.xml");      
    }   
    
    public static EmailUtil getInstance()   
    {   
        if(emailUtil==null) {   
            synchronized (EmailUtil.class)    
            {   
                if(emailUtil==null) {   
                    emailUtil = new EmailUtil();   
                }   
            }   
        }   
        return emailUtil;   
    }   
  
    public boolean sentEmails(String emails,String subject,String text)   
    {
    	JavaMailSenderImpl sender = (JavaMailSenderImpl) ctx.getBean("mailSender");
        SimpleMailMessage mail = new SimpleMailMessage();    
        String email[] = emails.split(";");   
        for(int i=0;i<email.length;i++) {   
            try {
                mail.setTo(email[i]);
                mail.setFrom(sender.getUsername());
                mail.setSubject(subject);
                mail.setText(text);
                sender.send(mail);
                log.info("Success sending email to " + emails);

            } catch (Exception ex) {            	
            	log.error("Failed sending email to " + emails + " Details:" + ex.toString() );
                return false;
            }   
        } 
        return true;
    }



    public boolean sentEmailAttachment (String emails,String subject,String text,String filePath)
    {
        JavaMailSenderImpl sender = (JavaMailSenderImpl) ctx.getBean("mailSender");
        //这是通过senderImp得到邮箱的信息
        MimeMessage mimeMessage = sender.createMimeMessage();
        //这是通过封装mimeMessage，来发送邮件
        try {
            MimeMessageHelper mail = new MimeMessageHelper(mimeMessage, true);
            String email[] = emails.split(";");
            for(int i=0;i<email.length;i++) {
                try {
                    mail.setTo(email[i]);
                    mail.setFrom(sender.getUsername());
                    mail.setSubject(subject);
                    mail.setText(text);
                    FileSystemResource dataSource = new FileSystemResource(filePath);
                    //第一个参数是防止发送邮件的时候，接收方收到的附件的名字出现乱码，第二个参数是发送的附件
                    mail.addAttachment(MimeUtility.encodeWord(dataSource.getFilename()), dataSource);
                    //这是发送邮件
                    sender.send(mimeMessage);
                    log.info("Success sending email to " + emails);
                } catch (Exception ex) {
                    log.error("Failed sending email to " + emails + " Details:" + ex.toString() );
                    return false;
                }
            }

        } catch (MessagingException e) {
            e.printStackTrace();
            return false;
        }

        return true;
    }
}
