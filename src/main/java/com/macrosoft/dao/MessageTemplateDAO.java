package com.macrosoft.dao;

import java.util.List;

import com.macrosoft.model.MessageTemplate;

public interface MessageTemplateDAO {
	

	public boolean ExistsTemplateName(String protocolId, String messageName, String templateName);
	
	public void addMessageTemplate(MessageTemplate messageTemplate);

	public void updateMessageTemplate(MessageTemplate messageTemplate);

	public List<MessageTemplate> listActiveMessageTemplates(String protocolId, String messageName);

	public List<MessageTemplate> listActiveMessageTemplates(String protocolId);
	
	public List<MessageTemplate> listAllMessageTemplates(String protocolId, String messageName);
	
	public MessageTemplate getMessageTemplate(long id);

	public MessageTemplate getMessageTemplate(String protocolId, String messageName, String templateName);
	
	public void removeMessageTemplate(long id);

	public void expireMessageTemplate(String protocolId);
}
