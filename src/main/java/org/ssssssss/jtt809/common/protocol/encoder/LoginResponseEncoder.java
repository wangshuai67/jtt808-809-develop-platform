package org.ssssssss.jtt809.common.protocol.encoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import org.ssssssss.jtt809.common.packet.JT809BasePacket;


public class LoginResponseEncoder implements Encoder {
    private static Logger log = LoggerFactory
            .getLogger(LoginResponseEncoder.class);

    @Override
    public void encode(ChannelHandlerContext ctx, JT809BasePacket packet,
            ByteBuf out) {
        log.info("start to encode login respond");

    }

}

