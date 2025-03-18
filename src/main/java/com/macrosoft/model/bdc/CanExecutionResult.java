package com.macrosoft.model.bdc;

import java.util.ArrayList;
import java.util.List;

public class CanExecutionResult {
	
	private List<CanFrameData> canFrameDataList;
	
	public CanExecutionResult()
	{
		canFrameDataList = new ArrayList<CanFrameData>();
	}

	public List<CanFrameData> getCanFrameDataList() {
		return canFrameDataList;
	}

	public void setCanFrameDataList(List<CanFrameData> canFrameDataList) {
		this.canFrameDataList = canFrameDataList;
	}

}
