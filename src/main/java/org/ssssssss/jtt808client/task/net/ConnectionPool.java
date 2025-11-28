package org.ssssssss.jtt808client.task.net;

import lombok.Data;
import lombok.Getter;
import org.ssssssss.jtt808client.jtt808.JTT808Message;
import org.ssssssss.jtt808client.task.AbstractDriveTask;
import org.ssssssss.jtt808client.task.event.EventDispatcher;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import lombok.extern.slf4j.Slf4j;
import org.ssssssss.jtt808client.task.log.LogType;

import java.net.InetSocketAddress;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 连接池
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Slf4j
@Data
public class ConnectionPool {
    EventLoopGroup group = null;
    Bootstrap bootstrap = null;
    ConcurrentHashMap<String, Connection> connections = null;

    private ConnectionPool() {
        log.info("初始化ConnectionPool连接");
        connections = new ConcurrentHashMap<>(1024);
        start();
    }

    private void start() {
        log.info("启动Netty客户");
        group = new NioEventLoopGroup();
        bootstrap = new Bootstrap();
        bootstrap.option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000);
        bootstrap.group(group)
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) throws Exception {
                        log.debug("初始化通道管道 - 通道ID: {}", ch.id().asLongText());
                        ch.pipeline()
                                .addLast(new JT808MessageDecoder())
                                .addLast(new JT808MessageEncoder())
                                .addLast(new SimpleNettyHandler());
                    }
                });
        log.info("Netty客户端启动完");
    }

    // 连接到目标服务器
    public String connect(String address, int port, AbstractDriveTask watcher) {
        log.info("创建连接 - 目标地址: {}:{}", address, port);

        Channel chl = bootstrap.register().channel();
        String channelId = chl.id().asLongText();

        connections.put(channelId, new Connection(chl, watcher));
        log.debug("连接已注- 通道ID: {}, 当前连接{}", channelId, connections.size());

        ChannelFuture future = chl.connect(new InetSocketAddress(address, port));
        future.addListener(new ChannelFutureListener() {
            @Override
            public void operationComplete(ChannelFuture channelFuture) throws Exception {
                if (channelFuture.isSuccess()) {
                    log.info("连接建立成功 - 通道ID: {}, 远程地址: {}", channelId, channelFuture.channel().remoteAddress());
                } else {
                    log.error("连接建立失败 - 通道ID: {}, 目标: {}:{}", channelId, address, port, channelFuture.cause());
                }
            }
        });

        return channelId;
    }

    // 关闭连接
    public void close(String channelId) {
        log.info("关闭连接 - 通道ID: {}", channelId);
        Connection conn = connections.remove(channelId);
        if (conn != null) {
            conn.channel.close();
            log.debug("连接已关- 通道ID: {}, 剩余连接{}", channelId, connections.size());
        } else {
            log.warn("尝试关闭不存在的连接 - 通道ID: {}", channelId);
        }
    }

    // 发送数"
    public void send(String channelId, Object data) throws Exception {
        log.debug("发送数- 通道ID: {}, 数据类型型: {}", channelId, data.getClass().getSimpleName());

        Connection conn = connections.get(channelId);
        if (conn == null) {
            String errorMsg = "连接不存在或已关- 通道ID: " + channelId;
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        if (!conn.channel.isActive()) {
            String errorMsg = "连接未激- 通道ID: " + channelId;
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        try {
            ChannelFuture future = conn.channel.writeAndFlush(data);
            future.addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture channelFuture) throws Exception {
                    if (channelFuture.isSuccess()) {
                        log.trace("数据发送成- 通道ID: {}", channelId);
                    } else {
                        log.error("数据发送失- 通道ID: {}", channelId, channelFuture.cause());
                        // 发送失败时，可以考虑重连或其他恢复策"
                        handleSendFailure(channelId, channelFuture.cause());
                    }
                }
            });
        } catch (Exception e) {
            log.error("发送数据时发生异常 - 通道ID: {}", channelId, e);
            throw e;
        }
    }

    /**
     * 处理发送失败的情况
     */
    private void handleSendFailure(String channelId, Throwable cause) {
        Connection conn = connections.get(channelId);
        if (conn != null && conn.watcher != null) {
            // 通知任务发送失"
            try {
                conn.watcher.log(LogType.EXCEPTION,
                        "数据发送失 " + cause.getMessage());
            } catch (Exception e) {
                log.error("记录发送失败日志时发生异常", e);
            }
        }
    }

    // 当连接通道接收到消息时的通知
    protected void notify(String tag, String channelId, String messageId, Object data) {
        log.trace("事件通知 - 通道ID: {}, 事件: {}, 消息ID: {}", channelId, tag, messageId);

        Connection conn = connections.get(channelId);
        if (conn != null) {
            log.debug("分发事件 - 通道ID: {}, 事件: {}, 任务ID: {}", channelId, tag, conn.watcher.getId());
            EventDispatcher.getInstance().dispatch(conn.watcher, tag, messageId, data);
        } else {
            log.error("事件分发失败，连接不存在 - 通道ID: {}, 事件: {}", channelId, tag);
        }
    }

    // 彻底关闭，用于进程退出时
    public void shutdown() throws Exception {
        log.info("关闭ConnectionPool - 当前连接{}", connections.size());

        // 关闭所有连"
        for (String channelId : connections.keySet()) {
            close(channelId);
        }

        group.shutdownGracefully().sync();
        log.info("ConnectionPool已完全关");
    }

    @Getter
    static final ConnectionPool instance = new ConnectionPool();

    public static void init() {
        log.debug("ConnectionPool初始化调");
        // do nothing here..
    }

    public boolean isActive(String channelId) {
        Connection c = connections.get(channelId);
        return c != null && c.channel != null && c.channel.isActive();
    }

    public static class Connection {
        public Channel channel;
        public AbstractDriveTask watcher;
        public long connectTime;
        public volatile long lastActiveTime;
        public volatile long messageCount;

        public Connection(Channel channel, AbstractDriveTask watcher) {
            this.channel = channel;
            this.watcher = watcher;
            this.connectTime = System.currentTimeMillis();
            this.lastActiveTime = this.connectTime;
            this.messageCount = 0L;
            log.trace("创建Connection对象 - 通道ID: {}, 任务ID: {}",
                    channel.id().asLongText(), watcher.getId());
        }
    }

    static class SimpleNettyHandler extends SimpleChannelInboundHandler<JTT808Message> {
        @Override
        public void channelActive(ChannelHandlerContext ctx) throws Exception {
            String channelId = ctx.channel().id().asLongText();
            log.info("通道激- 通道ID: {}, 远程地址: {}", channelId, ctx.channel().remoteAddress());
            Connection c = instance.connections.get(channelId);
            if (c != null) c.lastActiveTime = System.currentTimeMillis();
            instance.notify("connected", channelId, null, null);
        }

        @Override
        public void channelInactive(ChannelHandlerContext ctx) throws Exception {
            super.channelInactive(ctx);
            String channelId = ctx.channel().id().asLongText();
            log.info("通道断开 - 通道ID: {}", channelId);
            instance.notify("disconnected", channelId, null, null);
        }

        @Override
        protected void channelRead0(ChannelHandlerContext ctx, JTT808Message msg) throws Exception {
            String channelId = ctx.channel().id().asLongText();
            String msgId = String.format("%04x", msg.id & 0xffff);

            log.debug("接收消息 - 通道ID: {}, 消息ID: 0x{}, SIM: {}, 流水{}",
                    channelId, msgId.toUpperCase(), msg.sim, msg.sequence & 0xffff);

            Connection c = instance.connections.get(channelId);
            if (c != null) {
                c.lastActiveTime = System.currentTimeMillis();
                c.messageCount++;
            }
            instance.notify("message_received", channelId, msgId, msg);
        }

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
            String channelId = ctx.channel().id().asLongText();
            log.error("通道异常 - 通道ID: {}, 远程地址: {}", channelId, ctx.channel().remoteAddress(), cause);

            // 获取对应的连接和任务
            Connection conn = instance.connections.get(channelId);
            if (conn != null && conn.watcher != null) {
                try {
                    // 记录异常日志到任务中
                    conn.watcher.log(LogType.EXCEPTION,
                            "网络连接异常: " + cause.getMessage());

                    // 通知任务连接异常
                    instance.notify("exception", channelId, null, cause);
                } catch (Exception e) {
                    log.error("处理连接异常时发生错", e);
                }
            }

            // 清理连接
            instance.connections.remove(channelId);

            // 关闭通道
            ctx.close();

            log.info("异常连接已清- 通道ID: {}, 剩余连接{}", channelId, instance.connections.size());
        }
    }

    public static class ConnectionInfo {
        public String channelId;
        public String clientIp;
        public long connectTime;
        public long lastActiveTime;
        public long messageCount;
        public String status;
    }

    public java.util.List<ConnectionInfo> listConnections() {
        java.util.ArrayList<ConnectionInfo> list = new java.util.ArrayList<>(connections.size());
        for (java.util.Map.Entry<String, Connection> e : connections.entrySet()) {
            Connection c = e.getValue();
            ConnectionInfo info = new ConnectionInfo();
            info.channelId = e.getKey();
            java.net.SocketAddress ra = c.channel.remoteAddress();
            info.clientIp = (ra != null ? ra.toString() : "-");
            info.connectTime = c.connectTime;
            info.lastActiveTime = c.lastActiveTime;
            info.messageCount = c.messageCount;
            info.status = c.channel.isActive() ? "active" : "idle";
            list.add(info);
        }
        return list;
    }

    public int totalConnections() {
        return connections.size();
    }

    public int activeConnections() {
        int n = 0;
        for (Connection c : connections.values()) if (c.channel.isActive()) n++;
        return n;
    }
}


