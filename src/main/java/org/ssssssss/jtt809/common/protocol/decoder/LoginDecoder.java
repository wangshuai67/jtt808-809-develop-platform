package org.ssssssss.jtt809.common.protocol.decoder;

import java.nio.charset.Charset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.netty.buffer.ByteBuf;
import org.ssssssss.jtt809.common.config.EncryptConfig;
import org.ssssssss.jtt809.common.packet.JT809BasePacket;
import org.ssssssss.jtt809.common.packet.JT809LoginPacket;
import org.ssssssss.jtt809.common.util.CommonUtils;
import org.ssssssss.jtt809.common.util.Jtt809Util;
import org.ssssssss.jtt809.common.util.PacketDecoderUtils;
import org.ssssssss.jtt809.common.util.constant.Const;

/**
 * 登录解码器
 */
public class LoginDecoder implements Decoder {
    private static Logger log = LoggerFactory.getLogger(LoginDecoder.class);

    @Override
    public JT809BasePacket decoder(byte[] bytes)  {
        JT809LoginPacket loginPacket = new JT809LoginPacket();
        ByteBuf byteBuf = PacketDecoderUtils.baseDecoder(bytes, loginPacket);
        loginPacketDecoder(byteBuf,loginPacket);
        return loginPacket;
    }

    private void loginPacketDecoder(ByteBuf byteBuf,JT809LoginPacket loginPacket) {
        ByteBuf msgBodyBuf = null;
        if (loginPacket.getEncryptFlag() == Const.Encrypt.NO) {
            log.info("packet no encry, contine to process.");
            msgBodyBuf = PacketDecoderUtils.getMsgBodyBuf(byteBuf);
        } else {
            log.info("packet is encry, continue to process.");
            byte[] msgBodyArr =  Jtt809Util.encrypt(
                    EncryptConfig.getInstance().getM1(),
                    EncryptConfig.getInstance().getIa1(),
                    EncryptConfig.getInstance().getIc1(), loginPacket.getEncryptKey(),
                    PacketDecoderUtils.getMsgBodyByteArr(byteBuf));
            msgBodyBuf = CommonUtils.getByteBuf(msgBodyArr);
        }

        loginPacket.setUserId(msgBodyBuf.readInt());

        byte[] passwordBytes = new byte[8];
        msgBodyBuf.readBytes(passwordBytes);
        loginPacket.setPassword(new String(passwordBytes, Charset.forName("GBK")));

        byte[] downLinkIpBytes = new byte[32];
        msgBodyBuf.readBytes(downLinkIpBytes);
        loginPacket.setDownLinkIp(new String(downLinkIpBytes));

        loginPacket.setDownLinkPort(msgBodyBuf.readShort());

    }
}

