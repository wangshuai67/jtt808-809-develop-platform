package org.ssssssss.jtt808client.task;

import org.ssssssss.jtt808client.entity.DrivePlan;
import org.ssssssss.jtt808client.entity.Point;
import org.ssssssss.jtt808client.entity.TaskInfo;
import org.ssssssss.jtt808client.manager.RouteManager;
import org.ssssssss.jtt808client.task.log.Log;
import org.ssssssss.jtt808client.task.runner.Executable;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.util.BeanUtils;
import org.ssssssss.jtt808client.web.entity.ScheduleTask;
import org.ssssssss.jtt808client.web.service.ScheduleTaskService;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 行程任务管理"
 */
@Slf4j
public final class TaskManager
{
    Object lock;
    // TODO: map的value是无序的，不好做分页，得想个办法
    ConcurrentHashMap<Long, AbstractDriveTask> tasks;
    AtomicLong sequence;
    AtomicLong index;

    static final Comparator<AbstractDriveTask> SORT_COMPARATOR = new Comparator<AbstractDriveTask>()
    {
        @Override
        public int compare(AbstractDriveTask o1, AbstractDriveTask o2)
        {
            long x = o1.getId() - o2.getId();
            if (x > 0) return 1;
            else if (x == 0) return 0;
            else return -1;
        }
    };

    private TaskManager()
    {
        this.lock = new Object();
        this.tasks = new ConcurrentHashMap<Long, AbstractDriveTask>();

        this.index = new AtomicLong(0L);
        this.sequence = new AtomicLong(0L);
    }

    /**
     * 按给定的参数集，开启任"
     * @param params
     * @param routeId
     */
    public long run(Map params, Long routeId)
    {
        try {
            log.info("准备启动任务 - 路线ID: {}, 参数: {}", routeId, params);
            // TODO: 需要检查一下是不是有冲突（终端ID及SIM卡号不能重复"
            DrivePlan plan = RouteManager.getInstance().generate(routeId, new Date(), 5);
            if (plan == null) {
                throw new RuntimeException("无法生成路线计划，路线ID: " + routeId);
            }
            log.debug("已生成路线计划: {}", plan);

            AbstractDriveTask task = new SimpleDriveTask(this.sequence.addAndGet(1L), routeId);
            task.init(params, plan);
            log.debug("任务已初始化 - 任务ID: {}, SIM: {}, 终端ID: {}", task.getId(), params.get("device.sim"), params.get("device.sn"));
            task.startup();
            log.info("任务已启动 - 任务ID: {}", task.getId());

            tasks.put(task.getId(), task);
            log.info("任务已启动：{}", task.getInfo().toString());

            try {
                ScheduleTaskService scheduleTaskService = BeanUtils.create(ScheduleTaskService.class);
                ScheduleTask scheduleTask = new ScheduleTask();
                scheduleTask.setTaskId(task.getId());
                scheduleTask.setRouteId(routeId);
                scheduleTask.setVehicleName(String.valueOf(params.getOrDefault("vehicleNumber", "")));
                scheduleTask.setDriverName("");
                scheduleTask.setRunCount(0);
                scheduleTask.setLastDriveTime(new Date());
                scheduleTaskService.create(scheduleTask);
                log.debug("任务已持久化到调度表 - taskId={}, routeId={}", scheduleTask.getTaskId(), scheduleTask.getRouteId());
            } catch (Throwable t) {
                log.warn("持久化任务到调度表失败: {}", t.getMessage());
            }
            return task.getId();
        } catch (Exception e) {
            log.error("启动任务失败 - 路线ID: {}, 参数: {}", routeId, params, e);
            throw new RuntimeException("启动任务失败: " + e.getMessage(), e);
        }
    }

    public long nextIndex()
    {
        return this.index.addAndGet(1L);
    }

    // 分页查找，用于列表显示运行中的行程任务状"
    public PageVO<TaskInfo> find(int pageIndex, int pageSize)
    {
        try {
            AbstractDriveTask[] list = tasks.values().toArray(new AbstractDriveTask[0]);
            Arrays.sort(list, SORT_COMPARATOR);
            List<TaskInfo> results = new ArrayList<TaskInfo>(pageSize);
            for (int k = 0, i = Math.max((pageIndex - 1) * pageSize, 0); k < pageSize && i < list.length; i++, k++)
            {
                results.add(list[i].getInfo());
            }
            PageVO<TaskInfo> page = new PageVO(pageIndex, pageSize);
            page.setList(results);
            page.setRecordCount(list.length);
            return page;
        } catch (Exception e) {
            log.error("查询任务列表失败 - 页码: {}, 页大{}", pageIndex, pageSize, e);
            // 返回空页面而不是抛出异"
            PageVO<TaskInfo> emptyPage = new PageVO(pageIndex, pageSize);
            emptyPage.setList(new ArrayList<>());
            emptyPage.setRecordCount(0);
            return emptyPage;
        }
    }

    // 获取timeAfter时间之后的任务日"
    public List<Log> getLogsById(Long id, long timeAfter)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task != null) return task.getLogs(timeAfter);
            else {
                log.warn("获取日志失败 - 任务不存{}", id);
                return null;
            }
        } catch (Exception e) {
            log.error("获取任务日志失败 - 任务ID: {}, 时间: {}", id, timeAfter, e);
            return null;
        }
    }

    public boolean clearLogsById(Long id)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task != null) {
                task.clearLogs();
                return true;
            } else {
                log.warn("清空日志失败 - 任务不存在: {}", id);
                return false;
            }
        } catch (Exception e) {
            log.error("清空任务日志失败 - 任务ID: {}", id, e);
            return false;
        }
    }

    public TaskInfo getById(Long id)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task == null) {
                log.warn("获取任务信息失败 - 任务不存{}", id);
                return null;
            }
            return task.getInfo();
        } catch (Exception e) {
            log.error("获取任务信息失败 - 任务ID: {}", id, e);
            return null;
        }
    }

    public Point getCurrentPositionById(Long id)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task != null) return task.getCurrentPosition();
            else {
                log.warn("获取当前位置失败 - 任务不存{}", id);
                return null;
            }
        } catch (Exception e) {
            log.error("获取当前位置失败 - 任务ID: {}", id, e);
            return null;
        }
    }

    // 修改状态标志位
    public void setStateFlagById(Long id, int index, boolean on)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task != null) {
                task.setStateFlag(index, on);
                log.debug("状态标志位已更- 任务ID: {}, 索引: {}, {}", id, index, on);
            } else {
                log.warn("设置状态标志位失败 - 任务不存{}", id);
            }
        } catch (Exception e) {
            log.error("设置状态标志位失败 - 任务ID: {}, 索引: {}, {}", id, index, on, e);
        }
    }

    // 修改报警状态标志位
    public void setWarningFlagById(Long id, int index, boolean on)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task != null) {
                task.setWarningFlag(index, on);
                log.debug("报警标志位已更新 - 任务ID: {}, 索引: {}, {}", id, index, on);
            } else {
                log.warn("设置报警标志位失- 任务不存{}", id);
            }
        } catch (Exception e) {
            log.error("设置报警标志位失- 任务ID: {}, 索引: {}, {}", id, index, on, e);
        }
    }

    // 任务终止
    // TODO: 什么时候把任务从map里删除掉好呢"
    public void terminate(Long id)
    {
        try {
            AbstractDriveTask task = tasks.get(id);
            if (task == null) {
                log.warn("终止任务失败 - 任务不存在或已终{}", id);
                throw new RuntimeException("无此任务或任务已终止");
            }
            
            task.execute(new Executable()
            {
                @Override
                public void execute(AbstractDriveTask driveTask)
                {
                    try {
                        driveTask.terminate();
                        log.info("任务已终- 任务ID: {}", id);
                        try {
                            tasks.remove(id);
                            log.debug("已从任务列表移除 - 任务ID:{}", id);
                        } catch (Exception e) {
                            log.warn("从任务列表移除失败 - 任务ID:{}", id, e);
                        }
                        try {
                            ScheduleTaskService scheduleTaskService = BeanUtils.create(ScheduleTaskService.class);
                            ScheduleTask scheduleTask = scheduleTaskService.getByTaskId(id);
                            if (scheduleTask != null) {
                                scheduleTask.setLastDriveTime(new Date());
                                Integer rc = scheduleTask.getRunCount();
                                scheduleTask.setRunCount(rc == null ? 1 : rc + 1);
                                scheduleTaskService.update(scheduleTask);
                                log.debug("已更新调度表运行次数, taskId={}, runCount={}", id, scheduleTask.getRunCount());
                            }
                        } catch (Throwable t) {
                            log.warn("更新任务调度表失败: {}", t.getMessage());
                        }
                    } catch (Exception e) {
                        log.error("终止任务执行失败 - 任务ID: {}", id, e);
                        throw new RuntimeException("终止任务执行失败: " + e.getMessage(), e);
                    }
                }
            });
        } catch (RuntimeException e) {
            // 重新抛出运行时异"
            throw e;
        } catch (Exception e) {
            log.error("终止任务失败 - 任务ID: {}", id, e);
            throw new RuntimeException("终止任务失败: " + e.getMessage(), e);
        }
    }

    /**
     * 清理已终止的任务
     * @return 清理的任务数"
     */
    public int cleanupTerminatedTasks() {
        int cleanedCount = 0;
        try {
            Iterator<Map.Entry<Long, AbstractDriveTask>> iterator = tasks.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry<Long, AbstractDriveTask> entry = iterator.next();
                AbstractDriveTask task = entry.getValue();
                if (task.getState() != null && task.getState().toString().equals("terminated")) {
                    iterator.remove();
                    cleanedCount++;
                    log.debug("已清理终止任- 任务ID: {}", entry.getKey());
                }
            }
            if (cleanedCount > 0) {
                log.info("清理已终止任务完- 清理数量: {}, 剩余任务{}", cleanedCount, tasks.size());
            }
        } catch (Exception e) {
            log.error("清理已终止任务失", e);
        }
        return cleanedCount;
    }

    static final TaskManager instance = new TaskManager();
    public static void init()
    {
        // ...
    }
    public static TaskManager getInstance()
    {
        return instance;
    }
}


