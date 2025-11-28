package org.ssssssss.jtt808client.jtt809;

import org.ssssssss.jtt808client.util.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.ssssssss.jtt808client.web.entity.JT809Gateway;
import org.ssssssss.jtt808client.web.entity.RoutePoint;
import org.ssssssss.jtt808client.web.service.JT809GatewayService;
import org.ssssssss.jtt808client.web.service.RoutePointService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

@Service
@Slf4j
public class JT809TaskService {
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final Map<Long, ScheduledFuture<?>> tasks = new ConcurrentHashMap<>();
    private final Map<Long, TaskMeta> metas = new ConcurrentHashMap<>();
    private final Map<Long, java.util.List<java.util.Map<String,Object>>> logs = new ConcurrentHashMap<>();

    public static class TaskMeta {
        public long id;
        public long gatewayId;
        public String gatewayName;
        public long routeId;
        public String plate;
        public int intervalMs;
        public long createdAt;
    }

    public synchronized long start(long gatewayId, long routeId, String plate, int intervalMs) throws Exception {
        JT809GatewayService gwService = BeanUtils.create(JT809GatewayService.class);
        JT809Gateway gw = gwService.getById(gatewayId);
        if (gw == null) throw new IllegalArgumentException("809网关不存在");
        JT809ClientManager manager = BeanUtils.create(JT809ClientManager.class);
        manager.configureFromGateway(gw);
        log.info("809任务启动 gatewayId={} routeId={} plate={} intervalMs={} ip={} port={}", gatewayId, routeId, plate, intervalMs, gw.getIp(), gw.getPort());
        manager.connect(gw.getIp(), gw.getPort(), gw.getIp(), gw.getPort());

        RoutePointService routePointService = BeanUtils.create(RoutePointService.class);
        List<RoutePoint> points = routePointService.find(routeId);
        if (points == null || points.isEmpty()) throw new IllegalArgumentException("路线无轨迹点");
        log.info("809任务准备完成 routeId={} points={}", routeId, points.size());

        long id = System.currentTimeMillis();
        TaskMeta meta = new TaskMeta();
        meta.id = id; meta.gatewayId = gatewayId; meta.gatewayName = gw.getName(); meta.routeId = routeId; meta.plate = plate; meta.intervalMs = Math.max(500, intervalMs); meta.createdAt = System.currentTimeMillis();
        metas.put(id, meta);

        appendLog(id, "INFO", "started");

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(new Runnable() {
            int index = 0;
            @Override
            public void run() {
                try {
                    if (index >= points.size()) index = 0;
                    RoutePoint p = points.get(index++);
                    log.debug("809位置上报 id={} plate={} lon={} lat={}", id, plate, p.getLongitude(), p.getLatitude());
                    manager.sendDemoLocation(plate, p.getLongitude(), p.getLatitude());
                } catch (Throwable ignore) {}
            }
        }, 0, meta.intervalMs, TimeUnit.MILLISECONDS);
        tasks.put(id, future);
        return id;
    }

    public synchronized java.util.List<Long> startBatch(long gatewayId, long routeId, java.util.List<String> plates, int intervalMs) throws Exception {
        JT809GatewayService gwService = BeanUtils.create(JT809GatewayService.class);
        JT809Gateway gw = gwService.getById(gatewayId);
        if (gw == null) throw new IllegalArgumentException("809网关不存在");
        JT809ClientManager manager = BeanUtils.create(JT809ClientManager.class);
        manager.configureFromGateway(gw);
        log.info("809批量任务启动 gatewayId={} routeId={} plates={} intervalMs={} ip={} port={}", gatewayId, routeId, plates, intervalMs, gw.getIp(), gw.getPort());
        manager.connect(gw.getIp(), gw.getPort(), gw.getIp(), gw.getPort());

        RoutePointService routePointService = BeanUtils.create(RoutePointService.class);
        List<RoutePoint> points = routePointService.find(routeId);
        if (points == null || points.isEmpty()) throw new IllegalArgumentException("路线无轨迹点");
        log.info("809批量任务准备完成 routeId={} points={}", routeId, points.size());

        java.util.List<Long> ids = new java.util.ArrayList<>();
        int im = Math.max(500, intervalMs);
        for (String plate : plates) {
            long id = System.currentTimeMillis() + ids.size();
            TaskMeta meta = new TaskMeta();
            meta.id = id; meta.gatewayId = gatewayId; meta.gatewayName = gw.getName(); meta.routeId = routeId; meta.plate = plate; meta.intervalMs = im; meta.createdAt = System.currentTimeMillis();
            metas.put(id, meta);
            appendLog(id, "INFO", "started");
            ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(new Runnable() {
                int index = 0;
                @Override
                public void run() {
                    try {
                        if (index >= points.size()) index = 0;
                        RoutePoint p = points.get(index++);
                        log.debug("809位置上报 id={} plate={} lon={} lat={}", id, plate, p.getLongitude(), p.getLatitude());
                        manager.sendDemoLocation(plate, p.getLongitude(), p.getLatitude());
                    } catch (Throwable ignore) {}
                }
            }, 0, meta.intervalMs, TimeUnit.MILLISECONDS);
            tasks.put(id, future);
            ids.add(id);
        }
        return ids;
    }

    public synchronized void stop(long id) {
        ScheduledFuture<?> f = tasks.remove(id);
        if (f != null) f.cancel(true);
        metas.remove(id);
        log.info("809任务终止 id={}", id);
        appendLog(id, "INFO", "terminated");
    }

    public synchronized Map<Long, TaskMeta> list() {
        return new ConcurrentHashMap<>(metas);
    }

    public void appendLog(long id, String type, String message) {
        java.util.List<java.util.Map<String,Object>> list = logs.computeIfAbsent(id, k -> new java.util.concurrent.CopyOnWriteArrayList<>());
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        m.put("time", System.currentTimeMillis());
        m.put("type", type);
        m.put("message", message);
        list.add(m);
        while (list.size() > 60) {
            try { list.remove(0); } catch (Exception ignore) {}
        }
    }

    public void appendLogByPlate(String plate, String type, String message) {
        for (TaskMeta tm : metas.values()) {
            if (plate != null && plate.equals(tm.plate)) {
                appendLog(tm.id, type, message);
            }
        }
    }

    public java.util.List<java.util.Map<String,Object>> getLogs(long id, long since) {
        java.util.List<java.util.Map<String,Object>> list = logs.get(id);
        if (list == null || list.isEmpty()) {
            TaskMeta tm = metas.get(id);
            if (tm != null) {
                java.util.Map<String,Object> m = new java.util.HashMap<>();
                m.put("time", tm.createdAt);
                m.put("type", "INFO");
                m.put("message", "started");
                java.util.List<java.util.Map<String,Object>> init = new java.util.ArrayList<>();
                init.add(m);
                return init;
            }
            return java.util.Collections.emptyList();
        }
        if (since <= 0) return new java.util.ArrayList<>(list);
        java.util.List<java.util.Map<String,Object>> out = new java.util.ArrayList<>();
        for (java.util.Map<String,Object> m : list) {
            Object t = m.get("time");
            long ts = (t instanceof Number) ? ((Number)t).longValue() : 0L;
            if (ts > since) out.add(m);
        }
        return out;
    }

    public boolean clearLogs(long id) {
        java.util.List<java.util.Map<String,Object>> list = logs.remove(id);
        return list != null;
    }

    public void appendLogAll(String type, String message) {
        for (TaskMeta tm : metas.values()) {
            appendLog(tm.id, type, message);
        }
    }
}
