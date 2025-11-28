package org.ssssssss.jtt808client.service;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.ssssssss.jtt808client.entity.Point;

import java.util.concurrent.TimeUnit;

/**
 * 位置缓存服务
 * 用于缓存车辆的最新位置信息到Redis
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Slf4j
@Service
public class PositionCacheService {

    private static final String POSITION_KEY_PREFIX = "jtt808:position:";
    private static final String POSITION_BY_SIM_KEY_PREFIX = "jtt808:position:sim:";
    private static final long POSITION_EXPIRE_HOURS = 24; // 位置信息缓存24小时

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;


    /**
     * 保存最新位置信息
     *
     * @param taskId 任务ID
     * @param sim    SIM卡号
     * @param point  位置点
     */
    public void saveLatestPosition(Long taskId, String sim, Point point) {
        try {
            if (taskId == null || point == null) {
                log.warn("保存位置信息失败：参数为空，taskId={}, sim={}, point={}", taskId, sim, point);
                return;
            }

            String positionJson = JSON.toJSONString(point);
            String taskKey = POSITION_KEY_PREFIX + taskId;
            String simKey = POSITION_BY_SIM_KEY_PREFIX + sim;

            // 保存到Redis，使用taskId作为主键
            redisTemplate.opsForValue().set(taskKey, positionJson, POSITION_EXPIRE_HOURS, TimeUnit.HOURS);

            // 同时保存SIM卡索引，便于通过SIM卡查询
            redisTemplate.opsForValue().set(simKey, positionJson, POSITION_EXPIRE_HOURS, TimeUnit.HOURS);

            log.debug("位置信息已缓存：taskId={}, sim={}, longitude={}, latitude={}",
                    taskId, sim, point.getLongitude(), point.getLatitude());
        } catch (Exception e) {
            log.error("保存位置信息到Redis失败：taskId={}, sim={}", taskId, sim, e);
        }
    }

    /**
     * 通过任务ID获取最新位置
     *
     * @param taskId 任务ID
     * @return 位置点，如果不存在返回null
     */
    public Point getLatestPositionByTaskId(Long taskId) {
        try {
            if (taskId == null) {
                return null;
            }

            String key = POSITION_KEY_PREFIX + taskId;
            String positionJson = (String) redisTemplate.opsForValue().get(key);

            if (positionJson != null) {
                Point point = JSON.parseObject(positionJson, Point.class);
                log.debug("从Redis获取位置信息：taskId={}, longitude={}, latitude={}",
                        taskId, point.getLongitude(), point.getLatitude());
                return point;
            }
        } catch (Exception e) {
            log.error("从Redis获取位置信息失败：taskId={}", taskId, e);
        }
        return null;
    }

    /**
     * 通过SIM卡号获取最新位置
     *
     * @param sim SIM卡号
     * @return 位置点，如果不存在返回null
     */
    public Point getLatestPositionBySim(String sim) {
        try {
            if (sim == null || sim.trim().isEmpty()) {
                return null;
            }

            String key = POSITION_BY_SIM_KEY_PREFIX + sim;
            String positionJson = (String) redisTemplate.opsForValue().get(key);

            if (positionJson != null) {
                Point point = JSON.parseObject(positionJson, Point.class);
                log.debug("从Redis获取位置信息：sim={}, longitude={}, latitude={}",
                        sim, point.getLongitude(), point.getLatitude());
                return point;
            }
        } catch (Exception e) {
            log.error("从Redis获取位置信息失败：sim={}", sim, e);
        }
        return null;
    }

    /**
     * 删除位置信息
     *
     * @param taskId 任务ID
     * @param sim    SIM卡号
     */
    public void deletePosition(Long taskId, String sim) {
        try {
            if (taskId != null) {
                String taskKey = POSITION_KEY_PREFIX + taskId;
                redisTemplate.delete(taskKey);
            }

            if (sim != null && !sim.trim().isEmpty()) {
                String simKey = POSITION_BY_SIM_KEY_PREFIX + sim;
                redisTemplate.delete(simKey);
            }

            log.debug("位置信息已删除：taskId={}, sim={}", taskId, sim);
        } catch (Exception e) {
            log.error("删除位置信息失败：taskId={}, sim={}", taskId, sim, e);
        }
    }
}