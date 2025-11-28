package org.ssssssss.jtt808client.entity;

import lombok.Data;

import java.io.Serializable;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class Point implements Serializable {
    /**
     * 经度
     */
    private double longitude;

    /**
     * 纬度
     */
    private double latitude;

    /**
     * 到达时间
     */
    private long reportTime;

    /**
     * 速度
     */
    private float speed;

    /**
     * 方向
     */
    private int direction;

    /**
     * 报警状态位
     */
    private int warnFlags;

    private int mileages;

    /**
     * 车辆状态位
     */
    private int status;

    private boolean isStay;

    public Point() {
        this.mileages = 0;
    }

    public Point(double lng, double lat) {
        this.longitude = lng;
        this.latitude = lat;
        this.mileages = 0;
    }



}


