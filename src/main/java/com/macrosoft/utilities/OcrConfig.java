package com.macrosoft.utilities;

public class OcrConfig {
	
	private String tesseractPath;
	private String tesseractExe;
	private String tesseractOutput;
	private String tesseractEnv;
	private String tesseractLang;
	private String tesseractPagesegmode;
	private String tesseractOcrenginemode;
	
	public String getTesseractOutput() {
		return tesseractOutput;
	}
	public void setTesseractOutput(String tesseractOutput) {
		this.tesseractOutput = tesseractOutput;
	}
	public String getTesseractExe() {
		return tesseractExe;
	}
	public void setTesseractExe(String tesseractExe) {
		this.tesseractExe = tesseractExe;
	}	
	
	public String getTesseractPath() {
		return tesseractPath;
	}
	public void setTesseractPath(String tesseractPath) {
		this.tesseractPath = tesseractPath;
	}
	public String getTesseractEnv() {
		return tesseractEnv;
	}
	public void setTesseractEnv(String tesseractEnv) {
		this.tesseractEnv = tesseractEnv;
	}
	public String getTesseractLang() {
		return tesseractLang;
	}
	public void setTesseractLang(String tesseractLang) {
		this.tesseractLang = tesseractLang;
	}
	public String getTesseractPagesegmode() {
		return tesseractPagesegmode;
	}
	public void setTesseractPagesegmode(String tesseractPagesegmode) {
		this.tesseractPagesegmode = tesseractPagesegmode;
	}
	public String getTesseractOcrenginemode() {
		return tesseractOcrenginemode;
	}
	public void setTesseractOcrenginemode(String tesseractOcrenginemode) {
		this.tesseractOcrenginemode = tesseractOcrenginemode;
	}
}
