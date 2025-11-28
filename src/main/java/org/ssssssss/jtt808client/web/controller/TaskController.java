package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.ssssssss.jtt808client.entity.TaskInfo;
import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.task.log.Log;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.RouteService;
import org.ssssssss.jtt808client.web.vo.Result;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.ssssssss.jtt808client.util.BeanUtils;
import org.ssssssss.jtt808client.web.entity.ScheduleTask;
import org.ssssssss.jtt808client.web.service.ScheduleTaskService;
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
 * 任务控制器
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Controller
@RequestMapping("/task")
public class TaskController extends BaseController
{
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);
    
    @Autowired
    RouteService routeService;

    @Value("${vehicle-server.addr}")
    String vehicleServerAddr;

    @Value("${vehicle-server.port}")
    String  vehicleServerPort;

    @Value("${map.baidu.key}")
    String baiduMapAk;

    @RequestMapping("/routes")
    @ResponseBody
    public Result getRoutes() {
        List<Route> routes = routeService.list();
        return Result.success(routes);
    }

    @RequestMapping("/config")
    @ResponseBody
    public Result getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("vehicleServerAddr", vehicleServerAddr);
        config.put("vehicleServerPort", vehicleServerPort);
        config.put("baiduMapAk", baiduMapAk);
        try {
            org.ssssssss.jtt808client.web.service.SystemConfigService sc = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.web.service.SystemConfigService.class);
            String threads = sc.getValue("pressure.thread.count", String.valueOf(org.ssssssss.jtt808client.task.runner.RunnerManager.getThreadCount()));
            config.put("pressureThreadCount", threads);
        } catch (Throwable ignore) {}
        return Result.success(config);
    }

    @RequestMapping("/run")
    @ResponseBody
    public Result run(@RequestParam Long routeId,
                      @RequestParam(required = false) String vehicleNumber,
                      @RequestParam(required = false) String deviceSn,
                      @RequestParam(required = false) String simNumber,
                      @RequestParam(required = false) String mileages,
                      @RequestParam(required = false) String serverAddress,
                      @RequestParam(required = false) String serverPort)
    {
        // 参数校验
        if (routeId == null || routeId <= 0) {
            throw new BusinessException(400, "线路ID不能为空且必须大于0");
        }
        
        if (StringUtils.isEmpty(vehicleNumber) || !vehicleNumber.matches("^[\u4e00-\u9fa5]\\w{6,7}$")) {
            throw new BusinessException(400, "请填写正确的车牌号");
        }

        if (StringUtils.isEmpty(deviceSn) || !deviceSn.matches("^\\w{7,30}$")) {
            throw new BusinessException(400, "请填写正确的终端ID");
        }

        if (StringUtils.isEmpty(simNumber) || !simNumber.matches("^\\d{11,12}$")) {
            throw new BusinessException(400, "请填写正确的SIM卡号");
        }

        if (StringUtils.isEmpty(serverPort) || !serverPort.matches("^\\d{1,5}$")) {
            throw new BusinessException(400, "请填写正确的服务器端口");
        }

        if (simNumber.length() < 12) {
            simNumber = ("0000000000000" + simNumber).replaceAll("^0+(\\d{12})$", "$1");
        }

        int kilometers = 0;
        if (!StringUtils.isEmpty(mileages)) {
            if (mileages.matches("^\\d+$")) {
                kilometers = Integer.parseInt(mileages);
            } else {
                throw new BusinessException(400, "请填写正确的初始里程数，必须为整数，如：100表示100公里。");
            }
        }
        final int km = kilometers <= 0 ? 0 : kilometers;
        final String sim = simNumber;

        Map<String, String> params = new HashMap<String, String>() {
            {
                put("vehicle.number", vehicleNumber);
                put("device.sn", deviceSn);
                put("device.sim", sim);
                put("server.address", serverAddress);
                put("server.port", serverPort);
                put("mode", "debug");
                put("mileages", String.valueOf(km));
            }
        };

        logger.info("收到启动任务请求 - 路线ID:{}, 服务器:{}:{}, 车牌:{}, 终端:{}, SIM:{}", routeId, serverAddress, serverPort, vehicleNumber, deviceSn, sim);
        Long taskId = TaskManager.getInstance().run(params, routeId);
        
        // 返回任务ID给前端
        Map<String, Object> data = new HashMap<>();
        data.put("taskId", taskId);
        
        logger.info("任务启动成功 - 任务ID:{}, 路线ID:{}, 车牌:{}", taskId, routeId, vehicleNumber);
        return Result.success("任务启动成功", data);
    }

    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "1") int pageIndex,
                       @RequestParam(defaultValue = "20") int pageSize) {
        PageVO<TaskInfo> page = TaskManager.getInstance().find(pageIndex, pageSize);
        return Result.success(page);
    }

    @RequestMapping("/terminate")
    @ResponseBody
    public Result terminate(@RequestParam Long id) {
        TaskManager.getInstance().terminate(id);
        return Result.success("任务终止成功");
    }

    @RequestMapping("/terminateBatch")
    @ResponseBody
    public Result terminateBatch(@RequestParam String ids) {
        if (ids == null || ids.trim().isEmpty()) {
            throw new BusinessException(400, "ID不能为空");
        }
        String[] parts = ids.split(",");
        int count = 0;
        for (String p : parts) {
            try {
                long id = Long.parseLong(p.trim());
                TaskManager.getInstance().terminate(id);
                count++;
            } catch (Exception ignore) {}
        }
        Map<String, Object> data = new HashMap<>();
        data.put("terminated", count);
        return Result.success("批量终止成功", data);
    }

    @RequestMapping("/logs")
    @ResponseBody
    public Result logs(@RequestParam Long id,
                       @RequestParam(defaultValue = "0") long since) {
        java.util.List<Log> logs = TaskManager.getInstance().getLogsById(id, since);
        if (logs == null) logs = java.util.Collections.emptyList();
        return Result.success(logs);
    }

    @RequestMapping("/logs/clear")
    @ResponseBody
    public Result clearLogs(@RequestParam Long id) {
        boolean ok = TaskManager.getInstance().clearLogsById(id);
        if (ok) return Result.success("已清空");
        else return Result.error(400, "清空失败，任务不存在");
    }

    @RequestMapping("/history")
    @ResponseBody
    public Result history(@RequestParam(defaultValue = "1") int pageIndex,
                          @RequestParam(defaultValue = "20") int pageSize) {
        ScheduleTaskService scheduleTaskService = BeanUtils.create(ScheduleTaskService.class);
        PageVO<ScheduleTask> page = scheduleTaskService.find(null, null, null, pageIndex, pageSize);
        return Result.success(page);
    }
}


