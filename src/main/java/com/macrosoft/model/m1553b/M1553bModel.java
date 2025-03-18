package com.macrosoft.model.m1553b;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Entity bean with JPA annotations
 * Hibernate provides JPA implementation
 * @author david
 *
 */
public class M1553bModel implements Serializable{

	private String id;
	private String name;
	private ComWord comWord = new ComWord();
	private ConcurrentHashMap<Integer, RtCom> rtComs = new ConcurrentHashMap<Integer, RtCom>();
	
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
	public ComWord getComWord() {
		return comWord;
	}
	public void setComWord(ComWord comWord) {
		this.comWord = comWord;
	}
	public ConcurrentHashMap<Integer, RtCom> getRtComs() {
		return rtComs;
	}
	public void setRtComs(ConcurrentHashMap<Integer, RtCom> rtComs) {
		this.rtComs = rtComs;
	}

}
