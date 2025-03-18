package com.macrosoft.webserver;


import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.EventListener;

public interface IAntbotMessageEventListener extends EventListener {
    void onMessageReceived(WebSocketSession session,TextMessage message);

}