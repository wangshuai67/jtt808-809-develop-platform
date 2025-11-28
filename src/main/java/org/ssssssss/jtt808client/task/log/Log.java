package org.ssssssss.jtt808client.task.log;

public class Log {
    public LogType type;
    public long time;
    public String attachment;

    public Log(LogType type, long time, String attachment) {
        this.type = type;
        this.time = time;
        this.attachment = attachment;
    }
}


