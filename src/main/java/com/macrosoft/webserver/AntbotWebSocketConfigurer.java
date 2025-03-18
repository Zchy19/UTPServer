package com.macrosoft.webserver;

import com.macrosoft.service.ScriptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class AntbotWebSocketConfigurer implements WebSocketConfigurer {
    private AntbotSocketHandler mAntbotSocketHandler;

    @Autowired(required = true)
    public void setAntbotSocketHandler(AntbotSocketHandler antbotSocketHandler) {
        this.mAntbotSocketHandler = antbotSocketHandler;
    }


    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(mAntbotSocketHandler, "/antbotWebSocket");
    }
}