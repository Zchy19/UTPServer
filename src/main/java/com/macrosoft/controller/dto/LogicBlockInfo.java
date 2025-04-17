package com.macrosoft.controller.dto;

import com.macrosoft.model.AgentConfig;
import lombok.Data;

@Data
public class LogicBlockInfo {
    private String path;
    private String name;
    private LogicBlockContent content;
    private String Description;
    private AgentConfig agentConfig;
}

