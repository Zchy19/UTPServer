package com.macrosoft.model;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="MessageTemplate")
public class MessageTemplate implements Serializable{


	@Id
	@Column(name="id")
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;

	
	private String protocolId;
	private String messageName;	
	private String templateName;
	private String fieldValues;
	private boolean deleted;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm", timezone="GMT+8")
	private Date createdAt;
	
	
	public long getId() {
		return id;
	}


	public void setId(long id) {
		this.id = id;
	}


	public String getProtocolId() {
		return protocolId;
	}


	public void setProtocolId(String protocolId) {
		this.protocolId = protocolId;
	}


	public String getMessageName() {
		return messageName;
	}


	public void setMessageName(String messageName) {
		this.messageName = messageName;
	}


	public String getTemplateName() {
		return templateName;
	}


	public void setTemplateName(String templateName) {
		this.templateName = templateName;
	}


	public String getFieldValues() {
		return fieldValues;
	}


	public void setFieldValues(String fieldValues) {
		this.fieldValues = fieldValues;
	}


	public boolean isDeleted() {
		return deleted;
	}


	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}


	public Date getCreatedAt() {
		return createdAt;
	}


	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

	public MessageTemplate Clone()
	{
		MessageTemplate messageTemplate = new MessageTemplate();
		messageTemplate.setId(this.id);
		messageTemplate.setProtocolId(this.protocolId);
		messageTemplate.setMessageName(this.messageName);
		messageTemplate.setTemplateName(this.templateName);
		messageTemplate.setDeleted(this.deleted);
		messageTemplate.setFieldValues(this.fieldValues);
		messageTemplate.setCreatedAt(this.createdAt);
		return messageTemplate;
	}

	@Override
	public String toString(){
		return "id="+id+", protocolId="+protocolId +", messageName="+messageName +", templateName="+templateName;
	}
}
