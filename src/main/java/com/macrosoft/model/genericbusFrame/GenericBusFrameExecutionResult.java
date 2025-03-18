package com.macrosoft.model.genericbusFrame;

import java.util.ArrayList;
import java.util.List;

public class GenericBusFrameExecutionResult {
	
	private List<GenericBusFrameData> genericBusFrameDatas;
	
	public GenericBusFrameExecutionResult()
	{
		genericBusFrameDatas = new ArrayList<GenericBusFrameData>();
	}

	public List<GenericBusFrameData> getGenericBusFrameDatas() {
		return genericBusFrameDatas;
	}

	public void setGenericBusFrameDatas(List<GenericBusFrameData> genericBusFrameDatas) {
		this.genericBusFrameDatas = genericBusFrameDatas;
	}


}
