package com.macrosoft.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggerAdapter implements ILogger {

	private final Logger logger;

	public LoggerAdapter(String name) {
		logger = LoggerFactory.getLogger(name);
	}

	@Override
	public void info(String message) {
		logger.info(message);
	}

	@Override
	public void debug(String message) {
		logger.debug(message);
	}

	@Override
	public void error(String message) {
		logger.error(message);
	}

	@Override
	public void error(String methodName, Exception exception) {

		error(String.format("Exception - %s , exception: %s", methodName, exception.toString()));
	}
}
