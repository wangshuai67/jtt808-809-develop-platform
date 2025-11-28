package org.ssssssss.jtt808client.entity;

import lombok.Data;

/**
 * 事件
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class Event {
    private String code;
    private String name;


    public Event setCode(String code) {
        this.code = code;
        return this;
    }


    public Event setName(String name) {
        this.name = name;
        return this;
    }
}


