package org.ssssssss.jtt808client.web.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.util.Date;

/**
 * 报警日志
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@TableName("alert_log")
public class AlertLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private Long taskId;

    @TableField("alarm_index")
    private Integer alarmIndex;

    @TableField("alarm_name")
    private String alarmName;

    @TableField("raw_message")
    private String rawMessage;

    @TableField("plate_number")
    private String plateNumber;

    @TableField("report_time")
    private Date reportTime;

    @TableField("create_time")
    private Date createTime;

    @TableField("longitude")
    private Double longitude;

    @TableField("latitude")
    private Double latitude;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }

    public Integer getAlarmIndex() { return alarmIndex; }
    public void setAlarmIndex(Integer alarmIndex) { this.alarmIndex = alarmIndex; }

    public String getAlarmName() { return alarmName; }
    public void setAlarmName(String alarmName) { this.alarmName = alarmName; }

    public String getRawMessage() { return rawMessage; }
    public void setRawMessage(String rawMessage) { this.rawMessage = rawMessage; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public Date getReportTime() { return reportTime; }
    public void setReportTime(Date reportTime) { this.reportTime = reportTime; }

    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
}