package org.ssssssss.jtt809.common.packet;

import org.ssssssss.jtt809.common.util.constant.Const;

/**
 * 心跳应答包
 */
public class JT809HeartbeatResponse extends JT809BasePacket {
    public JT809HeartbeatResponse() {
        setMsgLength(getFixedByteLength());
        setMsgId(Const.BusinessDataType.UP_LINKTEST_RSP);
    }

    @Override
    public byte[] getMsgBodyByteArr() {
        return new byte[0];
    }
}

