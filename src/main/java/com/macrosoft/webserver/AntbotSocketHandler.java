package com.macrosoft.webserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.ArrayList;
import java.util.List;

@Component
public class AntbotSocketHandler extends TextWebSocketHandler {
    private static final List<WebSocketSession> sessions = new ArrayList<>();
    private final MessageQueue messageQueue;

    @Autowired
    public AntbotSocketHandler(AntbotMessageRouter antbotMessageRouter) {
        this.messageQueue = new MessageQueue(antbotMessageRouter);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 建立连接时触发,判断响应头有没有dataType，如果有，就连接
        if (session.getHandshakeHeaders().containsKey("dataType") && session.getHandshakeHeaders().containsKey("executionId") && session.getHandshakeHeaders().containsKey("transparentData")) {
            sessions.add(session);
        } else {
            session.close();
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 将消息分发到中转,处理收到的消息
        messageQueue.addMessage(new SessionMessage(session, message));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 关闭连接时触发
        sessions.remove(session);
    }
}