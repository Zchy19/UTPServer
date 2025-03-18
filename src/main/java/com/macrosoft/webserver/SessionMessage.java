package com.macrosoft.webserver;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class SessionMessage {
    private final WebSocketSession session;
    private final TextMessage message;

    public SessionMessage(WebSocketSession session, TextMessage message) {
        this.session = session;
        this.message = message;
    }

    public WebSocketSession getSession() {
        return session;
    }

    public TextMessage getMessage() {
        return message;
    }
}