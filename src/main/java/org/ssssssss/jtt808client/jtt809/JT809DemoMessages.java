package org.ssssssss.jtt808client.jtt809;

public class JT809DemoMessages {
    public static byte[] login() {
        return "LOGIN".getBytes();
    }

    public static byte[] heartbeat() {
        return "HEARTBEAT".getBytes();
    }

    public static byte[] realLocation(String plate, double lon, double lat) {
        String s = "REAL_LOCATION:" + plate + ":" + lon + ":" + lat;
        return s.getBytes();
    }
}