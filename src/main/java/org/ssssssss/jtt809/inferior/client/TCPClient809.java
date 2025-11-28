package org.ssssssss.jtt809.inferior.client;

import java.util.concurrent.TimeUnit;

import io.netty.bootstrap.Bootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.DelimiterBasedFrameDecoder;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.timeout.IdleStateHandler;
import org.ssssssss.jtt809.common.protocol.JT809DecoderAdapter;
import org.ssssssss.jtt809.common.protocol.JT809EncodeAdapter;
import org.ssssssss.jtt809.common.util.PropertiesUtil;
import org.ssssssss.jtt809.inferior.client.handler.CliBusiHandler;
import org.ssssssss.jtt809.inferior.client.handler.HeartBeatHandler;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class TCPClient809 {

    private String ip = PropertiesUtil.getString("netty.server.ip", "127.0.0.1");
    private int port = PropertiesUtil.getInteger("netty.server.port", 8000);

    private int connectTimeoutMillis = 3000;

    private boolean tcpNoDelay = false;

    private boolean reuseAddress = true;

    private boolean keepAlive = true;

    private Bootstrap bootstrap = null;

    private Channel channel = null;

    private volatile boolean loggedIn = false;

    private static TCPClient809 instance = new TCPClient809();

    private TCPClient809() { init(); }

    public static TCPClient809 getInstance() { return instance; }

    public void setServer(String ip, int port) { this.ip = ip; this.port = port; }

    public boolean isLoggedIn() { return loggedIn; }
    public void setLoggedIn(boolean v) { this.loggedIn = v; }

    private void init() {
        bootstrap = new Bootstrap();
        bootstrap.option(ChannelOption.TCP_NODELAY, tcpNoDelay);
        bootstrap.option(ChannelOption.CONNECT_TIMEOUT_MILLIS,
                connectTimeoutMillis);
        bootstrap.option(ChannelOption.SO_REUSEADDR, reuseAddress);
        bootstrap.option(ChannelOption.SO_KEEPALIVE, keepAlive);

        int a = 0x5d;
        final ByteBuf delimiter = Unpooled.buffer(1);
        delimiter.writeByte(a);
        NioEventLoopGroup group = new NioEventLoopGroup();
        bootstrap.group(group).channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<NioSocketChannel>() {
                    @Override
                    protected void initChannel(NioSocketChannel ch) {
                        ch.pipeline().addLast(new LoggingHandler(LogLevel.DEBUG));
                        ch.pipeline().addLast(new DelimiterBasedFrameDecoder(
                                Integer.MAX_VALUE, false, delimiter));
                        ch.pipeline().addLast(new IdleStateHandler(0, 20, 0,
                                TimeUnit.SECONDS));
                        ch.pipeline().addLast(new HeartBeatHandler(instance));
                        ch.pipeline().addLast(new JT809DecoderAdapter());
                        ch.pipeline().addLast(new JT809EncodeAdapter());
                        ch.pipeline().addLast(new CliBusiHandler());
                    }
                });
    }

    public void doConnect() {
        if (channel != null && channel.isActive()) { return; }

        try {
            ChannelFuture future = bootstrap.connect(ip, port);

            future.addListener(new ChannelFutureListener() {
                public void operationComplete(ChannelFuture futureListener)
                        throws Exception {
                    if (futureListener.isSuccess()) {
                        channel = futureListener.channel();
                        log.info("Connect to server successfully!");
                    } else {
                        log.info(
                                "Failed to connect to server, try connect after 10s");

                        futureListener.channel().eventLoop().schedule(
                                instance::doConnect, 10, TimeUnit.SECONDS);
                    }
                }
            });
           future.sync();
        } catch (Exception e) {
            log.error("TCPClient809 getChannel error!");
        }
    }

    public boolean isConnected() { return channel != null && channel.isActive(); }

    public void disconnect() {
        Channel c = this.channel;
        this.channel = null;
        this.loggedIn = false;
        if (c != null) { c.close(); }
    }

    public Channel getChannel() { return channel; }
}
