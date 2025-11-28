package org.ssssssss.jtt808client.entity;

import lombok.Data;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class TaskInfo {
    /**
     * 任务ID
     */
    private long id;
    /**
     * 路线ID
     */
    private long routeId;
    /**
     * 路线名称
     */
    private String routeName;
    /**
     * 路线里程数
     */
    private int routeMileages;
    /**
     * 轨迹点数
     */
    private int routePointCount;

    /**
     * 车牌号
     */
    private String vehicleNumber;
    /**
     * 设备序列号
     */
    private String deviceSn;
    /**
     * SIM卡号
     */
    private String simNumber;

    /**
     * 任务状态
     */
    private String state;
    /**
     * 开始时间
     */
    private long startTime;
    /**
     * 经度
     */
    private double longitude;
    /**
     * 纬度
     */
    private double latitude;
    /**
     * 上报时间
     */
    private long reportTime;
    /**
     * 方向角度 (0-360)
     */
    private int direction;
    /**
     * 状态标志位
     */
    private int stateFlags;
    /**
     * 报警标志位
     */
    private int warningFlags;

    public TaskInfo withSimNumber(String sim) {
        setSimNumber(sim);
        return this;
    }

    public TaskInfo withRoutePointCount(int routePointCount) {
        setRoutePointCount(routePointCount);
        return this;
    }

    public TaskInfo withLatitude(double lat) {
        setLatitude(lat);
        return this;
    }

    public TaskInfo withLongitude(double lng) {
        setLongitude(lng);
        return this;
    }

    public TaskInfo withStartTime(long stime) {
        setStartTime(stime);
        return this;
    }

    public TaskInfo withState(String state) {
        setState(state);
        return this;
    }

    public TaskInfo withDeviceSn(String sn) {
        setDeviceSn(sn);
        return this;
    }

    public TaskInfo withVehicleNumber(String vehicleNumber) {
        setVehicleNumber(vehicleNumber);
        return this;
    }

    public TaskInfo withRouteMileages(int routeMileages) {
        setRouteMileages(routeMileages);
        return this;
    }

    public TaskInfo withRouteName(String name) {
        setRouteName(name);
        return this;
    }

    public TaskInfo withRouteId(long routeId) {
        setRouteId(routeId);
        return this;
    }

    public TaskInfo withId(long id) {
        setId(id);
        return this;
    }

    public TaskInfo withReportTime(long time) {
        setReportTime(time);
        return this;
    }

    public TaskInfo withStateFlags(int flags) {
        setStateFlags(flags);
        return this;
    }

    public TaskInfo withWarningFlags(int flags) {
        setWarningFlags(flags);
        return this;
    }


}