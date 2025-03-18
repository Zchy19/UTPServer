package com.macrosoft.logging;

public class LoggerFactory {
	
	public static ILogger Create(String name)
	{
		return new LoggerAdapter(name);
	}
}
