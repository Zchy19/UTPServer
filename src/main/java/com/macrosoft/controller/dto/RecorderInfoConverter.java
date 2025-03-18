package com.macrosoft.controller.dto;

import com.macrosoft.model.Recorder;

public class RecorderInfoConverter {
	public static RecorderInfo ConvertToRecorderInfo(Recorder recorder) {
		RecorderInfo recorderInfo = new RecorderInfo();
		recorderInfo.setId(recorder.getId());

		recorderInfo.setName(recorder.getName());
		recorderInfo.setType(recorder.getType());
		recorderInfo.setLastUpdateTime(recorder.getLastUpdatedTime());
		return recorderInfo;
	}
}
