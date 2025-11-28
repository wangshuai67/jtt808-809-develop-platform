package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.ssssssss.jtt808client.entity.Point;
import org.ssssssss.jtt808client.entity.TaskInfo;
import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.task.log.Log;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.service.RouteService;
import org.ssssssss.jtt808client.web.vo.Result;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.ssssssss.jtt808client.service.PositionCacheService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/monitor")
public class MapMonitorController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(MapMonitorController.class);

    @Autowired
    RouteService routeService;

    @Autowired
    PositionCacheService positionCacheService;

    @Value("${map.baidu.key}")
    String baiduMapKey;

    @RequestMapping("/view")
    public String view(@RequestParam Long id, Model model) {
        model.addAttribute("id", id);
        model.addAttribute("baiduMapKey", baiduMapKey);
        return "monitor";
    }

    // 获取所有车辆的最新位置（从Redis缓存）
    @RequestMapping("/positions/latest")
    @ResponseBody
    public Result getLatestPositions() {
        try {
            // 获取所有正在运行的任务
            List<TaskInfo> tasks = TaskManager.getInstance().find(1, 100).getList();

            // 从Redis获取每个任务的最新位置
            java.util.Map<Long, Point> positions = new java.util.HashMap<>();
            for (TaskInfo task : tasks) {
                Point point = positionCacheService.getLatestPositionByTaskId(task.getId());
                if (point != null) {
                    positions.put(task.getId(), point);
                }
            }

            logger.debug("获取所有车辆最新位置成功，车辆数量: {}", positions.size());
            return Result.success(positions);
        } catch (Exception e) {
            logger.error("获取所有车辆最新位置失败", e);
            return Result.error(500, "获取位置信息失败");
        }
    }

    // 基本信息
    @RequestMapping("/info")
    @ResponseBody
    public Result info(@RequestParam Long id) {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "任务ID不能为空且必须大于0");
        }

        TaskInfo info = TaskManager.getInstance().getById(id);
        if (info == null) {
            throw new BusinessException(404, "未找到指定的任务信息");
        }

        Route route = routeService.getById(info.getRouteId());
        if (route != null) {
            info.setRouteName(route.getName());
            info.setRouteMileages(route.getMileages());
        }

        logger.debug("获取任务信息成功，任务ID: {}", id);
        return Result.success(info);
    }

    // TODO: 轨迹

    // TODO: 当前位置
    @RequestMapping("/position")
    @ResponseBody
    public Result position(@RequestParam Long id, @RequestParam Long time) {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "任务ID不能为空且必须大于0");
        }

        if (time == null || time < 0) {
            throw new BusinessException(400, "时间参数不能为空且必须大于等于0");
        }

        // 优先从Redis缓存获取位置数据
        Point point = positionCacheService.getLatestPositionByTaskId(id);

        // 如果Redis中没有数据，再从任务管理器获取（兼容模式）
        if (point == null) {
            point = TaskManager.getInstance().getCurrentPositionById(id);
            logger.debug("从任务管理器获取位置信息，任务ID: {}", id);
        } else {
            logger.debug("从Redis缓存获取位置信息，任务ID: {}", id);
        }
        if (point != null && point.getReportTime() > time) {
            logger.debug("获取任务位置信息成功，任务ID: {}, 时间: {}", id, time);
            return Result.success(point);
        }

        logger.debug("未获取到新的位置信息，任务ID: {}, 时间: {}", id, time);
        return Result.success(null);
    }

    // TODO: 日志
    @RequestMapping("/logs")
    @ResponseBody
    public Result logs(@RequestParam Long id, @RequestParam(defaultValue = "0") Long timeAfter) {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "任务ID不能为空且必须大于0");
        }

        if (timeAfter == null || timeAfter < 0) {
            throw new BusinessException(400, "时间参数不能为空且必须大于等于0");
        }

        List<Log> logs = TaskManager.getInstance().getLogsById(id, timeAfter);

        logger.debug("获取任务日志成功，任务ID: {}, 时间: {}, 日志数量: {}", id, timeAfter, logs != null ? logs.size() : 0);
        return Result.success(logs);
    }

    // TODO：终止行驶
    @RequestMapping("/terminate")
    @ResponseBody
    public Result terminate(@RequestParam Long id) {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "任务ID不能为空且必须大于0");
        }

        TaskManager.getInstance().terminate(id);

        logger.info("任务终止成功，任务ID: {}", id);
        return Result.success("任务终止成功");
    }

    // TODO：状态设置
    @RequestMapping("/bit/set")
    @ResponseBody
    public Result setBit(@RequestParam Long id, @RequestParam String type, @RequestParam int bitIndex, @RequestParam Boolean on) {
        if (id == null || id <= 0) {
            throw new BusinessException(400, "任务ID不能为空且必须大于0");
        }

        if (type == null || type.trim().isEmpty()) {
            throw new BusinessException(400, "类型参数不能为空");
        }

        if (bitIndex < 0) {
            throw new BusinessException(400, "位索引必须大于等于0");
        }

        if (on == null) {
            throw new BusinessException(400, "开关状态不能为空");
        }

        if ("warning-flags".equals(type)) {
            TaskManager.getInstance().setWarningFlagById(id, bitIndex, on);
        } else if ("state-flags".equals(type)) {
            TaskManager.getInstance().setStateFlagById(id, bitIndex, on);
        } else {
            throw new BusinessException(400, "不支持的类型参数: " + type);
        }

        logger.info("设置状态位成功，任务ID: {}, 类型: {}, 位索引: {}, 状态: {}", id, type, bitIndex, on);
        return Result.success("状态设置成功");
    }
}


