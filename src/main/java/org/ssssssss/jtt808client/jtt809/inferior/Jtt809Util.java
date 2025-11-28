package org.ssssssss.jtt808client.jtt809.inferior;

import java.nio.charset.Charset;

final class Jtt809Util {
    static final Charset GBK = Charset.forName("GBK");
    static final Charset ASCII = Charset.forName("US-ASCII");

    static byte[] versionFlag(String v) {
        if ("2019".equals(v)) return new byte[]{0x00, 0x00, 0x03};
        if ("2013".equals(v)) return new byte[]{0x00, 0x00, 0x02};
        return new byte[]{0x00, 0x00, 0x01};
    }

    static String hex(byte[] b, int max) {
        int n = Math.min(b.length, Math.max(0, max));
        StringBuilder sb = new StringBuilder(n * 3);
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(' ');
            sb.append(String.format("%02X", b[i]));
        }
        if (b.length > n) sb.append(" ...");
        return sb.toString();
    }
}

