package org.ssssssss.jtt808client.task.runner;

import java.util.LinkedList;

/**
 * 在某个时刻的所有任务集"
 */
public class TaskGroup implements Comparable<TaskGroup> {
    public long time;
    public LinkedList<ExecutableTask> tasks;

    public TaskGroup(long time) {
        this.time = time;
        this.tasks = new LinkedList<ExecutableTask>();
    }

    public void add(ExecutableTask task) {
        this.tasks.add(task);
    }

    @Override
    public int compareTo(TaskGroup o) {
        return (int) (this.time - o.time);
    }
}


