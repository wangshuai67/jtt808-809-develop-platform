package org.ssssssss.jtt808client.task.event;

/**
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
public enum EventEnum
{
    data_received("data_received", "收到服务器端数据"),
    data_sent("data_sent", "数据发送成功时"),
    connected("connected", "连接建立成功"),
    disconnected("disconnected", "连接断开"),
    send_failed("send_failed", "发送失败时"),
    message_received("message_received", "收到服务器消息时"),
    message_sent("message_sent", "消息成功发送时"),
    message_ignored("message_ignored", "服务器端消息被忽略时"),
    user_interact("user_interact", "用户触发");

    private String name;
    private String description;

    EventEnum(String name, String desc)
    {
        this.name = name;
        this.description = desc;
    }

    public String getName()
    {
        return this.name;
    }

    public String getDescription()
    {
        return this.description;
    }
}


