package org.ssssssss.jtt808client.task.net;

import org.ssssssss.jtt808client.jtt808.JTT808Message;
import org.ssssssss.jtt808client.util.Packet;
import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.ByteToMessageDecoder;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * Created by matrixy when 2020/5/10.
 */
@Slf4j
public class JT808MessageDecoder extends ByteToMessageDecoder
{
    // 缓冲区，消息体长度最"0位，再加上消息结"
    byte[] buffer = new byte[1024 + 32];

    @Override
    protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) throws Exception
    {
        if (in.readableBytes() < 15) {
            log.trace("可读字节数不小于15，等待更多数据，当前可读字节{}", in.readableBytes());
            return;
        }

        log.trace("开始解码JTT808消息，可读字节数: {}", in.readableBytes());

        for (int i = 10; i < in.readableBytes(); i++)
        {
            if (in.getByte(in.readerIndex() + i) == 0x7E)
            {
                log.trace("找到消息结束标志0x7E，位{}", i);
                
                ByteBuf block = in.readSlice(i + 1);
                int blkLen = block.capacity();
                block.readBytes(buffer, 0, blkLen);
                log.trace("读取到完整消息包，长{} 字节", blkLen);

                if (buffer[0] != 0x7E || buffer[blkLen - 1] != 0x7E) {
                    continue;
                }

                Packet unq = Packet.create(blkLen);
                for (int k = 1; k < blkLen - 1; k++) {
                    byte b = buffer[k];
                    if (b == 0x7D && k + 1 < blkLen - 1) {
                        byte e = buffer[++k];
                        if (e == 0x01) unq.addByte((byte)0x7D);
                        else if (e == 0x02) unq.addByte((byte)0x7E);
                        else {
                            unq.addByte((byte)0x7D);
                            unq.addByte(e);
                        }
                    } else {
                        unq.addByte(b);
                    }
                }

                byte[] content = unq.getBytes();
                if (content.length < 2) {
                    continue;
                }

                byte expected = content[content.length - 1];
                byte calc = content[0];
                for (int k = 1; k < content.length - 1; k++) {
                    calc = (byte)(calc ^ content[k]);
                }
                if (calc != expected) {
                    log.error("CRC校验失败 0x{}, 实际: 0x{}",
                             String.format("%02X", expected & 0xff), String.format("%02X", calc & 0xff));
                    continue;
                } else {
                    log.trace("CRC校验通过: 0x{}", String.format("%02X", expected & 0xff));
                }

                Packet query = Packet.create(content);
                short id = query.nextShort();
                short attr = query.nextShort();
                short packetCount = -1, packetIndex = -1;
                int bodyLength = attr & 0x03ff;
                String sim = query.nextBCD()
                        + query.nextBCD()
                        + query.nextBCD()
                        + query.nextBCD()
                        + query.nextBCD()
                        + query.nextBCD();
                short sequence = query.nextShort();

                log.debug("解析消息- 消息ID: 0x{}, SIM: {}, 流水{}, 消息体长{}",
                         String.format("%04X", id & 0xffff), sim, sequence & 0xffff, bodyLength);

                if ((attr & (1 << 13)) > 0)
                {
                    packetCount = query.nextShort();
                    packetIndex = query.nextShort();
                    log.debug("分包消息 - 总包{}, 当前包序{}", packetCount & 0xffff, packetIndex & 0xffff);
                }

                byte[] body = query.nextBytes(bodyLength);

                if (log.isTraceEnabled() && body.length > 0) {
                    StringBuilder hex = new StringBuilder();
                    for (byte b : body) {
                        hex.append(String.format("%02X ", b & 0xff));
                    }
                    log.trace("消息体内{}", hex.toString().trim());
                }

                JTT808Message msg = new JTT808Message();
                msg.id = id;
                msg.sim = sim;
                msg.sequence = sequence;
                msg.body = body;
                msg.packetIndex = packetIndex;
                msg.packetCount = packetCount;

                log.debug("成功解码JTT808消息: {}", msg);
                out.add(msg);

                i = 0;
            }
        }
        
        log.trace("解码完成，输出消息数{}", out.size());
    }
}


