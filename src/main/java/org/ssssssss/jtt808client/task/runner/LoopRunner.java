package org.ssssssss.jtt808client.task.runner;

import org.ssssssss.jtt808client.task.AbstractDriveTask;
import org.ssssssss.jtt808client.task.TaskState;
import org.ssssssss.jtt808client.util.RBTree;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedList;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Created by matrixy when 2020/5/8.
 * EventLoop运行线程
 */
public class LoopRunner extends Thread {
    static Logger logger = LoggerFactory.getLogger(LoopRunner.class);
    static final int MIN_IDLE_SLEEP_MS = 50;

    // 将执行的任务
    private LinkedList<ExecutableTask> jobs;

    // 所有待执行的任务组（每个时刻的任务列表），通过红黑树保存起来，每次只获取最小（最近）的一"
    private RBTree<TaskGroup> scheduleTasks;

    private Object lock;

    // 下一次执行的时间，也就是休眠到这个时间为"
    private long nextExecuteTime = 0L;

    public LoopRunner() {
        lock = new Object();
        // tasks需要一个有序的，并且能够容忍同权重的容"
        scheduleTasks = new RBTree<TaskGroup>();
        jobs = new LinkedList<ExecutableTask>();
    }

    // 立即执行（下一个循环）
    public void execute(AbstractDriveTask driveTask, Executable task) {
        execute(driveTask, task, 0, 0);
    }

    // 在milliseconds时间后执"
    public void execute(AbstractDriveTask driveTask, Executable task, int milliseconds, int interval) {
        execute(new ExecutableTask(driveTask, task, System.currentTimeMillis() + milliseconds, interval));
    }

    public void execute(ExecutableTask task) {
        TaskGroup tmp = new TaskGroup(task.executeTime);
        synchronized (lock) {
            // scheduleTasks.add(task);
            RBTree.RBTNode item = scheduleTasks.search(tmp);
            if (item != null && item.getKey() != null) {
                tmp = (TaskGroup) item.getKey();
                tmp.add(task);
            } else {
                tmp = new TaskGroup(task.executeTime);
                tmp.add(task);
                scheduleTasks.insert(tmp);
            }

            // 如果需要执行的时间是在线程休眠时间前，那需要唤醒线"
            if (task.executeTime < nextExecuteTime) {
                logger.debug("唤醒LoopRunner线程 - 任务时间:{} < 下一次执行时间{}", task.executeTime, nextExecuteTime);
                lock.notify();
            }
        }
    }

    public void run() {
        loop:
        while (!this.isInterrupted()) {
            try {
                long ms = 0;
                long now = System.currentTimeMillis();
                synchronized (lock) {
                    while (true) {
                        TaskGroup group = scheduleTasks.minimum();
                        // 如果没有需要执行的任务
                        if (group == null) break;
                        // 如果最近的任务的时间还没有"
                        if (group.time > now) {
                            // 如果时间还没有到，那就看还差多久，就休眠多久
                            ms = group.time - now;
                            break;
                        }

                        // 删掉它，全部转移到待执行的列表上"
                        scheduleTasks.remove(group);
                        jobs.addAll(group.tasks);
                    }
                }

                if (jobs.isEmpty()) {
                    synchronized (lock) {
                        ms = Math.max(ms, MIN_IDLE_SLEEP_MS);
                        nextExecuteTime = System.currentTimeMillis() + ms;
                        logger.trace("LoopRunner休眠{}ms，下一次执行时间{}", ms, nextExecuteTime);
                        lock.wait(ms);
                    }
                    continue;
                }

                // 遍历并执行任"
                logger.debug("开始执行任务批次 - 数量{}", jobs.size());
                for (ExecutableTask task : jobs) {
                    try {
                        // 检查任务对象是否为"
                        if (task == null || task.driveTask == null || task.executable == null) {
                            logger.warn("发现空任务对象，跳过执行");
                            continue;
                        }

                        // 检查任务状态是否为"
                        TaskState state = task.driveTask.getState();
                        if (state == null) {
                            logger.warn("任务状态为空，跳过执行 - 任务ID: {}", task.driveTask.getId());
                            continue;
                        }

                        // 跳过已经终止的行程任"
                        if (state.equals(TaskState.terminated)) {
                            continue;
                        }

                        task.executable.execute(task.driveTask);
                        if (task.interval > 0) {
                            task.executeTime += task.interval;
                            logger.debug("任务循环调度，下一次执行时间{}", task.executeTime);
                            execute(task);
                        }
                    } catch (Exception e) {
                        logger.info("job execute failed", e);
                    }
                }

                jobs.clear();
                logger.debug("本轮任务执行完成，清空队列");
            } catch (Exception ex) {
                logger.error("execute failed", ex);
            }
        }
    }

    static final AtomicLong xxoo = new AtomicLong(0L);

    public static void main(String[] args) throws Exception {
        final LoopRunner runner = new LoopRunner();
        runner.start();

        for (int i = 0; i < 10; i++) {
            new Thread() {
                public void run() {
                    for (int i = 0; i < 1000; i++) {
                        // task.executeTime = System.currentTimeMillis();
                        final ExecutableTask task = new ExecutableTask(null, new Executable() {
                            @Override
                            public void execute(AbstractDriveTask driveTask) {
                                System.out.println(xxoo.addAndGet(1L));
                            }
                        }, 0, 0);
                        // TODO: treeset的去重。。。相同的会去"
                        runner.execute(task);
                    }
                }
            }.start();
        }
    }
}


