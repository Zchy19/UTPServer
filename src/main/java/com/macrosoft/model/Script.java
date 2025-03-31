package com.macrosoft.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
@Entity
@Table(name="Script")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Script implements Serializable{

	private static final long serialVersionUID = -8718663577011025074L;
	
	@Id
	@Column(name="id")
	private long id;
	
	@Id
	@Column(name="projectId")
	private long projectId;

	private String name;
	private String type;
	private String parameter;
	private String description;
	private String script;
	private String blockyXml;
	private long parentScriptGroupId;
	private String declaredAntbots;
	private String rwattribute;

	public Script Clone()
	{
		Script newScript = new Script();
		newScript.setId(this.id);
		newScript.setBlockyXml(this.blockyXml);
		newScript.setDescription(this.description);
		newScript.setName(this.name);
		newScript.setParameter(this.parameter);
		newScript.setParentScriptGroupId(this.parentScriptGroupId);
		newScript.setProjectId(this.projectId);
		newScript.setScript(this.script);
		newScript.setType(this.type);
		newScript.setDeclaredAntbots(this.declaredAntbots);
		newScript.setRwattribute(this.rwattribute);
		
		return newScript;
	}
	
	@Override
	public String toString(){
		return "id="+id+", name="+name+", description="+description;
	}
}
