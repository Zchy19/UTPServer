package com.macrosoft.webserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

@Component
public class MessageQueue extends TextWebSocketHandler {
    private final BlockingQueue<SessionMessage> queue = new LinkedBlockingQueue<>();
    private final Thread consumerThread;
    private final AntbotMessageRouter antbotMessageRouter;

    @Autowired
    public MessageQueue(AntbotMessageRouter antbotMessageRouter) {
        this.antbotMessageRouter = antbotMessageRouter;
        consumerThread = new Thread(this::consumeMessages);
        consumerThread.start();
    }

    public void addMessage(SessionMessage sessionMessage) {
        try {
            queue.put(sessionMessage);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Failed to add message to queue: " + e.getMessage());
        }
    }

    private void consumeMessages() {
        while (true) {
            try {
                SessionMessage sessionMessage = queue.take();
                // 处理消息
                processMessage(sessionMessage);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("Consumer thread interrupted: " + e.getMessage());
                break;
            }
        }
    }

    private void processMessage(SessionMessage sessionMessage) {
        WebSocketSession session = sessionMessage.getSession();
        TextMessage message = sessionMessage.getMessage();
        // 在这里处理消息
        antbotMessageRouter.routeMessage(session, message);
    }
}