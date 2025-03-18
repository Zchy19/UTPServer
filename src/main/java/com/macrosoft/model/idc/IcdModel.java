package com.macrosoft.model.idc;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class IcdModel implements Serializable{

	private List<Equipment> equipments = new ArrayList<Equipment>();
	private String id;
	private String name;
	private String version;
	
	public List<Equipment> getEquipments() {
		return equipments;
	}

	public void setEquipments(List<Equipment> equipments) {
		this.equipments = equipments;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	/*
	public void toJsonString()
	{
		JSONObject rootJsonObject = new JSONObject();
		rootJsonObject.put("id", this.getId());
		rootJsonObject.put("name", this.getName());
		rootJsonObject.put("version", this.getVersion());
		
		JSONArray equipmentsJsonArray = new JSONArray();
		rootJsonObject.put("equipments", equipmentsJsonArray);
		
		
		for (Equipment equip : this.getEquipments())
		{
			JSONObject equipJsonObject = new JSONObject();
			equipJsonObject.put("index", equip.getIndex());
			equipJsonObject.put("name", equip.getName());

			JSONArray labelsJsonArray = new JSONArray();
			equipJsonObject.put("labels", labelsJsonArray);
		
			for (Label label : equip.getLabels())
			{
				JSONObject labelJsonObject = new JSONObject();
				labelJsonObject.put("index", label.getIndex());
				labelJsonObject.put("name", label.getName());
				labelJsonObject.put("minTxInterval", label.getMinTxInterval());
				labelJsonObject.put("maxTxInterval", label.getMaxTxInterval());
				
				for (Field field : label.getFields())
				{
					JSONObject fieldJsonObject = new JSONObject();
					fieldJsonObject.put("name", field.getName());
					fieldJsonObject.put("unit", field.getUnit());
					fieldJsonObject.put("startBit", field.getStartBit());
					fieldJsonObject.put("endBit", field.getEndBit());
					
					if (field.getCodeField() != null)
					{
						JSONObject codefieldJsonObject = new JSONObject();
						fieldJsonObject.put("codeField", codefieldJsonObject);
						
						JSONArray codesJsonArray = new JSONArray();
						codefieldJsonObject.put("codeField", codesJsonArray);
						
						for (Code code : field.getCodeField().getCodes())
						{
							
						}
					}
					
	
					rootJsonObject.put("equipments", equipmentsJsonArray);
					
					fieldJsonObject.put("codeField", label.getName());
					fieldJsonObject.put("bcd", label.getName());
				}
			}
		}
		
	}
*/
}
