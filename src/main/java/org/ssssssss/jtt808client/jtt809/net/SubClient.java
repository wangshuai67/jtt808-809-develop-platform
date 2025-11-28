package org.ssssssss.jtt808client.jtt809.net;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class SubClient {
    private final EventLoopGroup group = new NioEventLoopGroup(1);
    private Channel channel;
    private long centerId;
    private String version = "2011";
    private int encryptEnable = 0;

    public void connect(String host, int port) throws Exception {
        Bootstrap b = new Bootstrap();
        b.group(group)
                .channel(NioSocketChannel.class)
                .option(ChannelOption.TCP_NODELAY, true)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                    }
                });
        ChannelFuture f = b.connect(host, port).sync();
        channel = f.channel();
        if (log.isInfoEnabled()) log.info("809从链路连接 host={} port={}", host, port);
    }

    public void configure(long centerId, String version, int encryptEnable) {
        this.centerId = centerId;
        this.version = version == null ? "2011" : version;
        this.encryptEnable = encryptEnable;
        if (log.isInfoEnabled()) log.info("809从链路配置 cid={} ver={} enc={}", centerId, this.version, encryptEnable);
    }

    public boolean isConnected() {
        return channel != null && channel.isActive();
    }

    public void send(byte[] bytes) {
        if (channel != null && channel.isActive()) {
            channel.writeAndFlush(Unpooled.wrappedBuffer(bytes));
        }
    }

    public void sendRealLocation(String plate, double lon, double lat) {
        if (channel != null && channel.isActive()) {
            byte[] msg = org.ssssssss.jtt808client.jtt809.inferior.JT809EncodeAdapter.subRealLocation(centerId, version, 0, plate, lon, lat);
            channel.writeAndFlush(Unpooled.wrappedBuffer(msg));
            String hex = toHex(msg, 192);
            if (log.isInfoEnabled()) log.info("809从链路位置发送 plate={} lon={} lat={} len={} hex={}", plate, lon, lat, msg.length, hex);
            try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("MESSAGE_OUT", hex); } catch (Throwable ignore) {}
        }
    }

    private String toHex(byte[] b, int max) {
        int n = Math.min(b.length, Math.max(0, max));
        StringBuilder sb = new StringBuilder(n * 3);
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(' ');
            sb.append(String.format("%02X", b[i]));
        }
        if (b.length > n) sb.append(" ...");
        return sb.toString();
    }

    public void disconnect() {
        try {
            if (channel != null) {
                channel.close().syncUninterruptibly();
                channel = null;
            }
        } finally {
            log.info("809从链路断开");
            group.shutdownGracefully();
        }
    }
}
