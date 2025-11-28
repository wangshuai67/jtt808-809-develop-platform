package org.ssssssss.jtt808client.task.runner;


import org.ssssssss.jtt808client.task.AbstractDriveTask;

/**
 * Created by matrixy when 2020/5/8.
 * LoopRunner线程管理器，用于分发/管理任务
 */
public final class RunnerManager {
    static final RunnerManager instance = new RunnerManager();

    // LoopRunner线程组
    LoopRunner[] runners;
    private static int THREAD_COUNT = Math.max(
            1,
            Math.min(
                Math.max(2, Runtime.getRuntime().availableProcessors() * 2),
                org.ssssssss.jtt808client.util.Configs.getInt(
                    "pressure.thread.count",
                    Runtime.getRuntime().availableProcessors()
                )
            )
    );

    private RunnerManager() {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RunnerManager.class);
        logger.info("初始化 RunnerManager - 线程数:{}", THREAD_COUNT);
        ensureRunners();
    }

    // 只要在应用程序启动时调用一下这个方法，就可以完成本类的static变量的初始化，省得加锁了
    public static void init() {
        // do nothing here...
    }

    public static void reconfigure(int threads) {
        if (threads < 1) threads = 1;
        // Shutdown old
        try { getInstance().shutdown(); } catch (Exception ignore) {}
        // Recreate
        THREAD_COUNT = threads;
        getInstance().ensureRunners();
    }

    public static int getThreadCount() {
        return THREAD_COUNT;
    }

    public static RunnerManager getInstance() {
        return instance;
    }

    // 委托运行某任务
    public void execute(AbstractDriveTask driveTask, Executable task) {
        execute(driveTask, task, 0, 0);
    }

    public void execute(AbstractDriveTask driveTask, Executable task, int milliseconds) {
        execute(driveTask, task, milliseconds, 0);
    }

    // 委托在milliseconds时间后运行某任务
    public void execute(AbstractDriveTask driveTask, Executable task, int milliseconds, int interval) {
        ensureRunners();
        if (runners == null || runners.length == 0) {
            org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RunnerManager.class);
            logger.warn("Runner 线程组为空，直接同步执行 - 任务ID:{}, 延迟{}ms", driveTask.getId(), milliseconds);
            try { task.execute(driveTask); } catch (Exception e) { logger.error("同步执行任务失败", e); }
            return;
        }
        int hash = Math.abs(driveTask.hashCode() % runners.length);
        org.slf4j.LoggerFactory.getLogger(RunnerManager.class).debug("分发任务到 runner[{}] - 延迟{}ms, 间隔{}ms, 任务ID:{}", hash, milliseconds, interval, driveTask.getId());
        runners[hash].execute(driveTask, task, milliseconds, interval);
    }

    // 关闭线程组里的所有LoopRunner
    public void shutdown() {
        if (runners == null) return;
        for (int i = 0; i < runners.length; i++) {
            LoopRunner runner = runners[i];
            if (runner != null) {
                runner.interrupt();
            }
        }
    }

    private synchronized void ensureRunners() {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RunnerManager.class);
        if (runners == null || runners.length < 1) {
            runners = new LoopRunner[THREAD_COUNT];
        }
        boolean needRecreate = false;
        for (int i = 0; i < runners.length; i++) {
            if (runners[i] == null || !runners[i].isAlive()) {
                needRecreate = true;
                break;
            }
        }
        if (needRecreate) {
            for (int i = 0; i < runners.length; i++) {
                try {
                    if (runners[i] != null && runners[i].isAlive()) {
                        runners[i].interrupt();
                    }
                } catch (Exception ignore) {}
                runners[i] = new LoopRunner();
                runners[i].setName("loop-runner-" + i);
                runners[i].start();
                logger.debug("启动 runner 线程 - index:{}", i);
            }
        }
    }
}
