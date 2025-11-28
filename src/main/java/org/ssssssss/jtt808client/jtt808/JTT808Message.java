package org.ssssssss.jtt808client.jtt808;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class JTT808Message {
    static final byte[] ZERO_LENGTH_ARRAY = new byte[0];

    /** 消息ID */
    public int id;

    /** 终端手机"*/
    public String sim;

    /** 当前包序"*/
    public int packetIndex;

    /** 总包数量 */
    public int packetCount;

    /** 消息流水"*/
    public int sequence;

    /**
     * 协议版本，默"013"
     */
    public JTT808Version version = JTT808Version.JTT808_2013;

    /** 消息"*/
    public byte[] body;

    /**
     * 构造函数，创建指定消息ID的JTT808消息
     * @param id 消息ID
     */
    public JTT808Message(int id) {
        log.debug("创建JTT808消息，消息ID: 0x{}", String.format("%04X", id));
        this.id = id;
        this.body = ZERO_LENGTH_ARRAY;
    }

    /**
     * 构造函数，创建带消息体的JTT808消息
     * @param id 消息ID
     * @param body 消息"
     */
    public JTT808Message(int id, byte[] body) {
        log.debug("创建JTT808消息，消息ID: 0x{}, 消息体长{}", String.format("%04X", id), body != null ? body.length : 0);
        this.id = id;
        this.body = body;
    }

    /**
     * 构造函数，创建完整的JTT808消息
     * @param id 消息ID
     * @param sim 终端手机"
     * @param body 消息"
     */
    public JTT808Message(int id, String sim, byte[] body) {
        log.debug("创建JTT808消息，消息ID: 0x{}, SIM: {}, 消息体长{}", 
                 String.format("%04X", id), sim, body != null ? body.length : 0);
        this.id = id;
        this.sim = sim;
        this.body = body;
    }

    @Override
    public String toString() {
        return String.format("JTT808Message{id=0x%04X, sim='%s', sequence=%d, bodyLength=%d}", 
                           id, sim, sequence, body != null ? body.length : 0);
    }
}


