package com.macrosoft.webserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocket
public class UtpClientWebSocketConfigurer implements WebSocketConfigurer{
    private UtpClientSocketHandler mUtpClientSocketHandler;

    @Autowired(required = true)
    @Qualifier(value = "utpClientSocketHandler")
    public void setUtpClientSocketHandler(
        UtpClientSocketHandler utpClientSocketHandler) {
        this.mUtpClientSocketHandler = utpClientSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(mUtpClientSocketHandler, "/UtpClientWebSocket");
    }

}