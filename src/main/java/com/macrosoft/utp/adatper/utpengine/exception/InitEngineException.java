package com.macrosoft.utp.adatper.utpengine.exception;

public class InitEngineException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Init engine failed.";
	
	public InitEngineException() {
		super(ErrorMessage);
	}

	@Override
	public String toString(){
		return ErrorMessage;
	}
}
