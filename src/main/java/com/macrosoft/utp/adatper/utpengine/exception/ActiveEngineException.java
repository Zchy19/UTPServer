package com.macrosoft.utp.adatper.utpengine.exception;

public class ActiveEngineException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Active engine failed.";
	
	public ActiveEngineException() {
		super(ErrorMessage);
	}
}
