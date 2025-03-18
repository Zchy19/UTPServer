package com.macrosoft.utp.adatper.utpengine.exception;

import java.util.ArrayList;
import java.util.List;

public class StartExecutionException extends UtpEnginExecutionException {

	public final static String ErrorMessage = "Start execution failed.";
	public List<AntbotFailReason> antbotFailedReasons = new ArrayList<AntbotFailReason>();

	public StartExecutionException() {
		super(ErrorMessage);
	}

	@Override
	public String toString(){
		return ErrorMessage;
	}
}
