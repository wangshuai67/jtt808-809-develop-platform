package org.ssssssss.jtt808client.task;

public enum TaskState
{
    idle("idle", "空闲"),
    driving("driving", "行驶"),
    parking("parking", "停车"),
    terminated("terminated", "行驶终止");

    String value;
    String name;

    TaskState(String value, String name)
    {
        this.value = value;
        this.name = name;
    }

    public String getValue()
    {
        return this.value;
    }

    public String getName()
    {
        return this.name;
    }
}


