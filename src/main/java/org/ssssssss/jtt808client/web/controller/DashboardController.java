package org.ssssssss.jtt808client.web.controller;

import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.task.net.ConnectionPool;
import org.ssssssss.jtt808client.task.runner.RunnerManager;
import org.ssssssss.jtt808client.web.entity.Vehicle;
import org.ssssssss.jtt808client.web.service.GatewayService;
import org.ssssssss.jtt808client.web.service.VehicleService;
import org.ssssssss.jtt808client.web.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

/**
 * 仪表盘
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController extends BaseController {
    @Autowired
    private VehicleService vehicleService;
    @Autowired
    private GatewayService gatewayService;

    @RequestMapping("/summary")
    @ResponseBody
    public Result summary() {
        List<Vehicle> allVehicles = vehicleService.list();
        int enabledVehicles = 0;
        int disabledVehicles = 0;
        for (Vehicle v : allVehicles) {
            Integer st = v.getStatus();
            if (st != null && st == 1) enabledVehicles++; else disabledVehicles++;
        }
        int gatewaysActive = 0;
        try {
            List<org.ssssssss.jtt808client.web.entity.Gateway> gws = gatewayService.list();
            for (org.ssssssss.jtt808client.web.entity.Gateway g : gws) {
                Integer st = g.getStatus();
                if (st != null && st == 1) gatewaysActive++;
            }
        } catch (Throwable ignore) {}
        org.ssssssss.jtt808client.web.vo.PageVO<org.ssssssss.jtt808client.entity.TaskInfo> page = TaskManager.getInstance().find(1, 1);
        int runningTasks = (int) page.getRecordCount();
        List<ConnectionPool.ConnectionInfo> conns = ConnectionPool.getInstance().listConnections();
        long messages = 0L;
        for (ConnectionPool.ConnectionInfo ci : conns) messages += ci.messageCount;
        Map<String, Object> out = new HashMap<>();
        out.put("onlineVehicles", enabledVehicles);
        out.put("activeGateways", gatewaysActive);
        out.put("runningTasks", runningTasks);
        out.put("messagesTotal", messages);
        out.put("activeConnections", ConnectionPool.getInstance().activeConnections());
        return Result.success(out);
    }

    @RequestMapping("/messages/current")
    @ResponseBody
    public Result messagesCurrent() {
        List<ConnectionPool.ConnectionInfo> conns = ConnectionPool.getInstance().listConnections();
        long messages = 0L;
        long lastActive = 0L;
        for (ConnectionPool.ConnectionInfo ci : conns) {
            messages += ci.messageCount;
            if (ci.lastActiveTime > lastActive) lastActive = ci.lastActiveTime;
        }
        Map<String, Object> out = new HashMap<>();
        out.put("timestamp", System.currentTimeMillis());
        out.put("messagesTotal", messages);
        out.put("activeConnections", ConnectionPool.getInstance().activeConnections());
        out.put("lastActiveTime", lastActive);
        return Result.success(out);
    }

    @RequestMapping("/vehicleStatus")
    @ResponseBody
    public Result vehicleStatus() {
        List<Vehicle> vs = vehicleService.list();
        int enabled = 0;
        int disabled = 0;
        for (Vehicle v : vs) {
            Integer st = v.getStatus();
            if (st != null && st == 1) enabled++; else disabled++;
        }
        int online = (int) TaskManager.getInstance().find(1, 1).getRecordCount();
        int offline = Math.max(enabled - online, 0);
        Map<String, Object> out = new HashMap<>();
        out.put("online", online);
        out.put("offline", offline);
        out.put("maintenance", disabled);
        out.put("fault", 0);
        return Result.success(out);
    }

    @RequestMapping("/activities")
    @ResponseBody
    public Result activities() {
        List<ConnectionPool.ConnectionInfo> conns = ConnectionPool.getInstance().listConnections();
        conns.sort((a,b) -> Long.compare(b.lastActiveTime, a.lastActiveTime));
        List<Map<String, Object>> items = new ArrayList<>();
        int n = Math.min(8, conns.size());
        for (int i = 0; i < n; i++) {
            ConnectionPool.ConnectionInfo ci = conns.get(i);
            Map<String, Object> it = new HashMap<>();
            it.put("title", String.valueOf(ci.clientIp));
            it.put("status", ci.status);
            it.put("time", ci.lastActiveTime);
            items.add(it);
        }
        return Result.success(items);
    }

    @RequestMapping("/system")
    @ResponseBody
    public Result system() {
        Runtime rt = Runtime.getRuntime();
        long total = rt.totalMemory();
        long free = rt.freeMemory();
        long used = total - free;
        int memUsage = (int) Math.max(0, Math.min(100, Math.round(used * 100.0 / Math.max(total, 1))));
        Map<String, Object> out = new HashMap<>();
        out.put("cpu", 0);
        out.put("memory", memUsage);
        out.put("disk", 0);
        out.put("threads", RunnerManager.getThreadCount());
        return Result.success(out);
    }
}