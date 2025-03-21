package com.macrosoft.model.enums;

/**
 * @Author: Zchy
 * @Description: 脚本读写属性枚举类
 * @DateTime: 2025/3/19 17:29
 **/
public enum rwAttribute {
    WRITEABLE("writeable", "可写"),
    READ_ONLY("readonly", "只读"),
    UNREADABLE("unreadable", "不可读");

    private String code;
    private String name;

    rwAttribute(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }
}
