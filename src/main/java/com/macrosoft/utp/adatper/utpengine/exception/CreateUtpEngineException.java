package com.macrosoft.utp.adatper.utpengine.exception;

public class CreateUtpEngineException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Create utpengine failed.";
	
	public CreateUtpEngineException() {
		super(ErrorMessage);
	}
	
	@Override
	public String toString(){
		return ErrorMessage;
	}
}
