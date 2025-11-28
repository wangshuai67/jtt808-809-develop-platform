package org.ssssssss.jtt808client.manager;

import org.ssssssss.jtt808client.util.BeanUtils;
import org.ssssssss.jtt808client.util.DateUtils;
import org.ssssssss.jtt808client.web.entity.ScheduleTask;
import org.ssssssss.jtt808client.web.service.ScheduleTaskService;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Slf4j
public final class ScheduleTaskManager {
    final long DAY = 1000L * 60 * 60 * 24;

    // 计划任务
    LinkedList<ScheduleTask> schedulePlans = new LinkedList();

    // 应用启动时，加载全部
    public void init() {
        ScheduleTaskService taskService = null;
        try {
            taskService = BeanUtils.create(ScheduleTaskService.class);
            List<ScheduleTask> tasks = taskService.find();
            if (tasks == null || tasks.isEmpty()) {
                log.info("没有找到计划任务");
                return;
            }

            for (ScheduleTask scheduleTask : tasks) {
                try {
                    load(scheduleTask);
                    log.debug("加载计划任务成功 - ID: {}", scheduleTask.getId());
                } catch (Exception e) {
                    log.error("加载单个计划任务失败 - ID: {}", scheduleTask.getId(), e);
                }
            }
            log.info("计划任务管理器初始化完成 - 加载任务{}", schedulePlans.size());
        } catch (Exception ex) {
            log.error("计划任务管理器初始化异常", ex);
            throw new RuntimeException("计划任务管理器初始化失败", ex);
        } finally {
            if (taskService != null) {
                try {
                    BeanUtils.destroy(taskService);
                } catch (Exception e) {
                    log.warn("销毁ScheduleTaskService失败", e);
                }
            }
        }
    }

    public void start(Long scheduleTaskId) {
        if (scheduleTaskId == null) {
            log.warn("启动计划任务失败 - 任务ID为空");
            return;
        }

        try {
            load(scheduleTaskId);
            start();
            log.info("计划任务启动成功 - ID: {}", scheduleTaskId);
        } catch (Exception ex) {
            log.error("计划任务启动异常 - ID: {}", scheduleTaskId, ex);
            throw new RuntimeException("计划任务启动失败: " + ex.getMessage(), ex);
        }
    }

    // 单个加载
    public void load(ScheduleTask scheduleTask) {
        if (scheduleTask == null) {
            log.warn("加载计划任务失败 - 任务对象为空");
            return;
        }

        try {
            if (schedulePlans.size() > 0) remove(scheduleTask.getId());
            synchronized (schedulePlans) {
                schedulePlans.add(scheduleTask);
            }
            log.debug("计划任务加载成功 - ID: {}, 名称: {}", scheduleTask.getId(), scheduleTask.getVehicleName());
        } catch (Exception e) {
            log.error("加载计划任务失败 - ID: {}", scheduleTask.getId(), e);
            throw new RuntimeException("加载计划任务失败", e);
        }
    }

    public void load(Long scheduleTaskId) {
        if (scheduleTaskId == null) {
            log.warn("加载计划任务失败 - 任务ID为空");
            return;
        }

        ScheduleTaskService taskService = null;
        try {
            taskService = BeanUtils.create(ScheduleTaskService.class);
            ScheduleTask task = taskService.getById(scheduleTaskId);
            if (task == null) {
                log.warn("计划任务不存- ID: {}", scheduleTaskId);
                return;
            }
            load(task);
        } catch (Exception ex) {
            log.error("加载计划任务失败 - ID: {}", scheduleTaskId, ex);
            throw new RuntimeException("加载计划任务失败: " + ex.getMessage(), ex);
        } finally {
            if (taskService != null) {
                try {
                    BeanUtils.destroy(taskService);
                } catch (Exception e) {
                    log.warn("销毁ScheduleTaskService失败", e);
                }
            }
        }
    }

    // 删除
    public void remove(Long scheduleTaskId) {
        if (scheduleTaskId == null) {
            log.warn("删除计划任务失败 - 任务ID为空");
            return;
        }

        try {
            int i = -1;
            boolean removed = false;
            synchronized (schedulePlans) {
                for (ScheduleTask scheduleTask : schedulePlans) {
                    i += 1;
                    if (scheduleTask.getId().equals(scheduleTaskId)) {
                        schedulePlans.remove(i);
                        removed = true;
                        break;
                    }
                }
            }
            if (removed) {
                log.info("计划任务已删- ID: {}", scheduleTaskId);
            } else {
                log.warn("未找到要删除的计划任- ID: {}", scheduleTaskId);
            }
        } catch (Exception e) {
            log.error("删除计划任务失败 - ID: {}", scheduleTaskId, e);
        }
    }

    // 启动任务
    private void start(ScheduleTask plan) {
        if (plan == null) {
            log.warn("启动任务失败 - 计划任务对象为空");
            return;
        }

        try {
            log.info("准备启动模拟- 计划ID: {}", plan.getId());

            String fmt = "yyyy-MM-dd HH:mm:ss";
            String today = DateUtils.format(DateUtils.today());
            long timespan = (long) (Math.random() * (DateUtils.parse(today + " " + plan.getEndTime(), fmt).getTime() - DateUtils.parse(today + " " + plan.getFromTime(), fmt).getTime()));
            Date startTime = new Date(DateUtils.parse(today + " " + plan.getFromTime(), fmt).getTime() + timespan);
            // 更新计划任务的最后行驶时间，避免重复运行
            plan.setLastDriveTime(startTime);

            Long driverId = plan.getDriverId();

            // 064621811122
            String driverPhoto = null;

            // 添加到任务队列里"
            // Task task = new Task(plan.getId(), plan.getRouteId(), plan.getVehicleId(), null, String.valueOf(SIMGenerator.get()), driverPhoto, startTime);
            // SimulatorManager.getInstance().add(task);

            log.debug("模拟器启动成- 计划ID: {}, 开始时{}", plan.getId(), DateUtils.format(startTime, fmt));
        } catch (Exception ex) {
            log.error("启动任务失败 - 计划ID: {}", plan != null ? plan.getId() : "null", ex);
            throw new RuntimeException("启动任务失败: " + ex.getMessage(), ex);
        }
    }

    // 启动
    public void start() {
        try {
            Timer timer = new Timer("ScheduleTaskManager-Timer", true);
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    try {
                        postTasks();
                    } catch (Exception ex) {
                        log.error("计划任务管理器执行异常！", ex);
                    }
                }
            }, 0, 1000 * 60 * 5);
            log.info("计划任务管理器启动成- 执行间隔: 5分钟");
        } catch (Exception e) {
            log.error("计划任务管理器启动失", e);
            throw new RuntimeException("计划任务管理器启动失", e);
        }
    }

    private void postTasks() {
        try {
            LinkedList<Integer> readyToRemovePlans = new LinkedList();
            LinkedList<ScheduleTask> readyToStartPlans = new LinkedList();

            synchronized (schedulePlans) {
                long now = System.currentTimeMillis();
                for (ScheduleTask scheduleTask : schedulePlans) {
                    try {
                        // TODO: 是否已经不再需要运行了？是否达到运行次数上"
                        // 是否需要运行？
                        // 距离最后一次运行的时间是否
                        int runCount = scheduleTask.getRunCount() == null ? 0 : scheduleTask.getRunCount();
                        int drivedCount = scheduleTask.getDriveCount() == null ? 0 : scheduleTask.getDriveCount();

                        if (scheduleTask.getLastDriveTime() == null ||
                                (scheduleTask.getLastDriveTime().getTime() + scheduleTask.getDaysInterval() * DAY < now)) {
                            if (runCount > 0 && drivedCount < runCount)
                                readyToStartPlans.add(scheduleTask);
                        }
                    } catch (Exception e) {
                        log.error("检查计划任务状态失- ID: {}", scheduleTask.getId(), e);
                    }
                }

                for (int i = readyToRemovePlans.size() - 1; i >= 0; i--) {
                    try {
                        schedulePlans.remove(readyToRemovePlans.get(i));
                    } catch (Exception e) {
                        log.error("移除计划任务失败 - 索引: {}", readyToRemovePlans.get(i), e);
                    }
                }
            }

            for (ScheduleTask scheduleTask : readyToStartPlans) {
                try {
                    start(scheduleTask);
                    log.info("计划任务已启- ID: {}", scheduleTask.getId());
                } catch (Exception e) {
                    log.error("启动计划任务失败 - ID: {}", scheduleTask.getId(), e);
                }
            }

            if (!readyToStartPlans.isEmpty()) {
                log.info("本次执行启动{} 个计划任", readyToStartPlans.size());
            }
        } catch (Exception e) {
            log.error("执行计划任务检查失", e);
        }
    }

    // 单例模式
    static ScheduleTaskManager instance = null;

    private ScheduleTaskManager() {
    }

    public static synchronized ScheduleTaskManager getInstance() {
        if (null == instance) instance = new ScheduleTaskManager();
        return instance;
    }
}


