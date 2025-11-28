package org.ssssssss.jtt809.inferior.client.handler;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import org.ssssssss.jtt809.common.packet.JT809BasePacket;
import org.ssssssss.jtt809.common.packet.JT809LoginResponsePacket;
import org.ssssssss.jtt809.common.util.constant.Const;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.ssssssss.jtt809.inferior.client.TCPClient809;

public class CliBusiHandler extends SimpleChannelInboundHandler<JT809BasePacket> {
    private static final Logger log = LoggerFactory.getLogger(CliBusiHandler.class);
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, JT809BasePacket msg) throws Exception {
        if (msg instanceof JT809LoginResponsePacket) {
            JT809LoginResponsePacket rsp = (JT809LoginResponsePacket) msg;
            boolean ok = rsp.getResult() == Const.LoginResponseCode.SUCCESS;
            TCPClient809.getInstance().setLoggedIn(ok);
            if (ok) {
                log.info("809主链路登录成功");
            } else {
                log.warn("809主链路登录失败, result={}", rsp.getResult());
            }
        }
    }
}
