package org.ssssssss.jtt808client.web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.ssssssss.jtt808client.jtt809.JT809TaskService;
import lombok.extern.slf4j.Slf4j;
import org.ssssssss.jtt808client.web.vo.Result;

@Controller
@RequestMapping("/809/task")
@Slf4j
public class JT809TaskController extends BaseController {
    @Autowired
    private JT809TaskService service;

    @RequestMapping("/run")
    @ResponseBody
    public Result run(@RequestParam Long gatewayId,
                      @RequestParam Long routeId,
                      @RequestParam(required = false) String plate,
                      @RequestParam(required = false) String plates,
                      @RequestParam(defaultValue = "1000") int intervalMs) {
        try {
            log.info("809任务请求 gatewayId={} routeId={} plate={} plates={} intervalMs={}", gatewayId, routeId, plate, plates, intervalMs);
            java.util.List<String> vs = new java.util.ArrayList<>();
            if (plates != null && !plates.trim().isEmpty()) {
                for (String p : plates.split(",")) {
                    p = p.trim();
                    if (!p.isEmpty()) vs.add(p);
                }
            }
            if (vs.isEmpty() && plate != null && !plate.trim().isEmpty()) {
                vs.add(plate.trim());
            }
            if (vs.isEmpty()) {
                return Result.error(400, "车辆不能为空");
            }
            if (vs.size() == 1) {
                long id = service.start(gatewayId, routeId, vs.get(0), intervalMs);
                log.info("809任务启动成功 id={} gatewayId={} routeId={} plate={}", id, gatewayId, routeId, vs.get(0));
                return Result.success(Result.values("taskId", id));
            } else {
                java.util.List<Long> ids = service.startBatch(gatewayId, routeId, vs, intervalMs);
                java.util.Map<String, Object> data = new java.util.HashMap<>();
                data.put("taskIds", ids);
                data.put("count", ids.size());
                log.info("809批量任务启动成功 count={} ids={}", ids.size(), ids);
                return Result.success(data);
            }
        } catch (Exception e) {
            log.error("809任务启动失败", e);
            return Result.error(400, e.getMessage());
        }
    }

    @RequestMapping("/terminate")
    @ResponseBody
    public Result terminate(@RequestParam Long id) {
        service.stop(id);
        log.info("809任务终止请求 id={}", id);
        return Result.success("已终止");
    }

    @RequestMapping("/list")
    @ResponseBody
    public Result list() {
        return Result.success(service.list());
    }

    @RequestMapping("/logs")
    @ResponseBody
    public Result logs(@RequestParam Long id,
                       @RequestParam(defaultValue = "0") long since) {
        return Result.success(service.getLogs(id, since));
    }

    @RequestMapping("/logs/clear")
    @ResponseBody
    public Result clear(@RequestParam Long id) {
        boolean ok = service.clearLogs(id);
        if (ok) return Result.success("已清空");
        return Result.error(400, "任务不存在");
    }
}