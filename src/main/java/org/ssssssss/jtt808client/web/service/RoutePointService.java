package org.ssssssss.jtt808client.web.service;

import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.entity.RoutePoint;
import org.ssssssss.jtt808client.web.entity.RoutePointExample;
import org.ssssssss.jtt808client.web.mapper.RoutePointMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by houcheng when 2018/11/25.
 */
@Service
public class RoutePointService
{
    @Autowired
    RoutePointMapper pointMapper;

    public int save(Route route, List<RoutePoint> points)
    {
        removeByRouteId(route.getId());
        int r = 0;
        for (RoutePoint p : points)
        {
            r += pointMapper.insert(p);
        }
        return r;
    }

    public int batchSave(Route route, List<RoutePoint> points)
    {
        removeByRouteId(route.getId());
        if (points == null || points.isEmpty()) {
            return 0; // 如果没有路径点，直接返回0
        }
        return pointMapper.batchInsert(points);
    }

    public int removeByRouteId(Long routeId)
    {
        return pointMapper.deleteByExample(new RoutePointExample().createCriteria().andRouteIdEqualTo(routeId).example());
    }

    public List<RoutePoint> find(Long routeId)
    {
        return pointMapper.selectByExample(new RoutePointExample().createCriteria().andRouteIdEqualTo(routeId).example());
    }
}


