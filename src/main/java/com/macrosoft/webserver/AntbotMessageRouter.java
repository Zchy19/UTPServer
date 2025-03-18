package com.macrosoft.webserver;

import com.macrosoft.controller.ExecutionDataController;
import com.macrosoft.controller.ExecutionResultController;
import com.macrosoft.controller.MonitoringExecutionController;
import com.macrosoft.controller.dto.ExecutionDataInfo;
import com.macrosoft.master.TenantContext;
import com.macrosoft.model.MonitoringExecutionDetail;
import com.macrosoft.model.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

@Component
public class AntbotMessageRouter {


    private UtpClientSocketHandler utpClientSocketHandler;
    private ExecutionResultController executionResultController;
    private ExecutionDataController executionDataController;
    private MonitoringExecutionController monitoringExecutionController;

    @Autowired(required = true)
    public void setUtpClientSocketHandler(UtpClientSocketHandler utpClientSocketHandler) {
        this.utpClientSocketHandler = utpClientSocketHandler;
    }

    @Autowired(required = true)
    public void setExecutionResultController(ExecutionResultController executionResultController) {
        this.executionResultController = executionResultController;
    }

    @Autowired(required = true)
    public void setExecutionDataController(ExecutionDataController executionDataController) {
        this.executionDataController = executionDataController;
    }

    @Autowired(required = true)
    public void setMonitoringExecutionController(MonitoringExecutionController monitoringExecutionController) {
        this.monitoringExecutionController = monitoringExecutionController;
    }

    public void routeMessage(WebSocketSession session,TextMessage message) {
        // TODO:message parser here.
        //设置租户id,暂时写死
        TenantContext.setTenantId(Long.toString(0));
        //获取数据是否保存数据库
        String transparentData = session.getHandshakeHeaders().get("transparentData").get(0);
        // switch (message), decide how to handle this message.
        // sample: 1. silently save database
        String dataType = session.getHandshakeHeaders().get("dataType").get(0);

        // sample: 2. router this to utplient.
        // mIAntbotMessageEventListener.onMessageReceived(message);
        //获取dataType
        //获取消息内容
        if (transparentData.equals("entrepotNoSaveDatabase")) {
            //转发给前端,不保存数据库
            utpClientSocketHandler.onMessageReceived(session,message);
        }else if (transparentData.equals("entrepotSaveDatabase")) {
            utpClientSocketHandler.onMessageReceived(session,message);
            //将message解析为json对象
            ObjectMapper objectMapper = new ObjectMapper();
            // 将TextMessage中的文本内容转换为Notification对象
            if (dataType.equals("excutionresult")){
                try {
                    Notification notification = objectMapper.readValue(message.getPayload(), Notification.class);
                    executionResultController.upload(notification);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }else if (dataType.equals("executiondata")){
                // 将TextMessage中的文本内容转换为Notification对象
                try {
                    ExecutionDataInfo executionDataInfo = objectMapper.readValue(message.getPayload(), ExecutionDataInfo.class);
                    executionDataController.uploadExecutionData(executionDataInfo);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }else if (dataType.equals("monitoringexecutiondetail")){
                try {
                    MonitoringExecutionDetail monitoringExecutionDetail = objectMapper.readValue(message.getPayload(), MonitoringExecutionDetail.class);
                    monitoringExecutionController.addMonitoringExecutionDetails(monitoringExecutionDetail);
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }
            //转发给前端并保存数据库
        }else if(transparentData.equals("NoEntrepotSaveDatabase")){
            //不转发,只保存数据库
            ObjectMapper objectMapper = new ObjectMapper();
            if (dataType.equals("excutionresult")){
                //将message解析为json对象
                // 将TextMessage中的文本内容转换为Notification对象
                try {
                    Notification notification = objectMapper.readValue(message.getPayload(), Notification.class);
                    executionResultController.upload(notification);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }else if (dataType.equals("executiondata")){
                // 将TextMessage中的文本内容转换为Notification对象
                try {
                    ExecutionDataInfo executionDataInfo = objectMapper.readValue(message.getPayload(), ExecutionDataInfo.class);
                    executionDataController.uploadExecutionData(executionDataInfo);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }else if (dataType.equals("monitoringexecutiondetail")){
                try {
                    MonitoringExecutionDetail monitoringExecutionDetail = objectMapper.readValue(message.getPayload(), MonitoringExecutionDetail.class);
                    monitoringExecutionController.addMonitoringExecutionDetails(monitoringExecutionDetail);
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }

        }

    }



}
