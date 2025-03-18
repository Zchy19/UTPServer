package com.macrosoft.model.m1553b;

import java.util.ArrayList;
import java.util.List;

public class M1553ExecutionResult {

	private List<M1553FrameData> frameDataList;
	
	public M1553ExecutionResult()
	{
		frameDataList = new ArrayList<M1553FrameData>();
	}

	public List<M1553FrameData> getFrameDataList() {
		return frameDataList;
	}

	public void setFrameDataList(List<M1553FrameData> frameDataList) {
		this.frameDataList = frameDataList;
	}



}
