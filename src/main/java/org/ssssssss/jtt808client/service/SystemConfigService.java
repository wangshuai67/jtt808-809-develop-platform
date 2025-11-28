package org.ssssssss.jtt808client.service;

import lombok.extern.slf4j.Slf4j;

/**
 * 系统配置服务
 * 管理系统级别的配置参数
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Slf4j
public class SystemConfigService {
    
    /**
     * 获取位置上报频率（秒）
     * @return 上报频率（秒）
     */
    public int getLocationReportInterval() {
        try {
            String interval = System.getProperty("location.report.interval", "10");
            return Integer.parseInt(interval);
        } catch (Exception e) {
            log.warn("获取位置上报频率配置失败，使用默认值10秒", e);
            return 10;
        }
    }
    
    /**
     * 设置位置上报频率（秒）
     * @param interval 上报频率（秒）
     */
    public void setLocationReportInterval(int interval) {
        try {
            // 验证输入值
            if (interval < 5 || interval > 300) {
                throw new IllegalArgumentException("上报频率必须在5-300秒之间");
            }
            
            // 这里可以扩展为保存到数据库或配置文件
            log.info("设置位置上报频率为: {}秒", interval);
            
            // 临时方案：通过系统属性设置
            System.setProperty("location.report.interval", String.valueOf(interval));
            
        } catch (Exception e) {
            log.error("设置位置上报频率失败", e);
            throw new RuntimeException("设置上报频率失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取支持的上报频率选项
     * @return 频率选项数组
     */
    public int[] getSupportedReportIntervals() {
        return new int[]{5, 10, 20, 30, 60, 120, 300};
    }
    
    /**
     * 验证上报频率是否有效
     * @param interval 上报频率（秒）
     * @return 是否有效
     */
    public boolean isValidReportInterval(int interval) {
        int[] supported = getSupportedReportIntervals();
        for (int value : supported) {
            if (value == interval) {
                return true;
            }
        }
        return false;
    }
}