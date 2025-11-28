package org.ssssssss.jtt809.common.packet;

import org.ssssssss.jtt809.common.util.constant.Const;

/**
 * 登录应答包
 */
public class JT809LoginResponsePacket extends JT809BasePacket {

    public JT809LoginResponsePacket() {
        setMsgLength(getFixedByteLength() + 1);
        setMsgId(Const.BusinessDataType.UP_CONNECT_RSP);
    }

    /** 应答结果 1字节 */
    private byte result;
    public byte getResult() { return result; }
    public void setResult(byte result) { this.result = result; }

    @Override
    public byte[] getMsgBodyByteArr() {
        return new byte[]{result};
    }
}

