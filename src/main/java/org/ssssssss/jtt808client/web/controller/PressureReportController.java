package org.ssssssss.jtt808client.web.controller;

import org.ssssssss.jtt808client.task.net.ConnectionPool;
import org.ssssssss.jtt808client.web.entity.PressureReport;
import org.ssssssss.jtt808client.web.mapper.PressureReportMapper;
import org.ssssssss.jtt808client.web.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

/**
 * 压测报告
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Controller
@RequestMapping("/pressure/report")
public class PressureReportController extends BaseController {
    @Autowired
    private PressureReportMapper mapper;

    @RequestMapping("/list")
    @ResponseBody
    public Result list(@RequestParam(defaultValue = "1") int pageIndex,
                       @RequestParam(defaultValue = "10") int pageSize) {
        List<PressureReport> all = mapper.list();
        org.ssssssss.jtt808client.web.vo.PageVO<PressureReport> page = new org.ssssssss.jtt808client.web.vo.PageVO<>(pageIndex, pageSize);
        int total = all != null ? all.size() : 0;
        page.setRecordCount(total);
        if (total > 0) {
            int start = Math.max(0, (pageIndex - 1) * pageSize);
            int end = Math.min(total, start + pageSize);
            if (start < end) {
                page.setList(all.subList(start, end));
            }
        }
        return Result.success(page);
    }

    @RequestMapping("/detail")
    @ResponseBody
    public Result detail(@RequestParam Long id) {
        PressureReport pr = mapper.selectById(id);
        if (pr == null) return Result.error(404, "not found");
        Map<String,Object> out = new HashMap<>();
        out.put("report", pr);
        String taskIds = pr.getTaskIds();
        int total = 0, active = 0;
        long messages = 0L;
        List<ConnectionPool.ConnectionInfo> conns = ConnectionPool.getInstance().listConnections();
        Set<Long> ids = new HashSet<>();
        if (taskIds != null && !taskIds.trim().isEmpty()) {
            for (String s : taskIds.split(",")) {
                try { ids.add(Long.parseLong(s.trim())); } catch (Exception ignore) {}
            }
        }
        total = ids.size();
        for (ConnectionPool.ConnectionInfo ci : conns) {
            // 无法直接取任务ID，采用近似统计当前活动连接数与消息数
            if ("active".equals(ci.status)) active++;
            messages += ci.messageCount;
        }
        Map<String,Object> metrics = new HashMap<>();
        metrics.put("taskTotal", total);
        metrics.put("activeConnections", active);
        metrics.put("messageCount", messages);
        metrics.put("lastActiveTime", conns.stream().mapToLong(c->c.lastActiveTime).max().orElse(0L));
        out.put("metrics", metrics);
        return Result.success(out);
    }

    @RequestMapping("/connections")
    @ResponseBody
    public Result connections(@RequestParam Long id) {
        List<ConnectionPool.ConnectionInfo> conns = ConnectionPool.getInstance().listConnections();
        return Result.success(conns);
    }
}
