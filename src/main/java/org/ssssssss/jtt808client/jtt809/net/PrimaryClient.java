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

import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;

import org.ssssssss.jtt808client.jtt809.JT809DemoMessages;

@Slf4j
public class PrimaryClient {
    private final EventLoopGroup group = new NioEventLoopGroup(1);
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private Channel channel;
    private long centerId;
    private String version = "2011";
    private int encryptEnable = 0;
    private String userId;
    private String password;
    private String host;
    private int port;
    private volatile boolean loggedIn = false;
    private Runnable onLoginSuccess;
    private long m1 = 0L;
    private long ia1 = 0L;
    private long ic1 = 0L;
    private java.util.concurrent.ScheduledFuture<?> heartbeatFuture;
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

    public void configure(long centerId, String version, int encryptEnable, String userId, String password, long m1, long ia1, long ic1) {
        this.centerId = centerId;
        this.version = version == null ? "2011" : version;
        this.encryptEnable = encryptEnable;
        this.userId = userId;
        this.password = password;
        this.m1 = m1;
        this.ia1 = ia1;
        this.ic1 = ic1;
        if (log.isInfoEnabled()) log.info("809主链路配置 cid={} ver={} enc={} uid={}", centerId, this.version, encryptEnable, userId);
    }

    public void setOnLoginSuccess(Runnable r) {
        this.onLoginSuccess = r;
    }

    public void connect(String host, int port) throws Exception {
        this.host = host;
        this.port = port;
        Bootstrap b = new Bootstrap();
        b.group(group)
                .channel(NioSocketChannel.class)
                .option(ChannelOption.TCP_NODELAY, true)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                        ch.pipeline().addLast(new io.netty.channel.ChannelInboundHandlerAdapter() {
                            private byte[] buf = new byte[0];
                            @Override
                            public void channelRead(io.netty.channel.ChannelHandlerContext ctx, Object msg) {
                                io.netty.buffer.ByteBuf bb = (io.netty.buffer.ByteBuf) msg;
                                byte[] arr = new byte[bb.readableBytes()];
                                bb.readBytes(arr);
                                buf = append(buf, arr);
                                while (true) {
                                    int s = indexOf(buf, (byte)0x5B, 0);
                                    if (s < 0) break;
                                    int e = indexOf(buf, (byte)0x5D, s+1);
                                    if (e < 0) break;
                                    byte[] frame = new byte[e - s - 1];
                                    System.arraycopy(buf, s+1, frame, 0, frame.length);
                                    byte[] raw = unescape(frame);
                                    handleFrame(raw);
                                    byte[] rest = new byte[buf.length - (e + 1)];
                                    System.arraycopy(buf, e+1, rest, 0, rest.length);
                                    buf = rest;
                                }
                                bb.release();
                            }

                            private byte[] append(byte[] a, byte[] b) {
                                byte[] r = new byte[a.length + b.length];
                                System.arraycopy(a, 0, r, 0, a.length);
                                System.arraycopy(b, 0, r, a.length, b.length);
                                return r;
                            }

                            private int indexOf(byte[] a, byte v, int from) {
                                for (int i = from; i < a.length; i++) if (a[i] == v) return i;
                                return -1;
                            }

                            private byte[] unescape(byte[] src) {
                                byte[] tmp = new byte[src.length];
                                int p = 0;
                                for (int i = 0; i < src.length; i++) {
                                    byte b = src[i];
                                    if (b == 0x5A && i+1 < src.length) {
                                        byte n = src[++i];
                                        if (n == 0x01) tmp[p++] = 0x5B; 
                                        else if (n == 0x02) tmp[p++] = 0x5D; 
                                        else { tmp[p++] = 0x5A; tmp[p++] = n; }
                                    } else if (b == 0x5E && i+1 < src.length) {
                                        byte n = src[++i];
                                        if (n == 0x01) tmp[p++] = 0x5A; 
                                        else if (n == 0x02) tmp[p++] = 0x5E; 
                                        else { tmp[p++] = 0x5E; tmp[p++] = n; }
                                    } else {
                                        tmp[p++] = b;
                                    }
                                }
                                byte[] r = new byte[p];
                                System.arraycopy(tmp, 0, r, 0, p);
                                return r;
                            }

    private void handleFrame(byte[] raw) {
        if (raw.length < 24) return;
        int calculatedCrc = org.ssssssss.jtt808client.jtt809.inferior.PacketEncoderUtils.crc16X25(raw, 4, raw.length - 4 - 2);
        int receivedCrc = ((raw[raw.length - 2] & 0xff) << 8) | (raw[raw.length - 1] & 0xff);
        if (calculatedCrc != receivedCrc) {
             if (log.isWarnEnabled()) log.warn("809 CRC mismatch calc=0x{} recv=0x{}", Integer.toHexString(calculatedCrc), Integer.toHexString(receivedCrc));
             System.out.println("[809 ERROR] CRC verification failed! calc=" + Integer.toHexString(calculatedCrc) + " recv=" + Integer.toHexString(receivedCrc));
             return;
        }
        int msgId = ((raw[8] & 0xff) << 8) | (raw[9] & 0xff);
        String inHex = toHex(raw, 256);
        if (log.isInfoEnabled()) log.info("809主链路收到 msgId=0x{} len={} hex={}", Integer.toHexString(msgId), raw.length, inHex);
        System.out.println("[809 MESSAGE_IN] " + inHex);
        try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("MESSAGE_IN", inHex); } catch (Throwable ignore) {}
        try {
            org.ssssssss.jtt808client.jtt809.JT809TaskService ts = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class);
            ts.appendLogAll("MESSAGE_IN", toHex(raw, 256));
        } catch (Throwable ignore) {}
        int bodyStart = 22;
        int bodyLen = raw.length - bodyStart - 2;
        if (bodyLen < 0) bodyLen = 0;
        if (msgId == 0x1002) {
            int result = bodyLen >= 1 ? (raw[bodyStart] & 0xff) : 255;
            String desc;
            switch (result) {
                case 0: desc = "成功"; break;
                case 1: desc = "验证码错误"; break;
                case 2: desc = "资源不足"; break;
                case 3: desc = "其他错误"; break;
                default: desc = "未知";
            }
            if (log.isInfoEnabled()) log.info("809主链路登录应答 result=0x{} {}", Integer.toHexString(result), desc);
            System.out.println("[809 ACK] 登录应答 result=0x" + String.format("%02X", result) + " " + desc);
            try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("ACK_IN", "LOGIN_ACK " + desc + " hex=" + inHex); } catch (Throwable ignore) {}
            try { org.ssssssss.jtt808client.jtt809.JT809TaskService ts = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class); ts.appendLogAll("ACK_IN", "LOGIN_ACK " + desc); } catch (Throwable ignore) {}
            if (result == 0) {
                loggedIn = true;
                if (onLoginSuccess != null) onLoginSuccess.run();
                if (heartbeatFuture == null) {
                    heartbeatFuture = scheduler.scheduleAtFixedRate(() -> {
                        if (channel != null && channel.isActive() && loggedIn) {
                            byte[] hb = org.ssssssss.jtt808client.jtt809.inferior.JT809EncodeAdapter.heartbeat(centerId, version, 0);
                            channel.writeAndFlush(io.netty.buffer.Unpooled.wrappedBuffer(hb));
                            String outHex = toHex(hb, 128);
                            if (log.isInfoEnabled()) log.info("809主链路心跳发送 len={} hex={}", hb.length, outHex);
                            System.out.println("[809 MESSAGE_OUT] " + outHex);
                            try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("MESSAGE_OUT", outHex); } catch (Throwable ignore) {}
                            try { org.ssssssss.jtt808client.jtt809.JT809TaskService ts = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class); ts.appendLogAll("MESSAGE_OUT", outHex); } catch (Throwable ignore) {}
                        }
                    }, 5, 5, java.util.concurrent.TimeUnit.SECONDS);
                }
            } else {
                loggedIn = false;
            }
        }
        if (msgId == 0x1006) {
            if (log.isInfoEnabled()) log.info("809主链路心跳应答");
            System.out.println("[809 ACK] 心跳应答");
            try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("ACK_IN", "HEARTBEAT_ACK hex=" + inHex); } catch (Throwable ignore) {}
            try { org.ssssssss.jtt808client.jtt809.JT809TaskService ts = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class); ts.appendLogAll("ACK_IN", "HEARTBEAT_ACK"); } catch (Throwable ignore) {}
        }
    }
                        });
                    }
                });
        ChannelFuture f = b.connect(host, port).sync();
        channel = f.channel();
        byte[] login = org.ssssssss.jtt808client.jtt809.inferior.JT809EncodeAdapter.mainLinkLogin(centerId, version, encryptEnable, m1, ia1, ic1, userId, password, host, port);
        channel.writeAndFlush(Unpooled.wrappedBuffer(login));
        String loginHex = toHex(login, 256);
        if (log.isInfoEnabled()) log.info("809主链路登录发送 host={} port={} len={} hex={}", host, port, login.length, loginHex);
        System.out.println("[809 MESSAGE_OUT] " + loginHex);
        try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("MESSAGE_OUT", loginHex); } catch (Throwable ignore) {}

        scheduler.scheduleAtFixedRate(() -> {
            try {
                if (channel != null && channel.isActive() && !loggedIn) {
                    byte[] lg = org.ssssssss.jtt808client.jtt809.inferior.JT809EncodeAdapter.mainLinkLogin(centerId, version, encryptEnable, m1, ia1, ic1, userId, password, host, port);
                    channel.writeAndFlush(Unpooled.wrappedBuffer(lg));
                    String hx = toHex(lg, 256);
                    if (log.isInfoEnabled()) log.info("809主链路登录重试 len={} hex={}", lg.length, hx);
                    System.out.println("[809 MESSAGE_OUT] " + hx);
                    try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("MESSAGE_OUT", hx); } catch (Throwable ignore) {}
                }
            } catch (Throwable ignore) {}
        }, 3, 3, TimeUnit.SECONDS);
    }

    public boolean isConnected() {
        return channel != null && channel.isActive();
    }

    public void sendUpRealLocation(String plate, double lon, double lat) {
        if (channel != null && channel.isActive() && loggedIn) {
            byte[] msg = org.ssssssss.jtt808client.jtt809.inferior.JT809EncodeAdapter.upRealLocationMain(centerId, version, encryptEnable, m1, ia1, ic1, plate, lon, lat);
            channel.writeAndFlush(Unpooled.wrappedBuffer(msg));
            String locHex = toHex(msg, 256);
            if (log.isInfoEnabled()) log.info("809主链路上报位置 plate={} lon={} lat={} len={} hex={}", plate, lon, lat, msg.length, locHex);
            System.out.println("[809 MESSAGE_OUT] " + locHex);
            try { org.ssssssss.jtt808client.jtt809.HexFileLogger.log("MESSAGE_OUT", locHex); } catch (Throwable ignore) {}
            try {
                org.ssssssss.jtt808client.jtt809.JT809TaskService ts = org.ssssssss.jtt808client.util.BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class);
                ts.appendLogByPlate(plate, "MESSAGE_OUT", locHex);
            } catch (Throwable ignore) {}
        } else {
            if (log.isWarnEnabled()) log.warn("809主链路未登录，位置上报被忽略 plate={}", plate);
            System.out.println("[809 WARN] 未登录，丢弃位置上报 plate=" + plate);
        }
    }

    public void disconnect() {
        try {
            if (channel != null) {
                channel.close().syncUninterruptibly();
                channel = null;
            }
        } finally {
            try { if (heartbeatFuture != null) { heartbeatFuture.cancel(true); heartbeatFuture = null; } } catch (Throwable ignore) {}
            scheduler.shutdownNow();
            group.shutdownGracefully();
        }
    }
}
