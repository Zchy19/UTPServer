package com.macrosoft.utp.adatper.utpengine.exception;

public class UtpCoreNetworkException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Network exception when api to connect UtpCore.";
	
	public UtpCoreNetworkException() {
		super(ErrorMessage);
	}
	
	@Override
	public String toString(){
		return ErrorMessage;
	}
}
