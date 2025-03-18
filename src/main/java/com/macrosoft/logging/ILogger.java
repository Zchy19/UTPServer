package com.macrosoft.logging;

public interface ILogger {
	public void info(String message);
	public void debug(String message);
	public void error(String message);
	public void error(String methodName, Exception exception);
}
