package com.macrosoft.utp.adatper.utpengine.exception;

public class ConfigEngineException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Config engine failed.";
	
	public ConfigEngineException() {
		super(ErrorMessage);
	}
	
	@Override
	public String toString(){
		return ErrorMessage;
	}
}
