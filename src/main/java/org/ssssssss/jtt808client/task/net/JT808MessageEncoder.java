package org.ssssssss.jtt808client.task.net;

import org.ssssssss.jtt808client.jtt808.JTT808Encoder;
import org.ssssssss.jtt808client.jtt808.JTT808Message;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.MessageToByteEncoder;
import lombok.extern.slf4j.Slf4j;

/**
 * Created by matrixy when 2020/5/10.
 */
@Slf4j
public class JT808MessageEncoder extends MessageToByteEncoder<JTT808Message>
{
    @Override
    protected void encode(ChannelHandlerContext ctx, JTT808Message msg, ByteBuf out) throws Exception
    {
        log.debug("编码JTT808消息到ByteBuf，消息ID: 0x{}, SIM: {}", 
                 String.format("%04X", msg.id), msg.sim);
        out.writeBytes(JTT808Encoder.encode(msg));
    }
}


