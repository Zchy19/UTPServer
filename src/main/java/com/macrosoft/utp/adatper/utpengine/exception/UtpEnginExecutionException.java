package com.macrosoft.utp.adatper.utpengine.exception;

public class UtpEnginExecutionException extends Exception {

	private String _errorMessage;
	protected UtpEnginExecutionException(String errorMessage)
	{
		_errorMessage = errorMessage;
	}
	
	public String getErrorMessage()
	{
		return _errorMessage;
	}

	@Override
	public String toString(){
		return _errorMessage;
	}
}
