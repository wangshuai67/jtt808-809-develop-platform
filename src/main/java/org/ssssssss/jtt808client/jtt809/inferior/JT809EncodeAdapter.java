package org.ssssssss.jtt808client.jtt809.inferior;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class JT809EncodeAdapter {
    private static int seq = 1;

    private static byte[] header(int length, int msgId, long centerId, String version, int encryptFlag, int encryptKey) {
        byte[] h = new byte[22];
        PacketEncoderUtils.writeIntBE(h, 0, length);
        PacketEncoderUtils.writeIntBE(h, 4, seq++);
        PacketEncoderUtils.writeShortBE(h, 8, (short) msgId);
        PacketEncoderUtils.writeIntBE(h, 10, (int) centerId);
        byte[] vf = Jtt809Util.versionFlag(version);
        h[14] = vf[0]; h[15] = vf[1]; h[16] = vf[2];
        h[17] = (byte) encryptFlag;
        PacketEncoderUtils.writeIntBE(h, 18, encryptKey);
        return h;
    }

    public static byte[] mainLinkLogin(long centerId, String version, int encryptEnable,
                                       long m1, long ia1, long ic1,
                                       String userId, String password, String downIp, int downPort) {
        byte[] uid = new byte[4];
        PacketEncoderUtils.writeIntBE(uid, 0, (int) parseInt(userId));
        byte[] pwd = new byte[8];
        byte[] pb = password == null ? new byte[0] : password.getBytes(Jtt809Util.ASCII);
        System.arraycopy(pb, 0, pwd, 0, Math.min(pb.length, 8));
        byte[] ipb = new byte[32];
        if (downIp == null) downIp = "";
        byte[] ipt = downIp.getBytes(Jtt809Util.ASCII);
        System.arraycopy(ipt, 0, ipb, 0, Math.min(ipt.length, 32));
        byte[] prt = new byte[2];
        PacketEncoderUtils.writeShortBE(prt, 0, (short) (downPort & 0xffff));

        byte[] bodyPlain = PacketEncoderUtils.concat(uid, pwd, ipb, prt);
        int encFlag = 0, encKey = 0;
        byte[] h = header(22 + bodyPlain.length + 2, 0x1001, centerId, version, encFlag, encKey);
        byte[] raw = PacketEncoderUtils.concat(h, bodyPlain);
        int crc = PacketEncoderUtils.crc16X25(raw, 4, raw.length - 4);
        byte[] c = new byte[2];
        PacketEncoderUtils.writeShortBE(c, 0, (short) crc);
        byte[] out = PacketEncoderUtils.escape(PacketEncoderUtils.concat(raw, c));
        if (log.isInfoEnabled()) log.info("809 main login cid={} ver={} enc={} uid={} downIp={} downPort={} len={} hex={}", centerId, version, encryptEnable, userId, downIp, downPort, out.length, Jtt809Util.hex(out, 196));
        return out;
    }

    public static byte[] heartbeat(long centerId, String version, int encryptEnable) {
        byte[] body = new byte[0];
        byte[] h = header(22 + body.length + 2, 0x1005, centerId, version, encryptEnable, 0);
        byte[] raw = PacketEncoderUtils.concat(h, body);
        int crc = PacketEncoderUtils.crc16X25(raw, 4, raw.length - 4);
        byte[] c = new byte[2];
        PacketEncoderUtils.writeShortBE(c, 0, (short) crc);
        return PacketEncoderUtils.escape(PacketEncoderUtils.concat(raw, c));
    }

    public static byte[] upRealLocationMain(long centerId, String version, int encryptEnable,
                                            long m1, long ia1, long ic1,
                                            String plate, double lon, double lat) {
        byte[] pn = new byte[21];
        byte[] pb = plate.getBytes(Jtt809Util.GBK);
        System.arraycopy(pb, 0, pn, 0, Math.min(pb.length, 21));
        byte[] color = new byte[]{0x01};
        byte[] time = new byte[8];
        long ts = System.currentTimeMillis();
        PacketEncoderUtils.writeIntBE(time, 0, (int) (ts / 1000));
        PacketEncoderUtils.writeIntBE(time, 4, (int) (ts % 1000));
        int ilon = (int) Math.round(lon * 1000000);
        int ilat = (int) Math.round(lat * 1000000);
        byte[] gnss = new byte[28];
        PacketEncoderUtils.writeIntBE(gnss, 0, ilon);
        PacketEncoderUtils.writeIntBE(gnss, 4, ilat);
        PacketEncoderUtils.writeShortBE(gnss, 8, (short) 0);
        PacketEncoderUtils.writeShortBE(gnss, 10, (short) 0);
        PacketEncoderUtils.writeShortBE(gnss, 12, (short) 0);
        PacketEncoderUtils.writeIntBE(gnss, 14, 0);
        PacketEncoderUtils.writeIntBE(gnss, 18, 0);
        PacketEncoderUtils.writeShortBE(gnss, 22, (short) 0);
        PacketEncoderUtils.writeShortBE(gnss, 24, (short) 0);
        PacketEncoderUtils.writeShortBE(gnss, 26, (short) 0);
        byte[] data = PacketEncoderUtils.concat(pn, color, time, gnss);
        byte[] dt = new byte[6];
        PacketEncoderUtils.writeShortBE(dt, 0, (short) 0x1202);
        PacketEncoderUtils.writeIntBE(dt, 2, data.length);
        byte[] bodyPlain = PacketEncoderUtils.concat(dt, data);
        int key = 0; byte[] body = bodyPlain;
        if (encryptEnable != 0) {
            key = (int) (System.currentTimeMillis() & 0x7FFFFFFF);
            if (key == 0) key = 1;
            body = PacketEncoderUtils.encrypt(m1, ia1, ic1, key, bodyPlain);
        }
        byte[] h = header(22 + body.length + 2, 0x1200, centerId, version, encryptEnable, key);
        byte[] raw = PacketEncoderUtils.concat(h, body);
        int crc = PacketEncoderUtils.crc16X25(raw, 4, raw.length - 4);
        byte[] c = new byte[2];
        PacketEncoderUtils.writeShortBE(c, 0, (short) crc);
        return PacketEncoderUtils.escape(PacketEncoderUtils.concat(raw, c));
    }

    public static byte[] subRealLocation(long centerId, String version, int encryptEnable,
                                         String plate, double lon, double lat) {
        byte[] pn = new byte[21];
        byte[] pb = plate.getBytes(Jtt809Util.GBK);
        System.arraycopy(pb, 0, pn, 0, Math.min(pb.length, 21));
        byte[] color = new byte[]{0x01};
        int ilon = (int) Math.round(lon * 1000000);
        int ilat = (int) Math.round(lat * 1000000);
        byte[] pos = new byte[28];
        PacketEncoderUtils.writeIntBE(pos, 0, ilon);
        PacketEncoderUtils.writeIntBE(pos, 4, ilat);
        PacketEncoderUtils.writeShortBE(pos, 8, (short) 0);
        PacketEncoderUtils.writeShortBE(pos, 10, (short) 0);
        PacketEncoderUtils.writeShortBE(pos, 12, (short) 0);
        PacketEncoderUtils.writeIntBE(pos, 14, 0);
        PacketEncoderUtils.writeIntBE(pos, 18, 0);
        PacketEncoderUtils.writeShortBE(pos, 22, (short) 0);
        PacketEncoderUtils.writeShortBE(pos, 24, (short) 0);
        PacketEncoderUtils.writeShortBE(pos, 26, (short) 0);
        byte[] body = PacketEncoderUtils.concat(pn, color, pos);
        byte[] h = header(22 + body.length + 2, 0x9101, centerId, version, encryptEnable, 0);
        byte[] raw = PacketEncoderUtils.concat(h, body);
        int crc = PacketEncoderUtils.crc16X25(raw, 4, raw.length - 4);
        byte[] c = new byte[2];
        PacketEncoderUtils.writeShortBE(c, 0, (short) crc);
        return PacketEncoderUtils.escape(PacketEncoderUtils.concat(raw, c));
    }

    private static long parseInt(String s) {
        try { return Long.parseLong(s); } catch (Exception e) { return 0; }
    }
}

