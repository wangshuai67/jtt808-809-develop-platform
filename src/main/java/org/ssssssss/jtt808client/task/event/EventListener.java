package org.ssssssss.jtt808client.task.event;

import org.ssssssss.jtt808client.task.AbstractDriveTask;

/**
 * 事件触发时调用的事件回调，完成对具体事件的执行处理过
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
public interface EventListener
{
    /**
     * 当事件发生时调用
     * @param driveTask 当前行驶行程
     * @param data 事件数据
     */
    public void on(AbstractDriveTask driveTask, Object data);
}


