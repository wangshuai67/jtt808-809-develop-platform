package org.ssssssss.jtt809.inferior.client.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import org.ssssssss.jtt809.inferior.client.TCPClient809;
import org.ssssssss.jtt808client.jtt809.JT809ClientManager;
import org.ssssssss.jtt808client.util.BeanUtils;

public class HeartBeatHandler extends ChannelInboundHandlerAdapter {
    private final TCPClient809 client;
    public HeartBeatHandler(TCPClient809 client) { this.client = client; }
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        super.channelActive(ctx);
        try {
            TCPClient809.getInstance().setLoggedIn(false);
            JT809ClientManager mgr = BeanUtils.create(JT809ClientManager.class);
            mgr.sendLoginOnce();
        } catch (Throwable ignore) {}
    }
}
