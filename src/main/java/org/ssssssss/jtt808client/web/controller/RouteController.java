package org.ssssssss.jtt808client.web.controller;

import org.ssssssss.jtt808client.manager.RouteManager;
import org.ssssssss.jtt808client.util.MD5;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.entity.RoutePoint;
import org.ssssssss.jtt808client.web.entity.StayPoint;
import org.ssssssss.jtt808client.web.entity.TroubleSegment;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.RoutePointService;
import org.ssssssss.jtt808client.web.service.RouteService;
import org.ssssssss.jtt808client.web.service.StayPointService;
import org.ssssssss.jtt808client.web.service.TroubleSegmentService;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.web.vo.Result;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by houcheng when 2018/11/25.
 * 线路控制"
 */
@Controller
@RequestMapping("/route")
public class RouteController extends BaseController
{
    private static final Logger logger = LoggerFactory.getLogger(RouteController.class);

    @Autowired
    RouteService routeService;

    @Autowired
    private RoutePointService routePointService;

    @Autowired
    private StayPointService stayPointService;

    @Autowired
    private TroubleSegmentService troubleSegmentService;

    @Value("${map.baidu.key}")
    String baiduMapKey;



    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "1") int pageIndex, @RequestParam(defaultValue = "20") int pageSize)
    {
        if (pageIndex <= 0) {
            throw new BusinessException(400, "页码必须大于0");
        }
        if (pageSize <= 0 || pageSize > 100) {
            throw new BusinessException(400, "每页大小必须在1-100之间");
        }
        
        PageVO<Route> routes = routeService.find(null, pageIndex, pageSize);
        PageVO<Map<String, Object>> page = new PageVO<>(routes.getPageIndex(), routes.getPageSize());
        page.setRecordCount(routes.getRecordCount());
        java.util.List<Map<String, Object>> list = new java.util.ArrayList<>();
        for (Route r : routes.getList()) {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", r.getId());
            m.put("name", r.getName());
            m.put("minSpeed", r.getMinSpeed());
            m.put("maxSpeed", r.getMaxSpeed());
            m.put("mileages", r.getMileages());
            m.put("kilometers", r.getKilometers());
            m.put("fingerPrint", r.getFingerPrint());
            m.put("type", r.getType());

            // 追加统计字段
            java.util.List<RoutePoint> pts = routePointService.find(r.getId());
                m.put("pointCount", pts == null ? 0 : pts.size());
                m.put("distance", r.getMileages());
                m.put("status", "active");
                m.put("createTime", r.getCreateTime());
                m.put("startName", r.getStartName());
                m.put("endName", r.getEndName());
            list.add(m);
        }
        page.setList(list);
        return Result.success(page);
    }

    @RequestMapping("/stats")
    @ResponseBody
    public Result stats(@RequestParam String ids)
    {
        if (ids == null || ids.trim().isEmpty()) return Result.success(java.util.Collections.emptyList());
        String[] parts = ids.split(",");
        java.util.List<java.util.Map<String, Object>> out = new java.util.ArrayList<>(parts.length);
        for (String p : parts) {
            try {
                long id = Long.parseLong(p.trim());
                Route route = routeService.getById(id);
                if (route == null) continue;
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", id);
                m.put("distance", route.getMileages());
                java.util.List<RoutePoint> pts = routePointService.find(id);
                m.put("pointCount", pts == null ? 0 : pts.size());
                m.put("startName", route.getStartName());
                m.put("endName", route.getEndName());
                m.put("status", "active");
                m.put("createTime", route.getCreateTime());
                out.add(m);
            } catch (Exception ignore) {}
        }
        return Result.success(out);
    }

    @RequestMapping("/detail")
    @ResponseBody
    public Result detail(@RequestParam Long id) {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "线路ID不能为空且必须大于0");
        }
        Route r = routeService.getById(id);
        if (r == null) {
            throw new BusinessException(404, "线路不存在");
        }
        java.util.Map<String, Object> m = new java.util.HashMap<>();
        m.put("id", r.getId());
        m.put("name", r.getName());
        m.put("minSpeed", r.getMinSpeed());
        m.put("maxSpeed", r.getMaxSpeed());
        m.put("mileages", r.getMileages());
        m.put("kilometers", r.getKilometers());
        m.put("fingerPrint", r.getFingerPrint());
        m.put("type", r.getType());
        java.util.List<RoutePoint> pts = routePointService.find(r.getId());
        m.put("pointCount", pts == null ? 0 : pts.size());
        m.put("distance", r.getMileages());
        m.put("status", "active");
        m.put("createTime", r.getCreateTime());
        m.put("startName", r.getStartName());
        m.put("endName", r.getEndName());
        return Result.success(m);
    }

    @RequestMapping("/config")
    @ResponseBody
    public Result getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("baiduMapKey", baiduMapKey);
        return Result.success(config);
    }

    /**
     * 保存线路信息"轨迹点、停留点、问题路"
     *
     * @param name
     * @param minSpeed
     * @param maxSpeed
     * @param mileages
     * @param pointsJsonText
     * @param stayPointsJsonText
     * @param segmentsJsonText
     * @return
     */
    @RequestMapping("/save")
    @ResponseBody
    public Result save(@RequestParam String name,
                       @RequestParam Integer minSpeed,
                       @RequestParam Integer maxSpeed,
                       @RequestParam Integer mileages,
                       @RequestParam String pointsJsonText,
                       @RequestParam String stayPointsJsonText,
                       @RequestParam String segmentsJsonText,
                       @RequestParam(defaultValue = "normal") String type,
                       @RequestParam(required = false) String startName,
                       @RequestParam(required = false) String endName)
    {
        // 参数校验
        if (StringUtils.isEmpty(name)) {
            throw new BusinessException(400, "线路名称不能为空");
        }
        if (minSpeed == null || minSpeed < 0) {
            throw new BusinessException(400, "最低时速不能为空且必须大于等于0");
        }
        if (maxSpeed == null || maxSpeed <= minSpeed) {
            throw new BusinessException(400, "最高时速不能为空且必须大于最低时速");
        }
        if (mileages == null || mileages <= 0) {
            throw new BusinessException(400, "预估里程不能为空且必须大于0");
        }

        // 根据线路ID获取信息
        Route route = new Route();
        route.setName(name);
        route.setMinSpeed(minSpeed);
        route.setMaxSpeed(maxSpeed);
        route.setMileages(mileages);
        route.setType(type);
        if (!StringUtils.isEmpty(startName)) {
            route.setStartName(startName);
        }
        if (!StringUtils.isEmpty(endName)) {
            route.setEndName(endName);
        }
        route.setCreateTime(new java.util.Date());
        route.setUpdateTime(new java.util.Date());

        StringBuilder signature = new StringBuilder(4096 * 10);
        signature.append(String.valueOf(minSpeed));
        signature.append(String.valueOf(maxSpeed));
        signature.append(String.valueOf(mileages));
        signature.append(pointsJsonText);
        signature.append(stayPointsJsonText);
        signature.append(segmentsJsonText);
        String fingerPrint = MD5.encode(signature.toString());
        route.setFingerPrint(fingerPrint);

        routeService.create(route);

        long id = route.getId();

        // 添加原轨迹点
        List<RoutePoint> points = null;
        if (!StringUtils.isEmpty(pointsJsonText))
        {
            points = new Gson().fromJson(pointsJsonText, new TypeToken<List<RoutePoint>>()
            {
            }.getType());
        }
        if (points != null)
        {
            for (RoutePoint point : points)
            {
                point.setLatitude(point.getLat());
                point.setLongitude(point.getLng());
                point.setRouteId(id);
            }
            routePointService.batchSave(route, points);
        }

        // 添加停留点
        List<StayPoint> stayPoints = null;
        if (!StringUtils.isEmpty(stayPointsJsonText))
        {
            stayPoints = new Gson().fromJson(stayPointsJsonText, new TypeToken<List<StayPoint>>()
            {
            }.getType());
        }
        if (stayPoints != null)
        {
            for (StayPoint stayPoint : stayPoints)
            {
                stayPoint.setId(null);
                stayPoint.setRouteid(id);
            }
            stayPointService.save(route, stayPoints);
        }

        // 添加问题路段
        List<TroubleSegment> troubleSegments = null;
        if (!StringUtils.isEmpty(segmentsJsonText))
        {
            troubleSegments = new Gson().fromJson(segmentsJsonText, new TypeToken<List<TroubleSegment>>()
            {
            }.getType());
        }
        if (troubleSegments != null)
        {
            for (TroubleSegment segment : troubleSegments)
            {
                segment.setId(null);
                segment.setRouteId(id);
            }
            troubleSegmentService.save(route, troubleSegments);
        }

        // 更新内存中的线路缓存
        RouteManager.getInstance().load(route);
        
        logger.info("线路创建成功，ID: {}, 名称: {}", id, name);
        return Result.success("线路创建成功");
    }

    @RequestMapping("/remove")
    @ResponseBody
    public Result remove(@RequestParam Long id)
    {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "线路ID不能为空且必须大于0");
        }

        // 删除线路
        routeService.removeById(id);
        // 删除线路点
        routePointService.removeByRouteId(id);
        // 删除停留点
        stayPointService.removeByRouteId(id);
        // 删除问题路段
        troubleSegmentService.removeByRouteId(id);
        
        logger.info("线路删除成功，ID: {}", id);
        return Result.success("线路删除成功");
    }
}


