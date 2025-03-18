package com.macrosoft.dao.impl;

import java.util.List;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import com.macrosoft.dao.MessageTemplateDAO;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MessageTemplate;

@Repository
public class MessageTemplateDAOImpl implements MessageTemplateDAO {
	
	private static final ILogger logger = LoggerFactory.Create(MessageTemplateDAOImpl.class.getName());
	
	private SessionFactory sessionFactory;

	private static Lock lock = new ReentrantLock();
	@Autowired
	@Qualifier("sessionFactory")
	public void setSessionFactory(SessionFactory sf){
		this.sessionFactory = sf;
	}
 
	
	@Override
	public void addMessageTemplate(MessageTemplate messageTemplate) {

		try {
        	lock.lock();
            
    		Session session = this.sessionFactory.getCurrentSession();
    		session.saveOrUpdate(messageTemplate);

    		TrailUtility.Trail(logger, TrailUtility.Trail_Creation, "addMessageTemplate", String.format("id: %s", messageTemplate.getId()));
        } catch (Exception ex) {
        	logger.error("addMessageTemplate", ex);
        }finally{
            //release lock
            lock.unlock();
        }
	}

	@Override
	public List<MessageTemplate> listActiveMessageTemplates(String protocolId, String messageName) {
		Session session = this.sessionFactory.getCurrentSession();
		List<MessageTemplate> messageTemplates = session.createQuery("from MessageTemplate where protocolId = :protocolId and messageName=:messageName and deleted=0")
				.setParameter("protocolId", protocolId)
				.setParameter("messageName", messageName)
				.list();
		return messageTemplates;
	}

	@Override
	public List<MessageTemplate> listActiveMessageTemplates(String protocolId) {
		Session session = this.sessionFactory.getCurrentSession();
		List<MessageTemplate> messageTemplates = session.createQuery("from MessageTemplate where protocolId = :protocolId and deleted=0")
				.setParameter("protocolId", protocolId)
				.list();
		return messageTemplates;
	}
	
	@Override
	public List<MessageTemplate> listAllMessageTemplates(String protocolId, String messageName) {
		Session session = this.sessionFactory.getCurrentSession();
		List<MessageTemplate> messageTemplates = session.createQuery("from MessageTemplate where protocolId = :protocolId and messageName=:messageName")
				.setParameter("protocolId", protocolId)
				.setParameter("messageName", messageName)
				.list();
		return messageTemplates;
	}

	@Override
	public boolean ExistsTemplateName(String protocolId, String messageName, String templateName) {
		Session session = this.sessionFactory.getCurrentSession();
		List<MessageTemplate> messageTemplates = session.createQuery("from MessageTemplate where protocolId = :protocolId and messageName=:messageName and templateName=:templateName and deleted=0")
				.setParameter("protocolId", protocolId)
				.setParameter("messageName", messageName)
				.setParameter("templateName", templateName)
				.list();
		return messageTemplates.size() > 0;
	}
	
	
	@Override
	public MessageTemplate getMessageTemplate(long id) {
		Session session = this.sessionFactory.getCurrentSession();		
		List<MessageTemplate> messageTemplates = session.createQuery("from MessageTemplate where id=:id")
				.setParameter("id", id).
				list();
		if (messageTemplates.size() == 0) return null;
		return messageTemplates.get(0);
	}

	@Override
	public MessageTemplate getMessageTemplate(String protocolId, String messageName, String templateName)
	{
		Session session = this.sessionFactory.getCurrentSession();		
		List<MessageTemplate> messageTemplates = session.createQuery("from MessageTemplate where protocolId=:protocolId and messageName=:messageName and templateName =:templateName")
				.setParameter("protocolId", protocolId)
				.setParameter("messageName", messageName)
				.setParameter("templateName", templateName)
				.list();
		if (messageTemplates.size() == 0) return null;
		return messageTemplates.get(0);
	}
	
	@Override
	public void removeMessageTemplate(long id) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		sqlBuilder.append(" delete from MessageTemplate where id=:id  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("id", id);
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "removeMessageTemplate", String.format(" id: %s", id));
	}	
	

	@Override
	public void expireMessageTemplate(String protocolId) {
		
		Session session = this.sessionFactory.getCurrentSession();
		StringBuilder sqlBuilder = new StringBuilder();  
		// sqlBuilder.append(" update MessageTemplate set deleted = 1 where protocolId=:protocolId  ");
		
		sqlBuilder.append(" delete from MessageTemplate where protocolId=:protocolId  ");
		
		SQLQuery query = session.createSQLQuery(sqlBuilder.toString());
		query.setParameter("protocolId", protocolId);
		query.executeUpdate();
		TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "expireMessageTemplate", String.format(" protocolId: %s", protocolId));
	}


	@Override
	public void updateMessageTemplate(MessageTemplate messageTemplate) {

		Session session = this.sessionFactory.getCurrentSession();
		session.update(messageTemplate);
		logger.info("MessageTemplate updated successfully, MessageTemplate Details="+messageTemplate);
	}	
	
}
