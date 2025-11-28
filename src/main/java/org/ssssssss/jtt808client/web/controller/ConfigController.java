package org.ssssssss.jtt808client.web.controller;

import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import org.ssssssss.jtt808client.web.vo.Result;

/**
 * 系统配置控制器
 * 处理系统配置的增删改查操作
 */
@Slf4j
@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    /**
     * 获取位置上报频率配置
     * @return 上报频率（秒）
     */
    @GetMapping("/location-report-interval")
    public Result getLocationReportInterval() {
        try {
            String intervalStr = System.getProperty("location.report.interval", "10");
            int interval = Integer.parseInt(intervalStr);
            log.info("获取位置上报频率配置: {}秒", interval);
            return Result.success(interval);
        } catch (Exception e) {
            log.error("获取位置上报频率配置失败", e);
            return Result.error(500, "获取配置失败: " + e.getMessage());
        }
    }
    
    /**
     * 设置位置上报频率配置
     * @param interval 上报频率（秒）
     * @return 操作结果
     */
    @PostMapping("/location-report-interval")
    public Result setLocationReportInterval(@RequestParam int interval) {
        try {
            // 验证上报频率是否有效
            int[] supportedIntervals = {5, 10, 20, 30, 60, 120, 300};
            boolean isValid = false;
            for (int supported : supportedIntervals) {
                if (supported == interval) {
                    isValid = true;
                    break;
                }
            }
            
            if (!isValid) {
                return Result.error(400, "不支持的上报频率，请选择：5, 10, 20, 30, 60, 120, 300秒");
            }
            
            // 设置系统属性
            System.setProperty("location.report.interval", String.valueOf(interval));
            log.info("设置位置上报频率配置为: {}秒", interval);
            return Result.success("设置成功");
        } catch (Exception e) {
            log.error("设置位置上报频率配置失败", e);
            return Result.error(500, "设置失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取支持的上报频率选项
     * @return 频率选项数组
     */
    @GetMapping("/supported-report-intervals")
    public Result getSupportedReportIntervals() {
        try {
            int[] intervals = {5, 10, 20, 30, 60, 120, 300};
            log.info("获取支持的上报频率选项: {}", intervals);
            return Result.success(intervals);
        } catch (Exception e) {
            log.error("获取上报频率选项失败", e);
            return Result.error(500, "获取选项失败: " + e.getMessage());
        }
    }
}