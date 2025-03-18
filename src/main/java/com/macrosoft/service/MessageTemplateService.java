package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.MessageTemplate;

public interface MessageTemplateService {
	
	public boolean ExistsTemplateName(String protocolId, String messageName, String templateName);
	
	public void addMessageTemplate(MessageTemplate messageTemplate);

	public List<MessageTemplate> listActiveMessageTemplates(String protocolId, String messageName);
	public List<MessageTemplate> listActiveMessageTemplates(String protocolId);
	
	public List<MessageTemplate> listAllMessageTemplates(String protocolId, String messageName);
	
	public MessageTemplate getMessageTemplate(long id);
	
	public void removeMessageTemplate(long id);

	public void updateMessageTemplate(MessageTemplate messageTemplate);
	
	public void expireMessageTemplate(String protocolId);
	
}
