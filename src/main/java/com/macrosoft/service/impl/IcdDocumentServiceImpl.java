package com.macrosoft.service.impl;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;

import com.macrosoft.service.IcdDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.macrosoft.model.idc.IcdModel;
import com.macrosoft.utilities.SystemUtil;

@Service
public class IcdDocumentServiceImpl implements IcdDocumentService {


	private static List<IcdModel> cachedIcdModels = null;
	
	@Autowired
	ServletContext context;
	
	@Override
	@Transactional
	public IcdModel addIdcDocument(String id) {
		return null;
	}

	@Override
	@Transactional
	public void removeIdcDocument(String id) {
		// TODO Auto-generated method stub
		
	}
	
	@Override
	@Transactional
	public IcdModel getIcdDocument(String id) {
		return null;
	}

	
	@Override
	@Transactional
	public List<IcdModel> getIdcModels() {

		if (cachedIcdModels != null) return cachedIcdModels;
		
		
		cachedIcdModels = new ArrayList<IcdModel>();
		
		String icdRepositoryFolderPath = resolveIcdFolderPath();
		
		File icdRepositoryFolder = new File(icdRepositoryFolderPath);
		for (File file : icdRepositoryFolder.listFiles())
		{
			IcdModel model = getIcdDocument(file.getName());
			if (model != null)
			{
				cachedIcdModels.add(model);
			}
		}
		
		return cachedIcdModels;
		/*
		List<IcdModel> models = new ArrayList<IcdModel>();
		IcdModel model = new IcdModel();
		
		model.setId(UUID.randomUUID().toString());
		model.setName("AV-A429_EQID_LABEL_DEFN");
		model.setVersion("2.0.2.0");
		
		Equipment equip = new Equipment();		
		equip.setIndex("002");
		equip.setName("Flight Management Computer (702)");
	
		Label label = createDistanceToGo();
		equip.getLabels().add(label);

		label = this.createTimeToGo();
		equip.getLabels().add(label);
		
		label = this.createCrossTrackDistance();
		equip.getLabels().add(label);

		label = this.createPresentPositionLatitude();
		equip.getLabels().add(label);
		model.getEquipments().add(equip);
		
		models.add(model);
		return models;
		*/
	}

	@Override
	@Transactional
	public String resolveIcdFolderPath()
	{			
		String uploadedFolder = SystemUtil.getUploadDirectory() /*context.getRealPath("/WEB-INF/uploaded")*/;
		if (!new File(uploadedFolder).exists()) {
			new File(uploadedFolder).mkdir();
		}

		String icdRepositoryFolder = uploadedFolder + "/icd";
		if (!new File(icdRepositoryFolder).exists()) {
			new File(icdRepositoryFolder).mkdir();
		}
		
		return icdRepositoryFolder;
	}
}
