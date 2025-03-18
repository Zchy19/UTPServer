package com.macrosoft.model.m1553ba429;

import java.util.ArrayList;
import java.util.List;

public class M1553bA429ExecutionResult {
	
	private List<M1553bAndA429FrameData> frameDataList;
	
	public M1553bA429ExecutionResult()
	{
		frameDataList = new ArrayList<M1553bAndA429FrameData>();
	}

	public List<M1553bAndA429FrameData> getFrameDataList() {
		return frameDataList;
	}

	public void setFrameDataList(List<M1553bAndA429FrameData> frameDataList) {
		this.frameDataList = frameDataList;
	}
}
