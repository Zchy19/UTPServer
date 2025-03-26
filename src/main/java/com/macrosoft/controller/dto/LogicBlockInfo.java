package com.macrosoft.controller.dto;

import lombok.Data;

@Data
public class LogicBlockInfo {
    private String path;
    private String name;
    private LogicBlockContent content;
    private String Description;
}

