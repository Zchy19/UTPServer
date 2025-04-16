package com.macrosoft.model.enums;

import lombok.AllArgsConstructor;

/**
 * @Author: Zchy
 * @Description: 公共逻辑库的项目id
 * @DateTime: 2025/4/16 15:44
 **/
@AllArgsConstructor
public enum LogicBlockProject {

    LOGIC_BLOCK(0L, "公共逻辑库项目id");

    private long id;
    private String name;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
