package org.ssssssss.jtt808client.web.service;

import org.ssssssss.jtt808client.web.entity.ScheduleTask;
import org.ssssssss.jtt808client.web.entity.ScheduleTaskExample;
import org.ssssssss.jtt808client.web.mapper.ScheduleTaskMapper;
import org.ssssssss.jtt808client.web.vo.PageVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 调度任务服务
 * 提供调度任务的增删改查等业务操作
 *
 * @author 冰点 2374212111@qq.com
 * @date 2025-11-26
 */
@Service
public class ScheduleTaskService {
    @Autowired
    ScheduleTaskMapper mapper;

    /**
     * 创建调度任务
     * 
     * @param task 要创建的调度任务对象
     * @return 影响的记录数
     */
    public int create(ScheduleTask task) {
        return mapper.upsertByTaskId(task);
    }

    public ScheduleTask getByTaskId(Long taskId) {
        return mapper.selectByTaskId(taskId);
    }

    /**
     * 更新调度任务
     * 
     * @param task 要更新的调度任务对象
     * @return 影响的记录数
     */
    public int update(ScheduleTask task) {
        return mapper.updateByPrimaryKey(task);
    }

    /**
     * 删除调度任务
     * 
     * @param task 要删除的调度任务对象
     * @return 影响的记录数
     */
    public int remove(ScheduleTask task) {
        return removeById(task.getId());
    }

    /**
     * 根据ID删除调度任务
     * 
     * @param taskId 调度任务ID
     * @return 影响的记录数
     */
    public int removeById(Long taskId) {
        return mapper.deleteByPrimaryKey(taskId);
    }

    /**
     * 查询所有调度任"
     * 
     * @return 调度任务列表
     */
    public List<ScheduleTask> find() {
        return mapper.selectByExample(new ScheduleTaskExample());
    }

    /**
     * 分页查询调度任务
     * 
     * @param routeId 路线ID，可为null
     * @param vehicleId 车辆ID，可为null
     * @param driverId 司机ID，可为null
     * @param pageIndex 页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    public PageVO<ScheduleTask> find(Long routeId, Long vehicleId, Long driverId, int pageIndex, int pageSize) {
        PageVO<ScheduleTask> page = new PageVO<>(pageIndex, pageSize);
        ScheduleTaskExample.Criteria criteria = new ScheduleTaskExample().createCriteria();
        if (routeId != null) {
            criteria.andRouteIdEqualTo(routeId);
        }
        if (vehicleId != null) {
            criteria.andVehicleIdEqualTo(vehicleId);
        }
        if (driverId != null) {
            criteria.andDriverIdEqualTo(driverId);
        }
        criteria.example().setPageInfo(pageIndex, pageSize);

        page.setList(mapper.findTask(criteria.example()));
        page.setRecordCount(mapper.countByExample(criteria.example()));
        return page;
    }

    /**
     * 根据ID查询调度任务
     * 
     * @param id 调度任务ID
     * @return 调度任务对象，如果不存在则返回null
     */
    public ScheduleTask getById(Long id) {
        return this.mapper.selectByPrimaryKey(id);
    }
}


