package org.ssssssss.jtt809.common.protocol.encoder;

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import org.ssssssss.jtt809.common.packet.JT809BasePacket;


public interface Encoder {
    /** 编码*/
    void encode(ChannelHandlerContext ctx, JT809BasePacket packet, ByteBuf out);
}

