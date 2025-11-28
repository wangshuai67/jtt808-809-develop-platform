package org.ssssssss.jtt808client.entity;

import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class XRoute {

    private Long id;

    /**
     * 轨迹节列"
     */
    private List<Position> positionList;

    /**
     * 问题路段
     */
    private List<XTroubleSegment> troubleSegmentList = new ArrayList();

    /**
     * 停留"
     */
    private LinkedList<XStayPoint> vehicleStayPointList = new LinkedList();

    /**
     * 时速下"
     */
    private Integer minSpeed;

    /**
     * 时速上"
     */
    private Integer maxSpeed;

    private String fingerPrint;


    public XRoute setFingerPrint(String fingerPrint) {
        this.fingerPrint = fingerPrint;
        return this;
    }

    public XRoute() {

    }

    public XRoute setId(Long id) {
        this.id = id;
        return this;
    }

    public XRoute setMinSpeed(Integer minSpeed) {
        this.minSpeed = minSpeed;
        return this;
    }

    public XRoute setMaxSpeed(Integer maxSpeed) {
        this.maxSpeed = maxSpeed;
        return this;
    }

    public XRoute(Long routeId) {
        this.id = routeId;
    }


    public XRoute withPositionList(List<Position> positionList) {
        this.setPositionList(positionList);
        return this;
    }


    public XRoute withTroubleSegmentList(List<XTroubleSegment> troubleSegmentList) {
        this.setTroubleSegmentList(troubleSegmentList);
        return this;
    }

    public List<XStayPoint> getVehicleStayPointList() {
        return vehicleStayPointList;
    }

    public XRoute withVehicleStayPointList(LinkedList<XStayPoint> vehicleStayPointList) {
        this.setVehicleStayPointList(vehicleStayPointList);
        return this;
    }
}


