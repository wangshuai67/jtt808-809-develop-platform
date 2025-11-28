package org.ssssssss.jtt808client.entity;

import lombok.Data;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class XStayPoint {

    /**
     * 经度
     */
    private Double longitude;

    /**
     * 纬度
     */
    private Double latitude;

    /**
     * 最低时"
     */
    private Integer minTime;

    /**
     * 最高时"
     */
    private Integer maxTime;


    /**
     * 概率
     * 根据概率决定此路段要不要发生停留
     */
    private Integer ratio;


    public XStayPoint(Double longitude, Double latitude, Integer minTime, Integer maxTime, Integer ratio) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.minTime = minTime;
        this.maxTime = maxTime;
        this.ratio = ratio;
    }


}


