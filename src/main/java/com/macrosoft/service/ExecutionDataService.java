package com.macrosoft.service;

import com.macrosoft.controller.dto.PreprocessExecutionParameter;
import com.macrosoft.controller.dto.StartExecutionParameter;
import com.macrosoft.model.ExecutionData;
import com.macrosoft.utp.adatper.utpengine.UtpEngineExecutor;

import java.util.List;

public interface ExecutionDataService {

   public  List<ExecutionData> getExecutionDataByExecutionId(String executionId);

   public List<ExecutionData> listExecutionData(String executionId,int lastResultId);

   //添加
   public void addExecutionData(ExecutionData executionData);
}
