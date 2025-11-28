package org.ssssssss.jtt808client.jtt808;

import org.ssssssss.jtt808client.util.Packet;
import lombok.extern.slf4j.Slf4j;

import java.io.OutputStream;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Slf4j
public final class JTT808Encoder {
    public static void write(JTT808Message message, OutputStream writer) {
        try {
            log.debug("开始写入JTT808消息到输出流，消息ID: 0x{}, SIM: {}",
                    String.format("%04X", message.id), message.sim);
            byte[] encoded = encode(message);
            writer.write(encoded);
            log.debug("成功写入JTT808消息到输出流，编码后长度: {} 字节", encoded.length);
        } catch (Exception ex) {
            log.error("写入JTT808消息到输出流失败，消息ID: 0x{}, 错误: {}",
                    String.format("%04X", message.id), ex.getMessage(), ex);
            throw new RuntimeException(ex);
        }
    }

    public static byte[] encode(JTT808Message message) {
        log.debug("开始编码JTT808消息，消息ID: 0x{}, SIM: {}, 消息体长{}",
                String.format("%04X", message.id), message.sim,
                message.body != null ? message.body.length : 0);

        if (message.body.length > 1024) {
            log.error("消息体长度超1024字节限制: {} 字节", message.body.length);
            throw new RuntimeException("message body size exceed 1024: " + message.body.length);
        }

        // 预分配合适大小的缓冲区，避免频繁扩容
        int estimatedSize = 20 + message.body.length * 2; // 预估大小，考虑转义字符
        Packet packet = Packet.create(estimatedSize);

        byte crc = (byte) (((message.id >> 8) & 0xff) ^ (message.id & 0xff));
        log.trace("初始CRC校验0x{}", String.format("%02X", crc & 0xff));

        short attr = (short) (message.body.length & 0x3ff);
        if (message.packetCount > 0) {
            attr = (short) (attr | (1 << 13));
            log.debug("消息为分包消息，包总数: {}, 当前包序{}", message.packetCount, message.packetIndex);
        }
        crc = (byte) (crc ^ ((attr >> 8) & 0xff) ^ (attr & 0xff));

        // 优化SIM卡号编码，减少字符串操作
        byte[] sim = new byte[6];
        String simStr = message.sim;
        int simLen = Math.min(simStr.length(), 12); // 确保不超"2"

        for (int i = 0, k = 0; i < simLen && k < 6; i += 2, k++) {
            char a = i < simLen ? (char) (simStr.charAt(i) - '0') : 0;
            char b = (i + 1) < simLen ? (char) (simStr.charAt(i + 1) - '0') : 0;
            sim[k] = (byte) (a << 4 | b);
            crc = (byte) (crc ^ sim[k]);
        }
        log.trace("SIM卡号编码完成: {}", message.sim);

        crc = (byte) (crc ^ ((message.sequence >> 8) & 0xff));
        crc = (byte) (crc ^ ((message.sequence) & 0xff));
        log.trace("消息流水{}", message.sequence);

        if (message.packetCount > 0) {
            crc = (byte) (crc ^ ((message.packetCount >> 8) & 0xff) ^ (message.packetCount & 0xff));
            crc = (byte) (crc ^ ((message.packetIndex >> 8) & 0xff) ^ (message.packetIndex & 0xff));
        }

        // 优化消息体CRC计算
        for (byte b : message.body) {
            crc = (byte) (crc ^ b);
        }
        log.trace("最终CRC校验 0x{}", String.format("%02X", crc & 0xff));

        // 拼包
        packet.addByte((byte) 0x7e);
        packet.addByteAutoQuote((byte) (message.id >> 8));
        packet.addByteAutoQuote((byte) (message.id & 0xff));
        packet.addByteAutoQuote((byte) (attr >> 8));
        packet.addByteAutoQuote((byte) (attr & 0xff));
        for (byte b : sim) packet.addByteAutoQuote(b);
        packet.addByteAutoQuote((byte) (message.sequence >> 8));
        packet.addByteAutoQuote((byte) (message.sequence & 0xff));

        if (message.packetCount > 0) {
            packet.addByteAutoQuote((byte) (message.packetCount >> 8));
            packet.addByteAutoQuote((byte) (message.packetCount & 0xff));

            packet.addByteAutoQuote((byte) (message.packetIndex >> 8));
            packet.addByteAutoQuote((byte) (message.packetIndex & 0xff));
        }

        for (byte b : message.body) packet.addByteAutoQuote(b);
        packet.addByteAutoQuote(crc);
        packet.addByte((byte) 0x7e);

        byte[] result = packet.getBytes();
        log.debug("JTT808消息编码完成，消息ID: 0x{}, 编码后长{} 字节",
                String.format("%04X", message.id), result.length);

        if (log.isTraceEnabled()) {
            StringBuilder hex = new StringBuilder(result.length * 3);
            for (byte b : result) {
                hex.append(String.format("%02X ", b & 0xff));
            }
            log.trace("编码后的十六进制数据: {}", hex.toString().trim());
        }

        return result;
    }
}


