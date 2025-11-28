package org.ssssssss.jtt808client.web.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

@TableName("jt809_gateway")
public class JT809Gateway {
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("name")
    private String name;
    @TableField("primary_addr")
    private String primaryAddr;
    @TableField("primary_port")
    private Integer primaryPort;
    @TableField("sub_addr")
    private String subAddr;
    @TableField("sub_port")
    private Integer subPort;
    @TableField("center_id")
    private Long centerId;
    @TableField("version")
    private String version;
    @TableField("encrypt_flag")
    private Integer encryptFlag;
    @TableField("encrypt_key")
    private String encryptKey;
    @TableField("description")
    private String description;
    @TableField("status")
    private Integer status;
    @TableField("create_time")
    private Date createTime;
    @TableField("update_time")
    private Date updateTime;

    @TableField("ip")
    private String ip;
    @TableField("port")
    private Integer port;
    @TableField("userid")
    private String userId;
    @TableField("pwd")
    private String password;
    @TableField("encrypt_enable")
    private Integer encryptEnable;
    @TableField("m1")
    private Long m1;
    @TableField("ia1")
    private Long ia1;
    @TableField("ic1")
    private Long ic1;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPrimaryAddr() { return primaryAddr; }
    public void setPrimaryAddr(String primaryAddr) { this.primaryAddr = primaryAddr; }
    public Integer getPrimaryPort() { return primaryPort; }
    public void setPrimaryPort(Integer primaryPort) { this.primaryPort = primaryPort; }
    public String getSubAddr() { return subAddr; }
    public void setSubAddr(String subAddr) { this.subAddr = subAddr; }
    public Integer getSubPort() { return subPort; }
    public void setSubPort(Integer subPort) { this.subPort = subPort; }
    public Long getCenterId() { return centerId; }
    public void setCenterId(Long centerId) { this.centerId = centerId; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public Integer getEncryptFlag() { return encryptFlag; }
    public void setEncryptFlag(Integer encryptFlag) { this.encryptFlag = encryptFlag; }
    public String getEncryptKey() { return encryptKey; }
    public void setEncryptKey(String encryptKey) { this.encryptKey = encryptKey; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public Date getUpdateTime() { return updateTime; }
    public void setUpdateTime(Date updateTime) { this.updateTime = updateTime; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Integer getEncryptEnable() { return encryptEnable; }
    public void setEncryptEnable(Integer encryptEnable) { this.encryptEnable = encryptEnable; }
    public Long getM1() { return m1; }
    public void setM1(Long m1) { this.m1 = m1; }
    public Long getIa1() { return ia1; }
    public void setIa1(Long ia1) { this.ia1 = ia1; }
    public Long getIc1() { return ic1; }
    public void setIc1(Long ic1) { this.ic1 = ic1; }
}