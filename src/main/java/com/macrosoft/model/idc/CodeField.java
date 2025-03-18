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
public class CodeField implements Serializable{

	private List<Code> codes = new ArrayList<Code>();

	public List<Code> getCodes() {
		return codes;
	}
	
}
