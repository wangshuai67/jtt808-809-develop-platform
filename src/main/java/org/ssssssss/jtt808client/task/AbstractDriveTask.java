package org.ssssssss.jtt808client.task;

import org.ssssssss.jtt808client.entity.DrivePlan;
import org.ssssssss.jtt808client.entity.Point;
import org.ssssssss.jtt808client.entity.TaskInfo;
import org.ssssssss.jtt808client.jtt808.JTT808Message;
import org.ssssssss.jtt808client.task.log.Log;
import org.ssssssss.jtt808client.task.log.LogType;
import org.ssssssss.jtt808client.task.runner.Executable;
import org.ssssssss.jtt808client.task.runner.RunnerManager;
import org.ssssssss.jtt808client.util.BeanUtils;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.service.RouteService;
import org.ssssssss.jtt808client.web.service.RoutePointService;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Created by matrixy when 2020/5/8.
 * 车辆行程任务
 * 注意：本类型里的方法全部由LoopRunner执行，不需要额外考虑线程安全问题
 * 此类型为抽象类型，对实际的消息与事件处理由子类型实现完"
 */
@Slf4j
public abstract class AbstractDriveTask implements Driveable
{
    // 行程ID
    private long id;

    private long routeId;

    // 运行模式：调试模式，压测模式
    private String mode;

    // 车辆当前状态：就绪、启动、停车、熄火"
    protected TaskState state;

    private DrivePlan drivePlan;

    private Point currentPosition;

    // 报警标志"
    private int warningFlags = 0;
    // 状态标志位，ACC开，已定位，已使用GPS定位
    private int stateFlags = (1 << 0) | (1 << 1) | (1 << 18);

    /** 日志信息：在调试模式时记录下"*/
    private ConcurrentLinkedQueue<Log> logs;

    /** 任务信息，用于显示在表格上的属性"*/
    TaskInfo info;

    /** 任务参数配置 */
    Map<String, String> parameters;

    public AbstractDriveTask(long id, long routeId)
    {
        log.info("创建驾驶任务 - ID: {}, 路线ID: {}", id, routeId);
        this.id = id;
        this.routeId = routeId;
        this.logs = new ConcurrentLinkedQueue<Log>();
    }

    public long getId()
    {
        return this.id;
    }

    public long getRouteId()
    {
        return this.routeId;
    }

    public final int getWarningFlags()
    {
        return this.warningFlags;
    }

    public final int getStateFlags()
    {
        return this.stateFlags;
    }

    public final void log(LogType type, String attachment)
    {
        // 只在DEBUG模式下才记录日志
        if ("debug".equals(mode) == false) return;
        this.logs.add(new Log(type, System.currentTimeMillis(), attachment));
    }

    /**
     * 获取timeAfter时间之后的所有日"
     * @param timeAfter
     * @return
     */
    public final List<Log> getLogs(long timeAfter)
    {
        Iterator<Log> itr = this.logs.iterator();
        List<Log> results = new LinkedList();

        // TODO: 想办法整一个双端链表，避免头部无意义的空转
        for (int i = 0; itr.hasNext(); i++)
        {
            Log item = itr.next();
            if (item.time <= timeAfter) continue;
            results.add(item);
        }
        
        // 调试日志 - 输出当前位置信息
        if (this.currentPosition != null) {
            log.debug("任务ID: {} - 当前位置: 经度={}, 纬度={}, 报告时间={}", 
                     this.id, 
                     this.currentPosition.getLongitude(), 
                     this.currentPosition.getLatitude(), 
                     this.currentPosition.getReportTime());
        } else {
            log.warn("任务ID: {} - 当前位置为空，无法设置位置信息", this.id);
        }
        return results;
    }

    public final void clearLogs()
    {
        this.logs.clear();
    }

    public void init(Map<String, String> settings, DrivePlan plan)
    {
        log.debug("初始化驾驶任- ID: {}", id);
        this.parameters = settings;
        this.drivePlan = plan;
        try
        {
            this.mode = settings.get("mode");
        }
        catch(Exception ex)
        {
            log.error("初始化驾驶任务失- ID: {}, 错误: {}", id, ex.getMessage(), ex);
        }
    }

    public final Point getNextPoint()
    {
        if (drivePlan == null) {
            log.warn("驾驶计划为空，无法获取下一个路线点 - 任务ID: {}", id);
            return null;
        }
        return drivePlan.getNextPoint();
    }

    public final Point getCurrentPosition()
    {
        log.debug("getCurrentPosition被调用 - 当前位置: 经度={}, 纬度={}", 
                 this.currentPosition != null ? this.currentPosition.getLongitude() : "null",
                 this.currentPosition != null ? this.currentPosition.getLatitude() : "null");
        return this.currentPosition;
    }

    protected final void setCurrentPosition(Point point)
    {
        log.debug("setCurrentPosition被调用 - 新位置: 经度={}, 纬度={}", 
                 point != null ? point.getLongitude() : "null",
                 point != null ? point.getLatitude() : "null");
        this.currentPosition = point;
    }

    public final void executeAfter(Executable executable, int milliseconds) {
        RunnerManager.getInstance().execute(this, executable, milliseconds);
    }

    public final void execute(Executable executable) {
        RunnerManager.getInstance().execute(this, executable);
    }

    public final void executeConstantly(Executable executable, int interval) {
        RunnerManager.getInstance().execute(this, executable, 0, interval);
    }

    public String getParameter(String name)
    {
        return this.parameters.get(name);
    }

    public TaskState getState()
    {
        return this.state;
    }

    @Override
    public void terminate()
    {
        this.state = TaskState.terminated;
        log.info("终止驾驶任务 - ID: {}", id);
    }

    public TaskInfo getInfo()
    {
        if (this.info == null)
        {
            this.info = new TaskInfo();
            // 设置基本属"
            this.info.setId(this.id);
            this.info.setRouteId(this.routeId);
            this.info.setState(this.state != null ? this.state.toString() : "unknown");
            this.info.setStateFlags(this.stateFlags);
            this.info.setWarningFlags(this.warningFlags);
            
            // 设置当前位置信息
            if (this.currentPosition != null) {
                this.info.setLongitude(this.currentPosition.getLongitude());
                this.info.setLatitude(this.currentPosition.getLatitude());
                this.info.setReportTime(this.currentPosition.getReportTime());
                this.info.setDirection(this.currentPosition.getDirection());
            }
            
            // 从参数中获取设备信息
            if (this.parameters != null) {
                String vehicleNumber = this.parameters.get("vehicle.number");
                if (vehicleNumber != null) {
                    this.info.setVehicleNumber(vehicleNumber);
                }
                
                String deviceSn = this.parameters.get("device.sn");
                if (deviceSn != null) {
                    this.info.setDeviceSn(deviceSn);
                }
                
                String simNumber = this.parameters.get("device.sim");
                if (simNumber != null) {
                    this.info.setSimNumber(simNumber);
                }
            }
        }
        
        // 获取线路信息
        try {
            RouteService routeService = BeanUtils.create(RouteService.class);
            Route route = routeService.getById(this.routeId);
            if (route != null) {
                this.info.setRouteName(route.getName());
                // 获取轨迹点数
                RoutePointService pointService = BeanUtils.create(RoutePointService.class);
                java.util.List points = pointService.find(this.routeId);
                this.info.setRoutePointCount(points != null ? points.size() : 0);
                BeanUtils.destroy(pointService);
            }
            BeanUtils.destroy(routeService);
        } catch (Exception e) {
            log.warn("获取线路信息失败 - 路线ID: {}", this.routeId, e);
        }
        
        // 调试日志：检查位置信息
        if (this.info != null) {
            log.debug("TaskInfo位置信息 - 任务ID: {}, 经度: {}, 纬度: {}, 报告时间: {}", 
                     this.info.getId(), 
                     this.info.getLongitude(), 
                     this.info.getLatitude(), 
                     this.info.getReportTime());
        }
        
        return this.info;
    }

    /**
     * 设置状态标志位
     * @param index 标志位索"
     * @param on 是否开"
     */
    public void setStateFlag(int index, boolean on)
    {
        try {
            if (index < 0 || index > 31) return;
            int mask = (1 << index);
            if (on) this.stateFlags = (this.stateFlags | mask);
            else this.stateFlags = (this.stateFlags & (~mask));
        } catch (Exception e) {
            log.warn("设置状态标志位失败 - 索引: {}, {}", index, on, e);
        }
    }

    /**
     * 设置报警标志"
     * @param index 标志位索"
     * @param on 是否开"
     */
    public void setWarningFlag(int index, boolean on)
    {
        try {
            if (index < 0 || index > 31) return;
            int mask = (1 << index);
            if (on) this.warningFlags = (this.warningFlags | mask);
            else this.warningFlags = (this.warningFlags & (~mask));
        } catch (Exception e) {
            log.warn("设置报警标志位失败 - 索引: {}, {}", index, on, e);
        }
    }

    public abstract void send(JTT808Message msg);
}


