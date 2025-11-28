package org.ssssssss.jtt808client.web.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.ssssssss.jtt808client.task.TaskManager;
import org.ssssssss.jtt808client.web.entity.Route;
import org.ssssssss.jtt808client.web.exception.BusinessException;
import org.ssssssss.jtt808client.web.service.RouteService;
import org.ssssssss.jtt808client.web.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

@Controller
@RequestMapping("/batch")
public class BatchController extends BaseController
{
    private static final Logger logger = LoggerFactory.getLogger(BatchController.class);
    
    @Autowired
    RouteService routeService;

    @Value("${vehicle-server.addr}")
    String vehicleServerAddr;

    @Value("${vehicle-server.port}")
    String  vehicleServerPort;

    // 批量创建任务入口页面
    @RequestMapping("/index")
    public String index(Model model)
    {
        List<Route> routes = routeService.list();
        model.addAttribute("routes", routes);
        model.addAttribute("vehicleServerAddr", vehicleServerAddr);
        model.addAttribute("vehicleServerPort", vehicleServerPort);

        return "task-batch-create";
    }

    // 批量创建
    @RequestMapping("/run")
    @ResponseBody
    public Result run(@RequestParam int vehicleCount,
                       @RequestParam(name = "routeIdList[]", required = false) Long[] routeIdList,
                       @RequestParam String vehicleNumberPattern,
                       @RequestParam String deviceSnPattern,
                       @RequestParam String simNumberPattern,
                       @RequestParam String serverAddress,
                       @RequestParam String serverPort)
    {
        // 参数校验
        if (vehicleCount < 1 || vehicleCount > 100000) {
            throw new BusinessException(400, "请填写车辆数量，最少1辆，最多100000辆");
        }
        
        if (StringUtils.isEmpty(vehicleNumberPattern)) {
            throw new BusinessException(400, "车牌号模式不能为空");
        }
        
        if (StringUtils.isEmpty(deviceSnPattern)) {
            throw new BusinessException(400, "设备SN模式不能为空");
        }
        
        if (StringUtils.isEmpty(simNumberPattern)) {
            throw new BusinessException(400, "SIM卡号模式不能为空");
        }
        
        if (StringUtils.isEmpty(serverAddress)) {
            throw new BusinessException(400, "服务器地址不能为空");
        }
        
        if (StringUtils.isEmpty(serverPort) || !serverPort.matches("^\\d{1,5}$")) {
            throw new BusinessException(400, "请填写正确的服务器端口");
        }

        // 准备线路
        boolean randomRouteMode = false;
        if (routeIdList != null) {
            for (Long id : routeIdList) {
                if (id == 0) {
                    randomRouteMode = true;
                    routeIdList = new Long[0];
                    break;
                }
            }
        } else {
            randomRouteMode = true;
            routeIdList = new Long[0];
        }
        
        List<Route> routes = null;
        if (randomRouteMode) {
            routes = routeService.list();
        } else {
            routes = new ArrayList<>(routeIdList.length);
            for (Long id : routeIdList) {
                Route route = routeService.getById(id);
                if (route != null) routes.add(route);
            }
        }
        
        if (routes == null || routes.isEmpty()) {
            throw new BusinessException(400, "没有可用的线路，请先创建线路");
        }

        Map<String, String> params = new HashMap<String, String>() {
            {
                put("server.address", serverAddress);
                put("server.port", serverPort);
                put("mode", "debug");
            }
        };

        // 创建任务
        TaskManager mgr = TaskManager.getInstance();
        List<Long> taskIds = new ArrayList<>();
        
        for (int i = 0; i < vehicleCount; i++) {
            long idx = mgr.nextIndex();
            String sn = String.format(deviceSnPattern, idx);
            String sim = String.format(simNumberPattern, idx);

            if (sn.length() < 7) sn = ("00000000000000000" + sn).replaceAll("^0+(\\w{7})$", "$1");
            if (sim.length() < 12) sim = ("00000000000000000000" + sim).replaceAll("^0+(\\d{12})$", "$1");

            params.put("vehicle.number", String.format(vehicleNumberPattern, idx));
            params.put("device.sn", sn);
            params.put("device.sim", sim);

            long routeId = routes.get((int)(Math.random() * routes.size())).getId();
            Long taskId = mgr.run(params, routeId);
            taskIds.add(taskId);
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("taskIds", taskIds);
        data.put("createdCount", vehicleCount);
        
        logger.info("批量创建任务成功，创建数量: {}, 任务ID列表: {}", vehicleCount, taskIds);
        return Result.success("批量创建任务成功", data);
    }

    // 按车辆规则批量创建（前缀/起始序号/位数 + 设备号/SIM 起始与步长）
    @RequestMapping("/runByRule")
    @ResponseBody
    public Result runByRule(@RequestParam int count,
                            @RequestParam(name = "routeIdList[]", required = false) Long[] routeIdList,
                            @RequestParam String platePrefix,
                            @RequestParam(defaultValue = "0") int indexStart,
                            @RequestParam(defaultValue = "5") int indexWidth,
                            @RequestParam String terminalStart,
                            @RequestParam String simStart,
                            @RequestParam(defaultValue = "1") int increment,
                            @RequestParam String serverAddress,
                            @RequestParam String serverPort,
                            @RequestParam(required = false) String alertFlags,
                            @RequestParam(required = false) Integer locationIntervalSec) {
        if (count < 1 || count > 20000) {
            throw new BusinessException(400, "数量必须在1-20000之间");
        }
        if (!StringUtils.hasText(platePrefix)) {
            throw new BusinessException(400, "车牌前缀不能为空");
        }
        if (indexWidth < 1 || indexWidth > 8) {
            throw new BusinessException(400, "序号位数需在1-8之间");
        }
        if (!StringUtils.hasText(serverAddress)) {
            throw new BusinessException(400, "服务器地址不能为空");
        }
        if (StringUtils.isEmpty(serverPort) || !serverPort.matches("^\\d{1,5}$")) {
            throw new BusinessException(400, "请填写正确的服务器端口");
        }

        long termStart;
        long simStartVal;
        try {
            termStart = Long.parseLong(terminalStart);
            simStartVal = Long.parseLong(simStart);
        } catch (Exception e) {
            throw new BusinessException(400, "设备号或SIM起始值必须为数字");
        }
        if (String.valueOf(termStart).length() > 11 || String.valueOf(simStartVal).length() > 11) {
            throw new BusinessException(400, "设备号与SIM起始值长度不能超过11位");
        }
        if (increment <= 0) increment = 1;

        boolean randomRouteMode = false;
        if (routeIdList != null) {
            for (Long id : routeIdList) {
                if (id == 0) { randomRouteMode = true; routeIdList = new Long[0]; break; }
            }
        } else { randomRouteMode = true; routeIdList = new Long[0]; }

        List<Route> routes;
        if (randomRouteMode) {
            routes = routeService.list();
        } else {
            routes = new ArrayList<>(routeIdList.length);
            for (Long id : routeIdList) {
                Route route = routeService.getById(id);
                if (route != null) routes.add(route);
            }
        }
        if (routes == null || routes.isEmpty()) {
            throw new BusinessException(400, "没有可用的线路，请先创建线路");
        }

        Map<String, String> params = new HashMap<String, String>() {{
            put("server.address", serverAddress);
            put("server.port", serverPort);
            put("mode", "debug");
        }};

        if (alertFlags != null && !alertFlags.trim().isEmpty()) {
            params.put("alert.flags", alertFlags.trim());
        }
        if (locationIntervalSec != null && locationIntervalSec > 0) {
            params.put("location.interval.ms", String.valueOf(locationIntervalSec * 1000));
        }

        TaskManager mgr = TaskManager.getInstance();
        List<Long> taskIds = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            int seq = indexStart + i;
            String plate = platePrefix + String.format("%0" + indexWidth + "d", seq);
            long termVal = termStart + (long) i * increment;
            long simVal = simStartVal + (long) i * increment;
            String sn = String.format("%011d", termVal);
            String sim = String.format("%011d", simVal);
            if (sim.length() < 12) sim = ("00000000000000000000" + sim).replaceAll("^0+(\\d{12})$", "$1");

            params.put("vehicle.number", plate);
            params.put("device.sn", sn);
            params.put("device.sim", sim);

            long routeId = routes.get((int)(Math.random() * routes.size())).getId();
            Long taskId = mgr.run(params, routeId);
            taskIds.add(taskId);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("taskIds", taskIds);
        data.put("createdCount", count);
        data.put("platePrefix", platePrefix);
        data.put("indexStart", indexStart);
        data.put("indexWidth", indexWidth);
        data.put("terminalStart", String.format("%011d", termStart));
        data.put("simStart", String.format("%011d", simStartVal));
        data.put("increment", increment);
        try {
            org.ssssssss.jtt808client.web.entity.PressureReport pr = new org.ssssssss.jtt808client.web.entity.PressureReport();
            pr.setName("批量压测:" + platePrefix + indexStart + "+" + count);
            pr.setStartTime(new java.util.Date());
            pr.setEndTime(new java.util.Date());
            pr.setCreatedCount(count);
            pr.setSkippedCount(0);
            pr.setTaskCount(count);
            pr.setServerAddress(serverAddress);
            pr.setServerPort(Integer.parseInt(serverPort));
            pr.setRouteMode(randomRouteMode ? "random" : "fixed");
            pr.setRouteIds(routeIdList == null ? "" : java.util.Arrays.toString(routeIdList));
            pr.setTaskIds(taskIds.toString().replaceAll("[\\[\\] ]",""));
            pr.setStatus("done");
            org.ssssssss.jtt808client.web.mapper.PressureReportMapper m = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.web.mapper.PressureReportMapper.class);
            m.insert(pr);
            data.put("reportId", pr.getId());
        } catch (Throwable ignore) {}
        return Result.success("批量创建任务成功", data);
    }
}


