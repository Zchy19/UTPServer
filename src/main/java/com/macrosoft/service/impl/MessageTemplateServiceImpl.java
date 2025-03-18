package com.macrosoft.service.impl;

import java.util.List;

import com.macrosoft.service.MessageTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.dao.MessageTemplateDAO;
import com.macrosoft.model.MessageTemplate;

@Service
public class MessageTemplateServiceImpl implements MessageTemplateService {
	
	private MessageTemplateDAO MessageTemplateDAO;
	@Autowired
	public void setMessageTemplateDAO(MessageTemplateDAO MessageTemplateDAO) {
		this.MessageTemplateDAO = MessageTemplateDAO;
	}

	@Override
	@Transactional
	public boolean ExistsTemplateName(String protocolId, String messageName, String templateName)
	{
		return this.MessageTemplateDAO.ExistsTemplateName(protocolId, messageName, templateName);
	}
	
	@Override
	@Transactional
	public void addMessageTemplate(MessageTemplate messageTemplate) {
		messageTemplate.setId(0);
		this.MessageTemplateDAO.addMessageTemplate(messageTemplate);
	}

	@Override
	@Transactional
	public List<MessageTemplate> listActiveMessageTemplates(String protocolId, String messageName) {
		return this.MessageTemplateDAO.listActiveMessageTemplates(protocolId, messageName);
	}
	

	@Override
	@Transactional
	public List<MessageTemplate> listActiveMessageTemplates(String protocolId) {
		return this.MessageTemplateDAO.listActiveMessageTemplates(protocolId);
	}

	@Override
	@Transactional
	public List<MessageTemplate> listAllMessageTemplates(String protocolId, String messageName) {
		return this.MessageTemplateDAO.listAllMessageTemplates(protocolId, messageName);
	}

	@Override
	@Transactional
	public MessageTemplate getMessageTemplate(long id) {
		return this.MessageTemplateDAO.getMessageTemplate(id);
	}

	@Override
	@Transactional
	public void removeMessageTemplate(long id) {
		this.MessageTemplateDAO.removeMessageTemplate(id);
	}


	@Override
	@Transactional
	public void updateMessageTemplate(MessageTemplate messageTemplate){
		this.MessageTemplateDAO.updateMessageTemplate(messageTemplate);
	}

	
	@Override
	@Transactional
	public void expireMessageTemplate(String protocolId) {
		this.MessageTemplateDAO.expireMessageTemplate(protocolId);
	}
}
