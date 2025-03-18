package com.macrosoft.controller;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.macrosoft.controller.response.ApiResponse;
import com.macrosoft.controller.response.ApiResponseWithError;
import com.macrosoft.logging.ILogger;
import com.macrosoft.logging.LoggerFactory;
import com.macrosoft.logging.TrailUtility;
import com.macrosoft.model.MessageTemplate;
import com.macrosoft.service.MessageTemplateService;

@Controller
public class MessageTemplateController {
	private static final ILogger logger = LoggerFactory.Create(MessageTemplateController.class.getName());
	private MessageTemplateService mMessageTemplateService;

	private static final String Success = "Success";

	@Autowired(required = true)
	
	public void setMessageTemplateService(MessageTemplateService messageTemplateService) {
		this.mMessageTemplateService = messageTemplateService;
	}

	@RequestMapping(value = "/api/messgeTemplate/getAll/{protocolId}/{messageName}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MessageTemplate>> listAllMessageTemplates(@PathVariable("protocolId") String protocolId,
																					@PathVariable("messageName") String messageName) {
		try {
			List<MessageTemplate> results = this.mMessageTemplateService.listAllMessageTemplates(protocolId, messageName);
			return new ApiResponse<List<MessageTemplate>>(ApiResponse.Success, results);
		} catch (Exception ex) {
			logger.error("listAllMessageTemplates", ex);
			return new ApiResponse<List<MessageTemplate>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/messgeTemplate/getActive/{protocolId}/{messageName}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MessageTemplate>> listActiveMessageTemplates(@PathVariable("protocolId") String protocolId,
																					@PathVariable("messageName") String messageName) {
		try {
			List<MessageTemplate> results = this.mMessageTemplateService.listActiveMessageTemplates(protocolId, messageName);
			return new ApiResponse<List<MessageTemplate>>(ApiResponse.Success, results);
		} catch (Exception ex) {
			logger.error("listActiveMessageTemplates", ex);
			return new ApiResponse<List<MessageTemplate>>(ApiResponse.UnHandleException, null);
		}
	}

	@RequestMapping(value = "/api/messgeTemplate/getActive/{protocolId}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<List<MessageTemplate>> listActiveMessageTemplatesByProtocol(@PathVariable("protocolId") String protocolId) {
		try {
			List<MessageTemplate> results = this.mMessageTemplateService.listActiveMessageTemplates(protocolId);
			return new ApiResponse<List<MessageTemplate>>(ApiResponse.Success, results);
		} catch (Exception ex) {
			logger.error("listActiveMessageTemplates", ex);
			return new ApiResponse<List<MessageTemplate>>(ApiResponse.UnHandleException, null);
		}
	}
	
	@RequestMapping(value = "/api/messgeTemplate/get/{id}", method = RequestMethod.GET)
	public @ResponseBody ApiResponse<MessageTemplate> getMessageTemplate(@PathVariable("id") long id) {
		try {
			MessageTemplate result = this.mMessageTemplateService.getMessageTemplate(id);
			return new ApiResponse<MessageTemplate>(ApiResponse.Success, result);
		} catch (Exception ex) {
			logger.error("listActiveMessageTemplates", ex);
			return new ApiResponse<MessageTemplate>(ApiResponse.UnHandleException, null);
		}
		//public MessageTemplate getMessageTemplate(long id);
	}

	@RequestMapping(value = "/api/messgeTemplate/create", method = RequestMethod.POST)
	public @ResponseBody ApiResponseWithError<Boolean> createMessageTemplate(@RequestBody MessageTemplate messageTemplate) {

		try {
			
			boolean existsTemplateName = this.mMessageTemplateService.ExistsTemplateName(messageTemplate.getProtocolId(), messageTemplate.getMessageName(), messageTemplate.getTemplateName());
			
			if (existsTemplateName)
			{
				logger.info("createMessageTemplate failed with name conflict, templateName :" + messageTemplate.getTemplateName());
				return new ApiResponseWithError<Boolean>(ApiResponse.Success, false, "FailedByNameDuplicated");
			}
			
			messageTemplate.setCreatedAt(new Date(new Date().getTime()));
			this.mMessageTemplateService.addMessageTemplate(messageTemplate);
			
			return new ApiResponseWithError<Boolean>(ApiResponse.Success,true, "");
		} catch (Exception ex) {
			logger.error("createMessageTemplate", ex);
			return new ApiResponseWithError<Boolean>(ApiResponse.UnHandleException, false, ex.toString());
		}
	}

	@RequestMapping(value = "/api/messgeTemplate/update", method = RequestMethod.POST)
	public @ResponseBody ApiResponseWithError<Boolean> editMessageTemplate(@RequestBody MessageTemplate messageTemplate) {

		TrailUtility.Trail(logger, TrailUtility.Trail_Update, "editMessageTemplate");

		try {

			List<MessageTemplate> MessageTemplates = this.mMessageTemplateService.listActiveMessageTemplates(messageTemplate.getProtocolId(), messageTemplate.getMessageName());
			if (!MessageTemplates.isEmpty()) {
				for (MessageTemplate template : MessageTemplates) {
					if(template.getId() != messageTemplate.getId() 
							&& template.getTemplateName().equalsIgnoreCase(messageTemplate.getTemplateName())) {
						
						logger.info("editMessageTemplate failed with name conflict, templateName :" + messageTemplate.getTemplateName());
						return new ApiResponseWithError<Boolean>(ApiResponse.Success, false, "FailedByNameDuplicated");
					}
				}
			}

			messageTemplate.setCreatedAt(new Date(new Date().getTime()));
			this.mMessageTemplateService.updateMessageTemplate(messageTemplate);
			return new ApiResponseWithError<Boolean>(ApiResponse.Success,true, "");
		} catch (Exception ex) {
			logger.error("editMessageTemplate", ex);
			return new ApiResponseWithError<Boolean>(ApiResponse.UnHandleException, false, ex.toString());
		}

	}

	@RequestMapping(value = "/api/messgeTemplate/delete/{id}", method = RequestMethod.POST)
	public @ResponseBody ApiResponse<Boolean> deleteMessageTemplate(@PathVariable("id") long id) {

		try {

			TrailUtility.Trail(logger, TrailUtility.Trail_Deletion, "deleteMessageTemplate");
			this.mMessageTemplateService.removeMessageTemplate(id);
			return new ApiResponse<Boolean>(ApiResponse.Success, true);
		} catch (Exception ex) {
			logger.error("deleteMessageTemplate", ex);
			return new ApiResponse<Boolean>(ApiResponse.UnHandleException, false);
		}
	}

}
