package org.ssssssss.jtt808client.entity;

import lombok.Getter;

import java.io.Serializable;
import java.util.LinkedList;

/**
 * 行驶计划
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Getter
public class DrivePlan implements Serializable {
    LinkedList<Point> routePoints;

    public DrivePlan setRoutePoints(LinkedList routePoints) {
        this.routePoints = routePoints;
        return this;
    }

    public Point getNextPoint() {
        if (routePoints.isEmpty()) return null;
        return routePoints.removeFirst();
    }
}


