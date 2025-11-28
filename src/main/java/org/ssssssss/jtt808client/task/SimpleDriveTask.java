package org.ssssssss.jtt808client.task;

import org.ssssssss.jtt808client.entity.Point;
import org.ssssssss.jtt808client.entity.TaskInfo;
import org.ssssssss.jtt808client.jtt808.JTT808Encoder;
import org.ssssssss.jtt808client.jtt808.JTT808Message;
import org.ssssssss.jtt808client.task.event.EventEnum;
import org.ssssssss.jtt808client.task.event.Listen;
import org.ssssssss.jtt808client.task.event.EventDispatcher;
import org.ssssssss.jtt808client.task.log.LogType;
import org.ssssssss.jtt808client.task.runner.Executable;
import org.ssssssss.jtt808client.task.net.ConnectionPool;
import org.ssssssss.jtt808client.util.ByteUtils;
import org.ssssssss.jtt808client.util.LBSUtils;
import org.ssssssss.jtt808client.util.Packet;
import org.ssssssss.jtt808client.util.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.ssssssss.jtt808client.service.PositionCacheService;
import org.ssssssss.jtt808client.service.SystemConfigService;
import org.springframework.core.env.Environment;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * 简单驾驶任务实现类型
 * Created by matrixy when 2020/5/9.
 * 实现基本的JTT808协议通信和位置上报功"
 */
@Slf4j
public class SimpleDriveTask extends AbstractDriveTask
{
    /** 部标808协议连接ID */
    String connectionId;

    /** 1078多媒体传输协议连接ID */
    String multimediaConnectionId;

    /** 消息包流水号 */
    int sequence = 1;

    /** 最后发送的消息ID */
    int lastSentMessageId = 0;
    volatile boolean sessionStarted = false;

    /** 以米为单位的总行程里程数 */
    int mileages = 0;
    
    /** 上一个位置点 */
    Point lastPosition = null;

    /** 位置上报间隔（毫秒） */
    long reportInterval = 10000; // 默认10秒

    /** 连接池实"*/
    ConnectionPool pool = ConnectionPool.getInstance();

    /** 位置缓存服务 */
    PositionCacheService positionCacheService;
    
    /** 系统配置服务 */
    SystemConfigService systemConfigService;

    /** 时间格式化器 */
    SimpleDateFormat sdf = new SimpleDateFormat("YYMMddHHmmss");

    /** 通用应答消息模板 */
    final JTT808Message GENERAL_RESPONSE = new JTT808Message(0x0001);

    /** Spring环境配置 */
    static Environment environment;

    /**
     * 构造函数，创建简单驾驶任"
     * @param id 任务ID
     * @param routeId 路线ID
     */
    public SimpleDriveTask(long id, long routeId) {
        super(id, routeId);
        log.info("创建SimpleDriveTask实例 - 任务ID: {}, 路线ID: {}", id, routeId);
        
        // 初始化系统配置服务
        try {
            this.systemConfigService = new SystemConfigService();
            log.info("系统配置服务初始化成功");
        } catch (Exception e) {
            log.error("初始化系统配置服务失败", e);
        }
        
        // 读取上报间隔配置（从任务参数中获取，如果没有则使用系统配置）
        try {
            String intervalStr = getParameter("location.report.interval");
            if (intervalStr != null) {
                this.reportInterval = Long.parseLong(intervalStr) * 1000; // 转换为毫秒
                log.info("位置上报间隔配置（任务参数）: {}毫秒", this.reportInterval);
            } else if (systemConfigService != null) {
                // 使用系统配置服务获取上报间隔
                int interval = systemConfigService.getLocationReportInterval();
                this.reportInterval = interval * 1000L; // 转换为毫秒
                log.info("位置上报间隔配置（系统配置）: {}毫秒", this.reportInterval);
            } else {
                // 尝试从系统属性获取
                this.reportInterval = Long.getLong("location.report.interval", 10000L);
                log.info("位置上报间隔（系统属性）: {}毫秒", this.reportInterval);
            }
        } catch (Exception e) {
            log.warn("读取位置上报间隔配置失败，使用默认值10秒", e);
            this.reportInterval = 10000; // 默认10秒
        }
        
        // 初始化位置缓存服务
        try {
            this.positionCacheService = BeanUtils.create(PositionCacheService.class);
            log.info("位置缓存服务初始化成功");
        } catch (Exception e) {
            log.error("初始化位置缓存服务失败", e);
        }
    }

    @Override
    public void init(java.util.Map<String, String> settings, org.ssssssss.jtt808client.entity.DrivePlan plan) {
        super.init(settings, plan);
        try {
            String ms = settings != null ? settings.get("location.interval.ms") : null;
            String sec = settings != null ? settings.get("location.report.interval") : null;
            if (ms != null && ms.matches("^\\d{1,9}$")) {
                this.reportInterval = Long.parseLong(ms);
                log.info("位置上报间隔(任务参数-ms): {}毫秒", this.reportInterval);
            } else if (sec != null && sec.matches("^\\d{1,5}$")) {
                this.reportInterval = Long.parseLong(sec) * 1000L;
                log.info("位置上报间隔(任务参数-sec): {}毫秒", this.reportInterval);
            }
        } catch (Exception e) { log.warn("根据任务参数设置位置上报间隔失败", e); }

        try {
            String flags = settings != null ? settings.get("alert.flags") : null;
            if (flags != null && !flags.trim().isEmpty()) {
                for (String s : flags.split(",")) {
                    s = s.trim();
                    if (s.isEmpty()) continue;
                    int idx = Integer.parseInt(s);
                    setWarningFlag(idx, true);
                }
                log.info("初始化警报标志位: {}", flags);
            }
        } catch (Exception e) { log.warn("初始化警报标志位失败", e); }
    }

    /**
     * 启动驾驶任务
     * 注册事件监听器，连接服务器，初始化行驶里"
     */
    @Override
    public void startup() {
        log.info("启动SimpleDriveTask - 任务ID: {}", getId());
        
        // 设置任务状态为空闲
        this.state = TaskState.idle;
        
        // 设置开始时"
        TaskInfo info = getInfo();
        info.setStartTime(System.currentTimeMillis());
        
        EventDispatcher.register(this);
        log.debug("已注册事件监听器");
        
        String serverAddress = getParameter("server.address");
        int serverPort = Integer.parseInt(getParameter("server.port"));
        log.info("连接到服务器 - 地址: {}, 端口: {}", serverAddress, serverPort);
        
        connectionId = pool.connect(serverAddress, serverPort, this);
        log.debug("获得连接ID: {}", connectionId);

        // 总行驶里程初始化
        Object km = getParameter("mileages");
        if (km != null) {
            int meters = Integer.parseInt(String.valueOf(km)) * 1000;
            mileages = meters;
            log.info("初始化行驶里{}", mileages);
        }

        // 容错：若连接事件分发异常或平台未返回注册应答，3秒后强制启动会话
        executeAfter(new Executable() {
            @Override
            public void execute(AbstractDriveTask driveTask) {
                if (!sessionStarted) {
                    log.warn("容错触发会话启动 - 未收到注册应答，任务ID:{}", getId());
                    startSession();
                }
            }
        }, 3000);
    }

    @Override
    public void terminate() {
        log.info("终止SimpleDriveTask - 任务ID: {}", getId());
        super.terminate();
        try {
            if (connectionId != null) {
                pool.close(connectionId);
                log.debug("已关闭连接: {}", connectionId);
            }
            if (multimediaConnectionId != null) {
                pool.close(multimediaConnectionId);
                log.debug("已关闭多媒体连接: {}", multimediaConnectionId);
            }
        } catch (Exception e) {
            log.warn("关闭连接时发生异常 - 任务ID:{}", getId(), e);
        } finally {
            connectionId = null;
            multimediaConnectionId = null;
            sessionStarted = false;
        }
    }

    // 通用下行消息回调，先执行这个方法，后再按消息ID进行路由，所以最好不要在这里做应"
    @Listen(when = EventEnum.message_received)
    public void onServerMessage(JTT808Message msg) {
        log.debug("收到服务器消- 消息ID: 0x{}, SIM: {}, 流水{}",
                 String.format("%04X", msg.id & 0xffff), msg.sim, msg.sequence & 0xffff);
        log(LogType.MESSAGE_IN, ByteUtils.toString(JTT808Encoder.encode(msg)));
    }

    @Listen(when = EventEnum.connected)
    public void onConnected() {
        log.info("onConnected 触发 - 连接ID: {}", connectionId);
        log(LogType.INFO, "connected");
        
        // 连接成功时，发送注册消"
        String sn = getParameter("device.sn");
        String vehicleNumber = getParameter("vehicle.number");
        log.info("准备发送注册消- 设备序列{}, 车牌{}", sn, vehicleNumber);
        
        byte[] vin = new byte[0];
        try { vin = vehicleNumber.getBytes("GBK"); } catch(Exception ex) { 
            log.error("车牌号编码失", ex);
        }

        JTT808Message msg = new JTT808Message();
        msg.id = 0x0100;
        msg.body = Packet.create(64)
                .addShort((short)0x0001)
                .addShort((short)0x0001)
                .addBytes("CHINA".getBytes(), 5)
                .addBytes("HENTAI-SIMULATOR".getBytes(), 20)
                .addBytes(sn.getBytes(), 7)
                .addByte((byte)0x01)
                .addBytes(vin)
                .getBytes();

        log.info("发送注册消息 - 消息体长{} 字节", msg.body.length);
        try {
            send(msg);
            log.info("注册消息发送成功 - 消息ID: 0x0100");
        } catch (Exception e) {
            log.error("发送注册消息失败", e);
        }
        executeAfter(new Executable() {
            @Override
            public void execute(AbstractDriveTask driveTask) {
                if (!sessionStarted) startSession();
            }
        }, 3000);
    }

    @Listen(when = EventEnum.message_received, attachment = "8001")
    public void onGenericResponse(JTT808Message msg) {
        int answerSequence = ByteUtils.getShort(msg.body, 0, 2) & 0xffff;
        int answerMessageId = ByteUtils.getShort(msg.body, 2, 2) & 0xffff;
        int result = msg.body[4] & 0xff;
        
        log.debug("收到通用应答 - 应答流水{}, 应答消息ID: 0x{}, 结果: {}", 
                 answerSequence, String.format("%04X", answerMessageId), result);

        // 根据上次发送的消息ID进行相应处理
        switch (lastSentMessageId) {
            // 其它就不管了
        }

        lastSentMessageId = 0;
    }

    // 注册应答”
    @Listen(when = EventEnum.message_received, attachment = "8100")
    public void onRegisterResponsed(JTT808Message msg) {
        int result = msg.body[2] & 0xff;
        log.info("收到注册应答 - 结果{}", result);
        
        if (result == 0x00) {
            log.info("注册成功，开始会");
            log(LogType.INFO, "registered");
            startSession();
        } else {
            log.error("注册失败 - 结果{}", result);
            log(LogType.EXCEPTION, "register failed");
            terminate();
        }
    }

    @Listen(when = EventEnum.disconnected)
    public void onDisconnected() {
        log.warn("连接断开 - 连接ID: {}", connectionId);
        log(LogType.EXCEPTION, "disconnected");
        terminate();
    }

    // 接收到文本信"
    @Listen(when = EventEnum.message_received, attachment = "8300")
    public void onTTSMessage(JTT808Message msg) {
        log.debug("收到文本信息下发消息 - 消息体长{} 字节", msg.body.length);
        
        Packet p = Packet.create(msg.body);
        int flag = p.nextByte() & 0xff;
        String text = null;
        try { text = new String(p.nextBytes(), "GBK"); } catch(Exception ex) { 
            log.error("解析文本信息失败", ex);
        }
        
        boolean emergency = (flag & (1 << 0)) > 0;
        boolean display = (flag & (1 << 2)) > 0;
        boolean tts = (flag & (1 << 3)) > 0;
        boolean adScreen = (flag & (1 << 4)) > 0;
        boolean CANCode = (flag & (1 << 5)) > 0;
        
        String logMsg = "标志";
        if (emergency) logMsg += "紧急，";
        if (display) logMsg += "终端显示器显示，";
        if (tts) logMsg += "终端TTS播读";
        if (adScreen) logMsg += "广告屏显示，";
        logMsg += CANCode ? "CAN故障码，" : "中心导航信息";
        logMsg += "文本" + text;
        
        log.info("文本信息内容 - {}", logMsg);
        log(LogType.INFO, logMsg);

        // 回应一"
        GENERAL_RESPONSE.body = Packet.create(5).addShort((short) msg.sequence).addShort((short) msg.id).addByte((byte) 0x00).getBytes();
        log.debug("发送文本信息应");
        send(GENERAL_RESPONSE);
    }

    // 开始正常会话，发送心跳与位置
    protected void startSession()
    {
        if (sessionStarted) return;
        // 连接未激活则延迟重试
        if (!pool.isActive(connectionId)) {
            log.warn("会话启动等待连接激活 - 任务ID:{}, 通道ID:{}", getId(), connectionId);
            executeAfter(new Executable() {
                @Override
                public void execute(AbstractDriveTask driveTask) {
                    startSession();
                }
            }, 1000);
            return;
        }
        sessionStarted = true;
        log.info("开始正常会- 任务ID: {}", getId());
        
        // 暂时先屏蔽掉，没发送心跳消息就暂时先不执行"
        /*
        executeConstantly(new Executable()
        {
            @Override
            public void execute(AbstractDriveTask driveTask)
            {
                ((SimpleDriveTask)driveTask).heartbeat();
            }
        }, 30000);
        */
        reportLocation();
    }

    public void reportLocation()
    {
        lastPosition = getCurrentPosition();
        final Point point = getNextPoint();
        
        if (point == null)
        {
            log.info("路线已完成，10分钟后自动关闭任");
            // 10分钟后再关闭
            executeAfter(new Executable()
            {
                @Override
                public void execute(AbstractDriveTask driveTask)
                {
                    terminate();
                }
            }, 1000 * 60 * 10);
            return;
        }

        log.debug("准备上报位置 - 经度: {}, 纬度: {}, 速度: {} km/h, 上报时间: {}", 
                 point.getLongitude(), point.getLatitude(), point.getSpeed(), 
                 new Date(point.getReportTime()));

        // 使用可配置的上报间隔，而不是依赖轨迹点的时间
        long delay = this.reportInterval;
        log.debug("调度下一次位置上报 - 延迟{} ms", delay);
        final int[] retryCountHolder = new int[]{0};
        final int maxRetries = 10;
        Executable exec = new Executable() {
            @Override
            public void execute(AbstractDriveTask driveTask) {
                if (!pool.isActive(connectionId)) {
                    if (retryCountHolder[0] >= maxRetries) {
                        log.error("连接未激活，已达到最大重试次数，停止上报位置 - 任务ID:{}, 通道ID:{}", getId(), connectionId);
                        return;
                    }
                    retryCountHolder[0]++;
                    log.warn("连接未激活，延迟上报位置 - 任务ID:{}, 通道ID:{}，重试次数:{}", getId(), connectionId, retryCountHolder[0]);
                    executeAfter(this, 500);
                    return;
                }
                JTT808Message msg = new JTT808Message();
                msg.id = 0x0200;
                int direction = lastPosition == null ? 0 : LBSUtils.caculateAngle(lastPosition.getLongitude(), lastPosition.getLatitude(), point.getLongitude(), point.getLatitude());
                Packet p = Packet.create(128)
                        .addInt(point.getWarnFlags() | getWarningFlags())
                        .addInt(point.getStatus() | getStateFlags())
                        .addInt((int)(point.getLatitude() * 100_0000))
                        .addInt((int)(point.getLongitude() * 100_0000))
                        .addShort((short)0)
                        .addShort((short)(point.getSpeed() * 10))
                        .addShort((short)direction)
                        .addBytes(ByteUtils.toBCD(sdf.format(new Date(point.getReportTime()))));
                int km = (lastPosition == null ? 0 : LBSUtils.directDistance(point.getLongitude(), point.getLatitude(), lastPosition.getLongitude(), lastPosition.getLatitude()));
                mileages += km;
                km = mileages;
                km = km / 100;
                p.addByte((byte)0x01);
                p.addByte((byte)0x04);
                p.addInt(km);
                msg.body = p.getBytes();
                send(msg);
                try {
                    int warnFlags = point.getWarnFlags() | getWarningFlags();
                    if (warnFlags != 0) {
                        org.ssssssss.jtt808client.web.service.AlertLogService als = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.web.service.AlertLogService.class);
                        String raw = org.ssssssss.jtt808client.util.ByteUtils.toString(org.ssssssss.jtt808client.jtt808.JTT808Encoder.encode(msg));
                        String plate = getParameter("vehicle.number");
                        java.util.Date rpt = new java.util.Date(point.getReportTime());
                        String[] names = new String[]{
                            "紧急报警","超速报警","疲劳驾驶","危险预警","GNSS故障","天线未接","天线短路","主电源欠压",
                            "主电源掉电","LCD故障","TTS故障","摄像头故障","IC卡故障","超速预警","疲劳预警","禁行路段",
                            "禁行时段","进出区域","进出路线","路段行驶时间不足/过长","路线偏离","车辆VSS故障","油量异常",
                            "车辆被盗(通过车辆防盗器)","非法点火","非法位移","碰撞预警","侧翻预警","非法开门","北斗模块故障",
                            "SIM故障","其他报警"
                        };
                        for (int i=0;i<32;i++) {
                            if (((warnFlags >>> i) & 1) == 1) {
                                org.ssssssss.jtt808client.web.entity.AlertLog logItem = new org.ssssssss.jtt808client.web.entity.AlertLog();
                                logItem.setTaskId(getId());
                                logItem.setAlarmIndex(i);
                                logItem.setAlarmName(i < names.length ? names[i] : ("未知报警("+i+")"));
                                logItem.setRawMessage(raw);
                                logItem.setPlateNumber(plate);
                                logItem.setReportTime(rpt);
                                logItem.setLongitude(point.getLongitude());
                                logItem.setLatitude(point.getLatitude());
                                als.save(logItem);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("保存报警记录失败 - 任务ID:{}, {}", getId(), e.getMessage());
                }
                try {
                    if (positionCacheService != null) {
                        String sim = getParameter("device.sim");
                        positionCacheService.saveLatestPosition(getId(), sim, point);
                    }
                } catch (Exception e) {
                    log.error("缓存位置数据到Redis失败", e);
                }
                setCurrentPosition(point);
                executeAfter(new Executable() {
                    @Override
                    public void execute(AbstractDriveTask driveTask) {
                        reportLocation();
                    }
                }, (int)delay);
            }
        };
        executeAfter(exec, (int)delay);
    }

    /**
     * 发送心跳消"
     * 向服务器发送心跳包以保持连接活"
     */
    public void heartbeat()
    {
        // 心跳消息实现待完"
        String deviceSn = getParameter("device.sn");
        log.debug("发送心- 设备序列{}", deviceSn);
    }

    @Override
    public void send(JTT808Message msg)
    {
        try
        {
            msg.sim = getParameter("device.sim");
            msg.sequence = (short)((sequence++) & 0xffff);
            
            log.info("发送消- SIM: {}, 流水{}, 消息ID: 0x{}",
                    msg.sim, msg.sequence & 0xffff, String.format("%04X", msg.id & 0xffff));
            
            if (connectionId == null) {
                log.error("连接ID为空，无法发送消息");
                throw new IllegalStateException("Connection ID is null");
            }
            
            pool.send(connectionId, msg);

            lastSentMessageId = msg.id;

            log(LogType.MESSAGE_OUT, ByteUtils.toString(JTT808Encoder.encode(msg)));
        }
        catch (Exception e)
        {
            log.error("发送消息失败- 消息ID: 0x{}", String.format("%04X", msg.id & 0xffff), e);
            throw new RuntimeException(e);
        }
    }
}


