package com.macrosoft.model.idc;

import java.util.ArrayList;
import java.util.List;

public class IdcExecutionResult {
	
	private List<ARINC429FrameData> frameDataList;
	
	public IdcExecutionResult()
	{
		frameDataList = new ArrayList<ARINC429FrameData>();
	}

	public List<ARINC429FrameData> getFrameDataList() {
		return frameDataList;
	}

	public void setFrameDataList(List<ARINC429FrameData> frameDataList) {
		this.frameDataList = frameDataList;
	}



}
