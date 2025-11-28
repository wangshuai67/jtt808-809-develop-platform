package org.ssssssss.jtt808client.web.entity;

import java.util.Date;

public class PressureReport {
    private Long id;
    private String name;
    private Date startTime;
    private Date endTime;
    private Integer createdCount;
    private Integer skippedCount;
    private Integer taskCount;
    private String serverAddress;
    private Integer serverPort;
    private String routeMode;
    private String routeIds;
    private String taskIds;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }
    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }
    public Integer getCreatedCount() { return createdCount; }
    public void setCreatedCount(Integer createdCount) { this.createdCount = createdCount; }
    public Integer getSkippedCount() { return skippedCount; }
    public void setSkippedCount(Integer skippedCount) { this.skippedCount = skippedCount; }
    public Integer getTaskCount() { return taskCount; }
    public void setTaskCount(Integer taskCount) { this.taskCount = taskCount; }
    public String getServerAddress() { return serverAddress; }
    public void setServerAddress(String serverAddress) { this.serverAddress = serverAddress; }
    public Integer getServerPort() { return serverPort; }
    public void setServerPort(Integer serverPort) { this.serverPort = serverPort; }
    public String getRouteMode() { return routeMode; }
    public void setRouteMode(String routeMode) { this.routeMode = routeMode; }
    public String getRouteIds() { return routeIds; }
    public void setRouteIds(String routeIds) { this.routeIds = routeIds; }
    public String getTaskIds() { return taskIds; }
    public void setTaskIds(String taskIds) { this.taskIds = taskIds; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
