package org.ssssssss.jtt808client.task.log;

/**
 *  日志类型枚举
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
public enum LogType {
    NETWORK("网络"), MESSAGE_IN("消息下行"), MESSAGE_OUT("消息上行"), EXCEPTION("异常"), INFO("信息"), USER_TRIGGER("用户触发");

    String name;

    LogType(String name) {
        this.name = name;
    }
}


