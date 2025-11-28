package org.ssssssss.jtt808client.entity;

import lombok.Data;

import java.util.Date;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class Position {
    private Double longitude;
    private Double latitude;
    private Double altitude;
    private Date reportTime;

    public Position(Double lng, Double lat) {
        this.longitude = lng;
        this.latitude = lat;
    }


    public Position setLongitude(Double longitude) {
        this.longitude = longitude;
        return this;
    }


    public Position setLatitude(Double latitude) {
        this.latitude = latitude;
        return this;
    }


    public Position setAltitude(Double altitude) {
        this.altitude = altitude;
        return this;
    }


    public Position setReportTime(Date reportTime) {
        this.reportTime = reportTime;
        return this;
    }


}


