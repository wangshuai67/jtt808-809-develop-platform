package org.ssssssss.jtt809.common.protocol.decoder;

import org.ssssssss.jtt809.common.packet.JT809BasePacket;


public interface Decoder {
    /**
     *
     * @param bytes
     * @return
     */
    JT809BasePacket decoder(byte[] bytes);
}

