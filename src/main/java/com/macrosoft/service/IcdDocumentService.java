package com.macrosoft.service;

import java.util.List;

import com.macrosoft.model.idc.IcdModel;

public interface IcdDocumentService {
	
	public String resolveIcdFolderPath();
	
	public IcdModel addIdcDocument(String id);
	public void removeIdcDocument(String id);	
	public List<IcdModel> getIdcModels();
	
	public IcdModel getIcdDocument(String id);
		
}
