package com.macrosoft.utilities;

public class ParserResult<T> {

	private T result;
	private boolean parserSuccess;
	
	public T getResult() {
		return result;
	}
	public void setResult(T result) {
		this.result = result;
	}
	public boolean isParserSuccess() {
		return parserSuccess;
	}
	public void setParserSuccess(boolean parserSuccess) {
		this.parserSuccess = parserSuccess;
	}
}
