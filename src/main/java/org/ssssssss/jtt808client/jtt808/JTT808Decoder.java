package org.ssssssss.jtt808client.jtt808;

import org.ssssssss.jtt808client.util.Packet;
import lombok.extern.slf4j.Slf4j;

/**
 * Created by houcheng when 2018/7/1.
 * JTT808协议解码器，用于解析JTT808消息
 */
@Slf4j
public final class JTT808Decoder {
    /**
     * 解码JTT808消息
     *
     * @param buffer 原始字节数据
     * @return 解码后的消息包，如果解码失败返回null
     */
    public static JTT808Message decode(byte[] buffer) {
        if (buffer == null || buffer.length < 15) {
            log.warn("消息长度不足，无法解码，长度: {}", buffer != null ? buffer.length : 0);
            return null;
        }

        // 检查消息头尾标"
        if (buffer[0] != 0x7E || buffer[buffer.length - 1] != 0x7E) {
            log.warn("消息格式错误，缺0x7E标志");
            return null;
        }

        try {
            log.debug("开始解码JTT808消息，原始长{} 字节", buffer.length);

            Packet packet = Packet.create(buffer);
            packet.seek(1); // 跳过起始标志

            // 读取消息"
            short id = packet.nextShort();
            short attr = packet.nextShort();

            // 解析消息属"
            int bodyLength = attr & 0x03ff;
            boolean isSubPackage = (attr & (1 << 13)) > 0;

            // 读取SIM卡号
            String sim = packet.nextBCD()
                    + packet.nextBCD()
                    + packet.nextBCD()
                    + packet.nextBCD()
                    + packet.nextBCD()
                    + packet.nextBCD();

            short sequence = packet.nextShort();

            log.debug("解析消息- 消息ID: 0x{}, SIM: {}, 流水{}, 消息体长{}",
                    String.format("%04X", id & 0xffff), sim, sequence & 0xffff, bodyLength);

            // 处理分包信息
            short packetCount = -1, packetIndex = -1;
            if (isSubPackage) {
                packetCount = packet.nextShort();
                packetIndex = packet.nextShort();
                log.debug("分包消息 - 总包{}, 当前包序{}", packetCount & 0xffff, packetIndex & 0xffff);
            }

            // 读取消息"
            byte[] body = packet.nextBytes(bodyLength);

            // 验证CRC校验"
            byte expectedCrc = packet.nextByte();
            byte actualCrc = calculateCRC(buffer, 1, buffer.length - 2);

            if (expectedCrc != actualCrc) {
                log.error("CRC校验失败 0x{}, 实际: 0x{}",
                        String.format("%02X", expectedCrc & 0xff), String.format("%02X", actualCrc & 0xff));
                return null;
            }

            log.trace("CRC校验通过: 0x{}", String.format("%02X", expectedCrc & 0xff));

            // 构建消息对象
            JTT808Message message = new JTT808Message();
            message.id = id;
            message.sim = sim;
            message.sequence = sequence;
            message.body = body;
            message.packetIndex = packetIndex;
            message.packetCount = packetCount;

            log.debug("成功解码JTT808消息: {}", message);
            return message;

        } catch (Exception e) {
            log.error("解码JTT808消息时发生异{}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * 计算CRC校验"
     *
     * @param buffer 数据缓冲"
     * @param start  开始位"
     * @param end    结束位置
     * @return CRC校验"
     */
    private static byte calculateCRC(byte[] buffer, int start, int end) {
        byte crc = buffer[start];
        for (int i = start + 1; i < end; i++) {
            crc = (byte) (crc ^ buffer[i]);
        }
        return crc;
    }
}


