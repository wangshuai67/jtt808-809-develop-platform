package org.ssssssss.jtt808client.jtt809;

import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.ssssssss.jtt809.inferior.client.TCPClient809;
import org.ssssssss.jtt809.common.packet.JT809LoginPacket;
import org.ssssssss.jtt809.common.packet.JT809Packet0x1202;
import org.ssssssss.jtt809.common.packet.JT809BasePacket;
import org.ssssssss.jtt809.common.util.CommonUtils;
import org.ssssssss.jtt809.common.util.PacketDecoderUtils;
import org.ssssssss.jtt808client.util.BeanUtils;
import io.netty.channel.Channel;
import java.time.LocalDate;
import java.time.LocalTime;

@Service
@Slf4j
public class JT809ClientManager {
    @Value("${netty.server.ip:127.0.0.1}")
    private String primaryAddr;

    @Value("${netty.server.port:8000}")
    private int primaryPort;

    @Value("${netty.server.ip:127.0.0.1}")
    private String subAddr;

    @Value("${netty.server.port:8000}")
    private int subPort;

    @Value("${netty.server.userid:1001}")
    private String userId;

    @Value("${netty.server.pwd:hihihihi}")
    private String password;

    @Value("${netty.server.centerId:1001}")
    private long centerId;

    @Value("${protocal.809.version:2011}")
    private String version;

    @Value("${message.encrypt.enable:0}")
    private int encryptEnable;

    @Value("${superior.server.m1:0}")
    private long m1;

    @Value("${superior.server.ia1:0}")
    private long ia1;

    @Value("${superior.server.ic1:0}")
    private long ic1;

    private Object primaryClient;
    private Object subClient;
    private String cfgVersion;
    private long cfgCenterId;
    private int cfgEncryptEnable;
    private String cfgUserId;
    private String cfgPassword;
    private long cfgM1;
    private long cfgIa1;
    private long cfgIc1;

    public synchronized void connect() throws Exception {
        log.info("809连接启动 ip={} port={} centerId={} version={} encrypt={} userId={}", primaryAddr, primaryPort, centerId, version, encryptEnable, userId);
        TCPClient809 client = TCPClient809.getInstance();
        client.setServer(primaryAddr, primaryPort);
        client.doConnect();
        Channel ch = client.getChannel();
        if (ch != null && ch.isActive()) {
            JT809LoginPacket login = new JT809LoginPacket();
            login.setMsgGNSSCenterId((int)(cfgCenterId>0?cfgCenterId:centerId));
            login.setEncryptFlag((byte)(cfgEncryptEnable));
            client.setLoggedIn(false);
            int uid;
            try { uid = Integer.parseInt((cfgUserId!=null?cfgUserId:userId)); }
            catch (Throwable t) { uid = 1001; }
            login.setUserId(uid);
            String pwd = (cfgPassword!=null?cfgPassword:password);
            login.setPassword(pwd!=null?pwd:"");
            String dlIp = (subAddr!=null?subAddr:primaryAddr);
            int dlPort = (subPort>0?subPort:primaryPort);
            login.setDownLinkIp(dlIp);
            login.setDownLinkPort((short)dlPort);
            ch.writeAndFlush(login);
            try {
                byte[] allBody = login.getAllBody();
                byte[] dataBytes = CommonUtils.doEscape4Receive(allBody, 0, allBody.length);
                byte[] bytes1 = CommonUtils.append(new byte[]{JT809BasePacket.HEAD_FLAG}, dataBytes);
                byte[] bytes = CommonUtils.append(bytes1, new byte[]{JT809BasePacket.END_FLAG});
                String hexStr = PacketDecoderUtils.bytes2HexStr(bytes);
                org.ssssssss.jtt808client.jtt809.JT809TaskService ts = BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class);
                ts.appendLogAll("MESSAGE_OUT", hexStr);
            } catch (Throwable ignore) {}
        }
    }

    public synchronized void connect(String pAddr, int pPort, String sAddr, int sPort) throws Exception {
        log.info("809连接启动 ip={} port={} subIp={} subPort={} centerId={} version={} encrypt={} userId={}", pAddr, pPort, sAddr, sPort, centerId, version, encryptEnable, userId);
        TCPClient809 client = TCPClient809.getInstance();
        client.disconnect();
        client.setServer(pAddr, pPort);
        client.doConnect();
        Channel ch = client.getChannel();
        if (ch != null && ch.isActive()) {
            JT809LoginPacket login = new JT809LoginPacket();
            login.setMsgGNSSCenterId((int)(cfgCenterId>0?cfgCenterId:centerId));
            login.setEncryptFlag((byte)(cfgEncryptEnable));
            client.setLoggedIn(false);
            int uid;
            try { uid = Integer.parseInt((cfgUserId!=null?cfgUserId:userId)); }
            catch (Throwable t) { uid = 1001; }
            login.setUserId(uid);
            String pwd = (cfgPassword!=null?cfgPassword:password);
            login.setPassword(pwd!=null?pwd:"");
            String dlIp = (sAddr!=null?sAddr:pAddr);
            int dlPort = (sPort>0?sPort:pPort);
            login.setDownLinkIp(dlIp);
            login.setDownLinkPort((short)dlPort);
            ch.writeAndFlush(login);
            try {
                byte[] allBody = login.getAllBody();
                byte[] dataBytes = CommonUtils.doEscape4Receive(allBody, 0, allBody.length);
                byte[] bytes1 = CommonUtils.append(new byte[]{JT809BasePacket.HEAD_FLAG}, dataBytes);
                byte[] bytes = CommonUtils.append(bytes1, new byte[]{JT809BasePacket.END_FLAG});
                String hexStr = PacketDecoderUtils.bytes2HexStr(bytes);
                org.ssssssss.jtt808client.jtt809.JT809TaskService ts = BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class);
                ts.appendLogAll("MESSAGE_OUT", hexStr);
            } catch (Throwable ignore) {}
        }
    }

    public void sendLoginOnce() {
        try {
            TCPClient809 client = TCPClient809.getInstance();
            Channel ch = client.getChannel();
            if (ch == null || !ch.isActive()) return;
            if (client.isLoggedIn()) return;
            JT809LoginPacket login = new JT809LoginPacket();
            login.setMsgGNSSCenterId((int)(cfgCenterId>0?cfgCenterId:centerId));
            login.setEncryptFlag((byte)(cfgEncryptEnable));
            client.setLoggedIn(false);
            int uid;
            try { uid = Integer.parseInt((cfgUserId!=null?cfgUserId:userId)); }
            catch (Throwable t) { uid = 1001; }
            login.setUserId(uid);
            String pwd = (cfgPassword!=null?cfgPassword:password);
            login.setPassword(pwd!=null?pwd:"");
            String dlIp = (subAddr!=null?subAddr:primaryAddr);
            int dlPort = (subPort>0?subPort:primaryPort);
            login.setDownLinkIp(dlIp);
            login.setDownLinkPort((short)dlPort);
            ch.writeAndFlush(login);
            try {
                byte[] allBody = login.getAllBody();
                byte[] dataBytes = CommonUtils.doEscape4Receive(allBody, 0, allBody.length);
                byte[] bytes1 = CommonUtils.append(new byte[]{JT809BasePacket.HEAD_FLAG}, dataBytes);
                byte[] bytes = CommonUtils.append(bytes1, new byte[]{JT809BasePacket.END_FLAG});
                String hexStr = PacketDecoderUtils.bytes2HexStr(bytes);
                org.ssssssss.jtt808client.jtt809.JT809TaskService ts = BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class);
                ts.appendLogAll("MESSAGE_OUT", hexStr);
            } catch (Throwable ignore) {}
        } catch (Exception e) {
            log.warn("主动发送809登录失败", e);
        }
    }

    public synchronized void disconnect() {
        log.info("809断开连接");
        try {
            TCPClient809.getInstance().disconnect();
        } catch (Exception e) {
            log.error("809断开连接异常", e);
        }
    }

    public boolean isConnected() {
        try {
            return TCPClient809.getInstance().isConnected();
        } catch (Exception ignore) {}
        return false;
    }

    public void sendDemoLocation(String plate, double lon, double lat) {
        try {
            TCPClient809 client = TCPClient809.getInstance();
            if (client.isConnected() && client.isLoggedIn()) {
                JT809Packet0x1202 pkt = new JT809Packet0x1202();
                pkt.setMsgGNSSCenterId((int)(cfgCenterId>0?cfgCenterId:centerId));
                pkt.setEncryptFlag((byte)0);
                pkt.setVehicleNo(plate);
                pkt.setVehicleColor((byte)1);
                pkt.setDate(LocalDate.now());
                pkt.setTime(LocalTime.now());
                pkt.setLon((int)(lon * 1000000));
                pkt.setLat((int)(lat * 1000000));
                pkt.setVec1((short)0);
                pkt.setVec2((short)0);
                pkt.setVec3(0);
                pkt.setDirection((short)0);
                pkt.setAltitude((short)0);
                client.getChannel().writeAndFlush(pkt);
                try {
                    byte[] allBody = pkt.getAllBody();
                    byte[] dataBytes = CommonUtils.doEscape4Receive(allBody, 0, allBody.length);
                    byte[] bytes1 = CommonUtils.append(new byte[]{JT809BasePacket.HEAD_FLAG}, dataBytes);
                    byte[] bytes = CommonUtils.append(bytes1, new byte[]{JT809BasePacket.END_FLAG});
                    String hexStr = PacketDecoderUtils.bytes2HexStr(bytes);
                    org.ssssssss.jtt808client.jtt809.JT809TaskService ts = BeanUtils.create(org.ssssssss.jtt808client.jtt809.JT809TaskService.class);
                    ts.appendLogByPlate(plate, "MESSAGE_OUT", hexStr);
                } catch (Throwable ignore) {}
            } else {
                log.warn("809主链路未登录，忽略位置上报 plate={}", plate);
            }
        } catch (Exception e) {
            log.error("809主链路发送位置失败", e);
        }
    }

    public void configureFromGateway(org.ssssssss.jtt808client.web.entity.JT809Gateway gw) {
        if (gw == null) return;
        this.cfgVersion = gw.getVersion();
        this.cfgCenterId = gw.getCenterId()!=null?gw.getCenterId():0L;
        this.cfgEncryptEnable = gw.getEncryptEnable()!=null?gw.getEncryptEnable():0;
        this.cfgUserId = gw.getUserId();
        this.cfgPassword = gw.getPassword();
        this.cfgM1 = gw.getM1()!=null?gw.getM1():0L;
        this.cfgIa1 = gw.getIa1()!=null?gw.getIa1():0L;
        this.cfgIc1 = gw.getIc1()!=null?gw.getIc1():0L;
        this.primaryAddr = gw.getIp()!=null?gw.getIp():this.primaryAddr;
        this.primaryPort = gw.getPort()!=null?gw.getPort():this.primaryPort;
        this.subAddr = gw.getIp()!=null?gw.getIp():this.subAddr;
        this.subPort = gw.getPort()!=null?gw.getPort():this.subPort;
        try {
            org.ssssssss.jtt809.common.config.EncryptConfig.getInstance().update(this.cfgEncryptEnable, this.cfgM1, this.cfgIa1, this.cfgIc1);
        } catch (Throwable ignore) {}
        log.info("809网关配置 version={} centerId={} encrypt={} userId={} m1={} ia1={} ic1={}", cfgVersion, cfgCenterId, cfgEncryptEnable, cfgUserId, cfgM1, cfgIa1, cfgIc1);
    }
}
