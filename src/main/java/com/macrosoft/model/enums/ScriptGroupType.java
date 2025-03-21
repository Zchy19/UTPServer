package com.macrosoft.model.enums;

/*
 * 脚本库类型
 *
 * @author: zou chao
 * @date: 2025/3/20 15:26
**/
public enum ScriptGroupType {
    TestCaseType("testcase", "测试用例"),
    SubScriptType("subscript", "脚本"),
    LogicBlock("logicblock","公共逻辑库");

    private final String type;
    private final String name;

    ScriptGroupType(String type, String name) {
        this.type = type;
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }
}