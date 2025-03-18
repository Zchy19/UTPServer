package com.macrosoft.webserver;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UtpClientSocketHandler extends TextWebSocketHandler implements IAntbotMessageEventListener {
    private static final List<WebSocketSession> sessions = new ArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 建立连接时触发
        URI uri = session.getUri();
        String query =uri.getQuery();
        //判断query中是否包含dataType，如果有，就连接
        if (query.contains("dataType")) {
            sessions.add(session);
        } else {
            session.close();
        }
//        sessions.add(session);
//        System.out.println(sessions);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
//        System.out.println(session.getId());
        // 处理收到的消息
        String payload = message.getPayload();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 关闭连接时触发
        sessions.remove(session);
    }

    @Override
    public void onMessageReceived(WebSocketSession session,TextMessage message) {
        //Todo: handle utp client logic after receiving message from antbot
        //1.获取session的executionId
        String executionId = session.getHandshakeHeaders().get("executionId").get(0);
        //2.获取session的dataType
        String dataType = session.getHandshakeHeaders().get("dataType").get(0);
        //3.将executionId和dataType拼装起来,作为key
        String id = executionId + dataType;
        //4.从sessions中获取对应的session,并发送给前端
        for (WebSocketSession webSocketSession : sessions) {
            try {
                URI uri = webSocketSession.getUri();
                String query =uri.getQuery();
                //根据=将query分割成两部分
                String[] split = query.split("=");
                query = split[1];
                if(query.equals(executionId+"+"+dataType)){
                    webSocketSession.sendMessage(new TextMessage(message.getPayload())); // 推送给前端的字符串
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
