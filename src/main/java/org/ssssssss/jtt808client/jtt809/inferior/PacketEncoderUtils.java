package org.ssssssss.jtt808client.jtt809.inferior;

public final class PacketEncoderUtils {
    static final byte START = 0x5B;
    static final byte END = 0x5D;

    static void writeIntBE(byte[] buf, int off, int v) {
        buf[off] = (byte) ((v >> 24) & 0xff);
        buf[off + 1] = (byte) ((v >> 16) & 0xff);
        buf[off + 2] = (byte) ((v >> 8) & 0xff);
        buf[off + 3] = (byte) (v & 0xff);
    }

    static void writeShortBE(byte[] buf, int off, short v) {
        buf[off] = (byte) ((v >> 8) & 0xff);
        buf[off + 1] = (byte) (v & 0xff);
    }

    static byte[] concat(byte[]... arrs) {
        int len = 0; for (byte[] a : arrs) len += a.length;
        byte[] r = new byte[len]; int p = 0;
        for (byte[] a : arrs) { System.arraycopy(a, 0, r, p, a.length); p += a.length; }
        return r;
    }

    public static int crc16X25(byte[] data, int off, int len) {
        int crc = 0xFFFF;
        for (int i = off; i < off + len; i++) {
            crc ^= (data[i] & 0xFF);
            for (int j = 0; j < 8; j++) {
                if ((crc & 1) != 0) crc = (crc >> 1) ^ 0x8408; else crc = crc >> 1;
            }
        }
        crc = ~crc;
        return ((crc << 8) & 0xFF00) | ((crc >> 8) & 0xFF);
    }

    static byte[] escape(byte[] raw) {
        byte[] tmp = new byte[raw.length * 2 + 2];
        int p = 0; tmp[p++] = START;
        for (byte b : raw) {
            if (b == START) { tmp[p++] = 0x5A; tmp[p++] = 0x01; }
            else if (b == END) { tmp[p++] = 0x5A; tmp[p++] = 0x02; }
            else if (b == 0x5A) { tmp[p++] = 0x5E; tmp[p++] = 0x01; }
            else if (b == 0x5E) { tmp[p++] = 0x5E; tmp[p++] = 0x02; }
            else { tmp[p++] = b; }
        }
        tmp[p++] = END;
        byte[] r = new byte[p]; System.arraycopy(tmp, 0, r, 0, p); return r;
    }

    static byte[] encrypt(long M1, long IA1, long IC1, long key, byte[] bytes) {
        if (key == 0) key = 1;
        if (M1 == 0) return bytes;
        int idx = 0; int size = bytes.length; long UINT32_MAX = 0xFFFFFFFFL;
        byte[] out = new byte[size]; System.arraycopy(bytes, 0, out, 0, size);
        while (idx < size) {
            key = IA1 * (key % M1) + IC1; key &= UINT32_MAX;
            byte b = (byte) ((key >> 24) & 0xFF);
            out[idx] ^= b; idx++;
        }
        return out;
    }
}
