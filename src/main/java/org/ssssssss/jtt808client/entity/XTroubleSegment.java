package org.ssssssss.jtt808client.entity;

import lombok.Data;

/**
 *
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Data
public class XTroubleSegment {

    /**
     * 问题路段开始索"
     */
    private Integer startIndex;

    /**
     * 问题路段结束索引
     */
    private Integer endIndex;

    /**
     * 安全事件
     */
    private String event;


    /**
     * 概率
     * 根据概率决定此路段要不要发生问题
     */
    private Integer ratio;


    public XTroubleSegment(Integer startIndex, Integer endIndex, String event, Integer ratio) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.event = event;
        this.ratio = ratio;
    }

}


